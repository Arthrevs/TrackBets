"""
Brain module with Rule-Based Fallback & Retry Logic
"""

import os
import json
import time
from dotenv import load_dotenv
import google.generativeai as genai

def rule_based_verdict(market_data):
    """
    Fallback logic if AI fails:
    - BUY: Sentiment > 0.4 AND PE < 50
    - SELL: Sentiment < -0.2 OR PE > 100
    - WAIT: Otherwise
    """
    price = market_data.get('price', {})
    sentiment = market_data.get('sentiment', {}).get('overall_score', 0)
    pe_raw = price.get('pe', 0)
    
    # Clean PE
    try:
        pe = float(pe_raw)
    except:
        pe = 50 # Default middle ground

    if sentiment > 0.4 and pe < 50:
        return "BUY", ["Strong positive sentiment", "Attractive valuation"]
    elif sentiment < -0.2 or pe > 100:
        return "SELL", ["Negative sentiment trend", "Valuation concerns"]
    else:
        return "WAIT", ["Mixed indicators", "Fairly valued"]

def generate_flashcard(ticker: str, user_context: dict, market_data: dict, deep_analysis: dict) -> dict:
    
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    
    # Use Fallback if no key
    if not api_key:
        signal, reasons = rule_based_verdict(market_data)
        return {
            "verdict": {"signal": signal, "confidence": 50, "action": "Review Fundamentals (Fallback)"},
            "flashcard": {
                "title": f"Algorithm Signal: {signal}",
                "reasons": reasons + ["AI unavailable (Rule-based)"],
                "evidence": {"key_data_points": [f"Sentiment: {market_data.get('sentiment', {}).get('overall_score')}", f"PE: {market_data.get('price', {}).get('pe')}"]}
            },
            "ai_explanation": "Verdict generated using rule-based metrics due to missing AI key."
        }

    # Configure AI
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    context_str = f"""
    STOCK: {ticker}
    PRICE: {market_data.get('price', {}).get('current')}
    PE RATIO: {market_data.get('price', {}).get('pe')}
    SENTIMENT_SCORE: {market_data.get('sentiment', {}).get('overall_score')} (-1 to 1)
    
    NEWS: {[n['title'] for n in market_data.get('sentiment', {}).get('news', {}).get('items', [])]}
    DEEP DATA: {deep_analysis}
    """
    
    prompt = f"""
    Act as a hedge fund analyst.
    DATA: {context_str}
    
    TASK: Return VALID JSON verdict.
    {{
      "verdict": {{ "signal": "BUY|SELL|WAIT", "confidence": 0-100, "action": "..." }},
      "flashcard": {{ "title": "...", "reasons": ["...", "...", "..."], "evidence": {{ "key_data_points": ["..."] }} }},
      "ai_explanation": "..."
    }}
    """
    
    # Retry Logic (3 attempts)
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except:
            time.sleep(1)
            
    # Final Fallback after retries
    signal, reasons = rule_based_verdict(market_data)
    return {
        "verdict": {"signal": signal, "confidence": 40, "action": "Caution Recommended"},
        "flashcard": {
            "title": "AI Busy, Showing Rules",
            "reasons": reasons, 
            "evidence": {"key_data_points": ["AI Request Timed Out", "Using Logic Fallback"]}
        },
        "ai_explanation": "AI service unavailable. Falling back to logical analysis."
    }
<<<<<<< HEAD
=======

class FinancialAnalyst:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def analyze(self, context_str: str, query: str) -> dict:
        """
        Adapter method for unstructured text context
        """
        if not self.model:
            # Return dummy structure matching expectation
            return {
                "verdict": "WAIT",
                "reasons": ["API Key Missing", "Using Mock Fallback"]
            }

        prompt = f"""
        Act as a hedge fund analyst.
        CONTEXT: {context_str}
        USER QUERY: {query}
        
        TASK: Return VALID JSON.
        {{
          "verdict": "BUY|SELL|WAIT",
          "reasons": ["Reason 1", "Reason 2"]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except:
            return {
                "verdict": "WAIT",
                "reasons": ["AI Analysis Failed", "Try again later"]
            }
>>>>>>> Frontend
