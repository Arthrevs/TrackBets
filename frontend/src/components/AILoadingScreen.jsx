import React, { useEffect, useState } from 'react';
import { Brain, Database, Activity, Network, CheckCircle2, Lock, Cpu } from 'lucide-react';

const AILoadingScreen = ({ ticker, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { icon: Database, text: `Connecting to market data streams for ${ticker || 'asset'}...` },
        { icon: Activity, text: "Analyzing price action & volatility models..." },
        { icon: Network, text: "Processing sentiment from global news sources..." },
        { icon: Brain, text: "Generating predictive alpha strategies..." }
    ];

    useEffect(() => {
        // Total duration ~4.5 seconds
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                // Nonlinear progress for realism
                const increment = Math.random() * 2 + 0.5;
                return Math.min(prev + increment, 100);
            });
        }, 50);

        // Step transitions
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) return prev + 1;
                return prev;
            });
        }, 1100);

        // Complete
        const timeout = setTimeout(() => {
            onComplete?.();
        }, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(stepInterval);
            clearTimeout(timeout);
        };
    }, [ticker, onComplete, steps.length]);

    const CurrentIcon = steps[currentStep].icon;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lando-main/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] animate-float-delayed"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6">

                {/* Central AI Core Animation */}
                <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 border-2 border-dashed border-lando-main/30 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-2 border border-lando-main/20 rounded-full animate-reverse-spin"></div>

                    {/* Core Pulse */}
                    <div className="absolute inset-0 bg-lando-main/10 rounded-full blur-xl animate-pulse-fast"></div>

                    {/* Center Icon */}
                    <div className="relative z-10 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-lando-main/30 shadow-[0_0_30px_rgba(110,241,149,0.15)]">
                        <Cpu size={40} className="text-lando-main animate-pulse" />
                    </div>

                    {/* Particles/Data Streams */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-lando-main/60 rounded-full"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${i * 60}deg) translateY(-40px)`,
                                animation: `particleFade 2s infinite ${i * 0.2}s`
                            }}
                        />
                    ))}
                </div>

                {/* Status Text & Steps */}
                <div className="w-full text-center space-y-6">
                    <h2 className="text-3xl font-bold text-white tracking-tight animate-fade-in">
                        analyzing <span className="text-lando-main">{ticker}</span>
                    </h2>

                    <div className="h-16 relative">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 transform ${idx === currentStep
                                    ? 'opacity-100 translate-y-0'
                                    : idx < currentStep
                                        ? 'opacity-0 -translate-y-4'
                                        : 'opacity-0 translate-y-4'
                                    }`}
                            >
                                <div className="flex items-center gap-2 text-gray-400">
                                    <step.icon size={18} className={idx === currentStep ? "text-lando-main animate-bounce" : ""} />
                                    <span className="text-lg font-light tracking-wide">{step.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-1 w-full bg-gray-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-lando-main via-green-400 to-lando-main"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                        </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                        <span>AI PROCESSING NODE: 0x8F...3A</span>
                        <span>{Math.round(progress)}% COMPLETE</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes particleFade {
          0% { opacity: 0; transform: rotate(var(--rot)) translateY(-30px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: rotate(var(--rot)) translateY(-50px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 10px); }
        }
        
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 15s linear infinite; }
        .animate-pulse-fast { animation: pulse-fast 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-fast 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s linear infinite; }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 12s ease-in-out infinite; }
      `}</style>
        </div>
    );
};

export default AILoadingScreen;
