// Vercel Serverless Function: Proxy for Groq Speech-to-Text (Whisper)

const GROQ_STT_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

// Rate limiting: max 15 STT requests per minute per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

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

export const config = {
  api: {
    bodyParser: false // Pass raw multipart stream to external fetch
  }
};

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

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: { message: 'Too many voice requests. Please wait a minute.' } });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.PERPLEXITY_API_KEY || process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Server Speech API key missing' } });
  }

  try {
    // Collect request body buffer from client
    let rawBody;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      rawBody = Buffer.concat(buffers);
    }

    const contentType = req.headers['content-type'] || '';

    const response = await fetch(GROQ_STT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': contentType
      },
      body: rawBody
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.error?.message || `Speech proxy call failed: ${response.statusText}`;
      return res.status(response.status).json({ error: { message: errorMsg } });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("Proxy Speech Error:", err);
    return res.status(500).json({ error: { message: 'Internal speech proxy error' } });
  }
}
