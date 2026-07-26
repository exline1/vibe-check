import React from 'react';
import { PERSONAS } from '../data/personas';
import { TRANSLATIONS } from '../data/translations';
import { Sparkles, Shield, Flame } from 'lucide-react';

export default function PersonaSelector({ activePersonaId, onSelectPersona, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const personaList = Object.values(PERSONAS);

  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          {t.choosePersona || "Личность Судьи fun.ai"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {personaList.map((p) => {
          const isSelected = activePersonaId === p.id;
          const name = t[p.nameKey] || p.id;
          const desc = t[p.descKey] || '';

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPersona(p.id)}
              className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? `bg-gradient-to-b ${p.color}/20 ${p.borderColor} shadow-lg ring-1 ring-purple-500/50`
                  : 'bg-[#120E22]/60 border-[#251E3D] hover:border-zinc-600 hover:bg-[#18132E]'
              }`}
            >
              {/* Active Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 animate-ping"></div>
              )}

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">{p.avatar}</span>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-bold font-heading truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    {name}
                  </span>
                  <span className="text-[9px] font-mono text-purple-300/70 uppercase">
                    {p.badgeEmoji} {p.id}
                  </span>
                </div>
              </div>

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
