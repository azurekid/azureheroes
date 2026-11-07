'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { localScripts, levelScripts, artScripts, loadScripts, recordingDocument } = require('./helpers/load-game');
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// Numerical collision trajectories with the player's unboosted jump, not a live Arcade playtest.
function canLand(from, to, solids) {
  const launches = [45, 50, 55, 60].flatMap(d => [to.x - d, to.x + to.w + d])
    .concat([from.x + 30, from.x + from.w - 30]);
  for (const launch of launches) {
    if (launch < from.x + 7 || launch > from.x + from.w - 7) continue;
    const target = to.x + to.w / 2, direction = Math.sign(target - launch);
    let previous = from.y, blocked = false;
    for (let t = 1 / 240; t < 1; t += 1 / 240) {
      const feet = from.y - 440 * t + 550 * t * t;
      const x = launch + direction * Math.min(190 * t, Math.abs(target - launch));
      const body = { x: x - 7, y: feet - 40, w: 14, h: 40 };
      if (-440 + 1100 * t > 0 && previous <= to.y && feet >= to.y &&
        body.x < to.x + to.w && body.x + body.w > to.x && !blocked) return true;
      if (solids.some(p => p !== from && overlap(body, p))) { blocked = true; break; }
      previous = feet;
    }
  }
  return false;
}

function canWalkDown(from, to, solids) {
  for (const dir of [-1, 1]) for (const travel of [24, Infinity]) {
    const start = dir < 0 ? from.x + 7 : from.x + from.w - 7;
    let previous = from.y;
    for (let t = 1 / 240; t < 1; t += 1 / 240) {
      const x = start + dir * Math.min(190 * t, travel);
      const fallingTime = Math.max(0, t - 14 / 190);
      const feet = from.y + 550 * fallingTime * fallingTime;
      const body = { x: x - 7, y: feet - 40, w: 14, h: 40 };
      if (previous <= to.y && feet >= to.y && body.x < to.x + to.w && body.x + body.w > to.x) return true;
      if (solids.some(p => p !== from && overlap(body, p))) break;
      previous = feet;
    }
  }
  return false;
}

test('six/seven-jump cloud routes have supported summit tokens and numerical ascent/return clearance', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const AH = loadScripts(levelScripts(), { seed });
    for (const id of [1, 2, 11]) {
      const L = AH.Levels.make(id), route = L.platforms.filter(p => p.skyStep);
      assert.equal(route.length, L.skyRoute.steps);
      assert.ok([6, 7].includes(route.length));
      assert.ok(route.at(-1).y < 0);
      const first = route[0];
      const base = L.platforms.find(p => !p.float && p.x <= first.x && p.x + p.w >= first.x &&
        p.y - first.y >= 62 && p.y - first.y <= 74);
      assert.ok(base, `grounded start in world ${id}, seed ${seed}`);
      for (let i = 0; i < route.length; i++) {
        const from = i ? route[i - 1] : base, to = route[i];
        assert.ok(canLand(from, to, L.platforms), `up step ${i + 1}, world ${id}, seed ${seed}`);
        assert.ok(canWalkDown(to, from, L.platforms) || canLand(to, from, L.platforms),
          `return step ${i + 1}, world ${id}, seed ${seed}`);
      }
      const carrier = L.enemies.find(e => e.skyCarrier), summit = route.at(-1);
      assert.ok(summit.skySummit);
      assert.equal(carrier.y, summit.y);
      assert.ok(L.mission.tokens.includes(carrier.bossToken));
      assert.equal(L.mission.tokenQuota, 3);
      assert.equal(L.enemies.filter(e => e.bossToken).length, 3);
      assert.ok(L.mfaTokens.some(t => t.y === summit.y - 24 && Math.abs(t.x - carrier.x) > 70));
      assert.ok(summit.y - 40 >= L.skyRoute.top && L.skyRoute.top >= -400);
    }
  }
});

test('four varied main-route weapons remain safe and distributed across all worlds', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const AH = loadScripts(levelScripts(), { seed });
    for (const id of AH.Levels.ids) {
      const L = AH.Levels.make(id), end = L.boss.left - 180;
      assert.deepEqual(Array.from(L.weaponDrops, p => p.kind), ['spread', 'pierce', 'spread', 'pierce']);
      assert.ok(Math.min(...L.weaponDrops.map(p => p.x)) < end * 0.32);
      assert.ok(Math.max(...L.weaponDrops.map(p => p.x)) > end * 0.6);
      for (const drop of L.weaponDrops) {
        assert.ok(drop.x >= 320 && drop.x < end);
        const box = { x: drop.x - 12, y: drop.y - 12, w: 24, h: 24 };
        assert.ok(![...L.platforms, ...(L.obstacles || []), ...(L.lasers || []),
          ...(L.gates || []), ...(L.cables || []).map(c => ({ x: c.x, y: c.y - 12, w: c.w, h: 12 }))]
          .some(p => overlap(box, p)));
        assert.ok([...L.mission.objectives, ...L.mission.gems, ...L.mission.tokens].every(p =>
          p.zone !== undefined || Math.hypot(drop.x - p.x, drop.y - p.y) >= 52));
      }
    }
  }
});

test('fall/offscreen cleanup recovers unfinished carriers without granting a token or healing them', () => {
  const files = localScripts().filter(f => ['systems/mission.js', 'systems/scenes.js'].includes(f));
  const AH = loadScripts(files, { AH: { Levels: { ids: [1] }, Audio: { play() {} } },
    globals: { Phaser: { Scene: class {} } } });
  const scene = new AH.Scenes[5](), calls = [];
  const L = { mode: 'run', width: 4000, mission: { objectives: [], gems: [], gemQuota: 0,
    tokenQuota: 1, tokens: [{ id: 'required', x: 1000, y: 200 }] } };
  Object.assign(scene, { L, mission: new AH.Mission(L), toast: s => calls.push(s) });
  const carrier = { health: 1, bossToken: L.mission.tokens[0], homeX: 1000, homeY: 224, dead: false,
    tag: { setVisible() {} }, sprite: { body: { reset(...args) { calls.push(args); },
      setVelocity(...args) { calls.push(args); } } } };
  assert.equal(scene.recoverCarrier(carrier), true);
  assert.equal(carrier.health, 1);
  assert.equal(carrier.dead, false);
  assert.equal(scene.mission.tokenCount, 0);
  assert.equal(scene.mission.tokens[0].released, false);
  assert.deepEqual(calls[0], [1000, 224]);
  assert.equal(scene.mission.releaseToken('required', scene), true);
  assert.equal(scene.recoverCarrier(carrier), false);
  const bounds = [];
  const camera = { setBounds(...args) { bounds.push(args); } };
  scene.outdoorBounds(camera);
  L.skyRoute = { top: -280 };
  scene.outdoorBounds(camera);
  assert.deepEqual(bounds, [[0, 0, 4000, 360], [0, -280, 4000, 640]]);
});

test('spray walls and human enemy appearances use real registered drawing modules deterministically', () => {
  const AH = loadScripts(artScripts(), { globals: { document: recordingDocument() } }), A = AH.Art;
  for (const region of ['westeurope', 'uksouth', 'eastus2']) {
    const face = A.textureCanvas(A.groundFaces[region]);
    assert.deepEqual([face.width, face.height], [640, 128]);
    assert.ok(face.ops.some(op => op[0] === 'shadowBlur' && op[1] === 5));
    assert.ok(face.ops.filter(op => op[0] === 'ellipse').length >= 200, 'visible paint speckles and drips');
  }
  for (const key of ['guest_0', 'guest_1', 'detective_0', 'detective_1']) {
    const art = A.textureCanvas(key);
    assert.ok(art.ops.some(op => op[0] === 'fillStyle' && ['#dbaf8d', '#d7a47f'].includes(op[1])), key);
  }
  const again = loadScripts(artScripts(), { globals: { document: recordingDocument() } }).Art;
  assert.equal(JSON.stringify(A.textureCanvas('ground_face_westeurope').ops),
    JSON.stringify(again.textureCanvas('ground_face_westeurope').ops));
});

test('actual enemy cleanup keeps falling and offscreen token carriers alive until defeat', () => {
  const AH = loadScripts(localScripts().filter(f => ['systems/mission.js', 'systems/scenes.js'].includes(f)),
    { AH: { Levels: { ids: [1] }, Audio: { play() {} } }, globals: { Phaser: { Scene: class {} } } });
  for (const mode of ['run', 'fly']) {
    const scene = new AH.Scenes[5](), def = { id: 'required', x: 1200, y: 200 };
    const L = { mode, exit: { x: 4000, y: 200, w: 40, h: 90 }, mission: {
      objectives: [], gems: [], gemQuota: 0, tokenQuota: 1, tokens: [def] } };
    const e = { x: 0, health: 1, homeX: 1200, homeY: 224, bossToken: def, dead: false,
      update() {}, remove() { this.dead = true; }, tag: { setVisible() {} },
      sprite: { y: mode === 'run' ? 500 : 200, body: {
        reset(x, y) { e.x = x; e.sprite.y = y; }, setVelocity() {}
      } } };
    Object.assign(scene, { L, mode, mission: new AH.Mission(L), enemies: [e],
      time: { now: 0 }, cameras: { main: { scrollX: 1000 } },
      player: { body: { x: 1100, y: 200, width: 14, height: 40 } },
      coins: [], pups: [], tokens: [], rings: [], lasers: [], cables: [], terminals: [], ebolts: [], rects: [],
      updatePowers() {}, updateCheckpoints() {}, updateBlasts() {}, toast() {} });
    scene.updateWorld(1 / 60, scene.player);
    assert.equal(e.dead, false, mode);
    assert.equal(e.x, 1200);
    assert.equal(e.sprite.y, 224);
    assert.equal(e.health, 1);
    assert.equal(scene.mission.ready, false);
    assert.equal(scene.mission.tokens[0].released, false);
    scene.mission.releaseToken('required', scene);
    e.x = 0; e.sprite.y = mode === 'run' ? 500 : 200;
    scene.updateWorld(1 / 60, scene.player);
    assert.equal(e.dead, true, 'released drops no longer need carrier recovery');
  }
});

test('new weapon-drop definitions are built as real collectible scene pickups', () => {
  const AH = loadScripts(localScripts().filter(f => f === 'systems/scenes.js'),
    { AH: { Levels: { ids: [1] } }, globals: { Phaser: { Scene: class {} } } });
  const scene = new AH.Scenes[5](), keys = [];
  scene.L = { powerups: [{ kind: 'copilot', x: 100, y: 200 }],
    weaponDrops: [{ kind: 'spread', x: 600, y: 200 }, { kind: 'pierce', x: 1400, y: 180 }] };
  scene.add = { image(x, y, key) { keys.push(key); return { x, y, setDepth() { return this; } }; } };
  scene.tweens = { add() {} };
  scene.buildCheckpoints = () => {};
  scene.buildPickups();
  assert.deepEqual(keys, ['pu_copilot', 'pu_spread', 'pu_pierce']);
  assert.equal(scene.pups.length, 3);
  assert.ok(scene.pups.every(p => !p.taken));
  assert.equal(scene.pups[2].def, scene.L.weaponDrops[1]);
});

test('human guest faces its movement and detective appearance keeps hacker combat and collisions', () => {
  const body = { blocked: {}, velocity: {},
    setSize(...args) { this.size = args; }, setOffset(...args) { this.offset = args; },
    setAllowGravity() {}, setVelocityX(v) { this.velocity.x = v; } };
  const sprite = { x: 200, y: 300, body,
    setOrigin() { return this; }, setDepth() { return this; },
    play(key) { this.animation = key; }, setFlipX(v) { this.flipX = v; } };
  class PixelText {
    constructor(scene, x, y, text) { this.text = text; }
    setDepth() { return this; } setVisible() { return this; } setPosition() { return this; }
  }
  const AH = loadScripts(localScripts().filter(f => f === 'systems/enemies.js'),
    { AH: { Art: { D: 2 }, PixelText } });
  const scene = { anims: { exists() { return false; } },
    physics: { add: { sprite(x, y, key) { sprite.key = key; return sprite; }, collider() {} } } };
  const guest = new AH.Enemy(scene, { type: 'guest', x: 200, y: 300, range: 24 });
  guest.update(1 / 60, { x: 100, y: 300 });
  assert.ok(body.velocity.x < 0);
  assert.equal(sprite.flipX, false, 'left-facing person walks left without mirroring');
  guest.update(1 / 60, { x: 300, y: 300 });
  assert.ok(body.velocity.x > 0);
  assert.equal(sprite.flipX, true);
  const detective = new AH.Enemy(scene, { type: 'hacker', appearance: 'detective',
    x: 200, y: 300, range: 24 });
  assert.equal(sprite.key, 'detective_0');
  assert.equal(sprite.animation, 'detective_walk');
  assert.equal(detective.type, 'hacker');
  assert.equal(detective.health, 2);
  assert.equal(detective.shoot, true);
  assert.equal(detective.tag.text, 'SNOOPING DETECTIVE');
  assert.deepEqual(body.size, [40, 68]);
  assert.deepEqual(body.offset, [12, 6]);
});
