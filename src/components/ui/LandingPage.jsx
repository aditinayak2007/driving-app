import React from 'react';
import { 
  Play, Car, MapPin, Compass, HelpCircle, Sliders, ShieldCheck, Sparkles, Navigation, Award
} from 'lucide-react';

export default function LandingPage({
  onStartDrive,
  onOpenCarSelect,
  onOpenLocationSelect,
  onOpenModes,
  onOpenTutorial,
  onOpenSettings,
  onOpenCalibration,
  selectedCar,
  selectedLocation,
  selectedMode
}) {
  return (
    <div className="fixed inset-0 bg-[#05070f] z-30 flex flex-col justify-between p-6 md:p-12 select-none overflow-y-auto">
      
      {/* Background Ambient Glow & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute -bottom-10 left-0 right-0 h-64 bg-gradient-to-t from-black via-slate-950/80 to-transparent" />
      </div>

      {/* Top Navbar */}
      <div className="relative z-10 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/20 font-orbitron">
            DI
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black font-orbitron tracking-wider text-white">
              DRIVE INDIA <span className="text-amber-400">3D</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Experience Indian Roads • Dakshina Kannada Edition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Gestures</span>
          </button>

          <button
            onClick={onOpenCalibration}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel-cyan text-xs font-semibold text-cyan-300 hover:text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Calibrate</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Center Hero */}
      <div className="relative z-10 max-w-5xl w-full mx-auto my-auto text-center py-8">
        
        {/* Kannada District Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 mb-6 shadow-lg shadow-amber-500/10">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-kannada font-bold text-amber-300">
            ದಕ್ಷಿಣ ಕನ್ನಡ ಜಿಲ್ಲೆಯ ಹೆದ್ದಾರಿಗಳು • ಮಂಗಳೂರು, ಸುರತ್ಕಲ್, ಬಿ.ಸಿ. ರೋಡ್, ಪುತ್ತೂರು
          </span>
        </div>

        {/* Hero Title */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black font-orbitron tracking-tight text-white uppercase leading-none mb-4">
          DRIVE WITH YOUR <br />
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
            BARE HANDS
          </span>
        </h2>

        <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-300 font-normal leading-relaxed mb-6">
          The next-generation Indian car driving simulator. Hold an imaginary steering wheel in mid-air, 
          accelerate with a fist, and experience authentic Indian highway driving without physical controllers or keyboard.
        </p>

        {/* Quick Webcam & Keyboard Info Pill */}
        <div className="flex items-center justify-center gap-3 mb-8 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Webcam Hand Gestures
          </span>
          <span className="text-slate-500">•</span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300">
            Keyboard Fallback: W/A/S/D & 1-5
          </span>
        </div>

        {/* Primary Launch Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            onClick={onStartDrive}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-orbitron font-black text-sm tracking-wider shadow-xl shadow-amber-500/25 hover:scale-105 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            START DRIVING NOW
          </button>

          <button
            onClick={onOpenCalibration}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel text-white font-orbitron font-bold text-xs tracking-wider hover:border-amber-500/50 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            GESTURE CALIBRATION
          </button>
        </div>

        {/* Configuration Quick Select Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {/* Selected Car Card */}
          <div
            onClick={onOpenCarSelect}
            className="glass-card p-4 rounded-2xl text-left flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Vehicle</span>
                <span className="text-xs font-black font-orbitron text-white group-hover:text-amber-400 transition-colors">
                  {selectedCar.name}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-white">Change →</span>
          </div>

          {/* Selected Location Card */}
          <div
            onClick={onOpenLocationSelect}
            className="glass-card p-4 rounded-2xl text-left flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Location</span>
                <span className="text-xs font-black font-orbitron text-white group-hover:text-cyan-400 transition-colors">
                  {selectedLocation.name}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-white">Change →</span>
          </div>

          {/* Selected Mode Card */}
          <div
            onClick={onOpenModes}
            className="glass-card p-4 rounded-2xl text-left flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Experience</span>
                <span className="text-xs font-black font-orbitron text-white group-hover:text-emerald-400 transition-colors capitalize">
                  {selectedMode} Mode
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-white">Change →</span>
          </div>
        </div>

      </div>

      {/* Bottom Footer Specs */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-7xl w-full mx-auto pt-6 border-t border-white/5 text-[11px] text-slate-400 font-mono gap-3">
        <div className="flex items-center gap-4">
          <span className="text-slate-300 font-semibold">100% Real-Time Hand Tracking</span>
          <span>•</span>
          <span>Indian Left-Hand Driving</span>
          <span>•</span>
          <span>Web Audio API Engine</span>
        </div>

        <div className="text-slate-500">
          Created for Google Antigravity • MediaPipe CV & Three.js
        </div>
      </div>

    </div>
  );
}
