/**
 * SafeWay V3 — Real-Time Pedestrian Dead Reckoning & Motion Tracker
 * Fuses Device Accelerometer (step counting) and Magnetometer (compass heading)
 * with Route Polyline Snapping and Landmark QR Correction.
 */

export class MotionTracker {
  constructor(options = {}) {
    this.stepLengthMeters = options.stepLengthMeters || 0.75;
    this.stepThreshold = options.stepThreshold || 11.8;
    this.stepDebounceMs = options.stepDebounceMs || 320;
    
    this.lastStepTime = 0;
    this.stepCount = 0;
    this.headingDegrees = 0;
    this.distanceTraveledMeters = 0;
    this.isTracking = false;
    this.hasPermission = false;
    
    this.listeners = new Set();
    this.motionHandler = this.handleMotion.bind(this);
    this.orientationHandler = this.handleOrientation.bind(this);
  }

  /**
   * Request iOS 13+ / Web Sensor permissions if required
   */
  async requestPermission() {
    if (typeof window === 'undefined') return false;

    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const motionResp = await DeviceMotionEvent.requestPermission();
        const orientResp = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'
          ? await DeviceOrientationEvent.requestPermission()
          : 'granted';
        this.hasPermission = (motionResp === 'granted' && orientResp === 'granted');
        return this.hasPermission;
      } catch (e) {
        console.warn('[MotionTracker] Permission error:', e);
        return false;
      }
    }
    this.hasPermission = true;
    return true;
  }

  /**
   * Start listening to device sensors
   */
  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    this.isTracking = true;
    window.addEventListener('devicemotion', this.motionHandler, { passive: true });
    window.addEventListener('deviceorientation', this.orientationHandler, { passive: true });
  }

  /**
   * Stop listening to device sensors
   */
  stop() {
    if (typeof window === 'undefined' || !this.isTracking) return;
    this.isTracking = false;
    window.removeEventListener('devicemotion', this.motionHandler);
    window.removeEventListener('deviceorientation', this.orientationHandler);
  }

  /**
   * Accelerometer step detection algorithm
   */
  handleMotion(event) {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;
    const magnitude = Math.hypot(x, y, z);

    const now = Date.now();
    if (magnitude > this.stepThreshold && now - this.lastStepTime > this.stepDebounceMs) {
      this.lastStepTime = now;
      this.stepCount += 1;
      this.distanceTraveledMeters += this.stepLengthMeters;
      this.notify({ type: 'STEP', stepCount: this.stepCount, distance: this.distanceTraveledMeters });
    }
  }

  /**
   * Compass heading calculation
   */
  handleOrientation(event) {
    let heading = 0;
    if (typeof event.webkitCompassHeading !== 'undefined') {
      // iOS Safari native compass
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android standard orientation (alpha is counter-clockwise around z)
      heading = (360 - event.alpha) % 360;
    }
    this.headingDegrees = Math.round(heading);
    this.notify({ type: 'ORIENTATION', heading: this.headingDegrees });
  }

  /**
   * Manually simulate a step (for Desktop presentation demo or testing)
   */
  simulateStep(distanceMeters = null) {
    const delta = distanceMeters !== null ? distanceMeters : this.stepLengthMeters;
    this.stepCount += 1;
    this.distanceTraveledMeters += delta;
    this.notify({ type: 'STEP', stepCount: this.stepCount, distance: this.distanceTraveledMeters, simulated: true });
  }

  /**
   * Reset tracking when user scans a QR checkpoint
   */
  resetToOrigin() {
    this.stepCount = 0;
    this.distanceTraveledMeters = 0;
    this.notify({ type: 'RESET', stepCount: 0, distance: 0 });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach(cb => {
      try { cb(event); } catch (e) {
        console.warn('[MotionTracker] listener error:', e);
      }
    });
  }
}

/**
 * Calculates (x, y) coordinates along a polyline path given a traveled distance
 */
export function interpolatePositionOnRoute(points, traveledDistancePx) {
  if (!points || points.length === 0) return null;
  if (points.length === 1 || traveledDistancePx <= 0) return points[0];

  let accumulated = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segDist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);

    if (accumulated + segDist >= traveledDistancePx) {
      const remaining = traveledDistancePx - accumulated;
      const t = segDist > 0 ? remaining / segDist : 0;
      const x = p1[0] + t * (p2[0] - p1[0]);
      const y = p1[1] + t * (p2[1] - p1[1]);
      const angleDeg = Math.round((Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI);
      return [x, y, angleDeg];
    }
    accumulated += segDist;
  }

  // Traveled past the end of the route: clamp to final point
  const last = points[points.length - 1];
  return [last[0], last[1], 0];
}
