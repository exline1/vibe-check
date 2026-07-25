// Preset Examples in Russian, Uzbek and English
export const PRESET_EXAMPLES_RU = [
  {
    id: 'passive_slack_ru',
    category: 'Рабочий Чат',
    label: 'Как я уже писал ранее...',
    text: "Как я уже писал ранее, этот вопрос мы уже подробно разбирали на синке в понедельник. Надеюсь на понимание! Заранее спасибо."
  },
  {
    id: 'genz_slang_ru',
    category: 'Сленг Зумеров',
    label: 'Это полная база 💀',
    text: "бро реально думал что выдал имбу 💀 это чистый кринж без ауры, ноль ризза честно говоря"
  },
  {
    id: 'corporate_stuffiness_ru',
    category: 'Офисный Официоз',
    label: 'Засинергировать таски',
    text: "Предлагаю созвониться офлайн, чтобы засинергировать наши ключевые дедлайны, подсветить блокеры и заапрувить стратегический парадигмальный сдвиг."
  },
  {
    id: 'passive_text_ru',
    category: 'Переписка / Отношения',
    label: 'Да делай что хочешь :)',
    text: "Да все нормально, делай что хочешь! Мне вообще все равно. Желаю хорошо погулять :)"
  },
  {
    id: 'dry_reply_ru',
    category: 'Холодный Ответ',
    label: 'Легендарное "Ясно."',
    text: "Ясно."
  }
];

export const PRESET_EXAMPLES_UZ = [
  {
    id: 'passive_slack_uz',
    category: 'Ishchi Chat',
    label: 'Dushanba kuni aytgandim...',
    text: "Dushanba kungi yig'ilishda buni batafsil gaplashgandik. Tushunasiz degan umiddaman. Oldindan rahmat!"
  },
  {
    id: 'genz_slang_uz',
    category: 'Zumer Slengi',
    label: 'Jigar bomba chipti 💀',
    text: "brat o'zicha daxshat chiqtim deb o'yladi 💀 lekin no cap chotki krinj bo'ldi, aura umuman yo'q"
  },
  {
    id: 'corporate_stuffiness_uz',
    category: 'Ofis Rasmiyatchiligi',
    label: 'Offlayn gaplashamiz',
    text: "Keling offlayn uchrashib, dedlaynlarni sinxronlaymiz va loyiha appruvi bo'yicha blokerlarni hal qilamiz."
  },
  {
    id: 'passive_text_uz',
    category: 'Munosabatlar',
    label: 'Mayli bilganingni qil :)',
    text: "Mayli hammayoq joyida, bilganingni qil! Menga umuman farqi yo'q. Yaxshi aylanib kel :)"
  },
  {
    id: 'dry_reply_uz',
    category: 'Muzdek Javob',
    label: 'Mashhur "Xo\'p."',
    text: "Xo'p."
  }
];

export const PRESET_EXAMPLES_EN = [
  {
    id: 'passive_slack',
    category: 'Corporate Slack',
    label: 'Per my previous email...',
    text: "Per my previous email, as I'm sure you recall, we already resolved this in Monday's sync. Hope that helps! Thanks in advance."
  },
  {
    id: 'genz_slang',
    category: 'Gen-Z / Alpha',
    label: 'He really cooked 💀',
    text: "bro really thought he cooked with that fit 💀 no cap fr fr on god mid af, negative rizz honestly"
  },
  {
    id: 'corporate_stuffiness',
    category: 'Executive Speak',
    label: 'Leverage core synergies',
    text: "Let me touch base with the team offline to double-click on our key deliverables and socialize the paradigm shift across cross-functional verticals."
  },
  {
    id: 'passive_text',
    category: 'Casual / Dating',
    label: 'No it\'s fine do whatever :)',
    text: "No it's totally fine, do whatever you want! I don't care at all. Hope you have fun :)"
  },
  {
    id: 'dry_reply',
    category: 'Minimalist Cold',
    label: 'The Dreaded "K."',
    text: "K."
  }
];

// Mock Personas for Russian Presets
export const MOCK_PERSONAS_RU = {
  passive_slack_ru: {
    verdict: "Пик Пассивной Агрессии",
    verdictSubtext: "Максимальная скрытая враждебность, замаскированная под вежливый офисный этикет.",
    badgeEmoji: "⚡",
    badgeLabel: "Офисный Токсин",
    confidence: "99%",
    gauges: { sarcasm: 94, toxicity: 82, stuffiness: 88, overallVibe: 18 },
    gaugeDescriptors: { sarcasm: "Ядерный уровень", toxicity: "Токсичный официоз", stuffiness: "Максимум бюрократии", overallVibe: "Арктический холод" },
    humanTranslation: "Я лично отправлял тебе это 3 дня назад. Прочитай почту вместо того, чтобы отнимать мое время глупыми вопросами.",
    unspokenMotive: "Показать свое превосходство и подготовить почву для того, чтобы поставить твоего начальника в копию письма.",
    proTip: "Кратко подтверди получение информации без лишних оправданий. Отвечай холодно и по делу.",
    recommendedReply: "Понял, нашел ветку от понедельника. Двигаемся по первичному плану. Спасибо.",
    detectedTerms: [
      { term: "Как я уже писал ранее", nuance: "Прямой перевод: 'Ты умеешь читать?'" },
      { term: "Надеюсь на понимание!", nuance: "Завуалированная принудительная команда не спорить" },
      { term: "Заранее спасибо", nuance: "Финишный пассивно-агрессивный выстрел" }
    ]
  }
};

// Dynamic Heuristic Analyzer supporting Russian, Uzbek & English
export function analyzeVibe(inputText, lang = 'RU') {
  const text = inputText.trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  
  let sarcasmScore = 15;
  let toxicityScore = 10;
  let stuffinessScore = 10;
  let overallVibeScore = 75;

  const detectedTerms = [];

  // Short cold responses
  if (lower === 'ясно.' || lower === 'ясно' || lower === 'понятно.' || lower === 'xo\'p' || lower === 'xop' || lower === 'k.') {
    sarcasmScore = 65;
    toxicityScore = 55;
    stuffinessScore = 5;
    overallVibeScore = 15;
    detectedTerms.push({ term: text, nuance: lang === 'UZ' ? "Bitta so'zli quruq javob." : "Односложная отповедь." });
  }

  // Punctuation
  if (text.includes('...') || text.includes('…')) {
    sarcasmScore += 15;
    toxicityScore += 15;
    overallVibeScore -= 10;
    detectedTerms.push({ term: "...", nuance: lang === 'UZ' ? "Ko'p nuqta bilan aytilmagan gap." : "Многоточие с подтекстом недосказанности." });
  }

  // Clamp
  sarcasmScore = Math.min(100, Math.max(0, sarcasmScore));
  toxicityScore = Math.min(100, Math.max(0, toxicityScore));
  stuffinessScore = Math.min(100, Math.max(0, stuffinessScore));
  overallVibeScore = Math.min(100, Math.max(0, overallVibeScore));

  let verdict = lang === 'UZ' ? "Krinj Diagnostika" : lang === 'RU' ? "Нейтральный Ввод" : "Neutral Input";
  let verdictSubtext = lang === 'UZ' ? "Matn tahlil qilindi." : "Стандартный текст.";
  let badgeEmoji = "📊";
  let badgeLabel = lang === 'UZ' ? "Vayb Sudyasi" : "Vibe Judge";

  const getDescriptor = (score, type) => {
    if (lang === 'UZ') {
      if (type === 'vibe') return score >= 80 ? "Super Vayb" : score >= 50 ? "O'rtacha" : "Muzdek Vayb";
      return score >= 80 ? "Maksimal" : score >= 50 ? "Yuqori" : "Past";
    }
    if (lang === 'RU') {
      if (type === 'vibe') return score >= 80 ? "Идеальный Кайф" : score >= 50 ? "Хороший Вайб" : "Минус по Вайбу";
      return score >= 80 ? "Экстремальный" : score >= 50 ? "Высокий" : "Низкий";
    }
    return score >= 80 ? "Extreme" : "Moderate";
  };

  return {
    verdict,
    verdictSubtext,
    badgeEmoji,
    badgeLabel,
    confidence: "99%",
    gauges: {
      sarcasm: sarcasmScore,
      toxicity: toxicityScore,
      stuffiness: stuffinessScore,
      overallVibe: overallVibeScore
    },
    gaugeDescriptors: {
      sarcasm: getDescriptor(sarcasmScore, 'sarcasm'),
      toxicity: getDescriptor(toxicityScore, 'toxicity'),
      stuffiness: getDescriptor(stuffinessScore, 'stuffiness'),
      overallVibe: getDescriptor(overallVibeScore, 'vibe')
    },
    humanTranslation: lang === 'UZ'
      ? `Sening bu matning: "${text}" - haqiqatda shunchaki o'zingni ko'rsatishga urug'inish.`
      : `Твой текст: "${text}" — это просто нелепая попытка казаться крутым.`,
    unspokenMotive: lang === 'UZ' ? "O'zining kamchiliklarini yopishga urunish." : "Попытка скрыть свою беспомощность.",
    proTip: lang === 'UZ' ? "Telefoningni o'chirib kitob o'qi." : "Удали свой текст и больше не позорься.",
    recommendedReply: lang === 'UZ' ? "Gaping bo'lsa yuzimga ayt." : "Давай безпонтов.",
    detectedTerms: detectedTerms.length > 0 ? detectedTerms : [
      { term: text.substring(0, 15), nuance: "Oddiy gap" }
    ],
    rawInput: text,
    detectedTone: 'calm'
  };
}
