'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { levelScripts, loadScripts } = require('./helpers/load-game');

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const plain = (value) => JSON.parse(JSON.stringify(value));
const withoutMission = (L) => {
  const copy = plain(L);
  delete copy.mission;
  return copy;
};

function reachableSupports(platforms) {
  const supports = platforms.filter((p) => !p.pipe && !p.ceil && !p.bridge && !p.lowTunnel && p.w >= 72);
  const reached = new Set(supports.filter((p) => !p.float && p.h >= 80));
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of supports) {
      if (reached.has(p)) continue;
      const possible = Array.from(reached).some((q) => {
        const rise = q.y - p.y;
        if (rise < 0 || rise > 80) return false;
        const distance = Math.max(0, p.x - q.x - q.w, q.x - p.x - p.w) + 28;
        // Simulate the player's unboosted first jump (190px/s, -440px/s,
        // 1100px/s2). Only a descending landing counts, not an apex fly-by.
        for (let t = 1 / 240; t < 1; t += 1 / 240) {
          if (-440 + 1100 * t >= 0 && -440 * t + 550 * t * t >= -rise) return 190 * t >= distance;
        }
        return false;
      });
      if (possible) { reached.add(p); changed = true; }
    }
  }
  return reached;
}

function checkMarkers(L) {
  const { objectives, gems, gemQuota } = L.mission;
  const end = L.boss.left - 180;
  assert.equal(gemQuota, 2);
  assert.equal(gems.length, 6);
  assert.equal(objectives.length, 3);
  assert.deepEqual(Array.from(objectives, (p) => p.kind), ['cache', 'relay', 'scan']);
  assert.deepEqual(Array.from(objectives, (p) => p.required), [true, true, false]);
  assert.ok(objectives[0].x < objectives[1].x);
  assert.ok(objectives[0].x <= end * 0.4);
  assert.ok(objectives[1].x <= end * 0.72);
  assert.ok(objectives[1].x >= end * 0.42);
  assert.ok(objectives.every((p) => p.zone === undefined));
  assert.ok(gems.filter((p) => p.zone === undefined).length >= gemQuota);
  const markers = [...objectives, ...gems];
  assert.equal(new Set(markers.map((p) => p.id)).size, markers.length);
  const reachable = L.mode === 'fly' ? null : reachableSupports(L.platforms);
  for (const [i, p] of markers.entries()) {
    assert.match(p.id, /^mission-[a-z]+(?:-\d+)?$/);
    if (p.label) assert.match(p.label + p.tip, /^[A-Z0-9 .!':/+,?-]+$/);
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
    const zone = p.zone === undefined ? null : L.pipeZones[p.zone];
    if (p.zone !== undefined) assert.ok(zone, 'a gem references a real pipe zone');
    assert.ok(p.x >= (zone ? zone.x : 0));
    assert.ok(p.x <= (zone ? zone.x + zone.w : end));
    assert.ok(p.y >= 48 && p.y <= 320);
    let support;
    if (L.mode !== 'fly') {
      support = L.platforms.find((s) => p.x >= s.x + 36 && p.x <= s.x + s.w - 36 && [20, 64].includes(s.y - p.y) && !s.pipe && !s.ceil);
      assert.ok(support, 'marker has a stable supporting surface');
      assert.ok(reachable.has(support), 'upper marker reachable from the existing route with unboosted jump physics');
      assert.ok(support.y - p.y < 440 * 440 / (2 * 1100), 'pickup hop is below the actual single-jump apex');
      if (p.kind === 'relay') assert.ok(!support.float && support.h >= 80, 'relay stands on solid ground');
      if (p.kind === 'cache') assert.ok(support.float || support.h < 80 || p.x - support.x <= 68 || support.x + support.w - p.x <= 68, 'cache uses an upper or safe side route');
      if (zone) assert.ok(zone.platforms.includes(support));
    } else {
      const tops = L.platforms.filter((s) => s.y === 0);
      assert.ok(tops.some((a, index) => {
        const b = tops[index + 1];
        return b && p.x === Math.round((a.x + a.w + b.x) / 2);
      }), 'flight marker is between rock columns, never on a rock coordinate');
    }
    const headroom = support ? Math.max(56, support.y - p.y + 16) : 0;
    const box = L.mode === 'fly'
      ? { x: p.x - 28, y: p.y - 24, w: 56, h: 48 }
      : { x: p.x - 28, y: support.y - headroom, w: 56, h: headroom };
    for (const solid of L.platforms) if (solid !== support) assert.ok(!overlap(box, solid), 'standing headroom / flight clearance');
    for (const hazard of [...(L.obstacles || []), ...(L.lasers || []), ...(L.gates || []),
      ...(L.cables || []).map((c) => ({ x: c.x, y: c.y - 12, w: c.w, h: 12 }))]) {
      assert.ok(!overlap(box, hazard), 'no obstacle or hazard overlaps a mission marker');
    }
    assert.ok((L.pipes || []).every((pipe) => Math.abs(pipe.x - p.x) >= 82), 'clear of pipe warp radius');
    assert.ok((L.terminals || []).every((terminal) => Math.abs(terminal.x - p.x) >= 60));
    assert.ok(!L.secret || Math.abs(L.secret.x - p.x) >= 60);
    for (const reward of [...L.coins, ...L.mfaTokens, ...(L.powerups || []), ...(L.vehicles || [])]) {
      assert.ok(Math.abs(reward.x - p.x) >= 20 || Math.abs(reward.y - p.y) >= 36, 'readable, distinct pickups');
    }
    for (const enemy of L.enemies) {
      const airborne = enemy.type === 'drone' || enemy.type === 'botnet';
      const floor = L.mode === 'fly' ? p.y : support.y;
      const nearHeight = airborne ? (L.mode === 'fly' || (enemy.y < floor && floor - enemy.y < 240)) : Math.abs(enemy.y - floor) < 64;
      if (nearHeight) assert.ok(Math.abs(enemy.x - p.x) >= (enemy.range || 0) + 70, 'clear of enemy patrols');
    }
    for (const other of markers.slice(i + 1)) assert.ok(Math.hypot(p.x - other.x, p.y - other.y) >= 100, 'mission markers do not overlap');
  }
}

test('missions have ordered safe objectives and six reachable gems across every world and 100 seeds', () => {
  let upperCaches = 0, upperGems = 0, undergroundGems = 0, layouts = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const AH = loadScripts(levelScripts(), { seed });
    for (const meta of AH.Levels.worlds) {
      const L = AH.Levels.make(meta.id);
      try { checkMarkers(L); } catch (error) { error.message += ` (WORLD ${meta.id}, SEED ${seed})`; throw error; }
      if (L.mode === 'run') {
        const upper = (p) => L.platforms.some((s) => (s.float || s.h < 80) && [20, 64].includes(s.y - p.y) && p.x >= s.x && p.x <= s.x + s.w);
        upperCaches += Number(upper(L.mission.objectives[0]));
        upperGems += L.mission.gems.filter((p) => p.zone === undefined && upper(p)).length;
      }
      undergroundGems += L.mission.gems.filter((p) => p.zone !== undefined).length;
      const baseTime = L.mode === 'fly' ? Math.round(L.width / L.scroll + 90) : Math.round(L.width / 1000 * (L.theme === 'rack' ? 30 : 26) + 110);
      assert.equal(L.time - baseTime, L.mode === 'fly' ? 45 : 90);
      layouts++;
    }
  }
  assert.equal(layouts, 1100);
  assert.ok(upperCaches > 400, 'most ground caches reward existing reachable elevated routes');
  assert.ok(upperGems > 1200, 'main-world hidden gems reward reachable upper-route exploration');
  assert.ok(undergroundGems > 500, 'optional underground gems are generated');
});

test('adding missions is deterministic, idempotent and preserves every legacy field and subsequent random draw', () => {
  for (const seed of [1, 7, 42, 2027, 8675309]) {
    const actual = loadScripts(levelScripts(), { seed });
    const legacy = loadScripts(levelScripts(), { seed });
    legacy.LevelGenerator.addMission = (L) => L;
    for (let run = 0; run < 5; run++) {
      for (const meta of actual.Levels.worlds) {
        const L = actual.Levels.make(meta.id), old = legacy.Levels.make(meta.id);
        assert.deepEqual(withoutMission(L), plain(old), 'all legacy terrain, rewards, hazards and random consumption stay identical');
        const before = plain(L);
        assert.equal(actual.LevelGenerator.addMission(L), L);
        assert.deepEqual(plain(L), before, 'rebuilding missions consumes no randomness and adds no repeated time bonus');
      }
    }
  }
});

test('impossible mission layouts fail explicitly instead of producing invalid placeholders', () => {
  const AH = loadScripts(levelScripts());
  for (const mode of ['run', 'fly']) {
    const L = { id: 99, mode, width: 4000, platforms: [], enemies: [], boss: { left: 3400 } };
    assert.throws(() => AH.LevelGenerator.addMission(L), /MISSION PLACEMENT FAILED: CACHE IN LEVEL 99/);
    assert.equal(L.mission, undefined);
  }
});
