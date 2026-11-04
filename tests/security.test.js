'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'ah-boundaries-'));
process.env.DATA_DIR = data;
const { createServer, flush } = require('../server.js');

test('private APIs reject missing/invalid/revoked tokens and public responses omit account secrets', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    flush();
    fs.rmSync(data, { recursive: true });
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  const call = (method, route, body, token) => fetch(base + route, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  for (const [method, route, body] of [
    ['GET', '/api/me'], ['PUT', '/api/progress', { unlocked: 99 }],
    ['POST', '/api/score', { score: 100 }], ['POST', '/api/logout', {}]
  ]) {
    for (const token of [undefined, 'not-a-valid-session']) {
      const response = await call(method, route, body, token);
      assert.equal(response.status, 401, method + ' ' + route);
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
  }
  const registration = await call('POST', '/api/register', {
    name: 'SECURETEST', password: 'local-test-password', location: 'TEST'
  });
  assert.equal(registration.status, 201);
  const account = await registration.json();
  assert.deepEqual(Object.keys(account.profile).sort(), ['best', 'location', 'name', 'progress']);
  const me = await call('GET', '/api/me', undefined, account.token);
  assert.equal(me.status, 200);
  assert.deepEqual(Object.keys((await me.json()).profile).sort(), ['best', 'location', 'name', 'progress']);
  const malformed = await fetch(base + '/api/progress', {
    method: 'PUT', headers: { authorization: 'Bearer ' + account.token, 'content-type': 'application/json' }, body: '{'
  });
  assert.equal(malformed.status, 400);
  assert.equal((await call('POST', '/api/score', { score: 100, level: 1 }, account.token)).status, 200);
  const leaderboard = await (await call('GET', '/api/leaderboard')).json();
  assert.deepEqual(Object.keys(leaderboard.rows[0]).sort(), ['city', 'date', 'level', 'location', 'name', 'rank', 'score']);
  assert.equal((await call('POST', '/api/logout', {}, account.token)).status, 200);
  assert.equal((await call('GET', '/api/me', undefined, account.token)).status, 401);

  for (const file of ['/server.js', '/data/heroes.json', '/.env', '/.git/config',
    '/AGENTS.md', '/.github/workflows/validate.yml', '/art/%2e%2e%2fserver.js']) {
    assert.equal((await fetch(base + file)).status, 404, 'never serve ' + file);
  }
  const index = await fetch(base + '/');
  assert.equal(index.status, 200);
  assert.equal(index.headers.get('x-content-type-options'), 'nosniff');
  assert.match(index.headers.get('content-security-policy'), /connect-src 'self'/);
});
