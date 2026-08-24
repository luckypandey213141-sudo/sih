# 🛡️ AegisPath v3.2.0 — Stable Checkpoint & Backup

**Checkpoint Date:** August 24, 2026  
**Git Tag:** `v3.2.0-stable`  
**Git Backup Branch:** `backup-v3.2.0-stable`  
**Local Archive Path:** `_backups/v3.2.0_stable_backup/`

---

## 📦 Features Preserved in this Backup:
1. **Desktop & PC Version (`index.html`)**:
   - High-contrast Universal Theme Switcher (`☀️ Light / 🌙 Dark`) with localStorage persistence.
   - Interactive SVG Floor Plan Map with multi-level zoom, pan, and live user tracking.
   - Turn-by-Turn Sequential Direction drawer with floor-switch prompts.
   - SOS Distress beacon transmitter with emergency modal.
   - Dynamic crowd-aware Dijkstra & A* evacuation engine avoiding hazardous fire corridors.
   - Direct Location Checkpoint dropdowns.

2. **Mobile Version (`mobile.html`)**:
   - `🛡️ Admin` Console quick-access shortcut in the top header.
   - Prominent **Critical Emergency Evacuation Banner** (Full-width pulsating red interface with bouncing siren icon).
   - Continuous **850ms Audio Siren Pulse** & Speech Synthesis voice announcement on emergency trigger.
   - 1.4s calibrated natural human walking stride auto-walk + `1x / 2x` speed mode.
   - Physical Device Orientation compass sensors.
   - Pristine high-contrast font colors in Light Mode.

3. **Admin Security Console (`admin/index.html`)**:
   - Real-time IoT sensor telemetry & manual fire/crowd simulation dashboard.
   - Instant "TRIGGER EMERGENCY" and "STAND DOWN" broadcast controls via Firebase RTDB.

---

## ⚡ How to Restore This Version Anytime:

### Option 1: Using Git (Recommended)
```bash
# Restore working directory directly from the backup tag:
git checkout v3.2.0-stable -- .
git commit -m "Restored to v3.2.0-stable checkpoint"
git push origin main
```

### Option 2: Switching to the Backup Branch
```bash
git checkout backup-v3.2.0-stable
```

### Option 3: From the Local Archive Directory
Copy the contents of `_backups/v3.2.0_stable_backup/` directly into the root folder `c:/SIH_LATEST_V3/`.
