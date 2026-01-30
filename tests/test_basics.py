import sys
import os

# Add parent directory to path to import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.scrapers import get_stock_data, get_news
from backend.brain import AnalystAI

def test_stock_data():
    print("Testing get_stock_data('ZOMATO.NS')...")
    data = get_stock_data('ZOMATO.NS')
    if "error" in data:
        print(f"❌ Failed: {data['error']}")
    else:
        print(f"✅ Success! Fetched data for {data.get('name', 'Unknown')}")
        print(f"   Price: {data.get('current_price')}")

def test_news():
    print("\nTesting get_news('Zomato')...")
    news = get_news('Zomato', num_results=3)
    if news and "error" in news[0]:
        print(f"❌ Failed: {news[0]['error']}")
    else:
        print(f"✅ Success! Fetched {len(news)} articles.")
        if news:
            print(f"   Latest: {news[0]['title']}")

def test_brain_init():
    print("\nTesting AnalystAI initialization...")
    try:
        ai = AnalystAI()
        print("✅ AnalystAI initialized successfully (checking for API key warnings above is expected if not set).")
    except Exception as e:
        print(f"❌ Failed to initialize AnalystAI: {e}")

if __name__ == "__main__":
    print("=== KnowYourBets Basic Verification ===\n")
    test_stock_data()
    test_news()
    test_brain_init()
    print("\n=== Verification Complete ===")
