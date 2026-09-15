"""
Circuit Breaker Pattern with Ephemeral State Persistence.
Maintains fault-tolerance state across ephemeral GitHub Actions runners,
tracks consecutive multi-tier failures, enforces cooldown windows,
distinctly detects anti-bot defense updates, and generates alert payloads.
"""

import json
import logging
import os
from datetime import datetime, timezone, timedelta
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any, TYPE_CHECKING
from pydantic import BaseModel, Field

from ..config import RESILIENCE_CONFIG

if TYPE_CHECKING:
    from ..engines.base import TierScrapingError

logger = logging.getLogger("apix_scraper")


class CircuitBreakerState(str, Enum):
    CLOSED = "CLOSED"          # Normal healthy traffic
    OPEN = "OPEN"              # Tripped - traffic blocked until cooldown expires
    HALF_OPEN = "HALF_OPEN"    # Canary probing - allows 1 request to test recovery


class SourceBreakerRecord(BaseModel):
    source_key: str
    state: CircuitBreakerState = CircuitBreakerState.CLOSED
    consecutive_failures: int = 0
    failure_threshold: int = 3
    cooldown_seconds: int = 21600
    tripped_at: Optional[str] = None
    cooldown_until: Optional[str] = None
    last_failure_reason: Optional[str] = None
    failing_route: Optional[str] = None
    failure_tier: Optional[str] = None
    error_type: Optional[str] = None
    retry_count: int = 0
    anti_bot_suspected: bool = False
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CircuitBreaker:
    """
    Circuit Breaker manager tracking operational health of scrapers and routes.
    Persists state to disk for caching across ephemeral GitHub Actions CI runners.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            self.data_dir = Path(__file__).resolve().parent.parent.parent / "data"
        else:
            self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.state_file = self.data_dir / "circuit_breaker_state.json"
        self.alert_file = self.data_dir / "circuit_breaker_alert.json"
        self.email_file = self.data_dir / "alert_email.html"

        self.records: Dict[str, SourceBreakerRecord] = {}
        self.load_state()

    def load_state(self):
        """Loads cached breaker state from disk if present."""
        if self.state_file.exists():
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for k, v in data.items():
                    record = SourceBreakerRecord(**v)
                    # Check if cooldown has expired while offline
                    if record.state == CircuitBreakerState.OPEN and record.cooldown_until:
                        try:
                            cooldown_dt = datetime.fromisoformat(record.cooldown_until)
                            now = datetime.now(timezone.utc)
                            if now >= cooldown_dt:
                                record.state = CircuitBreakerState.HALF_OPEN
                                logger.info(
                                    f"[CircuitBreaker] Cooldown expired for '{k}' during runner hiatus. "
                                    f"State transitioned from OPEN -> HALF_OPEN (probing allowed)."
                                )
                        except Exception:
                            pass
                    self.records[k] = record
                logger.info(
                    f"[CircuitBreaker] Successfully loaded {len(self.records)} breaker records from {self.state_file}"
                )
            except Exception as e:
                logger.warning(f"[CircuitBreaker] Could not parse existing state file: {e}")

    def save_state(self):
        """Persists active breaker state to disk for CI runner caching."""
        try:
            self.data_dir.mkdir(parents=True, exist_ok=True)
            data = {k: v.model_dump() for k, v in self.records.items()}
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            logger.info(f"[CircuitBreaker] Saved {len(self.records)} state records to {self.state_file}")
        except Exception as e:
            logger.error(f"[CircuitBreaker] Failed to save state file: {e}")

    def _get_or_create_record(self, source_key: str) -> SourceBreakerRecord:
        if source_key not in self.records:
            # Check source config
            src_conf = RESILIENCE_CONFIG.sources.get(source_key)
            threshold = (
                src_conf.failure_threshold
                if src_conf
                else RESILIENCE_CONFIG.circuit_breaker.failure_threshold
            )
            cooldown = (
                src_conf.cooldown_seconds
                if src_conf
                else RESILIENCE_CONFIG.circuit_breaker.cooldown_seconds
            )

            self.records[source_key] = SourceBreakerRecord(
                source_key=source_key,
                failure_threshold=threshold,
                cooldown_seconds=cooldown,
            )
        return self.records[source_key]

    def is_call_permitted(self, source_key: str) -> bool:
        """
        Determines whether calls are permitted to the specified source/route.
        Returns False if circuit is OPEN and cooldown window is active.
        """
        record = self._get_or_create_record(source_key)
        now = datetime.now(timezone.utc)

        if record.state == CircuitBreakerState.CLOSED:
            return True

        if record.state == CircuitBreakerState.OPEN:
            if record.cooldown_until:
                try:
                    cooldown_dt = datetime.fromisoformat(record.cooldown_until)
                    if now >= cooldown_dt:
                        record.state = CircuitBreakerState.HALF_OPEN
                        record.updated_at = now.isoformat()
                        self.save_state()
                        logger.info(
                            f"[CircuitBreaker] Cooldown period expired for '{source_key}'. "
                            f"Entering HALF_OPEN state (permitting trial probe)."
                        )
                        return True
                    else:
                        remaining = (cooldown_dt - now).total_seconds()
                        logger.warning(
                            f"[CircuitBreaker] Source '{source_key}' circuit is OPEN until {record.cooldown_until} "
                            f"({remaining/60:.1f}m remaining). Query rejected to respect cooldown."
                        )
                        return False
                except Exception:
                    pass
            return False

        if record.state == CircuitBreakerState.HALF_OPEN:
            # Probe query is allowed
            return True

        return True

    def record_success(self, source_key: str, tier_name: str):
        """Records a successful response; resets breaker state to CLOSED."""
        record = self._get_or_create_record(source_key)
        now = datetime.now(timezone.utc).isoformat()

        if record.state in (CircuitBreakerState.HALF_OPEN, CircuitBreakerState.OPEN):
            logger.info(
                f"[CircuitBreaker] Source '{source_key}' recovered successfully via {tier_name}! "
                f"State reset from {record.state.value} -> CLOSED."
            )

        record.state = CircuitBreakerState.CLOSED
        record.consecutive_failures = 0
        record.tripped_at = None
        record.cooldown_until = None
        record.anti_bot_suspected = False
        record.updated_at = now
        self.save_state()

    def record_failure(
        self,
        source_key: str,
        departure_date: str,
        tier_errors: List[TierScrapingError],
        failing_route: Optional[str] = None,
        retry_count: int = 3,
    ):
        """
        Records failure across all tiers for a source.
        Increments consecutive failures and trips circuit breaker if threshold reached.
        Detects and distinctly logs suspected anti-bot defense updates.
        """
        record = self._get_or_create_record(source_key)
        record.consecutive_failures += 1
        now = datetime.now(timezone.utc)
        record.updated_at = now.isoformat()

        # Check anti-bot block signals across tier errors
        is_anti_bot = any(err.is_bot_blocked for err in tier_errors)
        primary_status = next((err.status_code for err in tier_errors if err.status_code), 500)
        primary_error_type = next((err.error_type for err in tier_errors if err.error_type), "UnknownError")
        failure_tiers = " -> ".join(err.tier_name for err in tier_errors) if tier_errors else "All Tiers"

        record.failing_route = failing_route or source_key
        record.failure_tier = failure_tiers
        record.error_type = f"HTTP {primary_status} ({primary_error_type})"
        record.retry_count = retry_count
        record.last_failure_reason = "; ".join(str(e) for e in tier_errors)

        if is_anti_bot:
            record.anti_bot_suspected = True

        # Check if threshold is reached
        if record.consecutive_failures >= record.failure_threshold:
            record.state = CircuitBreakerState.OPEN
            record.tripped_at = now.isoformat()
            cooldown_dt = now + timedelta(seconds=record.cooldown_seconds)
            record.cooldown_until = cooldown_dt.isoformat()

            if record.anti_bot_suspected:
                logger.critical(
                    f"🚨 [ANTI-BOT DEFENSE SUSPECTED] Target portal '{source_key}' has repeatedly blocked scraper "
                    f"with anti-bot defense signals ({record.error_type})! "
                    f"Consecutive failures: {record.consecutive_failures}/{record.failure_threshold}. "
                    f"Circuit breaker TRIPPED! Cooldown active until {record.cooldown_until}."
                )
            else:
                logger.warning(
                    f"[CircuitBreaker] Source '{source_key}' exceeded consecutive failure threshold "
                    f"({record.consecutive_failures}/{record.failure_threshold}). "
                    f"Circuit breaker TRIPPED! Cooldown active until {record.cooldown_until}."
                )

            # Generate alert payloads for CI alerting
            self._generate_alert_artifacts(record)

        self.save_state()

    def _generate_alert_artifacts(self, record: SourceBreakerRecord):
        """Writes JSON alert artifact and professionally styled HTML email body."""
        try:
            alert_payload = {
                "tripped": True,
                "tripped_at": record.tripped_at,
                "cooldown_until": record.cooldown_until,
                "cooldown_seconds": record.cooldown_seconds,
                "failing_source": record.source_key,
                "failing_route": record.failing_route or record.source_key,
                "failure_tier": record.failure_tier or "Multi-Tier Pipeline",
                "error_type": record.error_type or "HTTP 403 Forbidden",
                "retry_count": record.retry_count,
                "anti_bot_suspected": record.anti_bot_suspected,
                "consecutive_failures": record.consecutive_failures,
                "last_failure_reason": record.last_failure_reason,
            }

            with open(self.alert_file, "w", encoding="utf-8") as f:
                json.dump(alert_payload, f, indent=2)

            # Professional HTML email formatting
            badge_color = "#e53e3e" if record.anti_bot_suspected else "#dd6b20"
            badge_text = "ANTI-BOT UPDATE SUSPECTED" if record.anti_bot_suspected else "CIRCUIT BREAKER TRIPPED"

            html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APIx Scraper Incident Alert</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 24px; color: #2d3748; }}
    .card {{ max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border-top: 6px solid {badge_color}; overflow: hidden; }}
    .header {{ padding: 24px; background: #fafafa; border-bottom: 1px solid #edf2f7; }}
    .header h2 {{ margin: 0 0 8px 0; font-size: 20px; color: #1a202c; }}
    .badge {{ display: inline-block; background-color: {badge_color}; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 4px; }}
    .content {{ padding: 24px; }}
    .summary-box {{ background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 16px; margin-bottom: 24px; color: #9b2c2c; font-size: 14px; line-height: 1.5; }}
    table.incident-table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
    table.incident-table th, table.incident-table td {{ padding: 12px 14px; text-align: left; font-size: 14px; border-bottom: 1px solid #e2e8f0; }}
    table.incident-table th {{ background-color: #f7fafc; color: #4a5568; font-weight: 600; width: 35%; }}
    table.incident-table td {{ color: #1a202c; font-family: Consolas, Monaco, monospace; }}
    .action-box {{ margin-top: 24px; padding: 16px; background-color: #ebf8ff; border: 1px solid #bee3f8; border-radius: 6px; font-size: 13px; color: #2b6cb0; }}
    .action-box strong {{ display: block; margin-bottom: 6px; color: #2c5282; }}
    .footer {{ padding: 16px 24px; background: #edf2f7; text-align: center; font-size: 12px; color: #718096; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">{badge_text}</span>
      <h2>APIx Flight Scraper: Circuit Breaker Alert</h2>
      <p style="margin: 0; font-size: 13px; color: #718096;">Automated Ingestion Incident Report · Smart India Hackathon 2026</p>
    </div>
    <div class="content">
      <div class="summary-box">
        <strong>Incident Notice:</strong> The automated scraping pipeline has tripped the circuit breaker for 
        <code>{record.source_key}</code> after <strong>{record.consecutive_failures} consecutive multi-tier failures</strong>.
        Subsequent scheduled runs will respect the cooldown window until <strong>{record.cooldown_until}</strong>.
      </div>

      <table class="incident-table">
        <tr>
          <th>Failing Route</th>
          <td><strong>{record.failing_route or record.source_key}</strong></td>
        </tr>
        <tr>
          <th>Failure Tier</th>
          <td>{record.failure_tier or 'Tier 1 & Tier 2'}</td>
        </tr>
        <tr>
          <th>Error Type / Status</th>
          <td><span style="color: {badge_color}; font-weight: bold;">{record.error_type or 'HTTP 403 (Forbidden)'}</span></td>
        </tr>
        <tr>
          <th>Retry Count</th>
          <td>{record.retry_count} retries (with exponential backoff + jitter)</td>
        </tr>
        <tr>
          <th>Tripped At (UTC)</th>
          <td>{record.tripped_at}</td>
        </tr>
        <tr>
          <th>Cooldown Window</th>
          <td>{record.cooldown_seconds}s (until {record.cooldown_until})</td>
        </tr>
      </table>

      <div class="action-box">
        <strong>Recommended Next Steps:</strong>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Verify whether target portal anti-bot defenses (Cloudflare Turnstile, Akamai, or TLS fingerprinting) updated.</li>
          <li>Ensure rotating/residential proxy credentials (<code>RESIDENTIAL_PROXY_URL</code>) are active.</li>
          <li>Inspect GitHub Actions run logs and artifacts for specific HTML challenge signatures.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      Generated automatically by AndroMatrix APIx Scraper Resilience Engine.
    </div>
  </div>
</body>
</html>
"""
            with open(self.email_file, "w", encoding="utf-8") as f:
                f.write(html_content)

            logger.info(f"[CircuitBreaker] Generated incident alert artifacts at {self.alert_file} and {self.email_file}")
        except Exception as e:
            logger.error(f"[CircuitBreaker] Failed to generate alert artifacts: {e}")
