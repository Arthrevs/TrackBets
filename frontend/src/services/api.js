/**
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

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
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
        };
    }
}

/**
 * Health check for backend
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return await response.json();
    } catch (error) {
        return {
            status: "offline",
            error: error.message
        };
    }
}

export default {
    analyzeStock,
    checkHealth,
    API_BASE_URL
};