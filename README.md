# SafeWay V3 — Smart Indoor Navigation & Crowd-Aware Emergency Evacuation System
> **Smart India Hackathon (SIH 2026) Hardware + Software Prototype**  
> *A Real-Time IoT Hazard Detection, Multi-Tier Crowd-Density Monitoring, and Life-Safety Evacuation Platform for Large Complex Buildings.*

---

## 🧭 Executive Summary

**SafeWay** is an intelligent indoor guidance and emergency evacuation system designed for high-occupancy and unfamiliar environments such as university campuses, hospitals, shopping malls, airports, railway hubs, industrial facilities, and public stadiums.

### The Problem:
* In everyday conditions, visitors struggle to navigate large multi-floor facilities without reliable indoor GPS.
* In emergencies (fires, smoke spread, stampedes, blockages), people panic and rush toward the closest exit, which often leads directly into fire zones or fatal stampedes at congested doorways.

### The SafeWay Solution:
SafeWay operates across two seamless modes:
1. **Normal Navigation Mode:** Turn-by-turn shortest-path indoor routing across multiple floors via Dijkstra / A*, complete with step-free accessibility support.
2. **Emergency Evacuation Mode:** Automatically takes over in hazards to generate the **safest reachable evacuation path**, balancing smoke penalties, fire blockages, multi-tier crowd density (corridors, zones, exits), and life-safety elevator policies.

---

## 🏛️ System Architecture

```
  [ESP32 IoT Sensor Nodes]              [Security Operations Center]
  ├── MQ-2 Smoke Sensor                 └── /admin/index.html Console
  ├── Optical Flame Sensor                         │
  └── Dual IR Break-Beam Counters                  │
               │                                   │
               ▼ (Wi-Fi / REST / RTDB)             │
   ┌───────────────────────────────────────────────┴───────────────────┐
   │                  Firebase Realtime Database /                     │
   │               SafeWay Local Broadcast Gateway Bus                 │
   └───────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────────┐
   │               SafeWay V3 Dynamic Safety Cost Engine               │
   │                                                                   │
   │  Cost(e) = Distance(e) + Pblocked + Phazard + Pcrowd + Paccessibility │
   └───────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────────┐
   │                       User Application                            │
   │                 (React 18 + SVG 2D Map + Audio)                   │
   │                                                                   │
   │  Sequential Evacuation Flow:                                      │
   │  [USER] ──► [SAFE INTERNAL CORRIDOR] ──► [EXIT] ──► [ASSEMBLY]   │
   └───────────────────────────────────────────────────────────────────┘
```

---

## 📐 Mathematical Cost Formulation

The traversal cost for each edge $e$ in the building graph is computed dynamically:

$$\text{Cost}(e) = \text{Distance}(e) + P_{\text{blocked}} + P_{\text{hazard}} + P_{\text{crowd}} + P_{\text{accessibility}} + P_{\text{policy}}$$

### Penalty Rules:
| Condition | Penalty Value | Operational Rationale |
| :--- | :--- | :--- |
| **Physically Blocked** | $+\infty$ | Door locked or structural collapse |
| **Active Fire (High Hazard)** | $+\infty$ | Impassable life-safety danger |
| **Smoke / Heat (Low Hazard)** | $+50$ | Heavily penalized detour |
| **High Crowd Congestion** | $+60$ | Diverts flow away from bottleneck stampedes |
| **Medium Crowd Congestion**| $+20$ | Moderate flow discouragement |
| **Low Crowd** | $+0$ | Clear unobstructed movement |
| **Accessibility Violation**| $+\infty$ | Strictly prevents routing wheelchair users down stairs |
| **Elevator in Active Fire**| $+\infty$ | Complies with NFPA building codes to prevent smoke shaft entrapment |

---

## 🚀 Quick Start Guide

### Admin Security Console login

Opening **Admin Security Console** from the user interface requires server-validated credentials.

- Local-demo username: `admin`
- Local-demo passcode: `SafeWay-Demo-2026`

Override the credentials before running `start.bat` if desired:

```bat
set SAFEWAY_ADMIN_USER=your-admin-name
set SAFEWAY_ADMIN_PASSWORD=your-local-passcode
call start.bat
```

The server stores random sessions in memory and uses an HTTP-only, `SameSite=Strict` cookie. Signing out or restarting the server invalidates access. This is a local hackathon-demo gate, not production authentication; do not expose it directly to the public internet.

### 1. Installation & Dependencies
SafeWay uses standard Node.js without heavy native compilation requirements:
```bash
# Clone or navigate to SafeWay_V3 directory
cd SafeWay_V3

# Verify and execute tests
npm test
```

### 2. Launch Local Server
```bash
npm start
```
* **User Application:** [http://localhost:3000/](http://localhost:3000/)
* **Security Admin Console:** [http://localhost:3000/admin/](http://localhost:3000/admin/)
* **IoT Sensor Ingestion API:** `POST http://localhost:3000/api/sensor`

---

## 🧪 Automated Verification Suite

SafeWay includes an automated test runner (`tests/test_pathfinder.js`) testing all 8 SIH evaluation scenarios:

```bash
npm test
```

### Verified Test Cases:
* **Scenario 1:** Main Entrance (1F) $\rightarrow$ Room 204 (2F) shortest path navigation.
* **Scenario 2:** Normal multi-floor vertical navigation via Central Elevator.
* **Scenario 3:** Fire in Zone B $\rightarrow$ Exit 1 rejected, safe detour to Exit 3 / Exit 2.
* **Scenario 4:** Multi-tier crowd balancing diverting flow away from congested Exit 1.
* **Scenario 5:** Closed / blocked exit door fallback.
* **Scenario 6:** Strict sequential evacuation (`User -> Exit Door -> Outdoor Assembly Area`).
* **Scenario 7:** Step-free wheelchair accessibility routing (zero stair edges).
* **Scenario 8:** Fire emergency elevator lockout & designated Area of Rescue Assistance routing.

---

## 🔌 Hardware & IoT Sensor Setup (ESP32)

The firmware is located in `hardware/esp32/SafeWaySensorNode.ino`.

### Hardware Components:
1. **ESP32 Dev Module (WROOM-32)**
2. **MQ-2 Smoke / Gas Sensor** (Analog `GPIO 34`)
3. **Infrared Flame Detection Sensor** (Digital `GPIO 35`)
4. **Dual IR Break-Beam Sensors** (Directional Occupancy Counting):
   - Entry Beam: `GPIO 32`
   - Exit Beam: `GPIO 33`
5. **Status LED / Alarm Buzzer**: `GPIO 2`

### Directional Occupancy Counting Logic:
* $\text{Beam 1 broken} \rightarrow \text{Beam 2 broken} = \text{Person Entered (+1)}$
* $\text{Beam 2 broken} \rightarrow \text{Beam 1 broken} = \text{Person Exited (-1)}$
* **Thresholds:**
  - $0 - 7$ occupants $\rightarrow$ `Low Crowd`
  - $8 - 19$ occupants $\rightarrow$ `Medium Crowd`
  - $20+$ occupants $\rightarrow$ `High Crowd`

---

## 📱 QR-Based Indoor Positioning

Because indoor GPS is blocked by concrete structures, SafeWay uses indoor QR checkpoints:
* `SW-ENT-MAIN`: Main Entrance (1F)
* `SW-LOBBY`: Grand Lobby (1F)
* `SW-RECEPTION`: Reception Desk (1F)
* `SW-CAFE`: Cafeteria (1F)
* `SW-LAB101`: Science Lab 101 (1F)
* `SW-ROOM201`: Room 201 Lecture Hall (2F)
* `SW-ROOM204`: Room 204 Faculty Lounge (2F)
* `SW-LIBRARY`: Central Library (2F)

---

## 🎭 SIH 6-Stage Live Presentation Script

1. **Stage 1 (Normal Mode):** User at `SW-ROOM204` searches for `Main Entrance`. SafeWay calculates 73m shortest path via Elevator.
2. **Stage 2 (Alarm Trigger):** Security activates Emergency. User app instantly turns into red evacuation mode with pulsing siren.
3. **Stage 3 (IoT Fire Detection):** ESP32 in Zone B detects smoke. SafeWay automatically removes Zone B paths and closes Exit 1.
4. **Stage 4 (Crowd Surge):** Exit 2 occupancy surges to High Crowd (+60 penalty).
5. **Stage 5 (Smart Rerouting):** SafeWay evaluates all exits, rejects Exit 1 (fire) and Exit 2 (crowd), routing user safely to Exit 3.
6. **Stage 6 (Safe Evacuation):** User follows path through Exit 3 to Assembly Area B.

---

## ⚠️ Important Safety & Compliance Disclaimer

> **Engineering Prototype Notice:**  
> SafeWay V3 is an engineering proof-of-concept developed for demonstration and hackathon evaluation purposes. In real-world facilities:
> 1. Official physical alarms, public address systems, and emergency personnel instructions always take precedence.
> 2. Life-safety deployment requires certified hardware, sensor redundancy, tamper-proofing, and strict compliance with local building and fire safety codes (e.g., NFPA / National Building Code).
> 3. The platform is designed to assist and complement—never replace—trained emergency response personnel.
