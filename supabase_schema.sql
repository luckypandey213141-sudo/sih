-- ==============================================================================
-- SafeWay V3 — Supabase Database Schema & Realtime Setup
-- Smart Indoor Navigation & Crowd-Aware Emergency Evacuation System (SIH 2026)
-- ==============================================================================

-- 1. Building Live State Table (Single-row synchronized state)
CREATE TABLE IF NOT EXISTS public.building_state (
    id TEXT PRIMARY KEY DEFAULT 'current',
    emergency_active BOOLEAN DEFAULT false,
    hazards JSONB DEFAULT '{"zone-a":"none","zone-b":"none","zone-c":"none","zone-d":"none","zone-e":"none"}'::jsonb,
    crowds JSONB DEFAULT '{"exit-1":"Low","exit-2":"Low","exit-3":"Low","zone-a":"Low","zone-b":"Low","zone-c":"Low","zone-d":"Low","zone-e":"Low"}'::jsonb,
    corridor_crowds JSONB DEFAULT '{}'::jsonb,
    exits JSONB DEFAULT '{"exit-1":{"isOpen":true},"exit-2":{"isOpen":true},"exit-3":{"isOpen":true}}'::jsonb,
    blocked_edges JSONB DEFAULT '{}'::jsonb,
    emergency_policies JSONB DEFAULT '{"allowElevatorsInFire":false,"accessibleEvacuationStrategy":"refuge_zone"}'::jsonb,
    sensors JSONB DEFAULT '{}'::jsonb,
    version BIGINT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial state if not exists
INSERT INTO public.building_state (id, emergency_active, version)
VALUES ('current', false, 1)
ON CONFLICT (id) DO NOTHING;

-- 2. IoT Sensor Telemetry Table (Time-series logs from ESP32 nodes)
CREATE TABLE IF NOT EXISTS public.sensor_telemetry (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sensor_id TEXT NOT NULL,
    zone_id TEXT,
    smoke_ppm NUMERIC(8,2),
    flame_detected BOOLEAN DEFAULT false,
    temperature_c NUMERIC(5,2),
    in_count INT DEFAULT 0,
    out_count INT DEFAULT 0,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Evacuee SOS Distress Signals Table
CREATE TABLE IF NOT EXISTS public.distress_signals (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    map_id TEXT DEFAULT 'campus',
    node_id TEXT,
    room_name TEXT,
    floor INT DEFAULT 1,
    user_status TEXT DEFAULT 'trapped', -- 'trapped', 'injured', 'mobility_impaired', 'safe'
    user_message TEXT,
    battery_level INT,
    status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'rescued', 'resolved'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- 4. Incident & Evacuation Audit Logs Table
CREATE TABLE IF NOT EXISTS public.incident_audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'EMERGENCY_TRIGGERED', 'FIRE_DETECTED', 'EVACUATION_RESOLVED', 'MANUAL_OVERRIDE'
    triggered_by TEXT DEFAULT 'SYSTEM_SENSOR',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Public Read & Write enabled for Hackathon Demo Simplicity & IoT Integration
-- ==============================================================================
ALTER TABLE public.building_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distress_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read building_state" ON public.building_state FOR SELECT USING (true);
CREATE POLICY "Allow public write building_state" ON public.building_state FOR ALL USING (true);

CREATE POLICY "Allow public read sensor_telemetry" ON public.sensor_telemetry FOR SELECT USING (true);
CREATE POLICY "Allow public insert sensor_telemetry" ON public.sensor_telemetry FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read distress_signals" ON public.distress_signals FOR SELECT USING (true);
CREATE POLICY "Allow public write distress_signals" ON public.distress_signals FOR ALL USING (true);

CREATE POLICY "Allow public read incident_audit_logs" ON public.incident_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert incident_audit_logs" ON public.incident_audit_logs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- Enable Realtime Broadcast for Instant Sync Across Devices
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.building_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.distress_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_telemetry;
