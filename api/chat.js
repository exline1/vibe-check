// Vercel Serverless Function: Multi-Provider Proxy for AI Chat (Groq + Perplexity)

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const PERPLEXITY_PRIMARY_MODEL = 'sonar-pro';
const PERPLEXITY_FALLBACK_MODEL = 'sonar';

const GROQ_PRIMARY_MODEL = 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

// Cache quota-exceeded status for Perplexity to avoid slow repeated 401 failures
let perplexityQuotaFailedUntil = 0;

// In-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function isRateLimited(ip) {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, clientData);
    return false;
  }

  clientData.count += 1;
  rateLimitMap.set(ip, clientData);
  return clientData.count > MAX_REQUESTS_PER_WINDOW;
}

function ensureExpressRes(res) {
  if (typeof res.status !== 'function') {
    res.status = function(code) {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== 'function') {
    res.json = function(data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }
}

/**
 * Ensures all message content for Groq is a string, flattening multimodal arrays if present.
 */
function sanitizeMessagesForGroq(messages) {
  if (!Array.isArray(messages)) return messages;
  return messages.map(m => {
    if (!m) return m;
    if (typeof m.content === 'string') return m;
    if (Array.isArray(m.content)) {
      const textParts = m.content
        .filter(item => item && item.type === 'text')
        .map(item => item.text);
      const hasImages = m.content.some(item => item && item.type === 'image_url');
      let combined = textParts.join('\n');
      if (hasImages) {
        combined += '\n[Пользователь прикрепил изображение/медиафайл]';
      }
      return { ...m, content: combined || '[Медиафайл]' };
    }
    return { ...m, content: String(m.content || '') };
  });
}

/**
 * Calls Groq chat completions with model and format fallbacks.
 */
async function callGroq(requestBody, groqKey) {
  const modelsToTry = [GROQ_PRIMARY_MODEL, ...GROQ_FALLBACK_MODELS];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const payload = {
        ...requestBody,
        model,
        messages: sanitizeMessagesForGroq(requestBody.messages)
      };

      // Try with requested response_format
      let res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // If json_schema is rejected or fails, retry with json_object
      if (!res.ok && payload.response_format?.type === 'json_schema') {
        console.warn(`Groq (${model}) rejected json_schema (${res.status}). Retrying with json_object...`);
        payload.response_format = { type: 'json_object' };
        res = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        return { ok: true, data };
      }

      const errText = await res.text().catch(() => '');
      console.warn(`Groq model ${model} failed (${res.status}): ${errText}`);
      lastError = new Error(`Groq ${model} (${res.status}): ${errText}`);
    } catch (e) {
      lastError = e;
    }
  }

  return { ok: false, error: lastError };
}

/**
 * Calls Perplexity chat completions with model and schema fallbacks.
 */
async function callPerplexity(requestBody, perplexityKey) {
  try {
    const payload = { ...requestBody };
    if (!payload.model || !payload.model.startsWith('sonar')) {
      payload.model = PERPLEXITY_PRIMARY_MODEL;
    }

    let res = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || res.statusText;
      return { ok: false, status: res.status, message: errMsg };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, status: 500, message: e.message };
  }
}

export default async function handler(req, res) {
  ensureExpressRes(res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // Extract client IP for rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: { message: 'Too many requests. Please wait a minute.' } });
  }

  // Server secret API keys
  const groqKey = (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '').trim();
  const perplexityKey = (process.env.PERPLEXITY_API_KEY || process.env.VITE_PERPLEXITY_API_KEY || '').trim();

  if (!groqKey && !perplexityKey) {
    return res.status(500).json({ error: { message: 'Server API key missing (neither GROQ_API_KEY nor PERPLEXITY_API_KEY configured in .env)' } });
  }

  try {
    let requestBody = req.body;
    if (typeof requestBody === 'string') {
      try { requestBody = JSON.parse(requestBody); } catch (e) {}
    } else if (Buffer.isBuffer(requestBody)) {
      try { requestBody = JSON.parse(requestBody.toString('utf8')); } catch (e) {}
    }

    if (!requestBody || typeof requestBody !== 'object') {
      return res.status(400).json({ error: { message: 'Invalid or missing JSON body' } });
    }

    const now = Date.now();
    const canTryPerplexity = perplexityKey && now > perplexityQuotaFailedUntil;

    // Strategy:
    // 1. If Perplexity key exists and hasn't hit quota recently, try Perplexity
    if (canTryPerplexity) {
      const pResult = await callPerplexity(requestBody, perplexityKey);
      if (pResult.ok) {
        return res.status(200).json(pResult.data);
      }

      console.warn(`Perplexity chat request failed (${pResult.status}: ${pResult.message}). Attempting fallback to Groq AI...`);

      // If Perplexity quota exceeded (401/402/429), back off Perplexity for 5 minutes
      if (pResult.status === 401 || pResult.status === 402 || pResult.status === 429) {
        perplexityQuotaFailedUntil = Date.now() + 5 * 60 * 1000;
        console.warn("Cached Perplexity quota exceeded. Routing subsequent requests directly to Groq AI.");
      }

      // If no Groq key to fall back to, return Perplexity error
      if (!groqKey) {
        return res.status(pResult.status).json({ error: { message: pResult.message } });
      }
    }

    // 2. Call Groq AI (either as primary or fallback)
    if (groqKey) {
      const gResult = await callGroq(requestBody, groqKey);
      if (gResult.ok) {
        return res.status(200).json(gResult.data);
      }

      console.error("Groq AI failed after fallback attempts:", gResult.error);
      return res.status(502).json({ error: { message: gResult.error?.message || 'Groq AI service unavailable' } });
    }

    return res.status(503).json({ error: { message: 'No AI service currently available' } });

  } catch (err) {
    console.error("Proxy Chat Error:", err);
    return res.status(500).json({ error: { message: 'Internal AI proxy error: ' + err.message } });
  }
}
