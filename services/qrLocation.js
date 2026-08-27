/**
 * SafeWay V3 - High-Precision QR Indoor Positioning Service
 * Maps every physical QR checkpoint to its dedicated coordinate, room, block, and building graph node.
 * Scanned QR codes immediately synchronize the user's real-time position on active floor plans.
 */

export const QR_LOCATION_DICTIONARY = {
  "SW-CAMPUS-GATE1": {
    "code": "SW-CAMPUS-GATE1",
    "name": "Main Entrance Gate (QR 1)",
    "floor": 1,
    "zone": "perimeter-south",
    "desc": "Primary campus vehicle and pedestrian gateway on South boundary.",
    "mapId": "campus",
    "nodeId": "ent-main",
    "point": [
      440,
      565
    ]
  },
  "SW-CAMPUS-CENTRAL": {
    "code": "SW-CAMPUS-CENTRAL",
    "name": "Central Campus Junction (QR 2)",
    "floor": 1,
    "zone": "central-plaza",
    "desc": "Main crossroads connecting Bhabha, Ramanujan, and Aryabhatta blocks.",
    "mapId": "campus",
    "nodeId": "lift-1",
    "point": [
      440,
      347
    ]
  },
  "SW-CAMPUS-CAFE": {
    "code": "SW-CAMPUS-CAFE",
    "name": "Gauri Cafe & ATM (QR 3)",
    "floor": 1,
    "zone": "central-plaza",
    "desc": "Campus cafe corner, seating pavilion, and banking ATM kiosk.",
    "mapId": "campus",
    "nodeId": "reception",
    "point": [
      440,
      290
    ]
  },
  "SW-CAMPUS-BHABHA": {
    "code": "SW-CAMPUS-BHABHA",
    "name": "Bhabha Block South Entrance (QR 4)",
    "floor": 1,
    "zone": "west-quad",
    "desc": "Primary ground entrance to Bhabha Engineering & Administration Block.",
    "mapId": "campus",
    "nodeId": "lobby",
    "point": [
      191,
      397
    ]
  },
  "SW-CAMPUS-RAMAN": {
    "code": "SW-CAMPUS-RAMAN",
    "name": "Ramanujan Block South Entrance (QR 5)",
    "floor": 1,
    "zone": "north-west-wing",
    "desc": "Main entrance foyer to Ramanujan Academic & Computing Block.",
    "mapId": "campus",
    "nodeId": "admin",
    "point": [
      355,
      206
    ]
  },
  "SW-CAMPUS-SAFE2": {
    "code": "SW-CAMPUS-SAFE2",
    "name": "Back Yard Safe Area (QR 6)",
    "floor": 1,
    "zone": "north-west-yard",
    "desc": "Designated Open-Air Safe Assembly Area B behind Ramanujan block.",
    "mapId": "campus",
    "nodeId": "assembly-b",
    "point": [
      90,
      145
    ]
  },
  "SW-CAMPUS-SAFE1": {
    "code": "SW-CAMPUS-SAFE1",
    "name": "Playground Entry 1 (QR 7)",
    "floor": 1,
    "zone": "north-playfield",
    "desc": "Designated Open-Air Safe Assembly Area A via West Sports Field gate.",
    "mapId": "campus",
    "nodeId": "assembly-a",
    "point": [
      535,
      65
    ]
  },
  "SW-CAMPUS-KALPANA": {
    "code": "SW-CAMPUS-KALPANA",
    "name": "Kalpana Chawla Block South Door (QR 8)",
    "floor": 1,
    "zone": "north-central-wing",
    "desc": "Main ground foyer entrance to Kalpana Chawla Technology Block.",
    "mapId": "campus",
    "nodeId": "restroom-1",
    "point": [
      540,
      207
    ]
  },
  "SW-CAMPUS-SAFE1-B": {
    "code": "SW-CAMPUS-SAFE1-B",
    "name": "Playground Entry 2 (QR 9)",
    "floor": 1,
    "zone": "north-playfield",
    "desc": "Secondary Safe Assembly gate between Kalpana and Raman blocks.",
    "mapId": "campus",
    "nodeId": "playground",
    "point": [
      410,
      105
    ]
  },
  "SW-CAMPUS-RAMANB": {
    "code": "SW-CAMPUS-RAMANB",
    "name": "Raman Block South Entrance (QR 10)",
    "floor": 1,
    "zone": "north-east-wing",
    "desc": "Main ground foyer entrance to Raman Block & Auditorium.",
    "mapId": "campus",
    "nodeId": "lab-101",
    "point": [
      780,
      207
    ]
  },
  "SW-CAMPUS-ARYA-W": {
    "code": "SW-CAMPUS-ARYA-W",
    "name": "Aryabhatta Block West Stairs (QR 11)",
    "floor": 1,
    "zone": "east-quad",
    "desc": "West perimeter stairwell access into Aryabhatta Academic Block.",
    "mapId": "campus",
    "nodeId": "campus-ary-left",
    "point": [
      560,
      410
    ]
  },
  "SW-CAMPUS-ARYA": {
    "code": "SW-CAMPUS-ARYA",
    "name": "Aryabhatta Block South Door (QR 12)",
    "floor": 1,
    "zone": "east-quad",
    "desc": "Main entrance foyer to Aryabhatta Block and Central Dining Hall.",
    "mapId": "campus",
    "nodeId": "cafeteria",
    "point": [
      690,
      393
    ]
  },
  "SW-CAMPUS-GATE2": {
    "code": "SW-CAMPUS-GATE2",
    "name": "Gate No. 2 (East Perimeter) (QR 13)",
    "floor": 1,
    "zone": "east-perimeter",
    "desc": "Secondary campus vehicle and emergency evacuation gate on East boundary.",
    "mapId": "campus",
    "nodeId": "gate-2-destination",
    "point": [
      972,
      140
    ]
  },
  "SW-RAM-B-LAB1": {
    "code": "SW-RAM-B-LAB1",
    "name": "Computer Lab 1",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Basement Computing Lab 1 workstation room.",
    "mapId": "ramanujan-basement",
    "room": "Lab 1",
    "nodeId": "admin",
    "point": [
      600,
      275
    ]
  },
  "SW-RAM-B-LAB2": {
    "code": "SW-RAM-B-LAB2",
    "name": "Computer Lab 2",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Basement Computing Lab 2 workstation room.",
    "mapId": "ramanujan-basement",
    "room": "Lab 2",
    "nodeId": "admin",
    "point": [
      680,
      275
    ]
  },
  "SW-RAM-B-LAB3": {
    "code": "SW-RAM-B-LAB3",
    "name": "Computer Lab 3",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Basement Computing Lab 3 research lab.",
    "mapId": "ramanujan-basement",
    "room": "Lab 3",
    "nodeId": "admin",
    "point": [
      760,
      275
    ]
  },
  "SW-RAM-B-LAB4": {
    "code": "SW-RAM-B-LAB4",
    "name": "Hardware Lab 4",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Basement Hardware & IoT Systems Lab 4.",
    "mapId": "ramanujan-basement",
    "room": "Lab 4",
    "nodeId": "admin",
    "point": [
      600,
      430
    ]
  },
  "SW-RAM-B-LAB5": {
    "code": "SW-RAM-B-LAB5",
    "name": "Networks Lab 5",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Basement Network Systems Lab 5.",
    "mapId": "ramanujan-basement",
    "room": "Lab 5",
    "nodeId": "admin",
    "point": [
      680,
      430
    ]
  },
  "SW-RAM-B-LAB6": {
    "code": "SW-RAM-B-LAB6",
    "name": "Electronics Lab 6",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Basement Embedded Systems Lab 6.",
    "mapId": "ramanujan-basement",
    "room": "Lab 6",
    "nodeId": "admin",
    "point": [
      760,
      430
    ]
  },
  "SW-RAM-B-LIFT": {
    "code": "SW-RAM-B-LIFT",
    "name": "Basement Lift Lobby",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Basement central elevator lobby.",
    "mapId": "ramanujan-basement",
    "room": "Lift",
    "nodeId": "admin",
    "point": [
      220,
      275
    ]
  },
  "SW-RAM-B-STAIR1": {
    "code": "SW-RAM-B-STAIR1",
    "name": "North Stairwell 1",
    "floor": 0,
    "zone": "zone-a",
    "desc": "North stairwell leading to Ground and First floors.",
    "mapId": "ramanujan-basement",
    "room": "Stairs 1",
    "nodeId": "admin",
    "point": [
      550,
      260
    ]
  },
  "SW-RAM-B-STAIR2": {
    "code": "SW-RAM-B-STAIR2",
    "name": "East Stairwell 2",
    "floor": 0,
    "zone": "zone-b",
    "desc": "East stairwell leading to Ground Floor fire exits.",
    "mapId": "ramanujan-basement",
    "room": "Stairs 2",
    "nodeId": "admin",
    "point": [
      720,
      260
    ]
  },
  "SW-RAM-B-EXIT": {
    "code": "SW-RAM-B-EXIT",
    "name": "Basement Emergency Exit",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Direct emergency egress ramp to exterior quad.",
    "mapId": "ramanujan-basement",
    "room": "Exit",
    "nodeId": "admin",
    "point": [
      740,
      430
    ]
  },
  "SW-RAM-G-ENT1": {
    "code": "SW-RAM-G-ENT1",
    "name": "Main Entrance / Exit 1",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Primary Ground Floor entrance foyer and reception.",
    "mapId": "ramanujan-ground",
    "room": "Entry / Exit 1",
    "nodeId": "admin",
    "point": [
      250,
      590
    ]
  },
  "SW-RAM-G-ENT2": {
    "code": "SW-RAM-G-ENT2",
    "name": "East Fire Exit 2",
    "floor": 1,
    "zone": "zone-b",
    "desc": "East fire exit door opening to campus arterial pathway.",
    "mapId": "ramanujan-ground",
    "room": "Entry / Exit 2",
    "nodeId": "admin",
    "point": [
      920,
      300
    ]
  },
  "SW-RAM-G-ENT3": {
    "code": "SW-RAM-G-ENT3",
    "name": "South Exit 3",
    "floor": 1,
    "zone": "zone-c",
    "desc": "South exit door connecting to Central Campus Plaza.",
    "mapId": "ramanujan-ground",
    "room": "Entry / Exit 3",
    "nodeId": "admin",
    "point": [
      760,
      590
    ]
  },
  "SW-RAM-G-LIFT": {
    "code": "SW-RAM-G-LIFT",
    "name": "Central Elevator Lobby",
    "floor": 1,
    "zone": "zone-c",
    "desc": "Ground Floor central lift lobby with accessible ramps.",
    "mapId": "ramanujan-ground",
    "room": "Lift",
    "nodeId": "admin",
    "point": [
      190,
      235
    ]
  },
  "SW-RAM-G-COURT": {
    "code": "SW-RAM-G-COURT",
    "name": "Badminton Court Atrium",
    "floor": 1,
    "zone": "zone-c",
    "desc": "Open indoor sports court and central recreation atrium.",
    "mapId": "ramanujan-ground",
    "room": "Badminton Court",
    "nodeId": "admin",
    "point": [
      500,
      390
    ]
  },
  "SW-RAM-G-R1": {
    "code": "SW-RAM-G-R1",
    "name": "Classroom R1",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Lecture Room R1 (Capacity 60 students).",
    "mapId": "ramanujan-ground",
    "room": "R1",
    "nodeId": "admin",
    "point": [
      350,
      455
    ]
  },
  "SW-RAM-G-R2": {
    "code": "SW-RAM-G-R2",
    "name": "Classroom R2",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Lecture Room R2 (Capacity 60 students).",
    "mapId": "ramanujan-ground",
    "room": "R2",
    "nodeId": "admin",
    "point": [
      830,
      455
    ]
  },
  "SW-RAM-G-R3": {
    "code": "SW-RAM-G-R3",
    "name": "Classroom R3",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Lecture Room R3 (Capacity 60 students).",
    "mapId": "ramanujan-ground",
    "room": "R3",
    "nodeId": "admin",
    "point": [
      830,
      520
    ]
  },
  "SW-RAM-G-R4": {
    "code": "SW-RAM-G-R4",
    "name": "Classroom R4",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Lecture Room R4 (Capacity 60 students).",
    "mapId": "ramanujan-ground",
    "room": "R4",
    "nodeId": "admin",
    "point": [
      650,
      455
    ]
  },
  "SW-RAM-G-R6": {
    "code": "SW-RAM-G-R6",
    "name": "Classroom R6",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Lecture Room R6 (Capacity 60 students).",
    "mapId": "ramanujan-ground",
    "room": "R6",
    "nodeId": "admin",
    "point": [
      220,
      350
    ]
  },
  "SW-RAM-G-R7": {
    "code": "SW-RAM-G-R7",
    "name": "Classroom R7",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Lecture Room R7 (Capacity 60 students).",
    "mapId": "ramanujan-ground",
    "room": "R7",
    "nodeId": "admin",
    "point": [
      405,
      250
    ]
  },
  "SW-RAM-G-R8": {
    "code": "SW-RAM-G-R8",
    "name": "Classroom R8",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Faculty Room R8 & Tutorial Class.",
    "mapId": "ramanujan-ground",
    "room": "R8",
    "nodeId": "admin",
    "point": [
      220,
      300
    ]
  },
  "SW-RAM-G-R9": {
    "code": "SW-RAM-G-R9",
    "name": "Classroom R9",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Faculty Room R9 & Tutorial Class.",
    "mapId": "ramanujan-ground",
    "room": "R9",
    "nodeId": "admin",
    "point": [
      330,
      250
    ]
  },
  "SW-RAM-G-R10": {
    "code": "SW-RAM-G-R10",
    "name": "Classroom R10",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Seminar Room R10.",
    "mapId": "ramanujan-ground",
    "room": "R10",
    "nodeId": "admin",
    "point": [
      480,
      250
    ]
  },
  "SW-RAM-G-R11": {
    "code": "SW-RAM-G-R11",
    "name": "Classroom R11",
    "floor": 1,
    "zone": "zone-e",
    "desc": "Advanced Study Hall R11.",
    "mapId": "ramanujan-ground",
    "room": "R11",
    "nodeId": "admin",
    "point": [
      565,
      250
    ]
  },
  "SW-RAM-G-R12": {
    "code": "SW-RAM-G-R12",
    "name": "Classroom R12",
    "floor": 1,
    "zone": "zone-e",
    "desc": "Conference Room R12.",
    "mapId": "ramanujan-ground",
    "room": "R12",
    "nodeId": "admin",
    "point": [
      650,
      250
    ]
  },
  "SW-RAM-G-W1": {
    "code": "SW-RAM-G-W1",
    "name": "East Washrooms (W1)",
    "floor": 1,
    "zone": "zone-c",
    "desc": "East corridor washrooms and sanitation facility.",
    "mapId": "ramanujan-ground",
    "room": "W1",
    "nodeId": "admin",
    "point": [
      820,
      250
    ]
  },
  "SW-RAM-G-W2": {
    "code": "SW-RAM-G-W2",
    "name": "West Washrooms (W2)",
    "floor": 1,
    "zone": "zone-e",
    "desc": "West corridor washrooms and sanitation facility.",
    "mapId": "ramanujan-ground",
    "room": "W2",
    "nodeId": "admin",
    "point": [
      205,
      250
    ]
  },
  "SW-RAM-1-DRAW": {
    "code": "SW-RAM-1-DRAW",
    "name": "Engineering Drawing Lab",
    "floor": 2,
    "zone": "zone-d",
    "desc": "First Floor Engineering Drawing and CAD studio.",
    "mapId": "ramanujan-first",
    "room": "Drawing Lab",
    "nodeId": "admin",
    "point": [
      500,
      325
    ]
  },
  "SW-RAM-1-LT1": {
    "code": "SW-RAM-1-LT1",
    "name": "Lecture Theatre LT 1",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Tiered Lecture Theatre LT 1 (Capacity 120 students).",
    "mapId": "ramanujan-first",
    "room": "LT 1",
    "nodeId": "admin",
    "point": [
      260,
      400
    ]
  },
  "SW-RAM-1-LT2": {
    "code": "SW-RAM-1-LT2",
    "name": "Lecture Theatre LT 2",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Tiered Lecture Theatre LT 2 (Capacity 120 students).",
    "mapId": "ramanujan-first",
    "room": "LT 2",
    "nodeId": "admin",
    "point": [
      420,
      400
    ]
  },
  "SW-RAM-1-LT3": {
    "code": "SW-RAM-1-LT3",
    "name": "Lecture Theatre LT 3",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Tiered Lecture Theatre LT 3 (Capacity 120 students).",
    "mapId": "ramanujan-first",
    "room": "LT 3",
    "nodeId": "admin",
    "point": [
      580,
      400
    ]
  },
  "SW-RAM-1-LT4": {
    "code": "SW-RAM-1-LT4",
    "name": "Lecture Theatre LT 4",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Tiered Lecture Theatre LT 4 (Capacity 120 students).",
    "mapId": "ramanujan-first",
    "room": "LT 4",
    "nodeId": "admin",
    "point": [
      740,
      400
    ]
  },
  "SW-RAM-1-BWC": {
    "code": "SW-RAM-1-BWC",
    "name": "Boys Restroom 1F",
    "floor": 2,
    "zone": "zone-e",
    "desc": "First floor boys washroom facilities.",
    "mapId": "ramanujan-first",
    "room": "Boys W/C",
    "nodeId": "admin",
    "point": [
      840,
      260
    ]
  },
  "SW-RAM-1-GWC": {
    "code": "SW-RAM-1-GWC",
    "name": "Girls Restroom 1F",
    "floor": 2,
    "zone": "zone-e",
    "desc": "First floor girls washroom facilities.",
    "mapId": "ramanujan-first",
    "room": "Girls W/C",
    "nodeId": "admin",
    "point": [
      840,
      380
    ]
  },
  "SW-RAM-1-LIFT": {
    "code": "SW-RAM-1-LIFT",
    "name": "First Floor Lift Lobby",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Central elevator station at Upper Level.",
    "mapId": "ramanujan-first",
    "room": "Lift",
    "nodeId": "admin",
    "point": [
      190,
      235
    ]
  },
  "SW-RAM-1-STAIR": {
    "code": "SW-RAM-1-STAIR",
    "name": "East Stairwell Landing",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Primary fire stairwell leading to ground exit.",
    "mapId": "ramanujan-first",
    "room": "Stairs",
    "nodeId": "admin",
    "point": [
      800,
      235
    ]
  },
  "SW-RAM-1-EXIT": {
    "code": "SW-RAM-1-EXIT",
    "name": "Upper Corridor Exit",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Upper bridge connection and emergency stairwell foyer.",
    "mapId": "ramanujan-first",
    "room": "Entry / Exit",
    "nodeId": "admin",
    "point": [
      920,
      325
    ]
  },
  "SW-BHAB-B-DIGILIB": {
    "code": "SW-BHAB-B-DIGILIB",
    "name": "Digital Library e-Resource Center",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Digital catalog, research stations, and internet access hub.",
    "mapId": "bhabha-basement",
    "room": "Digital Library",
    "nodeId": "lobby",
    "point": [
      300,
      335
    ]
  },
  "SW-BHAB-B-LIB": {
    "code": "SW-BHAB-B-LIB",
    "name": "Reference Section Library",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Core engineering journals, archives, and reference collections.",
    "mapId": "bhabha-basement",
    "room": "Library",
    "nodeId": "lobby",
    "point": [
      500,
      335
    ]
  },
  "SW-BHAB-B-MAINLIB": {
    "code": "SW-BHAB-B-MAINLIB",
    "name": "Central Main Library",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Main book lending collection and reading rooms.",
    "mapId": "bhabha-basement",
    "room": "Main Library",
    "nodeId": "lobby",
    "point": [
      700,
      335
    ]
  },
  "SW-BHAB-B-LOBBY": {
    "code": "SW-BHAB-B-LOBBY",
    "name": "Library Grand Lobby",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Circulation desk, issue counter, and reading lobby.",
    "mapId": "bhabha-basement",
    "room": "Lobby / Corridor",
    "nodeId": "lobby",
    "point": [
      500,
      420
    ]
  },
  "SW-BHAB-B-GATE": {
    "code": "SW-BHAB-B-GATE",
    "name": "Library Main Gate",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Primary entrance turnstiles to Central Library.",
    "mapId": "bhabha-basement",
    "room": "Entry Gate",
    "nodeId": "lobby",
    "point": [
      410,
      590
    ]
  },
  "SW-BHAB-B-EXIT": {
    "code": "SW-BHAB-B-EXIT",
    "name": "Library Emergency Fire Exit",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Direct emergency egress door from stack rooms.",
    "mapId": "bhabha-basement",
    "room": "Exit",
    "nodeId": "lobby",
    "point": [
      720,
      590
    ]
  },
  "SW-BHAB-G-ENTRY": {
    "code": "SW-BHAB-G-ENTRY",
    "name": "Bhabha Main Foyer Entry",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Primary Ground Floor ceremonial entrance and lobby.",
    "mapId": "bhabha-ground",
    "room": "Entry",
    "nodeId": "lobby",
    "point": [
      500,
      590
    ]
  },
  "SW-BHAB-G-LH1": {
    "code": "SW-BHAB-G-LH1",
    "name": "Lecture Hall LH 1",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor multimedia lecture theatre 1.",
    "mapId": "bhabha-ground",
    "room": "Lecture Hall 1",
    "nodeId": "lobby",
    "point": [
      300,
      320
    ]
  },
  "SW-BHAB-G-LH2": {
    "code": "SW-BHAB-G-LH2",
    "name": "Lecture Hall LH 2",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Ground Floor multimedia lecture theatre 2.",
    "mapId": "bhabha-ground",
    "room": "Lecture Hall 2",
    "nodeId": "lobby",
    "point": [
      720,
      320
    ]
  },
  "SW-BHAB-G-RECEP": {
    "code": "SW-BHAB-G-RECEP",
    "name": "Central Reception & Helpdesk",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Visitor reception, information helpdesk, and security.",
    "mapId": "bhabha-ground",
    "room": "Reception",
    "nodeId": "lobby",
    "point": [
      330,
      420
    ]
  },
  "SW-BHAB-G-REGISTRAR": {
    "code": "SW-BHAB-G-REGISTRAR",
    "name": "Registrar Office",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Academic records, examinations, and registrar office.",
    "mapId": "bhabha-ground",
    "room": "Registrar",
    "nodeId": "lobby",
    "point": [
      700,
      420
    ]
  },
  "SW-BHAB-G-DIRECTOR": {
    "code": "SW-BHAB-G-DIRECTOR",
    "name": "Director Secretariat",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Director executive chamber and conference boardroom.",
    "mapId": "bhabha-ground",
    "room": "Director Office",
    "nodeId": "lobby",
    "point": [
      300,
      500
    ]
  },
  "SW-BHAB-G-ADMISSION": {
    "code": "SW-BHAB-G-ADMISSION",
    "name": "Admission & Counselling Cell",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Student admission desk, fees office, and counseling rooms.",
    "mapId": "bhabha-ground",
    "room": "Admission Cell",
    "nodeId": "lobby",
    "point": [
      720,
      500
    ]
  },
  "SW-BHAB-G-SITTING": {
    "code": "SW-BHAB-G-SITTING",
    "name": "Visitor Sitting Lounge",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Spacious guest reception lounge and waiting area.",
    "mapId": "bhabha-ground",
    "room": "Sitting Hall",
    "nodeId": "lobby",
    "point": [
      620,
      500
    ]
  },
  "SW-BHAB-G-WATER": {
    "code": "SW-BHAB-G-WATER",
    "name": "Drinking Water Kiosk",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Filtered drinking water station and chiller unit.",
    "mapId": "bhabha-ground",
    "room": "Drinking Water",
    "nodeId": "lobby",
    "point": [
      740,
      260
    ]
  },
  "SW-BHAB-G-BWC": {
    "code": "SW-BHAB-G-BWC",
    "name": "Boys Restrooms 1F",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground floor male washroom facility.",
    "mapId": "bhabha-ground",
    "room": "Boys W/C",
    "nodeId": "lobby",
    "point": [
      300,
      220
    ]
  },
  "SW-BHAB-G-GWC": {
    "code": "SW-BHAB-G-GWC",
    "name": "Girls Restrooms 1F",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Ground floor female washroom facility.",
    "mapId": "bhabha-ground",
    "room": "Girls W/C",
    "nodeId": "lobby",
    "point": [
      740,
      220
    ]
  },
  "SW-BHAB-G-STAIR1": {
    "code": "SW-BHAB-G-STAIR1",
    "name": "West Stairwell (Stairs 1)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "West wing stairwell leading to Upper Floors and Basement.",
    "mapId": "bhabha-ground",
    "room": "Stairs 1",
    "nodeId": "lobby",
    "point": [
      295,
      175
    ]
  },
  "SW-BHAB-G-STAIR2": {
    "code": "SW-BHAB-G-STAIR2",
    "name": "East Stairwell (Stairs 2)",
    "floor": 1,
    "zone": "zone-b",
    "desc": "East wing stairwell leading to Upper Floors and Library.",
    "mapId": "bhabha-ground",
    "room": "Stairs 2",
    "nodeId": "lobby",
    "point": [
      755,
      175
    ]
  },
  "SW-BHAB-1-HODME": {
    "code": "SW-BHAB-1-HODME",
    "name": "Head of Dept Mechanical Eng",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Mechanical Engineering Department HOD office.",
    "mapId": "bhabha-first",
    "room": "HOD ME",
    "nodeId": "lobby",
    "point": [
      300,
      300
    ]
  },
  "SW-BHAB-1-LT1": {
    "code": "SW-BHAB-1-LT1",
    "name": "Lecture Theatre LT 1",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Upper Level tiered lecture classroom 1.",
    "mapId": "bhabha-first",
    "room": "LT 1",
    "nodeId": "lobby",
    "point": [
      420,
      300
    ]
  },
  "SW-BHAB-1-LT2": {
    "code": "SW-BHAB-1-LT2",
    "name": "Lecture Theatre LT 2",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Upper Level tiered lecture classroom 2.",
    "mapId": "bhabha-first",
    "room": "LT 2",
    "nodeId": "lobby",
    "point": [
      580,
      300
    ]
  },
  "SW-BHAB-1-LT3": {
    "code": "SW-BHAB-1-LT3",
    "name": "Lecture Theatre LT 3",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Upper Level tiered lecture classroom 3.",
    "mapId": "bhabha-first",
    "room": "LT 3",
    "nodeId": "lobby",
    "point": [
      740,
      300
    ]
  },
  "SW-BHAB-1-FACULTY": {
    "code": "SW-BHAB-1-FACULTY",
    "name": "Faculty Cabins & Staff Room",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Professor faculty workstations and meeting cabins.",
    "mapId": "bhabha-first",
    "room": "Faculty Cabins",
    "nodeId": "lobby",
    "point": [
      400,
      450
    ]
  },
  "SW-BHAB-1-ECELAB": {
    "code": "SW-BHAB-1-ECELAB",
    "name": "Electronics & Comm (ECE) Lab",
    "floor": 2,
    "zone": "zone-e",
    "desc": "VLSI design, circuits, and communication systems lab.",
    "mapId": "bhabha-first",
    "room": "ECE Lab",
    "nodeId": "lobby",
    "point": [
      650,
      450
    ]
  },
  "SW-BHAB-1-BWC": {
    "code": "SW-BHAB-1-BWC",
    "name": "Boys Washrooms 2F",
    "floor": 2,
    "zone": "zone-d",
    "desc": "First floor male washroom facility.",
    "mapId": "bhabha-first",
    "room": "Boys W/C",
    "nodeId": "lobby",
    "point": [
      300,
      220
    ]
  },
  "SW-BHAB-1-GWC": {
    "code": "SW-BHAB-1-GWC",
    "name": "Girls Washrooms 2F",
    "floor": 2,
    "zone": "zone-e",
    "desc": "First floor female washroom facility.",
    "mapId": "bhabha-first",
    "room": "Girls W/C",
    "nodeId": "lobby",
    "point": [
      740,
      220
    ]
  },
  "SW-BHAB-1-STAIR": {
    "code": "SW-BHAB-1-STAIR",
    "name": "Central Stairwell Landing",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Primary descent stairwell to ground exit.",
    "mapId": "bhabha-first",
    "room": "Stairs",
    "nodeId": "lobby",
    "point": [
      755,
      175
    ]
  },
  "SW-BHAB-1-EXIT1": {
    "code": "SW-BHAB-1-EXIT1",
    "name": "Upper Corridor Exit 1",
    "floor": 2,
    "zone": "zone-d",
    "desc": "North corridor emergency stairwell egress door.",
    "mapId": "bhabha-first",
    "room": "Entry / Exit 1",
    "nodeId": "lobby",
    "point": [
      500,
      590
    ]
  },
  "SW-BHAB-1-EXIT2": {
    "code": "SW-BHAB-1-EXIT2",
    "name": "Upper Corridor Exit 2",
    "floor": 2,
    "zone": "zone-e",
    "desc": "East bridge connection to adjacent Academic Wing.",
    "mapId": "bhabha-first",
    "room": "Entry / Exit 2",
    "nodeId": "lobby",
    "point": [
      780,
      590
    ]
  },
  "SW-KAL-B-FLUID": {
    "code": "SW-KAL-B-FLUID",
    "name": "Fluid Mechanics Laboratory",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Hydraulics, pumps, and fluid mechanics test lab.",
    "mapId": "kalpana-basement",
    "room": "Fluid Mechanics Lab",
    "nodeId": "restroom-1",
    "point": [
      320,
      290
    ]
  },
  "SW-KAL-B-CS1": {
    "code": "SW-KAL-B-CS1",
    "name": "Advanced Computing Lab 1",
    "floor": 0,
    "zone": "zone-a",
    "desc": "AI & High-Performance Computing workstation lab.",
    "mapId": "kalpana-basement",
    "room": "Computer Lab 1",
    "nodeId": "restroom-1",
    "point": [
      480,
      290
    ]
  },
  "SW-KAL-B-CS2": {
    "code": "SW-KAL-B-CS2",
    "name": "Advanced Computing Lab 2",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Cloud computing and database systems lab.",
    "mapId": "kalpana-basement",
    "room": "Computer Lab 2",
    "nodeId": "restroom-1",
    "point": [
      640,
      290
    ]
  },
  "SW-KAL-B-AUTO": {
    "code": "SW-KAL-B-AUTO",
    "name": "Automobile Engineering Lab",
    "floor": 0,
    "zone": "zone-a",
    "desc": "IC engines, chassis, and automotive mechanics bay.",
    "mapId": "kalpana-basement",
    "room": "Automobile Lab",
    "nodeId": "restroom-1",
    "point": [
      400,
      450
    ]
  },
  "SW-KAL-B-STORE": {
    "code": "SW-KAL-B-STORE",
    "name": "Central Equipment Store",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Laboratory supplies, inventory, and spares store.",
    "mapId": "kalpana-basement",
    "room": "Store Room",
    "nodeId": "restroom-1",
    "point": [
      700,
      450
    ]
  },
  "SW-KAL-B-LIFT": {
    "code": "SW-KAL-B-LIFT",
    "name": "Basement Elevator Lobby",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Basement elevator station.",
    "mapId": "kalpana-basement",
    "room": "Lift",
    "nodeId": "restroom-1",
    "point": [
      190,
      205
    ]
  },
  "SW-KAL-B-STAIR1": {
    "code": "SW-KAL-B-STAIR1",
    "name": "North Stairwell 1",
    "floor": 0,
    "zone": "zone-a",
    "desc": "North stairwell to ground level.",
    "mapId": "kalpana-basement",
    "room": "Stair 1",
    "nodeId": "restroom-1",
    "point": [
      385,
      205
    ]
  },
  "SW-KAL-B-STAIR2": {
    "code": "SW-KAL-B-STAIR2",
    "name": "South Stairwell 2",
    "floor": 0,
    "zone": "zone-b",
    "desc": "South fire stairwell to exterior.",
    "mapId": "kalpana-basement",
    "room": "Stair 2",
    "nodeId": "restroom-1",
    "point": [
      640,
      450
    ]
  },
  "SW-KAL-B-EXIT": {
    "code": "SW-KAL-B-EXIT",
    "name": "Basement Ramp Exit",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Emergency equipment ramp to ground.",
    "mapId": "kalpana-basement",
    "room": "Entry / Exit",
    "nodeId": "restroom-1",
    "point": [
      500,
      590
    ]
  },
  "SW-KAL-G-ENTRY": {
    "code": "SW-KAL-G-ENTRY",
    "name": "Kalpana Block Main Entry",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor main entrance foyer from campus arterial road.",
    "mapId": "kalpana-ground",
    "room": "Entry",
    "nodeId": "restroom-1",
    "point": [
      500,
      590
    ]
  },
  "SW-KAL-G-LT1": {
    "code": "SW-KAL-G-LT1",
    "name": "Lecture Theatre LT 1",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Smart lecture theatre 1 with digital podium.",
    "mapId": "kalpana-ground",
    "room": "LT 1",
    "nodeId": "restroom-1",
    "point": [
      640,
      220
    ]
  },
  "SW-KAL-G-LT2": {
    "code": "SW-KAL-G-LT2",
    "name": "Lecture Theatre LT 2",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Smart lecture theatre 2 with acoustic panels.",
    "mapId": "kalpana-ground",
    "room": "LT 2",
    "nodeId": "restroom-1",
    "point": [
      235,
      400
    ]
  },
  "SW-KAL-G-LT3": {
    "code": "SW-KAL-G-LT3",
    "name": "Lecture Theatre LT 3",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Smart lecture theatre 3 with multimedia projector.",
    "mapId": "kalpana-ground",
    "room": "LT 3",
    "nodeId": "restroom-1",
    "point": [
      370,
      400
    ]
  },
  "SW-KAL-G-CCPD1": {
    "code": "SW-KAL-G-CCPD1",
    "name": "Career & Placement Center (CCPD 1)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Corporate interview suites and placement cell 1.",
    "mapId": "kalpana-ground",
    "room": "CCPD 1",
    "nodeId": "restroom-1",
    "point": [
      355,
      400
    ]
  },
  "SW-KAL-G-CCPD2": {
    "code": "SW-KAL-G-CCPD2",
    "name": "Career & Placement Center (CCPD 2)",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Group discussion room and career counseling desk.",
    "mapId": "kalpana-ground",
    "room": "CCPD 2",
    "nodeId": "restroom-1",
    "point": [
      610,
      400
    ]
  },
  "SW-KAL-G-CS1": {
    "code": "SW-KAL-G-CS1",
    "name": "Software Engineering Lab",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Software systems, compilers, and coding lab.",
    "mapId": "kalpana-ground",
    "room": "Computer Lab 1",
    "nodeId": "restroom-1",
    "point": [
      720,
      400
    ]
  },
  "SW-KAL-G-HODCSE": {
    "code": "SW-KAL-G-HODCSE",
    "name": "Head of Dept Computer Science",
    "floor": 1,
    "zone": "zone-a",
    "desc": "CSE Department Head office and conference desk.",
    "mapId": "kalpana-ground",
    "room": "HOD CSE",
    "nodeId": "restroom-1",
    "point": [
      475,
      440
    ]
  },
  "SW-KAL-G-BWC": {
    "code": "SW-KAL-G-BWC",
    "name": "Boys Restrooms 1F",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor male sanitation facility.",
    "mapId": "kalpana-ground",
    "room": "Boys W/C",
    "nodeId": "restroom-1",
    "point": [
      300,
      220
    ]
  },
  "SW-KAL-G-GWC": {
    "code": "SW-KAL-G-GWC",
    "name": "Girls Restrooms 1F",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Ground Floor female sanitation facility.",
    "mapId": "kalpana-ground",
    "room": "Girls W/C",
    "nodeId": "restroom-1",
    "point": [
      840,
      220
    ]
  },
  "SW-KAL-G-LIFT": {
    "code": "SW-KAL-G-LIFT",
    "name": "Ground Floor Elevator Lobby",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Central passenger elevator station.",
    "mapId": "kalpana-ground",
    "room": "Lift",
    "nodeId": "restroom-1",
    "point": [
      190,
      220
    ]
  },
  "SW-KAL-G-STAIR": {
    "code": "SW-KAL-G-STAIR",
    "name": "Central Stairwell 1F",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Central stairwell connecting all 3 levels.",
    "mapId": "kalpana-ground",
    "room": "Stairs",
    "nodeId": "restroom-1",
    "point": [
      385,
      220
    ]
  },
  "SW-KAL-G-EMERG": {
    "code": "SW-KAL-G-EMERG",
    "name": "North Emergency Fire Exit",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Direct outward opening fire egress door to Safe Playground Area.",
    "mapId": "kalpana-ground",
    "room": "Emergency Exit",
    "nodeId": "restroom-1",
    "point": [
      500,
      120
    ]
  },
  "SW-KAL-1-TH1": {
    "code": "SW-KAL-1-TH1",
    "name": "Corporate Training Hall 1",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Large conference training room for workshops.",
    "mapId": "kalpana-first",
    "room": "Training Hall 1",
    "nodeId": "restroom-1",
    "point": [
      300,
      325
    ]
  },
  "SW-KAL-1-TH2": {
    "code": "SW-KAL-1-TH2",
    "name": "Corporate Training Hall 2",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Executive seminar and guest lecture hall.",
    "mapId": "kalpana-first",
    "room": "Training Hall 2",
    "nodeId": "restroom-1",
    "point": [
      450,
      325
    ]
  },
  "SW-KAL-1-CR1": {
    "code": "SW-KAL-1-CR1",
    "name": "Classroom CR 1",
    "floor": 2,
    "zone": "zone-d",
    "desc": "First Floor tutorial classroom 1.",
    "mapId": "kalpana-first",
    "room": "Class Room 1",
    "nodeId": "restroom-1",
    "point": [
      600,
      325
    ]
  },
  "SW-KAL-1-CR2": {
    "code": "SW-KAL-1-CR2",
    "name": "Classroom CR 2",
    "floor": 2,
    "zone": "zone-e",
    "desc": "First Floor tutorial classroom 2.",
    "mapId": "kalpana-first",
    "room": "Class Room 2",
    "nodeId": "restroom-1",
    "point": [
      750,
      325
    ]
  },
  "SW-KAL-1-CR3": {
    "code": "SW-KAL-1-CR3",
    "name": "Classroom CR 3",
    "floor": 2,
    "zone": "zone-d",
    "desc": "First Floor tutorial classroom 3.",
    "mapId": "kalpana-first",
    "room": "Class Room 3",
    "nodeId": "restroom-1",
    "point": [
      300,
      450
    ]
  },
  "SW-KAL-1-CR4": {
    "code": "SW-KAL-1-CR4",
    "name": "Classroom CR 4",
    "floor": 2,
    "zone": "zone-e",
    "desc": "First Floor tutorial classroom 4.",
    "mapId": "kalpana-first",
    "room": "Class Room 4",
    "nodeId": "restroom-1",
    "point": [
      600,
      450
    ]
  },
  "SW-KAL-1-STORE": {
    "code": "SW-KAL-1-STORE",
    "name": "Departmental Archives & Store",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Academic records, exam archives, and stationary store.",
    "mapId": "kalpana-first",
    "room": "Store",
    "nodeId": "restroom-1",
    "point": [
      750,
      450
    ]
  },
  "SW-KAL-1-BWC": {
    "code": "SW-KAL-1-BWC",
    "name": "Boys Washrooms 2F",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Upper level male washroom facility.",
    "mapId": "kalpana-first",
    "room": "Boys W/C",
    "nodeId": "restroom-1",
    "point": [
      300,
      220
    ]
  },
  "SW-KAL-1-GWC": {
    "code": "SW-KAL-1-GWC",
    "name": "Girls Washrooms 2F",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Upper level female washroom facility.",
    "mapId": "kalpana-first",
    "room": "Girls W/C",
    "nodeId": "restroom-1",
    "point": [
      840,
      220
    ]
  },
  "SW-KAL-1-EXIT": {
    "code": "SW-KAL-1-EXIT",
    "name": "West Stairway Exit",
    "floor": 2,
    "zone": "zone-d",
    "desc": "West wing stairwell connection to ground exit.",
    "mapId": "kalpana-first",
    "room": "Entry / Exit",
    "nodeId": "restroom-1",
    "point": [
      145,
      325
    ]
  },
  "SW-KAL-1-EMERG": {
    "code": "SW-KAL-1-EMERG",
    "name": "Upper Fire Escape Door",
    "floor": 2,
    "zone": "zone-d",
    "desc": "External fire escape stair tower access door.",
    "mapId": "kalpana-first",
    "room": "Emergency Exit",
    "nodeId": "restroom-1",
    "point": [
      175,
      300
    ]
  },
  "SW-RAMAN-G-EXIT1": {
    "code": "SW-RAMAN-G-EXIT1",
    "name": "Raman Main Entrance / Exit 1",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor main foyer entry from campus road.",
    "mapId": "raman-ground",
    "room": "Entry / Exit 1",
    "nodeId": "lab-101",
    "point": [
      650,
      590
    ]
  },
  "SW-RAMAN-G-EXIT2": {
    "code": "SW-RAMAN-G-EXIT2",
    "name": "East Fire Exit 2",
    "floor": 1,
    "zone": "zone-b",
    "desc": "East perimeter fire escape exit door to Gate 2 path.",
    "mapId": "raman-ground",
    "room": "Entry / Exit 2",
    "nodeId": "lab-101",
    "point": [
      920,
      300
    ]
  },
  "SW-RAMAN-G-LH1": {
    "code": "SW-RAMAN-G-LH1",
    "name": "Lecture Hall LH 1",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Multimedia physics & science lecture hall 1.",
    "mapId": "raman-ground",
    "room": "Lecture Hall 1",
    "nodeId": "lab-101",
    "point": [
      380,
      350
    ]
  },
  "SW-RAMAN-G-LH2": {
    "code": "SW-RAMAN-G-LH2",
    "name": "Lecture Hall LH 2",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Multimedia chemistry & materials lecture hall 2.",
    "mapId": "raman-ground",
    "room": "Lecture Hall 2",
    "nodeId": "lab-101",
    "point": [
      500,
      385
    ]
  },
  "SW-RAMAN-G-SAMVAAD": {
    "code": "SW-RAMAN-G-SAMVAAD",
    "name": "Samvaad Literary & Debate Club",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Student union debate room and literary society hub.",
    "mapId": "raman-ground",
    "room": "Samvaad Club",
    "nodeId": "lab-101",
    "point": [
      585,
      350
    ]
  },
  "SW-RAMAN-G-KALAKRIT": {
    "code": "SW-RAMAN-G-KALAKRIT",
    "name": "Kalakrit Fine Arts & Music Club",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Cultural society studio, instruments room, and art space.",
    "mapId": "raman-ground",
    "room": "Kalakrit Club",
    "nodeId": "lab-101",
    "point": [
      300,
      385
    ]
  },
  "SW-RAMAN-G-MED": {
    "code": "SW-RAMAN-G-MED",
    "name": "Campus Medical Center & First Aid",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Emergency medical room, nurse station, and first-aid beds.",
    "mapId": "raman-ground",
    "room": "Medical Room",
    "nodeId": "lab-101",
    "point": [
      650,
      385
    ]
  },
  "SW-RAMAN-G-WATER": {
    "code": "SW-RAMAN-G-WATER",
    "name": "RO Drinking Water Hub",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Purified water station and dispenser.",
    "mapId": "raman-ground",
    "room": "Drinking Water",
    "nodeId": "lab-101",
    "point": [
      850,
      410
    ]
  },
  "SW-RAMAN-G-BWC": {
    "code": "SW-RAMAN-G-BWC",
    "name": "Boys Restrooms 1F",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor male sanitation facility.",
    "mapId": "raman-ground",
    "room": "Boys W/C",
    "nodeId": "lab-101",
    "point": [
      220,
      300
    ]
  },
  "SW-RAMAN-G-GWC": {
    "code": "SW-RAMAN-G-GWC",
    "name": "Girls Restrooms 1F",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Ground Floor female sanitation facility.",
    "mapId": "raman-ground",
    "room": "Girls W/C",
    "nodeId": "lab-101",
    "point": [
      805,
      300
    ]
  },
  "SW-RAMAN-G-LIFT": {
    "code": "SW-RAMAN-G-LIFT",
    "name": "Central Elevator Station",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground floor passenger elevator station.",
    "mapId": "raman-ground",
    "room": "Lift",
    "nodeId": "lab-101",
    "point": [
      155,
      345
    ]
  },
  "SW-RAMAN-G-STAIR": {
    "code": "SW-RAMAN-G-STAIR",
    "name": "East Stairwell",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Staircase leading to First Floor Auditorium.",
    "mapId": "raman-ground",
    "room": "Stairs",
    "nodeId": "lab-101",
    "point": [
      755,
      260
    ]
  },
  "SW-RAMAN-1-AUD": {
    "code": "SW-RAMAN-1-AUD",
    "name": "Grand Campus Auditorium",
    "floor": 2,
    "zone": "zone-d",
    "desc": "500-seat multi-purpose auditorium, stage, and AV control room.",
    "mapId": "raman-first",
    "room": "Auditorium Hall",
    "nodeId": "lab-101",
    "point": [
      500,
      270
    ]
  },
  "SW-RAMAN-1-LH": {
    "code": "SW-RAMAN-1-LH",
    "name": "Executive Seminar Hall",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Executive symposium hall with video conferencing.",
    "mapId": "raman-first",
    "room": "Lecture Hall",
    "nodeId": "lab-101",
    "point": [
      750,
      270
    ]
  },
  "SW-RAMAN-1-WATER": {
    "code": "SW-RAMAN-1-WATER",
    "name": "Drinking Water Hub 2F",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Upper Level drinking water kiosk.",
    "mapId": "raman-first",
    "room": "Drinking Water",
    "nodeId": "lab-101",
    "point": [
      850,
      410
    ]
  },
  "SW-RAMAN-1-BWC": {
    "code": "SW-RAMAN-1-BWC",
    "name": "Boys Washrooms 2F",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Auditorium foyer male washroom.",
    "mapId": "raman-first",
    "room": "Boys W/C",
    "nodeId": "lab-101",
    "point": [
      220,
      300
    ]
  },
  "SW-RAMAN-1-GWC": {
    "code": "SW-RAMAN-1-GWC",
    "name": "Girls Washrooms 2F",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Auditorium foyer female washroom.",
    "mapId": "raman-first",
    "room": "Girls W/C",
    "nodeId": "lab-101",
    "point": [
      805,
      300
    ]
  },
  "SW-RAMAN-1-LIFT": {
    "code": "SW-RAMAN-1-LIFT",
    "name": "Upper Elevator Lobby",
    "floor": 2,
    "zone": "zone-d",
    "desc": "First Floor elevator lobby with accessible ramp.",
    "mapId": "raman-first",
    "room": "Lift",
    "nodeId": "lab-101",
    "point": [
      155,
      345
    ]
  },
  "SW-RAMAN-1-STAIR": {
    "code": "SW-RAMAN-1-STAIR",
    "name": "Auditorium Grand Staircase",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Wide egress stairwell leading to ground exit.",
    "mapId": "raman-first",
    "room": "Stairs",
    "nodeId": "lab-101",
    "point": [
      755,
      260
    ]
  },
  "SW-RAMAN-1-EXIT1": {
    "code": "SW-RAMAN-1-EXIT1",
    "name": "Auditorium Main Portal",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Double doors into the auditorium seating hall.",
    "mapId": "raman-first",
    "room": "Entry / Exit 1",
    "nodeId": "lab-101",
    "point": [
      330,
      190
    ]
  },
  "SW-RAMAN-1-EXIT2": {
    "code": "SW-RAMAN-1-EXIT2",
    "name": "Auditorium Fire Escape Exit",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Direct emergency fire escape route to exterior stairs.",
    "mapId": "raman-first",
    "room": "Entry / Exit 2",
    "nodeId": "lab-101",
    "point": [
      755,
      190
    ]
  },
  "SW-ARYA-B-CR1": {
    "code": "SW-ARYA-B-CR1",
    "name": "Classroom CR 1",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Basement tutorial classroom 1.",
    "mapId": "aryabhatta-basement",
    "room": "Classroom 1",
    "nodeId": "cafeteria",
    "point": [
      300,
      330
    ]
  },
  "SW-ARYA-B-CR2": {
    "code": "SW-ARYA-B-CR2",
    "name": "Classroom CR 2",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Basement tutorial classroom 2.",
    "mapId": "aryabhatta-basement",
    "room": "Classroom 2",
    "nodeId": "cafeteria",
    "point": [
      450,
      330
    ]
  },
  "SW-ARYA-B-CR3": {
    "code": "SW-ARYA-B-CR3",
    "name": "Classroom CR 3",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Basement tutorial classroom 3.",
    "mapId": "aryabhatta-basement",
    "room": "Classroom 3",
    "nodeId": "cafeteria",
    "point": [
      600,
      330
    ]
  },
  "SW-ARYA-B-LAB1": {
    "code": "SW-ARYA-B-LAB1",
    "name": "Applied Physics Lab",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Optics, mechanics, and quantum physics lab.",
    "mapId": "aryabhatta-basement",
    "room": "Lab 1",
    "nodeId": "cafeteria",
    "point": [
      350,
      480
    ]
  },
  "SW-ARYA-B-LAB2": {
    "code": "SW-ARYA-B-LAB2",
    "name": "Applied Chemistry Lab",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Inorganic analysis and chemical synthesis lab.",
    "mapId": "aryabhatta-basement",
    "room": "Lab 2",
    "nodeId": "cafeteria",
    "point": [
      550,
      480
    ]
  },
  "SW-ARYA-B-ROOM": {
    "code": "SW-ARYA-B-ROOM",
    "name": "Faculty & Scholars Study Room",
    "floor": 0,
    "zone": "zone-b",
    "desc": "Research scholar cubicles and quiet study space.",
    "mapId": "aryabhatta-basement",
    "room": "Room",
    "nodeId": "cafeteria",
    "point": [
      700,
      330
    ]
  },
  "SW-ARYA-B-LIFT": {
    "code": "SW-ARYA-B-LIFT",
    "name": "Basement Lift Lobby",
    "floor": 0,
    "zone": "zone-a",
    "desc": "Basement elevator station.",
    "mapId": "aryabhatta-basement",
    "room": "Lift",
    "nodeId": "cafeteria",
    "point": [
      320,
      540
    ]
  },
  "SW-ARYA-B-STAIR1": {
    "code": "SW-ARYA-B-STAIR1",
    "name": "Stairwell 1 (West)",
    "floor": 0,
    "zone": "zone-a",
    "desc": "West stairwell connecting to ground floor lobby.",
    "mapId": "aryabhatta-basement",
    "room": "Stairs 1",
    "nodeId": "cafeteria",
    "point": [
      220,
      170
    ]
  },
  "SW-ARYA-G-EXIT": {
    "code": "SW-ARYA-G-EXIT",
    "name": "Aryabhatta Main Entry / Exit",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Primary Ground Floor lobby entrance from East Campus Loop.",
    "mapId": "aryabhatta-ground",
    "room": "Entry / Exit",
    "nodeId": "cafeteria",
    "point": [
      500,
      590
    ]
  },
  "SW-ARYA-G-LARGEROOM": {
    "code": "SW-ARYA-G-LARGEROOM",
    "name": "Central Conference Hall",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Executive multi-purpose conference and presentation hall.",
    "mapId": "aryabhatta-ground",
    "room": "Large Room",
    "nodeId": "cafeteria",
    "point": [
      440,
      290
    ]
  },
  "SW-ARYA-G-R1": {
    "code": "SW-ARYA-G-R1",
    "name": "Classroom R1",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor classroom R1.",
    "mapId": "aryabhatta-ground",
    "room": "Room 1",
    "nodeId": "cafeteria",
    "point": [
      260,
      390
    ]
  },
  "SW-ARYA-G-R2": {
    "code": "SW-ARYA-G-R2",
    "name": "Classroom R2",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor classroom R2.",
    "mapId": "aryabhatta-ground",
    "room": "Room 2",
    "nodeId": "cafeteria",
    "point": [
      350,
      390
    ]
  },
  "SW-ARYA-G-R3": {
    "code": "SW-ARYA-G-R3",
    "name": "Classroom R3",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Ground Floor classroom R3.",
    "mapId": "aryabhatta-ground",
    "room": "Room 3",
    "nodeId": "cafeteria",
    "point": [
      440,
      390
    ]
  },
  "SW-ARYA-G-R4": {
    "code": "SW-ARYA-G-R4",
    "name": "Classroom R4",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor classroom R4.",
    "mapId": "aryabhatta-ground",
    "room": "Room 4",
    "nodeId": "cafeteria",
    "point": [
      300,
      300
    ]
  },
  "SW-ARYA-G-R5": {
    "code": "SW-ARYA-G-R5",
    "name": "Classroom R5",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor classroom R5.",
    "mapId": "aryabhatta-ground",
    "room": "Room 5",
    "nodeId": "cafeteria",
    "point": [
      385,
      300
    ]
  },
  "SW-ARYA-G-LAB": {
    "code": "SW-ARYA-G-LAB",
    "name": "Robotics & Automation Lab",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Mechatronics, drone testing, and robotics arena.",
    "mapId": "aryabhatta-ground",
    "room": "Lab",
    "nodeId": "cafeteria",
    "point": [
      650,
      290
    ]
  },
  "SW-ARYA-G-TEMPLE": {
    "code": "SW-ARYA-G-TEMPLE",
    "name": "Campus Garden & Temple Pavilion",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Tranquil outdoor courtyard, pond, and prayer pavilion.",
    "mapId": "aryabhatta-ground",
    "room": "Temple",
    "nodeId": "cafeteria",
    "point": [
      720,
      440
    ]
  },
  "SW-ARYA-G-BWC": {
    "code": "SW-ARYA-G-BWC",
    "name": "Boys Washrooms 1F",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground floor male sanitation facilities.",
    "mapId": "aryabhatta-ground",
    "room": "Boys Washroom",
    "nodeId": "cafeteria",
    "point": [
      330,
      230
    ]
  },
  "SW-ARYA-G-GWC": {
    "code": "SW-ARYA-G-GWC",
    "name": "Girls Washrooms 1F",
    "floor": 1,
    "zone": "zone-b",
    "desc": "Ground floor female sanitation facilities.",
    "mapId": "aryabhatta-ground",
    "room": "Girls Washroom",
    "nodeId": "cafeteria",
    "point": [
      660,
      230
    ]
  },
  "SW-ARYA-G-LIFT": {
    "code": "SW-ARYA-G-LIFT",
    "name": "Central Elevator Station",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Ground Floor passenger elevator lobby.",
    "mapId": "aryabhatta-ground",
    "room": "Lift",
    "nodeId": "cafeteria",
    "point": [
      420,
      315
    ]
  },
  "SW-ARYA-G-STAIR1": {
    "code": "SW-ARYA-G-STAIR1",
    "name": "Stairwell 1 (South)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "South wing stairwell leading to upper floors.",
    "mapId": "aryabhatta-ground",
    "room": "Stairs 1",
    "nodeId": "cafeteria",
    "point": [
      430,
      505
    ]
  },
  "SW-ARYA-G-STAIR2": {
    "code": "SW-ARYA-G-STAIR2",
    "name": "Stairwell 2 (North)",
    "floor": 1,
    "zone": "zone-b",
    "desc": "North wing stairwell leading to upper floors.",
    "mapId": "aryabhatta-ground",
    "room": "Stairs 2",
    "nodeId": "cafeteria",
    "point": [
      650,
      505
    ]
  },
  "SW-ENT-MAIN": {
    "code": "SW-ENT-MAIN",
    "name": "Main Entrance Gate (1F)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "College Main Gate entrance portal.",
    "mapId": "campus",
    "nodeId": "ent-main",
    "point": [
      440,
      565
    ]
  },
  "SW-ENT-NORTH": {
    "code": "SW-ENT-NORTH",
    "name": "North Entrance / Back Yard (1F)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "North garden gateway to Back Yard safe area.",
    "mapId": "campus",
    "nodeId": "ent-north",
    "point": [
      155,
      225
    ]
  },
  "SW-LOBBY": {
    "code": "SW-LOBBY",
    "name": "Grand Lobby (1F)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "West wing main lobby at Bhabha block.",
    "mapId": "campus",
    "nodeId": "lobby",
    "point": [
      191,
      397
    ]
  },
  "SW-RECEPTION": {
    "code": "SW-RECEPTION",
    "name": "Reception Desk & Cafe (1F)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Visitor reception desk and Gauri Cafe.",
    "mapId": "campus",
    "nodeId": "reception",
    "point": [
      440,
      290
    ]
  },
  "SW-ADMIN": {
    "code": "SW-ADMIN",
    "name": "Admin Office & Ramanujan Wing (1F)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "Central administration building entrance.",
    "mapId": "campus",
    "nodeId": "admin",
    "point": [
      355,
      206
    ]
  },
  "SW-CAFE": {
    "code": "SW-CAFE",
    "name": "Central Dining Cafeteria (1F)",
    "floor": 1,
    "zone": "zone-c",
    "desc": "Central dining hall at Aryabhatta block.",
    "mapId": "campus",
    "nodeId": "cafeteria",
    "point": [
      690,
      393
    ]
  },
  "SW-AUDITORIUM": {
    "code": "SW-AUDITORIUM",
    "name": "Campus Auditorium (1F)",
    "floor": 1,
    "zone": "zone-c",
    "desc": "Main assembly auditorium and garden pavilion.",
    "mapId": "campus",
    "nodeId": "auditorium",
    "point": [
      760,
      490
    ]
  },
  "SW-LAB101": {
    "code": "SW-LAB101",
    "name": "Lab 101 Physics & Raman Entry (1F)",
    "floor": 1,
    "zone": "zone-b",
    "desc": "East Wing science lab 101 and Raman entry.",
    "mapId": "campus",
    "nodeId": "lab-101",
    "point": [
      780,
      207
    ]
  },
  "SW-LAB102": {
    "code": "SW-LAB102",
    "name": "Lab 102 Robotics & Generator (1F)",
    "floor": 1,
    "zone": "zone-b",
    "desc": "East Wing robotics lab and backup power facility.",
    "mapId": "campus",
    "nodeId": "lab-102",
    "point": [
      950,
      390
    ]
  },
  "SW-LIFT1": {
    "code": "SW-LIFT1",
    "name": "Campus Central Junction & Lift (1F)",
    "floor": 1,
    "zone": "zone-c",
    "desc": "Central campus intersection elevator hub.",
    "mapId": "campus",
    "nodeId": "lift-1",
    "point": [
      440,
      347
    ]
  },
  "SW-STAIRA1": {
    "code": "SW-STAIRA1",
    "name": "Stairwell A / Gate 2 Path (1F)",
    "floor": 1,
    "zone": "zone-b",
    "desc": "East perimeter stairwell leading to 2F East Wing.",
    "mapId": "campus",
    "nodeId": "stair-a-1",
    "point": [
      900,
      225
    ]
  },
  "SW-STAIRB1": {
    "code": "SW-STAIRB1",
    "name": "Stairwell B / Bhabha Path (1F)",
    "floor": 1,
    "zone": "zone-a",
    "desc": "West wing stairwell leading to 2F West Wing.",
    "mapId": "campus",
    "nodeId": "stair-b-1",
    "point": [
      355,
      347
    ]
  },
  "SW-RESTROOM1": {
    "code": "SW-RESTROOM1",
    "name": "Restrooms 1F / Kalpana Wing (1F)",
    "floor": 1,
    "zone": "zone-c",
    "desc": "Level 1 central restroom complex.",
    "mapId": "campus",
    "nodeId": "restroom-1",
    "point": [
      540,
      207
    ]
  },
  "SW-ROOM201": {
    "code": "SW-ROOM201",
    "name": "Room 201 Lecture Hall (2F)",
    "floor": 2,
    "zone": "zone-d",
    "desc": "West Wing 2F primary lecture hall.",
    "mapId": "campus",
    "nodeId": "room-201",
    "point": [
      260,
      160
    ]
  },
  "SW-ROOM202": {
    "code": "SW-ROOM202",
    "name": "Room 202 Computer Lab (2F)",
    "floor": 2,
    "zone": "zone-d",
    "desc": "West Wing 2F computer lab facility.",
    "mapId": "campus",
    "nodeId": "room-202",
    "point": [
      260,
      440
    ]
  },
  "SW-ROOM203": {
    "code": "SW-ROOM203",
    "name": "Room 203 Conference Hall (2F)",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Central 2F academic conference hall.",
    "mapId": "campus",
    "nodeId": "room-203",
    "point": [
      440,
      160
    ]
  },
  "SW-ROOM204": {
    "code": "SW-ROOM204",
    "name": "Room 204 Faculty Lounge (2F)",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Faculty lounge and collaborative study room.",
    "mapId": "campus",
    "nodeId": "room-204",
    "point": [
      440,
      440
    ]
  },
  "SW-LIBRARY": {
    "code": "SW-LIBRARY",
    "name": "Central Library (2F)",
    "floor": 2,
    "zone": "zone-e",
    "desc": "East Wing 2F central library and stack rooms.",
    "mapId": "campus",
    "nodeId": "library",
    "point": [
      640,
      160
    ]
  },
  "SW-BOARDROOM": {
    "code": "SW-BOARDROOM",
    "name": "Executive Boardroom (2F)",
    "floor": 2,
    "zone": "zone-e",
    "desc": "Upper Level executive boardroom.",
    "mapId": "campus",
    "nodeId": "boardroom",
    "point": [
      640,
      440
    ]
  },
  "SW-STUDY": {
    "code": "SW-STUDY",
    "name": "Quiet Study Lounge (2F)",
    "floor": 2,
    "zone": "zone-e",
    "desc": "East Wing quiet study and reading lounge.",
    "mapId": "campus",
    "nodeId": "study-lounge",
    "point": [
      800,
      440
    ]
  },
  "SW-LIFT2": {
    "code": "SW-LIFT2",
    "name": "Central Elevator (2F)",
    "floor": 2,
    "zone": "zone-d",
    "desc": "Upper Level central passenger elevator station.",
    "mapId": "campus",
    "nodeId": "lift-2",
    "point": [
      500,
      300
    ]
  },
  "SW-STAIRA2": {
    "code": "SW-STAIRA2",
    "name": "Stairwell A (2F)",
    "floor": 2,
    "zone": "zone-e",
    "desc": "East Wing fire descent stairwell.",
    "mapId": "campus",
    "nodeId": "stair-a-2",
    "point": [
      730,
      300
    ]
  },
  "SW-STAIRB2": {
    "code": "SW-STAIRB2",
    "name": "Stairwell B (2F)",
    "floor": 2,
    "zone": "zone-d",
    "desc": "West Wing fire descent stairwell.",
    "mapId": "campus",
    "nodeId": "stair-b-2",
    "point": [
      350,
      300
    ]
  },
  "SW-REFUGE2A": {
    "code": "SW-REFUGE2A",
    "name": "Area of Refuge 2F (East)",
    "floor": 2,
    "zone": "zone-e",
    "desc": "2-hour fire rated rescue assistance refuge with intercom.",
    "mapId": "campus",
    "nodeId": "refuge-2a",
    "point": [
      730,
      240
    ]
  },
  "SW-REFUGE2B": {
    "code": "SW-REFUGE2B",
    "name": "Area of Refuge 2F (West)",
    "floor": 2,
    "zone": "zone-d",
    "desc": "2-hour fire rated rescue assistance refuge with intercom.",
    "mapId": "campus",
    "nodeId": "refuge-2b",
    "point": [
      350,
      240
    ]
  }
};

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
