'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(file, AH = {}, globals = {}) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { window: { AH }, ...globals });
  return AH;
}

function display(x = 0, y = 0) {
  return {
    x, y, active: true,
    setDepth() { return this; }, setOrigin() { return this; }, setFlipX() { return this; },
    setTexture() { return this; }, setAngle() { return this; }, setTint() { return this; },
    setTintFill() { return this; }, clearTint() { return this; }, setScale() { return this; },
    setAlpha() { return this; }, setDisplaySize(w, h) { this.w = w; this.h = h; return this; },
    setVisible(v) { this.visible = v; return this; },
    setPosition(x, y) { this.x = x; this.y = y; return this; },
    setText(s) { this.text = s; return this; }, setColor(c) { this.color = c; return this; },
    destroy() { this.active = false; }
  };
}

function playerFixture() {
  const shots = [];
  const AH = load('systems/player.js', { Art: { D: 2 }, Audio: { play() {} } });
  const p = Object.create(AH.Player.prototype);
  Object.assign(p, { sprite: { x: 100, y: 200, body: { bottom: 220 } },
    scene: { spawnBlast(...args) { shots.push(args); } }, weapon: 'azure', weaponTime: 0,
    mode: 'run', facing: 1, boost: 100, blastCd: 0, charge: 0, charging: false, fireBlocked: false });
  return { AH, p, shots };
}

test('tap/release and hold/release use the same keyboard and touch charge state', () => {
  const { p, shots } = playerFixture();
  p.updateWeapon(0.05, { fire: true, fireHeld: true });
  assert.equal(shots.length, 0, 'holding does not emit a premature weak shot');
  p.updateWeapon(0.016, { fireHeld: false });
  assert.equal(shots.length, 1);
  assert.equal(shots[0][3].charge, 0);
  assert.equal(p.boost, 80);
  p.blastCd = 0;
  for (let i = 0; i < 80; i++) p.updateWeapon(1 / 60, { fireHeld: true });
  assert.equal(p.charge, 1, 'charge caps at 1.2 seconds');
  assert.equal(shots.length, 1);
  p.updateWeapon(1 / 60, { fireHeld: false });
  assert.equal(shots[1][3].charge, 1);
  assert.equal(p.boost, 40);
  assert.equal(p.charge, 0);
  p.blastCd = 0;
  p.boost = 10;
  assert.equal(p.azureBlast(1), false, 'low Boost cannot shoot for free');
});

test('temporary weapons replace, expire, and cancel held fire safely', () => {
  const { p, shots } = playerFixture();
  p.equipWeapon('spread');
  assert.equal(p.weaponTime, 25);
  p.updateWeapon(0.01, { fireHeld: false });
  p.updateWeapon(1.2, { fireHeld: true });
  p.shielding = true;
  p.updateWeapon(0.01, { fireHeld: true });
  p.shielding = false;
  p.updateWeapon(0.01, { fireHeld: false });
  assert.equal(shots.length, 0, 'shield cancels instead of releasing an accidental shot');
  p.updateWeapon(1.2, { fireHeld: true });
  p.cancelCharge();
  p.updateWeapon(0.01, { fireHeld: true });
  p.updateWeapon(0.01, { fireHeld: false });
  assert.equal(shots.length, 0, 'pause/warp cancellation stays blocked until release');
  p.equipWeapon('pierce');
  assert.equal(p.weapon, 'pierce');
  assert.equal(p.weaponTime, 25);
  p.updateWeapon(0.01, { fireHeld: false });
  p.updateWeapon(0.5, { fireHeld: true });
  p.updateWeapon(25, { fireHeld: false });
  assert.equal(p.weapon, 'azure');
  assert.equal(p.weaponTime, 0);
  assert.equal(shots.length, 0, 'expiry cannot release the old weapon as a new one');
});

test('respawn restores Azure and real damage cancels charge, including a bike hit', () => {
  const { p } = playerFixture();
  p.ducking = false;
  p.sprite.setPosition = function (x, y) { this.x = x; this.y = y; return this; };
  p.sprite.setVelocity = () => p.sprite;
  p.equipWeapon('pierce');
  p.charging = true;
  p.charge = 1;
  p.respawn(50, 100);
  assert.equal(p.weapon, 'azure');
  assert.equal(p.weaponTime, 0);
  assert.equal(p.charging, false);
  p.invuln = 0;
  p.defender = 0;
  p.riding = true;
  p.charging = true;
  p.charge = 1;
  p.scene.dismount = () => { p.riding = false; };
  assert.equal(p.hurt(10, 200), true);
  assert.equal(p.charging, false);
  assert.equal(p.charge, 0);
});

test('input reports held fire for keyboard and touch and consumes SPACE only once', () => {
  const AH = load('systems/input.js', {}, { Phaser: { Input: { Keyboard: {
    JustDown(k) { const v = k.just; k.just = false; return v; }
  } } } });
  const i = Object.create(AH.Input.prototype);
  i.k = Object.fromEntries('LEFT RIGHT UP DOWN A D W S SPACE F SHIFT E P R M ENTER ESC H Q'.split(' ').map(k => [k, { isDown: false, just: false }]));
  i.t = {};
  i.opts = {};
  i.k.F.isDown = true;
  i.k.F.just = true;
  assert.equal(i.read().fireHeld, true);
  i.k.F.isDown = false;
  i.t.attack = true;
  assert.equal(i.read().fireHeld, true);
  i.t.attack = false;
  assert.equal(i.read().fireHeld, false);
  i.k.SPACE.just = true;
  const cmd = i.read();
  assert.equal(cmd.confirm, true);
  assert.equal(cmd.jumpPressed, true);
});

test('spread fans out, charged shots hurt more, beams hit each target once and stop at walls', () => {
  const AH = load('systems/scenes.js', { Levels: { ids: [1] } }, { Phaser: { Scene: class {} } });
  const s = new AH.Scenes[5]();
  Object.assign(s, { add: { image: display }, blasts: [], enemies: [], rects: [], mode: 'run',
    cameras: { main: { scrollX: 0 } }, burst() {}, shootDownBolt() { return false; } });
  s.spawnBlast(100, 200, 1, { weapon: 'spread', charge: 1 });
  assert.equal(s.blasts.length, 5);
  assert.equal(new Set(s.blasts.map(b => b.vy)).size, 5);
  s.blasts = [];
  s.spawnBlast(100, 200, 1, { charge: 1 });
  assert.equal(s.blasts[0].damage, 3);
  assert.equal(s.blasts[0].bossDamage, 30);
  s.blasts = [];
  const hits = [];
  s.enemies = [0, 1].map(n => ({ sprite: { body: { x: 90 + n * 25, y: 190, width: 20, height: 20 } },
    hit(dir, damage) { hits.push([n, damage]); } }));
  s.spawnBlast(100, 200, 1, { weapon: 'pierce' });
  s.updateBlasts(0);
  s.updateBlasts(0);
  assert.equal(hits.length, 2, 'overlapping frames do not damage a pierced target twice');
  assert.equal(s.blasts.length, 1);
  s.rects = [{ x: 90, y: 190, w: 40, h: 20, active: true }];
  s.updateBlasts(0);
  assert.equal(s.blasts.length, 0, 'beam does not ignore solid cover');
  s.rects = [];
  let bossHits = 0;
  s.boss = { rect: () => ({ x: 90, y: 190, width: 30, height: 30 }), hitByBlast() { bossHits++; } };
  s.enemies = [];
  s.spawnBlast(100, 200, 1, { weapon: 'pierce', charge: 1 });
  s.updateBlasts(0);
  s.updateBlasts(0);
  assert.equal(bossHits, 1, 'a beam damages the boss only once');
});

test('losing a life restores defeated enemies away from the respawn point', () => {
  const made = [];
  class Enemy { constructor(scene, d) { this.def = d; this.dead = false; made.push(d); } remove() { this.dead = true; this.removed = true; } }
  const AH = load('systems/scenes.js', { Levels: { ids: [1] }, Enemy }, { Phaser: { Scene: class {} } });
  const s = new AH.Scenes[5]();
  const defs = [{ x: 100 }, { x: 250 }, { x: 900 }, { x: 1500 }];
  const survivor = new Enemy(s, defs[3]);
  made.length = 0;
  Object.assign(s, { L: { enemies: defs }, mode: 'run', player: { x: 120 }, enemies: [survivor], cameras: { main: { scrollX: 0 } } });
  s.respawnEnemies();
  assert.deepEqual(Array.from(s.enemies, e => e.def.x), [900, 1500], 'killed threats return, none spawn on the hero');
  assert.equal(survivor.removed, true, 'live enemies reset to their posts instead of doubling up');
  Object.assign(s, { mode: 'fly', cameras: { main: { scrollX: 1000 } }, player: { x: 1120 } });
  s.respawnEnemies();
  assert.deepEqual(Array.from(s.enemies, e => e.def.x), [1500], 'fly mode only refills ahead of the camera');
});

function bossFixture(air = false) {
  class Rectangle {
    constructor(x, y, width, height) { Object.assign(this, { x, y, width, height }); }
  }
  const AH = load('systems/boss.js', { Audio: { play() {}, music() {} },
    PixelText: class { constructor(x, y) { return display(x, y); } } }, { Phaser: {
    Math: { Clamp: (n, lo, hi) => Math.max(lo, Math.min(hi, n)) },
    Geom: { Rectangle, Intersects: { RectangleToRectangle: (a, b) =>
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y } }
  } });
  const scene = { add: { sprite: display, image: display }, burst() {}, toast() {}, addScore() {},
    time: { now: 1, delayedCall() {} }, cameras: { main: { shake() {} } } };
  const boss = new AH.Boss(scene, { left: 0, right: 640, floor: 300, kind: 'guardian', name: 'TEST', air });
  const player = { x: 60, y: 270, facing: 1, health: 100, invuln: 0,
    body: { x: 53, y: 250, width: 14, height: 40 }, hurt() {} };
  return { boss, player, scene };
}

test('boss damage check, green marker, cue and countdown share one vulnerability state', () => {
  const { boss, player } = bossFixture();
  assert.equal(boss.hitByBlast(30), false);
  assert.equal(boss.hp, 100);
  boss.stun();
  assert.equal(boss.snapshot().vulnerable, true);
  assert.match(boss.snapshot().cue, /OPEN/);
  assert.equal(boss.hitByBlast(30), true);
  assert.equal(boss.hp, 70);
  boss.update(0.1, player);
  assert.equal(boss.marker.visible, true);
  assert.match(boss.status.text, /OPEN/);
  boss.update(4, player);
  assert.equal(boss.snapshot().vulnerable, false);
  assert.equal(boss.marker.visible, false);
  assert.equal(boss.hitByBlast(), false);
});

test('a missed boss charge slams into the wall and opens a full damage window', () => {
  const { boss, player } = bossFixture();
  player.invuln = 99;
  boss.state = 'idle';
  boss.cd = 0;
  boss.pickAttack = () => 'charge';
  let t = 0;
  while (!boss.stunned && t < 6) { boss.update(1 / 60, player); t += 1 / 60; }
  assert.equal(boss.stunned, true, 'a charge always ends in a stun');
  assert.ok(boss.timer > 3, 'the window lasts long enough to cross the arena');
  assert.match(boss.cue, /OPEN/);
  assert.equal(boss.hitByBlast(30), true);
});

test('bosses pressure players sooner but guarantee damage windows without shield-only deadlocks', () => {
  for (const air of [false, true]) {
    const { boss, player, scene } = bossFixture(air);
    boss.pickAttack = () => 'shoot';
    let fired = 0, openedAt = null;
    const fire = boss.fireBolt.bind(boss);
    boss.fireBolt = (...args) => { fired++; fire(...args); };
    for (let t = 0; t < 12; t += 1 / 60) {
      scene.time.now += 1000 / 60;
      boss.update(1 / 60, player);
      if (boss.vulnerable) { openedAt = t; break; }
    }
    assert.equal(fired, 3);
    assert.ok(openedAt < 9, 'three volleys lead to an explicit damage opportunity');
    assert.equal(boss.bolts.length, 0, 'old projectiles cannot hide the open window');
    assert.equal(boss.pending.length, 0);
    assert.match(boss.cue, /OPEN/);
  }
});

test('lower boss health increases fire cadence without removing telegraph time', () => {
  const cooldowns = [], windups = [];
  for (const hp of [100, 60, 30]) {
    const { boss, player } = bossFixture();
    boss.hp = hp;
    boss.state = 'idle';
    boss.cd = 0;
    boss.pickAttack = () => 'shoot';
    boss.update(0.01, player);
    windups.push(boss.timer);
    boss.timer = 0;
    boss.update(0.01, player);
    cooldowns.push(boss.cd);
  }
  assert.ok(cooldowns[0] < 1.7, 'first phase is faster than the previous 1.7s cooldown');
  assert.ok(cooldowns[2] < cooldowns[1] && cooldowns[1] < cooldowns[0]);
  assert.ok(windups.every(t => t >= 0.49), 'late phases still telegraph shots for half a second');
});
