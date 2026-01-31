"""
TrackBets Backend - AI Brain Module
=====================================
Google Gemini-powered financial analysis with strict JSON output.
"""

import os
import json
import time
from typing import Dict, Optional
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()


# ============================================================================
# RULE-BASED FALLBACK
# ============================================================================
def rule_based_verdict(market_data: dict) -> tuple:
    """Fallback verdict using simple rules when AI is unavailable."""
    sentiment = market_data.get('sentiment', {}).get('overall_score', 0)
    pe = market_data.get('price', {}).get('pe', 50)
    
    if sentiment > 0.4 and pe < 50:
        return "BUY", ["Strong positive sentiment", "Attractive valuation"]
    elif sentiment < -0.2 or pe > 100:
        return "SELL", ["Negative sentiment trend", "Valuation concerns"]
    else:
        return "WAIT", ["Mixed indicators", "Fairly valued"]


def generate_flashcard(ticker: str, user_context: dict, market_data: dict, deep_analysis: dict) -> dict:
    """Generate a flashcard with AI analysis or fallback."""
    
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

    # Configure Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
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


# ============================================================================
# FINANCIAL ANALYST CLASS
# ============================================================================
class FinancialAnalyst:
    """
    AI-powered financial analyst using Google Gemini 2.5 Flash.
    Analyzes stock data and returns structured investment verdicts.
    """
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.model = None
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-2.5-flash")
        else:
            print("[BRAIN] Warning: GOOGLE_API_KEY not found in environment")

    def get_ticker_identity(self, ticker: str) -> Dict:
        """
        Get a Gen Z style identity/overview for the stock.
        """
        if not self.model:
            return {
                "overview": "API Key missing, can't roast this stock.",
                "currency_symbol": "$",
                "currency_code": "USD"
            }
            
        system_prompt = f"""You are a financial backend API. You MUST return data in valid, parseable JSON format only. Do not add markdown formatting like ```json or ```. Do not include any conversational text outside the JSON object.
Analyze the stock ticker: '{ticker}'."""

        user_prompt = f"""Return a JSON object with exactly these 3 keys:
1. "overview": A 2-sentence summary of the company's current market sentiment. Be slightly witty or "gen z" style if the stock is volatile.
2. "currency_symbol": The correct currency symbol (e.g. ₹, $, €, £, ¥).
3. "currency_code": The 3-letter ISO code (e.g. INR, USD, JPY).

Example Output:
{{
    "overview": "Zomato is rallying hard on profitability news, but high valuation makes conservative investors sweat.",
    "currency_symbol": "₹",
    "currency_code": "INR"
}}

Target Ticker: {ticker}"""

        try:
            response = self.model.generate_content(f"{system_prompt}\n\n{user_prompt}")
            return self._parse_response(response.text)
            
        except Exception as e:
            print(f"[BRAIN] Identity error: {str(e)}")
            return {
                "overview": f"AI died trying to analyze {ticker}.",
                "currency_symbol": "?",
                "currency_code": "UNK"
            }

    def search_ticker(self, query: str) -> Dict:
        """
        Identify the correct stock ticker from a user search query.
        """
        if not self.model:
            return {"error": "AI not configured"}
            
        system_prompt = """You are a smart Stock Ticker Resolver for the NSE (India). Your goal is to convert company names into Yahoo Finance tickers, strictly favoring '.NS' for Indian stocks.

        CORE LOGIC:
        1. **The "Update" Rule (Rebrands):**
           - **Zomato** -> "ETERNAL.NS" (Name changed to Eternal Ltd).
           
        2. **The "Literal" Rule (Direct Matches):**
           - If the company name is unique/specific (e.g., "Wipro", "Paytm", "Cipla"), preserve it + .NS.
           - Example: "Wipro" -> "WIPRO.NS"
           
        3. **The "Translation" Rule (Ambiguous Brands):**
           - "Tata" -> "TATAMOTORS.NS"
           - "Reliance" -> "RELIANCE.NS"
           - "Adani" -> "ADANIENT.NS"
           - "Mahindra" -> "M&M.NS"
           - "HDFC" -> "HDFCBANK.NS"

        4. **US/Global Rule:**
           - For US companies, return the standard ticker (e.g., "AAPL", "TSLA").

        Return valid JSON only.
        """
        
        user_prompt = f"""Search Query: "{query}"
        
        Return JSON:
        {{
            "ticker": "Exact Ticker Symbol (e.g. ETERNAL.NS)",
            "name": "Official Company Name",
            "currency": "INR" or "USD",
            "exchange": "NSE" or "NASDAQ" etc
        }}"""
        
        try:
            response = self.model.generate_content(f"{system_prompt}\n\n{user_prompt}")
            return self._parse_response(response.text)
        except Exception as e:
            print(f"[BRAIN] Search error: {e}")
            return {"error": "Search failed"}
    
    def analyze(self, context: str, analysis_type: str = "Investment Decision") -> Dict:
        """
        Analyze financial data and return structured verdict.
        
        Args:
            context: Combined string of price, news, and social data
            analysis_type: Type of analysis requested
            
        Returns:
            Dict with verdict, confidence, reasons, and explanation
        """
        if not self.model:
            return self._fallback_response("AI model not available - GOOGLE_API_KEY missing")
        
        try:
            # System prompt enforcing strict JSON output
            system_prompt = """You are a senior financial analyst at a prestigious hedge fund. 
You analyze stocks using fundamental analysis, technical indicators, news sentiment, and social media trends.

CRITICAL INSTRUCTION: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanation outside the JSON.

Your response must be a JSON object with this EXACT structure:
{
    "verdict": "BUY" or "SELL" or "HOLD",
    "confidence": <integer 0-100>,
    "reasons": ["Reason 1", "Reason 2", "Reason 3"],
    "ai_explanation": "A concise 2-3 sentence summary of your analysis.",
    "risk_level": "LOW" or "MEDIUM" or "HIGH",
    "target_price": <number or null>,
    "timeframe": "Short-term" or "Medium-term" or "Long-term"
}

Guidelines:
- BUY: Strong bullish signals, undervalued, positive sentiment > 60%
- SELL: Bearish signals, overvalued, negative news, declining metrics
- HOLD: Mixed signals, wait for clarity, neutral sentiment
- Confidence: How sure you are (70+ is high conviction)
- Be specific in reasons, cite actual data points
- Be concise and punchy in the explanation"""

            # User prompt with the actual data
            user_prompt = f"""Analyze this stock and provide your verdict:

{context}

Remember: Respond with ONLY the JSON object, no other text."""

            # Generate response using Gemini
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = self.model.generate_content(full_prompt)
            
            # Parse JSON from response
            return self._parse_response(response.text)
            
        except Exception as e:
            print(f"[BRAIN] Analysis error: {str(e)}")
            return self._fallback_response(str(e))
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse Gemini response and extract JSON."""
        try:
            # Clean the response (remove markdown if present)
            text = response_text.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            text = text.strip()
            
            # Parse JSON
            result = json.loads(text)
            
            # Validate required fields
            required_fields = ["verdict", "confidence", "reasons", "ai_explanation"]
            for field in required_fields:
                if field not in result:
                    result[field] = self._get_default_value(field)
            
            # Normalize verdict
            if "verdict" in result and isinstance(result["verdict"], str):
                result["verdict"] = result["verdict"].upper()
                if result["verdict"] not in ["BUY", "SELL", "HOLD"]:
                    result["verdict"] = "HOLD"
            
            # Ensure confidence is integer 0-100
            if "confidence" in result:
                result["confidence"] = max(0, min(100, int(result["confidence"])))
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"[BRAIN] JSON parse error: {str(e)}")
            print(f"[BRAIN] Raw response: {response_text[:500]}")
            return self._fallback_response("Failed to parse AI response")
    
    def _get_default_value(self, field: str):
        """Get default value for missing fields."""
        defaults = {
            "verdict": "HOLD",
            "confidence": 50,
            "reasons": ["Analysis incomplete", "Insufficient data", "Manual review recommended"],
            "ai_explanation": "Unable to generate complete analysis. Please review the data manually.",
            "risk_level": "MEDIUM",
            "target_price": None,
            "timeframe": "Medium-term"
        }
        return defaults.get(field)
    
    def _fallback_response(self, error_msg: str) -> Dict:
        """Return a safe fallback response when AI fails."""
        return {
            "verdict": "HOLD",
            "confidence": 50,
            "reasons": [
                "AI analysis temporarily unavailable",
                "Manual review recommended",
                f"Error: {error_msg[:100]}"
            ],
            "ai_explanation": "The AI analysis service encountered an issue. Based on available data, we recommend a neutral HOLD position until further analysis can be completed.",
            "risk_level": "MEDIUM",
            "target_price": None,
            "timeframe": "Medium-term",
            "error": error_msg
        }


# ============================================================================
# QUICK ANALYSIS FUNCTION (for simple use cases)
# ============================================================================
def quick_analyze(ticker: str, price_data: Dict, news: str, social: str) -> Dict:
    """
    Quick analysis function that combines all data and runs through AI.
    """
    analyst = FinancialAnalyst()
    
    # Build context string
    currency = price_data.get("currency", "$")
    price = price_data.get("price", "N/A")
    change = price_data.get("change_percent", 0)
    
    context = f"""
STOCK ANALYSIS REQUEST
======================
Ticker: {ticker}
Current Price: {currency}{price}
Daily Change: {change}%

RECENT NEWS:
{news}

SOCIAL SENTIMENT (Reddit/Twitter):
{social}

Additional Data:
- Market Cap: {price_data.get('market_cap', 'N/A')}
- 52-Week High: {price_data.get('52_week_high', 'N/A')}
- 52-Week Low: {price_data.get('52_week_low', 'N/A')}
- Volume: {price_data.get('volume', 'N/A')}
"""
    
    return analyst.analyze(context)


# ============================================================================
# EXPORTS
# ============================================================================
__all__ = ['FinancialAnalyst', 'quick_analyze', 'generate_flashcard', 'rule_based_verdict']
