import React, { useState, useEffect } from 'react';
import { Loader2, Globe, MessageSquare, Brain, Sparkles } from 'lucide-react';

const AILoadingScreen = ({ ticker, onComplete }) => {
    const [stage, setStage] = useState(0);
    const [progress, setProgress] = useState(0);

    const stages = [
        {
            icon: Globe,
            text: 'Scraping global news sources...',
            color: 'text-cyan-400',
            bgColor: 'from-cyan-500/20 to-cyan-600/10'
        },
        {
            icon: MessageSquare,
            text: 'Analyzing Reddit sentiment...',
            color: 'text-orange-400',
            bgColor: 'from-orange-500/20 to-orange-600/10'
        },
        {
            icon: Brain,
            text: 'Gemini 2.5 Flash calculating verdict...',
            color: 'text-purple-400',
            bgColor: 'from-purple-500/20 to-purple-600/10'
        }
    ];

    useEffect(() => {
        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + 1;
            });
        }, 30); // 3 seconds total = 100 steps * 30ms

        // Stage transitions at 1s and 2s
        const stage1Timeout = setTimeout(() => setStage(1), 1000);
        const stage2Timeout = setTimeout(() => setStage(2), 2000);

        // Complete at 3s
        const completeTimeout = setTimeout(() => {
            if (onComplete) onComplete();
        }, 3000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(stage1Timeout);
            clearTimeout(stage2Timeout);
            clearTimeout(completeTimeout);
        };
    }, [onComplete]);

    const CurrentIcon = stages[stage].icon;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 fade-in">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Main Card */}
            <div className="relative max-w-md w-full">
                {/* Animated glow ring */}
                <div className="absolute -inset-1 bg-linear-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-3xl opacity-30 blur-xl animate-pulse" />

                <div className="relative bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-10 border border-white/10 overflow-hidden">
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />

                    {/* Ticker Badge */}
                    <div className="text-center mb-8 relative">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                            <Sparkles size={14} className="text-purple-400" />
                            <span className="text-sm font-bold text-white">{ticker}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">AI Analysis in Progress</h2>
                        <p className="text-gray-500 text-sm">Our AI is crunching the data...</p>
                    </div>

                    {/* Current Stage Display */}
                    <div className={`flex items-center gap-4 p-5 rounded-xl bg-linear-to-br ${stages[stage].bgColor} border border-white/10 mb-6 transition-all duration-500`}>
                        <div className={`p-3 rounded-xl bg-black/40 ${stages[stage].color}`}>
                            <CurrentIcon size={28} className="animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <div className={`font-bold ${stages[stage].color} text-lg`}>
                                {stages[stage].text}
                            </div>
                        </div>
                        <Loader2 size={24} className="text-white/50 animate-spin" />
                    </div>

                    {/* Stage Indicators */}
                    <div className="flex justify-center gap-3 mb-6">
                        {stages.map((s, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${i <= stage
                                        ? 'bg-white scale-100'
                                        : 'bg-gray-700 scale-75'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-purple-500 via-blue-500 to-cyan-400 transition-all duration-100 ease-linear rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Processing...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Powered by badge */}
            <div className="mt-8 flex items-center gap-2 text-gray-500 text-sm">
                <Brain size={16} className="text-purple-400" />
                <span>Powered by <span className="text-purple-400 font-semibold">Gemini 2.5 Flash</span></span>
            </div>
        </div>
    );
};

export default AILoadingScreen;
