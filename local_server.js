/**
 * SafeWay V3 - High-Performance Web & IoT Gateway Server
 * Serves User Application, Admin Dashboard, and IoT Sensor Endpoints.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import aiHandler from './api/ai.js';
import realtimeHandler from './api/realtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.SAFEWAY_ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.SAFEWAY_ADMIN_PASSWORD || 'SafeWay-Demo-2026';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const adminSessions = new Map();

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }));
}

function isAdmin(req) {
  const token = parseCookies(req).safeway_admin_session;
  const expiresAt = token && adminSessions.get(token);
  if (!expiresAt || expiresAt < Date.now()) {
    if (token) adminSessions.delete(token);
    return false;
  }
  return true;
}

function safeEqual(value, expected) {
  const a = Buffer.from(String(value));
  const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ino': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

// In-memory sensor state buffer
let liveSensorData = {};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = req.url.split('?')[0];

  if (reqPath === '/login' && req.method === 'GET') {
    reqPath = '/admin/login.html';
  }

  if (reqPath === '/api/admin/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const credentials = JSON.parse(body);
        if (!safeEqual(credentials.username || '', ADMIN_USER) || !safeEqual(credentials.password || '', ADMIN_PASSWORD)) {
          res.writeHead(401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
          return res.end(JSON.stringify({ error: 'Invalid username or passcode' }));
        }
        const token = crypto.randomBytes(32).toString('base64url');
        adminSessions.set(token, Date.now() + SESSION_TTL_MS);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Set-Cookie': `safeway_admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`
        });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  if (reqPath === '/api/admin/logout' && req.method === 'POST') {
    const token = parseCookies(req).safeway_admin_session;
    if (token) adminSessions.delete(token);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': 'safeway_admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if ((reqPath === '/admin' || reqPath === '/admin/' || (reqPath.startsWith('/admin/') && reqPath !== '/admin/login.html')) && !isAdmin(req)) {
    res.writeHead(302, { Location: '/login', 'Cache-Control': 'no-store' });
    res.end();
    return;
  }

  // Groq AI Copilot & SITREP Endpoint
  if (reqPath === '/api/ai' || reqPath === '/api/ai/') {
    return aiHandler(req, res);
  }

  // Live Realtime State Hub Endpoint
  if (reqPath === '/api/realtime' || reqPath === '/api/realtime/') {
    return realtimeHandler(req, res);
  }

  // IoT Sensor Ingestion Endpoint for ESP32 Nodes
  if (reqPath.startsWith('/api/sensor') && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const sensorId = payload.sensorId || 'esp32-node';
        liveSensorData[sensorId] = {
          ...payload,
          receivedAt: new Date().toISOString()
        };
        console.log(`[IoT Gateway] Telemetry from ${sensorId}:`, payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', sensorId, time: new Date().toISOString() }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Get live sensors API
  if (reqPath === '/api/sensors' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(liveSensorData));
    return;
  }

  // Map route URLs to files
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (reqPath === '/admin' || reqPath === '/admin/') {
    reqPath = '/admin/index.html';
  }

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Not Found: ${reqPath}`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  SafeWay V3 — Live Server Active`);
  console.log(`  User Application:  http://localhost:${PORT}/`);
  console.log(`  Admin Dashboard:   http://localhost:${PORT}/admin/`);
  console.log(`  IoT Sensor API:    http://localhost:${PORT}/api/sensor`);
  console.log(`======================================================\n`);
});
