import React from 'react';

const SentimentMeter = ({ score = 75 }) => {
    // Score is 0-100
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const halfCirc = circumference / 2;

    // Calculate fill based on score
    const strokeDashoffset = halfCirc - ((score / 100) * halfCirc);

    // Determine color based on sentiment
    const getColor = (score) => {
        if (score >= 60) return '#5ac53b'; // Bullish green
        if (score >= 40) return '#ffa500'; // Neutral orange
        return '#ff5252'; // Bearish red
    };

    const color = getColor(score);
    const label = score >= 60 ? 'Bullish' : score >= 40 ? 'Neutral' : 'Bearish';

    return (
        <div className="flex flex-col items-center justify-center py-8">
            {/* Score Range Display */}
            <div className="text-gray-500 font-bold mb-4 tracking-wider text-sm">
                <span className="text-white">{score}%</span> {label}
            </div>

            <div className="relative w-56 h-28">
                {/* SVG Container - Simple static rendering */}
                <svg viewBox="0 0 180 90" className="w-full h-full">
                    <defs>
                        <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff5252" />
                            <stop offset="50%" stopColor="#ffa500" />
                            <stop offset="100%" stopColor="#5ac53b" />
                        </linearGradient>
                    </defs>

                    {/* Background Track */}
                    <path
                        d="M 20 90 A 70 70 0 0 1 160 90"
                        fill="none"
                        stroke="#2c2c2e"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* Active Progress - Simplified (no animation for performance) */}
                    <path
                        d="M 20 90 A 70 70 0 0 1 160 90"
                        fill="none"
                        stroke={color}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={halfCirc}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
            </div>

            <div className="mt-6 text-center max-w-xs">
                <p className="text-gray-500 text-xs mb-2">Last Updated: Today</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Market sentiment indicates {label.toLowerCase()} outlook based on recent price action and sentiment analysis.
                </p>
            </div>
        </div>
    );
};

export default SentimentMeter;
