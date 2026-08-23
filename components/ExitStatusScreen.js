/**
 * SafeWay - Exit Status Screen Component
 * Real-time monitoring of all 3 emergency exits with crowd levels and operational states.
 */

export function ExitStatusScreen({
  buildingData,
  exitCrowdLevels,
  exitStatuses,
  evacuationResult,
  userLocationNodeId
}) {
  const userNode = buildingData.nodes.find(n => n.id === userLocationNodeId);
  const recommendedExit = evacuationResult?.recommendedExit;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="door-closed" className="w-5 h-5 text-emerald-400"></i>
            Emergency Exit Status & Capacity Monitor
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Live telemetry for all facility emergency exits and outdoor assembly points
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buildingData.exits.map(exit => {
          const crowd = exitCrowdLevels[exit.id] || exit.crowdLevel || "Low";
          const isOpen = exitStatuses[exit.id] !== false;
          const isRecommended = recommendedExit?.id === exit.id;
          const evalData = evacuationResult?.allExitEvaluations?.find(e => e.exit.id === exit.id);

          return (
            <div
              key={exit.id}
              className={`rounded-2xl p-5 border transition-all ${
                isRecommended
                  ? "bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/40"
                  : !isOpen
                  ? "bg-red-950/20 border-red-900/60"
                  : "bg-slate-900/80 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      !isOpen
                        ? "bg-red-500 shadow-sm shadow-red-500"
                        : crowd === "High"
                        ? "bg-amber-500 shadow-sm shadow-amber-500"
                        : "bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse"
                    }`}
                  ></div>
                  <h4 className="font-bold text-white text-base">{exit.name}</h4>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    !isOpen
                      ? "bg-red-900/80 text-red-200"
                      : crowd === "High"
                      ? "bg-amber-900/80 text-amber-200"
                      : "bg-emerald-900/80 text-emerald-200"
                  }`}
                >
                  {isOpen ? "OPERATIONAL" : "BLOCKED / CLOSED"}
                </span>
              </div>

              {/* Status Details */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-medium text-slate-200">Floor {exit.floor} ({exit.zone.toUpperCase()})</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Assembly Zone:</span>
                  <span className="font-medium text-slate-200">{exit.assemblyName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Crowd Density:</span>
                  <span
                    className={`font-bold uppercase ${
                      crowd === "High" ? "text-amber-400" : crowd === "Medium" ? "text-yellow-300" : "text-emerald-400"
                    }`}
                  >
                    {crowd}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Distance from You:</span>
                  <span className="font-mono text-slate-200">
                    {evalData?.distance !== undefined && evalData?.distance !== Infinity ? `${evalData.distance}m` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Evacuation Recommendation:</span>
                  <span
                    className={`font-bold text-[11px] ${
                      isRecommended ? "text-emerald-400 font-black" : !isOpen ? "text-red-400" : "text-slate-400"
                    }`}
                  >
                    {isRecommended ? "★ PRIMARY SAFEST" : !isOpen ? "DO NOT USE" : "STANDBY / ALTERNATE"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
