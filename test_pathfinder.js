/**
 * SafeWay - Verification Test Suite
 * File: test_pathfinder.js
 * 
 * Verifies:
 * 1. Normal Multi-Floor Routing
 * 2. Sequential Evacuation Routing (Start -> Exit -> Assembly Area)
 * 3. Hazard Avoidance (Fire/Smoke)
 * 4. Multi-Tier Dynamic Crowd Density (Corridors, Zones, Exits)
 * 5. Elevator Fire Safety Policy & Wheelchair Area of Refuge Strategy
 */

import { INITIAL_BUILDING_DATA } from './data/buildingGraph.js';
import { findShortestPath, findSafestEvacuationPath, DEFAULT_EMERGENCY_POLICIES } from './utils/pathfinder.js';

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
console.log("  SafeWay Pathfinding & Evacuation Verification Suite");
console.log("========================================================\n");

// --- TEST 1: Normal Multi-Floor Navigation ---
console.log("▶ [Test 1] Normal Multi-Floor Navigation (Main Entrance 1F -> Room 204 2F)");
const test1 = findShortestPath("ent-main", "room-204", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, { isEmergency: false });
assert(test1 !== null, "Found valid multi-floor path");
assert(test1.pathNodeIds.includes("lift-1") && test1.pathNodeIds.includes("lift-2"), "Uses central elevator for floor transition in normal mode");
assert(test1.totalDistance > 0, `Total metric distance calculated (${test1.totalDistance}m)`);

// --- TEST 2: Sequential Evacuation Path Verification ---
console.log("\n▶ [Test 2] Sequential Evacuation Path (User -> Exit Doorway -> Outdoor Assembly Area)");
const test2 = findSafestEvacuationPath("lobby", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, INITIAL_BUILDING_DATA.exits, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true });
assert(test2.bestRoute !== null, "Evacuation route generated");
const exitIndex = test2.bestRoute.pathNodeIds.indexOf(test2.recommendedExit.id);
const assemblyIndex = test2.bestRoute.pathNodeIds.indexOf(test2.recommendedAssembly.id);
assert(exitIndex !== -1 && assemblyIndex !== -1, "Path contains both the Exit and Assembly Area");
assert(exitIndex < assemblyIndex, "Strict sequential ordering verified: User -> Exit -> Assembly Area");

// --- TEST 3: Fire Hazard Detour ---
console.log("\n▶ [Test 3] Active Fire in Zone B (East Wing & Lab 101)");
const test3 = findSafestEvacuationPath("lobby", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, INITIAL_BUILDING_DATA.exits, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true }, {}, { "zone-b": "high" });
assert(test3.recommendedExit.id === "exit-2" || test3.recommendedExit.id === "exit-3", "Reroutes away from fire in Zone B and safely selects Exit 2 / Exit 3");
assert(!test3.bestRoute.pathNodeIds.includes("exit-1"), "Strictly avoids physically compromised Exit 1");

// --- TEST 4: Multi-Tier Dynamic Crowd Density ---
console.log("\n▶ [Test 4] Multi-Tier Dynamic Crowd Balancing (Corridor + Zone + Exit)");
const crowdConfig = {
  exits: { "exit-1": "High", "exit-2": "Low", "exit-3": "Low" },
  edges: { "e1-j5-j6": "High" },
  zones: { "zone-b": "High" }
};
const test4 = findSafestEvacuationPath("junc-1-5", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, INITIAL_BUILDING_DATA.exits, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true }, crowdConfig);
assert(test4.recommendedExit.id !== "exit-1", "Successfully rejects congested East Corridor & Exit 1 (Cost 392 vs < 125 for clear exits)");
assert(test4.recommendedExit.id === "exit-3" || test4.recommendedExit.id === "exit-2", "Diverts flow to clear safe exit (Exit 3 / Exit 2)");

// --- TEST 5: Elevator Fire Safety Policy & Area of Refuge Strategy ---
console.log("\n▶ [Test 5] Fire Emergency Elevator Lockout & Accessible Area of Refuge");
// User in wheelchair on Floor 2 (Room 202) during active fire emergency
const test5 = findSafestEvacuationPath("room-202", INITIAL_BUILDING_DATA.nodes, INITIAL_BUILDING_DATA.edges, INITIAL_BUILDING_DATA.exits, INITIAL_BUILDING_DATA.assemblyAreas, { isEmergency: true, accessibilityMode: true }, {}, { "zone-b": "high" });
assert(test5.isRefugeRoute === true, "Enforces fire policy: elevators locked down, routes to Area of Refuge");
assert(test5.bestRoute.pathNodeIds.includes("refuge-2b") || test5.bestRoute.pathNodeIds.includes("refuge-2a"), "Successfully reaches 2-hour fire rated Area of Rescue Assistance");

console.log("\n========================================================");
console.log(`  Verification Summary: ${passed} / ${total} Tests Passed (${Math.round((passed/total)*100)}%)`);
console.log("========================================================\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
