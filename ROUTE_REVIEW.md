## Emergency map parity update

Normal and emergency campus calculations now share the corrected polyline distances and graph connections. Indoor network alignment was already shared. Available stairs are compared using the combined floor approach distance in both modes; emergency crowd penalties and existing hazard/blockage exclusions remain. Emergency stages target the safe destination returned by the evacuation engine rather than continuing to the normal destination. No reachable safe destination produces an empty route with an assistance message.

Validation: `node tests/test_emergency_maps.mjs` passes simulated geometry, fire, blocked-edge, closed-exit, Step-Free campus routing, alternate-stair, destination, and no-route cases. The 22 existing pathfinder assertions pass. The page loads without captured browser errors. These are simulated checks; prior room-coordinate and building-transition limitations still apply, and no physical emergency or sensor trial was performed.

## Latest campus-trip correction

The Drawing Lab to Garden trip was also affected by inconsistent campus edge distances, missing direct connections, and a fixed first-choice staircase. Normal campus routes now compare drawn polyline lengths at a common approximate scale. Added the central bend beside Bhabha and the northwest garden stair approach visible in the plan. Normal walking chooses the shortest combined floor approach to the selected exit among available stair options. Step-Free mode excludes the new garden stairs, and blockage tests select another path. The stair/exit labels and coordinates are still inherited from the existing data and require the earlier mapping review; this does not establish globally optimal routing through every possible building exit.

The actual campus regression now skips the playground, east-campus detour, and Bhabha south loop. `node tests/test_campus_shortest.mjs` checks that trip plus Step-Free and blocked-stair alternatives. Existing 22 pathfinder assertions still pass. Distances displayed by this prototype remain estimates and are not a site survey. The campus audit image documents the original graph, before this correction.

# SafeWay map and route audit

Reviewed the repository copy supplied in this task: 13 floor-plan images and the campus image. The deployed Vercel revision was not verified. Changes are confined to a separate local review copy; GitHub, the deployment, and the earlier local app were not edited.

## Local changes

- Mobile indoor routes snap to the stored pathway network rather than drawing straight connectors to approximate room coordinates.
- Route selection minimizes geometric distance on the stored network. Red-path alignment only breaks exact distance ties; it cannot justify a longer path. Diagonal corner cutting outside the network is rejected.
- Normal trips between two locations on the same floor stay on that floor.
- Indoor start/end badges and step movement use the same snapped polyline as the displayed route.
- Missing indoor networks no longer produce invented straight corridor paths.

The UI controls, map images, emergency and accessibility logic, authentication, sensors, and server files were retained. No full physical-sensor or emergency-system validation was performed.

## Verification

1,500 ordered combinations of explicitly mapped floor locations passed route-network containment, same-floor stage checks, and independent Bellman-Ford shortest-distance checks, including same-location cases. A regression check confirms a faint short path wins over a strongly colored long detour. All 22 existing pathfinder assertions passed. Browser loaded the mobile page with no captured errors; Step (+1) changed the step counter. These checks establish code behavior, not the correctness of each room/exit coordinate or real-world safety.

| Floor plan | Explicit location coordinates | Route combinations | Original anchors >8 SVG units from network | Largest original offset |
|---|---:|---:|---:|---:|
| ramanujan-basement | 10 | 100 | 7 | 80 |
| ramanujan-ground | 18 | 324 | 16 | 85 |
| ramanujan-first | 10 | 100 | 10 | 72 |
| bhabha-basement | 6 | 36 | 5 | 99 |
| bhabha-ground | 13 | 169 | 5 | 39 |
| bhabha-first | 8 | 64 | 4 | 91 |
| kalpana-basement | 7 | 49 | 5 | 125 |
| kalpana-ground | 13 | 169 | 4 | 68 |
| kalpana-first | 8 | 64 | 3 | 67 |
| raman-ground | 12 | 144 | 5 | 60 |
| raman-first | 6 | 36 | 6 | 91 |
| aryabhatta-basement | 7 | 49 | 6 | 101 |
| aryabhatta-ground | 14 | 196 | 14 | 87 |

## Unresolved findings

Room/doorway mapping remains incomplete. Snapping to the closest marked line cannot establish which doorway a room label actually refers to. Some existing points are near a different room or corridor. In particular, the Ramanujan ground-floor drawing repeats R2 and R3 on its south and east sides; one menu label cannot distinguish both locations without a mapping decision. Floor-plan arrows were checked visually, but their direction is not encoded by the existing bidirectional indoor networks.

These menu labels lack explicit coordinates:

- bhabha-first: Boys W/C, Girls W/C, Entry / Exit 2.
- kalpana-basement: Stair 1, Stair 2.
- kalpana-first: Store, Boys W/C, Girls W/C.
- raman-first: Boys W/C, Girls W/C, Entry / Exit 2.
- aryabhatta-basement: Room, Stairs 2.

Campus: overlaid every floor-1 graph edge on the campus image. Several lines depart from the drawn paths. The exit-2 to assembly-b edge passes through the legend and the Bhabha footprint. Other routes use diagonals instead of the marked bends or extend into facilities without a confirmed entrance. Campus geometry was left unchanged pending authoritative access-point mapping; see Campus-Route-Review.png (pink lines are existing graph edges). Do not treat the campus map as corrected.

The multi-floor pipeline also has existing destination-transition limitations for different floors within one block; this review fixes normal same-floor trips only. Existing hardcoded campus fallback routes remain a separate issue. The desktop renderer has not received the mobile alignment patch.

## Run the separate copy

Extract SafeWay-Route-Review.zip, open the SafeWay folder, and run `node local_server.js`. Open http://localhost:3000/mobile.html (or set PORT to another free port). Run `node tests/test_route_alignment.mjs` and `node tests/test_pathfinder.js` for the included checks.

Current local review: http://localhost:3002/mobile.html.

This is an audit and partial route correction, not a fully remapped release. Completing the remaining alignment requires assigning each ambiguous room label and campus access point to its actual doorway/path in the supplied drawings.
