/**
 * SafeWay V3 - QR Indoor Location Positioning Service
 * Resolves physical indoor QR codes into building graph node coordinates.
 */

export const QR_LOCATION_DICTIONARY = {
  // Floor 1 Checkpoints
  "SW-ENT-MAIN": { nodeId: "ent-main", name: "Main Entrance (1F)", floor: 1, zone: "zone-a" },
  "SW-ENT-NORTH": { nodeId: "ent-north", name: "North Entrance (1F)", floor: 1, zone: "zone-a" },
  "SW-LOBBY": { nodeId: "lobby", name: "Grand Lobby (1F)", floor: 1, zone: "zone-a" },
  "SW-RECEPTION": { nodeId: "reception", name: "Reception Desk (1F)", floor: 1, zone: "zone-a" },
  "SW-ADMIN": { nodeId: "admin", name: "Admin Office (1F)", floor: 1, zone: "zone-a" },
  "SW-CAFE": { nodeId: "cafeteria", name: "Cafeteria (1F)", floor: 1, zone: "zone-c" },
  "SW-AUDITORIUM": { nodeId: "auditorium", name: "Auditorium (1F)", floor: 1, zone: "zone-c" },
  "SW-LAB101": { nodeId: "lab-101", name: "Lab 101 Physics (1F)", floor: 1, zone: "zone-b" },
  "SW-LAB102": { nodeId: "lab-102", name: "Lab 102 Robotics (1F)", floor: 1, zone: "zone-b" },
  "SW-LIFT1": { nodeId: "lift-1", name: "Central Elevator (1F)", floor: 1, zone: "zone-c" },
  "SW-STAIRA1": { nodeId: "stair-a-1", name: "Stairwell A (1F)", floor: 1, zone: "zone-b" },
  "SW-STAIRB1": { nodeId: "stair-b-1", name: "Stairwell B (1F)", floor: 1, zone: "zone-a" },
  "SW-RESTROOM1": { nodeId: "restroom-1", name: "Restrooms 1F", floor: 1, zone: "zone-c" },

  // Floor 2 Checkpoints
  "SW-ROOM201": { nodeId: "room-201", name: "Room 201 Lecture Hall (2F)", floor: 2, zone: "zone-d" },
  "SW-ROOM202": { nodeId: "room-202", name: "Room 202 Computer Lab (2F)", floor: 2, zone: "zone-d" },
  "SW-ROOM203": { nodeId: "room-203", name: "Room 203 Conference (2F)", floor: 2, zone: "zone-d" },
  "SW-ROOM204": { nodeId: "room-204", name: "Room 204 Faculty Lounge (2F)", floor: 2, zone: "zone-d" },
  "SW-LIBRARY": { nodeId: "library", name: "Central Library (2F)", floor: 2, zone: "zone-e" },
  "SW-BOARDROOM": { nodeId: "boardroom", name: "Executive Boardroom (2F)", floor: 2, zone: "zone-e" },
  "SW-STUDY": { nodeId: "study-lounge", name: "Quiet Study Lounge (2F)", floor: 2, zone: "zone-e" },
  "SW-LIFT2": { nodeId: "lift-2", name: "Central Elevator (2F)", floor: 2, zone: "zone-d" },
  "SW-STAIRA2": { nodeId: "stair-a-2", name: "Stairwell A (2F)", floor: 2, zone: "zone-e" },
  "SW-STAIRB2": { nodeId: "stair-b-2", name: "Stairwell B (2F)", floor: 2, zone: "zone-d" },
  "SW-REFUGE2A": { nodeId: "refuge-2a", name: "Area of Refuge 2F East", floor: 2, zone: "zone-e" },
  "SW-REFUGE2B": { nodeId: "refuge-2b", name: "Area of Refuge 2F West", floor: 2, zone: "zone-d" }
};

/**
 * Resolves a scanned QR string (or raw text) to a graph node ID
 */
export function resolveQrCode(rawInput) {
  if (!rawInput) return null;
  const cleanKey = String(rawInput).trim().toUpperCase();

  // 1. Direct dictionary match
  if (QR_LOCATION_DICTIONARY[cleanKey]) {
    return QR_LOCATION_DICTIONARY[cleanKey];
  }

  // 2. Match with URL or JSON payload format (e.g. https://safeway.app/qr/SW-LAB101)
  for (const [key, val] of Object.entries(QR_LOCATION_DICTIONARY)) {
    if (cleanKey.includes(key)) {
      return val;
    }
  }

  // 3. Fallback direct node ID match
  return { nodeId: rawInput.toLowerCase(), name: rawInput, floor: 1, zone: "zone-a" };
}

/**
 * Get all available QR checkpoint presets for UI simulation
 */
export function getQrPresets() {
  return Object.entries(QR_LOCATION_DICTIONARY).map(([code, info]) => ({
    code,
    ...info
  }));
}
