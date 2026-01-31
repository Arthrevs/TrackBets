/**
<<<<<<< HEAD
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
=======
 * API Service for TrackBets
 * Connects to the Render backend
 */

// Backend URL - Change this for different environments
const API_BASE_URL = 'https://failexe.onrender.com';

/**
 * Analyze a stock ticker
 * @param {string} ticker - Stock ticker symbol (e.g., "RELIANCE.NS")
 * @returns {Promise<Object>} Analysis data from backend
 */
export async function analyzeStock(ticker) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze?ticker=${encodeURIComponent(ticker)}`);
>>>>>>> Frontend

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
<<<<<<< HEAD
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
=======
        console.error('API call failed:', error);
        // Return fallback mock data on error
        return {
            ticker: ticker,
            market_data: {
                price: {
                    current: 150.0,
                    change: 2.50,
                    changePercent: 1.65,
                    source: "Fallback Data"
                },
                news: [{
                    title: "Market tracking active",
                    source: "System"
                }],
                social: [{
                    title: "Discussion ongoing",
                    score: 0.1
                }]
            },
            analysis: {
                verdict: "WAIT",
                reasons: ["API temporarily unavailable", "Using cached data"]
            }
>>>>>>> Frontend
        };
    }
}

/**
<<<<<<< HEAD
 * Health check for API
 */
export async function checkApiHealth() {
=======
 * Health check for backend
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
>>>>>>> Frontend
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return await response.json();
    } catch (error) {
        return {
<<<<<<< HEAD
            status: 'offline',
=======
            status: "offline",
>>>>>>> Frontend
            error: error.message
        };
    }
}

<<<<<<< HEAD
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
=======
export default {
    analyzeStock,
    checkHealth,
>>>>>>> Frontend
    API_BASE_URL
};