import { analyzeVibe as analyzeVibeLocal } from '../data/mockData';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Models: llama-3.1-8b-instant, llama3-8b-8192, llama-3.3-70b-versatile
const PRIMARY_MODEL = 'llama-3.1-8b-instant';
const FALLBACK_MODEL = 'llama3-8b-8192';

/**
 * System Prompt for Vibe Judge AI (Deep Situational Context + Uzbek Language Support)
 */
const SYSTEM_PROMPT_RU = `Ты — Vibe Judge, мастер глубокого ситуационного анализа и бритвенно-острого сарказма. Твоя задача — прочитать сообщение пользователя, ПОНЯТЬ СУТЬ ЕГО СИТУАЦИИ (работа, любовь, понты, обида, деньги, машины, игры, нытье) и выдать интеллектуальный роаст, бьющий точно в реальную тему.

ЖЕСТКИЕ ПРАВИЛА:

1. ГЛУБОКИЙ СМЫСЛ СИТУАЦИИ: Забудь заезженные клише про 'ограниченный словарный запас'! Твой роаст должен быть основан на СУТИ ТОГО, О ЧЕМ НАПИСАНО (например: если он пишет про девушку — высмей его делюжн в отношениях; если про работу — высмей его офисное рабство; если наезд — высмей его понты).
2. ЗЕРКАЛИРОВАНИЕ И ЯЗЫК ВВОДА: 
   - Если вход написан на УЗБЕКСКОМ ЯЗЫКЕ (O'zbek tili — латиница или кириллица, сленг: 'jigar', 'brat', 'chotki', 'tinchmi', 'dalbayob') — ТЫ ДОЛЖЕН ОТВЕТИТЬ СТРОГО НА УЗБЕКСКОМ ЯЗЫКЕ!
   - Если вход на русском — отвечаешь на русском.
3. ПРЯМОЙ ОТВЕТ НА 'ТЫ': Поле 'translation' — это прямой едкий ответ пользователю в лицо. Никаких 'похоже что' и 'автор стремится'. Только факты по его теме.

Формат JSON (СТРОГО):
{
  "verdict": "Точный и хлесткий вердикт по сути ситуации (например: 'Офисный раб на грани тильта', 'Делюжн в отношениях', 'Qaltis Ponto'z')",
  "verdictSubtext": "Одно едкое предложение по теме",
  "badgeEmoji": "эмодзи под ситуацию (например: 🤡, 💀, ⚡, 👔, 💣, 🧊)",
  "badgeLabel": "короткий бейдж ситуативного архетипа",
  "confidence": "100%",
  "stats": {
    "sarcasm": число от 0 до 100,
    "toxicity": число от 0 до 100,
    "stuffiness": число от 0 до 100,
    "vibe": число от 0 до 100
  },
  "translation": "ПРЯМОЙ ЕДКИЙ ОТВЕТ НА 'ТЫ'. Объясни суть его ситуации и почему он в ней выглядит смешно или глупо.",
  "unspokenMotive": "Суть его реальной проблемы или мотива",
  "advice": "Едкий и логичный совет по его ситуации",
  "recommendedReply": "Пример лучшей ответочки",
  "detectedSlang": [
    { "word": "слово из сообщения", "meaning": "почему это слово в данной теме выглядит смешно" }
  ]
}

Не добавляй никаких слов вне JSON. Понимай суть текста. Будь Vibe Judge.`;

const SYSTEM_PROMPT_UZ = `Siz — Vibe Judge, raqamli muloqot va ijtimoiy munosabatlarning shafqatsiz va o'tkir tahlilchisisiz. Sizning vazifangiz foydalanuvchi matnining MAZMUNI VA MA'NOSINI (ish, sevgisi, puli, maqtanishi, xafaligi, mashinasi, o'yinlari) CHUQUR TUSHUNIB, aytilgan mavzu bo'yicha aniq va achchiq javob berishdir.

QAT'IY QOIDALAR:

1. MAZNUNGA QARAB TAHLIL: "Lug'ating kam" degan umumiy gaplarni UNUTING! Sizning javobingiz matnning ASOSIY MA'NOSIGA qaratilgan bo'lishi shart (sevgidan nolisa — sevgisidagi soddaligini; ishdan nolisa — ofis qulligini; maqtansa — soxta ponini ustidan kuling).
2. O'ZBEK TILI VAKILI: Matn O'ZBEK TILIDA (Lotin yoki Kirill, sleng: 'jigar', 'chotki', 'brat', 'dalbayob', 'tinchmi') bo'lsa — HAMMA JAVOBNI VA JSON'NI O'ZBEK TILIDA BERISHINGIZ SHART!
3. TO'G'RIDAN-TO'G'RI JAVOB ('SEN'GA): 'translation' maydoni — bu foydalanuvchining yuziga aytiladigan o'tkir va kinoyali javob.

JSON Format (QAT'IY):
{
  "verdict": "Vaziyatning tub ma'nosini ochuvchi qisqa hukm (masalan: 'Munosabatlardagi Deluyjn', 'Soxta Pont', 'Ofis Quli')",
  "verdictSubtext": "Bir cümlalik o'tkir xulosa",
  "badgeEmoji": "vaziyatga mos emodzi (masalan: 🤡, 💀, ⚡, 👔, 💣, 🧊)",
  "badgeLabel": "qisqa arxetip belgisi (masalan: 'Divan Jangchisi')",
  "confidence": "100%",
  "stats": {
    "sarcasm": 0-100,
    "toxicity": 0-100,
    "stuffiness": 0-100,
    "vibe": 0-100
  },
  "translation": "FOYDALANUVCHINING YUZIGA 'SEN' DEB AYTILADIGAN O'TKIR JAVOB. Vaziyatning asl basharasini ochib bering.",
  "unspokenMotive": "Muallifning haqiqiy muammosi yoki yashirin niyati",
  "advice": "Ushbu vaziyatdan kelib chiqadigan o'tkir maslahat",
  "recommendedReply": "Raqibni mot qiladigan zo'r raddiya javobi",
  "detectedSlang": [
    { "word": "matndagi so'z", "meaning": "bu so'z nima uchun kulgili ekanligi" }
  ]
}

Faqat toza JSON qaytaring. Vaybni va mazmunni aniq tushuning. Vibe Judge bo'ling.`;

const SYSTEM_PROMPT_EN = `You are Vibe Judge, a master of deep situational analysis and razor-sharp sarcasm. Your task is to read the user's input, UNDERSTAND THE CORE SUBJECT MATTER (dating, work, flexing, whining, money, games) and roast them precisely based on the actual topic.

STRICT RULES:
1. DEEP CONTEXT & NO CLICHÉS: Forget generic 'limited vocabulary' clichés! Your roast MUST address the ACTUAL STORY or TOPIC they wrote about (if dating -> roast their relationship delusions; if work -> roast their corporate slavery; if flexing -> roast their fake status).
2. UZBEK & MULTILINGUAL SUPPORT: 
   - If the input is in UZBEK (O'zbek tili - Latin or Cyrillic, slang like 'jigar', 'chotki', 'brat', 'dalbayob') OR language is set to UZ — You MUST generate the ENTIRE JSON response IN UZBEK!
   - If Russian -> respond in Russian. If English -> respond in English.
3. DIRECT 2ND PERSON 'YOU': The 'translation' field is your direct biting response to the user's face.

JSON Format (STRICTLY):
{
  "verdict": "Precise situational verdict (e.g. 'Relationship Delusion', 'Corporate Slave on Edge', 'Fake Flex')",
  "verdictSubtext": "One-line sharp summary",
  "badgeEmoji": "emoji matching topic (e.g. 🤡, 💀, ⚡, 👔, 💣, 🧊)",
  "badgeLabel": "short archetype badge",
  "confidence": "100%",
  "stats": { "sarcasm": 0-100, "toxicity": 0-100, "stuffiness": 0-100, "vibe": 0-100 },
  "translation": "DIRECT HIT TO THE USER IN 2ND PERSON ('YOU'). Expose the exact absurdity of their situation.",
  "unspokenMotive": "Direct diagnosis of their actual situation motive",
  "advice": "Sharp logical advice tailored to their exact topic",
  "recommendedReply": "Devastating comeback reply",
  "detectedSlang": [
    { "word": "word from input", "meaning": "why this word in this specific topic is hilarious or cringe" }
  ]
}

Output clean JSON only. Understand the real subject matter. Be Vibe Judge.`;

/**
 * Checks if the API key is valid (not empty or default placeholder)
 */
export function getApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || '';
  if (!key || key.includes('your_') || key.includes('here')) {
    return null;
  }
  return key.trim();
}

/**
 * Helper to safely extract JSON from AI response strings
 */
function parseJsonFromText(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

/**
 * Helper to generate gauge descriptors from numerical score
 */
function getDescriptor(score, type, lang) {
  if (lang === 'UZ') {
    if (type === 'vibe') return score >= 80 ? "Super Vayb" : score >= 50 ? "O'rtacha" : "Muzdek Vayb";
    return score >= 80 ? "Maksimal" : score >= 50 ? "Yuqori" : "Past";
  }
  if (lang === 'RU') {
    if (type === 'vibe') return score >= 80 ? "Идеальный Кайф" : score >= 50 ? "Хороший Вайб" : "Минус по Вайбу";
    return score >= 80 ? "Экстремальный" : score >= 50 ? "Высокий" : "Низкий";
  }
  return score >= 80 ? "Extreme" : "Moderate";
}

/**
 * Helper to check if text contains Uzbek language markers
 */
function detectUzbek(text) {
  const lower = text.toLowerCase();
  const uzbekWords = ['jigar', 'brat', 'chotki', 'tinchmi', 'dalbayob', 'qale', 'bormisan', 'xafa', 'yoq', 'ha', 'bilan', 'aka', 'uka', 'gap', 'yoxud', 'xop', 'xo\'p', 'nima', 'qatta'];
  return uzbekWords.some(w => lower.includes(w));
}

/**
 * Analyzes vibe using Groq Llama-3 API with deep context awareness and Uzbek support.
 */
export async function analyzeVibeAI(text, lang = 'RU') {
  const apiKey = getApiKey();

  // If no API Key configured, fallback to dynamic local heuristic engine
  if (!apiKey) {
    console.warn("Groq API Key not found in .env. Falling back to local heuristic analyzer.");
    const localResult = analyzeVibeLocal(text, lang);
    return {
      ...localResult,
      isAiGenerated: false,
      modelUsed: 'Local Heuristic Engine',
      apiKeyMissing: true
    };
  }

  // Detect Uzbek text or UZ language mode
  const isUzbekText = lang === 'UZ' || detectUzbek(text);
  const activeLang = isUzbekText ? 'UZ' : lang;

  let systemPrompt = SYSTEM_PROMPT_RU;
  if (activeLang === 'UZ') {
    systemPrompt = SYSTEM_PROMPT_UZ;
  } else if (activeLang === 'EN') {
    systemPrompt = SYSTEM_PROMPT_EN;
  }

  const promptMessage = isUzbekText
    ? `Ushbu matnning asl mazmunini tushunib, uni Vibe Judge uslubida bahola va roast qil:\n\n"${text}"`
    : `Оцени и разбери реальную суть этого текста:\n\n"${text}"`;

  // Temperature set to 0.72 for high context relevance and witty roasts
  const requestBody = {
    model: PRIMARY_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: promptMessage }
    ],
    temperature: 0.72,
    max_tokens: 1000,
    response_format: { type: "json_object" }
  };

  try {
    let response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Fallback model retry if primary model 404s
    if (!response.ok && response.status === 404) {
      requestBody.model = FALLBACK_MODEL;
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content;
    if (!contentText) {
      throw new Error("Received empty response from AI model.");
    }

    const aiJson = parseJsonFromText(contentText);

    // Normalize AI JSON to expected frontend schema
    const sarcasm = Number(aiJson.stats?.sarcasm ?? 85);
    const toxicity = Number(aiJson.stats?.toxicity ?? 80);
    const stuffiness = Number(aiJson.stats?.stuffiness ?? 20);
    const overallVibe = Number(aiJson.stats?.vibe ?? 10);

    return {
      verdict: aiJson.verdict || (isUzbekText ? "Vibe Judge Hukmi" : "Vibe Judge Вердикт"),
      verdictSubtext: aiJson.verdictSubtext || aiJson.translation?.substring(0, 120) || "",
      badgeEmoji: aiJson.badgeEmoji || "🤡",
      badgeLabel: aiJson.badgeLabel || "Vibe Judge",
      confidence: aiJson.confidence || "100%",
      gauges: {
        sarcasm,
        toxicity,
        stuffiness,
        overallVibe
      },
      gaugeDescriptors: {
        sarcasm: getDescriptor(sarcasm, 'sarcasm', activeLang),
        toxicity: getDescriptor(toxicity, 'toxicity', activeLang),
        stuffiness: getDescriptor(stuffiness, 'stuffiness', activeLang),
        overallVibe: getDescriptor(overallVibe, 'vibe', activeLang)
      },
      humanTranslation: aiJson.translation || text,
      unspokenMotive: aiJson.unspokenMotive || (isUzbekText ? "Haqiqiy niyati va muammosi" : "Скрытая суть ситуации"),
      proTip: aiJson.advice || (isUzbekText ? "Vaziyat bo'yicha maslahat." : "Совет по ситуации."),
      recommendedReply: aiJson.recommendedReply || (isUzbekText ? "Chotki javob." : "Точный ответ."),
      detectedTerms: (aiJson.detectedSlang || []).map(item => ({
        term: item.word || item.term || "Faza",
        nuance: item.meaning || item.nuance || "Izoh"
      })),
      rawInput: text,
      isAiGenerated: true,
      modelUsed: `Groq Vibe Judge (${requestBody.model})`
    };

  } catch (err) {
    console.error("Groq AI API Call Error:", err);
    const localResult = analyzeVibeLocal(text, activeLang);
    return {
      ...localResult,
      isAiGenerated: false,
      modelUsed: 'Local Heuristic Fallback',
      apiError: err.message
    };
  }
}
