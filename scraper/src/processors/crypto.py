"""
Cryptographic Provenance Engine
Generates tamper-evident SHA-256 hashes for individual fare observations
and batch execution runs, conforming to National Data Governance Framework (NDGF)
and MoSPI audit requirements.
"""

import hashlib
from typing import List, Dict, Any


def compute_observation_hash(
    route_code: str,
    airline_code: str,
    flight_number: str,
    departure_date: str,
    advance_window: str,
    base_fare: float,
    total_fare: float,
    timestamp: str,
) -> str:
    """
    Computes an immutable, deterministic SHA-256 fingerprint for a single fare observation.
    Format:
      route|airline|flight|departureDate|advanceWindow|baseFare|totalFare|timestamp
    """
    payload = f"{route_code}|{airline_code}|{flight_number}|{departure_date}|{advance_window}|{base_fare:.2f}|{total_fare:.2f}|{timestamp}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def compute_batch_hash(observation_hashes: List[str]) -> str:
    """
    Computes a collective SHA-256 checksum across all observations in a scrape batch.
    Serves as an immutable audit Merkle digest.
    """
    if not observation_hashes:
        return hashlib.sha256(b"empty_batch").hexdigest()

    sorted_hashes = sorted(observation_hashes)
    combined = ":".join(sorted_hashes)
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()
