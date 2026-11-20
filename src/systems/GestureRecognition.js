/**
 * High-Speed, Forgiving Computer Vision Gesture Recognition System
 * for DRIVE INDIA 3D: Ultra-fast two-hand or single-hand steering,
 * relaxed fist throttle, easy open-palm brake, pinch/point gear shift, and horn.
 */

export class GestureRecognition {
  constructor(config = {}) {
    this.steeringSensitivity = config.steeringSensitivity || 1.8;
    this.steeringDeadzone = config.steeringDeadzone || 0.035; // Lower deadzone for instant reaction
    this.throttleSensitivity = config.throttleSensitivity || 1.3;

    // Fast smoothing values (higher factor = snappier response)
    this.smoothedSteer = 0;
    this.smoothedThrottle = 0;
    this.smoothedBrake = 0;

    // Latches & debouncing
    this.lastPinchTime = 0;
    this.pinchLatched = false;
    this.lastPointTime = 0;
    this.pointLatched = false;
    this.lastCameraGestureTime = 0;
    this.cameraLatched = false;

    // Active gestures state
    this.currentGestures = {
      isSteering: false,
      steerAngle: 0,        // -1.0 to +1.0
      steerAngleDegrees: 0, // e.g. -45 to +45 deg
      isAccelerating: false,
      throttle: 0,          // 0.0 to 1.0
      isBraking: false,
      brake: 0,             // 0.0 to 1.0
      isHorn: false,
      isLeftIndicator: false,
      isRightIndicator: false,
      isPinching: false,
      pinchGearRequested: null,
      cameraToggleRequested: false,
      summaryText: 'Waiting for hands...',
      leftHandPresent: false,
      rightHandPresent: false
    };
  }

  setSensitivity(steerSens, deadzone, throttleSens) {
    if (steerSens !== undefined) this.steeringSensitivity = steerSens;
    if (deadzone !== undefined) this.steeringDeadzone = deadzone;
    if (throttleSens !== undefined) this.throttleSensitivity = throttleSens;
  }

  /**
   * Fast Euclidean distance
   */
  dist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.hypot(dx, dy);
  }

  /**
   * Easy & Forgiving Fist Check:
   * Considers it a fist if at least 2 of the 4 fingers are curled towards palm,
   * or if fingertip is close to MCP. Does not require stiff/perfect clench.
   */
  isFist(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const wrist = landmarks[0];

    // Check index, middle, ring, pinky tips vs their MCPs
    let curledCount = 0;
    const fingers = [
      { tip: 8, mcp: 5 },
      { tip: 12, mcp: 9 },
      { tip: 16, mcp: 13 },
      { tip: 20, mcp: 17 }
    ];

    for (const f of fingers) {
      const dTip = this.dist(landmarks[f.tip], wrist);
      const dMcp = this.dist(landmarks[f.mcp], wrist);
      // If fingertip is close to or below MCP distance from wrist
      if (dTip < dMcp * 1.25) {
        curledCount++;
      }
    }

    // Relaxed: 2 or more curled fingers count as a fist/throttle gesture!
    return curledCount >= 2;
  }

  /**
   * Easy Open Palm Check:
   * Relaxed: At least 3 fingers extended away from wrist past the MCPs.
   */
  isOpenPalm(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const wrist = landmarks[0];

    let extendedCount = 0;
    const fingers = [
      { tip: 8, mcp: 5 },
      { tip: 12, mcp: 9 },
      { tip: 16, mcp: 13 },
      { tip: 20, mcp: 17 }
    ];

    for (const f of fingers) {
      const dTip = this.dist(landmarks[f.tip], wrist);
      const dMcp = this.dist(landmarks[f.mcp], wrist);
      if (dTip > dMcp * 1.3) {
        extendedCount++;
      }
    }

    return extendedCount >= 3;
  }

  /**
   * Relaxed Pinch Check:
   * Distance between thumb tip (4) and index tip (8) < 0.095 (generous distance)
   */
  isPinch(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    return this.dist(thumbTip, indexTip) < 0.095;
  }

  /**
   * Easy Pointing Gesture:
   * Index finger extended, other fingers curled.
   */
  isPointing(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const wrist = landmarks[0];
    const dIndex = this.dist(landmarks[8], wrist);
    const dIndexMcp = this.dist(landmarks[5], wrist);
    const dMiddle = this.dist(landmarks[12], wrist);
    const dMiddleMcp = this.dist(landmarks[9], wrist);

    // Index is well extended, middle is curled
    const indexExtended = dIndex > dIndexMcp * 1.35;
    const middleCurled = dMiddle < dMiddleMcp * 1.25;
    return indexExtended && middleCurled;
  }

  /**
   * Easy 3-Fingers Check (Index + Middle + Ring up)
   */
  isThreeFingers(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const wrist = landmarks[0];
    const dIndex = this.dist(landmarks[8], wrist);
    const dMiddle = this.dist(landmarks[12], wrist);
    const dRing = this.dist(landmarks[16], wrist);
    const dPinky = this.dist(landmarks[20], wrist);
    const dMcp = this.dist(landmarks[9], wrist);

    return (
      dIndex > dMcp * 1.3 &&
      dMiddle > dMcp * 1.3 &&
      dRing > dMcp * 1.25 &&
      dPinky < dMcp * 1.3
    );
  }

  /**
   * Process landmarks with high speed & forgiving criteria
   */
  process(results) {
    const now = performance.now();
    const g = {
      isSteering: false,
      steerAngle: 0,
      steerAngleDegrees: 0,
      isAccelerating: false,
      throttle: 0,
      isBraking: false,
      brake: 0,
      isHorn: false,
      isLeftIndicator: false,
      isRightIndicator: false,
      isPinching: false,
      pinchGearRequested: null,
      cameraToggleRequested: false,
      summaryText: 'Hands not detected',
      leftHandPresent: false,
      rightHandPresent: false,
      leftHandPos: null,
      rightHandPos: null
    };

    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      // Snappy decay to neutral when hands drop
      this.smoothedSteer *= 0.75;
      this.smoothedThrottle *= 0.7;
      this.smoothedBrake *= 0.7;
      g.steerAngle = this.smoothedSteer;
      g.throttle = this.smoothedThrottle;
      g.brake = this.smoothedBrake;
      this.currentGestures = g;
      return g;
    }

    const hands = results.multiHandLandmarks;
    let leftHand = null;
    let rightHand = null;

    // Distinguish left vs right hands based on screen position
    for (let i = 0; i < hands.length; i++) {
      const lm = hands[i];
      const wrist = lm[0];
      if (wrist.x < 0.5) {
        if (!leftHand || wrist.x < leftHand[0].x) leftHand = lm;
      } else {
        if (!rightHand || wrist.x > rightHand[0].x) rightHand = lm;
      }
    }

    // Fallback if two hands are slightly shifted to one side
    if (!leftHand && hands.length === 2) {
      leftHand = hands[0][0].x < hands[1][0].x ? hands[0] : hands[1];
      rightHand = hands[0][0].x < hands[1][0].x ? hands[1] : hands[0];
    } else if (hands.length === 1) {
      if (hands[0][0].x < 0.5) leftHand = hands[0];
      else rightHand = hands[0];
    }

    g.leftHandPresent = !!leftHand;
    g.rightHandPresent = !!rightHand;

    // --- 1. EASY STEERING (DUAL HAND OR SINGLE HAND TILT FALLBACK) ---
    if (leftHand && rightHand) {
      // Standard two-hand steering wheel
      g.leftHandPos = leftHand[0];
      g.rightHandPos = rightHand[0];

      const leftY = (leftHand[0].y + leftHand[9].y) * 0.5;
      const rightY = (rightHand[0].y + rightHand[9].y) * 0.5;
      const leftX = (leftHand[0].x + leftHand[9].x) * 0.5;
      const rightX = (rightHand[0].x + rightHand[9].x) * 0.5;

      const dy = rightY - leftY;
      const dx = Math.max(0.12, rightX - leftX);

      // Angle calculation
      const rawAngleRad = Math.atan2(dy, dx);
      const degrees = rawAngleRad * (180 / Math.PI);

      let targetSteer = 0;
      if (Math.abs(rawAngleRad) > this.steeringDeadzone) {
        const sign = rawAngleRad > 0 ? 1 : -1;
        const delta = Math.abs(rawAngleRad) - this.steeringDeadzone;
        targetSteer = Math.min(1.0, Math.max(-1.0, sign * delta * this.steeringSensitivity));
      }

      // Fast, responsive exponential smoothing (0.55 factor = near instantaneous response)
      this.smoothedSteer += (targetSteer - this.smoothedSteer) * 0.55;
      g.steerAngle = this.smoothedSteer;
      g.steerAngleDegrees = degrees;
      g.isSteering = Math.abs(this.smoothedSteer) > 0.05;
    } else if (leftHand || rightHand) {
      // SINGLE-HAND STEERING FALLBACK:
      // Even if one hand dips off camera, you can steer with the single remaining hand!
      const activeHand = rightHand || leftHand;
      const wrist = activeHand[0];
      const middleMcp = activeHand[9];
      
      // Hand tilt angle (wrist to middle knuckle)
      const tiltX = middleMcp.x - wrist.x;
      const tiltY = middleMcp.y - wrist.y;
      const handAngle = Math.atan2(tiltX, -tiltY); // angle from vertical
      
      let targetSteer = 0;
      if (Math.abs(handAngle) > 0.12) {
        targetSteer = Math.min(1.0, Math.max(-1.0, handAngle * 1.5));
      }

      this.smoothedSteer += (targetSteer - this.smoothedSteer) * 0.5;
      g.steerAngle = this.smoothedSteer;
      g.steerAngleDegrees = handAngle * (180 / Math.PI);
      g.isSteering = Math.abs(this.smoothedSteer) > 0.05;
    }

    // --- 2. EASY ACCELERATOR (RIGHT HAND FIST OR THRUST) ---
    const throttleHand = rightHand || (!leftHand ? null : null);
    if (throttleHand) {
      const isFist = this.isFist(throttleHand);
      if (isFist) {
        g.isAccelerating = true;
        this.smoothedThrottle += (1.0 - this.smoothedThrottle) * 0.45; // Snappy gas response
      } else {
        this.smoothedThrottle *= 0.65;
      }
      g.throttle = this.smoothedThrottle;
    } else {
      this.smoothedThrottle *= 0.65;
      g.throttle = this.smoothedThrottle;
    }

    // --- 3. EASY BRAKE (LEFT HAND OPEN PALM) ---
    if (leftHand) {
      const isOpen = this.isOpenPalm(leftHand);
      if (isOpen) {
        g.isBraking = true;
        this.smoothedBrake += (1.0 - this.smoothedBrake) * 0.55; // Fast braking
      } else {
        this.smoothedBrake *= 0.65;
      }
      g.brake = this.smoothedBrake;
    } else {
      this.smoothedBrake *= 0.65;
      g.brake = this.smoothedBrake;
    }

    // --- 4. EASY HORN (DOUBLE FIST OR PALM FORWARD) ---
    if (leftHand && rightHand) {
      if (this.isFist(leftHand) && this.isFist(rightHand)) {
        g.isHorn = true;
      }
    }

    // --- 5. TURN INDICATORS (EASY RAISED HAND) ---
    if (leftHand && leftHand[0].y < 0.38) {
      g.isLeftIndicator = true;
    }
    if (rightHand && rightHand[0].y < 0.38) {
      g.isRightIndicator = true;
    }

    // --- 6. EASY GEAR SHIFTING (PINCH OR POINTING GESTURE) ---
    const gearHand = rightHand || leftHand;
    if (gearHand) {
      const pinching = this.isPinch(gearHand);
      const pointing = this.isPointing(gearHand);
      g.isPinching = pinching;

      if (pinching) {
        if (!this.pinchLatched && (now - this.lastPinchTime > 350)) {
          this.pinchLatched = true;
          this.lastPinchTime = now;
          const y = gearHand[8].y;
          if (y < 0.45) g.pinchGearRequested = 'UP';
          else if (y > 0.65) g.pinchGearRequested = 'DOWN';
          else g.pinchGearRequested = 'NEXT';
        }
      } else {
        this.pinchLatched = false;
      }

      // Pointing up or down shifts gear as well!
      if (pointing) {
        if (!this.pointLatched && (now - this.lastPointTime > 450)) {
          this.pointLatched = true;
          this.lastPointTime = now;
          const y = gearHand[8].y;
          if (y < 0.4) g.pinchGearRequested = 'UP';
          else g.pinchGearRequested = 'NEXT';
        }
      } else {
        this.pointLatched = false;
      }
    }

    // --- 7. CAMERA SWITCH GESTURE (3 FINGERS UP) ---
    const leftThree = leftHand && this.isThreeFingers(leftHand);
    const rightThree = rightHand && this.isThreeFingers(rightHand);
    if ((leftThree || rightThree) && (now - this.lastCameraGestureTime > 750)) {
      if (!this.cameraLatched) {
        g.cameraToggleRequested = true;
        this.cameraLatched = true;
        this.lastCameraGestureTime = now;
      }
    } else if (!leftThree && !rightThree) {
      this.cameraLatched = false;
    }

    // Concise, clear summary for HUD
    const actions = [];
    if (g.isHorn) actions.push('📢 HORN');
    if (g.isBraking) actions.push('🛑 BRAKING');
    if (g.isAccelerating) actions.push('⚡ GAS');
    if (g.isSteering) {
      actions.push(g.steerAngle > 0 ? '↪ RIGHT' : '↩ LEFT');
    }
    if (g.isPinching) actions.push('⚙ PINCH (Gear)');
    if (g.isLeftIndicator) actions.push('⬅ LEFT IND');
    if (g.isRightIndicator) actions.push('➡ RIGHT IND');

    g.summaryText = actions.length > 0 ? actions.join(' • ') : 'Hands Ready • Neutral';
    this.currentGestures = g;
    return g;
  }
}
