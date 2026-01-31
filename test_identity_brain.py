import os
import sys
from dotenv import load_dotenv

# Add api directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.join(current_dir, 'api')
sys.path.insert(0, api_dir)

from backend.brain import FinancialAnalyst

# Load env vars
load_dotenv()

def test_identity():
    print("Testing FinancialAnalyst.get_ticker_identity...")
    analyst = FinancialAnalyst()
    
    # Test with a known ticker
    ticker = "ZOMATO.NS"
    print(f"Analyzing {ticker}...")
    result = analyst.get_ticker_identity(ticker)
    
    print("\nResult:")
    print(result)
    
    # Basic validation
    required_keys = ["overview", "currency_symbol", "currency_code"]
    missing = [k for k in required_keys if k not in result]
    
    if missing:
        print(f"\n❌ FAILED: Missing keys: {missing}")
    else:
        print("\n✅ SUCCESS: All keys present.")

if __name__ == "__main__":
    test_identity()
