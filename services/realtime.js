
export function setZoneHazardLevel(zoneId, hazardLevel) {
  lastLocalActionTime = Date.now();
  const updated = {
    ...currentLiveState,
    hazards: {
      ...currentLiveState.hazards,
      [zoneId]: hazardLevel
    }
  };
  saveLocalState(updated, true);
}

/**
 * Update exit crowd level
 */
export function setExitCrowdLevel(exitId, crowdLevel) {
  lastLocalActionTime = Date.now();
  const updated = {
    ...currentLiveState,
    crowds: {
      ...currentLiveState.crowds,
      [exitId]: crowdLevel
    }
  };
  saveLocalState(updated, true);
}

/**
 * Update zone crowd level
 */
export function setZoneCrowdLevel(zoneId, crowdLevel) {
  lastLocalActionTime = Date.now();
  const updated = {
    ...currentLiveState,
    crowds: {
      ...currentLiveState.crowds,
      [zoneId]: crowdLevel
    }
  };
  saveLocalState(updated, true);
}

/**
 * Update corridor/edge crowd level
 */
export function setCorridorCrowdLevel(edgeId, crowdLevel) {
  lastLocalActionTime = Date.now();
  const updated = {
    ...currentLiveState,
    corridorCrowds: {
      ...currentLiveState.corridorCrowds,
      [edgeId]: crowdLevel
    }
  };
  saveLocalState(updated, true);
}

/**
 * Update exit doorway open/closed status
 */
export function setExitOpenStatus(exitId, isOpen) {
  lastLocalActionTime = Date.now();
  const updated = {
    ...currentLiveState,
    exits: {
      ...currentLiveState.exits,
      [exitId]: { isOpen: Boolean(isOpen) }
    }
  };
  saveLocalState(updated, true);
}

/**
 * Update corridor blockage status
 */
export function setCorridorBlockedStatus(edgeId, isBlocked) {
  lastLocalActionTime = Date.now();
  const updated = {
    ...currentLiveState,
    blockedEdges: {
      ...currentLiveState.blockedEdges,
      [edgeId]: Boolean(isBlocked)
    }
  };
  saveLocalState(updated, true);
}

/**
 * Toggle elevator fire safety policy
 */
export function setElevatorFirePolicy(allowElevatorsInFire) {
  lastLocalActionTime = Date.now();
  const updated = {
    ...currentLiveState,
    emergencyPolicies: {
      ...currentLiveState.emergencyPolicies,
      allowElevatorsInFire: Boolean(allowElevatorsInFire)
    }
  };
  saveLocalState(updated, true);
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

  if (data.smokeDetected || data.flameDetected || data.hazardLevel === "high") {
    if (merged.zone) {
      updated.hazards = {
        ...updated.hazards,
        [merged.zone]: "high"
      };
      updated.emergencyActive = true;
    }
  }

  if (data.crowdLevel && merged.zone) {
    updated.crowds = {
      ...updated.crowds,
      [merged.zone]: data.crowdLevel
    };
  }

  saveLocalState(updated, true);
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
  }, true);
}

/**
 * Transmit an Emergency SOS Trapped Beacon with Reason and 10s Audio to the Security Operations Console
 */
export function sendDistressSignal(signal) {
  lastLocalActionTime = Date.now();
  const deviceId = getDeviceId();
  const id = signal.id || `sos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const record = {
    id,
    deviceId: signal.deviceId || deviceId,
    deviceType: (signal.deviceId || deviceId).startsWith("dev_mob_") ? "Mobile Phone" : "PC / Workstation",
    locationName: signal.locationName || "Unknown Location",
    roomName: signal.roomName || signal.locationName || "Unspecified Room",
    mapId: signal.mapId || "campus",
    floor: signal.floor || 1,
    zone: signal.zone || "Campus",
    reason: signal.reason || "🔥 Trapped by Smoke / Fire",
    audioClip: signal.audioClip || null,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawTimestamp: Date.now(),
    status: "ACTIVE"
  };

  const updatedSignals = {
    ...(currentLiveState.distressSignals || {}),
    [id]: record
  };

  // Immediate cloud SOS push
  if (typeof window !== "undefined" && window.fetch) {
    try {
      fetch(getApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sos",
          signal: record
        })
      }).catch(() => {});
    } catch (e) {}
  }

  saveLocalState({
    ...currentLiveState,
    distressSignals: updatedSignals
  }, false);
  return id;
}

/**
 * Clear a resolved SOS beacon from the console and safely archive it to incident history
 */
export function clearDistressSignal(id) {
  lastLocalActionTime = Date.now();
  const updatedSignals = { ...(currentLiveState.distressSignals || {}) };
  const updatedResolved = { ...(currentLiveState.resolvedDistressSignals || {}) };

  if (updatedSignals[id]) {
    updatedResolved[id] = {
      ...updatedSignals[id],
      status: "RESCUED_RESOLVED",
      resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      resolvedTimestamp: Date.now()
    };
    delete updatedSignals[id];
  }

  // Immediate cloud clear push
  if (typeof window !== "undefined" && window.fetch) {
    try {
      fetch(getApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear_sos",
          id
        })
      }).catch(() => {});
    } catch (e) {}
  }

  saveLocalState({
    ...currentLiveState,
    distressSignals: updatedSignals,
    resolvedDistressSignals: updatedResolved
  }, false);
}

/**
 * Permanently delete a specific archived SOS record from the audit log
 */
export function deleteArchivedDistressSignal(id) {
  lastLocalActionTime = Date.now();
  const updatedResolved = { ...(currentLiveState.resolvedDistressSignals || {}) };
  delete updatedResolved[id];

  if (typeof window !== "undefined" && window.fetch) {
    try {
      fetch(getApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_archived_sos",
          id
        })
      }).catch(() => {});
    } catch (e) {}
  }

  saveLocalState({
    ...currentLiveState,
    resolvedDistressSignals: updatedResolved
  }, false);
}

/**
 * Clear all archived audit logs permanently
 */
export function clearAllAuditHistory() {
  lastLocalActionTime = Date.now();
  if (typeof window !== "undefined" && window.fetch) {
    try {
      fetch(getApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear_all_audit"
        })
      }).catch(() => {});
    } catch (e) {}
  }

  saveLocalState({
    ...currentLiveState,
    resolvedDistressSignals: {}
  }, false);
}

/**
 * Reset all building hazards, blockages, and alarms to normal (preserving historical records)
 */
export function resetAllToNormal() {
  lastLocalActionTime = Date.now();
  activeRouteRegistry.clear();
  const keepPresence = { ...(currentLiveState.presence || {}) };
  const keepResolved = { ...(currentLiveState.resolvedDistressSignals || {}) };

  // Immediate cloud reset push
  if (typeof window !== "undefined" && window.fetch) {
    try {
      fetch(getApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_all"
        })
      }).catch(() => {});
    } catch (e) {}
  }

  saveLocalState({
    ...INITIAL_STATE,
    presence: keepPresence,
    resolvedDistressSignals: keepResolved,
    lastUpdated: new Date().toISOString()
  }, false);
}

/**
 * Get current system connection status
 */
export function getConnectionStatus() {
  return {
    isLiveCloud: true,
    mode: "Vercel Realtime Cloud Sync + Local Bus",
    badgeText: "Cloud Connected",
    color: "emerald"
  };
}
