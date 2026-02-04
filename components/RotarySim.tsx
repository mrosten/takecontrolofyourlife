
import React, { useState, useCallback, useRef, useEffect } from 'react';

const RotarySim: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [number, setNumber] = useState('');
  const [rotation, setRotation] = useState(0);
  const [dragState, setDragState] = useState<{
    active: boolean;
    digit: number | null;
    startAngle: number;
    maxRotation: number;
  }>({ active: false, digit: null, startAngle: 0, maxRotation: 0 });

  const dialRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playClick = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  const playTone = useCallback((digit: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const freqs = [941, 697, 697, 697, 770, 770, 770, 852, 852, 852];
    osc1.frequency.setValueAtTime(freqs[digit] || 941, ctx.currentTime);
    osc2.frequency.setValueAtTime(1336, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.3);
  }, []);

  // Calculate angle of pointer relative to center
  const getPointerAngle = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const rad = Math.atan2(clientY - center.y, clientX - center.x);
    let deg = rad * (180 / Math.PI);
    // Normalize to 0-360 starting from 3 o'clock (0deg) clockwise
    if (deg < 0) deg += 360;
    return deg;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, digit: number) => {
    initAudio();
    const currentAngle = getPointerAngle(e);
    // Calculate max rotation for this digit
    // Stop is at ~45deg (4 o'clockish). 
    // Digit 1 starts at -60deg (300deg). Distance to stop is ~60 + 45?
    // Let's use the visual logic: 
    // digit 1 rotates ~60deg to hit stop.
    // digit 0 rotates ~330deg.
    const maxRot = 60 + ((digit === 0 ? 10 : digit) - 1) * 30;

    setDragState({
      active: true,
      digit,
      startAngle: currentAngle,
      maxRotation: maxRot
    });
  };

  const clear = () => { setNumber(''); playClick(); };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragState.active) return;
      e.preventDefault(); // Prevent scrolling on touch

      let angle = getPointerAngle(e);
      let diff = angle - dragState.startAngle;

      // Handle crossing the 0/360 boundary
      if (diff < -180) diff += 360;
      if (diff > 180) diff -= 360;

      // Only allow positive rotation (clockwise)
      if (diff < 0) diff = 0;

      // Clamp to max rotation
      if (diff > dragState.maxRotation) diff = dragState.maxRotation;

      setRotation(diff);
    };

    const handleUp = () => {
      if (!dragState.active) return;

      // Check if rotated enough (within 10% of target)
      if (rotation > dragState.maxRotation * 0.9) {
        if (dragState.digit !== null) {
          setNumber(prev => (prev + dragState.digit!.toString()).slice(-10));
          playTone(dragState.digit);
        }
      }

      setDragState(prev => ({ ...prev, active: false, digit: null }));
      setRotation(0); // Recoil
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragState, rotation, playTone, playClick]);

  // Render helpers
  const renderDialNumbers = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => {
      const angle = -60 - (i * 30);
      return (
        <div
          key={n}
          className="absolute w-12 h-12 flex items-center justify-center font-bold text-xl text-[#33FF00]"
          style={{
            transform: `rotate(${angle}deg) translate(110px) rotate(${-angle}deg)`,
            left: 'calc(50% - 24px)', top: 'calc(50% - 24px)',
          }}
        >
          {n}
        </div>
      );
    });
  };

  const renderHoles = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => {
      const angle = -60 - (i * 30);
      return (
        <div
          key={n}
          onMouseDown={(e) => handleMouseDown(e, n)}
          onTouchStart={(e) => handleMouseDown(e, n)}
          className="absolute w-14 h-14 rounded-full border-2 border-[#33FF00] bg-black/50 cursor-pointer hover:bg-[#33FF00]/20 active:bg-[#33FF00]/40 transition-colors"
          style={{
            transform: `rotate(${angle}deg) translate(110px) rotate(${-angle}deg)`,
            left: 'calc(50% - 28px)', top: 'calc(50% - 28px)',
            cursor: dragState.active ? 'grabbing' : 'grab'
          }}
        >
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 animate-in fade-in select-none">
      <h2 className="text-3xl underline mb-8 tracking-widest">ROTARY_EMULATOR.EXE</h2>

      <div className="bg-[#111] border-2 border-[#33FF00] px-6 py-4 mb-10 min-w-[300px] text-center shadow-[0_0_15px_rgba(51,255,0,0.2)]">
        <div className="font-mono text-4xl text-[#33FF00] tracking-[0.2em] h-12">
          {number || <span className="text-[#33FF00]/30 animate-pulse">NO_CARRIER</span>}
        </div>
      </div>

      <div className="relative w-[320px] h-[320px]" ref={dialRef}>
        {/* Static Backplate */}
        <div className="absolute inset-0 rounded-full border-4 border-[#33FF00]/30 bg-[#050505]">
          {renderDialNumbers()}
          <div className="absolute top-[50%] right-[10px] w-12 h-4 bg-[#33FF00] transform rotate-45 origin-left z-20 shadow-[0_0_10px_#33SS00]"></div>
        </div>

        {/* Rotating Dial */}
        <div
          className="absolute inset-0 rounded-full border-4 border-[#33FF00] z-10 ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: dragState.active ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          <div className="absolute inset-0 m-auto w-32 h-32 rounded-full border-2 border-[#33FF00] bg-black flex items-center justify-center p-2 text-center pointer-events-none">
            <span className="text-[10px] text-[#33FF00]/50 leading-tight">
              PROPERTY OF<br />LEGACY_OS<br />DO NOT REMOVE
            </span>
          </div>

          <div className="w-full h-full relative">
            {renderHoles()}
          </div>
        </div>
      </div>

      <div className="mt-12 flex space-x-8">
        <button onClick={clear} className="px-4 py-2 border border-[#33FF00] hover:bg-[#33FF00] hover:text-black transition-colors text-sm uppercase tracking-wider">
          Clear Line
        </button>
        <button onClick={onBack} className="px-4 py-2 border border-[#33FF00] hover:bg-[#33FF00] hover:text-black transition-colors text-sm uppercase tracking-wider">
          Disconnect
        </button>
      </div>

      <div className="mt-6 text-xs text-[#33FF00]/40 font-mono">
        DRAG TO DIAL
      </div>
    </div>
  );
};

export default RotarySim;
