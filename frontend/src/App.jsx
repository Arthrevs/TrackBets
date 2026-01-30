import React, { useState } from 'react';
import Background from './components/Background';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AssetForm from './components/AssetForm';
import StockDetail from './components/StockDetail';

function App() {
  const [view, setView] = useState('landing'); // landing | wizard | detail
  const [intent, setIntent] = useState(null); // buy | sell | track
  const [selectedTicker, setSelectedTicker] = useState(null);

  // Navigation Logic
  const goHome = () => {
    setView('landing');
    setIntent(null);
    setSelectedTicker(null);
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
        />
      )}
    </div>
  );
}

export default App;
