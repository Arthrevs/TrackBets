import React, { useState } from 'react';
import Background from './components/Background';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AssetForm from './components/AssetForm';
import StockDetail from './components/StockDetail';
import AILoadingScreen from './components/AILoadingScreen';

function App() {
  const [view, setView] = useState('landing'); // landing | wizard | loading | detail
  const [intent, setIntent] = useState(null); // buy | sell | track
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [wizardData, setWizardData] = useState(null); // Full wizard form data

  // Navigation Logic
  const goHome = () => {
    setView('landing');
    setIntent(null);
    setSelectedTicker(null);
    setWizardData(null);
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
        />
      )}
    </div>
  );
}

export default App;
