import React from 'react';
import { X, ShieldAlert, Sparkles, Database, AlertCircle, Info } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function DisclaimerModal({ isOpen, onClose, lang }) {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0d0d14]/90 backdrop-blur-2xl border border-white/[0.1] rounded-[40px] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">{t.aboutModalTitle}</h2>
              <p className="text-xs text-zinc-400 font-mono">{t.disclaimerTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="space-y-3 overflow-y-auto pr-1 scrollbar-thin text-xs leading-relaxed">
          {/* Card 1: 18+ Content Warning */}
          <div className="p-4 rounded-[24px] bg-rose-950/20 border border-rose-500/30 text-rose-200">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-rose-300">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{t.contentWarningTitle}</span>
            </div>
            <p className="text-zinc-300">{t.contentWarningDesc}</p>
          </div>

          {/* Card 2: Entertainment Disclaimer */}
          <div className="p-4 rounded-[24px] bg-indigo-950/20 border border-indigo-500/30 text-indigo-200">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-indigo-300">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span>{t.entertainmentDisclaimerTitle}</span>
            </div>
            <p className="text-zinc-300">{t.entertainmentDisclaimerDesc}</p>
          </div>

          {/* Card 3: Data Privacy */}
          <div className="p-4 rounded-[24px] bg-blue-950/20 border border-blue-500/30 text-blue-200">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-blue-300">
              <Database className="w-4 h-4 flex-shrink-0 text-blue-400" />
              <span>{t.dataPrivacyTitle}</span>
            </div>
            <p className="text-zinc-300">{t.dataPrivacyDesc}</p>
          </div>

          {/* Card 4: AI Accuracy Warning */}
          <div className="p-4 rounded-[24px] bg-amber-950/20 border border-amber-500/30 text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{t.aiAccuracyTitle}</span>
            </div>
            <p className="text-zinc-300">{t.aiAccuracyDesc}</p>
          </div>
        </div>

        {/* Footer button */}
        <div className="mt-5 pt-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold cursor-pointer transition-transform active:scale-95 shadow-md"
          >
            {t.close || "Понятно"}
          </button>
        </div>
      </div>
    </div>
  );
}
