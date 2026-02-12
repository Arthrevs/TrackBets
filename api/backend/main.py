from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import uvicorn
from api.backend.brain import quick_analyze
from api.backend.scrapers import fetch_all_data

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "TrackBets-Backend"}

@app.get("/api/mock-tickers")
async def get_mock_tickers():
    return {"mock_tickers": ["ZOMATO.NS", "RELIANCE.NS", "TATA.NS", "BTC-USD", "TSLA"]}

@app.get("/api/analyze")
async def analyze_stock(ticker: str):
    try:
        if not ticker:
            raise HTTPException(status_code=400, detail="Ticker is required")
            
        # 1. Fetch Data
        data = fetch_all_data(ticker)
        
        # 2. Run AI Analysis
        analysis = quick_analyze(
            ticker, 
            data['price_data'], 
            data['news'], 
            data['social']
        )
        
        # 3. Construct Response
        return {
            "success": True,
            "ticker": ticker,
            "currency": data['price_data'].get('currency', '$'),
            "price_data": data['price_data'],
            "graph_data": data['graph_data'],
            "news": data['news'],
            "social": data['social'],
            "analysis": analysis,
            "source": "live"
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Static Files - Frontend
# Ensure directory exists to avoid crash locally if build missing
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
else:
    print("WARNING: frontend/dist not found. Frontend will not be served.")

# Catch-all for SPA client-side routing
@app.exception_handler(404)
async def custom_404_handler(request, __):
    if os.path.exists("frontend/dist/index.html"):
        return FileResponse("frontend/dist/index.html")
    return {"error": "Frontend not built"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
