/**
 * SafeWay - Admin Safety Command Center & Hazard Simulation Dashboard
 * Allows facility managers to simulate emergencies, toggle hazard zones,
 * block corridors, adjust exit crowd levels, and inspect live routing costs.
 */

export function AdminDashboard({
  buildingData,
  isEmergency,
  zoneHazards,
  blockedEdges,
  exitCrowdLevels,
  exitStatuses,
  onToggleEmergency,
  onSetZoneHazard,
  onToggleEdgeBlocked,
  onSetExitCrowdLevel,
  onToggleExitStatus,
  onResetAllToNormal,
  evacuationResult,
  userLocationNodeId,
  normalRoute
}) {
  const [activeTab, setActiveTab] = React.useState("zones"); // 'zones' | 'exits' | 'corridors' | 'liveInspector'

  const userNode = buildingData.nodes.find(n => n.id === userLocationNodeId);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6">
      {/* Header & Global Emergency Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <i data-lucide="shield-check" className="w-5 h-5 text-blue-400"></i>
              Facility Admin & Safety Operations Console
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time control over building hazards, corridor blockages, exit capacities, and routing weights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetAllToNormal}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            Reset to Default
          </button>

          <button
            onClick={onToggleEmergency}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-200 ${
              isEmergency
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
            }`}
          >
            <i data-lucide={isEmergency ? "check-circle" : "alert-triangle"} className="w-4 h-4"></i>
            {isEmergency ? "Clear Emergency" : "Trigger Emergency"}
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("zones")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "zones"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <i data-lucide="flame" className="w-4 h-4"></i>
          Zone Hazards ({buildingData.zones.length})
        </button>

        <button
          onClick={() => setActiveTab("exits")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "exits"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <i data-lucide="door-open" className="w-4 h-4"></i>
          Exits & Crowd Levels ({buildingData.exits.length})
        </button>

        <button
          onClick={() => setActiveTab("corridors")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "corridors"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <i data-lucide="split" className="w-4 h-4"></i>
          Corridor Blockages ({Object.values(blockedEdges).filter(Boolean).length} Blocked)
        </button>

        <button
          onClick={() => setActiveTab("liveInspector")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "liveInspector"
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <i data-lucide="activity" className="w-4 h-4"></i>
          Live Routing Inspector
        </button>
      </div>

      {/* TAB 1: ZONE HAZARDS */}
      {activeTab === "zones" && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Set hazardous conditions across building zones. <strong>High Hazard (Fire)</strong> completely disables all routes through the zone ($\infty$ cost). <strong>Low Hazard (Smoke)</strong> penalizes routing (+50m).
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {buildingData.zones.map(zone => {
              const currentHazard = zoneHazards[zone.id] || "none";

              return (
                <div
                  key={zone.id}
                  className={`p-4 rounded-xl border transition-all ${
                    currentHazard === "high"
                      ? "bg-red-950/40 border-red-500 shadow-md shadow-red-900/20"
                      : currentHazard === "low"
                      ? "bg-amber-950/40 border-amber-500"
                      : "bg-slate-900/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Floor {zone.floor}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{zone.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        currentHazard === "high"
                          ? "bg-red-600 text-white"
                          : currentHazard === "low"
                          ? "bg-amber-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {currentHazard.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 min-h-[32px]">{zone.description}</p>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onSetZoneHazard(zone.id, "none")}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                        currentHazard === "none"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => onSetZoneHazard(zone.id, "low")}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                        currentHazard === "low"
                          ? "bg-amber-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      Smoke (Low)
                    </button>
                    <button
                      onClick={() => onSetZoneHazard(zone.id, "high")}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                        currentHazard === "high"
                          ? "bg-red-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      Fire (High)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EXITS & CROWD LEVELS */}
      {activeTab === "exits" && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Control the operational status and crowd congestion for each emergency exit. High crowd adds +60m cost weight, causing the algorithm to steer occupants towards less congested safe exits.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buildingData.exits.map(exit => {
              const crowd = exitCrowdLevels[exit.id] || exit.crowdLevel || "Low";
              const isOpen = exitStatuses[exit.id] !== false;

              return (
                <div key={exit.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-white">{exit.name}</h4>
                    <button
                      onClick={() => onToggleExitStatus(exit.id)}
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg transition ${
                        isOpen
                          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-red-600/20 text-red-400 border border-red-500/40"
                      }`}
                    >
                      {isOpen ? "Open (Active)" : "Closed (Blocked)"}
                    </button>
                  </div>

                  <div className="text-xs text-slate-400">
                    Leads to: <strong className="text-slate-200">{exit.assemblyName}</strong>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Crowd Density Level:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["Low", "Medium", "High"].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => onSetExitCrowdLevel(exit.id, lvl)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                            crowd === lvl
                              ? lvl === "High"
                                ? "bg-amber-600 text-white"
                                : lvl === "Medium"
                                ? "bg-yellow-600 text-white"
                                : "bg-emerald-600 text-white"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          {lvl} {lvl === "High" ? "(+60)" : lvl === "Medium" ? "(+20)" : "(+0)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CORRIDOR / EDGE BLOCKAGES */}
      {activeTab === "corridors" && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Simulate physical obstructions, debris, or locked security doors along specific hallway segments.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {buildingData.edges.filter(e => !e.id.startsWith("evac-")).map(edge => {
              const u = buildingData.nodes.find(n => n.id === edge.from);
              const v = buildingData.nodes.find(n => n.id === edge.to);
              const isBlocked = blockedEdges[edge.id] || false;

              return (
                <div
                  key={edge.id}
                  onClick={() => onToggleEdgeBlocked(edge.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                    isBlocked
                      ? "bg-red-950/40 border-red-500"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">
                      {u?.name} ↔ {v?.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {edge.distance}m • {edge.stepFree ? "♿ Step-Free" : "🪜 Stairs"}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isBlocked ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isBlocked ? "BLOCKED" : "CLEAR"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE ROUTING INSPECTOR */}
      {activeTab === "liveInspector" && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <i data-lucide="cpu" className="w-4 h-4 text-emerald-400"></i>
              Active Routing Diagnostic (Current User Node: {userNode?.name || "None"})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Normal Navigation Route:</span>
                <div className="text-white font-medium">
                  {normalRoute ? normalRoute.pathNodes.map(n => n.name).join(" → ") : "No active destination"}
                </div>
                <div className="text-slate-400">
                  Total Distance: <strong className="text-blue-400">{normalRoute?.totalDistance || 0}m</strong>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Emergency Evacuation Evaluation:</span>
                <div className="text-emerald-400 font-medium">
                  {evacuationResult?.recommendedExit
                    ? `Optimal: ${evacuationResult.recommendedExit.name} (${evacuationResult.recommendedAssembly?.name})`
                    : "No safe exit available"}
                </div>
                <div className="text-slate-400">
                  Calculated Cost: <strong className="text-emerald-400">{evacuationResult?.bestRoute?.totalCost || 0}</strong> | Distance: <strong className="text-slate-200">{evacuationResult?.bestRoute?.totalDistance || 0}m</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
