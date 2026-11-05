/* Shared, deterministic composition tools; no audio context or storage access. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  /* Songs are written per bar: one chord symbol and one melody string per bar.
   * Melody tokens: note name, '-' hold, '.' rest; token count divides the step count.
   * Bass: R root, 3 third, 5 fifth, 6 sixth, 8 octave, w approach to next root.
   * Arp: digits = chord tone index, c = full chord stab. Drums: x hit, X accent. */
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
    pop: {
      k: 'X.....x...x.....', s: '....x.......x...', h: '..x...x...x...x.',
      fill: { k: 'X.....x...x.....', s: '....x.......x.x.', h: '..x...x...x...x.' }
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
  // Original tonic-relative city hooks stay fixed while harmony and density develop.
  function electronicSong(theme, style, context) {
    if (!['trance', 'house', 'pop'].includes(style)) throw new Error('Unsupported electronic style');
    const tonic = noteNum(theme.tonic), pc = tonic % 12;
    const hook = theme.hook.split('|').map((bar) => bar.trim());
    if (hook.length !== 4) throw new Error(theme.name + ': theme requires four bars');
    const note = (n) => NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 1);
    const phrase = (text, contrast, resolve) => text.split(/\s+/).map((token, i) => {
      if (resolve && i >= 4) return i === 4 ? note(tonic) : i === 5 ? '-' : '.';
      if (token === '.' || token === '-') return token;
      const interval = Number(token);
      if (!Number.isInteger(interval) || interval < 0 || interval > 24) throw new Error('Invalid theme interval');
      return note(tonic + interval + (contrast && i < 4 ? 12 : 0));
    }).join(' ');
    const harmony = (offset, quality) => NOTE_NAMES[(pc + offset) % 12] + quality;
    const progression = [harmony(0, 'm'), harmony(8, ''), harmony(3, ''), harmony(0, 'm')].join(' ');
    const section = (contrast, resolve) => ({
      chords: progression, mel: hook.map((bar, i) => phrase(bar, contrast, resolve && i === 3))
    });
    const pop = style === 'pop', house = style === 'house';
    const bpm = (pop ? 114 : house ? 126 : 136) + (context === 'pipe' ? -10 : context === 'boss' ? 8 : 0);
    return {
      name: theme.name + ' ' + style.toUpperCase(), bpm, style, beats: 4, steps: 16,
      lead: pop ? 'brightkeys' : house ? 'keys' : 'supersaw',
      arp: pop ? 'keys' : 'trancepluck', bass: pop ? 'round' : 'club', drums: style,
      bassPat: pop ? 'R---..5-R-..8-..' : '..R-..R-..8-..5-',
      arpPat: pop ? 'c---......c---..' : house
        ? theme.feel === 'syncopated' ? '..c...c....c..c.' : '..c...c...c...c.' : '0.2.1.2.0.2.1.2.',
      echo: pop ? 0.055 : house ? 0.09 : 0.13, echoSteps: 3, fillEvery: 8,
      production: { energy: context, colour: theme.colour, feel: theme.feel,
        mix: pop ? [0.9, 0.7, 0.7, 0.65] : [0.85, 0.65, 0.8, 0.8] },
      sections: { I: section(false, true), V: section(false, true), C: section(false, true),
        B: section(true, true), O: section(false, true) },
      form: pop ? ['I', 'V', 'C', 'B', 'C', 'O'] : ['I', 'V', 'C', 'B', 'V', 'C', 'C', 'O']
    };
  }

  function arrangeElectronic(bars, raw) {
    bars.forEach((bar, bi) => {
      const intro = bar.section === 'I', verse = bar.section === 'V';
      const bridge = bar.section === 'B', outro = bar.section === 'O';
      bar.ev = bar.ev.map((events, step) => events.filter((e) => {
        if (e[0] === 'lead') return !(intro && bi % 4 < 2) && !((verse || intro) && step >= 8);
        if (bridge && (e[0] === 'k' || e[0] === 'bass')) return false;
        if ((intro || outro || bridge) && (e[0] === 'h' || e[0] === 'o')) return step % 8 === 2;
        if (e[0] === 'arp' && (verse || intro || bridge)) return step < 8;
        return true;
      }).map((e) => {
        if (e[0] === 'lead') e[3] = step % 4 === 0 ? 0.95 : 0.76;
        if (e[0] === 'arp') {
          while (e[1] > 67) e[1] -= 12;
          e[3] *= bar.section === 'C' ? 0.85 : 0.6;
        }
        if (e[0] === 'h' || e[0] === 'o') e[3] *= 0.6;
        if (raw.production.energy === 'pipe') e[3] *= 0.72;
        if (outro) e[3] *= 0.8;
        return e;
      }));
    });
  }

  // Expand into per-bar, per-step events so playback never parses composition data.
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
      const breakdown = !raw.production && dance && b.section === 'B' && bi % 8 < 2;
      const intro = !raw.production && dance && bi < 4;
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
          const tones = b.tones.slice(0, 4);
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
    if (raw.production) arrangeElectronic(bars, raw);
    const song = {
      key: key, name: raw.name, bpm: raw.bpm, beats: raw.beats, steps: steps, swing: raw.swing || 0,
      swingEvery: raw.swingEvery || 1, style: raw.style, lead: raw.lead, arp: raw.arp, bass: raw.bass,
      drums: raw.drums, echo: raw.echo === undefined ? 0.2 : raw.echo, echoSteps: raw.echoSteps || 3,
      sections: raw.form.slice(), bars: bars,
      stepDur: (60 / raw.bpm) * raw.beats / steps
    };
    if (raw.production) song.production = raw.production;
    return song;
  }

  AH.Music = { danceSong, electronicSong, buildSong };
})();
