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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
          className="relative w-full max-w-xl rounded-[40px] bg-[#16151D] border border-[#2A2838] p-5 md:p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#2A2838]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0E0D12] border border-[#2A2838] flex items-center justify-center text-[#F2EFE9]">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-stage font-bold text-[#F2EFE9]">{t.chatHistory || "fun.ai Chat History"}</h3>
              <span className="text-xs font-mono text-[#9E9AA8]">({history.length})</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#0E0D12] hover:bg-[#1E1C27] text-[#9E9AA8] hover:text-[#F2EFE9] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-thin">
            {history.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Zap className="w-8 h-8 text-[#9E9AA8] mx-auto" />
                <p className="text-[#F2EFE9] text-sm font-medium">{t.noHistory}</p>
                <p className="text-[#9E9AA8] text-xs">{t.noHistorySub}</p>
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
                    className="p-4 rounded-[24px] bg-[#0E0D12] hover:bg-[#1E1C27] border border-[#2A2838] hover:border-[#3D3A50] transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#16151D] border border-[#2A2838] flex items-center justify-center">
                          <IconComponent className="w-3.5 h-3.5" style={{ color: personaObj.colorHex }} />
                        </div>
                        <span className="text-xs font-stage font-semibold text-[#F2EFE9]">
                          {t[personaObj.nameKey] || 'fun.ai'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#9E9AA8]">
                        {chat.timestamp || ''}
                      </span>
                    </div>

                    <p className="text-xs text-[#9E9AA8] font-mono italic line-clamp-2 leading-relaxed">
                      "{textPreview}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 text-[#9E9AA8] border-t border-[#2A2838]">
                      <span>{chat.messages.length} {t.messagesCount || "messages"}</span>
                      <span className="text-[#F2EFE9] flex items-center gap-1 font-semibold transition-colors">
                        Открыть диалог <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {history.length > 0 && (
            <div className="pt-4 border-t border-[#2A2838] flex items-center justify-between">
              <button
                onClick={onClearHistory}
                className="text-xs text-[#FF3B30] hover:text-[#F2EFE9] flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.clearHistory}
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#F2EFE9] text-[#0E0D12] hover:bg-white text-xs font-stage font-semibold transition-colors cursor-pointer shadow-md"
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
