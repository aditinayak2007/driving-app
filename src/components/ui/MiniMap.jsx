import React from 'react';
import { Compass, Navigation } from 'lucide-react';

export default function MiniMap({ playerX, playerZ, playerYaw, locationName }) {
  // Convert 3D world coords to 2D radar view
  const mapWidth = 140;
  const mapHeight = 140;
  const scale = 0.55; // pixels per meter

  return (
    <div className="absolute top-4 left-4 z-20 pointer-events-auto">
      <div className="w-36 h-36 glass-panel rounded-2xl overflow-hidden relative border border-slate-700/60 shadow-xl flex flex-col p-2">
        
        {/* Header */}
        <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono mb-1">
          <div className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span className="font-bold text-white">GPS NAV</span>
          </div>
          <span className="text-amber-400 font-bold">NH-66</span>
        </div>

        {/* Radar Screen */}
        <div className="relative flex-1 bg-slate-950/90 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
          {/* Radar grid lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-cyan-500/15" />
            <div className="w-10 h-10 rounded-full border border-cyan-500/25" />
            <div className="absolute w-full h-[1px] bg-cyan-500/10" />
            <div className="absolute h-full w-[1px] bg-cyan-500/10" />
          </div>

          {/* Road Corridor Visual */}
          <div className="absolute w-12 h-full bg-slate-800/40 border-x border-cyan-500/20 flex justify-center">
            {/* Center median */}
            <div className="w-[1.5px] h-full bg-amber-500/40" />
          </div>

          {/* Player Vehicle Marker (Center) */}
          <div
            className="absolute z-10 flex items-center justify-center"
            style={{
              transform: `translate(${playerX * scale * 2}px, 0px) rotate(${-playerYaw * (180 / Math.PI)}deg)`
            }}
          >
            <div className="w-3.5 h-3.5 bg-amber-400 rounded-sm shadow-md shadow-amber-400/80 flex items-center justify-center border border-white">
              <Navigation className="w-2.5 h-2.5 text-black" />
            </div>
          </div>

          {/* Destination Ahead Indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Footer text */}
        <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>LEFT LANE</span>
          <span className="text-cyan-400">SURATHKAL</span>
        </div>

      </div>
    </div>
  );
}
