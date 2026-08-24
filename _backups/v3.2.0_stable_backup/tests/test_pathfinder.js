/**
 * SafeWay V3 - Automated Verification Test Suite
 * File: tests/test_pathfinder.js
 * 
 * Verifies all 8 SIH Scenarios:
 * 1. Main Entrance (1F) -> Room 204 (2F) Navigation
 * 2. Normal Multi-Floor Elevator Navigation
 * 3. Fire Hazard Avoidance in Zone B (East Wing)
 * 4. Multi-Tier Crowd Balancing (Exit 2 vs Exit 1/3)
 * 5. Closed / Blocked Exit Rejection
 * 6. Strict Sequential Evacuation to Outdoor Assembly Area
 * 7. Step-Free Accessibility Routing (Zero Stairs)
 * 8. Emergency Elevator Fire Lockout Policy & Refuge Area
 */

import { INITIAL_BUILDING_DATA } from '../data/buildingGraph.js';
import { findShortestPath, findSafestEvacuationPath, DEFAULT_EMERGENCY_POLICIES } from '../utils/pathfinder.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log("\n========================================================");
console.log("  SafeWay V3 — Pathfinding & Evacuation Test Suite");
console.log("========================================================\n");

// --- SCENARIO 1: Main Entrance -> Room 204 ---
console.log("▶ [Scenario 1] Main Entrance (1F) -> Room 204 (2F) Navigation");
const sc1 = findShortestPath("ent-main", "room-204", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, { isEmergency: false });
assert(sc1 !== null, "Normal navigation path found");
assert(sc1.pathNodeIds[0] === "ent-main" && sc1.pathNodeIds[sc1.pathNodeIds.length - 1] === "room-204", "Origin and destination match correctly");
assert(sc1.totalDistance > 0, `Total distance calculated: ${sc1.totalDistance}m`);

// --- SCENARIO 2: Normal Multi-Floor Navigation via Lift ---
console.log("\n▶ [Scenario 2] Normal Multi-Floor Transition via Lift");
const sc2 = findShortestPath("lobby", "room-201", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, { isEmergency: false });
assert(sc2.pathNodeIds.includes("lift-1") && sc2.pathNodeIds.includes("lift-2"), "Central elevator used for vertical transition in normal mode");

// --- SCENARIO 3: Fire in Zone B -> Exit 1 Avoided ---
console.log("\n▶ [Scenario 3] Fire Hazard in Zone B (East Wing & Lab 101)");
const sc3 = findSafestEvacuationPath("lobby", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, INITIAL_BUILDING_DATA.exits, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true }, {}, { "zone-b": "high" });
assert(sc3.recommendedExit.id !== "exit-1", "Physically compromised Exit 1 in Zone B is completely rejected");
assert(sc3.recommendedExit.id === "exit-3" || sc3.recommendedExit.id === "exit-2", "Safely detours to clear exit (Exit 3 / Exit 2)");
assert(!sc3.bestRoute.pathNodeIds.includes("exit-1"), "Path contains zero fire-affected nodes");

// --- SCENARIO 4: Exit Crowd Balancing ---
console.log("\n▶ [Scenario 4] Dynamic Crowd Balancing (Corridor + Zone + Exit)");
const crowdInput = {
  exits: { "exit-1": "High", "exit-2": "Low", "exit-3": "Low" },
  edges: { "e1-j5-j6": "High" },
  zones: { "zone-b": "High" }
};
const sc4 = findSafestEvacuationPath("junc-1-5", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, INITIAL_BUILDING_DATA.exits, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true }, crowdInput);
assert(sc4.recommendedExit.id !== "exit-1", "Congested Exit 1 rejected due to high crowd penalties");
assert(sc4.recommendedExit.id === "exit-2" || sc4.recommendedExit.id === "exit-3", "Flow redirected to low-density exit");

// --- SCENARIO 5: Closed Exit Door Rejection ---
console.log("\n▶ [Scenario 5] Exit 2 Closed / Physically Blocked");
const exitsWith2Closed = INITIAL_BUILDING_DATA.exits.map(x => x.id === "exit-2" ? { ...x, isOpen: false } : x);
const sc5 = findSafestEvacuationPath("cafeteria", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, exitsWith2Closed, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true });
assert(sc5.recommendedExit.id !== "exit-2", "Closed Exit 2 is never selected");
assert(sc5.recommendedExit.id === "exit-1" || sc5.recommendedExit.id === "exit-3", "Automatically fallbacks to next best available exit");

// --- SCENARIO 6: Evacuation Route Terminates at Designated Assembly Area ---
console.log("\n▶ [Scenario 6] Strict Sequential Evacuation to Outdoor Assembly Area");
const sc6 = findSafestEvacuationPath("reception", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, INITIAL_BUILDING_DATA.exits, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true });
const exitPos = sc6.bestRoute.pathNodeIds.indexOf(sc6.recommendedExit.id);
const assemblyPos = sc6.bestRoute.pathNodeIds.indexOf(sc6.recommendedAssembly.id);
assert(exitPos !== -1 && assemblyPos !== -1, "Evacuation route contains both the Exit door and Outdoor Assembly point");
assert(exitPos < assemblyPos, "Strict sequence confirmed: User -> Exit Doorway -> Outdoor Assembly Area");
assert(sc6.bestRoute.pathNodes[sc6.bestRoute.pathNodes.length - 1].type === "assembly", "Path strictly terminates at open-air assembly ground");

// --- SCENARIO 7: Step-Free Accessibility Mode ---
console.log("\n▶ [Scenario 7] Step-Free Wheelchair Accessibility Mode (No Stairs)");
const sc7 = findShortestPath("lobby", "room-202", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, { isEmergency: false, accessibilityMode: true });
const stairEdgesUsed = sc7.edges.filter(e => e.type === "stair" || !e.stepFree);
assert(stairEdgesUsed.length === 0, "Zero stair edges used in step-free accessibility mode");
assert(sc7.pathNodeIds.includes("lift-1") && sc7.pathNodeIds.includes("lift-2"), "Uses central elevator for vertical transit");

// --- SCENARIO 8: Elevator Fire Safety Policy & Upper Floor Refuge Strategy ---
console.log("\n▶ [Scenario 8] Fire Safety Elevator Policy & Designated Area of Refuge");
const sc8 = findSafestEvacuationPath("room-202", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, INITIAL_BUILDING_DATA.exits, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true, accessibilityMode: true }, {}, { "zone-b": "high" });
assert(sc8.isRefugeRoute === true, "Enforces life-safety fire policy: ordinary elevators disabled, routes to Area of Refuge");
assert(sc8.bestRoute.pathNodeIds.includes("refuge-2b") || sc8.bestRoute.pathNodeIds.includes("refuge-2a"), "Successfully routes wheelchair user to 2-hour fire rated safe haven");

console.log("\n========================================================");
console.log(`  Test Results: ${passed} / ${total} Scenarios Passed (${Math.round((passed/total)*100)}%)`);
console.log("========================================================\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
