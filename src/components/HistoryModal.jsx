import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock, ArrowUpRight, Zap, Flame, Brain, Crown, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { PERSONAS } from '../data/personas';

const ICON_MAP = {
  Flame,
  Brain,
  Crown,
  Sparkles
};

export default function HistoryModal({ isOpen, onClose, history, onSelectHistoryItem, onClearHistory, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl rounded-[40px] bg-[#0d0d14]/90 backdrop-blur-2xl border border-white/[0.1] p-5 md:p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">{t.chatHistory || "fun.ai Chat History"}</h3>
              <span className="text-xs font-mono text-zinc-500">({history.length})</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-thin">
            {history.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Zap className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-zinc-300 text-sm font-medium">{t.noHistory}</p>
                <p className="text-zinc-500 text-xs">{t.noHistorySub}</p>
              </div>
            ) : (
              history.map((chat) => {
                const firstUserMsg = chat.messages.find(m => m.role === 'user');
                const textPreview = firstUserMsg ? firstUserMsg.text : "Empty Chat";
                const personaObj = PERSONAS[chat.personaId] || PERSONAS.troll;
                const IconComponent = ICON_MAP[personaObj.iconName] || Sparkles;
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectHistoryItem(chat);
                      onClose();
                    }}
                    className="p-4 rounded-[24px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${personaObj.bgClass || 'bg-indigo-500/10'} border ${personaObj.borderClass || 'border-indigo-500/20'} flex items-center justify-center`}>
                          <IconComponent className={`w-3.5 h-3.5 ${personaObj.iconColor || 'text-indigo-400'}`} />
                        </div>
                        <span className="text-xs font-semibold text-white group-hover:text-indigo-300">
                          {t[personaObj.nameKey] || 'fun.ai'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {chat.timestamp || ''}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 font-mono italic line-clamp-2 leading-relaxed">
                      "{textPreview}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 text-zinc-500 border-t border-white/[0.05]">
                      <span>{chat.messages.length} {t.messagesCount || "messages"}</span>
                      <span className="text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors">
                        Открыть диалог <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {history.length > 0 && (
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-300 hover:text-white flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.clearHistory}
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors cursor-pointer shadow-md"
              >
                {t.close}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
