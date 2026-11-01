import React from 'react';
import { PERSONAS } from '../data/personas';
import { TRANSLATIONS } from '../data/translations';
import { Flame, Brain, Crown, Sparkles, Gavel } from 'lucide-react';

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
        <span className="text-[11px] font-mono font-bold text-[#9E9AA8] uppercase tracking-widest flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-[#FF3B30]" />
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
              className={`flex flex-col text-left p-4 rounded-[28px] border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? `bg-[#1E1C27] border-[${p.colorHex}] shadow-md ring-2 ring-[${p.colorHex}]/40`
                  : 'bg-[#16151D] border-[#2A2838] hover:border-[#3D3A50] hover:bg-[#1A1823]'
              }`}
              style={{
                borderColor: isSelected ? p.colorHex : undefined
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border`}
                  style={{
                    backgroundColor: `${p.colorHex}15`,
                    borderColor: `${p.colorHex}40`
                  }}
                >
                  <IconComponent className="w-4 h-4" style={{ color: p.colorHex }} />
                </div>
                <span 
                  className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase"
                  style={{
                    backgroundColor: isSelected ? `${p.colorHex}25` : '#0E0D12',
                    borderColor: isSelected ? `${p.colorHex}50` : '#2A2838',
                    color: isSelected ? p.colorHex : '#9E9AA8'
                  }}
                >
                  {p.badgeText || p.id}
                </span>
              </div>

              <span className={`text-xs font-stage font-bold mb-1 ${isSelected ? 'text-[#F2EFE9]' : 'text-[#D4D0C7]'}`}>
                {name}
              </span>

              <p className="text-[10px] text-[#9E9AA8] leading-relaxed line-clamp-2">
                {desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
