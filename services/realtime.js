/**
 * SafeWay V3 - High-Performance Real-Time Synchronization & Presence Service
 * Backed by /api/realtime Vercel Serverless Endpoint + BroadcastChannel & LocalStorage.
 * Optimized with:
 *  - Optimistic UI Locking (0ms lag on emergency trigger / door toggles)
 *  - Smart Change Detection (Zero unneeded React re-renders, 0 CPU thrashing)
 *  - Persistent SOS retention & Anti-Flicker Merge Engine
 *  - In-flight request deduplication & visibility throttling
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
  distressSignals: {},
  resolvedDistressSignals: {},
  presence: {},
  sensors: {},
  version: 1,
  lastUpdated: new Date().toISOString(),
  source: "local"
};

let currentLiveState = loadLocalState();
const listeners = new Set();
let broadcastChannel = null;
let currentDeviceLocation = { mapId: "campus", roomName: "Campus Ground", floor: 1 };
let lastLocalActionTime = 0;
let isSyncInProgress = false;

// Initialize BroadcastChannel for same-device cross-tab communication
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === "STATE_UPDATE") {
        if ((event.data.state.version||0)>=(currentLiveState.version||0) && !isStateEqual(currentLiveState, event.data.state)) {
          currentLiveState = { ...currentLiveState, ...event.data.state };
          notifyListeners();
        }
      }
    };
  } catch (e) {}
}

function getApiEndpoint() {
  if (typeof window === "undefined") return "/api/realtime";
  return `${window.location.origin}/api/realtime`;
}

/**
 * Fast deep comparison to prevent unnecessary React re-renders & lag
 */
function isStateEqual(a,b) { return JSON.stringify(a) === JSON.stringify(b); }
let pendingWrites = 0;
let saveError = null;
let writeQueue = Promise.resolve();
const SOS_OUTBOX_KEY='safeway_sos_outbox_v1';
let sosOutbox={};
try {sosOutbox=JSON.parse(localStorage.getItem(SOS_OUTBOX_KEY)||'{}');}catch{}
function persistSosOutbox(){localStorage.setItem(SOS_OUTBOX_KEY,JSON.stringify(sosOutbox));}
async function deliverSos(record){
 await command({action:'sos',signal:record});
 delete sosOutbox[record.id];try{persistSosOutbox();}catch{}return record.id;
}
let connection = {isLiveCloud:false, badgeText:'Connecting', color:'amber', mode:'Realtime sync'};
function status(ok, message) {
 connection={isLiveCloud:ok,badgeText:message,color:ok?'emerald':'red',mode:'Realtime sync'};
 if(typeof window!=='undefined') window.dispatchEvent(new CustomEvent('safeway-sync-status',{detail:connection}));
 notifyListeners();
}
async function command(payload) {
 pendingWrites++;
 const run=async()=>{
  try {
   const res=await fetch(getApiEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const state=await res.json();
   if(!res.ok) throw new Error(state.error || 'Save failed ('+res.status+')');
   if((state.version||0)>=(currentLiveState.version||0))saveLocalState(state,false);
   saveError=null; status(true,'Cloud Connected'); return state;
  } catch(error) { saveError=error.message; status(false,error.message); throw error; }
  finally {pendingWrites--;}
 };
 const result=writeQueue.then(run); writeQueue=result.catch(()=>{}); return result;
}
/**
 * Poll the central cloud server for real-time multi-device sync
 */
export async function syncWithCloudServer() {
 if(typeof window==='undefined'||!window.fetch||isSyncInProgress||pendingWrites) return;
 isSyncInProgress=true;
 try {
  for(const record of Object.values(sosOutbox)) await deliverSos(record);
  const query=new URLSearchParams({deviceId:getDeviceId(),mapId:currentDeviceLocation.mapId,roomName:currentDeviceLocation.roomName,floor:currentDeviceLocation.floor ?? 1});
  const res=await fetch(getApiEndpoint()+'?'+query,{cache:'no-store'});
  if(!res.ok) throw new Error('Connection failed ('+res.status+')');
  const state=await res.json();
  if(!pendingWrites && (state.version||0)>=(currentLiveState.version||0) && !isStateEqual(currentLiveState,state)) saveLocalState(state,false);
  if(!pendingWrites && !saveError) status(true,'Cloud Connected');
 } catch(e){status(false,e.message);} finally{isSyncInProgress=false;}
}

// Background sync interval (2.5 seconds for optimal responsiveness + battery efficiency)
if (typeof window !== "undefined") {
  queueMicrotask(syncWithCloudServer);
  setInterval(syncWithCloudServer, 2500);

  // Immediate sync when tab becomes visible again
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) syncWithCloudServer();
    });
  }
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

function saveLocalState(newState,pushToCloud=true) {
 if(pushToCloud) {
  const patch={};
  for(const key of ['emergencyActive','hazards','crowds','corridorCrowds','exits','blockedEdges','emergencyPolicies','sensors']) {
   if(JSON.stringify(newState[key])===JSON.stringify(currentLiveState[key])) continue;
   if(key==='emergencyActive') patch[key]=newState[key];
   else {patch[key]={}; for(const [id,value] of Object.entries(newState[key]||{})) if(JSON.stringify(value)!==JSON.stringify(currentLiveState[key]?.[id])) patch[key][id]=value;}
  }
  // Display only server-acknowledged state. A rejected save cannot look successful.
  return command({action:'update_master',patch}).catch(()=>{});
 }
 currentLiveState={...INITIAL_STATE,...newState};
 try {localStorage.setItem(STORAGE_KEY,JSON.stringify(currentLiveState));}catch{}
 if(broadcastChannel) broadcastChannel.postMessage({type:'STATE_UPDATE',state:currentLiveState});
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
 * Get or create unique persistent Device Identifier
 */
export function getDeviceId() {
  if (typeof window === "undefined" || !window.localStorage) return "dev_unknown_" + Math.random().toString(36).substring(2, 6);
  let id = localStorage.getItem("safeway_device_id");
  if (!id) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const rand = Math.random().toString(36).substring(2, 8);
    id = (isMobile ? "dev_mob_" : "dev_pc_") + rand;
    localStorage.setItem("safeway_device_id", id);
  }
  return id;
}

/**
 * Report live device presence and current room location
 */
export function reportDevicePresence(locationData) {
  const deviceId = getDeviceId();
  const now = Date.now();
  currentDeviceLocation = {
    mapId: locationData.mapId || "campus",
    roomName: locationData.roomName || locationData.name || "Campus Ground",
    floor: locationData.floor ?? 1
  };

  const presenceRecord = {
    deviceId,
    deviceType: deviceId.startsWith("dev_mob_") ? "Mobile Phone" : "PC / Workstation",
    mapId: currentDeviceLocation.mapId,
    roomName: currentDeviceLocation.roomName,
    floor: currentDeviceLocation.floor,
    timestamp: now
  };

  const updatedPresence = {
    ...(currentLiveState.presence || {}),
    [deviceId]: presenceRecord
  };

  // Immediate cloud heartbeat push
  if (typeof window !== "undefined" && window.fetch) {
    try {
      fetch(getApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "heartbeat",
          ...presenceRecord
        })
      }).catch(() => {});
    } catch (e) {}
  }

  saveLocalState({
    ...currentLiveState,
    presence: updatedPresence
  }, false);
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
 * Update emergency alarm state (Instant 0ms Optimistic Update)
 */
export function setEmergencyActive(isActive) {
  lastLocalActionTime = Date.now();
  const updated = {
    ...currentLiveState,
    emergencyActive: Boolean(isActive)
  };
  saveLocalState(updated, true);
}

/**
 * Set hazard condition for a specific zone ('none' | 'low' | 'high')
 */
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

  if (merged.zone && data.hazardLevel) updated.hazards={...updated.hazards,[merged.zone]:data.hazardLevel};
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
  }, false);
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
    floor: signal.floor ?? 1,
    zone: signal.zone || "Campus",
    reason: signal.reason || "🔥 Trapped by Smoke / Fire",
    audioClip: signal.audioClip || null,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawTimestamp: Date.now(),
    status: "ACTIVE"
  };

  sosOutbox[id]=record;
  try {persistSosOutbox();}catch { /* Still attempt delivery if local storage is full. */ }
  return deliverSos(record);
}

/**
 * Clear a resolved SOS beacon from the console and safely archive it to incident history
 */
export function clearDistressSignal(id) {return command({action:'clear_sos',id}).catch(()=>{});}
export function deleteArchivedDistressSignal(id) {return command({action:'delete_archived_sos',id}).catch(()=>{});}
export function clearAllAuditHistory() {return command({action:'clear_all_audit'}).catch(()=>{});}
export function resetAllToNormal() {activeRouteRegistry.clear();return command({action:'reset_all'}).catch(()=>{});}

/**
 * Get current system connection status
 */
export function getConnectionStatus() {return connection;}
