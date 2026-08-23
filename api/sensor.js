let liveSensorData = {
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(liveSensorData));
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    } else if (!payload && typeof req.on === 'function') {
      payload = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
          try { resolve(JSON.parse(data)); } catch { resolve({}); }
        });
      });
    }

    const sensorId = (payload && payload.sensorId) || 'esp32-node';
    const timestamp = new Date().toISOString();
    liveSensorData[sensorId] = {
      ...payload,
      receivedAt: timestamp
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ status: 'ok', sensorId, time: timestamp }));
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
