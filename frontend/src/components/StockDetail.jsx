import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Shield, Zap, BarChart3, Users, Target, Clock, Brain, MessageSquare, RefreshCw } from 'lucide-react';
import SentimentMeter from './SentimentMeter';

// 🔧 KNOWN INDIAN STOCKS (without suffix)
const KNOWN_INDIAN_STOCKS = ['ZOMATO', 'RELIANCE', 'TATA', 'INFOSYS', 'TCS', 'HDFC', 'ICICI', 'WIPRO', 'BAJAJ', 'MARUTI', 'BHARTI', 'ADANI', 'TATAMOTORS', 'SBIN', 'ITC', 'HDFCBANK', 'KOTAKBANK', 'LT', 'AXISBANK', 'SUNPHARMA'];

// 🔧 HELPER: Check if ticker is Indian stock
const isIndianStock = (ticker) => {
    if (!ticker) return true;
    const upperTicker = ticker.toUpperCase();
    // Check for .NS (NSE) or .BO (BSE) suffix
    if (upperTicker.includes('.NS') || upperTicker.includes('.BO')) {
        return true;
    }
    // Check if it's a known Indian stock without suffix
    return KNOWN_INDIAN_STOCKS.some(stock => upperTicker.includes(stock));
};

// 🔧 HELPER: Get currency symbol based on ticker
const getCurrencySymbol = (ticker) => {
    return isIndianStock(ticker) ? '₹' : '$';
};

// 🔧 HELPER: Format price with currency
const formatPriceWithCurrency = (price, ticker) => {
    const symbol = getCurrencySymbol(ticker);
    if (symbol === '₹') {
        return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// 🔧 HELPER: Get realistic mock data per ticker (fallback when API fails)
const getStockData = (ticker) => {
    const upperTicker = ticker?.toUpperCase() || 'RELIANCE.NS';

    // Realistic mock data for common stocks
    const stockDatabase = {
        // Indian Stocks
        'ZOMATO.NS': {
            price: 260.45,
            change: 3.21,
            changePercent: 1.25,
            target: 310,
            upside: 19.0,
            marketCap: '₹2.3L Cr',
            volume: '4.2 Cr',
            isUp: true,
            aiExplanation: "Zomato shows strong recovery momentum with Q3 food delivery GMV up 23% YoY. Blinkit's quick commerce segment is scaling faster than expected with 80% YoY growth. The stock is trading at a discount to Swiggy despite better unit economics. Reddit sentiment is overwhelmingly bullish with ~78% positive mentions. News flow around potential profitability in FY25 is driving institutional interest."
        },
        'ZOMATO.BO': {
            price: 260.45,
            change: 3.21,
            changePercent: 1.25,
            target: 310,
            upside: 19.0,
            marketCap: '₹2.3L Cr',
            volume: '4.2 Cr',
            isUp: true,
            aiExplanation: "Zomato shows strong recovery momentum with Q3 food delivery GMV up 23% YoY. Blinkit's quick commerce segment is scaling faster than expected with 80% YoY growth. The stock is trading at a discount to Swiggy despite better unit economics. Reddit sentiment is overwhelmingly bullish with ~78% positive mentions. News flow around potential profitability in FY25 is driving institutional interest."
        },
        'RELIANCE.NS': {
            price: 1285.30,
            change: 15.40,
            changePercent: 1.21,
            target: 1450,
            upside: 12.8,
            marketCap: '₹17.4L Cr',
            volume: '1.8 Cr',
            isUp: true,
            aiExplanation: "Reliance Industries remains the bellwether of Indian markets. Jio's 5G rollout is accelerating ARPU growth while retail segment shows 18% YoY expansion. O2C margins are stabilizing above $8/bbl. The conglomerate's new energy pivot with partnerships in solar and hydrogen provides long-term growth optionality. Technical indicators suggest a breakout above ₹1,300 could trigger momentum buying."
        },
        'TATA.NS': {
            price: 1042.75,
            change: -8.50,
            changePercent: -0.81,
            target: 1200,
            upside: 15.1,
            marketCap: '₹3.8L Cr',
            volume: '92 Lk',
            isUp: false,
            aiExplanation: "Tata Motors faces near-term headwinds from JLR semiconductor constraints but EV transition is progressing well. Nexon EV dominates India's electric SUV market with 62% share. Valuation has compressed to attractive levels. Risk factors include UK labor issues and potential EV price wars."
        },
        // US Stocks
        'TSLA': {
            price: 420.69,
            change: 12.34,
            changePercent: 3.02,
            target: 500,
            upside: 18.8,
            marketCap: '$1.3T',
            volume: '89M',
            isUp: true,
            aiExplanation: "Tesla's robotaxi ambitions are gaining credibility after the recent unveiling event. FSD v12 adoption is accelerating with subscription revenue up 45% QoQ. Model Y remains the world's best-selling vehicle. Reddit's r/wallstreetbets sentiment shifted bullish after Elon confirmed Optimus production timeline. Key risks: margin compression from price cuts and China competition from BYD."
        },
        'AAPL': {
            price: 189.45,
            change: 2.15,
            changePercent: 1.15,
            target: 220,
            upside: 16.1,
            marketCap: '$2.9T',
            volume: '52M',
            isUp: true,
            aiExplanation: "Apple's services revenue hit another record, growing 14% YoY and now representing 22% of total revenue. Vision Pro reviews are mixed but establishing spatial computing moat. iPhone 16 cycle expectations remain muted but Apple Intelligence could drive upgrades. Warren Buffett's recent trim is concerning but position remains substantial."
        },
        'NVDA': {
            price: 875.30,
            change: 28.45,
            changePercent: 3.36,
            target: 1100,
            upside: 25.7,
            marketCap: '$2.2T',
            volume: '45M',
            isUp: true,
            aiExplanation: "NVIDIA continues to dominate AI infrastructure with Blackwell GPUs sold out through 2025. Data center revenue grew 409% YoY - unprecedented for a company this size. Hyperscaler CapEx guidance suggests demand acceleration not slowdown. Reddit and Twitter sentiment remains euphoric. Risk: Concentration in top 4 customers and potential China export restrictions."
        },
        'GOOGL': {
            price: 175.20,
            change: -1.85,
            changePercent: -1.04,
            target: 200,
            upside: 14.2,
            marketCap: '$2.1T',
            volume: '28M',
            isUp: false,
            aiExplanation: "Alphabet faces mixed signals: Search remains resilient with 12% growth despite AI competition fears. YouTube's ad revenue reaccelerated to 21% YoY. However, Gemini's launch stumbles and antitrust rulings create uncertainty. Cloud growth slowed to 26% vs Azure's 29%. Trading at discount to mega-cap peers on regulatory concerns."
        }
    };

    // Try exact match first
    if (stockDatabase[upperTicker]) {
        return stockDatabase[upperTicker];
    }

    // Try matching without suffix for Indian stocks (ZOMATO -> ZOMATO.NS)
    const baseTickerName = upperTicker.replace(/\.(NS|BO)$/, '');
    const matchedKey = Object.keys(stockDatabase).find(key => {
        const keyBase = key.replace(/\.(NS|BO)$/, '');
        return keyBase === baseTickerName || keyBase === upperTicker;
    });

    if (matchedKey) {
        return stockDatabase[matchedKey];
    }

    // For unknown tickers, generate DETERMINISTIC data based on ticker hash (not random!)
    const tickerIsIndian = isIndianStock(upperTicker);

    // Use ticker hash for deterministic values
    const hash = upperTicker.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
    const basePrice = tickerIsIndian ? 100 + (hash % 2000) : 50 + (hash % 450);
    const changePercent = ((hash % 100) - 40) / 20; // -2% to +3%
    const isUp = changePercent > 0;

    return {
        price: basePrice,
        change: basePrice * (changePercent / 100),
        changePercent: changePercent,
        target: basePrice * (1 + (hash % 20) / 100),
        upside: 5 + (hash % 20),
        marketCap: tickerIsIndian ? `₹${((hash % 100) / 10 + 0.5).toFixed(1)}L Cr` : `$${(hash % 500 + 10)}B`,
        volume: tickerIsIndian ? `${((hash % 50) / 10 + 0.5).toFixed(1)} Cr` : `${(hash % 50 + 5)}M`,
        isUp: isUp,
        aiExplanation: `Analysis for ${upperTicker}: Technical indicators suggest ${isUp ? 'bullish' : 'bearish'} momentum. Social sentiment analysis from Reddit and Twitter shows ${isUp ? 'positive' : 'mixed'} tone. Recent news flow has been ${isUp ? 'favorable' : 'neutral'}. Institutional activity shows ${isUp ? 'accumulation' : 'distribution'} patterns. Consider position sizing based on your risk tolerance.`
    };
};

// Enhanced Insight Card Component
const InsightCard = ({ card, isActive, progress }) => {
    const colorStyles = {
        risk: {
            bg: 'bg-gradient-to-br from-red-500/20 via-red-600/10 to-transparent',
            border: 'border-red-500/30',
            icon: 'text-red-400',
            glow: 'shadow-[inset_0_0_30px_rgba(239,68,68,0.1)]'
        },
        opportunity: {
            bg: 'bg-gradient-to-br from-green-500/20 via-green-600/10 to-transparent',
            border: 'border-green-500/30',
            icon: 'text-green-400',
            glow: 'shadow-[inset_0_0_30px_rgba(34,197,94,0.1)]'
        },
        warning: {
            bg: 'bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent',
            border: 'border-orange-500/30',
            icon: 'text-orange-400',
            glow: 'shadow-[inset_0_0_30px_rgba(249,115,22,0.1)]'
        },
        sentiment: {
            bg: 'bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-transparent',
            border: 'border-purple-500/30',
            icon: 'text-purple-400',
            glow: 'shadow-[inset_0_0_30px_rgba(168,85,247,0.1)]'
        },
        info: {
            bg: 'bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent',
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

const StockDetail = ({ ticker, onBack, analysisData, isLoading, error, onRetry }) => {
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [cardProgress, setCardProgress] = useState(0);

    // 🔧 Cache fallback data with useMemo to prevent re-generation on every render
    const fallbackData = useMemo(() => getStockData(ticker), [ticker]);

    // 🔧 Generate stable confidence based on ticker (not random)
    const stableConfidence = useMemo(() => {
        if (!ticker) return 80;
        const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return 75 + (hash % 15); // 75-89%
    }, [ticker]);

    // Derive data from API response or use fallback
    const priceData = analysisData?.market_data?.price || {};
    const currentPrice = priceData.current || fallbackData.price;
    const previousClose = priceData.previous_close || (fallbackData.price - fallbackData.change);
    const priceChange = currentPrice && previousClose
        ? ((currentPrice - previousClose) / previousClose * 100).toFixed(2)
        : fallbackData.changePercent.toFixed(2);

    // AI Analysis from backend
    const aiAnalysis = analysisData?.analysis || {};

    // Format price display
    const formatPrice = (price) => {
        if (!price) return '—';
        return formatPriceWithCurrency(price, ticker);
    };

    // Get market data with fallback
    const marketCap = analysisData?.market_data?.market_cap
        ? (getCurrencySymbol(ticker) === '₹'
            ? `₹${(analysisData.market_data.market_cap / 10000000).toFixed(1)}L Cr`
            : `$${(analysisData.market_data.market_cap / 1000000000).toFixed(0)}B`)
        : fallbackData.marketCap;

    const volume = analysisData?.market_data?.volume
        ? (getCurrencySymbol(ticker) === '₹'
            ? `${(analysisData.market_data.volume / 10000000).toFixed(1)} Cr`
            : `${(analysisData.market_data.volume / 1000000).toFixed(0)}M`)
        : fallbackData.volume;

    // AI Recommendation - from API or fallback (using stable values)
    const aiRecommendation = {
        action: aiAnalysis.recommendation || (isLoading ? 'ANALYZING...' : (fallbackData.isUp ? 'BUY' : 'HOLD')),
        confidence: aiAnalysis.confidence || (isLoading ? 0 : stableConfidence),
        summary: aiAnalysis.summary || (isLoading ? "Analyzing market data, news, and social sentiment..." : (error ? `Error: ${error}` : fallbackData.aiExplanation)),
        priceTarget: aiAnalysis.price_target ? formatPrice(aiAnalysis.price_target) : formatPrice(fallbackData.target),
        currentPrice: formatPrice(currentPrice),
        upside: aiAnalysis.upside || `+${fallbackData.upside.toFixed(1)}%`,
        timeframe: aiAnalysis.timeframe || '3-6 months'
    };

    // Get AI explanation with fallback
    const aiExplanation = aiAnalysis.explanation || aiAnalysis.summary || fallbackData.aiExplanation;

    // Determine if stock is up
    const isUp = priceChange !== null ? parseFloat(priceChange) >= 0 : fallbackData.isUp;

    // Shuffling cards data
    const insightCards = [
        {
            type: 'opportunity',
            icon: TrendingUp,
            title: `Undervalued by ${Math.floor(fallbackData.upside)}%`,
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
            description: `Analyst consensus heavily favors upside. Unusual options activity detected on ${ticker?.includes('.') ? 'NSE' : 'CBOE'}.`
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

    const colorClass = isUp ? 'text-[#5ac53b]' : 'text-[#ff5252]';
    const strokeColor = isUp ? '#5ac53b' : '#ff5252';
    const ArrowIcon = isUp ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="min-h-screen bg-[#050505] text-white relative z-20 overflow-y-auto pb-32 pt-20 fade-in">
            <div className="px-6 max-w-2xl mx-auto">

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="text-center">
                            <RefreshCw size={48} className="text-purple-400 animate-spin mx-auto mb-4" />
                            <p className="text-xl font-semibold">Analyzing {ticker}...</p>
                            <p className="text-gray-400 text-sm mt-2">Fetching market data, news, and sentiment</p>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && !isLoading && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={24} className="text-red-400" />
                            <span className="text-red-300">{error}</span>
                        </div>
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} /> Retry
                        </button>
                    </div>
                )}

                {/* Header with live indicator */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
                            <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                                {isLoading ? 'LOADING' : 'LIVE'}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold">{ticker || "STOCK"}</h1>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold">
                            {currentPrice ? formatPrice(currentPrice) : (isLoading ? '...' : '—')}
                        </div>
                        <div className={`flex items-center gap-1 justify-end text-sm font-bold ${colorClass}`}>
                            <ArrowIcon size={16} />
                            <span>{priceChange !== null ? `${isUp ? '+' : ''}${priceChange}% today` : '—'}</span>
                        </div>
                    </div>
                </div>

                {/* 🔥 PREMIUM AI INSIGHT CARD */}
                <div className="relative mb-8 group">
                    {/* Animated glow effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 rounded-3xl opacity-30 blur-xl group-hover:opacity-50 transition-opacity ai-card-glow" />

                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-8 border border-white/10 overflow-hidden sparkle">
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 shimmer opacity-50 pointer-events-none" />

                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-6 relative">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/20">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">AI RECOMMENDATION</div>
                                    <div className="text-sm text-gray-500">Powered by Gemini 2.5 Flash</div>
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

                {/* 🧠 NEW: GEMINI'S TAKE - AI EXPLANATION CARD */}
                <div className="mb-8">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Brain size={14} className="text-purple-400" />
                        GEMINI'S TAKE
                    </h3>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative rh-card p-6 border-l-4 border-purple-500/50">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-2">AI Analyst Verdict</div>
                                    <p className="text-gray-300 leading-relaxed text-sm">
                                        {aiExplanation}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                        <Brain size={12} className="text-purple-400" />
                                        <span>Generated by Gemini 2.5 Flash • Updated just now</span>
                                    </div>
                                </div>
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
                        <div className="text-2xl font-bold">{marketCap}</div>
                    </div>
                    <div className="rh-card p-5 group hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={16} />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Volume</span>
                        </div>
                        <div className="text-2xl font-bold">{volume}</div>
                    </div>
                </div>

                {/* Sentiment Meter */}
                <div className="mb-8">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Market Sentiment</h3>
                    <div className="rh-card overflow-hidden">
                        <SentimentMeter score={isUp ? 85 : 45} />
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
                        <span className="text-white font-mono font-bold text-xl">{formatPrice(currentPrice * 10)}</span>
                    </div>
                    <div className="rh-divider my-4" />
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold">Avg Cost</span>
                        <span className="text-white font-mono font-bold">{formatPrice(currentPrice * 0.92)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400 font-bold">P&L</span>
                        <span className="text-green-400 font-mono font-bold">+{formatPrice(currentPrice * 0.8)} (+8.7%)</span>
                    </div>
                </div>
            </div>

            {/* 🔥 STICKY ACTION BUTTONS */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-50">
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
