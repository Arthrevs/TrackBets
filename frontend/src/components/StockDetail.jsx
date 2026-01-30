import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Shield, Zap, BarChart3, Users } from 'lucide-react';
import SentimentMeter from './SentimentMeter';

// Shuffling Insight Cards Component
const InsightCard = ({ card, isActive }) => {
    const baseClasses = "absolute inset-0 rounded-2xl p-6 transition-all duration-500 border";

    const colorStyles = {
        risk: {
            bg: 'bg-gradient-to-br from-red-500/20 to-red-900/30',
            border: 'border-red-500/30',
            icon: 'text-red-400'
        },
        opportunity: {
            bg: 'bg-gradient-to-br from-green-500/20 to-green-900/30',
            border: 'border-green-500/30',
            icon: 'text-green-400'
        },
        warning: {
            bg: 'bg-gradient-to-br from-orange-500/20 to-orange-900/30',
            border: 'border-orange-500/30',
            icon: 'text-orange-400'
        },
        sentiment: {
            bg: 'bg-gradient-to-br from-purple-500/20 to-purple-900/30',
            border: 'border-purple-500/30',
            icon: 'text-purple-400'
        },
        info: {
            bg: 'bg-gradient-to-br from-blue-500/20 to-blue-900/30',
            border: 'border-blue-500/30',
            icon: 'text-blue-400'
        }
    };

    const style = colorStyles[card.type] || colorStyles.info;
    const Icon = card.icon;

    return (
        <div
            className={`${baseClasses} ${style.bg} ${style.border} ${isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'}`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-black/30 ${style.icon}`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{card.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
                </div>
            </div>
        </div>
    );
};

const StockDetail = ({ ticker, onBack }) => {
    const [activeCardIndex, setActiveCardIndex] = useState(0);

    // Mock AI Insights - Indian market focused
    const aiRecommendation = {
        action: 'BUY',
        confidence: 87,
        summary: "Strong bullish signals detected. Technical indicators show oversold conditions with high institutional accumulation. Entry point optimal within next 48 hours.",
        priceTarget: '₹16,250',
        timeframe: '3-6 months'
    };

    // Shuffling cards data
    const insightCards = [
        {
            type: 'opportunity',
            icon: TrendingUp,
            title: 'Undervalued by 15%',
            description: 'Current price is significantly below intrinsic value based on DCF analysis and peer comparison.'
        },
        {
            type: 'risk',
            icon: AlertTriangle,
            title: 'High Volatility Alert',
            description: 'Beta of 1.4 indicates higher price swings. Consider position sizing accordingly.'
        },
        {
            type: 'warning',
            icon: Zap,
            title: 'Quarterly Results in 12 Days',
            description: 'Q4 results scheduled. Historical post-results moves average ±8%.'
        },
        {
            type: 'sentiment',
            icon: Users,
            title: '85% Bullish Sentiment',
            description: 'Analyst consensus heavily favors upside. Unusual options activity detected on NSE.'
        },
        {
            type: 'info',
            icon: Shield,
            title: 'Strong Fundamentals',
            description: 'Revenue growth 23% YoY, healthy debt-to-equity ratio of 0.4, expanding margins.'
        }
    ];

    // Auto-shuffle cards
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCardIndex((prev) => (prev + 1) % insightCards.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [insightCards.length]);

    const isUp = true;
    const colorClass = isUp ? 'text-[#5ac53b]' : 'text-[#ff5252]';
    const strokeColor = isUp ? '#5ac53b' : '#ff5252';

    return (
        <div className="min-h-screen bg-black text-white relative z-20 overflow-y-auto pb-20 pt-20 fade-in">
            <div className="px-6 max-w-2xl mx-auto">

                {/* Compact Header - INR pricing */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">TRACKING</div>
                        <h1 className="text-3xl font-bold">{ticker || "RELIANCE"}</h1>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold">₹14,425.80</div>
                        <div className={`flex items-center gap-1 justify-end text-sm font-bold ${colorClass}`}>
                            <ArrowUpRight size={14} />
                            <span>+2.34%</span>
                        </div>
                    </div>
                </div>

                {/* 🔥 BIG AI INSIGHT CARD - HERO */}
                <div className="relative mb-8 group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 rounded-3xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />

                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-8 border border-white/10">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest">AI RECOMMENDATION</div>
                                    <div className="text-sm text-gray-500">Powered by TrackBets AI</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Confidence</div>
                                <div className="text-2xl font-bold text-purple-400">{aiRecommendation.confidence}%</div>
                            </div>
                        </div>

                        {/* Big Action */}
                        <div className="mb-6">
                            <div className={`inline-block px-6 py-3 rounded-full text-3xl font-black tracking-wider ${aiRecommendation.action === 'BUY' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                aiRecommendation.action === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                {aiRecommendation.action}
                            </div>
                        </div>

                        {/* Summary */}
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            {aiRecommendation.summary}
                        </p>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/30 rounded-xl p-4">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Price Target</div>
                                <div className="text-xl font-bold text-green-400">{aiRecommendation.priceTarget}</div>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Timeframe</div>
                                <div className="text-xl font-bold text-blue-400">{aiRecommendation.timeframe}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📊 SHUFFLING INSIGHT CARDS */}
                <div className="mb-8">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">QUICK INSIGHTS</h3>

                    {/* Card carousel indicator */}
                    <div className="flex gap-2 mb-4">
                        {insightCards.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveCardIndex(i)}
                                className={`h-1 rounded-full transition-all ${i === activeCardIndex ? 'w-8 bg-white' : 'w-4 bg-gray-700'}`}
                            />
                        ))}
                    </div>

                    {/* Cards Stack */}
                    <div className="relative h-32">
                        {insightCards.map((card, i) => (
                            <InsightCard key={i} card={card} isActive={i === activeCardIndex} />
                        ))}
                    </div>
                </div>

                {/* 📈 MINI INFO CARDS - INR values */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="rh-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={16} className="text-gray-500" />
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Market Cap</span>
                        </div>
                        <div className="text-xl font-bold">₹19.4L Cr</div>
                    </div>
                    <div className="rh-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-gray-500" />
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Volume</span>
                        </div>
                        <div className="text-xl font-bold">2.8 Cr</div>
                    </div>
                </div>

                {/* Sentiment Meter */}
                <div className="mb-8">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Market Sentiment</h3>
                    <div className="rh-card">
                        <SentimentMeter score={85} />
                    </div>
                </div>

                {/* 📉 PRICE CHART - NOW AT BOTTOM */}
                <div className="mb-8">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Price History</h3>
                    <div className="rh-card p-6">
                        <div className="h-48 w-full relative">
                            <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                                <line x1="0" y1="120" x2="400" y2="120" stroke="#222" strokeDasharray="4 4" strokeWidth="1" />
                                <path
                                    d="M0,120 C20,115 50,125 80,120 C110,115 140,130 170,125 C200,120 210,100 220,100 L230,110 L240,105 L260,80 L280,85 L300,60 L330,65 L350,50 L380,55 L400,40"
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="2.5"
                                />
                                <circle cx="400" cy="40" r="4" fill={strokeColor} />
                            </svg>
                        </div>

                        {/* Timeframe Pills */}
                        <div className="flex justify-between font-bold text-xs text-gray-500 mt-4 pt-4 border-t border-gray-800">
                            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf, i) => (
                                <button key={tf} className={`px-3 py-1 rounded transition-colors ${i === 0 ? 'text-[#5ac53b] bg-[#5ac53b]/10' : 'hover:bg-gray-900'}`}>
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Position Info - INR values */}
                <div className="rh-card p-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 font-bold">Your Position</span>
                        <span className="text-white font-mono font-bold">₹1,44,258</span>
                    </div>
                    <div className="rh-divider my-4"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold">Avg Cost</span>
                        <span className="text-white font-mono font-bold">₹13,850.40</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StockDetail;
