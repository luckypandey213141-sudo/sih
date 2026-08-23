export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  return res.end(JSON.stringify({
    status: 'healthy',
    system: 'SafeWay V3',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'serverless'
  }));
}
