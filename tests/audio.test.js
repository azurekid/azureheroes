'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { localScripts } = require('./helpers/load-game');
const cities = ['amsterdam', 'london', 'paris', 'tokyo', 'sydney', 'venice', 'rio', 'mexico-city', 'redmond', 'virginia', 'new-york'];
const audioDependencies = ['worlds/catalogue.js',
  ...cities.map((city) => `worlds/${city}/world.js`),
  ...cities.map((city) => `worlds/${city}/music.js`),
  'audio/composition.js', 'audio/songs.js', 'audio/synth.js', 'audio/sfx.js', 'systems/save.js', 'systems/audio.js'];
const audioScripts = () => localScripts().filter((file) => audioDependencies.includes(file));
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const positions = (bar, kind) => Array.from(bar.ev, (events, step) =>
  events.some((event) => event[0] === kind) ? step : -1).filter((n) => n >= 0);
const eventsOf = (bar, kind) => bar.ev.flat().filter((event) => event[0] === kind);

function param(value = 0) {
  return {
    value, events: [],
    setValueAtTime(v, t) { this.value = v; this.events.push(['set', v, t]); return this; },
    linearRampToValueAtTime(v, t) { this.value = v; this.events.push(['linear', v, t]); return this; },
    exponentialRampToValueAtTime(v, t) { this.value = v; this.events.push(['exponential', v, t]); return this; },
    setTargetAtTime(...args) { this.events.push(['target', ...args]); return this; },
    cancelScheduledValues(...args) { this.events.push(['cancel', ...args]); return this; }
  };
}
class FakeContext {
  constructor() {
    this.currentTime = 0; this.sampleRate = 8000; this.state = 'running';
    this.destination = {}; this.counts = { osc: 0, src: 0 }; this.nodes = [];
  }
  node(extra) {
    const node = Object.assign({
      connections: [], disconnected: false,
      connect(target) { this.connections.push(target); }, disconnect() { this.disconnected = true; },
      starts: [], stops: [], start(...args) { this.starts.push(args); }, stop(...args) { this.stops.push(args); },
      gain: param(1), frequency: param(440), detune: param(), Q: param(1), delayTime: param(),
      threshold: param(), knee: param(), ratio: param(), attack: param(), release: param()
    }, extra);
    this.nodes.push(node); return node;
  }
  createGain() { return this.node(); }
  createOscillator() { this.counts.osc++; return this.node({ type: 'sine', setPeriodicWave(wave) { this.wave = wave; } }); }
  createBiquadFilter() { return this.node({ type: 'lowpass' }); }
  createBufferSource() { this.counts.src++; return this.node(); }
  createDynamicsCompressor() { return this.node(); }
  createDelay() { return this.node(); }
  createPeriodicWave(re, im) { return { re: Array.from(re), im: Array.from(im) }; }
  createBuffer(channels, length) { const data = new Float32Array(length); return { getChannelData: () => data }; }
  resume() { this.state = 'running'; }
}
function setup(options = {}) {
  const timers = new Map(), timeouts = [], storage = options.storage || new Map(), warnings = [];
  let id = 0, saves = 0, seed = 1;
  const AH = {}, math = Object.create(Math);
  math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const context = vm.createContext({
    window: { AH, AudioContext: FakeContext }, Math: math,
    localStorage: {
      getItem(key) { if (options.blockRead) throw new Error('storage blocked'); return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { if (options.blockWrite) throw new Error('storage blocked'); storage.set(key, value); }
    },
    console: { warn(message) { warnings.push(message); } },
    setInterval(fn) { timers.set(++id, fn); return id; },
    clearInterval(key) { timers.delete(key); }, setTimeout(fn) { timeouts.push(fn); return timeouts.length; }
  });
  for (const file of options.files || audioScripts()) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
  }
  if (!options.keepSave) AH.Save.save = () => { saves++; };
  const run = (seconds) => {
    for (let t = 0; t < seconds; t += 0.025) {
      if (AH.Audio.ctx) AH.Audio.ctx.currentTime += 0.025;
      for (const fn of [...timers.values()]) fn();
    }
  };
  return { AH, A: AH.Audio, timers, timeouts, storage, warnings, run, saves: () => saves };
}

test('audio dependencies match the explicit HTML dependency order', () => {
  const scripts = audioScripts();
  assert.deepEqual([...scripts].sort(), [...audioDependencies].sort());
  const before = (a, b) => assert.ok(scripts.indexOf(a) < scripts.indexOf(b), `${a} must precede ${b}`);
  for (const city of cities) {
    before('worlds/catalogue.js', `worlds/${city}/world.js`);
    before(`worlds/${city}/world.js`, `worlds/${city}/music.js`);
    before(`worlds/${city}/music.js`, 'audio/songs.js');
  }
  before('audio/composition.js', 'audio/songs.js');
  for (const dependency of ['audio/songs.js', 'audio/synth.js', 'audio/sfx.js', 'systems/save.js']) before(dependency, 'systems/audio.js');
});

test('eleven original club compositions retain their notes, voices and event timings', () => {
  const { A } = setup();
  const originals = Object.fromEntries(Object.entries(A.SONGS).filter(([, song]) => !song.production));
  assert.equal(Object.keys(originals).length, 11);
  assert.equal(digest(originals), 'bc4716d1840dc2fc8d21e012aa462d81f35fa6a200f628e5793b71567e0ee7a1');
  assert.equal(JSON.stringify(A.REGION_SONG), '{"francecentral":"paris","westeurope":"amsterdam","uksouth":"london","japaneast":"japan","eastus2":"newyork"}');
});

test('city themes extend metadata without depending on audio, storage or band instruments', () => {
  const { AH } = setup({ files: audioScripts().filter((file) => file.startsWith('worlds/')), keepSave: true });
  assert.equal(AH.Audio, undefined); assert.equal(AH.Save, undefined);
  for (const slug of cities) {
    const { world, music } = AH.Worlds[slug];
    assert.ok(world.region);
    assert.equal(music.band, undefined);
    assert.equal(music.theme.hook.split('|').length, 4);
    assert.match(music.theme.tonic, /^[A-G][#b]?[34]$/);
  }
});

test('only trance, house and pop exist, with well-formed finite musical events', () => {
  const { A } = setup();
  assert.deepEqual(Array.from(A.STYLES), ['trance', 'house', 'pop']);
  assert.equal(Object.keys(A.SONGS).length, 127);
  for (const [key, song] of Object.entries(A.SONGS)) {
    assert.ok(A.STYLES.includes(song.style), key);
    assert.ok(song.bars.length >= 16 && song.bpm >= 100 && song.bpm <= 144, key);
    assert.equal(song.swing, 0, 'all grooves stay straight');
    let lead = 0;
    for (const bar of song.bars) {
      assert.equal(bar.mel.length, song.steps);
      assert.equal(bar.ev.length, song.steps);
      for (const event of bar.ev.flat()) {
        assert.ok(event.every((value, i) => i === 0 || Number.isFinite(value)), key);
        assert.ok(event[1] === 0 || event[1] >= 24 && event[1] <= 108, key);
        assert.ok(event[2] >= 1 && event[2] <= song.steps, key);
        assert.ok(event[3] > 0 && event[3] <= 1, key);
        if (event[0] === 'lead') lead++;
      }
    }
    assert.ok(lead >= 24, key + ' deliberate melody');
  }
});

test('every style routes eleven distinct city hooks through main, pipe, metro and boss', () => {
  const { AH, A } = setup();
  for (const style of A.STYLES) {
    A.setStyle(style);
    const themes = new Set();
    for (const slug of cities) {
      const { world, music } = AH.Worlds[slug];
      const main = A.SONGS[A.songFor('main', world.region)];
      assert.equal(main.key, `${style}_${slug}_main`);
      const chorus = main.bars.filter((bar) => bar.section === 'C').slice(0, 4);
      themes.add(chorus.map((bar) => bar.mel.join(',')).join('|'));
      for (const kind of ['pipe', 'metro', 'boss']) {
        const song = A.SONGS[A.songFor(kind, world.region)];
        assert.equal(song.key, `${style}_${slug}_${kind === 'metro' ? 'pipe' : kind}`);
        assert.ok(song.name.startsWith(music.theme.name));
        assert.deepEqual(Array.from(song.bars[8].mel), Array.from(main.bars[8].mel), 'hook survives context changes');
        assert.equal(song.production.energy, kind === 'metro' ? 'pipe' : kind);
      }
      assert.ok(A.SONGS[A.songFor('boss', world.region)].bpm > main.bpm);
      assert.ok(A.SONGS[A.songFor('pipe', world.region)].bpm < main.bpm);
    }
    assert.equal(themes.size, 11, style + ' regional motifs');
    assert.equal(A.songFor('main', 'unknown'), style + '_main');
    assert.equal(A.songFor('mystery'), style + '_main');
    assert.equal(A.songFor('metro'), style + '_pipe');
    for (const kind of ['title', 'bonus']) assert.equal(A.songFor(kind, 'uksouth'), `${style}_${kind}`);
    assert.equal(A.songFor(null), null);
  }
});

test('pop has bright keys, a repeated chorus, sparse kit and syncopated straight bass', () => {
  const { A } = setup();
  for (const song of Object.values(A.SONGS).filter((song) => song.style === 'pop')) {
    assert.deepEqual([song.lead, song.arp, song.bass], ['brightkeys', 'keys', 'round']);
    assert.deepEqual(Array.from(song.sections), ['I', 'V', 'C', 'B', 'C', 'O']);
    const chorus = song.bars[8], verse = song.bars[4];
    assert.deepEqual(positions(chorus, 'k'), [0, 6, 10], 'not a club four-on-the-floor');
    assert.deepEqual(positions(chorus, 's'), [4, 12]);
    assert.deepEqual(positions(chorus, 'h'), [2, 6, 10, 14]);
    assert.deepEqual(positions(chorus, 'bass'), [0, 6, 8, 12]);
    assert.equal(eventsOf(chorus, 'pad').length, 0);
    assert.ok(eventsOf(verse, 'lead').length < eventsOf(chorus, 'lead').length, song.key);
    assert.equal(digest(song.bars.slice(8, 12).map((bar) => bar.ev)),
      digest(song.bars.slice(16, 20).map((bar) => bar.ev)), 'returning chorus is recognizable');
  }
});

test('house and trance keep offbeat bass and club groove with a real breakdown', () => {
  const { A } = setup();
  for (const song of Object.values(A.SONGS).filter((song) => song.production && song.style !== 'pop')) {
    assert.equal(song.bars.length, 32);
    assert.deepEqual(positions(song.bars[8], 'k'), [0, 4, 8, 12]);
    assert.deepEqual(positions(song.bars[8], 'bass'), [2, 6, 10, 14]);
    assert.equal(song.lead, song.style === 'trance' ? 'supersaw' : 'keys');
    assert.ok(eventsOf(song.bars[8], 'pad').length > 0);
    assert.ok(song.bars.filter((bar) => bar.section === 'B').every((bar) =>
      eventsOf(bar, 'k').length === 0 && eventsOf(bar, 'bass').length === 0));
    assert.notEqual(digest(song.bars[4].ev), digest(song.bars[8].ev), 'verse develops into chorus');
  }
});

test('house develops four-bar grooves and distinct original lounge scene hooks', () => {
  const { A } = setup();
  for (const song of Object.values(A.SONGS).filter(song => song.production && song.style === 'house')) {
    const lounge = ['title', 'pipe', 'bonus'].includes(song.production.energy);
    assert.equal(song.production.lounge, lounge);
    assert.equal(song.bpm, { title: 104, main: 134, pipe: 108, bonus: 112, boss: 142 }[song.production.energy]);
    assert.equal(song.arp, lounge ? 'keys' : 'trancepluck');
    assert.equal(song.bass, lounge ? 'round' : 'club');
    const chorus = song.bars.slice(8, 12);
    assert.ok(new Set(chorus.map(bar => positions(bar, 'arp').join(','))).size >= 3, 'developed chord rhythm');
    assert.ok(new Set(chorus.map(bar => positions(bar, 'h').join(','))).size >= 2, 'changing hats');
    if (lounge) {
      assert.ok(chorus.every(bar => positions(bar, 'h').length <= 2 && positions(bar, 'o').length === 0));
      assert.ok(chorus.flatMap(bar => eventsOf(bar, 'lead')).every(e => e[3] <= 0.57));
    }
    assert.ok(chorus.every(bar => bar.chord.iv.length === 4), 'warm seventh chords');
  }
  const hooks = ['title', 'main', 'pipe', 'boss', 'bonus'].map(kind =>
    A.SONGS['house_' + kind].bars.slice(8, 12).map(bar => bar.mel.join(',')).join('|'));
  assert.equal(new Set(hooks).size, 5, 'new scene tunes are not one melody at different tempos');
});

test('arrangements phrase in a stable tonic, leave rests and resolve cleanly at the loop', () => {
  const { A } = setup();
  for (const song of Object.values(A.SONGS).filter((song) => song.production)) {
    const tonic = song.bars[0].chord.pc;
    assert.ok(song.bars.some((bar) => bar.mel.includes(0)));
    assert.equal(eventsOf(song.bars[0], 'lead').length, 0, 'two-bar breathing-space intro');
    assert.ok(new Set(song.bars.flatMap((bar) => eventsOf(bar, 'lead').map((e) => e[3]))).size >= 2);
    assert.ok(song.bars.every((bar) => bar.ev.every((events) => events.length <= 9)), 'bounded simultaneous density');
    const final = song.bars.at(-1), lastNote = eventsOf(final, 'lead').at(-1);
    assert.equal(lastNote[1] % 12, tonic, song.key + ' resolves to tonic');
    assert.ok(!final.ev.slice(12).flat().some((event) => event[0] === 'lead'), 'breath before loop');
    assert.ok(song.bars.flatMap((bar) => eventsOf(bar, 'arp')).every((event) => event[1] <= 67), 'chords below lead register');
  }
});

test('all allowlisted styles persist locally without game-progress writes, including Gold Mode', () => {
  const { A, AH, storage, saves } = setup();
  AH.Gold = { run: () => true };
  AH.Online = { pushProgress() { throw new Error('style must not sync progress'); } };
  assert.equal(A.loadStyle(), 'trance');
  assert.equal(A.nextStyle(), 'house'); assert.equal(A.nextStyle(), 'pop'); assert.equal(A.nextStyle(), 'trance');
  A.setStyle('pop');
  assert.equal(setup({ storage }).A.loadStyle(), 'pop');
  assert.equal(storage.has('azureheroes2027'), false); assert.equal(saves(), 0);
  for (const invalid of ['dance', 'jazz', 'country', 'blues', 'rock', '__proto__', '', 'POP', null]) {
    assert.throws(() => A.setStyle(invalid), /Unsupported music style/);
    assert.equal(A.style, 'pop');
  }
});

test('N selections include independent songs and preserve genre-only compatibility', () => {
  const { A, saves, storage } = setup();
  assert.deepEqual(Array.from(A.SELECTIONS), ['trance', 'house', 'pop', 'night-drive', 'soft-skies']);
  A.init(); A.music('main', 'westeurope');
  const choices = [];
  for (let i = 0; i < 5; i++) choices.push(A.nextSelection());
  assert.deepEqual(choices, ['house', 'pop', 'night-drive', 'soft-skies', 'trance']);
  for (const [selection, key, label] of [
    ['night-drive', 'house_night_drive', 'NIGHT DRIVE'], ['soft-skies', 'house_soft_skies', 'SOFT SKIES']
  ]) {
    A.setSelection(selection);
    assert.equal(A.style, 'house'); assert.equal(A.selectionLabel(), label);
    assert.equal(storage.get('azureheroes2027_music'), selection);
    const seq = A.seq;
    for (const context of ['title', 'main', 'pipe', 'metro', 'bonus', 'boss']) {
      A.music(context, 'uksouth');
      assert.equal(A.seq.key, key); assert.equal(A.seq, seq, 'selected song continues on context changes');
    }
    const reloaded = setup({ storage }).A;
    reloaded.loadStyle(); assert.equal(reloaded.selection, selection); assert.equal(reloaded.style, 'house');
    A.music(null); A.nextSelection(); assert.equal(A.seq, null, 'selection does not restart stopped music');
    A.setSelection(selection); A.music('main', 'westeurope');
    A.setStyle('house'); assert.equal(A.selection, 'house');
    assert.equal(A.seq.key, 'house_amsterdam_main', 'genre restores regional context');
  }
  assert.equal(saves(), 0);
});

test('new songs have different melodies, authored responses and quiet/loud contrast', () => {
  const { A } = setup(), drive = A.SONGS.house_night_drive, skies = A.SONGS.house_soft_skies;
  const melody = song => song.bars.slice(8, 12).map(bar => bar.mel.join(',')).join('|');
  const existing = Object.values(A.SONGS).filter(s => ![drive, skies].includes(s)).map(melody);
  for (const song of [drive, skies]) {
    assert.ok(!existing.includes(melody(song)), 'new notes, not another arrangement of an existing hook');
    assert.notEqual(melody(song), song.bars.slice(12, 16).map(bar => bar.mel.join(',')).join('|'), 'authored response');
    assert.ok(song.bars.slice(4, 8).flatMap(b => eventsOf(b, 'lead')).length <
      song.bars.slice(8, 12).flatMap(b => eventsOf(b, 'lead')).length);
  }
  assert.notEqual(melody(drive), melody(skies));
  assert.equal(drive.bpm, 134); assert.equal(skies.bpm, 108);
  assert.equal(skies.production.lounge, true);
});

test('named-song preferences reject invalid data and survive blocked storage and mute', () => {
  const { A, timers, storage } = setup();
  A.init(); A.music('main', 'eastus2'); A.setMuted(true);
  for (const selection of ['night-drive', 'soft-skies']) {
    A.setSelection(selection); assert.equal(A.muted, true); assert.equal(timers.size, 1);
  }
  for (const invalid of ['__proto__', 'constructor', '', null, 'NIGHT DRIVE', 'house_night_drive']) {
    assert.throws(() => A.setSelection(invalid), /Unsupported music selection/);
    assert.equal(A.selection, 'soft-skies');
  }
  const blocked = setup({ blockWrite: true });
  blocked.A.setSelection('night-drive');
  assert.equal(blocked.A.selection, 'night-drive'); assert.equal(blocked.warnings.length, 1);
  A.music(null); A.setSelection('night-drive'); assert.equal(timers.size, 0);
  assert.equal(storage.has('azureheroes2027'), false);
});

test('legacy dance migrates silently, removed genres warn and reset, malformed preferences are safe', () => {
  for (const stored of ['dance', 'jazz', 'country', 'blues', 'rock', '__proto__', '{}', '']) {
    const storage = new Map([['azureheroes2027_music', stored]]);
    const { A, warnings, saves } = setup({ storage });
    assert.equal(A.loadStyle(), 'trance');
    assert.equal(storage.get('azureheroes2027_music'), 'trance');
    assert.equal(warnings.length, stored === 'dance' ? 0 : 1);
    if (warnings.length) assert.match(warnings[0], /Removed or invalid.*trance/);
    assert.equal(saves(), 0);
  }
  const blocked = setup({ blockRead: true, blockWrite: true });
  assert.equal(blocked.A.loadStyle(), 'trance'); blocked.A.setStyle('house');
  assert.equal(blocked.A.style, 'house'); assert.equal(blocked.warnings.length, 2);
  const migrated = setup({ blockWrite: true, storage: new Map([['azureheroes2027_music', 'rock']]) });
  assert.equal(migrated.A.loadStyle(), 'trance');
  assert.equal(migrated.warnings.length, 2);
});

test('style/context changes retain mute and one scheduler, stop old buses and keep music stopped', () => {
  const { A, timers, timeouts, run } = setup();
  A.muted = true; A.music('main', 'uksouth'); A.setStyle('house');
  assert.equal(timers.size, 0); A.init();
  assert.equal(A.seq.key, 'house_london_main'); assert.equal(A.ctx.counts.osc, 0);
  const old = A.seq;
  A.setStyle('pop');
  assert.equal(A.seq.key, 'pop_london_main'); assert.equal(A.muted, true); assert.equal(timers.size, 1);
  assert.ok(old.out.gain.events.some((event) => event[0] === 'linear' && event[1] === 0));
  timeouts.shift()(); assert.ok(old.out.disconnected && old.echo.disconnected && old.synth.disconnected);
  const current = A.seq; A.setStyle('pop'); assert.equal(A.seq, current);
  A.setMuted(false); run(1.2); assert.ok(A.ctx.counts.osc > 0);
  A.music('boss', 'uksouth'); assert.equal(A.seq.key, 'pop_london_boss');
  A.music('pipe', 'uksouth'); A.music('main', 'uksouth'); assert.equal(A.seq.key, 'pop_london_main');
  A.music(null); A.setStyle('trance'); assert.equal(A.seq, null); assert.equal(timers.size, 0);
});

test('title and bonus remain shared across cities but preserve their own routing context', () => {
  const { A, timers } = setup();
  A.init(); A.music('title', 'uksouth'); const title = A.seq;
  A.music('title', 'japaneast'); assert.equal(A.seq, title); assert.equal(A.musicRegion, 'japaneast');
  A.music('bonus', 'japaneast'); assert.equal(A.seq.key, 'trance_bonus');
  A.setStyle('house'); assert.equal(A.seq.key, 'house_bonus'); assert.equal(A.musicKind, 'bonus');
  A.music('metro', 'japaneast'); assert.equal(A.seq.key, 'house_tokyo_pipe'); assert.equal(timers.size, 1);
});

test('scheduler looks ahead, same track does not restart and muted playback still advances', () => {
  const { A, timers, run } = setup();
  A.music('main', 'francecentral'); assert.equal(A.ctx, null); A.init(); run(1.2);
  const seq = A.seq, position = [seq.bar, seq.step], now = A.ctx.currentTime;
  assert.ok(seq.next >= now + 0.149 && seq.next <= now + 0.15 + seq.song.stepDur);
  A.music('main', 'francecentral'); assert.equal(A.seq, seq);
  assert.deepEqual([seq.bar, seq.step], position); assert.equal(timers.size, 1);
  A.setMuted(true); const before = A.ctx.counts.osc; run(1);
  assert.equal(A.ctx.counts.osc, before); assert.notDeepEqual([seq.bar, seq.step], position);
  A.setMuted(false); run(0.5); assert.ok(A.ctx.counts.osc > before);
  A.ctx.state = 'suspended'; A.init(); assert.equal(A.ctx.state, 'running');
  A.music(null); assert.equal(A.musicKind, null); assert.equal(timers.size, 0);
});

test('electronic voices release every node, have finite stops and use regional filtering', () => {
  const { A } = setup(); A.init(); A.music('main');
  for (const type of ['supersaw', 'keys', 'brightkeys', 'trancepluck', 'pad']) {
    const before = A.ctx.nodes.length; A.inst(type, 64, 2, 0.3, 0.1, A.seq, true);
    const nodes = A.ctx.nodes.slice(before), source = nodes.find((node) => node.onended);
    assert.ok(source, type); assert.ok(nodes.some((node) => node.connections.includes(A.seq.synth)));
    assert.ok(nodes.every((node) => node.stops.every(([time]) => Number.isFinite(time) && time < 3)));
    source.onended(); assert.ok(nodes.every((node) => node.disconnected), type);
  }
  for (const type of ['club', 'round']) {
    const before = A.ctx.nodes.length; A.bassNote(type, 40, 2, 0.3, 0.1, A.seq.synth);
    const nodes = A.ctx.nodes.slice(before); nodes.find((node) => node.onended).onended();
    assert.ok(nodes.every((node) => node.disconnected), type);
  }
  const cutoffs = [];
  for (const region of ['uksouth', 'japaneast']) {
    A.setStyle('pop'); A.music('main', region);
    const before = A.ctx.nodes.length; A.inst('brightkeys', 64, 2, 0.3, 0.1, A.seq, true);
    cutoffs.push(A.ctx.nodes.slice(before).find((node) => node.type === 'lowpass').frequency.events[0][1]);
  }
  assert.notEqual(...cutoffs, 'city palette has an actual timbral effect');
  assert.equal(A.instrumentBuffer, undefined, 'obsolete sampled band machinery is gone');
});

test('only club kicks duck synths; all electronic drums have smooth edges and cleanup', () => {
  const { A } = setup(); A.init();
  for (const style of A.STYLES) {
    A.setStyle(style); A.music('main');
    const seq = A.seq, before = seq.synth.gain.events.length;
    A.voice(seq, ['k', 0, 1, 1], 2);
    assert.equal(seq.synth.gain.events.length > before, style !== 'pop');
    for (const kind of ['k', 's', 'h', 'o']) {
      const start = A.ctx.nodes.length; A.drum(kind, 3, 0.7, seq.out, style);
      const nodes = A.ctx.nodes.slice(start), gain = nodes[0].gain;
      assert.deepEqual(gain.events[0], ['set', 0, 3]);
      assert.ok(gain.events.some((event) => event[0] === 'linear' && event[1] === 0 && event[2] > 3));
      nodes.find((node) => node.onended).onended();
      assert.ok(nodes.every((node) => node.disconnected), `${style} ${kind}`);
    }
  }
});

test('existing SFX retain smooth attack, source cleanup and their dedicated bus', () => {
  const { A } = setup(); A.init();
  for (const name of ['coin', 'hit', 'blast', 'win', 'lose']) {
    const before = A.ctx.nodes.length; A.play(name);
    const nodes = A.ctx.nodes.slice(before), sources = nodes.filter((node) => node.onended);
    assert.ok(sources.length > 0); assert.ok(nodes.some((node) => node.connections.includes(A.sfx)));
    for (const node of sources) node.onended();
    assert.ok(nodes.every((node) => node.disconnected), name);
    for (const node of nodes.filter((node) => node.gain.events.length)) {
      assert.equal(node.gain.events[0][1], 0);
      assert.ok(node.gain.events.some((event) => event[0] === 'linear' && event[2] >= 0.003));
    }
  }
});

test('muting in Gold Mode saves only local preferences without changing progress or syncing', () => {
  const { AH, A, storage } = setup({ keepSave: true });
  let gold = true, pushes = 0;
  AH.Gold = { run: () => gold }; AH.Online = { pushProgress() { pushes++; } };
  AH.Save.data.best = 42; AH.Save.data.resume = { id: 2, score: 100, lives: 3 };
  A.setMuted(true); A.setStyle('pop');
  const local = JSON.parse(storage.get('azureheroes2027'));
  assert.equal(local.muted, true); assert.equal(local.best, 42);
  assert.deepEqual(local.resume, { id: 2, score: 100, lives: 3 }); assert.equal(pushes, 0);
  assert.equal(storage.get('azureheroes2027_music'), 'pop');
  gold = false; A.setMuted(false); assert.equal(pushes, 1);
});

test('standalone Save retains guest defaults and stored progress with no audio dependency', () => {
  const storage = new Map([['azureheroes2027', JSON.stringify({
    best: 42, unlocked: 4, bests: { 3: 42 }, muted: true, hero: 'f',
    look: { suit: 2 }, resume: { id: 4, score: 42, lives: 2 }, updated: 123
  })]]);
  const { AH } = setup({ files: ['systems/save.js'], storage, keepSave: true });
  assert.equal(AH.Audio, undefined); const save = AH.Save;
  assert.equal(save.load().hero, 'f'); assert.equal(save.data.look.suit, 2); assert.equal(save.data.updated, 123);
  let pushes = 0, gold = false;
  AH.Online = { pushProgress() { pushes++; } }; AH.Gold = { run: () => gold };
  save.recordScore(3, 50); save.recordScore(3, 10); save.unlock(5); save.unlock(2); save.setResume(5, 50, 2);
  let local = JSON.parse(storage.get('azureheroes2027'));
  assert.equal(local.best, 50); assert.equal(local.bests[3], 50); assert.equal(local.unlocked, 5);
  assert.deepEqual(local.resume, { id: 5, score: 50, lives: 2 }); assert.equal(pushes, 4);
  gold = true; save.data.muted = false; save.save(); assert.equal(pushes, 4);
  local = JSON.parse(storage.get('azureheroes2027')); assert.equal(local.best, 50);
  gold = false; save.setResume(null); assert.equal(pushes, 5);
  for (const options of [{ blockRead: true, blockWrite: true }, { storage: new Map([['azureheroes2027', '{']]) }]) {
    const guest = setup({ ...options, files: ['systems/save.js'], keepSave: true });
    assert.equal(guest.AH.Save.load().unlocked, 1); assert.equal(guest.AH.Save.data.resume, null);
    assert.doesNotThrow(() => guest.AH.Save.save());
  }
});
