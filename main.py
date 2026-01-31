"""
FastAPI Server for TrackBets
Deployed on Render
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from dotenv import load_dotenv

# Import backend logic
from api.backend.scrapers import get_stock_price, get_news, get_reddit_posts
from api.backend.brain import FinancialAnalyst

# Init
load_dotenv()
app = FastAPI(title="TrackBets API", version="1.0.0")

# Enable CORS for React frontend (still useful if running separate dev servers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyst = FinancialAnalyst()

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "TrackBets API"}

@app.get("/api/analyze")
def analyze_stock(ticker: str = Query(..., description="Stock ticker symbol")):
    try:
        # 1. Fetch data
        price_data = get_stock_price(ticker)
        news_data = get_news(ticker)
        reddit_data = get_reddit_posts(ticker)

        # 2. Prepare Context for AI
        context_str = f"""
        STOCK: {ticker}
        PRICE: {price_data.get('currency', '$')}{price_data.get('price', 'N/A')}
        
        NEWS HEADLINES:
        {news_data}
        
        SOCIAL POSTS:
        {reddit_data}
        """

        # 3. AI Analysis
        ai_result = analyst.analyze(context_str, "Investment Decision")

        # 4. Construct Response
        return {
            "ticker": ticker,
            "market_data": {
                "price": price_data,
                "news": news_data,
                "social": reddit_data
            },
            "analysis": ai_result
        }

    except Exception as e:
        return {"error": str(e)}

# --- FRONTEND SERVING ---
# Check if build exists (for local dev safety)
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

    # Serve Index for Root and Catch-All (SPA support)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Allow API routes to pass through (handled above) - but FastAPI routing priority already does this.
        # However, checking if file exists in dist is safer for standard files like favicon.ico
        file_path = f"frontend/dist/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("frontend/dist/index.html")
else:
    @app.get("/")
    def root():
        return {"message": "Frontend build not found. Run 'cd frontend && npm run build'"}
