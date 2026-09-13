"""
Data processing modules for deterministic fare decomposition,
statistical outlier filtering (IQR & Hampel), and cryptographic hashing.
"""
from .decomposer import decompose_fare
from .outliers import filter_outliers_iqr, filter_outliers_hampel, apply_outlier_filters
from .crypto import compute_observation_hash, compute_batch_hash

__all__ = [
    "decompose_fare",
    "filter_outliers_iqr",
    "filter_outliers_hampel",
    "apply_outlier_filters",
    "compute_observation_hash",
    "compute_batch_hash",
]
