
import streamlit as st
import random
import time

# --- 1. GLOBAL VISUAL STYLE & CONFIGURATION ---
st.set_page_config(
    page_title="TrackBets | High-Performance Finance",
    page_icon="🏎️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- CSS INJECTION (THE LANDO AESTHETIC) ---
CSS_STYLES = """
<style>
/* Import Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Roboto+Condensed:wght@700&display=swap');

/* --- GLOBAL RESET & BACKGROUND --- */
.stApp {
    background-color: #050505 !important;
    font-family: 'Inter', sans-serif;
    color: #FFFFFF;
}

/* Hide Default Streamlit UI */
header, footer, #MainMenu {visibility: hidden !important;}

/* Typography Overrides */
h1, h2, h3, h4, h5, h6 {
    font-family: 'Roboto Condensed', sans-serif !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.mono-text {
    font-family: 'JetBrains Mono', monospace;
}

/* --- HERO SEARCH INPUT --- */
/* Target the input box specifically */
div[data-testid="stTextInput"] input {
    background-color: #0A0A0A !important;
    color: #CCFF00 !important; /* Neon Text */
    border: 1px solid #333 !important;
    border-radius: 4px; /* Slightly squared off looks more "tech" */
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.2rem;
    height: 3rem;
    transition: all 0.3s ease;
}

div[data-testid="stTextInput"] input::placeholder {
    color: #444 !important;
    font-style: italic;
}

div[data-testid="stTextInput"] input:focus {
    border-color: #CCFF00 !important;
    box-shadow: 0 0 15px #CCFF00 !important; /* GLOW EFFECT */
    outline: none;
}

/* --- FLASHCARD FEED (Glassmorphism) --- */
.flashcard {
    background: rgba(255, 255, 255, 0.05); /* Semi-transparent black */
    border: 1px solid #333;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
    transition: transform 0.2s;
    position: relative;
    overflow: hidden;
}

.flashcard:hover {
    transform: translateY(-2px);
    border-color: #555;
}

.flashcard-buy {
    border-left: 4px solid #CCFF00;
    box-shadow: 0 0 20px rgba(204, 255, 0, 0.1); /* Faint green glow */
}

.flashcard-sell {
    border-left: 4px solid #FF3B30;
}

.verdict-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-family: 'Roboto Condensed', sans-serif;
    font-weight: 900;
    font-size: 0.9rem;
    text-transform: uppercase;
    float: right;
}

.badge-buy {
    background-color: #CCFF00;
    color: #000;
    box-shadow: 0 0 10px #CCFF00;
    animation: pulse 2s infinite;
}

.badge-sell {
    background-color: #FF3B30;
    color: #FFF;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(204, 255, 0, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(204, 255, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(204, 255, 0, 0); }
}

/* --- RPM METER STYLES --- */
.rpm-container {
    background-color: #111;
    border-radius: 4px;
    height: 12px;
    width: 100%;
    margin-top: 8px;
    position: relative;
    overflow: visible; /* Allow triangle to stick out */
}

.rpm-bar {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #FF3B30 0%, #FFCC00 50%, #CCFF00 100%);
    opacity: 0.8;
    border-radius: 4px;
}

.rpm-marker {
    position: absolute;
    top: -6px;
    width: 0; 
    height: 0; 
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid white;
    transform: translateX(-50%);
    filter: drop-shadow(0 0 2px black);
}

.metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
}

.metric-item {
    background: rgba(0,0,0,0.3);
    padding: 8px;
    border-radius: 6px;
}

.metric-label {
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
}

.metric-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.1rem;
    font-weight: 700;
}

.color-green { color: #CCFF00; }
.color-red { color: #FF3B30; }

</style>
"""

st.markdown(CSS_STYLES, unsafe_allow_html=True)


# --- 2. MOCK DATA & STATE ---
MOCK_DATA = {
    "ZOMATO": {
        "price": 260.45,
        "delta": "+5.2%",
        "verdict": "BUY",
        "sentiment_score": 85, # 0-100
        "reasons": ["Q3 Profit Up 200%", "YouTube Influencers Bullish", "New 'District' App Launch"],
        "volume": "45M"
    },
    "TATA MOTORS": {
        "price": 980.10,
        "delta": "-1.2%",
        "verdict": "HOLD",
        "sentiment_score": 45,
        "reasons": ["EV Sales Slowing", "Production Halted in UK"],
        "volume": "12M"
    },
     "PAYTM": {
        "price": 450.00,
        "delta": "-12.5%",
        "verdict": "SELL",
        "sentiment_score": 10,
        "reasons": ["Regulatory Hurdle", "CEO Scandal Rumors", "Analyst Downgrade"],
        "volume": "102M"
    }
}

if 'sim_alert' not in st.session_state:
    st.session_state.sim_alert = False

# --- 3. HELPER FUNCTIONS ---

def render_rpm_meter(score):
    """
    Renders an HTML/CSS based progress bar that looks like an F1 RPM counter.
    score: 0 to 100
    """
    # Calculate position percentage
    pct = max(0, min(100, score))
    
    html = f"""
    <div class="rpm-container">
        <div class="rpm-bar"></div>
        <div class="rpm-marker" style="left: {pct}%;"></div>
    </div>
    """
    return html

def render_card(ticker, data):
    """
    Renders a glassmorphism card for a stock.
    """
    verdict_class = "flashcard-buy" if data['verdict'] == "BUY" else "flashcard-sell" if data['verdict'] == "SELL" else ""
    badge_class = "badge-buy" if data['verdict'] == "BUY" else "badge-sell" if data['verdict'] == "SELL" else "badge-neutral"
    
    price_color = "color-green" if "+" in data['delta'] else "color-red"
    
    reasons_html = "".join([f"<li>{r}</li>" for r in data['reasons']])
    
    rpm_html = render_rpm_meter(data['sentiment_score'])

    st.markdown(f"""
    <div class="flashcard {verdict_class}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin:0; font-size: 1.5rem;">{ticker}</h3>
            <span class="verdict-badge {badge_class}">{data['verdict']}</span>
        </div>
        
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-label">Price</div>
                <div class="metric-value">{data['price']} <span style="font-size:0.8rem;" class="{price_color}">({data['delta']})</span></div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Volume</div>
                <div class="metric-value">{data['volume']}</div>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <div class="metric-label" style="margin-bottom: 4px;">Sentiment RPM</div>
            {rpm_html}
        </div>

        <div style="margin-top: 15px; font-size: 0.9rem; color: #CCC;">
            <div class="metric-label">Key Drivers</div>
            <ul style="padding-left: 20px; margin-top: 5px;">
                {reasons_html}
            </ul>
        </div>
    </div>
    """, unsafe_allow_html=True)


# --- 4. MAIN LAYOUT ---

# A. Side Bar - Simulation
with st.sidebar:
    st.markdown("### 🛠 DEV TOOLS")
    if st.button("🚨 Simulate Crash Event"):
        st.session_state.sim_alert = True
        
    if st.button("Reset State"):
        st.session_state.sim_alert = False
        st.experimental_rerun()

# B. Alert Banner (Hidden Feature)
if st.session_state.sim_alert:
    st.error("🚨 ALERT: CEO Scandal Detected. Sell Signal Triggered Across Markets.")

# C. Header / Hero Section
col1, col2, col3 = st.columns([1, 2, 1])

with col2:
    st.markdown("<h1 style='text-align: center; margin-bottom: 0px;'>TRACK<span style='color:#CCFF00'>BETS</span></h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #888; margin-top: -10px; margin-bottom: 30px;' class='mono-text'>// RETAIL SENTIMENT ANALYZER v1.0</p>", unsafe_allow_html=True)
    
    # Hero Search Bar
    search_query = st.text_input("", placeholder="Track Zomato... Track Tata Motors...", label_visibility="collapsed")


# D. Flashcard Feed (Bento Grid)
st.markdown("<br>", unsafe_allow_html=True)

# Determine what to show based on search
display_tickers = []
if search_query:
    # Simple filter
    clean_query = search_query.upper().strip()
    for t in MOCK_DATA:
        if clean_query in t:
            display_tickers.append(t)
    if not display_tickers:
        st.info(f"No data found for '{clean_query}'. Try ZOMATO, TATA MOTORS, or PAYTM.")
else:
    display_tickers = list(MOCK_DATA.keys())

# Render Grid
if display_tickers:
    cols = st.columns(3) # Create 3 columns for desktop
    
    for i, ticker in enumerate(display_tickers):
        with cols[i % 3]:
            render_card(ticker, MOCK_DATA[ticker])

