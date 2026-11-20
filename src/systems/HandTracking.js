/**
 * MediaPipe Real-Time Hand Tracking System for DRIVE INDIA 3D
 * Robust dual-hand tracking, flexible camera constraints, and error diagnostics.
 */

import { GestureRecognition } from './GestureRecognition';

// MediaPipe hand connections definition
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17]                               // Palm base
];

export class HandTrackingService {
  constructor(onGestureCallback, onErrorCallback, onStatusCallback) {
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;
    this.hands = null;
    this.camera = null;
    this.stream = null;
    
    this.gestureRecognizer = new GestureRecognition();
    this.onGesture = onGestureCallback || (() => {});
    this.onError = onErrorCallback || (() => {});
    this.onStatus = onStatusCallback || (() => {});

    this.isTracking = false;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.lastResults = null;
    this.isMediaPipeReady = false;
    this.animFrameId = null;
  }

  setSensitivity(steerSens, deadzone, throttleSens) {
    this.gestureRecognizer.setSensitivity(steerSens, deadzone, throttleSens);
  }

  async init(videoEl, canvasEl) {
    this.videoElement = videoEl;
    this.canvasElement = canvasEl;
    if (canvasEl) {
      this.canvasCtx = canvasEl.getContext('2d');
    }

    this.onStatus('Initializing Computer Vision...');

    try {
      if (window.Hands) {
        this.setupMediaPipeHands();
      } else {
        await this.loadMediaPipeScripts();
        this.setupMediaPipeHands();
      }
    } catch (err) {
      console.warn('MediaPipe initialization warning:', err);
      this.onError('MediaPipe load notice: ' + err.message);
    }
  }

  loadMediaPipeScripts() {
    return new Promise((resolve) => {
      if (window.Hands) {
        return resolve();
      }

      let loaded = 0;
      const checkDone = () => {
        loaded++;
        if (loaded >= 2 || window.Hands) {
          resolve();
        }
      };

      const s1 = document.createElement('script');
      s1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
      s1.crossOrigin = 'anonymous';
      s1.onload = checkDone;
      s1.onerror = () => checkDone();
      document.head.appendChild(s1);

      const s2 = document.createElement('script');
      s2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
      s2.crossOrigin = 'anonymous';
      s2.onload = checkDone;
      s2.onerror = () => checkDone();
      document.head.appendChild(s2);

      setTimeout(() => {
        resolve();
      }, 4000);
    });
  }

  setupMediaPipeHands() {
    if (!window.Hands) {
      this.onStatus('Webcam Ready • Waiting for MediaPipe model...');
      return;
    }

    try {
      this.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults((results) => this.handleResults(results));
      this.isMediaPipeReady = true;
      this.onStatus('MediaPipe AI Ready • Show both hands');
    } catch (e) {
      console.warn('Hands setup error:', e);
      this.onError('AI Model error: ' + e.message);
    }
  }

  /**
   * Acquire camera with flexible fallbacks for all browsers
   */
  async startCamera() {
    if (!this.videoElement) {
      this.onError('Video element not attached.');
      return false;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isSecure = window.isSecureContext;
      const msg = !isSecure
        ? 'Camera requires HTTPS or localhost. Please access via https:// or localhost.'
        : 'Webcam not supported by your browser.';
      this.onError(msg);
      return false;
    }

    this.onStatus('Requesting camera permission...');

    let stream = null;
    try {
      // Primary attempt: standard user-facing webcam
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
    } catch (err1) {
      console.warn('Standard constraints failed, trying basic { video: true }...', err1);
      try {
        // Fallback attempt: basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err2) {
        console.error('Webcam acquisition failed:', err2);
        let errorMsg = 'Camera access denied or unavailable.';
        if (err2.name === 'NotAllowedError') {
          errorMsg = 'Camera permission denied. Please allow camera in browser address bar.';
        } else if (err2.name === 'NotFoundError') {
          errorMsg = 'No webcam found on this device.';
        } else if (err2.name === 'NotReadableError') {
          errorMsg = 'Camera is already in use by another application.';
        }
        this.onError(errorMsg);
        return false;
      }
    }

    this.stream = stream;
    this.videoElement.srcObject = stream;
    
    try {
      await this.videoElement.play();
    } catch (playErr) {
      console.warn('video.play() warning:', playErr);
    }

    this.isTracking = true;
    this.onStatus('Camera connected. Detecting hands...');

    // Start frame processing loop
    this.startFrameLoop();
    return true;
  }

  startFrameLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const processFrame = async () => {
      if (!this.isTracking) return;

      if (this.videoElement && this.videoElement.readyState >= 2) {
        if (this.hands && this.isMediaPipeReady) {
          try {
            await this.hands.send({ image: this.videoElement });
          } catch (e) {
            // skip dropped frame
          }
        }
      }

      this.animFrameId = requestAnimationFrame(processFrame);
    };

    this.animFrameId = requestAnimationFrame(processFrame);
  }

  stopCamera() {
    this.isTracking = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  handleResults(results) {
    this.lastResults = results;
    
    // FPS calculation
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    // Process gestures
    const gestures = this.gestureRecognizer.process(results);
    gestures.fps = this.fps;

    // Draw landmarks overlay onto PIP canvas
    this.drawOverlay(results, gestures);

    // Send to game controller
    this.onGesture(gestures);
  }

  drawOverlay(results, gestures) {
    if (!this.canvasCtx || !this.canvasElement) return;
    const ctx = this.canvasCtx;
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);

    if (results && results.multiHandLandmarks) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const isRightHandSide = landmarks[0].x > 0.5;

        // Draw connections
        ctx.strokeStyle = isRightHandSide ? 'rgba(245, 158, 11, 0.85)' : 'rgba(6, 182, 212, 0.85)';
        ctx.lineWidth = 2.5;

        for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
          const p1 = landmarks[startIdx];
          const p2 = landmarks[endIdx];
          ctx.beginPath();
          ctx.moveTo(p1.x * w, p1.y * h);
          ctx.lineTo(p2.x * w, p2.y * h);
          ctx.stroke();
        }

        // Draw nodes
        for (let j = 0; j < landmarks.length; j++) {
          const p = landmarks[j];
          const isTip = [4, 8, 12, 16, 20].includes(j);
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, isTip ? 4.5 : 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = isTip ? '#ffffff' : (isRightHandSide ? '#f59e0b' : '#06b6d4');
          ctx.fill();
        }
      }

      // Connecting steering arc
      if (gestures.leftHandPos && gestures.rightHandPos) {
        const lx = gestures.leftHandPos.x * w;
        const ly = gestures.leftHandPos.y * h;
        const rx = gestures.rightHandPos.x * w;
        const ry = gestures.rightHandPos.y * h;

        ctx.strokeStyle = gestures.isSteering ? '#10b981' : 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(rx, ry);
        ctx.stroke();
        ctx.setLineDash([]);

        const cx = (lx + rx) * 0.5;
        const cy = (ly + ry) * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
