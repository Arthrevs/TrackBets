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
        throw error;
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
        throw error;
    }
}

export default {
    analyzeStock,
    checkApiHealth,
    getMockTickers,
    API_BASE_URL
};