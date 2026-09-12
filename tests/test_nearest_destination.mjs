import assert from 'node:assert/strict';
import {findSafestEvacuationPath} from '../utils/pathfinder.js';
const nodes=['start','exit-1','exit-2','assembly-a','assembly-b'].map(id=>({id,name:id,floor:1,zone:id,type:id.startsWith('exit')?'exit':id.startsWith('assembly')?'assembly':'room'}));
const exits=nodes.filter(n=>n.type==='exit').map(n=>({...n,isOpen:true})),areas=nodes.filter(n=>n.type==='assembly');
function run(lengths,extra={}){const edges=lengths.map((distance,i)=>({id:'edge-'+i,from:'start',to:nodes[i+1].id,distance,stepFree:true,...(extra.edges?.[i]||{})}));return findSafestEvacuationPath('start',nodes,edges,extra.exits||exits,areas,{isEmergency:true,nearestEmergencyDestination:true},extra.crowds||{},extra.hazards||{});}
let cases=0;
for(const [distances,expected]of [[[10,30,40,50],'exit-1'],[[30,10,40,50],'exit-2'],[[50,40,10,30],'assembly-a'],[[50,40,30,10],'assembly-b'],[[10,20,10,30],'exit-1']]){const r=run(distances);assert.equal(r.bestRoute.pathNodeIds.at(-1),expected);assert.equal(r.bestRoute.totalDistance,Math.min(...distances));cases++;}
assert.equal(run([5,10,20,30],{exits:exits.map(e=>({...e,isOpen:e.id!=='exit-1'}))}).recommendedExit.id,'exit-2');cases++;
assert.equal(run([5,10,20,30],{edges:{0:{blocked:true},1:{hazardLevel:'high'}}}).recommendedAssembly.id,'assembly-a');cases++;
assert.equal(run([5,10,20,30],{hazards:{'exit-1':'high'}}).recommendedExit.id,'exit-2');cases++;
assert.equal(run([5,10,20,30],{crowds:{exits:{'exit-1':'High'}}}).recommendedExit.id,'exit-1');cases++;
assert.equal(run([5,10,20,30],{edges:Object.fromEntries([0,1,2,3].map(i=>[i,{blocked:true}]))}).bestRoute,null);cases++;
console.log('PASS: '+cases+' gate/safe-place distance selection cases; gate routes end at the gate, closures and high hazards excluded, gate wins equal-distance tie.');
