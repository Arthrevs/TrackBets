import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Shield, Zap, BarChart3, Users, Target, Clock } from 'lucide-react';
import SentimentMeter from './SentimentMeter';

// Enhanced Insight Card Component
const InsightCard = ({ card, isActive, progress }) => {
    const colorStyles = {
        risk: {
            bg: 'bg-linear-to-br from-red-500/20 via-red-600/10 to-transparent',
            border: 'border-red-500/30',
            icon: 'text-red-400',
            glow: 'shadow-[inset_0_0_30px_rgba(239,68,68,0.1)]'
        },
        opportunity: {
            bg: 'bg-linear-to-br from-green-500/20 via-green-600/10 to-transparent',
            border: 'border-green-500/30',
            icon: 'text-green-400',
            glow: 'shadow-[inset_0_0_30px_rgba(34,197,94,0.1)]'
        },
        warning: {
            bg: 'bg-linear-to-br from-orange-500/20 via-orange-600/10 to-transparent',
            border: 'border-orange-500/30',
            icon: 'text-orange-400',
            glow: 'shadow-[inset_0_0_30px_rgba(249,115,22,0.1)]'
        },
        sentiment: {
            bg: 'bg-linear-to-br from-purple-500/20 via-purple-600/10 to-transparent',
            border: 'border-purple-500/30',
            icon: 'text-purple-400',
            glow: 'shadow-[inset_0_0_30px_rgba(168,85,247,0.1)]'
        },
        info: {
            bg: 'bg-linear-to-br from-blue-500/20 via-blue-600/10 to-transparent',
            border: 'border-blue-500/30',
            icon: 'text-blue-400',
            glow: 'shadow-[inset_0_0_30px_rgba(59,130,246,0.1)]'
        }
    };

    const style = colorStyles[card.type] || colorStyles.info;
    const Icon = card.icon;

    return (
        <div
            className={`absolute inset-0 rounded-2xl p-6 transition-all duration-500 border backdrop-blur-sm
                ${style.bg} ${style.border} ${style.glow}
                ${isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'}`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-black/40 ${style.icon} transition-transform ${isActive ? 'scale-100' : 'scale-90'}`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{card.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
                </div>
            </div>
            {/* Progress bar at bottom */}
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-2xl overflow-hidden">
                    <div
                        className="h-full bg-white/30 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

const StockDetail = ({ ticker, onBack }) => {
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [cardProgress, setCardProgress] = useState(0);

    // Mock AI Insights - Indian market focused
    const aiRecommendation = {
        action: 'BUY',
        confidence: 87,
        summary: "Strong bullish signals detected. Technical indicators show oversold conditions with high institutional accumulation. Entry point optimal within next 48 hours.",
        priceTarget: '₹16,250',
        currentPrice: '₹14,425.80',
        upside: '+12.6%',
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

    // Auto-shuffle cards with progress
    useEffect(() => {
        const interval = setInterval(() => {
            setCardProgress((prev) => {
                if (prev >= 100) {
                    setActiveCardIndex((idx) => (idx + 1) % insightCards.length);
                    return 0;
                }
                return prev + 2.5;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [insightCards.length]);

    const isUp = true;
    const colorClass = isUp ? 'text-[#5ac53b]' : 'text-[#ff5252]';
    const strokeColor = isUp ? '#5ac53b' : '#ff5252';
    const ArrowIcon = isUp ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="min-h-screen bg-[#050505] text-white relative z-20 overflow-y-auto pb-32 pt-20 fade-in">
            <div className="px-6 max-w-2xl mx-auto">

                {/* Header with live indicator */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">LIVE</span>
                        </div>
                        <h1 className="text-4xl font-bold">{ticker || "RELIANCE"}</h1>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold">₹14,425.80</div>
                        <div className={`flex items-center gap-1 justify-end text-sm font-bold ${colorClass}`}>
                            <ArrowIcon size={16} />
                            <span>+2.34% today</span>
                        </div>
                    </div>
                </div>

                {/* 🔥 PREMIUM AI INSIGHT CARD */}
                <div className="relative mb-8 group">
                    {/* Animated glow effect */}
                    <div className="absolute -inset-2 bg-linear-to-r from-purple-600 via-blue-500 to-green-400 rounded-3xl opacity-30 blur-xl group-hover:opacity-50 transition-opacity ai-card-glow" />

                    {/* Main Card */}
                    <div className="relative bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-8 border border-white/10 overflow-hidden sparkle">
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 shimmer opacity-50 pointer-events-none" />

                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-6 relative">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/20">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">AI RECOMMENDATION</div>
                                    <div className="text-sm text-gray-500">Powered by TrackBets AI</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Confidence</div>
                                <div className="text-3xl font-black text-gradient">{aiRecommendation.confidence}%</div>
                            </div>
                        </div>

                        {/* Big Action Badge */}
                        <div className="mb-6 relative">
                            <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-4xl font-black tracking-wider
                                ${aiRecommendation.action === 'BUY' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40 glow-green' :
                                    aiRecommendation.action === 'SELL' ? 'bg-red-500/20 text-red-400 border-2 border-red-500/40 glow-red' :
                                        'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40'}`}>
                                {aiRecommendation.action === 'BUY' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                                {aiRecommendation.action}
                            </div>
                        </div>

                        {/* Summary */}
                        <p className="text-gray-300 text-lg leading-relaxed mb-8 relative">
                            {aiRecommendation.summary}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 relative">
                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target size={14} className="text-green-400" />
                                    <span className="text-xs text-gray-500 uppercase tracking-widest">Target</span>
                                </div>
                                <div className="text-xl font-bold text-green-400">{aiRecommendation.priceTarget}</div>
                                <div className="text-xs text-green-400/70">{aiRecommendation.upside}</div>
                            </div>
                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock size={14} className="text-blue-400" />
                                    <span className="text-xs text-gray-500 uppercase tracking-widest">Timeframe</span>
                                </div>
                                <div className="text-xl font-bold text-blue-400">{aiRecommendation.timeframe}</div>
                            </div>
                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 size={14} className="text-purple-400" />
                                    <span className="text-xs text-gray-500 uppercase tracking-widest">Risk</span>
                                </div>
                                <div className="text-xl font-bold text-purple-400">Medium</div>
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
                                onClick={() => { setActiveCardIndex(i); setCardProgress(0); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeCardIndex ? 'w-10 bg-white' : 'w-3 bg-gray-700 hover:bg-gray-600'}`}
                            />
                        ))}
                    </div>

                    {/* Cards Stack */}
                    <div className="relative h-36">
                        {insightCards.map((card, i) => (
                            <InsightCard key={i} card={card} isActive={i === activeCardIndex} progress={cardProgress} />
                        ))}
                    </div>
                </div>

                {/* 📈 METRICS CARDS */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="rh-card p-5 group hover:border-green-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                                <BarChart3 size={16} />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Market Cap</span>
                        </div>
                        <div className="text-2xl font-bold">₹19.4L Cr</div>
                    </div>
                    <div className="rh-card p-5 group hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={16} />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Volume</span>
                        </div>
                        <div className="text-2xl font-bold">2.8 Cr</div>
                    </div>
                </div>

                {/* Sentiment Meter */}
                <div className="mb-8">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Market Sentiment</h3>
                    <div className="rh-card overflow-hidden">
                        <SentimentMeter score={85} />
                    </div>
                </div>

                {/* 📉 ENHANCED PRICE CHART */}
                <div className="mb-8">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Price History</h3>
                    <div className="rh-card p-6">
                        <div className="h-48 w-full relative">
                            <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines */}
                                <line x1="0" y1="40" x2="400" y2="40" stroke="#222" strokeWidth="1" />
                                <line x1="0" y1="80" x2="400" y2="80" stroke="#222" strokeWidth="1" />
                                <line x1="0" y1="120" x2="400" y2="120" stroke="#222" strokeWidth="1" />

                                {/* Gradient fill under the line */}
                                <path
                                    d="M0,120 C20,115 50,125 80,120 C110,115 140,130 170,125 C200,120 210,100 220,100 L230,110 L240,105 L260,80 L280,85 L300,60 L330,65 L350,50 L380,55 L400,40 L400,150 L0,150 Z"
                                    fill="url(#chartGradient)"
                                />

                                {/* Main line with animation */}
                                <path
                                    d="M0,120 C20,115 50,125 80,120 C110,115 140,130 170,125 C200,120 210,100 220,100 L230,110 L240,105 L260,80 L280,85 L300,60 L330,65 L350,50 L380,55 L400,40"
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    className="chart-line-animated"
                                />

                                {/* End point with glow */}
                                <circle cx="400" cy="40" r="6" fill={strokeColor} className="animate-pulse" />
                                <circle cx="400" cy="40" r="3" fill="white" />
                            </svg>
                        </div>

                        {/* Timeframe Pills */}
                        <div className="flex justify-between font-bold text-xs text-gray-500 mt-4 pt-4 border-t border-gray-800">
                            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf, i) => (
                                <button
                                    key={tf}
                                    className={`px-4 py-2 rounded-lg transition-all ${i === 0 ? 'text-[#5ac53b] bg-[#5ac53b]/10 shadow-sm' : 'hover:bg-white/5'}`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Position Info */}
                <div className="rh-card p-6 mb-8 border-l-4 border-green-500/50">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 font-bold">Your Position</span>
                        <span className="text-white font-mono font-bold text-xl">₹1,44,258</span>
                    </div>
                    <div className="rh-divider my-4" />
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold">Avg Cost</span>
                        <span className="text-white font-mono font-bold">₹13,850.40</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400 font-bold">P&L</span>
                        <span className="text-green-400 font-mono font-bold">+₹5,753 (+4.15%)</span>
                    </div>
                </div>
            </div>

            {/* 🔥 STICKY ACTION BUTTONS */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-[#050505] via-[#050505] to-transparent z-50">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <button className="flex-1 btn-sell py-4 rounded-2xl font-bold text-lg text-white">
                        SELL
                    </button>
                    <button className="flex-1 btn-buy py-4 rounded-2xl font-bold text-lg text-black">
                        BUY
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
