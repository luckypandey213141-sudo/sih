/**
 * SafeWay - Emergency Evacuation Mode & High-Contrast Banner Component
 * Designed specifically for high-stress situations with large text,
 * color-coded exit status cards, and direct primary guidance.
 */

import React from 'react';

export function EmergencyBanner({
  isEmergency,
  evacuationResult,
  activeHazardSummary,
  userLocationNode,
  onClearEmergency
}) {
  if (!isEmergency) return null;

  const recommendedExit = evacuationResult?.recommendedExit;
  const recommendedAssembly = evacuationResult?.recommendedAssembly;
  const bestRoute = evacuationResult?.bestRoute;
  const allExits = evacuationResult?.allExitEvaluations || [];

  // Determine first primary turn instruction
  const firstInstruction = bestRoute?.steps?.[1] || bestRoute?.steps?.[0];

  return (
    <div className="w-full bg-red-950 border-y-4 border-red-600 shadow-2xl p-4 sm:p-6 text-white animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Emergency Beacon Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-red-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/50 animate-bounce">
              <i data-lucide="siren" className="w-6 h-6 text-white"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded tracking-widest animate-pulse">
                  CRITICAL EVACUATION ACTIVE
                </span>
                <span className="text-red-300 text-xs font-mono">AUTOMATED HAZARD ROUTING</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                {activeHazardSummary || "Emergency Evacuation in Progress — Proceed to Nearest Safe Exit"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClearEmergency}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-700 transition"
          >
            Clear / Stand Down
          </button>
        </div>

        {/* Primary Giant Instruction Card */}
        {bestRoute ? (
          <div className="bg-slate-950 rounded-2xl p-5 border-2 border-emerald-500 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <i data-lucide="shield-alert" className="w-4 h-4 text-emerald-400"></i>
                Safest Recommended Evacuation Route
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-300 tracking-tight leading-tight">
                {recommendedExit
                  ? `Proceed to ${recommendedExit.name} → ${recommendedAssembly?.name || "Outdoor Assembly"}`
                  : "Follow Emergency Signage to Safety"}
              </div>
              {firstInstruction && (
                <p className="text-slate-300 text-sm sm:text-base font-medium flex items-center gap-2 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Next immediate action: <strong className="text-white">{firstInstruction.title}</strong> ({firstInstruction.description})
                </p>
              )}
            </div>

            {/* Metrics & Floor Quick Switch */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center min-w-[100px]">
                <div className="text-[10px] uppercase font-mono text-slate-400">Safe Distance</div>
                <div className="text-xl font-black text-emerald-400">{bestRoute.totalDistance}m</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center min-w-[100px]">
                <div className="text-[10px] uppercase font-mono text-slate-400">Est. Time</div>
                <div className="text-xl font-black text-white">~{Math.ceil(bestRoute.totalDistance / 1.2)}s</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-900/80 border-2 border-red-500 rounded-2xl p-6 text-center space-y-2">
            <h3 className="text-2xl font-black text-white">⚠️ NO SAFE EXIT PATH FOUND FROM YOUR CURRENT LOCATION</h3>
            <p className="text-red-100 max-w-xl mx-auto text-sm">
              All routes leading out from your sector are currently compromised or blocked by active hazards.
              <strong> Shelter in place immediately, close doors, and await first responders.</strong>
            </p>
          </div>
        )}

        {/* Live Exit Evaluation Cards */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold text-red-200 uppercase tracking-wider flex items-center justify-between">
            <span>Facility Emergency Exits Status</span>
            <span className="text-[11px] font-normal text-red-300">Auto-weighted by Distance, Blockages & Crowd Density</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {allExits.map((item, idx) => {
              const isBest = recommendedExit?.id === item.exit.id;
              const isBlockedOrClosed = !item.isOpen || item.cost === Infinity;

              return (
                <div
                  key={item.exit.id}
                  className={`rounded-xl p-3.5 border transition-all ${
                    isBest
                      ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-900/30'
                      : isBlockedOrClosed
                      ? 'bg-slate-950/60 border-red-900/60 opacity-60'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-white">{item.exit.name}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        isBest
                          ? 'bg-emerald-500 text-slate-950 font-extrabold'
                          : isBlockedOrClosed
                          ? 'bg-red-800 text-red-100'
                          : item.crowdLevel === 'High'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isBest ? '★ RECOMMENDED' : isBlockedOrClosed ? 'AVOID / BLOCKED' : item.crowdLevel === 'High' ? 'CONGESTED' : 'OPEN'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-2 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Crowd Density:</span>
                      <span
                        className={`font-semibold ${
                          item.crowdLevel === 'High'
                            ? 'text-amber-400'
                            : item.crowdLevel === 'Medium'
                            ? 'text-yellow-300'
                            : 'text-emerald-400'
                        }`}
                      >
                        {item.crowdLevel} Crowd
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Calculated Cost:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {item.cost === Infinity ? 'Unreachable' : `${Math.round(item.cost)} pts`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
