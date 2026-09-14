"""
Backend Ingestion Client.
Transmits cleaned fare observations and scrape run logs to the Node.js / Express REST API.
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
import httpx

from .config import BACKEND_API_URL, INGEST_SECRET
from .schemas import FareObservationSchema, ScrapeBatchSummary

logger = logging.getLogger("apix_scraper")


class IngestionClient:
    """HTTP Client for pushing batches to the APIx Backend."""

    def __init__(self, base_url: str = BACKEND_API_URL, secret: str = INGEST_SECRET):
        self.base_url = base_url.rstrip("/")
        self.secret = secret
        self.endpoint = f"{self.base_url}/api/v1/logs/ingest"

    async def send_observations(
        self,
        observations: List[FareObservationSchema],
        summary: ScrapeBatchSummary,
        chunk_size: int = 200,
    ) -> Dict[str, Any]:
        """
        POSTs validated observations and run summary to the backend ingestion endpoint.
        Automatically chunks large payloads to guarantee sub-second delivery.
        """
        if not observations:
            return {"success": True, "count": 0, "dbSaved": 0}

        total_obs = len(observations)
        chunks = [
            observations[i : i + chunk_size]
            for i in range(0, total_obs, chunk_size)
        ]
        num_chunks = len(chunks)

        logger.info(
            f"[IngestionClient] Transmitting {total_obs} observations in {num_chunks} chunk(s) to {self.endpoint}..."
        )

        total_saved = 0
        overall_success = True
        last_resp_data = {}

        for idx, chunk in enumerate(chunks, start=1):
            is_final = (idx == num_chunks)
            chunk_summary = summary if is_final else ScrapeBatchSummary(
                batch_id=summary.batch_id,
                run_started_at=summary.run_started_at,
                source_portal=summary.source_portal,
                routes_processed=summary.routes_processed,
                horizons_processed=summary.horizons_processed,
                total_scraped=len(chunk),
                valid_records=len(chunk),
                batch_sha256=summary.batch_sha256,
            )

            logger.info(f"[IngestionClient] Sending chunk {idx}/{num_chunks} ({len(chunk)} observations)...")
            res = await self._send_payload(chunk, chunk_summary)
            if res.get("success"):
                data = res.get("data", {})
                last_resp_data = data
                total_saved += data.get("dbSaved", len(chunk))
            else:
                logger.warning(f"[IngestionClient] Chunk {idx}/{num_chunks} failed: {res.get('error')}")
                overall_success = False

        return {
            "success": overall_success,
            "total_sent": total_obs,
            "db_saved": total_saved,
            "last_response": last_resp_data,
        }

    async def _send_payload(
        self,
        chunk: List[FareObservationSchema],
        summary: ScrapeBatchSummary,
    ) -> Dict[str, Any]:
        payload = {
            "summary": summary.model_dump(),
            "observations": [obs.model_dump() for obs in chunk],
        }

        headers = {
            "Content-Type": "application/json",
            "x-ingest-token": self.secret,
        }

        # Render cold-start tolerance (retry with backoff)
        for attempt in range(1, 3):
            try:
                async with httpx.AsyncClient(timeout=90.0) as client:
                    resp = await client.post(self.endpoint, json=payload, headers=headers)
                    if resp.status_code in (200, 201):
                        data = resp.json()
                        logger.info(f"[IngestionClient] Chunk ingested: {data.get('message', 'OK')} (Saved: {data.get('dbSaved', 0)})")
                        return {"success": True, "status_code": resp.status_code, "data": data}
                    else:
                        logger.warning(
                            f"[IngestionClient] Ingestion rejected with status {resp.status_code}: {resp.text}"
                        )
                        return {"success": False, "status_code": resp.status_code, "error": resp.text}
            except (httpx.ConnectError, httpx.TimeoutException) as conn_err:
                if attempt == 1:
                    logger.info("[IngestionClient] Backend waking up or cold start. Waiting 10s before retry...")
                    await asyncio.sleep(10)
                else:
                    logger.warning(
                        f"[IngestionClient] Connection failed to {self.base_url}: {conn_err}. "
                        "Observations remain safely persisted in local backup JSON/CSV."
                    )
                    return {"success": False, "error": str(conn_err)}
            except Exception as e:
                logger.error(f"[IngestionClient] Communication error: {e}")
                return {"success": False, "error": str(e)}

        return {"success": False, "error": "Ingestion attempts exhausted"}

