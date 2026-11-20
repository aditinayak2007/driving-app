import * as THREE from 'three';

/**
 * Left-Hand Traffic System for DRIVE INDIA 3D
 * Generates realistic Indian traffic: Auto-Rickshaws, KSRTC Buses, Commuter Cars, and Motorbikes.
 * Vehicles strictly follow Indian road rules (left-hand driving).
 */
export class TrafficSystem {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = 'indian-traffic';
    this.scene.add(this.root);

    this.trafficVehicles = [];
    this.maxVehicles = 8;

    // Materials
    this.autoYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // Auto yellow
    this.autoBlackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    this.ksrtcRedMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });   // KSRTC Red
    this.whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    this.glassMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.1 });
    this.tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    this.initTraffic();
  }

  initTraffic() {
    // Spawn initial set of vehicles ahead and around player
    for (let i = 0; i < this.maxVehicles; i++) {
      this.spawnRandomVehicle(30 + i * 40);
    }
  }

  spawnRandomVehicle(zPos) {
    const types = ['auto', 'ksrtc', 'car', 'bike'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Choose lane:
    // Forward traffic (same direction as player, Left side): x = -5.0 (slow lane) or x = -2.3 (fast lane)
    // Oncoming traffic (opposite direction, Indian road): x = 2.3 or x = 5.0
    const isOncoming = Math.random() > 0.65;
    let laneX = 0;
    let speed = 0;
    let direction = 1;

    if (!isOncoming) {
      laneX = Math.random() > 0.5 ? -4.8 : -2.3;
      speed = (type === 'auto' ? 10 : type === 'ksrtc' ? 14 : 17) + Math.random() * 3;
      direction = 1;
    } else {
      laneX = Math.random() > 0.5 ? 2.3 : 4.8;
      speed = (type === 'auto' ? 10 : type === 'ksrtc' ? 14 : 18) + Math.random() * 3;
      direction = -1;
    }

    let mesh = null;
    let length = 3.5;
    let width = 1.6;

    if (type === 'auto') {
      mesh = this.createAutoRickshaw();
      length = 2.8;
      width = 1.4;
    } else if (type === 'ksrtc') {
      mesh = this.createKSRTCBus();
      length = 9.5;
      width = 2.5;
    } else if (type === 'bike') {
      mesh = this.createMotorbike();
      length = 2.0;
      width = 0.8;
    } else {
      mesh = this.createTrafficCar();
      length = 4.2;
      width = 1.8;
    }

    mesh.position.set(laneX, 0, zPos);
    if (direction < 0) {
      mesh.rotation.y = Math.PI; // Face oncoming
    }

    this.root.add(mesh);

    const vehicle = {
      mesh,
      type,
      laneX,
      speed,
      direction,
      length,
      width,
      halfLength: length * 0.5,
      halfWidth: width * 0.5
    };

    this.trafficVehicles.push(vehicle);
    return vehicle;
  }

  createAutoRickshaw() {
    const auto = new THREE.Group();
    
    // Yellow hood / roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 1.8), this.autoYellowMat);
    roof.position.y = 1.25;
    roof.castShadow = true;

    // Black lower chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.6, 2.4), this.autoBlackMat);
    body.position.y = 0.45;
    body.castShadow = true;

    // Windshield
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.5), this.glassMat);
    ws.position.set(0, 1.05, 0.95);
    ws.rotation.x = -0.2;

    // Front single wheel
    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.15, 12).rotateZ(Math.PI / 2), this.tireMat);
    frontWheel.position.set(0, 0.24, 1.0);

    // Rear twin wheels
    const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.15, 12).rotateZ(Math.PI / 2), this.tireMat);
    rl.position.set(-0.65, 0.24, -0.7);
    const rr = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.15, 12).rotateZ(Math.PI / 2), this.tireMat);
    rr.position.set(0.65, 0.24, -0.7);

    // Headlight
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfffae6 }));
    light.position.set(0, 0.6, 1.22);

    auto.add(roof, body, ws, frontWheel, rl, rr, light);
    return auto;
  }

  createKSRTCBus() {
    const bus = new THREE.Group();

    // Red lower & upper body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.7, 9.2), this.ksrtcRedMat);
    body.position.y = 1.65;
    body.castShadow = true;

    // White band along waistline
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.35, 9.25), this.whiteMat);
    stripe.position.y = 1.6;

    // Front Destination Board ("KSRTC - KARNATAKA SARIGE - MANGALURU")
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.35), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    board.position.set(0, 2.7, 4.62);

    // Large windshield
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.0), this.glassMat);
    ws.position.set(0, 1.9, 4.62);

    // 6 Wheels
    const wGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16).rotateZ(Math.PI / 2);
    const wFL = new THREE.Mesh(wGeom, this.tireMat); wFL.position.set(-1.18, 0.48, 2.8);
    const wFR = new THREE.Mesh(wGeom, this.tireMat); wFR.position.set(1.18, 0.48, 2.8);
    const wRL = new THREE.Mesh(wGeom, this.tireMat); wRL.position.set(-1.18, 0.48, -2.8);
    const wRR = new THREE.Mesh(wGeom, this.tireMat); wRR.position.set(1.18, 0.48, -2.8);

    bus.add(body, stripe, board, ws, wFL, wFR, wRL, wRR);
    return bus;
  }

  createTrafficCar() {
    const car = new THREE.Group();
    const colors = [0xf8fafc, 0x94a3b8, 0x1e293b, 0x0284c7];
    const cMat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)], roughness: 0.3 });

    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.65, 4.0), cMat);
    lower.position.y = 0.55;
    lower.castShadow = true;

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 2.2), this.glassMat);
    cabin.position.set(0, 1.1, -0.15);

    const wGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12).rotateZ(Math.PI / 2);
    const wFL = new THREE.Mesh(wGeom, this.tireMat); wFL.position.set(-0.85, 0.3, 1.2);
    const wFR = new THREE.Mesh(wGeom, this.tireMat); wFR.position.set(0.85, 0.3, 1.2);
    const wRL = new THREE.Mesh(wGeom, this.tireMat); wRL.position.set(-0.85, 0.3, -1.2);
    const wRR = new THREE.Mesh(wGeom, this.tireMat); wRR.position.set(0.85, 0.3, -1.2);

    car.add(lower, cabin, wFL, wFR, wRL, wRR);
    return car;
  }

  createMotorbike() {
    const bike = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 1.6), this.autoBlackMat);
    frame.position.y = 0.6;

    // Fuel tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.3, 0.6), this.ksrtcRedMat);
    tank.position.set(0, 0.85, 0.2);

    // Rider silhouette
    const rider = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    rider.position.set(0, 1.25, -0.15);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    helmet.position.set(0, 1.7, -0.15);

    // Wheels
    const wGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 12).rotateZ(Math.PI / 2);
    const wf = new THREE.Mesh(wGeom, this.tireMat); wf.position.set(0, 0.28, 0.75);
    const wr = new THREE.Mesh(wGeom, this.tireMat); wr.position.set(0, 0.28, -0.75);

    bike.add(frame, tank, rider, helmet, wf, wr);
    return bike;
  }

  update(playerX, playerZ, dt = 0.016) {
    let collisionOccurred = false;

    this.trafficVehicles.forEach(v => {
      // Move vehicle along its direction
      const step = v.speed * v.direction * dt;
      v.mesh.position.z += step;

      // Wrap around if too far ahead or behind player
      if (v.direction > 0 && v.mesh.position.z > playerZ + 220) {
        v.mesh.position.z = playerZ - 60;
      } else if (v.direction > 0 && v.mesh.position.z < playerZ - 80) {
        v.mesh.position.z = playerZ + 180;
      } else if (v.direction < 0 && v.mesh.position.z < playerZ - 80) {
        v.mesh.position.z = playerZ + 200;
      }

      // Check collision with player car
      const dx = Math.abs(v.mesh.position.x - playerX);
      const dz = Math.abs(v.mesh.position.z - playerZ);

      if (dx < (v.halfWidth + 1.0) && dz < (v.halfLength + 2.2)) {
        collisionOccurred = true;
      }
    });

    return collisionOccurred;
  }
}
