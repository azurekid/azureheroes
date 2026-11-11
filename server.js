/* Microsoft Azure Heroes 2027 - Azure App Service host.
   Serves the static game and a small JSON API for player accounts, progress sync and the
   global high score dashboard. Local development uses JSON; Azure uses managed identity
   and Azure Table Storage.

   Env:
     PORT       port to listen on (App Service sets this)
     DATA_DIR   folder for the local JSON store. Default: ./data
     PERSISTENCE_PROVIDER  `json` locally or `azure-tables` in Azure
*/
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8080;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'heroes.json');
const TOKEN_TTL = 1000 * 60 * 60 * 24 * 30;
const MAX_BODY = 16 * 1024;
const MAX_SCORE = 9999999;
const MAX_LEVEL = 99;
const WORLD_COUNT = 11;
const LEADERBOARD_SIZE = 100;

/* ------------------------------------------------------------------ store */
// The game's pixel font supports A-Z 0-9 space and - . ! ' : / + , ? so names are kept to that set.
const NAME_RE = /^[A-Z0-9][A-Z0-9 _.-]{1,13}[A-Z0-9]$/;
const cleanText = (s, max) => String(s || '').toUpperCase().replace(/[^A-Z0-9 .,'\-!/+:?]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

let db = { users: {}, tokens: {} };
function load() {
  try {
    db = Object.assign({ users: {}, tokens: {} }, JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
}
let saveTimer = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(flush, 250);
}
function flush() {
  clearTimeout(saveTimer);
  saveTimer = null;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, DB_FILE);
}

function hashPassword(pw, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  return { salt, hash: crypto.scryptSync(pw, salt, 32).toString('hex') };
}
function checkPassword(pw, u) {
  const h = Buffer.from(hashPassword(pw, u.salt).hash, 'hex');
  const ref = Buffer.from(u.hash, 'hex');
  return h.length === ref.length && crypto.timingSafeEqual(h, ref);
}
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
async function issueToken(key, store) {
  const tok = crypto.randomBytes(32).toString('base64url');
  await store.createSession(sha(tok), key, Date.now() + TOKEN_TTL);
  return tok;
}
function userFromReq(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!m) return null;
  const t = db.tokens[sha(m[1])];
  if (!t || t.exp < Date.now()) return null;
  return db.users[t.user] || null;
}
const publicProfile = (u) => ({
  name: u.name,
  location: u.location,
  best: u.best,
  progress: u.progress || sanitizeProgress({}),
  startLevel: u.startLevel
});

function createJsonStore() {
  return {
    async initialize() {},
    async getUser(key) {
      const user = db.users[key];
      return user ? Object.assign({ key }, user) : null;
    },
    async createUser(key, user) {
      if (db.users[key]) return false;
      db.users[key] = user;
      save();
      return true;
    },
    async createSession(tokenHash, userKey, expiresAt) {
      db.tokens[tokenHash] = { user: userKey, exp: expiresAt };
      save();
    },
    async getUserByToken(tokenHash) {
      const token = db.tokens[tokenHash];
      if (!token) return null;
      if (token.exp < Date.now()) {
        delete db.tokens[tokenHash];
        save();
        return null;
      }
      return this.getUser(token.user);
    },
    async deleteSession(tokenHash) {
      if (db.tokens[tokenHash]) {
        delete db.tokens[tokenHash];
        save();
      }
    },
    async mergeProgress(key, incoming, merge) {
      const user = db.users[key];
      user.progress = merge(incoming, user.progress);
      save();
      return user.progress;
    },
    async updateScore(key, input) {
      const user = db.users[key];
      if (input.score > (user.best || 0)) {
        user.best = input.score;
        user.bestAt = input.date;
        user.bestLevel = input.level;
        user.bestCity = input.city;
        save();
      }
      const rank = user.best > 0
        ? 1 + Object.values(db.users).filter((entry) => entry.best > user.best).length
        : null;
      return { best: user.best, rank };
    },
    async getLeaderboard(limit) {
      const rows = Object.values(db.users).filter((user) => user.best > 0)
        .sort((a, b) => b.best - a.best || a.bestAt - b.bestAt).slice(0, limit)
        .map((user, i) => ({
          rank: i + 1,
          name: user.name,
          location: user.location,
          score: user.best,
          level: user.bestLevel || 1,
          city: user.bestCity || '',
          date: user.bestAt || 0
        }));
      return { rows, players: Object.keys(db.users).length };
    },
    async pruneExpiredSessions() {
      const now = Date.now();
      let removed = 0;
      Object.keys(db.tokens).forEach((key) => {
        if (db.tokens[key].exp < now) {
          delete db.tokens[key];
          removed++;
        }
      });
      if (removed) save();
      return removed;
    }
  };
}
const jsonStore = createJsonStore();

/* ------------------------------------------------------------------ helpers */
const hits = new Map();
function limited(req, bucket, max, windowMs) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const key = bucket + '|' + ip, now = Date.now();
  const h = hits.get(key) || { n: 0, t: now };
  if (now - h.t > windowMs) { h.n = 0; h.t = now; }
  h.n++;
  hits.set(key, h);
  return h.n > max;
}
setInterval(() => { const now = Date.now(); hits.forEach((v, k) => { if (now - v.t > 3600000) hits.delete(k); }); }, 600000).unref();

function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(body);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('BODY TOO LARGE'), { code: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(Object.assign(new Error('BAD JSON'), { code: 400 })); }
    });
    req.on('error', reject);
  });
}
const int = (v, lo, hi) => { v = Math.floor(Number(v)); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; };
const routeIds = (list) => [...new Set((Array.isArray(list) ? list : []).slice(0, WORLD_COUNT * 2)
  .filter(id => Number.isInteger(id) && id >= 1 && id <= WORLD_COUNT))];
function cleanRoute(progress) {
  const r = progress.route;
  if (r && typeof r === 'object') {
    const start = int(r.start, 1, WORLD_COUNT), cleared = routeIds(r.cleared);
    return { start, cleared, available: routeIds([start, ...routeIds(r.available), ...cleared]) };
  }
  return { start: 1, cleared: Array.from({ length: Math.min(WORLD_COUNT, int(progress.unlocked, 1, MAX_LEVEL) - 1) }, (_, i) => i + 1),
    available: routeIds([...Array.from({ length: Math.min(WORLD_COUNT, int(progress.unlocked, 1, MAX_LEVEL)) }, (_, i) => i + 1),
      progress.resume?.id]) };
}

function sanitizeProgress(p, old) {
  p = p && typeof p === 'object' ? p : {};
  const previous = old;
  old = old || { unlocked: 1, bests: {}, resume: null, updated: 0 };
  const out = { unlocked: Math.max(old.unlocked || 1, int(p.unlocked, 1, MAX_LEVEL)), bests: Object.assign({}, old.bests), resume: old.resume, updated: old.updated || 0 };
  const cleanWardrobe = (progress, legacy) => {
    const w = progress.wardrobe;
    if (!w || typeof w !== 'object') return { items: [], legacyUnlocked: legacy ? int(progress.unlocked, 1, MAX_LEVEL) : 1, legacyClassic: !!legacy };
    return {
      items: [...new Set((Array.isArray(w.items) ? w.items : []).slice(0, 128).filter((id) =>
        typeof id === 'string' && /^(?:suit:(?:[0-9]|1[0-8])|(?:hair|hat|gear):[a-z][a-z0-9]{0,31})$/.test(id)))],
      legacyUnlocked: int(w.legacyUnlocked, 1, MAX_LEVEL), legacyClassic: w.legacyClassic === true
    };
  };
  const a = cleanWardrobe(old, !!previous), b = cleanWardrobe(p, !previous && !p.wardrobe);
  out.wardrobe = {
    items: [...new Set([...a.items, ...b.items])].slice(0, 128),
    legacyUnlocked: Math.max(a.legacyUnlocked, b.legacyUnlocked), legacyClassic: a.legacyClassic || b.legacyClassic
  };
  const localRoute = cleanRoute(old), remoteRoute = cleanRoute(p);
  out.route = { start: previous ? localRoute.start : remoteRoute.start,
    cleared: routeIds([...localRoute.cleared, ...remoteRoute.cleared]),
    available: routeIds([...localRoute.available, ...remoteRoute.available]) };
  if (p.bests && typeof p.bests === 'object') {
    Object.keys(p.bests).slice(0, MAX_LEVEL).forEach((k) => {
      const id = int(k, 1, MAX_LEVEL), s = int(p.bests[k], 0, MAX_SCORE);
      if (s > (out.bests[id] || 0)) out.bests[id] = s;
    });
  }
  const upd = int(p.updated, 0, 8.64e15);
  if (p.resume === null && upd >= out.updated) { out.resume = null; out.updated = upd; }
  else if (p.resume && typeof p.resume === 'object' && upd >= out.updated) {
    out.resume = { id: int(p.resume.id, 1, MAX_LEVEL), score: int(p.resume.score, 0, MAX_SCORE), lives: int(p.resume.lives, 1, 9) };
    out.updated = upd;
  }
  return out;
}

/* ------------------------------------------------------------------ api */
async function api(req, res, url, store) {
  const route = req.method + ' ' + url.pathname;
  if (route === 'GET /api/health') return send(res, 200, { ok: true, game: 'azure-heroes-2027' });

  if (route === 'GET /api/leaderboard') {
    const limit = int(url.searchParams.get('limit') || 20, 1, LEADERBOARD_SIZE);
    return send(res, 200, await store.getLeaderboard(limit));
  }

  if (route === 'POST /api/register' || route === 'POST /api/login') {
    if (limited(req, 'auth', 20, 600000)) return send(res, 429, { error: 'TOO MANY ATTEMPTS, TRY LATER' });
    const b = await readJson(req);
    const name = cleanText(b.name, 15), pw = String(b.password || '');
    const key = name.toLowerCase();
    if (!NAME_RE.test(name)) return send(res, 400, { error: 'NAME: 3-15 LETTERS OR DIGITS' });
    if (pw.length < 6 || pw.length > 128) return send(res, 400, { error: 'PASSWORD: 6+ CHARACTERS' });
    if (route === 'POST /api/register') {
      const location = cleanText(b.location, 20);
      if (location.length < 2) return send(res, 400, { error: 'ENTER YOUR LOCATION' });
      if (b.startLevel !== undefined && (!Number.isInteger(b.startLevel) || b.startLevel < 1 || b.startLevel > WORLD_COUNT))
        return send(res, 400, { error: 'CHOOSE A REPRESENTED REGION' });
      const progress = sanitizeProgress(b.progress);
      if (b.startLevel !== undefined) {
        const r = progress.route;
        r.start = b.startLevel;
        r.available = routeIds([b.startLevel, ...(r.cleared.length || progress.unlocked > 1 ? r.available : [])]);
        progress.resume = { id: b.startLevel, score: 0, lives: 3 };
        progress.updated = Date.now();
      }
      const h = hashPassword(pw);
      const user = {
        key,
        name,
        location,
        startLevel: b.startLevel,
        salt: h.salt,
        hash: h.hash,
        created: Date.now(),
        best: 0,
        bestAt: 0,
        progress
      };
      if (!(await store.createUser(key, user))) return send(res, 409, { error: 'NAME ALREADY TAKEN' });
      const token = await issueToken(key, store);
      return send(res, 201, { token, profile: publicProfile(user) });
    }
    const u = await store.getUser(key);
    if (!u || !checkPassword(pw, u)) return send(res, 401, { error: 'WRONG NAME OR PASSWORD' });
    const token = await issueToken(key, store);
    return send(res, 200, { token, profile: publicProfile(u) });
  }

  const authorization = req.headers.authorization;
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';
  const tokenHash = token ? sha(token) : '';
  const user = tokenHash ? await store.getUserByToken(tokenHash) : null;
  if (!user) return send(res, 401, { error: 'PLEASE LOG IN' });

  if (route === 'GET /api/me') return send(res, 200, { profile: publicProfile(user) });

  if (route === 'POST /api/logout') {
    await store.deleteSession(tokenHash);
    const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
    delete db.tokens[sha(m[1])];
    save();
    return send(res, 200, { ok: true });
  }

  if (route === 'PUT /api/progress') {
    if (limited(req, 'prog', 120, 60000)) return send(res, 429, { error: 'SLOW DOWN' });
    const b = await readJson(req);
    await store.mergeProgress(user.key, b, sanitizeProgress);
    return send(res, 200, { profile: publicProfile(await store.getUser(user.key)) });
  }

  if (route === 'POST /api/score') {
    if (limited(req, 'score', 30, 60000)) return send(res, 429, { error: 'SLOW DOWN' });
    const b = await readJson(req);
    const score = int(b.score, 0, MAX_SCORE), level = int(b.level, 1, MAX_LEVEL);
    return send(res, 200, await store.updateScore(user.key, {
      score,
      level,
      city: cleanText(b.city, 16),
      date: Date.now(),
      name: user.name,
      location: user.location
    }));
  }

  return send(res, 404, { error: 'NOT FOUND' });
}

/* ------------------------------------------------------------------ static */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8', '.json': 'application/json', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
const PUBLIC = ['index.html', 'art/', 'audio/', 'worlds/', 'ui/', 'levels/', 'systems/', 'docs/screenshots/'];
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (rel === '') rel = 'index.html';
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT + path.sep) || !PUBLIC.some((p) => rel === p || (p.endsWith('/') && rel.startsWith(p))) || rel.includes('..')) {
    res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found');
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
      'cache-control': rel === 'index.html' ? 'no-cache' : 'public, max-age=3600',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; media-src 'self' data: blob:"
    });
    res.end(data);
  });
}

function createServer(options = {}) {
  const store = options.store || jsonStore;
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      api(req, res, url, store).catch((error) => {
        const status = Number.isInteger(error.code) && error.code >= 400 && error.code <= 599 ? error.code : 500;
        if (status >= 500) console.error('API request failed:', error.name || 'Error', error.statusCode || '');
        send(res, status, { error: status < 500 ? error.message : 'SERVER ERROR' });
      });
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    serveStatic(req, res, url);
  });
}

function createConfiguredStore(env = process.env) {
  const provider = env.PERSISTENCE_PROVIDER || 'json';
  if (provider === 'json') return jsonStore;
  if (provider !== 'azure-tables') throw configError('Unsupported PERSISTENCE_PROVIDER');

  const endpointText = env.AZURE_TABLE_ENDPOINT;
  if (!endpointText) throw configError('AZURE_TABLE_ENDPOINT is required for Azure Table Storage');
  const endpoint = new URL(endpointText);
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw configError('AZURE_TABLE_ENDPOINT must be a credential-free HTTPS URL');
  }
  const tableNames = {
    accounts: env.AZURE_TABLE_ACCOUNTS,
    sessions: env.AZURE_TABLE_SESSIONS,
    progress: env.AZURE_TABLE_PROGRESS,
    leaderboard: env.AZURE_TABLE_LEADERBOARD
  };
  for (const [key, name] of Object.entries(tableNames)) {
    if (typeof name !== 'string' || !/^[A-Za-z][A-Za-z0-9]{2,62}$/.test(name)) {
      throw configError(`AZURE_TABLE_${key.toUpperCase()} must be a valid Azure Table name`);
    }
  }
  const { createAzureTableStore } = require('./table-store');
  return createAzureTableStore({
    endpoint: endpoint.toString(),
    tableNames,
    production: env.NODE_ENV === 'production'
  });
}

function configError(message) {
  return Object.assign(new Error(message), { code: 'CONFIG_ERROR' });
}

if (!process.env.PERSISTENCE_PROVIDER || process.env.PERSISTENCE_PROVIDER === 'json') load();
if (require.main === module) {
  const start = async () => {
    const store = createConfiguredStore();
    await store.initialize();
    const cleanupTimer = setInterval(() => {
      store.pruneExpiredSessions().catch((error) => {
        console.error('Session cleanup failed:', error.name || 'Error', error.statusCode || '');
      });
    }, 6 * 60 * 60 * 1000);
    cleanupTimer.unref();
    createServer({ store }).listen(PORT, () => {
      console.log(`Azure Heroes 2027 listening on port ${PORT} (${process.env.PERSISTENCE_PROVIDER || 'json'} storage)`);
    });
    const bye = () => { if (saveTimer) flush(); process.exit(0); };
    process.on('SIGTERM', bye);
    process.on('SIGINT', bye);
  };
  start().catch((error) => {
    const details = error.code === 'CONFIG_ERROR' ? error.message : `${error.name || 'Error'} ${error.statusCode || ''}`;
    console.error('Azure Heroes startup failed:', details);
    process.exitCode = 1;
  });
}
module.exports = { createServer, createConfiguredStore, createJsonStore, flush, _db: () => db };
