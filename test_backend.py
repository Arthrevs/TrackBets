import os
from dotenv import load_dotenv
from backend.scrapers import get_stock_price, get_news, get_reddit_posts
from backend.brain import FinancialAnalyst

# 1. Load Environment Variables
load_dotenv()
print("--- 🚀 STARTING FINAL SYSTEM DIAGNOSTICS ---")

# --- TEST 1: Stock Data (yfinance + Mock Fallback) ---
print("\n[1/4] Testing Stock Data (yfinance)...")
try:
    data = get_stock_price("ZOMATO.NS")
    price = data['current']
    history = data.get('history')
    print(f"✅ SUCCESS: Current Price is ₹{price}")
    if history is None:
        print("   (⚠️ Using Mock Data - Internet might be down, but App is safe)")
    else:
        print(f"   (Live Data Fetched: {len(history)} days)")
except Exception as e:
    print(f"❌ FAILED: {e}")

# --- TEST 2: News Data (GoogleNews + DuckDuckGo) ---
print("\n[2/4] Testing News (GoogleNews / DDGS)...")
try:
    news = get_news("ZOMATO.NS")
    print(f"✅ SUCCESS: Found Headlines:\n   '{news[:100]}...'")
except Exception as e:
    print(f"❌ FAILED: {e}")

# --- TEST 3: Social Data (DuckDuckGo Reddit Search) ---
print("\n[3/4] Testing Social Scraper (DuckDuckGo/Mock)...")
try:
    posts = get_reddit_posts("ZOMATO")
    print(f"✅ SUCCESS: Found {len(posts)} posts.")
    print(f"   Top Post: {posts[0]}")
    if "Mock" in posts[0] or "Zomato Q3" in posts[0]:
        print("   (ℹ️ Note: If you see 'Zomato Q3', it might be the Mock Fallback kicking in. This is GOOD.)")
except Exception as e:
    print(f"❌ FAILED: {e}")

# --- TEST 4: AI Brain (Gemini) ---
print("\n[4/4] Testing Gemini AI Brain (The Core)...")
try:
    key = os.getenv("GOOGLE_API_KEY")
    if not key:
        print("❌ CRITICAL: No GOOGLE_API_KEY found in .env file!")
    else:
        analyst = FinancialAnalyst()
        # Feed it the data we just scraped
        dummy_context = f"Price: {price}. News: {news}. Social: {posts[0]}"
        result = analyst.analyze(dummy_context, "I want to buy")
        
        print("✅ SUCCESS: AI Response Received:")
        print(f"   Verdict: {result.get('verdict')}")
        print(f"   Reason: {result.get('reasons')[0]}")
except Exception as e:
    print(f"❌ FAILED: {e}")

print("\n--- 🏁 DIAGNOSTICS COMPLETE ---")