import React from 'react';
import { History, Volume2, VolumeX, Globe, Plus, Brain, Swords, Info, Gavel } from 'lucide-react';
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
    <nav className="w-full flex flex-row items-center justify-between py-2.5 px-4 bg-[#16151D] border border-[#2A2838] rounded-full my-3 gap-2 shadow-sm">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#0E0D12] border border-[#2A2838] flex items-center justify-center text-[#F2EFE9] font-bold text-xs shadow-sm">
          <Gavel className="w-4 h-4 text-[#FF3B30]" />
        </div>
        <div className="flex flex-col hidden sm:flex">
          <div className="flex items-center gap-2">
            <span className="font-stage font-bold text-sm tracking-tight text-[#F2EFE9]">{t.appTitle}</span>
            <span className="text-[9px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-[#0E0D12] border border-[#2A2838] text-[#9E9AA8]">
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
          className="px-3.5 py-1.5 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] border border-[#2A2838] text-[#F2EFE9] transition-all text-xs font-stage font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title={t.roastBattle || "Roast Battle"}
        >
          <Swords className="w-3.5 h-3.5 text-[#FF3B30]" />
          <span className="hidden md:inline">{t.roastBattle || "Roast Battle"}</span>
        </button>

        {/* Memory Button */}
        <button
          onClick={onOpenMemory}
          className="p-2 md:px-3.5 md:py-1.5 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] border border-[#2A2838] text-[#F2EFE9] transition-all text-xs font-stage font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title={t.memoryTitle || "Память fun.ai"}
        >
          <Brain className="w-3.5 h-3.5 text-[#00D2D3]" />
          <span className="hidden lg:inline">{t.memoryTitle || "Память"}</span>
        </button>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="px-3.5 py-1.5 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] border border-[#2A2838] text-[#F2EFE9] transition-all text-xs font-stage font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title={t.newChat || "New Chat"}
        >
          <Plus className="w-3.5 h-3.5 text-[#9E9AA8]" />
          <span className="hidden sm:inline">{t.newChat || "Новый чат"}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="px-3 py-1.5 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] border border-[#2A2838] text-[#9E9AA8] transition-all text-xs font-mono font-semibold flex items-center gap-1 active:scale-95 cursor-pointer"
          title="Сменить язык / Tilni o'zgartirish / Switch language"
        >
          <Globe className="w-3.5 h-3.5 text-[#9E9AA8]" />
          <span className={lang === 'RU' ? 'text-[#F2EFE9] font-bold' : 'text-[#9E9AA8]'}>RU</span>
          <span className="text-[#2A2838]">/</span>
          <span className={lang === 'UZ' ? 'text-[#F2EFE9] font-bold' : 'text-[#9E9AA8]'}>UZ</span>
          <span className="text-[#2A2838]">/</span>
          <span className={lang === 'EN' ? 'text-[#F2EFE9] font-bold' : 'text-[#9E9AA8]'}>EN</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? "Звуковые эффекты ВКЛ" : "Звуковые эффекты ВЫКЛ"}
          className="p-2 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] border border-[#2A2838] text-[#9E9AA8] hover:text-[#F2EFE9] transition-all text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#FFB800]" /> : <VolumeX className="w-3.5 h-3.5 text-[#9E9AA8]" />}
        </button>

        {/* Disclaimer / Info Button */}
        <button
          onClick={onOpenDisclaimer}
          className="p-2 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] border border-[#2A2838] text-[#9E9AA8] hover:text-[#F2EFE9] transition-all text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
          title={t.disclaimerTitle || "Условия и Дисклеймеры"}
        >
          <Info className="w-3.5 h-3.5 text-[#9E9AA8]" />
        </button>

        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="px-3.5 py-1.5 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] border border-[#2A2838] text-[#F2EFE9] transition-all text-xs font-stage font-semibold flex items-center gap-1.5 active:scale-95 group cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-[#9E9AA8] group-hover:text-[#F2EFE9] transition-colors" />
          <span className="hidden md:inline">{t.history}</span>
          {historyCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#FF3B30] text-[#F2EFE9] font-mono text-[10px] font-bold flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
