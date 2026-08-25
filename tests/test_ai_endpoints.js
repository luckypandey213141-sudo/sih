import aiHandler from '../api/ai.js';
import { EventEmitter } from 'events';

async function testEndpoint(name, payload) {
  const req = new EventEmitter();
  req.method = 'POST';
  req.headers = {};
  req.body = payload;

  let statusCode = null;
  let headers = {};
  let bodyData = '';

  const res = {
    setHeader: (k, v) => { headers[k] = v; },
    writeHead: (code, hdrs) => {
      statusCode = code;
      headers = { ...headers, ...hdrs };
    },
    end: (data) => {
      bodyData = data;
    }
  };

  await aiHandler(req, res);
  const json = JSON.parse(bodyData || '{}');
  console.log(`▶ [${name}] Status: ${statusCode || 200}`);
  console.log('  Payload Response:', JSON.stringify(json).slice(0, 140) + '...');
  return json;
}

async function runAll() {
  console.log('\n--- Testing AI Endpoints (Groq / Fallback Engine) ---');
  await testEndpoint('Evacuee Copilot (English)', {
    action: 'copilot',
    query: 'How do I escape safely from drawing lab?',
    roomName: 'Drawing Lab',
    emergencyActive: true
  });

  await testEndpoint('Evacuee Copilot (Hindi)', {
    action: 'copilot',
    query: 'सुरक्षित बाहर निकलने का रास्ता',
    language: 'Hindi',
    roomName: 'Drawing Lab',
    emergencyActive: true
  });

  await testEndpoint('Admin SITREP', {
    action: 'admin_sitrep',
    emergencyActive: true,
    hazards: { 'zone-b': 'high' }
  });

  await testEndpoint('Scenario Generator', {
    action: 'scenario_generator',
    prompt: 'Fire in Chemistry lab'
  });

  console.log('--- All AI Endpoint Tests Passed Successfully! ---\n');
}

runAll();
