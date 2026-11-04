'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../art/sprites.js'), 'utf8');
const scenes = fs.readFileSync(path.join(__dirname, '../systems/scenes.js'), 'utf8');
const frames = ['idle', 'run0', 'run1', 'run2', 'run3', 'jump', 'fly', 'duck', 'slide', 'shield', 'attack'];

function art() {
  const document = { createElement() {
    const canvas = { width: 0, height: 0, ops: [] };
    const gradient = () => ({ addColorStop(...args) { canvas.ops.push(['stop', ...args]); } });
    const ctx = new Proxy({
      createLinearGradient: gradient, createRadialGradient: gradient,
      getImageData() { return { data: new Uint8ClampedArray(canvas.width * canvas.height * 4) }; },
      putImageData() {}
    }, {
      get(target, key) { return key in target ? target[key] : (...args) => canvas.ops.push([key, ...args]); },
      set(target, key, value) { target[key] = value; canvas.ops.push([key, value]); return true; }
    });
    canvas.getContext = () => ctx;
    return canvas;
  } };
  // Isolate the actual hero rig and public exports, avoiding unrelated world art.
  const prefix = source.slice(0, source.indexOf("  reg2('shield_fx'"));
  const exports = source.slice(source.lastIndexOf('    hero: {'), source.lastIndexOf('    generate: function'));
  const context = vm.createContext({ window: {}, document });
  vm.runInContext(prefix + '\nAH.Art = {D: D,\n' + exports + '};})();', context);
  return context.window.AH.Art;
}
const A = art(), H = A.hero;
function scene() {
  const textures = new Map(), anims = new Set();
  return {
    textures: { exists: (key) => textures.has(key), addCanvas: (key, c) => textures.set(key, c), get: (key) => textures.get(key) },
    anims: { exists: (key) => anims.has(key), create: ({ key }) => anims.add(key) }
  };
}
function lab(unlocked = 1) {
  const AH = { Levels: { ids: [] }, Art: A, Save: { data: { unlocked }, save() { this.saved = true; } }, Audio: { play() {} } };
  vm.runInNewContext(scenes, { window: { AH }, Phaser: { Scene: class {} } });
  const lab = new AH.Scenes[2]();
  lab.rows = ['suit', 'hair', 'hat', 'gear'].map((k) => ({ k }));
  lab.look = { ...H.def.m };
  lab.refresh = () => {};
  lab.cameras = { main: { shake() {} } };
  lab.scene = { start(key) { lab.destination = key; } };
  return { lab, AH };
}

test('every region grants exactly one outfit, hair and accessory at its clear threshold', () => {
  assert.equal(H.suits.length, 17);
  assert.equal(H.styles.length, 17);
  assert.equal(H.gear.length, 16);
  for (let region = 0; region < 10; region++) {
    const reward = H.wardrobeFor(region);
    for (const category of ['suit', 'hair', 'gear']) {
      assert.equal(H.wardrobeOpen(category, reward[category], region + 1), false, `${region} locked ${category}`);
      assert.equal(H.wardrobeOpen(category, reward[category], region + 2), true, `${region} cleared ${category}`);
    }
    assert.equal(H.suitUnlock.filter((i) => i === region).length, 1);
    assert.equal(H.hairUnlock.filter((i) => i === region).length, 1);
    assert.equal(H.gearUnlock.filter((i) => i === region).length, 1);
  }
  assert.equal(H.suitNames[H.wardrobeFor(3).suit], 'KIMONO');
  for (const hat of H.hats) assert.equal(H.wardrobeOpen('hat', hat[0], 1), true);
  for (const gear of H.gear.slice(0, 6)) assert.equal(H.wardrobeOpen('gear', gear[0], 1), true);
  for (const hair of H.styles.slice(0, 7)) assert.equal(H.wardrobeOpen('hair', hair, 1), true);
  for (const category of ['suit', 'hair', 'hat', 'gear', 'unknown']) assert.equal(H.wardrobeOpen(category, 'unknown', 11), false);
});

test('saved locked or invalid wardrobe falls back without changing old saves', () => {
  for (const body of ['m', 'f']) for (let region = 0; region < 10; region++) {
    const reward = H.wardrobeFor(region), original = { ...H.def[body], ...reward };
    const data = { unlocked: region + 1, look: original };
    const clean = A.lookOf(data);
    for (const key of ['suit', 'hair', 'gear']) assert.equal(clean[key], H.def[body][key]);
    assert.deepEqual(data.look, original);
    const open = A.lookOf({ ...data, unlocked: region + 2 });
    for (const key of ['suit', 'hair', 'gear']) assert.equal(open[key], reward[key]);
  }
  const old = { ...H.def.f, hair: 'braids', hat: 'sombrero', gear: 'serape' };
  assert.equal(JSON.stringify(A.lookOf({ unlocked: 1, look: old })), JSON.stringify(old));
  // the hijab moved from hairstyles to headwear; old saves migrate without losing it
  const veiled = A.lookOf({ unlocked: 1, look: { ...H.def.f, hair: 'hijab', hat: 'none' } });
  assert.equal(veiled.hat, 'hijab');
  assert.equal(veiled.hair, H.def.f.hair);
  assert.ok(!H.styles.includes('hijab'));
  assert.ok(H.hats.some((x) => x[0] === 'hijab'));
  assert.equal(A.lookOf({ hero: 'f' }).hair, 'long');
  assert.equal(A.lookOf({ look: { body: 'm', hair: 'bad', gear: 'bad', hat: 'bad', suit: 999 } }).hair, 'swoop');
});

test('Hero Lab rejects every locked category and randomizes only unlocked selections', () => {
  for (let region = 0; region < 10; region++) {
    const reward = H.wardrobeFor(region);
    for (const category of ['suit', 'hair', 'gear']) {
      const { lab: L, AH } = lab(region + 1);
      L.look[category] = reward[category];
      L.done(true);
      assert.equal(AH.Save.saved, undefined);
      assert.equal(L.destination, undefined);
      assert.equal(L.rows[L.sel].k, category);
    }
    const { lab: L, AH } = lab(region + 2);
    L.look = { ...L.look, ...reward };
    L.done(true);
    assert.equal(AH.Save.saved, true);
    assert.equal(L.destination, 'Select');
    for (let n = 0; n < 30; n++) { L.random(); assert.equal(H.lookOpen(L.look, region + 2), true); }
  }
  const { lab: L } = lab();
  L.look = { ...L.look, ...H.wardrobeFor(9) };
  L.done(false);
  assert.equal(L.destination, 'Title');
});

test('all regional garments, hairstyles and accessories render in every pose and HD', () => {
  const S = scene(), signatures = new Set();
  for (const body of ['m', 'f']) for (let region = 0; region < 10; region++) {
    const look = { ...H.def[body], ...H.wardrobeFor(region) };
    const prefix = A.buildHero(S, look);
    for (const frame of frames) {
      const canvas = S.textures.get(prefix + frame);
      assert.equal(canvas.width, 32 * A.D);
      assert.equal(canvas.height, 48 * A.D);
      assert.ok(canvas.ops.length > 100, 'pose has complete rig');
      const hd = S.textures.get(A.buildHeroHD(S, look, frame));
      assert.equal(hd.width, 32 * A.HD);
      assert.equal(hd.height, 48 * A.HD);
    }
    signatures.add(JSON.stringify(S.textures.get(prefix + 'idle').ops));
    for (const key of ['hair', 'gear']) {
      const plain = { ...look, [key]: H.def[look.body][key] };
      const p = A.buildHero(S, plain);
      for (const frame of frames) assert.notEqual(JSON.stringify(S.textures.get(prefix + frame).ops), JSON.stringify(S.textures.get(p + frame).ops), `${region} ${key} visible in ${frame}`);
    }
  }
  assert.equal(signatures.size, 20);
  assert.match(source, /H\.outfit === 'kimono'/);
  assert.match(source, /heroOutfit\(g, 'stand'\)/);
  assert.match(source, /heroOutfit\(g, 'fly'\)/);
});

test('regional outfit structures differ even without their palettes or accessories', () => {
  const S = scene(), geometry = new Set();
  for (let region = 0; region < 10; region++) {
    const look = { ...H.def.m, suit: H.wardrobeFor(region).suit };
    const p = A.buildHero(S, look);
    const commands = S.textures.get(p + 'idle').ops.filter((op) =>
      ['moveTo', 'lineTo', 'ellipse', 'fillRect', 'arc', 'roundRect'].includes(op[0]));
    geometry.add(JSON.stringify(commands));
  }
  assert.equal(geometry.size, 10, 'every outfit changes its garment structure');
});

test('wardrobe labels and reward messages fit the pixel-font charset', () => {
  const charset = /^[A-Z0-9 .!':/+,?-]+$/;
  const labels = [...H.suitNames, ...Object.values(H.hairNames), ...H.hats.flatMap((x) => x.slice(1, 3)), ...H.gear.flatMap((x) => x.slice(1, 3))];
  for (const label of labels) assert.match(label, charset);
  for (let i = 0; i < 10; i++) {
    const r = H.wardrobeFor(i);
    const line = 'HAIR: ' + H.hairNames[r.hair] + '  ACCESSORY: ' + H.gear.find((x) => x[0] === r.gear)[1];
    assert.match(line, charset);
    assert.ok(line.length * 6 <= 396, 'banner leaves room for hero preview');
  }
});

test('Gold Mode easter egg is a sandbox: 30 lives, gold suit, nothing saved or submitted', () => {
  const writes = [];
  const AH = {
    Levels: { ids: ['amsterdam'] }, Art: A, Audio: { play() {} },
    Save: { data: { unlocked: 1 }, save() { writes.push('save'); }, setResume() { writes.push('resume'); }, recordScore() { writes.push('score'); }, unlock() { writes.push('unlock'); } },
    Online: { available: true, profile: { name: 'X' }, submitScore() { writes.push('submit'); return Promise.resolve(null); } }
  };
  vm.runInNewContext(scenes, { window: { AH }, Phaser: { Scene: class {} } });
  const G = AH.Gold;
  let n = 0;
  for (const code of ['ArrowUp', 'ArrowUp', 'ArrowUp', ...G.codes.slice(2)]) n = G.step(n, code);
  assert.equal(n, G.codes.length);
  assert.equal(G.step(5, 'KeyX'), 0);
  assert.equal(G.armed, false);
  assert.equal(G.run(), false);
  assert.deepEqual(G.look({ suit: 3 }), { suit: 3 });

  G.armed = true;
  const Level = AH.Scenes[5].prototype;
  const fake = { levelId: 'amsterdam', L: { city: 'Amsterdam' }, time: { delayedCall(t, f) { f(); } }, notes: [], scoreNote(m) { this.notes.push(m); }, scene: { restart() {} } };
  AH.Run = { score: 900, lives: 30, startScore: 0, startLives: 30, gold: true };
  Level.postScore.call(fake);
  assert.deepEqual(writes, []);
  assert.match(fake.notes[0], /NOT SAVED OR SUBMITTED/);
  Level.restart.call(fake);
  assert.equal(AH.Run.lives, 30);
  assert.equal(AH.Run.gold, true);
  assert.equal(G.look({ suit: 3 }).suit, 'gold');
  // a gold suit can never be loaded from a save or picked in Hero Lab
  assert.equal(A.lookOf({ unlocked: 99, look: { ...H.def.m, suit: 'gold' } }).suit, H.def.m.suit);
  assert.ok(!H.suitNames.includes('GOLDEN HERO'));
  for (const frame of frames) assert.ok(A.buildHero(scene(), { ...H.def.f, suit: 'gold' }));

  AH.Run = { score: 900, lives: 3, startScore: 0, startLives: 3, gold: false };
  Level.postScore.call(fake);
  assert.deepEqual(writes, ['submit']);
});
