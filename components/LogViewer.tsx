
import React, { useEffect, useCallback } from 'react';
import { SYSTEM_LOGS } from '../constants.tsx';

interface LogViewerProps {
  onBack: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ onBack }) => {
  const playBeep = useCallback((freq = 400, duration = 0.1) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b' || e.key === 'Escape') {
        playBeep();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, playBeep]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CRITICAL': return 'text-red-500';
      case 'WARNING': return 'text-orange-500';
      case 'COMPROMISED': return 'text-red-600 font-bold';
      case 'OK': return 'text-[#33FF00]';
      default: return '';
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom duration-300">
      <h2 className="text-3xl mb-6">
        <span className="bg-[#33FF00] text-black px-2 mr-4">FILE</span> MODERN_LIFE.LOG
      </h2>

      <div className="bg-[#111] p-6 font-mono text-lg border border-[#33FF00]/20 min-h-[400px]">
        <div className="border-b border-[#33FF00]/20 pb-4 mb-4 opacity-50">
          ERROR LOG: DETECTED_ANOMALIES_IN_HUMAN_COGNITION
          <br />-------------------------------------------------
        </div>
        
        <div className="space-y-2">
          {SYSTEM_LOGS.map((log, i) => (
            <div key={i} className="flex flex-col md:flex-row md:space-x-4">
              <span className="opacity-40 min-w-[100px] font-bold">&gt; {log.time}:</span>
              <span className="flex-1">{log.event}</span>
              <span className={`font-bold ${getStatusColor(log.status)}`}>
                [{log.status}]
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-[#33FF00]/20 text-[#33FF00]/50 italic">
          ** DATA ANALYTICS: IF THE ABOVE LOGS MATCH YOUR EXPERIENCE, SYSTEM PURGE IS MANDATORY.
        </div>
      </div>

      <button 
        onClick={() => { playBeep(); onBack(); }}
        className="mt-8 text-xl opacity-60 hover:opacity-100 underline"
      >
        [B] EXIT LOG_VIEWER
      </button>
    </div>
  );
};

export default LogViewer;
