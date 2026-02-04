
import React, { useState, useEffect } from 'react';

const BoredomTrainer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(false);
  const goal = 60;

  useEffect(() => {
    let timer: any;
    if (active && seconds < goal) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [active, seconds]);

  useEffect(() => {
    const reset = () => {
      if (active) setSeconds(0);
    };
    window.addEventListener('keydown', reset);
    window.addEventListener('mousemove', reset);
    return () => {
      window.removeEventListener('keydown', reset);
      window.removeEventListener('mousemove', reset);
    };
  }, [active]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in zoom-in">
      <h2 className="text-3xl underline">BOREDOM_TRAINER.EXE</h2>
      <p className="max-w-md opacity-80">
        THE GOAL IS ABSOLUTE STILLNESS. DO NOT MOVE THE MOUSE. DO NOT PRESS A KEY. 
        RELEARN THE ART OF SITTING WITH YOURSELF.
      </p>

      {!active ? (
        <button 
          onClick={() => setActive(true)}
          className="bg-[#33FF00] text-black px-8 py-4 text-2xl font-bold hover:scale-105 transition-transform"
        >
          [ START CALIBRATION ]
        </button>
      ) : (
        <div className="space-y-4">
          <div className="text-8xl font-black tabular-nums">
            {seconds} <span className="text-2xl">/ {goal}S</span>
          </div>
          <div className="w-64 h-2 border border-[#33FF00] relative mx-auto">
            <div 
              className="h-full bg-[#33FF00] transition-all duration-1000" 
              style={{ width: `${(seconds / goal) * 100}%` }}
            />
          </div>
          {seconds >= goal ? (
            <div className="text-[#33FF00] animate-bounce text-2xl">
              SOVEREIGNTY ACHIEVED. YOU ARE HUMAN AGAIN.
            </div>
          ) : (
            <div className="opacity-50 animate-pulse">ANY INPUT DETECTED WILL RESET TIMER...</div>
          )}
        </div>
      )}

      <button onClick={onBack} className="underline opacity-60 hover:opacity-100">[B] ABORT TRAINING</button>
    </div>
  );
};

export default BoredomTrainer;
