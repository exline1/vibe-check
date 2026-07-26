import React from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Header({ lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <header className="text-center mb-6 space-y-3">
      {/* Title with Gradient */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent pb-1">
        {t.appTitle}
      </h1>

      {/* Subtitle */}
      <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-normal leading-relaxed">
        {t.appSubtitle}
      </p>

      {/* Accent tag */}
      <div className="pt-1 flex items-center justify-center gap-2">
        <span className="text-[11px] font-medium text-purple-300/80 flex items-center gap-1.5 bg-[#140F29]/80 px-3.5 py-1 rounded-full border border-purple-900/40 shadow-sm backdrop-blur-md">
          <Flame className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          {t.matrixActive}
        </span>
      </div>
    </header>
  );
}
