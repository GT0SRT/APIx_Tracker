"""
Multi-Tier Resilient Scraping Engine Coordinator.
Seamlessly routes queries across Tier 1 (curl_cffi TLS impersonation),
Tier 2 (Playwright Stealth Browser), and Tier 3 (3rd-Party Scraping API).
"""

import logging
from typing import List, Optional, Callable, Any
from .base import (
    BaseEngine,
    TierScrapingError,
    Tier1Error,
    Tier2Error,
    Tier3Error,
    AllTiersExhaustedError,
)
from .tier1_curl import Tier1CurlEngine
from .google_flights import GoogleFlightsEngine
from .tier3_api import Tier3ScrapingApiEngine
from ..config import RESILIENCE_CONFIG
from ..schemas import RawFlightQuote

logger = logging.getLogger("apix_scraper")


class MultiTierEngine(BaseEngine):
    """
    Multi-Tier Scraping Pipeline Coordinator.
    Enforces automatic failover:
      Tier 1 (curl_cffi impersonation) ->
      Tier 2 (Playwright Stealth) ->
      Tier 3 (Commercial Scraping API)
    """

    def __init__(
        self,
        portal_name: str = "MULTI_TIER",
        on_query_success: Optional[Callable[[str, str], Any]] = None,
        on_tier_failure: Optional[Callable[[str, TierScrapingError], Any]] = None,
        on_all_tiers_failed: Optional[Callable[[str, str, List[TierScrapingError]], Any]] = None,
    ):
        super().__init__(portal_name=portal_name)
        self.tier1 = Tier1CurlEngine()
        self.tier2 = GoogleFlightsEngine()
        self.tier3 = Tier3ScrapingApiEngine()
        self.on_query_success = on_query_success
        self.on_tier_failure = on_tier_failure
        self.on_all_tiers_failed = on_all_tiers_failed

    async def initialize(self):
        """Initializes underlying browser contexts."""
        logger.info("[MultiTierEngine] Initializing multi-tier engine pipeline...")
        await self.tier2.initialize()

    async def close(self):
        """Cleanly tears down sessions and browser contexts across all tiers."""
        logger.info("[MultiTierEngine] Shutting down multi-tier engine pipeline...")
        try:
            await self.tier1.close()
        except Exception as e:
            logger.warning(f"[MultiTierEngine] Error closing Tier 1: {e}")

        try:
            await self.tier2.close()
        except Exception as e:
            logger.warning(f"[MultiTierEngine] Error closing Tier 2: {e}")

        try:
            await self.tier3.close()
        except Exception as e:
            logger.warning(f"[MultiTierEngine] Error closing Tier 3: {e}")

    async def scrape_route_horizon(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        advance_window: str,
    ) -> List[RawFlightQuote]:
        """
        Executes multi-tier fallback pipeline for a specific route and horizon:
        1. Tier 1 (curl_cffi TLS impersonation)
        2. Tier 2 (Playwright Stealth)
        3. Tier 3 (3rd-Party Scraping API if enabled)
        """
        route_code = f"{origin}-{destination}"
        tier_errors: List[TierScrapingError] = []

        # --- Tier 1: curl_cffi TLS Impersonation ---
        try:
            quotes = await self.tier1.scrape_route_horizon(
                origin, destination, departure_date, advance_window
            )
            if quotes:
                if self.on_query_success:
                    self.on_query_success(route_code, "TIER_1")
                return quotes
        except TierScrapingError as e:
            tier_errors.append(e)
            if self.on_tier_failure:
                self.on_tier_failure(route_code, e)
            logger.warning(
                f"[MultiTierEngine] Tier 1 failed for {route_code} ({e}). "
                f"Seamlessly falling back to Tier 2 (Playwright Stealth)..."
            )
        except Exception as e:
            wrap_err = Tier1Error(message=str(e), error_type=type(e).__name__)
            tier_errors.append(wrap_err)
            if self.on_tier_failure:
                self.on_tier_failure(route_code, wrap_err)
            logger.warning(
                f"[MultiTierEngine] Tier 1 exception for {route_code}: {e}. Falling over to Tier 2..."
            )

        # --- Tier 2: Playwright Stealth Browser ---
        try:
            quotes = await self.tier2.scrape_route_horizon(
                origin, destination, departure_date, advance_window
            )
            if quotes:
                logger.info(
                    f"[MultiTierEngine] Tier 2 (Playwright) succeeded for {route_code} ({len(quotes)} quotes)."
                )
                if self.on_query_success:
                    self.on_query_success(route_code, "TIER_2")
                return quotes
        except TierScrapingError as e:
            tier_errors.append(e)
            if self.on_tier_failure:
                self.on_tier_failure(route_code, e)
            logger.warning(
                f"[MultiTierEngine] Tier 2 failed for {route_code} ({e})."
            )
        except Exception as e:
            wrap_err = Tier2Error(message=str(e), error_type=type(e).__name__)
            tier_errors.append(wrap_err)
            if self.on_tier_failure:
                self.on_tier_failure(route_code, wrap_err)
            logger.warning(
                f"[MultiTierEngine] Tier 2 exception for {route_code}: {e}."
            )

        # --- Tier 3: 3rd-Party Scraping API (Last Resort) ---
        if self.tier3.is_available():
            try:
                logger.info(
                    f"[MultiTierEngine] Tier 1 & 2 failed for {route_code}. "
                    f"Falling back to Tier 3 ({self.tier3.provider.upper()})..."
                )
                quotes = await self.tier3.scrape_route_horizon(
                    origin, destination, departure_date, advance_window
                )
                if quotes:
                    logger.info(
                        f"[MultiTierEngine] Tier 3 ({self.tier3.provider.upper()}) succeeded for {route_code} ({len(quotes)} quotes)."
                    )
                    if self.on_query_success:
                        self.on_query_success(route_code, "TIER_3")
                    return quotes
            except TierScrapingError as e:
                tier_errors.append(e)
                if self.on_tier_failure:
                    self.on_tier_failure(route_code, e)
                logger.warning(
                    f"[MultiTierEngine] Tier 3 failed for {route_code}: {e}"
                )
            except Exception as e:
                wrap_err = Tier3Error(message=str(e), error_type=type(e).__name__)
                tier_errors.append(wrap_err)
                if self.on_tier_failure:
                    self.on_tier_failure(route_code, wrap_err)
                logger.warning(
                    f"[MultiTierEngine] Tier 3 exception for {route_code}: {e}"
                )
        else:
            logger.debug(
                f"[MultiTierEngine] Tier 3 not enabled or missing credentials for {route_code}."
            )

        # All tiers exhausted
        if self.on_all_tiers_failed:
            self.on_all_tiers_failed(route_code, departure_date, tier_errors)

        exhausted_err = AllTiersExhaustedError(
            route=route_code,
            departure_date=departure_date,
            tier_errors=tier_errors,
        )
        logger.error(f"[MultiTierEngine] {exhausted_err}")
        raise exhausted_err
