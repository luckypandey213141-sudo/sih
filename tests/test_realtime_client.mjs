import assert from 'node:assert/strict';
const memory=new Map(),events=[];let current={emergencyActive:false,hazards:{},crowds:{},corridorCrowds:{},exits:{},blockedEdges:{},emergencyPolicies:{},sensors:{},presence:{},distressSignals:{},resolvedDistressSignals:{},version:1};let fail=false;const requests=[];
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};Object.defineProperty(globalThis,'navigator',{value:{userAgent:'test'},configurable:true});
globalThis.CustomEvent=class{constructor(type,options){this.type=type;this.detail=options.detail;}};
globalThis.window={localStorage,location:{origin:'http://test'},dispatchEvent:e=>events.push(e)};
let channel;globalThis.BroadcastChannel=window.BroadcastChannel=class{constructor(){channel=this;}postMessage(){}};
globalThis.document={hidden:false,addEventListener(){}};globalThis.setInterval=()=>0;
globalThis.fetch=window.fetch=async(url,options={})=>{
 if(options.method==='POST'){
  const p=JSON.parse(options.body);requests.push(p);if(fail)return {ok:false,status:401,json:async()=>({error:'Sign in to save admin changes'})};
  if(p.action==='update_master'){assert(p.patch);assert(!p.state);for(const [k,v]of Object.entries(p.patch))current[k]=k==='emergencyActive'?v:{...current[k],...v};current.version++;}
  if(p.action==='sos')current.distressSignals[p.signal.id]=p.signal;
 }
 return {ok:true,json:async()=>structuredClone(current)};
};
const service=await import('../services/realtime.js');let seen;service.subscribeToRealtimeData(s=>seen=s);await service.syncWithCloudServer();
service.setEmergencyActive(true);await new Promise(r=>setTimeout(r,5));assert.equal(current.emergencyActive,true);assert.equal(seen.emergencyActive,true);
service.recordSensorReading('sensor',{zone:'room',smokeDetected:true});await new Promise(r=>setTimeout(r,5));assert(current.sensors.sensor);assert.equal(current.hazards.room,'high');
fail=true;service.setEmergencyActive(false);await new Promise(r=>setTimeout(r,5));assert.equal(seen.emergencyActive,true);assert.equal(service.getConnectionStatus().isLiveCloud,false);await service.syncWithCloudServer();assert.equal(service.getConnectionStatus().isLiveCloud,false,'poll must not hide a rejected save');
await assert.rejects(service.sendDistressSignal({floor:0}),/Sign in/);fail=false;await service.sendDistressSignal({id:'basement',floor:0});assert.equal(current.distressSignals.basement.floor,0);
 assert.equal(Object.keys(JSON.parse(memory.get('safeway_sos_outbox_v1'))).length,1,'failed SOS retained for retry');
 await service.syncWithCloudServer();
 assert.equal(Object.keys(JSON.parse(memory.get('safeway_sos_outbox_v1'))).length,0,'acknowledged retry removed from outbox');
 assert.equal(Object.keys(current.distressSignals).length,2,'retry preserves both reports');
current={...current,corridorCrowds:{test:'High'}};await service.syncWithCloudServer();assert.equal(seen.corridorCrowds.test,'High','equal-version content changes must notify');
const realFetch=globalThis.fetch;let release;
globalThis.fetch=window.fetch=async(url,options)=>options?.method==='POST'?new Promise(resolve=>release=resolve):realFetch(url,options);
const delayed=service.sendDistressSignal({id:'delayed'});await new Promise(r=>setTimeout(r,0));
const newer={...current,version:current.version+10,distressSignals:{...current.distressSignals,newDevice:{id:'newDevice'}}};
channel.onmessage({data:{type:'STATE_UPDATE',state:newer}});
release({ok:true,json:async()=>({...current,version:current.version+1})});await delayed;
assert(seen.distressSignals.newDevice,'older POST response must not erase a newer device SOS');
console.log('PASS: acknowledged PATCH saves, sensor payload, rejected emergency save retains acknowledged alarm, sticky failure status, SOS failure propagation, basement zero and content-aware polling.');

