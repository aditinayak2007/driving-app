import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createVehicle3D } from './CarModel';
import { DakshinaKannadaWorld } from './DakshinaKannadaWorld';
import { TrafficSystem } from './TrafficSystem';
import { DrivingTestTrack } from './DrivingTestTrack';
import { soundManager } from '../../systems/SoundManager';

export default function DrivingCanvas({
  carData,
  selectedColor,
  gameMode,
  locationId,
  physics,
  gestures,
  cameraMode,
  isAudioMuted,
  onCollision,
  onTestProgress
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1524);

    const camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- 2. 3D ASSETS: ENVIRONMENT, CAR, TRAFFIC ---
    const world = new DakshinaKannadaWorld(scene, locationId);
    const traffic = new TrafficSystem(scene);
    let testTrack = null;
    if (gameMode === 'test') {
      testTrack = new DrivingTestTrack(scene);
    }

    const vehicle3D = createVehicle3D(carData, selectedColor);
    scene.add(vehicle3D.group);

    // Audio setup
    soundManager.setCarProfile(carData.audioProfile);
    soundManager.startEngine();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard fallback listener for development & accessibility
    const keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false
    };

    const onKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = true;
      if (e.code === 'Space') keys.space = true;
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        const g = e.code.replace('Digit', '');
        physics.setGear(g);
        soundManager.playGearShift();
      }
      if (e.code === 'KeyR') {
        physics.setGear('R');
        soundManager.playGearShift();
      }
      if (e.code === 'KeyN') {
        physics.setGear('N');
        soundManager.playGearShift();
      }
      if (e.code === 'KeyH') {
        soundManager.startHorn();
      }
    };

    const onKeyUp = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
      if (e.code === 'Space') keys.space = false;
      if (e.code === 'KeyH') soundManager.stopHorn();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // --- 3. ANIMATION & PHYSICS TICK LOOP ---
    let animId = null;
    let lastTime = performance.now();
    let hornActivePrev = false;

    const animate = (currentTime) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Combine Webcam Gestures with Keyboard Fallback
      let steerInput = gestures?.steerAngle || 0;
      if (keys.left) steerInput = -0.85;
      if (keys.right) steerInput = 0.85;

      let throttleInput = gestures?.throttle || 0;
      if (keys.up) throttleInput = 1.0;

      let brakeInput = gestures?.brake || 0;
      if (keys.down || keys.space) brakeInput = 1.0;

      // Horn triggered by gesture
      if (gestures?.isHorn && !hornActivePrev) {
        soundManager.startHorn();
        hornActivePrev = true;
      } else if (!gestures?.isHorn && hornActivePrev && !keys.space) {
        soundManager.stopHorn();
        hornActivePrev = false;
      }

      // Update vehicle physics simulation
      physics.update(dt, steerInput, throttleInput, brakeInput);

      // Sound update
      soundManager.updateEngine(physics.rpm, throttleInput);
      if (physics.speedKmh > 35 && brakeInput > 0.85) {
        soundManager.playBrakeScreech();
      }

      // Update 3D Car Position & Rotation
      vehicle3D.group.position.set(physics.x, physics.y, physics.z);
      vehicle3D.group.rotation.y = physics.yaw;
      vehicle3D.group.rotation.z = physics.bodyRoll;
      vehicle3D.group.rotation.x = physics.bodyPitch;

      // Update 3D functional components (steering wheel, lights, wheels)
      vehicle3D.update(
        physics.speedKmh,
        physics.steeringAngle,
        brakeInput > 0.1,
        gestures?.isLeftIndicator,
        gestures?.isRightIndicator,
        physics.currentGear
      );

      // Update Environment & Traffic
      world.update(physics.z, dt);
      const hitTraffic = traffic.update(physics.x, physics.z, dt);

      // Check collision
      if (physics.hasCollided || hitTraffic) {
        soundManager.playCrash();
        if (onCollision) onCollision(hitTraffic ? 'traffic' : 'curb');
      }

      // Driving test cone check
      if (testTrack && testTrack.checkConeCollision(physics.x, physics.z)) {
        soundManager.playCrash();
        if (onCollision) onCollision('cone');
      }

      // Driving test progress reporter
      if (onTestProgress) {
        onTestProgress({
          speedKmh: physics.speedKmh,
          currentGear: physics.currentGear,
          zPos: physics.z,
          steerAngle: physics.steeringAngle
        });
      }

      // --- 4. CAMERA MODES ---
      const carPos = vehicle3D.group.position;
      const carYaw = physics.yaw;

      if (cameraMode === 'first-person') {
        // Cockpit view from right-hand driver seat
        // Driver eye offset in car local coords: x = +0.45, y = 1.15, z = 0.05
        const eyeOffset = new THREE.Vector3(0.45, 1.18, 0.05);
        eyeOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carYaw);
        camera.position.copy(carPos).add(eyeOffset);

        const lookTarget = new THREE.Vector3(0.45, 1.1, 25);
        lookTarget.applyAxisAngle(new THREE.Vector3(0, 1, 0), carYaw);
        camera.lookAt(carPos.clone().add(lookTarget));
      } else if (cameraMode === 'hood') {
        // Low bonnet / hood action cam
        const hoodOffset = new THREE.Vector3(0, 0.95, 1.8);
        hoodOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carYaw);
        camera.position.copy(carPos).add(hoodOffset);

        const lookTarget = new THREE.Vector3(0, 0.9, 30);
        lookTarget.applyAxisAngle(new THREE.Vector3(0, 1, 0), carYaw);
        camera.lookAt(carPos.clone().add(lookTarget));
      } else if (cameraMode === 'side') {
        // Side view / scenic passenger view
        const sideOffset = new THREE.Vector3(-4.2, 1.8, -1.2);
        sideOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carYaw);
        camera.position.copy(carPos).add(sideOffset);
        camera.lookAt(carPos.clone().add(new THREE.Vector3(0, 1.0, 3.5)));
      } else {
        // Default: Third-person chase cam
        const chaseDist = 6.2;
        const chaseHeight = 2.4;
        const chaseOffset = new THREE.Vector3(
          -Math.sin(carYaw) * chaseDist,
          chaseHeight,
          -Math.cos(carYaw) * chaseDist
        );
        camera.position.copy(carPos).add(chaseOffset);
        camera.lookAt(carPos.clone().add(new THREE.Vector3(0, 1.1, 4.0)));
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      soundManager.stopEngine();
      soundManager.stopHorn();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [carData, selectedColor, gameMode, locationId, cameraMode]);

  return <div ref={mountRef} className="w-full h-full relative" />;
}
