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
    category: 'Quruq Javob',
    label: 'Afsonaviy "Xo\'p."',
    text: "Xo'p."
  }
];

export const PRESET_EXAMPLES_EN = [
  {
    id: 'passive_slack_en',
    category: 'Work Chat',
    label: 'Per my previous email...',
    text: "Per my previous email, as discussed on Monday's sync, please review the documentation before pinging me. Thanks in advance!"
  },
  {
    id: 'genz_slang_en',
    category: 'Gen-Z Slang',
    label: 'Zero aura move 💀',
    text: "bro really thought he cooked 💀 that's pure cringe no cap, literally negative aura and zero rizz"
  },
  {
    id: 'corporate_stuffiness_en',
    category: 'Corporate Jargon',
    label: 'Synergize key deliverables',
    text: "Let's take this offline to synergize our core bandwidth, highlight key blockers, and touch base on actionable deliverables."
  },
  {
    id: 'passive_text_en',
    category: 'Relationships',
    label: 'Do whatever you want :)',
    text: "Fine, do whatever you want! I honestly don't care at all. Have fun :)"
  },
  {
    id: 'dry_reply_en',
    category: 'Cold Reply',
    label: 'The classic "K."',
    text: "K."
  }
];

// Fallback messages tailored per persona
const FALLBACK_RESPONSES = {
  troll: {
    RU: "Закрой своё ебало на минутку и переведи дыхание! Сервер временно перегружен или у тебя превышен лимит запросов, придурок. Попробуй еще раз через 10 секунд.",
    UZ: "Og'zingni bir minutga yum va tinchlan! Server vaqtincha band yoki sening limiting tugadi, kloun. 10 soniyadan keyin qayta urinib ko'r.",
    EN: "Shut your mouth for a second and take a breath! API server is temporarily rate limited or busy, moron. Try again in 10 seconds."
  },
  therapist: {
    RU: "Я вижу, что серверный канал перегружен лимитом. Твоя спешка и раздражение — это лишь проявление внутренней тревожности. Подожди минуту.",
    UZ: "Server kanali bandligini ko'rib turibman. Sening shoshilishing va g'azabing — shunchaki ichki xavotiring. Bir daqiqa kut.",
    EN: "I see the server line is congested. Your impatience is merely a symptom of unresolved anxiety. Please wait a moment."
  },
  flexer: {
    RU: "Мои серверы элитного VIP-класса сейчас заняты более важными премиум-делами, чем твои эконом-запросы. Подожди минутку!",
    UZ: "Mening elita darajasidagi serverlarim hozir sening arzon so'rovlaringdan ko'ra muhimroq ishlar bilan band. Bir oz kut!",
    EN: "My elite VIP servers are currently handling high-value tasks far above your budget queries. Try again in a minute!"
  },
  philosopher: {
    RU: "Вселенная на миг погрузилась в молчание, как и наш ИИ-сервер. Все наши спешные порывы тленны — подожди немного...",
    UZ: "Koinot bir lahzaga sukunatga cho'kdi, xuddi AI-serverimiz kabi. Barcha shoshinch intilishlarimiz o'tkinchi...",
    EN: "The universe falls silent for a brief moment, as does our AI server. All our frantic human queries are fleeting..."
  }
};

// Dynamic Heuristic Fallback Engine
export function analyzeVibe(inputText, lang = 'RU', personaId = 'troll') {
  const text = inputText.trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  
  let sarcasmScore = 75;
  let toxicityScore = 60;
  let stuffinessScore = 10;
  let overallVibeScore = 30;

  const detectedTerms = [];

  // Short cold responses
  if (lower === 'ясно.' || lower === 'ясно' || lower === 'понятно.' || lower === 'xo\'p' || lower === 'xop' || lower === 'k.') {
    sarcasmScore = 85;
    toxicityScore = 75;
    stuffinessScore = 5;
    overallVibeScore = 15;
    detectedTerms.push({ term: text, nuance: lang === 'UZ' ? "Bitta so'zli quruq javob." : "Односложная отповедь." });
  }

  // Punctuation
  if (text.includes('...') || text.includes('…')) {
    sarcasmScore += 10;
    toxicityScore += 10;
    overallVibeScore -= 10;
    detectedTerms.push({ term: "...", nuance: lang === 'UZ' ? "Ko'p nuqta bilan aytilmagan gap." : "Многоточие с подтекстом недосказанности." });
  }

  sarcasmScore = Math.min(100, Math.max(0, sarcasmScore));
  toxicityScore = Math.min(100, Math.max(0, toxicityScore));
  stuffinessScore = Math.min(100, Math.max(0, stuffinessScore));
  overallVibeScore = Math.min(100, Math.max(0, overallVibeScore));

  const activeLang = ['RU', 'UZ', 'EN'].includes(lang) ? lang : 'RU';
  const personaKey = FALLBACK_RESPONSES[personaId] ? personaId : 'troll';
  
  const personaFallbackText = FALLBACK_RESPONSES[personaKey][activeLang] || FALLBACK_RESPONSES.troll.RU;

  let verdict = activeLang === 'UZ' ? "fun.ai Hukmi (Limiting/Fallback)" : activeLang === 'EN' ? "fun.ai Verdict (Fallback)" : "fun.ai Вердикт (Лимит/Фоллбэк)";
  let verdictSubtext = activeLang === 'UZ' ? "Сервер паузада" : "Сервер временно занят";
  let badgeEmoji = personaKey === 'troll' ? '😈' : personaKey === 'therapist' ? '🧠' : personaKey === 'flexer' ? '👑' : '🕯️';
  let badgeLabel = "fun.ai";

  const getDescriptor = (score, type) => {
    if (activeLang === 'UZ') {
      if (type === 'vibe') return score >= 80 ? "Super Vayb" : score >= 50 ? "O'rtacha" : "Muzdek Vayb";
      return score >= 80 ? "Maksimal" : score >= 50 ? "Yuqori" : "Past";
    }
    if (activeLang === 'RU') {
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
    humanTranslation: personaFallbackText,
    unspokenMotive: activeLang === 'UZ' ? "Сервер паузада или лимит" : activeLang === 'EN' ? "Rate limit or busy server" : "Пауза сервера или лимит запросов",
    proTip: activeLang === 'UZ' ? "Попробуй через 10 секунд" : activeLang === 'EN' ? "Try again in 10 seconds" : "Попробуйте повторить через 10 секунд",
    recommendedReply: activeLang === 'UZ' ? "Жду" : activeLang === 'EN' ? "Waiting" : "Жду",
    detectedTerms: detectedTerms.length > 0 ? detectedTerms : [
      { term: text.substring(0, 15), nuance: "Фоллбэк режим" }
    ],
    rawInput: text,
    detectedTone: personaKey === 'troll' ? 'toxic' : personaKey === 'therapist' ? 'calm' : personaKey === 'flexer' ? 'cocky' : 'vulnerable'
  };
}
