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
from ..resilience.circuit_breaker import CircuitBreaker

logger = logging.getLogger("apix_scraper")


class MultiTierEngine(BaseEngine):
    """
    Multi-Tier Scraping Pipeline Coordinator.
    Enforces automatic failover:
      Tier 1 (curl_cffi impersonation) ->
      Tier 2 (Playwright Stealth) ->
      Tier 3 (Commercial Scraping API)
    Integrated with persistent Circuit Breaker and anti-bot defense detection.
    """

    def __init__(
        self,
        portal_name: str = "MULTI_TIER",
        circuit_breaker: Optional[CircuitBreaker] = None,
        on_query_success: Optional[Callable[[str, str], Any]] = None,
        on_tier_failure: Optional[Callable[[str, TierScrapingError], Any]] = None,
        on_all_tiers_failed: Optional[Callable[[str, str, List[TierScrapingError]], Any]] = None,
    ):
        super().__init__(portal_name=portal_name)
        self.tier1 = Tier1CurlEngine()
        self.tier2 = GoogleFlightsEngine()
        self.tier3 = Tier3ScrapingApiEngine()
        self.circuit_breaker = circuit_breaker or CircuitBreaker()
        self.on_query_success = on_query_success
        self.on_tier_failure = on_tier_failure
        self.on_all_tiers_failed = on_all_tiers_failed

    async def initialize(self):
        """Initializes underlying browser contexts and loads circuit breaker state."""
        logger.info("[MultiTierEngine] Initializing multi-tier engine pipeline...")
        self.circuit_breaker.load_state()
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

        # Persist circuit breaker cache for ephemeral runners
        self.circuit_breaker.save_state()

    async def scrape_route_horizon(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        advance_window: str,
    ) -> List[RawFlightQuote]:
        """
        Executes multi-tier fallback pipeline for a specific route and horizon:
        1. Check Circuit Breaker status (respects ephemeral runner cooldown cache)
        2. Tier 1 (curl_cffi TLS impersonation)
        3. Tier 2 (Playwright Stealth)
        4. Tier 3 (3rd-Party Scraping API if enabled)
        """
        route_code = f"{origin}-{destination}"
        source_key = self.portal_name.lower()

        # Check Circuit Breaker status
        if not self.circuit_breaker.is_call_permitted(source_key):
            logger.warning(
                f"[MultiTierEngine] Circuit breaker is OPEN for '{source_key}'. "
                f"Skipping query for {route_code} ({advance_window}) to respect cooldown window."
            )
            return []

        tier_errors: List[TierScrapingError] = []

        # --- Tier 1: curl_cffi TLS Impersonation ---
        try:
            quotes = await self.tier1.scrape_route_horizon(
                origin, destination, departure_date, advance_window
            )
            if quotes:
                self.circuit_breaker.record_success(source_key, "Tier 1 (curl_cffi)")
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
                self.circuit_breaker.record_success(source_key, "Tier 2 (Playwright)")
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
                    self.circuit_breaker.record_success(source_key, f"Tier 3 ({self.tier3.provider})")
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

        # All tiers exhausted -> Record failure with Circuit Breaker
        self.circuit_breaker.record_failure(
            source_key=source_key,
            departure_date=departure_date,
            tier_errors=tier_errors,
            failing_route=route_code,
            retry_count=RESILIENCE_CONFIG.backoff.max_retries,
        )

        if self.on_all_tiers_failed:
            self.on_all_tiers_failed(route_code, departure_date, tier_errors)

        exhausted_err = AllTiersExhaustedError(
            route=route_code,
            departure_date=departure_date,
            tier_errors=tier_errors,
        )
        logger.error(f"[MultiTierEngine] {exhausted_err}")
        raise exhausted_err
