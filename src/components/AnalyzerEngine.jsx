import React, { useState } from 'react';
import { ArrowRight, Loader2, X, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../data/translations';
import { getApiKey } from '../services/aiService';

export default function AnalyzerEngine({ text, setText, onAnalyze, isLoading, lang }) {
  const [error, setError] = useState('');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const hasApiKey = Boolean(getApiKey());

  const handleClear = () => {
    setText('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError(t.emptyError);
      return;
    }
    // Validation: prevent spending tokens or making API calls on short texts (< 2 chars)
    if (text.trim().length < 2) {
      setError(t.shortError);
      return;
    }
    setError('');
    onAnalyze(text);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (error && e.target.value.trim().length >= 2) {
      setError('');
    }
  };

  const isInputEmpty = !text.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full mb-10">
      <div className="relative group rounded-[28px] bg-[#0A0A0A] border border-[#1F1F1F] focus-within:border-[#404040] focus-within:shadow-[0_0_30px_-5px_rgba(255,255,255,0.07)] transition-all duration-300 overflow-hidden">
        {/* Top bar inside container */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[#151515]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-600 group-focus-within:bg-white transition-colors"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t.inputMessage}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* API Key Status Pill */}
            <span
              title={hasApiKey ? "Groq API Key active in .env" : "Using Local Heuristic Engine. Add VITE_GROQ_API_KEY in .env for Groq Llama-3 AI"}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                hasApiKey
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              <KeyRound className="w-3 h-3" />
              <span>{hasApiKey ? 'GROQ AI ACTIVE' : 'LOCAL ENGINE'}</span>
            </span>

            {text && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1 bg-[#111111] px-2 py-0.5 rounded-lg border border-[#1F1F1F] cursor-pointer"
              >
                <X className="w-3 h-3" />
                {t.clear}
              </button>
            )}
            <span className="text-xs font-mono text-zinc-600">
              {text.length} {t.chars}
            </span>
          </div>
        </div>

        {/* Textarea Input */}
        <textarea
          value={text}
          onChange={handleChange}
          disabled={isLoading}
          rows={5}
          placeholder={t.inputPlaceholder}
          className="w-full bg-transparent px-5 py-4 text-white text-base md:text-lg placeholder:text-zinc-600 focus:outline-none resize-none font-sans leading-relaxed disabled:opacity-50"
        />

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#151515] bg-[#080808]">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t.multiScan}</span>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isInputEmpty || isLoading}
            className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center gap-2.5 shadow-lg active:scale-[0.96] ${
              isInputEmpty || isLoading
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-white text-black hover:bg-zinc-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] border border-white cursor-pointer'
            } ${isLoading ? 'cursor-wait' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>{t.deconstructing}</span>
              </>
            ) : (
              <>
                <span>{t.analyzeBtn}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 px-4 py-2.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
