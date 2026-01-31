"""
FastAPI Server for TrackBets
Deployed on Render
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Import backend logic
from api.backend.scrapers import get_stock_price, get_news, get_reddit_posts
from api.backend.brain import FinancialAnalyst

# Init
load_dotenv()
app = FastAPI(title="TrackBets API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyst = FinancialAnalyst()

@app.get("/")
def root():
    return {"status": "healthy", "service": "TrackBets API", "version": "1.0.0"}

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
        PRICE: {price_data.get('current')}
        NEWS HEADLINES: {[n['title'] for n in news_data]}
        SOCIAL POSTS: {[p['title'] for p in reddit_data]}
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
