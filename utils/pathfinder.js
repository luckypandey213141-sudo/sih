/**
 * SafeWay V3 - Pathfinding Engine (Dijkstra / A*)
 * Supports Normal Mode, Emergency Evacuation Mode, Multi-Floor Transition,
 * Hazard Avoidance, Step-Free Accessibility, Multi-Tier Dynamic Crowd Density,
 * and Fire Safety Elevator Policies with Area of Refuge Strategies.
 */

export const DEFAULT_EMERGENCY_POLICIES = {
  allowElevatorsInFire: false, // NFPA / Life Safety standard: normal lifts disabled during fire
  allowStairs: true,
  accessibleEvacuationStrategy: "refuge_zone" // Route wheelchair users to Area of Refuge if above ground
};

export function getCrowdWeight(level) {
  if (level === "High") return 60;
  if (level === "Medium") return 20;
  return 0;
}

/**
 * Calculates traversal cost for an edge under current conditions
 * Cost(e) = Distance(e) + Pblocked + Phazard + Pcrowd + Paccessibility + Pemergency-policy
 */
export function calculateEdgeCost(edge, options = {}, crowdData = {}, emergencyPolicies = DEFAULT_EMERGENCY_POLICIES) {
  const { isEmergency = false, accessibilityMode = false } = options;

  // 1. Physically blocked edges are impassable in all modes (Pblocked = Infinity)
  if (edge.blocked) {
    return Infinity;
  }

  // 2. Elevator Fire Safety Policy: In emergency, standard elevators are locked down unless authorized
  const isLiftEdge = edge.id.startsWith("vert-lift") || edge.type === "lift";
  if (isEmergency && isLiftEdge && !emergencyPolicies.allowElevatorsInFire) {
    return Infinity;
  }

  // 3. Accessibility requirement: If user requires step-free route, stairs are impassable (Paccessibility = Infinity)
  if (accessibilityMode && !edge.stepFree) {
    return Infinity;
  }

  let cost = edge.distance;

  // In Normal Mode, return base metric distance (unless blocked or stairs restricted)
  if (!isEmergency) {
    return cost;
  }

  // 4. Hazard Level Penalties in Emergency Mode (Phazard)
  if (edge.hazardLevel === "high") {
    return Infinity; // Fire / structural compromise
  }
  if (edge.hazardLevel === "low") {
    cost += 50; // Smoke / heat warning
  }

  // 5. Multi-Tier Dynamic Crowd Density: Corridors + Exits (Pcrowd)
  const edgeCrowd = (crowdData.edges && crowdData.edges[edge.id]) || edge.crowdLevel || "Low";
  const toExitCrowd = (crowdData.exits && (crowdData.exits[edge.to] || crowdData.exits[edge.from])) || "Low";
  
  const crowdPenalty = getCrowdWeight(edgeCrowd) + getCrowdWeight(toExitCrowd);
  cost += crowdPenalty;

  return cost;
}

/**
 * Normalizes crowd data structure supporting exits, corridors/edges, and zones
 */
export function normalizeCrowdData(crowdInput) {
  if (!crowdInput) return { exits: {}, edges: {}, zones: {} };
  if (!crowdInput.exits && !crowdInput.edges && !crowdInput.zones) {
    return { exits: crowdInput, edges: {}, zones: {} };
  }
  return {
    exits: crowdInput.exits || {},
    edges: crowdInput.edges || {},
    zones: crowdInput.zones || {}
  };
}

/**
 * Builds an adjacency list from nodes and edges
 */
export function buildAdjacencyList(nodes, edges, options = {}, crowdInput = {}, zoneHazardMap = {}, emergencyPolicies = DEFAULT_EMERGENCY_POLICIES) {
  const adj = new Map();
  nodes.forEach(node => adj.set(node.id, []));

  const crowdData = normalizeCrowdData(crowdInput);

  edges.forEach(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);

    const fromZoneHazard = fromNode?.zone ? (zoneHazardMap[fromNode.zone] || "none") : "none";
    const toZoneHazard = toNode?.zone ? (zoneHazardMap[toNode.zone] || "none") : "none";
    
    // Effective hazard level takes maximum of edge hazard and endpoint zone hazards
    let effectiveHazard = edge.hazardLevel || "none";
    if (fromZoneHazard === "high" || toZoneHazard === "high") {
      effectiveHazard = "high";
    } else if (fromZoneHazard === "low" || toZoneHazard === "low") {
      if (effectiveHazard !== "high") effectiveHazard = "low";
    }

    // Zone crowd penalties factored into edge
    const fromZoneCrowd = fromNode?.zone ? (crowdData.zones[fromNode.zone] || "Low") : "Low";
    const toZoneCrowd = toNode?.zone ? (crowdData.zones[toNode.zone] || "Low") : "Low";
    const maxZoneCrowd = (fromZoneCrowd === "High" || toZoneCrowd === "High") ? "High" : (fromZoneCrowd === "Medium" || toZoneCrowd === "Medium") ? "Medium" : "Low";

    const effectiveEdge = {
      ...edge,
      hazardLevel: effectiveHazard
    };

    let cost = calculateEdgeCost(effectiveEdge, options, crowdData, emergencyPolicies);
    if (options.isEmergency && cost < Infinity) {
      cost += getCrowdWeight(maxZoneCrowd);
    }

    if (cost < Infinity) {
      if (adj.has(edge.from)) {
        adj.get(edge.from).push({ to: edge.to, cost, edge: effectiveEdge, distance: edge.distance });
      }
      if (adj.has(edge.to)) {
        adj.get(edge.to).push({ to: edge.from, cost, edge: effectiveEdge, distance: edge.distance });
      }
    }
  });

  return adj;
}

/**
 * Single-source shortest path using Dijkstra / A*
 */
export function findShortestPath(startNodeId, targetNodeId, nodes, edges, options = {}, crowdInput = {}, zoneHazardMap = {}, emergencyPolicies = DEFAULT_EMERGENCY_POLICIES) {
  if (!startNodeId || !targetNodeId) return null;
  if (startNodeId === targetNodeId) {
    const node = nodes.find(n => n.id === startNodeId);
    return {
      pathNodeIds: [startNodeId],
      pathNodes: [node],
      edges: [],
      totalDistance: 0,
      totalCost: 0,
      steps: [{ title: "Arrived", description: `You are already at ${node?.name || "your location"}.`, floor: node?.floor || 1 }]
    };
  }

  const crowdData = normalizeCrowdData(crowdInput);
  const adj = buildAdjacencyList(nodes, edges, options, crowdData, zoneHazardMap, emergencyPolicies);
  const distances = new Map();
  const rawDistances = new Map();
  const previous = new Map();
  const previousEdge = new Map();
  const unvisited = new Set(nodes.map(n => n.id));

  nodes.forEach(node => {
    distances.set(node.id, Infinity);
    rawDistances.set(node.id, 0);
  });
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let currentId = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId);
      if (dist < minDistance) {
        minDistance = dist;
        currentId = nodeId;
      }
    }

    if (currentId === null || minDistance === Infinity) {
      break;
    }

    if (currentId === targetNodeId) {
      break;
    }

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;

      const alt = distances.get(currentId) + neighbor.cost;
      if (alt < distances.get(neighbor.to)) {
        distances.set(neighbor.to, alt);
        rawDistances.set(neighbor.to, rawDistances.get(currentId) + neighbor.distance);
        previous.set(neighbor.to, currentId);
        previousEdge.set(neighbor.to, neighbor.edge);
      }
    }
  }

  if (distances.get(targetNodeId) === Infinity) {
    return null;
  }

  // Reconstruct path
  const pathNodeIds = [];
  const pathEdges = [];
  let curr = targetNodeId;

  while (curr !== undefined) {
    pathNodeIds.unshift(curr);
    const prevEdge = previousEdge.get(curr);
    if (prevEdge) pathEdges.unshift(prevEdge);
    curr = previous.get(curr);
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const pathNodes = pathNodeIds.map(id => nodeMap.get(id)).filter(Boolean);
  const steps = generateNavigationSteps(pathNodes, pathEdges, options);

  return {
    pathNodeIds,
    pathNodes,
    edges: pathEdges,
    totalCost: distances.get(targetNodeId),
    totalDistance: rawDistances.get(targetNodeId),
    steps
  };
}

/**
 * Finds the safest evacuation route enforcing strict sequential routing:
 * [USER -> SAFE INTERNAL CORRIDORS -> EXIT DOORWAY -> OUTDOOR ASSEMBLY AREA]
 */
export function findSafestEvacuationPath(startNodeId, nodes, edges, exits, assemblyAreas, options = {}, crowdInput = {}, zoneHazardMap = {}, emergencyPolicies = DEFAULT_EMERGENCY_POLICIES) {
  const { accessibilityMode = false } = options;
  const startNode = nodes.find(n => n.id === startNodeId);
  const crowdData = normalizeCrowdData(crowdInput);

  // Check if accessibility user is on an upper floor (Floor > 1) and elevators are disabled in fire
  const isUpperFloorAccessibility = accessibilityMode && startNode && startNode.floor > 1 && !emergencyPolicies.allowElevatorsInFire;

  if (isUpperFloorAccessibility && emergencyPolicies.accessibleEvacuationStrategy === "refuge_zone") {
    // Direct wheelchair user on upper floor to designated Area of Rescue Assistance
    const refugeNodes = nodes.filter(n => n.type === "refuge" && n.floor === startNode.floor);
    let bestRefugeRoute = null;
    let chosenRefuge = null;

    for (const refuge of refugeNodes) {
      const routeToRefuge = findShortestPath(startNodeId, refuge.id, nodes, edges, { ...options, isEmergency: true }, crowdData, zoneHazardMap, emergencyPolicies);
      if (routeToRefuge && (!bestRefugeRoute || routeToRefuge.totalCost < bestRefugeRoute.totalCost)) {
        bestRefugeRoute = routeToRefuge;
        chosenRefuge = refuge;
      }
    }

    if (bestRefugeRoute) {
      return {
        bestRoute: bestRefugeRoute,
        recommendedExit: null,
        recommendedAssembly: null,
        isRefugeRoute: true,
        refugeNode: chosenRefuge,
        allExitEvaluations: [],
        safetyGuidance: `Elevators locked down for fire safety. Proceed immediately to ${chosenRefuge.name} (Fire-rated 2-hour compartment with emergency intercom) and await evacuation chair assistance.`
      };
    }
  }

  const results = [];

  // Campus demo policy: compare the two open exit gates and the two designated
  // safe places over the real pathway graph. A nearby gate wins naturally;
  // otherwise the closest reachable safe place is selected.
  if (options.nearestEmergencyDestination && startNode?.floor === 1) {
    const candidates = [
      ...exits.filter(exit => exit.isOpen).map(exit => ({ nodeId: exit.id, exit, assembly: null, kind: "exit" })),
      ...assemblyAreas.map(assembly => ({ nodeId: assembly.id, exit: null, assembly, kind: "safe-place" }))
    ];
    const evaluated = candidates.map(candidate => {
      const path = findShortestPath(startNodeId, candidate.nodeId, nodes, edges, { ...options, isEmergency: true }, crowdData, zoneHazardMap, emergencyPolicies);
      return { ...candidate, path, cost: path?.totalCost ?? Infinity };
    }).filter(candidate => candidate.path && candidate.cost < Infinity).sort((a, b) => a.cost - b.cost);
    // Compare every reachable emergency destination by its real pathway
    // distance. This lets a nearby safe place beat a farther gate, while a
    // nearby gate beats a farther safe place.
    evaluated.sort((a, b) => a.path.totalDistance - b.path.totalDistance || a.cost - b.cost);
    const best = evaluated[0] || null;
    return {
      bestRoute: best?.path || null,
      recommendedExit: best?.exit || null,
      recommendedAssembly: best?.assembly || null,
      emergencyDestinationType: best?.kind || null,
      isRefugeRoute: false,
      allExitEvaluations: evaluated
    };
  }

  for (const exit of exits) {
    if (!exit.isOpen) {
      results.push({
        exit,
        isOpen: false,
        cost: Infinity,
        distance: Infinity,
        crowdLevel: crowdData.exits[exit.id] || exit.crowdLevel || "Low",
        path: null,
        statusText: "Closed / Blocked"
      });
      continue;
    }

    // Step A: Path from user location to Exit doorway
    const pathToExit = findShortestPath(startNodeId, exit.id, nodes, edges, { ...options, isEmergency: true }, crowdData, zoneHazardMap, emergencyPolicies);

    if (!pathToExit) {
      results.push({
        exit,
        isOpen: true,
        cost: Infinity,
        distance: Infinity,
        crowdLevel: crowdData.exits[exit.id] || exit.crowdLevel || "Low",
        path: null,
        statusText: "Hazard Blocked"
      });
      continue;
    }

    // Step B: Sequential path from Exit doorway to Outdoor Assembly Area
    const assembly = assemblyAreas.find(a => a.id === exit.assemblyId);
    let fullPath = pathToExit;

    if (assembly) {
      const pathToAssembly = findShortestPath(exit.id, assembly.id, nodes, edges, { ...options, isEmergency: true }, crowdData, zoneHazardMap, emergencyPolicies);
      
      if (pathToAssembly && pathToAssembly.pathNodes.length > 1) {
        const combinedNodes = [...pathToExit.pathNodes, ...pathToAssembly.pathNodes.slice(1)];
        const combinedEdges = [...pathToExit.edges, ...pathToAssembly.edges];
        const combinedNodeIds = [...pathToExit.pathNodeIds, ...pathToAssembly.pathNodeIds.slice(1)];
        const combinedDistance = pathToExit.totalDistance + pathToAssembly.totalDistance;
        const combinedCost = pathToExit.totalCost + pathToAssembly.totalCost;
        const combinedSteps = generateNavigationSteps(combinedNodes, combinedEdges, options);

        fullPath = {
          pathNodeIds: combinedNodeIds,
          pathNodes: combinedNodes,
          edges: combinedEdges,
          totalDistance: combinedDistance,
          totalCost: combinedCost,
          steps: combinedSteps
        };
      }
    }

    const crowd = crowdData.exits[exit.id] || exit.crowdLevel || "Low";

    results.push({
      exit,
      assembly,
      isOpen: true,
      cost: fullPath.totalCost,
      distance: fullPath.totalDistance,
      crowdLevel: crowd,
      path: fullPath,
      statusText: crowd === "High" ? "Congested" : (crowd === "Medium" ? "Moderate" : "Clear")
    });
  }

  // Sort by lowest evaluated cost
  const validResults = results.filter(r => r.path !== null && r.cost < Infinity);
  validResults.sort((a, b) => a.cost - b.cost);

  let bestOption = validResults.length > 0 ? validResults[0] : null;

  // FAIL-SAFE DEADLOCK PROTECTION: If all building exits are blocked, find closest reachable refuge zone
  if (!bestOption) {
    const refugeNodes = nodes.filter(n => n.type === "refuge" || n.type === "assembly");
    for (const refNode of refugeNodes) {
      const refPath = findShortestPath(startNodeId, refNode.id, nodes, edges, options, crowdInput, zoneHazardMap, emergencyPolicies);
      if (refPath && refPath.totalCost < Infinity) {
        return {
          bestRoute: refPath,
          recommendedExit: null,
          recommendedAssembly: null,
          isRefugeRoute: true,
          refugeNode: refNode,
          isTrapped: true,
          safetyGuidance: "All primary building exits compromised. Proceed to marked Fire Refuge Zone and await rescue team.",
          allExitEvaluations: results
        };
      }
    }
  }

  return {
    bestRoute: bestOption ? bestOption.path : null,
    recommendedExit: bestOption ? bestOption.exit : null,
    recommendedAssembly: bestOption ? bestOption.assembly : null,
    isRefugeRoute: false,
    allExitEvaluations: results
  };
}

/**
 * Generate human-readable turn-by-turn navigation instructions
 */
export function generateNavigationSteps(pathNodes, pathEdges, options = {}) {
  if (!pathNodes || pathNodes.length <= 1) {
    return [{
      title: "Current Location",
      description: "You are already at your destination.",
      floor: pathNodes?.[0]?.floor || 1
    }];
  }

  const steps = [];
  const startNode = pathNodes[0];

  steps.push({
    title: `Start at ${startNode.name}`,
    description: `Begin departure from ${startNode.name} (${startNode.floor === 1 ? "1st Floor" : "2nd Floor"})`,
    floor: startNode.floor,
    nodeId: startNode.id
  });

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const curr = pathNodes[i];
    const next = pathNodes[i + 1];
    const edge = pathEdges[i];

    // Floor transition
    if (curr.floor !== next.floor) {
      const isLift = curr.type === "lift" || next.type === "lift";
      const direction = next.floor > curr.floor ? "Up" : "Down";
      steps.push({
        title: isLift ? `Take Elevator to Floor ${next.floor}` : `Take Stairs ${direction} to Floor ${next.floor}`,
        description: isLift 
          ? `Enter Central Lift and select Floor ${next.floor}. Step-free accessible.`
          : `Walk ${direction.toLowerCase()} via ${curr.name} to Floor ${next.floor}.`,
        floor: curr.floor,
        targetFloor: next.floor,
        nodeId: next.id,
        isFloorChange: true
      });
      continue;
    }

    if (next.type === "refuge") {
      steps.push({
        title: `Enter ${next.name}`,
        description: `Enter fire-rated refuge compartment and press the Two-Way Emergency Intercom to notify first responders.`,
        floor: next.floor,
        nodeId: next.id
      });
    } else if (next.type === "exit") {
      steps.push({
        title: `Pass through ${next.name}`,
        description: `Push emergency exit bar and exit the building interior (~${edge?.distance || 10}m).`,
        floor: next.floor,
        nodeId: next.id
      });
    } else if (next.type === "assembly") {
      steps.push({
        title: `Proceed to ${next.name}`,
        description: `Move directly to the outdoor assembly area on open ground (~${edge?.distance || 15}m).`,
        floor: next.floor,
        nodeId: next.id
      });
    } else if (next.type === "room" && i === pathNodes.length - 2) {
      steps.push({
        title: `Arrive at ${next.name}`,
        description: `Destination is on your floor (${next.floor === 1 ? "Floor 1" : "Floor 2"}).`,
        floor: next.floor,
        nodeId: next.id
      });
    } else if (next.type === "lift" && curr.type !== "lift") {
      steps.push({
        title: `Head to Central Lift Lobby`,
        description: `Walk towards Elevator (${edge?.distance || 8}m).`,
        floor: curr.floor,
        nodeId: next.id
      });
    } else if (next.type === "stair" && curr.type !== "stair") {
      steps.push({
        title: `Head to ${next.name}`,
        description: `Walk towards ${next.name} (${edge?.distance || 8}m).`,
        floor: curr.floor,
        nodeId: next.id
      });
    } else if (next.type === "room") {
      steps.push({
        title: `Pass by ${next.name}`,
        description: `Continue along corridor past ${next.name}.`,
        floor: next.floor,
        nodeId: next.id
      });
    } else if (edge && edge.distance >= 10) {
      steps.push({
        title: `Continue along corridor`,
        description: `Follow main hallway towards ${next.name} (~${edge.distance}m).`,
        floor: curr.floor,
        nodeId: next.id
      });
    }
  }

  return steps;
}
