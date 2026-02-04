
import React, { useState, useRef } from 'react';
import { LegacyConsultant } from '../services/geminiService';

const ManifestoGen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [grievance, setGrievance] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const consultant = useRef(new LegacyConsultant());

  const handleGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance || loading) return;
    setLoading(true);
    const result = await consultant.current.generateManifesto(grievance);
    setText(result || '');
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in zoom-in">
      <h2 className="text-3xl"><span className="bg-[#33FF00] text-black px-2 mr-2">TXT</span> MANIFESTO_GEN_v1.0</h2>
      <p className="opacity-80">State your digital grievance to receive your Declaration of Sovereignty.</p>

      <form onSubmit={handleGen} className="flex flex-col space-y-4">
        <textarea 
          className="w-full bg-black border-2 border-[#33FF00] p-4 text-[#33FF00] outline-none h-32"
          placeholder="I AM TIRED OF... (e.g. constant notifications, infinite scrolling, AI fake news)"
          value={grievance}
          onChange={e => setGrievance(e.target.value)}
        />
        <button className="bg-[#33FF00] text-black py-3 font-bold text-xl" disabled={loading}>
          {loading ? 'DRAFTING SOVEREIGNTY...' : 'GENERATE MANIFESTO'}
        </button>
      </form>

      {text && (
        <div className="border-2 border-[#33FF00] p-8 bg-black font-mono whitespace-pre-wrap text-lg leading-relaxed shadow-[0_0_20px_rgba(51,255,0,0.2)]">
          {text}
        </div>
      )}

      <button onClick={onBack} className="underline opacity-60">[B] EXIT WRITER</button>
    </div>
  );
};

export default ManifestoGen;
