/* Shared electronic Web Audio voices. Methods keep AH.Audio as their receiver. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const VOL = { lead: 0.19, arp: 0.095, pad: 0.055, bass: 0.42, k: 0.85, s: 0.28, h: 0.055, o: 0.075 };
  AH.AudioSynth = {
    buildVoices() {
      const ctx = this.ctx, len = ctx.sampleRate;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.waves = {};
      if (ctx.createPeriodicWave) {
        this.waves.bright = ctx.createPeriodicWave(new Float32Array(5), new Float32Array([0, 1, 0.28, 0.14, 0.05]));
      }
    },

    voice(s, e, t) {
      const song = s.song, kind = e[0], dur = e[2] * song.stepDur, vel = e[3];
      const mix = song.production?.mix || [1, 1, 1, 1];
      if (kind === 'lead') return this.inst(song.lead, e[1], t, dur * 0.92, VOL.lead * vel * mix[0], s, true);
      if (kind === 'arp') return this.inst(song.arp, e[1], t, Math.min(dur, song.stepDur * 1.6) * 0.8, VOL.arp * vel * mix[1], s, false);
      if (kind === 'pad') return this.inst('pad', e[1], t, dur * 0.92, VOL.pad * vel * mix[1], s, false);
      if (kind === 'bass') return this.bassNote(song.bass, e[1], t, dur * 0.85, VOL.bass * vel * mix[2], s.synth);
      if (kind === 'k' && (song.style === 'house' || song.style === 'trance')) {
        s.synth.gain.setValueAtTime(1, t);
        s.synth.gain.linearRampToValueAtTime(0.24, t + 0.004);
        s.synth.gain.linearRampToValueAtTime(1, t + song.stepDur * 2.8);
      }
      return this.drum(kind, t, vel * mix[3], s.out, song.style);
    },

    osc(type, freq, t) {
      const oscillator = this.ctx.createOscillator();
      if (this.waves[type]) oscillator.setPeriodicWave(this.waves[type]);
      else oscillator.type = type === 'bright' ? 'sine' : type;
      oscillator.frequency.setValueAtTime(freq, t);
      return oscillator;
    },
    env(g, t, attack, peak, dur, release) {
      const p = g.gain, end = t + Math.max(dur, attack + 0.01);
      p.setValueAtTime(0, t);
      p.linearRampToValueAtTime(peak, t + attack);
      p.setTargetAtTime(peak * 0.7, t + attack, 0.08);
      p.setTargetAtTime(0, end, release / 4);
      return end + release;
    },
    cleanup(source, nodes) {
      source.onended = () => { for (const node of nodes) node.disconnect(); };
    },

    inst(type, n, t, dur, vol, s, lead) {
      const ctx = this.ctx, f = NOTE(n), gain = ctx.createGain();
      const pad = type === 'pad', keys = type === 'keys', bright = type === 'brightkeys', saw = type === 'supersaw';
      gain.connect(s.synth);
      if (lead) gain.connect(s.echo);
      const lp = ctx.createBiquadFilter(), mix = ctx.createGain();
      lp.type = 'lowpass'; lp.Q.value = saw ? 0.7 : 1;
      const colour = s.song.production?.colour;
      const tint = { glow: 0.9, glass: 1.12, bell: 1.2, air: 0.8, pulse: 1 }[colour] || 1;
      const cutoff = (pad ? 1100 : bright ? 3200 : keys ? 2400 : saw ? 2200 : 2000) * tint;
      lp.frequency.setValueAtTime(cutoff, t);
      lp.frequency.exponentialRampToValueAtTime(pad ? 750 : bright ? 1200 : 650, t + Math.max(0.12, dur));
      mix.gain.value = saw ? 0.3 : bright ? 0.55 : 0.45;
      mix.connect(lp); lp.connect(gain);
      const oscillators = saw
        ? [-9, 0, 9].map((detune) => { const o = this.osc('sawtooth', f, t); o.detune.value = detune; return o; })
        : bright ? [this.osc('bright', f, t)]
          : [this.osc(keys || pad ? 'sine' : 'sawtooth', f, t), this.osc('triangle', f * (keys ? 2 : 1), t)];
      if (pad) oscillators[1].detune.value = 5;
      const end = this.env(gain, t, pad ? 0.16 : 0.008, vol, dur, pad ? 0.3 : bright ? 0.09 : 0.16);
      oscillators.forEach((o) => { o.connect(mix); o.start(t); o.stop(end); });
      this.cleanup(oscillators[0], oscillators.concat([mix, lp, gain]));
    },

    bassNote(type, n, t, dur, vol, out) {
      const ctx = this.ctx, gain = ctx.createGain(), oscillator = this.osc('triangle', NOTE(n), t);
      const nodes = [oscillator, gain];
      if (type === 'club') {
        const sub = this.osc('sine', NOTE(n), t), lp = ctx.createBiquadFilter(), mix = ctx.createGain();
        oscillator.type = 'sawtooth'; lp.type = 'lowpass'; lp.Q.value = 0.7;
        lp.frequency.setValueAtTime(650, t); lp.frequency.exponentialRampToValueAtTime(140, t + Math.max(0.06, dur));
        mix.gain.value = 0.25; oscillator.connect(mix); mix.connect(lp); sub.connect(lp); lp.connect(gain);
        nodes.push(sub, lp, mix); vol *= 0.65;
        sub.start(t); sub.stop(t + Math.max(dur, 0.015) + 0.03);
      } else {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 480;
        oscillator.connect(lp); lp.connect(gain); nodes.push(lp);
        vol *= 0.8;
      }
      gain.connect(out);
      const end = this.env(gain, t, 0.005, vol, dur, 0.03);
      oscillator.start(t); oscillator.stop(end);
      this.cleanup(oscillator, nodes);
    },

    drum(kind, t, vel, out, style) {
      const ctx = this.ctx, gain = ctx.createGain(), club = style === 'house' || style === 'trance';
      gain.connect(out);
      if (kind === 'k') {
        const oscillator = this.osc('sine', club ? 135 : 105, t), len = club ? 0.28 : 0.16;
        oscillator.frequency.exponentialRampToValueAtTime(48, t + 0.09);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(VOL.k * vel * (club ? 1 : 0.62), t + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, t + len);
        gain.gain.linearRampToValueAtTime(0, t + len + 0.015);
        oscillator.connect(gain); oscillator.start(t); oscillator.stop(t + len + 0.02);
        this.cleanup(oscillator, [oscillator, gain]);
        return;
      }
      const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter();
      source.buffer = this.noiseBuf; source.connect(filter); filter.connect(gain);
      const len = kind === 's' ? club ? 0.17 : 0.11 : kind === 'o' ? 0.18 : 0.035;
      filter.type = kind === 's' ? 'bandpass' : 'highpass';
      filter.frequency.value = kind === 's' ? 1500 : club ? 7000 : 5000;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0, t);
      if (kind === 's') {
        for (let i = 0; i < (club ? 3 : 1); i++) {
          const hit = t + i * 0.012;
          gain.gain.linearRampToValueAtTime(VOL.s * vel, hit + 0.002);
          gain.gain.exponentialRampToValueAtTime(0.02, hit + 0.01);
        }
      } else gain.gain.linearRampToValueAtTime(VOL[kind] * vel, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, t + len);
      gain.gain.linearRampToValueAtTime(0, t + len + 0.015);
      source.start(t, Math.random() * 0.5, len + 0.02);
      this.cleanup(source, [source, filter, gain]);
    }
  };
})();
