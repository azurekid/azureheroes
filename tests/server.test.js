/* API tests for server.js: npm test */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const os = require('os'), fs = require('fs'), path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ah-'));
const { createServer, flush } = require('../server.js');

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
  const tok = (await call('POST', '/api/login', { name: 'ada', password: 'secret1' })).body.token;
  assert.ok(tok);

  assert.equal((await call('PUT', '/api/progress', { unlocked: 3 })).status, 401);
  const p = await call('PUT', '/api/progress', { unlocked: 4, bests: { 1: 5000, 2: 'x' }, resume: { id: 4, score: 9000, lives: 2 }, updated: 10 }, tok);
  assert.deepEqual(p.body.profile.progress.resume, { id: 4, score: 9000, lives: 2 });
  const p2 = await call('PUT', '/api/progress', { unlocked: 2, resume: { id: 1, score: 0, lives: 3 }, updated: 5 }, tok);
  assert.equal(p2.body.profile.progress.unlocked, 4, 'unlocks never go backwards');
  assert.equal(p2.body.profile.progress.resume.id, 4, 'older resume ignored');

  const reg2 = await call('POST', '/api/register', { name: 'GRACE', password: 'secret2', location: 'Redmond, US' });
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
    'worlds/%2e%2e%2fserver.js', 'audio/%2e%2e%2fdata/heroes.json']) {
    assert.equal((await fetch(base + '/' + privatePath)).status, 404, privatePath + ' stays private');
  }
  flush();
  assert.ok(fs.existsSync(path.join(process.env.DATA_DIR, 'heroes.json')));
});
