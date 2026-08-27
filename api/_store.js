/**
 * SafeWay V3 - Persistent Serverless Storage Adapter
 * Backed by Vercel KV (Redis REST API) with automatic persistent file fallback in /tmp/.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const TMP_DIR = os.tmpdir();
const REALTIME_STATE_FILE = path.join(TMP_DIR, 'safeway_live_realtime_state.json');
const SENSOR_DATA_FILE = path.join(TMP_DIR, 'safeway_live_sensor_data.json');

// In-memory cache
let inMemoryRealtimeState = null;
let inMemorySensorData = null;

const DEFAULT_REALTIME_STATE = {
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
  resolvedDistressSignals: {},
  presence: {},
  sensors: {},
  version: 1,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_SENSOR_DATA = {
  "esp32-zone-b": {
    sensorId: "esp32-zone-b",
    zone: "zone-b",
    location: "Physics Lab 101 (East Wing)",
    smokeDetected: false,
    flameDetected: false,
    temperature: 24.5,
    occupancy: 4,
    crowdLevel: "Low",
    hazardLevel: "none",
    lastUpdate: new Date().toISOString()
  },
  "esp32-zone-c": {
    sensorId: "esp32-zone-c",
    zone: "zone-c",
    location: "Cafeteria & Dining (1F)",
    smokeDetected: false,
    flameDetected: false,
    temperature: 23.8,
    occupancy: 14,
    crowdLevel: "Medium",
    hazardLevel: "none",
    lastUpdate: new Date().toISOString()
  }
};

/**
 * Execute command against Vercel KV REST API if configured
 */
async function kvCommand(cmd, ...args) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const url = `${KV_URL}/${cmd}/${args.map(a => encodeURIComponent(typeof a === 'object' ? JSON.stringify(a) : String(a))).join('/')}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch (err) {
    console.warn('[Vercel KV] REST fetch error, falling back:', err?.message);
    return null;
  }
}

/**
 * Load Realtime State with persistence
 */
export async function getRealtimeState() {
  // 1. Try Vercel KV
  if (KV_URL && KV_TOKEN) {
    const kvData = await kvCommand('get', 'safeway:realtime_state');
    if (kvData) {
      try {
        const parsed = typeof kvData === 'string' ? JSON.parse(kvData) : kvData;
        inMemoryRealtimeState = { ...DEFAULT_REALTIME_STATE, ...parsed };
        return inMemoryRealtimeState;
      } catch {}
    }
  }

  // 2. Try file storage fallback
  if (inMemoryRealtimeState) return inMemoryRealtimeState;
  try {
    if (fs.existsSync(REALTIME_STATE_FILE)) {
      const data = fs.readFileSync(REALTIME_STATE_FILE, 'utf8');
      inMemoryRealtimeState = { ...DEFAULT_REALTIME_STATE, ...JSON.parse(data) };
      return inMemoryRealtimeState;
    }
  } catch (err) {
    console.warn('[Store] Local file read error:', err?.message);
  }

  // 3. Return default initial state
  inMemoryRealtimeState = { ...DEFAULT_REALTIME_STATE };
  return inMemoryRealtimeState;
}

/**
 * Save Realtime State with persistence
 */
export async function saveRealtimeState(state) {
  inMemoryRealtimeState = state;

  // 1. Save to Vercel KV
  if (KV_URL && KV_TOKEN) {
    kvCommand('set', 'safeway:realtime_state', JSON.stringify(state)).catch(() => {});
  }

  // 2. Save to file storage
  try {
    fs.writeFileSync(REALTIME_STATE_FILE, JSON.stringify(state), 'utf8');
  } catch (err) {
    console.warn('[Store] Local file write error:', err?.message);
  }

  return inMemoryRealtimeState;
}

/**
 * Load Sensor Data with persistence
 */
export async function getSensorData() {
  if (KV_URL && KV_TOKEN) {
    const kvData = await kvCommand('get', 'safeway:sensor_data');
    if (kvData) {
      try {
        const parsed = typeof kvData === 'string' ? JSON.parse(kvData) : kvData;
        inMemorySensorData = { ...DEFAULT_SENSOR_DATA, ...parsed };
        return inMemorySensorData;
      } catch {}
    }
  }

  if (inMemorySensorData) return inMemorySensorData;
  try {
    if (fs.existsSync(SENSOR_DATA_FILE)) {
      const data = fs.readFileSync(SENSOR_DATA_FILE, 'utf8');
      inMemorySensorData = { ...DEFAULT_SENSOR_DATA, ...JSON.parse(data) };
      return inMemorySensorData;
    }
  } catch (err) {
    console.warn('[Store] Local sensor file read error:', err?.message);
  }

  inMemorySensorData = { ...DEFAULT_SENSOR_DATA };
  return inMemorySensorData;
}

/**
 * Save Sensor Data with persistence
 */
export async function saveSensorData(data) {
  inMemorySensorData = data;

  if (KV_URL && KV_TOKEN) {
    kvCommand('set', 'safeway:sensor_data', JSON.stringify(data)).catch(() => {});
  }

  try {
    fs.writeFileSync(SENSOR_DATA_FILE, JSON.stringify(data), 'utf8');
  } catch (err) {
    console.warn('[Store] Local sensor file write error:', err?.message);
  }

  return inMemorySensorData;
}
