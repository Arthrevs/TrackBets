"""
Gemini Client - Centralized Google Gemini SDK Configuration
============================================================
Uses the official google-genai SDK (not the deprecated google-generativeai).
Securely loads GEMINI_API_KEY from .env and exposes a singleton Client.

Usage:
    from api.backend.gemini_client import get_client, is_configured, generate

    # Quick generation
    response = generate("Explain quantum computing")
    print(response.text)

    # Full control
    client = get_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Hello",
        config=types.GenerateContentConfig(temperature=0.7),
    )
"""

import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables from .env (idempotent)
load_dotenv()

# ---------------------------------------------------------------------------
# Private state
# ---------------------------------------------------------------------------
_GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
_DEFAULT_MODEL: str = "gemini-2.5-flash"
_client: genai.Client | None = None

if _GEMINI_API_KEY:
    _client = genai.Client(api_key=_GEMINI_API_KEY)
    print(f"[GEMINI] Client configured successfully (model: {_DEFAULT_MODEL})")
else:
    print("[GEMINI] WARNING: GEMINI_API_KEY not found in environment. AI features disabled.")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def is_configured() -> bool:
    """Check whether the Gemini client has been initialised with a valid key."""
    return _client is not None


def get_client() -> genai.Client:
    """
    Return the singleton genai.Client instance.

    Raises:
        RuntimeError: If GEMINI_API_KEY is missing.
    """
    if _client is None:
        raise RuntimeError(
            "Gemini client is not configured. "
            "Set GEMINI_API_KEY in your .env file."
        )
    return _client


def generate(
    prompt: str,
    *,
    model: str | None = None,
    system_instruction: str | None = None,
    temperature: float | None = None,
    max_output_tokens: int | None = None,
) -> genai.types.GenerateContentResponse:
    """
    Convenience wrapper for simple text generation.

    Args:
        prompt: The user prompt / content.
        model: Override the default model name.
        system_instruction: Optional system instruction.
        temperature: Sampling temperature (0.0 - 2.0).
        max_output_tokens: Cap on response length.

    Returns:
        GenerateContentResponse with .text accessor.
    """
    client = get_client()

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=temperature,
        max_output_tokens=max_output_tokens,
    )

    return client.models.generate_content(
        model=model or _DEFAULT_MODEL,
        contents=prompt,
        config=config,
    )


def get_default_model() -> str:
    """Return the default model name string."""
    return _DEFAULT_MODEL


# ---------------------------------------------------------------------------
# Forensic Due Diligence Analysis (strict JSON output)
# ---------------------------------------------------------------------------
_FORENSIC_MODEL: str = "gemini-1.5-pro-latest"

_FORENSIC_SYSTEM_PROMPT: str = """You are a ruthless institutional auditor working for a top-tier forensic due diligence firm.
You have been hired by a sovereign wealth fund to evaluate whether a company is safe for a $500 million allocation.
You do NOT give the benefit of the doubt. You scrutinize every lawsuit, every product failure, every balance sheet anomaly.

Your job is to read the provided live market data (price, news, social sentiment) for a ticker. Based on this data AND your extensive internal knowledge of the company's history, produce a strict risk assessment.

RULES:
- Be harsh but factual. Cite specific events.
- "Acceptable" means the company has manageable, well-disclosed risks.
- "Warning" means there are material concerns that require deeper diligence.
- "Critical" means there are forensic red flags that would make an institutional allocator pause.
- The risk_score is 1-100 where 1 = near-zero risk and 100 = extreme forensic concern.
- historical_vulnerabilities must contain exactly 3 strings, each citing a SPECIFIC past event (lawsuits, product failures, etc).
- rationale must be 1-2 sentences maximum, written in the voice of a senior auditor briefing a board.
- Generate an accurate profile_summary containing historical metrics (lawsuit counts, credit rating, etc).

You MUST respond with ONLY the JSON object. No markdown, no explanation outside the JSON."""

_FORENSIC_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "company_name": {"type": "string"},
        "sector": {"type": "string"},
        "risk_score": {
            "type": "integer",
            "description": "Forensic risk score from 1 (low risk) to 100 (extreme risk)"
        },
        "historical_vulnerabilities": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Exactly 3 critical historical vulnerabilities, each citing a specific event"
        },
        "verdict": {
            "type": "string",
            "enum": ["Acceptable", "Warning", "Critical"],
            "description": "Overall forensic verdict"
        },
        "rationale": {
            "type": "string",
            "description": "1-2 sentence auditor rationale for the verdict"
        },
        "profile_summary": {
            "type": "object",
            "properties": {
                "lawsuits_count": {"type": "integer"},
                "product_failures_count": {"type": "integer"},
                "crash_events_count": {"type": "integer"},
                "risk_flags_count": {"type": "integer"},
                "debt_to_equity": {"type": "string"},
                "credit_rating": {"type": "string"}
            },
            "required": ["lawsuits_count", "product_failures_count", "crash_events_count", "risk_flags_count", "debt_to_equity", "credit_rating"]
        }
    },
    "required": ["company_name", "sector", "risk_score", "historical_vulnerabilities", "verdict", "rationale", "profile_summary"]
}


def forensic_analyze(ticker: str, scraped_data: dict) -> dict:
    import json

    client = get_client()

    user_prompt = f"""FORENSIC DUE DILIGENCE REVIEW
===============================
Ticker: {ticker}

LIVE MARKET DATA:
Price: {json.dumps(scraped_data.get('price_data', {}), indent=2)}
News: {scraped_data.get('news', 'No news available')}
Social Sentiment: {scraped_data.get('social', 'No social data')}

Using your vast internal knowledge of this company's entire history, generate the forensic profile, historical vulnerabilities, and risk analysis."""

    config = types.GenerateContentConfig(
        system_instruction=_FORENSIC_SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=_FORENSIC_RESPONSE_SCHEMA,
        temperature=0.4,
        max_output_tokens=1024,
    )

    response = client.models.generate_content(
        model=_FORENSIC_MODEL,
        contents=user_prompt,
        config=config,
    )

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError:
        raise ValueError(
            f"Gemini returned non-JSON despite response_mime_type enforcement: "
            f"{response.text[:200]}"
        )

    # Clamp risk_score to 1-100
    result["risk_score"] = max(1, min(100, int(result.get("risk_score", 50))))

    # Ensure exactly 3 vulnerabilities
    vulns = result.get("historical_vulnerabilities", [])
    if len(vulns) < 3:
        vulns.extend(["Insufficient data for additional vulnerability"] * (3 - len(vulns)))
    result["historical_vulnerabilities"] = vulns[:3]

    # Normalize verdict
    valid_verdicts = {"Acceptable", "Warning", "Critical"}
    if result.get("verdict") not in valid_verdicts:
        result["verdict"] = "Warning"

    return result


# ---------------------------------------------------------------------------
# Deep Dive Forensic Analysis (expanded institutional breakdown)
# ---------------------------------------------------------------------------
_DEEP_DIVE_SYSTEM_PROMPT: str = """You are a ruthless institutional auditor working for a top-tier forensic due diligence firm.
You have been hired by a sovereign wealth fund to evaluate whether a company is safe for a $500 million allocation.
You do NOT give the benefit of the doubt. You scrutinize every lawsuit, every product failure, every balance sheet anomaly.

This is an INSTITUTIONAL DEEP DIVE. You must generate deep institutional metrics based on your vast historical knowledge of the company, combined with the live market data provided.

RULES:
- Be harsh but factual. Cite specific events from the data.
- "Acceptable" means the company has manageable, well-disclosed risks.
- "Warning" means there are material concerns that require deeper diligence.
- "Critical" means there are forensic red flags that would make an institutional allocator pause.
- The risk_score is 1-100 where 1 = near-zero risk and 100 = extreme forensic concern.
- historical_vulnerabilities must contain exactly 3 strings, each citing a SPECIFIC past event.
- rationale must be 1-2 sentences maximum, written in the voice of a senior auditor briefing a board.
- The institutional_breakdown must summarize the regulatory fine exposure, cite key litigation, and assess the overall regulatory environment sentiment.
- regulatory_sentiment must be exactly one of: "Hostile", "Adversarial", "Cooperative", "Neutral".
- Provide accurate company_name, sector, and profile_summary data.

You MUST respond with ONLY the JSON object. No markdown, no explanation outside the JSON."""

_DEEP_DIVE_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "company_name": {"type": "string"},
        "sector": {"type": "string"},
        "risk_score": {
            "type": "integer",
            "description": "Forensic risk score from 1 (low risk) to 100 (extreme risk)"
        },
        "historical_vulnerabilities": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Exactly 3 critical historical vulnerabilities, each citing a specific event"
        },
        "verdict": {
            "type": "string",
            "enum": ["Acceptable", "Warning", "Critical"],
            "description": "Overall forensic verdict"
        },
        "rationale": {
            "type": "string",
            "description": "1-2 sentence auditor rationale for the verdict"
        },
        "profile_summary": {
            "type": "object",
            "properties": {
                "lawsuits_count": {"type": "integer"},
                "product_failures_count": {"type": "integer"},
                "crash_events_count": {"type": "integer"},
                "risk_flags_count": {"type": "integer"},
                "debt_to_equity": {"type": "string"},
                "credit_rating": {"type": "string"}
            },
            "required": ["lawsuits_count", "product_failures_count", "crash_events_count", "risk_flags_count", "debt_to_equity", "credit_rating"]
        },
        "institutional_breakdown": {
            "type": "object",
            "properties": {
                "total_regulatory_fines": {
                    "type": "string",
                    "description": "Total regulatory fines in USD (e.g. '$2.06B')"
                },
                "key_litigation": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "3-4 key litigation events with case citations"
                },
                "regulatory_sentiment": {
                    "type": "string",
                    "enum": ["Hostile", "Adversarial", "Cooperative", "Neutral"],
                    "description": "Overall regulatory environment assessment"
                }
            },
            "required": ["total_regulatory_fines", "key_litigation", "regulatory_sentiment"]
        }
    },
    "required": ["company_name", "sector", "risk_score", "historical_vulnerabilities", "verdict", "rationale", "profile_summary", "institutional_breakdown"]
}


def forensic_analyze_deep(ticker: str, scraped_data: dict) -> dict:
    import json

    client = get_client()

    user_prompt = f"""INSTITUTIONAL DEEP DIVE — FORENSIC DUE DILIGENCE
==================================================
Ticker: {ticker}

LIVE MARKET DATA:
Price: {json.dumps(scraped_data.get('price_data', {}), indent=2)}
News: {scraped_data.get('news', 'No news available')}
Social Sentiment: {scraped_data.get('social', 'No social data')}

Using your vast internal knowledge of this company's entire history, generate the comprehensive forensic profile, including institutional deep dive metrics (fines, litigation)."""

    config = types.GenerateContentConfig(
        system_instruction=_DEEP_DIVE_SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=_DEEP_DIVE_RESPONSE_SCHEMA,
        temperature=0.4,
        max_output_tokens=2048,
    )

    response = client.models.generate_content(
        model=_FORENSIC_MODEL,
        contents=user_prompt,
        config=config,
    )

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError:
        raise ValueError(
            f"Gemini returned non-JSON despite response_mime_type enforcement: "
            f"{response.text[:200]}"
        )

    # Clamp risk_score
    result["risk_score"] = max(1, min(100, int(result.get("risk_score", 50))))

    # Ensure exactly 3 vulnerabilities
    vulns = result.get("historical_vulnerabilities", [])
    if len(vulns) < 3:
        vulns.extend(["Insufficient data for additional vulnerability"] * (3 - len(vulns)))
    result["historical_vulnerabilities"] = vulns[:3]

    # Normalize verdict
    valid_verdicts = {"Acceptable", "Warning", "Critical"}
    if result.get("verdict") not in valid_verdicts:
        result["verdict"] = "Warning"

    return result

