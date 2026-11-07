'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { localScripts, loadScripts } = require('./helpers/load-game');

function game() {
  return loadScripts(localScripts().filter(file =>
    ['systems/input.js', 'systems/player.js', 'systems/scenes.js'].includes(file)), {
    AH: { Levels: { ids: [1] }, Art: { D: 2 }, Audio: { play() {} } },
    globals: { Phaser: { Scene: class {}, Math: { Clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)) } } }
  });
}
  test('flight shielding cancels charge and boost while retaining movement and facing', () => {
    const AH = game(), p = Object.create(AH.Player.prototype), sprite = display();
    const shots = [];
    sprite.body = { velocity: { x: 0, y: 0 }, blocked: {}, touching: {},
      setVelocity(x, y) { this.velocity = { x, y }; }, setVelocityX(x) { this.velocity.x = x; } };
    Object.assign(p, { sprite, mode: 'fly', facing: 1, pre: 'hero_', shieldFx: display(),
      invuln: 0, defender: 0, blastCd: 0, attackT: 0, boost: 100, health: 100,
      speedMul: 1, weapon: 'azure', weaponTime: 0, charge: 1, charging: true,
      scene: { scrollSpeed: 130, cameras: { main: { scrollX: 0 } },
        spawnBlast(...args) { shots.push(args); } } });
    p.update(0.016, { left: true, shield: true, boost: true, fireHeld: true });
    assert.equal(p.shielding, true);
    assert.equal(p.facing, -1);
    assert.equal(p.boosting, false);
    assert.equal(p.boost, 100);
    assert.equal(p.charge, 0);
    assert.equal(p.charging, false);
    assert.ok(sprite.body.velocity.x < 130, 'ordinary flight remains available');
    p.update(0.016, { fireHeld: true });
    p.update(0.016, { fireHeld: false });
    assert.equal(shots.length, 0, 'releasing shield cannot fire the cancelled charge');
    assert.equal(p.shielding, false);
  });

  test('ground melee has bounded shared cooldowns, cancels blasts and is unavailable while shielding or flying', () => {
    const AH = game(), p = Object.create(AH.Player.prototype);
    Object.assign(p, { mode: 'run', health: 100, boost: 77, charging: true, charge: 1,
      scene: {}, meleeCd: 0 });
    assert.equal(p.melee('punch'), true);
    assert.equal(p.charge, 0);
    assert.equal(p.fireBlocked, true);
    assert.equal(p.meleeCd, 0.4);
    assert.equal(p.meleeT, 0.18);
    assert.equal(p.boost, 77);
    assert.equal(p.melee('kick'), false);
    p.meleeCd = 0;
    assert.equal(p.melee('kick'), true);
    assert.equal(p.meleeCd, 0.6);
    assert.equal(p.meleeT, 0.26);
    p.cancelCharge();
    assert.equal(p.meleeT, 0, 'pause/hurt/warp cancels a pending melee attack');
    p.meleeCd = 0; p.shielding = true;
    assert.equal(p.melee('punch'), false);
    p.shielding = false; p.mode = 'fly';
    assert.equal(p.melee('kick'), false);
  });

  test('punch, kick and slide resolve once per target, only in front, and never through walls', () => {
    const AH = game(), s = new AH.Scenes[5](), p = { x: 100, facing: 1, body: { bottom: 200 } };
    let damage = [], hits = 0;
    const boss = { air: false, rect: () => ({ x: 120, y: 120, width: 40, height: 80 }),
      hitByBlast(amount) { damage.push(amount); } };
    const enemy = { sprite: { body: { x: 118, y: 162, width: 20, height: 34 } }, hit() { hits++; } };
    Object.assign(s, { mode: 'run', state: 'play', rects: [], enemies: [enemy], boss });
    for (const [kind, amount] of [['punch', 10], ['kick', 14], ['slide', 12]]) {
      const seen = new Set();
      s.hitMelee(p, kind, seen); s.hitMelee(p, kind, seen);
      assert.equal(damage.at(-1), amount);
      assert.equal(seen.has(boss), true);
    }
    assert.equal(damage.length, 3);
    assert.equal(hits, 2, 'slides keep existing low-enemy contact handling');
    p.facing = -1;
    s.hitMelee(p, 'kick', new Set());
    assert.equal(damage.length, 3);
    p.facing = 1;
    s.rects = [{ active: true, x: 108, y: 150, w: 5, h: 50 }];
    s.hitMelee(p, 'kick', new Set());
    assert.equal(damage.length, 3);
    s.rects = []; s.mode = 'fly';
    s.hitMelee(p, 'kick', new Set());
    assert.equal(damage.length, 3);
  });

  test('keyboard and touch expose flight shield and press-only ground melee commands', () => {
    const AH = game(), input = Object.create(AH.Input.prototype);
    const keys = 'LEFT RIGHT UP DOWN A D W S SPACE F SHIFT E P R M N ENTER ESC H Q J K'.split(' ');
    input.k = Object.fromEntries(keys.map(key => [key, { isDown: false }]));
    Object.assign(input, { opts: { fly: true }, t: {} });
    // Phaser JustDown consumes one press, independently of held state.
    const actual = loadScripts(['systems/input.js'], { AH: {}, globals: {
      Phaser: { Input: { Keyboard: { JustDown(key) { const pressed = !!key.pressed; key.pressed = false; return pressed; } } } }
    } });
    Object.setPrototypeOf(input, actual.Input.prototype);
    input.k.E.isDown = true; input.k.J.pressed = true; input.k.K.pressed = true;
    let cmd = input.read();
    assert.equal(cmd.shield, true);
    assert.equal(cmd.punch, true); assert.equal(cmd.kick, true);
    cmd = input.read();
    assert.equal(cmd.punch, false); assert.equal(cmd.kick, false);
    input.k.E.isDown = false;
    input.t.shield = true; input.tPunch = true; input.tKick = true;
    cmd = input.read();
    assert.equal(cmd.shield, true); assert.equal(cmd.punch, true); assert.equal(cmd.kick, true);
    assert.equal(input.tPunch, false); assert.equal(input.tKick, false);
  });

function display() {
  const d = { x: 300, y: 200, scaleX: 1 };
  for (const key of ['setVisible', 'setPosition', 'setScale', 'setTexture', 'setAngle', 'setAlpha']) {
    d[key] = () => d;
  }
  d.setFlipX = value => { d.flipX = value; return d; };
  return d;
}

test('R resumes the actual pause state without advancing or resetting the run; outside pause it restarts', () => {
  const AH = game(), s = new AH.Scenes[5]();
  let restarted = 0, resumed = 0, cleared = 0, panel;
  Object.assign(s, { state: 'play', player: { x: 300, health: 72, cancelCharge() {} },
    mission: { tokenCount: 2 }, timeLeft: 321,
    physics: { world: { pause() {}, resume() { resumed++; } } },
    tweens: { pauseAll() {}, resumeAll() {} },
    showPanel(title, colour, lines) { panel = lines; },
    clearPanel() { cleared++; }, guidePanel: display(), guideText: [],
    input2: { read: () => ({ restart: true }) }, restart() { restarted++; } });
  s.setPaused(true);
  assert.match(panel[0], /R: RESUME/);
  s.update(0, 16);
  assert.equal(s.state, 'play');
  assert.equal(restarted, 0);
  assert.equal(resumed, 1);
  assert.equal(cleared, 1);
  assert.equal(s.player.x, 300);
  assert.equal(s.player.health, 72);
  assert.equal(s.timeLeft, 321);
  assert.equal(s.mission.tokenCount, 2);
  s.update(16, 16);
  assert.equal(restarted, 1);
});

test('flight direction turns the hero and all weapon shots backward without changing scroll movement or costs', () => {
  for (const weapon of ['azure', 'spread', 'pierce']) {
    const AH = game(), p = Object.create(AH.Player.prototype), shots = [];
    const sprite = display(), body = { velocity: { x: 0, y: 0 }, blocked: {}, touching: {},
      setVelocity(x, y) { this.velocity = { x, y }; },
      setVelocityX(x) { this.velocity.x = x; } };
    sprite.body = body;
    Object.assign(p, { sprite, mode: 'fly', facing: 1, pre: 'hero_', shieldFx: display(),
      invuln: 0, defender: 0, blastCd: 0, attackT: 0, slideT: 0, slideCd: 0,
      boost: 100, health: 100, speedMul: 1, weapon, weaponTime: 25, charge: 0,
      charging: false, fireBlocked: false, scene: { scrollSpeed: 130,
        cameras: { main: { scrollX: 0 } }, spawnBlast(...args) { shots.push(args); } } });
    p.update(0.016, { left: true, fireHeld: true });
    assert.equal(p.facing, -1);
    assert.equal(sprite.flipX, true);
    assert.ok(body.velocity.x < 130);
    p.update(0.016, { up: true, fireHeld: false });
    assert.equal(p.facing, -1, 'vertical flight preserves backward aim');
    assert.equal(shots[0][2], -1);
    assert.equal(shots[0][0], p.x - 20);
    assert.equal(shots[0][3].weapon, weapon);
    assert.equal(p.boost, 100 - AH.Weapons[weapon].cost + 14 * 0.016);
    p.blastCd = 0;
    p.update(0.016, { right: true, fireHeld: true });
    p.update(0.016, { fireHeld: false });
    assert.equal(p.facing, 1);
    assert.equal(sprite.flipX, false);
    assert.equal(shots[1][2], 1);
  }
});
