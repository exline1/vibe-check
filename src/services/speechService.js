/**
 * Speech Service: Groq STT (Whisper-large-v3-turbo) & Browser Web Speech API TTS
 */

const GROQ_STT_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

/**
 * Transcribes audio blob using Groq Speech-to-Text API (Whisper-large-v3-turbo)
 */
export async function transcribeAudioGroq(audioBlob, lang = 'RU') {
  let apiKey = '';
  if (typeof process !== 'undefined' && process.env && process.env.VITE_GROQ_API_KEY) {
    apiKey = process.env.VITE_GROQ_API_KEY;
  } else if (typeof import.meta !== 'undefined' && import.meta.env) {
    apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_PERPLEXITY_API_KEY || '';
  }

  if (!apiKey || apiKey.includes('your_')) {
    throw new Error('Для работы распознавания речи нужен VITE_GROQ_API_KEY в .env');
  }

  const formData = new FormData();
  const file = new File([audioBlob], 'speech.webm', { type: audioBlob.type || 'audio/webm' });
  formData.append('file', file);
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('response_format', 'json');

  const langCode = (lang || 'RU').toLowerCase();
  if (['ru', 'uz', 'en'].includes(langCode)) {
    formData.append('language', langCode);
  }

  const response = await fetch(GROQ_STT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errorMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Ошибка распознавания Groq STT: ${errorMsg}`);
  }

  const data = await response.json();
  const transcribedText = (data.text || '').trim();

  if (!transcribedText) {
    throw new Error('Не удалось распознать речь (запись слишком тихая или короткая)');
  }

  return transcribedText;
}

/**
 * Text-to-Speech using Web Speech API (window.speechSynthesis)
 */
export function speakText(text, lang = 'RU', detectedTone = 'calm', callbacks = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Web Speech API не поддерживается вашим браузером.");
    if (callbacks.onError) callbacks.onError("Синтез речи не поддерживается браузером");
    return false;
  }

  // Cancel any currently playing speech
  window.speechSynthesis.cancel();

  // Strip code fences or markdown bold/italics for cleaner speech readout
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .trim();

  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  const langTarget = (lang || 'RU').toUpperCase();

  const getMatchedVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (langTarget === 'UZ') {
      // Look for uzbek voice first, fallback to ru or tr
      return voices.find(v => v.lang.toLowerCase().startsWith('uz')) ||
             voices.find(v => v.lang.toLowerCase().startsWith('ru')) ||
             voices.find(v => v.lang.toLowerCase().startsWith('tr')) ||
             voices[0];
    }
    if (langTarget === 'EN') {
      return voices.find(v => v.lang.toLowerCase().startsWith('en-us')) ||
             voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
             voices[0];
    }
    // RU
    return voices.find(v => v.lang.toLowerCase().startsWith('ru-ru')) ||
           voices.find(v => v.lang.toLowerCase().startsWith('ru')) ||
           voices[0];
  };

  const voice = getMatchedVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = langTarget === 'UZ' ? 'uz-UZ' : langTarget === 'EN' ? 'en-US' : 'ru-RU';
  }

  // Tone-based pitch & rate modulation for persona expression
  switch (detectedTone) {
    case 'toxic':
      utterance.rate = 1.12;
      utterance.pitch = 0.9;
      break;
    case 'vulnerable':
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      break;
    case 'cocky':
      utterance.rate = 1.08;
      utterance.pitch = 1.1;
      break;
    default: // calm
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
  }

  if (callbacks.onStart) utterance.onstart = callbacks.onStart;
  if (callbacks.onEnd) utterance.onend = callbacks.onEnd;
  utterance.onerror = (e) => {
    // Ignore normal cancellation/interruption events
    if (e.error === 'canceled' || e.error === 'interrupted') {
      if (callbacks.onEnd) callbacks.onEnd();
      return;
    }
    console.warn("SpeechSynthesis warning:", e.error || e);
    if (callbacks.onError) callbacks.onError(e.error || e);
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    if (callbacks.onError) callbacks.onError(e);
  }
  return true;
}

/**
 * Stops any ongoing SpeechSynthesis
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
