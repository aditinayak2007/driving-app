/**
 * High-Precision Computer Vision Gesture Recognition System
 * for DRIVE INDIA 3D: Real-time dual-hand steering, fist throttle,
 * open-palm brake, pinch gear selection, double-fist horn, and indicators.
 */

export class GestureRecognition {
  constructor(config = {}) {
    this.steeringSensitivity = config.steeringSensitivity || 1.6;
    this.steeringDeadzone = config.steeringDeadzone || 0.06;
    this.throttleSensitivity = config.throttleSensitivity || 1.2;

    // Smoothed values
    this.smoothedSteer = 0;
    this.smoothedThrottle = 0;
    this.smoothedBrake = 0;

    // State machine & latches
    this.lastPinchTime = 0;
    this.pinchLatched = false;
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
   * Helper: Euclidean distance between two 2D/3D landmarks
   */
  dist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Helper: Check if hand is a closed fist
   * Fingertips (8, 12, 16, 20) are retracted close to MCPs (5, 9, 13, 17) and wrist (0)
   */
  isFist(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const wrist = landmarks[0];
    
    // Distances from tips to wrist
    const dIndex = this.dist(landmarks[8], wrist);
    const dMiddle = this.dist(landmarks[12], wrist);
    const dRing = this.dist(landmarks[16], wrist);
    const dPinky = this.dist(landmarks[20], wrist);

    // Distances from MCPs to wrist
    const dIndexMcp = this.dist(landmarks[5], wrist);
    const dMiddleMcp = this.dist(landmarks[9], wrist);

    // In a fist, fingertips curl back towards palm (closer than or near MCP distance)
    return (
      dIndex < dIndexMcp * 1.15 &&
      dMiddle < dMiddleMcp * 1.15 &&
      dRing < dIndexMcp * 1.15 &&
      dPinky < dIndexMcp * 1.15
    );
  }

  /**
   * Helper: Check if hand is an open palm facing the camera
   */
  isOpenPalm(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const wrist = landmarks[0];

    const dIndex = this.dist(landmarks[8], wrist);
    const dMiddle = this.dist(landmarks[12], wrist);
    const dRing = this.dist(landmarks[16], wrist);
    const dPinky = this.dist(landmarks[20], wrist);

    const dIndexMcp = this.dist(landmarks[5], wrist);
    const dMiddleMcp = this.dist(landmarks[9], wrist);

    // In open palm, tips are well extended past the MCPs
    return (
      dIndex > dIndexMcp * 1.45 &&
      dMiddle > dMiddleMcp * 1.45 &&
      dRing > dIndexMcp * 1.4 &&
      dPinky > dIndexMcp * 1.3
    );
  }

  /**
   * Helper: Detect Pinch between thumb tip (4) and index tip (8)
   */
  isPinch(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const pinchDist = this.dist(thumbTip, indexTip);
    return pinchDist < 0.065;
  }

  /**
   * Helper: Detect 3-Fingers gesture (Index, Middle, Ring extended, Pinky & Thumb curled)
   */
  isThreeFingers(landmarks) {
    if (!landmarks || landmarks.length < 21) return false;
    const wrist = landmarks[0];
    const dThumb = this.dist(landmarks[4], wrist);
    const dIndex = this.dist(landmarks[8], wrist);
    const dMiddle = this.dist(landmarks[12], wrist);
    const dRing = this.dist(landmarks[16], wrist);
    const dPinky = this.dist(landmarks[20], wrist);

    const dMcp = this.dist(landmarks[9], wrist);

    return (
      dIndex > dMcp * 1.4 &&
      dMiddle > dMcp * 1.4 &&
      dRing > dMcp * 1.35 &&
      dPinky < dMcp * 1.2 &&
      dThumb < dMcp * 1.25
    );
  }

  /**
   * Process landmarks from MediaPipe Hands results
   * @param {Object} results MediaPipe results object
   * @returns {Object} Processed gesture state
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
      // Smooth back to neutral when hands disappear
      this.smoothedSteer *= 0.85;
      this.smoothedThrottle *= 0.8;
      this.smoothedBrake *= 0.8;
      g.steerAngle = this.smoothedSteer;
      g.throttle = this.smoothedThrottle;
      g.brake = this.smoothedBrake;
      this.currentGestures = g;
      return g;
    }

    const hands = results.multiHandLandmarks;
    const handednessList = results.multiHandedness || [];

    let leftHand = null;
    let rightHand = null;

    // Distinguish left vs right hands
    // MediaPipe in selfie mode mirrors, so user's physical left hand appears on screen left (x < 0.5)
    for (let i = 0; i < hands.length; i++) {
      const lm = hands[i];
      const wrist = lm[0];
      const label = handednessList[i]?.label;

      // Primary check based on screen position x (mirrored selfie camera)
      // Screen Left (x < 0.5) is user's real Left Hand
      if (wrist.x < 0.5) {
        if (!leftHand || wrist.x < leftHand[0].x) {
          leftHand = lm;
        }
      } else {
        if (!rightHand || wrist.x > rightHand[0].x) {
          rightHand = lm;
        }
      }
    }

    // Fallback if both hands were placed slightly to one side of midline
    if (!leftHand && hands.length === 2) {
      leftHand = hands[0].x < hands[1].x ? hands[0] : hands[1];
      rightHand = hands[0].x < hands[1].x ? hands[1] : hands[0];
    } else if (hands.length === 1) {
      if (hands[0][0].x < 0.5) leftHand = hands[0];
      else rightHand = hands[0];
    }

    g.leftHandPresent = !!leftHand;
    g.rightHandPresent = !!rightHand;

    // --- 1. TWO-HAND STEERING CONTROL ---
    if (leftHand && rightHand) {
      const leftWrist = leftHand[0];
      const rightWrist = rightHand[0];
      g.leftHandPos = leftWrist;
      g.rightHandPos = rightWrist;

      // Center points (wrist + middle MCP midpoint)
      const leftCenter = {
        x: (leftHand[0].x + leftHand[9].x) * 0.5,
        y: (leftHand[0].y + leftHand[9].y) * 0.5
      };
      const rightCenter = {
        x: (rightHand[0].x + rightHand[9].x) * 0.5,
        y: (rightHand[0].y + rightHand[9].y) * 0.5
      };

      // Angle calculation between the two hands:
      // Note: in screen space, y increases downwards.
      // Clockwise turn: right hand moves down (y increases), left hand moves up (y decreases)
      // dy = yRight - yLeft > 0
      const dx = rightCenter.x - leftCenter.x;
      const dy = rightCenter.y - leftCenter.y;
      
      const rawAngleRad = Math.atan2(dy, Math.max(0.15, dx));
      const degrees = rawAngleRad * (180 / Math.PI);

      // Deadzone filtering
      let normalizedSteer = 0;
      if (Math.abs(rawAngleRad) > this.steeringDeadzone) {
        const sign = rawAngleRad > 0 ? 1 : -1;
        const adjustedAngle = (Math.abs(rawAngleRad) - this.steeringDeadzone) * this.steeringSensitivity;
        normalizedSteer = Math.min(1.0, Math.max(-1.0, sign * adjustedAngle));
      }

      // Smooth steering with exponential moving average
      this.smoothedSteer += (normalizedSteer - this.smoothedSteer) * 0.35;
      g.steerAngle = this.smoothedSteer;
      g.steerAngleDegrees = degrees;
      g.isSteering = Math.abs(this.smoothedSteer) > 0.08;
    } else {
      this.smoothedSteer *= 0.8;
      g.steerAngle = this.smoothedSteer;
    }

    // --- 2. ACCELERATOR CONTROL (Right Hand Closed Fist / Forward Thrust) ---
    if (rightHand) {
      const rightFist = this.isFist(rightHand);
      if (rightFist) {
        g.isAccelerating = true;
        this.smoothedThrottle += (1.0 - this.smoothedThrottle) * 0.28;
      } else {
        this.smoothedThrottle *= 0.8;
      }
      g.throttle = this.smoothedThrottle;
    } else {
      this.smoothedThrottle *= 0.75;
      g.throttle = this.smoothedThrottle;
    }

    // --- 3. BRAKE CONTROL (Left Hand Open Palm) ---
    if (leftHand) {
      const leftOpen = this.isOpenPalm(leftHand);
      if (leftOpen) {
        g.isBraking = true;
        this.smoothedBrake += (1.0 - this.smoothedBrake) * 0.35;
      } else {
        this.smoothedBrake *= 0.75;
      }
      g.brake = this.smoothedBrake;
    } else {
      this.smoothedBrake *= 0.75;
      g.brake = this.smoothedBrake;
    }

    // --- 4. HORN CONTROL (Double Fist) ---
    if (leftHand && rightHand) {
      const leftFist = this.isFist(leftHand);
      const rightFist = this.isFist(rightHand);
      if (leftFist && rightFist) {
        g.isHorn = true;
      }
    }

    // --- 5. TURN INDICATORS (Raised Hand above neutral plane) ---
    // If left hand is held high up (y < 0.28) while right hand is lower
    if (leftHand && leftHand[0].y < 0.28) {
      g.isLeftIndicator = true;
    }
    if (rightHand && rightHand[0].y < 0.28) {
      g.isRightIndicator = true;
    }

    // --- 6. GEAR SHIFTING (Right Hand Pinch Gesture) ---
    if (rightHand) {
      const pinching = this.isPinch(rightHand);
      g.isPinching = pinching;

      if (pinching) {
        if (!this.pinchLatched && (now - this.lastPinchTime > 450)) {
          this.pinchLatched = true;
          this.lastPinchTime = now;
          // Trigger gear change request
          // If hand is in upper half of view, shift UP; if lower half, shift DOWN
          const y = rightHand[8].y;
          if (y < 0.45) {
            g.pinchGearRequested = 'UP';
          } else if (y > 0.65) {
            g.pinchGearRequested = 'DOWN';
          } else {
            g.pinchGearRequested = 'NEXT';
          }
        }
      } else {
        this.pinchLatched = false;
      }
    }

    // --- 7. CAMERA SWITCH GESTURE (3 Fingers Extended on Either Hand) ---
    const leftThree = leftHand && this.isThreeFingers(leftHand);
    const rightThree = rightHand && this.isThreeFingers(rightHand);
    if ((leftThree || rightThree) && (now - this.lastCameraGestureTime > 900)) {
      if (!this.cameraLatched) {
        g.cameraToggleRequested = true;
        this.cameraLatched = true;
        this.lastCameraGestureTime = now;
      }
    } else if (!leftThree && !rightThree) {
      this.cameraLatched = false;
    }

    // Summary description for HUD
    const actions = [];
    if (g.isHorn) actions.push('🔊 HORN (Double Fist)');
    else {
      if (g.isBraking) actions.push('🛑 BRAKING (Left Open Palm)');
      if (g.isAccelerating) actions.push('⚡ ACCELERATING (Right Fist)');
    }
    if (g.isSteering) {
      actions.push(g.steerAngle > 0 ? '↪ STEERING RIGHT' : '↩ STEERING LEFT');
    }
    if (g.isPinching) actions.push('⚙ PINCH (Gear Shift)');
    if (g.isLeftIndicator) actions.push('⬅ LEFT INDICATOR');
    if (g.isRightIndicator) actions.push('➡ RIGHT INDICATOR');

    g.summaryText = actions.length > 0 ? actions.join(' | ') : 'Hands Ready • Neutral';
    this.currentGestures = g;
    return g;
  }
}
