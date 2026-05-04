from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import uvicorn

from api.backend.gemini_client import forensic_analyze, forensic_analyze_deep, is_configured
from api.backend.scrapers import fetch_all_data

app = FastAPI(
    title="Forensic Due Diligence API",
    description="Enterprise-grade forensic analysis powered by Google Gemini and Live Data",
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
        "mode": "live_data",
    }


@app.get("/api/forensic-tickers")
async def get_forensic_tickers():
    """Return a list of suggested tickers, since the database is now live."""
    return {"tickers": ["AAPL", "NVDA", "TSLA", "MSFT", "META", "GOOG"]}


@app.get("/api/analyze")
async def analyze_stock(ticker: str, mode: str = "standard"):
    """
    Forensic due diligence analysis endpoint using Live Data.

    1. Fetches live pricing, news, and sentiment via scrapers.
    2. Sends the live data to Gemini 1.5 Pro to generate a forensic profile.
    3. Returns strictly typed JSON for the React frontend.

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

    # 2. Fetch live data
    try:
        scraped_data = fetch_all_data(ticker)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch live market data for '{ticker}': {str(e)}",
        )

    # 3. Run Gemini forensic analysis (standard or deep dive)
    try:
        if is_deep:
            analysis = forensic_analyze_deep(ticker, scraped_data)
        else:
            analysis = forensic_analyze(ticker, scraped_data)
    except Exception as e:
        print(f"[MAIN] Gemini analysis error for {ticker} (mode={mode}): {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini analysis failed: {str(e)[:200]}",
        )

    # 4. Build response directly from AI output
    # Since the prompt forces AI to output company_name, sector, and profile_summary
    response_data = {
        "success": True,
        "ticker": ticker,
        "company_name": analysis.get("company_name", ticker),
        "sector": analysis.get("sector", "Unknown"),
        "analysis": {
            "risk_score": analysis.get("risk_score", 50),
            "historical_vulnerabilities": analysis.get("historical_vulnerabilities", []),
            "verdict": analysis.get("verdict", "Warning"),
            "rationale": analysis.get("rationale", "Unable to generate clear rationale."),
        },
        "profile_summary": analysis.get("profile_summary", {
            "lawsuits_count": 0,
            "product_failures_count": 0,
            "crash_events_count": 0,
            "risk_flags_count": 0,
            "debt_to_equity": "N/A",
            "credit_rating": "N/A",
        }),
        "source": "live_ai_generation",
    }

    # 5. Add deep dive data if applicable
    if is_deep:
        response_data["analysis"]["institutional_breakdown"] = analysis.get(
            "institutional_breakdown", {}
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

