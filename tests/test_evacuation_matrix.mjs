import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';
import {INITIAL_BUILDING_DATA as d} from '../data/buildingGraph.js';
import {findSafestEvacuationPath as evacuate} from '../utils/pathfinder.js';
const html=fs.readFileSync(new URL('../mobile.html',import.meta.url),'utf8');const ctx={};vm.createContext(ctx);vm.runInContext(html.slice(html.indexOf('    function campusDistanceEdges'),html.indexOf('    function getControlId')),ctx);const edges=ctx.campusDistanceEdges(d.nodes,d.edges);
const totals={cases:0,returned:0,noRoute:0,blockedEdgeViolations:0,closedExitTraversals:0,highHazardTraversals:0,stepFreeViolations:0,fireLiftViolations:0,nonSafeEndpoints:0,errors:0};const examples={};
function record(kind,info){totals[kind]++;(examples[kind]??=[]);if(examples[kind].length<3)examples[kind].push(info);}
function test({origin='admin',mask=0,hazards={},crowds={},access=false,lift=false,blockedId=null,family}){
 totals.cases++;const ex=d.exits.map((e,i)=>({...e,isOpen:!(mask&(1<<i))}));const es=blockedId?edges.map(e=>e.id===blockedId?{...e,blocked:true}:e):edges;
 const info={family,origin,mask,hazards,crowds,access,lift,blockedId};
 try{const r=evacuate(origin,d.nodes,es,ex,d.assemblyAreas,{isEmergency:true,accessibilityMode:access},{exits:crowds},hazards,{allowElevatorsInFire:lift,accessibleEvacuationStrategy:'refuge_zone'}).bestRoute;
 if(!r){totals.noRoute++;return;}totals.returned++;
 if(r.edges.some(e=>e.id===blockedId))record('blockedEdgeViolations',info);
 if(r.pathNodeIds.some(id=>ex.some(e=>e.id===id&&!e.isOpen)))record('closedExitTraversals',{...info,path:r.pathNodeIds});
 if(r.edges.some(e=>e.hazardLevel==='high'))record('highHazardTraversals',info);
 if(access&&r.edges.some(e=>!e.stepFree))record('stepFreeViolations',info);
 if(!lift&&r.edges.some(e=>e.type==='lift'||e.id.startsWith('vert-lift')))record('fireLiftViolations',info);
 if(!['assembly','refuge'].includes(r.pathNodes.at(-1)?.type))record('nonSafeEndpoints',{...info,path:r.pathNodeIds});
 }catch(e){record('errors',{...info,error:e.message});}
}
// Exhaust all combinations in this bounded family: 5 zone states x 3 levels, 3 exit flags, accessibility.
for(let code=0;code<243;code++){let n=code;const hazards={};for(const z of d.zones){hazards[z.id]=['none','low','high'][n%3];n=Math.floor(n/3);}for(let mask=0;mask<8;mask++)for(const access of [false,true])test({hazards,mask,access,family:'zone-exit-access'});}
// All three-exit crowd levels and all three-exit closure patterns from each block entrance.
for(let code=0;code<27;code++){let n=code;const crowds={};for(const e of d.exits){crowds[e.id]=['Low','Medium','High'][n%3];n=Math.floor(n/3);}for(let mask=0;mask<8;mask++)for(const origin of ['admin','lobby','restroom-1','lab-101','cafeteria'])test({origin,crowds,mask,family:'crowd-exit-block-origins'});}
// Every graph edge independently blocked, across five block origins, both accessibility states.
for(const edge of edges)for(const origin of ['admin','lobby','restroom-1','lab-101','cafeteria'])for(const access of [false,true])test({origin,access,blockedId:edge.id,family:'single-edge-block'});
for(const origin of d.nodes.filter(n=>n.floor===2).map(n=>n.id))for(const access of [false,true])for(const lift of [false,true])test({origin,access,lift,family:'upper-floor-policy'});
for(const key of ['blockedEdgeViolations','closedExitTraversals','highHazardTraversals','stepFreeViolations','fireLiftViolations','nonSafeEndpoints','errors'])assert.equal(totals[key],0,key);console.log(JSON.stringify({totals,examples},null,2));
