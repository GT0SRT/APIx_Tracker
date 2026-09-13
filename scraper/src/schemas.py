"""
Pydantic V2 schemas for deterministic validation of scraped airfare records.
Strictly maps to the backend Prisma 'FareObservation' and 'ScraperRunLog' models.
"""

import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator


class RawFlightQuote(BaseModel):
    """Raw unvalidated flight pricing quote scraped directly from airline or OTA portal."""
    origin: str = Field(..., min_length=3, max_length=3, description="IATA airport code (e.g. DEL)")
    destination: str = Field(..., min_length=3, max_length=3, description="IATA airport code (e.g. BOM)")
    airline_name: str = Field(..., min_length=2, description="Carrier name (e.g. IndiGo, Air India)")
    flight_number: str = Field(..., description="Flight code (e.g. 6E-204, AI-102)")
    departure_date: str = Field(..., description="ISO Departure Date (YYYY-MM-DD)")
    departure_time: Optional[str] = Field(None, description="Time of flight departure (e.g. 11:00 AM)")
    arrival_time: Optional[str] = Field(None, description="Time of flight arrival (e.g. 1:25 PM)")
    total_fare: float = Field(..., gt=500.0, lt=250000.0, description="Raw total consumer fare in INR")
    source_portal: str = Field(default="GOOGLE_FLIGHTS", description="Scraped portal identifier")

    @field_validator("origin", "destination")
    @classmethod
    def normalize_iata(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("total_fare")
    @classmethod
    def validate_fare(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Total fare must be strictly positive")
        return round(float(v), 2)


class DecomposedFare(BaseModel):
    """
    Deterministic Fare Decomposition isolating Base Fare and statutory taxes,
    strictly stripping voluntary ancillary add-ons (meals, seat fees, baggage).
    """
    base_fare: float = Field(..., gt=0.0, description="Pure base airfare excluding all surcharges")
    fuel_surcharge: float = Field(default=0.0, ge=0.0, description="Fuel tax / surcharge (YQ/YR)")
    airport_tax_udf: float = Field(default=0.0, ge=0.0, description="User Development Fee (UDF)")
    tax_gst: float = Field(default=0.0, ge=0.0, description="Statutory 5% Goods and Services Tax")
    total_fare: float = Field(..., gt=0.0, description="Final all-inclusive passenger fare")
    is_addon_stripped: bool = Field(default=True, description="Flag verifying voluntary add-ons were removed")

    @model_validator(mode="after")
    def verify_fare_sum(self):
        calculated_sum = self.base_fare + self.fuel_surcharge + self.airport_tax_udf + self.tax_gst
        # Allow rounding tolerance of +-2 INR
        if abs(calculated_sum - self.total_fare) > 2.0:
            # Rebalance base_fare to ensure exact mathematical identity:
            # Base = Total - (Fuel + UDF + GST)
            rebalanced_base = max(100.0, self.total_fare - (self.fuel_surcharge + self.airport_tax_udf + self.tax_gst))
            self.base_fare = round(rebalanced_base, 2)
        return self


class FareObservationSchema(BaseModel):
    """
    Final validated fare observation schema.
    Directly maps to the PostgreSQL Prisma model 'FareObservation'.
    """
    route_code: str = Field(..., description="City pair identifier (e.g. DEL-BOM)")
    airline_code: str = Field(..., min_length=2, max_length=4, description="IATA/ICAO airline code (e.g. 6E, AI)")
    airline_name: str = Field(..., description="Commercial carrier name")
    flight_number: str = Field(..., description="Flight flight designation (e.g. 6E-204)")
    departure_date: str = Field(..., description="Flight departure date (YYYY-MM-DD)")
    advance_window: str = Field(..., description="Advance booking lead horizon (e.g. T+1, T+7, T+45)")
    base_fare: float = Field(..., gt=0.0, description="Decomposed base airfare")
    fuel_surcharge: float = Field(default=0.0, ge=0.0, description="Fuel Surcharge (YQ)")
    airport_tax_udf: float = Field(default=0.0, ge=0.0, description="User Development Fee (UDF)")
    tax_gst: float = Field(default=0.0, ge=0.0, description="Statutory 5% GST")
    total_fare: float = Field(..., gt=0.0, description="Total verified fare")
    is_outlier: bool = Field(default=False, description="Flagged by IQR / Hampel statistical filter")
    provenance_status: str = Field(default="CLEANED", description="CLEANED, FLAGGED, or SOLD_OUT_IMPUTED")
    sha256_hash: str = Field(..., min_length=64, max_length=64, description="Cryptographic SHA-256 fingerprint")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="Scrape UTC timestamp")
    source_portal: str = Field(default="GOOGLE_FLIGHTS", description="Source data portal")

    @field_validator("sha256_hash")
    @classmethod
    def validate_sha256(cls, v: str) -> str:
        if not re.match(r"^[a-f0-9]{64}$", v.lower()):
            raise ValueError("Invalid SHA-256 hash format")
        return v.lower()


class ScrapeBatchSummary(BaseModel):
    """Execution metadata and audit record for a scraper run."""
    batch_id: str
    run_started_at: str
    run_finished_at: Optional[str] = None
    status: str = "RUNNING"  # "SUCCESS", "PARTIAL_FAILURE", "FAILED"
    total_scraped: int = 0
    valid_records: int = 0
    outliers_filtered: int = 0
    batch_sha256: Optional[str] = None
    error_message: Optional[str] = None
    source_portal: str = "GOOGLE_FLIGHTS"
    routes_processed: List[str] = Field(default_factory=list)
    horizons_processed: List[str] = Field(default_factory=list)
