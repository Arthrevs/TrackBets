"""
TrackBets Backend - Scrapers Module
====================================
Robust scraping functions for stock prices, news, and social sentiment.
All functions have try-except blocks to prevent crashing.
"""

import os
from typing import Optional, List, Dict
from datetime import datetime


# ============================================================================
# 1. STOCK PRICE SCRAPER (Twelve Data)
# ============================================================================
def get_stock_price(ticker: str) -> Dict:
    """
    Fetch current stock price with strict priority:
    1. Twelve Data (Primary/Real)
    """
    ticker_upper = ticker.upper()

    # =========================================================
    # ATTEMPT 1: Twelve Data
    # =========================================================
    td_ticker = ticker_upper.replace("-", "/") # BTC-USD -> BTC/USD
    twelve_data_key = os.getenv("TWELVE_DATA_API_KEY")
    
    if twelve_data_key:
        print(f"[SCRAPER] Trying Twelve Data for {td_ticker}...")
        td_data = get_price_twelve_data(td_ticker, twelve_data_key)
        if td_data:
            return td_data

    # =========================================================
    # ATTEMPT 2: Failure
    # =========================================================
    error_msg = f"All pricing APIs failed for {ticker_upper}."
    print(f"[SCRAPER] {error_msg}")
    raise ValueError(error_msg)


def get_price_twelve_data(ticker: str, api_key: str) -> Optional[Dict]:
    """Fetch real-time price from Twelve Data API using the twelvedata package."""
    try:
        from twelvedata import TDClient
        td = TDClient(apikey=api_key)
        
        # Get quote which contains full metadata (price, high, low, etc)
        quote_data = td.quote(symbol=ticker).as_json()
        
        # Extract price (quote uses 'close' for the current/last price)
        current_price = float(quote_data.get('close') or quote_data.get('price', 0))
        if current_price == 0:
            return None
            
        change_percent = float(quote_data.get('percent_change', 0))
        
        return {
            "price": round(current_price, 2),
            "change_percent": round(change_percent, 2),
            "is_up": change_percent >= 0,
            "currency": quote_data.get('currency', '$'), 
            "name": quote_data.get('name', ticker),
            "market_cap": "N/A", 
            "volume": quote_data.get('volume', "N/A"),
            "day_high": quote_data.get('high', "N/A"),
            "day_low": quote_data.get('low', "N/A"),
            "52_week_high": quote_data.get('fifty_two_week', {}).get('high', "N/A"),
            "52_week_low": quote_data.get('fifty_two_week', {}).get('low', "N/A"),
            "source": "TwelveData"
        }
    except Exception as e:
        print(f"[TwelveData] Exception: {e}")
        return None


# ============================================================================
# 2. NEWS SCRAPER (DuckDuckGo)
# ============================================================================
def get_news(ticker: str, max_results: int = 5) -> str:
    """
    Fetch top news headlines for a stock ticker via DuckDuckGo.
    Returns a formatted string of headlines.
    """
    try:
        from duckduckgo_search import DDGS
        
        # Clean ticker for search
        search_term = ticker.replace(".NS", "").replace(".BO", "").replace(".NYSE", "")
        
        with DDGS() as ddgs:
            results = list(ddgs.news(f"{search_term} stock", max_results=max_results))
        
        if not results:
            return f"No recent news found for {search_term}."
        
        # Format headlines
        headlines = []
        for i, article in enumerate(results, 1):
            title = article.get('title', 'No title')
            source = article.get('source', 'Unknown')
            headlines.append(f"{i}. [{source}] {title}")
        
        return "\n".join(headlines)
        
    except Exception as e:
        print(f"[SCRAPER ERROR] get_news({ticker}): {str(e)}")
        return f"News unavailable for {ticker}. Error: {str(e)}"


# ============================================================================
# 3. REDDIT/SOCIAL SCRAPER (DuckDuckGo)
# ============================================================================
def get_reddit_posts(ticker: str, max_posts: int = 5) -> str:
    """
    Scrape Reddit mentions via DuckDuckGo search.
    """
    try:
        from duckduckgo_search import DDGS
        
        search_term = ticker.replace(".NS", "").replace(".BO", "")
        
        with DDGS() as ddgs:
            results = list(ddgs.text(
                f"{search_term} stock site:reddit.com",
                max_results=max_posts
            ))
        
        if not results:
            return f"No Reddit posts found for {search_term}."
        
        formatted = []
        for i, r in enumerate(results, 1):
            title = r.get('title', '')[:80]
            formatted.append(f"{i}. [Reddit] {title}")
        
        return "\n".join(formatted)
        
    except Exception as e:
        print(f"[SCRAPER ERROR] DuckDuckGo fallback: {str(e)}")
        return "Social media data unavailable (API limit reached)."


# ============================================================================
# 5. HISTORICAL DATA SCRAPER (Graph)
# ============================================================================
def get_historical_data(ticker: str, period: str = "1mo") -> Dict:
    """
    Fetch historical data for graphing.
    Priority: Twelve Data
    """
    ticker = ticker.upper()
    td_ticker = ticker.replace("-", "/")
    
    twelve_data_key = os.getenv("TWELVE_DATA_API_KEY")
    if twelve_data_key:
        try:
            from twelvedata import TDClient
            td = TDClient(apikey=twelve_data_key)
            
            # Fetch 30 days of daily data
            ts = td.time_series(symbol=td_ticker, interval="1day", outputsize=30).as_json()
            
            if isinstance(ts, list) and len(ts) > 0:
                # Twelve Data returns newest first; reverse for graphing
                values = ts[::-1] 
                points = [{"time": v["datetime"], "value": float(v["close"])} for v in values]
                return {"points": points, "source": "TwelveData"}
                
        except Exception as e:
            print(f"[Graph] Twelve Data failed for {td_ticker}: {e}")

    return {"points": [], "error": "No history found or TwelveData key missing"}


# ============================================================================
# 6. COMBINED DATA FETCHER
# ============================================================================
def fetch_all_data(ticker: str) -> Dict:
    """
    Fetch all data for a ticker in one call.
    Returns a comprehensive data dictionary.
    """
    return {
        "ticker": ticker.upper(),
        "timestamp": datetime.now().isoformat(),
        "price_data": get_stock_price(ticker),
        "graph_data": get_historical_data(ticker),
        "news": get_news(ticker),
        "social": get_reddit_posts(ticker)
    }


# ============================================================================
# EXPORTS
# ============================================================================
__all__ = [
    'get_stock_price',
    'get_historical_data',
    'get_news', 
    'get_reddit_posts',
    'fetch_all_data'
]
