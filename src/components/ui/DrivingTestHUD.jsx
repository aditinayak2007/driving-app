import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DRIVING_TEST_STEPS } from '../../data/drivingTestSteps';
import { Award, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

export default function DrivingTestHUD({
  currentStepIndex,
  score,
  faults,
  isFinished,
  onRestart,
  onExitToFreeDrive
}) {
  const currentStep = DRIVING_TEST_STEPS[currentStepIndex] || DRIVING_TEST_STEPS[DRIVING_TEST_STEPS.length - 1];
  const isPassed = score >= 80 && faults <= 2;

  useEffect(() => {
    if (isFinished && isPassed) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // confetti fallback
      }
    }
  }, [isFinished, isPassed]);

  return (
    <>
      {/* Top Center Test Objective Banner during active test */}
      {!isFinished && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="glass-panel px-6 py-3 rounded-2xl border border-amber-500/40 shadow-2xl flex flex-col items-center gap-1 max-w-lg text-center backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black font-orbitron">
                STAGE {currentStepIndex + 1}/{DRIVING_TEST_STEPS.length}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                SCORE: {score} PTS
              </span>
              {faults > 0 && (
                <span className="text-xs font-mono text-rose-400 font-bold">
                  FAULTS: {faults}/3
                </span>
              )}
            </div>

            <h3 className="text-sm font-black text-white font-orbitron mt-0.5">
              {currentStep.title}
            </h3>

            <p className="text-xs text-amber-200/90 leading-tight">
              {currentStep.instruction}
            </p>

            <span className="text-[10px] text-slate-400 italic mt-0.5">
              💡 Tip: {currentStep.tip}
            </span>
          </div>
        </div>
      )}

      {/* Final RTO Driving Licence Scorecard Modal */}
      {isFinished && (
        <div className="fixed inset-0 bg-[#060913]/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6 select-none pointer-events-auto">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-center text-center">
            
            {/* Status Icon */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/20'
            }`}>
              {isPassed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Government of Karnataka • Transport Dept
            </span>

            <h2 className="text-2xl font-black font-orbitron text-white mt-1">
              {isPassed ? 'DRIVING TEST PASSED!' : 'TEST ATTEMPT COMPLETED'}
            </h2>

            <p className="text-xs text-slate-300 mt-2 mb-6">
              {isPassed
                ? 'Congratulations! You demonstrated mastery of Indian road orientation, dual-hand steering, and gesture controls.'
                : 'You scored below the passing threshold (80 pts) or exceeded fault limits. Practice in Free Drive and try again!'}
            </p>

            {/* Smart Card Style Score Summary */}
            <div className="w-full bg-slate-900/80 rounded-2xl p-4 border border-white/5 flex flex-col gap-2 mb-6 text-left font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">RTO Track Location:</span>
                <span className="text-white font-bold">Mangaluru Automated Track</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Final Candidate Score:</span>
                <span className={`font-black ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>{score} / 110</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Boundary Cones Touched:</span>
                <span className={faults > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{faults}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Smart DL Status:</span>
                <span className={`font-bold ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPassed ? 'APPROVED (LMV - RIGHT HAND DRIVE)' : 'RE-TEST RECOMMENDED'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onRestart}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Test
              </button>

              <button
                onClick={onExitToFreeDrive}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-orbitron font-black text-xs tracking-wider transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
              >
                Free Drive
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
