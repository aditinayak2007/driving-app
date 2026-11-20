import * as THREE from 'three';

/**
 * Indian RTO Smart Automated Driving Test Track (3D)
 * Features S-Curves, Figure-8 track, stop lines, cones, and reverse parking bay.
 */
export class DrivingTestTrack {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = 'rto-test-track';
    this.scene.add(this.root);

    this.coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    this.coneBandMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    this.whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    this.cones = [];
    this.buildTrack();
  }

  buildTrack() {
    // 1. Starting Bay Cones
    for (let z = 0; z < 40; z += 8) {
      this.addCone(-6.5, z);
      this.addCone(-0.5, z);
    }

    // 2. Figure-8 and S-Curve Boundary Cones
    const curvePoints = [
      { x: -3.5, z: 50 },
      { x: -5.5, z: 70 },
      { x: -2.0, z: 95 },
      { x: 3.0, z: 120 },
      { x: 5.5, z: 145 },
      { x: 2.0, z: 170 },
      { x: -3.5, z: 195 }
    ];

    curvePoints.forEach(pt => {
      this.addCone(pt.x - 2.8, pt.z);
      this.addCone(pt.x + 2.8, pt.z);
    });

    // 3. Stop Line at Traffic Signal (z = 210)
    const stopBar = new THREE.Mesh(
      new THREE.PlaneGeometry(6.0, 0.6).rotateX(-Math.PI / 2),
      this.whiteLineMat
    );
    stopBar.position.set(-3.5, 0.02, 210);
    this.root.add(stopBar);

    // 4. Reverse Parking Bay (z = 240)
    // Cones forming a designated parking box
    const bayLeft = -5.5;
    const bayRight = -1.5;
    for (let z = 230; z <= 250; z += 4) {
      this.addCone(bayLeft, z);
      this.addCone(bayRight, z);
    }
  }

  addCone(x, z) {
    const coneGroup = new THREE.Group();
    coneGroup.position.set(x, 0, z);

    // Orange cone body
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 12), this.coneMat);
    body.position.y = 0.325;

    // White reflective band
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.15, 12), this.coneBandMat);
    band.position.y = 0.34;

    // Black rubber base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.48), new THREE.MeshStandardMaterial({ color: 0x18181b }));
    base.position.y = 0.02;

    coneGroup.add(body, band, base);
    this.root.add(coneGroup);
    this.cones.push({ x, z, radius: 0.35 });
  }

  checkConeCollision(playerX, playerZ) {
    for (const c of this.cones) {
      const dx = c.x - playerX;
      const dz = c.z - playerZ;
      if (Math.hypot(dx, dz) < 1.4) {
        return true;
      }
    }
    return false;
  }
}
