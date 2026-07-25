import React from 'react';
import { Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Header({ lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <header className="text-center mb-10 space-y-3">
      {/* Title with Gradient */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent pb-1">
        {t.appTitle}
      </h1>

      {/* Subtitle */}
      <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-normal leading-relaxed">
        {t.appSubtitle}
      </p>

      {/* Accent tag */}
      <div className="pt-1 flex items-center justify-center gap-2">
        <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1.5 bg-[#0A0A0A] px-3 py-1 rounded-full border border-[#1F1F1F]">
          <Sparkles className="w-3 h-3 text-zinc-400" />
          {t.matrixActive}
        </span>
      </div>
    </header>
  );
}
