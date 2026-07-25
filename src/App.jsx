import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import HistoryModal from './components/HistoryModal';
import Toast from './components/Toast';
import { analyzeVibeAI, getApiKey } from './services/aiService';
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

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const hasApiKey = !!getApiKey();

  // Load history & language preference from LocalStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('vibe_check_lang');
      if (savedLang) setLang(savedLang);

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
    setTimeout(() => setToastMessage(''), 3000);
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

  const handleSend = async (inputText) => {
    playSound('click');
    
    const userMsg = {
      id: generateId(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Get last 8 messages for context
      const conversationHistory = newMessages.slice(-8);
      
      const result = await analyzeVibeAI(inputText, lang, conversationHistory);
      
      const botMsg = {
        id: generateId(),
        role: 'assistant',
        timestamp: Date.now(),
        text: result.translation || result.humanTranslation || result.verdict, // fallback
        ...result // Spread all other analytics
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
        />

        {/* Chat Input */}
        <div className="pb-4 w-full px-2 md:px-12 max-w-4xl mx-auto">
          <ChatInput 
            lang={lang}
            onSend={handleSend}
            disabled={isTyping}
            hasApiKey={hasApiKey}
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
