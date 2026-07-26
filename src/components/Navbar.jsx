import React from 'react';
import { History, Volume2, VolumeX, Globe, Plus, Brain, Swords, Info, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Navbar({ 
  historyCount, 
  onOpenHistory, 
  onOpenMemory,
  onOpenBattle,
  onOpenDisclaimer,
  soundEnabled, 
  onToggleSound, 
  lang, 
  onToggleLang, 
  onNewChat 
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <nav className="w-full flex flex-row items-center justify-between py-2.5 px-4 bg-[#0d0d14]/70 backdrop-blur-xl border border-white/[0.08] rounded-[50px] my-3 gap-2 shadow-lg">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col hidden sm:flex">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">{t.appTitle}</span>
            <span className="text-[9px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400">
              {t.stealthBadge || "v5.0 Engine"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Roast Battle Button */}
        <button
          onClick={onOpenBattle}
          className="px-3.5 py-1.5 rounded-[50px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title={t.roastBattle || "Roast Battle"}
        >
          <Swords className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">{t.roastBattle || "Roast Battle"}</span>
        </button>

        {/* Memory Button */}
        <button
          onClick={onOpenMemory}
          className="p-2 md:px-3.5 md:py-1.5 rounded-[50px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title={t.memoryTitle || "Память fun.ai"}
        >
          <Brain className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">{t.memoryTitle || "Память"}</span>
        </button>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="px-3.5 py-1.5 rounded-[50px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title={t.newChat || "New Chat"}
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">{t.newChat || "Новый чат"}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="px-3 py-1.5 rounded-[50px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition-all text-xs font-mono font-semibold flex items-center gap-1 active:scale-95 cursor-pointer"
          title="Сменить язык / Tilni o'zgartirish / Switch language"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span className={lang === 'RU' ? 'text-white font-bold' : 'text-zinc-500'}>RU</span>
          <span className="text-zinc-600">/</span>
          <span className={lang === 'UZ' ? 'text-white font-bold' : 'text-zinc-500'}>UZ</span>
          <span className="text-zinc-600">/</span>
          <span className={lang === 'EN' ? 'text-white font-bold' : 'text-zinc-500'}>EN</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? "Звуковые эффекты ВКЛ" : "Звуковые эффекты ВЫКЛ"}
          className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
        </button>

        {/* Disclaimer / Info Button */}
        <button
          onClick={onOpenDisclaimer}
          className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
          title={t.disclaimerTitle || "Условия и Дисклеймеры"}
        >
          <Info className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="px-3.5 py-1.5 rounded-[50px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95 group cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
          <span className="hidden md:inline">{t.history}</span>
          {historyCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
