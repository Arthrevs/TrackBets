import React, { useState } from 'react';
import Background from './components/Background';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AssetForm from './components/AssetForm';
import StockDetail from './components/StockDetail';

// API Base URL - change this if your backend URL is different
const API_BASE_URL = 'https://failexe.onrender.com';

function App() {
  const [view, setView] = useState('landing'); // landing | wizard | detail
  const [intent, setIntent] = useState(null); // buy | sell | track
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Handler - Fetches analysis from Python backend
  const handleAnalyze = async (ticker) => {
    console.log("🚀 Sending request to backend...");
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Data received:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisData(data);
    } catch (err) {
      console.error("❌ Error connecting to backend:", err);
      setError(err.message || 'Failed to analyze stock');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation Logic
  const goHome = () => {
    setView('landing');
    setIntent(null);
    setSelectedTicker(null);
    setAnalysisData(null);
    setError(null);
  };

  // Back Logic: Detail -> Home (or Wizard if we wanted complex history)
  const goBack = () => {
    if (view === 'detail') {
      goHome();
    } else if (view === 'wizard') {
      goHome();
    }
  };

  const startWizard = (type) => {
    setIntent(type);
    setView('wizard');
  };

  const finishWizard = (ticker) => {
    setSelectedTicker(ticker);
    setView('detail');
    handleAnalyze(ticker); // Trigger API call when wizard finishes
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-lando-neon selection:text-black bg-[#050505] overflow-hidden">
      <Background enableReactive={view === 'landing'} />
      <Header onHome={goHome} showBack={view !== 'landing'} onBack={goBack} />

      {view === 'landing' && (
        <LandingPage onNavigate={(dest, params) => startWizard(params.type)} />
      )}

      {view === 'wizard' && (
        <AssetForm
          intent={intent}
          onBack={goHome}
          onComplete={finishWizard}
        />
      )}

      {view === 'detail' && (
        <StockDetail
          ticker={selectedTicker}
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
