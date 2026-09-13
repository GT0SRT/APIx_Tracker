"""
Unit tests for APIx Pydantic schemas.
"""
import pytest
from pydantic import ValidationError
from src.schemas import RawFlightQuote, DecomposedFare, FareObservationSchema
from src.processors.crypto import compute_observation_hash


def test_raw_flight_quote_validation():
    quote = RawFlightQuote(
        origin="del",
        destination="bom",
        airline_name="IndiGo",
        flight_number="6E-204",
        departure_date="2026-09-20",
        total_fare=6425.0,
    )
    # Check normalization
    assert quote.origin == "DEL"
    assert quote.destination == "BOM"
    assert quote.total_fare == 6425.0


def test_raw_flight_quote_invalid_fare():
    with pytest.raises(ValidationError):
        RawFlightQuote(
            origin="DEL",
            destination="BOM",
            airline_name="IndiGo",
            flight_number="6E-204",
            departure_date="2026-09-20",
            total_fare=-100.0,
        )


def test_decomposed_fare_balance():
    decomp = DecomposedFare(
        base_fare=5000.0,
        fuel_surcharge=550.0,
        airport_tax_udf=450.0,
        tax_gst=277.5,
        total_fare=6277.5,
    )
    assert abs((decomp.base_fare + decomp.fuel_surcharge + decomp.airport_tax_udf + decomp.tax_gst) - decomp.total_fare) < 0.01


def test_fare_observation_schema_hash_validation():
    sha = compute_observation_hash(
        route_code="DEL-BOM",
        airline_code="6E",
        flight_number="6E-204",
        departure_date="2026-09-20",
        advance_window="T+7",
        base_fare=5000.0,
        total_fare=6277.5,
        timestamp="2026-09-13T12:00:00",
    )
    assert len(sha) == 64

    obs = FareObservationSchema(
        route_code="DEL-BOM",
        airline_code="6E",
        airline_name="IndiGo",
        flight_number="6E-204",
        departure_date="2026-09-20",
        advance_window="T+7",
        base_fare=5000.0,
        fuel_surcharge=550.0,
        airport_tax_udf=450.0,
        tax_gst=277.5,
        total_fare=6277.5,
        sha256_hash=sha,
    )
    assert obs.sha256_hash == sha
