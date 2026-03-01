import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import WebGLBackground from './landing/WebGLBackground';

const SignUpPage = ({ initialMode = 'signup', onSuccess, onBack }) => {
    const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (isLoginMode) {
            // Validate against localStorage
            const savedUserStr = localStorage.getItem('trackbets_user');
            if (!savedUserStr) {
                setErrorMsg('No account found. Please sign up first.');
                return;
            }

            const savedUser = JSON.parse(savedUserStr);
            if (savedUser.email === formData.email && savedUser.password === formData.password) {
                console.log("Logged in user:", savedUser);
                onSuccess(savedUser); // Pass the fully hydrated user back
            } else {
                setErrorMsg('Invalid email or password.');
            }
        } else {
            // Sign Up Mode
            console.log("Signing up user:", formData);
            onSuccess(formData);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#09090b] text-white selection:bg-[#c9a84c] selection:text-black font-sans overflow-hidden">
            {/* Background elements */}
            <WebGLBackground />

            <div className="absolute top-8 left-10 z-50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold tracking-wider font-['JetBrains_Mono'] uppercase"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            </div>

            {/* Login Container */}
            <div className="relative w-full max-w-lg rounded-[28px] p-10 border border-white/10 shadow-2xl overflow-hidden bg-black/40 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ backdropFilter: 'blur(30px)' }}>

                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-[#6EF195]/40 to-transparent" />

                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <img src="/assets/trackbets-logo.jpg" alt="TrackBets Logo" className="w-8 h-8 object-contain" />
                        <span className="font-['Playfair_Display'] text-[24px] font-bold tracking-tight">
                            Track<b className="text-[#c9a84c] font-bold">Bets</b>
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight mb-3 font-['Playfair_Display']">
                        {isLoginMode ? 'Welcome Back' : 'Create Your Account'}
                    </h1>
                    <p className="text-sm text-gray-400 font-['JetBrains_Mono'] tracking-wide">
                        {isLoginMode ? 'Sign in to access your dashboard' : 'Unlock institutional-grade AI analysis'}
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-['JetBrains_Mono'] text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {!isLoginMode && (
                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 font-['JetBrains_Mono']">First Name</label>
                                <input
                                    type="text"
                                    required={!isLoginMode}
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#6EF195]/50 focus:bg-white/10 transition-colors"
                                    placeholder="John"
                                />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 font-['JetBrains_Mono']">Last Name</label>
                                <input
                                    type="text"
                                    required={!isLoginMode}
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#6EF195]/50 focus:bg-white/10 transition-colors"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 font-['JetBrains_Mono']">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#6EF195]/50 focus:bg-white/10 transition-colors"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 font-['JetBrains_Mono']">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#6EF195]/50 focus:bg-white/10 transition-colors tracking-widest"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-6 w-full group relative overflow-hidden inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-black font-bold text-sm uppercase tracking-wider transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #6EF195 0%, #4ADE80 100%)',
                            boxShadow: '0 8px 24px rgba(110, 241, 149, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <span>{isLoginMode ? 'Sign In & Continue' : 'Sign Up & Continue'}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                            <span
                                className="text-[#c9a84c] hover:text-[#e0c474] cursor-pointer transition-colors"
                                onClick={() => {
                                    setIsLoginMode(!isLoginMode);
                                    setErrorMsg('');
                                }}
                            >
                                {isLoginMode ? 'Sign Up' : 'Sign In'}
                            </span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
