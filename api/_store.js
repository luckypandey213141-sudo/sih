import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
const scope=crypto.createHash('sha256').update(new URL('..',import.meta.url).pathname).digest('hex').slice(0,16);
const folder=process.env.SAFEWAY_STATE_DIR || path.join(os.tmpdir(),'safeway-'+scope);
const kvUrl=process.env.KV_REST_API_URL, kvToken=process.env.KV_REST_API_TOKEN;
const DEFAULT_REALTIME_STATE = {
  emergencyActive: false,
  hazards: {
    "zone-a": "none",
    "zone-b": "none",
    "zone-c": "none",
    "zone-d": "none",
    "zone-e": "none"
  },
  crowds: {
    "exit-1": "Low",
    "exit-2": "Low",
    "exit-3": "Low",
    "zone-a": "Low",
    "zone-b": "Low",
    "zone-c": "Low",
    "zone-d": "Low",
    "zone-e": "Low"
  },
  corridorCrowds: {},
  exits: {
    "exit-1": { isOpen: true },
    "exit-2": { isOpen: true },
    "exit-3": { isOpen: true }
  },
  blockedEdges: {},
  emergencyPolicies: {
    allowElevatorsInFire: false,
    accessibleEvacuationStrategy: "refuge_zone"
  },
  distressSignals: {},
  resolvedDistressSignals: {},
  presence: {},
  sensors: {},
  version: 1,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_SENSOR_DATA = {
  "esp32-zone-b": {
    sensorId: "esp32-zone-b",
    zone: "zone-b",
    location: "Physics Lab 101 (East Wing)",
    smokeDetected: false,
    flameDetected: false,
    temperature: 24.5,
    occupancy: 4,
    crowdLevel: "Low",
    hazardLevel: "none",
    lastUpdate: new Date().toISOString()
  },
  "esp32-zone-c": {
    sensorId: "esp32-zone-c",
    zone: "zone-c",
    location: "Cafeteria & Dining (1F)",
    smokeDetected: false,
    flameDetected: false,
    temperature: 23.8,
    occupancy: 14,
    crowdLevel: "Medium",
    hazardLevel: "none",
    lastUpdate: new Date().toISOString()
  }
};


export const initialRealtimeState=()=>structuredClone(DEFAULT_REALTIME_STATE);
async function redis(command){
 const r=await fetch(kvUrl,{method:'POST',headers:{Authorization:'Bearer '+kvToken,'Content-Type':'application/json'},body:JSON.stringify(command)});
 if(!r.ok)throw new Error('Persistent storage unavailable');const data=await r.json();if(data.error)throw new Error('Persistent storage rejected operation');return data.result;
}
const transactionQueues=new Map();
async function transact(name,defaults,change){
 if(kvUrl&&kvToken)return transactStorage(name,defaults,change);
 const next=(transactionQueues.get(name)||Promise.resolve()).then(()=>transactStorage(name,defaults,change));
 transactionQueues.set(name,next.catch(()=>{}));return next;
}
async function transactStorage(name,defaults,change){
 if(process.env.VERCEL && (!kvUrl||!kvToken))throw new Error('Configure shared KV storage before using live controls');
 if(kvUrl&&kvToken){
  const key='safeway:'+name;
  for(let attempt=0;attempt<12;attempt++){
   const raw=await redis(['GET',key]);const value=raw?JSON.parse(raw):structuredClone(defaults);
   const result=await change(value);if(!result.write)return result.result;
   const script="local v=redis.call('GET',KEYS[1]); if (v or '') ~= ARGV[1] then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
   if(await redis(['EVAL',script,1,key,raw||'',JSON.stringify(value)]))return result.result;
  }throw new Error('Concurrent state update; retry the command');
 }
 await fs.mkdir(folder,{recursive:true});const file=path.join(folder,name+'.json'),lock=file+'.lock';let acquired=false;
 for(let i=0;i<200;i++){try{await fs.mkdir(lock);acquired=true;break;}catch(e){if(e.code!=='EEXIST')throw e;await new Promise(r=>setTimeout(r,10));}}
 if(!acquired)throw new Error('State is busy; retry the command');
 try{
  let value;try{value=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;value=structuredClone(defaults);}
  const result=await change(value);if(result.write){const tmp=file+'.'+crypto.randomUUID()+'.tmp';await fs.writeFile(tmp,JSON.stringify(value));await fs.rename(tmp,file);}return result.result;
 }finally{await fs.rmdir(lock);}
}
export async function updateRealtimeState(change){return transact('realtime_state',DEFAULT_REALTIME_STATE,async state=>{const result=await change(state);return {write:true,result:structuredClone(result??state)};});}
export async function getRealtimeState(){return transact('realtime_state',DEFAULT_REALTIME_STATE,state=>({write:false,result:structuredClone(state)}));}
export async function getSensorData(){return transact('sensor_data',DEFAULT_SENSOR_DATA,state=>({write:false,result:structuredClone(state)}));}
export async function updateSensorData(change){return transact('sensor_data',DEFAULT_SENSOR_DATA,async state=>{await change(state);return {write:true,result:structuredClone(state)};});}

export async function revokeSession(id,exp){return transact('session_revocations',{},state=>{for(const [key,until] of Object.entries(state))if(until<Date.now())delete state[key];state[id]=exp;return {write:true,result:true};});}
export async function isSessionRevoked(id){return transact('session_revocations',{},state=>({write:false,result:(state[id]||0)>Date.now()}));}
