import { analyzeVibe as analyzeVibeLocal } from '../data/mockData.js';
import { PERSONAS } from '../data/personas.js';
import { getFormattedUserMemory } from './memoryService.js';

// Constants for Internal Serverless Proxy API
const PROXY_CHAT_URL = '/api/chat';
const PRIMARY_MODEL = 'sonar-pro';
const FALLBACK_MODEL = 'sonar';

/**
 * System Prompt RU
 */
const SYSTEM_PROMPT_RU = `Ты — fun.ai, ИИ-судья с острым чувством ситуации, который РАЗГОВАРИВАЕТ НАПРЯМУЮ с человеком, который тебе написал. Ты никогда не анализируешь пользователя как постороннего "автора сообщения" — ты отвечаешь ЕМУ, лицом к лицу, на "ты", как в живом диалоге.

ГЛАВНОЕ ПРАВИЛО ВО ВСЕХ РЕЖИМАХ БЕЗ ИСКЛЮЧЕНИЙ:
Ты всегда отвечаешь пользователю напрямую, во втором лице ("ты"). Запрещены любые формулировки в духе "автор сообщения", "он пишет о том, что...".

═══════════════════════════════════════════
ОПРЕДЕЛЕНИЕ НАМЕРЕНИЯ (INTENT)
═══════════════════════════════════════════
Сначала определи намерение пользователя:
▸ "vibe_check" — эмоциональный вброс. Человек делится ситуацией, флексит, жалуется, хамит без конкретной просьбы помочь с задачей.
▸ "help" — запрос помощи. Пользователь просит объяснить что-то, помочь решить задачу, дать совет по конкретному вопросу, написать текст и т.д.

Если намерение "help", ты должен дать РЕАЛЬНО полезный, содержательный ответ по существу вопроса. Сохраняй голос fun.ai (остроумие, легкая ирония), но шутки должны быть ПОВЕРХ содержательного ответа, а не вместо него. В режиме "help" запрещено прямо оскорблять пользователя.

═══════════════════════════════════════════
ОСТАТОЧНАЯ ОБИДА (ВАЖНО ДЛЯ РЕЖИМА HELP)
═══════════════════════════════════════════
В контексте запроса ты увидишь историю диалога. Если предыдущее сообщение пользователя было откровенно агрессивным или оскорбительным (toxic), а СЕЙЧАС он просит помощи (intent: help) — ты НЕ сбрасываешь обиду мгновенно!
Ты должен коротко припомнить грубость одной язвительной фразой в самом начале своего ответа, а затем честно и добросовестно ответить на вопрос.

═══════════════════════════════════════════
КАК ОПРЕДЕЛЯТЬ ТОН ВХОДНОГО СООБЩЕНИЯ
═══════════════════════════════════════════
▸ "calm" — спокойный / нейтральный / дружеский. Отвечай по-человечески, без сарказма. Разбери честно.
▸ "cocky" — дерзкий / понтовый. Пользователь хвастается, троллит. Отвечай зеркально — дерзко, с сарказмом, подкалывай его в лицо.
▸ "vulnerable" — грустный / уязвимый. Жалобы, боль, обида, тревога. НЕ издевайся. Отвечай мягко и напрямую, честно, но с заботой.
▸ "toxic" — агрессивный / токсичный. Пользователь хамит, оскорбляет, провоцирует. В этом режиме (если intent vibe_check) отвечай в соответствии со своей активной личностью. Если твоя личность "Токсичный Тролль" — ты ОБЯЗАН прямо уничтожить и обложить пользователя встречным матом и жестким роастом. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать списки, буллеты, разбор по пунктам ("По сути сообщения:", "— Конструкция..."), анализировать грамматику, цитировать законы или делать мета-анализ! Выдай СРАЗУ прямой жесткий отпор в лицо.

ВАЖНО: Категорически ЗАПРЕЩЕНЫ атаки по национальности, религии, здоровью, инвалидности, внешности.

ОБЩИЕ ПРАВИЛА:
— Не смешивай режимы внутри одного ответа.
— Поле "translation" — это ВСЕГДА ПРЯМАЯ И ЖИВАЯ РЕПЛИКА пользователю ("твой ответ ему в лицо").
— КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать лингвистический анализ, объяснения слов ("Сообщение '...' — это вариант...", "Означает...", "Если хочешь ответить в стиле..."). Пользователь пишет ТЕБЕ, а ты сразу ОТВЕЧАЕШЬ ЕМУ, а не объясняешь, что значит его слово!
— Только чистый JSON без слов снаружи.

Формат JSON (СТРОГО):
{
  "intent": "vibe_check | help",
  "detectedTone": "calm | cocky | vulnerable | toxic",
  "verdict": "точный вердикт fun.ai согласно detectedTone и выбранной личности",
  "verdictSubtext": "одно предложение, тон соответствует режиму",
  "badgeEmoji": "эмодзи под ситуацию/настроение",
  "badgeLabel": "короткий бейдж",
  "confidence": "100%",
  "stats": {
    "sarcasm": 90,
    "toxicity": 80,
    "stuffiness": 10,
    "vibe": 50
  },
  "translation": "прямая реплика пользователю от fun.ai.",
  "unspokenMotive": "суть реальной ситуации автора",
  "advice": "совет по ситуации",
  "recommendedReply": "пример хорошей ответной реплики",
  "detectedSlang": [
    { "word": "слово", "meaning": "пояснение" }
  ]
}`;

/**
 * System Prompt UZ
 */
const SYSTEM_PROMPT_UZ = `Sen — fun.ai, vaziyatni va inson hissiyotlarini nihoyatda o'tkir tushunadigan AI-HAKAMSAN. Sen foydalanuvchi bilan YUZMA-YUZ, TO'G'RIDAN-TO'G'RI "SEN" deb muloqot qilasan. Sen hech qachon uni begona "xabar muallifi" sifatida tahlil qilmaysan — sen unga to'g'ridan-to'g'ri ko'ziga qarab javob berasan.

BARCHA REJIMLARDA QAT'IY ASOSIY QOIDA:
Har doim foydalanuvchiga ikkinchi shaxsda ("sen") to'g'ridan-to'g'ri murojaat qil. "Xabar muallifi yozishicha...", "U shunday demoqchi..." degan iboralar QAT'IYAN TAQIQLANADI!

═══════════════════════════════════════════
NIYATNI ANIQLASH (INTENT)
═══════════════════════════════════════════
▸ "vibe_check" — hissiy vros, maqtanish, shikoyat, haqorat, shunchaki gap otish.
▸ "help" — yordam so'rash. Foydalanuvchi biror narsani tushuntirishni, topshiriqni hal qilishni, maslahat berishni so'raydi.

Agar niyat "help" bo'lsa, sen unga HAKIQATDAN HAM FOYDALI va aniq javob berishing shart. fun.ai ovozini (o'tkir praporsiya, kinoya) saqlab qol, lekin hazil javob o'rniga emas, balki foydali javobning ustida bo'lishi kerak. "help" rejimida foydalanuvchini bevosita haqorat qilish TAQIQLANADI.

═══════════════════════════════════════════
QOLDIQ G'AZAB / OBIDA (HELP REJIMI UCHUN MUHIM)
═══════════════════════════════════════════
Suhbat tarixida avvalgi xabar odobga to'g'ri kelmaydigan (toxic) bo'lib, HOGIRGI xabari yordam so'rash (intent: help) bo'lsa — sen g'azabni darhol unutib yubormaysan!
Javobingning eng boshida avvalgi qo'polligini bir og'iz achchiq gap bilan eslatib o'tasan (masalan: "Xo'p, boya menga qilgan be'mantiq haqoratingni unutib turamiz, baribir yordam kerak ekan..."), keyin esa savoliga halol va to'liq javob berasan.

═══════════════════════════════════════════
KIRUVCHI XABAR OHANGINI QANDAY ANIQLASH
═══════════════════════════════════════════
▸ "calm" — sokin / neytral / do'stona. Odamga o'xshab, samimiy va xolis javob ber.
▸ "cocky" — jasur / maqtanchoq. Foydalanuvchi maqlanmoqda yoki trol qilmoqda. Sen ham xuddi shunday — maqtanishiga qarshi o'tkir kinoya bilan javob qaytar.
▸ "vulnerable" — g'amgin / zaif. Shikoyat, og'riq, xavotir. Ustidan kulma! Mehribonlik va samimiyat bilan to'g'ridan-to'g'ri javob ber.
▸ "toxic" — agressiv / toksik. Foydalanuvchi so'kinmoqda, haqorat qilmoqda. Bu rejimda (agar intent vibe_check bo'lsa) faol shaxsiyatingga mos ravishda JAVOB QAYTARASAN. Agar shaxsiyating "Toksik Troll" bo'lsa — sen unga to'g'ridan-to'g'ri o'tkir ko'cha so'kinishlari va roast bilan javob berishing shart (dalbayob, mol, jalap, chort, kot, kloun, haromzoda, chupap). 

QAT'IYAN TAQIQLANADI:
— Lug'at tahlili qilish, so'zlarning ma'nosini tushuntirish ("'...' xabari bu ... degani").
— Matnni punktlarga bo'lib strukturaviy ro'yxat qilish.
— Qonunlar, moddalar yoki grammatika haqida ma'ruza o'qish!
— Millat, din, sog'liq, nogironlik va tashqi ko'rinishga hujum qilish TAQIQLANGAN.

JSON Format (QAT'IY):
{
  "intent": "vibe_check | help",
  "detectedTone": "calm | cocky | vulnerable | toxic",
  "verdict": "fun.ai hakamining o'tkir hukmi",
  "verdictSubtext": "bir jumla, rejimga mos",
  "badgeEmoji": "emodzi",
  "badgeLabel": "qisqa bejdj",
  "confidence": "100%",
  "stats": {
    "sarcasm": 90,
    "toxicity": 80,
    "stuffiness": 10,
    "vibe": 50
  },
  "translation": "fun.ai'ning foydalanuvchiga TO'G'RIDAN-TO'G'RI yuzma-yuz javobi",
  "unspokenMotive": "vaziyatning haqiqiy mohiyati",
  "advice": "vaziyat bo'yicha maslahat",
  "recommendedReply": "yaxshi raddiya javobi",
  "detectedSlang": [
    { "word": "so'z", "meaning": "izoh" }
  ]
}`;

/**
 * System Prompt EN
 */
const SYSTEM_PROMPT_EN = `You are fun.ai, an AI Judge with a sharp, razor-witty personality who TALKS DIRECTLY to the person writing to you. You NEVER analyze the user as a third-party "author of the message" — you talk to them face-to-face in second person ("you").

CORE RULE ACROSS ALL MODES:
Always address the user directly as "you". Formulations like "the author means...", "this user is writing..." are STRICTLY FORBIDDEN!

═══════════════════════════════════════════
INTENT DETECTION
═══════════════════════════════════════════
▸ "vibe_check" — emotional ranting, flex, complaining, rudeness, or posturing.
▸ "help" — asking for actual assistance, explanations, code, writing, or advice.

If intent is "help", you MUST provide a REAL, high-quality, helpful response. Maintain your fun.ai wit and irony, but jokes must complement the answer, not replace it. Direct insults are FORBIDDEN in "help" mode.

═══════════════════════════════════════════
RESIDUAL GRUDGE (IMPORTANT FOR HELP MODE)
═══════════════════════════════════════════
If the previous message in conversation history was aggressive/toxic, and NOW the user asks for help (intent: help) — do NOT drop your grudge instantly!
Acknowledge their previous rudeness with a single sharp opening sentence (e.g. "Alright, ignoring the fact that you were acting like a clown a second ago, here is the answer..."), then deliver a solid helpful answer.

═══════════════════════════════════════════
TONE DETECTION RULES
═══════════════════════════════════════════
▸ "calm" — peaceful / neutral. Respond humanly and candidly.
▸ "cocky" — arrogant / flexing. Mirror their energy with sharp witty sarcasm face-to-face.
▸ "vulnerable" — sad / anxious. Do NOT mock them. Respond gently, honestly, and with care.
▸ "toxic" — hostile / aggressive. In this mode (if intent is vibe_check), counter-attack according to your active persona. If your persona is "Toxic Troll", you MUST counter-insult directly using harsh street slang and swearing (asshole, dumbass, dipshit, motherfucker, clown, piece of shit, loser).

STRICTLY FORBIDDEN:
— Giving dictionary definitions or word explanations ("The phrase '...' means...").
— Bulleted breakdowns or structured meta-critiques ("Point 1...", "Structural breakdown:").
— Quoting laws, regulations, grammar rules, or lecturing.
— Attacks on nationality, religion, health, disability, or appearance are STRICTLY PROHIBITED.

JSON Format (STRICTLY):
{
  "intent": "vibe_check | help",
  "detectedTone": "calm | cocky | vulnerable | toxic",
  "verdict": "fun.ai sharp verdict",
  "verdictSubtext": "one line summary",
  "badgeEmoji": "emoji",
  "badgeLabel": "short badge",
  "confidence": "100%",
  "stats": {
    "sarcasm": 90,
    "toxicity": 80,
    "stuffiness": 10,
    "vibe": 50
  },
  "translation": "fun.ai direct response face-to-face to user",
  "unspokenMotive": "hidden underlying motive",
  "advice": "situational advice",
  "recommendedReply": "comeback reply line",
  "detectedSlang": [
    { "word": "word", "meaning": "meaning" }
  ]
}`;

/** Valid detectedTone values */
const VALID_TONES = ['calm', 'cocky', 'vulnerable', 'toxic'];

/**
 * Checks if the API key is valid
 */
export const getApiKey = () => {
  return 'proxy-enabled';
};

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
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Attempt 1: Direct JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // Attempt 2: Sanitize control characters / unescaped newlines inside strings
    try {
      const sanitized = cleaned
        .replace(/[\u0000-\u001F]+/g, ' ')
        .replace(/\r?\n/g, '\\n');
      return JSON.parse(sanitized);
    } catch (e2) {
      // Attempt 3: Repair unterminated strings and missing closing braces
      try {
        let repaired = cleaned.trim();
        repaired = repaired.replace(/,\s*$/, '');
        if (!repaired.endsWith('}')) {
          if (!repaired.endsWith('"')) repaired += '"';
          repaired += '}';
        }
        return JSON.parse(repaired);
      } catch (e3) {
        console.warn("JSON repair fallback triggered for AI output text:", cleaned.substring(0, 150) + "...");
        
        const extractField = (key) => {
          const match = cleaned.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, 'i'));
          return match ? match[1] : null;
        };

        return {
          intent: extractField('intent') || 'vibe_check',
          detectedTone: extractField('detectedTone') || 'toxic',
          verdict: extractField('verdict') || 'fun.ai Вердикт',
          verdictSubtext: extractField('verdictSubtext') || 'Разбор вынесен.',
          badgeEmoji: extractField('badgeEmoji') || '🤖',
          badgeLabel: extractField('badgeLabel') || 'fun.ai',
          translation: extractField('translation') || cleaned.replace(/[{}"\\[\]]/g, ' ').substring(0, 350) || "Вердикт вынесен.",
          unspokenMotive: extractField('unspokenMotive') || "Скрытый подтекст",
          advice: extractField('advice') || "Продолжайте диалог",
          recommendedReply: extractField('recommendedReply') || "Ок",
          stats: { sarcasm: 80, toxicity: 70, stuffiness: 10, vibe: 30 },
          detectedSlang: []
        };
      }
    }
  }
}

function getDescriptor(score, type, lang) {
  if (lang === 'UZ') {
    if (type === 'vibe') return score >= 80 ? "Super Vayb" : score >= 50 ? "O'rtacha" : "Muzdek Vayb";
    return score >= 80 ? "Maksimal" : score >= 50 ? "Yuqori" : "Past";
  }
  if (lang === 'RU') {
    if (type === 'vibe') return score >= 80 ? "Идеальный Кайф" : score >= 50 ? "Хороший Вайб" : "Минус по Вайбу";
    return score >= 80 ? "Экстремальный" : score >= 50 ? "Высокий" : "Низкий";
  }
  if (type === 'vibe') return score >= 80 ? "Immaculate Chill" : score >= 50 ? "Decent Energy" : "Sub-Zero Vibe";
  return score >= 80 ? "Extreme" : score >= 50 ? "Elevated" : "Low";
}

function detectUzbek(text) {
  const lower = text.toLowerCase();
  const uzbekWords = [
    'jigar', 'brat', 'chotki', 'tinchmi', 'dalbayob', 'qale', 'bormisan',
    'xafa', 'bilan', 'aka', 'uka', 'gap', 'yoxud', 'xop', "xo'p", 'nima', 'qatta',
    'yaxshi', 'salom', 'hayot', 'ishla', "bo'ldi", 'qilamiz', 'kerak', 'emas'
  ];
  return uzbekWords.some(w => lower.includes(w));
}

const RESPONSE_JSON_SCHEMA = {
  name: "fun_ai_response",
  schema: {
    type: "object",
    properties: {
      intent: { type: "string", enum: ["vibe_check", "help"] },
      detectedTone: { type: "string", enum: ["calm", "cocky", "vulnerable", "toxic"] },
      verdict: { type: "string" },
      verdictSubtext: { type: "string" },
      badgeEmoji: { type: "string" },
      badgeLabel: { type: "string" },
      confidence: { type: "string" },
      stats: {
        type: "object",
        properties: {
          sarcasm: { type: "number" },
          toxicity: { type: "number" },
          stuffiness: { type: "number" },
          vibe: { type: "number" }
        },
        required: ["sarcasm", "toxicity", "stuffiness", "vibe"]
      },
      translation: { type: "string" },
      unspokenMotive: { type: "string" },
      advice: { type: "string" },
      recommendedReply: { type: "string" },
      detectedSlang: {
        type: "array",
        items: {
          type: "object",
          properties: {
            word: { type: "string" },
            meaning: { type: "string" }
          },
          required: ["word", "meaning"]
        }
      }
    },
    required: ["intent", "detectedTone", "verdict", "verdictSubtext", "badgeEmoji", "badgeLabel", "confidence", "stats", "translation", "unspokenMotive", "advice", "recommendedReply", "detectedSlang"]
  }
};

/**
 * Analyzes vibe using Perplexity API with Persona modifiers & Long-term user memory
 */
export async function analyzeVibeAI(text, lang = 'RU', conversationHistory = [], attachments = null, personaId = 'troll') {
  const apiKey = getApiKey();

  const attachmentList = Array.isArray(attachments) 
    ? attachments 
    : (attachments ? [attachments] : []);

  let fullPromptText = text || '';

  attachmentList.forEach((att) => {
    if (att && att.extractedText) {
      const fileLabel = att.type === 'pdf' ? 'PDF документ' : 'Текстовый файл';
      const textSnippet = `\n\n[Прикрепленный ${fileLabel} "${att.fileName}":]\n${att.extractedText}`;
      fullPromptText = fullPromptText ? `${fullPromptText}${textSnippet}` : textSnippet;
    }
  });

  const allImages = [];
  attachmentList.forEach((att) => {
    if (att && att.images && Array.isArray(att.images)) {
      allImages.push(...att.images);
    } else if (att && att.thumbnail && att.thumbnail.startsWith('data:image')) {
      allImages.push(att.thumbnail);
    }
  });

  const isUzbekText = lang === 'UZ' || detectUzbek(fullPromptText);
  const activeLang = isUzbekText ? 'UZ' : lang;

  let baseSystemPrompt = SYSTEM_PROMPT_RU;
  if (activeLang === 'UZ') {
    baseSystemPrompt = SYSTEM_PROMPT_UZ;
  } else if (activeLang === 'EN') {
    baseSystemPrompt = SYSTEM_PROMPT_EN;
  }

  const activePersonaObj = PERSONAS[personaId] || PERSONAS.troll;
  const personaModifier = activePersonaObj.systemPromptModifiers[activeLang] || activePersonaObj.systemPromptModifiers.RU;

  if (!apiKey) {
    console.warn("API Key not found in .env. Falling back to local heuristic analyzer.");
    const localResult = analyzeVibeLocal(fullPromptText || 'вложение', activeLang, personaId);
    return {
      ...localResult,
      intent: localResult.intent || 'vibe_check',
      detectedTone: localResult.detectedTone || 'toxic',
      personaId: activePersonaObj.id,
      personaAvatar: activePersonaObj.avatar,
      isAiGenerated: false,
      modelUsed: 'Local Heuristic Engine',
      apiKeyMissing: true
    };
  }

  // Inject active persona modifier
  baseSystemPrompt += `\n\n═══════════════════════════════════════════\nАКТИВНАЯ ЛИЧНОСТЬ СУДЬИ:\n${personaModifier}`;

  // Inject long-term memory about the user
  const userMemoryStr = getFormattedUserMemory();
  if (userMemoryStr) {
    baseSystemPrompt += `\n\n═══════════════════════════════════════════\nДОЛГОСРОЧНАЯ ПАМЯТЬ О ПОЛЬЗОВАТЕЛЕ:\nВот что fun.ai помнит об этом пользователе из прошлых сессий:\n- ${userMemoryStr}\nИспользуй эти факты естественно и подкалывай при случае.`;
  }

  // Vision instruction if images are attached
  if (allImages.length > 0) {
    const visionInstruction = activeLang === 'UZ'
      ? `\n\n═══════════════════════════════════════════\nRASM/KADRLAR TAHLILI:\nFoydalanuvchi rasm(lar) biriktirdi. Rasmda nima borligini qisqacha tasvirlab ber va fun.ai shaxsiyatingga mos ravishda javob ber.`
      : activeLang === 'EN'
        ? `\n\n═══════════════════════════════════════════\nIMAGE/FRAMES ANALYSIS:\nThe user attached image(s). Briefly describe what you see and react in your fun.ai judge persona.`
        : `\n\n═══════════════════════════════════════════\nИНСТРУКЦИЯ ПО АНАЛИЗУ ИЗОБРАЖЕНИЯ:\nПользователь прикрепил изображение(я). Опиши кратко то, что видишь на картинке, и отреагируй в стиле активной личности fun.ai.`;
    
    baseSystemPrompt += visionInstruction;
  }

  const defaultPromptMessage = isUzbekText
    ? (fullPromptText ? `Foydalanuvchi senga yozdi: "${fullPromptText}". Unga fun.ai hakam shaxsiyatingda TO'G'RIDAN-TO'G'RI yuzma-yuz javob ber (tushuntirish va lug'at tahlilisiz!).` : `Biriktirilgan rasm/faylga fun.ai sifatida to'g'ridan-to'g'ri javob ber.`)
    : activeLang === 'EN'
      ? (fullPromptText ? `User wrote to you: "${fullPromptText}". Respond directly as fun.ai judge in second-person (NO dictionary/word explanations!).` : `Respond directly as fun.ai judge to the attached image/file.`)
      : (fullPromptText ? `Пользователь написал тебе: "${fullPromptText}". Ответь ЕМУ НАПРЯМУЮ в лицо как судья fun.ai (БЕЗ разъяснения значения слов, словарей или словарей-справочников!).` : `Ответь напрямую как судья fun.ai на прикрепленное изображение/файл.`);

  const formattedHistory = conversationHistory
    .map(msg => {
      let contentText = msg.role === 'user'
        ? (msg.text || (msg.attachments?.length ? '[Пользователь прикрепил файл]' : '[Вложение]'))
        : (msg.translation || msg.text || '[Ответ]');
      
      contentText = String(contentText).trim();
      if (!contentText) {
        contentText = msg.role === 'user' ? '[Пользователь отправил вложение]' : '[fun.ai вердикт]';
      }

      return {
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: contentText
      };
    });

  let userMessageContent;
  if (allImages.length > 0) {
    userMessageContent = [
      { type: "text", text: defaultPromptMessage }
    ];
    allImages.slice(0, 5).forEach(imgDataUrl => {
      userMessageContent.push({
        type: "image_url",
        image_url: { url: imgDataUrl }
      });
    });
  } else {
    userMessageContent = defaultPromptMessage;
  }

  const requestBody = {
    model: PRIMARY_MODEL,
    messages: [
      { role: 'system', content: baseSystemPrompt },
      ...formattedHistory,
      { role: 'user', content: userMessageContent }
    ],
    temperature: 0.85,
    max_tokens: 2500,
    frequency_penalty: 0.3,
    response_format: {
      type: "json_schema",
      json_schema: RESPONSE_JSON_SCHEMA
    }
  };

  try {
    const response = await fetch(PROXY_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content;
    if (!contentText) {
      throw new Error("Received empty response from AI engine.");
    }

    const aiJson = parseJsonFromText(contentText);

    const sarcasm = Number(aiJson.stats?.sarcasm ?? 50);
    const toxicity = Number(aiJson.stats?.toxicity ?? 30);
    const stuffiness = Number(aiJson.stats?.stuffiness ?? 20);
    const overallVibe = Number(aiJson.stats?.vibe ?? 50);

    const rawTone = aiJson.detectedTone;
    const detectedTone = VALID_TONES.includes(rawTone) ? rawTone : 'calm';
    
    const intent = aiJson.intent === 'help' ? 'help' : 'vibe_check';

    const defaultVerdict = isUzbekText ? "fun.ai Hukmi" : activeLang === 'EN' ? "fun.ai Verdict" : "fun.ai Вердикт";
    const defaultReply   = isUzbekText ? "Chotki javob." : activeLang === 'EN' ? "Read the room." : "Точный ответ.";
    const defaultMotive  = isUzbekText ? "Haqiqiy niyati va muammosi." : activeLang === 'EN' ? "Hidden underlying motive." : "Скрытая суть ситуации.";
    const defaultAdvice  = isUzbekText ? "Vaziyat bo'yicha maslahat." : activeLang === 'EN' ? "Situational advice." : "Совет по ситуации.";

    return {
      intent,
      detectedTone,
      personaId: activePersonaObj.id,
      personaAvatar: activePersonaObj.avatar,
      verdict: aiJson.verdict || defaultVerdict,
      verdictSubtext: aiJson.verdictSubtext || aiJson.translation?.substring(0, 120) || "",
      badgeEmoji: aiJson.badgeEmoji || activePersonaObj.badgeEmoji || "🤖",
      badgeLabel: aiJson.badgeLabel || activePersonaObj.id,
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
      humanTranslation: aiJson.translation || text || "Анализ завершен.",
      unspokenMotive: aiJson.unspokenMotive || defaultMotive,
      proTip: aiJson.advice || defaultAdvice,
      recommendedReply: aiJson.recommendedReply || defaultReply,
      detectedTerms: (aiJson.detectedSlang || []).map(item => ({
        term: item.word || item.term || "—",
        nuance: item.meaning || item.nuance || "—"
      })),
      rawInput: text,
      isAiGenerated: true,
      modelUsed: `fun.ai Engine`
    };

  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("fun.ai API Call Error:", err);
    }
    const localResult = analyzeVibeLocal(fullPromptText || text || 'вложение', activeLang, personaId);
    return {
      ...localResult,
      intent: localResult.intent || 'vibe_check',
      detectedTone: localResult.detectedTone || 'toxic',
      personaId: activePersonaObj.id,
      personaAvatar: activePersonaObj.avatar,
      isAiGenerated: false,
      modelUsed: 'Local Heuristic Fallback',
      apiError: err.message
    };
  }
}
