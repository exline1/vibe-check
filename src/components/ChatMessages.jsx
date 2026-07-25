import React, { useEffect, useRef, useState } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { Bot, User, ChevronDown, ChevronUp, Zap, Info, ShieldAlert, BookOpen, Skull, Flame } from 'lucide-react';

const TONE_STYLES = {
  calm: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', text: 'text-zinc-300', accent: 'text-zinc-400' },
  cocky: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-100', accent: 'text-amber-400' },
  vulnerable: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-100', accent: 'text-blue-400' },
  toxic: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-100', accent: 'text-red-400' },
  help: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-100', accent: 'text-emerald-400' }
};

const GaugeItem = ({ label, score, descriptor, colorClass }) => (
  <div className="bg-[#111111] p-3 rounded-2xl border border-[#222222]">
    <div className="flex justify-between items-center mb-2">
      <span className="text-zinc-400 text-xs font-medium">{label}</span>
      <span className={`text-xs font-bold ${colorClass}`}>{score}%</span>
    </div>
    <div className="w-full bg-[#222] rounded-full h-1.5 mb-2">
      <div className={`h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${score}%` }}></div>
    </div>
    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{descriptor}</p>
  </div>
);

function BotMessage({ msg, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const [showDetails, setShowDetails] = useState(false);
  
  // If intent is help, use 'help' style (emerald), otherwise use detectedTone style
  const toneStyle = msg.intent === 'help' ? TONE_STYLES.help : (TONE_STYLES[msg.detectedTone] || TONE_STYLES.calm);

  return (
    <div className="flex gap-3 mb-6 w-full group">
      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className={`w-4 h-4 ${toneStyle.accent}`} />
      </div>
      
      <div className="flex flex-col gap-1 max-w-[92%] md:max-w-[85%]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400">Vibe Judge</span>
          <span className="text-[10px] text-zinc-600 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          {msg.badgeEmoji && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#111] border border-[#222] ${toneStyle.accent}`}>
              {msg.badgeEmoji} {msg.badgeLabel}
            </span>
          )}
        </div>

        <div className={`p-4 rounded-2xl rounded-tl-sm border backdrop-blur-md text-sm md:text-base leading-relaxed ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text} whitespace-pre-wrap break-words`}>
          {msg.text}
        </div>

        {/* Analytics Toggle */}
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors mt-1 self-start cursor-pointer"
        >
          {showDetails ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
          {showDetails ? (t.hideDetails || "Hide Analytics") : (t.showDetails || "Show Analytics")}
        </button>

        {/* Details Drawer */}
        {showDetails && msg.gauges && (
          <div className="mt-2 bg-[#050505] border border-[#1a1a1a] rounded-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               <GaugeItem label={t.sarcasm || "Sarcasm"} score={msg.gauges.sarcasm} descriptor={msg.gaugeDescriptors?.sarcasm} colorClass="text-purple-400" />
               <GaugeItem label={t.toxicity || "Toxicity"} score={msg.gauges.toxicity} descriptor={msg.gaugeDescriptors?.toxicity} colorClass="text-red-500" />
               <GaugeItem label={t.stuffiness || "Stuffiness"} score={msg.gauges.stuffiness} descriptor={msg.gaugeDescriptors?.stuffiness} colorClass="text-blue-400" />
               <GaugeItem label={t.overallVibe || "Vibe"} score={msg.gauges.overallVibe} descriptor={msg.gaugeDescriptors?.overallVibe} colorClass="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-[#111] border border-[#222] rounded-xl p-3">
                 <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-zinc-500" />
                    {t.unspokenMotive || "Motive"}
                 </h4>
                 <p className="text-sm text-zinc-300 italic">{msg.unspokenMotive}</p>
              </div>
              
              <div className="bg-[#111] border border-[#222] rounded-xl p-3">
                 <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {t.recommendedReply || "Reply"}
                 </h4>
                 <p className="text-sm text-white font-medium">{msg.recommendedReply}</p>
              </div>
            </div>

            {msg.detectedTerms && msg.detectedTerms.length > 0 && (
              <div className="bg-[#111] border border-[#222] rounded-xl p-3 mt-1">
                 <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                    {t.detectedNuances || "Detected"}
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {msg.detectedTerms.map((term, i) => (
                      <div key={i} className="group relative cursor-help">
                        <span className="px-2.5 py-1 rounded-md bg-[#222] border border-[#333] text-zinc-300 text-xs font-mono">
                          {term.term}
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-zinc-900 border border-zinc-700 text-white text-xs p-2 rounded-lg z-10 shadow-xl">
                          {term.nuance}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ msg }) {
  return (
    <div className="flex justify-end gap-3 mb-6 w-full">
      <div className="flex flex-col gap-1 max-w-[90%] md:max-w-[80%] items-end">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span className="text-xs font-bold text-zinc-400">You</span>
        </div>
        <div className="p-4 rounded-3xl rounded-tr-sm bg-zinc-800 text-white text-sm md:text-base border border-zinc-700 leading-relaxed whitespace-pre-wrap break-words">
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export default function ChatMessages({ messages, isTyping, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 w-full overflow-y-auto px-2 md:px-6 pb-2 scrollbar-thin">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-10">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-300 mb-2">{t.welcomeMessage || "Welcome"}</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            {t.inputPlaceholder}
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full">
          {messages.map((msg) => 
            msg.role === 'user' ? (
              <UserMessage key={msg.id} msg={msg} />
            ) : (
              <BotMessage key={msg.id} msg={msg} lang={lang} />
            )
          )}
          
          {isTyping && (
            <div className="flex gap-3 mb-6 w-full animate-pulse">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mt-1">
                <Bot className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="bg-[#111] border border-[#222] rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1.5 h-12">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-2" />
        </div>
      )}
    </div>
  );
}
