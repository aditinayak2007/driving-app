/**
 * Realistic Indian Vehicle Physics Simulator
 * Right-Hand-Drive dynamics, gear-ratio torque curves, body roll/pitch, and braking.
 */

export const GEAR_CONFIG = {
  'R': { ratio: -3.4, maxSpeedKmh: 28, maxAccel: 3.2, minRpmSpeed: 0 },
  'N': { ratio: 0,    maxSpeedKmh: 0,  maxAccel: 0,   minRpmSpeed: 0 },
  '1': { ratio: 3.8,  maxSpeedKmh: 35, maxAccel: 5.8, minRpmSpeed: 0 },
  '2': { ratio: 2.2,  maxSpeedKmh: 62, maxAccel: 4.2, minRpmSpeed: 18 },
  '3': { ratio: 1.5,  maxSpeedKmh: 95, maxAccel: 2.9, minRpmSpeed: 38 },
  '4': { ratio: 1.0,  maxSpeedKmh: 130, maxAccel: 1.9, minRpmSpeed: 60 },
  '5': { ratio: 0.8,  maxSpeedKmh: 175, maxAccel: 1.2, minRpmSpeed: 85 }
};

export class VehiclePhysics {
  constructor(carConfig = {}) {
    this.carConfig = carConfig;
    
    // Position & Orientation
    this.x = -3.2; // Default left side of road (Indian left-side driving!)
    this.y = 0;
    this.z = 0;
    this.yaw = 0; // heading in radians

    // Motion variables
    this.speed = 0; // m/s (positive = forward, negative = reverse)
    this.speedKmh = 0;
    this.acceleration = 0;
    this.steeringAngle = 0; // visual wheel turning angle in radians
    this.bodyRoll = 0;      // visual chassis roll in radians
    this.bodyPitch = 0;     // visual chassis pitch (dive/squat) in radians

    // Transmission & Engine
    this.currentGear = 'N';
    this.rpm = 900;
    this.idleRpm = 850;
    this.maxRpm = 6200;
    this.engineStarted = false;
    this.fuel = 100; // percentage
    this.odometer = 0; // meters driven

    // Vehicle specs
    this.wheelbase = 2.75; // meters
    this.maxSteerAngle = 0.58; // approx 33 degrees
    this.turnRate = 0;

    // Road limits
    this.roadLeftBound = -8.5;
    this.roadRightBound = 8.5;
    this.hasCollided = false;
  }

  startEngine() {
    this.engineStarted = true;
    this.rpm = 1000;
  }

  stopEngine() {
    this.engineStarted = false;
    this.rpm = 0;
    this.speed = 0;
  }

  setGear(gear) {
    if (GEAR_CONFIG[gear]) {
      this.currentGear = gear;
      return true;
    }
    return false;
  }

  /**
   * Main physics integration step
   * @param {number} dt Delta time in seconds
   * @param {number} steerInput Normalized steering input (-1.0 left, +1.0 right)
   * @param {number} throttleInput Normalized throttle (0.0 to 1.0)
   * @param {number} brakeInput Normalized brake (0.0 to 1.0)
   */
  update(dt, steerInput = 0, throttleInput = 0, brakeInput = 0) {
    if (!this.engineStarted) {
      this.rpm = 0;
      this.speed *= Math.max(0, 1 - 2.0 * dt);
      return;
    }

    // Clamp dt for physics stability
    const step = Math.min(dt, 0.05);

    const gearData = GEAR_CONFIG[this.currentGear] || GEAR_CONFIG['N'];
    const maxSpeedMs = (gearData.maxSpeedKmh / 3.6);

    // --- STEERING DYNAMICS ---
    // At higher speeds, steering sensitivity automatically reduces for realism
    const speedFactor = Math.max(0.2, 1.0 - (Math.abs(this.speedKmh) / 220) * 0.65);
    const targetSteerAngle = steerInput * this.maxSteerAngle * speedFactor;
    // Smooth wheel turn lerp
    this.steeringAngle += (targetSteerAngle - this.steeringAngle) * (14.0 * step);

    // --- ACCELERATION & ENGINE TORQUE ---
    let driveForce = 0;

    if (this.currentGear === 'N') {
      // Free revving in neutral
      const targetRpm = this.idleRpm + throttleInput * (this.maxRpm - this.idleRpm) * 0.95;
      this.rpm += (targetRpm - this.rpm) * (10.0 * step);
      // Decelerate if rolling
      driveForce = 0;
    } else if (this.currentGear === 'R') {
      // Reverse gear
      if (this.speed <= 0) {
        driveForce = -throttleInput * gearData.maxAccel;
      } else {
        // Natural resistance if in R while moving forward
        driveForce = -gearData.maxAccel * 0.8;
      }
      const revFraction = Math.min(1.0, Math.abs(this.speed) / (maxSpeedMs || 1));
      this.rpm = this.idleRpm + revFraction * 3600 + throttleInput * 900;
    } else {
      // Forward gears (1 to 5)
      if (this.speed >= 0) {
        // Torque diminishes near gear top speed
        const speedRatio = Math.min(1.0, this.speed / (maxSpeedMs || 1));
        const torqueMultiplier = Math.max(0.1, 1.0 - Math.pow(speedRatio, 2.5));
        driveForce = throttleInput * gearData.maxAccel * torqueMultiplier;
        
        // Calculate realistic RPM from wheel speed & throttle
        const baseRpm = this.idleRpm + (this.speed / maxSpeedMs) * (this.maxRpm - this.idleRpm - 800);
        this.rpm = Math.min(this.maxRpm, Math.max(this.idleRpm, baseRpm + throttleInput * 600));
      } else {
        // Moving backwards in forward gear
        driveForce = gearData.maxAccel * 0.8;
      }
    }

    // --- BRAKING & ROLLING RESISTANCE ---
    const brakeForce = brakeInput * 9.5; // m/s^2 deceleration
    const rollingResistance = 0.45; // friction
    const aeroDrag = 0.0018 * Math.pow(this.speed, 2);

    let netAccel = driveForce;

    // Apply brake in direction opposite to current motion
    if (this.speed > 0.05) {
      netAccel -= (brakeForce + rollingResistance + aeroDrag);
      if (netAccel < 0 && this.speed + netAccel * step < 0) {
        this.speed = 0;
        netAccel = 0;
      }
    } else if (this.speed < -0.05) {
      netAccel += (brakeForce + rollingResistance + aeroDrag);
      if (netAccel > 0 && this.speed + netAccel * step > 0) {
        this.speed = 0;
        netAccel = 0;
      }
    } else {
      if (brakeInput > 0.1) {
        this.speed = 0;
        netAccel = 0;
      }
    }

    // Integrate speed
    this.speed += netAccel * step;

    // Hard clamp to gear limit
    if (this.currentGear === 'R') {
      this.speed = Math.max(-maxSpeedMs, Math.min(0, this.speed));
    } else if (this.currentGear !== 'N') {
      this.speed = Math.min(maxSpeedMs, Math.max(0, this.speed));
    }

    this.speedKmh = this.speed * 3.6;
    this.acceleration = netAccel;

    // --- BICYCLE KINEMATICS (STEERING) ---
    // yaw rate = (v / wheelbase) * tan(steeringAngle)
    if (Math.abs(this.speed) > 0.1) {
      const angularVelocity = (this.speed / this.wheelbase) * Math.sin(this.steeringAngle);
      this.yaw += angularVelocity * step;
    }

    // --- POSITION UPDATE ---
    const dx = Math.sin(this.yaw) * this.speed * step;
    const dz = Math.cos(this.yaw) * this.speed * step;

    this.x += dx;
    this.z += dz;
    this.odometer += Math.abs(this.speed * step);

    // Fuel consumption
    if (this.engineStarted && this.fuel > 0) {
      this.fuel = Math.max(0, this.fuel - (0.001 + throttleInput * 0.005) * step);
    }

    // --- ROAD BOUNDARY & COLLISION HANDLING ---
    this.hasCollided = false;
    if (this.x < this.roadLeftBound) {
      this.x = this.roadLeftBound;
      this.speed *= 0.5; // curb drag
      this.hasCollided = true;
    } else if (this.x > this.roadRightBound) {
      this.x = this.roadRightBound;
      this.speed *= 0.5;
      this.hasCollided = true;
    }

    // --- SUSPENSION BODY ROLL & PITCH (VISUAL CHASSIS DYNAMICS) ---
    // Roll opposes steering when moving forward
    const lateralG = (Math.pow(this.speed, 2) / 15.0) * Math.sin(this.steeringAngle);
    const targetRoll = -Math.max(-0.12, Math.min(0.12, lateralG * 0.04));
    this.bodyRoll += (targetRoll - this.bodyRoll) * (8.0 * step);

    // Pitch: nose dives on brake, squats on acceleration
    const targetPitch = Math.max(-0.08, Math.min(0.08, (netAccel / 9.8) * 0.03));
    this.bodyPitch += (targetPitch - this.bodyPitch) * (10.0 * step);
  }

  reset(x = -3.2, z = 0, yaw = 0) {
    this.x = x;
    this.y = 0;
    this.z = z;
    this.yaw = yaw;
    this.speed = 0;
    this.speedKmh = 0;
    this.acceleration = 0;
    this.steeringAngle = 0;
    this.bodyRoll = 0;
    this.bodyPitch = 0;
    this.currentGear = 'N';
    this.rpm = 900;
  }
}
