/**
 * AegisPath Live Centralized Realtime State & Presence Hub
 * Deployed as a Vercel Serverless Endpoint at /api/realtime
 * Provides cross-device instant synchronization for mobile phones, PCs, and Admin Console.
 */

let liveRealtimeState = {
  emergencyActive: false,
  hazards: {
    "zone-a": "none",
    "zone-b": "none",
    "zone-c": "none",
    "zone-d": "none",
    "zone-e": "none"
  },
  crowds: {
    "exit-1": "Low",
    "exit-2": "Low",
    "exit-3": "Low",
    "zone-a": "Low",
    "zone-b": "Low",
    "zone-c": "Low",
    "zone-d": "Low",
    "zone-e": "Low"
  },
  corridorCrowds: {},
  exits: {
    "exit-1": { isOpen: true },
    "exit-2": { isOpen: true },
    "exit-3": { isOpen: true }
  },
  blockedEdges: {},
  emergencyPolicies: {
    allowElevatorsInFire: false,
    accessibleEvacuationStrategy: "refuge_zone"
  },
  distressSignals: {},
  presence: {},
  sensors: {},
  lastUpdated: new Date().toISOString()
};

function prunePresence() {
  const now = Date.now();
  const active = {};
  for (const [id, dev] of Object.entries(liveRealtimeState.presence || {})) {
    if (now - (dev.timestamp || 0) < 35000) {
      active[id] = dev;
    }
  }
  liveRealtimeState.presence = active;
  return active;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  prunePresence();

  if (req.method === 'GET') {
    // Optional query param presence registration during GET
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const deviceId = url.searchParams.get('deviceId');
    const mapId = url.searchParams.get('mapId');
    const roomName = url.searchParams.get('roomName');
    const floor = url.searchParams.get('floor');

    if (deviceId) {
      liveRealtimeState.presence[deviceId] = {
        deviceId,
        deviceType: deviceId.startsWith('dev_mob_') ? 'Mobile Phone' : 'PC / Workstation',
        mapId: mapId || 'campus',
        roomName: roomName || 'Campus Ground',
        floor: floor ? Number(floor) : 1,
        timestamp: Date.now()
      };
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(liveRealtimeState));
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

    if (action === 'heartbeat') {
      const { deviceId, mapId, roomName, floor } = payload;
      if (deviceId) {
        liveRealtimeState.presence[deviceId] = {
          deviceId,
          deviceType: deviceId.startsWith('dev_mob_') ? 'Mobile Phone' : 'PC / Workstation',
          mapId: mapId || 'campus',
          roomName: roomName || 'Campus Ground',
          floor: floor ? Number(floor) : 1,
          timestamp: Date.now()
        };
      }
      prunePresence();
    } else if (action === 'sos') {
      const { signal } = payload;
      if (signal && signal.id) {
        liveRealtimeState.distressSignals[signal.id] = {
          ...signal,
          timestamp: signal.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          rawTimestamp: Date.now(),
          status: 'ACTIVE'
        };
      }
    } else if (action === 'clear_sos') {
      const { id } = payload;
      if (id && liveRealtimeState.distressSignals[id]) {
        delete liveRealtimeState.distressSignals[id];
      }
    } else if (action === 'update_master') {
      const { state } = payload;
      if (state && typeof state === 'object') {
        liveRealtimeState = {
          ...liveRealtimeState,
          ...state,
          presence: { ...liveRealtimeState.presence, ...(state.presence || {}) },
          distressSignals: { ...liveRealtimeState.distressSignals, ...(state.distressSignals || {}) },
          lastUpdated: new Date().toISOString()
        };
      }
    } else if (action === 'reset_all') {
      const keepPresence = { ...liveRealtimeState.presence };
      liveRealtimeState = {
        emergencyActive: false,
        hazards: { "zone-a": "none", "zone-b": "none", "zone-c": "none", "zone-d": "none", "zone-e": "none" },
        crowds: { "exit-1": "Low", "exit-2": "Low", "exit-3": "Low", "zone-a": "Low", "zone-b": "Low", "zone-c": "Low", "zone-d": "Low", "zone-e": "Low" },
        corridorCrowds: {},
        exits: { "exit-1": { isOpen: true }, "exit-2": { isOpen: true }, "exit-3": { isOpen: true } },
        blockedEdges: {},
        emergencyPolicies: { allowElevatorsInFire: false, accessibleEvacuationStrategy: "refuge_zone" },
        distressSignals: {},
        presence: keepPresence,
        sensors: {},
        lastUpdated: new Date().toISOString()
      };
    } else if (payload.emergencyActive !== undefined || payload.hazards || payload.exits || payload.blockedEdges) {
      // Direct state payload
      liveRealtimeState = {
        ...liveRealtimeState,
        ...payload,
        presence: { ...liveRealtimeState.presence, ...(payload.presence || {}) },
        distressSignals: { ...liveRealtimeState.distressSignals, ...(payload.distressSignals || {}) },
        lastUpdated: new Date().toISOString()
      };
    }

    prunePresence();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(liveRealtimeState));
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ error: 'Method not allowed' }));
}
