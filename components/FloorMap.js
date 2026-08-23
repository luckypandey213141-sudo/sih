/**
 * SafeWay - Interactive 2D SVG Floor Map Component
 * Visualizes Floor 1 & Floor 2, rooms, corridors, stairwells, lifts, exits,
 * hazards, blocked paths, crowd levels, and animated navigation routes.
 */

export function FloorMap({
  buildingData,
  currentFloor,
  userLocationNodeId,
  destinationNodeId,
  activeRoute,
  isEmergency,
  zoneHazards,
  blockedEdges,
  exitCrowdLevels,
  exitStatuses,
  onSelectNodeAsLocation,
  onSelectNodeAsDestination,
  onFloorChange,
  accessibilityMode
}) {
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const currentNodes = buildingData.nodes.filter(n => n.floor === currentFloor || n.type === "assembly");
  const currentEdges = buildingData.edges.filter(e => {
    const fromNode = buildingData.nodes.find(n => n.id === e.from);
    const toNode = buildingData.nodes.find(n => n.id === e.to);
    return (fromNode?.floor === currentFloor && toNode?.floor === currentFloor) ||
           (fromNode?.floor === currentFloor && toNode?.type === "assembly") ||
           (toNode?.floor === currentFloor && fromNode?.type === "assembly");
  });

  // Calculate route segments on the current floor
  const routeSegmentsOnFloor = React.useMemo(() => {
    if (!activeRoute || !activeRoute.pathNodes || activeRoute.pathNodes.length < 2) return [];
    
    const segments = [];
    const nodes = activeRoute.pathNodes;

    for (let i = 0; i < nodes.length - 1; i++) {
      const u = nodes[i];
      const v = nodes[i + 1];

      // If either node is on current floor or is an assembly area
      if ((u.floor === currentFloor && v.floor === currentFloor) ||
          (u.floor === currentFloor && v.type === "assembly") ||
          (u.type === "assembly" && v.floor === currentFloor)) {
        segments.push({ from: u, to: v, isVertical: false });
      } else if (u.floor === currentFloor && v.floor !== currentFloor) {
        // Floor transition exit node on this floor
        segments.push({ from: u, to: u, isVertical: true, targetFloor: v.floor, method: v.type });
      }
    }
    return segments;
  }, [activeRoute, currentFloor]);

  // Check if route passes through another floor
  const routeHasOtherFloors = React.useMemo(() => {
    if (!activeRoute || !activeRoute.pathNodes) return false;
    const floorsInRoute = new Set(activeRoute.pathNodes.map(n => n.floor).filter(Boolean));
    return floorsInRoute.size > 1;
  }, [activeRoute]);

  const userNode = buildingData.nodes.find(n => n.id === userLocationNodeId);
  const destNode = buildingData.nodes.find(n => n.id === destinationNodeId);

  // SVG Pan & Zoom Handlers
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'rect' || e.target.id === 'map-background') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 select-none overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      {/* Top Map Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Floor Selector Pills */}
        <div className="pointer-events-auto flex items-center bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
          <button
            onClick={() => onFloorChange(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-200 ${
              currentFloor === 1
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <i data-lucide="layers" className="w-3.5 h-3.5"></i>
            Floor 1 (Ground)
            {userNode?.floor === 1 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => onFloorChange(2)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-200 ${
              currentFloor === 2
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <i data-lucide="layers" className="w-3.5 h-3.5"></i>
            Floor 2 (Upper)
            {userNode?.floor === 2 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>
        </div>

        {/* Multi-floor transition banner button */}
        {routeHasOtherFloors && (
          <div className="pointer-events-auto flex items-center gap-2 bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 px-3.5 py-1.5 rounded-xl backdrop-blur-md text-xs shadow-lg animate-pulse">
            <i data-lucide="arrow-up-down" className="w-4 h-4 text-indigo-400"></i>
            <span>Route spans both floors:</span>
            <button
              onClick={() => onFloorChange(currentFloor === 1 ? 2 : 1)}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition"
            >
              Switch to Floor {currentFloor === 1 ? 2 : 1}
            </button>
          </div>
        )}

        {/* Zoom & Reset Controls */}
        <div className="pointer-events-auto flex items-center bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800 p-1 shadow-lg gap-1">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.2))}
            title="Zoom In"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <i data-lucide="zoom-in" className="w-4 h-4"></i>
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
            title="Zoom Out"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <i data-lucide="zoom-out" className="w-4 h-4"></i>
          </button>
          <button
            onClick={resetView}
            title="Reset Map View"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-mono"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl space-y-1.5 max-w-xs hidden sm:block">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs pb-1 border-b border-slate-800">
          <i data-lucide="map-pin" className="w-3.5 h-3.5 text-blue-400"></i>
          Map Legend ({buildingData.buildingName})
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500"></span>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            <span>Destination / Exit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-400 rounded-full"></span>
            <span>Safe Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-red-500 rounded-full"></span>
            <span>Hazard / Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500/30 border border-amber-500 rounded"></span>
            <span>Elevator (Step-Free)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-purple-500/30 border border-purple-500 rounded"></span>
            <span>Stairwell</span>
          </div>
        </div>
      </div>

      {/* Primary SVG Interactive Map */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          id="safeway-svg-map"
          viewBox="0 0 1000 650"
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "center center"
          }}
        >
          <defs>
            {/* Gradients and Filters */}
            <radialGradient id="userPulseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="emergencyPulseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hazardFireGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#dc2626" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0.05" />
            </radialGradient>
            <radialGradient id="hazardSmokeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.05" />
            </radialGradient>

            {/* Path Glow Filters */}
            <filter id="safePathGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.9" />
            </filter>
            <filter id="normalPathGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.9" />
            </filter>
            <filter id="hazardGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ef4444" floodOpacity="0.7" />
            </filter>

            {/* Grid Pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.6" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect id="map-background" width="1000" height="650" fill="#090d16" />
          <rect width="1000" height="650" fill="url(#grid)" />

          {/* Exterior Building Footprint & Perimeter Walls */}
          <g id="building-envelope">
            {/* Outdoor Lawn & Courtyard Zones */}
            <rect x="20" y="20" width="960" height="610" rx="16" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            
            {/* Outdoor Assembly Area Markers */}
            <g transform="translate(940, 570)" className="cursor-pointer" onClick={() => onSelectNodeAsDestination("assembly-a")}>
              <circle r="42" fill="#065f46" fillOpacity="0.3" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
              <circle r="22" fill="#059669" fillOpacity="0.6" />
              <text y="-5" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">ASSEMBLY A</text>
              <text y="8" textAnchor="middle" fill="#6ee7b7" fontSize="8">(East Lawn)</text>
            </g>

            <g transform="translate(60, 70)" className="cursor-pointer" onClick={() => onSelectNodeAsDestination("assembly-b")}>
              <circle r="42" fill="#065f46" fillOpacity="0.3" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
              <circle r="22" fill="#059669" fillOpacity="0.6" />
              <text y="-5" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">ASSEMBLY B</text>
              <text y="8" textAnchor="middle" fill="#6ee7b7" fontSize="8">(West Court)</text>
            </g>

            {/* Main Facility Building Wall Outline */}
            <rect
              x="130"
              y="70"
              width="760"
              height="460"
              rx="12"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="4"
            />
            {/* Floor Name Watermark */}
            <text
              x="500"
              y="110"
              textAnchor="middle"
              fill="#1e293b"
              fontSize="32"
              fontWeight="900"
              letterSpacing="4"
            >
              {currentFloor === 1 ? "GROUND FLOOR (1F)" : "UPPER LEVEL (2F)"}
            </text>
          </g>

          {/* Bhabha Block ground-floor plan supplied by the user. The traced graph
              coordinates below align route segments with its red pathway. */}
          {currentFloor === 1 && (
            <image
              href="/assets/college-campus-layout.jpeg"
              x="0"
              y="0"
              width="1000"
              height="650"
              preserveAspectRatio="xMidYMid meet"
            />
          )}

          {/* Active Hazard Zone Overlays */}
          <g id="hazard-zones">
            {buildingData.zones.filter(z => z.floor === currentFloor).map(zone => {
              const hazard = zoneHazards[zone.id] || "none";
              if (hazard === "none") return null;

              // Compute bounding box for zone
              const zoneNodes = buildingData.nodes.filter(n => zone.nodeIds.includes(n.id));
              if (zoneNodes.length === 0) return null;

              const minX = Math.min(...zoneNodes.map(n => n.x - (n.roomWidth ? n.roomWidth / 2 : 30))) - 20;
              const maxX = Math.max(...zoneNodes.map(n => n.x + (n.roomWidth ? n.roomWidth / 2 : 30))) + 20;
              const minY = Math.min(...zoneNodes.map(n => n.y - (n.roomHeight ? n.roomHeight / 2 : 30))) - 20;
              const maxY = Math.max(...zoneNodes.map(n => n.y + (n.roomHeight ? n.roomHeight / 2 : 30))) + 20;

              const isHigh = hazard === "high";

              return (
                <g key={zone.id} className="animate-pulse">
                  <rect
                    x={minX}
                    y={minY}
                    width={maxX - minX}
                    height={maxY - minY}
                    rx="16"
                    fill={isHigh ? "url(#hazardFireGrad)" : "url(#hazardSmokeGrad)"}
                    stroke={isHigh ? "#ef4444" : "#f59e0b"}
                    strokeWidth={isHigh ? 3 : 2}
                    strokeDasharray={isHigh ? "8 4" : "4 2"}
                    filter="url(#hazardGlow)"
                  />
                  <g transform={`translate(${(minX + maxX) / 2}, ${minY + 20})`}>
                    <rect x="-65" y="-14" width="130" height="24" rx="12" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                    <text y="3" textAnchor="middle" fill="#fecaca" fontSize="10" fontWeight="bold">
                      {isHigh ? "🔥 FIRE / HAZARD ZONE" : "⚠️ SMOKE WARNING"}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Corridors / Hallway Paths (Edges) */}
          <g id="walkway-edges">
            {currentEdges.map(edge => {
              const u = buildingData.nodes.find(n => n.id === edge.from);
              const v = buildingData.nodes.find(n => n.id === edge.to);
              if (!u || !v) return null;

              const isBlocked = blockedEdges[edge.id] || edge.blocked;
              const hasHighHazard = edge.hazardLevel === "high";

              return (
                <g key={edge.id}>
                  {/* Hallway background corridor line */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={currentFloor === 1 ? "transparent" : "#1e293b"}
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={currentFloor === 1 ? "transparent" : (isBlocked || hasHighHazard ? "#7f1d1d" : "#334155")}
                    strokeWidth="4"
                    strokeDasharray={isBlocked ? "4 4" : "none"}
                    strokeLinecap="round"
                  />

                  {/* Blockage Cross Marker */}
                  {isBlocked && (
                    <g transform={`translate(${(u.x + v.x) / 2}, ${(u.y + v.y) / 2})`}>
                      <circle r="12" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
                      <line x1="-6" y1="-6" x2="6" y2="6" stroke="#f87171" strokeWidth="2" />
                      <line x1="-6" y1="6" x2="6" y2="-6" stroke="#f87171" strokeWidth="2" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Active Navigation / Evacuation Route Highlight */}
          <g id="active-route">
            {routeSegmentsOnFloor.map((seg, idx) => {
              if (seg.isVertical) {
                // Vertical transition marker on this floor
                return (
                  <g key={`vert-${idx}`} transform={`translate(${seg.from.x}, ${seg.from.y})`}>
                    <circle r="26" fill="none" stroke={isEmergency ? "#10b981" : "#38bdf8"} strokeWidth="3" className="animate-ping" />
                    <circle r="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#c7d2fe" fontSize="9" fontWeight="bold">
                      {seg.targetFloor === 1 ? "↓ 1F" : "↑ 2F"}
                    </text>
                  </g>
                );
              }

              const strokeColor = isEmergency ? "#10b981" : "#38bdf8";
              const glowFilter = isEmergency ? "url(#safePathGlow)" : "url(#normalPathGlow)";

              return (
                <g key={`route-${idx}`}>
                  {/* Thick route aura */}
                  <line
                    x1={seg.from.x}
                    y1={seg.from.y}
                    x2={seg.to.x}
                    y2={seg.to.y}
                    stroke={strokeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    filter={glowFilter}
                    opacity="0.8"
                  />
                  {/* Animated dashed marching line */}
                  <line
                    x1={seg.from.x}
                    y1={seg.from.y}
                    x2={seg.to.x}
                    y2={seg.to.y}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    className="safeway-path-dash"
                  />
                </g>
              );
            })}
          </g>

          {/* Rooms and Architectural Areas */}
          <g id="rooms-layer">
            {(currentFloor === 1 ? [] : currentNodes.filter(n => n.type === "room")).map(room => {
              const w = room.roomWidth || 100;
              const h = room.roomHeight || 80;
              const isSelected = selectedNode?.id === room.id;
              const isUserHere = userLocationNodeId === room.id;
              const isDestination = destinationNodeId === room.id;

              return (
                <g
                  key={room.id}
                  transform={`translate(${room.x - w / 2}, ${room.y - h / 2})`}
                  className="cursor-pointer transition-all duration-200 group"
                  onClick={() => setSelectedNode(room)}
                >
                  {/* Room Box Background */}
                  <rect
                    width={w}
                    height={h}
                    rx="8"
                    fill={
                      isUserHere
                        ? "#1e3a8a"
                        : isDestination
                        ? "#064e3b"
                        : isSelected
                        ? "#1e293b"
                        : "#0f172a"
                    }
                    stroke={
                      isUserHere
                        ? "#60a5fa"
                        : isDestination
                        ? "#34d399"
                        : isSelected
                        ? "#94a3b8"
                        : "#334155"
                    }
                    strokeWidth={isSelected || isUserHere || isDestination ? 2.5 : 1.5}
                    className="transition-colors group-hover:stroke-blue-400"
                  />

                  {/* Room Header Strip */}
                  <rect width={w} height="16" rx="6" fill="#1e293b" fillOpacity="0.7" />

                  {/* Room Text Label */}
                  <text
                    x={w / 2}
                    y="12"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="bold"
                    letterSpacing="0.5"
                  >
                    {room.name.toUpperCase()}
                  </text>

                  {/* Icon & ID */}
                  <text
                    x={w / 2}
                    y={h / 2 + 8}
                    textAnchor="middle"
                    fill={isUserHere ? "#93c5fd" : isDestination ? "#a7f3d0" : "#cbd5e1"}
                    fontSize="11"
                    fontWeight="600"
                  >
                    {room.name.split('(')[0].trim()}
                  </text>
                  <text
                    x={w / 2}
                    y={h - 8}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8"
                    fontWeight="500"
                  >
                    QR Checkpoint
                  </text>
                </g>
              );
            })}
          </g>

          {/* Stairs, Elevators, Entrances, and Exits */}
          <g id="special-nodes">
            {(currentFloor === 1 ? [] : currentNodes.filter(n => ['stair', 'lift', 'entrance', 'exit'].includes(n.type))).map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isUserHere = userLocationNodeId === node.id;
              const isDestination = destinationNodeId === node.id;
              const crowd = exitCrowdLevels[node.id] || "Low";
              const isClosed = exitStatuses?.[node.id] === false;

              let bgColor = "#1e293b";
              let strokeColor = "#475569";
              let badgeText = node.name;

              if (node.type === "lift") {
                bgColor = "#312e81";
                strokeColor = "#818cf8";
              } else if (node.type === "stair") {
                bgColor = "#4a044e";
                strokeColor = "#c084fc";
              } else if (node.type === "entrance") {
                bgColor = "#064e3b";
                strokeColor = "#34d399";
              } else if (node.type === "exit") {
                if (isClosed) {
                  bgColor = "#450a0a";
                  strokeColor = "#ef4444";
                } else if (crowd === "High") {
                  bgColor = "#78350f";
                  strokeColor = "#f59e0b";
                } else {
                  bgColor = "#064e3b";
                  strokeColor = "#10b981";
                }
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle
                    r="18"
                    fill={bgColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected || isUserHere ? 3 : 2}
                  />

                  {/* Center Node Symbol / Icon Indicator */}
                  <text y="4" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
                    {node.type === "lift" ? "🛗" : node.type === "stair" ? "🪜" : node.type === "exit" ? "🚪" : "🏢"}
                  </text>

                  {/* Name Label */}
                  <g transform="translate(0, 28)">
                    <rect x="-45" y="-9" width="90" height="18" rx="6" fill="#020617" fillOpacity="0.85" stroke={strokeColor} strokeWidth="1" />
                    <text y="4" textAnchor="middle" fill="#f1f5f9" fontSize="8" fontWeight="bold">
                      {node.name.length > 15 ? node.name.slice(0, 14) + '…' : node.name}
                    </text>
                  </g>

                  {/* Exit Crowd Level Badge */}
                  {node.type === "exit" && (
                    <g transform="translate(0, -24)">
                      <rect
                        x="-30"
                        y="-7"
                        width="60"
                        height="14"
                        rx="4"
                        fill={isClosed ? "#ef4444" : crowd === "High" ? "#ea580c" : crowd === "Medium" ? "#d97706" : "#059669"}
                      />
                      <text y="3" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                        {isClosed ? "CLOSED" : `${crowd.toUpperCase()} CROWD`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Interactive Corridor Junction Dots (Checkpoints) */}
          <g id="junctions-layer">
            {(currentFloor === 1 ? [] : currentNodes.filter(n => n.type === "junction")).map(junc => {
              const isSelected = selectedNode?.id === junc.id;
              const isUserHere = userLocationNodeId === junc.id;

              return (
                <g
                  key={junc.id}
                  transform={`translate(${junc.x}, ${junc.y})`}
                  className="cursor-pointer"
                  onClick={() => setSelectedNode(junc)}
                >
                  <circle
                    r={isUserHere ? 8 : 4}
                    fill={isUserHere ? "#38bdf8" : "#475569"}
                    stroke={isSelected ? "#ffffff" : "#1e293b"}
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </g>

          {/* User Location Beacon Marker (Pulse Ring) */}
          {userNode && userNode.floor === currentFloor && (
            <g transform={`translate(${userNode.x}, ${userNode.y})`} className="pointer-events-none">
              <circle r="36" fill="url(#userPulseGrad)" className="animate-ping" opacity="0.6" />
              <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="3" shadow="0 0 10px #38bdf8" />
              <circle r="5" fill="#ffffff" />
              <g transform="translate(0, -22)">
                <rect x="-35" y="-12" width="70" height="18" rx="6" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                <text y="1" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">YOU ARE HERE</text>
              </g>
            </g>
          )}

          {/* Destination Target Marker */}
          {destNode && destNode.floor === currentFloor && !isEmergency && (
            <g transform={`translate(${destNode.x}, ${destNode.y})`} className="pointer-events-none">
              <circle r="30" fill="url(#emergencyPulseGrad)" className="animate-ping" opacity="0.5" />
              <circle r="12" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
              <text y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">★</text>
            </g>
          )}
        </svg>
      </div>

      {/* Selected Node Quick Action Bottom Drawer / Modal */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 z-30 bg-slate-950/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                Floor {selectedNode.floor} • {selectedNode.type.toUpperCase()}
              </span>
              <h4 className="text-base font-bold text-white mt-1">{selectedNode.name}</h4>
              <p className="text-xs text-slate-400">
                Zone: <span className="text-slate-200 font-medium">{selectedNode.zone?.toUpperCase() || 'Common'}</span>
                {selectedNode.stepFree && <span className="ml-2 text-emerald-400">♿ Step-Free Accessible</span>}
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <i data-lucide="x" className="w-4 h-4"></i>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => {
                onSelectNodeAsLocation(selectedNode.id);
                setSelectedNode(null);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition"
            >
              <i data-lucide="qr-code" className="w-3.5 h-3.5"></i>
              Scan QR Here
            </button>
            <button
              onClick={() => {
                onSelectNodeAsDestination(selectedNode.id);
                setSelectedNode(null);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <i data-lucide="navigation" className="w-3.5 h-3.5 text-emerald-400"></i>
              Route Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
