"""
Abstract Base Engine for APIx Flight Scrapers.
Provides standardized interface, polite rate limiting,
and exponential backoff with jitter.
"""

import abc
import asyncio
import logging
import random
import re
from typing import List, Optional, Dict, Any
from urllib.parse import urlparse
from ..config import (
    BACKOFF_BASE_SECONDS,
    BACKOFF_MAX_SECONDS,
    BACKOFF_FACTOR,
    BACKOFF_MAX_RETRIES,
    JITTER_MAX_SECONDS,
)
from ..schemas import RawFlightQuote

logger = logging.getLogger("apix_scraper")


class TierScrapingError(Exception):
    """Base exception raised when a scraping tier fails."""

    def __init__(
        self,
        message: str,
        tier_name: str = "Tier",
        status_code: Optional[int] = None,
        error_type: Optional[str] = None,
        is_bot_blocked: bool = False,
    ):
        super().__init__(message)
        self.message = message
        self.tier_name = tier_name
        self.status_code = status_code
        self.error_type = error_type or type(self).__name__
        self.is_bot_blocked = is_bot_blocked

    def __str__(self):
        parts = [f"[{self.tier_name}] {self.message}"]
        if self.status_code:
            parts.append(f"HTTP {self.status_code}")
        if self.is_bot_blocked:
            parts.append("(Anti-Bot Protection Triggered)")
        return " - ".join(parts)


class Tier1Error(TierScrapingError):
    """Raised when Tier 1 (curl_cffi impersonation) fails."""

    def __init__(self, message: str, status_code: Optional[int] = None, error_type: Optional[str] = None, is_bot_blocked: bool = False):
        super().__init__(message, tier_name="Tier 1 (curl_cffi)", status_code=status_code, error_type=error_type, is_bot_blocked=is_bot_blocked)


class Tier2Error(TierScrapingError):
    """Raised when Tier 2 (Playwright / Stealth Browser) fails."""

    def __init__(self, message: str, status_code: Optional[int] = None, error_type: Optional[str] = None, is_bot_blocked: bool = False):
        super().__init__(message, tier_name="Tier 2 (Playwright)", status_code=status_code, error_type=error_type, is_bot_blocked=is_bot_blocked)


class Tier3Error(TierScrapingError):
    """Raised when Tier 3 (3rd-Party Scraping API) fails."""

    def __init__(self, message: str, status_code: Optional[int] = None, error_type: Optional[str] = None, is_bot_blocked: bool = False):
        super().__init__(message, tier_name="Tier 3 (Scraping API)", status_code=status_code, error_type=error_type, is_bot_blocked=is_bot_blocked)


class AllTiersExhaustedError(Exception):
    """Raised when all active tiers fail for a given route/horizon query."""

    def __init__(self, route: str, departure_date: str, tier_errors: List[TierScrapingError]):
        self.route = route
        self.departure_date = departure_date
        self.tier_errors = tier_errors
        self.is_anti_bot_suspected = any(e.is_bot_blocked for e in tier_errors)
        summary = "; ".join(str(e) for e in tier_errors)
        super().__init__(f"All tiers exhausted for {route} on {departure_date}. Details: {summary}")


def is_anti_bot_response(status_code: Optional[int], text: Optional[str] = None) -> bool:
    """Detects whether HTTP response indicators point to an anti-bot defense."""
    if status_code in (403, 429, 503):
        return True
    if text:
        text_lower = text.lower()
        block_signals = [
            "cf-chl-bypass",
            "cloudflare turnstile",
            "challenge-running",
            "access denied",
            "robot or human",
            "verify you are human",
            "datadome",
            "perimeterx",
            "incapsula",
            "sorry/index?continue=",
            "unusual traffic from your computer network",
            "recaptcha",
        ]
        if any(sig in text_lower for sig in block_signals):
            return True
    return False


def parse_playwright_proxy(proxy_url: Optional[str]) -> Optional[Dict[str, str]]:
    """Converts standard proxy URL into Playwright-compatible proxy dict."""
    if not proxy_url:
        return None
    try:
        parsed = urlparse(proxy_url)
        if not parsed.scheme or not parsed.hostname:
            return None
        port = f":{parsed.port}" if parsed.port else ""
        proxy_dict: Dict[str, str] = {
            "server": f"{parsed.scheme}://{parsed.hostname}{port}"
        }
        if parsed.username:
            proxy_dict["username"] = parsed.username
        if parsed.password:
            proxy_dict["password"] = parsed.password
        return proxy_dict
    except Exception:
        return None


class BaseEngine(abc.ABC):
    """Abstract interface that all flight scraping portal spiders must implement."""

    def __init__(self, portal_name: str):
        self.portal_name = portal_name

    @abc.abstractmethod
    async def scrape_route_horizon(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        advance_window: str,
    ) -> List[RawFlightQuote]:
        """
        Scrapes a specific origin-destination pair for a given departure date.
        Returns a list of raw flight quotes.
        """
        pass

    async def execute_with_backoff(self, coro_func, *args, **kwargs) -> any:
        """
        Executes an asynchronous coroutine with jittered exponential backoff.
        Mitigates rate limits (HTTP 429), timeouts, and temporary bot-protection hurdles.
        """
        attempt = 0
        last_exception = None

        while attempt <= BACKOFF_MAX_RETRIES:
            try:
                return await coro_func(*args, **kwargs)
            except Exception as e:
                attempt += 1
                last_exception = e
                if attempt > BACKOFF_MAX_RETRIES:
                    logger.warning(
                        f"[{self.portal_name}] Max retries ({BACKOFF_MAX_RETRIES}) exceeded: {e}"
                    )
                    break

                # Exponential backoff: base * (factor ^ attempt) + jitter
                delay = min(
                    BACKOFF_MAX_SECONDS,
                    BACKOFF_BASE_SECONDS * (BACKOFF_FACTOR ** (attempt - 1)),
                )
                jitter = random.uniform(0, JITTER_MAX_SECONDS)
                total_delay = delay + jitter

                logger.info(
                    f"[{self.portal_name}] Transient issue on attempt {attempt}/{BACKOFF_MAX_RETRIES}. "
                    f"Backing off for {total_delay:.2f}s before retry... Reason: {e}"
                )
                await asyncio.sleep(total_delay)

        return []
