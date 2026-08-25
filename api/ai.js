/**
 * SafeWay V3 — Ultra-Fast Groq AI Emergency Copilot & SITREP Generator
 * Sub-Second LPU Inference for Life-Safety Voice Guidance & First Responder Dispatch.
 * Powered by Groq Cloud (llama-3.3-70b-versatile / llama-3.1-8b-instant).
 */

const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const FAST_MODEL = "llama-3.1-8b-instant";

/**
 * Deterministic fallback triage engine in case Groq key is absent or network is down
 */
function generateDeterministicFallback(action, payload) {
  if (action === "admin_sitrep") {
    const hazards = Object.entries(payload.hazards || {})
      .filter(([_, level]) => level && level !== "none")
      .map(([zone, level]) => `${zone.toUpperCase()} (${level.toUpperCase()})`);

    const hazardSummary = hazards.length > 0
      ? `Active hazard detected in: ${hazards.join(", ")}.`
      : "All building zones reporting normal nominal status.";

    const emergencyText = payload.emergencyActive
      ? "CRITICAL EVACUATION ACTIVE: Emergency protocol triggered across all wings."
      : "Building in Normal Navigation Mode.";

    return {
      status: "fallback_ok",
      model: "SafeWay-Local-Rule-Engine",
      sitrep: `[INCIDENT SITREP - ${new Date().toLocaleTimeString()}]\n• Status: ${emergencyText}\n• Hazards: ${hazardSummary}\n• Exits: Flow diverted away from high-density bottlenecks.\n• Recommendation: Maintain active monitoring at fire egress routes.`,
      dispatch: `[112 / FIRE BRIGADE DISPATCH BRIEF]\n• Location: Main Campus Facility\n• Incident: ${hazards.length > 0 ? "Structure Fire / Smoke Hazard" : "Emergency Drill / Triage"}\n• Threat Zones: ${hazards.join(", ") || "None currently active"}\n• Action: First responders proceed to primary clear assembly gates.`
    };
  }

  if (action === "scenario_generator") {
    return {
      status: "fallback_ok",
      scenario: {
        title: "Simulated Incident",
        emergencyActive: true,
        hazards: { "zone-b": "high" },
        crowds: { "zone-b": "High", "exit-2": "High" },
        blockedEdges: { "corridor-2b": true },
        description: "Generated fallback simulation scenario based on standard drill parameters."
      }
    };
  }

  // Evacuee Copilot fallback
  const isEmergency = Boolean(payload.emergencyActive);
  const isWheelchair = Boolean(payload.isWheelchair);
  const room = payload.roomName || payload.currentLocation || "your current area";

  let responseText = "";
  if (isEmergency) {
    if (isWheelchair) {
      responseText = `Emergency active. From ${room}, proceed along step-free corridor toward the ground ramp exit. Avoid all elevators and stairwells.`;
    } else {
      responseText = `Emergency active! From ${room}, follow illuminated green exit signs toward the nearest clear stairwell or exterior gate. Stay low if smoke is present.`;
    }
  } else {
    responseText = `You are currently at ${room}. Follow standard indoor hallway signs toward your destination or scan nearest wall QR code for exact turn-by-turn routing.`;
  }

  if (payload.language && payload.language.toLowerCase().includes("hi")) {
    responseText = isEmergency
      ? `आपातकाल सक्रिय है! ${room} से तुरंत निकटतम सुरक्षित निकास द्वार की ओर बढ़ें। लिफ्ट का उपयोग न करें।`
      : `आप ${room} पर हैं। अपने गंतव्य तक पहुँचने के लिए हॉलवे संकेतों का पालन करें।`;
  }

  return {
    status: "fallback_ok",
    model: "SafeWay-Local-Rule-Engine",
    answer: responseText,
    voiceText: responseText
  };
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-groq-api-key");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed. Use POST." }));
    return;
  }

  // Parse Body
  let bodyData = req.body;
  if (!bodyData) {
    bodyData = await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => { data += chunk.toString(); });
      req.on("end", () => {
        try { resolve(JSON.parse(data || "{}")); }
        catch { resolve({}); }
      });
    });
  }

  const action = bodyData.action || "copilot";
  const clientKey = req.headers["x-groq-api-key"] || bodyData.apiKey;
  const apiKey = (clientKey && clientKey.trim()) || process.env.GROQ_API_KEY || "";

  // If no Groq API Key is available, return smart fallback smoothly
  if (!apiKey) {
    const fallback = generateDeterministicFallback(action, bodyData);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(fallback));
    return;
  }

  try {
    let systemPrompt = "";
    let userPrompt = "";

    if (action === "admin_sitrep") {
      systemPrompt = `You are AegisPath SITREP AI, an emergency operations intelligence copilot for Incident Commanders and Fire Marshals.
Analyze building sensor telemetry, fire hazard zones, crowd density bottlenecks, and active SOS evacuee distress signals.
Provide:
1. "sitrep": A crisp, high-urgency 3-4 bullet point executive situation report.
2. "dispatch": A standardized 112 / Fire Department dispatch transmission script detailing hazard zones, trapped occupants, and safest ingress gates for firefighters.
Return strictly a valid JSON object: {"sitrep": "...", "dispatch": "..."}.`;

      userPrompt = `Generate real-time SITREP and 112 Dispatch for current building state:
- Emergency Active: ${bodyData.emergencyActive ? "YES" : "NO"}
- Active Hazards: ${JSON.stringify(bodyData.hazards || {})}
- Crowd Levels: ${JSON.stringify(bodyData.crowds || {})}
- Blocked Corridors: ${JSON.stringify(bodyData.blockedEdges || {})}
- Active SOS Trapped Users: ${bodyData.distressCount || 0}
- Telemetry: ${JSON.stringify(bodyData.sensorData || {})}`;
    } else if (action === "scenario_generator") {
      systemPrompt = `You are a disaster scenario generator for fire drill simulations.
Convert natural language disaster descriptions into concrete building hazard state payloads.
Return strictly a valid JSON object matching this schema:
{
  "title": "Short title",
  "emergencyActive": true,
  "hazards": {"zone-a": "none|low|high", "zone-b": "none|low|high", ...},
  "crowds": {"zone-a": "Low|Medium|High", ...},
  "blockedEdges": {"edge_id": true},
  "description": "2 sentence explanation of the scenario"
}`;

      userPrompt = `Generate simulation scenario for: "${bodyData.prompt || 'Flash fire in East Wing with heavy crowd'}"`;
    } else {
      // Evacuee Copilot Mode
      const lang = bodyData.language || "English";
      systemPrompt = `You are AegisPath Life-Safety Evacuation Copilot, an ultra-fast emergency guidance AI for people inside a building.
CRITICAL LIFE-SAFETY RULES:
1. Answer in 2 to 3 concise, extremely clear sentences. Evacuees are panicking; keep instructions unambiguous and actionable.
2. If fire is active, NEVER tell anyone to use elevators (NFPA Life Safety Code 101).
3. If isWheelchair is true, prioritize step-free ramps, ground-floor exits, or designated safe refuge zones.
4. Warn user to avoid active hazard zones and heavily congested corridors.
5. If requested language is Hindi (${lang.includes("hi") ? "true" : "false"}) or regional, reply directly in that language (using Devanagari script for Hindi).
6. Give exact directional instructions based on their current room/node.`;

      userPrompt = `Evacuee Query: "${bodyData.query || 'How do I escape safely?'}"
Context:
- Current Location: ${bodyData.roomName || bodyData.currentLocation || 'Unknown'} (Floor: ${bodyData.floor || 1}, Map: ${bodyData.mapId || 'campus'})
- Emergency Active: ${bodyData.emergencyActive ? 'YES (EVACUATION REQUIRED)' : 'NO (Normal Navigation)'}
- Active Hazards: ${JSON.stringify(bodyData.activeHazards || {})}
- Crowd Density: ${JSON.stringify(bodyData.crowdLevels || {})}
- Blocked Routes: ${JSON.stringify(bodyData.blockedPaths || {})}
- Wheelchair / Accessibility Mode: ${bodyData.isWheelchair ? 'YES' : 'NO'}
- Target Language: ${lang}`;
    }

    const groqPayload = {
      model: bodyData.useFastModel ? FAST_MODEL : DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 400
    };

    if (action === "admin_sitrep" || action === "scenario_generator") {
      groqPayload.response_format = { type: "json_object" };
    }

    const groqResponse = await fetch(GROQ_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(groqPayload)
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.warn("[Groq API Error]", groqResponse.status, errorText);
      const fallback = generateDeterministicFallback(action, bodyData);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ...fallback, warning: "Groq API error, served via fallback." }));
      return;
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices && groqData.choices[0] && groqData.choices[0].message && groqData.choices[0].message.content;

    if (action === "admin_sitrep" || action === "scenario_generator") {
      try {
        const parsed = JSON.parse(content);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", model: DEFAULT_MODEL, ...parsed }));
        return;
      } catch {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", raw: content }));
        return;
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      model: DEFAULT_MODEL,
      answer: content,
      voiceText: content,
      language: bodyData.language || "English"
    }));
  } catch (err) {
    console.error("[Groq Handler Exception]", err);
    const fallback = generateDeterministicFallback(action, bodyData);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(fallback));
  }
}
