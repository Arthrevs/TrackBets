import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AssetForm from './components/AssetForm';
import AssetInputPage from './components/AssetInputPage';
import StockDetail from './components/StockDetail';
import AILoadingScreen from './components/AILoadingScreen';
import { analyzeStock } from './services/api';

// --- MOCK DATA FALLBACK (used when backend is unreachable) ---
const MOCK_DATA = {
    ticker: "MOCK",
    price_data: {
        price: 245.30,
        change_percent: 3.45,
        currency: "$",
        name: "Mock Company Inc.",
        market_cap: "780B",
        volume: "125M"
    },
    analysis: {
        verdict: {
            signal: "STRONG BUY",
            confidence: 92
        },
        action: "Accumulate on dips",
        target_price: "285.00",
        timeframe: "3-6 Months",
        risk_level: "HIGH",
        ai_explanation: "This is MOCK DATA because the backend is not reachable. The asset shows strong momentum breaking above key resistance levels. Delivery numbers exceeded expectations and margin improvements suggest operational efficiency. Technical indicators RSI and MACD are bullish.",
        reasons: [
            "Earnings beat estimates by 5%",
            "New product launch faster than expected",
            "Regulatory approval limits downside"
        ],
        flashcard: { title: "Growth Catalyst" }
    },
    social: "1. [r/wallstreetbets] THIS STOCK TO THE MOON 🚀\n2. @TechAnalyst: Buying the dip here.\n3. MarketWatch: Sector rally continues.",
    graph_data: {
        points: [
            { time: '9:30', value: 238 },
            { time: '10:00', value: 240 },
            { time: '11:00', value: 242 },
            { time: '12:00', value: 241 },
            { time: '13:00', value: 243 },
            { time: '14:00', value: 244 },
            { time: '15:00', value: 245.30 }
        ]
    }
};

/**
 * Normalize backend API response to the shape StockDetail expects.
 * Backend returns flat: { verdict: "BUY", confidence: 92, ... }
 * Frontend expects nested: { verdict: { signal: "BUY", confidence: 92 }, ... }
 */
function normalizeAnalysisData(apiData) {
    if (!apiData) return null;

    const analysis = apiData.analysis || {};

    // If verdict is already an object with .signal, it's already in the right shape
    if (analysis.verdict && typeof analysis.verdict === 'object' && analysis.verdict.signal) {
        return apiData;
    }

    // Normalize flat backend response → nested structure for StockDetail
    const normalizedAnalysis = {
        ...analysis,
        verdict: {
            signal: analysis.verdict || 'HOLD',
            confidence: analysis.confidence || 50
        },
        // Ensure these fields exist for StockDetail
        action: analysis.action || `${analysis.verdict || 'HOLD'} position recommended`,
        target_price: analysis.target_price || '---',
        timeframe: analysis.timeframe || 'Medium-term',
        risk_level: analysis.risk_level || 'MEDIUM',
        ai_explanation: analysis.ai_explanation || 'Analysis in progress...',
        reasons: analysis.reasons || [],
        flashcard: analysis.flashcard || { title: 'Insight' }
    };

    return {
        ...apiData,
        analysis: normalizedAnalysis
    };
}

function App() {
    const [view, setView] = useState('landing'); // landing | input | wizard | loading | detail
    const [intent, setIntent] = useState(null); // buy | sell | track
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [wizardData, setWizardData] = useState(null); // Full wizard form data
    const [analysisData, setAnalysisData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // API Handler - Fetches analysis from Python backend via services/api.js
    const handleAnalyze = async (ticker) => {
        console.log("🚀 Sending request to backend for:", ticker);
        setIsLoading(true);
        setError(null);

        try {
            const data = await analyzeStock(ticker);
            console.log("✅ Data received:", data);

            // Check if it's a fallback response from api.js
            if (data.source === 'fallback' || data.success === false) {
                console.warn("⚠️ Backend unavailable, using built-in mock data");
                setAnalysisData({
                    ...MOCK_DATA,
                    ticker: ticker,
                    price_data: {
                        ...MOCK_DATA.price_data,
                        name: `${ticker} (Mock Mode)`,
                        price: (Math.random() * 1000).toFixed(2)
                    }
                });
            } else {
                // Normalize the live backend data shape for StockDetail
                setAnalysisData(normalizeAnalysisData(data));
            }
            setError(null);
        } catch (err) {
            console.warn("❌ Unexpected error, using MOCK DATA:", err);
            setAnalysisData({
                ...MOCK_DATA,
                ticker: ticker,
                price_data: {
                    ...MOCK_DATA.price_data,
                    name: `${ticker} (Mock Mode)`,
                    price: (Math.random() * 1000).toFixed(2)
                }
            });
            setError(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Navigation Logic
    const goHome = () => {
        setView('landing');
        setIntent(null);
        setSelectedTicker(null);
        setWizardData(null);
        setAnalysisData(null);
        setError(null);
    };

    // Back Logic: Detail -> Home (or Wizard if we wanted complex history)
    const goBack = () => {
        if (view === 'detail' || view === 'loading') {
            goHome();
        } else if (view === 'wizard') {
            setView('input'); // Back to input page
        } else if (view === 'input') {
            goHome();
        }
    };

    const startWizard = (type) => {
        setIntent(type);
        setView('input'); // Start with the new input page
    };

    const finishInput = (ticker) => {
        setSelectedTicker(ticker);
        setView('wizard');
    };

    // Now receives full form data from wizard
    const finishWizard = (formData) => {
        setSelectedTicker(formData.ticker);
        setWizardData(formData);
        setView('loading'); // Show loading screen first
    };

    // Called when AI loading animation completes
    // Start the API call first, THEN switch to detail view
    const onLoadingComplete = () => {
        handleAnalyze(selectedTicker); // Fire the API call
        setView('detail'); // Immediately show detail (it handles isLoading state)
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-lando-neon selection:text-black">

            {view === 'landing' && (
                <LandingPage onNavigate={(dest, params) => startWizard(params.type)} />
            )}

            {view === 'input' && (
                <AssetInputPage onComplete={finishInput} />
            )}

            {view === 'wizard' && (
                <AssetForm
                    intent={intent}
                    initialTicker={selectedTicker}
                    onBack={() => setView('input')}
                    onComplete={finishWizard}
                />
            )}

            {view === 'loading' && (
                <AILoadingScreen
                    ticker={selectedTicker}
                    onComplete={onLoadingComplete}
                />
            )}

            {view === 'detail' && (
                <StockDetail
                    ticker={selectedTicker}
                    wizardData={wizardData}
                    onBack={goHome}
                    analysisData={analysisData}
                    isLoading={isLoading}
                    error={error}
                    onRetry={() => handleAnalyze(selectedTicker)}
                />
            )}
        </div>
    );
}

export default App;
