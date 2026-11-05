'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { levelScripts, loadScripts } = require('./helpers/load-game');

function levels(seed) {
  return loadScripts(levelScripts(), { seed }).Levels;
}
const intersects = (x, feet, h, p) => x + 7 > p.x && x - 7 < p.x + p.w && feet > p.y + 0.01 && feet - h < p.y + p.h - 0.01;
const shape = (p, x) => [p.x - x, p.y, p.w, p.h];
function expected(layout, w, duct) {
  switch (layout) {
    case 'steps': return [[60, 252, 70, 48], [130, 204, 110, 96], [240, 252, 70, 48]];
    case 'catwalk': return [[50, 220, 100, 14], [200, 158, 160, 14], [w - 140, 220, 90, 14]];
    case 'duct': return [[180, 254, duct, 20]];
    case 'split': return [[40, 240, 100, 14], [180, 180, 110, 14], [330, 220, 90, 14], [w - 110, 150, 70, 14]];
    case 'security': return [[60, 228, 100, 14], [320, 164, 100, 14]];
    case 'arena': return [[60, 246, 70, 54], [210, 180, 130, 14], [w - 150, 246, 70, 54]];
    case 'switchback': return [[60, 240, 90, 14], [190, 180, 90, 14], [320, 126, 100, 14]];
    default: assert.fail('unknown layout ' + layout);
  }
}

// Collision-aware jump traces: 190px/s, -440 jump, optional -400 double jump,
// 1100px/s2 gravity and the actual standing body's 14x40 logical dimensions.
function canLand(from, target, solids) {
  const landings = [target.x + 14, target.x + target.w / 2, target.x + target.w - 14];
  for (const tx of landings) {
    const launches = [from.x + 14, from.x + from.w / 2, from.x + from.w - 14,
      Math.max(from.x + 14, Math.min(from.x + from.w - 14, tx - 90)),
      Math.max(from.x + 14, Math.min(from.x + from.w - 14, tx + 90))];
    for (const launch of launches) for (const doubleAt of [Infinity, 0.2, 0.35]) {
      let x = launch, feet = from.y, vy = -440;
      if (solids.some(p => intersects(x, feet, 40, p))) continue;
      for (let frame = 1; frame < 360; frame++) {
        const dt = 1 / 240, oldFeet = feet;
        if (frame === Math.round(doubleAt * 240)) vy = -400;
        vy += 1100 * dt;
        const nextX = x + Math.sign(tx - x) * Math.min(190 * dt, Math.abs(tx - x));
        feet += vy * dt;
        if (vy > 0 && oldFeet <= target.y && feet >= target.y && nextX - 7 >= target.x && nextX + 7 <= target.x + target.w) return true;
        x = nextX;
        if (solids.some(p => intersects(x, feet, 40, p))) break;
      }
    }
  }
  return false;
}

test('seeded rooms have exact distinct shapes, shuffled lessons, safe bounds and reachable rewards', () => {
  const themes = new Map(), layouts = new Set(), widths = new Set();
  for (let seed = 1; seed <= 80; seed++) {
    const id = 1 + seed % 3, L = levels(seed).make(id);
    assert.equal(JSON.stringify(L), JSON.stringify(levels(seed).make(id)), 'same seed is reproducible');
    assert.equal(L.pipeZones[1].x - L.pipeZones[0].x, 4400);
    assert.ok(L.pipeZones[0].x + L.pipeZones[0].w < L.pipeZones[1].x);
    for (const Z of L.pipeZones) {
      assert.ok(Z.w >= 3200 && Z.w <= 3840);
      assert.equal(Z.stages.length, 5);
      assert.equal(new Set(Z.stages.map(s => s.layout)).size, 5);
      assert.equal(new Set(Z.stages.map(s => s.name)).size, 5);
      const seen = themes.get(Z.theme) || { orders: new Set(), shapes: new Set(), names: new Set() };
      seen.orders.add(Z.stages.map(s => s.name).join('|'));
      seen.shapes.add(Z.stages.map(s => s.layout).join('|'));
      Z.stages.forEach(s => seen.names.add(s.name));
      themes.set(Z.theme, seen);
      const floor = Z.platforms.find(p => p.pipeFloor && !p.ceil);
      assert.deepEqual(shape(floor, Z.x), [0, 300, Z.w, 100]);
      assert.ok(Z.enemies.length >= 10);
      assert.ok(Z.timeBonus >= Z.w / 190);
      for (const p of Z.platforms) {
        assert.ok(p.x >= Z.x && p.x + p.w <= Z.x + Z.w);
        assert.ok(p.w > 0 && p.h > 0);
      }
      for (const point of [Z.entry, Z.exit]) {
        assert.ok(!Z.platforms.some(p => intersects(point.x, point.y, 40, p)), 'clear warp headroom');
        assert.ok(Z.enemies.every(e => Math.abs(e.x - point.x) > 120));
        assert.ok(Z.lasers.every(l => Math.abs(l.x - point.x) > 120));
      }
      const accessible = [floor];
      for (let i = 0; i < 5; i++) {
        const s = Z.stages[i], end = i === 4 ? Z.x + Z.w - 200 : Z.stages[i + 1].x, w = end - s.x;
        widths.add(w); layouts.add(s.layout);
        assert.ok(w >= 560 && w <= 660);
        const parts = Z.platforms.filter(p => !p.pipeFloor && !p.pipe && p.x >= s.x && p.x < end);
        assert.deepEqual(Array.from(parts, p => shape(p, s.x)), expected(s.layout, w, parts[0].w));
        const lasers = Z.lasers.filter(l => l.x >= s.x && l.x < end);
        assert.equal(lasers.length, s.layout === 'security' ? 2 : 0);
        for (const l of lasers) {
          assert.ok(l.on > 0 && l.off >= 1400 && l.phase >= 0);
          assert.ok(l.x + l.w < end && l.y + l.h === 300);
          assert.ok(l.off / 1000 > (l.w + 14) / 190, 'time to pass an open security gate');
        }
        for (const p of parts) {
          assert.ok(accessible.some(a => canLand(a, p, Z.platforms)), 'physics-reachable ' + s.layout);
          accessible.push(p);
          if (p.lowTunnel) {
            assert.ok(300 - p.y - p.h >= 20 && 300 - p.y - p.h < 40);
            assert.ok(!intersects(p.x + p.w / 2, 300, 20, p));
            assert.ok(intersects(p.x + p.w / 2, 300, 40, p));
            assert.ok(canLand(floor, p, Z.platforms), 'duct roof bypass');
          } else if (p.y + p.h < 300) assert.ok(300 - p.y - p.h >= 40, 'standing floor route');
        }
        // Only the stepped containers and arena pedestals touch the floor.
        // Their maximum wall is 96px with climbable 48/54px leading edges.
        for (const p of parts.filter(p => p.y + p.h === 300)) assert.ok(p.h <= 96);
      }
      for (const item of [Z.token, ...Z.powerups, ...Z.coins]) {
        assert.ok(item.x > Z.x && item.x < Z.x + Z.w);
        assert.ok(item.y >= 40 && item.y < 300);
        assert.ok(!Z.platforms.some(p => intersects(item.x, item.y + 6, 12, p)), 'reward outside solids');
      }
      for (const item of [Z.token, ...Z.powerups]) {
        assert.ok(accessible.some(p => item.x > p.x && item.x < p.x + p.w && p.y - item.y === 26));
      }
      for (const kind of ['spread', 'pierce']) assert.equal(Z.powerups.filter(p => p.kind === kind).length, 1);
    }
  }
  assert.deepEqual([...themes.keys()].sort(), ['actions', 'aks', 'docker', 'entra', 'functions', 'metro', 'pipelines', 'tube']);
  assert.equal(layouts.size, 7);
  assert.ok(widths.size > 80);
  for (const seen of themes.values()) {
    assert.equal(seen.names.size, 5);
    assert.ok(seen.orders.size > 10);
    assert.ok(seen.shapes.size > 10);
  }
});

test('every normal run, fly and rack world offers both temporary weapons with stable ids', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const Levels = levels(seed);
    assert.deepEqual(Array.from(Levels.ids), Array.from(Levels.worlds, m => m.id));
    for (const meta of Levels.worlds) {
      const L = Levels.make(meta.id);
      assert.equal(L.id, meta.id);
      for (const kind of ['spread', 'pierce']) {
        const picks = L.powerups.filter(p => p.kind === kind && p.x < L.width);
        assert.equal(picks.length, 1, meta.city + ' ' + kind);
        for (const p of picks) {
          assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
          assert.ok(p.x > L.spawn.x && p.x < L.boss.trigger);
          assert.ok(!L.platforms.some(s => intersects(p.x, p.y + 8, 16, s)), 'weapon outside platforms');
          assert.ok(!(L.obstacles || []).some(s => intersects(p.x, p.y + 8, 16, s)), 'weapon outside street obstacles');
        }
      }
    }
  }
});
