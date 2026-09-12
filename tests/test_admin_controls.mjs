import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import * as controls from '../data/adminRouteControls.js';
import {INDOOR_ROUTE_NETWORKS} from '../data/indoorRouteNetworks.js';
import {INITIAL_BUILDING_DATA as bData} from '../data/buildingGraph.js';
const source=fs.readFileSync(new URL('../mobile.html',import.meta.url),'utf8');const ctx={window:{SafeWay:{INDOOR_ROUTE_NETWORKS},SafeWayRouteControls:controls}};vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('    function campusDistanceEdges'),source.indexOf('    let audioCtx'))+';this.api={buildMultiFloorStagePipeline,selectBestStairs,selectBestEgressDoor,constrainedNetwork,shortestPathOnIndoorNetwork,BLOCK_STAIRS_OPTIONS,BLOCK_EGRESS_OPTIONS,ROOM_ROUTE_TARGETS};',ctx);const api=ctx.api;let corridors=0,hazards=0,doors=0;
for(const [map,net] of Object.entries(INDOOR_ROUTE_NETWORKS)){
 const names=controls.ADMIN_FACILITIES[map]||[],points=controls.ROOM_TARGETS[map]||{};
 for(let i=0;i<names.length-1;i++){
  const p=points[names[i]],q=points[names[i+1]];if(!p||!q)continue;
  const id=controls.controlId('path',map,names[i]+'-'+names[i+1]);const closed=api.constrainedNetwork(map,net,{blockedEdges:{[id]:true}});
  assert(closed.blocked.size>0,map+' '+id);assert.equal(api.shortestPathOnIndoorNetwork(closed,p,q),null,'closed corridor cannot be traversed');
  for(const level of ['Medium','High']){const crowded=api.constrainedNetwork(map,net,{corridorCrowds:{[id]:level}});assert(Object.values(crowded.penalties).some(p=>p>1));}
  corridors++;
 }
 for(const [name,p] of Object.entries(points)){
  const id=controls.controlId('area',map,name);const dangerous=api.constrainedNetwork(map,net,{hazards:{[id]:'high'}});assert.equal(api.shortestPathOnIndoorNetwork(dangerous,p,p),null);hazards++;
 }
 for(const d of api.BLOCK_EGRESS_OPTIONS[map]||[]){const id=controls.controlId('door',map,d.id);const selected=api.selectBestEgressDoor(map,{exits:{[id]:{isOpen:false}}});assert(selected.isTrapped||selected.id!==d.id);doors++;}
 const allClosed=Object.fromEntries((api.BLOCK_EGRESS_OPTIONS[map]||[]).map(d=>[controls.controlId('door',map,d.id),{isOpen:false}]));
 if(Object.keys(allClosed).length)assert(api.selectBestEgressDoor(map,{exits:allClosed}).isTrapped);
 const stairDoors=Object.fromEntries((api.BLOCK_STAIRS_OPTIONS[map]||[]).map(d=>[controls.controlId('door',map,d.name||d.id),{isOpen:false}]));
 if(Object.keys(stairDoors).length)assert.equal(api.selectBestStairs(map,{exits:stairDoors}),null);
}
const args={activeOriginLocation:{mapId:'ramanujan-first',name:'LT 1',point:[260,400]},activeDestLocation:{mapId:'ramanujan-basement',name:'Lab 1',point:[600,275]},liveState:{},bData};
const pipeline=api.buildMultiFloorStagePipeline(args);assert.equal(pipeline.at(-1).mapId,'ramanujan-basement');assert.equal(pipeline.at(-1).targetLabel,'Lab 1');assert(pipeline.every(s=>s.points.length));
assert.equal(api.buildMultiFloorStagePipeline({...args,accessibilityMode:true})[0].stageKey,'no-safe-route');
console.log(JSON.stringify({result:'PASS',mappedCorridors: corridors,corridorStates: corridors*3,hazardLocations:hazards,egressDoors:doors,multiFloorDestination:true,stepFreeGuard:true}));
