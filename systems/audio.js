/* Web Audio only: every sound is synthesised, no audio files. Also owns the localStorage save. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const KEY = 'azureheroes2027';
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
      if (AH.Online) AH.Online.pushProgress();
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
   *   bass  R root, 3 third, 5 fifth, 8 octave, w chromatic approach to next bar's root
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
    pop: {
      k: 'x.....x.x.......', s: '....x.......x...', h: 'X.x.X.x.X.x.X.x.',
      fill: { k: 'x.....x.x.......', s: '....x.......xxxx', h: 'X.x.X.x.X.......' }
    },
    rock: {
      k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.',
      fill: { k: 'x.......x.......', s: '....x...x.xxXxXX', h: 'x.x.x.x.........' }
    },
    drive: {
      k: 'x...x...x...x.x.', s: '....x.......x...', h: 'XxxxXxxxXxxxXxxx',
      fill: { k: 'x...x...x.......', s: '....x...xxxxXXXX', h: 'XxxxXxxx........' }
    },
    techno: {
      k: 'x...x...x...x...', s: '....x.......x...', h: 'xx.xxx.xxx.xxx.x', o: '..x...x...x...x.',
      fill: { k: 'x...x...x...x...', s: '....x...x.x.xxXX', h: 'xxxxxxxxxxxxxxxx', o: '..x...x.........' }
    },
    march: {
      k: 'x.......x.......', s: '....x..x....x.xx', h: 'x.x.x.x.x.x.x.x.',
      fill: { k: 'x.......x.......', s: 'x.xxx.xxx.xxXXXX', h: '................' }
    },
    polka: {
      k: 'x.......x.......', s: '....x.......x...', h: '..x...x...x...x.',
      fill: { k: 'x.......x.......', s: '....x...x.x.x.xX', h: '..x...x.........' }
    },
    taiko: {
      k: 'X.....x...x.....', s: '............x...', h: '..x.......x.....',
      fill: { k: 'X.x.x.x.x.xXxXXX', s: '................', h: '................' }
    },
    brush: {
      k: 'x.......', s: '..x...x.', h: 'X.xxX.xx',
      fill: { k: 'x.......', s: '..x.x.xx', h: 'X.xx....' }
    },
    waltz: {
      k: 'X.....', s: '......', h: '..x.x.',
      fill: { k: 'X.....', s: '....xx', h: '..x...' }
    }
  };

  const RAW = {
    title: {
      name: 'HEROES RISE', bpm: 120, beats: 4, steps: 16, lead: 'pulse25', arp: 'pulse12', bass: 'tri', drums: 'rock',
      bassPat: 'R-.R8-.RR-.R5-.5', arpPat: '0.1.2.1.0.1.2.1.', echo: 0.3,
      sections: {
        A: { chords: 'C G Am F C F G G', mel: [
          'G4 - C5 - E5 - G5 -', 'F5 - E5 D5 - - B4 -', 'C5 - - E5 A5 - G5 -', 'F5 - - - E5 - C5 -',
          'G4 - C5 - E5 - G5 -', 'A5 - - G5 F5 - A5 -', 'G5 - F5 - D5 - B4 -', 'D5 - - - G4 . . .'] },
        B: { chords: 'Am F C G Am F G G', mel: [
          'E5 - - - A5 - C6 -', 'C6 - B5 A5 - - F5 -', 'G5 - - - E5 - G5 -', 'D5 - - - - - . .',
          'E5 - A5 - C6 - E6 -', 'D6 - C6 - A5 - F5 -', 'G5 - A5 - B5 - D6 -', 'D6 - - - B5 - G5 -'] }
      },
      form: ['A', 'B']
    },
    main: {
      name: 'CLOUD RUNNER', bpm: 150, beats: 4, steps: 16, lead: 'pulse25', arp: 'pulse12', bass: 'tri', drums: 'pop',
      bassPat: 'R.R.8.R.R.R.8.5.', arpPat: '0.1.2.3.2.1.0.1.', echo: 0.22,
      sections: {
        A: { chords: 'G D Em C G D C D', mel: [
          'D5 - G5 - B5 - A5 G5', 'A5 - F#5 - D5 - - .', 'E5 - G5 - B5 - G5 -', 'C6 - B5 - A5 - G5 -',
          'D5 - G5 - B5 - D6 -', 'C6 - A5 - F#5 - A5 -', 'G5 - E5 - C5 - E5 -', 'D5 - - - F#5 - A5 -'] },
        B: { chords: 'C D Bm Em C D G G', mel: [
          'E5 . E5 - G5 - E5 -', 'F#5 . F#5 - A5 - F#5 -', 'D5 - F#5 - B5 - A5 -', 'G5 - - - E5 - - .',
          'C5 - E5 - G5 - C6 -', 'D6 - C6 - A5 - F#5 -', 'G5 - - - D5 - B4 -', 'G4 - B4 - D5 - G5 -'] }
      },
      form: ['A', 'B']
    },
    boss: {
      name: 'THREAT LEVEL', bpm: 172, beats: 4, steps: 16, lead: 'pulse25', arp: 'pulse12', bass: 'saw', drums: 'drive',
      bassPat: 'R.RR8.RRR.RR8.5.', arpPat: '0102010201020102', echo: 0.18,
      sections: {
        A: { chords: 'Dm Dm Bb C Dm Dm Bb A', mel: [
          'D5 - A4 - D5 - F5 E5', 'D5 - A4 - F5 - E5 -', 'F5 - D5 - Bb4 - D5 -', 'E5 - C5 - G5 - E5 -',
          'A5 - - G5 F5 - E5 -', 'D5 - F5 - A5 - D6 -', 'C6 - Bb5 - A5 - G5 -', 'A5 - C#6 - E6 - - .'] },
        B: { chords: 'Gm Gm Dm Dm Bb C A A', mel: [
          'Bb5 - - - A5 - G5 -', 'D5 - G5 - Bb5 - D6 -', 'A5 - - - F5 - D5 -', 'A4 - D5 - F5 - A5 -',
          'Bb5 - A5 - G5 - F5 -', 'G5 - F5 - E5 - C5 -', 'E5 - A5 - C#6 - E6 -', 'C#6 - - - A5 - E5 -'] }
      },
      form: ['A', 'B']
    },
    pipe: {
      name: 'DEPLOY PIPELINE', bpm: 132, beats: 4, steps: 16, lead: 'pulse12', arp: 'pulse12', bass: 'saw', drums: 'techno',
      bassPat: '..R8..R8..R8..R5', arpPat: '0120120120120120', echo: 0.35,
      sections: {
        A: { chords: 'Am Am F G Am Am F E', mel: [
          'A4 . A4 . C5 . E5 .', 'D5 - C5 - B4 - G4 -', 'A4 . A4 . C5 . F5 .', 'E5 - D5 - B4 - D5 -',
          'A5 . A5 . G5 . E5 .', 'C5 - D5 - E5 - G5 -', 'A5 - G5 - F5 - C5 -', 'B4 - - - G#4 - E4 -'] },
        B: { chords: 'Dm Dm Am Am F G E E', mel: [
          'F5 - - - A5 - D5 -', 'F5 - A5 - D6 - A5 -', 'E5 - - - C5 - A4 -', 'E5 - A5 - C6 - A5 -',
          'C6 - A5 - F5 - A5 -', 'B5 - G5 - D5 - G5 -', 'G#5 - - - B5 - - .', 'E5 . E5 . G#5 . B5 .'] }
      },
      form: ['A', 'B']
    },
    metro: {
      name: 'METRO MANOUCHE', bpm: 180, beats: 4, steps: 8, swing: 0.33, lead: 'accordion', arp: 'guitar', bass: 'tri', drums: 'brush',
      bassPat: 'R-3-5-w-', arpPat: '..c...c.', echo: 0.12,
      sections: {
        A: { chords: 'Dm6 Dm6 A7 A7 Dm6 Dm6 Gm6 A7', mel: [
          'A4 - D5 - F5 - A5 -', 'G#5 A5 - F5 D5 - - .', 'E5 - G5 - C#5 - E5 -', 'Bb5 A5 G5 E5 C#5 - A4 -',
          'D5 - F5 A5 D6 - C#6 -', 'D6 - A5 - F5 - D5 -', 'G5 - Bb5 - D6 - E5 -', 'C#5 - E5 - G5 - Bb5 -'] },
        B: { chords: 'Gm6 Gm6 Dm6 Dm6 E7 A7 Dm6 A7', mel: [
          'D6 - - Bb5 G5 - D5 -', 'E5 - G5 - Bb5 - - .', 'A5 - - F5 D5 - B4 -', 'D5 - F5 - A5 - - .',
          'G#5 - B5 - D6 - - B5', 'C#6 - - A5 G5 - E5 -', 'F5 - D5 - A4 - D5 -', 'E5 F5 E5 D5 C#5 - A4 -'] }
      },
      form: ['A', 'B']
    },
    bonus: {
      name: 'BONUS ROUND', bpm: 160, beats: 4, steps: 16, lead: 'pulse25', arp: 'pulse12', bass: 'tri', drums: 'pop',
      bassPat: 'R.8.R.8.R.8.5.8.', arpPat: '0123012301230123', echo: 0.25,
      sections: {
        A: { chords: 'F C Dm Bb F C Bb C', mel: [
          'C5 - F5 - A5 - C6 -', 'E5 - G5 - C6 - - .', 'D5 - F5 - A5 - D6 -', 'D6 - C6 - Bb5 - F5 -',
          'A5 - C6 - F6 - C6 -', 'G5 - C6 - E6 - C6 -', 'D6 - Bb5 - F5 - D5 -', 'E5 - G5 - Bb5 - C6 -'] },
        B: { chords: 'Bb C Am Dm Gm C F C', mel: [
          'F5 . F5 . D5 - F5 -', 'G5 . G5 . E5 - G5 -', 'A5 - C6 - E6 - C6 -', 'D6 - - - A5 - F5 -',
          'Bb5 - A5 - G5 - D5 -', 'E5 - G5 - C6 - E6 -', 'F6 - - - C6 - A5 -', 'G5 - E5 - C5 - G4 -'] }
      },
      form: ['A', 'B']
    },
    paris: {
      name: 'VALSE DE PARIS', bpm: 170, beats: 3, steps: 6, lead: 'accordion', arp: 'accordion', bass: 'tri', drums: 'waltz',
      bassPat: ['R-....', '5-....'], arpPat: '..c-c-', echo: 0.1,
      sections: {
        A: { chords: 'Am Am E7 E7 E7 E7 Am Am', mel: [
          'E5 - - - A5 -', 'C6 - B5 - A5 -', 'G#5 - - - B5 -', 'D6 - C6 - B5 -',
          'B5 - A5 - G#5 -', 'D5 - E5 - G#5 -', 'A5 - - - E5 -', 'C5 - B4 - A4 -'] },
        B: { chords: 'Dm Dm Am Am E7 E7 Am A7', mel: [
          'F5 - - - A5 -', 'D6 - C6 - A5 -', 'C6 - - - E5 -', 'A5 - G#5 - A5 -',
          'B5 - - - G#5 -', 'E5 - F5 - G#5 -', 'A5 - - - - -', 'C#5 - E5 - G5 -'] },
        C: { chords: 'Am Am E7 E7 E7 E7 Am Am', mel: [
          'E5 - - - A5 -', 'C6 - B5 - A5 -', 'G#5 - - - B5 -', 'D6 - C6 - B5 -',
          'B5 - A5 - G#5 -', 'D5 - E5 - G#5 -', 'E5 - A5 - C6 -', 'A5 - - - . .'] }
      },
      form: ['A', 'B', 'C']
    },
    amsterdam: {
      name: 'DRAAIORGEL', bpm: 132, beats: 4, steps: 16, lead: 'organ', arp: 'organ', bass: 'tri', drums: 'polka',
      bassPat: 'R-......5-......', arpPat: '....c-......c-..', echo: 0.15,
      sections: {
        A: { chords: 'F Bb F C7 F Bb C7 F', mel: [
          'C5 - F5 - A5 - F5 -', 'D5 - F5 - Bb5 - - .', 'A5 - G5 - F5 - C5 -', 'E5 - G5 - Bb5 - G5 -',
          'A5 - C6 - F6 - C6 -', 'D6 - Bb5 - F5 - D5 -', 'C5 - E5 - G5 - Bb5 -', 'A5 - - - F5 . . .'] },
        B: { chords: 'Bb Bb F F C7 C7 F C7', mel: [
          'F5 G5 A5 Bb5 - - D6 -', 'C6 - Bb5 - F5 - - .', 'A5 G5 F5 A5 - - C6 -', 'A5 - F5 - C5 - - .',
          'G5 - E5 - C5 - E5 -', 'G5 - Bb5 - C6 - E5 -', 'F5 - A5 - C6 - A5 -', 'G5 - - - E5 - C5 -'] }
      },
      form: ['A', 'B']
    },
    london: {
      name: 'LONDON CALLING CLOUD', bpm: 126, beats: 4, steps: 16, lead: 'pulse50', arp: 'pulse12', bass: 'tri', drums: 'march',
      bassPat: 'R-R-5-R-R-R-5-8-', arpPat: '..c...c...c...c.', echo: 0.2,
      sections: {
        A: { chords: 'D A Bm G D A G A', mel: [
          'F#5 - - E5 D5 - A4 -', 'C#5 - E5 - A5 - - .', 'B5 - A5 - F#5 - D5 -', 'G5 - - - B4 - D5 -',
          'F#5 - A5 - D6 - - C#6', 'C#6 - B5 - A5 - E5 -', 'D5 - G5 - B5 - A5 -', 'A5 - - - E5 - C#5 -'] },
        B: { chords: 'Em G D A Em G A A7', mel: [
          'B5 - - - G5 - E5 -', 'D5 - G5 - B5 - - .', 'A5 - - - F#5 - D5 -', 'E5 - A5 - C#6 - - .',
          'G5 - F#5 - E5 - B4 -', 'D5 - E5 - G5 - B5 -', 'A5 - C#6 - E6 - - .', 'C#6 - B5 - A5 - G5 -'] }
      },
      form: ['A', 'B']
    },
    japan: {
      name: 'SAKURA EDGE', bpm: 100, beats: 4, steps: 16, lead: 'pluck', arp: 'pluck', bass: 'tri', drums: 'taiko',
      bassPat: 'R-------R---5---', arpPat: '0.1.2.1.0.1.2.3.', echo: 0.4, echoSteps: 4,
      sections: {
        A: { chords: 'Am Am G Am Dm Dm Em Am', mel: [
          'A4 - C5 - D5 - E5 -', 'G5 - E5 - - - D5 -', 'D5 - - - C5 - D5 -', 'E5 - - - - - . .',
          'D5 - E5 - G5 - A5 -', 'C6 - A5 - - - G5 -', 'E5 - G5 - D5 - E5 -', 'A4 - - - . . . .'] },
        B: { chords: 'F G Am Am F G Em Em', mel: [
          'C6 - - - A5 - C6 -', 'D6 - - - G5 - - .', 'E6 - D6 - C6 - A5 -', 'G5 - A5 - - - . .',
          'A5 - C6 - A5 - G5 -', 'E5 - D5 - - - G5 -', 'E5 - - - D5 - C5 -', 'D5 - - - E5 - G5 -'] }
      },
      form: ['A', 'B']
    }
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
      // lead
      for (let s = 0; s < steps; s++) {
        const n = b.mel[s];
        if (n <= 0) continue;
        let len = 1;
        while (len < total && flat[(bi * steps + s + len) % total] === -1) len++;
        ev[s].push(['lead', n, len, 1]);
      }
      const span = (pat, s) => { let l = 1; while (s + l < pat.length && pat[s + l] === '-') l++; return l; };
      // bass
      const bp = Array.isArray(raw.bassPat) ? raw.bassPat[bi % raw.bassPat.length] : raw.bassPat;
      for (let s = 0; s < steps; s++) {
        const c = bp[s];
        let n = 0;
        if (c === 'R') n = root;
        else if (c === '3') n = root + ch.iv[1];
        else if (c === '5') n = root + ch.iv[2];
        else if (c === '8') n = root + 12;
        else if (c === 'w') { let r = 36 + next.pc; if (r > 44) r -= 12; n = r - 1; }
        if (n) ev[s].push(['bass', n, span(bp, s), s === 0 ? 1 : 0.85]);
      }
      // chord voice
      const ap = raw.arpPat;
      for (let s = 0; s < steps; s++) {
        const c = ap[s];
        if (c === 'c') b.tones.slice(0, 4).forEach((n) => ev[s].push(['arp', n, span(ap, s), 0.55]));
        else if (c >= '0' && c <= '9') {
          const i = +c;
          ev[s].push(['arp', b.tones[i % b.tones.length] + 12 * Math.floor(i / b.tones.length), span(ap, s), 1]);
        }
      }
      // drums (fill on the last bar of the loop)
      const d = bi === bars.length - 1 ? drums.fill : drums;
      ['k', 's', 'h', 'o'].forEach((v) => {
        const p = d[v];
        if (!p) return;
        for (let s = 0; s < steps; s++) if (p[s] === 'x' || p[s] === 'X') ev[s].push([v, 0, 1, p[s] === 'X' ? 1 : 0.7]);
      });
      b.ev = ev;
    });
    return {
      key: key, name: raw.name, bpm: raw.bpm, beats: raw.beats, steps: steps, swing: raw.swing || 0,
      lead: raw.lead, arp: raw.arp, bass: raw.bass, drums: raw.drums, echo: raw.echo || 0.2, echoSteps: raw.echoSteps || 3,
      sections: raw.form.slice(), bars: bars,
      stepDur: (60 / raw.bpm) * raw.beats / steps
    };
  }

  const SONGS = {};
  Object.keys(RAW).forEach((k) => { SONGS[k] = buildSong(k, RAW[k]); });

  const LOOKAHEAD = 0.15, TICK_MS = 25, MUSIC_VOL = 0.28;
  const VOL = { lead: 0.3, arp: 0.1, bass: 0.42, k: 0.85, s: 0.32, h: 0.09, o: 0.1 };

  const A = (AH.Audio = {
    ctx: null,
    master: null,
    sfx: null,
    musicBus: null,
    muted: false,
    musicTimer: null,
    musicKind: null,
    musicRegion: null,
    seq: null,
    SONGS: SONGS,
    REGION_SONG: REGION_SONG,

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
    // Song key actually used for a music kind; region themes only replace 'main'.
    songFor(kind, region) {
      if (!kind) return null;
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
      const out = ctx.createGain(), echo = ctx.createGain(), trem = ctx.createGain();
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(1, t + 0.05);
      out.connect(this.musicBus);
      echo.gain.value = song.echo;
      echo.connect(this.delay);
      this.delay.delayTime.setValueAtTime(Math.min(0.9, song.stepDur * song.echoSteps), t);
      // shared tremolo for the accordion and street organ (bellows wobble)
      trem.gain.value = 0.8;
      trem.connect(out);
      const lfo = ctx.createOscillator(), depth = ctx.createGain();
      lfo.frequency.value = song.lead === 'organ' ? 7 : 5.5;
      depth.gain.value = 0.2;
      lfo.connect(depth);
      depth.connect(trem.gain);
      lfo.start(t);
      this.seq = { key: key, song: song, out: out, echo: echo, trem: trem, lfo: lfo, bar: 0, step: 0, next: t + 0.06 };
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
      s.lfo.stop(t + 0.4);
      setTimeout(() => { s.out.disconnect(); s.echo.disconnect(); s.trem.disconnect(); s.lfo.disconnect(); }, 600);
    },

    // lookahead scheduler: queue every step that starts within LOOKAHEAD seconds
    tick() {
      const s = this.seq, ctx = this.ctx;
      if (!s || !ctx) return;
      const now = ctx.currentTime, song = s.song;
      if (s.next < now - 0.2) s.next = now + 0.05; // throttled tab: skip ahead instead of bursting
      while (s.next < now + LOOKAHEAD) {
        if (!this.muted) {
          const t = s.next + (song.swing && s.step % 2 ? song.stepDur * song.swing : 0);
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
      if (kind === 'bass') return this.bassNote(song.bass, e[1], t, dur * 0.85, VOL.bass * vel, s.out);
      return this.drum(kind, t, vel, s.out);
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
      g.connect(reed ? s.trem : s.out);
      if (lead) g.connect(s.echo);
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
      const ctx = this.ctx, g = ctx.createGain(), o = this.osc(type === 'saw' ? 'sawtooth' : 'triangle', NOTE(n), t);
      const nodes = [o, g];
      if (type === 'saw') {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.Q.value = 6;
        lp.frequency.setValueAtTime(1400, t);
        lp.frequency.exponentialRampToValueAtTime(260, t + Math.max(0.06, dur));
        o.connect(lp); lp.connect(g);
        nodes.push(lp);
        vol *= 0.55;
      } else o.connect(g);
      g.connect(out);
      const end = this.env(g, t, 0.005, vol, dur, 0.03);
      o.start(t);
      o.stop(end);
      this.cleanup(o, nodes);
    },

    drum(kind, t, vel, out) {
      const ctx = this.ctx, g = ctx.createGain();
      g.connect(out);
      if (kind === 'k') {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(155, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.11);
        g.gain.setValueAtTime(VOL.k * vel, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.connect(g); o.start(t); o.stop(t + 0.22);
        this.cleanup(o, [o, g]);
        return;
      }
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter();
      src.buffer = this.noiseBuf;
      src.connect(f); f.connect(g);
      let len;
      if (kind === 's') {
        f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8;
        len = 0.15;
        const o = ctx.createOscillator(), og = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(190, t);
        o.frequency.exponentialRampToValueAtTime(140, t + 0.07);
        og.gain.setValueAtTime(VOL.s * vel * 0.8, t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.1);
        this.cleanup(o, [o, og]);
      } else {
        f.type = 'highpass'; f.frequency.value = 7000;
        len = kind === 'o' ? 0.18 : 0.035;
      }
      g.gain.setValueAtTime(VOL[kind] * vel, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + len);
      src.start(t, Math.random() * 0.5, len + 0.02);
      this.cleanup(src, [src, f, g]);
    }
  });
})();
