"""
Scraper engines package.
"""
from .base import (
    BaseEngine,
    TierScrapingError,
    Tier1Error,
    Tier2Error,
    Tier3Error,
    AllTiersExhaustedError,
    is_anti_bot_response,
    parse_playwright_proxy,
)
from .google_flights import GoogleFlightsEngine
from .easemytrip import EaseMyTripEngine
from .tier1_curl import Tier1CurlEngine
from .tier3_api import Tier3ScrapingApiEngine
from .multi_tier import MultiTierEngine

__all__ = [
    "BaseEngine",
    "TierScrapingError",
    "Tier1Error",
    "Tier2Error",
    "Tier3Error",
    "AllTiersExhaustedError",
    "is_anti_bot_response",
    "parse_playwright_proxy",
    "GoogleFlightsEngine",
    "EaseMyTripEngine",
    "Tier1CurlEngine",
    "Tier3ScrapingApiEngine",
    "MultiTierEngine",
]
