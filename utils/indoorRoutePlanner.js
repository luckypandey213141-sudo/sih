// Shared with the mobile planner. Keep parity covered by the route tests.
    function getControlId(kind, mapId, name) {
      if (!name || !mapId) return "";
      name = kind === "door" ? (window.SafeWayRouteControls?.DOOR_ALIASES?.[mapId]?.[name] || name) : name;
      return kind + "-" + mapId + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    const MAP_PLANS = [
      { id: "campus", group: "Campus", label: "Main College Campus Map", src: "/assets/college-campus-layout.jpeg", floor: 1 },
      { id: "ramanujan-basement", group: "Ramanujan Block", label: "Basement", src: "/assets/college-maps/ramanujan-basement.png", floor: 0, rooms: ["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Lab 5", "Lab 6", "Lift", "Stairs 1", "Stairs 2", "Exit"] },
      { id: "ramanujan-ground", group: "Ramanujan Block", label: "Ground Floor", src: "/assets/college-maps/ramanujan-ground.png", floor: 1, rooms: ["R1", "R2", "R3", "R4", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "W1", "W2", "Badminton Court", "Lift", "Entry / Exit 1", "Entry / Exit 2", "Entry / Exit 3"] },
      { id: "ramanujan-first", group: "Ramanujan Block", label: "First Floor", src: "/assets/college-maps/ramanujan-first.png", floor: 2, rooms: ["Drawing Lab", "LT 1", "LT 2", "LT 3", "LT 4", "Boys W/C", "Girls W/C", "Lift", "Stairs", "Entry / Exit"] },
      { id: "bhabha-basement", group: "Bhabha Block", label: "Basement", src: "/assets/college-maps/bhabha-basement.png", floor: 0, rooms: ["Digital Library", "Library", "Main Library", "Lobby / Corridor", "Entry Gate", "Exit"] },
      { id: "bhabha-ground", group: "Bhabha Block", label: "Ground Floor", src: "/assets/college-maps/bhabha-ground.png", floor: 1, rooms: ["Lecture Hall 1", "Lecture Hall 2", "Reception", "Registrar", "Director Office", "Admission Cell", "Sitting Hall", "Drinking Water", "Boys W/C", "Girls W/C", "Stairs 1", "Stairs 2", "Entry"] },
      { id: "bhabha-first", group: "Bhabha Block", label: "First Floor", src: "/assets/college-maps/bhabha-first.png", floor: 2, rooms: ["HOD ME", "LT 1", "LT 2", "LT 3", "Faculty Cabins", "ECE Lab", "Boys W/C", "Girls W/C", "Stairs", "Entry / Exit 1", "Entry / Exit 2"] },
      { id: "kalpana-basement", group: "Kalpana Block", label: "Basement", src: "/assets/college-maps/kalpana-basement.png", floor: 0, rooms: ["Fluid Mechanics Lab", "Computer Lab 1", "Computer Lab 2", "Automobile Lab", "Store Room", "Lift", "Stair 1", "Stair 2", "Entry / Exit"] },
      { id: "kalpana-ground", group: "Kalpana Block", label: "Ground Floor", src: "/assets/college-maps/kalpana-ground.png", floor: 1, rooms: ["LT 1", "LT 2", "LT 3", "CCPD 1", "CCPD 2", "Computer Lab 1", "HOD CSE", "Boys W/C", "Girls W/C", "Lift", "Stairs", "Entry", "Emergency Exit"] },
      { id: "kalpana-first", group: "Kalpana Block", label: "First Floor", src: "/assets/college-maps/kalpana-first.png", floor: 2, rooms: ["Training Hall 1", "Training Hall 2", "Class Room 1", "Class Room 2", "Class Room 3", "Class Room 4", "Store", "Boys W/C", "Girls W/C", "Entry / Exit", "Emergency Exit"] },
      { id: "raman-ground", group: "Raman Block", label: "Ground Floor", src: "/assets/college-maps/raman-ground.png", floor: 1, rooms: ["Lecture Hall 1", "Lecture Hall 2", "Samvaad Club", "Kalakrit Club", "Medical Room", "Drinking Water", "Boys W/C", "Girls W/C", "Lift", "Stairs", "Entry / Exit 1", "Entry / Exit 2"] },
      { id: "raman-first", group: "Raman Block", label: "First Floor", src: "/assets/college-maps/raman-first.png", floor: 2, rooms: ["Auditorium Hall", "Lecture Hall", "Drinking Water", "Boys W/C", "Girls W/C", "Lift", "Stairs", "Entry / Exit 1", "Entry / Exit 2"] },
      { id: "aryabhatta-basement", group: "Aryabhatta Block", label: "Basement", src: "/assets/college-maps/aryabhatta-basement.png", floor: 0, rooms: ["Classroom 1", "Classroom 2", "Classroom 3", "Lab 1", "Lab 2", "Room", "Lift", "Stairs 1", "Stairs 2"] },
      { id: "aryabhatta-ground", group: "Aryabhatta Block", label: "Ground Floor", src: "/assets/college-maps/aryabhatta-ground.png", floor: 1, rooms: ["Large Room", "Room 1", "Room 2", "Room 3", "Room 4", "Room 5", "Lab", "Temple", "Boys Washroom", "Girls Washroom", "Lift", "Stairs 1", "Stairs 2", "Entry / Exit"] }
    ];

    const BLOCK_CAMPUS_ENTRANCE_NODES = {
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
    };

    const ROOM_ROUTE_TARGETS = {
      "ramanujan-basement": {
        "Lab 1": [600, 275], "Lab 2": [680, 275], "Lab 3": [760, 275], "Lab 4": [600, 430], "Lab 5": [680, 430], "Lab 6": [760, 430],
        "Lift": [220, 275], "Stairs 1": [550, 260], "Stairs 2": [720, 260], "Exit": [740, 430]
      },
      "ramanujan-ground": {
        "R1": [350, 455], "R2": [830, 455], "R3": [830, 520], "R4": [650, 455],
        "R6": [220, 350], "R7": [405, 250], "R8": [220, 300], "R9": [330, 250],
        "R10": [480, 250], "R11": [565, 250], "R12": [650, 250], "W1": [820, 250],
        "W2": [205, 250], "Badminton Court": [500, 390], "Lift": [190, 235],
        "Entry / Exit 1": [250, 590], "Entry / Exit 2": [920, 300], "Entry / Exit 3": [760, 590]
      },
      "ramanujan-first": {
        "Drawing Lab": [500, 325], "LT 1": [260, 400], "LT 2": [420, 400],
        "LT 3": [580, 400], "LT 4": [740, 400], "Boys W/C": [840, 260],
        "Girls W/C": [840, 380], "Lift": [190, 235], "Stairs": [800, 235], "Entry / Exit": [920, 325]
      },
      "bhabha-ground": {
        "Lecture Hall 1": [300, 320], "Lecture Hall 2": [720, 320], "Reception": [330, 420],
        "Registrar": [700, 420], "Director Office": [300, 500], "Admission Cell": [720, 500],
        "Sitting Hall": [620, 500], "Drinking Water": [740, 260], "Boys W/C": [300, 220],
        "Girls W/C": [740, 220], "Stairs 1": [295, 175], "Stairs 2": [755, 175], "Entry": [500, 590]
      },
      "bhabha-first": {
        "HOD ME": [300, 300], "LT 1": [420, 300], "LT 2": [580, 300], "LT 3": [740, 300],
        "Faculty Cabins": [400, 450], "ECE Lab": [650, 450], "Stairs": [755, 175], "Entry / Exit 1": [500, 590]
      },
      "bhabha-basement": {
        "Digital Library": [300, 335], "Library": [500, 335], "Main Library": [700, 335],
        "Lobby / Corridor": [500, 420], "Entry Gate": [410, 590], "Exit": [720, 590]
      },
      "kalpana-ground": {
        "LT 1": [640, 220], "LT 2": [235, 400], "LT 3": [370, 400], "CCPD 1": [355, 400],
        "CCPD 2": [610, 400], "Computer Lab 1": [720, 400], "HOD CSE": [475, 440],
        "Boys W/C": [300, 220], "Girls W/C": [840, 220], "Lift": [190, 220],
        "Stairs": [385, 220], "Entry": [500, 590], "Emergency Exit": [500, 120]
      },
      "kalpana-first": {
        "Training Hall 1": [300, 325], "Training Hall 2": [450, 325], "Class Room 1": [600, 325],
        "Class Room 2": [750, 325], "Class Room 3": [300, 450], "Class Room 4": [600, 450],
        "Entry / Exit": [145, 325], "Emergency Exit": [175, 300]
      },
      "kalpana-basement": {
        "Fluid Mechanics Lab": [320, 290], "Computer Lab 1": [480, 290], "Computer Lab 2": [640, 290],
        "Automobile Lab": [400, 450], "Store Room": [700, 450], "Lift": [190, 205], "Entry / Exit": [500, 590]
      },
      "raman-ground": {
        "Lecture Hall 1": [380, 350], "Lecture Hall 2": [500, 385], "Samvaad Club": [585, 350],
        "Kalakrit Club": [300, 385], "Medical Room": [650, 385], "Drinking Water": [850, 410],
        "Boys W/C": [220, 300], "Girls W/C": [805, 300], "Lift": [155, 345], "Stairs": [755, 260],
        "Entry / Exit 1": [650, 590], "Entry / Exit 2": [920, 300]
      },
      "raman-first": {
        "Auditorium Hall": [500, 270], "Lecture Hall": [750, 270], "Drinking Water": [850, 410],
        "Lift": [155, 345], "Stairs": [755, 260], "Entry / Exit 1": [330, 190]
      },
      "aryabhatta-ground": {
        "Large Room": [440, 290], "Room 1": [260, 390], "Room 2": [350, 390], "Room 3": [440, 390],
        "Room 4": [300, 300], "Room 5": [385, 300], "Lab": [650, 290], "Temple": [720, 440],
        "Boys Washroom": [330, 230], "Girls Washroom": [660, 230], "Lift": [420, 315],
        "Stairs 1": [430, 505], "Stairs 2": [650, 505], "Entry / Exit": [500, 590]
      },
      "aryabhatta-basement": {
        "Classroom 1": [300, 330], "Classroom 2": [450, 330], "Classroom 3": [600, 330],
        "Lab 1": [350, 480], "Lab 2": [550, 480], "Lift": [320, 540], "Stairs 1": [220, 170]
      }
    };

    const BLOCK_EGRESS_OPTIONS = {
      "ramanujan-ground": [
        { id: "Entry / Exit 1", label: "MAIN EXIT 1 (South-West)", point: [250, 590], campusNode: "admin", corridorY: 455, hubX: 500, defaultPriority: 1 },
        { id: "Entry / Exit 2", label: "EXIT 2 (East Wing)", point: [920, 300], campusNode: "auditorium", corridorY: 300, hubX: 760, defaultPriority: 2 },
        { id: "Entry / Exit 3", label: "EXIT 3 (South-East)", point: [760, 590], campusNode: "lift-1", corridorY: 455, hubX: 760, defaultPriority: 3 }
      ],
      "bhabha-ground": [
        { id: "Entry", label: "MAIN RECEPTION EXIT", point: [500, 590], campusNode: "lobby", corridorY: 420, hubX: 500, defaultPriority: 1 },
        { id: "Rear Egress", label: "REAR EXIT GATE", point: [720, 590], campusNode: "gate-2-destination", corridorY: 420, hubX: 650, defaultPriority: 2 }
      ],
      "kalpana-ground": [
        { id: "Entry", label: "SOUTH MAIN EXIT", point: [500, 590], campusNode: "restroom-1", corridorY: 400, hubX: 500, defaultPriority: 1 },
        { id: "Emergency Exit", label: "NORTH EMERGENCY FIRE EXIT", point: [500, 120], campusNode: "ent-north", corridorY: 220, hubX: 500, defaultPriority: 2 }
      ],
      "raman-ground": [
        { id: "Entry / Exit 1", label: "RAMAN MAIN EXIT 1", point: [650, 590], campusNode: "lab-101", corridorY: 350, hubX: 500, defaultPriority: 1 },
        { id: "Entry / Exit 2", label: "RAMAN CORRIDOR EXIT 2", point: [920, 300], campusNode: "auditorium", corridorY: 350, hubX: 750, defaultPriority: 2 }
      ],
      "aryabhatta-ground": [
        { id: "Entry / Exit", label: "MAIN CAMPUS EXIT", point: [500, 590], campusNode: "cafeteria", corridorY: 390, hubX: 500, defaultPriority: 1 },
        { id: "Stairs 2 Exit", label: "EAST STAIRS EXIT", point: [650, 505], campusNode: "gate-2-destination", corridorY: 390, hubX: 600, defaultPriority: 2 }
      ]
    };

    const BLOCK_STAIRS_OPTIONS = {
      "ramanujan-first": [
        { id: "East Stairs", name: "Stairs", label: "EAST STAIRS", point: [800, 235], corridorY: 325, hubX: 520, groundStairs: [760, 250] }
      ],
      "ramanujan-basement": [
        { id: "Stairs 1", name: "Stairs 1", label: "BASEMENT STAIRS 1", point: [550, 260], corridorY: 300, hubX: 500, groundStairs: [760, 250] },
        { id: "Stairs 2", name: "Stairs 2", label: "BASEMENT STAIRS 2", point: [720, 260], corridorY: 300, hubX: 650, groundStairs: [760, 250] }
      ],
      "bhabha-first": [
        { id: "Stairs", name: "Stairs", label: "CENTRAL STAIRS", point: [755, 175], corridorY: 300, hubX: 500, groundStairs: [755, 175] }
      ],
      "bhabha-basement": [
        { id: "Library Stairs", name: "Lobby / Corridor", label: "LIBRARY STAIRS", point: [500, 420], corridorY: 335, hubX: 500, groundStairs: [500, 590] }
      ],
      "kalpana-first": [
        { id: "Entry / Exit", name: "Entry / Exit", label: "MAIN STAIRS", point: [145, 325], corridorY: 325, hubX: 300, groundStairs: [385, 220] },
        { id: "Emergency Exit", name: "Emergency Exit", label: "NORTH ESCAPE STAIRS", point: [175, 300], corridorY: 300, hubX: 300, groundStairs: [500, 120] }
      ],
      "kalpana-basement": [
        { id: "Basement Stairs", name: "Entry / Exit", label: "BASEMENT STAIRS", point: [500, 590], corridorY: 290, hubX: 500, groundStairs: [500, 590] }
      ],
      "raman-first": [
        { id: "Stairs", name: "Stairs", label: "FIRST FLOOR STAIRS", point: [755, 260], corridorY: 270, hubX: 520, groundStairs: [755, 260] }
      ],
      "aryabhatta-basement": [
        { id: "Stairs 1", name: "Stairs 1", label: "BASEMENT STAIRS", point: [220, 170], corridorY: 330, hubX: 500, groundStairs: [430, 505] }
      ]
    };

    function selectBestEgressDoor(groundMapId, liveState) {
      liveState = normalizeDoorControls(groundMapId,liveState);
      const options = BLOCK_EGRESS_OPTIONS[groundMapId] || [];
      if (options.length === 0) {
        return { id: "Exit", label: "MAIN EXIT", point: [250, 590], campusNode: "admin", corridorY: 455, hubX: 500 };
      }

      const viable = options.filter(opt => {
        const doorKey = getControlId("door", groundMapId, opt.id);
        const areaKey = getControlId("area", groundMapId, opt.id);

        if (liveState?.exits?.[doorKey]?.isOpen === false) return false;
        if (liveState?.exits?.[opt.id]?.isOpen === false) return false;

        if (liveState?.exits?.[doorKey]?.isOpen === false) return false;
        if (liveState?.hazards?.[doorKey] === "high" || liveState?.hazards?.[areaKey] === "high") return false;
        if (liveState?.hazards?.[opt.id] === "high") return false;

        if (liveState?.blockedEdges?.[doorKey] || liveState?.blockedEdges?.[opt.id]) return false;

        return true;
      });

      if (viable.length === 0) {
        return {
          id: "Area of Refuge",
          label: "SAFE AREA OF REFUGE (ALL EXITS BLOCKED)",
          point: [500, 390],
          campusNode: "admin",
          corridorY: 400,
          hubX: 500,
          isTrapped: true
        };
      }

      viable.sort((a, b) => {
        const doorKeyA = getControlId("door", groundMapId, a.id);
        const doorKeyB = getControlId("door", groundMapId, b.id);

        const crowdValA = liveState?.crowds?.[doorKeyA] || liveState?.crowds?.[a.id] || "Low";
        const crowdValB = liveState?.crowds?.[doorKeyB] || liveState?.crowds?.[b.id] || "Low";

        const crowdPenaltyA = crowdValA === "High" ? 80 : (crowdValA === "Medium" ? 30 : 0);
        const crowdPenaltyB = crowdValB === "High" ? 80 : (crowdValB === "Medium" ? 30 : 0);

        return (crowdPenaltyA + (a.defaultPriority || 1)) - (crowdPenaltyB + (b.defaultPriority || 1));
      });

      return viable[0];
    }

    function selectBestStairs(upperMapId, liveState) {
      liveState = normalizeDoorControls(upperMapId,liveState);
      const options = BLOCK_STAIRS_OPTIONS[upperMapId] || [];
      if (options.length === 0) {
        return null;
      }

      const viable = options.filter(opt => {
        const doorKey = getControlId("door", upperMapId, opt.name || opt.id);
        const areaKey = getControlId("area", upperMapId, opt.name || opt.id);

        if(liveState?.exits?.[doorKey]?.isOpen===false)return false;
        if (liveState?.hazards?.[doorKey] === "high" || liveState?.hazards?.[areaKey] === "high") return false;
        if (liveState?.hazards?.[opt.id] === "high") return false;
        if (liveState?.blockedEdges?.[doorKey] || liveState?.blockedEdges?.[opt.id]) return false;
        return true;
      });

      return viable.length > 0 ? viable[0] : null;
    }

    function normalizeDoorControls(mapId,state={}) {
      const exits={...state.exits},hazards={...state.hazards},blockedEdges={...state.blockedEdges};
      for(const [alias,name] of Object.entries(window.SafeWayRouteControls?.DOOR_ALIASES?.[mapId]||{})){
        const old='door-'+mapId+'-'+alias.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');const id=getControlId('door',mapId,name);
        if(exits[old]?.isOpen===false)exits[id]={isOpen:false};if(hazards[old]==='high')hazards[id]='high';if(blockedEdges[old])blockedEdges[id]=true;
      }return {...state,exits,hazards,blockedEdges};
    }
    const floorRestrictionCache=new Map();
    function constrainedNetwork(mapId,net,state) {
      if(!state)return net;
      const fingerprint=JSON.stringify([mapId,state.blockedEdges,state.hazards,state.corridorCrowds,state.crowds,state.exits]);
      if(floorRestrictionCache.has(fingerprint))return floorRestrictionCache.get(fingerprint);
      const blocked=new Set(),penalties={};
      const cellOf=p=>net.cells.reduce((a,c)=>!a||Math.hypot(c[0]*net.step+net.step/2-p[0],c[1]*net.step+net.step/2-p[1])<Math.hypot(a[0]*net.step+net.step/2-p[0],a[1]*net.step+net.step/2-p[1])?c:a,null)?.join(',');
      const targets={...(ROOM_ROUTE_TARGETS[mapId]||{}),...Object.fromEntries((BLOCK_EGRESS_OPTIONS[mapId]||[]).map(d=>[d.id,d.point])),...Object.fromEntries((BLOCK_STAIRS_OPTIONS[mapId]||[]).map(d=>[d.name||d.id,d.point]))};
      const names=window.SafeWayRouteControls?.ADMIN_FACILITIES?.[mapId]||[];
      for(const [name,p] of Object.entries(targets)){
        const id=getControlId('area',mapId,name),door=getControlId('door',mapId,name),key=cellOf(p);
        if(state.hazards?.[id]==='high'||state.hazards?.[door]==='high'||state.exits?.[door]?.isOpen===false||state.blockedEdges?.[door])blocked.add(key);
        const crowd=state.crowds?.[id] || state.crowds?.[door]; if(crowd==='High'||crowd==='Medium')penalties[key]=crowd==='High'?5:2; if(state.hazards?.[id]==='low')penalties[key]=Math.max(penalties[key]||1,3);
      }
      for(let i=0;i<names.length-1;i++){
        const id=getControlId('path',mapId,names[i]+'-'+names[i+1]);
        if(!state.blockedEdges?.[id]&&!state.corridorCrowds?.[id])continue;
        const from=targets[names[i]],to=targets[names[i+1]];
        if(!from||!to)continue;
        const path=shortestPathOnIndoorNetwork(net,from,to)?.points;if(!path)continue;
        for(let j=0;j<path.length-1;j++){
          const p=path[j],q=path[j+1],n=Math.round(Math.max(Math.abs(p[0]-q[0]),Math.abs(p[1]-q[1]))/net.step);
          for(let k=0;k<=n;k++){const key=[Math.round((p[0]+(q[0]-p[0])*k/(n||1)-net.step/2)/net.step),Math.round((p[1]+(q[1]-p[1])*k/(n||1)-net.step/2)/net.step)].join(',');if(state.blockedEdges?.[id])blocked.add(key);else penalties[key]=Math.max(penalties[key]||1,state.corridorCrowds[id]==='High'?5:state.corridorCrowds[id]==='Medium'?2:1);}
        }
      }
      const result={...net,blocked,penalties};if(floorRestrictionCache.size>32)floorRestrictionCache.clear();floorRestrictionCache.set(fingerprint,result);return result;
    }

    function shortestPathOnIndoorNetwork(network, startPoint, targetPoint) {
      if (!network?.cells?.length || !startPoint || !targetPoint) return null;
      const step = network.step;
      const keys = new Set(network.cells.map(([x, y]) => `${x},${y}`));
      const nearest = point => network.cells.reduce((best, cell) => {
        const distance = Math.hypot(cell[0] * step + step / 2 - point[0], cell[1] * step + step / 2 - point[1]);
        return !best || distance < best.distance ? { cell, distance } : best;
      }, null)?.cell;

      const start = nearest(startPoint);
      const target = nearest(targetPoint);
      if (!start || !target || network.blocked?.has(start.join(",")) || network.blocked?.has(target.join(","))) return null;
      for(const key of network.blocked||[])keys.delete(key);

      const startKey = `${start[0]},${start[1]}`;
      const targetKey = `${target[0]},${target[1]}`;
      const queue = [{ cell: start, cost: 0, alignment: 0 }];
      const previous = new Map([[startKey, null]]);
      const distances = new Map([[startKey, 0]]);
      const alignments = new Map([[startKey, 0]]);
      const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      while (queue.length) {
        queue.sort((a, b) => b.cost - a.cost || b.alignment - a.alignment);
        const {cell: [x, y], cost, alignment} = queue.pop();
        const key = x + "," + y;
        if (cost !== distances.get(key) || alignment !== alignments.get(key)) continue;
        if (key === targetKey) break;
        for (const [dx, dy] of directions) {
          const next = [x + dx, y + dy], nextKey = next.join(",");
          if (!keys.has(nextKey)) continue;
          if (dx && dy && (!keys.has((x + dx) + "," + y) || !keys.has(x + "," + (y + dy)))) continue;
          const nextCost = cost + Math.hypot(dx, dy) * Math.max(network.penalties?.[nextKey] || 1,network.penalties?.[key] || 1);
          const nextAlignment = alignment + (network.costs?.[nextKey] || 1);
          const knownCost = distances.get(nextKey) ?? Infinity;
          if (nextCost > knownCost || (nextCost === knownCost && nextAlignment >= (alignments.get(nextKey) ?? Infinity))) continue;
          distances.set(nextKey, nextCost);
          alignments.set(nextKey, nextAlignment);
          previous.set(nextKey, key);
          queue.push({cell: next, cost: nextCost, alignment: nextAlignment});
        }
      }

      if (!previous.has(targetKey)) return null;

      const raw = [];
      let cursor = targetKey;
      while (cursor) {
        const [x, y] = cursor.split(",").map(Number);
        raw.push([x * step + step / 2, y * step + step / 2]);
        cursor = previous.get(cursor);
      }
      raw.reverse();

      const pointsWithAnchors = raw;
      const points = pointsWithAnchors.filter((point, index, arr) => {
        if (index === 0 || index === arr.length - 1) return true;
        const prev = arr[index - 1];
        const next = arr[index + 1];
        const dx1 = point[0] - prev[0];
        const dy1 = point[1] - prev[1];
        const dx2 = next[0] - point[0];
        const dy2 = next[1] - point[1];
        const cross = dx1 * dy2 - dy1 * dx2;
        return Math.abs(cross) > 0.01;
      });

      const distance = raw.slice(1).reduce((total, point, index) => total + Math.hypot(point[0] - raw[index][0], point[1] - raw[index][1]), 0);
      return {
        points,
        distance,
        path: `M ${points.map(p => p.map(n => Math.round(n * 10) / 10).join(" ")).join(" L ")}`
      };
    }

    function computeFloorPath(mapId, startPt, endPt, corridorY = 455, hubX = 500) {
      if (!startPt || !endPt) return [];
      const net = window.SafeWay?.INDOOR_ROUTE_NETWORKS?.[mapId] || window.SafeWayData?.INDOOR_ROUTE_NETWORKS?.[mapId];
      if (net) {
        const indoorRes = shortestPathOnIndoorNetwork(constrainedNetwork(mapId,net,normalizeDoorControls(mapId,window.SafeWayRouteState)), startPt, endPt);
        if (indoorRes && indoorRes.points && indoorRes.points.length >= 1) {
          return indoorRes.points;
        }
      }

      return [];
    }


export {shortestPathOnIndoorNetwork,constrainedNetwork,normalizeDoorControls,selectBestEgressDoor,selectBestStairs};
