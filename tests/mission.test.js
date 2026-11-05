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
    AH: { Levels: { ids: [1] } }, globals: { Phaser: { Scene: class {} } }
  });
  const scene = new AH.Scenes[5](), notices = [];
  scene.mission = { ready: false };
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
