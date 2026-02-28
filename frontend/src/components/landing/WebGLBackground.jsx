import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color, Vector2, InstancedBufferAttribute } from 'three';
import * as THREE from 'three';

// ─── SHADER 1: NEURAL FLOW (LIQUID GRADIENT) ───
const NeuralFlow = () => {
    const mesh = useRef();
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor1: { value: new Color('#000000') },
            uColor2: { value: new Color('#002213') }, // Darker base green (slightly more visible)
            uColor3: { value: new Color('#008f4c') }, // Mid-tone green (visible but not neon)
            uMouse: { value: new Vector2(0, 0) },
        }),
        []
    );

    useFrame((state) => {
        const { clock, pointer } = state;
        mesh.current.material.uniforms.uTime.value = clock.getElapsedTime() * 0.2; // Slow but moving
        // Smooth mouse interpolation
        mesh.current.material.uniforms.uMouse.value.lerp(pointer, 0.05);
    });

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec2 uMouse;
        varying vec2 vUv;

        // Simplex noise function
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                    -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        // Random noise for grain
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec2 uv = vUv;
            
            // Mouse influence
            float dist = distance(uv, uMouse * 0.5 + 0.5);
            vec2 disturbedUv = uv + vec2(snoise(uv + uTime * 0.05), snoise(uv - uTime * 0.05)) * 0.1;
            
            // Lava Lamp Logic: Restoration of "Bulbs"
            // Use larger scale noise for the "bulbs" (Increased frequency to 3.0 for tighter packing)
            float n = snoise(disturbedUv * 3.0 + uTime * 0.1); 
            
            // Add complexity inside the bulbs
            n += 0.5 * snoise(disturbedUv * 5.0 - uTime * 0.1);

            // Interaction ripple (keep subtle)
            n += smoothstep(0.5, 0.0, dist) * 0.15 * sin(uTime * 1.5);

            // Colors: Restore visible flow but keeping it dark-ish
            // Mix base black/dark green with noise (Increased bias +0.4 to fill more gaps)
            vec3 color = mix(uColor1, uColor2, n + 0.4);
            
            // The "Bulb" Highlight: Smoothstep controls the sharpness of the bulb edge
            // Lowered threshold (0.2 to 0.6) makes the bulbs larger, reducing the "gap"
            color = mix(color, uColor3, smoothstep(0.2, 0.6, n));
            
            // Vignette for depth
            float vignette = smoothstep(1.5, 0.2, length(uv - 0.5));
            color *= vignette;

            // Grain (keep refined)
            float grain = random(uv * uTime) * 0.04; 
            color += grain;
            
            // Subtle Scanline
            float scanline = sin(uv.y * 600.0) * 0.015;
            color -= scanline;

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    return (
        <mesh ref={mesh} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};

// ─── SHADER 2: CYBER GRID (WIREFRAME TERRAIN) ───
const CyberGrid = () => {
    const mesh = useRef();

    useFrame(({ clock, pointer }) => {
        mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
        mesh.current.material.uniforms.uMouse.value.lerp(pointer, 0.05);
    });

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new Color('#00FF87') },
        uMouse: { value: new Vector2(0, 0) }
    }), []);

    const vertexShader = `
        uniform float uTime;
        uniform vec2 uMouse;
        varying float vElevation;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec3 pos = position;
            
            // Grid movement effect
            float move = mod(pos.y + uTime * 0.5, 10.0);
            
            // Terrain waves
            float elevation = sin(pos.x * 2.0 + uTime) * 0.2;
            elevation += cos(pos.y * 2.0 + uTime * 0.5) * 0.2;
            
            // Mouse interaction (bulge)
            float dist = distance(uv, uMouse * 0.5 + 0.5);
            elevation += smoothstep(0.5, 0.0, dist) * 0.5;

            pos.z += elevation;
            vElevation = elevation;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 uColor;
        varying float vElevation;
        varying vec2 vUv;

        void main() {
            // Grid pattern
            float grid = step(0.98, fract(vUv.x * 40.0)) + step(0.98, fract(vUv.y * 40.0));
            
            vec3 color = uColor * grid;
            
            // Depth fade
            float alpha = smoothstep(0.0, 0.5, vElevation + 0.2);
            
            // Distance fade (fog)
            float fog = smoothstep(1.0, 0.0, length(vUv - 0.5));
            
            gl_FragColor = vec4(color, alpha * fog * 0.5); // Low opacity for background
        }
    `;

    return (
        <mesh ref={mesh} rotation={[-Math.PI / 3, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[15, 15, 64, 64]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                wireframe={false} // Drawing grid manually in shader for control
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// ─── SHADER 3: ORBITAL NEXUS (PARTICLES) ───
const OrbitalNexus = () => {
    const mesh = useRef();
    const count = 300;
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Random positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 10;
            temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0 });
        }
        return temp;
    }, []);

    useFrame((state) => {
        const { pointer } = state;
        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle;
            // Update time
            t = particle.t += speed / 2;

            // Circular motion
            const s = Math.cos(t);

            dummy.position.set(
                x + Math.cos(t / 10) * factor + (Math.sin(t * 1) * factor) / 10,
                y + Math.sin(t / 10) * factor + (Math.cos(t * 2) * factor) / 10,
                z + Math.cos(t / 10) * factor + (Math.sin(t * 3) * factor) / 10
            );

            // Mouse interaction
            dummy.position.x += (pointer.x * 5 - dummy.position.x) * 0.02;
            dummy.position.y += (-pointer.y * 5 - dummy.position.y) * 0.02;

            const scale = Math.max(0.5, Math.cos(t) * 2);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[0.03, 32, 32]} />
            <meshBasicMaterial color="#00FF87" transparent opacity={0.6} />
        </instancedMesh>
    );
};


// ─── MAIN COMPONENT ───
const WebGLBackground = () => {
    const [mode, setMode] = useState(0); // 0: Neural, 1: Grid, 2: Orbital

    // Keyboard shortcut to switch modes (hidden feature)
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'b' || e.key === 'B') {
                setMode((prev) => (prev + 1) % 3);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none', // Allow clicks to pass through usually
            background: '#040b08' // Fallback color
        }}>
            {/* Visual Indicator for Mode (Temporary/Debug) */}
            <div style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                color: 'rgba(0, 255, 135, 0.4)',
                fontFamily: 'monospace',
                fontSize: '10px',
                pointerEvents: 'auto',
                cursor: 'pointer',
                zIndex: 1000
            }} onClick={() => setMode((prev) => (prev + 1) % 3)}>
                BG MODE: {mode === 0 ? 'NEURAL' : mode === 1 ? 'GRID' : 'ORBITAL'} (CLICK TO SWITCH)
            </div>

            <Canvas camera={{ position: [0, 0, 1] }}>
                {mode === 0 && <NeuralFlow />}
                {mode === 1 && <CyberGrid />}
                {mode === 2 && <OrbitalNexus />}
            </Canvas>
        </div>
    );
};

export default WebGLBackground;
