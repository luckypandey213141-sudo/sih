import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const files=['test_pathfinder.js','test_qr_resolution.js','test_route_alignment.mjs','test_campus_shortest.mjs','test_emergency_maps.mjs','test_admin_controls.mjs','test_evacuation_matrix.mjs','test_realtime_client.mjs','test_realtime_server.mjs','test_motion_integration.mjs','test_nearest_destination.mjs'];
for(const file of files){const result=spawnSync(process.execPath,[fileURLToPath(new URL(file,import.meta.url))],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
console.log('All 11 test suites passed.');
