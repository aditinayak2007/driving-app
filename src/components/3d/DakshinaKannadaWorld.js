import * as THREE from 'three';

/**
 * Procedural Dakshina Kannada, Karnataka 3D Driving Environment
 * Generates coastal NH-66 highway, coconut groves, Mangalorean tiled houses,
 * roadside tea stalls, KSRTC bus stands, petrol pumps, temples, and left-side road markings.
 */
export class DakshinaKannadaWorld {
  constructor(scene, locationId = 'nh66-mangaluru-surathkal') {
    this.scene = scene;
    this.locationId = locationId;
    this.root = new THREE.Group();
    this.root.name = 'dk-environment';
    this.scene.add(this.root);

    this.roadSegments = [];
    this.segmentLength = 120; // meters per chunk
    this.numSegments = 6;
    this.roadWidth = 18; // 4-lane Indian highway

    // Shared materials
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.85,
      metalness: 0.1
    });

    this.medianMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8
    });

    this.yellowMarkingMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    this.whiteMarkingMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    this.grassMat = new THREE.MeshStandardMaterial({ color: 0x1c3822, roughness: 0.95 });
    this.roofTileMat = new THREE.MeshStandardMaterial({ color: 0xa84226, roughness: 0.7 }); // Mangalore terracotta tile
    this.wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.85 }); // Whitewashed laterite
    this.trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 });
    this.palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x22622c, roughness: 0.65, side: THREE.DoubleSide });

    // Traffic signal references
    this.trafficSignals = [];

    this.init();
  }

  init() {
    // Generate initial segments ahead and behind
    for (let i = -1; i < this.numSegments; i++) {
      this.createSegment(i * this.segmentLength);
    }

    // Coastal Karnataka Sky & Ambient Lighting
    this.setupAtmosphere();
  }

  setupAtmosphere() {
    // Hemisphere light (tropical sky blue & lush grass bounce)
    const hemiLight = new THREE.HemisphereLight(0xcde8ff, 0x1e3b24, 0.9);
    this.root.add(hemiLight);

    // Tropical Sunlight
    const sunLight = new THREE.DirectionalLight(0xfffae6, 1.4);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 250;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    this.root.add(sunLight);

    // Subtle coastal fog
    this.scene.fog = new THREE.FogExp2(0xa5cde6, 0.0028);
  }

  /**
   * Builds an authentic segment of Dakshina Kannada road
   */
  createSegment(zOffset) {
    const seg = new THREE.Group();
    seg.position.z = zOffset;

    // 1. MAIN ASPHALT HIGHWAY SURFACE
    const roadGeom = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
    roadGeom.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeom, this.roadMat);
    road.receiveShadow = true;
    seg.add(road);

    // 2. GREEN ROADSIDE SHOULDERS (Lush Coastal Terrain)
    const shoulderWidth = 80;
    const leftGrass = new THREE.Mesh(new THREE.PlaneGeometry(shoulderWidth, this.segmentLength).rotateX(-Math.PI / 2), this.grassMat);
    leftGrass.position.set(-this.roadWidth * 0.5 - shoulderWidth * 0.5, -0.05, 0);
    leftGrass.receiveShadow = true;

    const rightGrass = new THREE.Mesh(new THREE.PlaneGeometry(shoulderWidth, this.segmentLength).rotateX(-Math.PI / 2), this.grassMat);
    rightGrass.position.set(this.roadWidth * 0.5 + shoulderWidth * 0.5, -0.05, 0);
    rightGrass.receiveShadow = true;
    seg.add(leftGrass, rightGrass);

    // 3. INDIAN ROAD MARKINGS & MEDIAN
    // Center Median / Island with Yellow stripes
    const medianGeom = new THREE.BoxGeometry(0.8, 0.35, this.segmentLength);
    const median = new THREE.Mesh(medianGeom, this.medianMat);
    median.position.set(0, 0.17, 0);
    seg.add(median);

    // Dashed Lane Dividers (White) for Left-hand driving
    const dashLength = 3.5;
    const dashGap = 4.5;
    const numDashes = Math.floor(this.segmentLength / (dashLength + dashGap));

    for (let d = 0; d < numDashes; d++) {
      const z = -this.segmentLength * 0.5 + d * (dashLength + dashGap) + dashLength * 0.5;
      
      // Left carriage lane line (x = -4.5)
      const dashLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.2, dashLength).rotateX(-Math.PI / 2), this.whiteMarkingMat);
      dashLeft.position.set(-4.5, 0.015, z);
      seg.add(dashLeft);

      // Right carriage lane line (x = 4.5)
      const dashRight = new THREE.Mesh(new THREE.PlaneGeometry(0.2, dashLength).rotateX(-Math.PI / 2), this.whiteMarkingMat);
      dashRight.position.set(4.5, 0.015, z);
      seg.add(dashRight);
    }

    // Outer Solid Yellow Edge Lines
    const edgeLineGeom = new THREE.PlaneGeometry(0.25, this.segmentLength).rotateX(-Math.PI / 2);
    const leftEdge = new THREE.Mesh(edgeLineGeom, this.yellowMarkingMat);
    leftEdge.position.set(-this.roadWidth * 0.5 + 0.35, 0.015, 0);
    const rightEdge = new THREE.Mesh(edgeLineGeom, this.yellowMarkingMat);
    rightEdge.position.set(this.roadWidth * 0.5 - 0.35, 0.015, 0);
    seg.add(leftEdge, rightEdge);

    // 4. SCENERY OBJECTS FOR DAKSHINA KANNADA
    this.populateScenery(seg);

    this.root.add(seg);
    this.roadSegments.push({ group: seg, zOffset });
    return seg;
  }

  populateScenery(seg) {
    // A. Coconut Palms (*Thengina Mara*) along both sides
    for (let c = -45; c < 45; c += 18) {
      this.addCoconutPalm(seg, -this.roadWidth * 0.5 - 4.5 - Math.random() * 8, c + (Math.random() - 0.5) * 5);
      this.addCoconutPalm(seg, this.roadWidth * 0.5 + 4.5 + Math.random() * 8, c + (Math.random() - 0.5) * 5);
      
      // Slender Areca Nut Trees (*Adike Mara*) in background groves
      this.addArecaNutPalm(seg, -this.roadWidth * 0.5 - 14 - Math.random() * 10, c + 6);
      this.addArecaNutPalm(seg, this.roadWidth * 0.5 + 14 + Math.random() * 10, c + 6);
    }

    // B. Highway Streetlights
    for (let s = -40; s <= 40; s += 40) {
      this.addStreetLight(seg, 0, s); // Center median pole
    }

    // C. Traditional Mangalore Red-Tiled House (*Guthu Mane*)
    if (Math.random() > 0.35) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (this.roadWidth * 0.5 + 12 + Math.random() * 6);
      this.addMangaloreHouse(seg, x, (Math.random() - 0.5) * 30);
    }

    // D. Authentic Roadside Chai / Tea Stall ("Kadale Baji & Chai")
    if (Math.random() > 0.45) {
      this.addIndianTeaStall(seg, -this.roadWidth * 0.5 - 3.8, (Math.random() - 0.5) * 35);
    }

    // E. Indian KSRTC Bus Stop ("ಸುರತ್ಕಲ್ / Surathkal", "ಮಂಗಳೂರು / Mangaluru", "ಬಿ.ಸಿ. ರೋಡ್")
    if (Math.random() > 0.5) {
      this.addBusStop(seg, -this.roadWidth * 0.5 - 3.2, 10);
    }

    // F. Indian Petrol Pump Canopy
    if (Math.random() > 0.75) {
      this.addPetrolPump(seg, this.roadWidth * 0.5 + 10, -15);
    }

    // G. Roadside Temple Shrine with Saffron Flag
    if (Math.random() > 0.6) {
      this.addRoadsideTemple(seg, -this.roadWidth * 0.5 - 5.5, -25);
    }

    // H. Indian Milestone Signboard ("NH 66", "Mangaluru", "Surathkal")
    this.addMilestone(seg, -this.roadWidth * 0.5 - 1.2, -15);

    // I. Traffic Signal at segment junctions
    if (Math.random() > 0.65) {
      this.addTrafficSignal(seg, 0, 35);
    }
  }

  addCoconutPalm(parent, x, z) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    // Curved slender trunk
    const trunkHeight = 10 + Math.random() * 3;
    const trunkGeom = new THREE.CylinderGeometry(0.24, 0.42, trunkHeight, 8);
    const trunk = new THREE.Mesh(trunkGeom, this.trunkMat);
    trunk.position.y = trunkHeight * 0.5;
    trunk.rotation.z = (Math.random() - 0.5) * 0.18;
    trunk.castShadow = true;
    palm.add(trunk);

    // Crown of radiating fronds
    const crown = new THREE.Group();
    crown.position.set(0, trunkHeight, 0);

    for (let f = 0; f < 9; f++) {
      const angle = (f / 9) * Math.PI * 2;
      const leafGeom = new THREE.PlaneGeometry(1.2, 5.5);
      leafGeom.translate(0, 2.75, 0);
      const leaf = new THREE.Mesh(leafGeom, this.palmLeafMat);
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.85 + Math.random() * 0.2;
      leaf.castShadow = true;
      crown.add(leaf);
    }

    // Coconuts cluster
    const nutMat = new THREE.MeshStandardMaterial({ color: 0x4d5320, roughness: 0.6 });
    for (let n = 0; n < 5; n++) {
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), nutMat);
      nut.position.set(Math.cos(n * 1.2) * 0.35, -0.2, Math.sin(n * 1.2) * 0.35);
      crown.add(nut);
    }

    palm.add(crown);
    parent.add(palm);
  }

  addArecaNutPalm(parent, x, z) {
    const areca = new THREE.Group();
    areca.position.set(x, 0, z);

    // Tall slender white-ringed trunk
    const trunkH = 12 + Math.random() * 2.5;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, trunkH, 6), this.trunkMat);
    trunk.position.y = trunkH * 0.5;
    trunk.castShadow = true;
    areca.add(trunk);

    // Compact erect tuft of leaves
    const crown = new THREE.Group();
    crown.position.y = trunkH;
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 3.2), this.palmLeafMat);
      leaf.position.y = 1.5;
      leaf.rotation.y = (i / 6) * Math.PI * 2;
      leaf.rotation.x = 0.45;
      crown.add(leaf);
    }
    areca.add(crown);
    parent.add(areca);
  }

  addMangaloreHouse(parent, x, z) {
    const house = new THREE.Group();
    house.position.set(x, 0, z);

    // Whitewashed ground floor walls
    const wallGeom = new THREE.BoxGeometry(9, 3.5, 7);
    const walls = new THREE.Mesh(wallGeom, this.wallMat);
    walls.position.y = 1.75;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Mangalore Terracotta Tiled Roof (sloping pyramid / gable)
    const roofGeom = new THREE.ConeGeometry(7.2, 2.6, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.roofTileMat);
    roof.position.y = 4.8;
    roof.castShadow = true;
    house.add(roof);

    // Wooden veranda pillars (Thulasi Katte / Coastal Guthu portico)
    const porticoMat = new THREE.MeshStandardMaterial({ color: 0x5a2d0c });
    for (let p = -3.2; p <= 3.2; p += 3.2) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8), porticoMat);
      pillar.position.set(p, 1.2, 4.2);
      house.add(pillar);
    }

    parent.add(house);
  }

  addIndianTeaStall(parent, x, z) {
    const stall = new THREE.Group();
    stall.position.set(x, 0, z);

    // Wooden counter & tin roof
    const counter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 1.8), new THREE.MeshStandardMaterial({ color: 0x3e2723 }));
    counter.position.y = 0.55;
    stall.add(counter);

    // Tin roof shelter
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 2.4), new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.8 }));
    roof.position.set(0, 2.4, 0);
    roof.rotation.x = 0.1;
    stall.add(roof);

    // Signboard banner: "MANGALORE CHAI & BUNS"
    const sign = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
    sign.position.set(0, 2.1, 1.15);
    stall.add(sign);

    parent.add(stall);
  }

  addBusStop(parent, x, z) {
    const stop = new THREE.Group();
    stop.position.set(x, 0, z);

    // KSRTC Bus Shelter
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 2.2), this.medianMat);
    base.position.y = 0.1;
    stop.add(base);

    // Shelter pillars & roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 2.5), new THREE.MeshStandardMaterial({ color: 0xb91c1c })); // KSRTC red
    roof.position.set(0, 2.6, 0);
    stop.add(roof);

    // English & Kannada board
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.08), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    board.position.set(0, 2.85, 1.2);
    stop.add(board);

    parent.add(stop);
  }

  addPetrolPump(parent, x, z) {
    const pump = new THREE.Group();
    pump.position.set(x, 0, z);

    // Canopy (Bharat Petroleum style blue & yellow)
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 7), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.5 }));
    canopy.position.set(0, 4.5, 0);
    pump.add(canopy);

    // 2 Canopy columns
    for (let c = -3.5; c <= 3.5; c += 7) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4.5, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
      col.position.set(c, 2.25, 0);
      pump.add(col);
    }

    // Fuel dispenser units
    const dispenserMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    for (let d = -2.2; d <= 2.2; d += 4.4) {
      const unit = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.6), dispenserMat);
      unit.position.set(d, 0.9, 0);
      pump.add(unit);
    }

    parent.add(pump);
  }

  addRoadsideTemple(parent, x, z) {
    const temple = new THREE.Group();
    temple.position.set(x, 0, z);

    // Stone base
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 2.5), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    base.position.y = 0.2;
    temple.add(base);

    // Saffron spire / Shikara
    const shikara = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.4, 4), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    shikara.position.y = 1.6;
    temple.add(shikara);

    // Saffron triangular flag (Bhagwa Dhwaj)
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    flagPole.position.set(0, 3.2, 0);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshBasicMaterial({ color: 0xea580c, side: THREE.DoubleSide }));
    flag.position.set(0.28, 3.6, 0);
    temple.add(flagPole, flag);

    parent.add(temple);
  }

  addMilestone(parent, x, z) {
    const ms = new THREE.Group();
    ms.position.set(x, 0, z);

    // Curved Indian highway milestone (Yellow top, white bottom for National Highway)
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    base.position.y = 0.3;
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    top.position.y = 0.6;

    ms.add(base, top);
    parent.add(ms);
  }

  addStreetLight(parent, x, z) {
    const lightGroup = new THREE.Group();
    lightGroup.position.set(x, 0, z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 7.5, 8), this.medianMat);
    pole.position.y = 3.75;
    lightGroup.add(pole);

    // Dual arm over left and right carriage
    const armGeom = new THREE.BoxGeometry(4.2, 0.08, 0.08);
    const arm = new THREE.Mesh(armGeom, this.medianMat);
    arm.position.y = 7.4;
    lightGroup.add(arm);

    // LED lamp head
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    const lampLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.2), lampMat);
    lampLeft.position.set(-2.0, 7.3, 0);
    const lampRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.2), lampMat);
    lampRight.position.set(2.0, 7.3, 0);
    lightGroup.add(lampLeft, lampRight);

    parent.add(lightGroup);
  }

  addTrafficSignal(parent, x, z) {
    const sigGroup = new THREE.Group();
    sigGroup.position.set(x, 0, z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 6.2, 8), this.medianMat);
    pole.position.y = 3.1;
    sigGroup.add(pole);

    // Signal head box
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    box.position.set(0, 5.2, 0);
    sigGroup.add(box);

    // Red, Amber, Green light lenses
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const amberMat = new THREE.MeshBasicMaterial({ color: 0x442200 });
    const greenMat = new THREE.MeshBasicMaterial({ color: 0x004400 });

    const redLens = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), redMat);
    redLens.position.set(0, 5.65, 0.2);
    const amberLens = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), amberMat);
    amberLens.position.set(0, 5.2, 0.2);
    const greenLens = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), greenMat);
    greenLens.position.set(0, 4.75, 0.2);

    sigGroup.add(redLens, amberLens, greenLens);
    parent.add(sigGroup);

    this.trafficSignals.push({
      group: sigGroup,
      zPos: z,
      state: 'RED',
      redLens, amberLens, greenLens,
      timer: 0
    });
  }

  /**
   * Continuous road cycling so user never hits the end of the world
   * @param {number} playerZ Current car forward coordinate
   */
  update(playerZ, dt = 0.016) {
    // 1. Recycle road segments that fell behind
    this.roadSegments.forEach(seg => {
      // If segment is more than 1.5 lengths behind player, move it to the front
      if (seg.group.position.z < playerZ - this.segmentLength * 1.5) {
        seg.group.position.z += this.numSegments * this.segmentLength;
      }
    });

    // 2. Cycle traffic signal phases (Red -> Green -> Amber)
    this.trafficSignals.forEach(sig => {
      sig.timer += dt;
      if (sig.timer > 8.0) {
        sig.timer = 0;
        if (sig.state === 'RED') {
          sig.state = 'GREEN';
          sig.redLens.material.color.setHex(0x440000);
          sig.greenLens.material.color.setHex(0x10b981);
        } else if (sig.state === 'GREEN') {
          sig.state = 'AMBER';
          sig.greenLens.material.color.setHex(0x004400);
          sig.amberLens.material.color.setHex(0xf59e0b);
        } else {
          sig.state = 'RED';
          sig.amberLens.material.color.setHex(0x442200);
          sig.redLens.material.color.setHex(0xef4444);
        }
      }
    });
  }
}
