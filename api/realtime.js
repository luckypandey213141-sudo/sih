/**
 * AegisPath Live Centralized Realtime State & Presence Hub
 * Deployed as a Vercel Serverless Endpoint at /api/realtime
 * Backed by Persistent Storage Adapter + Server-Side HMAC Admin Authentication.
 */

import { authenticateAdmin } from './_auth.js';
import { getRealtimeState, saveRealtimeState } from './_store.js';

function prunePresence(state) {
  const now = Date.now();
  const active = {};
  for (const [id, dev] of Object.entries(state.presence || {})) {
    if (now - (dev.timestamp || 0) < 35000) {
      active[id] = dev;
    }
  }
  state.presence = active;
  return active;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Sensor-Auth, X-Admin-Auth, X-Requested-With');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  let currentState = await getRealtimeState();
  prunePresence(currentState);

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const deviceId = url.searchParams.get('deviceId');
    const mapId = url.searchParams.get('mapId');
    const roomName = url.searchParams.get('roomName');
    const floor = url.searchParams.get('floor');

    if (deviceId) {
      if (!currentState.presence) currentState.presence = {};
      currentState.presence[deviceId] = {
        deviceId,
        deviceType: deviceId.startsWith('dev_mob_') ? 'Mobile Phone' : 'PC / Workstation',
        mapId: mapId || 'campus',
        roomName: roomName || 'Campus Ground',
        floor: floor ? Number(floor) : 1,
        timestamp: Date.now()
      };
      await saveRealtimeState(currentState);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(currentState));
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = {};
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

    if (!payload || typeof payload !== 'object') {
      payload = {};
    }

    const { action } = payload;

    // Public actions allowed without admin authentication
    const isPublicAction = action === 'heartbeat' || action === 'sos' || action === 'clear_sos';

    // State-mutating actions require admin authentication
    if (!isPublicAction) {
      const auth = authenticateAdmin(req);
      if (!auth.authenticated) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Unauthorized: Valid Admin Session or Auth Token Required' }));
      }
    }

    if (action === 'heartbeat') {
      const { deviceId, mapId, roomName, floor } = payload;
      if (deviceId) {
        if (!currentState.presence) currentState.presence = {};
        currentState.presence[deviceId] = {
          deviceId,
          deviceType: deviceId.startsWith('dev_mob_') ? 'Mobile Phone' : 'PC / Workstation',
          mapId: mapId || 'campus',
          roomName: roomName || 'Campus Ground',
          floor: floor ? Number(floor) : 1,
          timestamp: Date.now()
        };
      }
    } else if (action === 'sos') {
      const { signal } = payload;
      if (signal && signal.id) {
        if (!currentState.distressSignals) currentState.distressSignals = {};
        currentState.distressSignals[signal.id] = {
          ...signal,
          timestamp: signal.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          rawTimestamp: Date.now(),
          status: 'ACTIVE'
        };
      }
    } else if (action === 'clear_sos') {
      const { id, resolvedRecord } = payload;
      if (id) {
        if (!currentState.resolvedDistressSignals) currentState.resolvedDistressSignals = {};
        const activeSignal = (currentState.distressSignals && currentState.distressSignals[id]) || resolvedRecord || { id };
        currentState.resolvedDistressSignals[id] = {
          ...activeSignal,
          status: 'RESCUED_RESOLVED',
          resolvedAt: activeSignal.resolvedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          resolvedTimestamp: activeSignal.resolvedTimestamp || Date.now()
        };
        if (currentState.distressSignals && currentState.distressSignals[id]) {
          delete currentState.distressSignals[id];
        }
        currentState.version = (currentState.version || 0) + 1;
        currentState.lastUpdated = new Date().toISOString();
      }
    } else if (action === 'delete_archived_sos') {
      const { id } = payload;
      if (id && currentState.resolvedDistressSignals && currentState.resolvedDistressSignals[id]) {
        delete currentState.resolvedDistressSignals[id];
        currentState.version = (currentState.version || 0) + 1;
        currentState.lastUpdated = new Date().toISOString();
      }
    } else if (action === 'clear_all_audit') {
      currentState.resolvedDistressSignals = {};
      currentState.version = (currentState.version || 0) + 1;
      currentState.lastUpdated = new Date().toISOString();
    } else if (action === 'update_master') {
      const { state } = payload;
      if (state && typeof state === 'object') {
        currentState = {
          ...currentState,
          ...state,
          presence: { ...currentState.presence, ...(state.presence || {}) },
          distressSignals: { ...currentState.distressSignals, ...(state.distressSignals || {}) },
          resolvedDistressSignals: state.resolvedDistressSignals !== undefined ? state.resolvedDistressSignals : (currentState.resolvedDistressSignals || {}),
          version: (currentState.version || 0) + 1,
          lastUpdated: new Date().toISOString()
        };
      }
    } else if (action === 'reset_all') {
      const keepPresence = { ...(currentState.presence || {}) };
      const keepResolvedDistress = { ...(currentState.resolvedDistressSignals || {}) };
      currentState = {
        emergencyActive: false,
        hazards: { "zone-a": "none", "zone-b": "none", "zone-c": "none", "zone-d": "none", "zone-e": "none" },
        crowds: { "exit-1": "Low", "exit-2": "Low", "exit-3": "Low", "zone-a": "Low", "zone-b": "Low", "zone-c": "Low", "zone-d": "Low", "zone-e": "Low" },
        corridorCrowds: {},
        exits: { "exit-1": { isOpen: true }, "exit-2": { isOpen: true }, "exit-3": { isOpen: true } },
        blockedEdges: {},
        emergencyPolicies: { allowElevatorsInFire: false, accessibleEvacuationStrategy: "refuge_zone" },
        distressSignals: {},
        resolvedDistressSignals: keepResolvedDistress,
        presence: keepPresence,
        sensors: {},
        version: (currentState.version || 0) + 1,
        lastUpdated: new Date().toISOString()
      };
    } else if (payload.emergencyActive !== undefined || payload.hazards || payload.exits || payload.blockedEdges) {
      // Direct state payload from Admin Console
      currentState = {
        ...currentState,
        ...payload,
        presence: { ...(currentState.presence || {}), ...(payload.presence || {}) },
        distressSignals: { ...(currentState.distressSignals || {}), ...(payload.distressSignals || {}) },
        resolvedDistressSignals: payload.resolvedDistressSignals !== undefined ? payload.resolvedDistressSignals : (currentState.resolvedDistressSignals || {}),
        version: (currentState.version || 0) + 1,
        lastUpdated: new Date().toISOString()
      };
    }

    prunePresence(currentState);
    await saveRealtimeState(currentState);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(currentState));
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ error: 'Method not allowed' }));
}
