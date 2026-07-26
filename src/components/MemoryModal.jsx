import React from 'react';
import { X, Brain, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { getUserMemory, clearUserMemory } from '../services/memoryService';

export default function MemoryModal({ isOpen, onClose, lang, onMemoryCleared }) {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const memoryList = getUserMemory();

  const handleClear = () => {
    clearUserMemory();
    if (onMemoryCleared) onMemoryCleared();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#120E24] border border-[#2D244D] rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-white">{t.memoryTitle || "Память fun.ai"}</h3>
              <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Локальное хранилище браузера
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1C1636] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          {t.memoryDesc || "Факты, которые fun.ai помнит о вас между разными сессиями:"}
        </p>

        {/* Memory Items List */}
        <div className="max-h-60 overflow-y-auto pr-1 mb-6 scrollbar-thin flex flex-col gap-2">
          {memoryList.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#181330] border border-[#2B234A] text-center text-xs text-zinc-500 italic">
              {t.noMemory || "fun.ai пока ничему не научился общайтесь больше!"}
            </div>
          ) : (
            memoryList.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#181330] border border-[#2B234A] text-xs text-purple-200 leading-relaxed flex items-start gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#231B40]">
          {memoryList.length > 0 && (
            <button
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.clearMemoryBtn || "Забыть меня"}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-heading transition-all cursor-pointer ml-auto"
          >
            {t.close || "Понятно"}
          </button>
        </div>

      </div>
    </div>
  );
}
