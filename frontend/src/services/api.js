/**
 * TrackBets API Service
 * ======================
 * Connects to FastAPI backend for stock analysis
 */

const API_BASE_URL =
    import.meta.env.VITE_API_URL || '';

/**
 * Analyze a stock ticker via the backend API
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeStock(ticker) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze?ticker=${encodeURIComponent(ticker)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] analyzeStock error:', error);

        // Return fallback mock response so UI doesn't break
        return {
            success: false,
            ticker: ticker,
            currency: ticker.includes('.NS') || ticker.includes('.BO') ? '₹' : '$',
            price_data: {
                price: null,
                change_percent: 0,
                is_up: true,
                error: error.message
            },
            news: 'Unable to fetch news',
            social: 'Unable to fetch social data',
            analysis: {
                verdict: 'HOLD',
                confidence: 50,
                reasons: ['API unavailable', 'Using fallback data'],
                ai_explanation: 'Unable to connect to analysis server. Please try again.',
                risk_level: 'MEDIUM',
                target_price: null,
                timeframe: 'N/A'
            },
            source: 'fallback'
        };
    }
}

/**
 * Health check for API
 */
export async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return await response.json();
    } catch (error) {
        return {
            status: 'offline',
            error: error.message
        };
    }
}

/**
 * Get list of available mock tickers
 */
export async function getMockTickers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/mock-tickers`);
        return await response.json();
    } catch (error) {
        return {
            mock_tickers: ['ZOMATO.NS', 'TSLA', 'RELIANCE.NS']
        };
    }
}

export default {
    analyzeStock,
    checkApiHealth,
    getMockTickers,
    API_BASE_URL
};