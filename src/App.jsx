import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Header from './components/Header';
import PresetPills from './components/PresetPills';
import AnalyzerEngine from './components/AnalyzerEngine';
import VibeReport from './components/VibeReport';
import HistoryModal from './components/HistoryModal';
import Toast from './components/Toast';
import { analyzeVibeAI } from './services/aiService';
import { TRANSLATIONS } from './data/translations';

export default function App() {
  const [lang, setLang] = useState('RU');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const reportRef = useRef(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  // Load history & language preference from LocalStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('vibe_check_lang');
      if (savedLang) setLang(savedLang);

      const saved = localStorage.getItem('vibe_check_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load history/lang', e);
    }
  }, []);

  const handleToggleLang = () => {
    // Cycle: RU -> UZ -> EN -> RU
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

  // Web Audio API Sound Synthesizer
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

  const handleSelectPreset = (preset) => {
    playSound('click');
    setText(preset.text);
    handleAnalyze(preset.text);
  };

  const handleAnalyze = async (inputText) => {
    playSound('click');
    setIsLoading(true);
    setReport(null);

    try {
      // Async AI Call (Perplexity AI API / Heuristic Fallback)
      const result = await analyzeVibeAI(inputText, lang);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const historyItem = { ...result, timestamp };

      setReport(result);
      setIsLoading(false);
      playSound('success');

      // Update LocalStorage History
      setHistory(prev => {
        const filtered = prev.filter(item => item.rawInput !== result.rawInput);
        const updated = [historyItem, ...filtered].slice(0, 20);
        try {
          localStorage.setItem('vibe_check_history', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Scroll smoothly to report
      setTimeout(() => {
        if (reportRef.current) {
          reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error("Vibe analysis error:", err);
      setIsLoading(false);
      showToast(lang === 'RU' ? 'Ошибка анализа' : lang === 'UZ' ? 'Tahlil xatosi' : 'Analysis error');
    }
  };

  const handleReset = () => {
    playSound('click');
    setReport(null);
    setText('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('vibe_check_history');
    } catch (e) {}
    showToast(lang === 'RU' ? 'История очищена.' : lang === 'UZ' ? 'Tarix tozalandi.' : 'History cleared.');
  };

  return (
    <div className="bg-black text-white min-h-screen bg-radial-gradient relative overflow-x-hidden">
      {/* Centered max-width wrapper (~800px) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[800px] mx-auto px-4 sm:px-6 py-4 pb-24 flex flex-col min-h-screen"
      >
        {/* Navigation Bar */}
        <Navbar
          historyCount={history.length}
          onOpenHistory={() => {
            playSound('click');
            setIsHistoryOpen(true);
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          lang={lang}
          onToggleLang={handleToggleLang}
        />

        {/* Header Section */}
        <Header lang={lang} />

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {/* Test Presets Toolbar */}
          <PresetPills
            onSelectPreset={handleSelectPreset}
            disabled={isLoading}
            lang={lang}
          />

          {/* Analyzer Engine Textarea & Button */}
          <AnalyzerEngine
            text={text}
            setText={setText}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            lang={lang}
          />

          {/* Results Section (Vibe Report) */}
          <div ref={reportRef}>
            <AnimatePresence mode="wait">
              {report && (
                <VibeReport
                  key={report.rawInput}
                  report={report}
                  onReset={handleReset}
                  onCopySuccess={showToast}
                  lang={lang}
                />
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-[#1F1F1F]/60 text-center space-y-2">
          <p className="text-xs text-zinc-500 font-mono">
            {t.footerText}
          </p>
          <p className="text-[11px] text-zinc-600">
            {t.footerSubtext}
          </p>
        </footer>
      </motion.div>

      {/* History Drawer Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          setReport(item);
          setText(item.rawInput);
        }}
        onClearHistory={handleClearHistory}
        lang={lang}
      />

      {/* Floating Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
