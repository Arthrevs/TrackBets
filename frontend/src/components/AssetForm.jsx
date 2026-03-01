import React, { useState } from 'react';
import { ArrowRight, Check, Eye, Wallet, ArrowLeft, Target, TrendingUp, TrendingDown, Percent, HelpCircle, AlertCircle } from 'lucide-react';
import FluidBackground from './landing/FluidBackground';
import AnimatedWallet from './AnimatedWallet';
import AnimatedEye from './AnimatedEye';
import RippleButton from './RippleButton';


const AssetForm = ({ intent, onComplete, onBack, initialTicker }) => {
  const [step, setStep] = useState(2);
  const [isOwner, setIsOwner] = useState(false);
  const [priceStrategy, setPriceStrategy] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null); // Track which ownership card is hovered
  const [hoveredStrategy, setHoveredStrategy] = useState(null); // Track which entry strategy card is hovered
  const [formData, setFormData] = useState({
    ticker: initialTicker || '',
    bg_price: '',
    units: '',
    target_price: '',
    strategy: ''
  });

  // Determine API base URL (use relative path in production)
  const API_BASE = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : ''; // Empty = relative URL in production

  const handleSearch = async (query) => {
    // Only search if 3+ chars
    if (query.length < 3) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();

      if (data && data.ticker) {
        setSuggestions([data]); // Valid result
        setSearchError(null);
      } else if (data && data.error) {
        // Gemini couldn't find a valid ticker
        setSuggestions([]);
        setSearchError({
          message: `No stock found for "${query}"`,
          didYouMean: getSimilarTickers(query) // Suggest similar popular tickers
        });
      } else {
        setSuggestions([]);
      }
    } catch (e) {
      console.error("Search failed", e);
      setSearchError({
        message: "Search service unavailable",
        didYouMean: getSimilarTickers(query)
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Helper: Suggest popular tickers based on partial match
  const getSimilarTickers = (query) => {
    const popularTickers = [
      { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ' },
      { ticker: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ' },
      { ticker: 'ETERNAL.NS', name: 'Eternal Ltd (Zomato)', exchange: 'NSE' },
      { ticker: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE' },
      { ticker: 'TATAMOTORS.NS', name: 'Tata Motors', exchange: 'NSE' },
      { ticker: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE' },
      { ticker: 'INFY.NS', name: 'Infosys', exchange: 'NSE' },
      { ticker: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE' },
    ];

    const q = query.toLowerCase();
    return popularTickers.filter(t =>
      t.ticker.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q)
    ).slice(0, 3);
  };

  const selectTicker = (suggestion) => {
    setFormData({ ...formData, ticker: suggestion.ticker });
    setSuggestions([]);
    setSearchError(null);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => {
    if (step === 2) {
      onBack(); // Go back to AssetInputPage
    } else if (step === 5 && priceStrategy !== 'specific') {
      setStep(3); // Skip price input if not using specific strategy
    } else {
      setStep(s => s - 1);
    }
  };

  const handleOwnerSelection = (owned) => {
    setIsOwner(owned);
    nextStep();
  };

  const handlePriceStrategy = (strategy) => {
    setPriceStrategy(strategy);
    if (strategy === 'specific') {
      nextStep(); // Go to price input
    } else {
      // Skip price input, go directly to strategy
      setStep(step + 2);
    }
  };

  const handleFinish = () => {
    // Pass full form data including price strategy
    onComplete({
      ...formData,
      priceStrategy: priceStrategy
    });
  };

  // Price strategy options
  const priceOptions = [
    {
      id: 'specific',
      icon: Target,
      title: 'I have a target price',
      subtitle: 'Enter your specific entry point',
      color: 'text-green-400',
      hoverBorder: 'hover:border-green-500/50'
    },
    {
      id: 'ai_optimal',
      icon: TrendingUp,
      title: 'Find optimal entry',
      subtitle: 'AI calculates best entry based on technicals',
      color: 'text-purple-400',
      hoverBorder: 'hover:border-purple-500/50'
    },
    {
      id: 'discount',
      icon: Percent,
      title: 'Wait for a dip',
      subtitle: 'Alert me when price drops 5-15%',
      color: 'text-blue-400',
      hoverBorder: 'hover:border-blue-500/50'
    },
    {
      id: 'blank',
      icon: HelpCircle,
      title: 'No target yet',
      subtitle: "I'll decide later based on insights",
      color: 'text-gray-400',
      hoverBorder: 'hover:border-gray-500/50'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative z-10 px-4 pt-24 overflow-hidden">
      {/* Background */}
      <FluidBackground />

      {/* Back Button */}
      <button
        onClick={prevStep}
        className="fixed top-20 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-50"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-semibold">Back</span>
      </button>

      {/* Progress Indicator */}
      <div className="fixed top-20 right-6 flex gap-1 z-50">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i <= step ? 'bg-[#5ac53b]' : 'bg-gray-700'
              }`}
          />
        ))}
      </div>

      <div className="w-full max-w-xl z-10 relative">

        {/* STEP 2: OWNERSHIP CHECK */}
        {step === 2 && (
          <div className="rh-card p-10 text-center fade-in bg-black/10 backdrop-blur-[20px] border border-white/10 rounded-[32px]">
            <h2 className="text-3xl font-bold mb-2 text-white">Current Status</h2>
            <p className="text-gray-500 mb-8">Do you already own this asset</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* I Hold This Card */}
              <button
                onClick={() => handleOwnerSelection(true)}
                onMouseEnter={() => setHoveredCard('hold')}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative p-8 rounded-xl border overflow-hidden transition-all duration-300 ${hoveredCard === 'hold'
                  ? 'bg-white/40 backdrop-blur-[30px] border-[#5ac53b] -translate-y-2 shadow-2xl scale-105'
                  : 'bg-transparent border-gray-800 hover:border-[#5ac53b]/50'
                  }`}
              >
                {/* Liquid glass effect only on hover */}
                {hoveredCard === 'hold' && (
                  <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
                )}

                <div className="relative z-10">
                  <AnimatedWallet isHovered={hoveredCard === 'hold'} />
                  <div className="font-bold text-lg mb-1 text-white">I Hold This</div>
                  <div className="text-xs text-gray-400">Add to my portfolio</div>
                </div>
              </button>

              {/* Just Watching Card */}
              <button
                onClick={() => handleOwnerSelection(false)}
                onMouseEnter={() => setHoveredCard('watch')}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative p-8 rounded-xl border overflow-hidden transition-all duration-300 ${hoveredCard === 'watch'
                  ? 'bg-white/40 backdrop-blur-[30px] border-blue-400 -translate-y-2 shadow-2xl scale-105'
                  : 'bg-transparent border-gray-800 hover:border-blue-400/50'
                  }`}
              >
                {/* Liquid glass effect only on hover */}
                {hoveredCard === 'watch' && (
                  <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
                )}

                <div className="relative z-10">
                  <AnimatedEye isHovered={hoveredCard === 'watch'} />
                  <div className="font-bold text-lg mb-1 text-white">Just Watching</div>
                  <div className="text-xs text-gray-400">Track without owning</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRICE STRATEGY (NEW!) */}
        {step === 3 && !isOwner && (
          <div className="fade-in relative">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              {/* Green Orb - Top Left */}
              <div
                className="absolute transition-all duration-700"
                style={{
                  width: '400px',
                  height: '400px',
                  left: '-5%',
                  top: '-10%',
                  background: 'radial-gradient(circle, rgba(110, 241, 149, 0.4) 0%, rgba(74, 222, 128, 0.2) 40%, transparent 70%)',
                  filter: 'blur(80px)',
                  opacity: hoveredStrategy === 'specific' ? 0.5 : 0.2,
                  animation: 'floatOrb1 20s ease-in-out infinite',
                  transform: hoveredStrategy === 'specific' ? 'scale(1.1)' : 'scale(1)',
                }}
              />

              {/* Purple Orb - Middle Right */}
              <div
                className="absolute transition-all duration-700"
                style={{
                  width: '450px',
                  height: '450px',
                  right: '-10%',
                  top: '30%',
                  background: 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)',
                  filter: 'blur(80px)',
                  opacity: hoveredStrategy === 'optimal' ? 0.5 : 0.2,
                  animation: 'floatOrb2 25s ease-in-out infinite',
                  animationDelay: '-5s',
                  transform: hoveredStrategy === 'optimal' ? 'scale(1.1)' : 'scale(1)',
                }}
              />

              {/* Blue Orb - Bottom Center */}
              <div
                className="absolute transition-all duration-700"
                style={{
                  width: '380px',
                  height: '380px',
                  left: '30%',
                  bottom: '-15%',
                  background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
                  filter: 'blur(80px)',
                  opacity: hoveredStrategy === 'dip' ? 0.5 : 0.2,
                  animation: 'floatOrb3 18s ease-in-out infinite',
                  animationDelay: '-10s',
                  transform: hoveredStrategy === 'dip' ? 'scale(1.1)' : 'scale(1)',
                }}
              />

              {/* Gray Orb - Top Right */}
              <div
                className="absolute transition-all duration-700"
                style={{
                  width: '320px',
                  height: '320px',
                  right: '5%',
                  top: '-5%',
                  background: 'radial-gradient(circle, rgba(113, 113, 122, 0.35) 0%, rgba(82, 82, 91, 0.2) 40%, transparent 70%)',
                  filter: 'blur(80px)',
                  opacity: hoveredStrategy === 'none' ? 0.45 : 0.18,
                  animation: 'floatOrb4 22s ease-in-out infinite',
                  animationDelay: '-15s',
                  transform: hoveredStrategy === 'none' ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            </div>

            {/* Premium Card with glassmorphism */}
            <div
              className="relative overflow-hidden rounded-[28px] p-14 border-[1.5px] border-white/12"
              style={{
                background: 'linear-gradient(135deg, rgba(40, 40, 48, 0.85) 0%, rgba(30, 30, 38, 0.75) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Top shimmer line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(110, 241, 149, 0.5) 30%, rgba(74, 222, 128, 0.6) 50%, rgba(110, 241, 149, 0.5) 70%, transparent 100%)',
                  animation: 'shimmerEntry 3s ease-in-out infinite',
                }}
              />

              {/* Header */}
              <div className="text-center mb-11">
                <h1
                  className="text-[44px] font-semibold mb-3 leading-tight"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 2px 20px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Entry Strategy
                </h1>
                <p className="text-[#A8A8B8] text-base font-light tracking-tight">
                  How would you like to target your entry?
                </p>
              </div>

              {/* Options List */}
              <div className="flex flex-col gap-3.5">
                {[
                  {
                    id: 'specific',
                    title: 'I have a target price',
                    description: 'Enter your specific entry point',
                    color: '#6EF195',
                    colorRgba: 'rgba(110, 241, 149, 0.4)',
                    badge: 'MANUAL',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#6EF195" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[26px] h-[26px]">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="6"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                    )
                  },
                  {
                    id: 'optimal',
                    title: 'Find optimal entry',
                    description: 'AI calculates best entry based on technicals',
                    color: '#A78BFA',
                    colorRgba: 'rgba(167, 139, 250, 0.4)',
                    badge: 'AI-PWR',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[26px] h-[26px]">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </svg>
                    )
                  },
                  {
                    id: 'dip',
                    title: 'Wait for a dip',
                    description: 'Alert me when price drops 5-15%',
                    color: '#60A5FA',
                    colorRgba: 'rgba(96, 165, 250, 0.4)',
                    badge: 'ALERT',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[26px] h-[26px]">
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                      </svg>
                    )
                  },
                  {
                    id: 'none',
                    title: 'No target yet',
                    description: "I'll decide later based on insights",
                    color: '#71717A',
                    colorRgba: 'rgba(113, 113, 122, 0.4)',
                    badge: 'WATCH',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[26px] h-[26px]">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    )
                  }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handlePriceStrategy(option.id)}
                    className="group relative overflow-hidden rounded-[18px] border text-left transition-all duration-500 cursor-pointer hover:translate-x-1 hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.8) 0%, rgba(10, 10, 15, 0.6) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 4px 16px rgba(0, 0, 0, 0.4)',
                      '--card-color': option.colorRgba,
                    }}
                    onMouseEnter={(e) => {
                      setHoveredStrategy(option.id);
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 12px 32px rgba(0, 0, 0, 0.5), -8px 0 32px ${option.colorRgba}`;
                    }}
                    onMouseLeave={(e) => {
                      setHoveredStrategy(null);
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 4px 16px rgba(0, 0, 0, 0.4)';
                    }}
                  >
                    {/* Background glow animation on hover */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {/* Edge gradients converging */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `
                            linear-gradient(135deg, ${option.colorRgba} 0%, transparent 40%),
                            linear-gradient(225deg, ${option.colorRgba} 0%, transparent 40%),
                            linear-gradient(315deg, ${option.colorRgba} 0%, transparent 40%),
                            linear-gradient(45deg, ${option.colorRgba} 0%, transparent 40%)
                          `,
                          animation: 'cardGlowPulse 2s ease-in-out infinite',
                        }}
                      />
                      {/* Center radial glow */}
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
                        style={{
                          background: `radial-gradient(ellipse at center, ${option.colorRgba} 0%, transparent 60%)`,
                          animation: 'cardCenterGlow 2s ease-in-out infinite',
                        }}
                      />
                      {/* Left edge glow bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{
                          background: `linear-gradient(180deg, transparent 0%, ${option.color} 50%, transparent 100%)`,
                          opacity: 0.6,
                          animation: 'cardEdgeSlide 2s ease-in-out infinite',
                        }}
                      />
                    </div>

                    {/* Data stream effect */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-60"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${option.color} 50%, transparent 100%)`,
                        animation: 'dataStreamEntry 2s ease-in-out infinite',
                      }}
                    />

                    {/* Content */}
                    <div className="p-6 flex items-center gap-5 relative z-10">
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 w-[54px] h-[54px] rounded-[14px] flex items-center justify-center transition-all duration-500 group-hover:scale-[1.08] group-hover:rotate-[5deg]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <span className="transition-all duration-500 group-hover:scale-110" style={{ filter: `drop-shadow(0 0 12px ${option.colorRgba})` }}>
                          {option.icon}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[18px] font-semibold text-[#D0D0D8] mb-1.5 tracking-tight transition-all duration-400 group-hover:text-white group-hover:translate-x-0.5">
                          {option.title}
                        </div>
                        <div className="text-[13px] font-light text-gray-600 leading-relaxed tracking-tight transition-all duration-400 group-hover:text-gray-500">
                          {option.description}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex-shrink-0 flex items-center gap-2 opacity-0 -translate-x-2.5 transition-all duration-400 group-hover:opacity-100 group-hover:translate-x-0">
                        {/* Badge */}
                        <div
                          className="font-mono text-[10px] font-bold tracking-[0.05em] uppercase px-3 py-1.5 rounded-lg transition-all duration-400"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#666',
                          }}
                        >
                          {option.badge}
                        </div>

                        {/* Selection indicator */}
                        <div
                          className="w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all duration-500"
                          style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1.5px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <ArrowRight size={14} className="text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Animations */}
            <style>{`
              @keyframes shimmerEntry {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
              }
              @keyframes dataStreamEntry {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              @keyframes floatOrb1 {
                0%, 100% { 
                  transform: translate(0, 0) scale(1);
                }
                25% { 
                  transform: translate(30px, 20px) scale(1.05);
                }
                50% { 
                  transform: translate(10px, 40px) scale(0.95);
                }
                75% { 
                  transform: translate(-20px, 15px) scale(1.02);
                }
              }
              @keyframes floatOrb2 {
                0%, 100% { 
                  transform: translate(0, 0) scale(1);
                }
                25% { 
                  transform: translate(-25px, 30px) scale(0.97);
                }
                50% { 
                  transform: translate(15px, -20px) scale(1.08);
                }
                75% { 
                  transform: translate(35px, 25px) scale(0.95);
                }
              }
              @keyframes floatOrb3 {
                0%, 100% { 
                  transform: translate(0, 0) scale(1);
                }
                33% { 
                  transform: translate(40px, -30px) scale(1.1);
                }
                66% { 
                  transform: translate(-30px, -15px) scale(0.92);
                }
              }
              @keyframes floatOrb4 {
                0%, 100% { 
                  transform: translate(0, 0) scale(1);
                }
                20% { 
                  transform: translate(-35px, 25px) scale(1.03);
                }
                40% { 
                  transform: translate(20px, 45px) scale(0.96);
                }
                60% { 
                  transform: translate(40px, 10px) scale(1.07);
                }
                80% { 
                  transform: translate(-15px, -20px) scale(0.98);
                }
              }
              @keyframes cardGlowPulse {
                0%, 100% { 
                  opacity: 0.3;
                  transform: scale(1);
                }
                50% { 
                  opacity: 0.6;
                  transform: scale(1.02);
                }
              }
              @keyframes cardCenterGlow {
                0%, 100% { 
                  opacity: 0.2;
                  transform: translate(-50%, -50%) scale(0.8);
                }
                50% { 
                  opacity: 0.5;
                  transform: translate(-50%, -50%) scale(1.1);
                }
              }
              @keyframes cardEdgeSlide {
                0%, 100% { 
                  transform: translateY(-100%);
                  opacity: 0;
                }
                50% { 
                  transform: translateY(0%);
                  opacity: 0.8;
                }
              }
            `}</style>
          </div>
        )}

        {/* STEP 3 for Owners: Investment Details */}
        {step === 3 && isOwner && (
          <div className="fade-in relative">
            {/* Premium Card with glassmorphism */}
            <div
              className="relative overflow-hidden rounded-[28px] p-14 border-[1.5px] border-white/12"
              style={{
                background: 'linear-gradient(135deg, rgba(40, 40, 48, 0.85) 0%, rgba(30, 30, 38, 0.75) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Top shimmer line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(110, 241, 149, 0.5) 30%, rgba(74, 222, 128, 0.6) 50%, rgba(110, 241, 149, 0.5) 70%, transparent 100%)',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />

              {/* Header */}
              <div className="mb-12">
                <h1
                  className="text-[44px] font-semibold mb-3 leading-tight"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 2px 20px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Investment Details
                </h1>
                <p className="text-[#A8A8B8] text-base font-light tracking-tight">
                  Tell us about your position
                </p>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-8">
                {/* Avg Buy Price */}
                <div className="form-group-premium relative">
                  <label className="block text-xs font-medium text-[#B0B0C0] mb-3.5 uppercase tracking-[0.12em] transition-colors duration-300">
                    Avg Buy Price
                  </label>
                  <input
                    autoFocus
                    type="number"
                    placeholder="e.g. 150.00"
                    value={formData.bg_price}
                    onChange={e => setFormData({ ...formData, bg_price: e.target.value })}
                    className="w-full rounded-2xl px-6 py-[18px] text-[17px] font-light text-white outline-none transition-all duration-400"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 25, 0.3) 100%)',
                      border: '1.5px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(20, 20, 25, 0.4) 100%)';
                      e.target.style.borderColor = '#6EF195';
                      e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(110, 241, 149, 0.15), 0 0 32px rgba(110, 241, 149, 0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 25, 0.3) 100%)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                {/* Units Owned */}
                <div className="form-group-premium relative">
                  <label className="block text-xs font-medium text-[#B0B0C0] mb-3.5 uppercase tracking-[0.12em] transition-colors duration-300">
                    Units Owned
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={formData.units}
                    onChange={e => setFormData({ ...formData, units: e.target.value })}
                    className="w-full rounded-2xl px-6 py-[18px] text-[17px] font-light text-white outline-none transition-all duration-400"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 25, 0.3) 100%)',
                      border: '1.5px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(20, 20, 25, 0.4) 100%)';
                      e.target.style.borderColor = '#6EF195';
                      e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(110, 241, 149, 0.15), 0 0 32px rgba(110, 241, 149, 0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 25, 0.3) 100%)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setStep(5)}
                    className="group relative overflow-hidden inline-flex items-center gap-3 px-10 py-4 rounded-[14px] text-[#0A0A0F] font-medium text-base cursor-pointer transition-all duration-400"
                    style={{
                      background: 'linear-gradient(135deg, rgba(74, 222, 128, 1) 0%, rgba(110, 241, 149, 1) 50%, rgba(74, 222, 128, 1) 100%)',
                      backgroundSize: '200% 200%',
                      boxShadow: '0 8px 24px rgba(110, 241, 149, 0.35), 0 4px 12px rgba(110, 241, 149, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundPosition = '100% 50%';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 16px 40px rgba(110, 241, 149, 0.45), 0 8px 20px rgba(110, 241, 149, 0.35), 0 0 60px rgba(110, 241, 149, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundPosition = '0% 50%';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(110, 241, 149, 0.35), 0 4px 12px rgba(110, 241, 149, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                    }}
                  >
                    <span className="relative z-10">Next</span>
                    <ArrowRight size={20} className="relative z-10 transition-transform duration-400 group-hover:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Shimmer animation */}
            <style>{`
              @keyframes shimmer {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
              }
              .form-group-premium input::placeholder {
                color: rgba(160, 160, 176, 0.4);
                font-weight: 300;
              }
            `}</style>
          </div>
        )}

        {/* STEP 4: SPECIFIC PRICE INPUT (only if user chose 'specific') */}
        {step === 4 && priceStrategy === 'specific' && (
          <div className="rh-card p-10 fade-in bg-[#141419]/80 backdrop-blur-3xl border border-white/10 rounded-[32px]">
            <h2 className="text-3xl font-bold mb-2 text-white">Target Price</h2>
            <p className="text-gray-500 mb-6">Enter your ideal entry point</p>

            <div className="mb-8">
              <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Target Entry Price</label>
              <input
                autoFocus
                type="number"
                placeholder="e.g. 165.00"
                value={formData.target_price}
                onChange={e => setFormData({ ...formData, target_price: e.target.value })}
                className="rh-input w-full font-mono text-2xl bg-black/20 border-gray-700 text-white"
              />
            </div>

            <div className="flex justify-end">
              <button onClick={nextStep} className="rh-button flex items-center gap-2">
                NEXT <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: STRATEGY SELECTION */}
        {step === 5 && (
          <div className="fade-in relative">
            {/* Premium Card with glassmorphism */}
            <div
              className="relative overflow-hidden rounded-[28px] p-14 border-[1.5px] border-white/12"
              style={{
                background: 'linear-gradient(135deg, rgba(40, 40, 48, 0.85) 0%, rgba(30, 30, 38, 0.75) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Top shimmer line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(110, 241, 149, 0.5) 30%, rgba(74, 222, 128, 0.6) 50%, rgba(110, 241, 149, 0.5) 70%, transparent 100%)',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />

              {/* Header */}
              <div className="text-center mb-11">
                <h1
                  className="text-[44px] font-semibold mb-3 leading-tight"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 2px 20px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Investment Goal?
                </h1>
                <p className="text-[#A8A8B8] text-base font-light tracking-tight">
                  What's your timeframe and approach?
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3.5 mb-9">
                {[
                  {
                    id: 'Long Term',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    ),
                    indicator: '1Y+',
                    description: 'Strategic positions with extended holding periods',
                    risk: 'LOW',
                    freq: 'RARE'
                  },
                  {
                    id: 'Swing Trade',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                    ),
                    indicator: '1W-3M',
                    description: 'Capture momentum over days to weeks',
                    risk: 'MED',
                    freq: 'MED'
                  },
                  {
                    id: 'Quick Scalp',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </svg>
                    ),
                    indicator: 'MIN',
                    description: 'High-frequency micro-movements',
                    risk: 'HIGH',
                    freq: 'HIGH'
                  },
                  {
                    id: 'Hedge',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                      </svg>
                    ),
                    indicator: 'VAR',
                    description: 'Risk mitigation & portfolio protection',
                    risk: 'PROT',
                    freq: 'LOW'
                  }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, strategy: option.id })}
                    className={`group relative overflow-hidden rounded-[18px] border text-left transition-all duration-500 cursor-pointer ${formData.strategy === option.id
                      ? 'border-[#6EF195] -translate-y-0.5'
                      : 'border-white/6 hover:border-[#6EF195]/20 hover:-translate-y-1 hover:scale-[1.02]'
                      }`}
                    style={{
                      background: formData.strategy === option.id
                        ? 'linear-gradient(135deg, rgba(20, 25, 20, 0.9) 0%, rgba(15, 20, 18, 0.8) 100%)'
                        : 'linear-gradient(135deg, rgba(15, 15, 20, 0.8) 0%, rgba(10, 10, 15, 0.6) 100%)',
                      boxShadow: formData.strategy === option.id
                        ? 'inset 0 1px 0 rgba(110, 241, 149, 0.1), 0 0 0 1.5px rgba(110, 241, 149, 0.3), 0 0 40px rgba(110, 241, 149, 0.3), 0 8px 28px rgba(0, 0, 0, 0.5)'
                        : 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 4px 16px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    {/* Diamond animation effect on hover */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {/* 4 triangular edges that converge to diamond then expand */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `
                            linear-gradient(135deg, rgba(44, 133, 77, 0.4) 0%, transparent 50%),
                            linear-gradient(225deg, rgba(44, 133, 77, 0.4) 0%, transparent 50%),
                            linear-gradient(315deg, rgba(44, 133, 77, 0.4) 0%, transparent 50%),
                            linear-gradient(45deg, rgba(44, 133, 77, 0.4) 0%, transparent 50%)
                          `,
                          animation: 'diamondPulse 2s ease-in-out infinite',
                        }}
                      />
                      {/* Center diamond glow */}
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rotate-45"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(44, 133, 77, 0.5) 0%, rgba(44, 133, 77, 0.2) 40%, transparent 70%)',
                          animation: 'diamondBreath 2s ease-in-out infinite',
                        }}
                      />
                      {/* Edge glow lines */}
                      <div
                        className="absolute inset-0"
                        style={{
                          boxShadow: 'inset 0 0 30px rgba(44, 133, 77, 0.3), inset 0 0 60px rgba(44, 133, 77, 0.15)',
                          animation: 'edgeGlow 2s ease-in-out infinite',
                        }}
                      />
                    </div>

                    {/* Data stream effect */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-[2px] ${formData.strategy === option.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, #6EF195 50%, transparent 100%)',
                        animation: 'dataStream 2s ease-in-out infinite',
                      }}
                    />

                    {/* Selection checkmark */}
                    <div
                      className={`absolute top-3 right-3 w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-400 ${formData.strategy === option.id
                        ? 'opacity-100 bg-[#6EF195] border-[#6EF195]'
                        : 'opacity-0'
                        }`}
                      style={{
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: formData.strategy === option.id ? '0 0 16px rgba(110, 241, 149, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)' : 'none',
                      }}
                    >
                      <Check size={12} className="text-black" strokeWidth={3} />
                    </div>

                    {/* Content */}
                    <div className="p-[22px_20px] relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        {/* Icon */}
                        <div
                          className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-400 ${formData.strategy === option.id
                            ? 'scale-100'
                            : 'group-hover:scale-110 group-hover:rotate-[5deg]'
                            }`}
                          style={{
                            background: formData.strategy === option.id
                              ? 'linear-gradient(135deg, rgba(110, 241, 149, 0.2), rgba(74, 222, 128, 0.15))'
                              : 'rgba(255, 255, 255, 0.04)',
                            border: formData.strategy === option.id
                              ? '1px solid #6EF195'
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: formData.strategy === option.id
                              ? '0 0 16px rgba(110, 241, 149, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
                              : 'none',
                          }}
                        >
                          <span className={`transition-all duration-400 ${formData.strategy === option.id
                            ? 'text-[#6EF195] drop-shadow-[0_0_12px_rgba(110,241,149,0.8)]'
                            : 'text-gray-500 group-hover:text-[#6EF195] group-hover:drop-shadow-[0_0_8px_rgba(110,241,149,0.6)]'
                            }`}>
                            {option.icon}
                          </span>
                        </div>

                        {/* Indicator */}
                        <div
                          className={`font-mono text-[10px] font-semibold tracking-[0.05em] px-2.5 py-1 rounded-md transition-all duration-400 ${formData.strategy === option.id
                            ? 'text-[#6EF195] bg-[#6EF195]/15 border-[#6EF195]'
                            : 'text-gray-600 bg-white/3 border-white/6 group-hover:text-[#6EF195] group-hover:bg-[#6EF195]/8 group-hover:border-[#6EF195]/20'
                            }`}
                          style={{ border: '1px solid' }}
                        >
                          {option.indicator}
                        </div>
                      </div>

                      {/* Title */}
                      <div className={`text-[17px] font-medium mb-1.5 tracking-tight transition-all duration-400 ${formData.strategy === option.id
                        ? 'text-white text-shadow-[0_0_20px_rgba(110,241,149,0.3)]'
                        : 'text-[#B0B0C0] group-hover:text-white'
                        }`}>
                        {option.id}
                      </div>

                      {/* Description */}
                      <div className={`text-xs font-light leading-relaxed tracking-tight transition-all duration-400 ${formData.strategy === option.id
                        ? 'text-[#B0B0C0]'
                        : 'text-gray-600 group-hover:text-gray-500'
                        }`}>
                        {option.description}
                      </div>

                      {/* Metrics */}
                      <div className="flex gap-3 mt-3.5 pt-3.5 border-t border-white/4">
                        <div className="flex-1">
                          <div className="text-[9px] text-gray-600 uppercase tracking-[0.08em] font-semibold mb-1">Risk</div>
                          <div className={`font-mono text-[11px] font-semibold transition-all duration-400 ${formData.strategy === option.id
                            ? 'text-[#6EF195] text-shadow-[0_0_8px_rgba(110,241,149,0.4)]'
                            : 'text-gray-500 group-hover:text-[#B0B0C0]'
                            }`}>
                            {option.risk}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[9px] text-gray-600 uppercase tracking-[0.08em] font-semibold mb-1">Freq</div>
                          <div className={`font-mono text-[11px] font-semibold transition-all duration-400 ${formData.strategy === option.id
                            ? 'text-[#6EF195] text-shadow-[0_0_8px_rgba(110,241,149,0.4)]'
                            : 'text-gray-500 group-hover:text-[#B0B0C0]'
                            }`}>
                            {option.freq}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleFinish}
                disabled={!formData.strategy}
                className="w-full group relative overflow-hidden inline-flex items-center justify-center gap-3 py-[18px] px-10 rounded-2xl text-[#0A0A0F] font-semibold text-[15px] uppercase tracking-[0.05em] cursor-pointer transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, rgba(44, 133, 77, 1) 0%, rgba(66, 145, 89, 1) 50%, rgba(44, 133, 77, 1) 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 8px 24px rgba(66, 145, 89, 0.25), 0 4px 12px rgba(66, 145, 89, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
                onMouseEnter={(e) => {
                  if (!formData.strategy) return;
                  e.currentTarget.style.backgroundPosition = '100% 50%';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(66, 145, 89, 0.35), 0 8px 20px rgba(66, 145, 89, 0.25), 0 0 40px rgba(66, 145, 89, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = '0% 50%';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(66, 145, 89, 0.25), 0 4px 12px rgba(66, 145, 89, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
              >
                <Check size={18} className="relative z-10" />
                <span className="relative z-10">Start {isOwner ? 'Tracking' : 'Watching'}</span>
              </button>
            </div>

            {/* Animations */}
            <style>{`
              @keyframes shimmer {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
              }
              @keyframes dataStream {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              @keyframes diamondPulse {
                0% { 
                  opacity: 0.3;
                  transform: scale(1.5);
                }
                50% { 
                  opacity: 0.8;
                  transform: scale(0.8);
                }
                100% { 
                  opacity: 0.3;
                  transform: scale(1.5);
                }
              }
              @keyframes diamondBreath {
                0% { 
                  opacity: 0.2;
                  transform: translate(-50%, -50%) rotate(45deg) scale(0.3);
                }
                50% { 
                  opacity: 0.8;
                  transform: translate(-50%, -50%) rotate(45deg) scale(1.2);
                }
                100% { 
                  opacity: 0.2;
                  transform: translate(-50%, -50%) rotate(45deg) scale(0.3);
                }
              }
              @keyframes edgeGlow {
                0%, 100% { 
                  opacity: 0.5;
                }
                50% { 
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetForm;
