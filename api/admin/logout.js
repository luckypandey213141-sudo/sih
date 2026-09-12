import {parseCookies,revokeSignedToken} from '../_auth.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if(req.method!=='POST'){res.statusCode=405;return res.end();}
  try{await revokeSignedToken(parseCookies(req).safeway_admin_session);}catch{res.statusCode=503;return res.end(JSON.stringify({error:'Logout could not be saved; retry'}));}
  res.setHeader('Set-Cookie', 'safeway_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true }));
}
