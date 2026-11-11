'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScripts, artScripts, recordingDocument } = require('./helpers/load-game');

function fixture(mode = 'run') {
  const AH = loadScripts(['systems/mission.js'], { AH: { Audio: { play() {} } } });
  const level = { mode, pipeZones: [{}], mission: {
    gemQuota: 2,
    objectives: [
      { id: 'key', kind: 'cache', x: 200, y: 180, label: 'DEPLOYMENT KEY', tip: 'KEY RECOVERED', required: true },
      { id: 'relay', kind: 'relay', x: 700, y: 230, label: 'SECURE RELAY', tip: 'AZURE RELAY SECURED', required: true },
      { id: 'scan', kind: 'scan', x: 900, y: 260, label: 'BONUS SCAN', tip: 'DEFENDER SCAN COMPLETE', required: false }
    ],
    gems: [
      { id: 'gem1', x: 400, y: 180 }, { id: 'gem2', x: 600, y: 180 },
      { id: 'gem3', x: 10000, y: 200, zone: 0 }
    ]
  } };
  const mission = new AH.Mission(level), score = [], messages = [];
  const scene = { L: level, inPipe: null, inBonus: false, addScore(...args) { score.push(args); }, toast(msg) { messages.push(msg); } };
  const player = { health: 100, x: 200, y: 180, onGround: true, shielding: false, ducking: false,
    body: { x: 193, y: 160, width: 14, height: 40 } };
  function move(x, y) { player.x = x; player.y = y; player.body.x = x - 7; player.body.y = y - 20; }
  return { AH, mission, scene, player, move, score, messages, level };
}

test('missions require deployment key, deliberate shield interaction and two gems, not just running', () => {
  const f = fixture(), { mission, scene, player, move, score } = f;
  assert.equal(mission.ready, false);
  move(700, 230);
  player.shielding = true;
  mission.update(2, player, scene);
  assert.equal(mission.objectives[1].done, false, 'relay cannot bypass key dependency');
  move(200, 180);
  mission.update(0.1, player, scene);
  assert.equal(mission.objectives[0].done, true);
  move(700, 230);
  player.shielding = false;
  mission.update(2, player, scene);
  assert.equal(mission.objectives[1].done, false, 'standing or jumping past is not enough');
  player.shielding = true;
  mission.update(0.75, player, scene);
  assert.equal(mission.objectives[1].progress, 0.5);
  assert.match(mission.snapshot(700).next, /50%/);
  mission.update(0.75, player, scene);
  assert.equal(mission.ready, false, 'gems also gate boss access');
  for (const x of [400, 600]) { move(x, 180); mission.update(0.1, player, scene); }
  assert.equal(mission.ready, true);
  assert.equal(mission.snapshot().done, 2);
  assert.equal(score.reduce((sum, entry) => sum + entry[0], 0), 3500);
  mission.update(1, player, scene);
  assert.equal(score.length, 4, 'cannot farm completed objectives/gems');
});

test('optional scan uses duck and extra underground gems never block required progress', () => {
  const { mission, scene, player, move } = fixture();
  move(900, 260);
  mission.update(2, player, scene);
  assert.equal(mission.objectives[2].done, false);
  player.ducking = true;
  mission.update(1, player, scene);
  assert.equal(mission.snapshot().bonus, 1);
  move(10000, 200);
  mission.update(1, player, scene);
  assert.equal(mission.gemCount, 0, 'pipe pickups cannot leak into main world');
  scene.inPipe = scene.L.pipeZones[0];
  mission.update(1, player, scene);
  assert.equal(mission.gemCount, 1);
  assert.ok(mission.pending().every((item) => item.def.zone === undefined));
});

test('flight waits for missed objectives and needed gems; relay requires a blast after key collection', () => {
  const { mission, scene, player, move } = fixture('fly');
  assert.equal(mission.scrollLimit(1000), 0);
  const shot = { x: 690, y: 220, w: 20, h: 20 };
  assert.equal(mission.hit(shot, scene), false);
  mission.update(0.1, player, scene);
  assert.equal(mission.scrollLimit(1000), 50, 'wait for first gem at x400');
  for (const x of [400, 600]) { move(x, 180); mission.update(0.1, player, scene); }
  assert.equal(mission.scrollLimit(1000), 350, 'relay remains in view until activated');
  assert.equal(mission.hit(shot, scene), true);
  assert.equal(mission.hit(shot, scene), false, 'one-time objective reward');
  assert.equal(mission.scrollLimit(1000), 1000, 'flight continues after required work');
  assert.equal(mission.ready, true, 'optional scan not required');
});

test('life loss preserves completed state while new runs reset it and legacy levels remain compatible', () => {
  const { AH, level, mission, player, scene } = fixture();
  mission.update(0.1, player, scene);
  player.health = 0;
  mission.update(1, player, scene);
  player.health = 100;
  assert.equal(mission.objectives[0].done, true, 'death never reconstructs mission state');
  const nextRun = new AH.Mission(level);
  assert.equal(nextRun.objectives[0].done, false);
  const legacy = new AH.Mission({ mode: 'run' });
  assert.equal(legacy.ready, true);
  assert.equal(legacy.snapshot(), null);
});

test('boss entry and direct completion refuse incomplete missions', () => {
  const AH = loadScripts(['systems/scenes.js'], {
    AH: { Levels: { ids: [1] }, Art: { D: 2 } }, globals: { Phaser: { Scene: class {} } }
  });
  const scene = new AH.Scenes[5](), notices = [];
  scene.player = { x: 0 };
  scene.mission = { ready: false, snapshot() { return { next: 'COLLECT BOSS TOKEN' }; } };
  scene.toast = (text) => notices.push(text);
  scene.startBoss();
  scene.levelComplete();
  assert.equal(scene.arenaLocked, undefined);
  assert.equal(scene.state, undefined);
  assert.equal(notices.length, 2);
});

test('mission art is registered through the real ordered modules', () => {
  const Art = loadScripts(artScripts(), { globals: { document: recordingDocument() } }).Art;
  for (const key of ['mission_gem', 'mission_cache', 'mission_relay', 'mission_scan']) {
    const canvas = Art.textureCanvas(key);
    assert.ok(canvas, key);
    assert.ok(canvas.width > 0 && canvas.height > 0);
    assert.ok(canvas.ops.length > 10, key + ' has detailed drawing operations');
  }
});

test('pipe returns cannot skip unfinished carriers, drops or required street objectives', () => {
  const { mission } = fixture();
  const entry = { x: 300, y: 254 }, back = { x: 1600, y: 254 };
  mission.tokens = [{ def: { id: 'token', x: 1200, y: 276 }, done: false, released: false }];
  mission.quota = 0;
  assert.equal(mission.pipeReturn(entry, back), entry, 'undefeated carrier remains on the street route');
  mission.tokens[0].released = true;
  assert.equal(mission.pipeReturn(entry, back), entry, 'released drop must still be collected');
  mission.tokens[0].done = true;
  assert.equal(mission.pipeReturn(entry, back), entry, 'required relay was also skipped');
  mission.objectives.filter(item => item.def.required).forEach(item => { item.done = true; });
  assert.equal(mission.pipeReturn(entry, back), back, 'completed work restores the forward shortcut');
  mission.tokens[0].done = false; mission.tokens[0].def.x = 200;
  assert.equal(mission.pipeReturn(entry, back), back, 'an earlier missed token is handled by backtracking time');
});

test('token recovery time covers round-trip distance and climb but cannot be farmed', () => {
  const { mission, AH } = fixture();
  const token = { def: { id: 'token', x: 500, y: -120 }, done: false, released: false };
  mission.tokens = [token];
  const reserve = Math.ceil(60 + 1500 * 2 / 150 + 360 * 2 / 90);
  assert.equal(mission.recoveryTime(2000, 500), 0, 'ample time does not consume the allowance');
  assert.equal(token.recoveryGranted, undefined);
  assert.equal(mission.recoveryTime(2000, 20), reserve - 20);
  assert.equal(mission.recoveryTime(2000, 1), 0, 'repeated checkpoints or deaths cannot refill it');
  assert.equal(mission.recoveryTime(9000, 1), 0, 'later checkpoints cannot reuse the same token');
  mission.tokens.push({ def: { id: 'second', x: 4000, y: 276 }, done: false });
  assert.equal(mission.recoveryTime(2000, 1), 0, 'ahead tokens never grant recovery time');
  assert.equal(mission.recoveryTime(5000, 1), Math.ceil(60 + 1000 * 2 / 150) - 1);
  mission.tokens.push({ def: { id: 'collected', x: 100, y: 276 }, done: true });
  assert.equal(mission.recoveryTime(5000, 1), 0, 'completed tokens never grant time');
  assert.equal(new AH.Mission({ mode: 'run' }).recoveryTime(5000, 1), 0, 'legacy levels remain compatible');
});

test('HUD prioritizes a missed carrier without mutating mission state', () => {
  const { mission } = fixture();
  mission.tokens = [{ def: { id: 'token', x: 400, y: 276 }, done: false, released: false }];
  const before = JSON.stringify(mission);
  assert.equal(mission.snapshot(900).next, 'DEFEAT TOKEN CARRIER LEFT');
  assert.equal(JSON.stringify(mission), before);
  mission.tokens[0].released = true;
  assert.equal(mission.snapshot(900).next, 'COLLECT BOSS TOKEN LEFT');
});

test('actual pipe return selection keeps checkpoint unchanged until the warp completes', () => {
  const { loadScripts, levelScripts } = require('./helpers/load-game');
  const AH = loadScripts(['systems/mission.js', 'systems/scenes.js'], {
    AH: { Levels: { ids: [1] }, Art: { D: 2 }, Audio: { play() {} } }, globals: { Phaser: { Scene: class {} } }
  });
  const L = loadScripts(levelScripts(), { seed: 42 }).Levels.make(1);
  const s = new AH.Scenes[5](), Z = L.pipeZones[0], entry = L.pipes[0];
  Object.assign(s, { L, state: 'play', inPipe: Z, cmd: { down: true }, warping: false,
    checkpoint: { x: 60, y: 300 }, mission: new AH.Mission(L), toast() {},
    pipes: [{ def: entry, Z }], pipeSkies: [], cameras: { main: {} } });
  s.mission.tokens = [{ def: { id: 'token', x: (entry.x + Z.back.x) / 2, y: 276 }, done: false }];
  const player = { onGround: true, x: Z.exit.x,
    body: { velocity: { x: 0 }, bottom: Z.exit.y } };
  let warp;
  s.warpPipe = (...args) => { warp = args; s.warping = true; };
  s.updatePipes(0.3, player);
  assert.deepEqual(warp.slice(2, 4), [entry.x, entry.y - 30]);
  assert.deepEqual(s.checkpoint, { x: 60, y: 300 });
  s.warping = false; s.mission.tokens[0].done = true;
  s.mission.objectives.forEach(item => { item.done = true; });
  s.mission.gems.forEach(item => { item.done = true; });
  s.updatePipes(0.3, player);
  assert.deepEqual(warp.slice(2, 4), [Z.back.x, Z.back.y - 30]);
});

test('completed return warp sets the actual safe checkpoint and budgets the skipped street', () => {
  const AH = loadScripts(['systems/mission.js', 'systems/scenes.js'], {
    AH: { Levels: { ids: [1] }, Art: { D: 2 }, Audio: { play() {} } }, globals: { Phaser: { Scene: class {} } }
  });
  const s = new AH.Scenes[5]();
  const mission = new AH.Mission({ mode: 'run', mission: {
    tokens: [{ id: 'token', x: 1200, y: 276 }], tokenQuota: 1
  } });
  let delayed, fade, reset;
  const camera = { fadeOut() {}, fadeIn() {}, once(event, fn) { fade = fn; } };
  Object.assign(s, { state: 'play', L: { region: 'westeurope' }, mission, timeLeft: 12,
    inPipe: { back: { x: 2000, y: 254 } }, checkpoint: { x: 60, y: 300 },
    cameras: { main: camera }, physics: { world: { setBounds() {} } },
    tweens: { add() {} }, time: { delayedCall(ms, fn) { delayed = fn; } },
    levelMusic() {}, outdoorBounds() {}, toast() {},
    player: { x: 500, cancelCharge() {}, sprite: {
      body: { enable: true, reset(x, y) { reset = [x, y]; } }, setPosition() {}, setVelocity() {}
    } } });
  s.warpPipe(10000, 254, 500, 224, [0, 5000], null);
  assert.equal(s.checkpoint.x, 60);
  assert.equal(s.player.sprite.body.enable, false);
  delayed(); assert.equal(s.checkpoint.x, 60);
  fade();
  assert.deepEqual([s.checkpoint.x, s.checkpoint.y], [500, 254]);
  assert.deepEqual(reset, [500, 224]);
  assert.equal(s.inPipe, null);
  assert.equal(s.warping, false);
  assert.equal(s.timeLeft, Math.ceil(60 + 800 * 2 / 150));
  assert.equal(mission.tokens[0].recoveryGranted, true);
  s.restoreTokenTime(2000); assert.equal(s.timeLeft, 71);
});
