/**
 * SafeWay - Primary React Application Coordinator
 * Smart Indoor Navigation & Emergency Evacuation System
 */

import { INITIAL_BUILDING_DATA } from './data/buildingGraph.js';
import { findShortestPath, findSafestEvacuationPath } from './utils/pathfinder.js';
import { FloorMap } from './components/FloorMap.js?v=campus-layout-1';
import { EmergencyBanner } from './components/EmergencyBanner.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { ExitStatusScreen } from './components/ExitStatusScreen.js';
import { ScenarioTester } from './components/ScenarioTester.js';
import { QrScannerModal } from './components/QrScannerModal.js';

export function App() {
  // Core State
  const [buildingData] = React.useState(INITIAL_BUILDING_DATA);
  const [currentFloor, setCurrentFloor] = React.useState(1);
  const [userLocationNodeId, setUserLocationNodeId] = React.useState("ent-main");
  const [destinationNodeId, setDestinationNodeId] = React.useState("room-204");
  const [isEmergency, setIsEmergency] = React.useState(false);
  const [accessibilityMode, setAccessibilityMode] = React.useState(false);
  
  // Hazard & Admin Overrides State
  const [zoneHazards, setZoneHazards] = React.useState({
    "zone-a": "none",
    "zone-b": "none",
    "zone-c": "none",
    "zone-d": "none",
    "zone-e": "none"
  });
  const [blockedEdges, setBlockedEdges] = React.useState({});
  const [exitCrowdLevels, setExitCrowdLevels] = React.useState({
    "exit-1": "Low",
    "exit-2": "Low",
    "exit-3": "Low"
  });
  const [exitStatuses, setExitStatuses] = React.useState({
    "exit-1": true,
    "exit-2": true,
    "exit-3": true
  });

  // UI Navigation State
  const [activeTab, setActiveTab] = React.useState("map"); // 'map' | 'admin' | 'exits' | 'scenarios'
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [activeScenarioId, setActiveScenarioId] = React.useState(null);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [activeHazardSummary, setActiveHazardSummary] = React.useState("");

  // Sound Synthesizer using Web Audio API
  const playEmergencyTone = React.useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio context not available", e);
    }
  }, [soundEnabled]);

  // Handle location update with floor sync
  const handleLocationChange = (nodeId) => {
    setUserLocationNodeId(nodeId);
    const node = buildingData.nodes.find(n => n.id === nodeId);
    if (node && node.floor && node.floor !== currentFloor) {
      setCurrentFloor(node.floor);
    }
  };

  // Build active edges with admin overrides
  const effectiveEdges = React.useMemo(() => {
    return buildingData.edges.map(e => ({
      ...e,
      blocked: blockedEdges[e.id] !== undefined ? blockedEdges[e.id] : e.blocked
    }));
  }, [buildingData.edges, blockedEdges]);

  // Build active exits with admin overrides
  const effectiveExits = React.useMemo(() => {
    return buildingData.exits.map(ex => ({
      ...ex,
      isOpen: exitStatuses[ex.id] !== undefined ? exitStatuses[ex.id] : ex.isOpen,
      crowdLevel: exitCrowdLevels[ex.id] || ex.crowdLevel
    }));
  }, [buildingData.exits, exitStatuses, exitCrowdLevels]);

  // Dynamic Navigation Calculations
  const normalRoute = React.useMemo(() => {
    if (isEmergency) return null;
    return findShortestPath(
      userLocationNodeId,
      destinationNodeId,
      buildingData.nodes,
      effectiveEdges,
      { isEmergency: false, accessibilityMode },
      exitCrowdLevels,
      zoneHazards
    );
  }, [userLocationNodeId, destinationNodeId, buildingData.nodes, effectiveEdges, isEmergency, accessibilityMode, exitCrowdLevels, zoneHazards]);

  const evacuationResult = React.useMemo(() => {
    if (!isEmergency) return null;
    return findSafestEvacuationPath(
      userLocationNodeId,
      buildingData.nodes,
      effectiveEdges,
      effectiveExits,
      buildingData.assemblyAreas,
      { isEmergency: true, accessibilityMode, nearestEmergencyDestination: true },
      exitCrowdLevels,
      zoneHazards
    );
  }, [userLocationNodeId, buildingData.nodes, effectiveEdges, effectiveExits, buildingData.assemblyAreas, isEmergency, accessibilityMode, exitCrowdLevels, zoneHazards]);

  const activeRoute = isEmergency ? evacuationResult?.bestRoute : normalRoute;

  // Real-time hazard summary generator
  React.useEffect(() => {
    const activeHazardZones = Object.entries(zoneHazards)
      .filter(([_, level]) => level !== "none")
      .map(([zid, level]) => {
        const z = buildingData.zones.find(zone => zone.id === zid);
        return `${level === 'high' ? 'Fire' : 'Smoke'} in ${z?.name || zid}`;
      });

    if (activeHazardZones.length > 0) {
      setActiveHazardSummary(activeHazardZones.join(" • ") + " — Avoid affected areas!");
    } else if (isEmergency) {
      setActiveHazardSummary("General Emergency Evacuation Alert — Evacuate Facility Immediately");
    } else {
      setActiveHazardSummary("");
    }
  }, [zoneHazards, isEmergency, buildingData.zones]);

  // Scenario Runner Implementation (Scenarios 1-5)
  const handleRunScenario = (scenarioId) => {
    setActiveScenarioId(scenarioId);

    if (scenarioId === "scenario-1") {
      // Scenario 1: Normal Navigation (Main Entrance -> Room 204)
      setIsEmergency(false);
      setAccessibilityMode(false);
      setUserLocationNodeId("ent-main");
      setDestinationNodeId("room-204");
      setCurrentFloor(1);
      setZoneHazards({ "zone-a": "none", "zone-b": "none", "zone-c": "none", "zone-d": "none", "zone-e": "none" });
      setBlockedEdges({});
      setExitCrowdLevels({ "exit-1": "Low", "exit-2": "Low", "exit-3": "Low" });
      setExitStatuses({ "exit-1": true, "exit-2": true, "exit-3": true });
      setActiveTab("map");
    } else if (scenarioId === "scenario-2") {
      // Scenario 2: Fire in Zone B
      setIsEmergency(true);
      setAccessibilityMode(false);
      setUserLocationNodeId("lobby");
      setCurrentFloor(1);
      setZoneHazards({ "zone-a": "none", "zone-b": "high", "zone-c": "none", "zone-d": "none", "zone-e": "none" });
      setBlockedEdges({});
      setExitCrowdLevels({ "exit-1": "Low", "exit-2": "Low", "exit-3": "Low" });
      setExitStatuses({ "exit-1": true, "exit-2": true, "exit-3": true });
      playEmergencyTone();
      setActiveTab("map");
    } else if (scenarioId === "scenario-3") {
      // Scenario 3: Crowd Level Rerouting (Exit 1 High Crowd, Exit 2 Low)
      setIsEmergency(true);
      setAccessibilityMode(false);
      setUserLocationNodeId("junc-1-5"); // Central-East corridor
      setCurrentFloor(1);
      setZoneHazards({ "zone-a": "none", "zone-b": "none", "zone-c": "none", "zone-d": "none", "zone-e": "none" });
      setBlockedEdges({});
      setExitCrowdLevels({ "exit-1": "High", "exit-2": "Low", "exit-3": "Low" });
      setExitStatuses({ "exit-1": true, "exit-2": true, "exit-3": true });
      playEmergencyTone();
      setActiveTab("map");
    } else if (scenarioId === "scenario-4") {
      // Scenario 4: Exit Failure / Closure (Exit 2 is closed/blocked)
      setIsEmergency(true);
      setAccessibilityMode(false);
      setUserLocationNodeId("cafeteria");
      setCurrentFloor(1);
      setZoneHazards({ "zone-a": "none", "zone-b": "none", "zone-c": "none", "zone-d": "none", "zone-e": "none" });
      setBlockedEdges({});
      setExitCrowdLevels({ "exit-1": "Low", "exit-2": "Low", "exit-3": "Low" });
      setExitStatuses({ "exit-1": true, "exit-2": false, "exit-3": true }); // Exit 2 Closed
      playEmergencyTone();
      setActiveTab("map");
    } else if (scenarioId === "scenario-5") {
      // Scenario 5: Accessibility / Step-free Mode
      setIsEmergency(false);
      setAccessibilityMode(true);
      setUserLocationNodeId("room-202");
      setDestinationNodeId("lobby");
      setCurrentFloor(2);
      setZoneHazards({ "zone-a": "none", "zone-b": "none", "zone-c": "none", "zone-d": "none", "zone-e": "none" });
      setBlockedEdges({});
      setExitCrowdLevels({ "exit-1": "Low", "exit-2": "Low", "exit-3": "Low" });
      setExitStatuses({ "exit-1": true, "exit-2": true, "exit-3": true });
      setActiveTab("map");
    }
  };

  const handleResetToNormal = () => {
    setIsEmergency(false);
    setAccessibilityMode(false);
    setZoneHazards({ "zone-a": "none", "zone-b": "none", "zone-c": "none", "zone-d": "none", "zone-e": "none" });
    setBlockedEdges({});
    setExitCrowdLevels({ "exit-1": "Low", "exit-2": "Low", "exit-3": "Low" });
    setExitStatuses({ "exit-1": true, "exit-2": true, "exit-3": true });
    setActiveScenarioId(null);
  };

  const userNode = buildingData.nodes.find(n => n.id === userLocationNodeId);
  const destNode = buildingData.nodes.find(n => n.id === destinationNodeId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i data-lucide="navigation-2" className="w-5 h-5 text-white"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">SafeWay</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Indoor Navigation & Safety
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Smart Hazard-Aware Evacuation System</p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Alert Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Emergency Siren" : "Enable Emergency Audio Alert"}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                soundEnabled
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <i data-lucide={soundEnabled ? "volume-2" : "volume-x"} className="w-4 h-4"></i>
            </button>

            {/* Accessibility / Step-Free Toggle */}
            <button
              onClick={() => setAccessibilityMode(!accessibilityMode)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                accessibilityMode
                  ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/20"
                  : "bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600"
              }`}
            >
              <i data-lucide="accessibility" className="w-4 h-4"></i>
              <span className="hidden sm:inline">Step-Free / Accessible</span>
              <span className="sm:hidden">♿ Step-Free</span>
            </button>

            {/* Emergency Toggle Demo Button */}
            <button
              onClick={() => {
                const nextState = !isEmergency;
                setIsEmergency(nextState);
                if (nextState) {
                  playEmergencyTone();
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-lg ${
                isEmergency
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse"
              }`}
            >
              <i data-lucide={isEmergency ? "check-circle" : "flame"} className="w-4 h-4"></i>
              {isEmergency ? "Stand Down" : "Simulate Emergency"}
            </button>
          </div>
        </div>
      </header>

      {/* Emergency Active Banner */}
      <EmergencyBanner
        isEmergency={isEmergency}
        evacuationResult={evacuationResult}
        activeHazardSummary={activeHazardSummary}
        userLocationNode={userNode}
        onClearEmergency={handleResetToNormal}
        onSwitchFloor={setCurrentFloor}
        currentFloor={currentFloor}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "map"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <i data-lucide="map" className="w-4 h-4"></i>
              Floor Map & Directions
            </button>

            <button
              onClick={() => setActiveTab("scenarios")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "scenarios"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <i data-lucide="play-circle" className="w-4 h-4"></i>
              Interactive Scenarios (1–5)
            </button>

            <button
              onClick={() => setActiveTab("exits")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "exits"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <i data-lucide="door-open" className="w-4 h-4"></i>
              Exit Status Monitor
            </button>

            <button
              onClick={() => { window.location.href = "/login"; }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "admin"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <i data-lucide="settings" className="w-4 h-4"></i>
              Admin Hazard Console
            </button>
          </div>

          {/* Quick QR Checkpoint Scan Launcher */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <i data-lucide="qr-code" className="w-4 h-4"></i>
            Scan QR Checkpoint
          </button>
        </div>

        {/* TAB 1: 2D MAP & TURN-BY-TURN VIEW */}
        {activeTab === "map" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Navigation Controls & Turn-by-Turn Steps (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Routing Input Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <i data-lucide="compass" className="w-4 h-4 text-blue-400"></i>
                    {isEmergency ? "Emergency Route" : "Indoor Navigation"}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    A* / Dijkstra
                  </span>
                </div>

                {/* Starting Node (Current Location) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>1. Current Location (Simulated QR):</span>
                    <button
                      onClick={() => setIsQrModalOpen(true)}
                      className="text-blue-400 hover:text-blue-300 font-semibold lowercase text-[11px]"
                    >
                      [change]
                    </button>
                  </label>
                  <div
                    onClick={() => setIsQrModalOpen(true)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between cursor-pointer group transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {userNode?.floor}F
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                          {userNode?.name}
                        </div>
                        <div className="text-[10px] text-slate-400">Zone: {userNode?.zone?.toUpperCase() || 'Lobby'}</div>
                      </div>
                    </div>
                    <i data-lucide="qr-code" className="w-4 h-4 text-slate-500 group-hover:text-white transition"></i>
                  </div>
                </div>

                {/* Destination Selector (Only in Normal Mode) */}
                {!isEmergency && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      2. Select Destination Room / POI:
                    </label>
                    <select
                      value={destinationNodeId}
                      onChange={(e) => setDestinationNodeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <optgroup label="Floor 1 Rooms & Facilities">
                        {buildingData.nodes.filter(n => n.floor === 1 && n.type === 'room').map(node => (
                          <option key={node.id} value={node.id}>
                            1F: {node.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Floor 2 Rooms & Facilities">
                        {buildingData.nodes.filter(n => n.floor === 2 && n.type === 'room').map(node => (
                          <option key={node.id} value={node.id}>
                            2F: {node.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}

                {/* Accessibility Toggle indicator */}
                {accessibilityMode && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-2">
                    <i data-lucide="accessibility" className="w-4 h-4 text-emerald-400"></i>
                    <span>Step-Free Active: Routing strictly avoids all stairwells.</span>
                  </div>
                )}
              </div>

              {/* Route Summary & Turn-by-Turn Guidance List */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <i data-lucide="list-ordered" className="w-4 h-4 text-emerald-400"></i>
                    Turn-by-Turn Directions
                  </h3>
                  {activeRoute && (
                    <span className="text-xs font-bold text-emerald-400">
                      {activeRoute.totalDistance}m (~{Math.ceil(activeRoute.totalDistance / 1.2)}s)
                    </span>
                  )}
                </div>

                {activeRoute && activeRoute.steps && activeRoute.steps.length > 0 ? (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {activeRoute.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition ${
                          step.isFloorChange
                            ? "bg-indigo-950/50 border-indigo-500/40"
                            : idx === 0
                            ? "bg-blue-950/30 border-blue-800/50"
                            : idx === activeRoute.steps.length - 1
                            ? "bg-emerald-950/30 border-emerald-800/50"
                            : "bg-slate-950/60 border-slate-800/80"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                            step.isFloorChange
                              ? "bg-indigo-600 text-white"
                              : idx === activeRoute.steps.length - 1
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="space-y-0.5 text-xs flex-1">
                          <div className="font-bold text-slate-100">{step.title}</div>
                          <div className="text-[11px] text-slate-400">{step.description}</div>
                          {step.isFloorChange && (
                            <button
                              onClick={() => setCurrentFloor(step.targetFloor)}
                              className="mt-1 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold transition"
                            >
                              Switch View to Floor {step.targetFloor}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No active path found. Select another destination or clear hazards.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Interactive 2D SVG Map (8 Cols) */}
            <div className="lg:col-span-8 min-h-[500px] h-[650px]">
              <FloorMap
                buildingData={buildingData}
                currentFloor={currentFloor}
                userLocationNodeId={userLocationNodeId}
                destinationNodeId={destinationNodeId}
                activeRoute={activeRoute}
                isEmergency={isEmergency}
                zoneHazards={zoneHazards}
                blockedEdges={blockedEdges}
                exitCrowdLevels={exitCrowdLevels}
                exitStatuses={exitStatuses}
                onSelectNodeAsLocation={handleLocationChange}
                onSelectNodeAsDestination={setDestinationNodeId}
                onFloorChange={setCurrentFloor}
                accessibilityMode={accessibilityMode}
              />
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE SCENARIOS (1 to 5) */}
        {activeTab === "scenarios" && (
          <div className="space-y-6">
            <ScenarioTester
              onRunScenario={handleRunScenario}
              activeScenarioId={activeScenarioId}
            />
            {/* Live Map Preview underneath */}
            <div className="min-h-[450px] h-[550px]">
              <FloorMap
                buildingData={buildingData}
                currentFloor={currentFloor}
                userLocationNodeId={userLocationNodeId}
                destinationNodeId={destinationNodeId}
                activeRoute={activeRoute}
                isEmergency={isEmergency}
                zoneHazards={zoneHazards}
                blockedEdges={blockedEdges}
                exitCrowdLevels={exitCrowdLevels}
                exitStatuses={exitStatuses}
                onSelectNodeAsLocation={handleLocationChange}
                onSelectNodeAsDestination={setDestinationNodeId}
                onFloorChange={setCurrentFloor}
                accessibilityMode={accessibilityMode}
              />
            </div>
          </div>
        )}

        {/* TAB 3: EXIT STATUS SCREEN */}
        {activeTab === "exits" && (
          <ExitStatusScreen
            buildingData={buildingData}
            exitCrowdLevels={exitCrowdLevels}
            exitStatuses={exitStatuses}
            evacuationResult={evacuationResult}
            userLocationNodeId={userLocationNodeId}
          />
        )}

        {/* TAB 4: ADMIN SAFETY DASHBOARD */}
        {activeTab === "admin" && (
          <AdminDashboard
            buildingData={buildingData}
            isEmergency={isEmergency}
            zoneHazards={zoneHazards}
            blockedEdges={blockedEdges}
            exitCrowdLevels={exitCrowdLevels}
            exitStatuses={exitStatuses}
            onToggleEmergency={() => {
              const nextState = !isEmergency;
              setIsEmergency(nextState);
              if (nextState) playEmergencyTone();
            }}
            onSetZoneHazard={(zoneId, level) => setZoneHazards(prev => ({ ...prev, [zoneId]: level }))}
            onToggleEdgeBlocked={(edgeId) => setBlockedEdges(prev => ({ ...prev, [edgeId]: !prev[edgeId] }))}
            onSetExitCrowdLevel={(exitId, level) => setExitCrowdLevels(prev => ({ ...prev, [exitId]: level }))}
            onToggleExitStatus={(exitId) => setExitStatuses(prev => ({ ...prev, [exitId]: !prev[exitId] }))}
            onResetAllToNormal={handleResetToNormal}
            evacuationResult={evacuationResult}
            userLocationNodeId={userLocationNodeId}
            normalRoute={normalRoute}
          />
        )}
      </main>

      {/* QR Checkpoint Scanner Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        buildingData={buildingData}
        onSelectCheckpoint={handleLocationChange}
        currentLocationId={userLocationNodeId}
      />

      {/* App Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>SafeWay Smart Indoor Navigation Prototype • Built for Safety & Evacuation Operations</span>
          <span className="font-mono text-[11px]">Dijkstra/A* Graph Pathfinding Engine Active</span>
        </div>
      </footer>
    </div>
  );
}
