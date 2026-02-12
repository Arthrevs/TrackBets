import React, { useState, useEffect } from 'react';
import './AnalysisPage.css'; // Import the new CSS
import {
    AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

const StockDetail = ({ ticker, onBack, analysisData, isLoading, error, onRetry }) => {
    // Determine data source items
    const data = analysisData || {};
    const priceData = data.price_data || {};
    const analysis = data.analysis || {};
    const verdict = analysis.verdict?.signal || "WAIT";
    const confidence = analysis.verdict?.confidence || 50;

    // Fallback graph data
    const graphPoints = data.graph_data?.points || [];

    // Parse social tweets if possible, else mock
    // brain.py returns string for 'social'. We might need to split it?
    // User HTML expects tweets.
    // If analysisData.social is a string, let's try to parse distinct items or use defaults.
    const socialText = typeof data.social === 'string' ? data.social : "";
    const socialItems = socialText.split('\n').filter(line => line.trim().length > 10).map((line, i) => ({
        source: line.includes('[r/') ? 'Reddit' : 'Social Media',
        handle: '@User' + i,
        content: line.replace(/^\d+\.\s+/, '') // Remove "1. " numbering
    })).slice(0, 3);

    // Quick Insights (Reasons)
    const insights = analysis.reasons || ["Analyzing market data...", "calculating volatility...", "checking news feeds..."];

    // Loading State
    if (isLoading) {
        return (
            <div className="analysis-container flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="live-dot mx-auto mb-4" style={{ width: 12, height: 12 }}></div>
                    <div className="text-xl font-bold tracking-widest uppercase">Initializing Gemini Core...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analysis-container flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-red-500 text-2xl font-bold mb-4">Analysis Failed</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <button onClick={onRetry} className="back-button border border-white/20 p-2 rounded hover:bg-white/10">Retry Analysis</button>
                    <button onClick={onBack} className="block mt-4 text-sm text-slate-500 hover:text-white mx-auto">Go Back</button>
                </div>
            </div>
        );
    }

    // Determine Colors based on Verdict
    const getVerdictClass = (v) => {
        if (!v) return "";
        if (v.includes("BUY")) return "";
        if (v.includes("SELL")) return "sell";
        return "wait";
    };

    const verdictClass = getVerdictClass(verdict);

    return (
        <div className="analysis-container">
            {/* Header */}
            <div className="analysis-header">
                <div className="header-left">
                    <button onClick={onBack} className="back-button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        BACK
                    </button>
                    <div className="ticker-info">
                        <div className="ticker-text">{ticker || data.ticker}</div>
                        <div className="exchange-badge">NASDAQ</div>
                    </div>
                    <div className="company-name">{priceData.name || "Unknown Company"}</div>
                </div>
                <div className="header-right">
                    <div className="live-indicator">
                        <div className="live-dot"></div>
                        LIVE
                    </div>
                    <div className="price-display">
                        <div className="price-value">{priceData.currency || "$"}{priceData.price}</div>
                        <div className={`price-change ${priceData.change_percent < 0 ? 'negative' : ''}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                {priceData.change_percent >= 0 ? <polyline points="18 15 12 9 6 15"></polyline> : <polyline points="18 9 12 15 6 9"></polyline>}
                            </svg>
                            {priceData.change_percent > 0 ? '+' : ''}{priceData.change_percent}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Gemini Recommendation */}
            <div className="glass-card gemini-card">
                <div className="card-header">
                    <div className="gemini-brand">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m-2-2l-4.2-4.2"></path>
                        </svg>
                        GEMINI 2.0 CORE
                    </div>
                    <div className="confidence">
                        CONFIDENCE <span>{confidence}%</span>
                    </div>
                </div>

                <div className="recommendation-display">
                    <div className="recommendation-text">
                        <div className={`strong-buy ${verdictClass}`}>
                            {verdict}
                            <div className="recommendation-dot"></div>
                        </div>
                        <div className="recommendation-underline"></div>
                        <div className="recommendation-subtext">{analysis.action || "Action Required"}</div>
                    </div>
                    <div className="mini-chart">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar active"></div>
                        <div className="bar active"></div>
                        <div className="bar active"></div>
                        <div className="bar active"></div>
                    </div>
                </div>

                <div className="metrics-row">
                    <div className="metric-box">
                        <div className="metric-label">TARGET</div>
                        <div className="metric-value">{analysis.target_price ? `$${analysis.target_price}` : "N/A"}</div>
                        <div className="metric-subtext positive">{analysis.target_price ? "Calculated" : ""}</div>
                    </div>
                    <div className="metric-box">
                        <div className="metric-label">HORIZON</div>
                        <div className="metric-value">{analysis.timeframe || "Mid-Term"}</div>
                        <div className="metric-subtext">{analysis.risk_level || "Medium Risk"}</div>
                    </div>
                    <div className="metric-box">
                        <div className="metric-label">RISK</div>
                        <div className="metric-value">{analysis.risk_level === 'HIGH' ? '0.92' : analysis.risk_level === 'LOW' ? '0.45' : '0.85'}</div>
                        <div className="metric-subtext">Beta</div>
                    </div>
                </div>
            </div>

            {/* Gemini's Take */}
            <div className="glass-card gemini-take">
                <div className="section-header">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m-2-2l-4.2-4.2"></path>
                    </svg>
                    <span className="section-title">GEMINI'S TAKE</span>
                </div>

                <div className="verdict-box">
                    <div className="verdict-icon">
                        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </div>
                    <div className="verdict-title">AI Analyst Verdict</div>
                    <div className="verdict-text">
                        {analysis.ai_explanation || "Analyzing market conditions..."}
                    </div>
                    <div className="verdict-footer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Generated by Gemini • Updated just now
                    </div>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="glass-card quick-insights">
                <div className="section-header">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <span class="section-title">QUICK INSIGHTS</span>
                </div>

                <div className="insight-card">
                    <div className="insight-header">
                        <div className="insight-icon">
                            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                        </div>
                        <div>
                            <div className="insight-title">{analysis.flashcard?.title || "Key Insight"}</div>
                        </div>
                    </div>
                    <div className="insight-description">
                        {insights[0] || "No insights available."}
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-label">
                            MARKET CAP
                        </div>
                        <div className="stat-value">{priceData.market_cap || "N/A"}</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">
                            VOLUME
                        </div>
                        <div className="stat-value">{priceData.volume || "N/A"}</div>
                    </div>
                </div>
            </div>

            {/* Price Action Chart */}
            <div className="glass-card chart-card">
                <div className="chart-header">
                    <div className="section-header">
                        <svg className="section-icon" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <span className="section-title">PRICE ACTION</span>
                    </div>
                    <div className="timeframe-tabs">
                        <div className="timeframe-tab">1H</div>
                        <div className="timeframe-tab active">1D</div>
                        <div className="timeframe-tab">1W</div>
                    </div>
                </div>

                <div className="chart-wrapper">
                    {graphPoints.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphPoints}>
                                <defs>
                                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fill="url(#chartGrad)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff' }}
                                    itemStyle={{ color: '#10B981' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-white/50">Chart loading...</div>
                    )}
                </div>
            </div>

            {/* Community Sentiment */}
            <div className="glass-card community-card">
                <div className="section-header">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                    <span className="section-title">COMMUNITY SENTIMENT</span>
                </div>

                <div className="tweets-container">
                    {socialItems.length > 0 ? socialItems.map((tweet, i) => (
                        <div key={i} className="tweet-card">
                            <div className="tweet-source">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                </svg>
                                {tweet.handle}
                            </div>
                            <div className="tweet-content">
                                {tweet.content}
                            </div>
                        </div>
                    )) : (
                        <div className="text-white/40 italic">No community data available.</div>
                    )}
                </div>
            </div>

            {/* Analyst Tab Button */}
            <div className="analyst-tab">
                <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                ANALYST
            </div>
        </div>
    );
};

export default StockDetail;
