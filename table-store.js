'use strict';

const { TableClient } = require('@azure/data-tables');
const { DefaultAzureCredential, ManagedIdentityCredential } = require('@azure/identity');

const ACCOUNT_PARTITION = 'accounts';
const SCORE_PARTITION = 'scores';
const SCORE_PREFIX = 'score:';
const SCORE_END = 'score;';
const MAX_PROGRESS_BYTES = 48 * 1024;
const MAX_SCORE = 9999999;
const MAX_CONCURRENCY_RETRIES = 5;

const statusCode = (error) => Number(error && error.statusCode);
const isNotFound = (error) => statusCode(error) === 404 || error.code === 'ResourceNotFound';
const isConflict = (error) => [409, 412].includes(statusCode(error))
  || ['EntityAlreadyExists', 'UpdateConditionNotSatisfied'].includes(error.code);

function parseProgress(entity) {
  if (!entity) return null;
  const data = JSON.parse(entity.Data);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Stored progress is malformed');
  }
  return data;
}

function scoreRowKey(score, timestamp, key) {
  const reverseScore = String(MAX_SCORE - score).padStart(7, '0');
  return `${SCORE_PREFIX}${reverseScore}:${String(timestamp).padStart(16, '0')}:${key}`;
}

function createClients(endpoint, tableNames, credential) {
  return Object.fromEntries(Object.entries(tableNames).map(([key, name]) => [
    key,
    new TableClient(endpoint, name, credential)
  ]));
}

async function getEntity(client, partitionKey, rowKey) {
  try {
    return await client.getEntity(partitionKey, rowKey);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

async function* query(client, filter) {
  for await (const entity of client.listEntities({ queryOptions: { filter } })) yield entity;
}

function createAzureTableStore(config, clients) {
  const credential = config.credential
    || (config.production ? new ManagedIdentityCredential() : new DefaultAzureCredential());
  const tables = clients || createClients(config.endpoint, config.tableNames, credential);
  const accounts = tables.accounts;
  const sessions = tables.sessions;
  const progress = tables.progress;
  const leaderboard = tables.leaderboard;

  async function getProgress(key) {
    const entity = await getEntity(progress, ACCOUNT_PARTITION, key);
    return parseProgress(entity);
  }

  async function getScore(key) {
    return getEntity(leaderboard, SCORE_PARTITION, `player:${key}`);
  }

  async function getUser(key) {
    const [account, savedProgress, score] = await Promise.all([
      getEntity(accounts, ACCOUNT_PARTITION, key),
      getProgress(key),
      getScore(key)
    ]);
    if (!account) return null;
    const user = {
      key,
      name: account.Name,
      location: account.Location,
      salt: account.Salt,
      hash: account.PasswordHash,
      created: account.Created,
      best: score ? score.Score : 0,
      bestAt: score ? score.Date : 0,
      bestLevel: score ? score.Level : 1,
      bestCity: score ? score.City : '',
      progress: savedProgress
    };
    if (account.StartLevel) user.startLevel = account.StartLevel;
    return user;
  }

  async function rankFor(userKey) {
    const score = await getScore(userKey);
    if (!score || !score.Score) return null;
    let ahead = 0;
    for await (const _ of query(leaderboard,
      `PartitionKey eq '${SCORE_PARTITION}' and RowKey ge '${SCORE_PREFIX}' and RowKey lt '${SCORE_END}' and Score gt ${score.Score}`)) {
      ahead++;
    }
    return ahead + 1;
  }

  return {
    async initialize() {
      for (const client of Object.values(tables)) {
        const iterator = query(client, "PartitionKey eq 'readiness-check'")[Symbol.asyncIterator]();
        await iterator.next();
        if (iterator.return) await iterator.return();
      }
    },

    async createUser(key, user) {
      const data = JSON.stringify(user.progress);
      if (Buffer.byteLength(data, 'utf8') > MAX_PROGRESS_BYTES) {
        throw new Error('Progress exceeds the storage limit');
      }
      const account = {
        partitionKey: ACCOUNT_PARTITION,
        rowKey: key,
        Name: user.name,
        Location: user.location,
        Salt: user.salt,
        PasswordHash: user.hash,
        Created: user.created
      };
      if (user.startLevel !== undefined) account.StartLevel = user.startLevel;
      try {
        await accounts.createEntity(account);
      } catch (error) {
        if (isConflict(error)) return false;
        throw error;
      }
      await progress.createEntity({
        partitionKey: ACCOUNT_PARTITION,
        rowKey: key,
        Data: data
      });
      return true;
    },

    getUser,

    async createSession(tokenHash, userKey, expiresAt) {
      await sessions.createEntity({
        partitionKey: tokenHash.slice(0, 3),
        rowKey: tokenHash,
        User: userKey,
        Expires: expiresAt
      });
    },

    async getUserByToken(tokenHash) {
      const session = await getEntity(sessions, tokenHash.slice(0, 3), tokenHash);
      if (!session) return null;
      if (!Number.isSafeInteger(session.Expires) || session.Expires < Date.now()) {
        await sessions.deleteEntity(session.partitionKey, session.rowKey, { etag: session.etag });
        return null;
      }
      return getUser(session.User);
    },

    async deleteSession(tokenHash) {
      const session = await getEntity(sessions, tokenHash.slice(0, 3), tokenHash);
      if (session) await sessions.deleteEntity(session.partitionKey, session.rowKey, { etag: session.etag });
    },

    async mergeProgress(key, incoming, merge) {
      for (let attempt = 0; attempt < MAX_CONCURRENCY_RETRIES; attempt++) {
        const current = await getEntity(progress, ACCOUNT_PARTITION, key);
        const old = parseProgress(current);
        const next = merge(incoming, old);
        const data = JSON.stringify(next);
        if (Buffer.byteLength(data, 'utf8') > MAX_PROGRESS_BYTES) {
          throw new Error('Progress exceeds the storage limit');
        }
        try {
          if (current) {
            await progress.updateEntity({
              partitionKey: ACCOUNT_PARTITION,
              rowKey: key,
              Data: data
            }, 'Replace', { etag: current.etag });
          } else {
            await progress.createEntity({
              partitionKey: ACCOUNT_PARTITION,
              rowKey: key,
              Data: data
            });
          }
          return next;
        } catch (error) {
          if (!isConflict(error)) throw error;
        }
      }
      throw new Error('Progress update could not be committed after concurrent changes');
    },

    async updateScore(key, input) {
      for (let attempt = 0; attempt < MAX_CONCURRENCY_RETRIES; attempt++) {
        const current = await getScore(key);
        if (current && input.score <= current.Score) {
          return { best: current.Score, rank: await rankFor(key) };
        }

        const date = input.date;
        const newRowKey = scoreRowKey(input.score, date, key);
        const scoreEntity = {
          partitionKey: SCORE_PARTITION,
          rowKey: newRowKey,
          User: key,
          Name: input.name,
          Location: input.location,
          Score: input.score,
          Level: input.level,
          City: input.city,
          Date: date
        };
        const locator = {
          partitionKey: SCORE_PARTITION,
          rowKey: `player:${key}`,
          Score: input.score,
          Date: date,
          Level: input.level,
          City: input.city,
          ScoreRowKey: newRowKey
        };
        const actions = [];
        if (current) {
          actions.push(['delete', {
            partitionKey: SCORE_PARTITION,
            rowKey: current.ScoreRowKey
          }]);
          actions.push(['create', scoreEntity]);
          actions.push(['update', locator, 'Replace', { etag: current.etag }]);
        } else {
          actions.push(['create', scoreEntity]);
          actions.push(['create', locator]);
        }
        try {
          await leaderboard.submitTransaction(actions);
          return { best: input.score, rank: await rankFor(key) };
        } catch (error) {
          if (!isConflict(error)) throw error;
        }
      }
      throw new Error('Score update could not be committed after concurrent changes');
    },

    async getLeaderboard(limit) {
      const rows = [];
      for await (const entry of query(leaderboard,
        `PartitionKey eq '${SCORE_PARTITION}' and RowKey ge '${SCORE_PREFIX}' and RowKey lt '${SCORE_END}'`)) {
        rows.push({
          rank: rows.length + 1,
          name: entry.Name,
          location: entry.Location,
          score: entry.Score,
          level: entry.Level || 1,
          city: entry.City || '',
          date: entry.Date || 0
        });
        if (rows.length >= limit) break;
      }
      let players = 0;
      for await (const _ of query(accounts, `PartitionKey eq '${ACCOUNT_PARTITION}'`)) players++;
      return { rows, players };
    },

    async pruneExpiredSessions() {
      const expired = [];
      for await (const session of query(sessions, `Expires le ${Date.now()}`)) expired.push(session);
      for (const session of expired) {
        await sessions.deleteEntity(session.partitionKey, session.rowKey, { etag: session.etag });
      }
      return expired.length;
    }
  };
}

module.exports = { createAzureTableStore };
