/**
 * SafeWay V3 - Server-Side Authentication & Session Verification Helper
 * Validates HMAC-SHA256 signed session tokens from cookies or Authorization header.
 */

import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'safeway-v3-secret-session-key-2026';
const SENSOR_SHARED_SECRET = process.env.SAFEWAY_SENSOR_SECRET || 'safeway-iot-sensor-auth-2026';

export function parseCookies(req) {
  return Object.fromEntries((req.headers?.cookie || '').split(';').filter(Boolean).map(part => {
    const index = part.indexOf('=');
    if (index === -1) return [part.trim(), ''];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function verifySignedToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(dataB64).digest('base64url');

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Authenticates request against admin session cookie, Bearer token, or IoT sensor secret.
 */
export function authenticateAdmin(req) {
  const cookies = parseCookies(req);
  const cookieToken = cookies.safeway_admin_session;

  // 1. Check session cookie
  if (cookieToken) {
    const payload = verifySignedToken(cookieToken);
    if (payload) return { authenticated: true, user: payload.user, role: 'admin' };
  }

  // 2. Check Authorization header
  const authHeader = req.headers?.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    const payload = verifySignedToken(bearerToken);
    if (payload) return { authenticated: true, user: payload.user, role: 'admin' };

    // Also allow configured sensor secret key
    if (bearerToken === SENSOR_SHARED_SECRET) {
      return { authenticated: true, user: 'iot-sensor-node', role: 'sensor' };
    }
  }

  // 3. Check X-Sensor-Auth or X-Admin-Auth header
  const customAuth = req.headers?.['x-sensor-auth'] || req.headers?.['x-admin-auth'];
  if (customAuth) {
    if (customAuth === SENSOR_SHARED_SECRET) {
      return { authenticated: true, user: 'iot-sensor-node', role: 'sensor' };
    }
    const payload = verifySignedToken(customAuth);
    if (payload) return { authenticated: true, user: payload.user, role: 'admin' };
  }

  return { authenticated: false };
}
