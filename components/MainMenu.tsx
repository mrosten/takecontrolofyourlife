
import React, { useState, useEffect, useCallback } from 'react';
import { AppState } from '../types';

interface MainMenuProps {
  onNavigate: (view: AppState) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuItems: { label: string; view: AppState; key: string }[] = [
    { label: '[1] THE_SERVICES / VIEW DIRECTORY', view: 'DIRECTORY', key: '1' },
    { label: '[2] SYSTEM_LOGS / VIEW ERROR HISTORY', view: 'LOGS', key: '2' },
    { label: '[3] THE_CONSULTATION / CONNECT WITH AI', view: 'CONSULTATION', key: '3' },
    { label: '[4] BOREDOM_TRAINER / CALIBRATE FOCUS', view: 'BOREDOM', key: '4' },
    { label: '[5] ASCII_MAPPER / LEGACY NAVIGATION', view: 'MAPPER', key: '5' },
    { label: '[6] MANIFESTO_GEN / CLAIM SOVEREIGNTY', view: 'MANIFESTO', key: '6' },
    { label: '[7] ROTARY_SIM / DIAL THE PAST', view: 'ROTARY', key: '7' },
    { label: '[8] GRID_RADAR / SCAN FOR NOISE', view: 'RADAR', key: '8' },
  ];

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
      const num = parseInt(key);
      if (num >= 1 && num <= menuItems.length) {
        playBeep();
        onNavigate(menuItems[num - 1].view);
      }

      if (e.key === 'ArrowDown') {
        playBeep(300, 0.02);
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
      }
      if (e.key === 'ArrowUp') {
        playBeep(300, 0.02);
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      }
      if (e.key === 'Enter' || key === 'y') {
        playBeep(800, 0.05);
        onNavigate(menuItems[selectedIndex].view);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, playBeep, selectedIndex, menuItems]);

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 overflow-y-auto pb-8">
      <header className="mb-4">
        <h1 className="text-5xl font-bold mb-2 tracking-tighter">DISCONNECT TO RECONNECT.</h1>
        <p className="text-lg opacity-80 border-b border-[#33FF00] pb-1 w-fit">
          THE FUTURE IS OFFLINE. V0.4.2 LEGACY_OS
        </p>
      </header>

      <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xl">
        {menuItems.map((item, idx) => (
          <button 
            key={item.key}
            onMouseEnter={() => setSelectedIndex(idx)}
            onClick={() => { playBeep(); onNavigate(item.view); }}
            className={`text-left p-2 transition-colors w-full group outline-none border border-transparent ${
              selectedIndex === idx 
                ? 'bg-[#33FF00] text-black font-bold border-[#33FF00]' 
                : 'hover:bg-[#33FF00]/10 text-[#33FF00] border-[#33FF00]/20'
            }`}
          >
            {selectedIndex === idx ? '> ' : '  '}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 p-3 border border-[#33FF00]/40 bg-[#33FF00]/5 text-xs opacity-70">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold">SYSTEM_HEALTH:</span>
          <span className="text-red-500 animate-pulse">CRITICAL_SMARTPHONE_DETECTION</span>
        </div>
        <p>RECLAIM YOUR ATTENTION SPAN. NAVIGATE VIA [ARROWS] OR [NUMBERS 1-8]. [Y] TO ENTER.</p>
      </div>
    </div>
  );
};

export default MainMenu;
