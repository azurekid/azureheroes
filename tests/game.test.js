'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(file, AH = {}, seed = 1) {
  const math = Object.create(Math);
  math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const context = vm.createContext({ window: { AH }, Math: math });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  return context.window.AH;
}

test('random worlds have distinct, disjoint, substantial cloud challenges and vertical routes', () => {
  const { Levels } = load('levels/worlds.js');
  const themes = new Set();
  for (const meta of Levels.worlds) {
    for (let run = 0; run < 80; run++) {
      const L = Levels.make(meta.id);
      assert.ok(L.width > 6000);
      if (meta.mode !== 'run' || meta.theme === 'rack') continue;
      assert.equal(L.pipeZones.length, 2, meta.city + ' has two pipe challenges');
      assert.notEqual(L.pipeZones[0].theme, L.pipeZones[1].theme);
      assert.ok(L.pipeZones[0].x + L.pipeZones[0].w < L.pipeZones[1].x);
      const ground = L.platforms.filter((p) => p.x < L.width && p.h >= 100 && !p.pipe);
      assert.ok(Math.max(...ground.map((p) => p.y)) - Math.min(...ground.map((p) => p.y)) >= 60);
      for (let i = 1; i < ground.length; i++) {
        const a = ground[i - 1], b = ground[i], gap = b.x - a.x - a.w;
        const spanned = L.platforms.some((p) => p.bridge && p.x === a.x + a.w) ||
          L.movers.some((m) => m.x0 > a.x + a.w && m.x0 < b.x);
        if (!spanned) {
          assert.ok(gap <= 195, meta.city + ' needs a bridge/boat for a wider gap');
          if (gap > 140) assert.ok(a.y - b.y <= 20, 'wide-gap rises must remain double-jump reachable');
        }
      }
      assert.ok(L.platforms.some((p) => p.float && p.x < L.width));
      assert.ok(L.enemies.filter((e) => e.x < L.width).length >= 20);
      for (const pipe of L.pipes) {
        const Z = L.pipeZones[pipe.zone];
        for (const point of [pipe, Z.back]) {
          assert.ok(!L.enemies.some((e) => Math.abs(e.x - point.x) < 80 && Math.abs(e.y - point.y - 46) < 60),
            'pipe approaches must be free of ground threats');
          assert.ok(!L.platforms.some((p) => p.float && p.x < point.x + 22 && p.x + p.w > point.x - 22 &&
            p.y < point.y && p.y + p.h > point.y - 48), 'pipe headroom must remain clear');
        }
      }
      if (meta.id === 1) assert.ok(L.obstacles.some((o) => o.kind === 'herring'));
      for (const Z of L.pipeZones) {
        themes.add(Z.theme);
        assert.ok(Z.w >= 3200 && Z.w <= 3840);
        assert.equal(Z.stages.length, 5);
        assert.ok(Z.enemies.length >= 10);
        assert.ok(Z.timeBonus >= Z.w / 190);
        assert.equal(Z.platforms.filter((p) => p.lowTunnel).length, 5);
        assert.ok(Z.entry.x < Z.exit.x);
        for (const p of Z.platforms) {
          assert.ok(p.x >= Z.x && p.x + p.w <= Z.x + Z.w);
          if (p.lowTunnel) assert.ok(300 - p.y - p.h >= 20 && 300 - p.y - p.h < 40);
        }
        for (const s of [Z.name, Z.hint, ...Z.stages.flatMap((s) => [s.name, s.tip])]) assert.match(s, /^[A-Z0-9 .!'/:+,\-?]+$/);
        for (const e of Z.enemies) {
          assert.ok(e.x > Z.entry.x + 120 && e.x < Z.exit.x - 60);
          assert.ok(L.enemies.includes(e));
        }
        for (const p of Z.powerups) assert.ok(L.powerups.includes(p));
      }
    }
  }
  assert.deepEqual([...themes].sort(), ['actions', 'aks', 'docker', 'pipelines']);
});

test('duck body preserves feet, cannot stand under beams, and blasts fire low', () => {
  const AH = load('systems/player.js', { Art: { D: 2 }, Audio: { play() {} } });
  const player = Object.create(AH.Player.prototype);
  const body = {
    x: 100, width: 14, height: 40, right: 114, position: { y: 260 }, prev: { y: 260 }, prevFrame: { y: 260 },
    get y() { return this.position.y; },
    get bottom() { return this.y + this.height; },
    setSize(w, h) { this.height = h / 2; },
    setOffset() {},
    updateCenter() {}
  };
  let blast;
  player.sprite = { x: 107, y: 277, body };
  player.scene = { rects: [], spawnBlast(...args) { blast = args; } };
  player.facing = 1;
  player.ducking = false;
  player.boost = 100;
  player.blastCd = 0;
  player.setDucking(true);
  assert.equal(body.height, 20);
  assert.equal(body.bottom, 300);
  assert.equal(body.y - body.prev.y, 0, 'resizing must not move the sprite in physics postUpdate');
  player.scene.rects.push({ x: 90, y: 254, w: 140, h: 20, active: true });
  assert.equal(player.canStand(), false);
  assert.equal(player.azureBlast(), true);
  assert.equal(blast[1], 290);
  player.scene.rects[0].active = false;
  assert.equal(player.canStand(), true);
  player.setDucking(false);
  assert.equal(body.height, 40);
  assert.equal(body.bottom, 300);
});

test('all cloud threat types retain two-hit health, shared behavior and credit drops', () => {
  let drops = 0;
  const AH = load('systems/enemies.js', { Art: { D: 2 }, Audio: { play() {} } });
  for (const type of ['bug', 'image', 'rbac', 'endpoint', 'guest']) {
    const body = { setSize() {}, setOffset() {}, setAllowGravity() {}, setVelocityX() {}, setVelocityY() {} };
    const sprite = {
      x: 200, y: 300, body, setOrigin() { return this; }, setDepth() { return this; },
      play() {}, setTintFill() {}, destroy() {}
    };
    const scene = {
      anims: { exists() { return false; } },
      physics: { add: { sprite() { return sprite; }, collider() {} } },
      burst() {}, onEnemyKilled() { drops++; }
    };
    const e = new AH.Enemy(scene, { type, x: 200, y: 300, range: 24 });
    assert.equal(e.health, 2);
    assert.ok(e.spec.fix);
    e.hit(1);
    assert.equal(e.dead, false);
    e.hit(1);
    assert.equal(e.dead, true);
  }
  assert.equal(drops, 5);
});
