/**
 * SafeWay - 1-Click Interactive Scenario Tester
 * Directly executes Scenarios 1 to 5 from the user requirements specification
 * with informative explanations of algorithm behavior.
 */

import React from 'react';

export function ScenarioTester({ onRunScenario, activeScenarioId }) {
  // Gate component so it only renders in development/testing mode
  const isDev = Boolean(
    (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') ||
    (typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.__SAFEWAY_DEV__ === true ||
      window.location.search.includes('dev=true')
    ))
  );

  if (!isDev) return null;

  const scenarios = [
    {
      id: "scenario-1",
      number: "1",
      title: "Normal Multi-Floor Navigation",
      summary: "Start at Main Entrance (Floor 1) → Navigate to Room 204 (Floor 2)",
      description: "Calculates shortest standard path across floors using stairs or lift without hazard penalties.",
      badge: "Normal Mode"
    },
    {
      id: "scenario-2",
      number: "2",
      title: "Fire Hazard Rerouting (Zone B)",
      summary: "Simulates Fire in Zone B (Lab 101 & East Corridor)",
      description: "Immediate dynamic reroute! The path avoids the East wing and navigates towards Exit 3 / West wing.",
      badge: "Emergency Hazard"
    },
    {
      id: "scenario-3",
      number: "3",
      title: "Crowd Congestion Avoidance",
      summary: "Exit 1 has High Crowd (+60 cost) vs Exit 2 Low Crowd",
      description: "SafeWay shifts the recommended route to Exit 2 because safety and flow outweigh raw distance.",
      badge: "Crowd Density"
    },
    {
      id: "scenario-4",
      number: "4",
      title: "Exit Failure & Dynamic Fallback",
      summary: "Exit 2 becomes blocked/closed during active evacuation",
      description: "System immediately recalculates and guides the occupant to the next best operational safe exit.",
      badge: "Exit Redundancy"
    },
    {
      id: "scenario-5",
      number: "5",
      title: "Step-Free Accessible Navigation",
      summary: "Wheelchair occupant at Room 202 heading to Lobby",
      description: "Accessibility mode ignores stairs-only edges (Infinity cost) and strictly guides through the Central Lift.",
      badge: "Accessibility ♿"
    }
  ];

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
            <i data-lucide="play-circle" className="w-5 h-5"></i>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Quick MVP Demo Scenarios</h3>
            <p className="text-xs text-slate-400">Click any scenario below to verify end-to-end routing behavior</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {scenarios.map(sc => {
          const isActive = activeScenarioId === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => onRunScenario(sc.id)}
              className={`p-3.5 rounded-xl text-left border flex flex-col justify-between transition-all duration-200 ${
                isActive
                  ? "bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-900/30 scale-[1.02]"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 text-xs font-black flex items-center justify-center">
                    {sc.number}
                  </span>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {sc.badge}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white leading-tight mb-1">{sc.title}</h4>
                <p className="text-[11px] text-slate-300 font-medium line-clamp-2">{sc.summary}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                {sc.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
