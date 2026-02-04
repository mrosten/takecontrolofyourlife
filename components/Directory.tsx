
import React, { useState, useEffect, useCallback } from 'react';
import { SERVICES } from '../constants.tsx';

interface DirectoryProps {
  onBack: () => void;
}

const Directory: React.FC<DirectoryProps> = ({ onBack }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const playBeep = useCallback((freq = 800, duration = 0.05) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (!selected) {
        if (key === '1') { playBeep(); setSelected('1'); }
        if (key === '2') { playBeep(); setSelected('2'); }
        if (key === '3') { playBeep(); setSelected('3'); }
        if (key === 'b') { playBeep(400, 0.1); onBack(); }

        if (e.key === 'ArrowDown') {
          playBeep(300, 0.02);
          setSelectedIndex((prev) => (prev + 1) % SERVICES.length);
        }
        if (e.key === 'ArrowUp') {
          playBeep(300, 0.02);
          setSelectedIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
        }
        if (e.key === 'Enter' || key === 'y') {
          playBeep(800, 0.05);
          setSelected(SERVICES[selectedIndex].id);
        }
      } else {
        if (key === 'b' || e.key === 'Escape') { 
          playBeep(400, 0.1); 
          setSelected(null); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, onBack, playBeep, selectedIndex]);

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <h2 className="text-3xl mb-6 flex items-center">
        <span className="bg-[#33FF00] text-black px-2 mr-4">DIR</span> / HARD_RESET_SERVICES
      </h2>

      {!selected ? (
        <div className="space-y-4">
          {SERVICES.map((s, idx) => (
            <button 
              key={s.id}
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => { playBeep(); setSelected(s.id); }}
              className={`block w-full text-left p-4 border transition-all group outline-none ${
                selectedIndex === idx 
                  ? 'bg-[#33FF00] text-black border-[#33FF00] font-bold' 
                  : 'border-[#33FF00]/30 hover:bg-[#33FF00]/10 text-[#33FF00]'
              }`}
            >
              <div className="text-xl font-bold flex justify-between">
                <span>{selectedIndex === idx ? '>> ' : '   '}[{idx + 1}] {s.name}</span>
                <span className={selectedIndex === idx ? 'translate-x-1' : ''}>-&gt;</span>
              </div>
              <p className={`text-sm mt-1 ${selectedIndex === idx ? 'text-black opacity-90' : 'opacity-70'}`}>
                {s.description}
              </p>
            </button>
          ))}
          <div className="mt-8 p-4 border-t border-[#33FF00]/20 flex justify-between items-center text-xl">
             <button 
              onClick={() => { playBeep(400, 0.1); onBack(); }}
              className="opacity-60 hover:opacity-100 underline outline-none focus:text-[#33FF00]"
            >
              [B] RETURN TO PARENT
            </button>
            <div className="flex flex-col items-end text-xs opacity-50">
              <span>NAVIGATE: [↑/↓]</span>
              <span>SELECT: [ENTER/Y] OR [1-3]</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 border-2 border-[#33FF00] bg-black shadow-[0_0_20px_rgba(51,255,0,0.1)]">
            <h3 className="text-2xl font-bold mb-4 underline">
              {SERVICES.find(s => s.id === selected)?.name}
            </h3>
            <div className="whitespace-pre-wrap text-lg leading-relaxed">
              {SERVICES.find(s => s.id === selected)?.content}
            </div>
          </div>
          <button 
            onClick={() => { playBeep(400, 0.1); setSelected(null); }}
            className="text-xl bg-[#33FF00] text-black px-4 py-1 hover:opacity-80 font-bold outline-none"
          >
            [B] BACK TO LIST
          </button>
        </div>
      )}
    </div>
  );
};

export default Directory;
