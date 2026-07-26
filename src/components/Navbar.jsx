import React from 'react';
import { Zap, History, Volume2, VolumeX, Globe, Plus, Brain, Swords } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Navbar({ 
  historyCount, 
  onOpenHistory, 
  onOpenMemory,
  onOpenBattle,
  soundEnabled, 
  onToggleSound, 
  lang, 
  onToggleLang, 
  onNewChat 
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <nav className="w-full flex flex-row items-center justify-between py-4 px-2 md:px-0 border-b border-[#231A3D]/60 mb-4 md:mb-6 gap-2">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 p-0.5 shadow-lg shadow-purple-900/30">
          <div className="w-full h-full bg-[#0B0813] rounded-[14px] flex items-center justify-center">
            <span className="font-heading font-extrabold text-sm text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">fun</span>
          </div>
        </div>
        <div className="flex flex-col hidden sm:flex">
          <div className="flex items-center gap-2">
            <span className="font-extrabold font-heading text-base tracking-tight text-white">{t.appTitle}</span>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              {t.stealthBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Roast Battle Button */}
        <button
          onClick={onOpenBattle}
          className="px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all text-xs font-heading font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md shadow-purple-950/50"
          title={t.roastBattle || "Roast Battle"}
        >
          <Swords className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t.roastBattle || "Roast Battle"}</span>
        </button>

        {/* Memory Button */}
        <button
          onClick={onOpenMemory}
          className="p-2 md:px-3 md:py-2 rounded-2xl bg-[#140F29] hover:bg-[#1A1436] border border-[#271E47] text-purple-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title={t.memoryTitle || "Память fun.ai"}
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">{t.memoryTitle || "Память"}</span>
        </button>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="px-3 py-2 rounded-2xl bg-[#140F29] hover:bg-[#1A1436] border border-[#271E47] text-emerald-400 hover:text-emerald-300 transition-all text-xs font-mono font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title={t.newChat || "New Chat"}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.newChat || "Новый чат"}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="px-2.5 py-2 rounded-2xl bg-[#140F29] hover:bg-[#1A1436] border border-[#271E47] text-zinc-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
          title="Сменить язык / Tilni o'zgartirish / Switch language"
        >
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span className={lang === 'RU' ? 'text-white font-extrabold' : 'text-zinc-500'}>RU</span>
          <span className="text-zinc-600">/</span>
          <span className={lang === 'UZ' ? 'text-white font-extrabold' : 'text-zinc-500'}>UZ</span>
          <span className="text-zinc-600">/</span>
          <span className={lang === 'EN' ? 'text-white font-extrabold' : 'text-zinc-500'}>EN</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? "Звуковые эффекты ВКЛ" : "Звуковые эффекты ВЫКЛ"}
          className="p-2.5 rounded-2xl bg-[#140F29] hover:bg-[#1A1436] border border-[#271E47] text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-300" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
        </button>

        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="px-3 py-2 md:px-3.5 rounded-2xl bg-[#140F29] hover:bg-[#1A1436] border border-[#271E47] text-zinc-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 active:scale-95 group cursor-pointer"
        >
          <History className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          <span className="hidden md:inline">{t.history}</span>
          {historyCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-purple-500 text-white font-mono text-[10px] font-extrabold flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
