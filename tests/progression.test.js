'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { artScripts, levelScripts, loadScripts, recordingDocument } = require('./helpers/load-game');
const plain = value => JSON.parse(JSON.stringify(value));

function game(raw, seed = 1) {
  let stored = raw ? JSON.stringify(raw) : null, writes = 0;
  const AH = loadScripts([...levelScripts(), 'systems/save.js', 'systems/scenes.js'], {
    seed, globals: { Phaser: { Scene: class {} }, localStorage: {
      getItem: () => stored, setItem(key, value) { stored = value; writes++; }
    } }
  });
  AH.Save.load();
  return { AH, stored: () => JSON.parse(stored), writes: () => writes };
}

test('legacy prefix migration preserves actual clears, access and resume without marking later worlds cleared', () => {
  const { AH } = game({ unlocked: 4, bests: { 3: 90 }, resume: { id: 4, score: 90, lives: 2 } });
  assert.deepEqual(plain(AH.Save.route()), { start: 1, cleared: [1, 2, 3], available: [1, 2, 3, 4] });
  assert.equal(AH.Save.worldCleared(9), false);
  assert.equal(AH.Save.worldOpen(4), true);
  assert.equal(AH.Save.worldOpen(9), false);
  assert.equal(AH.Save.data.resume.score, 90);
});

test('each regional start visits all remaining worlds randomly, without repeats, and persists the chosen destination', () => {
  const orders = new Set();
  for (let start = 1; start <= 11; start++) for (const seed of [1, 42, 2027]) {
    const { AH } = game({ unlocked: 1, route: { start, available: [start], cleared: [] } }, seed);
    const S = AH.Save, visited = [];
    let id = start;
    while (id) {
      assert.equal(S.worldOpen(id), true);
      assert.ok(!visited.includes(id));
      visited.push(id);
      const next = S.completeWorld(id);
      S.setResume(next, 100, 2);
      const before = plain(S.route());
      S.load();
      assert.deepEqual(plain(S.route()), before);
      if (next) assert.equal(S.data.resume.id, next, 'Continue reuses exact random destination');
      id = next;
    }
    assert.equal(visited.length, 11);
    assert.equal(S.data.resume, null);
    assert.equal(S.data.unlocked, 1, 'random high IDs do not grant fictitious prefix clears');
    assert.equal(S.route().cleared.length, 11);
    orders.add(visited.join(','));
    assert.throws(() => S.completeWorld(99), /UNKNOWN WORLD/);
  }
  assert.ok(orders.size > 11, 'routes vary with random seed, not only starting region');
});

test('route merges preserve non-prefix clears, bound IDs and never persist sandbox completion', () => {
  const { AH, writes } = game({ route: { start: 9, cleared: [9], available: [9, 3] } });
  AH.Save.mergeRoute({ route: { start: 9, cleared: [3, 3, '4', 100, null], available: [3, 11] } }, 9);
  assert.deepEqual(plain(AH.Save.route()), { start: 9, cleared: [9, 3], available: [9, 3, 11] });
  const before = plain(AH.Save.data), count = writes();
  AH.Run.gold = true;
  assert.equal(AH.Save.completeWorld(11), null);
  assert.deepEqual(plain(AH.Save.data), before);
  assert.equal(writes(), count);
});

test('selected registration start replaces pristine guest access without discarding played guest progress', () => {
  const remote = { route: { start: 9, cleared: [], available: [9] } };
  const fresh = game().AH.Save;
  fresh.mergeRoute(remote, 9);
  assert.deepEqual(plain(fresh.route()), remote.route);
  const guest = game({ unlocked: 1, resume: { id: 1, score: 0, lives: 3 } }).AH.Save;
  guest.mergeRoute(remote, 9);
  assert.deepEqual(plain(guest.route()), { start: 9, cleared: [], available: [9, 1] });
});

test('scene completion persists a non-prefix destination, handles all-cleared and keeps sandbox routes run-local', () => {
  for (const sandbox of [false, true]) for (const finalWorld of [false, true]) {
    const cleared = finalWorld ? [1, 2, 3, 4, 5, 6, 7, 8, 10, 11] : [];
    const { AH, writes } = game({ unlocked: 1, route: { start: 9, available: [9, ...cleared], cleared } });
    const before = plain(AH.Save.data), initialWrites = writes();
    AH.Audio = { music() {}, play() {} };
    AH.UI = { pad: (value, n) => String(value).padStart(n, '0') };
    AH.Run = { score: 100, lives: 2, gold: sandbox, cleared: sandbox ? cleared : undefined };
    const s = new AH.Scenes[5]();
    Object.assign(s, { state: 'play', mission: { ready: false }, timeLeft: 10, levelId: 9, L: { city: 'REDMOND' },
      player: { credits: 0, sprite: { setVelocity() {} } }, stats: { mfa: 0, kills: 0 },
      physics: { world: { pause() {} } }, postScore() {}, showPanel() {},
      toast() {}, scene: { start(key, data) { s.destination = { key, data }; } } });
    s.mission.snapshot = () => ({ next: 'FIND KEY' });
    s.levelComplete();
    assert.equal(s.state, 'play', 'incomplete mission cannot clear/open a world');
    assert.equal(writes(), initialWrites);
    s.mission.ready = true;
    s.levelComplete();
    assert.equal(s.state, 'complete');
    s.nextAction();
    if (sandbox) {
      assert.deepEqual(plain(AH.Save.data), before);
      assert.equal(writes(), initialWrites);
      assert.ok(AH.Run.cleared.includes(9));
    } else {
      assert.ok(AH.Save.worldCleared(9));
      assert.equal(AH.Save.data.unlocked, 1);
      assert.equal(AH.Save.data.bests[9], 200);
      if (!finalWorld) assert.equal(s.destination.data.id, AH.Save.data.resume.id);
    }
    if (finalWorld) {
      assert.equal(s.destination.key, 'Select');
      if (!sandbox) assert.equal(AH.Save.data.resume, null);
    } else {
      assert.equal(s.destination.key, 'Level');
      assert.ok(![9, ...cleared].includes(s.destination.data.id));
    }
  }
});

function display() {
  const d = { width: 100, img: null };
  for (const name of ['setScrollFactor', 'setDepth', 'setDisplaySize', 'setOrigin', 'setScale',
    'setText', 'setColor', 'setVisible', 'setAlpha', 'setPosition', 'setInteractive', 'destroy']) d[name] = () => d;
  return d;
}

test('local guide briefing waits for acknowledgment and review preserves completed mission state', () => {
  for (const mode of ['run', 'fly']) {
    const { AH } = game();
    const lines = [], states = [];
    AH.Audio = { play() {} };
    AH.Art = { D: 2, buildGuide: (scene, region) => 'local_' + region };
    AH.PixelText = function (scene, x, y, text) { lines.push(text); return display(); };
    AH.UI = { button: () => display() };
    const s = new AH.Scenes[5]();
    Object.assign(s, { L: { city: 'REDMOND', region: 'westus2' }, mode, overlayItems: [],
      player: { cancelCharge() {} }, physics: { world: { pause: () => states.push('pause'), resume: () => states.push('resume') } },
      tweens: { pauseAll() {}, resumeAll() {} }, add: { image: () => display() },
      mission: { tokenCount: 2 }, timeLeft: 500, setPaused: () => states.push('return to pause') });
    s.showBriefing();
    assert.equal(s.state, 'briefing');
    assert.equal(s.timeLeft, 500);
    assert.equal(s.mission.tokenCount, 2);
    assert.ok(lines.some(line => /TWO.*GEMS/.test(line)));
    assert.ok(lines.some(line => /THREE.*CARRIERS/.test(line)));
    assert.ok(lines.some(line => mode === 'fly' ? /BLAST THE RELAY/.test(line) : /HOLD E \/ SHIELD/.test(line)));
    s.briefingAction();
    assert.equal(s.state, 'play');
    s.showBriefing(true); s.briefingAction();
    assert.equal(states.at(-1), 'return to pause');
    assert.equal(s.mission.tokenCount, 2);
  }
});

test('Redmond guarantees Seattle market, coffee, Link transit and Microsoft campus highlights', () => {
  const AH = loadScripts(artScripts(), { globals: { document: recordingDocument() } });
  const route = AH.Art.sceneryRoutes.westus2.map(stop => stop[1]);
  for (const key of ['sc_rd_microsoft', 'sc_rd_market', 'sc_rd_coffee', 'sc_rd_link', 'sc_rd_commons', 'sc_rd_building92']) {
    assert.ok(route.includes(key));
    assert.ok(AH.Art.textureCanvas(key).ops.length > 40);
  }
  assert.ok(AH.Art.textureCanvas('amb_train_link'));
  assert.ok(AH.Art.textureCanvas('mission_briefing'));
  assert.deepEqual(plain(AH.Worlds.redmond.world.ambient.rail), ['link']);
});
