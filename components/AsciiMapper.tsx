
import React, { useState, useRef } from 'react';
import { LegacyConsultant } from '../services/geminiService';

const AsciiMapper: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [city, setCity] = useState('');
  const [map, setMap] = useState('');
  const [loading, setLoading] = useState(false);
  const consultant = useRef(new LegacyConsultant());

  const handleGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || loading) return;
    setLoading(true);
    const result = await consultant.current.generateMap(city);
    setMap(result || 'ERROR: MAP_DATA_UNAVAILABLE');
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right">
      <h2 className="text-3xl"><span className="bg-[#33FF00] text-black px-2 mr-2">MAP</span> LEGACY_NAVIGATOR</h2>
      <p className="opacity-80">Input your destination to receive ASCII-Directions. Designed for physical printing.</p>

      <form onSubmit={handleGen} className="flex space-x-4">
        <input 
          autoFocus
          className="flex-1 bg-black border-2 border-[#33FF00] p-3 text-[#33FF00] outline-none"
          placeholder="ENTER CITY NAME..."
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <button className="bg-[#33FF00] text-black px-6 font-bold" disabled={loading}>
          {loading ? 'CALCULATING...' : 'GENERATE'}
        </button>
      </form>

      {map && (
        <div className="border border-[#33FF00]/40 p-6 bg-black font-mono whitespace-pre overflow-x-auto text-sm leading-tight">
          {map}
        </div>
      )}

      <div className="flex space-x-4">
        <button onClick={onBack} className="underline opacity-60">[B] RETURN</button>
        {map && <button onClick={() => window.print()} className="underline text-[#33FF00]">[P] PRINT FOR FIELD USE</button>}
      </div>
    </div>
  );
};

export default AsciiMapper;
