/**
 * SafeWay V3 - ESP32 Multi-Sensor IoT Node Firmware
 * Smart India Hackathon (SIH) Hardware Prototype
 * 
 * Hardware Connected:
 * 1. ESP32 Dev Module (WROOM-32)
 * 2. MQ-2 Smoke / Gas Sensor (Analog Pin GPIO 34)
 * 3. Infrared Flame Detection Sensor (Digital Pin GPIO 35)
 * 4. Dual IR Break-Beam Sensors for Directional Occupancy Counting:
 *    - Beam 1 (Entry Side): GPIO 32
 *    - Beam 2 (Exit Side):  GPIO 33
 * 5. Status / Alarm Indicator LED: GPIO 2 (Built-in LED)
 * 
 * Features:
 * - Real-time crowd occupancy tracking with directional beam break analysis.
 * - Dynamic crowd classification:
 *     0 - 7   people -> "Low"
 *     8 - 19  people -> "Medium"
 *     20+     people -> "High"
 * - Smoke & Fire detection with automatic hazard escalation.
 * - Periodic telemetry transmission to Firebase Realtime Database / HTTP REST API every 2000ms.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Library: ArduinoJson by Benoit Blanchon (v6+)

// ==========================================
// 1. CONFIGURATION & PLACEHOLDERS
// ==========================================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// SafeWay Backend Serverless REST Endpoint (Vercel or Local Gateway)
const char* SAFEWAY_API_URL = "https://sih-two-iota.vercel.app/api/sensor"; // Or "http://192.168.1.100:3000/api/sensor"
const char* SAFEWAY_AUTH_KEY = "safeway-iot-sensor-auth-2026"; // Configurable IoT Sensor Secret Token

const char* SENSOR_ID = "esp32-zone-b";
const char* ASSIGNED_ZONE = "zone-b";

// Pin Assignments
#define PIN_SMOKE_ANALOG   34
#define PIN_FLAME_DIGITAL  35
#define PIN_IR_BEAM_ENTRY  32
#define PIN_IR_BEAM_EXIT   33
#define PIN_STATUS_LED     2

// Smoke Sensor Threshold (0 - 4095 for ESP32 12-bit ADC)
#define SMOKE_ALARM_THRESHOLD 1200

// Configurable Crowd Occupancy Thresholds
#define OCCUPANCY_LOW_MAX    7
#define OCCUPANCY_MEDIUM_MAX 19

// Telemetry interval (milliseconds)
const unsigned long TELEMETRY_INTERVAL_MS = 2000;

// ==========================================
// 2. STATE VARIABLES
// ==========================================
int currentOccupancy = 4; // Initial occupancy estimate
bool smokeDetected = false;
bool flameDetected = false;
int rawSmokeValue = 0;
String currentCrowdLevel = "Low";
String currentHazardLevel = "none";
unsigned long lastTelemetryTime = 0;

// Beam break state machine
int beamEntryState = HIGH;
int beamExitState = HIGH;
int lastBeamEntryState = HIGH;
int lastBeamExitState = HIGH;
unsigned long beamEntryTriggerTime = 0;
unsigned long beamExitTriggerTime = 0;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n==================================================");
  Serial.println("  SafeWay V3 - ESP32 IoT Hazard & Crowd Node");
  Serial.println("  Smart India Hackathon (SIH 2026)");
  Serial.println("==================================================\n");

  // Configure Pins
  pinMode(PIN_SMOKE_ANALOG, INPUT);
  pinMode(PIN_FLAME_DIGITAL, INPUT);
  pinMode(PIN_IR_BEAM_ENTRY, INPUT_PULLUP);
  pinMode(PIN_IR_BEAM_EXIT, INPUT_PULLUP);
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STATUS_LED, LOW);

  // Connect to Wi-Fi
  connectToWiFi();
}

void loop() {
  // 1. Process directional crowd counting from IR Break Beams
  processCrowdSensors();

  // 2. Sample Fire and Smoke sensors
  sampleEnvironmentalSensors();

  // 3. Classify crowd level and hazard level
  evaluateSafetyMetrics();

  // 4. Send telemetry payload every 2 seconds
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = millis();
    transmitTelemetry();
  }

  delay(20); // Small loop cycle delay
}

/**
 * Connect to Wi-Fi network
 */
void connectToWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Offline Mode: Proceeding with local sensor readings.");
  }
}

/**
 * Directional break-beam analysis:
 * If Entry Beam is broken first followed by Exit Beam -> Person Entered (+1)
 * If Exit Beam is broken first followed by Entry Beam -> Person Exited (-1)
 */
void processCrowdSensors() {
  beamEntryState = digitalRead(PIN_IR_BEAM_ENTRY);
  beamExitState = digitalRead(PIN_IR_BEAM_EXIT);

  // Detect falling edge on Entry Beam (beam broken)
  if (beamEntryState == LOW && lastBeamEntryState == HIGH) {
    beamEntryTriggerTime = millis();
    if (beamExitTriggerTime > 0 && (millis() - beamExitTriggerTime < 1500)) {
      // Exit beam was broken just before -> Person left the zone
      if (currentOccupancy > 0) currentOccupancy--;
      Serial.print("[-] Person EXITED. Zone Occupancy: ");
      Serial.println(currentOccupancy);
      beamExitTriggerTime = 0;
      beamEntryTriggerTime = 0;
    }
  }

  // Detect falling edge on Exit Beam (beam broken)
  if (beamExitState == LOW && lastBeamExitState == HIGH) {
    beamExitTriggerTime = millis();
    if (beamEntryTriggerTime > 0 && (millis() - beamEntryTriggerTime < 1500)) {
      // Entry beam was broken just before -> Person entered the zone
      currentOccupancy++;
      Serial.print("[+] Person ENTERED. Zone Occupancy: ");
      Serial.println(currentOccupancy);
      beamEntryTriggerTime = 0;
      beamExitTriggerTime = 0;
    }
  }

  lastBeamEntryState = beamEntryState;
  lastBeamExitState = beamExitState;
}

/**
 * Sample MQ-2 Smoke and Flame sensors
 */
void sampleEnvironmentalSensors() {
  rawSmokeValue = analogRead(PIN_SMOKE_ANALOG);
  smokeDetected = (rawSmokeValue > SMOKE_ALARM_THRESHOLD);

  // Flame sensor output is active LOW on standard Arduino flame sensor boards
  flameDetected = (digitalRead(PIN_FLAME_DIGITAL) == LOW);
}

/**
 * Evaluate safety metrics based on calibrated thresholds
 */
void evaluateSafetyMetrics() {
  // Crowd classification
  if (currentOccupancy <= OCCUPANCY_LOW_MAX) {
    currentCrowdLevel = "Low";
  } else if (currentOccupancy <= OCCUPANCY_MEDIUM_MAX) {
    currentCrowdLevel = "Medium";
  } else {
    currentCrowdLevel = "High";
  }

  // Hazard classification
  if (flameDetected || rawSmokeValue > (SMOKE_ALARM_THRESHOLD * 1.5)) {
    currentHazardLevel = "high"; // Fire detected
    digitalWrite(PIN_STATUS_LED, HIGH); // Alarm LED ON
  } else if (smokeDetected) {
    currentHazardLevel = "low"; // Smoke warning
    digitalWrite(PIN_STATUS_LED, (millis() / 250) % 2); // Blink LED
  } else {
    currentHazardLevel = "none";
    digitalWrite(PIN_STATUS_LED, LOW);
  }
}

/**
 * Serialize JSON and transmit HTTP POST directly to SafeWay /api/sensor Backend
 */
void transmitTelemetry() {
  StaticJsonDocument<300> doc;
  doc["sensorId"] = SENSOR_ID;
  doc["zone"] = ASSIGNED_ZONE;
  doc["smokeDetected"] = smokeDetected;
  doc["flameDetected"] = flameDetected;
  doc["smokeAnalog"] = rawSmokeValue;
  doc["occupancy"] = currentOccupancy;
  doc["crowdLevel"] = currentCrowdLevel;
  doc["hazardLevel"] = currentHazardLevel;
  doc["millis"] = millis();

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.print("[Telemetry] Payload: ");
  Serial.println(jsonString);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SAFEWAY_API_URL);
    http.addHeader("Content-Type", "application/json");
    if (strlen(SAFEWAY_AUTH_KEY) > 0) {
      http.addHeader("X-Sensor-Auth", SAFEWAY_AUTH_KEY);
      http.addHeader("Authorization", String("Bearer ") + SAFEWAY_AUTH_KEY);
    }

    int httpResponseCode = http.POST(jsonString);
    if (httpResponseCode > 0) {
      Serial.print("[SafeWay Gateway] Sync OK. Code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("[SafeWay Gateway] Error: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }
}
