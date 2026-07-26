import React, { useEffect, useRef, useState } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { Bot, User, ChevronDown, ChevronUp, Zap, Info, ShieldAlert, BookOpen, Skull, Flame, FileText, AlertTriangle, Film, Mic, Volume2, VolumeX, Square, Sparkles } from 'lucide-react';

const TONE_STYLES = {
  calm: { bg: 'bg-[#0d0d14]/80 backdrop-blur-xl', border: 'border-white/[0.08]', text: 'text-zinc-100', accent: 'text-zinc-400' },
  cocky: { bg: 'bg-[#14120d]/80 backdrop-blur-xl', border: 'border-amber-500/20', text: 'text-amber-100', accent: 'text-amber-400' },
  vulnerable: { bg: 'bg-[#0d1214]/80 backdrop-blur-xl', border: 'border-blue-500/20', text: 'text-blue-100', accent: 'text-blue-400' },
  toxic: { bg: 'bg-[#140d10]/80 backdrop-blur-xl', border: 'border-rose-500/20', text: 'text-rose-100', accent: 'text-rose-400' },
  help: { bg: 'bg-[#0d1410]/80 backdrop-blur-xl', border: 'border-emerald-500/20', text: 'text-emerald-100', accent: 'text-emerald-400' }
};

const GaugeItem = ({ label, score, descriptor, colorClass }) => (
  <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06]">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-zinc-400 text-xs font-medium">{label}</span>
      <span className={`text-xs font-bold ${colorClass}`}>{score}%</span>
    </div>
    <div className="w-full bg-white/[0.08] rounded-full h-1.5 mb-1.5">
      <div className={`h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${score}%` }}></div>
    </div>
    <p className="text-[9px] text-zinc-500 font-mono uppercase font-bold tracking-wider">{descriptor}</p>
  </div>
);

function BotMessage({ msg, lang, onSpeakMsg, isSpeaking, speakingMsgId }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const [showDetails, setShowDetails] = useState(false);
  
  const toneStyle = msg.intent === 'help' ? TONE_STYLES.help : (TONE_STYLES[msg.detectedTone] || TONE_STYLES.calm);
  const isThisMsgSpeaking = isSpeaking && speakingMsgId === msg.id;

  return (
    <div className="flex gap-3 mb-6 w-full group">
      <div className={`w-8 h-8 rounded-full bg-white/[0.05] border ${isThisMsgSpeaking ? 'border-indigo-500 ring-2 ring-indigo-500/30 animate-pulse' : 'border-white/[0.08]'} flex items-center justify-center flex-shrink-0 mt-1 transition-all shadow-sm`}>
        <Bot className="w-4 h-4 text-indigo-400" />
      </div>
      
      <div className="flex flex-col gap-1.5 max-w-[92%] md:max-w-[85%]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">fun.ai</span>
          <span className="text-[10px] text-zinc-500 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          {msg.badgeLabel && (
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] ${toneStyle.accent}`}>
              {msg.badgeLabel}
            </span>
          )}
        </div>

        <div className={`p-4 rounded-[32px] rounded-tl-sm border text-sm md:text-base leading-relaxed ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text} whitespace-pre-wrap break-words shadow-lg`}>
          {msg.text}
        </div>

        {/* Controls: Analytics Toggle & Audio Readout Button */}
        <div className="flex items-center gap-4 mt-0.5 self-start">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer font-medium"
          >
            {showDetails ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
            {showDetails ? (t.hideDetails || "Hide Analytics") : (t.showDetails || "Show Analytics")}
          </button>

          {onSpeakMsg && (
            <button
              onClick={() => onSpeakMsg(msg)}
              className={`text-xs flex items-center gap-1 transition-colors cursor-pointer font-mono ${isThisMsgSpeaking ? 'text-indigo-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
              title={isThisMsgSpeaking ? "Остановить озвучку" : "Прослушать ответ"}
            >
              {isThisMsgSpeaking ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Озвучка...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Озвучить</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Details Drawer */}
        {showDetails && msg.gauges && (
          <div className="mt-2 bg-[#0a0a10]/90 backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-4 flex flex-col gap-3.5 animate-in slide-in-from-top-2 fade-in duration-200 shadow-xl">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               <GaugeItem label={t.sarcasm || "Sarcasm"} score={msg.gauges.sarcasm} descriptor={msg.gaugeDescriptors?.sarcasm} colorClass="text-purple-400" />
               <GaugeItem label={t.toxicity || "Toxicity"} score={msg.gauges.toxicity} descriptor={msg.gaugeDescriptors?.toxicity} colorClass="text-rose-400" />
               <GaugeItem label={t.stuffiness || "Stuffiness"} score={msg.gauges.stuffiness} descriptor={msg.gaugeDescriptors?.stuffiness} colorClass="text-blue-400" />
               <GaugeItem label={t.overallVibe || "Vibe"} score={msg.gauges.overallVibe} descriptor={msg.gaugeDescriptors?.overallVibe} colorClass="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
                 <h4 className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-zinc-500" />
                    {t.unspokenMotive || "Motive"}
                 </h4>
                 <p className="text-xs text-zinc-300 italic">{msg.unspokenMotive}</p>
              </div>
              
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
                 <h4 className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-indigo-400" />
                    {t.recommendedReply || "Reply"}
                 </h4>
                 <p className="text-xs text-zinc-200 font-medium">{msg.recommendedReply}</p>
              </div>
            </div>

            {msg.detectedTerms && msg.detectedTerms.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 mt-0.5">
                 <h4 className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                    {t.detectedNuances || "Detected"}
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {msg.detectedTerms.map((term, i) => (
                      <div key={i} className="group relative cursor-help">
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-300 text-xs font-mono">
                          {term.term}
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-[#12121a] border border-white/10 text-white text-xs p-2.5 rounded-2xl z-10 shadow-2xl">
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
  const attachmentList = Array.isArray(msg.attachments)
    ? msg.attachments
    : (msg.attachment ? [msg.attachment] : []);

  return (
    <div className="flex justify-end gap-3 mb-6 w-full">
      <div className="flex flex-col gap-1 max-w-[90%] md:max-w-[80%] items-end">
        <div className="flex items-center gap-2">
          {msg.isVoice && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-300">
              <Mic className="w-3 h-3 text-indigo-400" /> Голос
            </span>
          )}
          <span className="text-[10px] text-zinc-500 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span className="text-xs font-semibold text-zinc-400">Вы</span>
        </div>

        <div className="p-4 rounded-[32px] rounded-tr-sm bg-indigo-600/90 text-white text-sm md:text-base border border-indigo-500/30 leading-relaxed whitespace-pre-wrap break-words shadow-md">
          
          {/* Render Attachments Grid if present */}
          {attachmentList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachmentList.map((att, idx) => (
                <div key={idx} className="flex flex-col">
                  {att.type === 'image' && (att.thumbnail || att.images?.[0]) && (
                    <img
                      src={att.thumbnail || att.images[0]}
                      alt={att.fileName || 'Attachment'}
                      className="max-h-52 rounded-2xl object-cover border border-white/20"
                    />
                  )}

                  {att.type === 'video' && (
                    <div className="flex flex-col gap-1.5">
                      <div className="grid grid-cols-2 gap-1.5 max-w-xs">
                        {(att.images || [att.thumbnail]).map((frameUrl, fIdx) => (
                          <img
                            key={fIdx}
                            src={frameUrl}
                            alt={`Frame ${fIdx + 1}`}
                            className="w-full h-16 object-cover rounded-xl border border-white/20"
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-indigo-200 font-mono bg-black/20 border border-white/10 p-1.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 text-indigo-300" />
                        <span>Анализ сделан по 4 кадрам без звука</span>
                      </div>
                    </div>
                  )}

                  {(att.type === 'text' || att.type === 'pdf') && (
                    <div className="flex items-center gap-2 p-2.5 rounded-full bg-black/20 border border-white/10 text-xs">
                      <FileText className="w-4 h-4 text-indigo-200 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono font-semibold text-white truncate max-w-[180px]">{att.fileName}</span>
                        <span className="text-[9px] text-indigo-200 font-mono uppercase">
                          {att.type === 'pdf' ? 'PDF Документ' : 'Текст'} {att.truncated ? '(обрезано)' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text Message */}
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export default function ChatMessages({ messages, isTyping, lang, onSpeakMsg, isSpeaking, speakingMsgId }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 w-full overflow-y-auto px-2 md:px-6 pb-2 scrollbar-thin">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-70 py-4">
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-2.5 text-indigo-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-1">{t.welcomeMessage || "Привет! Чем я могу помочь?"}</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            {t.inputPlaceholder}
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full">
          {messages.map((msg) => 
            msg.role === 'user' ? (
              <UserMessage key={msg.id} msg={msg} />
            ) : (
              <BotMessage 
                key={msg.id} 
                msg={msg} 
                lang={lang} 
                onSpeakMsg={onSpeakMsg}
                isSpeaking={isSpeaking}
                speakingMsgId={speakingMsgId}
              />
            )
          )}
          
          {isTyping && (
            <div className="flex gap-3 mb-6 w-full animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mt-1">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-[#0d0d14]/80 border border-white/[0.08] rounded-[32px] rounded-tl-sm px-4 py-3 flex items-center gap-1.5 h-10">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-2" />
        </div>
      )}
    </div>
  );
}
