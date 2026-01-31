import streamlit as st
import time
import os
from dotenv import load_dotenv

# --- BACKEND IMPORTS (The Bridge) ---
# We use the explicit getters we built in scrapers.py
from backend.scrapers import get_stock_price, get_news, get_reddit_posts
# We use the new Class we built in brain.py
from backend.brain import FinancialAnalyst

# Load Environment
load_dotenv()

# --- 1. CONFIG & CSS (The Lando Aesthetic) ---
st.set_page_config(
    page_title="TrackBets | High-Performance Finance",
    page_icon="🏎️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

CSS_STYLES = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Roboto+Condensed:wght@700&display=swap');

.stApp { background-color: #050505 !important; font-family: 'Inter', sans-serif; color: #FFFFFF; }
header, footer, #MainMenu {visibility: hidden !important;}

h1, h2, h3 { font-family: 'Roboto Condensed', sans-serif !important; text-transform: uppercase; }

/* Input Styling */
div[data-testid="stTextInput"] input {
    background-color: #0A0A0A !important;
    color: #CCFF00 !important;
    border: 1px solid #333 !important;
    font-family: 'JetBrains Mono', monospace;
}

/* Flashcard Styling */
.flashcard {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 12px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    margin-top: 20px;
}
.flashcard-BUY { border-left: 4px solid #CCFF00; box-shadow: 0 0 20px rgba(204, 255, 0, 0.1); }
.flashcard-SELL { border-left: 4px solid #FF3B30; box-shadow: 0 0 20px rgba(255, 59, 48, 0.1); }
.flashcard-HOLD { border-left: 4px solid #FFCC00; }

/* Metrics */
.metric-value { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 700; }
.text-green { color: #CCFF00; }
.text-red { color: #FF3B30; }
</style>
"""
st.markdown(CSS_STYLES, unsafe_allow_html=True)

# --- 2. LOGIC FUNCTIONS ---

def render_result(ticker, price, verdict_data):
    """Renders the final analysis card"""
    verdict = verdict_data.get('verdict', 'HOLD')
    confidence = verdict_data.get('confidence', 50)
    reasons = verdict_data.get('reasons', [])
    
    # CSS Classes
    card_class = f"flashcard-{verdict}"
    color_class = "text-green" if verdict == "BUY" else "text-red" if verdict == "SELL" else "text-yellow"

    # HTML Component
    st.markdown(f"""
    <div class="flashcard {card_class}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1 style="margin:0;">{ticker.upper()}</h1>
            <h2 class="{color_class}" style="font-size: 2.5rem;">{verdict}</h2>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div>
                <span style="color:#888; font-size:0.8rem;">CURRENT PRICE</span>
                <div class="metric-value">₹{price}</div>
            </div>
            <div>
                <span style="color:#888; font-size:0.8rem;">AI CONFIDENCE</span>
                <div class="metric-value">{confidence}%</div>
            </div>
        </div>

        <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 15px;">
            <span style="color:#888; font-size:0.8rem;">KEY DRIVERS</span>
            <ul style="margin-top: 10px; line-height: 1.6;">
                {''.join([f'<li>{r}</li>' for r in reasons])}
            </ul>
        </div>
    </div>
    """, unsafe_allow_html=True)


# --- 3. MAIN APP LAYOUT ---

# Title
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    st.markdown("<h1 style='text-align: center; margin-bottom: 0px;'>TRACK<span style='color:#CCFF00'>BETS</span></h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #888; font-family:monospace;'>// RETAIL SENTIMENT ANALYZER v2.0</p>", unsafe_allow_html=True)

# Search Bar
ticker_input = st.text_input("", placeholder="Enter Ticker (e.g. ZOMATO.NS, TATAMOTORS.NS)", label_visibility="collapsed")

# Analyze Button
if st.button("RUN ANALYSIS 🚀", type="primary", use_container_width=True):
    if not ticker_input:
        st.warning("⚠️ Please enter a ticker symbol")
    else:
        with st.status("🔍 Scanning Market Data...", expanded=True) as status:
            
            # 1. Price
            st.write("📈 Fetching Live Prices...")
            price, history = get_stock_price(ticker_input)
            
            # 2. News
            st.write("📰 Aggregating Global News...")
            news_text = get_news(ticker_input)
            
            # 3. Social
            st.write("🗣️ Analyzing Reddit Sentiment...")
            social_text = get_reddit_posts(ticker_input)
            
            # 4. Brain
            st.write("🧠 Feeding Neural Network...")
            analyst = FinancialAnalyst()
            
            # Combine Context
            full_context = f"Price: {price}. News: {news_text}. Social Sentiment: {social_text}"
            result = analyst.analyze(full_context, "Investment Decision")
            
            status.update(label="Analysis Complete!", state="complete", expanded=False)
            
        # 5. Render
        render_result(ticker_input, price, result)