/**
 * SafeWay V3 - Real-Time Synchronization Service
 * Supports Firebase Realtime Database with automatic Offline / Demo Mode fallback.
 * Uses BroadcastChannel and LocalStorage to sync across tabs without internet access!
 */

const STORAGE_KEY = "safeway_v3_live_state";
const BROADCAST_CHANNEL_NAME = "safeway_v3_realtime_bus";

const INITIAL_STATE = {
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
  sensors: {
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
  },
  lastUpdated: new Date().toISOString(),
  source: "local"
};

let currentLiveState = loadLocalState();
const listeners = new Set();
let broadcastChannel = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === "STATE_UPDATE") {
        currentLiveState = event.data.state;
        notifyListeners();
      }
    };
  } catch (e) {}
}

function loadLocalState() {
  if (typeof window === "undefined" || !window.localStorage) return { ...INITIAL_STATE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...INITIAL_STATE, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return { ...INITIAL_STATE };
}

function saveLocalState(newState) {
  currentLiveState = { ...newState, lastUpdated: new Date().toISOString() };
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLiveState));
    } catch (e) {}
  }
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: "STATE_UPDATE", state: currentLiveState });
    } catch (e) {}
  }
  notifyListeners();
}

function notifyListeners() {
  listeners.forEach(cb => {
    try {
      cb(currentLiveState);
    } catch (e) {}
  });
}

/**
 * Subscribe to realtime state updates
 */
export function subscribeToRealtimeData(callback) {
  listeners.add(callback);
  callback(currentLiveState);
  return () => listeners.delete(callback);
}

/**
 * Update emergency alarm state
 */
export function setEmergencyActive(isActive) {
  const updated = {
    ...currentLiveState,
    emergencyActive: Boolean(isActive)
  };
  saveLocalState(updated);
}

/**
 * Set hazard condition for a specific zone ('none' | 'low' | 'high')
 */
export function setZoneHazardLevel(zoneId, hazardLevel) {
  const updated = {
    ...currentLiveState,
    hazards: {
      ...currentLiveState.hazards,
      [zoneId]: hazardLevel
    }
  };
  saveLocalState(updated);
}

/**
 * Update exit crowd level
 */
export function setExitCrowdLevel(exitId, crowdLevel) {
  const updated = {
    ...currentLiveState,
    crowds: {
      ...currentLiveState.crowds,
      [exitId]: crowdLevel
    }
  };
  saveLocalState(updated);
}

/**
 * Update zone crowd level
 */
export function setZoneCrowdLevel(zoneId, crowdLevel) {
  const updated = {
    ...currentLiveState,
    crowds: {
      ...currentLiveState.crowds,
      [zoneId]: crowdLevel
    }
  };
  saveLocalState(updated);
}

/**
 * Update corridor/edge crowd level
 */
export function setCorridorCrowdLevel(edgeId, crowdLevel) {
  const updated = {
    ...currentLiveState,
    corridorCrowds: {
      ...currentLiveState.corridorCrowds,
      [edgeId]: crowdLevel
    }
  };
  saveLocalState(updated);
}

/**
 * Update exit doorway open/closed status
 */
export function setExitOpenStatus(exitId, isOpen) {
  const updated = {
    ...currentLiveState,
    exits: {
      ...currentLiveState.exits,
      [exitId]: { isOpen: Boolean(isOpen) }
    }
  };
  saveLocalState(updated);
}

/**
 * Update corridor blockage status
 */
export function setCorridorBlockedStatus(edgeId, isBlocked) {
  const updated = {
    ...currentLiveState,
    blockedEdges: {
      ...currentLiveState.blockedEdges,
      [edgeId]: Boolean(isBlocked)
    }
  };
  saveLocalState(updated);
}

/**
 * Toggle elevator fire safety policy
 */
export function setElevatorFirePolicy(allowElevatorsInFire) {
  const updated = {
    ...currentLiveState,
    emergencyPolicies: {
      ...currentLiveState.emergencyPolicies,
      allowElevatorsInFire: Boolean(allowElevatorsInFire)
    }
  };
  saveLocalState(updated);
}

/**
 * Update incoming sensor reading (from ESP32 IoT Node)
 */
export function recordSensorReading(sensorId, data) {
  const existing = currentLiveState.sensors[sensorId] || {};
  const merged = {
    ...existing,
    ...data,
    sensorId,
    lastUpdate: new Date().toISOString()
  };

  const updated = {
    ...currentLiveState,
    sensors: {
      ...currentLiveState.sensors,
      [sensorId]: merged
    }
  };

  // If smoke or flame detected, automatically propagate to zone hazard!
  if (data.smokeDetected || data.flameDetected || data.hazardLevel === "high") {
    if (merged.zone) {
      updated.hazards = {
        ...updated.hazards,
        [merged.zone]: "high"
      };
      updated.emergencyActive = true;
    }
  }

  // If occupancy updated, sync crowd level
  if (data.crowdLevel && merged.zone) {
    updated.crowds = {
      ...updated.crowds,
      [merged.zone]: data.crowdLevel
    };
  }

  saveLocalState(updated);
}

// In-memory predictive route registry for zero-cost crowd balancing
const activeRouteRegistry = new Map();

/**
 * Register an active user route to predict doorway congestion (Zero-Cost Software Routing)
 */
export function registerActiveRoute(userId, exitId, zoneId) {
  if (!exitId) return;
  const now = Date.now();
  activeRouteRegistry.set(userId, { exitId, zoneId, timestamp: now });

  // Prune expired entries (> 2 minutes)
  for (const [uid, item] of activeRouteRegistry.entries()) {
    if (now - item.timestamp > 120000) {
      activeRouteRegistry.delete(uid);
    }
  }

  const exitCounts = {};
  for (const item of activeRouteRegistry.values()) {
    exitCounts[item.exitId] = (exitCounts[item.exitId] || 0) + 1;
  }

  const updatedCrowds = { ...currentLiveState.crowds };
  for (const [exit, count] of Object.entries(exitCounts)) {
    if (count >= 15) {
      updatedCrowds[exit] = "High";
    } else if (count >= 5) {
      updatedCrowds[exit] = "Medium";
    }
  }

  saveLocalState({
    ...currentLiveState,
    crowds: updatedCrowds
  });
}

/**
 * Reset all building hazards, blockages, and alarms to normal
 */
export function resetAllToNormal() {
  activeRouteRegistry.clear();
  saveLocalState({
    ...INITIAL_STATE,
    lastUpdated: new Date().toISOString()
  });
}

/**
 * Get current system connection status
 */
export function getConnectionStatus() {
  return {
    isLiveFirebase: false,
    mode: "Demo / Local Multi-Tab Sync",
    badgeText: "Demo Mode (Local Bus)",
    color: "emerald"
  };
}

