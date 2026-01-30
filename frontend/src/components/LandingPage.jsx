import React from 'react';
import { TrendingUp, TrendingDown, Eye, ChevronRight } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
    const options = [
        {
            id: 'buy',
            type: 'buy',
            icon: TrendingUp,
            title: 'Buy',
            subtitle: 'Track new positions',
            gradient: 'from-green-500/10 to-green-500/5',
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-400',
            hoverBorder: 'hover:border-green-500/30'
        },
        {
            id: 'sell',
            type: 'sell',
            icon: TrendingDown,
            title: 'Sell',
            subtitle: 'Plan your exit',
            gradient: 'from-red-500/10 to-red-500/5',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
            hoverBorder: 'hover:border-red-500/30'
        },
        {
            id: 'track',
            type: 'track',
            icon: Eye,
            title: 'Watch',
            subtitle: 'Monitor markets',
            gradient: 'from-blue-500/10 to-blue-500/5',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
            hoverBorder: 'hover:border-blue-500/30'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 fade-in">
            {/* Hero Section - Apple-like clean typography */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 text-white">
                    Smart trading starts here.
                </h1>
                <p className="text-gray-500 text-lg max-w-lg mx-auto font-normal">
                    AI-powered insights for the Indian market
                </p>
            </div>

            {/* Compact Apple-style Cards */}
            <div className="flex flex-wrap justify-center gap-3 max-w-xl w-full">
                {options.map((option) => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onNavigate('wizard', { type: option.type })}
                            className={`group flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r ${option.gradient} border border-white/5 ${option.hoverBorder} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <div className={`w-9 h-9 rounded-xl ${option.iconBg} flex items-center justify-center ${option.iconColor}`}>
                                <Icon size={18} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold text-white">{option.title}</div>
                                <div className="text-xs text-gray-500">{option.subtitle}</div>
                            </div>
                            <ChevronRight size={16} className="text-gray-600 ml-2 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    );
                })}
            </div>

            {/* Feature highlights - Apple style */}
            <div className="mt-20 flex flex-wrap justify-center gap-8 text-center">
                <div className="max-w-[140px]">
                    <div className="text-2xl font-semibold text-white mb-1">₹0</div>
                    <div className="text-xs text-gray-500">Zero fees</div>
                </div>
                <div className="max-w-[140px]">
                    <div className="text-2xl font-semibold text-white mb-1">NSE/BSE</div>
                    <div className="text-xs text-gray-500">Indian markets</div>
                </div>
                <div className="max-w-[140px]">
                    <div className="text-2xl font-semibold text-white mb-1">AI</div>
                    <div className="text-xs text-gray-500">Smart analysis</div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
