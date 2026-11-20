import React from 'react';
import { 
  ArrowLeft, ArrowRight, Gauge, Fuel, Zap, Eye, Volume2, VolumeX, AlertTriangle, ShieldCheck, Camera
} from 'lucide-react';

export default function DashboardHUD({
  speedKmh,
  rpm,
  currentGear,
  fuel,
  gestures,
  cameraMode,
  onToggleCamera,
  onSelectGear,
  isMuted,
  onToggleMute,
  carData,
  locationData,
  onExit
}) {
  const gears = ['R', 'N', '1', '2', '3', '4', '5'];
  
  // Calculate gauge rotations
  const speedNormalized = Math.min(1.0, Math.max(0, speedKmh / 180));
  const speedAngle = -120 + speedNormalized * 240; // degrees

  const rpmNormalized = Math.min(1.0, Math.max(0, (rpm - 800) / (6500 - 800)));
  const rpmAngle = -120 + rpmNormalized * 240;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      
      {/* --- TOP BAR: LOCATION, INDIAN HIGHWAY BADGE & CONTROLS --- */}
      <div className="flex items-center justify-between w-full">
        {/* Location & Speed Limit */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white hover:border-amber-500/50 transition-all cursor-pointer"
          >
            ← Exit Drive
          </button>

          <div className="glass-panel px-4 py-1.5 rounded-xl flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-white tracking-wide">{locationData?.name}</div>
              <div className="text-[10px] text-amber-400 font-kannada font-medium">{locationData?.kannadaName}</div>
            </div>
          </div>

          {/* Indian Speed Limit Roundel */}
          <div className="glass-panel w-9 h-9 rounded-full flex items-center justify-center border-2 border-red-500 shadow-lg shadow-red-500/20">
            <span className="text-[11px] font-black text-white font-orbitron">{locationData?.speedLimit || 60}</span>
          </div>
        </div>

        {/* Right side: Camera Mode, Audio Mute, Live Gesture Tag */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Active Gesture Pill */}
          <div className="glass-panel-amber px-4 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Gesture:</span>
            <span className="text-xs font-bold text-white font-orbitron">
              {gestures?.summaryText || 'Hands Ready'}
            </span>
          </div>

          {/* Camera switcher */}
          <button
            onClick={onToggleCamera}
            className="glass-panel px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-amber-400 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Switch Camera View (3 fingers gesture or click)"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{cameraMode.replace('-', ' ')}</span>
          </button>

          {/* Audio Mute toggle */}
          <button
            onClick={onToggleMute}
            className="glass-panel w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* --- CENTER WARNING / NOTICE (COLLISION OR LANE) --- */}
      <div className="flex justify-center">
        {gestures?.isHorn && (
          <div className="glass-panel-amber px-6 py-2 rounded-2xl flex items-center gap-3 animate-bounce">
            <span className="text-xl">📢</span>
            <span className="text-sm font-black text-amber-300 font-orbitron tracking-widest">
              INDIAN HORN ACTIVE • PAAAM!
            </span>
          </div>
        )}
      </div>

      {/* --- BOTTOM DASHBOARD INSTRUMENT CLUSTER --- */}
      <div className="flex items-end justify-between w-full">
        
        {/* LEFT GAUGE: TACHOMETER (RPM) */}
        <div className="glass-panel p-4 rounded-3xl flex items-center gap-4 relative overflow-hidden pointer-events-auto">
          {/* Turn Indicator Left */}
          <div className={`p-2 rounded-xl transition-all ${gestures?.isLeftIndicator ? 'bg-emerald-500/20 text-emerald-400 blink-indicator' : 'text-slate-600'}`}>
            <ArrowLeft className="w-6 h-6" />
          </div>

          <div className="flex flex-col items-center">
            {/* Circular Dial Visual */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="6" strokeDasharray="180 360" strokeLinecap="round" />
                {/* Value Arc */}
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke={rpm > 5500 ? '#ef4444' : '#f59e0b'}
                  strokeWidth="6"
                  strokeDasharray={`${rpmNormalized * 180} 360`}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>

              {/* Digital RPM */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black font-orbitron text-white tracking-tighter">
                  {Math.round(rpm)}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RPM x1000</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER CONSOLE: GEAR SELECTOR (R - N - 1 - 2 - 3 - 4 - 5) */}
        <div className="glass-panel px-6 py-3.5 rounded-3xl flex flex-col items-center gap-2 pointer-events-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>Transmission</span>
            <span className="text-amber-400 font-semibold">• Pinch to Shift</span>
          </div>

          <div className="flex items-center gap-2">
            {gears.map((g) => {
              const isActive = currentGear === g;
              return (
                <button
                  key={g}
                  onClick={() => onSelectGear && onSelectGear(g)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-orbitron font-black text-sm transition-all cursor-pointer ${
                    isActive
                      ? g === 'R'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-110 border border-rose-300'
                        : 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 scale-110 border border-amber-300'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Steering Angle Indicator Bar */}
          <div className="w-full mt-1 flex flex-col items-center">
            <div className="w-full bg-slate-800 h-1.5 rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-cyan-400 rounded-full transition-all duration-75"
                style={{
                  left: gestures?.steerAngle >= 0 ? '50%' : `${50 + gestures.steerAngle * 50}%`,
                  width: `${Math.abs(gestures?.steerAngle || 0) * 50}%`
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1">
              Steer: {Math.round((gestures?.steerAngleDegrees || 0))}°
            </span>
          </div>
        </div>

        {/* RIGHT GAUGE: SPEEDOMETER (KM/H) */}
        <div className="glass-panel p-4 rounded-3xl flex items-center gap-4 relative overflow-hidden pointer-events-auto">
          <div className="flex flex-col items-center">
            {/* Circular Dial Visual */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="6" strokeDasharray="180 360" strokeLinecap="round" />
                {/* Value Arc */}
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke={speedKmh > (locationData?.speedLimit || 80) ? '#ef4444' : '#06b6d4'}
                  strokeWidth="6"
                  strokeDasharray={`${speedNormalized * 180} 360`}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>

              {/* Digital Speed */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-orbitron text-white tracking-tighter">
                  {Math.round(speedKmh)}
                </span>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">KM/H</span>
              </div>
            </div>
          </div>

          {/* Turn Indicator Right */}
          <div className={`p-2 rounded-xl transition-all ${gestures?.isRightIndicator ? 'bg-emerald-500/20 text-emerald-400 blink-indicator' : 'text-slate-600'}`}>
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>

      </div>

    </div>
  );
}
