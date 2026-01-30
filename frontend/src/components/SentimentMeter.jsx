import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SentimentMeter = ({ score = 75 }) => {
    // Score is 0-100
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const halfCirc = circumference / 2;

    // Calculate fill based on score
    const strokeDashoffset = halfCirc - ((score / 100) * halfCirc);

    // Determine color and label based on sentiment
    const getColorAndLabel = (score) => {
        if (score >= 60) return { color: '#5ac53b', gradient: 'url(#bullishGradient)', label: 'Bullish', icon: TrendingUp };
        if (score >= 40) return { color: '#ffa500', gradient: 'url(#neutralGradient)', label: 'Neutral', icon: Minus };
        return { color: '#ff5252', gradient: 'url(#bearishGradient)', label: 'Bearish', icon: TrendingDown };
    };

    const { color, gradient, label, icon: Icon } = getColorAndLabel(score);

    return (
        <div className="flex flex-col items-center justify-center py-8 relative">
            {/* Score Badge */}
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
                    <Icon size={18} style={{ color }} />
                </div>
                <div className="text-center">
                    <span className="text-3xl font-black" style={{ color }}>{score}%</span>
                    <span className="text-gray-500 font-bold text-sm ml-2 uppercase tracking-wider">{label}</span>
                </div>
            </div>

            <div className="relative w-64 h-32">
                {/* Glow effect behind */}
                <div
                    className="absolute inset-0 blur-2xl opacity-30"
                    style={{
                        background: `radial-gradient(ellipse at center bottom, ${color} 0%, transparent 70%)`
                    }}
                />

                {/* SVG Container */}
                <svg viewBox="0 0 180 90" className="w-full h-full relative">
                    <defs>
                        <linearGradient id="bullishGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ffa500" />
                            <stop offset="100%" stopColor="#5ac53b" />
                        </linearGradient>
                        <linearGradient id="neutralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff5252" />
                            <stop offset="100%" stopColor="#ffa500" />
                        </linearGradient>
                        <linearGradient id="bearishGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff5252" />
                            <stop offset="100%" stopColor="#ff8888" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background Track */}
                    <path
                        d="M 20 90 A 70 70 0 0 1 160 90"
                        fill="none"
                        stroke="#1c1c1e"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* Active Progress with glow */}
                    <path
                        d="M 20 90 A 70 70 0 0 1 160 90"
                        fill="none"
                        stroke={gradient}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={halfCirc}
                        strokeDashoffset={strokeDashoffset}
                        filter="url(#glow)"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />

                    {/* Tick marks */}
                    {[0, 25, 50, 75, 100].map((tick, i) => {
                        const angle = (180 * tick / 100) - 180;
                        const rad = (angle * Math.PI) / 180;
                        const x1 = 90 + 60 * Math.cos(rad);
                        const y1 = 90 + 60 * Math.sin(rad);
                        const x2 = 90 + 52 * Math.cos(rad);
                        const y2 = 90 + 52 * Math.sin(rad);
                        return (
                            <line
                                key={i}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="#3c3c3e"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
            </div>

            <div className="mt-4 text-center max-w-xs">
                <div className="flex items-center justify-center gap-8 text-xs text-gray-600 font-bold uppercase tracking-widest mb-4">
                    <span className="text-red-400">Bearish</span>
                    <span className="text-orange-400">Neutral</span>
                    <span className="text-green-400">Bullish</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Market sentiment indicates a <span style={{ color }} className="font-semibold">{label.toLowerCase()}</span> outlook based on
                    aggregated social signals and analyst ratings.
                </p>
            </div>
        </div>
    );
};

export default SentimentMeter;

