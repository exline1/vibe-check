import React from 'react';
import { PRESET_EXAMPLES_RU, PRESET_EXAMPLES_UZ, PRESET_EXAMPLES_EN } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { Sparkles } from 'lucide-react';

export default function PresetPills({ onSelectPreset, disabled, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const presets = lang === 'UZ' ? PRESET_EXAMPLES_UZ : lang === 'RU' ? PRESET_EXAMPLES_RU : PRESET_EXAMPLES_EN;

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-zinc-400" />
          {t.testPresets}
        </span>
        <span className="text-[11px] text-zinc-600">{t.selectPersona}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            disabled={disabled}
            className="px-3.5 py-2 rounded-2xl bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] hover:border-[#333333] text-zinc-300 hover:text-white transition-all text-xs font-medium flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            <span className="text-zinc-500 group-hover:text-zinc-300 font-mono text-[10px] uppercase">
              {preset.category}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
