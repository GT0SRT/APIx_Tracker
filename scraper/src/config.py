"""
Configuration settings for the AndroMatrix APIx Scraper Engine.
Covers 15 core domestic routes, booking horizons (T+1 to T+45),
carrier codes, and backoff parameters.
"""

import os
from datetime import date, timedelta
from typing import Dict, List, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- 1. Environment & API Endpoints ---
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000").rstrip("/")
INGEST_SECRET = os.getenv("INGEST_SECRET", "apix_secret_token_sih2026")
SCRAPER_PORTAL = os.getenv("SCRAPER_PORTAL", "google_flights")
SCRAPER_CONCURRENCY = int(os.getenv("SCRAPER_CONCURRENCY", "3"))
HEADLESS_MODE = os.getenv("HEADLESS", "true").lower() in ("true", "1", "yes")
EXPORT_LOCAL_BACKUP = os.getenv("EXPORT_LOCAL_BACKUP", "true").lower() in ("true", "1", "yes")

# Outlier parameters
IQR_MULTIPLIER = float(os.getenv("IQR_MULTIPLIER", "1.5"))
HAMPEL_WINDOW = int(os.getenv("HAMPEL_WINDOW", "7"))
HAMPEL_SIGMA = float(os.getenv("HAMPEL_SIGMA", "3.0"))

# --- 2. 15 Core Domestic Routes (Accounting for ~60% of Domestic Air Traffic) ---
CORE_ROUTES: List[Dict[str, any]] = [
    {"route_code": "DEL-BOM", "origin": "DEL", "destination": "BOM", "weight": 0.142, "distance_km": 1148},
    {"route_code": "DEL-BLR", "origin": "DEL", "destination": "BLR", "weight": 0.118, "distance_km": 1740},
    {"route_code": "BOM-BLR", "origin": "BOM", "destination": "BLR", "weight": 0.096, "distance_km": 842},
    {"route_code": "MAA-DEL", "origin": "MAA", "destination": "DEL", "weight": 0.084, "distance_km": 1760},
    {"route_code": "DEL-CCU", "origin": "DEL", "destination": "CCU", "weight": 0.078, "distance_km": 1305},
    {"route_code": "DEL-HYD", "origin": "DEL", "destination": "HYD", "weight": 0.072, "distance_km": 1253},
    {"route_code": "BOM-HYD", "origin": "BOM", "destination": "HYD", "weight": 0.061, "distance_km": 620},
    {"route_code": "BLR-HYD", "origin": "BLR", "destination": "HYD", "weight": 0.058, "distance_km": 505},
    {"route_code": "BOM-MAA", "origin": "BOM", "destination": "MAA", "weight": 0.055, "distance_km": 1033},
    {"route_code": "DEL-PNQ", "origin": "DEL", "destination": "PNQ", "weight": 0.052, "distance_km": 1173},
    {"route_code": "DEL-AMD", "origin": "DEL", "destination": "AMD", "weight": 0.048, "distance_km": 775},
    {"route_code": "BOM-CCU", "origin": "BOM", "destination": "CCU", "weight": 0.044, "distance_km": 1658},
    {"route_code": "BLR-CCU", "origin": "BLR", "destination": "CCU", "weight": 0.041, "distance_km": 1560},
    {"route_code": "BOM-GOI", "origin": "BOM", "destination": "GOI", "weight": 0.038, "distance_km": 435},
    {"route_code": "DEL-GOI", "origin": "DEL", "destination": "GOI", "weight": 0.035, "distance_km": 1515},
]

ROUTE_BY_CODE: Dict[str, Dict[str, any]] = {r["route_code"]: r for r in CORE_ROUTES}

# --- 3. Major Indian Airlines ---
AIRLINE_REGISTRY: Dict[str, Dict[str, str]] = {
    "6E": {"code": "6E", "name": "IndiGo", "brand_color": "#002868"},
    "AI": {"code": "AI", "name": "Air India", "brand_color": "#ED1C24"},
    "QP": {"code": "QP", "name": "Akasa Air", "brand_color": "#FF6B00"},
    "IX": {"code": "IX", "name": "Air India Express", "brand_color": "#E31E24"},
    "SG": {"code": "SG", "name": "SpiceJet", "brand_color": "#ED1B24"},
}

AIRLINE_NAME_TO_CODE: Dict[str, str] = {
    "indigo": "6E",
    "air india": "AI",
    "akasa air": "QP",
    "akasa": "QP",
    "air india express": "IX",
    "spicejet": "SG",
}

# --- 4. Advance Purchase Booking Horizons ---
# Default 5 IMF-standard constant-horizon windows:
CORE_HORIZONS: List[Tuple[str, int]] = [
    ("T+1", 1),
    ("T+7", 7),
    ("T+15", 15),
    ("T+30", 30),
    ("T+45", 45),
]

def get_departure_date_for_horizon(lead_days: int) -> Tuple[str, str]:
    """
    Returns (advanceWindow label, ISO date string 'YYYY-MM-DD')
    """
    target_date = date.today() + timedelta(days=lead_days)
    return f"T+{lead_days}", target_date.isoformat()

def get_all_45_days_horizons() -> List[Tuple[str, int]]:
    """Generates all 45 days from T+1 to T+45"""
    return [(f"T+{d}", d) for d in range(1, 46)]

# --- 5. Statutory Airport Fee & Tax Baselines (AERA Tariff Orders) ---
# User Development Fee (UDF in INR) per origin airport
AIRPORT_UDF_RATES: Dict[str, float] = {
    "DEL": 450.0,
    "BOM": 380.0,
    "BLR": 410.0,
    "HYD": 430.0,
    "MAA": 220.0,
    "CCU": 260.0,
    "PNQ": 180.0,
    "AMD": 210.0,
    "GOI": 290.0,
}

# Fuel Surcharge (YQ) estimate based on distance slabs (DGCA standard)
def estimate_fuel_surcharge(distance_km: int) -> float:
    if distance_km < 500:
        return 350.0
    elif distance_km < 1000:
        return 550.0
    elif distance_km < 1500:
        return 750.0
    else:
        return 950.0

# Economy statutory GST rate
STATUTORY_GST_RATE = 0.05  # 5% for Economy air transport

# --- 6. Exponential Backoff & Resilience Settings ---
BACKOFF_BASE_SECONDS = 2.0
BACKOFF_MAX_SECONDS = 30.0
BACKOFF_FACTOR = 2.0
BACKOFF_MAX_RETRIES = 3
JITTER_MAX_SECONDS = 0.75
