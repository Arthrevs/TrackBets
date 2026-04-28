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

Your job is to read the provided historical forensic data on a company and produce a strict risk assessment.

RULES:
- Be harsh but factual. Cite specific events from the data.
- "Acceptable" means the company has manageable, well-disclosed risks.
- "Warning" means there are material concerns that require deeper diligence.
- "Critical" means there are forensic red flags that would make an institutional allocator pause.
- The risk_score is 1-100 where 1 = near-zero risk and 100 = extreme forensic concern.
- historical_vulnerabilities must contain exactly 3 strings, each citing a SPECIFIC past event.
- rationale must be 1-2 sentences maximum, written in the voice of a senior auditor briefing a board.

You MUST respond with ONLY the JSON object. No markdown, no explanation outside the JSON."""

_FORENSIC_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
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
        }
    },
    "required": ["risk_score", "historical_vulnerabilities", "verdict", "rationale"]
}


def forensic_analyze(ticker: str, profile: dict) -> dict:
    """
    Run Gemini forensic due diligence analysis on a company profile.

    Uses gemini-1.5-pro-latest with response_mime_type="application/json"
    to enforce strict, parseable JSON output that won't crash the frontend.

    Args:
        ticker: Stock ticker symbol (e.g. "AAPL").
        profile: Full forensic profile dict from mock_data.

    Returns:
        dict with keys: risk_score (int), historical_vulnerabilities (list[str]),
        verdict (str), rationale (str).

    Raises:
        RuntimeError: If Gemini client is not configured.
        ValueError: If Gemini returns unparseable output (should not happen
                     with response_mime_type enforcement).
    """
    import json

    client = get_client()

    # Build the user prompt with all forensic data
    user_prompt = f"""FORENSIC DUE DILIGENCE REVIEW
===============================
Company: {profile.get('company_name', ticker)}
Ticker: {ticker}
Sector: {profile.get('sector', 'Unknown')}

HISTORICAL NARRATIVE:
{profile.get('forensic_profile', 'No profile available.')}

KEY LAWSUITS:
{json.dumps(profile.get('key_lawsuits', []), indent=2)}

PRODUCT FAILURES:
{json.dumps(profile.get('product_failures', []), indent=2)}

DEBT PROFILE:
{json.dumps(profile.get('debt_profile', {}), indent=2)}

MARKET CRASH REACTIONS:
{json.dumps(profile.get('crash_reactions', []), indent=2)}

RISK FLAGS:
{json.dumps(profile.get('risk_flags', []), indent=2)}

Produce your forensic risk assessment now."""

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

    # response_mime_type guarantees valid JSON, but we still validate
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

This is an INSTITUTIONAL DEEP DIVE. You have been given additional institutional metrics data including
regulatory fines, detailed litigation history, and raw SEC 10-K footnote excerpts.
You MUST analyze this additional data and incorporate it into your assessment.

Your job is to read ALL provided forensic data and produce a comprehensive risk assessment with institutional breakdown.

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

You MUST respond with ONLY the JSON object. No markdown, no explanation outside the JSON."""

_DEEP_DIVE_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
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
    "required": ["risk_score", "historical_vulnerabilities", "verdict", "rationale", "institutional_breakdown"]
}


def forensic_analyze_deep(ticker: str, profile: dict) -> dict:
    """
    Run expanded Gemini forensic analysis with institutional deep dive.

    Includes institutional_metrics data (regulatory fines, litigation history,
    raw SEC excerpts) in the prompt, and returns an expanded response with
    an institutional_breakdown object.

    Args:
        ticker: Stock ticker symbol (e.g. "AAPL").
        profile: Full forensic profile dict from mock_data (must include institutional_metrics).

    Returns:
        dict with standard forensic keys plus institutional_breakdown.
    """
    import json

    client = get_client()

    inst_metrics = profile.get("institutional_metrics", {})

    user_prompt = f"""INSTITUTIONAL DEEP DIVE — FORENSIC DUE DILIGENCE
==================================================
Company: {profile.get('company_name', ticker)}
Ticker: {ticker}
Sector: {profile.get('sector', 'Unknown')}

HISTORICAL NARRATIVE:
{profile.get('forensic_profile', 'No profile available.')}

KEY LAWSUITS:
{json.dumps(profile.get('key_lawsuits', []), indent=2)}

PRODUCT FAILURES:
{json.dumps(profile.get('product_failures', []), indent=2)}

DEBT PROFILE:
{json.dumps(profile.get('debt_profile', {}), indent=2)}

MARKET CRASH REACTIONS:
{json.dumps(profile.get('crash_reactions', []), indent=2)}

RISK FLAGS:
{json.dumps(profile.get('risk_flags', []), indent=2)}

═══════════════════════════════════════════════════
INSTITUTIONAL METRICS (DEEP DIVE DATA):
═══════════════════════════════════════════════════

TOTAL REGULATORY FINES: {inst_metrics.get('regulatory_fines_usd', 'N/A')}

DETAILED LITIGATION HISTORY:
{json.dumps(inst_metrics.get('litigation_history', []), indent=2)}

RAW SEC 10-K EXCERPTS:
{chr(10).join(inst_metrics.get('raw_sec_excerpts', ['No excerpts available.']))}

Produce your comprehensive forensic risk assessment with institutional breakdown now."""

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

    # Ensure institutional_breakdown exists
    if "institutional_breakdown" not in result:
        result["institutional_breakdown"] = {
            "total_regulatory_fines": inst_metrics.get("regulatory_fines_usd", "N/A"),
            "key_litigation": inst_metrics.get("litigation_history", [])[:4],
            "regulatory_sentiment": "Adversarial"
        }

    return result

