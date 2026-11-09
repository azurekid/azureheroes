'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { artScripts, levelScripts, loadScripts, recordingDocument } = require('./helpers/load-game');
const AH = loadScripts(artScripts(), { globals: { document: recordingDocument() } });
const A = AH.Art, H = A.hero;
const fresh = () => ({ unlocked: 12, wardrobe: { items: [], legacyUnlocked: 1, legacyClassic: false } });

test('new players collect regional items individually; clears alone no longer grant clothes', () => {
  for (let region = 0; region < 11; region++) {
    const data = fresh(), items = H.regionalItems(region);
    assert.ok(items.some(x => x.category === 'hat'), 'local headwear for every world');
    assert.ok(items.some(x => x.category === 'suit'));
    for (const item of items) {
      const baseHair = item.category === 'hair' && ['curls', 'coils', 'waves', 'boroughwaves'].includes(item.value);
      assert.equal(H.wardrobeOpen(item.category, item.value, data), baseHair, item.id);
      data.wardrobe.items.push(item.id);
      assert.equal(H.wardrobeOpen(item.category, item.value, data), true, item.id);
    }
    assert.equal(H.wardrobeOpen('hat', 'hijab', fresh()), true);
    assert.equal(H.wardrobeOpen('suit', H.hackerSuit, fresh()), true);
    assert.equal(H.wardrobeOpen('hair', 'afro', fresh()), true);
    assert.equal(H.wardrobeOpen('gear', 'none', fresh()), true);
  }
  assert.equal(H.wardrobeOpen('hat', 'nycap', {
    unlocked: 12, wardrobe: { items: [], legacyUnlocked: 12, legacyClassic: true }
  }), false, 'newly introduced hats still need collection on old completed saves');
});

test('legacy wardrobe migration freezes former entitlements and collected items survive reloads', () => {
  let stored = JSON.stringify({ unlocked: 3, look: { ...H.def.m, suit: 5, hat: 'sombrero' } }), writes = 0;
  const game = loadScripts(['systems/save.js'], { AH: { Art: A, WorldOrder: AH.WorldOrder, Worlds: AH.Worlds,
    Gold: { run: () => false } }, globals: { localStorage: {
    getItem: () => stored, setItem(key, value) { stored = value; writes++; }
  } } });
  const S = game.Save; S.load();
  assert.equal(S.data.wardrobe.legacyUnlocked, 3);
  for (const hat of H.hats.slice(0, -1)) assert.equal(H.wardrobeOpen('hat', hat[0], S.data), !['cowboy', 'cork'].includes(hat[0]));
  const paris = H.regionalItems(2), outfit = paris.find(x => x.category === 'suit');
  S.unlock(12);
  assert.equal(H.wardrobeOpen('suit', outfit.value, S.data), false, 'later clear cannot grant new clothes');
  assert.equal(S.collectWardrobe(outfit.id), true);
  assert.equal(S.collectWardrobe(outfit.id), false);
  assert.throws(() => S.collectWardrobe('hat:admin'), /UNKNOWN WARDROBE/);
  S.load(); assert.equal(H.wardrobeOpen('suit', outfit.value, S.data), true);
  game.Gold.run = () => true;
  const before = stored, count = writes;
  assert.equal(S.collectWardrobe(paris.find(x => x.category === 'hair').id), false);
  assert.equal(writes, count); assert.equal(stored, before);
  stored = null; S.load();
  assert.equal(S.data.wardrobe.legacyClassic, false, 'new save does not receive historical free items');
  assert.equal(H.wardrobeOpen('hat', 'sombrero', S.data), false);
  assert.equal(H.wardrobeOpen('hat', 'hijab', S.data), true);
  S.mergeWardrobe({});
  assert.equal(S.data.wardrobe.legacyClassic, false, 'empty remote profiles do not grant legacy clothes');
});

test('textured hairstyles are base choices and three named hats require actual collection, including legacy saves', () => {
  for (const progress of [1, 12, { unlocked: 12 }, { unlocked: 12, wardrobe: { items: [], legacyUnlocked: 12, legacyClassic: true } }]) {
    for (const hair of ['afro', 'braids', 'curls', 'coils', 'waves', 'boroughwaves']) {
      assert.equal(H.wardrobeOpen('hair', hair, progress), true, hair);
      assert.equal(H.hairUnlock[H.styles.indexOf(hair)], -1, hair);
    }
    assert.equal(H.wardrobeOpen('hat', 'hijab', progress), true);
    for (const hat of ['nycap', 'cork', 'cowboy']) assert.equal(H.wardrobeOpen('hat', hat, progress), false, hat);
  }
  for (const [hat, regions] of [['nycap', [10]], ['cork', [4]], ['cowboy', [8, 9, 10]]]) {
    assert.deepEqual(Array.from(H.wardrobeRegions('hat', hat)), regions);
    for (const region of regions) assert.ok(H.regionalItems(region).some(item => item.id === 'hat:' + hat));
    const progress = { unlocked: 1, wardrobe: { items: ['hat:' + hat] } };
    assert.equal(H.wardrobeOpen('hat', hat, progress), true);
    assert.equal(AH.Art.lookOf({ ...progress, look: { ...H.def.m, hat } }).hat, hat);
  }
});

test('all generated worlds have three guaranteed carriers, safe drops and reachable wardrobe stashes', () => {
  for (const seed of [1, 7, 42, 2027, 8675309]) {
    const Levels = loadScripts(levelScripts(), { seed }).Levels;
    for (const id of Levels.ids) {
      const L = Levels.make(id), carriers = L.enemies.filter(e => e.bossToken);
      assert.equal(carriers.length, 3);
      assert.equal(new Set(carriers.map(e => e.bossToken.id)).size, 3);
      assert.equal(L.mission.tokenQuota, 3);
      assert.equal(L.wardrobeSpots.length, 6);
      assert.ok(H.regionalItems(id - 1).length <= L.wardrobeSpots.length);
      for (const e of carriers) {
        const t = e.bossToken;
        assert.ok(t.x > 320 && t.x < L.boss.left && t.y >= (L.skyRoute ? L.skyRoute.top + 48 : 48) && t.y <= 316);
        assert.ok(L.mission.tokens.includes(t));
        if (L.mode === 'run') assert.ok(L.platforms.some(p => p.x <= t.x - 20 && p.x + p.w >= t.x + 20 && p.y === t.y + 24));
        assert.ok(!L.platforms.some(p => t.x + 14 > p.x && t.x - 14 < p.x + p.w && t.y + 14 > p.y && t.y - 14 < p.y + p.h));
        assert.ok(![...(L.obstacles || []), ...(L.lasers || []), ...(L.gates || [])].some(p =>
          t.x + 14 > p.x && t.x - 14 < p.x + p.w && t.y + 14 > p.y && t.y - 14 < p.y + p.h), 'safe token anchor in world ' + id);
      }
      for (const spot of L.wardrobeSpots) {
        if (L.pipeZones?.length || L.bonus) assert.ok(spot.zone !== undefined || spot.bonus, 'use existing sub-levels when available');
        const floor = spot.bonus ? [L.bonus.floor, ...L.bonus.clouds] : L.platforms;
        assert.ok(!floor.some(p => spot.x + 12 > p.x && spot.x - 12 < p.x + p.w && spot.y + 12 > p.y && spot.y - 12 < p.y + p.h));
      }
    }
  }
});

test('three tokens are collected only after defeat and gate boss access alongside missions/gems', () => {
  const G = loadScripts(['systems/mission.js'], { AH: { Audio: { play() {} } } });
  const L = { mode: 'fly', mission: { objectives: [], gems: [], gemQuota: 0, tokenQuota: 3,
    tokens: [1, 2, 3].map(i => ({ id: 'token' + i, x: i * 500, y: 180 })) } };
  const m = new G.Mission(L), notices = [], scene = { toast: text => notices.push(text) };
  const p = { health: 100, body: { x: 493, y: 160, width: 14, height: 40 } };
  m.update(0.1, p, scene); assert.equal(m.tokenCount, 0);
  assert.equal(m.scrollLimit(2000), 150, 'flight cannot skip first carrier/drop');
  for (let i = 1; i <= 3; i++) {
    assert.equal(m.releaseToken('token' + i, scene), true);
    assert.equal(m.releaseToken('token' + i, scene), false);
    p.body.x = i * 500 - 7;
    scene.inBonus = true; m.update(0.1, p, scene); assert.equal(m.tokenCount, i - 1);
    scene.inBonus = false; m.update(0.1, p, scene); assert.equal(m.tokenCount, i);
    assert.equal(m.ready, i === 3);
  }
  m.update(0.1, p, scene); assert.equal(m.tokenCount, 3);
  assert.equal(m.releaseToken('token3', scene), false);
  assert.equal(m.scrollLimit(2000), 2000);
  assert.equal(new G.Mission(L).tokenCount, 0, 'new run resets tokens');
  assert.equal(m.snapshot().tokens, 3);
});

test('civilian checkpoint guides use local garments and hats without capes or ownership gates', () => {
  const textures = new Map(), scene = { textures: { exists: key => textures.has(key), addCanvas: (key, canvas) => textures.set(key, canvas) } };
  const signatures = new Set();
  AH.WorldOrder.forEach((slug, i) => {
    const key = A.buildGuide(scene, AH.Worlds[slug].world.region, 0), canvas = textures.get(key);
    assert.deepEqual([canvas.width, canvas.height], [32 * A.D, 48 * A.D]);
    signatures.add(JSON.stringify(canvas.ops));
    assert.ok(canvas.ops.length > 200);
    const cape = canvas.ops.some((op, n) => op[0] === 'moveTo' && op[1] === 12 && op[2] === 14 &&
      canvas.ops[n + 1]?.[0] === 'lineTo' && canvas.ops[n + 1][1] === 20 && canvas.ops[n + 1][2] === 15);
    assert.equal(cape, false, slug + ' is a civilian');
    assert.equal(A.buildGuide(scene, AH.Worlds[slug].world.region, 0), key);
  });
  assert.equal(signatures.size, 11);
});

test('wardrobe pickups use actual collision and matching room, persist once, and never write from sandbox', () => {
  const items = H.regionalItems(0), progress = fresh(), writes = [], notices = [];
  function display() { return { setDepth() { return this; }, setVisible() { return this; } }; }
  const G = loadScripts(['systems/wardrobe-pickups.js'], { AH: { Art: A, Levels: { ids: [1] },
    Gold: { run: () => false }, Save: { data: progress, collectWardrobe(id) { writes.push(id); return true; } },
    Audio: { play() {} }, PixelText: function () { return display(); } } });
  const scene = { levelId: 1, state: 'play', add: { image: display }, tweens: { add() {} }, toast: text => notices.push(text),
    L: { pipeZones: [{}], wardrobeSpots: items.map((item, i) => ({ x: 100 + i * 100, y: 180, zone: 0 })) } };
  const pickup = new G.WardrobePickups(scene), player = { health: 100, body: { x: 93, y: 160, width: 14, height: 40 } };
  pickup.update(player); assert.equal(writes.length, 0);
  scene.inPipe = scene.L.pipeZones[0]; pickup.update(player); pickup.update(player);
  assert.deepEqual(writes, [items[0].id]);
  G.Gold.run = () => true; player.body.x = 193; pickup.update(player);
  assert.equal(writes.length, 1); assert.match(notices.at(-1), /SANDBOX/);
});

test('online collection sync unions cosmetics and cannot push during Hacker sandbox', async () => {
  const progress = fresh(), requests = [], timers = [];
  progress.wardrobe.items.push('hat:crown');
  const game = loadScripts(['systems/save.js', 'systems/online.js'], {
    AH: { Gold: { run: () => false } }, globals: {
      localStorage: { setItem() {} }, clearTimeout() {}, setTimeout(fn) { timers.push(fn); return timers.length; },
      fetch(url, options) { requests.push({ url, options }); return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); }
    }
  });
  game.Save.data = progress;
  game.Online.available = true; game.Online.token = 'test-fixture-token';
  game.Online.adopt({ best: 0, progress: { unlocked: 12, wardrobe: { items: ['gear:tulip'], legacyUnlocked: 1, legacyClassic: false } } });
  await Promise.resolve();
  assert.deepEqual(Array.from(game.Save.data.wardrobe.items), ['hat:crown', 'gear:tulip']);
  assert.equal(game.Save.data.wardrobe.legacyUnlocked, 1);
  assert.ok(requests.some(r => JSON.parse(r.options.body).wardrobe.items.includes('gear:tulip')));
  const count = requests.length;
  game.Gold.run = () => true;
  game.Online.pushNow(); game.Online.pushProgress();
  assert.equal(requests.length, count);
});
