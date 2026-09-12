import {spawn} from 'node:child_process';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),state=path.join(os.tmpdir(),'safeway-repair-test-'+Date.now());fs.mkdirSync(state,{recursive:true});
const child=spawn(process.execPath,['local_server.js'],{cwd:root,env:{...process.env,PORT:'3004',SAFEWAY_STATE_DIR:state,SAFEWAY_ADMIN_PASSWORD:'audit-only-password',SAFEWAY_SENSOR_SECRET:'audit-only-sensor'},stdio:'pipe'});let logs='';child.stderr.on('data',d=>logs+=d);const base='http://localhost:3004';
try{
 for(let i=0;i<60;i++){try{await fetch(base+'/api/realtime');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 const login=await fetch(base+'/api/admin/login',{method:'POST',body:JSON.stringify({username:'admin',password:'audit-only-password'})});assert.equal(login.status,200,logs);const admin=login.headers.get('set-cookie').split(';')[0];
 async function post(body,cookie=admin,url='/api/realtime'){const r=await fetch(base+url,{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 assert.equal((await post({action:'update_master',patch:{emergencyActive:true}})).status,200);
 await Promise.all(Array.from({length:30},(_,i)=>i%2?post({action:'update_master',patch:{blockedEdges:{['edge-'+i]:true}}}).then(r=>assert.equal(r.status,200,JSON.stringify(r.body))):fetch(base+'/api/realtime?deviceId=test-'+i+'&floor=0').then(r=>assert.equal(r.status,200))));
 let current=await (await fetch(base+'/api/realtime')).json();assert.equal(current.emergencyActive,true);assert.equal(Object.keys(current.blockedEdges).length,15);assert.equal(current.presence['test-0'].floor,0);
 await new Promise(r=>setTimeout(r,6100));assert.equal((await (await fetch(base+'/api/realtime')).json()).emergencyActive,true);
 assert.equal((await post({action:'update_master',state:{emergencyActive:false}})).status,409);
 const sos=await post({action:'sos',signal:{id:'test-sos',floor:0}},'');assert.equal(sos.status,200);assert.equal(sos.body.distressSignals['test-sos'].floor,0);
 assert.equal((await post({action:'clear_sos',id:'test-sos'},'')).status,403);
 assert.equal((await post({action:'sos',signal:{id:'test-sos'}},'')).status,403);
 assert.equal((await post({action:'clear_sos',id:'test-sos'},sos.cookie)).status,200);
 const sensor=await fetch(base+'/api/sensor',{method:'POST',headers:{Authorization:'Bearer audit-only-sensor','Content-Type':'application/json'},body:JSON.stringify({sensorId:'test-sensor',zone:'area-ramanujan-ground-r1',smokeDetected:true})});assert.equal(sensor.status,200,await sensor.text());
 current=await(await fetch(base+'/api/realtime')).json();assert(current.sensors['test-sensor']);assert.equal(current.hazards['area-ramanujan-ground-r1'],'high');
 await fetch(base+'/api/admin/logout',{method:'POST',headers:{cookie:admin}});assert.equal((await post({action:'update_master',patch:{emergencyActive:false}})).status,401);
 console.log('PASS: signed local login, 30 concurrent writes/presence reads, alarm retained beyond 6 seconds, stale snapshots rejected, basement preserved, SOS ownership/overwrite protected, sensor hazard propagation, logout revocation.');
}finally{child.kill();}
