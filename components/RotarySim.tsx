
import React, { useState, useCallback } from 'react';

const RotarySim: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [number, setNumber] = useState('');

  const playSound = useCallback((freq: number, dur = 0.5) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(freq * 1.5, audioCtx.currentTime); // Simple dual-tone approximation
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + dur);
      osc2.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  }, []);

  const dial = (n: number) => {
    setNumber(prev => (prev + n).slice(-10));
    playSound(400 + (n * 50));
  };

  const clear = () => { setNumber(''); playSound(200, 0.2); };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top">
      <h2 className="text-3xl underline">ROTARY_EMULATOR.EXE</h2>
      
      <div className="font-mono text-4xl bg-[#33FF00] text-black px-4 py-2 min-w-[300px] text-center">
        {number || 'READY...'}
      </div>

      <div className="relative w-64 h-64 border-4 border-[#33FF00] rounded-full flex items-center justify-center">
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8,9,0].map(n => (
            <button 
              key={n}
              onClick={() => dial(n)}
              className="w-12 h-12 border-2 border-[#33FF00] rounded-full hover:bg-[#33FF00] hover:text-black font-bold flex items-center justify-center transition-all"
            >
              {n}
            </button>
          ))}
          <button onClick={clear} className="text-xs border border-[#33FF00] hover:bg-red-500 rounded p-1">CLR</button>
        </div>
      </div>

      <div className="text-xs opacity-50 max-w-xs text-center">
        NOTE: THIS IS A LANDLINE SIMULATOR. THE CORD IS IMAGINARY BUT THE INTENTION IS REAL.
      </div>

      <button onClick={onBack} className="underline opacity-60">[B] HANG UP</button>
    </div>
  );
};

export default RotarySim;
