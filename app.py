"""
KnowYourBets - Advanced Logic Version
"""

import streamlit as st
import pandas as pd
from backend.scrapers import fetch_stock_price, fetch_aggregated_sentiment, extract_pdf_context, extract_video_context
from backend.brain import generate_flashcard
from backend.mock_data import get_zomato_static, get_tcs_static

st.set_page_config(page_title="KnowYourBets", page_icon="📈", layout="wide", initial_sidebar_state="collapsed")

# CSS
st.markdown("""
<style>
    .verdict-box { padding: 20px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;}
    .bg-BUY { background: linear-gradient(135deg, #28a745, #20c997); }
    .bg-SELL { background: linear-gradient(135deg, #dc3545, #f86d7d); }
    .bg-WAIT { background: linear-gradient(135deg, #ffc107, #fd7e14); }
</style>
""", unsafe_allow_html=True)

def render_UI(data):
    v = data.get('verdict', {})
    fc = data.get('flashcard', {})
    sig = v.get('signal', 'WAIT')
    
    st.markdown(f'<div class="verdict-box bg-{sig}"><h1>{sig}</h1><h3>{fc.get("title")}</h3><p>Confidence: {v.get("confidence")}%</p></div>', unsafe_allow_html=True)
    
    c1, c2, c3 = st.columns(3)
    reasons = fc.get('reasons', [])
    for i, col in enumerate([c1, c2, c3]):
        with col:
            if i < len(reasons): st.info(reasons[i])
            
    st.write(f"**AI Analysis:** {data.get('ai_explanation')}")

# Header
st.title("🚀 KnowYourBets")

# Inputs
col_search, col_act = st.columns([3, 1])
with col_search:
    ticker = st.text_input("Ticker Symbol", placeholder="ZOMATO.NS")
with col_act:
    action = st.selectbox("Demo Presets", ["Select...", "Zomato (Bull/Wait)", "TCS (Bear)"])

# Logic
if st.button("Analyze") or action != "Select...":
    
    if action == "Zomato (Bull/Wait)":
        data = get_zomato_static()
        render_UI(data)
        st.toast("Loaded Zomato Demo Data")
        
    elif action == "TCS (Bear)":
        data = get_tcs_static()
        render_UI(data)
        st.toast("Loaded TCS Demo Data")
        
    elif ticker:
        with st.spinner("Processing Logic Pipelines..."):
            # 1. Price
            price = fetch_stock_price(ticker)
            
            # 2. Sentiment (Advanced)
            sentiment_data = fetch_aggregated_sentiment(ticker)
            
            # 3. Deep Analysis
            deep = {} 
            uploaded = st.sidebar.file_uploader("PDF")
            if uploaded: deep['pdf'] = extract_pdf_context(uploaded)

            # 4. Hybrid Verdict
            market_data = {"price": price, "sentiment": sentiment_data}
            final_result = generate_flashcard(ticker, {}, market_data, deep)
            
            render_UI(final_result)
            
            # Show Raw Data Tab
            with st.expander("See Raw Data"):
                st.write("Price:", price)
                st.write("Sentiment:", sentiment_data)
