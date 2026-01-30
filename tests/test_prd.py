import sys
import os
import json

# Add parent directory to path to import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.scrapers import fetch_stock_price, fetch_news_headlines
from backend.mock_data import get_zomato_static
from backend.brain import generate_flashcard

def test_scrapers():
    print("\n=== Testing Updated Scrapers ===")
    
    # 1. Stock Price
    print("Testing fetch_stock_price('ZOMATO.NS')...")
    data = fetch_stock_price('ZOMATO.NS')
    if "error" in data and not data.get('current'):
        print(f"❌ Failed: {data}")
    else:
        print(f"✅ Price Data: ₹{data.get('current')} | PE: {data.get('pe')} | Cap: {data.get('marketCap')}")

    # 2. News with VADER
    print("\nTesting fetch_news_headlines('Zomato')...")
    news = fetch_news_headlines('Zomato')
    if news and isinstance(news, list):
        print(f"✅ Fetched {len(news)} articles.")
        if len(news) > 0:
            n = news[0]
            print(f"   Sample: {n.get('title')[:50]}... | Sentiment: {n.get('sentiment_label')} ({n.get('sentiment_score')})")
    else:
        print(f"❌ Failed to fetch news or invalid format: {news}")

def test_mock_data():
    print("\n=== Testing Zomato Demo Data ===")
    data = get_zomato_static()
    if data.get('verdict', {}).get('signal') == 'WAIT':
        print("✅ Demo Data loaded correctly.")
        print(f"   Verdict: {data['verdict']['signal']}")
        print(f"   Reason: {data['flashcard']['reasons'][0]}")
    else:
        print("❌ Demo Data structure invalid")

if __name__ == "__main__":
    test_scrapers()
    test_mock_data()
    print("\n=== Verification Complete ===")
