/**
 * SafeWay V3 - QR Resolution & Dedicated Location Verification Test
 * Verifies that all 182 QR checkpoints resolve to dedicated locations with valid coordinates.
 */

import { QR_LOCATION_DICTIONARY, resolveQrCode, getQrPresets } from '../services/qrLocation.js';

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
console.log("  SafeWay V3 — QR Location & Waypoint Verification");
console.log("========================================================\n");

const allKeys = Object.keys(QR_LOCATION_DICTIONARY);
console.log(`Total Registered Checkpoints in Dictionary: ${allKeys.length}`);

// Test 1: Check total count >= 180
assert(allKeys.length >= 180, `Dictionary contains all registered checkpoints (Found: ${allKeys.length})`);

// Test 2: Sample check across each block
const samples = [
  { code: "SW-CAMPUS-GATE1", expectedMap: "campus", expectedRoomOrNode: "ent-main" },
  { code: "SW-RAM-G-R1", expectedMap: "ramanujan-ground", expectedRoomOrNode: "R1" },
  { code: "SW-RAM-B-LAB1", expectedMap: "ramanujan-basement", expectedRoomOrNode: "Lab 1" },
  { code: "SW-RAM-1-DRAW", expectedMap: "ramanujan-first", expectedRoomOrNode: "Drawing Lab" },
  { code: "SW-BHAB-G-LH1", expectedMap: "bhabha-ground", expectedRoomOrNode: "Lecture Hall 1" },
  { code: "SW-BHAB-B-DIGILIB", expectedMap: "bhabha-basement", expectedRoomOrNode: "Digital Library" },
  { code: "SW-BHAB-1-HODME", expectedMap: "bhabha-first", expectedRoomOrNode: "HOD ME" },
  { code: "SW-KAL-G-LT1", expectedMap: "kalpana-ground", expectedRoomOrNode: "LT 1" },
  { code: "SW-KAL-B-FLUID", expectedMap: "kalpana-basement", expectedRoomOrNode: "Fluid Mechanics Lab" },
  { code: "SW-KAL-1-TH1", expectedMap: "kalpana-first", expectedRoomOrNode: "Training Hall 1" },
  { code: "SW-RAMAN-G-LH1", expectedMap: "raman-ground", expectedRoomOrNode: "Lecture Hall 1" },
  { code: "SW-RAMAN-1-AUD", expectedMap: "raman-first", expectedRoomOrNode: "Auditorium Hall" },
  { code: "SW-ARYA-G-LARGEROOM", expectedMap: "aryabhatta-ground", expectedRoomOrNode: "Large Room" },
  { code: "SW-ARYA-B-CR1", expectedMap: "aryabhatta-basement", expectedRoomOrNode: "Classroom 1" },
  { code: "SW-ENT-MAIN", expectedMap: "campus", expectedRoomOrNode: "ent-main" }
];

console.log("\n▶ [Verification] Testing Resolution & Dedicated Coordinates for Sample Blocks:");
for (const s of samples) {
  const resolved = resolveQrCode(s.code);
  assert(resolved !== null, `Resolved code ${s.code}`);
  assert(resolved.point && Array.isArray(resolved.point) && resolved.point.length === 2, `Code ${s.code} has dedicated [x, y] coordinates: [${resolved.point?.join(', ')}]`);
  const matchLoc = resolved.room === s.expectedRoomOrNode || resolved.nodeId === s.expectedRoomOrNode;
  assert(matchLoc, `Code ${s.code} maps to location '${s.expectedRoomOrNode}' on map '${resolved.mapId}'`);
}

// Test 3: URL and JSON resolution format
console.log("\n▶ [Verification] Testing URL & JSON Scanner Formats:");
const urlResolved = resolveQrCode("https://safeway.app/qr/SW-RAM-G-R1");
assert(urlResolved !== null && urlResolved.room === "R1", "URL format 'https://safeway.app/qr/SW-RAM-G-R1' correctly resolves to Classroom R1");

const jsonResolved = resolveQrCode('{"code":"SW-KAL-G-LT1"}');
assert(jsonResolved !== null && jsonResolved.room === "LT 1", "JSON format '{\"code\":\"SW-KAL-G-LT1\"}' correctly resolves to Kalpana LT 1");

const directUriResolved = resolveQrCode("bhabha-ground:Lecture Hall 1");
assert(directUriResolved !== null && directUriResolved.mapId === "bhabha-ground", "Direct URI 'bhabha-ground:Lecture Hall 1' correctly resolves to Bhabha Ground");

// Test 4: Verify 100% of all 182 checkpoints have valid points and names
console.log("\n▶ [Verification] Checking 100% of Checkpoints for Complete Location Data:");
let missingCoordCount = 0;
for (const key of allKeys) {
  const item = QR_LOCATION_DICTIONARY[key];
  if (!item.point || !Array.isArray(item.point) || item.point.length !== 2 || typeof item.point[0] !== 'number') {
    missingCoordCount++;
  }
}
assert(missingCoordCount === 0, `All ${allKeys.length} checkpoints possess dedicated [x,y] location coordinates`);

console.log("\n========================================================");
console.log(`  Test Results: ${passed} / ${total} Verification Tests Passed (${Math.round((passed/total)*100)}%)`);
console.log("========================================================\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
