"""
Mock Data module for KnowYourBets
Contains static demo data matching the new PRD structure
"""

def get_zomato_static():
    """Zomato Demo Data - Perfect Scenario"""
    return {
        "verdict": {
            "signal": "WAIT",
            "confidence": 78,
            "action": "Set alert for ₹135"
        },
        "flashcard": {
            "title": "Strong Fundamentals, High Valuation",
            "reasons": [
                "Dominant market share (55%) in food delivery duopoly",
                "Trading at premium valuation (PE: 120 vs Industry: 65)",
                "Q3 revenue up 40%, but profit booking likely soon"
            ],
            "evidence": {
                "key_data_points": [
                    "Revenue Growth: 40% YoY (Source: Q3 Report)",
                    "Social Sentiment: 85/100 (Bullish on Reddit)",
                    "RSI: 75 (Technically Overbought)"
                ]
            }
        },
        "ai_explanation": "Zomato is executing perfectly with EBITDA profitability, but the stock has run up 20% in the last month. The risk-reward ratio is currently unfavorable for new entries. Wait for a dip to ₹135-140 levels before accumulating.",
        "deep_analysis_preview": {
            "pdf_available": True,
            "youtube_available": True
        }
    }

def get_tcs_static():
    """TCS Demo Data - Bearish/Wait Scenario"""
    return {
        "verdict": {
            "signal": "WAIT",
            "confidence": 65,
            "action": "Monitor US Fed Rates"
        },
        "flashcard": {
            "title": "IT Sector Headwinds Persist",
            "reasons": [
                "Q3 Guidance missed estimates by 2%",
                "US client discretionary spending remains weak",
                "Attrition rates normalized to 11%"
            ],
            "evidence": {
                "key_data_points": [
                    "Deal TCV: $8.1B (Lowest in 4 quarters)",
                    "Social Sentiment: 42/100 (Bearish on Forum)",
                    "PE Ratio: 28.4 (Historical Avg: 25)"
                ]
            }
        },
        "ai_explanation": "TCS remains a fundamentally strong defensive play, but short-term growth is capped by US recession fears. Current valuations don't offer a margin of safety. Accumulate only on dips below ₹3800.",
        "deep_analysis_preview": {
            "pdf_available": True,
            "youtube_available": False
        }
    }

def get_mock_stock_price(ticker):
    """Fallback stock data for demo robustness"""
    ticker = ticker.upper()
    if ticker == "ZOMATO.NS":
        return {
            "current": 145.50,
            "change": 3.50,
            "changePercent": 2.46,
            "volume": 12450000,
            "marketCap": "₹1,28,450 Cr",
            "pe": 120.5,
            "history": []
        }
    elif ticker == "TCS.NS":
        return {
            "current": 3920.50,
            "change": -45.20,
            "changePercent": -1.14,
            "volume": 1850000,
            "marketCap": "₹14,25,680 Cr",
            "pe": 28.4,
            "history": []
        }
    elif ticker == "INFY.NS":
        return {
            "current": 1456.30,
            "change": 28.50,
            "changePercent": 2.00,
            "volume": 4250000,
            "marketCap": "₹6,08,920 Cr",
            "pe": 25.6,
            "history": []
        }
    return None
