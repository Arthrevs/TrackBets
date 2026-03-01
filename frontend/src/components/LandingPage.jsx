import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './landing/landing_v2.css';
import MagneticButton from './landing/MagneticButton';
import WebGLBackground from './landing/WebGLBackground';
import MeridianGlobe from './MeridianGlobe';

const LandingPage = ({ user, onNavigate }) => {
    // chartRef removed — replaced by MeridianGlobe component
    const ringRef = useRef(null);
    const dotRef = useRef(null);
    const headlineRef = useRef(null);
    const [isTickerFocused, setIsTickerFocused] = React.useState(false);

    // Navigation handlers
    const handleStartAnalysis = () => onNavigate && onNavigate('signup', { type: 'analyze' });
    const handleLogin = () => onNavigate && onNavigate('signup', { type: 'login' });

    // --- GSAP TEXT ANIMATION ---
    useEffect(() => {
        const container = headlineRef.current;
        if (!container) return;

        const words = container.querySelectorAll('.word');
        // Initial state
        gsap.set(words, { opacity: 0, x: 20 });
        gsap.set(words[0], { opacity: 1, x: 0 });

        let currentIndex = 0;

        const cycleWords = () => {
            const currentWord = words[currentIndex];
            const nextIndex = (currentIndex + 1) % words.length;
            const nextWord = words[nextIndex];

            // Animate current out
            gsap.to(currentWord, {
                opacity: 0,
                x: -20,
                duration: 0.3,
                ease: "power2.inOut"
            });

            // Animate next in
            gsap.fromTo(nextWord,
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.3, ease: "power2.inOut" }
            );

            currentIndex = nextIndex;
        };

        const interval = setInterval(cycleWords, 2500);
        return () => {
            clearInterval(interval);
            gsap.killTweensOf(words);
        };
    }, []);

    // --- CURSOR EFFECT ---
    useEffect(() => {
        const ring = ringRef.current;
        const dot = dotRef.current;
        if (!ring || !dot) return;

        let mx = 0, my = 0, rx = 0, ry = 0;

        const handleMouseMove = (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
        };

        const loop = () => {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(loop);
        };
        loop();

        const handleHoverEnter = () => ring.classList.add('expand');
        const handleHoverLeave = () => ring.classList.remove('expand');

        const handleMouseDown = () => ring.classList.add('clicking');
        const handleMouseUp = () => ring.classList.remove('clicking');

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        const interactiveElements = document.querySelectorAll('button, a, .mode-card, .feat-card, .how-step, .interval');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleHoverEnter);
            el.addEventListener('mouseleave', handleHoverLeave);
        });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleHoverEnter);
                el.removeEventListener('mouseleave', handleHoverLeave);
            });
        };
    }, []);

    // --- BACKGROUND CANVAS (Replaced by WebGLBackground) ---
    // Legacy 2D canvas logic removed.

    // Chart animation removed — replaced by MeridianGlobe component

    // --- INTERSECTION OBSERVER ---
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    // Handle Counters
                    if (e.target.classList.contains('stat-col')) {
                        const counter = e.target.querySelector('.counter');
                        if (counter) {
                            const target = +counter.dataset.target;
                            let current = 0;
                            const inc = target / 60;
                            const timer = setInterval(() => {
                                current = Math.min(current + inc, target);
                                counter.textContent = Math.floor(current).toLocaleString();
                                if (current >= target) clearInterval(timer);
                            }, 20);
                        }
                    }
                    // Handle Terminal
                    if (e.target.classList.contains('terminal-wrap')) {
                        const lines = e.target.querySelectorAll('.t-line');
                        lines.forEach(line => {
                            line.style.animation = 'none';
                            void line.offsetWidth;
                            line.style.animation = '';
                        });
                    }
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.reveal, .stat-col, .terminal-wrap').forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const signals = [
        { sym: 'NVDA', v: 'BUY', cls: 'b', conf: '94%', arr: '↗' },
        { sym: 'TSLA', v: 'SELL', cls: 's', conf: '78%', arr: '↘' },
        { sym: 'AAPL', v: 'BUY', cls: 'b', conf: '87%', arr: '↗' },
        { sym: 'MSFT', v: 'HOLD', cls: 'h', conf: '61%', arr: '→' },
        { sym: 'GOOGL', v: 'BUY', cls: 'b', conf: '83%', arr: '↗' },
        { sym: 'META', v: 'SELL', cls: 's', conf: '76%', arr: '↘' },
        { sym: 'AMZN', v: 'BUY', cls: 'b', conf: '91%', arr: '↗' },
        { sym: 'NFLX', v: 'HOLD', cls: 'h', conf: '55%', arr: '→' },
        { sym: 'AMD', v: 'BUY', cls: 'b', conf: '88%', arr: '↗' },
    ];

    const tickers = [
        { sym: 'AAPL', price: '$189.42', chg: '+2.34%', up: true },
        { sym: 'TSLA', price: '$234.18', chg: '+1.89%', up: true },
        { sym: 'MSFT', price: '$389.76', chg: '+0.92%', up: true },
        { sym: 'GOOGL', price: '$142.87', chg: '-0.45%', up: false },
        { sym: 'NVDA', price: '$874.23', chg: '+3.21%', up: true },
        { sym: 'AMZN', price: '$178.23', chg: '+1.23%', up: true },
        { sym: 'META', price: '$471.15', chg: '-0.87%', up: false },
        { sym: 'AMD', price: '$156.40', chg: '+2.14%', up: true },
    ];

    return (
        <div className="landing-wrapper">
            {/* Custom Cursor */}
            <div className="custom-cursor">
                <div className="cursor-ring" ref={ringRef}></div>
                <div className="cursor-dot" ref={dotRef}></div>
            </div>

            {/* NEW WEBGL BACKGROUND */}
            <WebGLBackground />


            <nav className="landing-nav">
                <div className="logo-wrap">
                    <div className="logo-mark bg-transparent border-none">
                        <img src="/assets/trackbets-logo.jpg" alt="TrackBets Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="logo-text">Track<span>Bets</span></span>
                </div>
                <div className="nav-status">
                    <div className="blink"></div>
                    LIVE MARKET DATA
                </div>
                <ul className="nav-links">
                    <li><a href="#modes">products</a></li>
                    <li><a href="#features">features</a></li>
                    <li><a href="#how">how it works</a></li>
                    <li><a href="#terminal">demo</a></li>
                </ul>
                <div className="nav-right">
                    <MagneticButton strength={15}>
                        {user ? (
                            <button className="btn-solid mag-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => onNavigate('input', {})}>
                                {user.firstName || 'Dashboard'}
                            </button>
                        ) : (
                            <button className="btn-solid mag-btn" onClick={handleLogin}>Sign In</button>
                        )}
                    </MagneticButton>
                    <div className="nav-gear-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.62-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                        </svg>
                    </div>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-left">
                    <h1 className="headline">
                        <span className="block">Your Personal</span>
                        <span className="dynamic-wrapper" ref={headlineRef}>
                            <span className="word accent">AI-Powered</span>
                            <span className="word accent">Real-Time</span>
                            <span className="word accent">Hedge Fund</span>
                            <span className="word accent">Institutional</span>
                        </span>
                        <span className="block">Analyst.</span>
                    </h1>

                    <p class="hero-desc">Real-time price action, global news, social sentiment fused into a single AI verdict. The same edge hedge funds pay millions for — now yours.</p>

                    <div className="hero-cta">
                        <MagneticButton strength={25}>
                            <button className="btn-lg primary mag-btn" onClick={handleStartAnalysis}>Start Free Analysis</button>
                        </MagneticButton>
                        <MagneticButton strength={20}>
                            <button className="btn-lg secondary mag-btn" onClick={() => document.getElementById('terminal').scrollIntoView({ behavior: 'smooth' })}>Watch Demo</button>
                        </MagneticButton>
                    </div>


                </div>

                <div className="hero-right">
                    <MeridianGlobe />
                </div>
            </section>



            <section className="section" id="modes">
                <div className="reveal">
                    <div className="section-tag">analysis modes</div>
                    <div className="section-title">Three Ways to Win</div>
                    <p className="section-sub">From instant verdicts to exhaustive research. TrackBets adapts to your trading style and risk appetite.</p>
                </div>

                <div className="modes-grid">
                    <div className="mode-card reveal reveal-d1"
                        onClick={() => handleStartAnalysis('analyze')}
                    >
                        <div className="card-number">01</div>
                        <div className="card-icon-wrap green">
                            <svg viewBox="0 0 22 22" fill="none" stroke="#00FF87" strokeWidth="2" strokeLinecap="round">
                                <polyline points="2,16 7,9 11,12 15,6 20,6" />
                                <polyline points="15,6 20,6 20,11" />
                            </svg>
                        </div>
                        <h3 className="card-title">Analyze</h3>
                        <p className="card-desc">Instant Buy · Sell · Hold verdicts backed by real-time data fusion across 40+ signals simultaneously.</p>
                        <div className="mini-chart">
                            {[0.45, 0.60, 0.50, 0.75, 0.85, 0.70, 0.90, 1.0].map((h, i) => (
                                <div key={i} className="mc-bar" style={{ height: `${h * 100}%`, '--fill': h }}></div>
                            ))}
                        </div>
                        <MagneticButton strength={30}>
                            <button className="card-cta mag-btn">→ Start Analysis</button>
                        </MagneticButton>
                    </div>

                    <div className="mode-card risk-card reveal reveal-d2"
                        onClick={() => handleStartAnalysis('risk')}
                    >
                        <div className="card-number">02</div>
                        <div className="card-icon-wrap red">
                            <svg viewBox="0 0 22 22" fill="none" stroke="#FF3B5C" strokeWidth="2" strokeLinecap="round">
                                <path d="M11 2L2 20h18L11 2z" />
                                <line x1="11" y1="9" x2="11" y2="13" />
                                <circle cx="11" cy="16.5" r="0.5" fill="#FF3B5C" />
                            </svg>
                        </div>
                        <h3 className="card-title">Risk Check</h3>
                        <p className="card-desc">Detect crashes, sentiment spikes, and volatility warnings 6–48 hours before they hit your portfolio.</p>
                        <div className="mini-chart">
                            {[0.80, 0.65, 0.90, 0.45, 0.30, 0.55, 0.40, 0.25].map((h, i) => (
                                <div key={i} className="mc-bar" style={{ height: `${h * 100}%`, '--fill': h }}></div>
                            ))}
                        </div>
                        <MagneticButton strength={30}>
                            <button className="card-cta mag-btn" onClick={handleStartAnalysis}>→ Check Risk</button>
                        </MagneticButton>
                    </div>

                    <div className="mode-card deep-card reveal reveal-d3"
                        onClick={() => handleStartAnalysis('deepdive')}
                    >
                        <div className="card-number">03</div>
                        <div className="card-icon-wrap blue">
                            <svg viewBox="0 0 22 22" fill="none" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round">
                                <circle cx="11" cy="11" r="3" />
                                <path d="M11 2v3M11 17v3M2 11h3M17 11h3" />
                                <path d="M4.9 4.9l2.1 2.1M15 15l2.1 2.1M4.9 17.1l2.1-2.1M15 7l2.1-2.1" />
                            </svg>
                        </div>
                        <h3 className="card-title">Deep Dive</h3>
                        <p className="card-desc">Full AI reasoning with cited sources, data lineage, and every step of the model's thought process exposed.</p>
                        <div className="mini-chart">
                            {[0.40, 0.55, 0.65, 0.60, 0.75, 0.85, 0.80, 0.95].map((h, i) => (
                                <div key={i} className="mc-bar" style={{ height: `${h * 100}%`, '--fill': h }}></div>
                            ))}
                        </div>
                        <MagneticButton strength={30}>
                            <button className="card-cta mag-btn" onClick={handleStartAnalysis}>→ Deep Dive</button>
                        </MagneticButton>
                    </div>
                </div>
            </section>

            <div className="stats-section" id="statsSection">
                <div className="stats-inner">
                    <div className="stat-col reveal">
                        <div className="big-num"><span className="counter" data-target="94">0</span><span>%</span></div>
                        <div className="stat-desc">Prediction Accuracy</div>
                        <div className="stat-sub">↑ 1.2% this month</div>
                    </div>
                    <div className="stat-col reveal reveal-d1">
                        <div className="big-num"><span className="counter" data-target="2400">0</span><span>+</span></div>
                        <div className="stat-desc">Daily Signals Fired</div>
                        <div className="stat-sub">Across 180 assets</div>
                    </div>
                    <div className="stat-col reveal reveal-d2">
                        <div className="big-num"><span className="counter" data-target="2">0</span><span>.4s</span></div>
                        <div className="stat-desc">Average Latency</div>
                        <div className="stat-sub">Fastest in market</div>
                    </div>
                    <div className="stat-col reveal reveal-d3">
                        <div className="big-num"><span className="counter" data-target="99">0</span><span>.9%</span></div>
                        <div className="stat-desc">Platform Uptime</div>
                        <div className="stat-sub">24/7 Live</div>
                    </div>
                </div>
            </div>

            <section className="section" id="features">
                <div className="reveal">
                    <div className="section-tag">secret sauce</div>
                    <div className="section-title">What Makes Us Different</div>
                </div>

                <div className="features-grid">
                    <div className="feat-card reveal reveal-d1">
                        <div className="feat-icon">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="14" stroke="#00FF87" strokeWidth="2" opacity="0.3" />
                                <circle cx="24" cy="24" r="9" stroke="#00FF87" strokeWidth="2" opacity="0.5" />
                                <circle cx="24" cy="24" r="4" stroke="#00FF87" strokeWidth="2" />
                                <circle cx="24" cy="24" r="1.5" fill="#00FF87" />
                                <line x1="34" y1="14" x2="44" y2="4" stroke="#00FF87" strokeWidth="2" strokeLinecap="round" />
                                <polyline points="40,4 44,4 44,8" stroke="#00FF87" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h4 className="feat-title">Real-Time Sentiment</h4>
                        <p className="feat-desc">Reddit, Twitter, and news analyzed in milliseconds. Catch institutional moves before price reflects them.</p>
                    </div>

                    <div className="feat-card reveal reveal-d2">
                        <div className="feat-icon">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="8" y="28" width="6" height="16" rx="1" fill="#00FF87" opacity="0.4" />
                                <rect x="17" y="20" width="6" height="24" rx="1" fill="#00FF87" opacity="0.6" />
                                <rect x="26" y="24" width="6" height="20" rx="1" fill="#00FF87" opacity="0.5" />
                                <rect x="35" y="12" width="6" height="32" rx="1" fill="#00FF87" opacity="0.8" />
                                <polyline points="11,31 20,23 29,27 38,15" stroke="#00FF87" strokeWidth="2" strokeLinecap="round" fill="none" />
                                <circle cx="11" cy="31" r="2.5" fill="#00FF87" />
                                <circle cx="20" cy="23" r="2.5" fill="#00FF87" />
                                <circle cx="29" cy="27" r="2.5" fill="#00FF87" />
                                <circle cx="38" cy="15" r="2.5" fill="#00FF87" />
                            </svg>
                        </div>
                        <h4 className="feat-title">Verified Track Record</h4>
                        <p className="feat-desc">Every prediction logged immutably. Full historical accuracy, no cherry-picking. See our track record live.</p>
                    </div>

                    <div className="feat-card reveal reveal-d3">
                        <div className="feat-icon">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8 C16 8 10 14 10 20 C10 28 16 32 20 34 L20 38 L28 38 L28 34 C32 32 38 28 38 20 C38 14 32 8 24 8Z" stroke="#A0A0FF" strokeWidth="2" fill="rgba(160,160,255,0.08)" />
                                <circle cx="18" cy="22" r="2" fill="#A0A0FF" />
                                <circle cx="24" cy="18" r="2" fill="#FF3B5C" />
                                <circle cx="30" cy="22" r="2" fill="#00FF87" />
                                <circle cx="21" cy="27" r="2" fill="#A0A0FF" />
                                <circle cx="37" cy="27" r="2" fill="#FFB800" />
                            </svg>
                        </div>
                        <h4 className="feat-title">Neural AI Engine</h4>
                        <p className="feat-desc">Proprietary models trained on 20 years of market data, news cycles, and behavioral finance patterns.</p>
                    </div>

                    <div className="feat-card reveal reveal-d4">
                        <div className="feat-icon">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="8" y="16" width="32" height="22" rx="3" stroke="#00C2FF" strokeWidth="2" fill="rgba(0,194,255,0.05)" />
                                <path d="M15 16V12C15 10 17 8 24 8C31 8 33 10 33 12V16" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="24" cy="27" r="4" stroke="#00C2FF" strokeWidth="2" />
                            </svg>
                        </div>
                        <h4 className="feat-title">Institutional Security</h4>
                        <p className="feat-desc">Bank-grade encryption, zero data retention policy. Your trading strategy stays yours alone.</p>
                    </div>
                </div>
            </section>

            <section className="terminal-section" id="terminal">
                <div className="reveal" style={{ textAlign: 'center' }}>
                    <div className="section-tag" style={{ justifyContent: 'center' }}>live demo</div>
                    <div className="section-title" style={{ fontSize: '48px', textAlign: 'center' }}>See It In Action</div>
                    <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>Watch TrackBets analyze NVDA in real-time</p>
                </div>

                <div className="terminal-wrap reveal">
                    <div className="terminal-bar">
                        <div className="terminal-dot d1"></div>
                        <div className="terminal-dot d2"></div>
                        <div className="terminal-dot d3"></div>
                        <span className="terminal-title">trackbets — analysis engine v2.4.1</span>
                    </div>
                    <div className="terminal-body" id="terminalBody">
                        <div className="t-line" style={{ animationDelay: '0.2s' }}><span className="t-prompt">$ </span><span className="t-cmd">trackbets analyze --asset NVDA --depth full</span></div>
                        <div className="t-line" style={{ animationDelay: '0.8s' }}><span className="t-output">◌ Fetching real-time price data...</span></div>
                        <div className="t-line" style={{ animationDelay: '1.2s' }}><span className="t-output">◌ Scanning 47 news sources...</span></div>
                        <div className="t-line" style={{ animationDelay: '1.7s' }}><span className="t-output">◌ Analyzing social sentiment (Reddit × Twitter × StockTwits)</span></div>
                        <div className="t-line" style={{ animationDelay: '2.2s' }}><span className="t-output">◌ Running proprietary ML models...</span></div>
                        <div className="t-line" style={{ animationDelay: '2.8s' }}><span className="t-output">◌ Cross-referencing institutional flow data...</span></div>
                        <div className="t-line" style={{ animationDelay: '3.4s' }}><span className="t-output">───────────────────────────────────────</span></div>
                        <div className="t-line" style={{ animationDelay: '3.8s' }}><span className="t-bull">✓ VERDICT: STRONG BUY</span></div>
                        <div className="t-line" style={{ animationDelay: '4.2s' }}><span className="t-bull">  Confidence: 94.2%</span></div>
                        <div className="t-line" style={{ animationDelay: '4.6s' }}><span className="t-output">  Price Target: $920 (+5.2%)</span></div>
                        <div className="t-line" style={{ animationDelay: '5.0s' }}><span className="t-output">  Sentiment: Bullish (82nd percentile)</span></div>
                        <div className="t-line" style={{ animationDelay: '5.4s' }}><span className="t-output">  Risk Score: 3.2/10 (Low)</span></div>
                        <div className="t-line" style={{ animationDelay: '5.8s' }}><span className="t-output">───────────────────────────────────────</span></div>
                        <div className="t-line" style={{ animationDelay: '6.2s' }}><span className="t-output">  Analysis complete in <span className="t-bull">2.4s</span></span></div>
                        <div className="t-line" style={{ animationDelay: '6.6s' }}><span className="t-prompt">$ </span><span className="t-cursor"></span></div>
                    </div>
                </div>
            </section>

            <section className="section" id="how">
                <div className="reveal">
                    <div className="section-tag">how it works</div>
                    <div className="section-title">Three Steps to Alpha</div>
                </div>
                <div className="how-grid">
                    <div className="how-step reveal reveal-d1">
                        <span className="step-num">01</span>
                        <div className="step-icon">
                            <svg viewBox="0 0 20 20"><path d="M10 2C5.6 2 2 5.6 2 10s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 4v4l3 3-1.4 1.4L8 10.8V6h2z" fill="#00FF87" /></svg>
                        </div>
                        <h4 className="step-title">Enter Any Asset</h4>
                        <p className="step-desc">Ticker symbol or company name. We cover 10,000+ stocks, crypto, and ETFs across all major exchanges globally.</p>
                    </div>
                    <div className="how-step reveal reveal-d2">
                        <span className="step-num">02</span>
                        <div className="step-icon">
                            <svg viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5v5l4 2-1 1.7L9 11V5h1z" fill="#00FF87" /></svg>
                        </div>
                        <h4 className="step-title">AI Analyzes Everything</h4>
                        <p className="step-desc">40+ real-time signals processed simultaneously: price, volume, sentiment, news, institutional flow, options chain.</p>
                    </div>
                    <div className="how-step reveal reveal-d3">
                        <span className="step-num">03</span>
                        <div className="step-icon">
                            <svg viewBox="0 0 20 20"><path d="M10 2l2.4 7.4H20l-6.2 4.5 2.4 7.4L10 17l-6.2 4.3 2.4-7.4L0 9.4h7.6z" fill="#00FF87" /></svg>
                        </div>
                        <h4 className="step-title">Get Your Verdict</h4>
                        <p className="step-desc">Crystal-clear BUY · SELL · HOLD with confidence score, price targets, and full AI reasoning in under 3 seconds.</p>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="reveal">
                    <div className="cta-tag">// start today — free</div>
                    <h2 className="cta-headline">Your Edge.<br />Starts Now.</h2>
                    <p className="cta-sub">Join thousands of traders who stopped guessing and started winning with institutional-grade intelligence.</p>
                    <div className="cta-btns">
                        <MagneticButton strength={25}>
                            <button className="btn-lg primary mag-btn" style={{ fontSize: '15px', padding: '18px 48px' }} onClick={handleStartAnalysis}>Start Free Analysis →</button>
                        </MagneticButton>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-logo">Track<span>Bets</span></div>
                <div className="footer-copy">© 2026 TrackBets. All rights reserved. Not financial advice.</div>
                <div className="footer-links">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#terminal">Demo</a>
                    <a href="#">Status</a>
                </div>
            </footer>

            <div className={`ticker-bar ${isTickerFocused ? 'focused' : ''}`}>
                <div className="ticker-track">
                    {[...tickers, ...tickers].map((t, i) => (
                        <div key={i} className="tick">
                            <span className="tick-sym">{t.sym}</span>
                            <span className="tick-price">{t.price}</span>
                            <span className={`tick-chg ${t.up ? 'up' : 'dn'}`}>{t.chg}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

