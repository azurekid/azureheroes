'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createAzureTableStore } = require('../table-store');
const { createConfiguredStore, createServer } = require('../server');

class MemoryTable {
  constructor() {
    this.entities = new Map();
    this.version = 0;
    this.conflictNextUpdate = false;
  }

  key(partitionKey, rowKey) {
    return `${partitionKey}\u0000${rowKey}`;
  }

  async getEntity(partitionKey, rowKey) {
    const entity = this.entities.get(this.key(partitionKey, rowKey));
    if (!entity) throw Object.assign(new Error('missing entity'), { statusCode: 404 });
    return { ...entity };
  }

  async createEntity(entity) {
    const key = this.key(entity.partitionKey, entity.rowKey);
    if (this.entities.has(key)) throw Object.assign(new Error('duplicate entity'), { statusCode: 409 });
    this.entities.set(key, { ...entity, etag: this.nextEtag() });
  }

  async updateEntity(entity, mode, options = {}) {
    const key = this.key(entity.partitionKey, entity.rowKey);
    const current = this.entities.get(key);
    if (!current) throw Object.assign(new Error('missing entity'), { statusCode: 404 });
    if (this.conflictNextUpdate) {
      this.conflictNextUpdate = false;
      this.entities.set(key, { ...current, Data: JSON.stringify({ fromConcurrentWrite: true }), etag: this.nextEtag() });
      throw Object.assign(new Error('etag conflict'), { statusCode: 412 });
    }
    if (options.etag && options.etag !== current.etag) {
      throw Object.assign(new Error('etag conflict'), { statusCode: 412 });
    }
    this.entities.set(key, {
      ...(mode === 'Replace' ? {} : current),
      ...entity,
      etag: this.nextEtag()
    });
  }

  async deleteEntity(partitionKey, rowKey, options = {}) {
    const key = this.key(partitionKey, rowKey);
    const current = this.entities.get(key);
    if (!current) throw Object.assign(new Error('missing entity'), { statusCode: 404 });
    if (options.etag && options.etag !== current.etag) {
      throw Object.assign(new Error('etag conflict'), { statusCode: 412 });
    }
    this.entities.delete(key);
  }

  async submitTransaction(actions) {
    const draft = new Map(this.entities);
    for (const [action, entity, mode, options = {}] of actions) {
      const key = this.key(entity.partitionKey, entity.rowKey);
      const current = draft.get(key);
      if (action === 'create' && current) throw Object.assign(new Error('duplicate entity'), { statusCode: 409 });
      if (action === 'update') {
        if (!current || (options.etag && current.etag !== options.etag)) {
          throw Object.assign(new Error('etag conflict'), { statusCode: 412 });
        }
        draft.set(key, { ...(mode === 'Replace' ? {} : current), ...entity, etag: this.nextEtag() });
      } else if (action === 'delete') {
        if (!current) throw Object.assign(new Error('missing entity'), { statusCode: 404 });
        draft.delete(key);
      } else if (action === 'create') {
        draft.set(key, { ...entity, etag: this.nextEtag() });
      }
    }
    this.entities = draft;
  }

  async *listEntities({ queryOptions }) {
    const filter = queryOptions.filter;
    const partition = /PartitionKey eq '([^']+)'/.exec(filter)?.[1];
    const rowMin = /RowKey ge '([^']+)'/.exec(filter)?.[1];
    const rowMax = /RowKey lt '([^']+)'/.exec(filter)?.[1];
    const scoreMin = /Score gt (\d+)/.exec(filter)?.[1];
    const expiryMax = /Expires le (\d+)/.exec(filter)?.[1];
    const entries = [...this.entities.values()]
      .filter((entity) => partition === undefined || entity.partitionKey === partition)
      .filter((entity) => rowMin === undefined || entity.rowKey >= rowMin)
      .filter((entity) => rowMax === undefined || entity.rowKey < rowMax)
      .filter((entity) => scoreMin === undefined || entity.Score > Number(scoreMin))
      .filter((entity) => expiryMax === undefined || entity.Expires <= Number(expiryMax))
      .sort((a, b) => a.partitionKey.localeCompare(b.partitionKey) || a.rowKey.localeCompare(b.rowKey));
    for (const entity of entries) yield { ...entity };
  }

  nextEtag() {
    this.version++;
    return `etag-${this.version}`;
  }
}

function createStore() {
  const clients = {
    accounts: new MemoryTable(),
    sessions: new MemoryTable(),
    progress: new MemoryTable(),
    leaderboard: new MemoryTable()
  };
  const store = createAzureTableStore({
    endpoint: 'https://example.table.core.windows.net/',
    tableNames: { accounts: 'accounts', sessions: 'sessions', progress: 'progress', leaderboard: 'leaderboard' },
    credential: {},
    production: false
  }, clients);
  return { clients, store };
}

function user(name, scoreProgress = { unlocked: 1, bests: {}, resume: null, updated: 0 }) {
  return {
    name,
    location: 'TEST',
    salt: 'salt',
    hash: 'hash',
    created: 1,
    progress: scoreProgress
  };
}

test('Azure table provider requires HTTPS endpoint and all table names', () => {
  assert.throws(() => createConfiguredStore({ PERSISTENCE_PROVIDER: 'other' }), /Unsupported/);
  assert.throws(() => createConfiguredStore({ PERSISTENCE_PROVIDER: 'azure-tables' }), /AZURE_TABLE_ENDPOINT/);
  assert.throws(() => createConfiguredStore({
    PERSISTENCE_PROVIDER: 'azure-tables',
    AZURE_TABLE_ENDPOINT: 'http://example.test',
    AZURE_TABLE_ACCOUNTS: 'accounts',
    AZURE_TABLE_SESSIONS: 'sessions',
    AZURE_TABLE_PROGRESS: 'progress',
    AZURE_TABLE_LEADERBOARD: 'leaderboard'
  }), /HTTPS/);
  assert.throws(() => createConfiguredStore({
    PERSISTENCE_PROVIDER: 'azure-tables',
    AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
    AZURE_TABLE_ACCOUNTS: 'accounts'
  }), /AZURE_TABLE_SESSIONS/);
});

test('managed-identity table store checks all tables and creates account records once', async () => {
  const { clients, store } = createStore();
  await store.initialize();
  assert.equal(await store.createUser('ada', user('ADA')), true);
  assert.equal(await store.createUser('ada', user('ADA')), false);
  const saved = await store.getUser('ada');
  assert.equal(saved.name, 'ADA');
  assert.deepEqual(saved.progress, { unlocked: 1, bests: {}, resume: null, updated: 0 });
  assert.equal(saved.hash, 'hash');
  assert.equal(clients.progress.entities.size, 1);
});

test('account API uses the Table adapter end-to-end without exposing stored credentials', async (t) => {
  const { clients, store } = createStore();
  await store.initialize();
  const server = createServer({ store });
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, body, token) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
  };

  const registration = await call('POST', '/api/register', {
    name: 'PERSIST',
    password: 'test-password',
    location: 'TEST',
    startLevel: 9
  });
  assert.equal(registration.status, 201);
  assert.equal(registration.body.profile.progress.route.start, 9);
  assert.equal(Object.hasOwn(registration.body.profile, 'hash'), false);
  const tokenRows = [...clients.sessions.entities.values()];
  assert.equal(tokenRows.length, 1);
  assert.notEqual(tokenRows[0].rowKey, registration.body.token);
  assert.equal((await call('POST', '/api/register', {
    name: 'persist',
    password: 'test-password',
    location: 'TEST'
  })).status, 409);

  const saved = await call('PUT', '/api/progress', {
    route: { start: 1, available: [1, 9], cleared: [9] },
    updated: 20,
    resume: { id: 9, score: 100, lives: 2 }
  }, registration.body.token);
  assert.equal(saved.body.profile.progress.route.start, 9);
  assert.deepEqual(saved.body.profile.progress.route.cleared, [9]);
  assert.deepEqual(await call('POST', '/api/score', {
    score: 900,
    level: 9,
    city: 'REDMOND'
  }, registration.body.token).then((result) => result.body), { best: 900, rank: 1 });
  assert.equal((await call('GET', '/api/leaderboard')).body.rows[0].name, 'PERSIST');
  assert.equal((await call('POST', '/api/logout', {}, registration.body.token)).status, 200);
  assert.equal((await call('GET', '/api/me', undefined, registration.body.token)).status, 401);
});

test('sessions are expired, resolved and revoked without storing bearer tokens', async () => {
  const { clients, store } = createStore();
  await store.createUser('ada', user('ADA'));
  await store.createSession('hashed-active-token', 'ada', Date.now() + 60000);
  const sessionRows = [...clients.sessions.entities.values()];
  assert.equal(sessionRows[0].rowKey, 'hashed-active-token');
  assert.equal(sessionRows[0].User, 'ada');
  assert.equal(await store.getUserByToken('hashed-active-token').then((value) => value.name), 'ADA');
  await store.createSession('hashed-expired-token', 'ada', Date.now() - 1);
  assert.equal(await store.getUserByToken('hashed-expired-token'), null);
  assert.equal(clients.sessions.entities.has(clients.sessions.key('has', 'hashed-expired-token')), false);
  await store.deleteSession('hashed-active-token');
  assert.equal(await store.getUserByToken('hashed-active-token'), null);
});

test('progress update retries an ETag race and stores only bounded JSON', async () => {
  const { clients, store } = createStore();
  await store.createUser('ada', user('ADA'));
  clients.progress.conflictNextUpdate = true;
  let merges = 0;
  const result = await store.mergeProgress('ada', { unlocked: 3 }, (incoming, old) => {
    merges++;
    return { ...old, ...incoming };
  });
  assert.equal(merges, 2);
  assert.equal(result.fromConcurrentWrite, true);
  assert.equal(result.unlocked, 3);
  await assert.rejects(() => store.mergeProgress('ada', {}, () => ({ value: 'x'.repeat(50 * 1024) })), /storage limit/);
});

test('leaderboard score changes use a single-partition index and replace prior rows atomically', async () => {
  const { clients, store } = createStore();
  await store.createUser('ada', user('ADA'));
  await store.createUser('grace', user('GRACE'));
  await store.updateScore('ada', { score: 100, level: 2, city: 'PARIS', date: 10, name: 'ADA', location: 'TEST' });
  await store.updateScore('grace', { score: 200, level: 3, city: 'REDMOND', date: 20, name: 'GRACE', location: 'TEST' });
  const updated = await store.updateScore('ada', { score: 300, level: 4, city: 'TOKYO', date: 30, name: 'ADA', location: 'TEST' });
  assert.deepEqual(updated, { best: 300, rank: 1 });
  const board = await store.getLeaderboard(5);
  assert.deepEqual(board.rows.map((row) => [row.name, row.score]), [['ADA', 300], ['GRACE', 200]]);
  assert.equal(board.players, 2);
  const scoreRows = [...clients.leaderboard.entities.values()].filter((entry) => entry.rowKey.startsWith('score:'));
  assert.equal(scoreRows.length, 2);
});
