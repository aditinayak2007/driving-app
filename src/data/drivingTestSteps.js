export const DRIVING_TEST_STEPS = [
  {
    id: 'ignition',
    title: 'Stage 1: Engine Ignition & Readiness',
    instruction: 'Ensure car is in Neutral (N) and hold both hands on the imaginary steering wheel.',
    targetGear: 'N',
    minHoldTime: 2.5,
    points: 15,
    tip: 'Keep hands level at 9 and 3 o\'clock position.'
  },
  {
    id: 'shift_first',
    title: 'Stage 2: Shift into 1st Gear',
    instruction: 'Pinch thumb & index finger to shift into 1st Gear (1).',
    targetGear: '1',
    points: 15,
    tip: 'Pinch gesture selects the gear.'
  },
  {
    id: 'takeoff',
    title: 'Stage 3: Smooth Takeoff & Left Lane Keeping',
    instruction: 'Close right fist to accelerate gently. Stay on the LEFT side of the track (Indian traffic rule).',
    targetSpeedMin: 12,
    targetSpeedMax: 28,
    requiredDistance: 45,
    points: 20,
    tip: 'Avoid over-revving; maintain left lane.'
  },
  {
    id: 'curve_turn',
    title: 'Stage 4: "8" Track Curve Steering',
    instruction: 'Turn hands clockwise for right curve, then counter-clockwise for left curve without touching boundary cones.',
    minSteerAngle: 0.25,
    points: 25,
    tip: 'Rotate your hands like turning a real steering wheel.'
  },
  {
    id: 'signal_stop',
    title: 'Stage 5: Traffic Signal Stop',
    instruction: 'Red light detected ahead! Show LEFT OPEN PALM to brake smoothly before the stop line.',
    targetSpeed: 0,
    stopZoneDistance: 8,
    points: 15,
    tip: 'Spread left palm fingers wide towards camera to brake.'
  },
  {
    id: 'reverse_park',
    title: 'Stage 6: Reverse Bay Parking',
    instruction: 'Pinch to shift to Reverse (R). Back up into the parking bay between the safety cones.',
    targetGear: 'R',
    requiredReverseDistance: 12,
    points: 20,
    tip: 'Steer carefully in reverse at under 15 km/h.'
  }
];
