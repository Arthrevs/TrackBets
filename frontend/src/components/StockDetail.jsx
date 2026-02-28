import React, { useEffect, useRef, useState } from 'react';
import './StockDetail_Editorial.css';

const StockDetail = ({ ticker, onBack, analysisData, isLoading, error, onRetry }) => {
    const canvasRef = useRef(null);
    const chartCanvasRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    // Default data if analysisData is missing (for initial render/transitions)
    const stockData = analysisData?.price_data || {
        price: '---',
        change_percent: 0,
        name: 'Loading...',
        currency: '$',
        market_cap: '---',
        volume: '---'
    };

    const analysis = analysisData?.analysis || {
        verdict: { signal: 'WAIT', confidence: 0 },
        target_price: '---',
        timeframe: '---',
        risk_level: '---',
        ai_explanation: 'Initializing analysis...',
        reasons: [],
        flashcard: { title: 'Insight' }
    };

    // Parse social tweets if available
    const socialText = typeof analysisData?.social === 'string' ? analysisData.social : "";
    const socialItems = socialText.split('\n').filter(line => line.trim().length > 10).map((line, i) => ({
        source: line.includes('[r/') ? 'r/WallStreetBets' : 'Twitter',
        handle: '@User' + i,
        content: line.replace(/^\d+\.\s+/, ''),
        sentiment: 'Bullish'
    })).slice(0, 3);

    // If no social items, use mock from user design for display purposes
    const displaySocial = socialItems.length > 0 ? socialItems : [
        { source: '@TeslaInvestor', content: `$${ticker} breaking above resistance on monster volume. This is the move we've been waiting for.`, sentiment: 'Bullish', time: '2h ago' },
        { source: 'r/WallStreetBets', content: 'RSI oversold last week, momentum shifting now. Buying this dip. Calls loaded.', sentiment: 'Bullish', time: '4h ago' },
        { source: 'MarketWatch', content: 'Sector rally continues. Analyst upgrades follow stronger delivery data.', sentiment: 'Neutral', time: '5h ago' }
    ];

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

        const tabs = {
            '1H': gen(80, 228, 11),
            '1D': gen(80, parseFloat(stockData.price) || 200, 22),
            '1W': gen(80, 165, 33),
            '1M': gen(80, 130, 44)
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

    }, [stockData]);

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

    const isSell = analysis.verdict.signal?.includes('SELL');
    const isHold = analysis.verdict.signal?.includes('HOLD');
    const signalClass = isSell ? 'sell' : (isHold ? 'hold' : '');
    const priceChangeClass = (stockData.change_percent >= 0) ? `th-chg up` : `th-chg dn`;

    return (
        <div className="stock-detail-container">
            <canvas id="gl" ref={canvasRef}></canvas>
            <div id="cr" ref={cursorRef}></div>
            <div id="cd" ref={cursorDotRef}></div>

            <nav className="editorial-nav">
                <a className="n-logo" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
                    <div className="n-sq"></div>
                    <span className="n-name">Track<b>Bets</b></span>
                </a>
                <div className="n-mid">
                    <button className="back-btn mag" onClick={onBack}>← Back</button>
                    <div className="n-pill">
                        <span className="np-sym">{ticker}</span>
                        <span className="np-ex">NASDAQ</span>
                    </div>
                </div>
                <div className="n-right">
                    <div className="n-live"><span className="ldot"></span>Live</div>
                    <button className="nbtn nbtn-g mag">Sign In</button>
                    <button className="nbtn nbtn-s mag">New Analysis</button>
                </div>
            </nav>

            <div className="page">
                <div className="outer">
                    <div className="chapter-rail">
                        <span className="cr-label cr-gold">TrackBets</span>
                        <span className="cr-label">Analysis Report</span>
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
                            <div className="gc rv">
                                <div className="vc-top">
                                    <div className="vc-tag">
                                        <svg viewBox="0 0 9 9"><path d="M4.5 0L5.6 3.2H9L6.4 5.2L7.4 8.5L4.5 6.6L1.6 8.5L2.6 5.2L0 3.2H3.4Z" /></svg>
                                        TrackBets AI v2.4
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
                                <div className="vbar-row">
                                    <div className="vbars" style={{ gap: '2.5px', display: 'flex', alignItems: 'flexEnd' }}>
                                        {[...Array(8)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`vb ${i < Math.round(analysis.verdict.confidence / 13) ? 'on' : ''} ${isSell ? 'sell' : ''}`}
                                                style={{ height: `${12 + i * 4}px` }}
                                            ></div>
                                        ))}
                                    </div>
                                    <span className="vb-lbl">Signal Strength</span>
                                </div>
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
                            </div>

                            <div className="sb-col">
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
                                    <div className="sbl">
                                        <div className="sbr"><span className="sbr-n">Price Action</span><div className="sbr-t"><div className="sbr-f sf-g" id="b1"></div></div><span className="sbr-v sv-g">High</span></div>
                                        <div className="sbr"><span className="sbr-n">Sentiment</span><div className="sbr-t"><div className="sbr-f sf-g" id="b2"></div></div><span className="sbr-v sv-g">Bull</span></div>
                                        <div className="sbr"><span className="sbr-n">Technicals</span><div className="sbr-t"><div className="sbr-f sf-g" id="b3"></div></div><span className="sbr-v sv-g">Strong</span></div>
                                        <div className="sbr"><span className="sbr-n">Inst. Flow</span><div className="sbr-t"><div className="sbr-f sf-go" id="b4"></div></div><span className="sbr-v sv-go">B-In</span></div>
                                    </div>
                                </div>
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
                            </div>
                        </div>

                        <div className="secs">
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
                                    <div className="ai-mi"><span className="ai-dot"></span>TrackBets AI v2.4</div>
                                    <div className="ai-mi"><span className="ai-dot"></span>47 sources scanned</div>
                                    <div className="ai-mi"><span className="ai-dot"></span>Updated just now</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="gc rv rd1">
                                    <div className="sec-hd"><span className="sec-n">02 —</span><span className="sec-t">Quick Insights</span><div className="sec-rule"></div></div>
                                    <div className="iq">
                                        {(analysis.reasons && analysis.reasons.length > 0 ? analysis.reasons : [
                                            "EPS beat estimates", "Sentiment Spike", "Volume Surge", "Risk Flag"
                                        ]).slice(0, 4).map((r, i) => (
                                            <div key={i} className="iq-c">
                                                <div className="iq-top">
                                                    <span className="iq-t">Insight {i + 1}</span>
                                                    <div className="iq-ic qi-a"></div>
                                                </div>
                                                <div className="iq-d">{r}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="gc rv rd1">
                                    <div className="sec-hd"><span className="sec-n">03 —</span><span className="sec-t">Key Statistics</span><div className="sec-rule"></div></div>
                                    <div className="ss">
                                        <div className="sc"><div className="sc-l">Market Cap</div><div className="sc-v" style={{ color: 'var(--cream)' }}>{stockData.market_cap}</div><div className="sc-s">Large cap</div></div>
                                        <div className="sc"><div className="sc-l">Volume 24h</div><div className="sc-v" style={{ color: 'var(--sig)' }}>{stockData.volume}</div><div className="sc-s">High</div></div>
                                    </div>
                                    <div className="ss" style={{ borderTop: '1px solid var(--c06)' }}>
                                        <div className="sc"><div className="sc-l">P/E Ratio</div><div className="sc-v" style={{ color: 'var(--amber)' }}>62.4×</div><div className="sc-s">Premium</div></div>
                                        <div className="sc"><div className="sc-l">52W High</div><div className="sc-v" style={{ color: 'var(--gold)' }}>Nearby</div><div className="sc-s">Resistance</div></div>
                                    </div>
                                </div>
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

                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '14px' }}>
                                <div className="gc rv rd2">
                                    <div className="sec-hd"><span className="sec-n">05 —</span><span className="sec-t">Community Sentiment</span><div className="sec-rule"></div></div>
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
                                <div className="gc rv rd2">
                                    <div className="sec-hd"><span className="sec-n">06 —</span><span className="sec-t">Analyst Ratings</span><div className="sec-rule"></div></div>
                                    <div className="ag">
                                        <div className="ac"><div className="ac-f">Goldman Sachs</div><div className="ac-r ar-b">Buy</div><div className="ac-tgt">Target: <b>$280</b></div><div className="ac-dt">3 days ago</div></div>
                                        <div className="ac"><div className="ac-f">Morgan Stanley</div><div className="ac-r ar-b">Overweight</div><div className="ac-tgt">Target: <b>$310</b></div><div className="ac-dt">1 week ago</div></div>
                                        <div className="ac"><div className="ac-f">JPMorgan</div><div className="ac-r ar-h">Neutral</div><div className="ac-tgt">Target: <b>$245</b></div><div className="ac-dt">5 days ago</div></div>
                                    </div>
                                </div>
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
