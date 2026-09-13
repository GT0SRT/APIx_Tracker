"""
Backend Ingestion Client.
Transmits cleaned fare observations and scrape run logs to the Node.js / Express REST API.
"""

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
    ) -> Dict[str, Any]:
        """
        POSTs validated observations and run summary to the backend ingestion endpoint.
        """
        payload = {
            "summary": summary.model_dump(),
            "observations": [obs.model_dump() for obs in observations],
        }

        headers = {
            "Content-Type": "application/json",
            "x-ingest-token": self.secret,
        }

        logger.info(
            f"[IngestionClient] Transmitting {len(observations)} observations to {self.endpoint}..."
        )

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(self.endpoint, json=payload, headers=headers)
                if resp.status_code in (200, 201):
                    data = resp.json()
                    logger.info(f"[IngestionClient] Ingestion successful: {data.get('message', 'OK')}")
                    return {"success": True, "status_code": resp.status_code, "data": data}
                else:
                    logger.warning(
                        f"[IngestionClient] Ingestion rejected with status {resp.status_code}: {resp.text}"
                    )
                    return {"success": False, "status_code": resp.status_code, "error": resp.text}
        except httpx.ConnectError:
            logger.warning(
                f"[IngestionClient] Could not connect to backend at {self.base_url}. "
                "Observations remain safely persisted in local backup JSON/CSV."
            )
            return {"success": False, "error": "Backend server offline or unreachable"}
        except Exception as e:
            logger.error(f"[IngestionClient] Ingestion communication error: {e}")
            return {"success": False, "error": str(e)}
