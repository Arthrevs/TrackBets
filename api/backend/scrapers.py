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
# ============================================================================
# ============================================================================
# 1. STOCK PRICE SCRAPER (yfinance + Twelve Data)
# ============================================================================
def get_stock_price(ticker: str) -> Dict:
    """
    Fetch current stock price with strict priority:
    1. yfinance (Real)
    2. Twelve Data (Real Backup)
    3. Realistic Mock (Last Resort)
    """
    ticker_upper = ticker.upper()
    is_indian = ".NS" in ticker_upper or ".BO" in ticker_upper

    # =========================================================
    # ATTEMPT 1: yfinance (Primary)
    # =========================================================
    yf_ticker = ticker_upper.replace("/", "-") # BTC/USD -> BTC-USD
    try:
        import yfinance as yf
        stock = yf.Ticker(yf_ticker)
        
        # Try .info first (sometimes faster/richer)
        try:
            info = stock.info
            if info and 'regularMarketPrice' in info and info['regularMarketPrice'] is not None:
                return _format_contract(info, source="yfinance")
        except:
            pass
            
        # Fallback to .history (more reliable for price)
        hist = stock.history(period="1d")
        if not hist.empty:
            current = float(hist['Close'].iloc[-1])
            prev = float(hist['Open'].iloc[-1]) # usage as approximation
            return {
                "price": round(current, 2),
                "change_percent": round(((current - prev)/prev)*100, 2),
                "is_up": current >= prev,
                "currency": "₹" if is_indian else "$",
                "name": yf_ticker,
                "market_cap": "N/A",
                "volume": int(hist['Volume'].iloc[-1]),
                "day_high": float(hist['High'].iloc[-1]),
                "day_low": float(hist['Low'].iloc[-1]),
                "52_week_high": "N/A",
                "52_week_low": "N/A",
                "source": "yfinance"
            }
            
    except Exception as e:
        print(f"[SCRAPER] yfinance failed for {yf_ticker}: {e}")

    # =========================================================
    # ATTEMPT 2: Twelve Data (Backup)
    # =========================================================
    td_ticker = ticker_upper.replace("-", "/") # BTC-USD -> BTC/USD
    twelve_data_key = os.getenv("TWELVE_DATA_API_KEY")
    
    if twelve_data_key:
        print(f"[SCRAPER] Trying Twelve Data backup for {td_ticker}...")
        td_data = get_price_twelve_data(td_ticker, twelve_data_key)
        if td_data:
            return td_data

    # =========================================================
    # ATTEMPT 3: Emergency Mock (Realistic Values)
    # =========================================================
    print(f"[SCRAPER] All APIs failed. Generating realistic mock for {ticker_upper}...")
    return _get_realistic_mock(ticker_upper, is_indian)


def _format_contract(info: Dict, source: str) -> Dict:
    """Helper to format yfinance dict to our standard"""
    price = info.get('currentPrice') or info.get('regularMarketPrice')
    prev = info.get('previousClose') or info.get('regularMarketPreviousClose')
    
    change_pct = 0.0
    if price and prev:
        change_pct = ((price - prev) / prev) * 100
        
    return {
        "price": round(price, 2),
        "change_percent": round(change_pct, 2),
        "is_up": change_pct >= 0,
        "currency": info.get('currency', '$'),
        "name": info.get('shortName') or info.get('longName') or "Unknown",
        "market_cap": info.get('marketCap', "N/A"),
        "volume": info.get('volume', "N/A"),
        "day_high": info.get('dayHigh', "N/A"),
        "day_low": info.get('dayLow', "N/A"),
        "52_week_high": info.get('fiftyTwoWeekHigh', "N/A"),
        "52_week_low": info.get('fiftyTwoWeekLow', "N/A"),
        "source": source
    }


def _get_realistic_mock(ticker: str, is_indian: bool) -> Dict:
    """Generate realistic hardcoded values for emergency fallback"""
    import random
    
    base_price = 100.0
    
    # Specific realistic defaults
    if "BTC" in ticker:
        base_price = 98250.00
    elif "ETH" in ticker:
        base_price = 2750.00
    elif "SOL" in ticker:
        base_price = 145.00
    elif "ZOMATO" in ticker or "ETERNAL" in ticker:
        base_price = 265.50
    elif "RELIANCE" in ticker:
        base_price = 2950.00
    elif "TATA" in ticker:
        base_price = 1050.00
    
    # Add small random fluctuation so it doesn't look completely static
    variation = random.uniform(-0.5, 0.5) # +/- 0.5%
    final_price = base_price * (1 + variation/100)
    
    change_pct = random.uniform(-1.5, 2.5)
    
    return {
        "price": round(final_price, 2),
        "change_percent": round(change_pct, 2),
        "is_up": change_pct >= 0,
        "currency": "₹" if is_indian else "$",
        "name": ticker,
        "market_cap": "MOCK",
        "volume": "MOCK",
        "day_high": round(final_price * 1.01, 2),
        "day_low": round(final_price * 0.99, 2),
        "52_week_high": round(final_price * 1.2, 2),
        "52_week_low": round(final_price * 0.8, 2),
        "source": "Emergency Mock"
    }


def get_price_twelve_data(ticker: str, api_key: str) -> Optional[Dict]:
    """Fetch real-time price from Twelve Data API."""
    try:
        import requests
        url = f"https://api.twelvedata.com/quote?symbol={ticker}&apikey={api_key}"
        response = requests.get(url, timeout=5)
        
        try:
            data = response.json()
        except:
            return None
        
        if "price" not in data:
            return None
            
        current_price = float(data['price'])
        change_percent = float(data.get('percent_change', 0))
        
        return {
            "price": round(current_price, 2),
            "change_percent": round(change_percent, 2),
            "is_up": change_percent >= 0,
            "currency": "$", 
            "name": data.get('name', ticker),
            "market_cap": "N/A", 
            "volume": data.get('volume'),
            "day_high": data.get('high'),
            "day_low": data.get('low'),
            "52_week_high": data.get('fifty_two_week', {}).get('high', "N/A"),
            "52_week_low": data.get('fifty_two_week', {}).get('low', "N/A"),
            "source": "TwelveData"
        }
    except Exception as e:
        print(f"[TwelveData] Exception: {e}")
        return None


# ============================================================================
# 2. NEWS SCRAPER (GoogleNews)
# ============================================================================
def get_news(ticker: str, max_results: int = 5) -> str:
    """
    Fetch top news headlines for a stock ticker.
    Returns a formatted string of headlines.
    """
    try:
        from GoogleNews import GoogleNews
        
        # Clean ticker for search
        search_term = ticker.replace(".NS", "").replace(".BO", "").replace(".NYSE", "")
        
        # Initialize GoogleNews
        gn = GoogleNews(lang='en', period='7d')
        gn.clear()
        gn.search(f"{search_term} stock")
        
        results = gn.results()[:max_results]
        
        if not results:
            return f"No recent news found for {search_term}."
        
        # Format headlines
        headlines = []
        for i, article in enumerate(results, 1):
            title = article.get('title', 'No title')
            source = article.get('media', 'Unknown')
            headlines.append(f"{i}. [{source}] {title}")
        
        return "\n".join(headlines)
        
    except Exception as e:
        print(f"[SCRAPER ERROR] get_news({ticker}): {str(e)}")
        return f"News unavailable for {ticker}. Error: {str(e)}"


# ============================================================================
# 3. REDDIT/SOCIAL SCRAPER (praw)
# ============================================================================
def get_reddit_posts(ticker: str, max_posts: int = 5) -> str:
    """
    Fetch top Reddit posts about a stock from relevant subreddits.
    Returns a formatted string of posts with sentiment hints.
    """
    try:
        import praw
        
        # Check for Reddit API credentials
        client_id = os.getenv("REDDIT_CLIENT_ID")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        user_agent = os.getenv("REDDIT_USER_AGENT", "TrackBets/1.0")
        
        if not client_id or not client_secret:
            # Fallback: Use DuckDuckGo search for Reddit posts
            return _get_reddit_via_duckduckgo(ticker)
        
        # Initialize Reddit client
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        
        # Clean ticker
        search_term = ticker.replace(".NS", "").replace(".BO", "")
        
        # Search relevant subreddits
        subreddits = ["IndianStreetBets", "wallstreetbets", "stocks", "investing"]
        posts = []
        
        for sub_name in subreddits:
            try:
                subreddit = reddit.subreddit(sub_name)
                for post in subreddit.search(search_term, limit=2, time_filter="week"):
                    sentiment = _quick_sentiment(post.title + " " + (post.selftext[:200] if post.selftext else ""))
                    posts.append({
                        "title": post.title[:100],
                        "subreddit": sub_name,
                        "upvotes": post.score,
                        "sentiment": sentiment
                    })
            except:
                continue
        
        if not posts:
            return f"No Reddit discussions found for {search_term} in the past week."
        
        # Sort by upvotes and format
        posts = sorted(posts, key=lambda x: x['upvotes'], reverse=True)[:max_posts]
        
        formatted = []
        for i, p in enumerate(posts, 1):
            formatted.append(f"{i}. [r/{p['subreddit']}] ({p['sentiment']}) {p['title']} | ⬆️ {p['upvotes']}")
        
        return "\n".join(formatted)
        
    except Exception as e:
        print(f"[SCRAPER ERROR] get_reddit_posts({ticker}): {str(e)}")
        return _get_reddit_via_duckduckgo(ticker)


def _get_reddit_via_duckduckgo(ticker: str) -> str:
    """
    Fallback: Scrape Reddit mentions via DuckDuckGo search.
    """
    try:
        from duckduckgo_search import DDGS
        
        search_term = ticker.replace(".NS", "").replace(".BO", "")
        
        with DDGS() as ddgs:
            results = list(ddgs.text(
                f"{search_term} stock site:reddit.com",
                max_results=5
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


def _quick_sentiment(text: str) -> str:
    """
    Quick rule-based sentiment detection.
    Returns: 🟢 Bullish, 🔴 Bearish, 🟡 Neutral
    """
    text = text.lower()
    
    bullish_words = ['buy', 'bullish', 'moon', 'rocket', 'undervalued', 'long', 'calls', 'breakout', 'strong', 'growth']
    bearish_words = ['sell', 'bearish', 'crash', 'puts', 'overvalued', 'short', 'dump', 'avoid', 'weak', 'decline']
    
    bullish_count = sum(1 for word in bullish_words if word in text)
    bearish_count = sum(1 for word in bearish_words if word in text)
    
    if bullish_count > bearish_count:
        return "🟢 Bullish"
    elif bearish_count > bullish_count:
        return "🔴 Bearish"
    return "🟡 Neutral"


# ============================================================================
# 5. HISTORICAL DATA SCRAPER (Graph)
# ============================================================================
def get_historical_data(ticker: str, period: str = "1mo") -> Dict:
    """
    Fetch historical data for graphing.
    Priority: Twelve Data -> yfinance
    """
    ticker = ticker.upper()
    
    # Format Tickers
    yf_ticker = ticker.replace("/", "-")
    td_ticker = ticker.replace("-", "/")
    
    # 1. Try Twelve Data
    twelve_data_key = os.getenv("TWELVE_DATA_API_KEY")
    if twelve_data_key:
        try:
            import requests
            # interval: 1day for 1mo, maybe 1h for shorter periods? logic can be enhanced.
            # outputsize=30 for roughly 1 month of trading days
            url = f"https://api.twelvedata.com/time_series?symbol={td_ticker}&interval=1day&outputsize=30&apikey={twelve_data_key}"
            response = requests.get(url, timeout=5)
            data = response.json()
            
            if "values" in data:
                # Twelve Data returns newest first. We usually want oldest first for graphs.
                values = data["values"][::-1] 
                points = [{"time": v["datetime"], "value": float(v["close"])} for v in values]
                return {"points": points, "source": "TwelveData"}
                
        except Exception as e:
            print(f"[Graph] Twelve Data failed for {td_ticker}: {e}")

    # 2. Fallback: yfinance
    try:
        import yfinance as yf
        stock = yf.Ticker(yf_ticker)
        # period="1mo" is standard
        hist = stock.history(period=period)
        
        if hist.empty:
            return {"points": [], "error": "No history found"}
            
        points = []
        for date, row in hist.iterrows():
            points.append({
                "time": date.strftime("%Y-%m-%d"),
                "value": round(float(row["Close"]), 2)
            })
            
        return {"points": points, "source": "yfinance"}
        
    except Exception as e:
        print(f"[Graph] yfinance failed for {yf_ticker}: {e}")
        return {"points": [], "error": str(e)}


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
