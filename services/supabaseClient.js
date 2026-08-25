/**
 * SafeWay V3 — Enterprise Supabase Client & Realtime Sync Service
 * Seamless Cloud Database Synchronization, IoT Telemetry, and SOS Dispatch.
 * Designed with automatic fallback when offline or unconfigured.
 */

const STORAGE_URL_KEY = "safeway_supabase_url";
const STORAGE_ANON_KEY = "safeway_supabase_anon_key";

let supabaseInstance = null;
let realtimeSubscription = null;
let distressSubscription = null;

/**
 * Retrieve saved Supabase credentials from local storage or environment
 */
export function getSupabaseConfig() {
  if (typeof window !== "undefined") {
    const url = localStorage.getItem(STORAGE_URL_KEY) || (window.SAFEWAY_SUPABASE_CONFIG && window.SAFEWAY_SUPABASE_CONFIG.url) || "";
    const anonKey = localStorage.getItem(STORAGE_ANON_KEY) || (window.SAFEWAY_SUPABASE_CONFIG && window.SAFEWAY_SUPABASE_CONFIG.anonKey) || "";
    return { url, anonKey };
  }
  return {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || ""
  };
}

/**
 * Save credentials locally and reinitialize client
 */
export function saveSupabaseConfig(url, anonKey) {
  if (typeof window !== "undefined") {
    if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
    else localStorage.removeItem(STORAGE_URL_KEY);

    if (anonKey) localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_ANON_KEY);

    supabaseInstance = null;
    return getSupabaseClient();
  }
  return null;
}

/**
 * Check if active valid Supabase credentials are configured
 */
export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith("https://"));
}

/**
 * Get or initialize singleton Supabase JS client
 */
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    if (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
      supabaseInstance = window.supabase.createClient(url, anonKey);
      console.log("[Supabase] Connected successfully to Cloud instance:", url);
      return supabaseInstance;
    }
  } catch (err) {
    console.warn("[Supabase] Failed to initialize client:", err);
  }

  return null;
}

/**
 * Fetch the latest live building state from Supabase
 */
export async function fetchBuildingState() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("building_state")
      .select("*")
      .eq("id", "current")
      .single();

    if (error) {
      console.warn("[Supabase] fetchBuildingState error:", error.message);
      return null;
    }

    if (data) {
      return {
        emergencyActive: data.emergency_active,
        hazards: data.hazards || {},
        crowds: data.crowds || {},
        corridorCrowds: data.corridor_crowds || {},
        exits: data.exits || {},
        blockedEdges: data.blocked_edges || {},
        emergencyPolicies: data.emergency_policies || {},
        sensors: data.sensors || {},
        version: data.version || 1,
        lastUpdated: data.updated_at,
        source: "supabase"
      };
    }
  } catch (err) {
    console.warn("[Supabase] fetchBuildingState network error:", err);
  }
  return null;
}

/**
 * Push updated building state to Supabase cloud
 */
export async function pushBuildingState(state) {
  const client = getSupabaseClient();
  if (!client || !state) return false;

  try {
    const payload = {
      id: "current",
      emergency_active: Boolean(state.emergencyActive),
      hazards: state.hazards || {},
      crowds: state.crowds || {},
      corridor_crowds: state.corridorCrowds || {},
      exits: state.exits || {},
      blocked_edges: state.blockedEdges || {},
      emergency_policies: state.emergencyPolicies || {},
      sensors: state.sensors || {},
      version: (state.version || 1) + 1,
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from("building_state")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.warn("[Supabase] pushBuildingState error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Supabase] pushBuildingState network error:", err);
    return false;
  }
}

/**
 * Subscribe to realtime building state changes
 */
export function subscribeToBuildingState(onUpdate) {
  const client = getSupabaseClient();
  if (!client || typeof onUpdate !== "function") return () => {};

  try {
    if (realtimeSubscription) {
      client.removeChannel(realtimeSubscription);
    }

    realtimeSubscription = client
      .channel("safeway-building-state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "building_state" },
        (payload) => {
          if (payload.new) {
            const newState = {
              emergencyActive: payload.new.emergency_active,
              hazards: payload.new.hazards || {},
              crowds: payload.new.crowds || {},
              corridorCrowds: payload.new.corridor_crowds || {},
              exits: payload.new.exits || {},
              blockedEdges: payload.new.blocked_edges || {},
              emergencyPolicies: payload.new.emergency_policies || {},
              sensors: payload.new.sensors || {},
              version: payload.new.version || 1,
              lastUpdated: payload.new.updated_at,
              source: "supabase_realtime"
            };
            onUpdate(newState);
          }
        }
      )
      .subscribe((status) => {
        console.log("[Supabase Realtime] Building State Channel Status:", status);
      });

    return () => {
      if (realtimeSubscription) {
        client.removeChannel(realtimeSubscription);
        realtimeSubscription = null;
      }
    };
  } catch (err) {
    console.warn("[Supabase] subscribeToBuildingState failed:", err);
    return () => {};
  }
}

/**
 * Send an Evacuee SOS distress beacon to Supabase
 */
export async function sendDistressSignal(distress) {
  const client = getSupabaseClient();
  if (!client || !distress) return false;

  try {
    const record = {
      id: distress.id || `sos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      device_id: distress.deviceId || "unknown_device",
      map_id: distress.mapId || "campus",
      node_id: distress.nodeId || null,
      room_name: distress.roomName || "Unknown Corridor",
      floor: distress.floor || 1,
      user_status: distress.userStatus || "trapped",
      user_message: distress.message || "Emergency assistance requested",
      battery_level: distress.batteryLevel || null,
      status: "active",
      created_at: new Date().toISOString()
    };

    const { error } = await client
      .from("distress_signals")
      .upsert(record, { onConflict: "id" });

    if (error) {
      console.warn("[Supabase] sendDistressSignal error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Supabase] sendDistressSignal network error:", err);
    return false;
  }
}

/**
 * Fetch all active and recent distress signals
 */
export async function fetchDistressSignals() {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("distress_signals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("[Supabase] fetchDistressSignals error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("[Supabase] fetchDistressSignals network error:", err);
    return [];
  }
}

/**
 * Resolve/Clear a distress signal in Supabase
 */
export async function resolveDistressSignal(signalId) {
  const client = getSupabaseClient();
  if (!client || !signalId) return false;

  try {
    const { error } = await client
      .from("distress_signals")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", signalId);

    if (error) {
      console.warn("[Supabase] resolveDistressSignal error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Supabase] resolveDistressSignal network error:", err);
    return false;
  }
}

/**
 * Subscribe to real-time distress signals (For Admin Console)
 */
export function subscribeToDistressSignals(onSignalChange) {
  const client = getSupabaseClient();
  if (!client || typeof onSignalChange !== "function") return () => {};

  try {
    if (distressSubscription) {
      client.removeChannel(distressSubscription);
    }

    distressSubscription = client
      .channel("safeway-distress-signals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "distress_signals" },
        (payload) => {
          onSignalChange(payload);
        }
      )
      .subscribe((status) => {
        console.log("[Supabase Realtime] Distress Signals Channel Status:", status);
      });

    return () => {
      if (distressSubscription) {
        client.removeChannel(distressSubscription);
        distressSubscription = null;
      }
    };
  } catch (err) {
    console.warn("[Supabase] subscribeToDistressSignals failed:", err);
    return () => {};
  }
}

/**
 * Ingest IoT sensor reading to Supabase
 */
export async function pushSensorReading(reading) {
  const client = getSupabaseClient();
  if (!client || !reading) return false;

  try {
    const payload = {
      sensor_id: reading.sensorId || "esp32-node",
      zone_id: reading.zoneId || null,
      smoke_ppm: reading.smokePpm || null,
      flame_detected: Boolean(reading.flameDetected),
      temperature_c: reading.temperature || null,
      in_count: reading.inCount || 0,
      out_count: reading.outCount || 0,
      raw_payload: reading,
      created_at: new Date().toISOString()
    };

    const { error } = await client
      .from("sensor_telemetry")
      .insert([payload]);

    if (error) {
      console.warn("[Supabase] pushSensorReading error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Supabase] pushSensorReading network error:", err);
    return false;
  }
}

/**
 * Log an incident audit event
 */
export async function logIncidentAudit(eventType, details = {}, triggeredBy = "SYSTEM") {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from("incident_audit_logs")
      .insert([{
        event_type: eventType,
        triggered_by: triggeredBy,
        details,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.warn("[Supabase] logIncidentAudit error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Supabase] logIncidentAudit network error:", err);
    return false;
  }
}
