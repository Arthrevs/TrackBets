import React from 'react';
import { TrendingUp, TrendingDown, Eye, ChevronRight, Zap, Shield, BarChart3 } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
    const options = [
        {
            id: 'buy',
            type: 'buy',
            icon: TrendingUp,
            title: 'Buy',
            subtitle: 'Track new positions',
            gradient: 'from-green-500/20 via-green-500/10 to-transparent',
            iconBg: 'bg-gradient-to-br from-green-500/30 to-green-600/20',
            iconColor: 'text-green-400',
            glowColor: 'group-hover:shadow-[0_0_30px_rgba(90,197,59,0.3)]',
            borderGlow: 'group-hover:border-green-500/40'
        },
        {
            id: 'sell',
            type: 'sell',
            icon: TrendingDown,
            title: 'Sell',
            subtitle: 'Plan your exit',
            gradient: 'from-red-500/20 via-red-500/10 to-transparent',
            iconBg: 'bg-gradient-to-br from-red-500/30 to-red-600/20',
            iconColor: 'text-red-400',
            glowColor: 'group-hover:shadow-[0_0_30px_rgba(255,82,82,0.3)]',
            borderGlow: 'group-hover:border-red-500/40'
        },
        {
            id: 'track',
            type: 'track',
            icon: Eye,
            title: 'Watch',
            subtitle: 'Monitor markets',
            gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
            iconBg: 'bg-gradient-to-br from-blue-500/30 to-blue-600/20',
            iconColor: 'text-blue-400',
            glowColor: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
            borderGlow: 'group-hover:border-blue-500/40'
        }
    ];

    const features = [
        { icon: Zap, value: '₹0', label: 'Zero fees', color: 'text-yellow-400' },
        { icon: BarChart3, value: 'NSE/BSE', label: 'Indian markets', color: 'text-blue-400' },
        { icon: Shield, value: 'AI', label: 'Smart analysis', color: 'text-purple-400' }
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 fade-in">
            {/* Background accent */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-green-500/5 rounded-full blur-3xl" />
            </div>

            {/* Hero Section */}
            <div className="text-center mb-16 relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-gray-400 font-medium">Live Market Data</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                    <span className="text-white">Smart trading</span>
                    <br />
                    <span className="text-gradient">starts here.</span>
                </h1>

                <p className="text-gray-500 text-lg max-w-lg mx-auto font-normal leading-relaxed">
                    AI-powered insights for the Indian market.
                    <br />
                    <span className="text-gray-600">Make informed decisions, faster.</span>
                </p>
            </div>

            {/* Action Cards */}
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl w-full">
                {options.map((option) => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onNavigate('wizard', { type: option.type })}
                            className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl 
                                bg-gradient-to-r ${option.gradient} 
                                border border-white/10 ${option.borderGlow}
                                ${option.glowColor}
                                transition-all duration-300 
                                hover:scale-[1.03] hover:-translate-y-1
                                active:scale-[0.98]`}
                        >
                            <div className={`w-11 h-11 rounded-xl ${option.iconBg} flex items-center justify-center ${option.iconColor} transition-transform group-hover:scale-110`}>
                                <Icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <div className="text-base font-semibold text-white">{option.title}</div>
                                <div className="text-sm text-gray-500">{option.subtitle}</div>
                            </div>
                            <ChevronRight size={18} className="text-gray-600 ml-2 group-hover:translate-x-1 group-hover:text-white transition-all" />
                        </button>
                    );
                })}
            </div>

            {/* Feature Highlights */}
            <div className="mt-20 flex flex-wrap justify-center gap-12 text-center">
                {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                        <div key={i} className="flex flex-col items-center group">
                            <div className={`mb-3 p-3 rounded-xl bg-white/5 ${feature.color} transition-transform group-hover:scale-110`}>
                                <Icon size={20} />
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{feature.value}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">{feature.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
};

export default LandingPage;

