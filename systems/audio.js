/* Web Audio playback, scheduling and device-local music preferences. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const MUSIC_KEY = 'azureheroes2027_music';
  const MUSIC_STYLES = AH.Music.styles;
  const SONGS = AH.Music.SONGS, REGION_SONG = AH.Music.REGION_SONG;
  const LOOKAHEAD = 0.15, TICK_MS = 25, MUSIC_VOL = 0.28;

  const A = (AH.Audio = {
    ctx: null,
    master: null,
    sfx: null,
    musicBus: null,
    muted: false,
    style: 'trance',
    musicTimer: null,
    musicKind: null,
    musicRegion: null,
    seq: null,
    SONGS: SONGS,
    REGION_SONG: REGION_SONG,
    STYLES: MUSIC_STYLES,

    loadStyle() {
      let stored;
      try { stored = localStorage.getItem(MUSIC_KEY); }
      catch (e) {
        console.warn('Music preference is unavailable; using trance for this session.');
        this.style = 'trance';
        return this.style;
      }
      if (stored !== null && stored !== 'dance' && !MUSIC_STYLES.includes(stored)) {
        console.warn('Removed or invalid music preference; using trance.');
      }
      this.style = MUSIC_STYLES.includes(stored) ? stored : 'trance';
      if (stored !== null && stored !== this.style) {
        try { localStorage.setItem(MUSIC_KEY, this.style); }
        catch (e) { console.warn('Migrated music preference could not be saved; using trance for this session.'); }
      }
      return this.style;
    },

    setStyle(style) {
      if (!MUSIC_STYLES.includes(style)) throw new Error('Unsupported music style');
      if (this.style === style) return this.style;
      this.style = style;
      try { localStorage.setItem(MUSIC_KEY, style); }
      catch (e) { console.warn('Music preference could not be saved; selection is for this session only.'); }
      if (this.musicKind) this.music(this.musicKind, this.musicRegion);
      return this.style;
    },

    nextStyle() {
      return this.setStyle(MUSIC_STYLES[(MUSIC_STYLES.indexOf(this.style) + 1) % MUSIC_STYLES.length]);
    },

    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = (this.ctx = new AC());
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(ctx.destination);
      this.sfx = ctx.createGain();
      this.sfx.gain.value = 1;
      this.sfx.connect(this.master);
      this.buildMusicBus();
      if (this.musicKind) this.music(this.musicKind, this.musicRegion);
    },

    // music bus -> compressor -> master, with a filtered feedback echo returning into the bus
    buildMusicBus() {
      const ctx = this.ctx;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 10;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.18;
      comp.connect(this.master);
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = MUSIC_VOL;
      this.musicBus.connect(comp);
      this.delay = ctx.createDelay(1);
      this.delay.delayTime.value = 0.3;
      const fb = ctx.createGain(), tone = ctx.createBiquadFilter(), wet = ctx.createGain();
      fb.gain.value = 0.32;
      tone.type = 'lowpass';
      tone.frequency.value = 2400;
      wet.gain.value = 0.6;
      this.delay.connect(tone);
      tone.connect(fb);
      fb.connect(this.delay);
      tone.connect(wet);
      wet.connect(this.musicBus);
      this.buildVoices();
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

    // Regional hooks keep their identity through streets, rooms and fights.
    songFor(kind, region) {
      if (!kind) return null;
      const context = kind === 'boss' ? 'boss'
        : kind === 'pipe' || kind === 'metro' ? 'pipe'
          : kind === 'title' || kind === 'bonus' ? kind : 'main';
      const regional = context === 'main' || context === 'pipe' || context === 'boss';
      return (regional && AH.Music.REGION_STYLES[region]?.[this.style]?.[context]) || this.style + '_' + context;
    },

    // music(kind, region): start or keep the song. music(null) stops. Same song = no restart.
    music(kind, region) {
      const key = this.songFor(kind, region);
      this.musicKind = kind || null;
      this.musicRegion = kind ? region || null : null;
      if (!key) { this.stopSong(); return; }
      if (this.seq && this.seq.key === key) return;
      this.stopSong();
      if (this.ctx) this.startSong(key);
    },

    startSong(key) {
      const ctx = this.ctx, song = SONGS[key], t = ctx.currentTime;
      const out = ctx.createGain(), echo = ctx.createGain(), synth = ctx.createGain();
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(1, t + 0.05);
      out.connect(this.musicBus);
      echo.gain.value = song.echo;
      echo.connect(this.delay);
      this.delay.delayTime.setValueAtTime(Math.min(0.9, song.stepDur * song.echoSteps), t);
      synth.gain.value = 1;
      synth.connect(out);
      this.seq = { key: key, song: song, out: out, echo: echo, synth: synth, bar: 0, step: 0, next: t + 0.06 };
      this.musicTimer = setInterval(() => this.tick(), TICK_MS);
      this.tick();
    },

    // fade out quickly so already scheduled notes cannot hang, then release the nodes
    stopSong() {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
      const s = this.seq;
      this.seq = null;
      if (!s || !this.ctx) return;
      const t = this.ctx.currentTime;
      [s.out.gain, s.echo.gain].forEach((p) => {
        p.cancelScheduledValues(t);
        p.setValueAtTime(p.value, t);
        p.linearRampToValueAtTime(0, t + 0.08);
      });
      setTimeout(() => { s.out.disconnect(); s.echo.disconnect(); s.synth.disconnect(); }, 600);
    },

    // lookahead scheduler: queue every step that starts within LOOKAHEAD seconds
    tick() {
      const s = this.seq, ctx = this.ctx;
      if (!s || !ctx) return;
      const now = ctx.currentTime, song = s.song;
      if (s.next < now - 0.2) s.next = now + 0.05; // throttled tab: skip ahead instead of bursting
      while (s.next < now + LOOKAHEAD) {
        if (!this.muted) {
          const offbeat = Math.floor(s.step / song.swingEvery) % 2;
          const t = s.next + (offbeat ? song.stepDur * song.swingEvery * song.swing : 0);
          const ev = song.bars[s.bar].ev[s.step];
          for (let i = 0; i < ev.length; i++) this.voice(s, ev[i], t);
        }
        s.next += song.stepDur;
        if (++s.step >= song.steps) { s.step = 0; s.bar = (s.bar + 1) % song.bars.length; }
      }
    }
  });
  Object.assign(A, AH.SoundEffects, AH.AudioSynth);
})();
