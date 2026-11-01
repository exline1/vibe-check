import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import HistoryModal from './components/HistoryModal';
import PersonaSelector from './components/PersonaSelector';
import MemoryModal from './components/MemoryModal';
import RoastBattleModal from './components/RoastBattleModal';
import DisclaimerModal from './components/DisclaimerModal';
import Toast from './components/Toast';
import { UploadCloud, Zap } from 'lucide-react';
import { analyzeVibeAI, getApiKey } from './services/aiService';
import { speakText, stopSpeech } from './services/speechService';
import { summarizeAndStoreMemory } from './services/memoryService';
import { TRANSLATIONS } from './data/translations';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

export default function App() {
  const [lang, setLang] = useState('RU');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(generateId());
  
  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isBattleOpen, setIsBattleOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // Active persona selection ('troll', 'therapist', 'flexer', 'philosopher')
  const [activePersonaId, setActivePersonaId] = useState('troll');

  const [toastMessage, setToastMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  // File drag & drop state
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [incomingFiles, setIncomingFiles] = useState(null);
  const dragCounterRef = useRef(0);

  const isAnyModalOpen = isHistoryOpen || isMemoryOpen || isBattleOpen || isDisclaimerOpen;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const apiKey = getApiKey();
  const hasApiKey = !!apiKey;

  // Global window drag and drop listener
  useEffect(() => {
    const handleDragEnter = (e) => {
      if (isAnyModalOpen) return;
      if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) {
        e.preventDefault();
        dragCounterRef.current += 1;
        setIsDraggingFiles(true);
      }
    };

    const handleDragOver = (e) => {
      if (isAnyModalOpen) return;
      if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDraggingFiles(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDraggingFiles(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingFiles(false);
      if (isAnyModalOpen) return;

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setIncomingFiles(Array.from(e.dataTransfer.files));
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [isAnyModalOpen]);

  // Load history, lang & persona preferences from LocalStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('fun_ai_lang');
      if (savedLang) setLang(savedLang);

      const savedPersona = localStorage.getItem('fun_ai_persona');
      if (savedPersona) setActivePersonaId(savedPersona);

      const saved = localStorage.getItem('fun_ai_conversations');
      if (saved) {
        setConversations(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history/lang', e);
    }
  }, []);

  const handleToggleLang = () => {
    let nextLang = 'RU';
    if (lang === 'RU') nextLang = 'UZ';
    else if (lang === 'UZ') nextLang = 'EN';
    else nextLang = 'RU';

    setLang(nextLang);
    try {
      localStorage.setItem('fun_ai_lang', nextLang);
    } catch (e) {}
    playSound('click');
  };

  const handleSelectPersona = (personaId) => {
    setActivePersonaId(personaId);
    try {
      localStorage.setItem('fun_ai_persona', personaId);
    } catch (e) {}
    playSound('click');
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSpeakBotMsg = (botMsg) => {
    if (isSpeaking && speakingMsgId === botMsg.id) {
      stopSpeech();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    const botText = botMsg.text || botMsg.humanTranslation || botMsg.translation || '';
    stopSpeech();

    speakText(botText, lang, botMsg.detectedTone, {
      onStart: () => {
        setIsSpeaking(true);
        setSpeakingMsgId(botMsg.id);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      },
      onError: (err) => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
        console.warn("TTS Error:", err);
      }
    });
  };

  const saveConversation = (updatedMessages, currentId) => {
    setConversations(prev => {
      const existing = prev.find(c => c.id === currentId);
      let updated;
      
      if (existing) {
        updated = prev.map(c => c.id === currentId ? { ...c, messages: updatedMessages, personaId: activePersonaId, timestamp: new Date().toLocaleString() } : c);
      } else {
        const newConv = {
          id: currentId,
          personaId: activePersonaId,
          timestamp: new Date().toLocaleString(),
          messages: updatedMessages
        };
        updated = [newConv, ...prev].slice(0, 50);
      }
      
      try {
        localStorage.setItem('fun_ai_conversations', JSON.stringify(updated));
      } catch (e) {}
      
      return updated;
    });
  };

  const handleSend = async (payload) => {
    playSound('click');

    stopSpeech();
    setIsSpeaking(false);
    setSpeakingMsgId(null);

    const inputText = typeof payload === 'string' ? payload : (payload.text || '');
    const isVoice = typeof payload === 'object' ? Boolean(payload.isVoice) : false;

    let attachmentsList = [];
    if (typeof payload === 'object') {
      if (Array.isArray(payload.attachments)) {
        attachmentsList = payload.attachments;
      } else if (payload.attachment) {
        attachmentsList = [payload.attachment];
      }
    }

    const processedAttachmentsForMsg = attachmentsList.map(att => ({
      type: att.type,
      fileName: att.fileName,
      thumbnail: att.thumbnail,
      images: att.images ? att.images.slice(0, 4) : null,
      truncated: att.truncated,
      warning: att.warning
    }));

    const userMsg = {
      id: generateId(),
      role: 'user',
      text: inputText,
      isVoice,
      attachments: processedAttachmentsForMsg.length > 0 ? processedAttachmentsForMsg : null,
      attachment: processedAttachmentsForMsg[0] || null,
      timestamp: Date.now()
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const conversationHistory = newMessages.slice(-8);
      
      const result = await analyzeVibeAI(inputText, lang, conversationHistory, attachmentsList, activePersonaId);
      
      const botMsg = {
        id: generateId(),
        role: 'assistant',
        timestamp: Date.now(),
        text: result.translation || result.humanTranslation || result.verdict,
        ...result
      };

      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);
      setIsTyping(false);
      playSound('success');

      saveConversation(finalMessages, activeConversationId);

      // Async trigger long-term memory summarization in background
      summarizeAndStoreMemory(finalMessages);

    } catch (err) {
      console.error("fun.ai analysis error:", err);
      setIsTyping(false);
      showToast(lang === 'RU' ? 'Ошибка анализа' : lang === 'UZ' ? 'Tahlil xatosi' : 'Analysis error');
    }
  };

  const handleNewChat = () => {
    playSound('click');
    stopSpeech();
    setIsSpeaking(false);
    setSpeakingMsgId(null);
    setMessages([]);
    setActiveConversationId(generateId());
  };

  const handleClearHistory = () => {
    setConversations([]);
    try {
      localStorage.removeItem('fun_ai_conversations');
    } catch (e) {}
    showToast(lang === 'RU' ? 'История диалогов очищена.' : lang === 'UZ' ? 'Suhbatlar tarixi tozalandi.' : 'Chat history cleared.');
    if (messages.length > 0) {
      handleNewChat();
    }
  };

  const handleSelectHistoryItem = (chat) => {
    stopSpeech();
    setIsSpeaking(false);
    setSpeakingMsgId(null);
    if (chat.personaId) setActivePersonaId(chat.personaId);
    setMessages(chat.messages || []);
    setActiveConversationId(chat.id);
  };

  return (
    <div className="bg-stage-arena text-[#F2EFE9] h-screen flex flex-col relative overflow-hidden font-sans">
      <div className="max-w-[1050px] w-full mx-auto px-2 sm:px-6 flex flex-col h-full relative z-10">
        
        {/* Navigation Bar */}
        <Navbar
          historyCount={conversations.length}
          onOpenHistory={() => {
            playSound('click');
            setIsHistoryOpen(true);
          }}
          onOpenMemory={() => {
            playSound('click');
            setIsMemoryOpen(true);
          }}
          onOpenBattle={() => {
            playSound('click');
            setIsBattleOpen(true);
          }}
          onOpenDisclaimer={() => {
            playSound('click');
            setIsDisclaimerOpen(true);
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          lang={lang}
          onToggleLang={handleToggleLang}
          onNewChat={handleNewChat}
        />

        {/* Show Header & Persona Selector when chat is starting */}
        {messages.length === 0 && (
          <div className="mt-2 flex flex-col items-center px-2">
            <Header lang={lang} />
          </div>
        )}

        {/* Persona Selector Bar */}
        {messages.length <= 2 && (
          <PersonaSelector
            activePersonaId={activePersonaId}
            onSelectPersona={handleSelectPersona}
            lang={lang}
          />
        )}

        {/* Chat Messages */}
        <ChatMessages 
          messages={messages} 
          isTyping={isTyping} 
          lang={lang} 
          onSpeakMsg={handleSpeakBotMsg}
          isSpeaking={isSpeaking}
          speakingMsgId={speakingMsgId}
        />

        {/* Chat Input */}
        <div className="pb-4 w-full px-2 md:px-12 max-w-4xl mx-auto">
          <ChatInput 
            lang={lang}
            onSend={handleSend}
            disabled={isTyping}
            hasApiKey={hasApiKey}
            onError={showToast}
            incomingFiles={incomingFiles}
            onClearIncomingFiles={() => setIncomingFiles(null)}
          />
        </div>

      </div>

      {/* History Drawer Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={conversations}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        lang={lang}
      />

      {/* Long-Term Memory Modal */}
      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        lang={lang}
        onMemoryCleared={() => showToast(t.memoryCleared || "Память очищена.")}
      />

      {/* Realtime Roast Battle Modal */}
      <RoastBattleModal
        isOpen={isBattleOpen}
        onClose={() => setIsBattleOpen(false)}
        lang={lang}
        activePersonaId={activePersonaId}
      />

      {/* Disclaimers & Safety Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        lang={lang}
      />

      {/* Floating Notification Toast */}
      <Toast message={toastMessage} />

      {/* Full-Screen Drag & Drop Overlay */}
      {isDraggingFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
            if (dragCounterRef.current === 0) {
              setIsDraggingFiles(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            dragCounterRef.current = 0;
            setIsDraggingFiles(false);
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              setIncomingFiles(Array.from(e.dataTransfer.files));
            }
          }}
          className="fixed inset-0 z-50 bg-[#0E0D12]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md p-8 md:p-12 rounded-[40px] bg-[#16151D]/95 border-2 border-dashed border-[#00D2D3] flex flex-col items-center text-center shadow-2xl ring-4 ring-[#00D2D3]/20 pointer-events-none transform scale-100 transition-all">
            <div className="w-20 h-20 rounded-full bg-[#00D2D3]/15 border border-[#00D2D3]/40 flex items-center justify-center mb-5 text-[#00D2D3] animate-bounce">
              <UploadCloud className="w-10 h-10" />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-[#F2EFE9] mb-2 font-stage">
              {t.dropFilesHere || "Перетащите файлы сюда"}
            </h3>

            <p className="text-xs md:text-sm text-[#9E9AA8] max-w-xs mb-4">
              {t.dropFilesSub || "Фото, видео, PDF и текст (до 4 файлов) прикрепятся мгновенно"}
            </p>

            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0E0D12] border border-[#2A2838] text-[11px] font-mono text-[#00D2D3]">
              <Zap className="w-3.5 h-3.5 fill-[#00D2D3]" />
              <span>{t.fastOptimizationBadge || "Мгновенная оптимизация"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
