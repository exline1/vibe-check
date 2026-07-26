import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import chatHandler from './api/chat.js'
import speechHandler from './api/speech-to-text.js'

async function parseRequestBody(req) {
  if (req.body !== undefined) return req.body;
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(buffer.toString('utf8')));
        } catch {
          resolve(buffer.toString('utf8'));
        }
      } else {
        resolve(buffer);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function polyfillRes(res) {
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

// Vite plugin to route /api/* requests to serverless handlers during local development
function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      // Load environment variables into process.env for local dev
      const env = loadEnv('development', process.cwd(), '');
      Object.assign(process.env, env);

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        
        if (url === '/api/chat') {
          try {
            polyfillRes(res);
            req.body = await parseRequestBody(req);
            await chatHandler(req, res);
          } catch (e) {
            console.error("Local dev /api/chat error:", e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: { message: e.message } }));
          }
          return;
        }

        if (url === '/api/speech-to-text') {
          try {
            polyfillRes(res);
            await speechHandler(req, res);
          } catch (e) {
            console.error("Local dev /api/speech-to-text error:", e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: { message: e.message } }));
          }
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServerPlugin()],
})
