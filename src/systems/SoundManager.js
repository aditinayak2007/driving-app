/**
 * Web Audio API Sound Synthesizer for DRIVE INDIA 3D
 * Synthesizes realistic Indian car engine sounds, dual-tone horn, gear clicks, and indicators.
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    
    // Engine synthesis nodes
    this.engineGain = null;
    this.osc1 = null;
    this.osc2 = null;
    this.turboOsc = null;
    this.turboGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
    
    // Horn nodes
    this.hornOsc1 = null;
    this.hornOsc2 = null;
    this.hornGain = null;
    this.isHornPlaying = false;
    
    // Indicator timer
    this.indicatorInterval = null;
    this.indicatorState = false;

    this.carProfile = {
      idleFreq: 75,
      maxFreq: 280,
      turboWhistle: true,
      soundType: 'diesel-turbo'
    };
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (err) {
      console.warn('Web Audio API not supported:', err);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setCarProfile(profile) {
    if (profile) {
      this.carProfile = { ...this.carProfile, ...profile };
    }
  }

  startEngine() {
    this.init();
    this.resume();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      const t = this.ctx.currentTime;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.01, t);
      this.engineGain.gain.exponentialRampToValueAtTime(0.35, t + 0.3);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(350, t);
      this.engineFilter.Q.setValueAtTime(2.5, t);

      // Osc 1: Primary cylinder fire (sawtooth)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(this.carProfile.idleFreq, t);

      // Osc 2: Sub-bass engine rumble (triangle, 1 octave lower)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(this.carProfile.idleFreq * 0.5, t);

      // Turbo whistle
      this.turboOsc = this.ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(1400, t);

      this.turboGain = this.ctx.createGain();
      this.turboGain.gain.setValueAtTime(0.0, t);

      this.osc1.connect(this.engineFilter);
      this.osc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);

      this.turboOsc.connect(this.turboGain);
      this.turboGain.connect(this.engineGain);

      this.engineGain.connect(this.masterGain);

      this.osc1.start();
      this.osc2.start();
      this.turboOsc.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Failed to start engine audio:', e);
    }
  }

  updateEngine(rpm, throttle = 0) {
    if (!this.ctx || !this.isEngineRunning || !this.osc1) return;
    try {
      const normalizedRpm = Math.max(800, Math.min(6500, rpm));
      const factor = (normalizedRpm - 800) / (6500 - 800);
      
      const targetFreq = this.carProfile.idleFreq + factor * (this.carProfile.maxFreq - this.carProfile.idleFreq);
      const filterFreq = 300 + factor * 1600 + throttle * 500;
      
      const t = this.ctx.currentTime;
      this.osc1.frequency.setTargetAtTime(targetFreq, t, 0.04);
      this.osc2.frequency.setTargetAtTime(targetFreq * 0.5, t, 0.04);
      this.engineFilter.frequency.setTargetAtTime(filterFreq, t, 0.05);

      if (this.carProfile.turboWhistle && this.turboGain) {
        const whistleFreq = 1600 + factor * 3500;
        this.turboOsc.frequency.setTargetAtTime(whistleFreq, t, 0.08);
        const whistleVol = Math.max(0, throttle * factor * 0.08);
        this.turboGain.gain.setTargetAtTime(whistleVol, t, 0.05);
      }

      // Volume increases slightly with RPM & throttle
      const vol = 0.28 + factor * 0.22 + throttle * 0.12;
      this.engineGain.gain.setTargetAtTime(vol, t, 0.05);
    } catch (e) {
      // Ignore audio sync glitch
    }
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.osc1) this.osc1.stop();
      if (this.osc2) this.osc2.stop();
      if (this.turboOsc) this.turboOsc.stop();
      this.isEngineRunning = false;
    } catch (e) {
      // ignore
    }
  }

  /**
   * Authentic Indian Dual-Tone Vehicle Horn ("PAAAM-PAAAM!")
   * Harmonically tuned at ~392Hz & 494Hz with brassy distortion
   */
  startHorn() {
    this.init();
    this.resume();
    if (!this.ctx || this.isHornPlaying) return;

    try {
      const t = this.ctx.currentTime;
      this.hornGain = this.ctx.createGain();
      this.hornGain.gain.setValueAtTime(0.01, t);
      this.hornGain.gain.exponentialRampToValueAtTime(0.45, t + 0.04);

      this.hornOsc1 = this.ctx.createOscillator();
      this.hornOsc1.type = 'sawtooth';
      this.hornOsc1.frequency.setValueAtTime(392, t); // G4

      this.hornOsc2 = this.ctx.createOscillator();
      this.hornOsc2.type = 'sawtooth';
      this.hornOsc2.frequency.setValueAtTime(494, t); // B4

      // Resonant bandpass filter for classic Indian metal horn trumpet resonance
      const hornFilter = this.ctx.createBiquadFilter();
      hornFilter.type = 'bandpass';
      hornFilter.frequency.setValueAtTime(880, t);
      hornFilter.Q.setValueAtTime(3.0, t);

      this.hornOsc1.connect(hornFilter);
      this.hornOsc2.connect(hornFilter);
      hornFilter.connect(this.hornGain);
      this.hornGain.connect(this.masterGain);

      this.hornOsc1.start();
      this.hornOsc2.start();
      this.isHornPlaying = true;
    } catch (e) {
      console.warn('Horn audio error:', e);
    }
  }

  stopHorn() {
    if (!this.isHornPlaying || !this.hornGain || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      this.hornGain.gain.setValueAtTime(this.hornGain.gain.value, t);
      this.hornGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      setTimeout(() => {
        if (this.hornOsc1) {
          try { this.hornOsc1.stop(); } catch(err) {}
          this.hornOsc1 = null;
        }
        if (this.hornOsc2) {
          try { this.hornOsc2.stop(); } catch(err) {}
          this.hornOsc2 = null;
        }
        this.isHornPlaying = false;
      }, 60);
    } catch (e) {
      this.isHornPlaying = false;
    }
  }

  /**
   * Mechanical Gear Shift Clunk & Gate Snap
   */
  playGearShift() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      
      // Heavy mechanical thud
      const thudOsc = this.ctx.createOscillator();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(110, t);
      thudOsc.frequency.exponentialRampToValueAtTime(35, t + 0.09);

      const thudGain = this.ctx.createGain();
      thudGain.gain.setValueAtTime(0.4, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      // Crisp metallic gate click
      const clickOsc = this.ctx.createOscillator();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(820, t);
      clickOsc.frequency.exponentialRampToValueAtTime(240, t + 0.04);

      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0.2, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      thudOsc.connect(thudGain);
      thudGain.connect(this.masterGain);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);

      thudOsc.start();
      thudOsc.stop(t + 0.11);
      clickOsc.start();
      clickOsc.stop(t + 0.06);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Relay Tick-Tock for Turn Indicators
   */
  playIndicatorClick(isTick = true) {
    this.init();
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isTick ? 950 : 720, t);
      osc.frequency.exponentialRampToValueAtTime(isTick ? 450 : 380, t + 0.025);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(t + 0.035);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Brake Screech
   */
  playBrakeScreech() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2800, t);
      osc.frequency.linearRampToValueAtTime(2200, t + 0.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2500, t);
      filter.Q.setValueAtTime(8.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(t + 0.26);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Collision Impact
   */
  playCrash() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(t + 0.42);
    } catch (e) {
      // ignore
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
