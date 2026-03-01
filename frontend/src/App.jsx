import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AssetForm from './components/AssetForm';
import AssetInputPage from './components/AssetInputPage';
import StockDetail from './components/StockDetail';
import AILoadingScreen from './components/AILoadingScreen';
import SignUpPage from './components/SignUpPage';
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
    const [view, setView] = useState('landing'); // landing | input | wizard | loading | detail | signup
    const [viewHistory, setViewHistory] = useState([]); // History array of previous views
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('trackbets_user');
        return savedUser ? JSON.parse(savedUser) : null;
    }); // Global auth state (user object)
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

    // Central navigation handler to record history
    const navigateTo = (newView) => {
        console.log(`🧭 Navigating ${view} -> ${newView}`);
        if (newView === 'landing') {
            setViewHistory([]); // Clear history on home
        } else if (view !== 'loading') {
            // Record current view before navigating, skip loading screen
            setViewHistory(prev => {
                const nextHistory = [...prev, view];
                console.log('📚 History pushed:', nextHistory);
                return nextHistory;
            });
        }
        setView(newView);
    };

    // Navigation Logic
    const goHome = () => {
        navigateTo('landing');
        setIntent(null);
        setSelectedTicker(null);
        setWizardData(null);
        setAnalysisData(null);
        setError(null);
    };

    // Back Logic: Pop from history stack to navigate perfectly back
    const goBack = () => {
        console.log('🔙 goBack called. Current history:', viewHistory);
        if (viewHistory.length > 0) {
            const newHistory = [...viewHistory];
            const prevView = newHistory.pop();
            setViewHistory(newHistory);
            setView(prevView);
            console.log(`🔙 Returning to ${prevView}. New history:`, newHistory);
        } else {
            console.log('🔙 No history left, returning to landing');
            goHome(); // Fallback if no history
        }
    };

    const startWizard = (type) => {
        setIntent(type);
        if (!user) {
            navigateTo('signup');
        } else {
            navigateTo('input'); // Start with the new input page
        }
    };

    const finishInput = (ticker) => {
        setSelectedTicker(ticker);
        navigateTo('wizard');
    };

    // Now receives full form data from wizard
    const finishWizard = (formData) => {
        setSelectedTicker(formData.ticker);
        setWizardData(formData);
        navigateTo('loading'); // Show loading screen first
    };

    // Called when AI loading animation completes
    // Start the API call first, THEN switch to detail view
    const onLoadingComplete = () => {
        handleAnalyze(selectedTicker); // Fire the API call
        navigateTo('detail'); // Immediately show detail (it handles isLoading state)
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-lando-neon selection:text-black">

            {view === 'landing' && (
                <LandingPage
                    user={user}
                    onNavigate={(dest, params) => {
                        if (dest === 'signup') {
                            setIntent(params.type);
                            // Skip signup if already logged in (unless they explicitly clicked a logout button, which doesn't exist yet)
                            if (user) {
                                navigateTo('input');
                            } else {
                                navigateTo('signup');
                            }
                        } else {
                            startWizard(params.type);
                        }
                    }} />
            )}

            {view === 'signup' && (
                <SignUpPage
                    initialMode={intent === 'login' ? 'login' : 'signup'}
                    onSuccess={(userData) => {
                        setUser(userData);
                        localStorage.setItem('trackbets_user', JSON.stringify(userData));
                        navigateTo('input');
                    }}
                    onBack={goBack}
                />
            )}

            {view === 'input' && (
                <AssetInputPage onComplete={finishInput} onBack={goBack} />
            )}

            {view === 'wizard' && (
                <AssetForm
                    intent={intent}
                    initialTicker={selectedTicker}
                    onBack={goBack}
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
                    onBack={goBack}
                    analysisData={analysisData}
                    mode={intent}
                    isLoading={isLoading}
                    error={error}
                    onRetry={() => handleAnalyze(selectedTicker)}
                />
            )}

            {!['landing', 'input', 'wizard', 'loading', 'detail', 'signup'].includes(view) && (
                <div className="flex flex-col items-center justify-center h-screen bg-black text-red-500">
                    <h1>Error: Invalid view "{view}"</h1>
                    <button onClick={goHome} className="mt-4 p-2 bg-gray-800 rounded">Go Home</button>
                </div>
            )}
        </div>
    );
}

export default App;
