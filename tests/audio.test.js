'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function param(value = 0) {
  return {
    value,
    setValueAtTime(v) { this.value = v; return this; },
    linearRampToValueAtTime(v) { this.value = v; return this; },
    exponentialRampToValueAtTime(v) { this.value = v; return this; },
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
  }
  node(extra) {
    const ctx = this;
    return Object.assign({
      connect() {}, disconnect() {},
      start() { ctx.started++; }, stop() {},
      gain: param(1), frequency: param(440), detune: param(0), Q: param(1), delayTime: param(0),
      threshold: param(), knee: param(), ratio: param(), attack: param(), release: param()
    }, extra);
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

function setup() {
  const timers = new Map();
  let id = 0;
  const AH = {};
  const context = vm.createContext({
    window: { AH, AudioContext: FakeContext },
    setInterval(fn) { timers.set(++id, fn); return id; },
    clearInterval(i) { timers.delete(i); },
    setTimeout() { return 0; }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'systems/audio.js'), 'utf8'), context);
  AH.Save.save = () => {};
  const run = (seconds) => {
    const A = AH.Audio;
    for (let t = 0; t < seconds; t += 0.025) {
      if (A.ctx) A.ctx.currentTime += 0.025;
      for (const fn of [...timers.values()]) fn();
    }
  };
  return { AH, A: AH.Audio, timers, run };
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
  assert.equal(A.SONGS.paris.beats, 3);
  assert.equal(A.SONGS.paris.lead, 'accordion');
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
