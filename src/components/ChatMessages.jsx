import React, { useEffect, useRef, useState } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { Bot, User, ChevronDown, ChevronUp, Zap, Info, ShieldAlert, BookOpen, Skull, Flame, FileText, AlertTriangle, Film, Mic, Volume2, VolumeX, Square, Gavel } from 'lucide-react';

const TONE_STYLES = {
  calm: { bg: 'bg-[#16151D]', border: 'border-[#2A2838]', text: 'text-[#F2EFE9]', accent: 'text-[#9E9AA8]' },
  cocky: { bg: 'bg-[#1A1813]', border: 'border-[#FFB800]/40', text: 'text-[#FFF5D6]', accent: 'text-[#FFB800]' },
  vulnerable: { bg: 'bg-[#12181C]', border: 'border-[#00D2D3]/40', text: 'text-[#E0FCFC]', accent: 'text-[#00D2D3]' },
  toxic: { bg: 'bg-[#1C1415]', border: 'border-[#FF3B30]/40', text: 'text-[#FFEBEA]', accent: 'text-[#FF3B30]' },
  help: { bg: 'bg-[#131B16]', border: 'border-[#10AC84]/40', text: 'text-[#E3FCEF]', accent: 'text-[#10AC84]' }
};

const GaugeItem = ({ label, score, descriptor, colorClass }) => (
  <div className="bg-[#0E0D12] p-3 rounded-2xl border border-[#2A2838]">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-[#9E9AA8] text-xs font-medium">{label}</span>
      <span className={`text-xs font-bold ${colorClass}`}>{score}%</span>
    </div>
    <div className="w-full bg-[#16151D] rounded-full h-1.5 mb-1.5">
      <div className={`h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${score}%` }}></div>
    </div>
    <p className="text-[9px] text-[#9E9AA8] font-mono uppercase font-bold tracking-wider">{descriptor}</p>
  </div>
);

function BotMessage({ msg, lang, onSpeakMsg, isSpeaking, speakingMsgId }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const [showDetails, setShowDetails] = useState(false);
  
  const toneStyle = msg.intent === 'help' ? TONE_STYLES.help : (TONE_STYLES[msg.detectedTone] || TONE_STYLES.calm);
  const isThisMsgSpeaking = isSpeaking && speakingMsgId === msg.id;

  return (
    <div className="flex gap-3 mb-6 w-full group">
      <div className={`w-8 h-8 rounded-full bg-[#16151D] border ${isThisMsgSpeaking ? 'border-[#FF3B30] ring-2 ring-[#FF3B30]/30 animate-pulse' : 'border-[#2A2838]'} flex items-center justify-center flex-shrink-0 mt-1 transition-all shadow-sm`}>
        <Gavel className="w-4 h-4 text-[#FF3B30]" />
      </div>
      
      <div className="flex flex-col gap-1.5 max-w-[92%] md:max-w-[85%]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-stage font-bold text-[#F2EFE9]">fun.ai</span>
          <span className="text-[10px] text-[#9E9AA8] font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          {msg.badgeLabel && (
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#0E0D12] border border-[#2A2838] ${toneStyle.accent}`}>
              {msg.badgeLabel}
            </span>
          )}
        </div>

        <div className={`p-4 rounded-[32px] rounded-tl-sm border text-sm md:text-base leading-relaxed ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text} whitespace-pre-wrap break-words shadow-md`}>
          {msg.text}
        </div>

        {/* Controls: Analytics Toggle & Audio Readout Button */}
        <div className="flex items-center gap-4 mt-0.5 self-start">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs flex items-center gap-1 text-[#9E9AA8] hover:text-[#F2EFE9] transition-colors cursor-pointer font-medium"
          >
            {showDetails ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
            {showDetails ? (t.hideDetails || "Hide Analytics") : (t.showDetails || "Show Analytics")}
          </button>

          {onSpeakMsg && (
            <button
              onClick={() => onSpeakMsg(msg)}
              className={`text-xs flex items-center gap-1 transition-colors cursor-pointer font-mono ${isThisMsgSpeaking ? 'text-[#FF3B30] font-semibold' : 'text-[#9E9AA8] hover:text-[#F2EFE9]'}`}
              title={isThisMsgSpeaking ? "Остановить озвучку" : "Прослушать ответ"}
            >
              {isThisMsgSpeaking ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#FF3B30] animate-pulse" />
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
          <div className="mt-2 bg-[#16151D] border border-[#2A2838] rounded-[32px] p-4 flex flex-col gap-3.5 animate-in slide-in-from-top-2 fade-in duration-200 shadow-lg">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               <GaugeItem label={t.sarcasm || "Sarcasm"} score={msg.gauges.sarcasm} descriptor={msg.gaugeDescriptors?.sarcasm} colorClass="text-[#A55EEA]" />
               <GaugeItem label={t.toxicity || "Toxicity"} score={msg.gauges.toxicity} descriptor={msg.gaugeDescriptors?.toxicity} colorClass="text-[#FF3B30]" />
               <GaugeItem label={t.stuffiness || "Stuffiness"} score={msg.gauges.stuffiness} descriptor={msg.gaugeDescriptors?.stuffiness} colorClass="text-[#00D2D3]" />
               <GaugeItem label={t.overallVibe || "Vibe"} score={msg.gauges.overallVibe} descriptor={msg.gaugeDescriptors?.overallVibe} colorClass="text-[#10AC84]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div className="bg-[#0E0D12] border border-[#2A2838] rounded-2xl p-3">
                 <h4 className="text-[11px] font-mono font-semibold text-[#9E9AA8] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-[#9E9AA8]" />
                    {t.unspokenMotive || "Motive"}
                 </h4>
                 <p className="text-xs text-[#F2EFE9] italic">{msg.unspokenMotive}</p>
              </div>
              
              <div className="bg-[#0E0D12] border border-[#2A2838] rounded-2xl p-3">
                 <h4 className="text-[11px] font-mono font-semibold text-[#9E9AA8] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#FF3B30]" />
                    {t.recommendedReply || "Reply"}
                 </h4>
                 <p className="text-xs text-[#F2EFE9] font-medium">{msg.recommendedReply}</p>
              </div>
            </div>

            {msg.detectedTerms && msg.detectedTerms.length > 0 && (
              <div className="bg-[#0E0D12] border border-[#2A2838] rounded-2xl p-3 mt-0.5">
                 <h4 className="text-[11px] font-mono font-semibold text-[#9E9AA8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#9E9AA8]" />
                    {t.detectedNuances || "Detected"}
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {msg.detectedTerms.map((term, i) => (
                      <div key={i} className="group relative cursor-help">
                        <span className="px-2.5 py-1 rounded-full bg-[#16151D] border border-[#2A2838] text-[#F2EFE9] text-xs font-mono">
                          {term.term}
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-[#16151D] border border-[#2A2838] text-[#F2EFE9] text-xs p-2.5 rounded-2xl z-10 shadow-xl">
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
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16151D] border border-[#2A2838] text-[9px] font-mono text-[#00D2D3]">
              <Mic className="w-3 h-3 text-[#00D2D3]" /> Голос
            </span>
          )}
          <span className="text-[10px] text-[#9E9AA8] font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span className="text-xs font-semibold text-[#9E9AA8]">Вы</span>
        </div>

        <div className="p-4 rounded-[32px] rounded-tr-sm bg-[#2A2838] text-[#F2EFE9] text-sm md:text-base border border-[#3D3A50] leading-relaxed whitespace-pre-wrap break-words shadow-sm">
          
          {/* Render Attachments Grid if present */}
          {attachmentList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachmentList.map((att, idx) => (
                <div key={idx} className="flex flex-col">
                  {att.type === 'image' && (att.thumbnail || att.images?.[0]) && (
                    <img
                      src={att.thumbnail || att.images[0]}
                      alt={att.fileName || 'Attachment'}
                      className="max-h-52 rounded-2xl object-cover border border-[#3D3A50]"
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
                            className="w-full h-16 object-cover rounded-xl border border-[#3D3A50]"
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#FFB800] font-mono bg-[#0E0D12] border border-[#2A2838] p-1.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 text-[#FFB800]" />
                        <span>Анализ сделан по 4 кадрам без звука</span>
                      </div>
                    </div>
                  )}

                  {(att.type === 'text' || att.type === 'pdf') && (
                    <div className="flex items-center gap-2 p-2.5 rounded-full bg-[#0E0D12] border border-[#2A2838] text-xs">
                      <FileText className="w-4 h-4 text-[#00D2D3] flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono font-semibold text-[#F2EFE9] truncate max-w-[180px]">{att.fileName}</span>
                        <span className="text-[9px] text-[#9E9AA8] font-mono uppercase">
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
        <div className="h-full flex flex-col items-center justify-center text-center opacity-80 py-4">
          <div className="w-10 h-10 bg-[#16151D] border border-[#2A2838] rounded-full flex items-center justify-center mb-2.5 text-[#FF3B30] shadow-sm">
            <Gavel className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-stage font-bold text-[#F2EFE9] mb-1">{t.welcomeMessage || "Привет! Чем я могу помочь?"}</h3>
          <p className="text-xs text-[#9E9AA8] max-w-sm">
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
              <div className="w-8 h-8 rounded-full bg-[#16151D] border border-[#2A2838] flex items-center justify-center mt-1">
                <Gavel className="w-4 h-4 text-[#FF3B30]" />
              </div>
              <div className="bg-[#16151D] border border-[#2A2838] rounded-[32px] rounded-tl-sm px-4 py-3 flex items-center gap-1.5 h-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-2" />
        </div>
      )}
    </div>
  );
}
