# SafeWay repair results — 5 September 2026

The separate local copy now contains repairs for the reproduced emergency-state, admin-control, routing, SOS, and sensor defects from both audits. GitHub and Vercel have not been updated.

Preview: http://localhost:3005/mobile.html
Admin: http://localhost:3005/admin/index.html
The older preview on port 3002 is not the repaired server. Sign in again if the preview requests it after the server restart.

## Repairs

- Local login and API use the same signed session format. Logout revocation is persisted, including for shared storage.
- Controls send field-level patches and display only acknowledged state. Rejected saves remain visible as errors; polling cannot silently turn an acknowledged emergency off. Polling and cross-tab updates reject older versions.
- Presence and admin updates use serialized local transactions or atomic Redis compare-and-set transactions. Writes are awaited. Local copies have separate storage namespaces; Vercel requires shared KV instead of silently using temporary files.
- Admin corridor controls affect the corresponding stored indoor paths. Campus corridor controls use actual graph edges. Hazards, smoke, crowds and canonical door keys are consumed by navigation. Unmapped controls are labelled and disabled instead of affecting arbitrary unrelated routes.
- All closed exits are excluded from evacuation traversal. Fallback destinations are compared by cost; an unreachable assembly leg cannot be advertised as a completed evacuation route.
- Mobile same-block trips include the requested destination floor. Unavailable stairs, all blocked exits, missing room coordinates and unverified step-free floor connections produce an unavailable route, not fabricated guidance. A lift-labelled location is no longer treated as an invented staircase.
- Emergency reroutes reset stage progress. Empty routes cannot advance or announce arrival. Arrival names use the actual route destination. Desktop indoor routing now also uses the corrected network algorithm and live constraints without a static fallback line.
- SOS waits for acknowledgement, preserves basement floor 0, and reports the current mobile stage location. The reporting device or an administrator must resolve an incident; another device cannot overwrite it. Desktop cancellation uses the returned incident ID.
- Sensor readings are included in shared state and update hazards/crowds. Admin simulation targets the selected sensor's area. Clearing a sensor reading does not automatically stand down the alarm. Unreceived readings no longer get fabricated current timestamps.
- Physical Sensors uses the accelerometer/compass tracker; pause and unmount remove listeners. Distance estimates derive from route geometry and are explicitly approximate.

## Verification

All 10 packaged suites passed using `node tests/run_all.mjs`:

| Check | Result |
|---|---|
| Core pathfinder | 22 assertions passed |
| QR resolver | 50 assertions passed; dictionary contains 182 checkpoints |
| Indoor shortest paths | 1,500 ordered coordinate pairs passed against an independent distance oracle |
| Campus and mobile emergency regressions | Passed |
| Admin indoor controls | 98 mapped corridors × 3 states; 132 hazard locations; 11 egress doors; destination-floor and step-free guards passed |
| Evacuation combinations | 5,702 cases; zero blocked-edge, closed-exit, high-hazard, accessibility, fire-lift or unsafe-endpoint violations |
| Client synchronization | Acknowledged patches, rejected saves, SOS failures, sensor payloads, floor 0 and equal-version content changes passed |
| Isolated server | 30 concurrent requests all acknowledged; alarm retained past 6 seconds; stale snapshots rejected; SOS ownership, sensors and logout passed |
| Motion integration | Step/heading delivery, pause, re-enable, unmount cleanup and polyline interpolation passed |

Browser checks confirmed mobile, admin and desktop rendering, mapped/unmapped admin labels, and the step-free unavailable state. Test emergencies and incidents used isolated test storage. The server regression starts and stops its own process.

## Remaining map and deployment limits

These are not established by passing software tests:

- Raman basement and Aryabhatta first-floor plans are still missing.
- Several room coordinates and physical exits require confirmation. In particular, repeated R2/R3 labels on the Ramanujan ground plan are ambiguous. Existing mapped anchors still snap to the stored walkway network.
- Directional arrows are not fully encoded as one-way links. Shortest-path tests cover the stored bidirectional networks, not a fully verified physical building model.
- No verified lift connection was supplied for the mobile multi-floor planner; step-free floor changes therefore request assistance. Tests do not establish a globally shortest journey over every possible physical entrance and floor connection.
- The approximate pixel-to-metre scale has not been measured on site. Real phones, ESP32 hardware, camera scans, microphone capture and siren audibility still need device checks.
- Vercel credentials and storage have not been inspected or tested. Before publishing, configure `SAFEWAY_ADMIN_PASSWORD`, `SESSION_SECRET`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `SAFEWAY_SENSOR_SECRET` for hardware ingestion. Keep the session secret stable across instances. The existing shared realtime KV key is retained.

The source package includes runnable code, maps and regression tests. Historical backups, local secrets, runtime state and audit scratch files are excluded. Earlier output ZIPs and patches predate these repairs; use SafeWay-Repaired-Source.zip for this revision.


## Emergency destination update
Emergency routing compares direct walking-path distances to Main Gate, Gate No. 2, Playground and Back Yard. It chooses the closest reachable destination; a gate wins an exact-distance tie. Closed gates, blocked paths and high hazards remain excluded. Gate routes terminate at the gate, without adding a subsequent assembly-area leg. Ten focused selection tests passed, along with the core pathfinder and mobile emergency regressions. Indoor users retain their mapped approach to the selected building exit; map-distance estimates retain the limitations above.
