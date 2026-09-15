"""
Unit tests for scraper resilience configuration and proxy management.
"""

import os
from pathlib import Path
from src.config import (
    load_resilience_config,
    get_proxy_url,
    ResilienceConfig,
    BackoffConfig,
    CircuitBreakerConfig,
    ProxyConfig,
    ThirdPartyApiConfig,
)


def test_default_resilience_config_loaded():
    config = load_resilience_config()
    assert isinstance(config, ResilienceConfig)
    assert config.backoff.max_retries >= 1
    assert config.backoff.base_delay_seconds > 0
    assert config.backoff.max_delay_seconds >= config.backoff.base_delay_seconds
    assert config.backoff.jitter_factor > 0
    assert config.circuit_breaker.failure_threshold >= 1
    assert config.circuit_breaker.cooldown_seconds > 0


def test_env_proxy_override(monkeypatch):
    test_proxy = "http://user:pass@residential.proxy.io:8080"
    monkeypatch.setenv("RESIDENTIAL_PROXY_URL", test_proxy)
    config = load_resilience_config()
    assert config.proxies.enabled is True
    assert config.proxies.residential_proxy_url == test_proxy


def test_third_party_api_env_override(monkeypatch):
    monkeypatch.setenv("SCRAPINGBEE_API_KEY", "sb_test_api_key_123")
    monkeypatch.setenv("SCRAPER_TIER3_ENABLED", "true")
    config = load_resilience_config()
    assert config.third_party_api.provider == "scrapingbee"
    assert config.third_party_api.enabled is True


def test_circuit_breaker_env_overrides(monkeypatch):
    monkeypatch.setenv("CIRCUIT_BREAKER_THRESHOLD", "5")
    monkeypatch.setenv("CIRCUIT_BREAKER_COOLDOWN_SECONDS", "3600")
    config = load_resilience_config()
    assert config.circuit_breaker.failure_threshold == 5
    assert config.circuit_breaker.cooldown_seconds == 3600
