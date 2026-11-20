import React from 'react';
import { X, Hand, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function GestureTutorialModal({ onClose, onStartDrive }) {
  const gestures = [
    {
      title: '1. Two-Hand Steering Wheel',
      desc: 'Hold both hands in the air at 9 and 3 o\'clock as if gripping an imaginary steering wheel. Rotate clockwise to turn right; counter-clockwise to turn left.',
      tag: 'Continuous',
      icon: '🔄'
    },
    {
      title: '2. Accelerator (Right Fist)',
      desc: 'Close your RIGHT hand into a fist to accelerate. Releasing the fist allows natural engine drag and coasting.',
      tag: 'Throttle',
      icon: '⚡'
    },
    {
      title: '3. Brake (Left Open Palm)',
      desc: 'Show an OPEN PALM with your LEFT hand facing the camera to apply smooth vehicle brakes and light up rear brake lamps.',
      tag: 'Braking',
      icon: '🛑'
    },
    {
      title: '4. Gear Shifter (Pinch)',
      desc: 'Pinch your RIGHT thumb and index finger together to cycle gears: Reverse (R), Neutral (N), 1st through 5th gear.',
      tag: 'Transmission',
      icon: '⚙'
    },
    {
      title: '5. Indian Vehicle Horn (Double Fist)',
      desc: 'Clench BOTH hands into simultaneous closed fists to blast the authentic dual-tone Indian horn ("PAAAM-PAAAM!").',
      tag: 'Horn',
      icon: '📢'
    },
    {
      title: '6. Turn Indicators (Raise Hand)',
      desc: 'Raise your left hand above steering level for LEFT indicator; raise your right hand for RIGHT indicator.',
      tag: 'Signals',
      icon: '⬅ ➡'
    },
    {
      title: '7. Camera Mode (3 Fingers)',
      desc: 'Show 3 extended fingers (Index, Middle, Ring) to toggle between Cockpit 1st Person, Chase Cam, Hood Cam, and Side View.',
      tag: 'Perspective',
      icon: '📷'
    }
  ];

  return (
    <div className="fixed inset-0 bg-[#060913]/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6 select-none overflow-y-auto">
      <div className="max-w-3xl w-full glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xl font-black font-orbitron text-white tracking-wide">
              GESTURE CONTROL MANUAL
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gestures List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-2 mb-6">
          {gestures.map((g, idx) => (
            <div key={idx} className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex gap-3.5 items-start">
              <div className="text-2xl p-2 bg-slate-800/80 rounded-xl shrink-0">
                {g.icon}
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-black font-orbitron text-white">{g.title}</h4>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">
                    {g.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {g.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="text-xs text-slate-400 font-mono">
            Sitting distance: 1.0 – 1.8 meters in front of webcam with adequate lighting.
          </div>

          <button
            onClick={onStartDrive || onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-orbitron font-black text-xs tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            I'm Ready to Drive
          </button>
        </div>

      </div>
    </div>
  );
}
