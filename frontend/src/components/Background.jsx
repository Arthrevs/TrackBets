import React, { useState, useEffect, useRef } from 'react';

const Background = ({ enableReactive = false }) => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!enableReactive) return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableReactive]);

  // Generate dots for full screen coverage
  const cols = 35;
  const rows = 20;
  const dots = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dots.push({
        id: `${row}-${col}`,
        x: (col / (cols - 1)) * 100,
        y: (row / (rows - 1)) * 100,
      });
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ background: '#000' }}
    >
      {/* Full screen dot grid */}
      {dots.map((dot) => {
        // Calculate pixel position for distance check
        const dotPx = {
          x: (dot.x / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1000),
          y: (dot.y / 100) * (typeof window !== 'undefined' ? window.innerHeight : 800),
        };
        const dx = mousePos.x - dotPx.x;
        const dy = mousePos.y - dotPx.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;
        const intensity = enableReactive ? Math.max(0, 1 - distance / maxDist) : 0;
        const baseOpacity = 0.2;
        const opacity = baseOpacity + intensity * 0.8;
        const scale = 1 + intensity * 0.8;

        return (
          <div
            key={dot.id}
            className="absolute"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
            }}
          >
            {/* Digital artsy dot - Material You style */}
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: `rgba(90, 197, 59, ${opacity})`,
                boxShadow: intensity > 0.3
                  ? `0 0 ${intensity * 20}px rgba(90, 197, 59, ${intensity * 0.6})`
                  : 'none',
              }}
            />
          </div>
        );
      })}

      {/* Mask to dim dots behind content area */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 500px 400px at 50% 45%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
        }}
      />
    </div>
  );
};

export default Background;
