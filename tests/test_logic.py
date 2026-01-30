import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.scrapers import fetch_aggregated_sentiment
from backend.brain import rule_based_verdict

def test_new_logic():
    print("Testing Weighted Sentiment (Aggregate)...")
    # This might fail without API keys if not careful, but logic should return 0 structure
    sent = fetch_aggregated_sentiment("Zomato") # Logic will try
    print(f"Sentiment Structure: {sent.keys()}")
    print(f"Overall Score: {sent.get('overall_score')}")
    
    print("\nTesting Rule-Based Fallback...")
    # Case 1: Strong Buy Signal
    mock_market_buy = {
        "price": {"pe": 20},
        "sentiment": {"overall_score": 0.6}
    }
    sig, reas = rule_based_verdict(mock_market_buy)
    print(f"Case BUY -> Signal: {sig} (Expected BUY)")
    
    # Case 2: Strong Sell Signal
    mock_market_sell = {
        "price": {"pe": 150},
        "sentiment": {"overall_score": -0.5}
    }
    sig2, reas2 = rule_based_verdict(mock_market_sell)
    print(f"Case SELL -> Signal: {sig2} (Expected SELL)")

if __name__ == "__main__":
    test_new_logic()
