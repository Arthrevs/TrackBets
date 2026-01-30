import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.scrapers import get_stock_price, get_aggregated_sentiment
from backend.brain import rule_based_verdict

def test_full_stack():
    print("=== Testing Full Stack Logic ===")
    
    # 1. Crash-Proof Price
    print("\n1. Stock Price (Crash Proof)...")
    try:
        price = get_stock_price("ZOMATO.NS")
        print(f"   ✅ Source: {price.get('source')}")
        print(f"   ✅ Price: {price.get('current')}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        
    # 2. Weighted Sentiment
    print("\n2. Aggregated Sentiment (VADER)...")
    try:
        sent = get_aggregated_sentiment("ZOMATO.NS")
        print(f"   ✅ Overall Score: {sent.get('overall_score')}")
        print(f"   ✅ News Items: {len(sent.get('news', []))}")
        print(f"   ✅ News Sample: {sent.get('news')[0]['title']} (Score: {sent.get('news')[0]['score']})" if sent.get('news') else "   ⚠️ No news")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        
    # 3. Rule-Based Brain
    print("\n3. Brain Logic (Rule override)...")
    mock_market = {
        "price": {"pe": 20},
        "sentiment": {"overall_score": 0.8} # Strong buy signal
    }
    sig, reas = rule_based_verdict(mock_market)
    print(f"   ✅ Input: PE=20, Sent=0.8 -> Verdict: {sig}")
    if sig == "BUY":
        print("   ✅ Logic verified: Correctly identified BUY condition.")
    else:
        print("   ❌ Logic failed: Expected BUY")

if __name__ == "__main__":
    test_full_stack()
