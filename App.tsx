
import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import BootSequence from './components/BootSequence';
import MainMenu from './components/MainMenu';
import Directory from './components/Directory';
import LogViewer from './components/LogViewer';
import Consultation from './components/Consultation';
import BoredomTrainer from './components/BoredomTrainer';
import AsciiMapper from './components/AsciiMapper';
import ManifestoGen from './components/ManifestoGen';
import RotarySim from './components/RotarySim';
import GridRadar from './components/GridRadar';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppState>(() => {
    const saved = localStorage.getItem('HARD_RESET_VIEW');
    return (saved as AppState) || 'BOOT';
  });
  const [history, setHistory] = useState<AppState[]>([]);

  useEffect(() => {
    if (currentView !== 'BOOT') {
      localStorage.setItem('HARD_RESET_VIEW', currentView);
    }
  }, [currentView]);

  const navigate = (view: AppState) => {
    setHistory(prev => [...prev, currentView]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(prevHistory => prevHistory.slice(0, -1));
      setCurrentView(prev);
    } else {
      setCurrentView('MAIN');
    }
  };

  // Handle ESC key for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView !== 'BOOT') {
        setCurrentView('MAIN');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  // Handle Android Back Button (History API Interception)
  useEffect(() => {
    // Push a dummy state when entering a new view (except BOOT/MAIN initial load)
    if (currentView !== 'BOOT' && currentView !== 'MAIN') {
      window.history.pushState({ view: currentView }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      // If user presses back, goBack() logic which handles internal history or exits to MAIN
      // Prevent default behavior effectively by handling the state pop
      event.preventDefault();
      goBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]); // Re-bind when view changes to capture correct 'goBack' context

  return (
    <div className="h-screen w-screen bg-black text-[#33FF00] p-2 md:p-4 selection:bg-[#33FF00] selection:text-black crt-content overflow-hidden flex flex-col">
      <div className="flex-1 border-2 border-[#33FF00] p-4 md:p-6 flex flex-col relative shadow-[0_0_50px_rgba(51,255,0,0.1)] overflow-hidden">

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {currentView === 'BOOT' && <BootSequence onComplete={() => setCurrentView('MAIN')} />}
          {currentView === 'MAIN' && <MainMenu onNavigate={navigate} />}
          {currentView === 'DIRECTORY' && <Directory onBack={goBack} />}
          {currentView === 'LOGS' && <LogViewer onBack={goBack} />}
          {currentView === 'CONSULTATION' && <Consultation onBack={goBack} />}
          {currentView === 'BOREDOM' && <BoredomTrainer onBack={goBack} />}
          {currentView === 'MAPPER' && <AsciiMapper onBack={goBack} />}
          {currentView === 'MANIFESTO' && <ManifestoGen onBack={goBack} />}
          {currentView === 'ROTARY' && <RotarySim onBack={goBack} />}
          {currentView === 'RADAR' && <GridRadar onBack={goBack} />}
        </div>

        {currentView !== 'BOOT' && (
          <footer className="mt-4 pt-2 font-mono border-t border-[#33FF00]/30 text-xs shrink-0">
            <div className="flex justify-between items-end">
              <div className="opacity-80">
                <span className="bg-[#33FF00] text-black px-1 font-bold mr-2">C:\LEGACY_OS&gt;</span>
                <span className="hidden sm:inline">CMD: CONTACT_US | VOICE: 555-0100 | MAIL: PO BOX 1984</span>
                <span className="sm:hidden">CMD: CONTACT_US</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-4 bg-[#33FF00] animate-pulse"></div>
                <span className="opacity-50">[ESC] HOME</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default App;
