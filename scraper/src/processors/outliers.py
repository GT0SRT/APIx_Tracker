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
    Also enforces absolute physical airfare sanity bounds (e.g. base < 500 or > 80000)
    and pools at route level for small-sample groups (<4 observations).
    Updates `is_outlier` flag and `provenance_status` on matching records.
    """
    if not observations:
        return observations

    # 1. Absolute sanity bounds check
    for obs in observations:
        base = obs.get("base_fare", 0.0)
        total = obs.get("total_fare", 0.0)
        if base < 500.0 or base > 80000.0 or total < 1000.0 or total > 100000.0:
            obs["is_outlier"] = True
            obs["provenance_status"] = "FLAGGED"

    # 2. Group by (route_code, advance_window)
    groups: Dict[tuple, List[int]] = {}
    route_groups: Dict[str, List[int]] = {}
    for idx, obs in enumerate(observations):
        rc = obs.get("route_code")
        win = obs.get("advance_window")
        groups.setdefault((rc, win), []).append(idx)
        if rc:
            route_groups.setdefault(rc, []).append(idx)

    # 3. Fine-grained horizon group filtering
    for (route_code, advance_window), indices in groups.items():
        if len(indices) >= 4:
            base_fares = [observations[i]["base_fare"] for i in indices]
            iqr_flags = filter_outliers_iqr(base_fares, multiplier=iqr_multiplier)
            hampel_flags = filter_outliers_hampel(base_fares, n_sigmas=3.0)

            for i, idx in enumerate(indices):
                if iqr_flags[i] or hampel_flags[i]:
                    observations[idx]["is_outlier"] = True
                    observations[idx]["provenance_status"] = "FLAGGED"
        else:
            # For small groups (< 4), test against route-level pool if available
            route_indices = route_groups.get(route_code, [])
            if len(route_indices) >= 4:
                route_fares = [observations[i]["base_fare"] for i in route_indices]
                iqr_flags = filter_outliers_iqr(route_fares, multiplier=2.0)
                hampel_flags = filter_outliers_hampel(route_fares, n_sigmas=3.5)
                for i, r_idx in enumerate(route_indices):
                    if r_idx in indices and (iqr_flags[i] or hampel_flags[i]):
                        observations[r_idx]["is_outlier"] = True
                        observations[r_idx]["provenance_status"] = "FLAGGED"

    return observations
