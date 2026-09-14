"""
Unit tests for deterministic fare decomposition, outlier filtering, and cryptographic hashing.
"""
from src.processors.decomposer import decompose_fare
from src.processors.outliers import filter_outliers_iqr, filter_outliers_hampel, apply_outlier_filters
from src.processors.crypto import compute_observation_hash, compute_batch_hash


def test_decompose_fare_identity():
    total_fare = 6425.0
    decomp = decompose_fare(total_fare=total_fare, origin_code="DEL", route_code="DEL-BOM")

    # Verify that Base + Fuel + UDF + GST == Total
    reconstructed_total = round(
        decomp.base_fare + decomp.fuel_surcharge + decomp.airport_tax_udf + decomp.tax_gst, 2
    )
    assert abs(reconstructed_total - total_fare) < 0.05
    assert decomp.base_fare > 3000.0
    assert decomp.airport_tax_udf == 450.0  # DEL UDF rate
    assert decomp.is_addon_stripped is True


def test_iqr_outlier_filtering():
    # Normal fares around 5000-6000, one massive glitch spike at 45000
    fares = [5200.0, 5400.0, 5100.0, 5300.0, 5500.0, 5250.0, 45000.0]
    outliers = filter_outliers_iqr(fares, multiplier=1.5)

    assert outliers[-1] is True
    assert outliers[0] is False


def test_hampel_outlier_filtering():
    fares = [5200.0, 5400.0, 5100.0, 5300.0, 5500.0, 5250.0, 45000.0]
    outliers = filter_outliers_hampel(fares, n_sigmas=3.0)

    assert outliers[-1] is True
    assert outliers[0] is False


def test_crypto_hash_determinism():
    h1 = compute_observation_hash("DEL-BOM", "6E", "6E-204", "2026-09-20", "T+7", 5000.0, 6425.0, "2026-09-13T12:00:00")
    h2 = compute_observation_hash("DEL-BOM", "6E", "6E-204", "2026-09-20", "T+7", 5000.0, 6425.0, "2026-09-13T12:00:00")
    h3 = compute_observation_hash("DEL-BOM", "6E", "6E-204", "2026-09-20", "T+7", 5001.0, 6425.0, "2026-09-13T12:00:00")

    assert h1 == h2
    assert h1 != h3
    assert len(h1) == 64


def test_apply_outlier_filters():
    obs = [
        {"route_code": "DEL-BOM", "advance_window": "T+7", "base_fare": 5000.0, "total_fare": 6500.0, "is_outlier": False, "provenance_status": "CLEANED"},
        {"route_code": "DEL-BOM", "advance_window": "T+7", "base_fare": 5100.0, "total_fare": 6600.0, "is_outlier": False, "provenance_status": "CLEANED"},
        {"route_code": "DEL-BOM", "advance_window": "T+7", "base_fare": 4900.0, "total_fare": 6400.0, "is_outlier": False, "provenance_status": "CLEANED"},
        {"route_code": "DEL-BOM", "advance_window": "T+7", "base_fare": 5200.0, "total_fare": 6700.0, "is_outlier": False, "provenance_status": "CLEANED"},
        {"route_code": "DEL-BOM", "advance_window": "T+7", "base_fare": 45000.0, "total_fare": 52000.0, "is_outlier": False, "provenance_status": "CLEANED"},
        {"route_code": "DEL-BLR", "advance_window": "T+1", "base_fare": 200.0, "total_fare": 400.0, "is_outlier": False, "provenance_status": "CLEANED"},
    ]
    filtered = apply_outlier_filters(obs)
    # The 45000 spike should be flagged
    assert filtered[4]["is_outlier"] is True
    assert filtered[4]["provenance_status"] == "FLAGGED"
    # The normal fares should not be flagged
    assert filtered[0]["is_outlier"] is False
    # The 200 base fare should be flagged by sanity bounds
    assert filtered[5]["is_outlier"] is True
    assert filtered[5]["provenance_status"] == "FLAGGED"

