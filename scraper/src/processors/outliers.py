"""
Statistical Outlier Filtering Engine
Implements Interquartile Range (IQR) and Hampel Median Absolute Deviation (MAD) filters
to reject anomalous price spikes, flash sale errors, and scraping glitches.
Conforms to IMF CPI Manual (2020) recommendations for web-scraped scanner data.
"""

from typing import List, Dict, Any
import numpy as np


def filter_outliers_iqr(values: List[float], multiplier: float = 1.5) -> List[bool]:
    """
    Standard Tukey IQR Outlier Detection:
      IQR = Q3 - Q1
      Lower Bound = Q1 - multiplier * IQR
      Upper Bound = Q3 + multiplier * IQR
    Returns a list of booleans where True indicates an outlier.
    """
    if len(values) < 4:
        # Not enough data points to reliably construct quartiles
        return [False] * len(values)

    arr = np.array(values, dtype=float)
    q1 = np.percentile(arr, 25)
    q3 = np.percentile(arr, 75)
    iqr = q3 - q1

    if iqr == 0:
        # All values identical or very tightly clustered
        return [False] * len(values)

    lower_bound = q1 - (multiplier * iqr)
    upper_bound = q3 + (multiplier * iqr)

    return [bool(v < lower_bound or v > upper_bound) for v in values]


def filter_outliers_hampel(values: List[float], n_sigmas: float = 3.0) -> List[bool]:
    """
    Hampel Median Absolute Deviation (MAD) Filter:
      Detects extreme single-flight glitches resistant to mean-skewing.
      MAD = median(|x_i - median(X)|)
      Threshold = n_sigmas * 1.4826 * MAD
    Returns a list of booleans where True indicates an outlier.
    """
    if len(values) < 4:
        return [False] * len(values)

    arr = np.array(values, dtype=float)
    median = float(np.median(arr))
    mad = float(np.median(np.abs(arr - median)))

    if mad == 0:
        return [False] * len(values)

    threshold = n_sigmas * 1.4826 * mad
    return [bool(abs(v - median) > threshold) for v in values]


def apply_outlier_filters(observations: List[Dict[str, Any]], iqr_multiplier: float = 1.5) -> List[Dict[str, Any]]:
    """
    Groups observations by (route_code, advance_window) and applies
    two-stage IQR + Hampel statistical outlier rejection.
    Updates `is_outlier` flag and `provenance_status` on matching records.
    """
    if not observations:
        return observations

    # Group by (route_code, advance_window)
    groups: Dict[tuple, List[int]] = {}
    for idx, obs in enumerate(observations):
        key = (obs.get("route_code"), obs.get("advance_window"))
        groups.setdefault(key, []).append(idx)

    for key, indices in groups.items():
        if len(indices) < 4:
            continue

        base_fares = [observations[i]["base_fare"] for i in indices]

        iqr_flags = filter_outliers_iqr(base_fares, multiplier=iqr_multiplier)
        hampel_flags = filter_outliers_hampel(base_fares, n_sigmas=3.0)

        for i, idx in enumerate(indices):
            if iqr_flags[i] or hampel_flags[i]:
                observations[idx]["is_outlier"] = True
                observations[idx]["provenance_status"] = "FLAGGED"

    return observations
