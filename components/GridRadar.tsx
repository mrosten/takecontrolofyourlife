
import React, { useEffect, useRef } from 'react';

const GridRadar: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) - 20;

      // Draw circle
      ctx.strokeStyle = '#33FF00';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw scanner line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();

      // Random blips
      if (Math.random() > 0.95) {
        const bx = cx + (Math.random() - 0.5) * radius * 1.5;
        const by = cy + (Math.random() - 0.5) * radius * 1.5;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(bx, by, 4, 4);
        ctx.fillStyle = '#33FF00';
        ctx.fillText("DOPAMINE_SPIKE", bx + 6, by + 6);
      }

      angle += 0.05;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 animate-in zoom-in">
      <h2 className="text-3xl"><span className="bg-red-600 text-white px-2 mr-2">WARN</span> GRID_INTERFERENCE_RADAR</h2>
      <canvas ref={canvasRef} width={400} height={400} className="border-2 border-[#33FF00]/50 shadow-[0_0_30px_rgba(51,255,0,0.2)]" />
      <div className="font-mono text-sm space-y-1">
        <p className="text-red-500 animate-pulse">&gt; SCANNING FOR SMARTPHONE_SIGNALS...</p>
        <p>&gt; DETECTED: 12 NEARBY ATTENTION_TRAPS</p>
        <p>&gt; STATUS: ATMOSPHERE_COMPROMISED</p>
      </div>
      <button onClick={onBack} className="underline opacity-60 hover:opacity-100">[B] DISABLE SCANNER</button>
    </div>
  );
};

export default GridRadar;
