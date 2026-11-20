import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CARS_DATA } from './data/carsData';
import { LOCATIONS_DATA } from './data/locationsData';
import { DRIVING_TEST_STEPS } from './data/drivingTestSteps';
import { HandTrackingService } from './systems/HandTracking';
import { VehiclePhysics } from './systems/VehiclePhysics';
import { soundManager } from './systems/SoundManager';

// 3D Canvas
import DrivingCanvas from './components/3d/DrivingCanvas';

// UI Components
import LandingPage from './components/ui/LandingPage';
import CarSelection from './components/ui/CarSelection';
import LocationSelection from './components/ui/LocationSelection';
import ModeSelection from './components/ui/ModeSelection';
import DashboardHUD from './components/ui/DashboardHUD';
import WebcamPIP from './components/ui/WebcamPIP';
import MiniMap from './components/ui/MiniMap';
import CalibrationScreen from './components/ui/CalibrationScreen';
import DrivingTestHUD from './components/ui/DrivingTestHUD';
import GestureTutorialModal from './components/ui/GestureTutorialModal';
import SettingsModal from './components/ui/SettingsModal';
import VirtualControlsOverlay from './components/ui/VirtualControlsOverlay';

const CAMERA_MODES = ['chase', 'first-person', 'hood', 'side'];
const GEAR_LIST = ['R', 'N', '1', '2', '3', '4', '5'];

export default function App() {
  // Navigation Screens: 'landing', 'car-select', 'location-select', 'mode-select', 'calibration', 'driving'
  const [currentScreen, setCurrentScreen] = useState('landing');

  // Modals
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Configuration
  const [selectedCar, setSelectedCar] = useState(CARS_DATA[0]);
  const [selectedColor, setSelectedColor] = useState(CARS_DATA[0].colors[0].hex);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS_DATA[0]);
  const [selectedMode, setSelectedMode] = useState('free'); // 'free' | 'city' | 'test'
  const [cameraMode, setCameraMode] = useState('first-person'); // default first-person cockpit for immersion
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Calibration & Sensitivity
  const [steeringSensitivity, setSteeringSensitivity] = useState(1.6);
  const [steeringDeadzone, setSteeringDeadzone] = useState(0.06);
  const [throttleSensitivity, setThrottleSensitivity] = useState(1.2);

  // Live Hand Tracking & Gestures
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [gestures, setGestures] = useState({
    steerAngle: 0,
    steerAngleDegrees: 0,
    throttle: 0,
    brake: 0,
    isHorn: false,
    isLeftIndicator: false,
    isRightIndicator: false,
    isPinching: false,
    summaryText: 'Waiting for hands...'
  });
  const [trackerFps, setTrackerFps] = useState(30);
  const [trackerError, setTrackerError] = useState(null);
  const [trackerStatus, setTrackerStatus] = useState('Initializing...');
  const [showVirtualControls, setShowVirtualControls] = useState(true);

  // Physics Instance (recreated when car changes)
  const physics = useMemo(() => new VehiclePhysics(selectedCar), [selectedCar]);

  // Telemetry state for React HUD
  const [telemetry, setTelemetry] = useState({
    speedKmh: 0,
    rpm: 900,
    currentGear: 'N',
    fuel: 100,
    playerX: -3.2,
    playerZ: 0,
    playerYaw: 0
  });

  // Driving Test state (Mode 3)
  const [testState, setTestState] = useState({
    stepIndex: 0,
    score: 0,
    faults: 0,
    isFinished: false,
    stepStartTime: performance.now(),
    hasShifted: false
  });

  // Computer Vision Service
  const trackerServiceRef = useRef(null);

  // Initialize MediaPipe Hand Tracker
  useEffect(() => {
    const handleGesture = (g) => {
      setGestures(g);
      if (g.fps) setTrackerFps(g.fps);

      // --- Gesture Trigger 1: Pinch for Gear Shift ---
      if (g.pinchGearRequested) {
        setTelemetry(prev => {
          const currentIdx = GEAR_LIST.indexOf(physics.currentGear);
          let nextIdx = currentIdx;

          if (g.pinchGearRequested === 'UP') {
            nextIdx = Math.min(GEAR_LIST.length - 1, currentIdx + 1);
          } else if (g.pinchGearRequested === 'DOWN') {
            nextIdx = Math.max(0, currentIdx - 1);
          } else {
            // Next cycle
            nextIdx = (currentIdx + 1) % GEAR_LIST.length;
          }

          const targetGear = GEAR_LIST[nextIdx];
          physics.setGear(targetGear);
          soundManager.playGearShift();
          return { ...prev, currentGear: targetGear };
        });
      }

      // --- Gesture Trigger 2: 3-Fingers for Camera View Switch ---
      if (g.cameraToggleRequested) {
        setCameraMode(prev => {
          const idx = CAMERA_MODES.indexOf(prev);
          return CAMERA_MODES[(idx + 1) % CAMERA_MODES.length];
        });
      }
    };

    const tracker = new HandTrackingService(
      handleGesture,
      (err) => {
        setTrackerError(err);
      },
      (status) => {
        setTrackerStatus(status);
      }
    );
    trackerServiceRef.current = tracker;

    if (videoRef.current && canvasRef.current) {
      tracker.init(videoRef.current, canvasRef.current).then(() => {
        tracker.startCamera().catch(e => {
          setTrackerError('Webcam access failed. Virtual on-screen controls enabled.');
        });
      });
    }

    return () => {
      tracker.stopCamera();
    };
  }, [physics]);

  const handleRequestCamera = () => {
    setTrackerError(null);
    if (trackerServiceRef.current) {
      trackerServiceRef.current.startCamera().then(success => {
        if (!success) {
          setTrackerError('Could not access webcam. Please check browser permissions.');
        }
      });
    }
  };

  // Update tracker sensitivities
  useEffect(() => {
    if (trackerServiceRef.current) {
      trackerServiceRef.current.setSensitivity(steeringSensitivity, steeringDeadzone, throttleSensitivity);
    }
  }, [steeringSensitivity, steeringDeadzone, throttleSensitivity]);

  // Start engine when entering driving mode
  useEffect(() => {
    if (currentScreen === 'driving') {
      physics.startEngine();
      soundManager.startEngine();
    } else {
      soundManager.stopEngine();
    }
  }, [currentScreen, physics]);

  // Telemetry loop for HUD updates
  useEffect(() => {
    if (currentScreen !== 'driving') return;

    const interval = setInterval(() => {
      setTelemetry({
        speedKmh: physics.speedKmh,
        rpm: physics.rpm,
        currentGear: physics.currentGear,
        fuel: physics.fuel,
        playerX: physics.x,
        playerZ: physics.z,
        playerYaw: physics.yaw
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentScreen, physics]);

  // Driving Test Progress Evaluator
  const handleTestProgress = ({ speedKmh, currentGear, zPos, steerAngle }) => {
    if (selectedMode !== 'test' || testState.isFinished) return;

    const currentStep = DRIVING_TEST_STEPS[testState.stepIndex];
    if (!currentStep) return;

    let advance = false;
    let awardedPoints = 0;

    switch (currentStep.id) {
      case 'ignition':
        if (physics.engineStarted && Math.abs(steerAngle) < 0.15) {
          advance = true;
          awardedPoints = currentStep.points;
        }
        break;
      case 'shift_first':
        if (currentGear === '1') {
          advance = true;
          awardedPoints = currentStep.points;
        }
        break;
      case 'takeoff':
        if (speedKmh > 12 && zPos > 40) {
          advance = true;
          awardedPoints = currentStep.points;
        }
        break;
      case 'curve_turn':
        if (Math.abs(steerAngle) > 0.2 && zPos > 160) {
          advance = true;
          awardedPoints = currentStep.points;
        }
        break;
      case 'signal_stop':
        if (zPos > 200 && Math.abs(speedKmh) < 1.0) {
          advance = true;
          awardedPoints = currentStep.points;
        }
        break;
      case 'reverse_park':
        if (currentGear === 'R' && zPos > 235 && Math.abs(speedKmh) < 0.5) {
          advance = true;
          awardedPoints = currentStep.points;
        }
        break;
      default:
        break;
    }

    if (advance) {
      const nextIdx = testState.stepIndex + 1;
      const isDone = nextIdx >= DRIVING_TEST_STEPS.length;
      setTestState(prev => ({
        ...prev,
        stepIndex: nextIdx,
        score: prev.score + awardedPoints,
        isFinished: isDone
      }));
    }
  };

  const handleCollision = (type) => {
    if (selectedMode === 'test' && !testState.isFinished) {
      setTestState(prev => ({
        ...prev,
        faults: prev.faults + 1,
        score: Math.max(0, prev.score - 10)
      }));
    }
  };

  const handleSelectGear = (gear) => {
    physics.setGear(gear);
    soundManager.playGearShift();
    setTelemetry(prev => ({ ...prev, currentGear: gear }));
  };

  const handleToggleCamera = () => {
    setCameraMode(prev => {
      const idx = CAMERA_MODES.indexOf(prev);
      return CAMERA_MODES[(idx + 1) % CAMERA_MODES.length];
    });
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070f] text-slate-100 select-none">
      
      {/* 1. 3D DRIVING CANVAS (Active during gameplay) */}
      {currentScreen === 'driving' && (
        <DrivingCanvas
          carData={selectedCar}
          selectedColor={selectedColor}
          gameMode={selectedMode}
          locationId={selectedLocation.id}
          physics={physics}
          gestures={gestures}
          cameraMode={cameraMode}
          isAudioMuted={isAudioMuted}
          onCollision={handleCollision}
          onTestProgress={handleTestProgress}
        />
      )}

      {/* 2. IN-GAME DASHBOARD HUD */}
      {currentScreen === 'driving' && (
        <>
          <DashboardHUD
            speedKmh={telemetry.speedKmh}
            rpm={telemetry.rpm}
            currentGear={telemetry.currentGear}
            fuel={telemetry.fuel}
            gestures={gestures}
            cameraMode={cameraMode}
            onToggleCamera={handleToggleCamera}
            onSelectGear={handleSelectGear}
            isMuted={isAudioMuted}
            onToggleMute={handleToggleMute}
            carData={selectedCar}
            locationData={selectedLocation}
            onExit={() => setCurrentScreen('landing')}
          />

          <MiniMap
            playerX={telemetry.playerX}
            playerZ={telemetry.playerZ}
            playerYaw={telemetry.playerYaw}
            locationName={selectedLocation.name}
          />

          {/* Mode 3: Driving Test HUD & Scorecard */}
          {selectedMode === 'test' && (
            <DrivingTestHUD
              currentStepIndex={testState.stepIndex}
              score={testState.score}
              faults={testState.faults}
              isFinished={testState.isFinished}
              onRestart={() => {
                physics.reset(-3.2, 0, 0);
                setTestState({
                  stepIndex: 0,
                  score: 0,
                  faults: 0,
                  isFinished: false,
                  stepStartTime: performance.now(),
                  hasShifted: false
                });
              }}
              onExitToFreeDrive={() => {
                setSelectedMode('free');
                physics.reset(-3.2, 0, 0);
              }}
            />
          )}
        </>
      )}

      {/* 3. ALWAYS-ON WEBCAM AR TRACKER PIP */}
      <WebcamPIP
        videoRef={videoRef}
        canvasRef={canvasRef}
        gestures={gestures}
        fps={trackerFps}
        isTracking={true}
        error={trackerError}
        status={trackerStatus}
        onRequestCamera={handleRequestCamera}
        onToggleVirtualControls={() => setShowVirtualControls(!showVirtualControls)}
        showVirtualControls={showVirtualControls}
      />

      {/* 3B. ON-SCREEN VIRTUAL CONTROLS OVERLAY (When driving) */}
      {currentScreen === 'driving' && showVirtualControls && (
        <VirtualControlsOverlay
          onSteer={(val) => {
            setGestures(prev => ({
              ...prev,
              steerAngle: val,
              steerAngleDegrees: val * 45,
              isSteering: Math.abs(val) > 0.05
            }));
          }}
          onThrottle={(val) => {
            setGestures(prev => ({
              ...prev,
              throttle: val,
              isAccelerating: val > 0.1
            }));
          }}
          onBrake={(val) => {
            setGestures(prev => ({
              ...prev,
              brake: val,
              isBraking: val > 0.1
            }));
          }}
          onHorn={(val) => {
            setGestures(prev => ({
              ...prev,
              isHorn: val
            }));
          }}
          onSelectGear={handleSelectGear}
          currentGear={telemetry.currentGear}
          onClose={() => setShowVirtualControls(false)}
        />
      )}

      {/* 4. LANDING SCREEN */}
      {currentScreen === 'landing' && (
        <LandingPage
          onStartDrive={() => setCurrentScreen('driving')}
          onOpenCarSelect={() => setCurrentScreen('car-select')}
          onOpenLocationSelect={() => setCurrentScreen('location-select')}
          onOpenModes={() => setCurrentScreen('mode-select')}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCalibration={() => setCurrentScreen('calibration')}
          selectedCar={selectedCar}
          selectedLocation={selectedLocation}
          selectedMode={selectedMode}
        />
      )}

      {/* 5. CAR SELECTION SCREEN */}
      {currentScreen === 'car-select' && (
        <CarSelection
          selectedCar={selectedCar}
          onSelectCar={setSelectedCar}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          onConfirm={() => setCurrentScreen('driving')}
          onBack={() => setCurrentScreen('landing')}
        />
      )}

      {/* 6. LOCATION SELECTION SCREEN */}
      {currentScreen === 'location-select' && (
        <LocationSelection
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          onConfirm={() => setCurrentScreen('driving')}
          onBack={() => setCurrentScreen('landing')}
        />
      )}

      {/* 7. MODE SELECTION SCREEN */}
      {currentScreen === 'mode-select' && (
        <ModeSelection
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onConfirm={() => setCurrentScreen('driving')}
          onBack={() => setCurrentScreen('landing')}
        />
      )}

      {/* 8. GESTURE CALIBRATION SCREEN */}
      {currentScreen === 'calibration' && (
        <CalibrationScreen
          gestures={gestures}
          onComplete={() => setCurrentScreen('driving')}
          onBack={() => setCurrentScreen('landing')}
          steeringSensitivity={steeringSensitivity}
          steeringDeadzone={steeringDeadzone}
          onUpdateSensitivity={(sens, dz) => {
            setSteeringSensitivity(sens);
            if (dz !== undefined) setSteeringDeadzone(dz);
          }}
        />
      )}

      {/* 9. GESTURE TUTORIAL MODAL */}
      {isTutorialOpen && (
        <GestureTutorialModal
          onClose={() => setIsTutorialOpen(false)}
          onStartDrive={() => {
            setIsTutorialOpen(false);
            setCurrentScreen('driving');
          }}
        />
      )}

      {/* 10. SETTINGS MODAL */}
      {isSettingsOpen && (
        <SettingsModal
          steeringSensitivity={steeringSensitivity}
          steeringDeadzone={steeringDeadzone}
          throttleSensitivity={throttleSensitivity}
          onUpdateSettings={(newSettings) => {
            if (newSettings.steeringSensitivity) setSteeringSensitivity(newSettings.steeringSensitivity);
            if (newSettings.steeringDeadzone) setSteeringDeadzone(newSettings.steeringDeadzone);
            if (newSettings.throttleSensitivity) setThrottleSensitivity(newSettings.throttleSensitivity);
          }}
          isMuted={isAudioMuted}
          onToggleMute={handleToggleMute}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

    </div>
  );
}
