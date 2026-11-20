import * as THREE from 'three';

/**
 * Creates a high-detail Right-Hand-Drive Indian 3D vehicle model
 * Supports: Mahindra Scorpio-N, Tata Nexon, and Maruti Suzuki Swift
 */
export function createVehicle3D(carData, primaryColorHex = null) {
  const root = new THREE.Group();
  root.name = 'player-vehicle';

  const bodyColor = primaryColorHex || carData.color || '#163323';
  const carType = carData.id;

  // Materials
  const paintMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(bodyColor),
    metalness: 0.85,
    roughness: 0.22,
    envMapIntensity: 1.2
  });

  const blackTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0x181c24,
    roughness: 0.65,
    metalness: 0.3
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.1
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111c28,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.75,
    transparent: true,
    opacity: 0.85
  });

  const interiorMaterial = new THREE.MeshStandardMaterial({
    color: 0x222630,
    roughness: 0.75,
    metalness: 0.1
  });

  const wheelRubberMat = new THREE.MeshStandardMaterial({
    color: 0x1a1c22,
    roughness: 0.85,
    metalness: 0.1
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.9,
    roughness: 0.2
  });

  // Emission materials for lights
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 3.5,
    roughness: 0.1
  });

  const brakelightMat = new THREE.MeshStandardMaterial({
    color: 0x660000,
    emissive: 0x440000,
    emissiveIntensity: 0.6,
    roughness: 0.3
  });

  const indicatorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x000000,
    emissiveIntensity: 0.0,
    roughness: 0.2
  });

  // Dimensions based on car model
  let length = 4.6;
  let width = 1.9;
  let height = 1.75;
  let cabinHeight = 0.85;

  if (carType === 'maruti-swift') {
    length = 3.9;
    width = 1.72;
    height = 1.48;
    cabinHeight = 0.7;
  } else if (carType === 'tata-nexon') {
    length = 4.15;
    width = 1.82;
    height = 1.62;
    cabinHeight = 0.78;
  }

  // --- 1. CHASSIS & LOWER BODY ---
  const chassisGeom = new THREE.BoxGeometry(width, height * 0.45, length);
  const chassis = new THREE.Mesh(chassisGeom, paintMaterial);
  chassis.position.y = height * 0.42;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  root.add(chassis);

  // Front bumper / Indian grille
  const grilleGeom = new THREE.BoxGeometry(width * 0.92, height * 0.3, 0.4);
  const grille = new THREE.Mesh(grilleGeom, blackTrimMaterial);
  grille.position.set(0, height * 0.38, length * 0.5 + 0.1);
  root.add(grille);

  // Scorpio Chrome vertical teeth or Tata chrome humanity line
  if (carType === 'scorpio-n') {
    for (let i = -3; i <= 3; i++) {
      const toothGeom = new THREE.BoxGeometry(0.04, 0.22, 0.04);
      const tooth = new THREE.Mesh(toothGeom, chromeMaterial);
      tooth.position.set(i * 0.18, height * 0.38, length * 0.5 + 0.28);
      root.add(tooth);
    }
  } else {
    const barGeom = new THREE.BoxGeometry(width * 0.75, 0.05, 0.05);
    const bar = new THREE.Mesh(barGeom, chromeMaterial);
    bar.position.set(0, height * 0.45, length * 0.5 + 0.28);
    root.add(bar);
  }

  // --- 2. CABIN & ROOF ---
  const cabinGeom = new THREE.BoxGeometry(width * 0.88, cabinHeight, length * 0.6);
  const cabin = new THREE.Mesh(cabinGeom, paintMaterial);
  cabin.position.set(0, height * 0.82, -length * 0.05);
  cabin.castShadow = true;
  root.add(cabin);

  // Windshield (tilted forward glass)
  const windshieldGeom = new THREE.PlaneGeometry(width * 0.82, cabinHeight * 1.05);
  const windshield = new THREE.Mesh(windshieldGeom, glassMaterial);
  windshield.position.set(0, height * 0.82, length * 0.26);
  windshield.rotation.x = -0.42;
  root.add(windshield);

  // Rear windshield
  const rearGlass = new THREE.Mesh(windshieldGeom, glassMaterial);
  rearGlass.position.set(0, height * 0.82, -length * 0.35);
  rearGlass.rotation.x = 0.42;
  rearGlass.rotation.y = Math.PI;
  root.add(rearGlass);

  // Side windows
  const sideGlassGeom = new THREE.PlaneGeometry(length * 0.55, cabinHeight * 0.65);
  const leftGlass = new THREE.Mesh(sideGlassGeom, glassMaterial);
  leftGlass.position.set(-width * 0.445, height * 0.85, -length * 0.05);
  leftGlass.rotation.y = -Math.PI / 2;
  root.add(leftGlass);

  const rightGlass = new THREE.Mesh(sideGlassGeom, glassMaterial);
  rightGlass.position.set(width * 0.445, height * 0.85, -length * 0.05);
  rightGlass.rotation.y = Math.PI / 2;
  root.add(rightGlass);

  // --- 3. RIGHT-HAND-DRIVE (RHD) INDIAN COCKPIT ---
  // Dashboard slab
  const dashGeom = new THREE.BoxGeometry(width * 0.82, 0.28, 0.55);
  const dashboard = new THREE.Mesh(dashGeom, interiorMaterial);
  dashboard.position.set(0, height * 0.65, length * 0.15);
  root.add(dashboard);

  // Right-Hand Driver Seat (Indian spec: right side x > 0)
  const driverSeatX = width * 0.25;
  const passSeatX = -width * 0.25;

  const seatBaseGeom = new THREE.BoxGeometry(0.5, 0.15, 0.5);
  const seatBackGeom = new THREE.BoxGeometry(0.48, 0.65, 0.12);

  // Driver seat
  const driverSeatBase = new THREE.Mesh(seatBaseGeom, interiorMaterial);
  driverSeatBase.position.set(driverSeatX, height * 0.38, -0.15);
  const driverSeatBack = new THREE.Mesh(seatBackGeom, interiorMaterial);
  driverSeatBack.position.set(driverSeatX, height * 0.7, -0.38);
  driverSeatBack.rotation.x = 0.15;
  root.add(driverSeatBase, driverSeatBack);

  // Passenger seat (left side)
  const passSeatBase = new THREE.Mesh(seatBaseGeom, interiorMaterial);
  passSeatBase.position.set(passSeatX, height * 0.38, -0.15);
  const passSeatBack = new THREE.Mesh(seatBackGeom, interiorMaterial);
  passSeatBack.position.set(passSeatX, height * 0.7, -0.38);
  passSeatBack.rotation.x = 0.15;
  root.add(passSeatBase, passSeatBack);

  // FUNCTIONAL 3D STEERING WHEEL ON THE RIGHT SIDE
  const steeringGroup = new THREE.Group();
  steeringGroup.position.set(driverSeatX, height * 0.75, 0.18);
  steeringGroup.rotation.x = 0.4; // tilted towards driver

  // Steering column
  const columnGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.25, 12);
  const column = new THREE.Mesh(columnGeom, blackTrimMaterial);
  column.rotation.x = Math.PI / 2;
  steeringGroup.add(column);

  // Steering rim (torus)
  const rimGeom = new THREE.TorusGeometry(0.19, 0.024, 12, 32);
  const steeringRim = new THREE.Mesh(rimGeom, blackTrimMaterial);
  steeringGroup.add(steeringRim);

  // Spokes & Center horn pad
  const hubGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 16);
  const hub = new THREE.Mesh(hubGeom, chromeMaterial);
  hub.rotation.x = Math.PI / 2;
  steeringGroup.add(hub);

  const spokeGeom = new THREE.BoxGeometry(0.34, 0.03, 0.015);
  const spokeH = new THREE.Mesh(spokeGeom, blackTrimMaterial);
  steeringGroup.add(spokeH);

  root.add(steeringGroup);

  // 3D Gear Shift Lever
  const gearStickGroup = new THREE.Group();
  gearStickGroup.position.set(0.02, height * 0.52, -0.05);
  const stickGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8);
  const stick = new THREE.Mesh(stickGeom, chromeMaterial);
  const knobGeom = new THREE.SphereGeometry(0.038, 12, 12);
  const knob = new THREE.Mesh(knobGeom, blackTrimMaterial);
  knob.position.y = 0.09;
  gearStickGroup.add(stick, knob);
  root.add(gearStickGroup);

  // --- 4. LIGHTS (HEADLIGHTS & BRAKE LIGHTS) ---
  const headlightGeom = new THREE.BoxGeometry(0.28, 0.14, 0.05);

  // Left headlight
  const leftHeadlight = new THREE.Mesh(headlightGeom, headlightMat);
  leftHeadlight.position.set(-width * 0.38, height * 0.45, length * 0.5 + 0.12);
  root.add(leftHeadlight);

  // Right headlight
  const rightHeadlight = new THREE.Mesh(headlightGeom, headlightMat);
  rightHeadlight.position.set(width * 0.38, height * 0.45, length * 0.5 + 0.12);
  root.add(rightHeadlight);

  // Real Three.js Spotlights casting light onto Indian highway
  const leftSpot = new THREE.SpotLight(0xffffff, 8, 45, Math.PI / 5, 0.3, 1.2);
  leftSpot.position.set(-width * 0.38, height * 0.45, length * 0.5 + 0.2);
  const leftTarget = new THREE.Object3D();
  leftTarget.position.set(-width * 0.38, 0, length * 0.5 + 25);
  root.add(leftSpot, leftTarget);
  leftSpot.target = leftTarget;

  const rightSpot = new THREE.SpotLight(0xffffff, 8, 45, Math.PI / 5, 0.3, 1.2);
  rightSpot.position.set(width * 0.38, height * 0.45, length * 0.5 + 0.2);
  const rightTarget = new THREE.Object3D();
  rightTarget.position.set(width * 0.38, 0, length * 0.5 + 25);
  root.add(rightSpot, rightTarget);
  rightSpot.target = rightTarget;

  // Brake lights (rear)
  const brakeGeom = new THREE.BoxGeometry(0.25, 0.12, 0.05);
  const leftBrake = new THREE.Mesh(brakeGeom, brakelightMat);
  leftBrake.position.set(-width * 0.38, height * 0.5, -length * 0.5 - 0.02);
  root.add(leftBrake);

  const rightBrake = new THREE.Mesh(brakeGeom, brakelightMat);
  rightBrake.position.set(width * 0.38, height * 0.5, -length * 0.5 - 0.02);
  root.add(rightBrake);

  // Turn Indicator lights
  const indGeom = new THREE.BoxGeometry(0.12, 0.08, 0.04);
  const leftIndF = new THREE.Mesh(indGeom, indicatorMat);
  leftIndF.position.set(-width * 0.46, height * 0.45, length * 0.48);
  const leftIndR = new THREE.Mesh(indGeom, indicatorMat);
  leftIndR.position.set(-width * 0.46, height * 0.5, -length * 0.48);
  root.add(leftIndF, leftIndR);

  const rightIndF = new THREE.Mesh(indGeom, indicatorMat);
  rightIndF.position.set(width * 0.46, height * 0.45, length * 0.48);
  const rightIndR = new THREE.Mesh(indGeom, indicatorMat);
  rightIndR.position.set(width * 0.46, height * 0.5, -length * 0.48);
  root.add(rightIndF, rightIndR);

  // Indian Number Plates (White plate with IND blue strip & MH/KA lettering)
  const plateGeom = new THREE.BoxGeometry(0.42, 0.12, 0.02);
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const frontPlate = new THREE.Mesh(plateGeom, plateMat);
  frontPlate.position.set(0, height * 0.22, length * 0.5 + 0.16);
  const rearPlate = new THREE.Mesh(plateGeom, plateMat);
  rearPlate.position.set(0, height * 0.32, -length * 0.5 - 0.04);
  root.add(frontPlate, rearPlate);

  // --- 5. WHEELS & SUSPENSION ---
  const wheelRadius = height * 0.23;
  const wheelWidth = 0.24;
  const wheelGeom = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
  wheelGeom.rotateZ(Math.PI / 2);

  const rimGeomWheel = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelWidth + 0.01, 16);
  rimGeomWheel.rotateZ(Math.PI / 2);

  const createWheel = (name, isFront) => {
    const wheelAssembly = new THREE.Group();
    wheelAssembly.name = name;

    const tire = new THREE.Mesh(wheelGeom, wheelRubberMat);
    tire.castShadow = true;
    const rim = new THREE.Mesh(rimGeomWheel, rimMaterial);
    
    // Spokes inside rim
    for (let s = 0; s < 5; s++) {
      const spokeSp = new THREE.Mesh(new THREE.BoxGeometry(0.03, wheelRadius * 1.2, wheelWidth + 0.012), rimMaterial);
      spokeSp.rotation.x = (s * Math.PI) / 2.5;
      wheelAssembly.add(spokeSp);
    }

    wheelAssembly.add(tire, rim);
    return { assembly: wheelAssembly, isFront };
  };

  const wheelX = width * 0.48;
  const wheelZFront = length * 0.32;
  const wheelZRear = -length * 0.32;
  const wheelY = wheelRadius;

  const wheels = [];

  const flWheel = createWheel('wheel-fl', true);
  flWheel.assembly.position.set(-wheelX, wheelY, wheelZFront);
  root.add(flWheel.assembly);
  wheels.push(flWheel);

  const frWheel = createWheel('wheel-fr', true);
  frWheel.assembly.position.set(wheelX, wheelY, wheelZFront);
  root.add(frWheel.assembly);
  wheels.push(frWheel);

  const rlWheel = createWheel('wheel-rl', false);
  rlWheel.assembly.position.set(-wheelX, wheelY, wheelZRear);
  root.add(rlWheel.assembly);
  wheels.push(rlWheel);

  const rrWheel = createWheel('wheel-rr', false);
  rrWheel.assembly.position.set(wheelX, wheelY, wheelZRear);
  root.add(rrWheel.assembly);
  wheels.push(rrWheel);

  // Return handle object with update functions
  return {
    group: root,
    steeringGroup,
    gearStickGroup,
    wheels,
    brakelightMat,
    leftIndF, leftIndR,
    rightIndF, rightIndR,
    wheelRadius,
    driverSeatPos: new THREE.Vector3(driverSeatX, height * 0.95, -0.05),
    update: (speedKmh, steerAngle, isBraking, isLeftInd, isRightInd, currentGear) => {
      // 1. Rotate steering wheel
      steeringGroup.rotation.z = -steerAngle * 1.5;

      // 2. Rotate front wheel assemblies for turning
      flWheel.assembly.rotation.y = steerAngle;
      frWheel.assembly.rotation.y = steerAngle;

      // 3. Spin all wheels based on forward motion
      const rotationSpeed = (speedKmh / 3.6) * 0.06;
      wheels.forEach(w => {
        w.assembly.children[0].rotation.x += rotationSpeed;
        w.assembly.children[1].rotation.x += rotationSpeed;
      });

      // 4. Brake light intensity
      if (isBraking) {
        brakelightMat.emissive.setHex(0xff0000);
        brakelightMat.emissiveIntensity = 4.0;
      } else {
        brakelightMat.emissive.setHex(0x440000);
        brakelightMat.emissiveIntensity = 0.5;
      }

      // 5. Indicators blink
      const timeMs = performance.now();
      const blinkOn = Math.floor(timeMs / 450) % 2 === 0;

      if (isLeftInd && blinkOn) {
        leftIndF.material.emissive.setHex(0xf59e0b);
        leftIndF.material.emissiveIntensity = 2.5;
        leftIndR.material.emissive.setHex(0xf59e0b);
        leftIndR.material.emissiveIntensity = 2.5;
      } else {
        leftIndF.material.emissive.setHex(0x000000);
        leftIndF.material.emissiveIntensity = 0;
        leftIndR.material.emissive.setHex(0x000000);
        leftIndR.material.emissiveIntensity = 0;
      }

      if (isRightInd && blinkOn) {
        rightIndF.material.emissive.setHex(0xf59e0b);
        rightIndF.material.emissiveIntensity = 2.5;
        rightIndR.material.emissive.setHex(0xf59e0b);
        rightIndR.material.emissiveIntensity = 2.5;
      } else {
        rightIndF.material.emissive.setHex(0x000000);
        rightIndF.material.emissiveIntensity = 0;
        rightIndR.material.emissive.setHex(0x000000);
        rightIndR.material.emissiveIntensity = 0;
      }

      // 6. Gear stick tilt
      if (currentGear === 'R') gearStickGroup.rotation.x = -0.25;
      else if (currentGear === '1') gearStickGroup.rotation.x = 0.22;
      else if (currentGear === '2') gearStickGroup.rotation.x = -0.18;
      else if (currentGear === '3') gearStickGroup.rotation.x = 0.22;
      else if (currentGear === '4') gearStickGroup.rotation.x = -0.18;
      else if (currentGear === '5') gearStickGroup.rotation.x = 0.22;
      else gearStickGroup.rotation.x = 0;
    }
  };
}
