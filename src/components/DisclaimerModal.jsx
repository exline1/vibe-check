import React from 'react';
import { X, ShieldAlert, Sparkles, Database, AlertCircle, Info, Gavel } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function DisclaimerModal({ isOpen, onClose, lang }) {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#16151D] border border-[#2A2838] rounded-[40px] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2838] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0E0D12] border border-[#2A2838] flex items-center justify-center text-[#F2EFE9]">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-stage font-bold text-[#F2EFE9] tracking-wide">{t.aboutModalTitle}</h2>
              <p className="text-xs text-[#9E9AA8] font-mono">{t.disclaimerTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] text-[#9E9AA8] hover:text-[#F2EFE9] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="space-y-3 overflow-y-auto pr-1 scrollbar-thin text-xs leading-relaxed">
          {/* Card 1: 18+ Content Warning */}
          <div className="p-4 rounded-[24px] bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#F2EFE9]">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-[#FF3B30]">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[#FF3B30]" />
              <span>{t.contentWarningTitle}</span>
            </div>
            <p className="text-[#9E9AA8]">{t.contentWarningDesc}</p>
          </div>

          {/* Card 2: Entertainment Disclaimer */}
          <div className="p-4 rounded-[24px] bg-[#00D2D3]/10 border border-[#00D2D3]/30 text-[#F2EFE9]">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-[#00D2D3]">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-[#00D2D3]" />
              <span>{t.entertainmentDisclaimerTitle}</span>
            </div>
            <p className="text-[#9E9AA8]">{t.entertainmentDisclaimerDesc}</p>
          </div>

          {/* Card 3: Data Privacy */}
          <div className="p-4 rounded-[24px] bg-[#A55EEA]/10 border border-[#A55EEA]/30 text-[#F2EFE9]">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-[#A55EEA]">
              <Database className="w-4 h-4 flex-shrink-0 text-[#A55EEA]" />
              <span>{t.dataPrivacyTitle}</span>
            </div>
            <p className="text-[#9E9AA8]">{t.dataPrivacyDesc}</p>
          </div>

          {/* Card 4: AI Accuracy Warning */}
          <div className="p-4 rounded-[24px] bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#F2EFE9]">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-[#FFB800]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#FFB800]" />
              <span>{t.aiAccuracyTitle}</span>
            </div>
            <p className="text-[#9E9AA8]">{t.aiAccuracyDesc}</p>
          </div>
        </div>

        {/* Footer button */}
        <div className="mt-5 pt-3 border-t border-[#2A2838] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#F2EFE9] hover:bg-white text-[#0E0D12] text-xs font-stage font-semibold cursor-pointer transition-transform active:scale-95 shadow-md"
          >
            {t.close || "Понятно"}
          </button>
        </div>
      </div>
    </div>
  );
}
