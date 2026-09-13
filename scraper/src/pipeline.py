"""
7-Phase Cleaning and Ingestion Pipeline.
Orchestrates raw scraping, deterministic fare decomposition,
outlier rejection, cryptographic SHA-256 signing, and backend ingestion.
"""

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

import pandas as pd

from .config import (
    CORE_ROUTES,
    CORE_HORIZONS,
    ROUTE_BY_CODE,
    AIRLINE_NAME_TO_CODE,
    AIRLINE_REGISTRY,
    get_departure_date_for_horizon,
    get_all_45_days_horizons,
    SCRAPER_CONCURRENCY,
    IQR_MULTIPLIER,
    EXPORT_LOCAL_BACKUP,
)
from .schemas import (
    RawFlightQuote,
    FareObservationSchema,
    ScrapeBatchSummary,
)
from .processors import (
    decompose_fare,
    apply_outlier_filters,
    compute_observation_hash,
    compute_batch_hash,
)
from .engines import GoogleFlightsEngine, EaseMyTripEngine, BaseEngine
from .ingestion_client import IngestionClient

logger = logging.getLogger("apix_scraper")


class ScrapingPipeline:
    """End-to-end multi-phase ingestion and cleaning orchestrator."""

    def __init__(
        self,
        portal_name: str = "google_flights",
        concurrency: int = SCRAPER_CONCURRENCY,
        data_dir: Optional[str] = None,
    ):
        self.portal_name = portal_name.lower()
        self.concurrency = max(1, concurrency)
        self.semaphore = asyncio.Semaphore(self.concurrency)

        # Output storage directory
        if data_dir:
            self.data_dir = Path(data_dir)
        else:
            self.data_dir = Path(__file__).parent.parent / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.engine: BaseEngine = self._resolve_engine()
        self.ingestion_client = IngestionClient()

    def _resolve_engine(self) -> BaseEngine:
        if self.portal_name == "easemytrip":
            return EaseMyTripEngine()
        else:
            return GoogleFlightsEngine()

    async def run(
        self,
        routes: Optional[List[Dict[str, any]]] = None,
        horizons: Optional[List[Tuple[str, int]]] = None,
        ingest_to_backend: bool = True,
    ) -> Tuple[List[FareObservationSchema], ScrapeBatchSummary]:
        """
        Executes the full 7-phase scraping pipeline across specified routes and horizons.
        """
        if routes is None:
            routes = CORE_ROUTES
        if horizons is None:
            horizons = CORE_HORIZONS

        batch_id = f"batch_{uuid.uuid4().hex[:12]}"
        run_start = datetime.now(timezone.utc).isoformat()

        logger.info(
            f"=== Starting APIx Scraper Pipeline [{batch_id}] ==="
        )
        logger.info(
            f"Routes ({len(routes)}): {[r['route_code'] for r in routes]}"
        )
        logger.info(
            f"Horizons ({len(horizons)}): {[h[0] for h in horizons]}"
        )

        summary = ScrapeBatchSummary(
            batch_id=batch_id,
            run_started_at=run_start,
            source_portal=self.portal_name.upper(),
            routes_processed=[r["route_code"] for r in routes],
            horizons_processed=[h[0] for h in horizons],
        )

        # Phase 1: Initialize Engine
        if hasattr(self.engine, "initialize"):
            await self.engine.initialize()

        raw_quotes: List[Tuple[Dict[str, any], str, str, List[RawFlightQuote]]] = []

        try:
            # Phase 2: Parallel Scrape with Rate-Limiting Semaphore
            tasks = []
            for route in routes:
                for window_label, lead_days in horizons:
                    _, dep_date = get_departure_date_for_horizon(lead_days)
                    tasks.append(
                        self._scrape_task(route, window_label, dep_date)
                    )

            results = await asyncio.gather(*tasks, return_exceptions=True)

            for res in results:
                if isinstance(res, Exception):
                    logger.error(f"[Pipeline] Task failed with exception: {res}")
                elif res:
                    route, window_label, dep_date, quotes = res
                    raw_quotes.append((route, window_label, dep_date, quotes))
                    summary.total_scraped += len(quotes)

        finally:
            # Close engine browser
            if hasattr(self.engine, "close"):
                await self.engine.close()

        # Phase 3 & 4: Normalization & Deterministic Fare Decomposition
        intermediate_records: List[Dict[str, Any]] = []

        for route, window_label, dep_date, quotes in raw_quotes:
            route_code = route["route_code"]
            origin = route["origin"]

            for q in quotes:
                # 3. Normalization
                airline_lower = q.airline_name.lower().strip()
                airline_code = AIRLINE_NAME_TO_CODE.get(airline_lower, "6E")
                airline_name = AIRLINE_REGISTRY.get(airline_code, {}).get("name", q.airline_name)

                # 4. Deterministic Fare Decomposition (strips add-ons)
                decomposed = decompose_fare(
                    total_fare=q.total_fare,
                    origin_code=origin,
                    route_code=route_code,
                )

                now_ts = datetime.now(timezone.utc).isoformat()

                record = {
                    "route_code": route_code,
                    "airline_code": airline_code,
                    "airline_name": airline_name,
                    "flight_number": q.flight_number,
                    "departure_date": dep_date,
                    "advance_window": window_label,
                    "base_fare": decomposed.base_fare,
                    "fuel_surcharge": decomposed.fuel_surcharge,
                    "airport_tax_udf": decomposed.airport_tax_udf,
                    "tax_gst": decomposed.tax_gst,
                    "total_fare": decomposed.total_fare,
                    "is_outlier": False,
                    "provenance_status": "CLEANED",
                    "timestamp": now_ts,
                    "source_portal": q.source_portal,
                }
                intermediate_records.append(record)

        # Phase 5: Statistical Outlier Filtering (IQR & Hampel)
        intermediate_records = apply_outlier_filters(
            intermediate_records, iqr_multiplier=IQR_MULTIPLIER
        )

        # Phase 6: Cryptographic Provenance Hashing
        validated_observations: List[FareObservationSchema] = []
        obs_hashes: List[str] = []

        for rec in intermediate_records:
            sha256_hash = compute_observation_hash(
                route_code=rec["route_code"],
                airline_code=rec["airline_code"],
                flight_number=rec["flight_number"],
                departure_date=rec["departure_date"],
                advance_window=rec["advance_window"],
                base_fare=rec["base_fare"],
                total_fare=rec["total_fare"],
                timestamp=rec["timestamp"],
            )
            rec["sha256_hash"] = sha256_hash
            obs_hashes.append(sha256_hash)

            validated_obs = FareObservationSchema(**rec)
            validated_observations.append(validated_obs)

            if validated_obs.is_outlier:
                summary.outliers_filtered += 1

        summary.valid_records = len(validated_observations)
        summary.batch_sha256 = compute_batch_hash(obs_hashes)
        summary.run_finished_at = datetime.now(timezone.utc).isoformat()
        summary.status = "SUCCESS" if validated_observations else "FAILED"

        # Phase 7: Local Persistence & Ingestion
        if EXPORT_LOCAL_BACKUP and validated_observations:
            self._save_local_files(validated_observations, summary, batch_id)

        if ingest_to_backend and validated_observations:
            await self.ingestion_client.send_observations(validated_observations, summary)

        logger.info(
            f"=== Pipeline Finished: {len(validated_observations)} observations, "
            f"{summary.outliers_filtered} outliers filtered. Hash: {summary.batch_sha256[:16]}... ==="
        )

        return validated_observations, summary

    async def _scrape_task(
        self, route: Dict[str, any], window_label: str, dep_date: str
    ) -> Tuple[Dict[str, any], str, str, List[RawFlightQuote]]:
        """Bounded scraping task managed by concurrency semaphore."""
        async with self.semaphore:
            quotes = await self.engine.scrape_route_horizon(
                origin=route["origin"],
                destination=route["destination"],
                departure_date=dep_date,
                advance_window=window_label,
            )
            # Gentle polite spacing
            await asyncio.sleep(0.5)
            return (route, window_label, dep_date, quotes)

    def _save_local_files(
        self,
        observations: List[FareObservationSchema],
        summary: ScrapeBatchSummary,
        batch_id: str,
    ):
        """Exports observations and audit metadata to JSON and CSV."""
        obs_dicts = [obs.model_dump() for obs in observations]

        # Latest pointers
        latest_json = self.data_dir / "observations_latest.json"
        latest_csv = self.data_dir / "observations_latest.csv"
        batch_summary_file = self.data_dir / f"summary_{batch_id}.json"

        # Timestamped historical archive
        archive_json = self.data_dir / f"observations_{batch_id}.json"

        with open(latest_json, "w", encoding="utf-8") as f:
            json.dump(obs_dicts, f, indent=2)

        with open(archive_json, "w", encoding="utf-8") as f:
            json.dump(obs_dicts, f, indent=2)

        with open(batch_summary_file, "w", encoding="utf-8") as f:
            json.dump(summary.model_dump(), f, indent=2)

        # CSV export via pandas
        df = pd.DataFrame(obs_dicts)
        df.to_csv(latest_csv, index=False, encoding="utf-8")

        logger.info(f"[Pipeline] Saved local backups to {latest_json} and {latest_csv}")
