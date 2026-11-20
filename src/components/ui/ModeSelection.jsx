import React from 'react';
import { Compass, TrafficCone, Award, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export const GAME_MODES = [
  {
    id: 'free',
    title: 'MODE 1: FREE DRIVE',
    subtitle: 'Scenic Coastal Exploration',
    icon: Compass,
    color: 'from-cyan-500 to-blue-600',
    desc: 'Drive freely around the virtual Dakshina Kannada coastal highway. No timers or restrictions. Experience smooth cruising, seaside scenery, and Indian traffic.',
    highlights: ['Endless highway stretch', 'Left-side driving practice', 'Relaxed coastal cruising']
  },
  {
    id: 'city',
    title: 'MODE 2: CITY DRIVING',
    subtitle: 'Mangaluru Urban Challenge',
    icon: TrafficCone,
    color: 'from-amber-500 to-orange-600',
    desc: 'Navigate bustling Mangaluru city junctions, auto-rickshaws, KSRTC buses, functional 3-phase traffic signals, and strict municipal speed limits.',
    highlights: ['Indian traffic signals', 'Speed limit monitoring', 'Dense auto-rickshaw traffic']
  },
  {
    id: 'test',
    title: 'MODE 3: DRIVING TEST',
    subtitle: 'RTO Smart Automated Track',
    icon: Award,
    color: 'from-emerald-500 to-teal-600',
    desc: 'Official Indian RTO Form 4 Driving Test simulation. Perform ignition, gear changes, Figure-8 curves, signal stop, and reverse parking to earn your Smart DL!',
    highlights: ['6-stage driving test', 'Passing score: 80/110 pts', 'Karnataka DL Smart Card']
  }
];

export default function ModeSelection({
  selectedMode,
  onSelectMode,
  onConfirm,
  onBack
}) {
  return (
    <div className="fixed inset-0 bg-[#060913]/95 backdrop-blur-2xl z-40 flex flex-col justify-between p-6 select-none overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto border-b border-white/10 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>

        <div className="text-center">
          <h2 className="text-xl font-black font-orbitron text-white tracking-wider">
            SELECT DRIVING EXPERIENCE
          </h2>
          <span className="text-xs text-amber-400 font-mono">Gesture Controlled 3D Simulation</span>
        </div>

        <button
          onClick={onConfirm}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-orbitron font-black text-xs tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
        >
          Confirm Mode
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modes Grid */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 my-auto py-4">
        {GAME_MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const Icon = mode.icon;

          return (
            <div
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`glass-panel rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.02] bg-slate-900/80'
                  : 'border-white/10 hover:border-white/20 bg-slate-950/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 font-orbitron">
                      <Check className="w-3.5 h-3.5" /> SELECTED
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black font-orbitron text-white mb-0.5">
                  {mode.title}
                </h3>
                <div className="text-xs font-mono text-amber-400 font-semibold mb-3">
                  {mode.subtitle}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {mode.desc}
                </p>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-white/5">
                {mode.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 font-mono">
        All modes utilize 100% webcam hand tracking with real-time gesture control.
      </div>

    </div>
  );
}
