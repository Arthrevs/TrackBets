"""
Flask API Server for TrackBets
Serves backend logic to React/Frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Import our backend logic
from backend.scrapers import get_stock_price, get_news, get_reddit_posts, get_twitter_sentiment
from backend.brain import FinancialAnalyst

# Init
app = Flask(__name__)
CORS(app) # Enable CORS for React
load_dotenv()

analyst = FinancialAnalyst()

@app.route('/api/analyze', methods=['GET'])
def analyze_stock():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker required"}), 400

    try:
        # 1. Parallel Fetching (Sequential here for simplicity, can async later)
        price_data = get_stock_price(ticker)
        news_data = get_news(ticker)
        reddit_data = get_reddit_posts(ticker)
        # twitter_data = get_twitter_sentiment(ticker) # Optional

        # 2. Prepare Context for AI
        context_str = f"""
        STOCK: {ticker}
        PRICE: {price_data.get('current')}
        NEWS HEADLINES: {[n['title'] for n in news_data]}
        SOCIAL POSTS: {[p['title'] for p in reddit_data]}
        """

        # 3. AI Analysis
        ai_result = analyst.analyze(context_str, "Investment Decision")

        # 4. Construct Response
        response = {
            "ticker": ticker,
            "market_data": {
                "price": price_data,
                "news": news_data,
                "social": reddit_data
            },
            "analysis": ai_result
        }
        
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "TrackBets API"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)
