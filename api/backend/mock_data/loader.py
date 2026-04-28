"""
Mock Data Loader - Forensic Due Diligence Profiles
====================================================
Reads hardcoded historical financial profiles from JSON.
Avoids live API calls (yfinance, etc.) to prevent cloud-blocking
during hackathon demos.

Usage:
    from api.backend.mock_data.loader import get_mock_history, list_available_tickers

    profile = get_mock_history("AAPL")
    print(profile["forensic_profile"])
    print(profile["key_lawsuits"])
"""

import json
import os
from typing import Optional

# ---------------------------------------------------------------------------
# Load profiles once at module import (singleton pattern)
# ---------------------------------------------------------------------------
_DATA_DIR = os.path.dirname(os.path.abspath(__file__))
_PROFILES_PATH = os.path.join(_DATA_DIR, "historical_profiles.json")
_profiles: dict = {}

try:
    with open(_PROFILES_PATH, "r", encoding="utf-8") as f:
        _profiles = json.load(f)
    print(f"[MOCK_DATA] Loaded {len(_profiles)} forensic profiles: {list(_profiles.keys())}")
except FileNotFoundError:
    print(f"[MOCK_DATA] ERROR: historical_profiles.json not found at {_PROFILES_PATH}")
except json.JSONDecodeError as e:
    print(f"[MOCK_DATA] ERROR: Failed to parse historical_profiles.json — {e}")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def get_mock_history(ticker: str) -> Optional[dict]:
    """
    Retrieve the forensic due diligence profile for a given ticker.

    Args:
        ticker: Stock ticker symbol (e.g. "AAPL", "NVDA", "TSLA").
                Case-insensitive — will be normalized to uppercase.

    Returns:
        dict with keys: ticker, company_name, sector, forensic_profile,
        key_lawsuits, product_failures, debt_profile, crash_reactions,
        risk_flags.  Returns None if the ticker is not in the database.
    """
    normalized = ticker.strip().upper()
    profile = _profiles.get(normalized)

    if profile is None:
        print(f"[MOCK_DATA] Ticker '{normalized}' not found in forensic database. "
              f"Available: {list(_profiles.keys())}")
        return None

    return profile


def list_available_tickers() -> list[str]:
    """Return a sorted list of all tickers in the forensic database."""
    return sorted(_profiles.keys())


def get_all_profiles() -> dict:
    """Return the full profiles dictionary (all tickers)."""
    return _profiles
