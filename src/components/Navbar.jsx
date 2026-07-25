import React from 'react';
import { Zap, History, Volume2, VolumeX, Globe, Plus } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Navbar({ historyCount, onOpenHistory, soundEnabled, onToggleSound, lang, onToggleLang, onNewChat }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  return (
    <nav className="w-full flex flex-row items-center justify-between py-4 px-2 md:px-0 border-b border-[#1F1F1F]/60 mb-4 md:mb-8 gap-2">
      {/* Brand & Badge */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <div className="flex flex-col hidden sm:flex">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-white uppercase">{t.appTitle}</span>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.stealthBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-2">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="px-3 py-2 rounded-2xl bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-emerald-400 hover:text-emerald-300 transition-all text-xs font-mono font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
          title={t.newChat || "New Chat"}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t.newChat || "New Chat"}</span>
        </button>

        {/* Language Switcher Button (RU / UZ / EN) */}
        <button
          onClick={onToggleLang}
          className="px-3 py-2 rounded-2xl bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-zinc-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title="Сменить язык / Tilni o'zgartirish / Switch language"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span className={lang === 'RU' ? 'text-white font-extrabold' : 'text-zinc-500'}>RU</span>
          <span className="text-zinc-600">/</span>
          <span className={lang === 'UZ' ? 'text-white font-extrabold' : 'text-zinc-500'}>UZ</span>
          <span className="text-zinc-600">/</span>
          <span className={lang === 'EN' ? 'text-white font-extrabold' : 'text-zinc-500'}>EN</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? "Выключить звук" : "Включить звук"}
          className="p-2.5 rounded-2xl bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
        </button>

        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="px-3 py-2 md:px-3.5 rounded-2xl bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-zinc-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 md:gap-2 active:scale-95 group cursor-pointer"
        >
          <History className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          <span className="hidden md:inline">{t.history}</span>
          {historyCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-black font-mono text-[10px] font-extrabold flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
