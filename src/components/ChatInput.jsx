import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function ChatInput({ lang, onSend, disabled, hasApiKey }) {
  const [text, setText] = useState('');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full relative mt-4 mb-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
        <div className="relative flex items-end gap-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-2 pl-4 focus-within:border-zinc-700 transition-colors shadow-2xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={t.sendMessage || 'Send a message...'}
            className="w-full bg-transparent text-white placeholder-zinc-600 outline-none resize-none min-h-[44px] max-h-32 py-3 text-sm scrollbar-thin font-medium"
            rows="1"
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-zinc-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </form>

      <div className="flex justify-center mt-3">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#0A0A0A] rounded-full border border-[#1F1F1F] text-[10px] text-zinc-500 font-mono tracking-wide">
          <Sparkles className={`w-3 h-3 ${hasApiKey ? 'text-emerald-400' : 'text-amber-500'}`} />
          {hasApiKey ? 'Groq Llama-3.3 (Active)' : 'Local Heuristic (Fallback)'}
        </span>
      </div>
    </div>
  );
}
