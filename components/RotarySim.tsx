
import React, { useState, useCallback, useRef, useEffect } from 'react';

const RotarySim: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [number, setNumber] = useState('');
  const [isDialing, setIsDialing] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Audio Context Ref
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
    osc.type = 'square'; // Mechanical clicky sound

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

    // DTMF-ish tones
    const freqs = [941, 697, 697, 697, 770, 770, 770, 852, 852, 852]; // 0-9 approx
    const baseFreq = freqs[digit] || 941;

    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc2.frequency.setValueAtTime(1336, ctx.currentTime); // Column freq approx

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

  const handleDial = (digit: number) => {
    if (isDialing) return;
    initAudio();
    setIsDialing(true);

    // Calculate rotation angle
    // Standard rotary: 1 is ~60deg from stop, 0 is ~270deg?
    // Let's assume holes are spaced by 30deg. 
    // Position 1 needs 30deg rotation to hit stop? No, let's map it logically.
    // If Stop is at 0deg (3 o'clock):
    // 1 is at -60deg (1 o'clock). 2 is at -90deg (12 o'clock).
    // The rotation needed is abs(position - stop).

    // Simplification: 
    // Digit 1: rotates 60deg
    // Digit 2: rotates 90deg
    // ...
    // Digit 0: rotates 330deg

    const rotationAmount = 60 + ((digit === 0 ? 10 : digit) - 1) * 30;

    setRotation(rotationAmount);

    // Clicking sound loop during forward rotation
    const clickInterval = setInterval(playClick, 100);

    // Recoil phase
    setTimeout(() => {
      clearInterval(clickInterval);
      setRotation(0); // Rotate back

      // Register number on return
      setTimeout(() => {
        setNumber(prev => (prev + digit.toString()).slice(-10));
        playTone(digit);
        setIsDialing(false);
      }, 700); // Wait for recoil animation

    }, 700); // Time to reach stop
  };

  const clear = () => {
    setNumber('');
    playClick();
  };

  // Generate numbers for the dial
  // We place them in a circle
  const renderDialNumbers = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => {
      const angle = -60 - (i * 30); // Start at 1 oclock (-60) and go counter-clockwise
      return (
        <div
          key={n}
          className="absolute w-12 h-12 flex items-center justify-center font-bold text-xl text-[#33FF00]"
          style={{
            transform: `rotate(${angle}deg) translate(110px) rotate(${-angle}deg)`, // Position on circle
            left: 'calc(50% - 24px)',
            top: 'calc(50% - 24px)',
          }}
        >
          {n}
        </div>
      );
    });
  };

  // Generate holes for the front face
  const renderHoles = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => {
      const angle = -60 - (i * 30);
      return (
        <div
          key={n}
          onClick={() => handleDial(n)}
          className="absolute w-14 h-14 rounded-full border-2 border-[#33FF00] bg-black/50 cursor-pointer hover:bg-[#33FF00]/20 active:bg-[#33FF00]/40 transition-colors"
          style={{
            transform: `rotate(${angle}deg) translate(110px) rotate(${-angle}deg)`,
            left: 'calc(50% - 28px)',
            top: 'calc(50% - 28px)',
            pointerEvents: isDialing ? 'none' : 'auto'
          }}
        >
        </div>
      );
    });
  };

  // Keyboard Interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent interaction if already dialing
      if (isDialing) return;

      if (/^[0-9]$/.test(e.key)) {
        handleDial(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        clear();
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialing, onBack]); // isDialing dependency ensures we don't queue spins

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 animate-in fade-in">
      <h2 className="text-3xl underline mb-8 tracking-widest">ROTARY_EMULATOR.EXE</h2>

      {/* Display */}
      <div className="bg-[#111] border-2 border-[#33FF00] px-6 py-4 mb-10 min-w-[300px] text-center shadow-[0_0_15px_rgba(51,255,0,0.2)]">
        <div className="font-mono text-4xl text-[#33FF00] tracking-[0.2em] h-12">
          {number || <span className="text-[#33FF00]/30 animate-pulse">NO_CARRIER</span>}
        </div>
      </div>

      {/* Rotary Phone UI */}
      <div className="relative w-[320px] h-[320px]">

        {/* Static Backplate (Numbers) */}
        <div className="absolute inset-0 rounded-full border-4 border-[#33FF00]/30 bg-[#050505]">
          {renderDialNumbers()}

          {/* Finger Stop */}
          <div className="absolute top-[50%] right-[10px] w-12 h-4 bg-[#33FF00] transform rotate-45 origin-left z-20 shadow-[0_0_10px_#33SS00]"></div>
        </div>

        {/* Rotator (The moving part) */}
        <div
          className="absolute inset-0 rounded-full border-4 border-[#33FF00] z-10 transition-transform duration-700 ease-in-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            pointerEvents: 'none' // Let clicks pass through to holes usually... wait holes are IN here
          }}
        >
          {/* Inner center cap */}
          <div className="absolute inset-0 m-auto w-32 h-32 rounded-full border-2 border-[#33FF00] bg-black flex items-center justify-center p-2 text-center">
            <span className="text-[10px] text-[#33FF00]/50 leading-tight">
              PROPERTY OF<br />LEGACY_OS<br />DO NOT REMOVE
            </span>
          </div>

          {/* The Container for Holes - needs pointer events */}
          <div style={{ pointerEvents: 'auto' }} className="w-full h-full relative">
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

      {/* Instructions */}
      <div className="mt-6 text-xs text-[#33FF00]/40 font-mono">
        CLICK NUMBER TO DIAL
      </div>
    </div>
  );
};

export default RotarySim;
