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
# 1. STOCK PRICE SCRAPER (yfinance)
# ============================================================================
def get_stock_price(ticker: str) -> Dict:
    """
    Fetch current stock price and metadata using yfinance.
    Returns dict with price, change, currency, etc.
    """
    try:
        import yfinance as yf
        
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Get current price
        current_price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('previousClose')
        
        if current_price is None:
            # Try getting from history
            hist = stock.history(period="1d")
            if not hist.empty:
                current_price = round(hist['Close'].iloc[-1], 2)
            else:
                return {"error": "No price data available", "price": None}
        
        # Calculate change percentage
        prev_close = info.get('previousClose') or info.get('regularMarketPreviousClose')
        change_percent = 0.0
        if prev_close and current_price:
            change_percent = round(((current_price - prev_close) / prev_close) * 100, 2)
        
        # Determine currency
        currency = "₹" if (".NS" in ticker.upper() or ".BO" in ticker.upper()) else "$"
        
        return {
            "price": round(float(current_price), 2),
            "change_percent": change_percent,
            "is_up": change_percent >= 0,
            "currency": currency,
            "name": info.get('shortName') or info.get('longName') or ticker,
            "market_cap": info.get('marketCap'),
            "volume": info.get('volume'),
            "day_high": info.get('dayHigh'),
            "day_low": info.get('dayLow'),
            "52_week_high": info.get('fiftyTwoWeekHigh'),
            "52_week_low": info.get('fiftyTwoWeekLow'),
        }
        
    except Exception as e:
        print(f"[SCRAPER ERROR] get_stock_price({ticker}): {str(e)}")
        return {
            "error": str(e),
            "price": None,
            "currency": "₹" if (".NS" in ticker.upper() or ".BO" in ticker.upper()) else "$"
        }


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
# 4. COMBINED DATA FETCHER
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
        "news": get_news(ticker),
        "social": get_reddit_posts(ticker)
    }


# ============================================================================
# EXPORTS
# ============================================================================
__all__ = [
    'get_stock_price',
    'get_news', 
    'get_reddit_posts',
    'fetch_all_data'
]
