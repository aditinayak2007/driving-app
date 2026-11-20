import React from 'react';
import { ArrowLeft, ArrowRight, Zap, ShieldAlert, Volume2, HelpCircle } from 'lucide-react';

export default function VirtualControlsOverlay({
  onSteer,
  onThrottle,
  onBrake,
  onHorn,
  onSelectGear,
  currentGear,
  onClose
}) {
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="glass-panel px-6 py-3.5 rounded-3xl border border-amber-500/40 shadow-2xl flex items-center gap-5 backdrop-blur-xl">
        
        {/* Steering Buttons */}
        <div className="flex items-center gap-2">
          <button
            onMouseDown={() => onSteer(-0.85)}
            onMouseUp={() => onSteer(0)}
            onTouchStart={() => onSteer(-0.85)}
            onTouchEnd={() => onSteer(0)}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-cyan-300 font-bold border border-cyan-500/40 flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            title="Steer Left [A or Left Arrow]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[8px] font-mono">STEER L</span>
          </button>

          <button
            onMouseDown={() => onSteer(0.85)}
            onMouseUp={() => onSteer(0)}
            onTouchStart={() => onSteer(0.85)}
            onTouchEnd={() => onSteer(0)}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-cyan-300 font-bold border border-cyan-500/40 flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            title="Steer Right [D or Right Arrow]"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-[8px] font-mono">STEER R</span>
          </button>
        </div>

        <div className="w-[1px] h-10 bg-white/10" />

        {/* Brake & Throttle Pedals */}
        <div className="flex items-center gap-2">
          <button
            onMouseDown={() => onBrake(1.0)}
            onMouseUp={() => onBrake(0)}
            onTouchStart={() => onBrake(1.0)}
            onTouchEnd={() => onBrake(0)}
            className="px-4 h-12 rounded-2xl bg-rose-950/80 hover:bg-rose-900 active:bg-rose-500 active:text-white text-rose-300 font-bold border border-rose-500/50 flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            title="Brake Pedal [S, Down Arrow, or Space]"
          >
            <span className="text-xs font-black font-orbitron">BRAKE</span>
            <span className="text-[8px] font-mono">[SPACE/S]</span>
          </button>

          <button
            onMouseDown={() => onThrottle(1.0)}
            onMouseUp={() => onThrottle(0)}
            onTouchStart={() => onThrottle(1.0)}
            onTouchEnd={() => onThrottle(0)}
            className="px-5 h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-emerald-400 text-black font-black font-orbitron flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg shadow-amber-500/30 active:scale-95"
            title="Gas Pedal [W or Up Arrow]"
          >
            <span className="text-xs font-black">GAS / ACCEL</span>
            <span className="text-[8px] font-mono font-bold">[W / UP]</span>
          </button>
        </div>

        <div className="w-[1px] h-10 bg-white/10" />

        {/* Indian Horn Button */}
        <button
          onMouseDown={() => onHorn(true)}
          onMouseUp={() => onHorn(false)}
          onTouchStart={() => onHorn(true)}
          onTouchEnd={() => onHorn(false)}
          className="px-3.5 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-black text-amber-300 font-bold border border-amber-500/40 flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
          title="Indian Horn [H]"
        >
          <span className="text-xs font-black font-orbitron">PAAAM!</span>
          <span className="text-[8px] font-mono">[H] HORN</span>
        </button>

      </div>
    </div>
  );
}
