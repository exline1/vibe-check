import React from 'react';
import { PERSONAS } from '../data/personas';
import { TRANSLATIONS } from '../data/translations';
import { Flame, Brain, Crown, Sparkles } from 'lucide-react';

const ICON_MAP = {
  Flame,
  Brain,
  Crown,
  Sparkles
};

export default function PersonaSelector({ activePersonaId, onSelectPersona, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const personaList = Object.values(PERSONAS);

  return (
    <div className="w-full max-w-4xl mx-auto my-2.5 px-2">
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {t.choosePersona || "Выбор характера ИИ"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {personaList.map((p) => {
          const isSelected = activePersonaId === p.id;
          const name = t[p.nameKey] || p.id;
          const desc = t[p.descKey] || '';
          const IconComponent = ICON_MAP[p.iconName] || Sparkles;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPersona(p.id)}
              className={`flex flex-col text-left p-4 rounded-[32px] border backdrop-blur-xl transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? `bg-[#12121f]/90 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30`
                  : 'bg-[#0d0d14]/60 border-white/[0.07] hover:border-white/[0.15] hover:bg-[#13131f]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-full ${p.bgClass} border ${p.borderClass} flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 ${p.iconColor}`} />
                </div>
                <span className={`text-[9px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${isSelected ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-white/[0.04] border-white/[0.08] text-zinc-500'}`}>
                  {p.badgeText || p.id}
                </span>
              </div>

              <span className={`text-xs font-semibold mb-1 ${isSelected ? 'text-white font-bold' : 'text-zinc-300'}`}>
                {name}
              </span>

              <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2">
                {desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
