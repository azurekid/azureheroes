/* API tests for server.js: npm test */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const os = require('os'), fs = require('fs'), path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ah-'));
const { createServer, flush } = require('../server.js');

test('server regional bounds match the stable world catalogue', () => {
  const { levelScripts, loadScripts } = require('./helpers/load-game');
  const { Levels } = loadScripts(levelScripts());
  const source = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  assert.equal(Number(source.match(/const WORLD_COUNT = (\d+);/)[1]), Levels.ids.length);
  assert.deepEqual(Array.from(Levels.ids), Array.from({ length: Levels.ids.length }, (_, i) => i + 1));
});

test('accounts, progress, scores and leaderboard', async (t) => {
  const srv = createServer();
  await new Promise((r) => srv.listen(0, r));
  t.after(() => srv.close());
  const base = 'http://localhost:' + srv.address().port;
  const call = async (method, url, body, token) => {
    const r = await fetch(base + url, { method, headers: Object.assign({ 'content-type': 'application/json' }, token ? { authorization: 'Bearer ' + token } : {}), body: body ? JSON.stringify(body) : undefined });
    return { status: r.status, body: await r.json() };
  };

  assert.equal((await call('GET', '/api/health')).status, 200);
  assert.equal((await call('POST', '/api/register', { name: 'x', password: 'secret1', location: 'NL' })).status, 400);
  const reg = await call('POST', '/api/register', { name: 'Ada', password: 'secret1', location: 'Amsterdam; NL<script>' });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.profile.name, 'ADA');
  assert.equal(reg.body.profile.location, 'AMSTERDAM NLSCRIPT');
  assert.equal((await call('POST', '/api/register', { name: 'ada', password: 'secret1', location: 'NL' })).status, 409);
  assert.equal((await call('POST', '/api/login', { name: 'ADA', password: 'wrong!!' })).status, 401);
  for (const startLevel of [0, 12, 9.5, '9', {}, null]) {
    assert.equal((await call('POST', '/api/register', { name: 'REGION', password: 'secret1', location: 'US', startLevel })).status, 400);
  }
  const regional = await call('POST', '/api/register', { name: 'REGION', password: 'secret1', location: 'US', startLevel: 9,
    progress: { route: { start: 1, available: [1], cleared: [] }, wardrobe: { items: [], legacyUnlocked: 1, legacyClassic: false } } });
  assert.equal(regional.status, 201);
  assert.equal(regional.body.profile.startLevel, 9);
  assert.deepEqual(regional.body.profile.progress.route, { start: 9, available: [9], cleared: [] });
  assert.equal(regional.body.profile.progress.resume.id, 9);
  const rp = await call('PUT', '/api/progress', { startLevel: 2,
    route: { start: 2, cleared: [9, 9, -1, 12, '3', {}, null], available: [9, 3] } }, regional.body.token);
  assert.equal(rp.body.profile.startLevel, 9, 'ordinary progress cannot rewrite registration region');
  assert.equal(rp.body.profile.progress.route.start, 9);
  assert.deepEqual(rp.body.profile.progress.route.cleared, [9]);
  assert.deepEqual(rp.body.profile.progress.route.available, [9, 2, 3]);
  const rp2 = await call('PUT', '/api/progress', { route: { cleared: [3], available: [11] } }, regional.body.token);
  assert.deepEqual(rp2.body.profile.progress.route.cleared, [9, 3]);
  assert.ok(rp2.body.profile.progress.route.available.includes(11));
  const oversized = await call('PUT', '/api/progress', { route: {
    start: 9, cleared: Array(100).fill(9).concat(11), available: [9, {}, '11', 100, -1]
  } }, regional.body.token);
  assert.deepEqual(oversized.body.profile.progress.route.cleared, [9, 3], 'oversized route is bounded before merging');
  assert.ok(oversized.body.profile.progress.route.available.every(id => Number.isInteger(id) && id >= 1 && id <= 11));
  assert.equal((await call('PUT', '/api/progress', { route: { cleared: [9] } })).status, 401);
  const tok = (await call('POST', '/api/login', { name: 'ada', password: 'secret1' })).body.token;
  assert.ok(tok);

  assert.equal((await call('PUT', '/api/progress', { unlocked: 3 })).status, 401);
  const p = await call('PUT', '/api/progress', { unlocked: 4, bests: { 1: 5000, 2: 'x' }, resume: { id: 4, score: 9000, lives: 2 }, updated: 10 }, tok);
  assert.deepEqual(p.body.profile.progress.resume, { id: 4, score: 9000, lives: 2 });
  const p2 = await call('PUT', '/api/progress', { unlocked: 2, resume: { id: 1, score: 0, lives: 3 }, updated: 5 }, tok);
  assert.equal(p2.body.profile.progress.unlocked, 4, 'unlocks never go backwards');
  assert.equal(p2.body.profile.progress.resume.id, 4, 'older resume ignored');

  const reg2 = await call('POST', '/api/register', { name: 'GRACE', password: 'secret2', location: 'Redmond, US' });
  const wardrobeAccount = await call('POST', '/api/register', { name: 'WARDROBE', password: 'test-only-password', location: 'NL',
    progress: { unlocked: 1, wardrobe: { items: [], legacyUnlocked: 1, legacyClassic: false } } });
  const wt = wardrobeAccount.body.token;
  assert.equal(wardrobeAccount.body.profile.progress.wardrobe.legacyClassic, false);
  const collected = await call('PUT', '/api/progress', { unlocked: 4, wardrobe: {
    items: ['suit:5', 'hat:crown', 'hat:crown', 'suit:gold', '<script>', {}, null, '__proto__'],
    legacyUnlocked: 'bad', legacyClassic: 'true'
  } }, wt);
  assert.deepEqual(collected.body.profile.progress.wardrobe, { items: ['suit:5', 'hat:crown'], legacyUnlocked: 1, legacyClassic: false });
  const merged = await call('PUT', '/api/progress', { wardrobe: { items: ['gear:tulip'], legacyUnlocked: 1, legacyClassic: false } }, wt);
  assert.deepEqual(merged.body.profile.progress.wardrobe.items, ['suit:5', 'hat:crown', 'gear:tulip']);
  const legacyClient = await call('PUT', '/api/progress', { unlocked: 12 }, wt);
  assert.deepEqual(legacyClient.body.profile.progress.wardrobe, merged.body.profile.progress.wardrobe, 'old client cannot regrant clothes on future clears');
  const bounded = await call('PUT', '/api/progress', { wardrobe: { items: Array.from({ length: 300 }, (_, i) => 'gear:item' + i) } }, wt);
  assert.equal(bounded.body.profile.progress.wardrobe.items.length, 128);
  assert.equal((await call('PUT', '/api/progress', { wardrobe: { items: ['hat:cap'] } })).status, 401);
  const legacyAccount = await call('POST', '/api/register', { name: 'LEGACY', password: 'test-only-password', location: 'NL', progress: { unlocked: 5 } });
  assert.equal(legacyAccount.body.profile.progress.wardrobe.legacyUnlocked, 5);
  assert.equal(legacyAccount.body.profile.progress.wardrobe.legacyClassic, true);
  await call('POST', '/api/score', { score: 12000, level: 3, city: 'PARIS' }, tok);
  await call('POST', '/api/score', { score: 500, level: 1 }, tok);
  const s = await call('POST', '/api/score', { score: 99999999, level: 9, city: 'REDMOND' }, reg2.body.token);
  assert.equal(s.body.best, 9999999, 'score capped');
  const lb = await call('GET', '/api/leaderboard?limit=5');
  assert.deepEqual(lb.body.rows.map((r) => [r.name, r.location, r.score, r.city]), [['GRACE', 'REDMOND, US', 9999999, 'REDMOND'], ['ADA', 'AMSTERDAM NLSCRIPT', 12000, 'PARIS']]);

  const st = await fetch(base + '/server.js');
  assert.equal(st.status, 404, 'server source and data are not served');
  assert.equal((await fetch(base + '/data/heroes.json')).status, 404);
  assert.equal((await fetch(base + '/')).status, 200);
  const { localScripts } = require('./helpers/load-game');
  for (const script of localScripts()) {
    const response = await fetch(base + '/' + script);
    assert.equal(response.status, 200, script + ' is served');
    assert.match(response.headers.get('content-type'), /javascript/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
  for (const privatePath of ['.github/skills/game-contract/SKILL.md', 'tests/helpers/load-game.js',
    'infra/main.bicep', '.azure/infrastructure-plan.json',
    'worlds/%2e%2e%2fserver.js', 'audio/%2e%2e%2fdata/heroes.json']) {
    assert.equal((await fetch(base + '/' + privatePath)).status, 404, privatePath + ' stays private');
  }
  flush();
  assert.ok(fs.existsSync(path.join(process.env.DATA_DIR, 'heroes.json')));
});
