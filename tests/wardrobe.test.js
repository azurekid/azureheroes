'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { artScripts, levelScripts, loadScripts, recordingDocument } = require('./helpers/load-game');

const scenes = fs.readFileSync(path.join(__dirname, '../systems/scenes.js'), 'utf8');
const regionCount = loadScripts(levelScripts()).Levels.ids.length;
const frames = ['idle', 'run0', 'run1', 'run2', 'run3', 'jump', 'fly', 'duck', 'slide', 'shield', 'attack', 'punch', 'kick'];

function art() {
  return loadScripts(artScripts(), { globals: { document: recordingDocument() } }).Art;
}
const A = art(), H = A.hero;
function scene() {
  const textures = new Map(), anims = new Set();
  return {
    textures: { exists: (key) => textures.has(key), addCanvas: (key, c) => textures.set(key, c), get: (key) => textures.get(key) },
    anims: { exists: (key) => anims.has(key), create: ({ key }) => anims.add(key) }
  };
}
function hasPath(canvas, points) {
  return canvas.ops.some((op, i) => points.every(([x, y], j) => {
    const p = canvas.ops[i + j];
    return p && p[0] === (j ? 'lineTo' : 'moveTo') && p[1] === x && p[2] === y;
  }));
}
function hasCape(canvas, frame) {
  return hasPath(canvas, frame === 'fly'
    ? [[14, 18], [2, 14], [0.8, 20]]
    : [[12, 14], [20, 15], [19.5, 24]]);
}
const hackerHoodPath = [[11, 4.7], [12.4, 2.4], [16, 1.4]];
const hackerLogo = [
  [[18.2, 18.2], [19.4, 19.3]],
  [[19.4, 19.3], [18.2, 20.4]],
  [[20, 20.4], [21, 20.4]]
];
function hasRoundedRect(canvas, x, y, w, h, r, color) {
  return canvas.ops.some((op, i) => op[0] === 'moveTo' && op[1] === x + r && op[2] === y &&
    canvas.ops[i + 1]?.[0] === 'arcTo' && canvas.ops[i + 1][1] === x + w &&
    canvas.ops[i + 1][2] === y && canvas.ops[i + 1][4] === y + h &&
    canvas.ops[i + 6]?.[0] === 'fillStyle' && canvas.ops[i + 6][1] === color);
}
function hackerHoodOps(canvas) {
  const start = canvas.ops.findIndex((op) =>
    op[0] === 'ellipse' && op[1] === 17 && op[2] === 7.8 && op[3] === 7.7 && op[4] === 7.6);
  const end = canvas.ops.findIndex((op, i) =>
    i > start && op[0] === 'moveTo' && op[1] === 13.8 && op[2] === 7.2);
  assert.ok(start >= 4 && end > start, 'hood and visor are present');
  return JSON.stringify(canvas.ops.slice(start - 4, end + 5));
}
function hackerTerminalOps(canvas) {
  const start = canvas.ops.findIndex((op) => op[0] === 'moveTo' && op[1] === 2.2 && op[2] === 14.8);
  const end = canvas.ops.findIndex((op, i) =>
    i > start && op[0] === 'ellipse' && op[1] === 1.3 && op[2] === 17 && op[3] === 0.8);
  assert.ok(start >= 1 && end > start, 'portable terminal is present');
  return JSON.stringify(canvas.ops.slice(start - 1, end + 3));
}
const hasPupil = (canvas, x, radius) => canvas.ops.some((op) =>
  op[0] === 'ellipse' && op[1] === x && op[2] === 8.4 && op[3] === radius);
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

const baseHair = new Set(['afro', 'braids', 'curls', 'coils', 'waves', 'boroughwaves']);
test('legacy regional thresholds preserve outfits and accessories while textured hair stays open', () => {
  assert.equal(H.suits.length, regionCount + 8);
  assert.equal(H.styles.length, regionCount + 7);
  assert.equal(H.gear.length, regionCount + 6);
  for (let region = 0; region < regionCount; region++) {
    const reward = H.wardrobeFor(region);
    for (const category of ['suit', 'hair', 'gear']) {
      assert.equal(H.wardrobeOpen(category, reward[category], region + 1), category === 'hair' && baseHair.has(reward.hair), `${region} locked ${category}`);
      assert.equal(H.wardrobeOpen(category, reward[category], region + 2), true, `${region} cleared ${category}`);
    }
    assert.equal(H.suitUnlock.filter((i) => i === region).length, 1);
    assert.equal(H.hairUnlock.filter((i) => i === region).length, baseHair.has(reward.hair) ? 0 : 1);
    assert.ok(H.gearUnlock.filter((i) => i === region).length >= 1);
  }
  assert.equal(H.suitNames[H.wardrobeFor(3).suit], 'KIMONO');
  for (const hat of H.hats.slice(0, -1)) assert.equal(H.wardrobeOpen('hat', hat[0], 1), !['cowboy', 'cork'].includes(hat[0]));
  for (const gear of H.gear.slice(0, 6)) assert.equal(H.wardrobeOpen('gear', gear[0], 1), true);
  for (const hair of H.styles.slice(0, 7)) assert.equal(H.wardrobeOpen('hair', hair, 1), true);
  for (const category of ['suit', 'hair', 'hat', 'gear', 'unknown']) assert.equal(H.wardrobeOpen(category, 'unknown', 11), false);
});

test('saved locked or invalid wardrobe falls back without changing old saves', () => {
  for (const body of ['m', 'f']) for (let region = 0; region < regionCount; region++) {
    const reward = H.wardrobeFor(region), original = { ...H.def[body], ...reward };
    const data = { unlocked: region + 1, look: original };
    const clean = A.lookOf(data);
    for (const key of ['suit', 'hair', 'gear']) assert.equal(clean[key], key === 'hair' && baseHair.has(reward.hair) ? reward.hair : H.def[body][key]);
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

test('Cloud Hacker is appended, open, and leaves existing saved suit indexes intact', () => {
  const previous = ['AZURE', 'ROSE', 'VIOLET', 'TEAL', 'SUNSET', 'CANAL JACKET', 'FORMAL COAT', 'BRETON TOP',
    'KIMONO', 'REEF VEST', 'GONDOLIER', 'RIO TRACKSUIT', 'CHARRO JACKET', 'CAMPUS HOODIE', 'TRAIL COAT',
    'COWBOY', 'INDIA KURTA'];
  assert.deepEqual([...H.suitNames.slice(0, 17)], previous);
  assert.equal(H.suitNames[17], 'CLOUD HACKER');
  assert.equal(H.wardrobeOpen('suit', 17, 1), true);
  const suitColor = H.suits[17].match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  assert.ok(suitColor, 'the hoodie has an explicit RGB color');
  const channels = suitColor.slice(1).map((hex) => parseInt(hex, 16));
  assert.ok(Math.max(...channels) <= 32, 'the hoodie base is near-black');
  for (const body of ['m', 'f']) {
    for (let suit = 0; suit <= 17; suit++) {
      const look = { ...H.def[body], suit };
      assert.equal(A.lookOf({ unlocked: 11, look }).suit, suit);
    }
    const look = { ...H.def[body], suit: 17, hair: 'afro', hat: 'none' };
    assert.equal(JSON.stringify(A.lookOf({ unlocked: 1, look })), JSON.stringify(look));
  }
  const { lab: L, AH } = lab();
  L.look.suit = 17;
  L.done(true);
  assert.equal(AH.Save.saved, true, 'the new style can be saved before any region is cleared');
});

test('Cloud Hacker renders every pose and explicit headwear replaces its built-in hood', () => {
  const S = scene();
  const rogue = A.textureCanvas('hacker_0');
  const enemyHood = hackerHoodOps(rogue), enemyTerminal = hackerTerminalOps(rogue);
  for (const body of ['m', 'f']) for (const hair of ['swoop', 'afro', 'long', 'pony', 'braids']) for (const hat of ['none', 'bowler', 'cap', 'hijab', 'hachimaki']) {
    const look = { ...H.def[body], suit: 17, hair, hat };
    const prefix = A.buildHero(S, look);
    for (const frame of frames) {
      const normal = S.textures.get(prefix + frame);
      const hd = S.textures.get(A.buildHeroHD(S, look, frame));
      for (const [canvas, density] of [[normal, A.D], [hd, A.HD]]) {
        assert.equal(canvas.width, 32 * density);
        assert.equal(canvas.height, 48 * density);
        const label = `${body} ${hair} ${hat} ${frame}`;
        assert.equal(hasCape(canvas, frame), false, `${label} has no cape`);
        assert.ok(hasRoundedRect(canvas, 12, 4.7, 10.2, 8, 3, '#1a101e'), `${label} keeps the dark face`);
        assert.ok(hasRoundedRect(canvas, 13.2, 6.7, 7.8, 2.6, 0.8, '#d63c5c'), `${label} keeps the red visor`);
        for (const [x, radius] of [[16.6, 0.55], [20.6, 0.45]]) {
          assert.equal(hasPupil(canvas, x, radius), false, `${label} keeps the visor opaque`);
        }
        for (const stroke of hackerLogo) assert.ok(hasPath(canvas, stroke), `${label} keeps the chest logo`);
        assert.equal(hackerTerminalOps(canvas), enemyTerminal, `${label} carries the enemy-style terminal`);
        assert.ok(hasPath(canvas, [[16.2, 15], [16.2, 30]]), `${label} keeps the jacket zip`);
        const torso = canvas.ops.findIndex((op, i) => op[0] === 'moveTo' && op[1] === 9 && op[2] === 15 &&
          canvas.ops[i + 1]?.[0] === 'lineTo' && canvas.ops[i + 1][1] === 12 && canvas.ops[i + 1][2] === 14);
        assert.ok(torso >= 0 && canvas.ops[torso + 5][0] === 'lineTo' && canvas.ops[torso + 5][1] === 23 &&
          canvas.ops[torso + 5][2] >= 31, `${label} covers the base belt with the hoodie`);
        assert.equal(hasPath(canvas, hackerHoodPath), hat === 'none', `${label} uses the correct headwear`);
        if (hat === 'none') assert.equal(hackerHoodOps(canvas), enemyHood, `${label} matches the enemy hood`);
        const scarfWrap = canvas.ops.some((op) => op[0] === 'moveTo' && op[1] === 12.2 && op[2] === 11);
        assert.equal(scarfWrap, hat === 'hijab', `${label} keeps the hijab wrap separate from the hood`);
      }
    }
  }
});

test('the built-in hacker hood hides hair without changing saved hairstyles', () => {
  const S = scene();
  const styles = [['swoop', 0], ['afro', 1], ['long', 2], ['pony', 3], ['braids', 4], ['tidybun', 5]];
  for (const body of ['m', 'f']) for (const frame of frames) {
    let normalReference, hdReference;
    for (const [hair, hairCol] of styles) {
      const look = { ...H.def[body], suit: 17, hat: 'none', hair, hairCol };
      assert.equal(JSON.stringify(A.lookOf({ unlocked: 11, look })), JSON.stringify(look));
      const prefix = A.buildHero(S, look);
      const normal = JSON.stringify(S.textures.get(prefix + frame).ops);
      const hd = JSON.stringify(S.textures.get(A.buildHeroHD(S, look, frame)).ops);
      if (normalReference === undefined) { normalReference = normal; hdReference = hd; }
      assert.equal(normal, normalReference, `${body} ${hair} ${frame} hides hair in gameplay`);
      assert.equal(hd, hdReference, `${body} ${hair} ${frame} hides hair in HD`);
    }
    const withHat = { ...H.def[body], suit: 17, hat: 'bowler', hair: 'long' };
    const light = A.buildHeroHD(S, { ...withHat, hairCol: 0 }, frame);
    const dark = A.buildHeroHD(S, { ...withHat, hairCol: 3 }, frame);
    assert.notEqual(JSON.stringify(S.textures.get(light).ops), JSON.stringify(S.textures.get(dark).ops),
      `${body} ${frame} retains hair colour when the hood is replaced`);
  }
});

test('other hero outfits retain their capes and visible eyes', () => {
  const S = scene();
  for (const body of ['m', 'f']) for (const suit of [H.def[body].suit, 5, 'gold']) {
    const look = { ...H.def[body], suit };
    const prefix = A.buildHero(S, look);
    for (const frame of frames) {
      const normal = S.textures.get(prefix + frame);
      const hd = S.textures.get(A.buildHeroHD(S, look, frame));
      for (const canvas of [normal, hd]) {
        assert.ok(hasCape(canvas, frame), `${body} ${suit} ${frame} keeps its cape`);
        assert.equal(hasRoundedRect(canvas, 12, 4.7, 10.2, 8, 3, '#1a101e'), false,
          `${body} ${suit} ${frame} has no hacker face`);
      }
      for (const [x, radius] of [[16.6, 0.55], [20.6, 0.45]]) {
        assert.ok(hasPupil(hd, x, radius), `${body} ${suit} ${frame} keeps its HD eyes`);
      }
    }
  }
});

test('bowler crown reaches its brim and covers hair in every hero pose', () => {
  const S = scene();
  for (const body of ['m', 'f']) for (const hair of ['swoop', 'buzz', 'afro', 'long', 'pony', 'tidybun']) {
    const look = { ...H.def[body], hair, hat: 'bowler' };
    const prefix = A.buildHero(S, look);
    for (const frame of frames) {
      const normal = S.textures.get(prefix + frame);
      const hd = S.textures.get(A.buildHeroHD(S, look, frame));
      for (const canvas of [normal, hd]) {
        assert.ok(canvas.ops.some((op) => op[0] === 'rect' && op[1] === -40 && op[2] === 5.8),
          `${body} ${hair} ${frame} clips hair at the brim`);
        const clip = canvas.ops.find((op) => op[0] === 'rect' && op[1] === 0 && op[2] === -2 && op[3] === 32);
        assert.ok(clip && clip[2] + clip[4] >= 5.8, `${body} ${hair} ${frame} crown reaches the brim`);
      }
    }
  }
});

test('Hero Lab rejects every locked category and randomizes only unlocked selections', () => {
  for (let region = 0; region < regionCount; region++) {
    const reward = H.wardrobeFor(region);
    for (const category of ['suit', 'hair', 'gear']) {
      if (category === 'hair' && baseHair.has(reward.hair)) continue;
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
  for (const body of ['m', 'f']) for (let region = 0; region < regionCount; region++) {
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
  assert.equal(signatures.size, regionCount * 2);
  assert.equal(H.suitNames[H.wardrobeFor(3).suit], 'KIMONO', 'Tokyo retains its structured garment');
});

test('regional outfit structures differ even without their palettes or accessories', () => {
  const S = scene(), geometry = new Set();
  for (let region = 0; region < regionCount; region++) {
    const look = { ...H.def.m, suit: H.wardrobeFor(region).suit };
    const p = A.buildHero(S, look);
    const commands = S.textures.get(p + 'idle').ops.filter((op) =>
      ['moveTo', 'lineTo', 'ellipse', 'fillRect', 'arc', 'roundRect'].includes(op[0]));
    geometry.add(JSON.stringify(commands));
  }
  assert.equal(geometry.size, regionCount, 'every outfit changes its garment structure');
});

test('wardrobe labels and reward messages fit the pixel-font charset', () => {
  const charset = /^[A-Z0-9 .!':/+,?-]+$/;
  const labels = [...H.suitNames, ...Object.values(H.hairNames), ...H.hats.flatMap((x) => x.slice(1, 3)), ...H.gear.flatMap((x) => x.slice(1, 3))];
  for (const label of labels) assert.match(label, charset);
  for (let i = 0; i < regionCount; i++) {
    const r = H.wardrobeFor(i);
    const line = 'HAIR: ' + H.hairNames[r.hair] + '  ACCESSORY: ' + H.gear.find((x) => x[0] === r.gear)[1];
    assert.match(line, charset);
    assert.ok(line.length * 6 <= 396, 'banner leaves room for hero preview');
  }
});

test('Gold Mode opens all map worlds for sandbox deployment without changing saved progression', () => {
  const starts = [], calls = [];
  function display() {
    const object = { width: 60 };
    for (const method of ['setOrigin', 'setDepth', 'setScale', 'setInteractive', 'on', 'setVisible',
      'fillStyle', 'fillRect', 'lineStyle', 'lineBetween', 'strokeRect', 'setText', 'setColor',
      'setCrop', 'setTintFill', 'setPosition', 'clear', 'fillTriangle', 'destroy']) {
      object[method] = () => object;
    }
    return object;
  }
  const AH = loadScripts(levelScripts());
  AH.Art = { D: 1, MAP: { proj: () => [100, 100] } };
  AH.Audio = { music() {}, play() {}, init() {} };
  AH.PixelText = function () { return display(); };
  AH.UI = { soundButton() {}, musicButton() {}, button: display, pad: String };
  AH.Online = { available: false };
  AH.Save = { data: { unlocked: 1, bests: {}, resume: null },
    worldOpen: id => id === 1, worldCleared: () => false, route: () => ({ start: 1 }),
    unlock() { calls.push('unlock'); }, save() { calls.push('save'); }, setResume() { calls.push('resume'); } };
  vm.runInNewContext(scenes, { window: { AH }, Phaser: { Scene: class {} } });
  const saved = JSON.stringify(AH.Save.data);
  function map() {
    const selection = new AH.Scenes[3]();
    selection.add = Object.fromEntries(['rectangle', 'image', 'zone', 'graphics'].map((key) => [key, display]));
    selection.input = { keyboard: { on() {} } };
    selection.textures = { exists: () => false };
    selection.cameras = { main: { shake() {} } };
    selection.scene = { start(key, data) { starts.push({ key, data }); } };
    selection.create();
    return selection;
  }
  const normal = map();
  assert.equal(normal.pins.filter((pin) => !pin.locked).length, 1);
  normal.select(regionCount - 1, true);
  normal.deploy();
  assert.equal(starts.length, 0);

  AH.Gold.armed = true;
  const gold = map();
  for (let i = 0; i < regionCount; i++) {
    assert.equal(gold.pins[i].locked, false);
    assert.equal(gold.pins[i].done, false, 'access is not a recorded clear');
    gold.select(i, true);
    gold.deploy();
    assert.equal(starts.at(-1).data.id, AH.Levels.ids[i]);
    assert.equal(AH.Run.gold, true);
    assert.equal(AH.Run.lives, 30);
  }
  assert.equal(JSON.stringify(AH.Save.data), saved);
  assert.deepEqual(calls, []);
  AH.Gold.armed = false;
  assert.equal(map().pins.filter((pin) => !pin.locked).length, 1);
});

test('Hacker Mode easter egg is a sandbox: 30 lives, hacker outfit, no run progress saved or submitted', () => {
  const writes = [];
  const AH = {
    Levels: { ids: ['amsterdam'] }, Art: A, Audio: { play() {} },
    Save: { data: { unlocked: 1 }, save() { writes.push('save'); }, setResume() { writes.push('resume'); }, recordScore() { writes.push('score'); }, unlock() { writes.push('unlock'); } },
    Online: { available: true, profile: { name: 'X' }, submitScore() { writes.push('submit'); return Promise.resolve(null); } }
  };
  vm.runInNewContext(scenes, { window: { AH }, Phaser: { Scene: class {} } });
  const G = AH.Gold;
  for (let i = 0; i < 9; i++) assert.equal(G.tap(i * 200), false);
  assert.equal(G.armed, false, 'nine logo taps cannot activate the sandbox');
  assert.equal(G.tap(1800), true);
  assert.deepEqual(writes, [], 'tap recognition cannot persist anything');
  G.reset();
  for (let i = 0; i < 9; i++) G.tap(i * 200);
  assert.equal(G.tap(2201), false, 'a gap over 400ms resets the sequence');
  assert.equal(G.taps, 1);
  G.reset();
  for (let i = 0; i < 9; i++) G.tap(i * 400);
  assert.equal(G.tap(3600), false, 'the sequence must finish within 3.5 seconds');
  G.reset();
  for (let i = 0; i < 9; i++) G.tap(i * 200);
  G.reset();
  assert.equal(G.tap(1800), false, 'title reentry clears partial taps');
  G.armed = true;
  assert.equal(G.tap(1900), false, 'already armed mode cannot trigger again');
  G.armed = false;
  G.reset();
  const feed = (event) => JSON.parse(JSON.stringify(G.feed(event)));
  for (const code of G.codes.slice(0, -1)) assert.deepEqual(feed({ code }), { active: true, complete: false });
  assert.deepEqual(feed({ code: 'Unidentified', key: 'a' }), { active: true, complete: true });
  assert.equal(G.position, 0);
  G.reset();
  assert.deepEqual(feed({ code: 'ArrowUp', repeat: true }), { active: false, complete: false });
  assert.deepEqual(feed({ code: 'ArrowUp' }), { active: true, complete: false });
  assert.deepEqual(feed({ code: 'KeyX' }), { active: true, complete: false });
  assert.equal(G.position, 0);
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
  assert.equal(G.look({ suit: 3, hat: 'crown' }).suit, H.hackerSuit);
  assert.equal(G.look({ suit: 3, hat: 'crown' }).hat, 'none');
  // a gold suit can never be loaded from a save or picked in Hero Lab
  assert.equal(A.lookOf({ unlocked: 99, look: { ...H.def.m, suit: 'gold' } }).suit, H.def.m.suit);
  assert.ok(!H.suitNames.includes('GOLDEN HERO'));
  for (const frame of frames) assert.ok(A.buildHero(scene(), { ...H.def.f, suit: 'gold' }));

  AH.Run = { score: 900, lives: 3, startScore: 0, startLives: 3, gold: false };
  Level.postScore.call(fake);
  assert.deepEqual(writes, ['submit']);
});
