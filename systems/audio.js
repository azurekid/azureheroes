/* Web Audio only: every sound is synthesised, no audio files. Also owns the localStorage save. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const KEY = 'azureheroes2027';
  AH.Save = {
    data: { best: 0, unlocked: 1, bests: {}, muted: false },
    load() {
      try {
        const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
        this.data = Object.assign({ best: 0, unlocked: 1, bests: {}, muted: false }, raw);
      } catch (e) { /* storage unavailable (private mode) - keep defaults in memory */ }
      return this.data;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
    },
    recordScore(levelId, score) {
      if (score > this.data.best) this.data.best = score;
      if (score > (this.data.bests[levelId] || 0)) this.data.bests[levelId] = score;
      this.save();
    },
    unlock(n) {
      if (n > this.data.unlocked) { this.data.unlocked = n; this.save(); }
    }
  };

  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);

  const A = (AH.Audio = {
    ctx: null,
    master: null,
    muted: false,
    musicTimer: null,
    musicKind: null,
    step: 0,

    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      if (this.musicKind) this.music(this.musicKind);
    },

    setMuted(m) {
      this.muted = m;
      if (this.master) this.master.gain.value = m ? 0 : 0.5;
      AH.Save.data.muted = m;
      AH.Save.save();
    },
    toggle() {
      this.init();
      this.setMuted(!this.muted);
      return this.muted;
    },

    tone(freq, dur, type, vol, slide, delay) {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t0 + dur);
      g.gain.setValueAtTime(vol || 0.2, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g);
      g.connect(this.master);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    },
    noise(dur, vol, delay) {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = this.ctx.createBufferSource();
      const g = this.ctx.createGain();
      s.buffer = buf;
      g.gain.value = vol || 0.2;
      s.connect(g);
      g.connect(this.master);
      s.start(t0);
    },

    play(name) {
      this.init();
      if (!this.ctx) return;
      switch (name) {
        case 'jump': this.tone(260, 0.16, 'square', 0.16, 560); break;
        case 'doubleJump': this.tone(420, 0.18, 'square', 0.16, 900); break;
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
    },

    music(kind) {
      this.musicKind = kind;
      clearInterval(this.musicTimer);
      this.musicTimer = null;
      if (!this.ctx || !kind) return;
      const boss = kind === 'boss';
      const bass = boss ? [33, 33, 45, 33, 36, 36, 48, 36] : [38, 38, 50, 38, 41, 41, 53, 43];
      const lead = boss ? [69, 0, 72, 0, 69, 0, 75, 74] : [74, 0, 77, 0, 81, 0, 79, 77];
      this.step = 0;
      this.musicTimer = setInterval(() => {
        if (this.muted || !this.ctx) return;
        const i = this.step++ % 8;
        this.tone(NOTE(bass[i]), 0.2, 'triangle', 0.1);
        if (lead[i]) this.tone(NOTE(lead[i]), 0.12, 'square', 0.035);
      }, boss ? 170 : 230);
    }
  });
})();
