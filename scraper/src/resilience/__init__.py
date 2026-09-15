"""
Resilience and fault-tolerance module.
Provides Circuit Breaker pattern with state persistence across ephemeral runners
and anti-bot defense update detection.
"""

from .circuit_breaker import CircuitBreaker, CircuitBreakerState, SourceBreakerRecord

__all__ = [
    "CircuitBreaker",
    "CircuitBreakerState",
    "SourceBreakerRecord",
]
