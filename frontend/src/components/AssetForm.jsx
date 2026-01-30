import React, { useState } from 'react';
import { ArrowRight, Check, Eye, Wallet, ArrowLeft, Target, TrendingUp, TrendingDown, Percent, HelpCircle } from 'lucide-react';

const AssetForm = ({ intent, onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [isOwner, setIsOwner] = useState(false);
  const [priceStrategy, setPriceStrategy] = useState(null);
  const [formData, setFormData] = useState({
    ticker: '',
    bg_price: '',
    units: '',
    target_price: '',
    strategy: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

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
    onComplete(formData.ticker);
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
    <div className="min-h-screen flex flex-col justify-center items-center relative z-10 px-4 pt-24">
      {/* Back Button */}
      <button
        onClick={step === 1 ? onBack : prevStep}
        className="fixed top-20 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-semibold">Back</span>
      </button>

      {/* Progress Indicator */}
      <div className="fixed top-20 right-6 flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i <= step ? 'bg-[#5ac53b]' : 'bg-gray-700'
              }`}
          />
        ))}
      </div>

      <div className="w-full max-w-xl">
        {/* STEP 1: COMPANY SEARCH */}
        {step === 1 && (
          <div className="rh-card p-10 fade-in">
            <h2 className="text-3xl font-bold mb-2">Which asset?</h2>
            <p className="text-gray-500 mb-6">Enter the ticker symbol or company name</p>
            <input
              autoFocus
              type="text"
              placeholder="e.g. AAPL, TSLA, NVDA"
              value={formData.ticker}
              onChange={e => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              className="w-full bg-transparent border-b-2 border-gray-700 text-3xl font-mono text-[#5ac53b] focus:border-[#5ac53b] focus:outline-none py-2 mb-8 uppercase placeholder-gray-800"
            />
            <div className="flex justify-end">
              <button
                disabled={!formData.ticker}
                onClick={nextStep}
                className="rh-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                NEXT <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: OWNERSHIP CHECK */}
        {step === 2 && (
          <div className="rh-card p-10 text-center fade-in">
            <h2 className="text-3xl font-bold mb-2">Current Status?</h2>
            <p className="text-gray-500 mb-8">Do you already own this asset?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleOwnerSelection(true)}
                className="p-8 rounded-xl border border-gray-800 hover:bg-[#2c2c2e] hover:border-[#5ac53b] group transition-all"
              >
                <Wallet size={40} className="mx-auto mb-4 text-gray-500 group-hover:text-[#5ac53b] transition-colors" />
                <div className="font-bold text-lg mb-1">I Hold This</div>
                <div className="text-xs text-gray-400">Add to my portfolio</div>
              </button>

              <button
                onClick={() => handleOwnerSelection(false)}
                className="p-8 rounded-xl border border-gray-800 hover:bg-[#2c2c2e] hover:border-blue-400 group transition-all"
              >
                <Eye size={40} className="mx-auto mb-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                <div className="font-bold text-lg mb-1">Just Watching</div>
                <div className="text-xs text-gray-400">Track without owning</div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRICE STRATEGY (NEW!) */}
        {step === 3 && !isOwner && (
          <div className="rh-card p-10 fade-in">
            <h2 className="text-3xl font-bold mb-2">Entry Strategy</h2>
            <p className="text-gray-500 mb-8">How would you like to target your entry?</p>

            <div className="space-y-3">
              {priceOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handlePriceStrategy(option.id)}
                    className={`w-full p-5 rounded-xl border border-gray-800 hover:bg-[#2c2c2e] ${option.hoverBorder} group transition-all flex items-center gap-4 text-left`}
                  >
                    <div className={`p-3 rounded-xl bg-black/30 ${option.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-0.5">{option.title}</div>
                      <div className="text-xs text-gray-500">{option.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 for Owners: Investment Details */}
        {step === 3 && isOwner && (
          <div className="rh-card p-10 fade-in">
            <h2 className="text-3xl font-bold mb-2">Investment Details</h2>
            <p className="text-gray-500 mb-6">Tell us about your position</p>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Avg Buy Price</label>
                <input
                  autoFocus
                  type="number"
                  placeholder="e.g. 150.00"
                  value={formData.bg_price}
                  onChange={e => setFormData({ ...formData, bg_price: e.target.value })}
                  className="rh-input w-full font-mono text-xl"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Units Owned</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.units}
                  onChange={e => setFormData({ ...formData, units: e.target.value })}
                  className="rh-input w-full font-mono text-xl"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setStep(5)} className="rh-button flex items-center gap-2">
                NEXT <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SPECIFIC PRICE INPUT (only if user chose 'specific') */}
        {step === 4 && priceStrategy === 'specific' && (
          <div className="rh-card p-10 fade-in">
            <h2 className="text-3xl font-bold mb-2">Target Price</h2>
            <p className="text-gray-500 mb-6">Enter your ideal entry point</p>

            <div className="mb-8">
              <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Target Entry Price</label>
              <input
                autoFocus
                type="number"
                placeholder="e.g. 165.00"
                value={formData.target_price}
                onChange={e => setFormData({ ...formData, target_price: e.target.value })}
                className="rh-input w-full font-mono text-2xl"
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
          <div className="rh-card p-10 text-center fade-in">
            <h2 className="text-3xl font-bold mb-2">Investment Goal?</h2>
            <p className="text-gray-500 mb-8">What's your timeframe and approach?</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {['Long Term', 'Swing Trade', 'Quick Scalp', 'Hedge'].map(strat => (
                <button
                  key={strat}
                  onClick={() => setFormData({ ...formData, strategy: strat })}
                  className={`p-4 rounded-xl border transition-all ${formData.strategy === strat
                    ? 'bg-[#5ac53b]/20 border-[#5ac53b] text-[#5ac53b]'
                    : 'border-gray-800 text-gray-400 hover:bg-[#2c2c2e]'
                    }`}
                >
                  {strat}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={!formData.strategy}
              className="w-full rh-button py-4 text-lg font-black uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Check size={24} /> START {isOwner ? 'TRACKING' : 'WATCHING'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetForm;
