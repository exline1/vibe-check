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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#16151D] border border-[#2A2838] rounded-[40px] max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#0E0D12] border border-[#2A2838] flex items-center justify-center text-[#00D2D3]">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-stage font-bold text-[#F2EFE9]">{t.memoryTitle || "Память fun.ai"}</h3>
              <p className="text-[10px] text-[#9E9AA8] font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#10AC84]" />
                Локальное хранилище браузера
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] text-[#9E9AA8] hover:text-[#F2EFE9] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#9E9AA8] mb-4 leading-relaxed">
          {t.memoryDesc || "Факты, которые fun.ai помнит о вас между разными сессиями:"}
        </p>

        {/* Memory Items List */}
        <div className="max-h-60 overflow-y-auto pr-1 mb-6 scrollbar-thin flex flex-col gap-2">
          {memoryList.length === 0 ? (
            <div className="p-4 rounded-[24px] bg-[#0E0D12] border border-[#2A2838] text-center text-xs text-[#9E9AA8] italic">
              {t.noMemory || "fun.ai пока ничему не научился — общайтесь больше!"}
            </div>
          ) : (
            memoryList.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[24px] bg-[#0E0D12] border border-[#2A2838] text-xs text-[#F2EFE9] leading-relaxed flex items-start gap-2.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00D2D3] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2A2838]">
          {memoryList.length > 0 && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-full bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/30 text-[#FF3B30] text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.clearMemoryBtn || "Забыть меня"}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#F2EFE9] hover:bg-white text-[#0E0D12] text-xs font-stage font-semibold transition-all cursor-pointer ml-auto shadow-md"
          >
            {t.close || "Понятно"}
          </button>
        </div>

      </div>
    </div>
  );
}
