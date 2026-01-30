/**
 * TrackBets Custom Hooks
 * =======================
 * React hooks for API integration
 */

import { useState, useEffect } from 'react';
import { analyzeStock } from '../services/api';

/**
 * Hook to fetch stock analysis from backend API
 * @param {string} ticker - Stock ticker to analyze
 * @param {boolean} enabled - Whether to fetch (default: true)
 * @returns {Object} { data, loading, error, refetch }
 */
export function useStockAnalysis(ticker, enabled = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!ticker || !enabled) return;

        setLoading(true);
        setError(null);

        try {
            const result = await analyzeStock(ticker);
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [ticker, enabled]);

    return { data, loading, error, refetch: fetchData };
}

export default { useStockAnalysis };
