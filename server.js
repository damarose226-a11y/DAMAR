require('dotenv').config();
const express = require('express');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is required');
}
if (!SUPABASE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required');
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '8mb' }));

function functionUrl(req) {
  return SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/dama-api' + req.originalUrl;
}

function getCookie(req, name) {
  const raw = String(req.headers.cookie || '');
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) {
      return decodeURIComponent(part.slice(i + 1).trim());
    }
  }
  return '';
}

app.use('/api', async (req, res) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(503).json({ error: 'supabase_not_configured' });
  }

  try {
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'apikey': SUPABASE_KEY,
      'authorization': 'Bearer ' + SUPABASE_KEY,
      'x-forwarded-for': String(req.headers['x-forwarded-for'] || req.ip || '')
    };
    const sessionToken = getCookie(req, 'dr_session');
    if (sessionToken) headers.cookie = 'dr_session=' + encodeURIComponent(sessionToken);

    const options = {
      method: req.method,
      headers
    };
    if (!['GET', 'HEAD'].includes(req.method)) {
      options.body = JSON.stringify(req.body || {});
    }

    const upstream = await fetch(functionUrl(req), options);
    const body = Buffer.from(await upstream.arrayBuffer());

    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    const newSession = upstream.headers.get('x-dama-session');
    if (newSession) {
      res.cookie('dr_session', newSession, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
    }

    if (upstream.headers.get('x-dama-clear-session') === '1') {
      res.clearCookie('dr_session', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/'
      });
    }

    res.status(upstream.status).send(body);
  } catch (error) {
    console.error('Supabase proxy error', error);
    res.status(502).json({ error: 'backend_unavailable' });
  }
});

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  index: 'index.html'
}));

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => console.log('Dama Rose server ready'));
}

module.exports = app;
