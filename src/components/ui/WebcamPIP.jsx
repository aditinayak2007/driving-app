import React, { useState } from 'react';
import { Camera, Eye, EyeOff, Maximize2, Minimize2, Video, AlertCircle, RefreshCw, Hand } from 'lucide-react';

export default function WebcamPIP({
  videoRef,
  canvasRef,
  gestures,
  fps = 30,
  isTracking = true,
  error = null,
  status = '',
  onRequestCamera,
  onToggleVirtualControls,
  showVirtualControls = false
}) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`fixed top-4 right-4 z-40 transition-all duration-300 pointer-events-auto ${
      isMinimized ? 'w-24 h-16' : 'w-72 h-56'
    }`}>
      <div className="w-full h-full glass-panel rounded-2xl overflow-hidden relative border border-slate-700/60 shadow-2xl flex flex-col">
        
        {/* PIP Header */}
        <div className="h-7 bg-slate-900/90 px-2.5 flex items-center justify-between text-[11px] font-semibold border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isTracking && !error ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span className="text-slate-200 font-mono text-[10px] tracking-wider">AI HAND VISION</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 font-bold">{fps} FPS</span>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Video & Canvas Area */}
        <div className="relative flex-1 bg-black/95 overflow-hidden flex items-center justify-center">
          {/* Mirrored webcam stream */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover scale-x-[-1] opacity-75"
          />

          {/* Skeleton & Gesture Canvas */}
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Status Overlay when hands not detected */}
          {!gestures?.leftHandPresent && !gestures?.rightHandPresent && !error && isTracking && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center pointer-events-none">
              <Hand className="w-7 h-7 text-amber-400 mb-1.5 animate-bounce" />
              <span className="text-xs font-bold text-white leading-tight font-orbitron">Hold Both Hands Up</span>
              <span className="text-[10px] text-slate-300 mt-1">Simulate gripping an imaginary steering wheel</span>
            </div>
          )}

          {/* Error / Permission Blocked Overlay */}
          {error && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-3 text-center z-20">
              <AlertCircle className="w-6 h-6 text-rose-400 mb-1.5" />
              <span className="text-[11px] font-bold text-rose-200 leading-tight mb-2">
                {error}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onRequestCamera}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold font-orbitron transition-all cursor-pointer flex items-center gap-1 shadow-md"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Camera
                </button>
                <button
                  onClick={onToggleVirtualControls}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold font-mono transition-all cursor-pointer border border-cyan-500/30"
                >
                  On-Screen Controls
                </button>
              </div>
            </div>
          )}

          {/* Mini detected gesture badge inside PIP */}
          {!isMinimized && !error && (
            <div className="absolute bottom-1.5 left-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center justify-between text-[10px] border border-white/10">
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${gestures?.leftHandPresent ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                <span className="text-slate-300 font-mono text-[9px]">L: {gestures?.isBraking ? 'Brake' : (gestures?.isLeftIndicator ? 'Ind' : (gestures?.leftHandPresent ? 'Ready' : 'Off'))}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${gestures?.rightHandPresent ? 'bg-amber-400' : 'bg-slate-600'}`} />
                <span className="text-slate-300 font-mono text-[9px]">R: {gestures?.isAccelerating ? 'Gas' : (gestures?.isPinching ? 'Gear' : (gestures?.rightHandPresent ? 'Ready' : 'Off'))}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
