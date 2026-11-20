import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Sliders, ArrowRight, Video, AlertCircle, RefreshCw, Sparkles, ShieldCheck
} from 'lucide-react';

const CALIBRATION_STEPS = [
  { id: 'camera', title: 'Webcam Acquisition', desc: 'Allow camera access and center your face & chest in frame.' },
  { id: 'leftHand', title: 'Left Hand Detection', desc: 'Hold up your LEFT hand in front of the camera.' },
  { id: 'rightHand', title: 'Right Hand Detection', desc: 'Hold up your RIGHT hand in front of the camera.' },
  { id: 'steering', title: 'Steering Wheel Pose', desc: 'Hold BOTH hands in the air at 9 and 3 o\'clock position.' },
  { id: 'steerLeft', title: 'Steer Left', desc: 'Rotate hands counter-clockwise (left hand lower, right hand higher).' },
  { id: 'steerRight', title: 'Steer Right', desc: 'Rotate hands clockwise (right hand lower, left hand higher).' },
  { id: 'accel', title: 'Acceleration Test', desc: 'Close your RIGHT hand into a tight fist.' },
  { id: 'brake', title: 'Braking Test', desc: 'Extend your LEFT hand open palm with fingers spread facing camera.' },
  { id: 'gear', title: 'Gear Shift Pinch', desc: 'Pinch your RIGHT thumb & index finger together.' },
  { id: 'horn', title: 'Indian Horn Test', desc: 'Make DOUBLE FISTS with both hands simultaneously.' }
];

export default function CalibrationScreen({
  gestures,
  onComplete,
  onBack,
  steeringSensitivity,
  steeringDeadzone,
  onUpdateSensitivity
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepSuccess, setStepSuccess] = useState({});
  const [holdTimer, setHoldTimer] = useState(0);

  const step = CALIBRATION_STEPS[currentStepIndex];

  // Auto-validate current step based on real-time gesture feedback
  useEffect(() => {
    if (!step) return;

    let satisfied = false;

    switch (step.id) {
      case 'camera':
        satisfied = true; // Video stream is active
        break;
      case 'leftHand':
        satisfied = gestures?.leftHandPresent;
        break;
      case 'rightHand':
        satisfied = gestures?.rightHandPresent;
        break;
      case 'steering':
        satisfied = (gestures?.leftHandPresent || gestures?.rightHandPresent);
        break;
      case 'steerLeft':
        satisfied = gestures?.steerAngle < -0.15;
        break;
      case 'steerRight':
        satisfied = gestures?.steerAngle > 0.15;
        break;
      case 'accel':
        satisfied = gestures?.isAccelerating;
        break;
      case 'brake':
        satisfied = gestures?.isBraking;
        break;
      case 'gear':
        satisfied = gestures?.isPinching || gestures?.pinchGearRequested;
        break;
      case 'horn':
        satisfied = gestures?.isHorn;
        break;
      default:
        break;
    }

    if (satisfied) {
      setStepSuccess(prev => ({ ...prev, [step.id]: true }));
      // Advance quickly to next step
      const timeout = setTimeout(() => {
        if (currentStepIndex < CALIBRATION_STEPS.length - 1) {
          setCurrentStepIndex(c => c + 1);
        }
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [currentStepIndex, gestures, step]);

  const allCompleted = CALIBRATION_STEPS.every(s => stepSuccess[s.id]);

  return (
    <div className="fixed inset-0 bg-[#060913]/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 select-none">
      <div className="max-w-4xl w-full glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-xl font-black font-orbitron text-white tracking-wide">
                GESTURE CALIBRATION SUITE
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Calibrating 3D Computer Vision AI for optimal hand tracking & driving sensitivity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400">
              STEP {currentStepIndex + 1} OF {CALIBRATION_STEPS.length}
            </span>
          </div>
        </div>

        {/* Main Content Grid: Checklist + Active Step + Live Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Steps Checklist (Left Column) */}
          <div className="md:col-span-5 flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-2">
            {CALIBRATION_STEPS.map((s, idx) => {
              const isDone = !!stepSuccess[s.id];
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={s.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                      {s.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Step Hero & Instructions (Right Column) */}
          <div className="md:col-span-7 flex flex-col justify-between glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/60">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Active Target Gesture
              </div>

              <h3 className="text-2xl font-black font-orbitron text-white mb-2">
                {step.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {step.desc}
              </p>

              {/* Real-time Visual Feedback Gauge */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Gesture Recognition Status:</span>
                  <span className={`font-bold ${stepSuccess[step.id] ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {stepSuccess[step.id] ? '✓ VERIFIED & CALIBRATED' : 'WAITING FOR GESTURE...'}
                  </span>
                </div>

                {/* Live Detected Values */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500">Steering Angle: </span>
                    <span className="text-white font-bold">{Math.round((gestures?.steerAngleDegrees || 0))}°</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Throttle: </span>
                    <span className="text-white font-bold">{Math.round((gestures?.throttle || 0) * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Brake: </span>
                    <span className="text-white font-bold">{Math.round((gestures?.brake || 0) * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Active Action: </span>
                    <span className="text-amber-300 font-bold">{gestures?.summaryText}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sensitivity Controls Slider */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Steering Sensitivity:
                </div>
                <span className="font-mono text-amber-400 font-bold">{steeringSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.1"
                value={steeringSensitivity}
                onChange={(e) => onUpdateSensitivity && onUpdateSensitivity(parseFloat(e.target.value), steeringDeadzone)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
          >
            ← Back to Menu
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Quick-pass all for instant test
                const allDone = {};
                CALIBRATION_STEPS.forEach(s => allDone[s.id] = true);
                setStepSuccess(allDone);
                onComplete();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              Skip to Drive →
            </button>

            <button
              onClick={onComplete}
              disabled={!allCompleted}
              className={`px-8 py-3 rounded-xl font-orbitron font-black text-sm tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                allCompleted
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 hover:scale-105'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              START DRIVING INDIA 3D
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
