import crypto from 'crypto';

const ADMIN_USER = process.env.SAFEWAY_ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.SAFEWAY_ADMIN_PASSWORD || 'SafeWay-Demo-2026';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SECRET_KEY = process.env.SESSION_SECRET || 'safeway-v3-secret-session-key-2026';

function safeEqual(value, expected) {
  const a = Buffer.from(String(value));
  const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createSignedToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
    }
  } else if (!body && typeof req.on === 'function') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve({}); }
      });
    });
  }

  const { username, password } = body || {};

  if (!safeEqual(username || '', ADMIN_USER) || !safeEqual(password || '', ADMIN_PASSWORD)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ error: 'Invalid username or passcode' }));
  }

  const token = createSignedToken({
    user: username,
    exp: Date.now() + SESSION_TTL_MS
  });

  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader('Set-Cookie', `safeway_admin_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}`);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true }));
}
