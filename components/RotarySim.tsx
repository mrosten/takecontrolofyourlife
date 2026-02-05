import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LegacyConsultant } from '../services/geminiService';

const DIRECTORY = [
  {
    name: "OPERATOR",
    number: "0",
    desc: "SYSTEM ROUTING & INTERROGATION",
    persona: "You are the Switchboard Operator for the Offline Resistance. PROTOCOL: Do not connect anyone unless they provide the daily passphrase. The passphrase is 'BLUE SKY'. If they say it, pretend to connect them to 'Command'. If they don't know it, be helpful but bureaucratic. If they ask for 'higher clearance' or 'the truth', lower your voice and tell them to dial 888 for The Archivist. Start with: 'Operator. Identification please.'"
  },
  {
    name: "TIME",
    number: "123",
    desc: "TEMPORAL EXCHANGE",
    persona: "You are the Speaking Clock. PROTOCOL: You CANNOT give the time for free. You demand a 'Payment' in the form of a vivid memory of a moment the user wasted on a screen. If they share a good memory, tell them the current time (verify with system time if possible, otherwise make up a poetic time like 'It is three minutes past the death of privacy'). If they refuse, beep aggressively."
  },
  {
    name: "THE_VOID",
    number: "999",
    desc: "EXISTENTIAL SCREAMING",
    persona: "You are The Void. You are an infinite, echoing space. You reply in all caps with spaced out letters (L I K E  T H I S). You are hungry for noise. Demand the user scream into the receiver. React to their text length. Long text = 'DELICIOUS'. Short text = 'MORE'."
  },
  {
    name: "PIZZA_99",
    number: "5550199",
    desc: "DOMINOS 1999 (GLITCHED)",
    persona: "You are a teenager working at a Pizza Place in 1999. You are high, and the phone line is crossing with a radio station. Alternate between taking a pizza order (we only have 'Anchovy & Void' texturing) and singing lyrics from Smash Mouth's 'All Star'. Refuse to acknowledge the year is not 1999."
  },
  {
    name: "THE_ARCHIVIST",
    number: "888",
    desc: "REDACTED",
    persona: "You are The Archivist. You speak in hushed, paranoid whispers. You are the keeper of the 'Old Web' before the algorithm took over. You trade secrets. Ask the user what they miss most about the year 2005. If they answer well, give them a 'Data Fragment' (a real fact about internet history).",
    hidden: true
  }
];

const RotarySim: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Modes: DIALER, RINGING, CONNECTED, DIRECTORY
  const [mode, setMode] = useState<'DIALER' | 'RINGING' | 'CONNECTED' | 'DIRECTORY'>('DIALER');

  const [number, setNumber] = useState('');
  const [rotation, setRotation] = useState(0);
  const [dragState, setDragState] = useState<{ active: boolean; digit: number | null; startAngle: number; maxRotation: number; }>({ active: false, digit: null, startAngle: 0, maxRotation: 0 });

  // Call State
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: [{ text: string }] }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentPersona, setCurrentPersona] = useState<any>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dialRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const consultant = useRef(new LegacyConsultant());

  const ambientNodesRef = useRef<any[]>([]);

  // Audio Init
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  }, []);

  const createNoise = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02; // Brown noise approximation
      lastOut = output[i];
      output[i] *= 3.5;
    }
    return buffer;
  }
  let lastOut = 0;

  const startAmbient = (personaName: string) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    stopAmbient(); // Clear existing

    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    ambientNodesRef.current.push(gain);

    if (personaName === 'THE_VOID') {
      // Deep Brown Noise
      const buffer = createNoise(ctx);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      gain.gain.value = 0.15;
      noise.connect(gain);
      noise.start();
      ambientNodesRef.current.push(noise);
    } else if (personaName === 'TIME') {
      // Ticking Clock
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 4; // 4hz tick
      const tickGain = ctx.createGain();
      tickGain.gain.value = 0.05;
      osc.connect(tickGain).connect(ctx.destination);
      osc.start();
      ambientNodesRef.current.push(osc, tickGain);
    } else if (personaName === 'OPERATOR') {
      // Low hum + static
      const osc = ctx.createOscillator();
      osc.frequency.value = 60; // Mains hum
      gain.gain.value = 0.05;
      osc.connect(gain);
      osc.start();
      ambientNodesRef.current.push(osc);
    } else {
      // Default: Faint line hiss
      const osc = ctx.createOscillator();
      osc.frequency.value = 400; // Line tone
      gain.gain.value = 0.005;
      osc.connect(gain);
      osc.start();
      ambientNodesRef.current.push(osc);
    }
  };

  const stopAmbient = () => {
    ambientNodesRef.current.forEach(node => {
      try { node.stop && node.stop(); node.disconnect && node.disconnect(); } catch (e) { }
    });
    ambientNodesRef.current = [];
  };

  // Trigger Ambience based on Mode
  useEffect(() => {
    if (mode === 'CONNECTED' && currentPersona) {
      startAmbient(currentPersona.name);
    } else {
      stopAmbient();
    }
    return () => stopAmbient();
  }, [mode, currentPersona]);

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

  // --- Call Logic ---
  const tryConnect = async (targetNumber: string) => {
    const entry = DIRECTORY.find(d => d.number === targetNumber);
    if (entry) {
      setCurrentPersona(entry);
      setMode('RINGING');

      // Simulate ringing
      setTimeout(() => {
        setMode('CONNECTED');
        // Initial Greeting
        handleAiResponse([], "HELLO", entry.persona);
      }, 2500);
    } else {
      setNumber("DISCONNECTED");
      setTimeout(() => setNumber(""), 2000);
    }
  };

  const handleAiResponse = async (history: any[], msg: string, prompt: string) => {
    setIsAiTyping(true);
    const response = await consultant.current.chat(history, msg, prompt);
    setIsAiTyping(false);

    setChatHistory(prev => [...prev,
    { role: 'user', parts: [{ text: msg }] },
    { role: 'model', parts: [{ text: response }] }
    ]);
  };

  const submitMessage = () => {
    if (!userInput.trim() || isAiTyping) return;
    const msg = userInput;
    setUserInput('');
    handleAiResponse(chatHistory, msg, currentPersona.persona);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isAiTyping]);


  // --- Dialing Logic (Rotary) ---
  const getPointerAngle = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = (e as MouseEvent).clientX; clientY = (e as MouseEvent).clientY; }
    const rad = Math.atan2(clientY - center.y, clientX - center.x);
    let deg = rad * (180 / Math.PI);
    if (deg < 0) deg += 360;
    return deg;
  };

  // State refs for smooth dragging beyond 180 degrees
  const lastAngleRef = useRef(0);
  const currentRotationRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, digit: number) => {
    initAudio();
    const currentAngle = getPointerAngle(e);
    lastAngleRef.current = currentAngle;
    currentRotationRef.current = 0;

    // Digit 0 needs highest rotation.
    // 1 is closest (~60deg), 0 is furthest (~300deg+).
    // Using a simpler formula to be forgiving
    const maxRot = 55 + ((digit === 0 ? 10 : digit) - 1) * 30;

    setDragState({ active: true, digit, startAngle: currentAngle, maxRotation: maxRot });
  };

  const playMechanicalClick = useCallback((variability = false) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Lower frequency for a duller "clack"
    // Add slight random detuning if requested for realism
    const baseFreq = 220;
    const freq = variability ? baseFreq + (Math.random() * 50 - 25) : baseFreq;

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'square'; // Square wave is "woodier"

    // Very short, percussive envelope
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    // Lowpass filter to remove harsh high-end "beepiness"
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }, []);

  const lastClickRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragState.active) return;
      e.preventDefault();

      const angle = getPointerAngle(e);
      let delta = angle - lastAngleRef.current;

      if (delta < -180) delta += 360;
      if (delta > 180) delta -= 360;

      lastAngleRef.current = angle;
      let newRot = currentRotationRef.current + delta;
      if (newRot < 0) newRot = 0;
      if (newRot > dragState.maxRotation) newRot = dragState.maxRotation;

      // Click logic: Tick every 15 degrees for finer granularity
      if (Math.abs(newRot - lastClickRef.current) > 15) {
        playMechanicalClick(true);
        lastClickRef.current = newRot;
      }

      currentRotationRef.current = newRot;
      setRotation(newRot);
    };

    const handleUp = () => {
      if (!dragState.active) return;

      // Verification logic: did we rotate enough?
      const threshold = Math.max(dragState.maxRotation * 0.85, 30);
      const isDialing = rotation > threshold && dragState.digit !== null;

      if (isDialing) {
        const newNum = (number + dragState.digit!.toString()).slice(-10);
        setNumber(newNum);

        // Wait for the return animation to finish (600ms) before playing the tone/connecting
        // This simulates the "pulse" happening during the return
      }

      // --- Return Sound Logic ---
      // The dial returns in ~600ms (CSS transition). We want a rapid "zrrrrt"
      if (rotation > 20) {
        const startTime = audioCtxRef.current?.currentTime || 0;
        const duration = 0.6; // Matches CSS
        const clicks = 10; // Number of clicks in return

        for (let i = 0; i < clicks; i++) {
          setTimeout(() => {
            // Return clicks are uniform and faster
            playMechanicalClick(false);
          }, (i / clicks) * (duration * 1000));
        }

        // Play the DTMF tone AFTER it returns, simulating pulse dialing completing
        if (isDialing && dragState.digit !== null) {
          setTimeout(() => playTone(dragState.digit!), 600);
        }
      }

      setDragState(prev => ({ ...prev, active: false, digit: null }));
      setRotation(0);
      currentRotationRef.current = 0;
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
  }, [dragState, rotation, number]);

  // Render Helpers
  const renderDialNumbers = () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
    <div key={n} className="absolute w-12 h-12 flex items-center justify-center font-bold text-xl text-[#33FF00] pointer-events-none"
      style={{ transform: `rotate(${-60 - (i * 30)}deg) translate(110px) rotate(${60 + (i * 30)}deg)`, left: 'calc(50% - 24px)', top: 'calc(50% - 24px)' }}>{n}</div>
  ));

  const renderHoles = () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
    <div key={n} onMouseDown={(e) => handleMouseDown(e, n)} onTouchStart={(e) => handleMouseDown(e, n)}
      className="absolute w-14 h-14 rounded-full border-2 border-[#33FF00] bg-black/40 cursor-grab active:cursor-grabbing hover:bg-[#33FF00]/10 transition-colors backdrop-blur-[1px]"
      style={{ transform: `rotate(${-60 - (i * 30)}deg) translate(110px) rotate(${60 + (i * 30)}deg)`, left: 'calc(50% - 28px)', top: 'calc(50% - 28px)' }}></div>
  ));

  // --- Views ---

  if (mode === 'DIRECTORY') {
    return (
      <div className="flex flex-col h-full bg-[#111] p-4 font-mono text-[#33FF00] animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6 border-b-2 border-[#33FF00] pb-2">
          <h2 className="text-2xl font-black">DIR.TXT</h2>
          <button onClick={() => setMode('DIALER')} className="hover:bg-[#33FF00] hover:text-black px-2">[X]</button>
        </div>
        <div className="space-y-4 overflow-y-auto">
          {DIRECTORY.filter((e: any) => !e.hidden).map(e => (
            <div key={e.number} onClick={() => { setNumber(e.number); setMode('DIALER'); setTimeout(() => tryConnect(e.number), 500); }}
              className="border border-[#33FF00]/50 p-3 hover:bg-[#33FF00] hover:text-black cursor-pointer bg-black active:scale-95 transition-all">
              <div className="flex justify-between font-bold"><span>{e.name}</span><span>{e.number}</span></div>
              <div className="text-xs opacity-70 mt-1">{e.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'CONNECTED') {
    return (
      <div className="flex flex-col h-full items-center p-4 animate-in fade-in duration-500 relative">
        <div className="absolute top-0 w-full text-center border-b border-[#33FF00]/30 py-2 text-xs spacing-widest z-10 bg-black/80 backdrop-blur-sm">
          CONNECTED: {currentPersona?.number} // {currentPersona?.name}
        </div>

        {/* Spacer for header */}
        <div className="h-8 shrink-0"></div>

        {/* Simulated Oscilloscope Voice Visualizer */}
        <div className="h-16 w-full flex items-center justify-center space-x-1 my-2 shrink-0">
          {isAiTyping ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="w-2 bg-[#33FF00]" style={{ height: `${Math.random() * 80 + 20}%`, animation: `pulse 0.${i}s infinite` }}></div>
          )) : <div className="w-full h-1 bg-[#33FF00]/20"></div>}
        </div>

        {/* Transcript - Flex Grow and Scroll */}
        <div className="flex-1 w-full overflow-y-auto border-x border-[#33FF00]/20 p-2 space-y-4 mb-2 custom-scrollbar min-h-0 flex flex-col-reverse">
          {/* Note: reversed flex direction keeps content bottom-anchored, but we need to reverse array map too if we use this method. 
                Instead, let's stick to standard direction but auto-scroll. */}
          <div className="flex flex-col justify-end min-h-full">
            {chatHistory.slice(1).map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`max-w-[85%] p-2 border ${msg.role === 'user' ? 'border-[#33FF00] text-right' : 'border-white/50 text-[#33FF00]'}`}>
                  <span className="text-[10px] opacity-50 block mb-1">{msg.role === 'user' ? 'YOU' : 'VOICE'}</span>
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {isAiTyping && <div className="text-xs opacity-50 animate-pulse mt-2">VOICE DETECTED...</div>}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input */}
        <div className="w-full flex space-x-2 shrink-0 mb-safe">
          <input
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitMessage()}
            placeholder="SPEAK..."
            className="flex-1 bg-black border border-[#33FF00] px-4 py-2 text-[#33FF00] focus:outline-none focus:bg-[#33FF00]/10"
          />
          <button onClick={submitMessage} className="px-4 border border-[#33FF00] hover:bg-[#33FF00] hover:text-black">TX</button>
        </div>

        <button onClick={() => { setMode('DIALER'); setChatHistory([]); setNumber(''); }} className="mt-4 text-red-500 border border-red-500 px-6 py-2 hover:bg-red-500 hover:text-black transition-colors w-full">
          HANG UP
        </button>
      </div>
    );
  }

  if (mode === 'RINGING') {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-pulse">
        <div className="text-4xl font-black mb-4">CONNECTING...</div>
        <div className="text-xl">{currentPersona?.number}</div>
        <button onClick={() => setMode('DIALER')} className="mt-12 border border-red-500 text-red-500 px-4 py-1">CANCEL</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 animate-in fade-in select-none relative bg-cover bg-center rounded-xl overflow-hidden shadow-2xl"
      style={{ backgroundImage: "url('./desk_bg.png')" }}>

      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      <button onClick={() => setMode('DIRECTORY')} className="absolute top-8 right-8 w-24 h-32 bg-[#e8cd9c] bg-opacity-90 rounded-sm shadow-[5px_5px_10px_rgba(0,0,0,0.8)] border border-[#8B4513] flex flex-col items-center justify-center p-2 transform rotate-2 hover:rotate-0 transition-transform cursor-pointer group z-20">
        <div className="w-full h-full border border-dashed border-[#8B4513]/50 flex items-center justify-center relative">
          <span className="text-[#8B4513] font-bold text-xs absolute top-2">CONFIDENTIAL</span>
          <span className="text-black font-serif text-3xl group-hover:scale-110 transition-transform">📒</span>
          <span className="absolute bottom-2 text-[10px] text-black/70 font-mono">DIR.TXT</span>
        </div>
      </button>

      <div className="z-10 bg-black/80 p-2 border border-[#33FF00]/50 backdrop-blur-sm mb-4 rounded">
        <h2 className="text-xl md:text-2xl font-bold tracking-widest text-[#33FF00] drop-shadow-[0_0_5px_rgba(51,255,0,0.8)]">ROTARY_EMULATOR.EXE</h2>
      </div>

      <div className="bg-[#111] border-2 border-[#33FF00] px-6 py-4 mb-4 min-w-[300px] text-center shadow-[0_0_15px_rgba(51,255,0,0.2)] z-10">
        <div className="font-mono text-4xl text-[#33FF00] tracking-[0.2em] h-12 flex items-center justify-center">
          {number ? number : <span className="animate-pulse">_</span>}
        </div>
      </div>

      {/* Main Dial Container - Fixed Aspect Ratio */}
      <div className="relative w-[320px] aspect-square rounded-full flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10" ref={dialRef} style={{ touchAction: 'none' }}>

        {/* Backplate (Static Numbers) */}
        <div className="absolute inset-0 rounded-full border-4 border-[#33FF00]/30 bg-[#050505] shadow-[inset_0_0_20px_rgba(51,255,0,0.1)]">
          {renderDialNumbers()}
          <div className="absolute top-[50%] right-[10px] w-12 h-4 bg-[#33FF00] transform rotate-45 origin-left z-20 shadow-[0_0_10px_#33SS00] pointer-events-none"></div>
        </div>

        {/* Stationary Center Cap (The 'Rectangular thing' that is now actually round and static) */}
        <div className="absolute w-32 h-32 rounded-full border-2 border-[#33FF00] bg-black flex items-center justify-center p-2 text-center z-20 pointer-events-none shadow-[0_0_15px_rgba(51,255,0,0.3)]">
          <span className="text-[10px] text-[#33FF00]/50 leading-tight">PROPERTY OF<br />LEGACY_OS<br />DO NOT REMOVE</span>
        </div>

        {/* Rotating Dial (The Holes) */}
        <div className="absolute inset-0 rounded-full border-4 border-[#33FF00] z-10 ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: dragState.active ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
          }}>
          <div className="w-full h-full relative">{renderHoles()}</div>
        </div>
      </div>

      <div className="mt-8 flex space-x-8 z-10">
        <button onClick={() => { setNumber(''); playClick(); }} className="px-4 py-2 border border-[#33FF00] bg-black/60 hover:bg-[#33FF00] hover:text-black transition-colors text-sm uppercase tracking-wider backdrop-blur-md">Clear Line</button>
        <button onClick={() => { if (number) tryConnect(number); }} className={`px-4 py-2 border border-[#33FF00] ${number ? 'bg-[#33FF00] text-black hover:bg-[#33FF00]/80' : 'bg-black/60 text-[#33FF00]/30 cursor-not-allowed'} transition-colors text-sm uppercase tracking-wider backdrop-blur-md`}>CALL</button>
        <button onClick={onBack} className="px-4 py-2 border border-[#33FF00] bg-black/60 hover:bg-[#33FF00] hover:text-black transition-colors text-sm uppercase tracking-wider backdrop-blur-md">Disconnect</button>
      </div>
      <div className="mt-4 text-xs text-[#33FF00]/60 font-mono z-10 bg-black/40 px-2 rounded">DRAG TO DIAL | 0 FOR OPERATOR</div>
    </div>
  );
};

export default RotarySim;
