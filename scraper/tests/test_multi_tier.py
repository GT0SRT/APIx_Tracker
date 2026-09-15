"""
Unit tests for the Multi-Tier Scraper Pipeline.
Verifies failover: Tier 1 (curl_cffi) -> Tier 2 (Playwright) -> Tier 3 (3rd-party API),
proxy configuration parsing, and error encapsulation.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from src.engines.base import (
    Tier1Error,
    Tier2Error,
    Tier3Error,
    AllTiersExhaustedError,
    is_anti_bot_response,
    parse_playwright_proxy,
)
from src.engines.multi_tier import MultiTierEngine
from src.schemas import RawFlightQuote


def _sample_quotes(portal: str = "TIER_1") -> list:
    return [
        RawFlightQuote(
            origin="DEL",
            destination="BOM",
            airline_name="IndiGo",
            flight_number="6E-501",
            departure_date="2026-09-20",
            departure_time="08:00 AM",
            arrival_time="10:15 AM",
            total_fare=5400.0,
            source_portal=portal,
        )
    ]


def test_anti_bot_response_detection():
    assert is_anti_bot_response(403) is True
    assert is_anti_bot_response(429) is True
    assert is_anti_bot_response(503) is True
    assert is_anti_bot_response(200, "Checking your browser before accessing...") is False
    assert is_anti_bot_response(200, "Cloudflare Turnstile challenge-running") is True
    assert is_anti_bot_response(200, "Normal flights HTML content") is False


def test_parse_playwright_proxy():
    # Full credentials
    p1 = parse_playwright_proxy("http://usr:pwd@proxy.example.com:8080")
    assert p1 == {
        "server": "http://proxy.example.com:8080",
        "username": "usr",
        "password": "pwd",
    }
    # No credentials
    p2 = parse_playwright_proxy("http://gate.proxy.net:9000")
    assert p2 == {"server": "http://gate.proxy.net:9000"}
    # None input
    assert parse_playwright_proxy(None) is None


import asyncio

def test_multi_tier_tier1_success():
    async def _run():
        engine = MultiTierEngine()
        engine.tier1.scrape_route_horizon = AsyncMock(return_value=_sample_quotes("TIER_1"))
        engine.tier2.scrape_route_horizon = AsyncMock()

        quotes = await engine.scrape_route_horizon("DEL", "BOM", "2026-09-20", "T+7")
        assert len(quotes) == 1
        assert quotes[0].source_portal == "TIER_1"
        engine.tier2.scrape_route_horizon.assert_not_called()

    asyncio.run(_run())


def test_multi_tier_fallback_to_tier2():
    async def _run():
        engine = MultiTierEngine()
        # Tier 1 fails with anti-bot challenge
        engine.tier1.scrape_route_horizon = AsyncMock(
            side_effect=Tier1Error("HTTP 403 Forbidden", status_code=403, is_bot_blocked=True)
        )
        # Tier 2 succeeds
        engine.tier2.scrape_route_horizon = AsyncMock(return_value=_sample_quotes("TIER_2"))

        quotes = await engine.scrape_route_horizon("DEL", "BOM", "2026-09-20", "T+7")
        assert len(quotes) == 1
        assert quotes[0].source_portal == "TIER_2"
        engine.tier1.scrape_route_horizon.assert_called_once()
        engine.tier2.scrape_route_horizon.assert_called_once()

    asyncio.run(_run())


def test_multi_tier_fallback_to_tier3_when_enabled():
    async def _run():
        engine = MultiTierEngine()
        # Tier 1 fails
        engine.tier1.scrape_route_horizon = AsyncMock(
            side_effect=Tier1Error("Network timeout", status_code=None)
        )
        # Tier 2 fails
        engine.tier2.scrape_route_horizon = AsyncMock(
            side_effect=Tier2Error("Playwright crashed", status_code=500)
        )
        # Tier 3 enabled & succeeds
        engine.tier3.is_available = MagicMock(return_value=True)
        engine.tier3.provider = "scrapingbee"
        engine.tier3.scrape_route_horizon = AsyncMock(return_value=_sample_quotes("TIER_3"))

        quotes = await engine.scrape_route_horizon("DEL", "BOM", "2026-09-20", "T+7")
        assert len(quotes) == 1
        assert quotes[0].source_portal == "TIER_3"
        engine.tier3.scrape_route_horizon.assert_called_once()

    asyncio.run(_run())


def test_multi_tier_all_tiers_exhausted_raises():
    async def _run():
        engine = MultiTierEngine()
        engine.tier1.scrape_route_horizon = AsyncMock(
            side_effect=Tier1Error("HTTP 429", status_code=429, is_bot_blocked=True)
        )
        engine.tier2.scrape_route_horizon = AsyncMock(
            side_effect=Tier2Error("Playwright challenge blocked", status_code=403, is_bot_blocked=True)
        )
        engine.tier3.is_available = MagicMock(return_value=False)

        with pytest.raises(AllTiersExhaustedError) as exc_info:
            await engine.scrape_route_horizon("DEL", "BOM", "2026-09-20", "T+7")

        err = exc_info.value
        assert err.route == "DEL-BOM"
        assert err.is_anti_bot_suspected is True
        assert len(err.tier_errors) == 2

    asyncio.run(_run())
