'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function param(value = 0) {
  return {
    value, events: [],
    setValueAtTime(v, t) { this.value = v; this.events.push(['set', v, t]); return this; },
    linearRampToValueAtTime(v, t) { this.value = v; this.events.push(['linear', v, t]); return this; },
    exponentialRampToValueAtTime(v, t) { this.value = v; this.events.push(['exponential', v, t]); return this; },
    setTargetAtTime() { return this; },
    cancelScheduledValues() { return this; }
  };
}

class FakeContext {
  constructor() {
    this.currentTime = 0;
    this.sampleRate = 8000;
    this.state = 'running';
    this.destination = {};
    this.counts = { osc: 0, src: 0 };
    this.started = 0;
    this.nodes = [];
  }
  node(extra) {
    const ctx = this;
    const node = Object.assign({
      connections: [], disconnected: false,
      connect(target) { this.connections.push(target); }, disconnect() { this.disconnected = true; },
      start() { ctx.started++; }, stop() {},
      gain: param(1), frequency: param(440), detune: param(0), Q: param(1), delayTime: param(0),
      threshold: param(), knee: param(), ratio: param(), attack: param(), release: param()
    }, extra);
    this.nodes.push(node);
    return node;
  }
  createGain() { return this.node(); }
  createOscillator() { this.counts.osc++; return this.node({ type: 'sine', setPeriodicWave() {} }); }
  createBiquadFilter() { return this.node({ type: 'lowpass' }); }
  createBufferSource() { this.counts.src++; return this.node({ buffer: null }); }
  createDynamicsCompressor() { return this.node(); }
  createDelay() { return this.node(); }
  createPeriodicWave() { return {}; }
  createBuffer(ch, len) { const d = new Float32Array(len); return { getChannelData: () => d }; }
  resume() { this.state = 'running'; }
}

function setup(options = {}) {
  const timers = new Map();
  const timeouts = [];
  const storage = options.storage || new Map();
  const warnings = [];
  let id = 0;
  let saves = 0;
  const AH = {};
  const context = vm.createContext({
    window: { AH, AudioContext: FakeContext },
    localStorage: {
      getItem(key) {
        if (options.blockRead) throw new Error('storage blocked');
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        if (options.blockWrite) throw new Error('storage blocked');
        storage.set(key, value);
      }
    },
    console: { warn(message) { warnings.push(message); } },
    setInterval(fn) { timers.set(++id, fn); return id; },
    clearInterval(i) { timers.delete(i); },
    setTimeout(fn) { timeouts.push(fn); return timeouts.length; }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'systems/audio.js'), 'utf8'), context);
  if (!options.keepSave) AH.Save.save = () => { saves++; };
  const run = (seconds) => {
    const A = AH.Audio;
    for (let t = 0; t < seconds; t += 0.025) {
      if (A.ctx) A.ctx.currentTime += 0.025;
      for (const fn of [...timers.values()]) fn();
    }
  };
  return { AH, A: AH.Audio, timers, timeouts, storage, warnings, run, saves: () => saves };
}

test('songFor picks region themes for main and falls back to main', () => {
  const { A } = setup();
  assert.equal(A.songFor('main', 'francecentral'), 'paris');
  assert.equal(A.songFor('main', 'westeurope'), 'amsterdam');
  assert.equal(A.songFor('main', 'uksouth'), 'london');
  assert.equal(A.songFor('main', 'japaneast'), 'japan');
  assert.equal(A.songFor('main', 'brazilsouth'), 'main');
  assert.equal(A.songFor('main', 'nowhere'), 'main');
  assert.equal(A.songFor('main'), 'main');
  assert.equal(A.songFor('boss', 'francecentral'), 'boss');
  assert.equal(A.songFor('pipe', 'japaneast'), 'pipe');
  assert.equal(A.songFor('mystery'), 'main');
  assert.equal(A.songFor(null), null);
  for (const k of ['title', 'main', 'boss', 'pipe', 'metro', 'bonus']) assert.equal(A.songFor(k), k);
});

test('every song is well formed', () => {
  const { A } = setup();
  const keys = Object.keys(A.SONGS);
  assert.ok(keys.length >= 10);
  for (const key of keys) {
    const s = A.SONGS[key];
    assert.ok(s.bars.length >= 16, key + ' has 16+ bars');
    assert.ok(s.sections.includes('A') && s.sections.includes('B'), key + ' has A and B sections');
    assert.ok(s.bpm >= 60 && s.bpm <= 220, key + ' tempo');
    let notes = 0;
    s.bars.forEach((b, i) => {
      assert.equal(b.mel.length, s.steps, `${key} bar ${i} length`);
      assert.equal(b.ev.length, s.steps, `${key} bar ${i} events`);
      assert.ok(b.chord && b.chord.sym && b.tones.length >= 3, `${key} bar ${i} chord`);
      b.mel.forEach((n) => { if (n > 0) { notes++; assert.ok(n >= 24 && n <= 108, `${key} note ${n}`); } });
      b.tones.forEach((n) => assert.ok(n >= 24 && n <= 108));
      b.ev.flat().forEach((e) => {
        if (e[1]) assert.ok(e[1] >= 24 && e[1] <= 108, `${key} ${e[0]} ${e[1]}`);
        assert.ok(e[2] >= 1);
      });
    });
    assert.ok(notes >= 32, key + ' has a real melody');
    assert.ok(s.bars.some(b => b.ev.flat().some(e => e[0] === 'bass')), key + ' bass');
    assert.ok(s.bars.some(b => b.ev.flat().some(e => e[0] === 'k')), key + ' drums');
  }
  assert.equal(A.SONGS.paris.style, 'house');
  assert.equal(A.SONGS.paris.lead, 'keys');
});

test('dance music keeps house/trance grooves, offbeat bass and structured original arrangements', () => {
  const { A } = setup();
  const songs = Object.entries(A.SONGS).filter(([, s]) => ['house', 'trance'].includes(s.style));
  assert.equal(songs.length, 10);
  for (const [key, s] of songs) {
    assert.equal(s.beats, 4); assert.equal(s.steps, 16); assert.equal(s.bars.length, 32);
    assert.ok(s.bpm >= 126 && s.bpm <= 138);
    assert.ok(['keys', 'supersaw'].includes(s.lead));
    assert.equal(s.arp, 'trancepluck'); assert.equal(s.bass, 'club');
    s.bars.forEach((b, i) => {
      const positions = (kind) => Array.from(b.ev, (events, step) => events.some((e) => e[0] === kind) ? step : -1).filter((n) => n >= 0);
      if (b.section === 'B' && i % 8 < 2) {
        assert.deepEqual(positions('k'), [], 'brief melodic breakdown');
      } else {
        assert.deepEqual(positions('k'), [0, 4, 8, 12], 'four-on-the-floor, including fills');
        assert.deepEqual(positions('bass'), [2, 6, 10, 14], 'bass sits between kicks');
      }
      assert.ok(positions('pad').length > 0);
    });
    assert.ok(!s.bars.slice(0, 4).some((b) => b.ev.flat().some((e) => e[0] === 'lead')), 'groove introduction');
    assert.ok(s.bars.filter((b) => b.section === 'C').every((b) => b.ev.flat().some((e) => e[0] === 'lead')), 'melodic drop');
  }
});

test('jazz, country, blues and rock have distinct arrangements for every context', () => {
  const { A } = setup();
  const configs = {
    jazz: ['jazzkeys', 'jazzkeys', 'upright'],
    country: ['twang', 'twang', 'upright'],
    blues: ['bluesguitar', 'organ', 'upright'],
    rock: ['rockguitar', 'rockguitar', 'electric']
  };
  const positions = (bar, kind) => Array.from(bar.ev, (events, step) => events.some((e) => e[0] === kind) ? step : -1).filter((n) => n >= 0);
  for (const [style, instruments] of Object.entries(configs)) {
    for (const context of ['title', 'main', 'pipe', 'boss']) {
      const s = A.SONGS[style + '_' + context];
      assert.equal(s.style, style);
      assert.deepEqual([s.lead, s.arp, s.bass], instruments);
      assert.equal(s.drums, style);
      assert.equal(s.steps, 16);
      assert.equal(s.swingEvery, 2);
      assert.ok(s.bars[0].ev.flat().some((e) => e[0] === 'lead'), style + ' starts with its melody');
      assert.ok(s.bars.every((b) => !b.ev.flat().some((e) => e[0] === 'pad')), style + ' has no dance pad');
      assert.ok(new Set(s.bars.map((b) => b.mel.join(','))).size >= 6, style + ' varies its phrases');
      assert.deepEqual(positions(s.bars[0], 's'), [4, 12], style + ' backbeat');
      if (style === 'jazz') {
        assert.ok(s.swing >= 0.3);
        assert.deepEqual(positions(s.bars[0], 'bass'), [0, 4, 8, 12], 'walking bass');
      } else if (style === 'country') {
        assert.ok(s.swing > 0 && s.swing < 0.2);
        assert.deepEqual(positions(s.bars[0], 'bass'), [0, 8], 'alternating bass');
        assert.deepEqual(positions(s.bars[0], 'arp'), [4, 12], 'country chord strums');
      } else if (style === 'blues') {
        assert.ok(s.swing >= 0.3);
        assert.equal(s.bars.length, 24, 'two 12-bar blues choruses');
        const bass = s.bars[0].ev.flat().filter((e) => e[0] === 'bass');
        assert.deepEqual(Array.from(bass, (e) => e[1] - bass[0][1]), [0, 7, 9, 7], 'boogie bass');
        assert.equal(s.bars[0].chord.iv[3], 10, 'dominant-seventh harmony');
        assert.deepEqual(positions(s.bars[7], 's'), [4, 12], 'no premature fill');
        assert.deepEqual(positions(s.bars[11], 's'), [4, 12, 14], 'fill ends the 12-bar chorus');
      } else {
        assert.equal(s.swing, 0);
        assert.deepEqual(positions(s.bars[0], 'k'), [0, 6, 8], 'rock kick pattern');
        const powerChord = s.bars[0].ev[0].filter((e) => e[0] === 'arp');
        assert.equal(powerChord.length, 2);
        assert.equal(powerChord[1][1] - powerChord[0][1], 7);
      }
    }
  }
});

test('styles route title, world, challenges, bonus and boss without disturbing dance regions', () => {
  const { A } = setup();
  for (const style of ['jazz', 'country', 'blues', 'rock']) {
    A.setStyle(style);
    for (const [kind, suffix] of Object.entries({ title: 'title', main: 'main', pipe: 'pipe', metro: 'pipe', bonus: 'title', boss: 'boss', mystery: 'main' })) {
      assert.equal(A.songFor(kind, 'francecentral'), style + '_' + suffix);
    }
    assert.equal(A.songFor(null), null);
  }
  A.setStyle('dance');
  assert.equal(A.songFor('main', 'francecentral'), 'paris');
  assert.equal(A.songFor('metro', 'uksouth'), 'metro');
});

test('style preference is local, allowlisted, survives reload and never saves game progress', () => {
  const first = setup();
  const { A, AH, storage, warnings, saves } = first;
  let pushes = 0;
  AH.Online = { pushProgress() { pushes++; } };
  AH.Run = { gold: true };
  AH.Gold = { run: () => true };
  assert.equal(A.loadStyle(), 'dance');
  assert.deepEqual(Array.from(A.STYLES), ['dance', 'jazz', 'country', 'blues', 'rock']);
  assert.equal(A.nextStyle(), 'jazz');
  assert.equal(A.setStyle('rock'), 'rock');
  assert.equal(storage.get('azureheroes2027_music'), 'rock');
  assert.equal(storage.has('azureheroes2027'), false);
  assert.equal(saves(), 0);
  assert.equal(pushes, 0);
  assert.equal(setup({ storage }).A.loadStyle(), 'rock');
  assert.throws(() => A.setStyle('LOUD'), /Unsupported music style/);
  assert.equal(A.style, 'rock');
  assert.equal(storage.get('azureheroes2027_music'), 'rock');
  for (const invalid of ['', 'JAZZ', '__proto__', '{}', 'not-a-style']) {
    storage.set('azureheroes2027_music', invalid);
    assert.equal(A.loadStyle(), 'dance');
  }
  assert.equal(warnings.length, 5);
  const inaccessible = setup({ blockRead: true, blockWrite: true });
  assert.equal(inaccessible.A.loadStyle(), 'dance');
  assert.equal(inaccessible.A.setStyle('jazz'), 'jazz');
  assert.equal(inaccessible.warnings.length, 2);
  assert.equal(inaccessible.saves(), 0);
});

test('shared title and bonus tracks retain the latest context for style changes', () => {
  const { A, timers } = setup();
  A.setStyle('jazz');
  A.init();
  A.music('title');
  const title = A.seq;
  A.music('bonus');
  assert.equal(A.seq, title);
  assert.equal(A.musicKind, 'bonus');
  A.setStyle('country');
  assert.equal(A.seq.key, 'country_title');
  assert.equal(A.musicKind, 'bonus');
  A.music('metro');
  assert.equal(A.seq.key, 'country_pipe');
  A.setStyle('dance');
  assert.equal(A.seq.key, 'metro');
  assert.equal(timers.size, 1);
});

test('muting in Gold Mode saves only the local preference and does not push progress', () => {
  const { AH, A, storage } = setup({ keepSave: true });
  let gold = true, pushes = 0;
  AH.Gold = { run: () => gold };
  AH.Online = { pushProgress() { pushes++; } };
  AH.Save.data.best = 42;
  AH.Save.data.resume = { id: 2, score: 100, lives: 3 };
  A.setMuted(true);
  let local = JSON.parse(storage.get('azureheroes2027'));
  assert.equal(local.muted, true);
  assert.equal(local.best, 42);
  assert.deepEqual(local.resume, { id: 2, score: 100, lives: 3 });
  assert.equal(pushes, 0);
  A.setStyle('country');
  assert.equal(storage.get('azureheroes2027_music'), 'country');
  assert.equal(pushes, 0);
  gold = false;
  A.setMuted(false);
  local = JSON.parse(storage.get('azureheroes2027'));
  assert.equal(local.muted, false);
  assert.equal(pushes, 1, 'normal runs retain progress sync');
});

test('switching styles keeps context, mute and exactly one scheduler, then releases old buses', () => {
  const { A, timers, timeouts, run } = setup();
  A.muted = true;
  A.music('main', 'uksouth');
  A.setStyle('blues');
  assert.equal(timers.size, 0);
  A.init();
  assert.equal(A.seq.key, 'blues_main');
  assert.equal(A.ctx.counts.osc, 0, 'muted style change schedules no notes');
  const muted = A.muted, old = A.seq;
  A.setStyle('rock');
  assert.equal(A.seq.key, 'rock_main');
  assert.equal(A.musicKind, 'main');
  assert.equal(A.musicRegion, 'uksouth');
  assert.equal(A.muted, muted);
  assert.equal(timers.size, 1);
  assert.ok(old.out.gain.events.some((e) => e[0] === 'linear' && e[1] === 0));
  timeouts.shift()();
  assert.ok(old.out.disconnected && old.echo.disconnected && old.synth.disconnected);
  const current = A.seq;
  A.setStyle('rock');
  assert.equal(A.seq, current, 'selecting the same style does not restart');
  A.muted = false;
  run(0.5);
  assert.ok(A.ctx.counts.osc > 0, 'music resumes after unmuting');
  A.music('boss');
  assert.equal(A.seq.key, 'rock_boss');
  assert.equal(timers.size, 1);
  A.music(null);
  A.setStyle('jazz');
  assert.equal(A.seq, null, 'changing style does not start intentionally stopped music');
  assert.equal(timers.size, 0);
});

test('swing delays alternate eighth notes, while rock remains straight', () => {
  for (const style of ['jazz', 'country', 'blues', 'rock']) {
    const { A, run } = setup();
    A.setStyle(style);
    A.init();
    const hats = [];
    A.voice = (seq, event, time) => { if (event[0] === 'h') hats.push(time); };
    A.music('main');
    const song = A.seq.song, first = A.seq.next - song.stepDur;
    run(0.6);
    assert.ok(hats.length >= 3, style);
    assert.ok(Math.abs(hats[0] - first) < 1e-8);
    assert.ok(Math.abs(hats[1] - (first + 2 * song.stepDur * (1 + song.swing))) < 1e-8, style + ' swung eighth');
    assert.ok(Math.abs(hats[2] - (first + 4 * song.stepDur)) < 1e-8, style + ' next beat');
  }
});

test('non-dance kicks do not duck the band, and new instrument nodes are released', () => {
  const { A } = setup();
  A.setStyle('jazz');
  A.init();
  A.music('main');
  const s = A.seq;
  const before = s.synth.gain.events.length;
  A.voice(s, ['k', 0, 1, 1], 2);
  assert.equal(s.synth.gain.events.length, before, 'no dance sidechain');
  for (const type of ['jazzkeys', 'twang', 'bluesguitar', 'rockguitar']) {
    const start = A.ctx.nodes.length;
    A.inst(type, 64, 2, 0.3, 0.1, s, true);
    const nodes = A.ctx.nodes.slice(start), source = nodes.find((n) => n.onended);
    assert.ok(source, type);
    assert.ok(nodes.some((n) => n.connections.includes(s.synth)));
    source.onended();
    assert.ok(nodes.every((n) => n.disconnected), type + ' nodes cleaned up');
  }
});

test('kick ducks only synths and bass; filtered synth voices release their nodes', () => {
  const { A } = setup();
  A.init(); A.music('main');
  const s = A.seq, t = 2;
  assert.ok(s.synth.connections.includes(s.out));
  A.voice(s, ['k', 0, 1, 1], t);
  assert.ok(s.synth.gain.events.some((e) => e[0] === 'linear' && e[1] === 0.24 && e[2] === t + 0.004));
  assert.ok(s.synth.gain.events.some((e) => e[0] === 'linear' && e[1] === 1 && e[2] > t && e[2] < t + 0.5));
  for (const type of ['supersaw', 'keys', 'trancepluck', 'pad']) {
    const before = A.ctx.nodes.length;
    A.inst(type, 64, t, 0.3, 0.1, s, true);
    const nodes = A.ctx.nodes.slice(before), source = nodes.find((n) => n.onended);
    assert.ok(source);
    assert.ok(nodes.some((n) => n.connections.includes(s.synth)));
    assert.ok(nodes.some((n) => n.frequency.events.some((e) => e[0] === 'exponential' && e[1] === (type === 'pad' ? 750 : 650))));
    source.onended();
    assert.ok(nodes.every((n) => n.disconnected), type + ' nodes cleaned up');
  }
});

test('music schedules ahead and same kind+region does not restart', () => {
  const { A, timers, run } = setup();
  A.init();
  A.music('main', 'francecentral');
  assert.equal(A.musicKind, 'main');
  assert.equal(timers.size, 1);
  run(1.2);
  const seq = A.seq, pos = [seq.bar, seq.step];
  assert.ok(A.ctx.counts.osc > 5, 'notes scheduled');
  const now = A.ctx.currentTime;
  assert.ok(seq.next >= now + 0.149 && seq.next <= now + 0.15 + seq.song.stepDur, 'lookahead window');
  A.music('main', 'francecentral');
  assert.equal(A.seq, seq);
  assert.deepEqual([A.seq.bar, A.seq.step], pos);
  assert.equal(timers.size, 1);
  A.music('boss', 'francecentral');
  assert.notEqual(A.seq, seq);
  assert.equal(A.seq.key, 'boss');
  assert.equal(timers.size, 1);
  A.music(null);
  assert.equal(A.seq, null);
  assert.equal(A.musicKind, null);
  assert.equal(timers.size, 0);
});

test('music requested before init starts once the context exists', () => {
  const { A, timers } = setup();
  A.music('pipe');
  assert.equal(A.ctx, null);
  assert.equal(timers.size, 0);
  assert.equal(A.musicKind, 'pipe');
  A.init();
  assert.equal(A.seq.key, 'pipe');
  assert.equal(timers.size, 1);
});

test('mute prevents note scheduling but keeps the song position', () => {
  const { A, run } = setup();
  A.muted = true;
  A.init();
  assert.equal(A.master.gain.value, 0);
  A.music('boss');
  const osc = A.ctx.counts.osc, src = A.ctx.counts.src;
  run(1);
  assert.equal(A.ctx.counts.osc, osc);
  assert.equal(A.ctx.counts.src, src);
  assert.ok(A.seq.step > 0 || A.seq.bar > 0);
  A.muted = false;
  run(0.5);
  assert.ok(A.ctx.counts.osc > osc);
});

test('sound effects still play through the sfx bus', () => {
  const { A } = setup();
  A.play('coin');
  assert.ok(A.sfx);
  assert.equal(A.ctx.counts.osc, 2);
});
