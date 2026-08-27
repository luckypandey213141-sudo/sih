/**
 * SafeWay V3 - IoT Sensor Node Ingestion & Telemetry API
 * Deployed as a Vercel Serverless Endpoint at /api/sensor
 * Protected by Server-Side Authentication & Persistent Storage Adapter.
 */

import { authenticateAdmin } from './_auth.js';
import { getSensorData, saveSensorData } from './_store.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Sensor-Auth, X-Admin-Auth, X-Requested-With');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const liveSensorData = await getSensorData();

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(liveSensorData));
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    // Require valid authentication (admin session, bearer token, or sensor secret)
    const auth = authenticateAdmin(req);
    if (!auth.authenticated) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Unauthorized: Valid IoT Auth Token or Admin Session Required' }));
    }

    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    } else if (!payload && typeof req.on === 'function') {
      payload = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
          try { resolve(JSON.parse(data)); } catch { resolve({}); }
        });
      });
    }

    const sensorId = (payload && payload.sensorId) || 'esp32-node';
    const timestamp = new Date().toISOString();

    liveSensorData[sensorId] = {
      ...payload,
      receivedAt: timestamp
    };

    await saveSensorData(liveSensorData);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ status: 'ok', sensorId, time: timestamp }));
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
