import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldCheck, Zap, Database, Globe, Cpu } from 'lucide-react';

export const Seo3dSphere: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / 25;
      const y = (e.clientY - (rect.top + rect.height / 2)) / 25;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center select-none"
      style={{
        perspective: '1200px',
      }}
    >
      {/* Background radial ambience glow */}
      <div className="absolute inset-0 bg-radial from-[#FF5E00]/20 via-[#FF4500]/5 to-transparent blur-3xl pointer-events-none transform -translate-y-4" />

      {/* Parallax wrapper responding smoothly to mouse */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${-mousePos.y * 0.7}deg) rotateY(${mousePos.x * 0.7}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Outer Orbital Ring 1 - Deep Angle */}
        <div
          className="absolute w-[92%] h-[92%] rounded-full border border-dashed border-[#FF5E00]/25 animate-spin-slow pointer-events-none"
          style={{
            transform: 'rotateX(68deg) rotateY(18deg)',
          }}
        >
          {/* Orbital traveling node 1 */}
          <div className="absolute -top-1.5 left-1/3 w-3 h-3 rounded-full bg-[#FF5E00] shadow-[0_0_12px_#FF5E00]" />
          <div className="absolute -bottom-1.5 right-1/4 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
        </div>

        {/* Outer Orbital Ring 2 - Opposite Angle */}
        <div
          className="absolute w-[82%] h-[82%] rounded-full border border-white/10 animate-reverse-spin pointer-events-none"
          style={{
            transform: 'rotateX(55deg) rotateY(-32deg)',
          }}
        >
          {/* Orbital traveling node 2 */}
          <div className="absolute top-1/4 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF8A3D] shadow-[0_0_10px_#FF8A3D]" />
        </div>

        {/* Orbital Ring 3 - Horizontal scan line */}
        <div
          className="absolute w-[74%] h-[74%] rounded-full border border-[#FF5E00]/30 animate-spin-slow pointer-events-none"
          style={{
            transform: 'rotateX(75deg)',
          }}
        />

        {/* Core 3D Glowing Sphere Layer */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Outer corona aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF3D00] via-[#FF5E00] to-[#FFA726] opacity-30 blur-2xl animate-pulse-subtle" />

          {/* Spherical gradient base */}
          <div
            className="relative w-full h-full rounded-full shadow-[inset_-25px_-25px_50px_rgba(0,0,0,0.9),inset_10px_10px_30px_rgba(255,200,150,0.6),0_0_60px_rgba(255,94,0,0.4)] overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #FF8A3D 0%, #FF5E00 35%, #9E2600 70%, #0A0A0A 100%)',
            }}
          >
            {/* Latitude and Longitude wireframe grid over sphere */}
            <svg
              className="absolute inset-0 w-full h-full opacity-35 animate-spin-slow"
              viewBox="0 0 200 200"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.75"
            >
              <circle cx="100" cy="100" r="99" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <ellipse cx="100" cy="100" rx="98" ry="40" strokeDasharray="3 3" />
              <ellipse cx="100" cy="100" rx="98" ry="70" />
              <ellipse cx="100" cy="100" rx="40" ry="98" strokeDasharray="4 2" />
              <ellipse cx="100" cy="100" rx="70" ry="98" />
              <line x1="0" y1="100" x2="200" y2="100" strokeDasharray="2 2" />
              <line x1="100" y1="0" x2="100" y2="200" strokeDasharray="2 2" />
            </svg>

            {/* Specular highlight */}
            <div className="absolute top-4 left-6 w-16 h-10 rounded-full bg-white/30 blur-md transform -rotate-30 pointer-events-none" />

            {/* Central node pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-inner">
                <Cpu className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Glass HUD Panels / SEO Nodes */}

        {/* Panel 1: Top Right - Live Crawl Status */}
        <div
          className="absolute -top-4 right-0 sm:right-4 z-20 px-3.5 py-2 rounded-xl bg-[#121212]/85 backdrop-blur-md border border-white/[0.12] shadow-xl shadow-black/60 flex items-center gap-2.5 transform transition-transform duration-200 hover:scale-105"
          style={{ transform: 'translateZ(60px)' }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Crawl Engine</div>
            <div className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
              <span>1,284 URLs</span>
              <span className="text-emerald-400 text-[10px] font-sans">· 200 OK</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Bottom Left - Core Web Vitals */}
        <div
          className="absolute -bottom-6 left-0 sm:left-4 z-20 px-3.5 py-2.5 rounded-xl bg-[#121212]/85 backdrop-blur-md border border-[#FF5E00]/30 shadow-xl shadow-black/60 flex items-center gap-3 transform transition-transform duration-200 hover:scale-105"
          style={{ transform: 'translateZ(80px)' }}
        >
          <div className="w-7 h-7 rounded-lg bg-[#FF5E00]/15 border border-[#FF5E00]/30 flex items-center justify-center text-[#FF5E00]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Core Web Vitals</div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <span>LCP 1.1s</span>
              <span className="text-neutral-500 font-normal">/</span>
              <span className="text-[#FF8A3D] font-mono text-[11px]">INP 42ms</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Middle Right - AI Discoverability Index */}
        <div
          className="absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 z-20 px-3 py-2 rounded-xl bg-[#141414]/90 backdrop-blur-md border border-white/[0.1] shadow-lg shadow-black/50 flex items-center gap-2 hidden xs:flex"
          style={{ transform: 'translateZ(40px)' }}
        >
          <div className="w-2 h-2 rounded-full bg-[#FF5E00]" />
          <span className="text-xs text-neutral-300 font-medium">AI Entity Ready</span>
          <span className="text-xs font-mono font-semibold text-white ml-1">94%</span>
        </div>

        {/* Panel 4: Top Left - Schema Status */}
        <div
          className="absolute top-8 left-2 sm:-left-2 z-20 px-3 py-1.5 rounded-xl bg-[#101010]/80 backdrop-blur-md border border-white/[0.08] shadow-md flex items-center gap-2"
          style={{ transform: 'translateZ(30px)' }}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-mono text-neutral-300">Schema Validated</span>
        </div>
      </div>
    </div>
  );
};
