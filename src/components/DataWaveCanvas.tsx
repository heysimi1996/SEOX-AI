import React, { useRef, useEffect } from 'react';

export const DataWaveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1200);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes
    interface Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      alpha: number;
      waveOffset: number;
    }

    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.4 + Math.random() * 0.8,
      size: 1 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.7,
      waveOffset: Math.random() * Math.PI * 2,
    }));

    let step = 0;

    const render = () => {
      step += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw flowing wave lines
      const waveConfigs = [
        { amplitude: 38, wavelength: 0.0035, speed: 1.0, color: 'rgba(255, 94, 0, 0.45)', lineWidth: 1.5, yShift: 170 },
        { amplitude: 48, wavelength: 0.0028, speed: 0.7, color: 'rgba(255, 122, 26, 0.3)', lineWidth: 1.2, yShift: 190 },
        { amplitude: 30, wavelength: 0.0042, speed: 1.3, color: 'rgba(255, 60, 0, 0.25)', lineWidth: 1, yShift: 150 },
        { amplitude: 60, wavelength: 0.0020, speed: 0.5, color: 'rgba(255, 140, 50, 0.15)', lineWidth: 1, yShift: 210 },
      ];

      waveConfigs.forEach((wave) => {
        ctx.beginPath();
        ctx.lineWidth = wave.lineWidth;
        ctx.strokeStyle = wave.color;

        for (let x = 0; x < width; x += 3) {
          const y =
            wave.yShift +
            Math.sin(x * wave.wavelength + step * wave.speed) * wave.amplitude +
            Math.cos(x * 0.001 + step * 0.3) * 15;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Draw floating data particles
      particles.forEach((p) => {
        p.x += p.speed;
        if (p.x > width) p.x = 0;

        const baseWaveY = 175 + Math.sin(p.x * 0.003 + step + p.waveOffset) * 45;
        const currentY = (p.y * 0.2 + baseWaveY * 0.8);

        ctx.beginPath();
        ctx.arc(p.x, currentY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 138, 61, ${p.alpha})`;
        ctx.shadowColor = '#FF5E00';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle edge fade overlays */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080808] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080808] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
    </div>
  );
};
