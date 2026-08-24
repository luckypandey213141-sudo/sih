#!/usr/bin/env python3
"""
Generates the comprehensive services/qrLocation.js with:
1. All 182 QR checkpoints mapped to their dedicated locations.
2. Coordinates (x, y point), mapId, room, nodeId, floor, zone, and human-readable name for each.
3. Enhanced resolveQrCode parser that supports QR Codes, URLs, JSON payloads, and manual keys.
"""

import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_FILE = os.path.join(BASE_DIR, "services", "qrLocation.js")

# Load checkpoint definitions
from generate_qr_packages import CHECKPOINTS_DATA

ROOM_ROUTE_TARGETS = {
  "ramanujan-basement": {
    "Lab 1": [600, 275],
    "Lab 2": [680, 275],
    "Lab 3": [760, 275],
    "Lab 4": [600, 430],
    "Lab 5": [680, 430],
    "Lab 6": [760, 430],
    "Lift": [220, 275],
    "Stairs 1": [550, 260],
    "Stairs 2": [720, 260],
    "Exit": [740, 430]
  },
  "ramanujan-ground": {
    "R1": [350, 455],
    "R2": [830, 455],
    "R3": [830, 520],
    "R4": [650, 455],
    "R6": [220, 350],
    "R7": [405, 250],
    "R8": [220, 300],
    "R9": [330, 250],
    "R10": [480, 250],
    "R11": [565, 250],
    "R12": [650, 250],
    "W1": [820, 250],
    "W2": [205, 250],
    "Badminton Court": [500, 390],
    "Lift": [190, 235],
    "Entry / Exit 1": [250, 590],
    "Entry / Exit 2": [920, 300],
    "Entry / Exit 3": [760, 590]
  },
  "ramanujan-first": {
    "Drawing Lab": [500, 325],
    "LT 1": [260, 400],
    "LT 2": [420, 400],
    "LT 3": [580, 400],
    "LT 4": [740, 400],
    "Boys W/C": [840, 260],
    "Girls W/C": [840, 380],
    "Lift": [190, 235],
    "Stairs": [800, 235],
    "Entry / Exit": [920, 325]
  },
  "bhabha-ground": {
    "Lecture Hall 1": [300, 320],
    "Lecture Hall 2": [720, 320],
    "Reception": [330, 420],
    "Registrar": [700, 420],
    "Director Office": [300, 500],
    "Admission Cell": [720, 500],
    "Sitting Hall": [620, 500],
    "Drinking Water": [740, 260],
    "Boys W/C": [300, 220],
    "Girls W/C": [740, 220],
    "Stairs 1": [295, 175],
    "Stairs 2": [755, 175],
    "Entry": [500, 590]
  },
  "bhabha-first": {
    "HOD ME": [300, 300],
    "LT 1": [420, 300],
    "LT 2": [580, 300],
    "LT 3": [740, 300],
    "Faculty Cabins": [400, 450],
    "ECE Lab": [650, 450],
    "Boys W/C": [300, 220],
    "Girls W/C": [740, 220],
    "Stairs": [755, 175],
    "Entry / Exit 1": [500, 590],
    "Entry / Exit 2": [780, 590]
  },
  "bhabha-basement": {
    "Digital Library": [300, 335],
    "Library": [500, 335],
    "Main Library": [700, 335],
    "Lobby / Corridor": [500, 420],
    "Entry Gate": [410, 590],
    "Exit": [720, 590]
  },
  "kalpana-ground": {
    "LT 1": [640, 220],
    "LT 2": [235, 400],
    "LT 3": [370, 400],
    "CCPD 1": [355, 400],
    "CCPD 2": [610, 400],
    "Computer Lab 1": [720, 400],
    "HOD CSE": [475, 440],
    "Boys W/C": [300, 220],
    "Girls W/C": [840, 220],
    "Lift": [190, 220],
    "Stairs": [385, 220],
    "Entry": [500, 590],
    "Emergency Exit": [500, 120]
  },
  "kalpana-first": {
    "Training Hall 1": [300, 325],
    "Training Hall 2": [450, 325],
    "Class Room 1": [600, 325],
    "Class Room 2": [750, 325],
    "Class Room 3": [300, 450],
    "Class Room 4": [600, 450],
    "Store": [750, 450],
    "Boys W/C": [300, 220],
    "Girls W/C": [840, 220],
    "Entry / Exit": [145, 325],
    "Emergency Exit": [175, 300]
  },
  "kalpana-basement": {
    "Fluid Mechanics Lab": [320, 290],
    "Computer Lab 1": [480, 290],
    "Computer Lab 2": [640, 290],
    "Automobile Lab": [400, 450],
    "Store Room": [700, 450],
    "Lift": [190, 205],
    "Stair 1": [385, 205],
    "Stair 2": [640, 450],
    "Entry / Exit": [500, 590]
  },
  "raman-ground": {
    "Lecture Hall 1": [380, 350],
    "Lecture Hall 2": [500, 385],
    "Samvaad Club": [585, 350],
    "Kalakrit Club": [300, 385],
    "Medical Room": [650, 385],
    "Drinking Water": [850, 410],
    "Boys W/C": [220, 300],
    "Girls W/C": [805, 300],
    "Lift": [155, 345],
    "Stairs": [755, 260],
    "Entry / Exit 1": [650, 590],
    "Entry / Exit 2": [920, 300]
  },
  "raman-first": {
    "Auditorium Hall": [500, 270],
    "Lecture Hall": [750, 270],
    "Drinking Water": [850, 410],
    "Boys W/C": [220, 300],
    "Girls W/C": [805, 300],
    "Lift": [155, 345],
    "Stairs": [755, 260],
    "Entry / Exit 1": [330, 190],
    "Entry / Exit 2": [755, 190]
  },
  "aryabhatta-ground": {
    "Large Room": [440, 290],
    "Room 1": [260, 390],
    "Room 2": [350, 390],
    "Room 3": [440, 390],
    "Room 4": [300, 300],
    "Room 5": [385, 300],
    "Lab": [650, 290],
    "Temple": [720, 440],
    "Boys Washroom": [330, 230],
    "Girls Washroom": [660, 230],
    "Lift": [420, 315],
    "Stairs 1": [430, 505],
    "Stairs 2": [650, 505],
    "Entry / Exit": [500, 590]
  },
  "aryabhatta-basement": {
    "Classroom 1": [300, 330],
    "Classroom 2": [450, 330],
    "Classroom 3": [600, 330],
    "Lab 1": [350, 480],
    "Lab 2": [550, 480],
    "Room": [700, 330],
    "Lift": [320, 540],
    "Stairs 1": [220, 170],
    "Stairs 2": [650, 170]
  }
}

CAMPUS_NODE_COORDS = {
    "ent-main": [440, 565],
    "ent-north": [155, 225],
    "lobby": [191, 397],
    "vishwakarma": [105, 445],
    "admin": [355, 206],
    "reception": [440, 290],
    "restroom-1": [540, 207],
    "cafeteria": [690, 393],
    "auditorium": [760, 490],
    "lab-101": [780, 207],
    "lab-102": [950, 390],
    "playground": [410, 105],
    "gate-2-destination": [972, 140],
    "lift-1": [440, 347],
    "stair-a-1": [900, 225],
    "stair-b-1": [355, 347],
    "exit-1": [972, 140],
    "exit-2": [440, 585],
    "exit-3": [155, 225],
    "campus-ary-left": [560, 410],
    "assembly-a": [535, 65],
    "assembly-b": [90, 145],
    "room-201": [260, 160],
    "room-202": [260, 440],
    "room-203": [440, 160],
    "room-204": [440, 440],
    "library": [640, 160],
    "boardroom": [640, 440],
    "restroom-2": [800, 160],
    "study-lounge": [800, 440],
    "lift-2": [500, 300],
    "stair-a-2": [730, 300],
    "stair-b-2": [350, 300],
    "refuge-2a": [730, 240],
    "refuge-2b": [350, 240]
}

BLOCK_CAMPUS_ENTRANCE_NODES = {
  "ramanujan": "admin",
  "ramanujan-ground": "admin",
  "ramanujan-first": "admin",
  "ramanujan-basement": "admin",
  "bhabha": "lobby",
  "bhabha-ground": "lobby",
  "bhabha-first": "lobby",
  "bhabha-basement": "lobby",
  "kalpana": "restroom-1",
  "kalpana-ground": "restroom-1",
  "kalpana-first": "restroom-1",
  "kalpana-basement": "restroom-1",
  "raman": "lab-101",
  "raman-ground": "lab-101",
  "raman-first": "lab-101",
  "aryabhatta": "cafeteria",
  "aryabhatta-ground": "cafeteria",
  "aryabhatta-basement": "cafeteria"
}

dict_entries = {}

for group in CHECKPOINTS_DATA:
    for cp in group["checkpoints"]:
        code = cp["code"]
        alt_key = cp["alt_key"]
        name = cp["name"]
        zone = cp.get("zone", "Zone A").lower().replace(" ", "-")

        floor = 1
        if "basement" in group["floor_name"].lower() or "basement" in alt_key:
            floor = 0
        elif "first" in group["floor_name"].lower() or "first" in alt_key or "2f" in name.lower():
            floor = 2

        entry = {
            "code": code,
            "name": name,
            "floor": floor,
            "zone": zone,
            "desc": cp.get("desc", "")
        }

        if ":" in alt_key:
            map_id, room_or_node = alt_key.split(":", 1)
            entry["mapId"] = map_id
            if map_id == "campus":
                entry["nodeId"] = room_or_node
                entry["point"] = CAMPUS_NODE_COORDS.get(room_or_node, [440, 565])
            else:
                entry["room"] = room_or_node
                entry["nodeId"] = BLOCK_CAMPUS_ENTRANCE_NODES.get(map_id, "admin")
                if map_id in ROOM_ROUTE_TARGETS and room_or_node in ROOM_ROUTE_TARGETS[map_id]:
                    entry["point"] = ROOM_ROUTE_TARGETS[map_id][room_or_node]
                else:
                    entry["point"] = [450, 350]
        else:
            entry["nodeId"] = "ent-main"
            entry["mapId"] = "campus"
            entry["point"] = [440, 565]

        dict_entries[code] = entry

function_code = r"""
/**
 * Resolves any scanned QR string, URL, room key, or JSON payload to its dedicated location object.
 */
export function resolveQrCode(rawInput) {
  if (!rawInput) return null;
  const cleanStr = String(rawInput).trim();
  const upperKey = cleanStr.toUpperCase();

  // 1. Direct dictionary match by exact Code (e.g. "SW-RAM-G-R1")
  if (QR_LOCATION_DICTIONARY[upperKey]) {
    return QR_LOCATION_DICTIONARY[upperKey];
  }

  // 2. Extract canonical SW-... code from anywhere in scanned string/URL
  const swCodeMatch = upperKey.match(/SW-[A-Z0-9\-]+/);
  if (swCodeMatch && QR_LOCATION_DICTIONARY[swCodeMatch[0]]) {
    return QR_LOCATION_DICTIONARY[swCodeMatch[0]];
  }

  // 3. Extract URL query parameter (?qr=... or &qr=...)
  const urlParamMatch = cleanStr.match(/[?&]qr=([^&#]+)/i);
  if (urlParamMatch) {
    const decoded = decodeURIComponent(urlParamMatch[1]).trim();
    const res = resolveQrCode(decoded);
    if (res) return res;
  }

  // 4. Match JSON Payload format (e.g. {"code":"SW-RAM-G-R1"} or {"room":"R1","mapId":"ramanujan-ground"})
  if (cleanStr.startsWith("{") && cleanStr.endsWith("}")) {
    try {
      const parsed = JSON.parse(cleanStr);
      if (parsed.code && QR_LOCATION_DICTIONARY[parsed.code.toUpperCase()]) {
        return QR_LOCATION_DICTIONARY[parsed.code.toUpperCase()];
      }
      if (parsed.mapId && parsed.room) {
        return resolveQrCode(`${parsed.mapId}:${parsed.room}`);
      }
    } catch (e) {}
  }

  // 5. Match dictionary substring keys
  for (const [key, val] of Object.entries(QR_LOCATION_DICTIONARY)) {
    if (upperKey.includes(key)) {
      return val;
    }
  }

  // 6. Direct mapId:room lookup anywhere in string (e.g. "ramanujan-ground:R1" or "Positioning URI: ramanujan-ground:R1")
  const mapRoomMatch = cleanStr.match(/([a-z]+-[a-z]+)\s*:\s*([^,\n\r]+)/i);
  if (mapRoomMatch) {
    const mapId = mapRoomMatch[1].trim().toLowerCase();
    const room = mapRoomMatch[2].trim();

    for (const val of Object.values(QR_LOCATION_DICTIONARY)) {
      if (val.mapId && val.mapId.toLowerCase() === mapId) {
        if (val.room && val.room.toLowerCase() === room.toLowerCase()) {
          return val;
        }
        if (val.nodeId && val.nodeId.toLowerCase() === room.toLowerCase()) {
          return val;
        }
      }
    }
  }

  // 7. Match exact room name / checkpoint name in dictionary
  const lowerKey = cleanStr.toLowerCase();
  for (const val of Object.values(QR_LOCATION_DICTIONARY)) {
    if (val.room && val.room.toLowerCase() === lowerKey) {
      return val;
    }
    if (val.name && val.name.toLowerCase() === lowerKey) {
      return val;
    }
  }

  // 8. Fallback node ID direct match (e.g. "lobby", "auditorium", "reception")
  for (const val of Object.values(QR_LOCATION_DICTIONARY)) {
    if (val.nodeId && val.nodeId.toLowerCase() === lowerKey) {
      return val;
    }
  }

  return null;
}

/**
 * Get all available QR checkpoint presets for UI simulation and tests
 */
export function getQrPresets() {
  return Object.entries(QR_LOCATION_DICTIONARY).map(([code, info]) => ({
    code,
    ...info
  }));
}
"""

js_content = "/**\n * SafeWay V3 - High-Precision QR Indoor Positioning Service\n * Maps every physical QR checkpoint to its dedicated coordinate, room, block, and building graph node.\n * Scanned QR codes immediately synchronize the user's real-time position on active floor plans.\n */\n\nexport const QR_LOCATION_DICTIONARY = " + json.dumps(dict_entries, indent=2) + ";\n" + function_code

with open(SERVICE_FILE, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"[OK] Generated {len(dict_entries)} dedicated QR locations in {SERVICE_FILE}")
