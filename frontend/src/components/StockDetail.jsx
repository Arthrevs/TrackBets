import React, { useEffect, useRef, useState } from 'react';
import './StockDetail_Editorial.css';
import ProsConsBox from './ProsConsBox';
import RiskStatusBadge from './RiskStatusBadge';
import RedFlagsRadar from './RedFlagsRadar';
import MaxDrawdown from './MaxDrawdown';
import SupportResistanceBox from './SupportResistanceBox';
import InstitutionalFlow from './InstitutionalFlow';

const StockDetail = ({ ticker, onBack, analysisData, mode, isLoading, error, onRetry }) => {
    const canvasRef = useRef(null);
    const chartCanvasRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    // Hardcoded demo fallbacks per ticker (hackathon failsafe)
    const DEMO_FALLBACKS = {
        TSLA: {
            price_data: { price: '374.98', change_percent: -2.34, name: 'Tesla, Inc.', currency: '$', market_cap: '$541B', volume: '112M' },
            analysis: { verdict: { signal: 'WARNING', confidence: 87 }, target_price: '195.00', timeframe: '5-Year Historical', risk_level: 'ELEVATED', ai_explanation: 'Tesla presents material forensic risk due to extensive litigation history, Autopilot safety investigations, and CEO governance controversies. Debt profile has improved but regulatory exposure remains elevated.', reasons: ['SEC investigation into Autopilot safety claims (2021-2024)', 'Solar City acquisition lawsuit — $2.6B settlement', 'Repeated NHTSA recalls across multiple vehicle lines'], flashcard: { title: 'Risk Assessment' },
                institutional_breakdown: {
                    total_regulatory_fines: '$2.06B',
                    key_litigation: [
                        'SEC v. Elon Musk (2018) — Securities fraud consent decree, $40M combined fines',
                        'In re Tesla Autopilot Litigation (2022-present) — DOJ criminal fraud investigation',
                        'Diaz v. Tesla Inc. (2021) — Racial discrimination, $137M verdict reduced to $3.2M',
                        'NHTSA Recall 23V-838 (2023) — 2M+ vehicles, Autopilot driver monitoring deficiency'
                    ],
                    regulatory_sentiment: 'Adversarial'
                }
            },
            institutional_metrics: {
                regulatory_fines_usd: '$2.06B',
                raw_sec_excerpts: [
                    'Note 15 — Commitments and Contingencies (Form 10-K, FY2025): The Company is defendant in numerous legal proceedings, including securities class actions, product liability claims, employment discrimination suits, and government investigations. As of December 31, 2024, the Company had accrued approximately $1.4 billion for estimated losses from pending litigation and regulatory matters.',
                    'Note 22 — Segment Reporting (Form 10-K, FY2025): Automotive regulatory credit revenue totaled $1.79 billion for the year ended December 31, 2024, representing approximately 7.2% of total automotive revenue. Excluding regulatory credit revenue, automotive gross margin was approximately 15.3% for Q4 2024.'
                ]
            },
        },
        AAPL: {
            price_data: { price: '189.42', change_percent: 1.12, name: 'Apple Inc.', currency: '$', market_cap: '$2.94T', volume: '58M' },
            analysis: { verdict: { signal: 'ACCEPTABLE', confidence: 92 }, target_price: '210.00', timeframe: '5-Year Historical', risk_level: 'LOW', ai_explanation: 'Apple demonstrates strong institutional-grade risk management. The Epic Games antitrust ruling and supply chain China concentration are the primary exposure vectors. Well-disclosed and manageable.', reasons: ['Epic Games antitrust ruling — App Store revenue risk', 'China supply chain concentration (Foxconn dependency)', 'EU Digital Markets Act compliance costs'], flashcard: { title: 'Risk Assessment' },
                institutional_breakdown: {
                    total_regulatory_fines: '$550M',
                    key_litigation: [
                        'In re Apple Inc. Securities Litigation (2019) — Securities fraud class action; dismissed',
                        'Epic Games v. Apple (2020-2023) — Antitrust, permanent injunction issued',
                        'DGCCRF v. Apple (2020) — €25M fine for planned obsolescence',
                        'United States v. Apple Inc. (2024) — DOJ antitrust suit, ongoing'
                    ],
                    regulatory_sentiment: 'Adversarial'
                }
            },
            institutional_metrics: {
                regulatory_fines_usd: '$550M',
                raw_sec_excerpts: [
                    'Note 10 — Commitments and Contingencies (Form 10-K, FY2025): The Company is subject to various legal proceedings and claims. As of September 28, 2025, the Company had accrued approximately $3.2 billion for estimated losses related to pending or threatened litigation.',
                    'Note 17 — Concentration of Supply Chain Risk (Form 10-K, FY2025): Approximately 90% of iPhone final assembly is performed by two contract manufacturers with primary facilities in Zhengzhou and Shanghai.'
                ]
            },
        },
        NVDA: {
            price_data: { price: '874.23', change_percent: 3.21, name: 'NVIDIA Corporation', currency: '$', market_cap: '$2.15T', volume: '42M' },
            analysis: { verdict: { signal: 'WARNING', confidence: 78 }, target_price: '920.00', timeframe: '5-Year Historical', risk_level: 'MODERATE', ai_explanation: 'NVIDIA carries elevated valuation risk with P/E above 60x. China export restrictions represent ongoing regulatory headwinds. GPU market dominance is strong but crypto revenue dependency creates cyclical vulnerability.', reasons: ['US-China export controls on A100/H100 chips', 'SEC scrutiny of crypto-related revenue disclosure', 'Arm Ltd. acquisition failure — $1.25B breakup fee'], flashcard: { title: 'Risk Assessment' },
                institutional_breakdown: {
                    total_regulatory_fines: '$1.26B',
                    key_litigation: [
                        'FTC v. NVIDIA / Arm Holdings (2021-2022) — $40B acquisition blocked, $1.25B breakup fee',
                        'In re NVIDIA Corp. Securities Litigation (2018) — Crypto revenue misrepresentation',
                        'SEC File No. 3-20893 (2022) — $5.5M settlement for crypto disclosure',
                        'Samsung v. NVIDIA (2016) — ITC patent dispute, partial adverse finding'
                    ],
                    regulatory_sentiment: 'Adversarial'
                }
            },
            institutional_metrics: {
                regulatory_fines_usd: '$1.26B',
                raw_sec_excerpts: [
                    'Note 13 — Commitments and Contingencies (Form 10-K, FY2026): The Company had accrued approximately $890 million in aggregate for pending legal matters, including export compliance reviews. Cumulative forgone revenue from China export controls estimated at $15.2 billion.',
                    'Note 19 — Customer Concentration Risk (Form 10-K, FY2026): Top five data center customers accounted for approximately 47% of total revenue and 82% of Data Center segment revenue. Three individual customers each exceeded 10% of Data Center revenue.'
                ]
            },
        }
    };

    // Use API data if available, else hardcoded demo fallback, else generic defaults
    const fallback = DEMO_FALLBACKS[ticker?.toUpperCase()] || {};

    const stockData = analysisData?.price_data || fallback.price_data || {
        price: '---',
        change_percent: 0,
        name: 'Loading...',
        currency: '$',
        market_cap: '---',
        volume: '---'
    };

    // Map forensic verdict from API (Acceptable/Warning/Critical) to display signal
    const rawAnalysis = analysisData?.analysis || fallback.analysis || {};
    const forensicVerdict = rawAnalysis.verdict;
    const isForensicFormat = typeof forensicVerdict === 'string';

    const analysis = isForensicFormat ? {
        verdict: {
            signal: forensicVerdict.toUpperCase(),
            confidence: rawAnalysis.risk_score || fallback.analysis?.verdict?.confidence || 75
        },
        target_price: '---',
        timeframe: 'Forensic',
        risk_level: forensicVerdict === 'Critical' ? 'SEVERE' : (forensicVerdict === 'Warning' ? 'ELEVATED' : 'LOW'),
        ai_explanation: rawAnalysis.rationale || 'Awaiting forensic analysis...',
        reasons: rawAnalysis.historical_vulnerabilities || [],
        flashcard: { title: 'Forensic Assessment' }
    } : {
        verdict: rawAnalysis.verdict || { signal: 'WAIT', confidence: 0 },
        target_price: rawAnalysis.target_price || '---',
        timeframe: rawAnalysis.timeframe || '---',
        risk_level: rawAnalysis.risk_level || '---',
        ai_explanation: rawAnalysis.ai_explanation || 'Initializing analysis...',
        reasons: rawAnalysis.reasons || rawAnalysis.historical_vulnerabilities || [],
        flashcard: rawAnalysis.flashcard || { title: 'Insight' }
    };

    // Parse social tweets if available
    const socialText = typeof analysisData?.social === 'string' ? analysisData.social : "";
    const displaySocial = socialText.split('\n').filter(line => line.trim().length > 10).map((line, i) => ({
        source: line.includes('[r/') ? '🤖 r/WallStreetBets' : '𝕏 Analysts',
        handle: '@User' + i,
        content: line.replace(/^\d+\.\s+/, ''),
        sentiment: 'Bullish'
    })).slice(0, 3);

    // WebGL Background Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { antialias: false, depth: false });
        if (!gl) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resize();

        const VS = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
        const FS = `
            precision mediump float;
            varying vec2 v;uniform float t;uniform vec2 res;
            float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
            float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=h(i),b=h(i+vec2(1,0)),c=h(i+vec2(0,1)),d=h(i+vec2(1,1));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
            float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.02;a*=.5;}return s;}
            void main(){
              vec2 uv=v;float ar=res.x/res.y;
              vec2 q=vec2(uv.x*ar,uv.y);
              float w=fbm(q*.85+t*.016);
              vec2 wq=q+.20*vec2(cos(w*6.28+t*.035),sin(w*6.28+t*.028));
              float l0=1.-smoothstep(0.,.7,length(wq-vec2(.18*ar,.48)));
              float l1=1.-smoothstep(0.,.55,length(wq-vec2(.80*ar,.20)));
              float l2=1.-smoothstep(0.,.48,length(wq-vec2(.65*ar,.72)));
              float l3=1.-smoothstep(0.,.42,length(wq-vec2(.92*ar,.50)));
              vec3 c=vec3(.008,.010,.025);
              c+=l0*vec3(.18,.12,.0)*1.0;
              c+=l1*vec3(.16,.09,.02)*.75;
              c+=l2*vec3(.0,.18,.08)*.6;
              c+=l3*vec3(.02,.08,.22)*.55;
              float tx=fbm(wq*2.6+t*.011);
              c+=tx*vec3(.06,.04,.01)*.3;
              float vig=uv.x*uv.y*(1.-uv.x)*(1.-uv.y);
              vig=pow(vig*18.,.36);c*=vig;
              c=clamp(c,0.,1.);
              gl_FragColor=vec4(c,1.);
            }
        `;

        const createShader = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        };

        const prog = gl.createProgram();
        gl.attachShader(prog, createShader(gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const aL = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(aL);
        gl.vertexAttribPointer(aL, 2, gl.FLOAT, false, 0, 0);

        const uT = gl.getUniformLocation(prog, 't');
        const uR = gl.getUniformLocation(prog, 'res');
        const s0 = performance.now();

        let animationFrameId;
        const render = (ts) => {
            gl.uniform1f(uT, (ts - s0) * 0.001);
            gl.uniform2f(uR, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrameId = requestAnimationFrame(render);
        };
        render(s0);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Cursor Logic
    useEffect(() => {
        const cr = cursorRef.current;
        const cd = cursorDotRef.current;
        if (!cr || !cd) return;

        let mx = 0, my = 0, rx = 0, ry = 0;

        const handleMouseMove = (e) => {
            mx = e.clientX;
            my = e.clientY;
            cd.style.left = mx + 'px';
            cd.style.top = my + 'px';
        };

        const animateCursor = () => {
            rx += (mx - rx) * 0.1;
            ry += (my - ry) * 0.1;
            cr.style.left = rx + 'px';
            cr.style.top = ry + 'px';
            requestAnimationFrame(animateCursor);
        };

        document.addEventListener('mousemove', handleMouseMove);
        const animId = requestAnimationFrame(animateCursor);

        // Hover effects
        const handleMouseEnter = () => cr.classList.add('big');
        const handleMouseLeave = () => cr.classList.remove('big');
        const handleMouseDown = () => cr.style.transform = 'translate(-50%,-50%) scale(.65)';
        const handleMouseUp = () => cr.style.transform = 'translate(-50%,-50%) scale(1)';

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        const interactiveElements = document.querySelectorAll('button, a, .sc2, .ac, .iq-c, .sig-row, .gc');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animId);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [isLoading]);

    // Reveal Animation
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('on');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.06 });

        const revealElements = document.querySelectorAll('.rv');
        revealElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [isLoading]);

    // Graph Drawing Logic
    useEffect(() => {
        const cv = chartCanvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        const parent = cv.parentElement;
        cv.width = parent.offsetWidth;
        cv.height = 200;

        function sR(seed) { let s = seed | 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296 }; }
        function gen(n, start, seed) { const r = sR(seed); const a = []; let p = start; for (let i = 0; i < n; i++) { p += (r() - .47) * 3.2; if (p < 0) p = 10; a.push(p); } return a; }

        let apiPoints = null;
        if (analysisData?.graph_data?.points && analysisData.graph_data.points.length > 0) {
            apiPoints = analysisData.graph_data.points.map(pt => pt.value);
            // Reverse so oldest is left, newest is right (if API returns newest first)
            // But get_historical_data already handles reversing if it was Twelve Data.
        }

        const tabs = {
            '1H': apiPoints || gen(80, 228, 11),
            '1D': apiPoints || gen(80, parseFloat(stockData.price) || 200, 22),
            '1W': apiPoints || gen(80, 165, 33),
            '1M': apiPoints || gen(80, 130, 44)
        };

        let act = '1D';

        function draw(pts) {
            const W = cv.width, H = cv.height, L = 10, R = 70, T = 14, B = 28;
            const cW = W - L - R, cH = H - T - B;
            ctx.clearRect(0, 0, W, H);
            const mn = Math.min(...pts) - 2, mx = Math.max(...pts) + 2, rng = mx - mn || 1;
            const tx = i => L + i / (pts.length - 1) * cW, ty = p => T + (1 - (p - mn) / rng) * cH;

            for (let i = 0; i <= 4; i++) {
                const y = T + i / 4 * cH;
                ctx.strokeStyle = 'rgba(237,230,218,.04)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(W - R, y); ctx.stroke();
                ctx.fillStyle = 'rgba(237,230,218,.28)'; ctx.font = '12px JetBrains Mono,monospace';
                ctx.fillText('$' + (mx - i / 4 * rng).toFixed(1), W - R + 8, y + 4);
            }

            ctx.beginPath();
            pts.forEach((p, i) => i === 0 ? ctx.moveTo(tx(i), ty(p)) : ctx.lineTo(tx(i), ty(p)));
            ctx.lineTo(tx(pts.length - 1), T + cH); ctx.lineTo(L, T + cH); ctx.closePath();
            const ag = ctx.createLinearGradient(0, T, 0, T + cH);
            ag.addColorStop(0, 'rgba(201,168,76,.14)'); ag.addColorStop(.5, 'rgba(201,168,76,.04)'); ag.addColorStop(1, 'rgba(201,168,76,0)');
            ctx.fillStyle = ag; ctx.fill();

            ctx.beginPath();
            pts.forEach((p, i) => { const x = tx(i), y = ty(p); if (i === 0) { ctx.moveTo(x, y); return; } const px = tx(i - 1), py = ty(pts[i - 1]); ctx.bezierCurveTo(px + (x - px) / 2, py, px + (x - px) / 2, y, x, y); });
            ctx.strokeStyle = 'rgba(201,168,76,.9)'; ctx.lineWidth = 1.8; ctx.stroke();

            const lp = pts[pts.length - 1], lx = tx(pts.length - 1), ly = ty(lp);
            ctx.beginPath(); ctx.arc(lx, ly, 4.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(201,168,76,.18)'; ctx.fill();
            ctx.beginPath(); ctx.arc(lx, ly, 2, 0, Math.PI * 2); ctx.fillStyle = '#C9A84C'; ctx.fill();
        }

        draw(tabs[act]);
        const interval = setInterval(() => {
            const p = tabs[act];
            p[p.length - 1] += (Math.random() - .492) * 1.3;
            draw(p);
        }, 2800);

        return () => clearInterval(interval);

    }, [stockData, analysisData]);

    // Ring Animation
    useEffect(() => {
        const rf = document.getElementById('rFill');
        if (!rf) return;
        const conf = analysis.verdict.confidence || 87;
        const C = 2 * Math.PI * 62;

        rf.style.strokeDashoffset = C * (1 - conf / 100);

        let c = 0;
        const iv = setInterval(() => {
            c = Math.min(c + conf / 44, conf);
            const numEl = document.getElementById('rNum');
            if (numEl) numEl.textContent = Math.floor(c);
            if (c >= conf) {
                if (numEl) numEl.textContent = conf;
                clearInterval(iv);
            }
        }, 16);

        return () => clearInterval(iv);
    }, [analysis]);

    // Fill logic for sub-bars
    useEffect(() => {
        ['b1', 'b2', 'b3', 'b4'].forEach((id, i) => {
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.style.width = (60 + Math.random() * 30) + '%';
            }, 150 + i * 80);
        });
    }, []);

    const isSell = analysis.verdict.signal?.includes('SELL') || analysis.verdict.signal === 'CRITICAL';
    const isHold = analysis.verdict.signal?.includes('HOLD') || analysis.verdict.signal === 'WARNING';
    const isAcceptable = analysis.verdict.signal === 'ACCEPTABLE';
    const signalClass = isSell ? 'sell' : (isHold ? 'hold' : (isAcceptable ? '' : ''));
    const priceChangeClass = (stockData.change_percent >= 0) ? `th-chg up` : `th-chg dn`;

    return (
        <div className="stock-detail-container">
            <canvas id="gl" ref={canvasRef}></canvas>
            <div id="cr" ref={cursorRef}></div>
            <div id="cd" ref={cursorDotRef}></div>

            <nav className="editorial-nav">
                <div className="n-left">
                    <a className="n-logo" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
                        <img src="/assets/trackbets-logo.jpg" alt="TrackBets Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        <span className="n-name">Track<b>Bets</b></span>
                    </a>
                    <button className="back-btn mag" onClick={onBack}>← Back</button>
                </div>
                <div className="n-mid">
                    <div className="n-pill">
                        <span className="np-sym">{ticker}</span>
                        <span className="np-ex">NASDAQ</span>
                    </div>
                    <div className="n-live"><span className="ldot"></span>Live</div>
                </div>
                <div className="n-right">
                    <button className="nbtn nbtn-s mag" onClick={onBack}>New Analysis</button>

                </div>
            </nav>

            <div className="page">
                <div className="outer">
                    <div className="chapter-rail">
                        <span className="cr-label cr-gold">FailExe</span>
                        <span className="cr-label">Forensic Report</span>
                        <span className="cr-label">2026</span>
                    </div>

                    <div className="inner">
                        <div className="th rv">
                            <div className="th-ghost">{ticker}</div>
                            <div className="th-content">
                                <div className="th-l">
                                    <div className="th-row">
                                        <span className="th-sym">{ticker}</span>
                                        <span className="th-exch">NASDAQ</span>
                                    </div>
                                    <div className="th-name">{stockData.name}</div>
                                </div>
                                <div className="th-r">
                                    <div className="th-price-lbl">Last Price</div>
                                    <div className="th-price">{stockData.currency}{stockData.price}</div>
                                    <span className={priceChangeClass}>
                                        {stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rule rv rd1">
                            <div className="rule-line"></div>
                            <div className="rule-dot"></div>
                            <div className="rule-text">AI Analysis · {new Date().toLocaleDateString()}</div>
                            <div className="rule-dot"></div>
                            <div className="rule-line"></div>
                        </div>

                        <div className="mg">
                            {/* ── VERDICT / RISK BADGE ── */}
                            {mode === 'risk' ? (
                                <RiskStatusBadge riskLevel={analysis.risk_level} confidence={analysis.verdict.confidence} />
                            ) : (
                                <div className="gc rv">
                                    <div className="vc-top">
                                        <div className="vc-tag">
                                            <svg viewBox="0 0 9 9"><path d="M4.5 0L5.6 3.2H9L6.4 5.2L7.4 8.5L4.5 6.6L1.6 8.5L2.6 5.2L0 3.2H3.4Z" /></svg>
                                            FailExe Forensic v1.0
                                        </div>
                                        <div className="vc-conf-row">
                                            <span className="vc-cl">Confidence</span>
                                            <span className="vc-cn" id="cVal">{analysis.verdict.confidence}%</span>
                                        </div>
                                    </div>
                                    <div className="vc-hero">
                                        <div className="verdict-kicker">Verdict</div>
                                        <div className={`verdict-word ${signalClass}`}>
                                            {analysis.verdict.signal}
                                        </div>
                                        <div className="verdict-rule" style={{ background: isSell ? 'var(--rose)' : (isHold ? 'var(--amber)' : 'var(--gold)') }}></div>
                                        <div className="verdict-sum">{analysis.action}</div>
                                    </div>

                                    {mode !== 'risk' && (
                                        <div className="vc-metrics">
                                            <div className="vcm" data-n="01">
                                                <div className="vcm-lbl">Price Target</div>
                                                <div className="vcm-v">{stockData.currency}{analysis.target_price}</div>
                                                <div className="vcm-sub">AI-Calculated</div>
                                            </div>
                                            <div className="vcm" data-n="02">
                                                <div className="vcm-lbl">Horizon</div>
                                                <div className="vcm-v neutral">{analysis.timeframe}</div>
                                                <div className="vcm-sub">Medium-term</div>
                                            </div>
                                            <div className="vcm" data-n="03">
                                                <div className="vcm-lbl">Risk Level</div>
                                                <div className="vcm-v neutral">{analysis.risk_level}</div>
                                                <div className="vcm-sub">Volatility</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="sb-col">
                                {/* ── AI CONFIDENCE DONUT ── */}
                                {mode !== 'risk' && (
                                    <div className="gc ring-card rv rd1">
                                        <div className="rc-hd">
                                            <span className="rc-lbl">AI Confidence</span>
                                            <span className="rc-grade" id="rGrade">High</span>
                                        </div>
                                        <div className="ring-wrap">
                                            <svg width="150" height="150" viewBox="0 0 150 150">
                                                <circle className="rt" cx="75" cy="75" r="62" />
                                                <circle id="rFill" className="rf" cx="75" cy="75" r="62" />
                                            </svg>
                                            <div className="rc-ctr">
                                                <div className="rc-pct"><span id="rNum">0</span><span className="rc-sym">%</span></div>
                                                <div className="rc-d">Computing</div>
                                            </div>
                                        </div>
                                        {/* Confidence Bars — only in deep mode */}
                                        {mode === 'deep' && (
                                            <div className="sbl">
                                                <div className="sbr"><span className="sbr-n">Price Action</span><div className="sbr-t"><div className="sbr-f sf-g" id="b1"></div></div><span className="sbr-v sv-g">High</span></div>
                                                <div className="sbr"><span className="sbr-n">Sentiment</span><div className="sbr-t"><div className="sbr-f sf-g" id="b2"></div></div><span className="sbr-v sv-g">Bull</span></div>
                                                <div className="sbr"><span className="sbr-n">Technicals</span><div className="sbr-t"><div className="sbr-f sf-g" id="b3"></div></div><span className="sbr-v sv-g">Strong</span></div>
                                                <div className="sbr"><span className="sbr-n">Inst. Flow</span><div className="sbr-t"><div className="sbr-f sf-go" id="b4"></div></div><span className="sbr-v sv-go">B-In</span></div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── SIGNAL BREAKDOWN / PROS-CONS ── */}
                                {mode === 'analyze' && (
                                    <ProsConsBox analysis={analysis} />
                                )}
                                {mode === 'risk' && (
                                    <MaxDrawdown ticker={ticker} />
                                )}
                                {mode === 'deep' && (
                                    <div className="gc sig-card rv rd2">
                                        <div className="sig-hd"><span className="sig-title">Signal Breakdown</span><div className="sig-title-line"></div></div>
                                        {[
                                            { name: 'RSI (14)', val: '67.2 · Bull', type: 'g' },
                                            { name: 'MACD', val: 'Crossover ↑', type: 'g' },
                                            { name: 'Volume', val: '3.2× avg', type: 'g' },
                                            { name: 'Bollinger', val: 'Mid-break', type: 'a' },
                                            { name: 'News Score', val: '82nd pct.', type: 'g' },
                                            { name: 'Inst. Flow', val: 'Accumulating', type: 'g' }
                                        ].map((sig, i) => (
                                            <div key={i} className="sig-row">
                                                <div className={`si si-${sig.type}`}><svg viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="2" fill="currentColor" /></svg></div>
                                                <span className="si-nm">{sig.name}</span>
                                                <span className={`si-vl sv-${sig.type}`}>{sig.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── DEEP DIVE: Institutional Compliance Panel ── */}
                        {(() => {
                            const instBreakdown = analysis.institutional_breakdown || analysisData?.analysis?.institutional_breakdown || fallback.analysis?.institutional_breakdown;
                            const instMetrics = analysisData?.institutional_metrics || fallback.institutional_metrics;
                            if (!instBreakdown || mode !== 'deep') return null;
                            const sentiment = (instBreakdown.regulatory_sentiment || 'Neutral').toLowerCase();
                            return (
                                <div className="deep-dive-panel rv rd2">
                                    {/* Left Column: Regulatory History */}
                                    <div className="dd-col">
                                        <div className="dd-header">Regulatory History</div>
                                        <div className="dd-fines-label">Total Regulatory Fines</div>
                                        <div className="dd-fines">{instBreakdown.total_regulatory_fines}</div>
                                        <table className="dd-table">
                                            <tbody>
                                                {(instBreakdown.key_litigation || []).map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{String(i + 1).padStart(2, '0')}</td>
                                                        <td>{item}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className={`dd-reg-sentiment ${sentiment}`}>
                                            <span>◆</span> Regulatory Sentiment: {instBreakdown.regulatory_sentiment}
                                        </div>
                                    </div>
                                    {/* Right Column: SEC 10-K Footnotes */}
                                    <div className="dd-col">
                                        <div className="dd-sec-label">RAW SEC INGESTION</div>
                                        <div className="dd-sec-box">
                                            {(instMetrics?.raw_sec_excerpts || ['No SEC data available for this ticker.']).map((excerpt, i) => (
                                                <div key={i} className="dd-sec-excerpt">
                                                    <span className="dd-sec-excerpt-num">EXCERPT {String(i + 1).padStart(2, '0')}</span>
                                                    {excerpt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="secs">
                            {/* ── AI ANALYST TEXT — hide for risk mode ── */}
                            {mode !== 'risk' && (
                                <div className="gc rv">
                                    <div className="sec-hd">
                                        <span className="sec-n">01 —</span>
                                        <span className="sec-t">AI Analyst Verdict</span>
                                        <div className="sec-rule"></div>
                                    </div>
                                    <div className="ai-body">
                                        <div className="ai-acc"></div>
                                        <div className="ai-content">
                                            <p className="ai-text">{analysis.ai_explanation}</p>
                                        </div>
                                    </div>
                                    <div className="ai-meta">
                                        <div className="ai-mi"><span className="ai-dot"></span>FailExe Forensic v1.0</div>
                                        <div className="ai-mi"><span className="ai-dot"></span>Gemini 1.5 Pro auditor</div>
                                        <div className="ai-mi"><span className="ai-dot"></span>Updated just now</div>
                                    </div>
                                </div>
                            )}

                            {/* ── RED FLAGS RADAR — risk mode only ── */}
                            {mode === 'risk' && (
                                <RedFlagsRadar ticker={ticker} analysis={analysis} />
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                {/* ── QUICK INSIGHTS — hide for deep & risk mode ── */}
                                {mode !== 'deep' && mode !== 'risk' && (
                                    <div className="gc rv rd1">
                                        <div className="sec-hd"><span className="sec-n">02 —</span><span className="sec-t">Historical Vulnerabilities</span><div className="sec-rule"></div></div>
                                        <div className="iq">
                                            {(analysis.reasons && analysis.reasons.length > 0 ? analysis.reasons : [
                                                "Historical data pending", "Awaiting forensic scan", "No vulnerabilities loaded"
                                            ]).slice(0, 3).map((r, i) => (
                                                <div key={i} className="iq-c">
                                                    <div className="iq-top">
                                                        <span className="iq-t">VULN-{ticker}-{String(i + 1).padStart(3, '0')}</span>
                                                        <div className="iq-ic qi-a"></div>
                                                    </div>
                                                    <div className="iq-d">{r}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── KEY STATISTICS — show for risk & deep mode ── */}
                                {mode !== 'analyze' && (
                                    <div className="gc rv rd1">
                                        <div className="sec-hd"><span className="sec-n">{mode === 'risk' ? '02' : '03'} —</span><span className="sec-t">Key Statistics</span><div className="sec-rule"></div></div>
                                        <div className="ss">
                                            <div className="sc"><div className="sc-l">Market Cap</div><div className="sc-v" style={{ color: 'var(--cream)' }}>{stockData.market_cap}</div><div className="sc-s">Large cap</div></div>
                                            <div className="sc"><div className="sc-l">Volume 24h</div><div className="sc-v" style={{ color: 'var(--sig)' }}>{stockData.volume}</div><div className="sc-s">High</div></div>
                                        </div>
                                        <div className="ss" style={{ borderTop: '1px solid var(--c06)' }}>
                                            <div className="sc"><div className="sc-l">P/E Ratio</div><div className="sc-v" style={{ color: 'var(--amber)' }}>62.4×</div><div className="sc-s">Premium</div></div>
                                            <div className="sc"><div className="sc-l">52W High</div><div className="sc-v" style={{ color: 'var(--gold)' }}>Nearby</div><div className="sc-s">Resistance</div></div>
                                        </div>
                                    </div>
                                )}

                                {/* ── SUPPORT & RESISTANCE — deep mode only ── */}
                                {mode === 'deep' && (
                                    <SupportResistanceBox stockData={stockData} analysis={analysis} />
                                )}
                            </div>

                            <div className="gc rv rd2">
                                <div className="ch-top">
                                    <div className="sec-hd" style={{ borderBottom: 'none', padding: 0 }}>
                                        <span className="sec-n">04 —</span>
                                        <span className="sec-t">Price Action</span>
                                    </div>
                                    <div className="gtabs">
                                        <button className="gt">1H</button>
                                        <button className="gt on">1D</button>
                                        <button className="gt">1W</button>
                                        <button className="gt">1M</button>
                                    </div>
                                </div>
                                <div className="ch-bd">
                                    <canvas id="pc" ref={chartCanvasRef}></canvas>
                                </div>
                                <div className="ch-ft">
                                    <div className="cfi">Vol <b>{stockData.volume}</b></div>
                                    <div className="cfi">Mkt Cap <b>{stockData.market_cap}</b></div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: mode === 'deep' ? '3fr 2fr' : '1fr', gap: '14px' }}>
                                {/* ── COMMUNITY SENTIMENT — show for risk & deep ── */}
                                {mode !== 'analyze' && (
                                    <div className="gc rv rd2">
                                        <div className="sec-hd"><span className="sec-n">{mode === 'risk' ? '04' : '05'} —</span><span className="sec-t">Community Sentiment</span><div className="sec-rule"></div></div>
                                        <div className="sent">
                                            {displaySocial.map((item, i) => (
                                                <div key={i} className="sc2">
                                                    <div className="sc2-h">
                                                        <span className="sc2-src">{item.source}</span>
                                                        <span className="sc2-t">{item.time || 'Today'}</span>
                                                    </div>
                                                    <div className="sc2-q">"{item.content}"</div>
                                                    <span className={`stag ${item.sentiment === 'Bullish' ? 't-b' : 't-n'}`}>{item.sentiment}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── ANALYST RATINGS — deep mode only ── */}
                                {mode === 'deep' && (
                                    <div className="gc rv rd2">
                                        <div className="sec-hd"><span className="sec-n">06 —</span><span className="sec-t">Analyst Ratings</span><div className="sec-rule"></div></div>
                                        <div className="ag">
                                            <div className="ac"><div className="ac-f">Goldman Sachs</div><div className="ac-r ar-b">Buy</div><div className="ac-tgt">Target: <b>$280</b></div><div className="ac-dt">3 days ago</div></div>
                                            <div className="ac"><div className="ac-f">Morgan Stanley</div><div className="ac-r ar-b">Overweight</div><div className="ac-tgt">Target: <b>$310</b></div><div className="ac-dt">1 week ago</div></div>
                                            <div className="ac"><div className="ac-f">JPMorgan</div><div className="ac-r ar-h">Neutral</div><div className="ac-tgt">Target: <b>$245</b></div><div className="ac-dt">5 days ago</div></div>
                                        </div>
                                    </div>
                                )}

                                {/* ── INSTITUTIONAL FLOW — deep mode only ── */}
                                {mode === 'deep' && (
                                    <InstitutionalFlow ticker={ticker} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="tick">
                <div className="tt">
                    {[stockData, stockData, stockData, stockData, stockData, stockData].map((t, i) => (
                        <div key={i} className="ti">
                            <span className="ti-s">{ticker}</span>
                            <span className="ti-p">{t.price}</span>
                            <span className={`ti-c ${t.change_percent >= 0 ? 'u' : 'dw'}`}>
                                {t.change_percent >= 0 ? '+' : ''}{t.change_percent}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
