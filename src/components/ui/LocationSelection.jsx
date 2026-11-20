import React from 'react';
import { LOCATIONS_DATA } from '../../data/locationsData';
import { MapPin, Navigation, Compass, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function LocationSelection({
  selectedLocation,
  onSelectLocation,
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
            DAKSHINA KANNADA ROUTES
          </h2>
          <span className="text-xs text-amber-400 font-kannada">ದಕ್ಷಿಣ ಕನ್ನಡ ಜಿಲ್ಲೆಯ ನೈಜ ರಸ್ತೆಗಳು</span>
        </div>

        <button
          onClick={onConfirm}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-orbitron font-black text-xs tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
        >
          Confirm Route
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Locations Grid */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 my-auto py-4">
        {LOCATIONS_DATA.map((loc) => {
          const isSelected = selectedLocation.id === loc.id;
          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className={`glass-panel rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20 scale-[1.02] bg-slate-900/80'
                  : 'border-white/10 hover:border-white/20 bg-slate-950/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
                    {loc.district}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-cyan-400 font-orbitron">
                      <Check className="w-3.5 h-3.5" /> SELECTED
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black font-orbitron text-white mb-1">
                  {loc.name}
                </h3>
                <div className="text-xs font-kannada text-amber-400 font-semibold mb-3">
                  {loc.kannadaName}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {loc.description}
                </p>
              </div>

              {/* Badges */}
              <div>
                <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-white/5 mb-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Speed Limit</span>
                    <span className="font-bold text-white">{loc.speedLimit} KM/H</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Traffic</span>
                    <span className="font-bold text-amber-400">{loc.trafficDensity}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {loc.features.map((f, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-white/5">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 font-mono">
        All routes follow strict Indian left-side driving orientation with authentic KSRTC buses & auto-rickshaws.
      </div>

    </div>
  );
}
