"""
APIx Scraper Exceptions.
Decoupled error hierarchy for multi-tier scraping failovers and resilience.
"""

from typing import List, Optional


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

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        error_type: Optional[str] = None,
        is_bot_blocked: bool = False,
    ):
        super().__init__(
            message,
            tier_name="Tier 1 (curl_cffi)",
            status_code=status_code,
            error_type=error_type,
            is_bot_blocked=is_bot_blocked,
        )


class Tier2Error(TierScrapingError):
    """Raised when Tier 2 (Playwright / Stealth Browser) fails."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        error_type: Optional[str] = None,
        is_bot_blocked: bool = False,
    ):
        super().__init__(
            message,
            tier_name="Tier 2 (Playwright)",
            status_code=status_code,
            error_type=error_type,
            is_bot_blocked=is_bot_blocked,
        )


class Tier3Error(TierScrapingError):
    """Raised when Tier 3 (3rd-Party Scraping API) fails."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        error_type: Optional[str] = None,
        is_bot_blocked: bool = False,
    ):
        super().__init__(
            message,
            tier_name="Tier 3 (Scraping API)",
            status_code=status_code,
            error_type=error_type,
            is_bot_blocked=is_bot_blocked,
        )


class AllTiersExhaustedError(Exception):
    """Raised when all active tiers fail for a given route/horizon query."""

    def __init__(
        self,
        route: str,
        departure_date: str,
        tier_errors: List[TierScrapingError],
    ):
        self.route = route
        self.departure_date = departure_date
        self.tier_errors = tier_errors
        self.is_anti_bot_suspected = any(e.is_bot_blocked for e in tier_errors)
        summary = "; ".join(str(e) for e in tier_errors)
        super().__init__(
            f"All tiers exhausted for {route} on {departure_date}. Details: {summary}"
        )
