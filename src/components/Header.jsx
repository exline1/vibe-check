import React from 'react';
import { Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Header({ lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <header className="text-center mb-4 space-y-2">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent pb-0.5">
        {t.appTitle}
      </h1>

      {/* Subtitle */}
      <p className="text-zinc-400 text-xs md:text-sm max-w-md mx-auto font-normal leading-relaxed">
        {t.appSubtitle}
      </p>

      {/* Accent tag */}
      <div className="pt-0.5 flex items-center justify-center gap-2">
        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.08] shadow-sm">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          {t.matrixActive || "fun.ai Active"}
        </span>
      </div>
    </header>
  );
}
