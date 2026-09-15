"""
Unit tests for the Circuit Breaker pattern with ephemeral state persistence,
anti-bot detection, and alert artifact generation.
"""

import json
import os
import shutil
from datetime import datetime, timezone, timedelta
from pathlib import Path
import pytest

from src.resilience.circuit_breaker import (
    CircuitBreaker,
    CircuitBreakerState,
    SourceBreakerRecord,
)
from src.engines.base import Tier1Error, Tier2Error


@pytest.fixture
def temp_breaker_dir(tmp_path):
    data_dir = tmp_path / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    yield data_dir
    if data_dir.exists():
        shutil.rmtree(data_dir, ignore_errors=True)


def test_initial_state_is_closed(temp_breaker_dir):
    cb = CircuitBreaker(data_dir=temp_breaker_dir)
    assert cb.is_call_permitted("google_flights") is True
    record = cb.records["google_flights"]
    assert record.state == CircuitBreakerState.CLOSED
    assert record.consecutive_failures == 0


def test_trip_circuit_breaker_after_threshold(temp_breaker_dir):
    cb = CircuitBreaker(data_dir=temp_breaker_dir)
    source_key = "google_flights"
    threshold = cb._get_or_create_record(source_key).failure_threshold

    tier_errors = [
        Tier1Error("HTTP 403 Forbidden", status_code=403, is_bot_blocked=True),
        Tier2Error("Playwright Captcha", status_code=403, is_bot_blocked=True),
    ]

    # Record failures up to threshold
    for i in range(threshold):
        cb.record_failure(
            source_key=source_key,
            departure_date="2026-09-20",
            tier_errors=tier_errors,
            failing_route="DEL-BOM",
            retry_count=3,
        )

    record = cb.records[source_key]
    assert record.state == CircuitBreakerState.OPEN
    assert record.consecutive_failures == threshold
    assert record.anti_bot_suspected is True
    assert record.cooldown_until is not None
    assert cb.is_call_permitted(source_key) is False

    # Check alert JSON generated
    assert cb.alert_file.exists()
    with open(cb.alert_file, "r", encoding="utf-8") as f:
        alert_data = json.load(f)
    assert alert_data["tripped"] is True
    assert alert_data["failing_route"] == "DEL-BOM"
    assert alert_data["anti_bot_suspected"] is True
    assert "HTTP 403" in alert_data["error_type"]
    assert alert_data["retry_count"] == 3

    # Check alert email HTML generated
    assert cb.email_file.exists()
    email_html = cb.email_file.read_text(encoding="utf-8")
    assert "DEL-BOM" in email_html
    assert "HTTP 403" in email_html
    assert "3 retries" in email_html
    assert "ANTI-BOT UPDATE SUSPECTED" in email_html


def test_state_persistence_across_ephemeral_runs(temp_breaker_dir):
    # Run 1: Trips circuit breaker
    cb1 = CircuitBreaker(data_dir=temp_breaker_dir)
    source_key = "google_flights"
    threshold = cb1._get_or_create_record(source_key).failure_threshold

    tier_errors = [Tier1Error("Network drop", status_code=500)]
    for _ in range(threshold):
        cb1.record_failure(source_key, "2026-09-20", tier_errors, failing_route="DEL-BLR")

    assert cb1.records[source_key].state == CircuitBreakerState.OPEN
    assert cb1.state_file.exists()

    # Run 2: Simulates fresh runner restoring cached circuit_breaker_state.json
    cb2 = CircuitBreaker(data_dir=temp_breaker_dir)
    assert source_key in cb2.records
    assert cb2.records[source_key].state == CircuitBreakerState.OPEN
    assert cb2.is_call_permitted(source_key) is False


def test_cooldown_expiration_and_half_open_recovery(temp_breaker_dir):
    cb = CircuitBreaker(data_dir=temp_breaker_dir)
    source_key = "google_flights"
    record = cb._get_or_create_record(source_key)
    record.state = CircuitBreakerState.OPEN
    # Simulate cooldown expired in the past
    past_dt = datetime.now(timezone.utc) - timedelta(minutes=10)
    record.cooldown_until = past_dt.isoformat()
    cb.save_state()

    # Query should now be permitted as canary probe in HALF_OPEN
    assert cb.is_call_permitted(source_key) is True
    assert cb.records[source_key].state == CircuitBreakerState.HALF_OPEN

    # Canary succeeds -> resets to CLOSED
    cb.record_success(source_key, "Tier 1 (curl_cffi)")
    assert cb.records[source_key].state == CircuitBreakerState.CLOSED
    assert cb.records[source_key].consecutive_failures == 0
