from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import uvicorn

from api.backend.gemini_client import forensic_analyze, forensic_analyze_deep, is_configured
from api.backend.mock_data.loader import get_mock_history, list_available_tickers

app = FastAPI(
    title="Forensic Due Diligence API",
    description="Enterprise-grade forensic analysis powered by Google Gemini",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# API Routes
# ============================================================================
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ForensicDD-Backend",
        "gemini_configured": is_configured(),
        "available_tickers": list_available_tickers(),
    }


@app.get("/api/forensic-tickers")
async def get_forensic_tickers():
    """Return the list of tickers available in the forensic database."""
    return {"tickers": list_available_tickers()}


@app.get("/api/analyze")
async def analyze_stock(ticker: str, mode: str = "standard"):
    """
    Forensic due diligence analysis endpoint.

    1. Validates the ticker against the mock database.
    2. Fetches the hardcoded forensic history profile.
    3. Sends the profile to Gemini 1.5 Pro for institutional audit.
    4. Returns strictly typed JSON for the React frontend.

    Query params:
        ticker: Stock ticker symbol (e.g. AAPL, NVDA, TSLA)
        mode: "standard" (default) or "deep_dive" for institutional deep dive
    """
    if not ticker or not ticker.strip():
        raise HTTPException(status_code=400, detail="Ticker is required")

    ticker = ticker.strip().upper()
    is_deep = mode.lower() == "deep_dive"

    # 1. Check Gemini is configured
    if not is_configured():
        raise HTTPException(
            status_code=503,
            detail="Gemini AI is not configured. Set GEMINI_API_KEY in .env.",
        )

    # 2. Fetch mock forensic history
    profile = get_mock_history(ticker)
    if profile is None:
        available = list_available_tickers()
        raise HTTPException(
            status_code=404,
            detail=f"Ticker '{ticker}' not found in forensic database. Available: {available}",
        )

    # 3. Run Gemini forensic analysis (standard or deep dive)
    try:
        if is_deep:
            analysis = forensic_analyze_deep(ticker, profile)
        else:
            analysis = forensic_analyze(ticker, profile)
    except Exception as e:
        print(f"[MAIN] Gemini analysis error for {ticker} (mode={mode}): {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini analysis failed: {str(e)[:200]}",
        )

    # 4. Build response
    response_data = {
        "success": True,
        "ticker": ticker,
        "company_name": profile.get("company_name", ticker),
        "sector": profile.get("sector", "Unknown"),
        "analysis": {
            "risk_score": analysis["risk_score"],
            "historical_vulnerabilities": analysis["historical_vulnerabilities"],
            "verdict": analysis["verdict"],
            "rationale": analysis["rationale"],
        },
        "profile_summary": {
            "lawsuits_count": len(profile.get("key_lawsuits", [])),
            "product_failures_count": len(profile.get("product_failures", [])),
            "crash_events_count": len(profile.get("crash_reactions", [])),
            "risk_flags_count": len(profile.get("risk_flags", [])),
            "debt_to_equity": profile.get("debt_profile", {}).get("debt_to_equity"),
            "credit_rating": profile.get("debt_profile", {}).get("credit_rating"),
        },
        "source": "mock_forensic_db",
    }

    # 5. Add deep dive data if applicable
    if is_deep:
        response_data["analysis"]["institutional_breakdown"] = analysis.get(
            "institutional_breakdown", {}
        )
        response_data["institutional_metrics"] = profile.get(
            "institutional_metrics", {}
        )

    return response_data


# Static Files - Frontend
# Ensure directory exists to avoid crash locally if build missing
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
else:
    print("WARNING: frontend/dist not found. Frontend will not be served.")

# Catch-all for SPA client-side routing (don't swallow /api/* errors)
@app.exception_handler(404)
async def custom_404_handler(request, exc):
    # API routes should return proper JSON errors, not index.html
    if request.url.path.startswith("/api/"):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=exc.status_code if hasattr(exc, "status_code") else 404,
            content={"detail": exc.detail if hasattr(exc, "detail") else "Not found"},
        )
    if os.path.exists("frontend/dist/index.html"):
        return FileResponse("frontend/dist/index.html")
    return {"error": "Frontend not built"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))

