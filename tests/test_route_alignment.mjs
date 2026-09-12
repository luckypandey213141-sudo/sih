import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { INDOOR_ROUTE_NETWORKS as networks } from '../data/indoorRouteNetworks.js';
import { INDOOR_ROUTE_COSTS } from '../data/indoorRouteCosts.js';
for (const [id, network] of Object.entries(networks)) network.costs=INDOOR_ROUTE_COSTS[id];
process.chdir((await import('node:url')).fileURLToPath(new URL('..', import.meta.url)));
function load(file) {
 const s=fs.readFileSync(file,'utf8'); const ctx={window:{SafeWay:{INDOOR_ROUTE_NETWORKS:networks}},SafeWay:{INDOOR_ROUTE_NETWORKS:networks}};vm.createContext(ctx);
 vm.runInContext(s.slice(s.indexOf('    function getControlId'),s.indexOf('    let audioCtx'))+'\nthis.api={MAP_PLANS,ROOM_ROUTE_TARGETS,shortestPathOnIndoorNetwork,computeFloorPath,buildMultiFloorStagePipeline};',ctx);
 return ctx.api;
}
const current=load('mobile.html');
// Independent Bellman-Ford distance oracle: no priority queue or alignment costs.
const referenceCache = new Map();
function referenceDistance(net, start, end) {
 const cacheKey = JSON.stringify([net.cells[0], net.cells.length, start]);
 let distances = referenceCache.get(cacheKey);
 const pointKey = p => ((p[0]-net.step/2)/net.step) + ',' + ((p[1]-net.step/2)/net.step);
 if (!distances) {
  const cells = new Set(net.cells.map(c=>c.join(','))), edges=[];
  for(const [x,y] of net.cells) for(const [dx,dy] of [[0,1],[1,0],[1,1],[1,-1]]) {
   const a=x+','+y, b=(x+dx)+','+(y+dy);
   if(cells.has(b) && (!dx || !dy || (cells.has((x+dx)+','+y) && cells.has(x+','+(y+dy))))) edges.push([a,b,Math.hypot(dx,dy)*net.step]);
  }
  distances=new Map([[pointKey(start),0]]);
  let changed=true;
  while(changed){changed=false;for(const [a,b,w] of edges){
   const da=distances.get(a)??Infinity,db=distances.get(b)??Infinity;
   if(da+w<db-1e-8){distances.set(b,da+w);changed=true;}
   if(db+w<da-1e-8){distances.set(a,db+w);changed=true;}
  }}
  referenceCache.set(cacheKey,distances);
 }
 return distances.get(pointKey(end));
}
let results=[],count=0;
for(const plan of current.MAP_PLANS.filter(p=>p.id!=='campus')) {
 const entries=Object.entries(current.ROOM_ROUTE_TARGETS[plan.id]);
 const net=networks[plan.id], step=net.step, keys=new Set(net.cells.map(c=>c.join(',')));
 let maxSnap=0, offNetworkAnchors=0, pairs=0;
 for(const [name,p] of entries) {
  const dist=Math.min(...net.cells.map(c=>Math.hypot(c[0]*step+step/2-p[0],c[1]*step+step/2-p[1])));
  maxSnap=Math.max(maxSnap,dist);if(dist>step)offNetworkAnchors++;
  for(const [other,q] of entries) {
   const r=current.shortestPathOnIndoorNetwork(net,p,q);assert(r,`${plan.id} ${name} -> ${other}`);
   assert(Math.abs(r.distance-referenceDistance(net,r.points[0],r.points[r.points.length-1]))<1e-6, plan.id+' must minimize geometric distance');
   for(const pt of r.points)assert(keys.has(`${(pt[0]-step/2)/step},${(pt[1]-step/2)/step}`));
   for(let i=1;i<r.points.length;i++) {
    const a=r.points[i-1],b=r.points[i],n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))/step;
    for(let j=0;j<=n;j++){const x=Math.round((a[0]+(b[0]-a[0])*j/(n||1)-step/2)/step),y=Math.round((a[1]+(b[1]-a[1])*j/(n||1)-step/2)/step);assert(keys.has(`${x},${y}`));}
   }
   const stages=current.buildMultiFloorStagePipeline({activeOriginLocation:{name,room:name,mapId:plan.id,point:p},activeDestLocation:{name:other,room:other,mapId:plan.id,point:q},liveState:{emergencyActive:false}});
   assert.equal(stages.length,1);assert.equal(stages[0].mapId,plan.id);
   assert.equal(JSON.stringify(stages[0].startPoint),JSON.stringify(stages[0].points[0]));
   pairs++;count++;
  }
 }
 results.push({map:plan.id,rooms:entries.length,pairs,offNetworkAnchors,maxSnap:Math.round(maxSnap),status:'pass'});
}
assert.equal(current.shortestPathOnIndoorNetwork({step:8,cells:[[0,0],[1,1]]},[4,4],[12,12]),null,'no diagonal corner cutting');
assert.equal(current.computeFloorPath('missing',[0,0],[100,100]).length,0);

console.log(JSON.stringify({count,results},null,2));


// A faint direct path must beat a longer, strongly colored detour.
const detour = {step:8,cells:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],costs:{'1,0':10000}};
const short=current.shortestPathOnIndoorNetwork(detour,[4,4],[20,4]);
assert.equal(short.distance,16);
console.log('Shortest-distance oracle: all 1,500 pairs and high-penalty detour regression passed.');
const html=fs.readFileSync('mobile.html','utf8');
function campusRenderer(id){const start=html.indexOf('<g id="'+id+'">');return html.slice(start,html.indexOf('</g>',start)).replaceAll('focus-seg-','route-seg-').replaceAll('focus-campus-route','active-campus-route');}
assert.equal(campusRenderer('focus-campus-route'),campusRenderer('active-campus-route'),'focus map must use exactly the same bends as normal map');
console.log('PASS: focus and normal campus maps use identical route geometry.');
