import traceback
import sys
import os

# Ensure we can import backend
sys.path.append(os.getcwd())

print("--- DEBUG START ---")

print("1. Importing backend.scrapers...")
try:
    import backend.scrapers
    print("✅ backend.scrapers imported successfully")
except Exception:
    print("❌ FAILED to import backend.scrapers")
    traceback.print_exc()

print("\n2. Importing backend.brain...")
try:
    import backend.brain
    print("✅ backend.brain imported successfully")
except Exception:
    print("❌ FAILED to import backend.brain")
    traceback.print_exc()

print("\n3. Importing FinancialAnalyst from backend.brain...")
try:
    from backend.brain import FinancialAnalyst
    print("✅ FinancialAnalyst imported successfully")
except Exception:
    print("❌ FAILED to import FinancialAnalyst")
    traceback.print_exc()
