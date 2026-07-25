import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#111111] border border-[#262626] text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
