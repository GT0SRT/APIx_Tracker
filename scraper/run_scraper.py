#!/usr/bin/env python3
"""
Convenience launcher for the APIx Scraper Engine.
Run from repository root:
    python scraper/run_scraper.py --routes top15 --horizons 1,7,15,30,45
Or from scraper directory:
    python run_scraper.py
"""

import sys
from pathlib import Path

# Add scraper root to sys.path
scraper_root = Path(__file__).resolve().parent
if str(scraper_root) not in sys.path:
    sys.path.insert(0, str(scraper_root))

from src.cli import main

if __name__ == "__main__":
    main()
