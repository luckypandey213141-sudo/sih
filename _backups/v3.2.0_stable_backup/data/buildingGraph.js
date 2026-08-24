/**
 * SafeWay V3 - Virtual Building Graph Data Model
 * 2 Floors, 5 Zones, 2 Entrances, 3 Emergency Exits, 2 Stairwells, 1 Central Lift,
 * 2 Assembly Areas, 2 Areas of Rescue Assistance (Refuge Zones), 14 Rooms/POIs, and Corridors.
 */

export const INITIAL_BUILDING_DATA = {
  buildingName: "Bhabha Block",
  floors: [
    { id: 1, name: "Floor 1 (Ground Floor)", shortName: "1F" },
    { id: 2, name: "Floor 2 (Upper Level)", shortName: "2F" }
  ],
  zones: [
    {
      id: "zone-a",
      name: "Zone A (Lobby & Admin Wing)",
      floor: 1,
      nodeIds: ["ent-main", "ent-north", "lobby", "admin", "reception", "junc-1-1", "junc-1-2", "junc-1-3"],
      description: "West Wing on Floor 1 covering main entrance, admin offices, and reception."
    },
    {
      id: "zone-b",
      name: "Zone B (Lab 101 & East Wing)",
      floor: 1,
      nodeIds: ["lab-101", "lab-102", "stair-a-1", "exit-1", "gate-2-destination", "junc-1-5", "junc-1-6"],
      description: "East Wing on Floor 1 covering Science Labs 101/102 and East Fire Exit."
    },
    {
      id: "zone-c",
      name: "Zone C (Cafeteria & Auditorium)",
      floor: 1,
      nodeIds: ["cafeteria", "auditorium", "playground", "exit-2", "junc-1-8", "restroom-1", "junc-1-7", "junc-1-4", "lift-1"],
      description: "South and North corridors on Floor 1 including dining hall, elevator, and auditorium."
    },
    {
      id: "zone-d",
      name: "Zone D (Floor 2 West Classrooms)",
      floor: 2,
      nodeIds: ["room-201", "room-202", "room-203", "room-204", "stair-b-2", "refuge-2b", "junc-2-1", "junc-2-2", "junc-2-3", "junc-2-4", "junc-2-8", "lift-2"],
      description: "West Wing on Floor 2 including lecture halls, elevator lobby, and faculty lounge."
    },
    {
      id: "zone-e",
      name: "Zone E (Floor 2 Library & Boardroom)",
      floor: 2,
      nodeIds: ["library", "boardroom", "restroom-2", "study-lounge", "stair-a-2", "refuge-2a", "junc-2-5", "junc-2-6", "junc-2-7"],
      description: "East Wing on Floor 2 including central library, executive boardroom, and quiet study."
    }
  ],
  exits: [
    {
      id: "exit-1",
      name: "Gate No. 2",
      floor: 1,
      zone: "zone-b",
      assemblyId: "assembly-a",
      assemblyName: "Safe Assembly Area - Playground",
      crowdLevel: "Low", // Low | Medium | High
      isOpen: true
    },
    {
      id: "exit-2",
      name: "Main Gate",
      floor: 1,
      zone: "zone-c",
      assemblyId: "assembly-b",
      assemblyName: "Safe Assembly Area - Back Yard",
      crowdLevel: "Low",
      isOpen: true
    },
    
  ],
  assemblyAreas: [
    { id: "assembly-a", name: "Safe Assembly Area - Playground", x: 535, y: 65, floor: 1 },
    { id: "assembly-b", name: "Safe Assembly Area - Back Yard", x: 90, y: 145, floor: 1 }
  ],
  nodes: [
    // FLOOR 1 NODES
    { id: "ent-main", name: "College Main Gate", floor: 1, type: "entrance", x: 440, y: 565, stepFree: true, zone: "zone-a", roomWidth: 80, roomHeight: 45, icon: "🚪" },
    { id: "ent-north", name: "Back Yard", floor: 1, type: "entrance", x: 155, y: 225, stepFree: true, zone: "zone-a", roomWidth: 70, roomHeight: 45, icon: "🌳" },
    { id: "lobby", name: "Bhabha Block", floor: 1, type: "room", x: 191, y: 397, stepFree: true, zone: "zone-a", roomWidth: 120, roomHeight: 75, icon: "🏫" },
    { id: "vishwakarma", name: "Vishwakarma Block", floor: 1, type: "room", x: 105, y: 445, stepFree: true, zone: "zone-a", roomWidth: 115, roomHeight: 60, icon: "🏫" },
    { id: "admin", name: "Ramanujan Block", floor: 1, type: "room", x: 355, y: 206, stepFree: true, zone: "zone-a", roomWidth: 130, roomHeight: 75, icon: "🏫" },
    { id: "reception", name: "Gauri Cafe & ATM", floor: 1, type: "room", x: 440, y: 290, stepFree: true, zone: "zone-a", roomWidth: 100, roomHeight: 55, icon: "☕" },
    { id: "restroom-1", name: "Kalpana Chawla Block", floor: 1, type: "room", x: 540, y: 207, stepFree: true, zone: "zone-c", roomWidth: 130, roomHeight: 75, icon: "🏫" },
    { id: "cafeteria", name: "Aryabhatta Block", floor: 1, type: "room", x: 690, y: 393, stepFree: true, zone: "zone-c", roomWidth: 135, roomHeight: 85, icon: "🏫" },
    { id: "auditorium", name: "Garden, Pond & Mandir", floor: 1, type: "room", x: 760, y: 490, stepFree: true, zone: "zone-c", roomWidth: 150, roomHeight: 80, icon: "🛕" },
    { id: "lab-101", name: "Raman Block", floor: 1, type: "room", x: 780, y: 207, stepFree: true, zone: "zone-b", roomWidth: 130, roomHeight: 75, icon: "🏫" },
    { id: "lab-102", name: "Generator Room", floor: 1, type: "room", x: 950, y: 390, stepFree: true, zone: "zone-b", roomWidth: 80, roomHeight: 70, icon: "⚡" },
    { id: "playground", name: "Playground", floor: 1, type: "room", x: 410, y: 105, stepFree: true, zone: "zone-c", roomWidth: 130, roomHeight: 55, icon: "🏏" },
    { id: "gate-2-destination", name: "Gate No. 2", floor: 1, type: "room", x: 972, y: 140, stepFree: true, zone: "zone-b", roomWidth: 80, roomHeight: 50, icon: "🚪" },
    { id: "lift-1", name: "Campus Central Junction", floor: 1, type: "lift", x: 440, y: 347, stepFree: true, zone: "zone-c", roomWidth: 45, roomHeight: 45, icon: "♿" },
    { id: "stair-a-1", name: "Gate 2 Path", floor: 1, type: "stair", x: 900, y: 225, stepFree: false, zone: "zone-b", roomWidth: 70, roomHeight: 45, icon: "↗" },
    { id: "stair-b-1", name: "Bhabha Block Entrance", floor: 1, type: "stair", x: 355, y: 347, stepFree: false, zone: "zone-a", roomWidth: 70, roomHeight: 45, icon: "↗" },
    { id: "exit-1", name: "Gate 2", floor: 1, type: "exit", x: 972, y: 140, stepFree: true, zone: "zone-b", roomWidth: 55, roomHeight: 45, icon: "🚪" },
    { id: "exit-2", name: "Main Gate Exit", floor: 1, type: "exit", x: 440, y: 585, stepFree: true, zone: "zone-c", roomWidth: 55, roomHeight: 40, icon: "🚪" },
    { id: "exit-3", name: "Back Yard Safe-Place Path", floor: 1, type: "junction", x: 155, y: 225, stepFree: true, zone: "zone-a", roomWidth: 55, roomHeight: 45, icon: "↖" },
    
    // Corridor Junctions Floor 1
    { id: "junc-1-1", name: "Bhabha Junction", floor: 1, type: "junction", x: 355, y: 397, stepFree: true, zone: "zone-a" },
    { id: "junc-1-2", name: "West Campus Path", floor: 1, type: "junction", x: 355, y: 224, stepFree: true, zone: "zone-a" },
    { id: "junc-1-3", name: "Central West Path", floor: 1, type: "junction", x: 440, y: 224, stepFree: true, zone: "zone-a" },
    { id: "junc-1-4", name: "Main Gate Junction", floor: 1, type: "junction", x: 440, y: 347, stepFree: true, zone: "zone-c" },
    { id: "junc-1-5", name: "Aryabhatta Loop", floor: 1, type: "junction", x: 690, y: 410, stepFree: true, zone: "zone-b" },
    { id: "junc-1-6", name: "Raman Path", floor: 1, type: "junction", x: 780, y: 224, stepFree: true, zone: "zone-b" },
    { id: "junc-1-7", name: "Kalpana Path", floor: 1, type: "junction", x: 540, y: 224, stepFree: true, zone: "zone-c" },
    { id: "junc-1-8", name: "Aryabhatta Junction", floor: 1, type: "junction", x: 560, y: 347, stepFree: true, zone: "zone-c" },
    { id: "campus-west-path", name: "West Campus Path", floor: 1, type: "junction", x: 155, y: 224, stepFree: true, zone: "zone-a" },
    { id: "campus-main-gate-path", name: "Main Gate Path", floor: 1, type: "junction", x: 440, y: 535, stepFree: true, zone: "zone-a" },
    { id: "campus-ary-left", name: "Aryabhatta West Turn", floor: 1, type: "junction", x: 560, y: 410, stepFree: true, zone: "zone-c" },
    { id: "campus-east-top", name: "East Campus Turn", floor: 1, type: "junction", x: 923, y: 224, stepFree: true, zone: "zone-b" },
    { id: "campus-east-bottom", name: "East Campus Lower Turn", floor: 1, type: "junction", x: 923, y: 410, stepFree: true, zone: "zone-b" },
    { id: "campus-playground-path", name: "Playground Path", floor: 1, type: "junction", x: 410, y: 224, stepFree: true, zone: "zone-c" },
    { id: "campus-vishwakarma-path", name: "Vishwakarma Path", floor: 1, type: "junction", x: 191, y: 397, stepFree: true, zone: "zone-a" },

    // FLOOR 2 NODES
    { id: "room-201", name: "Room 201 (Lecture Hall)", floor: 2, type: "room", x: 260, y: 160, stepFree: true, zone: "zone-d", roomWidth: 110, roomHeight: 90, icon: "🎓" },
    { id: "room-202", name: "Room 202 (Computer Lab)", floor: 2, type: "room", x: 260, y: 440, stepFree: true, zone: "zone-d", roomWidth: 110, roomHeight: 90, icon: "💻" },
    { id: "room-203", name: "Room 203 (Conference Hall)", floor: 2, type: "room", x: 440, y: 160, stepFree: true, zone: "zone-d", roomWidth: 100, roomHeight: 80, icon: "👥" },
    { id: "room-204", name: "Room 204 (Faculty Lounge)", floor: 2, type: "room", x: 440, y: 440, stepFree: true, zone: "zone-d", roomWidth: 110, roomHeight: 90, icon: "☕" },
    { id: "library", name: "Central Library", floor: 2, type: "room", x: 640, y: 160, stepFree: true, zone: "zone-e", roomWidth: 120, roomHeight: 90, icon: "📚" },
    { id: "boardroom", name: "Executive Boardroom", floor: 2, type: "room", x: 640, y: 440, stepFree: true, zone: "zone-e", roomWidth: 120, roomHeight: 90, icon: "📊" },
    { id: "restroom-2", name: "Restrooms 2F", floor: 2, type: "room", x: 800, y: 160, stepFree: true, zone: "zone-e", roomWidth: 110, roomHeight: 90, icon: "🚻" },
    { id: "study-lounge", name: "Quiet Study Lounge", floor: 2, type: "room", x: 800, y: 440, stepFree: true, zone: "zone-e", roomWidth: 110, roomHeight: 90, icon: "📖" },
    { id: "lift-2", name: "Elevator / Lift (2F)", floor: 2, type: "lift", x: 500, y: 300, stepFree: true, zone: "zone-d", roomWidth: 60, roomHeight: 50, icon: "🛗" },
    { id: "stair-a-2", name: "Stairwell A (2F)", floor: 2, type: "stair", x: 730, y: 300, stepFree: false, zone: "zone-e", roomWidth: 60, roomHeight: 50, icon: "🪜" },
    { id: "stair-b-2", name: "Stairwell B (2F)", floor: 2, type: "stair", x: 350, y: 300, stepFree: false, zone: "zone-d", roomWidth: 60, roomHeight: 50, icon: "🪜" },

    // Areas of Rescue Assistance / Fire Refuge Zones (2-hour fire rated with emergency intercom)
    { id: "refuge-2a", name: "Area of Refuge 2F (East)", floor: 2, type: "refuge", x: 730, y: 240, stepFree: true, zone: "zone-e", roomWidth: 90, roomHeight: 45, icon: "🛡️" },
    { id: "refuge-2b", name: "Area of Refuge 2F (West)", floor: 2, type: "refuge", x: 350, y: 240, stepFree: true, zone: "zone-d", roomWidth: 90, roomHeight: 45, icon: "🛡️" },

    // Corridor Junctions Floor 2
    { id: "junc-2-1", name: "Junction Room 201", floor: 2, type: "junction", x: 260, y: 230, stepFree: true, zone: "zone-d" },
    { id: "junc-2-2", name: "Junction Room 202", floor: 2, type: "junction", x: 260, y: 370, stepFree: true, zone: "zone-d" },
    { id: "junc-2-3", name: "West Corridor Hub 2F", floor: 2, type: "junction", x: 420, y: 300, stepFree: true, zone: "zone-d" },
    { id: "junc-2-4", name: "Central Hub 2F", floor: 2, type: "junction", x: 500, y: 300, stepFree: true, zone: "zone-d" },
    { id: "junc-2-5", name: "East Corridor Hub 2F", floor: 2, type: "junction", x: 650, y: 300, stepFree: true, zone: "zone-e" },
    { id: "junc-2-6", name: "East Wing Hub 2F", floor: 2, type: "junction", x: 800, y: 300, stepFree: true, zone: "zone-e" },
    { id: "junc-2-7", name: "North Corridor 2F", floor: 2, type: "junction", x: 500, y: 160, stepFree: true, zone: "zone-e" },
    { id: "junc-2-8", name: "South Corridor 2F", floor: 2, type: "junction", x: 500, y: 440, stepFree: true, zone: "zone-d" },

    // Outdoor Assembly Points
    { id: "assembly-a", name: "Safe Assembly Area - Playground", floor: 1, type: "assembly", x: 535, y: 65, stepFree: true, zone: "outdoor" },
    { id: "assembly-b", name: "Safe Assembly Area - Back Yard", floor: 1, type: "assembly", x: 90, y: 145, stepFree: true, zone: "outdoor" }
  ],
  edges: [
    // FLOOR 1 CONNECTIONS
    // Campus pathway traced from the user plan. Extra junctions keep routes on its drawn lines.
    { id: "e1-ent-main", from: "ent-main", to: "campus-main-gate-path", distance: 3, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-mainpath-j4", from: "campus-main-gate-path", to: "junc-1-4", distance: 14, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-ent-north", from: "ent-north", to: "campus-west-path", distance: 2, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-west-j2", from: "campus-west-path", to: "junc-1-2", distance: 16, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-playground-branch", from: "junc-1-2", to: "campus-playground-path", distance: 5, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-playground-entry", from: "campus-playground-path", to: "playground", distance: 10, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-lobby-j1", from: "lobby", to: "junc-1-1", distance: 6, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-vish-path", from: "vishwakarma", to: "campus-vishwakarma-path", distance: 7, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-vishpath-j1", from: "campus-vishwakarma-path", to: "junc-1-1", distance: 12, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-admin-j2", from: "admin", to: "junc-1-2", distance: 3, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j1-rec", from: "junc-1-4", to: "reception", distance: 5, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j2-rec", from: "junc-1-2", to: "junc-1-1", distance: 18, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-rec-j3", from: "junc-1-2", to: "junc-1-3", distance: 2, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-stairb-j3", from: "stair-b-1", to: "junc-1-1", distance: 30, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j3-lift", from: "junc-1-1", to: "junc-1-4", distance: 8, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-lift-j5", from: "lift-1", to: "junc-1-4", distance: 3, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-lift-j7", from: "junc-1-3", to: "junc-1-7", distance: 12, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-lift-j8", from: "junc-1-4", to: "junc-1-8", distance: 10, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j8-aryleft", from: "junc-1-8", to: "campus-ary-left", distance: 5, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-aryleft-j5", from: "campus-ary-left", to: "junc-1-5", distance: 12, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j7-rest", from: "junc-1-3", to: "restroom-1", distance: 7, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j7-exit3", from: "campus-west-path", to: "exit-3", distance: 2, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j8-cafe", from: "junc-1-5", to: "cafeteria", distance: 6, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j8-aud", from: "junc-1-5", to: "campus-east-bottom", distance: 16, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-eastbottom-aud", from: "campus-east-bottom", to: "auditorium", distance: 9, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j8-exit2", from: "campus-main-gate-path", to: "exit-2", distance: 4, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-cafe-aud", from: "junc-1-2", to: "junc-1-3", distance: 8, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j5-staira", from: "junc-1-6", to: "campus-east-top", distance: 14, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-easttop-staira", from: "campus-east-top", to: "stair-a-1", distance: 3, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j5-j6", from: "junc-1-7", to: "junc-1-6", distance: 18, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j6-lab101", from: "junc-1-6", to: "lab-101", distance: 7, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j6-lab102", from: "campus-east-bottom", to: "lab-102", distance: 5, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-east-vertical", from: "campus-east-top", to: "campus-east-bottom", distance: 18, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-j6-exit1", from: "campus-east-top", to: "exit-1", distance: 10, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-gate2-destination", from: "exit-1", to: "gate-2-destination", distance: 1, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e1-lab101-exit3", from: "junc-1-7", to: "junc-1-6", distance: 12, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },

    // FLOOR 2 CONNECTIONS
    { id: "e2-r201-j1", from: "room-201", to: "junc-2-1", distance: 7, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-r202-j2", from: "room-202", to: "junc-2-2", distance: 7, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j1-j3", from: "junc-2-1", to: "junc-2-3", distance: 12, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j2-j3", from: "junc-2-2", to: "junc-2-3", distance: 12, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-stairb-j3", from: "stair-b-2", to: "junc-2-3", distance: 6, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j3-lift", from: "junc-2-3", to: "lift-2", distance: 8, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-lift-j5", from: "lift-2", to: "junc-2-5", distance: 15, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-lift-j7", from: "lift-2", to: "junc-2-7", distance: 14, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-lift-j8", from: "lift-2", to: "junc-2-8", distance: 14, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j7-r203", from: "junc-2-7", to: "room-203", distance: 6, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j7-lib", from: "junc-2-7", to: "library", distance: 14, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j8-r204", from: "junc-2-8", to: "room-204", distance: 6, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j8-board", from: "junc-2-8", to: "boardroom", distance: 14, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j5-staira", from: "junc-2-5", to: "stair-a-2", distance: 6, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j5-j6", from: "junc-2-5", to: "junc-2-6", distance: 15, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j6-rest2", from: "junc-2-6", to: "restroom-2", distance: 14, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j6-study", from: "junc-2-6", to: "study-lounge", distance: 14, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },

    // Connections to Areas of Refuge
    { id: "e2-j5-refuge2a", from: "junc-2-5", to: "refuge-2a", distance: 8, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },
    { id: "e2-j3-refuge2b", from: "junc-2-3", to: "refuge-2b", distance: 8, stepFree: true, blocked: false, hazardLevel: "none", type: "corridor" },

    // VERTICAL CONNECTIONS (Between Floor 1 & Floor 2)
    { id: "vert-stair-a", from: "stair-a-1", to: "stair-a-2", distance: 12, stepFree: false, blocked: false, hazardLevel: "none", type: "stair" },
    { id: "vert-stair-b", from: "stair-b-1", to: "stair-b-2", distance: 12, stepFree: false, blocked: false, hazardLevel: "none", type: "stair" },
    { id: "vert-lift", from: "lift-1", to: "lift-2", distance: 8, stepFree: true, blocked: false, hazardLevel: "none", type: "lift" },

    // Safe-place connections join the existing drawn campus pathway; no diagonal shortcut is used.
    { id: "safe-playground-path", from: "playground", to: "assembly-a", distance: 4, stepFree: true, blocked: false, hazardLevel: "none", type: "outdoor" },
    { id: "safe-backyard-path", from: "ent-north", to: "assembly-b", distance: 4, stepFree: true, blocked: false, hazardLevel: "none", type: "outdoor" }
  ]
};
