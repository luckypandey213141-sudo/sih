import {authenticateAdmin} from './_auth.js';
import {updateRealtimeState} from './_store.js';
import {getRealtimeState} from './_store.js';
import {readPayload} from './realtime.js';
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 try{
  if(req.method==='GET'){res.statusCode=200;return res.end(JSON.stringify((await getRealtimeState()).sensors||{}));}
  if(!['POST','PUT'].includes(req.method)){res.statusCode=405;return res.end();}
  if(!(await authenticateAdmin(req)).authenticated){res.statusCode=401;return res.end(JSON.stringify({error:'Sensor authentication required'}));}
  const p=await readPayload(req),id=p.sensorId||'esp32-node';
  await updateRealtimeState(s=>{
   s.sensors??={};s.sensors[id]={...p,sensorId:id,lastUpdate:new Date().toISOString()};
   if(p.zone){if(p.hazardLevel)s.hazards[p.zone]=p.hazardLevel;if(p.smokeDetected||p.flameDetected||p.hazardLevel==='high'){s.hazards[p.zone]='high';s.emergencyActive=true;}if(p.crowdLevel)s.crowds[p.zone]=p.crowdLevel;}
   s.version=(s.version||0)+1;s.lastUpdated=new Date().toISOString();
  });res.statusCode=200;return res.end(JSON.stringify({status:'ok',sensorId:id}));
 }catch(e){res.statusCode=503;return res.end(JSON.stringify({error:e.message}));}
}
