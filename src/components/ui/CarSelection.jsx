import React from 'react';
import { CARS_DATA } from '../../data/carsData';
import { Check, Shield, Zap, Gauge, Flame, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CarSelection({
  selectedCar,
  onSelectCar,
  selectedColor,
  onSelectColor,
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
            CHOOSE YOUR INDIAN MACHINE
          </h2>
          <span className="text-xs text-amber-400 font-mono">Right-Hand-Drive (RHD) Indian Fleet</span>
        </div>

        <button
          onClick={onConfirm}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-orbitron font-black text-xs tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
        >
          Confirm & Drive
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Car Cards Carousel Grid */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 my-auto py-4">
        {CARS_DATA.map((car) => {
          const isSelected = selectedCar.id === car.id;
          return (
            <div
              key={car.id}
              onClick={() => {
                onSelectCar(car);
                onSelectColor(car.colors[0].hex);
              }}
              className={`glass-panel rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.02] bg-slate-900/80'
                  : 'border-white/10 hover:border-white/20 bg-slate-950/60'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                  {car.type}
                </span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 font-orbitron">
                    <Check className="w-3.5 h-3.5" /> SELECTED
                  </span>
                )}
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-xl font-black font-orbitron text-white tracking-wide">
                  {car.name}
                </h3>
                <div className="text-xs font-mono text-cyan-400 mb-1">{car.badge}</div>
                <p className="text-xs text-slate-400 italic mb-4">"{car.tagline}"</p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-white/5 mb-4 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Power</div>
                  <div className="text-xs font-black text-white">{car.hp} HP</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Torque</div>
                  <div className="text-xs font-black text-amber-400">{car.torque}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Top Speed</div>
                  <div className="text-xs font-black text-cyan-400">{car.topSpeed} KM/H</div>
                </div>
              </div>

              {/* Indian Feature Highlights */}
              <div className="space-y-1.5 mb-5">
                {car.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Color Swatches if selected */}
              {isSelected && (
                <div className="pt-4 border-t border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Select Paint Finish
                  </div>
                  <div className="flex items-center gap-2">
                    {car.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectColor(c.hex);
                        }}
                        title={c.name}
                        className={`w-7 h-7 rounded-full transition-all cursor-pointer border ${
                          selectedColor === c.hex ? 'scale-125 border-amber-400 shadow-md shadow-amber-400/50' : 'border-white/20 hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 font-mono">
        All vehicles configured with authentic Right-Hand Drive (RHD) Indian cockpits & dual-tone Indian horn.
      </div>

    </div>
  );
}
