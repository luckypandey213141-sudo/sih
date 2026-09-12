import { authenticateAdmin, parseCookies, verifySignedToken, createSignedToken } from './_auth.js';
import { updateRealtimeState, getRealtimeState, initialRealtimeState } from './_store.js';
import crypto from 'node:crypto';
export async function readPayload(req){
 if(req.body!==undefined)return typeof req.body==='string'?JSON.parse(req.body):req.body;
 let text='';for await(const chunk of req)text+=chunk;return text?JSON.parse(text):{};
}
function deviceOwner(req,res){
 const token=parseCookies(req).safeway_device;const payload=verifySignedToken(token);
 if(payload?.deviceId)return payload.deviceId;
 const deviceId=crypto.randomUUID();const value=createSignedToken({deviceId,exp:Date.now()+30*86400000});
 res.setHeader('Set-Cookie','safeway_device='+value+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000');return deviceId;
}
function prune(state){for(const [id,p] of Object.entries(state.presence||{}))if(Date.now()-(p.timestamp||0)>35000)delete state.presence[id];}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
 if(req.method==='OPTIONS'){res.statusCode=204;return res.end();}
 try{
  const owner=deviceOwner(req,res);
  if(req.method==='GET'){
   const url=new URL(req.url,'http://localhost'),deviceId=url.searchParams.get('deviceId');
   const state=deviceId?await updateRealtimeState(s=>{s.presence??={};s.presence[deviceId]={deviceId,mapId:url.searchParams.get('mapId')||'campus',roomName:url.searchParams.get('roomName')||'Campus',floor:Number(url.searchParams.get('floor')??1),timestamp:Date.now()};prune(s);}):await getRealtimeState();
   res.statusCode=200;return res.end(JSON.stringify(state));
  }
  if(!['POST','PUT'].includes(req.method)){res.statusCode=405;return res.end(JSON.stringify({error:'Method not allowed'}));}
  const p=await readPayload(req),action=p.action;const auth=await authenticateAdmin(req);
  const isAdmin=auth.authenticated&&auth.role==='admin';
  if(!['heartbeat','sos','clear_sos'].includes(action)&&!isAdmin){res.statusCode=401;return res.end(JSON.stringify({error:'Sign in to save admin changes'}));}
  const state=await updateRealtimeState(s=>{
   s.presence??={};s.distressSignals??={};s.resolvedDistressSignals??={};
   if(action==='heartbeat'){
    if(p.deviceId)s.presence[p.deviceId]={deviceId:p.deviceId,mapId:p.mapId||'campus',roomName:p.roomName||'Campus',floor:p.floor??1,timestamp:Date.now()};
   }else if(action==='sos'){
    if(!p.signal?.id)throw new Error('Missing incident identifier');
    if(s.distressSignals[p.signal.id] && s.distressSignals[p.signal.id].owner!==owner){const e=new Error('Incident belongs to another reporting device');e.status=403;throw e;}
    s.distressSignals[p.signal.id]={...p.signal,owner,status:'ACTIVE',rawTimestamp:Date.now()};
   }else if(action==='clear_sos'){
    const incident=s.distressSignals[p.id];
    if(!incident || (!isAdmin&&incident.owner!==owner)){const e=new Error('Only the reporting device or an administrator can resolve this incident');e.status=403;throw e;}
    s.resolvedDistressSignals[p.id]={...incident,status:'RESCUED_RESOLVED',resolvedTimestamp:Date.now()};delete s.distressSignals[p.id];
   }else if(action==='delete_archived_sos'){delete s.resolvedDistressSignals[p.id];
   }else if(action==='clear_all_audit'){s.resolvedDistressSignals={};
   }else if(action==='reset_all'){
    const keep={distressSignals:s.distressSignals,presence:s.presence,resolvedDistressSignals:s.resolvedDistressSignals,version:s.version};Object.assign(s,initialRealtimeState(),keep);
   }else if(action==='update_master'){
    const patch=p.patch;
    if(!patch){const e=new Error('Reload this page to use the current control protocol');e.status=409;throw e;}
    for(const key of ['hazards','crowds','corridorCrowds','exits','blockedEdges','emergencyPolicies','sensors'])if(patch[key])s[key]={...(s[key]||{}),...patch[key]};
    if(typeof patch.emergencyActive==='boolean')s.emergencyActive=patch.emergencyActive;
   }else{const e=new Error('Unsupported action');e.status=400;throw e;}
   if(action!=='heartbeat'){s.version=(s.version||0)+1;s.lastUpdated=new Date().toISOString();}prune(s);
  });res.statusCode=200;return res.end(JSON.stringify(state));
 }catch(e){res.statusCode=e.status||503;return res.end(JSON.stringify({error:e.message}));}
}
