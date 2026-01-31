import React, { useState } from 'react';
import Background from './components/Background';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AssetForm from './components/AssetForm';
import StockDetail from './components/StockDetail';
import AILoadingScreen from './components/AILoadingScreen';

// API Base URL - change this if your backend URL is different
// API Base URL - empty string for relative path (works for both local main.py and production)
const API_BASE_URL = '';

function App() {
  const [view, setView] = useState('landing'); // landing | wizard | loading | detail
  const [intent, setIntent] = useState(null); // buy | sell | track
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [wizardData, setWizardData] = useState(null); // Full wizard form data
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Handler - Fetches analysis from Python backend
  const handleAnalyze = async (ticker) => {
    console.log("🚀 Sending request to backend for:", ticker);
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      // Use GET request with ticker as query parameter (matching FastAPI endpoint)
      const response = await fetch(`${API_BASE_URL}/api/analyze?ticker=${encodeURIComponent(ticker)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
    setWizardData(null);
    setAnalysisData(null);
    setError(null);
  };

  // Back Logic: Detail -> Home (or Wizard if we wanted complex history)
  const goBack = () => {
    if (view === 'detail' || view === 'loading') {
      goHome();
    } else if (view === 'wizard') {
      goHome();
    }
  };

  const startWizard = (type) => {
    setIntent(type);
    setView('wizard');
  };

  // Now receives full form data from wizard
  const finishWizard = (formData) => {
    setSelectedTicker(formData.ticker);
    setWizardData(formData);
    setView('loading'); // Show loading screen first
  };

  // Called when AI loading completes
  const onLoadingComplete = () => {
    setView('detail');
    handleAnalyze(selectedTicker); // Trigger API call when loading finishes
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
