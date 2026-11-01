import React from 'react';
import { Flame, Sparkles, Gavel } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Header({ lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <header className="text-center mb-4 space-y-2">
      {/* Title */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-[#16151D] border border-[#2A2838] flex items-center justify-center text-[#F2EFE9] shadow-sm">
          <Gavel className="w-4 h-4 text-[#FF3B30]" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-stage tracking-tight text-[#F2EFE9]">
          {t.appTitle}
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-[#9E9AA8] text-xs sm:text-sm max-w-md mx-auto font-normal leading-relaxed">
        {t.appSubtitle}
      </p>

      {/* Accent tag */}
      <div className="pt-0.5 flex items-center justify-center gap-2">
        <span className="text-[10px] font-mono text-[#9E9AA8] flex items-center gap-1.5 bg-[#16151D] px-3 py-1 rounded-full border border-[#2A2838]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse"></span>
          {t.matrixActive || "fun.ai Tribunal Engine"}
        </span>
      </div>
    </header>
  );
}
