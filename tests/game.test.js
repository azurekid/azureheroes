'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(file, AH = {}, seed = 1, globals = {}) {
  const math = Object.create(Math);
  math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const context = vm.createContext({ ...globals, window: { AH }, Math: math });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  return context.window.AH;
}

test('cloud platforms use finite cargo art without changing collision geometry', () => {
  const calls = [], zones = [];
  const display = { setOrigin() { return this; }, setDepth() { return this; } };
  const AH = load('systems/scenes.js', {
    Levels: { ids: [1] },
    Art: { buildCloudPlatform(scene, p) { calls.push(['cargo', p.w, p.h]); return 'cargo'; } }
  }, 1, { Phaser: { Scene: class {} } });
  const scene = new AH.Scenes[5]();
  scene.L = { theme: 'roof' };
  scene.mode = 'run';
  scene.rects = [];
  scene.add = {
    image(...args) { calls.push(['image', ...args]); return display; },
    tileSprite(...args) { calls.push(['tile', ...args]); return display; },
    zone(...args) { zones.push(args); return {}; }
  };
  scene.solids = { add() {} };
  for (const theme of ['docker', 'aks', 'actions', 'pipelines', 'entra', 'functions']) {
    scene.addPlatform({ x: 100, y: 200, w: 110, h: 100, cloudKind: theme });
    scene.addPlatform({ x: 0, y: 300, w: 3500, h: 100, cloudKind: theme, pipeFloor: true });
    assert.ok(calls.some(c => c[0] === 'tile' && c[5] === 'cloud_floor_' + theme));
  }
  assert.equal(calls.filter(c => c[0] === 'cargo').length, 6);
  assert.equal(calls.filter(c => c[0] === 'image' && c[3] === 'cargo').length, 6);
  assert.deepEqual(zones[0], [155, 250, 110, 100]);
  assert.deepEqual(zones[1], [1750, 350, 3500, 100]);
  assert.equal(scene.rects.length, 12);
});

test('room scenery variants cover street ambience and parallax is isolated and density-aware', () => {
  const calls = [];
  const display = () => ({
    img: {}, visible: true, depth: 0,
    setOrigin() { return this; }, setScrollFactor() { return this; }, setTint() { return this; },
    setVisible(v) { this.visible = v; return this; },
    setDepth(d) { this.depth = d; return this; }
  });
  const AH = load('systems/scenes.js', {
    Levels: { ids: [1] }, Art: { D: 2 }, Audio: { music() {} },
    PixelText: class { constructor() { return display(); } }
  }, 1, { Phaser: { Scene: class {} } });
  const scene = new AH.Scenes[5]();
  const zone = { x: 10000, w: 3500, theme: 'docker', name: 'DOCKER', hint: 'SHIP',
    stages: [], exit: { x: 13400, y: 254 } };
  scene.L = { width: 9000, pipeZones: [zone] };
  scene.add = {
    image(...args) { calls.push(args); return display(); },
    tileSprite() { return display(); }
  };
  scene.tweens = { add() {} };
  scene.textures = { exists: () => false };
  scene.buildPipes();
  assert.deepEqual(calls.map(c => c[2]), [
    'challenge_bg_docker', 'challenge_bg_docker_1', 'challenge_bg_docker_2',
    'challenge_bg_docker', 'challenge_bg_docker_1', 'challenge_bg_docker_2'
  ]);
  const sky = scene.pipeSkies[0].sky;
  assert.ok(sky.depth > -16.9, 'room sky covers regional scenery, road and time-of-day wash');
  assert.equal(sky.visible, false);
  scene.fx = display();
  scene.cameras = { main: { scrollX: 11000, setBounds() {} } };
  scene.physics = { world: { setBounds() {} } };
  scene.inPipe = zone;
  scene.warping = true;
  scene.updatePipes(0, null);
  assert.equal(sky.visible, true);
  assert.equal(sky.tilePositionX, 440);
  assert.equal(scene.fx.visible, false);
  scene.leavePipeNow();
  assert.equal(sky.visible, false);
  assert.equal(scene.fx.visible, true);
  scene.updatePipes(0, null);
  assert.equal(sky.visible, false);
});

test('random worlds have distinct, disjoint, substantial cloud challenges and vertical routes', () => {
  const { Levels } = load('levels/worlds.js');
  const themes = new Set();
  let walls = 0, stairs = 0;
  for (const meta of Levels.worlds) {
    for (let run = 0; run < 80; run++) {
      const L = Levels.make(meta.id);
      assert.ok(L.width > 6000);
      const hackers = L.enemies.filter((e) => e.type === 'hacker');
      if (meta.mode === 'fly') {
        assert.equal(hackers.length, 0, 'flight-only worlds keep airborne threats');
      } else {
        assert.ok(hackers.length > 0, meta.city + ' has a rogue hacker');
        for (const e of hackers) {
          assert.ok(Math.abs(e.x - L.spawn.x) - e.range > 200, 'spawn stays clear of the patrol');
          assert.ok(L.checkpoints.every((c) => Math.abs(e.x - c.x) - e.range > 80), 'checkpoints stay clear of the patrol');
          assert.ok(e.x + e.range + 10 < L.boss.left, 'patrol stays outside the boss arena');
          const ground = L.platforms.find((p) => p.y === e.y && e.x - e.range - 10 >= p.x && e.x + e.range + 10 <= p.x + p.w);
          assert.ok(ground, 'the whole patrol stays on its ground platform');
          if (meta.theme === 'rack') {
            for (const other of L.enemies.filter((o) => o !== e && o.y === e.y)) {
              assert.ok(Math.abs(e.x - other.x) - e.range - (other.range || 0) > 60,
                'ground patrols have space to remain distinct');
            }
          } else {
            assert.ok(!L.enemies.some((o) => o !== e && o.y === e.y && o.x >= ground.x && o.x <= ground.x + ground.w),
              'the hacker has a separate street platform from other ground threats');
          }
          for (const o of L.obstacles || []) {
            if (o.y + o.h === e.y) assert.ok(e.x + e.range + 10 <= o.x || e.x - e.range - 10 >= o.x + o.w,
              'patrol does not overlap a solid street obstacle');
          }
          for (const bike of L.vehicles || []) {
            if (bike.y === e.y) assert.ok(Math.abs(e.x - bike.x) > e.range + 39, 'patrol does not overlap a parked bike');
          }
          if (meta.theme === 'rack') {
            for (const rack of L.platforms.filter((p) => p.y < e.y && p.y + p.h === e.y)) {
              assert.ok(e.x + e.range + 10 <= rack.x || e.x - e.range - 10 >= rack.x + rack.w,
                'patrol does not overlap a solid data-center rack');
            }
          }
        }
      }
      if (meta.mode !== 'run' || meta.theme === 'rack') continue;
      assert.equal(L.pipeZones.length, 2, meta.city + ' has two pipe challenges');
      assert.notEqual(L.pipeZones[0].theme, L.pipeZones[1].theme);
      assert.ok(L.pipeZones[0].x + L.pipeZones[0].w < L.pipeZones[1].x);
      const ground = L.platforms.filter((p) => p.x < L.width && p.h >= 100 && !p.pipe);
      assert.ok(Math.max(...ground.map((p) => p.y)) - Math.min(...ground.map((p) => p.y)) >= 60);
      for (let i = 1; i < ground.length; i++) {
        const a = ground[i - 1], b = ground[i], gap = b.x - a.x - a.w;
        const spanned = L.platforms.some((p) => p.bridge && p.x === a.x + a.w) ||
          L.movers.some((m) => m.x0 > a.x + a.w && m.x0 < b.x);
        if (!spanned) {
          assert.ok(gap <= 195, meta.city + ' needs a bridge/boat for a wider gap');
          if (gap > 140 && a.y - b.y > 20) {
            // ledge stairs: each hop (roof -> ledge -> ledge -> roof) stays within one jump
            const steps = L.platforms.filter((p) => p.ledge && p.x > a.x + a.w && p.x < b.x).sort((p, q) => p.x - q.x);
            assert.equal(steps.length, 2, 'wide-gap rises need ledge stairs');
            for (const [lo, hi] of [[a, steps[0]], [steps[0], steps[1]], [steps[1], b]]) assert.ok(lo.y - hi.y <= 60, 'stair hops stay one jump high');
            stairs++;
          }
        }
        if (gap === 0 && a.y - b.y > 70) {
          assert.ok(b.climb && b.wallFrom === a.y, 'rises above a jump are marked climb walls');
          assert.ok(a.y - b.y <= 186, 'climb walls stay within wall-jump reach');
          walls++;
        }
        assert.ok(b.y >= 106, 'rooftops stay below the HUD');
      }
      assert.ok(L.platforms.some((p) => p.float && p.x < L.width));
      assert.ok(L.enemies.filter((e) => e.x < L.width).length >= 20);
      for (const pipe of L.pipes) {
        const Z = L.pipeZones[pipe.zone];
        for (const point of [pipe, Z.back]) {
          assert.ok(!L.enemies.some((e) => Math.abs(e.x - point.x) < 80 && Math.abs(e.y - point.y - 46) < 60),
            'pipe approaches must be free of ground threats');
          assert.ok(!L.platforms.some((p) => p.float && p.x < point.x + 22 && p.x + p.w > point.x - 22 &&
            p.y < point.y && p.y + p.h > point.y - 48), 'pipe headroom must remain clear');
        }
      }
      if (meta.id === 1) assert.ok(L.obstacles.some((o) => o.kind === 'herring'));
      if (meta.id === 3) assert.ok(L.obstacles.some((o) => o.kind === 'bakery'), 'Paris has a bakery stall');
      // Regional rooms stay home: only Paris opens the Metro, always behind its first pipe.
      assert.equal(L.pipeZones[0].theme === 'metro', meta.region === 'francecentral');
      assert.equal(L.pipeZones[1].theme === 'metro', false);
      for (const q of L.platforms.filter((p) => p.pipe)) assert.ok(q.theme, 'pipes carry their room theme');
      for (const Z of L.pipeZones) {
        themes.add(Z.theme);
        assert.ok(Z.w >= 3200 && Z.w <= 3840);
        assert.equal(Z.stages.length, 5);
        assert.ok(Z.enemies.length >= 10);
        assert.ok(Z.timeBonus >= Z.w / 190);
        assert.ok(Z.platforms.some((p) => p.lowTunnel));
        assert.ok(Z.platforms.filter((p) => p.lowTunnel).length < Z.stages.length);
        assert.equal(new Set(Z.stages.map((s) => s.layout)).size, 5);
        assert.ok(Z.entry.x < Z.exit.x);
        for (const p of Z.platforms) {
          assert.ok(p.x >= Z.x && p.x + p.w <= Z.x + Z.w);
          if (p.lowTunnel) assert.ok(300 - p.y - p.h >= 20 && 300 - p.y - p.h < 40);
        }
        for (const s of [Z.name, Z.hint, ...Z.stages.flatMap((s) => [s.name, s.tip])]) assert.match(s, /^[A-Z0-9 .!'/:+,\-?]+$/);
        for (const e of Z.enemies) {
          assert.ok(e.x > Z.entry.x + 120 && e.x < Z.exit.x - 60);
          assert.ok(L.enemies.includes(e));
        }
        for (const p of Z.powerups) assert.ok(L.powerups.includes(p));
      }
    }
  }
  assert.deepEqual([...themes].sort(), ['actions', 'aks', 'docker', 'entra', 'functions', 'metro', 'pipelines']);
  assert.ok(walls > 50 && stairs > 50, 'run worlds regularly mix climb walls and ledge stairs');
});

test('duck body preserves feet, cannot stand under beams, and blasts fire low', () => {
  const AH = load('systems/player.js', { Art: { D: 2 }, Audio: { play() {} } });
  const player = Object.create(AH.Player.prototype);
  const body = {
    x: 100, width: 14, height: 40, right: 114, position: { y: 260 }, prev: { y: 260 }, prevFrame: { y: 260 },
    get y() { return this.position.y; },
    get bottom() { return this.y + this.height; },
    setSize(w, h) { this.height = h / 2; },
    setOffset() {},
    updateCenter() {}
  };
  let blast;
  player.sprite = { x: 107, y: 277, body };
  player.scene = { rects: [], spawnBlast(...args) { blast = args; } };
  player.facing = 1;
  player.ducking = false;
  player.boost = 100;
  player.blastCd = 0;
  player.setDucking(true);
  assert.equal(body.height, 20);
  assert.equal(body.bottom, 300);
  assert.equal(body.y - body.prev.y, 0, 'resizing must not move the sprite in physics postUpdate');
  player.scene.rects.push({ x: 90, y: 254, w: 140, h: 20, active: true });
  assert.equal(player.canStand(), false);
  assert.equal(player.azureBlast(), true);
  assert.equal(blast[1], 290);
  player.scene.rects[0].active = false;
  assert.equal(player.canStand(), true);
  player.setDucking(false);
  assert.equal(body.height, 40);
  assert.equal(body.bottom, 300);
});

test('MFA shield works on E (ground and air) and as a crouch guard on DOWN; DOWN + direction slides', () => {
  const AH = load('systems/player.js', { Art: { D: 2 }, Audio: { play() {} } });
  const chain = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => chain) });
  const body = {
    x: 100, width: 14, height: 40, position: { y: 260 }, prev: { y: 260 }, prevFrame: { y: 260 },
    velocity: { x: 0, y: 0 }, blocked: { down: true }, touching: { down: false },
    get y() { return this.position.y; }, get bottom() { return this.y + this.height; }, get right() { return this.x + this.width; },
    setSize(w, h) { this.height = h / 2; }, setOffset() {}, updateCenter() {}
  };
  const sprite = Object.assign(Object.create(chain), { x: 107, y: 277, body, setVelocityX(v) { body.velocity.x = v; return this; } });
  const p = Object.create(AH.Player.prototype);
  Object.assign(p, {
    sprite, scene: { rects: [], burst() {}, cameras: { main: { scrollX: 0 } } }, shieldFx: chain, mode: 'run', facing: 1,
    invuln: 0, defender: 0, blastCd: 0, attackT: 0, slideT: 0, slideCd: 0, boost: 100, jumps: 0, coyote: 0,
    riding: false, speedMul: 1, runT: 0, pre: 'hl_', slideHits: new Set(), ducking: false, health: 100
  });
  const cmd = (o) => Object.assign({ left: false, right: false, up: false, down: false, jumpPressed: false, fire: false, boost: false, shield: false }, o);
  p.update(1 / 60, cmd({ shield: true }));
  assert.equal(p.shielding, true, 'E shields on the ground');
  p.update(1 / 60, cmd({ down: true }));
  assert.equal(p.shielding, true, 'DOWN while standing still is a crouch guard');
  assert.equal(p.ducking, true);
  const shots = [];
  p.scene.spawnBlast = (x, y, dir, o) => shots.push({ y, charge: o.charge });
  for (let i = 0; i < 80; i++) p.update(1 / 60, cmd({ down: true, fire: i === 0, fireHeld: true }));
  assert.equal(p.shielding, false, 'holding F lowers the crouch guard');
  assert.equal(p.ducking, true, 'and the hero stays ducked to charge a low shot');
  p.update(1 / 60, cmd({ down: true }));
  assert.equal(shots.length, 1, 'releasing F while ducking fires');
  assert.ok(shots[0].charge >= 0.3, 'the low shot keeps its charge');
  assert.equal(shots[0].y, body.bottom - 10 - 5 * shots[0].charge, 'and leaves at feet height, clear of the floor');
  p.update(1 / 60, cmd({}));
  body.blocked.down = false;
  p.update(1 / 60, cmd({ shield: true }));
  assert.equal(p.shielding, true, 'E also shields in the air');
  body.blocked.down = true;
  p.update(1 / 60, cmd({}));
  p.update(1 / 60, cmd({ down: true, right: true }));
  assert.equal(p.sliding, true, 'DOWN + direction slides');
  assert.equal(p.shielding, false, 'sliding is an attack, not a guard');
});

test('wall slide slows the fall and wall jumps kick away while keeping the double jump', () => {
  const AH = load('systems/player.js', { Art: { D: 2 }, Audio: { play() {} } });
  const chain = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => chain) });
  const body = {
    x: 100, width: 14, height: 40, position: { y: 200 }, prev: { y: 200 }, prevFrame: { y: 200 },
    velocity: { x: 0, y: 300 }, blocked: { down: false, right: true }, touching: { down: false },
    get y() { return this.position.y; }, get bottom() { return this.y + this.height; }, get right() { return this.x + this.width; },
    setSize(w, h) { this.height = h / 2; }, setOffset() {}, updateCenter() {},
    setVelocityX(v) { this.velocity.x = v; }, setVelocityY(v) { this.velocity.y = v; }
  };
  const sprite = Object.assign(Object.create(chain), {
    x: 107, y: 220, body,
    setVelocityX(v) { body.velocity.x = v; return this; }, setVelocityY(v) { body.velocity.y = v; return this; },
    setVelocity(x, y) { body.velocity.x = x; body.velocity.y = y; return this; }
  });
  const p = Object.create(AH.Player.prototype);
  Object.assign(p, {
    sprite, scene: { rects: [], burst() {}, cameras: { main: { scrollX: 0 } } }, shieldFx: chain, mode: 'run', facing: 1,
    invuln: 0, defender: 0, blastCd: 0, attackT: 0, slideT: 0, slideCd: 0, boost: 100, jumps: 2, coyote: 0,
    riding: false, speedMul: 1, runT: 0, pre: 'hl_', slideHits: new Set(), ducking: false, health: 100
  });
  const cmd = (o) => Object.assign({ left: false, right: false, up: false, down: false, jumpPressed: false, fire: false, boost: false, shield: false }, o);
  p.update(1 / 60, cmd({ right: true }));
  assert.equal(p.wallSliding, true, 'pushing into a wall in the air slides');
  assert.ok(body.velocity.y <= 110, 'wall slide caps the fall speed');
  p.update(1 / 60, cmd({ right: true, jumpPressed: true }));
  assert.equal(p.wallJumps, 1, 'jump on a wall is a wall jump even after a double jump');
  assert.ok(body.velocity.y < -380, 'wall jump launches upward');
  assert.ok(body.velocity.x < 0, 'wall jump kicks away from the wall');
  assert.equal(p.jumps, 1, 'wall jump restores the double jump');
  body.blocked.right = false;
  p.update(1 / 60, cmd({ right: true }));
  assert.ok(body.velocity.x < 0, 'the kick briefly overrides input toward the wall');
});

test('all cloud threat types retain two-hit health, shared behavior and credit drops', () => {
  let drops = 0;
  const tags = [];
  class PixelText {
    constructor(scene, x, y, str, o) { this.str = str; this.o = o; this.destroyed = false; tags.push(this); }
    setDepth() { return this; } setVisible(v) { this.visible = v; return this; } setPosition() { return this; }
    destroy() { this.destroyed = true; }
  }
  const AH = load('systems/enemies.js', { Art: { D: 2 }, Audio: { play() {} }, PixelText });
  const cats = Object.keys(AH.Enemy.CATS);
  for (const [type, spec] of Object.entries(AH.Enemy.SPEC)) {
    assert.ok(spec.label && spec.info && cats.includes(spec.cat), type + ' has a nameplate, threat category and guide text');
    assert.match(spec.label + spec.info, /^[A-Z0-9 .!':\/+,?-]+$/, type + ' text fits the pixel font');
  }
  for (const type of ['bug', 'image', 'rbac', 'endpoint', 'guest', 'hacker']) {
    const body = { setSize() {}, setOffset() {}, setAllowGravity() {}, setVelocityX() {}, setVelocityY() {} };
    const sprite = {
      x: 200, y: 300, body, setOrigin() { return this; }, setDepth() { return this; },
      play() {}, setTintFill() {}, destroy() {}
    };
    const scene = {
      anims: { exists() { return false; } },
      physics: { add: { sprite() { return sprite; }, collider() {} } },
      burst() {}, onEnemyKilled() { drops++; }
    };
    const e = new AH.Enemy(scene, { type, x: 200, y: 300, range: 24 });
    assert.equal(e.health, 2);
    assert.ok(e.spec.fix);
    e.hit(1);
    assert.equal(e.dead, false);
    e.hit(1);
    assert.equal(e.dead, true);
    assert.equal(tags[tags.length - 1].destroyed, true, 'nameplate is removed with the enemy');
  }
  assert.equal(drops, 6);
});

test('rogue hacker patrols, shoots toward the player and drops one credit with an MFA tip', () => {
  const bolts = [], coins = [], tips = [];
  class PixelText {
    setDepth() { return this; } setVisible() { return this; } setPosition() { return this; }
    destroy() { this.destroyed = true; }
  }
  const AH = load('systems/enemies.js', { Levels: { ids: [1] }, Art: { D: 2 }, Audio: { play() {} }, PixelText });
  load('systems/scenes.js', AH, 1, { Phaser: { Scene: class {} } });
  const body = {
    blocked: { left: false, right: false }, setSize() {}, setOffset() {}, setAllowGravity() {},
    setVelocityX(v) { this.vx = v; }, setVelocityY(v) { this.vy = v; }
  };
  const sprite = {
    x: 200, y: 300, displayHeight: 37, body,
    setOrigin() { return this; }, setDepth() { return this; }, play(key) { this.animation = key; },
    setFlipX(v) { this.flipped = v; }, setTint() {}, clearTint() {}, setTintFill() {}, destroy() {}
  };
  const scene = {
    anims: { exists() { return false; } }, physics: { add: { sprite() { return sprite; }, collider() {} } },
    time: { delayedCall() {} }, spawnEnemyBolt(...args) { bolts.push(args); },
    stats: { kills: 0 }, achieve() {}, addScore() {}, burst() {},
    spawnCoin(...args) { coins.push(args); }, toast(text) { tips.push(text); },
    onEnemyKilled: AH.Scenes[5].prototype.onEnemyKilled
  };
  const e = new AH.Enemy(scene, { type: 'hacker', x: 200, y: 300, range: 24, skin: 'westeurope' });
  assert.equal(sprite.animation, 'hacker_walk', 'regional skins fall back to the shared hacker art');
  assert.equal(e.spec.cat, 'identity');
  assert.equal(e.shoot, true);
  e.shootCd = 0;
  e.update(0.016, { x: 100, y: 280 });
  assert.deepEqual(bolts[0], [186, 278, -1]);
  assert.equal(sprite.flipped, false);
  assert.equal(body.vx, -40);
  e.shootCd = 0;
  e.update(0.016, { x: 300, y: 280 });
  assert.deepEqual(bolts[1], [214, 278, 1]);
  assert.equal(sprite.flipped, true);
  e.shootCd = 0;
  e.update(0.016, { x: 600, y: 280 });
  assert.equal(bolts.length, 2, 'the hacker cannot shoot outside the shared shooter range');
  e.hit(1);
  assert.equal(e.health, 1);
  assert.equal(e.dead, false);
  e.hit(1);
  assert.equal(e.dead, true);
  assert.deepEqual(coins, [[200, 282, true]], 'the shared death path drops one Azure Credit');
  assert.deepEqual(tips, ['INTRUSION STOPPED - ENABLE ENTRA MFA']);
  e.update(1, { x: 100, y: 280 });
  assert.equal(bolts.length, 2, 'a defeated hacker cannot shoot');
});

test('every region has exactly one unlockable hero suit and locked suits are enforced', () => {
  const { Levels } = load('levels/worlds.js');
  const src = fs.readFileSync(path.join(__dirname, '..', 'art/sprites.js'), 'utf8');
  const unlocks = [...src.matchAll(/\{ name: '([A-Z ]+)', unlock: (\d+), suit:/g)].map((m) => +m[2]);
  assert.deepEqual(unlocks, [...Levels.ids].map((id, i) => i), 'one suit per level, in world order');
  assert.match(src, /suitOpen = \(i, unlocked\) => .*unlock \+ 2/, 'a suit opens once its level index is cleared');
  assert.match(src, /if \(!suitOpen\(out\.suit, data && data\.unlocked\)\) out\.suit = /, 'lookOf never returns a locked suit');
});
