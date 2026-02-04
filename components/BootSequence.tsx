
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BOOT_SEQUENCE } from '../constants.tsx';

interface BootSequenceProps {
  onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [initStarted, setInitStarted] = useState(false);
  const skipRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const playBeep = useCallback((freq = 440, duration = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked.");
    }
  }, []);

  // Auto-scroll to bottom of boot log
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  // Handle the scrolling animation
  useEffect(() => {
    if (skipRef.current) return;

    if (index < BOOT_SEQUENCE.length) {
      // Dynamic delay: longer pause after philosophical lines
      const line = BOOT_SEQUENCE[index];
      const delay = line === "" ? 400 : (line.includes("---") ? 600 : Math.random() * 150 + 50);
      
      const timeout = setTimeout(() => {
        setVisibleLines(prev => [...prev, BOOT_SEQUENCE[index]]);
        setIndex(prev => prev + 1);
        // Soft click for each line
        if (BOOT_SEQUENCE[index].trim()) playBeep(200, 0.01);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      setInitStarted(true);
    }
  }, [index, playBeep]);

  // Handle key inputs (Y or Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'y' || e.key === 'Enter') {
        if (!initStarted && !skipRef.current) {
          // Skip animation
          skipRef.current = true;
          setVisibleLines(BOOT_SEQUENCE);
          setInitStarted(true);
          playBeep(400, 0.05);
        } else if (initStarted) {
          // Proceed to next screen
          playBeep(600, 0.1);
          onComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initStarted, onComplete, playBeep]);

  return (
    <div ref={containerRef} className="font-mono text-lg md:text-xl leading-relaxed select-none h-full overflow-y-auto custom-scrollbar">
      {visibleLines.map((line, i) => (
        <div key={i} className={`
          ${line.includes("CRITICAL") || line.includes("RECKONING") ? "text-red-500 font-bold" : ""}
          ${line.includes("PHASE") ? "text-white underline mb-1" : ""}
          ${line.includes("RECLAIM") || line.includes("SOVEREIGNTY") ? "text-[#33FF00] brightness-125" : ""}
        `}>
          {line || <br />}
        </div>
      ))}
      
      {initStarted && (
        <div className="mt-8 border-t-2 border-[#33FF00] pt-6 animate-in fade-in zoom-in duration-700 pb-12">
          <div className="text-2xl mb-4 italic">"The future is offline. Reclaim your focus."</div>
          <button 
            onClick={() => { playBeep(600, 0.1); onComplete(); }}
            className="border-4 border-[#33FF00] px-8 py-3 bg-[#33FF00] text-black font-black text-2xl animate-pulse hover:bg-black hover:text-[#33FF00] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(51,255,0,0.5)]"
          >
            > TAKE THE RED PILL [Y]
          </button>
          <p className="mt-6 text-sm opacity-60 tracking-widest">
            SESSION_ESTABLISHED: COGNITIVE_PURGE_READY_0.4.2
          </p>
        </div>
      )}
      
      {!initStarted && (
        <div className="mt-4 opacity-40 text-sm animate-pulse sticky bottom-0 bg-black py-2">
          [ READING SYSTEM MANIFESTO... PRESS Y TO SKIP ]
        </div>
      )}
    </div>
  );
};

export default BootSequence;
