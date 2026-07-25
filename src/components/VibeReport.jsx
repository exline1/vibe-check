import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, Share2, CornerDownRight, MessageSquare, Flame, AlertTriangle, Shield, RotateCcw, Cpu, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TRANSLATIONS } from '../data/translations';

/** Maps detectedTone → subtle visual accent token */
const TONE_STYLES = {
  calm:      { border: 'border-zinc-700/60',    badge: 'text-zinc-300',    glow: 'bg-zinc-400/[0.03]'  },
  cocky:     { border: 'border-amber-600/40',   badge: 'text-amber-300',   glow: 'bg-amber-400/[0.04]' },
  vulnerable:{ border: 'border-blue-600/40',    badge: 'text-blue-300',    glow: 'bg-blue-400/[0.04]'  },
  toxic:     { border: 'border-red-700/40',      badge: 'text-red-300',     glow: 'bg-red-500/[0.04]'   },
};

export default function VibeReport({ report, onReset, onCopySuccess, lang }) {
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  if (!report) return null;

  const toneStyle = TONE_STYLES[report.detectedTone] || TONE_STYLES.calm;

  const handleCopyReport = () => {
    const reportText = `ОТЧЕТ ВАЙБ ЧЕКА / VIBE CHECK REPORT
Вердикт / Verdict: ${report.verdict} (${report.badgeEmoji})
Модель / Model: ${report.modelUsed || 'AI Engine'}
Точность / Confidence: ${report.confidence}

ИЗМЕРИТЕЛИ / GAUGES:
- ${t.sarcasm}: ${report.gauges.sarcasm}% (${report.gaugeDescriptors.sarcasm})
- ${t.toxicity}: ${report.gauges.toxicity}% (${report.gaugeDescriptors.toxicity})
- ${t.stuffiness}: ${report.gauges.stuffiness}% (${report.gaugeDescriptors.stuffiness})
- ${t.overallVibe}: ${report.gauges.overallVibe}% (${report.gaugeDescriptors.overallVibe})

ПЕРЕВОД / TRANSLATION:
"${report.humanTranslation}"

СВЕДЕНИЯ / INSIGHTS:
- ${t.unspokenMotive} ${report.unspokenMotive}
- ${t.proTipTitle}: ${report.proTip}
- ${t.recommendedReply} "${report.recommendedReply}"
`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    if (onCopySuccess) onCopySuccess(t.toastCopiedReport);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(report.recommendedReply);
    setCopiedReply(true);
    if (onCopySuccess) onCopySuccess(t.toastCopiedReply);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  const handleShare = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ffffff', '#a1a1aa', '#525252']
    });
    if (navigator.share) {
      navigator.share({
        title: `${t.appTitle}: ${report.verdict}`,
        text: `${t.appTitle}: ${report.verdict} - "${report.humanTranslation}"`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyReport();
    }
  };

  // Framer Motion Stagger Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      {/* 1. THE VERDICT CARD */}
      <motion.div
        variants={itemVariants}
        className={`relative rounded-[32px] bg-[#0A0A0A] border ${toneStyle.border} p-6 md:p-8 overflow-hidden shadow-2xl stealth-glow`}
      >
        {/* Subtle radial glow background behind card */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${toneStyle.glow} rounded-full blur-3xl pointer-events-none`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{report.badgeEmoji}</span>
            <span className={`text-xs font-mono tracking-widest uppercase ${toneStyle.badge} px-3 py-1 rounded-full bg-[#111111] border border-[#262626]`}>
              {report.badgeLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Model Indicator Badge */}
            <span className="text-[11px] font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>{report.modelUsed || 'Perplexity AI'}</span>
            </span>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <span>{t.confidence}</span>
              <span className="text-white font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {report.confidence}
              </span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          {report.verdict}
        </h2>
        
        <p className="text-zinc-400 text-sm md:text-base font-normal leading-relaxed max-w-2xl">
          {report.verdictSubtext}
        </p>

        {/* Input Text Snippet Preview */}
        {report.rawInput && (
          <div className="mt-5 p-3.5 rounded-2xl bg-[#111111]/80 border border-[#1F1F1F] text-xs font-mono text-zinc-400 italic truncate">
            "<span className="text-zinc-200">{report.rawInput}</span>"
          </div>
        )}

        {/* API Key Missing or Error Notice Banner */}
        {report.apiKeyMissing && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'RU'
                ? 'Режим эвристического аналайзера. Для активации Perplexity AI добавьте VITE_PERPLEXITY_API_KEY в файл .env'
                : 'Local Heuristic Mode. Add VITE_PERPLEXITY_API_KEY to your .env file to enable live Perplexity AI.'}
            </span>
          </div>
        )}

        {report.apiError && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              {lang === 'RU'
                ? `Ошибка Perplexity API: ${report.apiError}. Использован локальный фолбэк.`
                : `Perplexity API Error: ${report.apiError}. Used local fallback.`}
            </span>
          </div>
        )}
      </motion.div>

      {/* 2. ANALYTICAL METRICS (THE GAUGES) */}
      <motion.div
        variants={itemVariants}
        className="rounded-[32px] bg-[#0A0A0A] border border-[#1F1F1F] p-6 md:p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {t.analyticalGauges}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-600">{t.springPhysics}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gauge 1: Sarcasm */}
          <GaugeItem
            label={t.sarcasm}
            value={report.gauges.sarcasm}
            descriptor={report.gaugeDescriptors.sarcasm}
            icon={<Flame className="w-3.5 h-3.5 text-zinc-400" />}
          />

          {/* Gauge 2: Toxicity */}
          <GaugeItem
            label={t.toxicity}
            value={report.gauges.toxicity}
            descriptor={report.gaugeDescriptors.toxicity}
            icon={<AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />}
          />

          {/* Gauge 3: Stuffiness */}
          <GaugeItem
            label={t.stuffiness}
            value={report.gauges.stuffiness}
            descriptor={report.gaugeDescriptors.stuffiness}
            icon={<Shield className="w-3.5 h-3.5 text-zinc-400" />}
          />

          {/* Gauge 4: Overall Vibe */}
          <GaugeItem
            label={t.overallVibe}
            value={report.gauges.overallVibe}
            descriptor={report.gaugeDescriptors.overallVibe}
            isVibeScore
            icon={<Sparkles className="w-3.5 h-3.5 text-zinc-400" />}
          />
        </div>
      </motion.div>

      {/* 3. THE "HUMAN TRANSLATION" BOX */}
      <motion.div
        variants={itemVariants}
        className="rounded-[32px] bg-[#111111] border border-[#262626] p-6 md:p-8 space-y-6 shadow-xl"
      >
        {/* Header Label */}
        <div className="flex items-center gap-2 pb-3 border-b border-[#1F1F1F]">
          <Sparkles className="w-4 h-4 text-zinc-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {t.translatingToHuman}
          </span>
        </div>

        {/* Translation Content */}
        <div className="space-y-4">
          <p className="text-lg md:text-xl text-zinc-100 font-serif italic leading-relaxed">
            "{report.humanTranslation}"
          </p>

          <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-zinc-400 leading-relaxed space-y-1">
            <span className="font-semibold text-zinc-300 uppercase font-mono tracking-wider block">
              {t.unspokenMotive}
            </span>
            <p>{report.unspokenMotive}</p>
          </div>
        </div>

        {/* Pro-Tip Footer */}
        <div className="pt-5 border-t border-[#1F1F1F] space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white shrink-0 mt-0.5">
              <CornerDownRight className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                {t.proTipTitle}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {report.proTip}
              </p>
            </div>
          </div>

          {/* Recommended Reply Box with 1-click Copy */}
          <div className="p-4 rounded-2xl bg-[#080808] border border-[#1A1A1A] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-sm font-mono text-white italic">
                "{report.recommendedReply}"
              </span>
            </div>

            <button
              onClick={handleCopyReply}
              className="px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
            >
              {copiedReply ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-black" />
                  <span>{t.copyReply}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 4. DETECTED NUANCE GLOSSARY DICTIONARY */}
      {report.detectedTerms && report.detectedTerms.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-[32px] bg-[#0A0A0A] border border-[#1F1F1F] p-6 md:p-8 space-y-4"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {t.detectedNuances}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.detectedTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#111111] border border-[#1F1F1F] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">"{item.term}"</span>
                  <span className="text-[10px] font-mono text-zinc-500">{t.decoded}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-snug">{item.nuance}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 5. ACTION TOOLBAR */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-3 pt-2"
      >
        <button
          onClick={onReset}
          className="px-5 py-3 rounded-2xl bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] hover:border-[#333333] text-zinc-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-zinc-400" />
          <span>{t.analyzeAnother}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-3 rounded-2xl bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] hover:border-[#333333] text-zinc-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-zinc-400" />
            <span>{t.shareReport}</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black transition-all text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
          >
            {copiedReport ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>{t.reportCopied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-black" />
                <span>{t.copyFullReport}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Custom Progress Bar with Framer Motion Spring Transition
function GaugeItem({ label, value, descriptor, icon, isVibeScore }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-300">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-mono text-[11px]">{descriptor}</span>
          <span className="font-mono font-bold text-white">{value}%</span>
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-[#1A1A1A] p-0.5 overflow-hidden border border-[#262626]">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={{
            type: 'spring',
            stiffness: 45,
            damping: 15,
            duration: 1.0
          }}
          className={`h-full rounded-full ${
            isVibeScore
              ? 'bg-gradient-to-r from-zinc-400 to-white'
              : 'bg-white'
          }`}
        />
      </div>
    </div>
  );
}
