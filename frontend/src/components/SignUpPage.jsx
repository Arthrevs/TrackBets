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
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setErrorMsg('Google Auth requires an OAuth Client ID. Please provide your API Key via chat.');
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-4 rounded-xl font-semibold text-sm transition-all hover:bg-gray-100 shadow-[0_4px_14px_0_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.23)] border border-transparent hover:border-white"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Continue with Google
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="grow border-t border-white/10"></div>
                        <span className="shrink-0 px-4 text-[10px] font-['JetBrains_Mono'] text-white/30 uppercase tracking-widest font-bold">or email</span>
                        <div className="grow border-t border-white/10"></div>
                    </div>

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
