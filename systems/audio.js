/* Web Audio only: every sound is synthesised, no audio files. Also owns the localStorage save. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const KEY = 'azureheroes2027';
  const MUSIC_KEY = 'azureheroes2027_music';
  const MUSIC_STYLES = Object.freeze(['dance', 'jazz', 'country', 'blues', 'rock']);
  AH.Save = {
    data: { best: 0, unlocked: 1, bests: {}, muted: false, hero: 'm', resume: null, updated: 0 },
    load() {
      try {
        const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
        this.data = Object.assign({ best: 0, unlocked: 1, bests: {}, muted: false, hero: 'm', resume: null, updated: 0 }, raw);
      } catch (e) { /* storage unavailable (private mode) - keep defaults in memory */ }
      return this.data;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
      if (AH.Online && !(AH.Gold && AH.Gold.run())) AH.Online.pushProgress();
    },
    // where CONTINUE picks the adventure back up: level id plus the score and lives carried into it
    setResume(id, score, lives) {
      this.data.resume = id ? { id: id, score: score || 0, lives: lives || 3 } : null;
      this.data.updated = Date.now();
      this.save();
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

  /* ================================================================ MUSIC DATA
   * Songs are written per bar: one chord symbol per bar and one melody string per bar.
   * Melody tokens: note name (C5, F#4, Bb5), '-' hold, '.' rest. A bar may use any token
   * count that divides the song's step count (8 tokens on a 16 step bar = eighth notes).
   * Bass, chord voice and drums are generated from the chord and the song's patterns:
   *   bass  R root, 3 third, 5 fifth, 6 sixth, 8 octave, w approach to next bar's root
   *   arp   digits = chord tone index (wraps up an octave), c = full chord stab
   *   drums x hit, X accent, '.' nothing. The last bar of the form plays the fill. */
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const QUALITY = {
    '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11],
    6: [0, 4, 7, 9], m6: [0, 3, 7, 9], dim: [0, 3, 6], sus4: [0, 5, 7]
  };
  function noteNum(tok) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(tok);
    if (!m) throw new Error('bad note ' + tok);
    return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  function chordOf(sym) {
    const m = /^([A-G][#b]?)(.*)$/.exec(sym);
    if (!m || !QUALITY[m[2]]) throw new Error('bad chord ' + sym);
    const pc = (noteNum(m[1] + '4') - 60 + 12) % 12;
    return { sym: sym, pc: pc, iv: QUALITY[m[2]] };
  }
  function parseBar(str, steps) {
    const toks = str.trim().split(/\s+/);
    if (steps % toks.length) throw new Error('bar "' + str + '" does not fit ' + steps + ' steps');
    const f = steps / toks.length, out = [];
    toks.forEach((t) => {
      for (let i = 0; i < f; i++) {
        if (t === '.') out.push(0);
        else if (t === '-' || i > 0) out.push(-1);
        else out.push(noteNum(t));
      }
    });
    return out;
  }

  const DRUMS = {
    house: {
      k: 'X...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..x...x...x...x.',
      fill: { k: 'X...x...x...x...', s: '....x.......x.xx', h: 'x.x.x.x.x.x.xxx.', o: '..x...x...x.....' }
    },
    trance: {
      k: 'X...x...x...x...', s: '....x.......x...', h: 'x.xx..xxx.xx..xx', o: '..x...x...x...x.',
      fill: { k: 'X...x...x...x...', s: '....x...x.x.xxXX', h: 'x.x.x.x.x.x.xxxx', o: '..x...x.........' }
    },
    jazz: {
      k: 'x.......x.......', s: '....x.......x...', h: 'x.x.x.xxX.x.x.xx',
      fill: { k: 'x.......x.......', s: '....x.......x.x.', h: 'x.x.x.xxX.x.xxx.' }
    },
    country: {
      k: 'X.......x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.',
      fill: { k: 'X.......x.......', s: '....x.......x.xx', h: 'x.x.x.x.x.x.x.x.' }
    },
    blues: {
      k: 'X.......x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.',
      fill: { k: 'X.......x...x...', s: '....x.......x.x.', h: 'x.x.x.x.x.x.xxx.' }
    },
    rock: {
      k: 'X.....x.X.......', s: '....x.......X...', h: 'X.x.x.x.X.x.x.x.',
      fill: { k: 'X.....x.X.....x.', s: '....x.......x.xx', h: 'X.x.x.x.X.x.xxxx' }
    }
  };
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function degreeMelody(chord, pattern) {
    const ch = chordOf(chord);
    return pattern.split(' ').map((token) => {
      if (token === '.' || token === '-') return token;
      const m = /^([b#]?)(\d)$/.exec(token);
      if (!m) throw new Error('bad melody degree ' + token);
      const i = Number(m[2]), root = 60 + ch.pc - (ch.pc > 5 ? 12 : 0);
      const n = root + ch.iv[i % ch.iv.length] + 12 * Math.floor(i / ch.iv.length)
        + (m[1] === 'b' ? -1 : m[1] === '#' ? 1 : 0);
      return NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 1);
    }).join(' ');
  }
  function danceSong(name, bpm, style, progression, hook, lift) {
    const chords = progression.split(' ');
    const melody = (pattern, bar) => degreeMelody(chords[bar], pattern);
    return {
      name, bpm, style, beats: 4, steps: 16, lead: style === 'house' ? 'keys' : 'supersaw',
      arp: 'trancepluck', bass: 'club', drums: style,
      bassPat: '..R-..R-..8-..5-', arpPat: style === 'house' ? '..c...c...c...c.' : '0.2.1.2.0.2.1.3.',
      echo: 0.18, echoSteps: 3,
      sections: {
        A: { chords: progression, mel: chords.map((c, i) => melody(hook, i)) },
        B: { chords: progression, mel: chords.map((c, i) => melody('0 - - . 2 - - .', i)) },
        C: { chords: progression, mel: chords.map((c, i) => melody(i % 2 ? lift : hook, i)) }
      },
      form: ['A', 'B', 'A', 'C']
    };
  }
  const BAND_STYLES = {
    jazz: {
      lead: 'jazzkeys', arp: 'jazzkeys', bass: 'upright',
      bassPat: 'R---3---5---w---', arpPat: '..c.....c...c...',
      swing: 0.32, swingEvery: 2,
      motifs: ['. 0 1 b2 2 - 3 .', '2 . 1 0 b1 1 2 -', '3 . 2 1 0 - 1 .', '1 . b2 2 3 . 2 -',
        '2 - 3 . 2 1 0 .', '. 1 2 3 2 - b1 1', '0 1 b2 2 . 3 2 .', '3 - 2 . 1 0 . -']
    },
    country: {
      lead: 'twang', arp: 'twang', bass: 'upright',
      bassPat: 'R-------5-------', arpPat: '....c.......c...',
      swing: 0.13, swingEvery: 2,
      motifs: ['0 . 1 2 3 - 2 .', '1 2 1 0 . 1 2 -', '2 . 3 2 1 - 0 .', '1 0 1 2 . 0 - .',
        '3 . 2 1 0 1 2 .', '1 - 2 3 2 . 1 .', '0 1 2 . 3 - 2 1', '2 1 0 . 1 - 0 -']
    },
    blues: {
      lead: 'bluesguitar', arp: 'organ', bass: 'upright',
      bassPat: 'R---5---6---5---', arpPat: '....c.......c...',
      swing: 0.32, swingEvery: 2,
      motifs: ['0 . b1 1 b2 2 - .', '2 b2 1 b1 0 - . .', '. 0 b1 1 2 . b2 1', '0 - . 1 b1 0 - .',
        '2 . b2 1 b1 . 0 -', '. 0 b1 1 b2 2 3 .', '3 2 b2 1 0 . 1 .', 'b1 1 0 - . 2 1 -']
    },
    rock: {
      lead: 'rockguitar', arp: 'rockguitar', bass: 'electric',
      bassPat: 'R-R-5-R-R-R-5-8-', arpPat: 'c...c.c...c.c...',
      swing: 0, swingEvery: 2, powerChord: true,
      motifs: ['0 0 . 2 0 1 2 -', '2 . 3 2 1 0 1 .', '0 0 2 . 3 2 1 -', '2 1 0 . 1 2 0 -',
        '3 2 . 2 1 0 2 .', '0 1 2 3 2 . 1 -', '2 . 2 3 4 3 2 .', '1 2 0 . 2 1 0 -']
    }
  };
  function bandSong(name, bpm, style, progression, variant) {
    const cfg = BAND_STYLES[style], chords = progression.split(' ');
    const section = (offset) => ({
      chords: progression,
      mel: chords.map((chord, i) => degreeMelody(chord, cfg.motifs[(i + offset + variant) % cfg.motifs.length]))
    });
    return {
      name, bpm, style, beats: 4, steps: 16, lead: cfg.lead, arp: cfg.arp,
      bass: cfg.bass, drums: style, bassPat: cfg.bassPat, arpPat: cfg.arpPat,
      swing: cfg.swing, swingEvery: cfg.swingEvery, powerChord: cfg.powerChord,
      fillEvery: chords.length,
      echo: style === 'blues' ? 0.12 : 0.08, echoSteps: 3,
      sections: { A: section(0), B: section(4) }, form: ['A', 'B']
    };
  }
  const RAW = {
    title: danceSong('HORIZON CLUB', 126, 'house', 'Am7 Am7 Fmaj7 Fmaj7 Cmaj7 Cmaj7 G G', '0 . 2 - . 1 . 2', '2 - 3 . 2 . 1 -'),
    main: danceSong('CLOUD NINE', 134, 'trance', 'Am Am F F C C G G', '0 . 2 3 . 2 1 -', '3 2 1 . 2 - 0 .'),
    boss: danceSong('THREAT PULSE', 138, 'trance', 'Dm Dm Bb Bb Gm Gm C A', '0 0 . 2 0 . 1 2', '3 . 2 1 0 1 2 -'),
    pipe: danceSong('DEPLOY AFTER DARK', 130, 'house', 'Em7 Em7 Cmaj7 Cmaj7 Am7 Am7 Bm7 Bm7', '. 0 . 2 - . 1 .', '2 . 3 - 1 . 0 .'),
    metro: danceSong('UNDERGROUND FREQUENCY', 132, 'trance', 'Dm Dm Bb Bb F F C C', '0 . 1 2 . 3 2 .', '3 - 2 . 1 2 0 -'),
    bonus: danceSong('GOLDEN HOUR', 128, 'house', 'Fmaj7 Fmaj7 Am7 Am7 Dm7 Dm7 G G', '2 . 0 - 1 . 2 .', '3 . 2 . 1 - 0 .'),
    paris: danceSong('SEINE AFTER HOURS', 126, 'house', 'Am7 Am7 Dm7 Dm7 Fmaj7 Fmaj7 Em7 Em7', '. 2 . 1 0 - . 2', '3 . 2 - . 1 2 .'),
    amsterdam: danceSong('CANAL LIGHTS', 136, 'trance', 'F#m F#m D D A A E E', '0 2 . 3 2 . 1 .', '3 . 4 2 . 1 2 -'),
    london: danceSong('NIGHT LINE', 128, 'house', 'Bm7 Bm7 Gmaj7 Gmaj7 Dmaj7 Dmaj7 A A', '0 . . 2 1 . 0 -', '2 . 3 . 1 - 2 .'),
    japan: danceSong('NEON BLOSSOM', 136, 'trance', 'Em Em C C G G D D', '0 . 2 . 3 2 . 1', '3 2 . 1 2 . 0 -'),
    jazz_title: bandSong('BLUE CLOUD LOUNGE', 108, 'jazz', 'Dm7 G7 Cmaj7 Am7 Fmaj7 Bm7 E7 Am7', 0),
    jazz_main: bandSong('SKYLINE SWING', 132, 'jazz', 'Am7 D7 Gmaj7 Em7 Am7 D7 Gmaj7 E7', 1),
    jazz_pipe: bandSong('MIDNIGHT TERMINAL', 124, 'jazz', 'Fm7 Bb7 Ebmaj7 Cm7 Fm7 Bb7 Gm7 C7', 2),
    jazz_boss: bandSong('HOTFIX HORNS', 156, 'jazz', 'Dm7 G7 Cmaj7 A7 Dm7 G7 Em7 A7', 3),
    country_title: bandSong('CLOUD TRAIL', 104, 'country', 'G C G D G C D G', 0),
    country_main: bandSong('OPEN ROAD', 140, 'country', 'D G D A D G A D', 1),
    country_pipe: bandSong('DEPOT PICKERS', 130, 'country', 'C F C G C F G C', 2),
    country_boss: bandSong('HIGH NOON DEPLOY', 160, 'country', 'A D A E A D E A', 3),
    blues_title: bandSong('EVENING CLOUD BLUES', 96, 'blues', 'A7 A7 A7 A7 D7 D7 A7 A7 E7 D7 A7 E7', 0),
    blues_main: bandSong('THE DEPLOYMENT BLUES', 120, 'blues', 'E7 E7 E7 E7 A7 A7 E7 E7 B7 A7 E7 B7', 1),
    blues_pipe: bandSong('DOWN IN THE STACK', 110, 'blues', 'G7 G7 G7 G7 C7 C7 G7 G7 D7 C7 G7 D7', 2),
    blues_boss: bandSong('THREAT BLUES', 146, 'blues', 'D7 D7 D7 D7 G7 G7 D7 D7 A7 G7 D7 A7', 3),
    rock_title: bandSong('HEROES ON AIR', 128, 'rock', 'E A E B E A B E', 0),
    rock_main: bandSong('AZURE HIGHWAY', 148, 'rock', 'E G A E D A B E', 1),
    rock_pipe: bandSong('CONTAINER CRUNCH', 142, 'rock', 'A C D A G D E A', 2),
    rock_boss: bandSong('FIREWALL BREAKER', 170, 'rock', 'D F G D C G A D', 3)
  };

  const REGION_SONG = { francecentral: 'paris', westeurope: 'amsterdam', uksouth: 'london', japaneast: 'japan' };

  // Expands RAW into per-bar, per-step event lists so the scheduler never parses at play time.
  function buildSong(key, raw) {
    const steps = raw.steps, bars = [];
    raw.form.forEach((name) => {
      const sec = raw.sections[name];
      const chords = sec.chords.trim().split(/\s+/);
      if (chords.length !== sec.mel.length) throw new Error(key + ' section ' + name + ': chords and melody bars differ');
      chords.forEach((c, i) => bars.push({ section: name, chord: chordOf(c), mel: parseBar(sec.mel[i], steps) }));
    });
    const total = bars.length * steps, flat = [];
    bars.forEach((b) => flat.push.apply(flat, b.mel));
    const drums = DRUMS[raw.drums];
    bars.forEach((b, bi) => {
      const ev = [];
      for (let s = 0; s < steps; s++) ev.push([]);
      const ch = b.chord, next = bars[(bi + 1) % bars.length].chord;
      let root = 36 + ch.pc;
      if (root > 44) root -= 12;
      let mid = 60 + ch.pc;
      if (mid > 66) mid -= 12;
      b.tones = ch.iv.map((iv) => mid + iv);
      const dance = raw.style === 'house' || raw.style === 'trance';
      const breakdown = dance && b.section === 'B' && bi % 8 < 2;
      const intro = dance && bi < 4;
      // Start with the groove; bring in the hook, then a short breakdown and drop.
      for (let s = 0; s < steps; s++) {
        const n = b.mel[s];
        if (n <= 0 || intro) continue;
        let len = 1;
        while (len < total && flat[(bi * steps + s + len) % total] === -1) len++;
        ev[s].push(['lead', n, len, 1]);
      }
      const span = (pat, s) => { let l = 1; while (s + l < pat.length && pat[s + l] === '-') l++; return l; };
      // bass
      const bp = Array.isArray(raw.bassPat) ? raw.bassPat[bi % raw.bassPat.length] : raw.bassPat;
      for (let s = 0; s < steps; s++) {
        if (breakdown) continue;
        const c = bp[s];
        let n = 0;
        if (c === 'R') n = root;
        else if (c === '3') n = root + ch.iv[1];
        else if (c === '5') n = root + ch.iv[2];
        else if (c === '6') n = root + 9;
        else if (c === '8') n = root + 12;
        else if (c === 'w') { let r = 36 + next.pc; if (r > 44) r -= 12; n = r - 1; }
        if (n) ev[s].push(['bass', n, span(bp, s), s === 0 ? 1 : 0.85]);
      }
      // chord voice
      const ap = raw.arpPat;
      for (let s = 0; s < steps; s++) {
        if (breakdown && s % 4 !== 2) continue;
        const c = ap[s];
        if (c === 'c') {
          const tones = raw.powerChord ? [b.tones[0], b.tones[2]] : b.tones.slice(0, 4);
          tones.forEach((n) => ev[s].push(['arp', n, span(ap, s), 0.55]));
        }
        else if (c >= '0' && c <= '9') {
          const i = +c;
          ev[s].push(['arp', b.tones[i % b.tones.length] + 12 * Math.floor(i / b.tones.length), span(ap, s), 1]);
        }
      }
      if (dance) b.tones.forEach((n) => ev[0].push(['pad', n - 12, steps, 0.6]));
      const fillEvery = raw.fillEvery || 8;
      const d = bi % fillEvery === fillEvery - 1 ? drums.fill : drums;
      ['k', 's', 'h', 'o'].forEach((v) => {
        const p = d[v];
        if (!p) return;
        for (let s = 0; s < steps; s++) {
          if (breakdown && (v !== 'h' || s % 4)) continue;
          if (p[s] === 'x' || p[s] === 'X') ev[s].push([v, 0, 1, p[s] === 'X' ? 1 : 0.7]);
        }
      });
      b.ev = ev;
    });
    return {
      key: key, name: raw.name, bpm: raw.bpm, beats: raw.beats, steps: steps, swing: raw.swing || 0,
      swingEvery: raw.swingEvery || 1, style: raw.style, lead: raw.lead, arp: raw.arp, bass: raw.bass,
      drums: raw.drums, echo: raw.echo === undefined ? 0.2 : raw.echo, echoSteps: raw.echoSteps || 3,
      sections: raw.form.slice(), bars: bars,
      stepDur: (60 / raw.bpm) * raw.beats / steps
    };
  }

  const SONGS = {};
  Object.keys(RAW).forEach((k) => { SONGS[k] = buildSong(k, RAW[k]); });

  const LOOKAHEAD = 0.15, TICK_MS = 25, MUSIC_VOL = 0.28;
  const VOL = { lead: 0.19, arp: 0.095, pad: 0.055, bass: 0.42, k: 0.85, s: 0.28, h: 0.055, o: 0.075 };

  const A = (AH.Audio = {
    ctx: null,
    master: null,
    sfx: null,
    musicBus: null,
    muted: false,
    style: 'dance',
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
        console.warn('Music preference is unavailable; using dance for this session.');
        this.style = 'dance';
        return this.style;
      }
      if (stored !== null && !MUSIC_STYLES.includes(stored)) {
        console.warn('Invalid music preference; using dance.');
      }
      this.style = MUSIC_STYLES.includes(stored) ? stored : 'dance';
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
      // one cached second of white noise shared by every drum hit
      const len = ctx.sampleRate;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.waves = {};
      if (ctx.createPeriodicWave) {
        const pulse = (duty) => {
          const n = 32, re = new Float32Array(n), im = new Float32Array(n);
          for (let k = 1; k < n; k++) re[k] = (2 * Math.sin(k * Math.PI * duty)) / (k * Math.PI);
          return ctx.createPeriodicWave(re, im);
        };
        const harm = (h) => {
          const re = new Float32Array(h.length), im = new Float32Array(h);
          return ctx.createPeriodicWave(re, im);
        };
        this.waves.pulse12 = pulse(0.125);
        this.waves.pulse25 = pulse(0.25);
        this.waves.organ = harm([0, 1, 0.7, 0.35, 0.3, 0, 0.18, 0, 0.12]);
      }
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
      g.connect(this.sfx || this.master);
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
      g.connect(this.sfx || this.master);
      s.start(t0);
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
    },

    /* ================================================================ MUSIC ENGINE */
    // Dance keeps regional tracks; the other styles follow the same scene contexts.
    songFor(kind, region) {
      if (!kind) return null;
      if (this.style !== 'dance') {
        const context = kind === 'boss' ? 'boss'
          : kind === 'pipe' || kind === 'metro' ? 'pipe'
            : kind === 'title' || kind === 'bonus' ? 'title' : 'main';
        return this.style + '_' + context;
      }
      if (kind === 'main') return REGION_SONG[region] || 'main';
      return SONGS[kind] ? kind : 'main';
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
    },

    voice(s, e, t) {
      const song = s.song, kind = e[0], dur = e[2] * song.stepDur, vel = e[3];
      if (kind === 'lead') return this.inst(song.lead, e[1], t, dur * 0.92, VOL.lead * vel, s, true);
      if (kind === 'arp') return this.inst(song.arp, e[1], t, Math.min(dur, song.stepDur * 1.6) * 0.8, VOL.arp * vel, s, false);
      if (kind === 'pad') return this.inst('pad', e[1], t, dur * 0.92, VOL.pad * vel, s, false);
      if (kind === 'bass') return this.bassNote(song.bass, e[1], t, dur * 0.85, VOL.bass * vel, s.synth);
      if (kind === 'k' && (song.style === 'house' || song.style === 'trance')) {
        s.synth.gain.setValueAtTime(1, t);
        s.synth.gain.linearRampToValueAtTime(0.24, t + 0.004);
        s.synth.gain.linearRampToValueAtTime(1, t + song.stepDur * 2.8);
      }
      return this.drum(kind, t, vel, s.out, song.style);
    },

    osc(type, freq, t) {
      const o = this.ctx.createOscillator();
      if (this.waves[type]) o.setPeriodicWave(this.waves[type]);
      else o.type = type.indexOf('pulse') === 0 || type === 'organ' ? 'square' : type;
      o.frequency.setValueAtTime(freq, t);
      return o;
    },
    // attack / sustain / release envelope; returns the time the note is silent
    env(g, t, a, peak, dur, rel) {
      const p = g.gain, end = t + Math.max(dur, a + 0.01);
      p.setValueAtTime(0, t);
      p.linearRampToValueAtTime(peak, t + a);
      p.setTargetAtTime(peak * 0.7, t + a, 0.08);
      p.setTargetAtTime(0, end, rel / 4);
      return end + rel;
    },
    cleanup(src, nodes) {
      src.onended = () => { for (let i = 0; i < nodes.length; i++) nodes[i].disconnect(); };
    },

    inst(type, n, t, dur, vol, s, lead) {
      const ctx = this.ctx, f = NOTE(n), g = ctx.createGain();
      const reed = type === 'accordion' || type === 'organ';
      g.connect(s.synth);
      if (lead) g.connect(s.echo);
      if (type === 'jazzkeys' || type === 'twang' || type === 'bluesguitar' || type === 'rockguitar') {
        const jazz = type === 'jazzkeys', twang = type === 'twang', rock = type === 'rockguitar';
        const lp = ctx.createBiquadFilter(), mix = ctx.createGain();
        lp.type = 'lowpass'; lp.Q.value = 0.8;
        lp.frequency.setValueAtTime(jazz ? 1800 : twang ? 3200 : 2400, t);
        lp.frequency.exponentialRampToValueAtTime(jazz ? 750 : twang ? 850 : 1100, t + Math.max(0.12, dur));
        mix.gain.value = rock ? 0.32 : 0.45;
        mix.connect(lp); lp.connect(g);
        const oscs = jazz
          ? [this.osc('sine', f, t), this.osc('triangle', f * 2, t)]
          : [this.osc(twang ? 'triangle' : 'sawtooth', f, t), this.osc(rock ? 'sawtooth' : 'pulse25', f, t)];
        if (rock) { oscs[0].detune.value = -6; oscs[1].detune.value = 6; }
        else if (!jazz) { oscs[0].detune.setValueAtTime(-30, t); oscs[0].detune.linearRampToValueAtTime(0, t + 0.06); }
        let end;
        if (jazz || twang) {
          end = t + Math.max(dur, 0.16) + 0.12;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(vol, t + 0.004);
          g.gain.setTargetAtTime(vol * 0.2, t + 0.004, twang ? 0.09 : 0.14);
          g.gain.setTargetAtTime(0, end - 0.12, 0.025);
        } else end = this.env(g, t, 0.008, vol, dur, 0.12);
        oscs.forEach((o) => { o.connect(mix); o.start(t); o.stop(end); });
        this.cleanup(oscs[0], oscs.concat([mix, lp, g]));
        return;
      }
      if (type === 'supersaw' || type === 'keys' || type === 'trancepluck' || type === 'pad') {
        const pad = type === 'pad', keys = type === 'keys', saw = type === 'supersaw';
        const lp = ctx.createBiquadFilter(), mix = ctx.createGain();
        lp.type = 'lowpass'; lp.Q.value = saw ? 0.7 : 1;
        const cutoff = pad ? 1100 : keys ? 2400 : saw ? 2200 : 2000;
        lp.frequency.setValueAtTime(cutoff, t);
        lp.frequency.exponentialRampToValueAtTime(pad ? 750 : 650, t + Math.max(0.12, dur));
        mix.gain.value = saw ? 0.3 : 0.45;
        mix.connect(lp); lp.connect(g);
        const oscs = saw
          ? [-9, 0, 9].map((detune) => { const o = this.osc('sawtooth', f, t); o.detune.value = detune; return o; })
          : [this.osc(keys || pad ? 'sine' : 'sawtooth', f, t), this.osc('triangle', f * (keys ? 2 : 1), t)];
        if (pad) oscs[1].detune.value = 5;
        const end = this.env(g, t, pad ? 0.16 : 0.008, vol, dur, pad ? 0.3 : 0.16);
        oscs.forEach((o) => { o.connect(mix); o.start(t); o.stop(end); });
        this.cleanup(oscs[0], oscs.concat([mix, lp, g]));
        return;
      }
      if (reed) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = type === 'organ' ? 3200 : 2200;
        lp.connect(g);
        const oscs = type === 'organ'
          ? [this.osc('organ', f, t), this.osc('pulse12', f * 2, t)]
          : [this.osc('sawtooth', f, t), this.osc('sawtooth', f, t), this.osc('square', f / 2, t)];
        if (type === 'accordion') { oscs[0].detune.value = -9; oscs[1].detune.value = 9; }
        const mix = ctx.createGain();
        mix.gain.value = type === 'organ' ? 0.6 : 0.4;
        mix.connect(lp);
        const end = this.env(g, t, 0.02, vol, dur, 0.06);
        oscs.forEach((o) => { o.connect(mix); o.start(t); o.stop(end); });
        this.cleanup(oscs[0], oscs.concat([mix, lp, g]));
        return;
      }
      if (type === 'pluck' || type === 'guitar') {
        const o = this.osc(type === 'pluck' ? 'triangle' : 'sawtooth', f, t), o2 = this.osc('pulse25', f, t);
        const lp = ctx.createBiquadFilter(), mix = ctx.createGain();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(type === 'pluck' ? 4200 : 3000, t);
        lp.frequency.exponentialRampToValueAtTime(type === 'pluck' ? 500 : 700, t + 0.3);
        if (type === 'pluck') { o.detune.setValueAtTime(-35, t); o.detune.linearRampToValueAtTime(0, t + 0.05); }
        mix.gain.value = 0.5;
        o.connect(lp); o2.connect(mix); mix.connect(lp); lp.connect(g);
        const ring = Math.max(dur, type === 'pluck' ? 0.7 : 0.15);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol * 1.4, t + 0.004);
        g.gain.setTargetAtTime(0, t + 0.004, ring / 4);
        const end = t + ring + 0.05;
        o.start(t); o2.start(t); o.stop(end); o2.stop(end);
        this.cleanup(o, [o, o2, mix, lp, g]);
        return;
      }
      // pulse lead / arp: chip pulse with delayed vibrato on held lead notes
      const o = this.osc(type, f, t), nodes = [o, g];
      o.connect(g);
      const end = this.env(g, t, lead ? 0.008 : 0.003, vol, dur, lead ? 0.05 : 0.02);
      if (lead && dur > 0.22) {
        const lfo = ctx.createOscillator(), depth = ctx.createGain();
        lfo.frequency.value = 5.8;
        depth.gain.setValueAtTime(0, t);
        depth.gain.linearRampToValueAtTime(22, t + 0.18);
        lfo.connect(depth);
        depth.connect(o.detune);
        lfo.start(t); lfo.stop(end);
        nodes.push(lfo, depth);
      }
      o.start(t);
      o.stop(end);
      this.cleanup(o, nodes);
    },

    bassNote(type, n, t, dur, vol, out) {
      const ctx = this.ctx, g = ctx.createGain(), o = this.osc(type === 'saw' || type === 'electric' ? 'sawtooth' : 'triangle', NOTE(n), t);
      const nodes = [o, g];
      if (type === 'club') {
        const sub = this.osc('sine', NOTE(n), t), lp = ctx.createBiquadFilter(), mix = ctx.createGain();
        o.type = 'sawtooth'; lp.type = 'lowpass'; lp.Q.value = 0.7;
        lp.frequency.setValueAtTime(650, t); lp.frequency.exponentialRampToValueAtTime(140, t + Math.max(0.06, dur));
        mix.gain.value = 0.25; o.connect(mix); mix.connect(lp); sub.connect(lp); lp.connect(g);
        nodes.push(sub, lp, mix); vol *= 0.65;
        sub.start(t); sub.stop(t + Math.max(dur, 0.015) + 0.03);
      } else if (type === 'saw' || type === 'upright' || type === 'electric') {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.Q.value = type === 'saw' ? 6 : 0.8;
        lp.frequency.setValueAtTime(type === 'upright' ? 850 : 1400, t);
        lp.frequency.exponentialRampToValueAtTime(type === 'electric' ? 500 : 260, t + Math.max(0.06, dur));
        o.connect(lp); lp.connect(g);
        nodes.push(lp);
        vol *= type === 'saw' ? 0.55 : 0.8;
      } else o.connect(g);
      g.connect(out);
      const end = this.env(g, t, 0.005, vol, dur, 0.03);
      o.start(t);
      o.stop(end);
      this.cleanup(o, nodes);
    },

    drum(kind, t, vel, out, style) {
      const ctx = this.ctx, g = ctx.createGain();
      const dance = style === 'house' || style === 'trance';
      g.connect(out);
      if (kind === 'k') {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(dance ? 135 : 105, t);
        o.frequency.exponentialRampToValueAtTime(48, t + 0.09);
        const len = dance ? 0.28 : 0.16;
        const level = dance ? 1 : style === 'jazz' ? 0.38 : style === 'country' ? 0.48 : 0.62;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(VOL.k * vel * level, t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.001, t + len);
        o.connect(g); o.start(t); o.stop(t + len + 0.02);
        this.cleanup(o, [o, g]);
        return;
      }
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter();
      src.buffer = this.noiseBuf;
      src.connect(f); f.connect(g);
      let len;
      if (kind === 's') {
        f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.7;
        len = dance ? 0.17 : 0.11;
        for (let i = 0; i < (dance ? 3 : 1); i++) {
          const hit = t + i * 0.012;
          g.gain.setValueAtTime(VOL.s * vel * (style === 'jazz' ? 0.4 : 1), hit);
          g.gain.exponentialRampToValueAtTime(0.02, hit + 0.01);
        }
      } else {
        f.type = 'highpass'; f.frequency.value = dance ? 7000 : 5000;
        len = kind === 'o' ? 0.18 : 0.035;
      }
      if (kind !== 's') g.gain.setValueAtTime(VOL[kind] * vel, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + len);
      src.start(t, Math.random() * 0.5, len + 0.02);
      this.cleanup(src, [src, f, g]);
    }
  });
})();
