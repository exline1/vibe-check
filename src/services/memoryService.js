/**
 * Long-Term Memory Service for fun.ai
 * Summarizes chat sessions and persists user facts in localStorage.
 */

const MEMORY_STORAGE_KEY = 'fun_ai_user_memory';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Gets accumulated memory facts about the user
 */
export function getUserMemory() {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load user memory:", e);
    return [];
  }
}

/**
 * Gets formatted user memory string for prompt injection
 */
export function getFormattedUserMemory() {
  const memoryList = getUserMemory();
  if (!memoryList || memoryList.length === 0) return '';
  return memoryList.join('\n- ');
}

/**
 * Saves memory list to localStorage
 */
export function saveUserMemory(memoryList) {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memoryList.slice(-8)));
  } catch (e) {
    console.error("Failed to save user memory:", e);
  }
}

/**
 * Clears user memory completely
 */
export function clearUserMemory() {
  try {
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear memory:", e);
  }
}

/**
 * Summarizes key user facts from conversation history using Perplexity API
 */
export async function summarizeAndStoreMemory(conversationHistory, apiKey) {
  if (!apiKey || !conversationHistory || conversationHistory.length < 3) return;

  const textTranscript = conversationHistory
    .map(m => `${m.role === 'user' ? 'Пользователь' : 'fun.ai'}: ${m.text || m.translation || ''}`)
    .join('\n');

  const requestBody = {
    model: 'sonar',
    messages: [
      {
        role: 'system',
        content: 'Ты — саммарайзер долгосрочной памяти fun.ai. Напиши 1-2 кратких тезиса о пользователе (имя, характерные темы, его понты или привычки) на основе диалога. Коротко, максимум 2 предложения. Только факты.'
      },
      {
        role: 'user',
        content: `Диалог:\n${textTranscript}`
      }
    ],
    temperature: 0.3,
    max_tokens: 150
  };

  try {
    const res = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) return;

    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (summary && summary.length > 5) {
      const existing = getUserMemory();
      // Avoid exact duplicates
      if (!existing.includes(summary)) {
        const updated = [...existing, summary];
        saveUserMemory(updated);
      }
    }
  } catch (err) {
    console.warn("Memory summarization failed:", err);
  }
}
