import React, { useEffect, useRef, useState } from 'react';

const AssetInputPage = ({ onComplete, onBack }) => {
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    // WebGL Initialization
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { antialias: false, depth: false });
        if (!gl) return;

        let animationFrameId;

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
              float l0=1.-smoothstep(0.,.72,length(wq-vec2(.18*ar,.50)));
              float l1=1.-smoothstep(0.,.55,length(wq-vec2(.80*ar,.22)));
              float l2=1.-smoothstep(0.,.48,length(wq-vec2(.60*ar,.78)));
              float l3=1.-smoothstep(0.,.42,length(wq-vec2(.92*ar,.52)));
              vec3 c=vec3(.008,.010,.026);
              c+=l0*vec3(.20,.13,.01)*1.05;
              c+=l1*vec3(.17,.10,.02)*.78;
              c+=l2*vec3(.01,.20,.09)*.62;
              c+=l3*vec3(.02,.08,.24)*.55;
              float tx=fbm(wq*2.6+t*.011);
              c+=tx*vec3(.06,.04,.01)*.28;
              float vig=uv.x*uv.y*(1.-uv.x)*(1.-uv.y);
              vig=pow(vig*18.,.36);c*=vig;
              c=clamp(c,0.,1.);
              gl_FragColor=vec4(c,1.);
            }
        `;

        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const program = gl.createProgram();
        const vs = createShader(gl.VERTEX_SHADER, VS);
        const fs = createShader(gl.FRAGMENT_SHADER, FS);
        if (!vs || !fs) return;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const aLoc = gl.getAttribLocation(program, 'a');
        gl.enableVertexAttribArray(aLoc);
        gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(program, 't');
        const uRes = gl.getUniformLocation(program, 'res');

        const startTime = performance.now();
        const loop = (time) => {
            gl.uniform1f(uTime, (time - startTime) * 0.001);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrameId = requestAnimationFrame(loop);
        };
        loop(startTime);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
        };
    }, []);

    // Cursor Logic
    useEffect(() => {
        const cursor = cursorRef.current;
        const dot = cursorDotRef.current;
        if (!cursor || !dot) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        };

        const onMouseDown = () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.6)';
        };

        const onMouseUp = () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);

        let rafId;
        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            rafId = requestAnimationFrame(animateCursor);
        };
        animateCursor();

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            cancelAnimationFrame(rafId);
        };
    }, []);

    const handleInputMouseEnter = () => {
        if (cursorRef.current) cursorRef.current.classList.add('beam');
    };

    const handleInputMouseLeave = () => {
        if (cursorRef.current) cursorRef.current.classList.remove('beam');
    };

    const handleHoverStart = () => {
        if (cursorRef.current) cursorRef.current.classList.add('big');
    };

    const handleHoverEnd = () => {
        if (cursorRef.current) cursorRef.current.classList.remove('big');
    };

    const handleSubmit = () => {
        const value = inputValue.trim();
        if (!value) {
            if (inputRef.current) {
                inputRef.current.style.animation = 'shake .38s ease';
                setTimeout(() => {
                    if (inputRef.current) inputRef.current.style.animation = '';
                }, 400);
            }
            return;
        }
        onComplete(value.toUpperCase());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    const suggestions = ['TSLA', 'NVDA', 'AAPL', 'RELIANCE', 'ZOMATO', 'MSFT', 'META'];

    return (
        <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: '#EDE6DA',
            cursor: 'none',
            overflow: 'hidden',
            height: '100vh',
            width: '100vw',
            position: 'relative'
        }}>
            {/* Inject Styles for this specific page */}
            <style>{`
                :root {
                    --cream: #EDE6DA;
                    --c6: rgba(237,230,218,.6);
                    --c4: rgba(237,230,218,.4);
                    --c2: rgba(237,230,218,.2);
                    --c1: rgba(237,230,218,.1);
                    --gold: #C9A84C;
                    --go: rgba(201,168,76,.22);
                }
                
                #gl { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; }
                
                #cr {
                    position: fixed; z-index: 9999; pointer-events: none;
                    width: 22px; height: 22px; border: 1px solid rgba(201,168,76,.5); border-radius: 50%;
                    transform: translate(-50%, -50%); transition: width .18s, height .18s, border-radius .18s;
                    mix-blend-mode: difference;
                }
                #cd {
                    position: fixed; z-index: 9999; pointer-events: none; width: 3px; height: 3px;
                    background: var(--gold); border-radius: 50%; transform: translate(-50%, -50%);
                }
                #cr.big { width: 44px; height: 44px; border-radius: 50%; opacity: .25; }
                #cr.beam { width: 2px; height: 30px; border-radius: 1px; opacity: .85; }
                
                .brand {
                    position: fixed; top: 38px; left: 48px; z-index: 100;
                    display: flex; align-items: center; gap: 10px; cursor: none;
                    animation: fadeUp .7s cubic-bezier(.4,0,.2,1) both;
                }
                .bsq {
                    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .bname { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--cream); }
                .bname b { color: var(--gold); }
                
                .back-btn {
                    display: flex; align-items: center; gap: 6px; padding: 5px 14px; margin-left: 12px;
                    background: rgba(255,255,255,.035); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
                    border: 1px solid rgba(237,230,218,.08); border-radius: 5px; cursor: none;
                    font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600;
                    color: var(--c4); letter-spacing: .8px; text-transform: uppercase; transition: all .2s;
                }
                .back-btn:hover { border-color: rgba(201,168,76,.22); color: var(--gold); background: rgba(201,168,76,.08); }
                
                .stage {
                    position: fixed; inset: 0; z-index: 10;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 0 32px;
                }
                
                .question {
                    font-family: 'Cormorant Garamond', serif; font-style: italic;
                    font-size: 26px; font-weight: 400; color: var(--c4);
                    text-align: center; margin-bottom: 36px; letter-spacing: .05px;
                    animation: fadeUp .8s cubic-bezier(.4,0,.2,1) .15s both;
                }
                
                .input-wrap {
                    width: 100%; max-width: 520px;
                    animation: fadeUp .8s cubic-bezier(.4,0,.2,1) .25s both;
                }
                .input-row {
                    display: flex; align-items: center; gap: 0;
                    border-bottom: 1.5px solid var(--c2);
                    transition: border-color .3s;
                    position: relative;
                }
                .input-row::after {
                    content: ''; position: absolute; bottom: -1.5px; left: 0; width: 0; height: 1.5px;
                    background: var(--gold);
                    transition: width .45s cubic-bezier(.4,0,.2,1);
                }
                .input-row:focus-within { border-color: transparent; }
                .input-row:focus-within::after { width: 100%; }
                
                .inp {
                    flex: 1; padding: 18px 0;
                    background: transparent; border: none; outline: none; cursor: none;
                    font-family: 'Playfair Display', serif;
                    font-size: 48px; font-weight: 700;
                    color: var(--cream); letter-spacing: -1.5px; line-height: 1;
                    caret-color: var(--gold);
                    transform: skewX(-10deg);
                    min-width: 0;
                }
                .inp::placeholder { color: var(--c2); }
                
                .arrow-btn {
                    display: flex; align-items: center; justify-content: center;
                    width: 48px; height: 48px; flex-shrink: 0; cursor: none;
                    background: none; border: none;
                    color: var(--c2); transition: color .22s, transform .22s;
                }
                .arrow-btn:hover { color: var(--gold); transform: translateX(3px); }
                .arrow-btn svg { width: 22px; height: 22px; stroke: currentColor; stroke-width: 1.5; fill: none; }
                
                .hint {
                    font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--c2);
                    margin-top: 14px; letter-spacing: .3px;
                    animation: fadeUp .8s cubic-bezier(.4,0,.2,1) .32s both;
                }
                
                .sugg {
                    display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
                    margin-top: 48px;
                    animation: fadeUp .8s cubic-bezier(.4,0,.2,1) .42s both;
                }
                .sugg-chip {
                    padding: 10px 18px; border-radius: 100px; cursor: none;
                    border: 1px solid var(--c1); background: none;
                    font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500;
                    color: var(--c4); letter-spacing: .3px;
                    transition: all .2s cubic-bezier(.4,0,.2,1);
                }
                .sugg-chip:hover { border-color: var(--go); color: var(--cream); background: rgba(201,168,76,.06); transform: translateY(-2px); }
                
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
                @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
            `}</style>

            <canvas id="gl" ref={canvasRef}></canvas>

            <div id="cr" ref={cursorRef}></div>
            <div id="cd" ref={cursorDotRef}></div>

            <div className="brand" onMouseEnter={handleHoverStart} onMouseLeave={handleHoverEnd}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/assets/trackbets-logo.jpg" alt="TrackBets Logo" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
                    <span className="bname">Track<b>Bets</b></span>
                </div>
                {onBack && (
                    <button className="back-btn" onClick={onBack}>← Back</button>
                )}
            </div>

            <div className="stage">
                <p className="question">Which stock do you want to analyse?</p>

                <div className="input-wrap">
                    <div className="input-row">
                        <input
                            ref={inputRef}
                            className="inp"
                            type="text"
                            placeholder="TSLA"
                            autoComplete="off"
                            spellCheck="false"
                            maxLength="50"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onMouseEnter={handleInputMouseEnter}
                            onMouseLeave={handleInputMouseLeave}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="arrow-btn"
                            onClick={handleSubmit}
                            onMouseEnter={handleHoverStart}
                            onMouseLeave={handleHoverEnd}
                        >
                            <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>
                    <div className="hint">Enter ticker symbol or company name</div>
                </div>

                <div className="sugg">
                    {suggestions.map((sym) => (
                        <button
                            key={sym}
                            className="sugg-chip"
                            onClick={() => {
                                setInputValue(sym);
                                if (inputRef.current) inputRef.current.focus();
                            }}
                            onMouseEnter={handleHoverStart}
                            onMouseLeave={handleHoverEnd}
                        >
                            {sym}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssetInputPage;
