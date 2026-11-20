import React from 'react';
import { X, Sliders, Volume2, ShieldCheck, Video, HelpCircle } from 'lucide-react';

export default function SettingsModal({
  steeringSensitivity,
  steeringDeadzone,
  throttleSensitivity,
  onUpdateSettings,
  isMuted,
  onToggleMute,
  onClose
}) {
  return (
    <div className="fixed inset-0 bg-[#060913]/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-black font-orbitron text-white tracking-wide">
              SIMULATOR SETTINGS
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4 mb-6">
          {/* Steering Sensitivity */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Steering Sensitivity:</span>
              <span className="font-mono text-amber-400 font-bold">{steeringSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.1"
              value={steeringSensitivity}
              onChange={(e) => onUpdateSettings({ steeringSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Steering Deadzone */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Steering Center Deadzone:</span>
              <span className="font-mono text-cyan-400 font-bold">{Math.round(steeringDeadzone * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.15"
              step="0.01"
              value={steeringDeadzone}
              onChange={(e) => onUpdateSettings({ steeringDeadzone: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Throttle Sensitivity */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Throttle Fist Response:</span>
              <span className="font-mono text-emerald-400 font-bold">{throttleSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={throttleSensitivity}
              onChange={(e) => onUpdateSettings({ throttleSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Audio toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Engine & Horn Sound</span>
            <button
              onClick={onToggleMute}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {isMuted ? 'MUTED' : 'ACTIVE'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-orbitron font-black text-xs tracking-wider transition-all cursor-pointer"
        >
          Save & Return
        </button>

      </div>
    </div>
  );
}
