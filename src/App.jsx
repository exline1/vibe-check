import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import HistoryModal from './components/HistoryModal';
import Toast from './components/Toast';
import { analyzeVibeAI, getApiKey } from './services/aiService';
import { speakText, stopSpeech } from './services/speechService';
import { TRANSLATIONS } from './data/translations';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

export default function App() {
  const [lang, setLang] = useState('RU');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(generateId());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const hasApiKey = !!getApiKey();

  // Load history, lang & TTS preferences from LocalStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('vibe_check_lang');
      if (savedLang) setLang(savedLang);

      const savedTts = localStorage.getItem('vibe_check_tts');
      if (savedTts !== null) setTtsEnabled(savedTts === 'true');

      const saved = localStorage.getItem('vibe_check_conversations');
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
      localStorage.setItem('vibe_check_lang', nextLang);
    } catch (e) {}
    playSound('click');
  };

  const handleToggleTts = () => {
    const nextTts = !ttsEnabled;
    setTtsEnabled(nextTts);
    if (!nextTts) {
      stopSpeech();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    }
    try {
      localStorage.setItem('vibe_check_tts', String(nextTts));
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
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
        updated = prev.map(c => c.id === currentId ? { ...c, messages: updatedMessages, timestamp: new Date().toLocaleString() } : c);
      } else {
        const newConv = {
          id: currentId,
          timestamp: new Date().toLocaleString(),
          messages: updatedMessages
        };
        updated = [newConv, ...prev].slice(0, 50); // Keep last 50
      }
      
      try {
        localStorage.setItem('vibe_check_conversations', JSON.stringify(updated));
      } catch (e) {}
      
      return updated;
    });
  };

  const handleSend = async (payload) => {
    playSound('click');

    // Interrupt any ongoing speech when user sends a new message
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
      attachment: processedAttachmentsForMsg[0] || null, // legacy fallback
      timestamp: Date.now()
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const conversationHistory = newMessages.slice(-8);
      
      const result = await analyzeVibeAI(inputText, lang, conversationHistory, attachmentsList);
      
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

    } catch (err) {
      console.error("Vibe analysis error:", err);
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
      localStorage.removeItem('vibe_check_conversations');
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
    setMessages(chat.messages || []);
    setActiveConversationId(chat.id);
  };

  return (
    <div className="bg-black text-white h-screen flex flex-col bg-radial-gradient relative overflow-hidden">
      <div className="max-w-[1000px] w-full mx-auto px-2 sm:px-6 flex flex-col h-full relative z-10">
        
        {/* Navigation Bar */}
        <Navbar
          historyCount={conversations.length}
          onOpenHistory={() => {
            playSound('click');
            setIsHistoryOpen(true);
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          ttsEnabled={ttsEnabled}
          onToggleTts={handleToggleTts}
          lang={lang}
          onToggleLang={handleToggleLang}
          onNewChat={handleNewChat}
        />

        {/* Show Header only if chat is empty */}
        {messages.length === 0 && (
          <div className="mt-8 flex flex-col items-center px-2">
            <Header lang={lang} />
          </div>
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

      {/* Floating Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
