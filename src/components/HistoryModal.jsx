import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock, ArrowUpRight, Zap, MessageSquare } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { PERSONAS } from '../data/personas';

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
          className="relative w-full max-w-xl rounded-[32px] bg-[#120E24] border border-[#2D244D] p-4 md:p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#231B40]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold font-heading text-white">{t.chatHistory || "fun.ai Chat History"}</h3>
              <span className="text-xs font-mono text-zinc-500">({history.length})</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1D173B] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-thin">
            {history.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Zap className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-zinc-400 text-sm">{t.noHistory}</p>
                <p className="text-zinc-600 text-xs">{t.noHistorySub}</p>
              </div>
            ) : (
              history.map((chat) => {
                const firstUserMsg = chat.messages.find(m => m.role === 'user');
                const textPreview = firstUserMsg ? firstUserMsg.text : "Empty Chat";
                const personaObj = PERSONAS[chat.personaId] || PERSONAS.troll;
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectHistoryItem(chat);
                      onClose();
                    }}
                    className="p-4 rounded-2xl bg-[#181330] hover:bg-[#1E183D] border border-[#2B234A] hover:border-purple-500/50 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{personaObj.avatar}</span>
                        <span className="text-xs font-bold font-heading text-white group-hover:text-purple-300">
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

                    <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500 border-t border-[#251E3E]">
                      <span>{chat.messages.length} {t.messagesCount || "messages"}</span>
                      <span className="text-purple-400 group-hover:text-purple-300 flex items-center gap-1 font-semibold transition-colors">
                        Load Chat <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {history.length > 0 && (
            <div className="pt-4 border-t border-[#231B40] flex items-center justify-between">
              <button
                onClick={onClearHistory}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.clearHistory}
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-heading transition-colors cursor-pointer"
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
