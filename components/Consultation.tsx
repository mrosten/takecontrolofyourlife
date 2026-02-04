
import React, { useState, useRef, useEffect } from 'react';
import { LegacyConsultant } from '../services/geminiService';

interface ConsultationProps {
  onBack: () => void;
}

const Consultation: React.FC<ConsultationProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: "LEGACY_CONSULTANT ONLINE. STATE YOUR GRIEVANCE WITH THE GRID." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const consultant = useRef(new LegacyConsultant());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const response = await consultant.current.consult(userText);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response || "ERROR: NO RESPONSE FROM LEGACY_CORE" }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-in zoom-in duration-300">
      <h2 className="text-3xl mb-6">
        <span className="bg-[#33FF00] text-black px-2 mr-4">EXE</span> LEGACY_CONSULTANT.EXE
      </h2>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-black p-4 border border-[#33FF00]/40 space-y-4 mb-4 font-mono min-h-[300px]"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`block text-xs font-bold mb-1 ${m.role === 'user' ? 'text-blue-400' : 'text-[#33FF00]'}`}>
                {m.role === 'user' ? '[USER]' : '[LEGACY_CONSULTANT]'}
              </span>
              <p className={`inline-block p-2 border ${m.role === 'user' ? 'border-blue-400 text-blue-100' : 'border-[#33FF00] text-[#33FF00]'} whitespace-pre-wrap`}>
                {m.text}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-[#33FF00] animate-pulse">
            [LEGACY_CONSULTANT IS THINKING...]
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex space-x-2">
        <input 
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TYPE MESSAGE HERE..."
          className="flex-1 bg-black border-2 border-[#33FF00] p-3 text-[#33FF00] focus:outline-none placeholder:text-[#33FF00]/30"
        />
        <button 
          type="submit"
          className="bg-[#33FF00] text-black px-6 font-bold hover:opacity-80"
        >
          SEND
        </button>
      </form>

      <button 
        onClick={onBack}
        className="mt-6 text-xl opacity-60 hover:opacity-100 underline self-start"
      >
        &lt; TERMINATE SESSION
      </button>
    </div>
  );
};

export default Consultation;
