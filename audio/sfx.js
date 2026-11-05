/* Locally synthesised effect recipes and their shared audio helpers. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.SoundEffects = {
    tone(freq, dur, type, vol, slide, delay) {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = Math.min(4200, Math.max(1000, freq * 3));
      filter.Q.value = 0.5;
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t0 + dur);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol || 0.2, t0 + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(filter); filter.connect(g);
      g.connect(this.sfx || this.master);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
      o.onended = () => { o.disconnect(); filter.disconnect(); g.disconnect(); };
    },
    noise(dur, vol, delay) {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * Math.min(1, i / (this.ctx.sampleRate * 0.003));
      const s = this.ctx.createBufferSource();
      const g = this.ctx.createGain();
      s.buffer = buf;
      g.gain.value = vol || 0.2;
      s.connect(g);
      g.connect(this.sfx || this.master);
      s.start(t0);
      s.onended = () => { s.disconnect(); g.disconnect(); };
    },

    play(name) {
      this.init();
      if (!this.ctx) return;
      switch (name) {
        case 'jump': this.tone(260, 0.16, 'square', 0.16, 560); break;
        case 'zap': this.tone(1400, 0.1, 'sawtooth', 0.08, 500); break;
        case 'splash': this.noise(0.4, 0.3); this.tone(180, 0.3, 'sine', 0.16, 60); break;
        case 'bike': this.tone(1568, 0.06, 'square', 0.12); this.tone(1568, 0.06, 'square', 0.12, null, 0.1); break;
        case 'secret': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.16, null, i * 0.07)); break;
        case 'achieve': this.tone(880, 0.08, 'sine', 0.18); this.tone(1320, 0.2, 'sine', 0.18, null, 0.08); break;
        case 'doubleJump': this.tone(420, 0.18, 'square', 0.16, 900); break;
        case 'power': this.tone(523, 0.08, 'square', 0.14); this.tone(659, 0.08, 'square', 0.14, null, 0.08); this.tone(784, 0.08, 'square', 0.14, null, 0.16); this.tone(1047, 0.22, 'square', 0.14, null, 0.24); break;
        case 'coin': this.tone(988, 0.07, 'square', 0.14); this.tone(1319, 0.16, 'square', 0.14, null, 0.07); break;
        case 'mfa': this.tone(660, 0.08, 'triangle', 0.2); this.tone(880, 0.08, 'triangle', 0.2, null, 0.08); this.tone(1320, 0.18, 'triangle', 0.2, null, 0.16); break;
        case 'ring': this.tone(700, 0.1, 'triangle', 0.2, 1400); break;
        case 'hit': this.noise(0.18, 0.28); this.tone(220, 0.2, 'sawtooth', 0.18, 60); break;
        case 'enemyHit': this.tone(300, 0.08, 'square', 0.16, 140); break;
        case 'kill': this.noise(0.22, 0.25); this.tone(500, 0.25, 'square', 0.14, 80); break;
        case 'blast': this.tone(900, 0.2, 'sawtooth', 0.12, 220); this.noise(0.08, 0.08); break;
        case 'shield': this.tone(1200, 0.06, 'square', 0.12); this.tone(1800, 0.12, 'triangle', 0.14, null, 0.04); break;
        case 'block': this.tone(500, 0.08, 'square', 0.2, 1500); this.noise(0.06, 0.12); break;
        case 'boss': this.tone(110, 0.6, 'sawtooth', 0.22, 50); this.tone(165, 0.6, 'square', 0.1, 70, 0.1); break;
        case 'bossHit': this.noise(0.25, 0.3); this.tone(180, 0.3, 'sawtooth', 0.22, 50); break;
        case 'stun': this.tone(1000, 0.1, 'square', 0.14, 300); this.tone(700, 0.2, 'square', 0.14, 200, 0.1); break;
        case 'punch': this.noise(0.09, 0.24); this.tone(150, 0.1, 'square', 0.16, 55); break;
        case 'swing': this.noise(0.12, 0.08); this.tone(700, 0.1, 'sine', 0.06, 240); break;
        case 'bell': this.tone(1320, 0.6, 'triangle', 0.18); this.tone(1980, 0.45, 'sine', 0.1, null, 0.02); this.tone(1320, 0.5, 'triangle', 0.14, null, 0.22); break;
        case 'ko': this.noise(0.3, 0.28); [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.22, 'square', 0.16, null, 0.1 + i * 0.12)); break;
        case 'hack': this.tone(1200 + Math.random() * 600, 0.04, 'square', 0.06); break;
        case 'unlock': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.12, 'square', 0.14, null, i * 0.07)); break;
        case 'checkpoint': this.tone(600, 0.1, 'triangle', 0.2); this.tone(900, 0.2, 'triangle', 0.2, null, 0.1); break;
        case 'life': [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.1, 'triangle', 0.2, null, i * 0.06)); break;
        case 'select': this.tone(880, 0.05, 'square', 0.1); break;
        case 'start': [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.12, 'square', 0.14, null, i * 0.08)); break;
        case 'win': [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.16, 'square', 0.15, null, i * 0.12)); break;
        case 'lose': [440, 392, 330, 262].forEach((f, i) => this.tone(f, 0.25, 'sawtooth', 0.14, null, i * 0.2)); break;
        case 'fall': this.tone(500, 0.5, 'sawtooth', 0.14, 60); break;
        default: break;
      }
    }
  };
})();
