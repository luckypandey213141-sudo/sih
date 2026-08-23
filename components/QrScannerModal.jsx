/**
 * SafeWay - Simulated QR Checkpoint Scanner Modal
 * Provides interactive visual checkpoint scanning simulation.
 */

export function QrScannerModal({
  isOpen,
  onClose,
  buildingData,
  onSelectCheckpoint,
  currentLocationId
}) {
  if (!isOpen) return null;

  const quickPresets = [
    { id: "ent-main", name: "Main Entrance (1F)", category: "Entrance" },
    { id: "lobby", name: "Grand Lobby (1F)", category: "Lobby" },
    { id: "lab-101", name: "Lab 101 Physics (1F)", category: "Lab" },
    { id: "cafeteria", name: "Cafeteria (1F)", category: "Dining" },
    { id: "room-202", name: "Room 202 Lab (2F)", category: "Classroom" },
    { id: "room-204", name: "Room 204 Faculty Lounge (2F)", category: "Lounge" },
    { id: "library", name: "Central Library (2F)", category: "Study" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <i data-lucide="qr-code" className="w-5 h-5"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Simulate QR Checkpoint Scan</h3>
              <p className="text-xs text-slate-400">Position user at any node inside the virtual facility</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        {/* Viewfinder Mockup */}
        <div className="relative w-full h-40 bg-slate-950 rounded-2xl border-2 border-dashed border-blue-500/40 flex flex-col items-center justify-center overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
          {/* Laser scanline animation */}
          <div className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-md shadow-blue-400/80 animate-pulse transition-all"></div>
          
          <div className="text-center space-y-1 z-10">
            <i data-lucide="scan" className="w-8 h-8 text-blue-400 mx-auto animate-pulse"></i>
            <span className="text-xs font-semibold text-slate-200 block">QR Camera Checkpoint Simulator</span>
            <span className="text-[11px] text-slate-400">Select any checkpoint node below to simulate immediate scan</span>
          </div>
        </div>

        {/* Quick Checkpoint Presets */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Popular Checkpoints:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickPresets.map(preset => {
              const isCurrent = currentLocationId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectCheckpoint(preset.id);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs transition ${
                    isCurrent
                      ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-600 text-slate-200"
                  }`}
                >
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">{preset.category}</div>
                  <div className="font-bold truncate mt-0.5">{preset.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Checkpoint Dropdown Picker */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Or select from all building checkpoints:
          </label>
          <select
            value={currentLocationId}
            onChange={(e) => {
              onSelectCheckpoint(e.target.value);
              onClose();
            }}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 font-medium"
          >
            <optgroup label="Floor 1 (Ground Floor)">
              {buildingData.nodes.filter(n => n.floor === 1).map(node => (
                <option key={node.id} value={node.id}>
                  Floor 1: {node.name} ({node.type})
                </option>
              ))}
            </optgroup>
            <optgroup label="Floor 2 (Upper Floor)">
              {buildingData.nodes.filter(n => n.floor === 2).map(node => (
                <option key={node.id} value={node.id}>
                  Floor 2: {node.name} ({node.type})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
}
