// Vercel Serverless Function: Proxy for Perplexity Chat API

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PRIMARY_MODEL = 'sonar-pro';
const FALLBACK_MODEL = 'sonar';

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

  // Get server-side secret API keys
  const apiKey = process.env.PERPLEXITY_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_PERPLEXITY_API_KEY || process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Server API key missing' } });
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

    let response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn(`Primary chat request failed (${response.status}). Attempting fallback...`);

      // Retry without json_schema or with fallback model
      delete requestBody.response_format;
      response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        requestBody.model = FALLBACK_MODEL;
        response = await fetch(PERPLEXITY_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.error?.message || `Proxy call failed: ${response.statusText}`;
      return res.status(response.status).json({ error: { message: errorMsg } });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("Proxy Chat Error:", err);
    return res.status(500).json({ error: { message: 'Internal AI proxy error' } });
  }
}
