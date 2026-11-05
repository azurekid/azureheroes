'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { artScripts, levelScripts, loadScripts, recordingDocument } = require('./helpers/load-game');

function load(file, AH = {}, seed = 1, globals = {}) {
  const math = Object.create(Math);
  math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const context = vm.createContext({ ...globals, window: { AH }, Math: math });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  return context.window.AH;
}

function levels(seed = 1) {
  return loadScripts(levelScripts(), { seed }).Levels;
}

function artwork() {
  return loadScripts(artScripts(), { globals: { document: recordingDocument() } }).Art;
}

test('seeded world generation preserves the pre-refactor output digest', () => {
  const hashes = [];
  for (const seed of [1, 7, 42, 8675309, 2027]) {
    const Levels = levels(seed);
    // Keep the historical generator fixture; the new regional sewer is tested below.
    Levels.meta(11).opt.secret = 'cloud';
    Levels.meta(11).opt.secretName = 'SKYLINE CLOUD';
    Levels.meta(9).landmarks = 'MICROSOFT CAMPUS - SPACE NEEDLE - MT RAINIER - SEATTLE';
    Levels.meta(9).hint = 'RUN THE LAKEFRONT. AN XBOX-GREEN DOOR HIDES A BONUS.';
    delete Levels.meta(9).ambient.rail;
    delete Levels.meta(9).ambient.railY;
    for (const meta of Levels.worlds) {
      const key = `${seed}:${meta.id}:${meta.city}`;
      const generated = Levels.make(meta.id);
      delete generated.mission;
      delete generated.wardrobeSpots;
      generated.enemies.forEach((enemy) => { delete enemy.bossToken; });
      generated.time -= generated.mode === 'fly' ? 45 : 90;
      const output = JSON.stringify(generated);
      hashes.push([key, crypto.createHash('sha256').update(output).digest('hex')]);
    }
  }
  assert.equal(hashes.length, 55);
  assert.equal(
    crypto.createHash('sha256').update(JSON.stringify(hashes)).digest('hex'),
    '5a20b5bdf5bd0a907cfb5daf7bb44c53d66b1ce58a12aaede96ed3e860766315'
  );
});

test('New York manhole leads to a disjoint sewer with rat patrols and regional music', () => {
  for (const seed of [1, 7, 42, 2027, 8675309]) {
    const L = levels(seed).make(11), B = L.bonus;
    assert.equal(L.secret.name, 'MANHOLE');
    assert.equal(B.theme, 'sewer');
    assert.equal(B.music, 'pipe');
    assert.equal(B.presentation.title, 'NEW YORK SEWERS');
    assert.equal(B.w, 1280);
    assert.equal(B.floor.bliss, 'sewer');
    assert.equal(B.clouds.length, 8);
    assert.ok(B.clouds.every((p) => p.cloud === 'sewer_plat' && p.x >= B.x && p.x + p.w < B.exit.x));
    assert.equal(B.enemies.length, 5);
    assert.ok(B.enemies.every((e) => e.type === 'spider' && e.skin === 'eastus2' && L.enemies.includes(e)));
    assert.ok(B.enemies.every((e) => e.x - e.range > B.x + 150 && e.x + e.range < B.exit.x - 70));
    assert.ok(B.coins.every((c) => c.x > B.x && c.x < B.x + B.w));
    assert.ok(L.pipeZones.every((z) => z.x >= B.x + B.w + 160), 'sewer never overlaps cloud rooms');
    assert.equal(B.exit.y, B.floor.y);
    assert.ok(B.exit.x > B.enemies.at(-1).x + 80);
  }
});

test('New York birds and neighborhood scenery retain local identity and registered art', () => {
  const Art = artwork();
  for (const key of ['en_eastus2_drone', 'amb_bird_pigeon']) {
    const a = Art.textureCanvas(key + '_0'), b = Art.textureCanvas(key + '_1');
    assert.ok(a && b);
    assert.equal(a.width, b.width);
    assert.notDeepEqual(a.ops, b.ops, 'two distinct wingbeat silhouettes');
    assert.ok(a.ops.some((op) => op[0] === 'ellipse'), 'body and separate head');
    if (key === 'amb_bird_pigeon') {
      for (const canvas of [a, b]) for (const op of canvas.ops.filter((op) => ['moveTo', 'lineTo'].includes(op[0]))) {
        assert.ok(op[1] >= 0 && op[1] <= 16 && op[2] >= 0 && op[2] <= 12, 'wing and tail stay inside texture');
      }
    }
  }
  for (const key of ['bonus_bg_sewer', 'secret_eastus2', 'sewer', 'sewer_top', 'sewer_plat']) {
    assert.ok(Art.textureCanvas(key), key + ' registered in real module order');
  }
  const near = Art.textureCanvas('bg_near_eastus2');
  assert.ok(near.ops.filter((op) => op[0] === 'lineTo').length > 150, 'brownstone fire escapes populate near layer');
  const park = Art.textureCanvas('sc_ny_centralpark');
  assert.ok(park.ops.filter((op) => op[0] === 'quadraticCurveTo').length >= 4, 'arched Bow Bridge and park paths');
  for (const key of ['sc_ny_brownstones', 'sc_ny_centralpark']) {
    assert.ok(Art.sceneryRoutes.eastus2.some((stop) => stop[1] === key), 'guaranteed stop: ' + key);
  }
});

test('regional secret rooms route underground music and restore street music on return', () => {
  const music = [], bounds = [], positions = [];
  const AH = load('systems/scenes.js', {
    Levels: { ids: [11] }, Audio: { play() {}, music(...args) { music.push(args); } }
  }, 1, { Phaser: { Scene: class {} } });
  const scene = new AH.Scenes[5](), L = levels(2027).make(11);
  scene.L = L;
  scene.player = {
    cancelCharge() {},
    sprite: { setPosition(...args) { positions.push(args); }, setVelocity() {} }
  };
  scene.secret = { used: false, ach: L.bonus.presentation.ach, booth: { setTint() {} }, label: { setVisible() {} } };
  scene.cameras = { main: { fadeOut() {}, fadeIn() {}, once(event, callback) { callback(); }, setBounds(...args) { bounds.push(args); } } };
  scene.physics = { world: { setBounds() {} } };
  scene.toast = scene.achieve = () => {};
  scene.enterBonus();
  assert.equal(scene.inBonus, true);
  assert.equal(scene.secret.used, true);
  assert.deepEqual(music[0], ['pipe', 'eastus2']);
  assert.deepEqual(bounds[0], [L.bonus.x, 0, 1280, 360]);
  assert.equal(positions[0][0], L.bonus.x + 60);
  scene.leaveBonus(false);
  assert.equal(scene.inBonus, false);
  assert.deepEqual(music[1], ['main', 'eastus2']);
});

test('city catalogue fixes world order, stable ids and per-world map coordinates', () => {
  const AH = loadScripts(levelScripts());
  const slugs = ['amsterdam', 'london', 'paris', 'tokyo', 'sydney', 'venice', 'rio', 'mexico-city', 'redmond', 'virginia', 'new-york'];
  assert.deepEqual(Array.from(AH.WorldOrder), slugs);
  assert.deepEqual(Object.keys(AH.Worlds), slugs);
  const worlds = slugs.map((slug, index) => {
    const world = AH.Worlds[slug]?.world;
    assert.ok(world, slug + ' has world metadata');
    assert.equal(world.id, index + 1);
    assert.equal(world.map.length, 4);
    assert.ok(world.map.every(Number.isFinite));
    return world;
  });
  assert.deepEqual(Array.from(AH.Levels.ids), worlds.map((world) => world.id));
});

test('New York perspective skyscrapers stay grounded and preserve scenic width and route', () => {
  const Art = artwork(), canvas = Art.textureCanvas('sc_ny_times');
  assert.equal(canvas.width, 300 * Art.D);
  assert.equal(canvas.height, 330 * Art.D);
  for (const x of [0, 119, 246]) {
    assert.ok(canvas.ops.some((op) => op[0] === 'fillRect' && op[1] === x &&
      op[2] < 0 && op[2] + op[4] === 232), 'tower front reaches the plaza: ' + x);
  }
  assert.ok(canvas.ops.some((op) => op[0] === 'fillRect' && op[1] === 0 &&
    op[2] === 145 && op[3] === 300 && op[4] === 87), 'continuous ground backs every building');
  assert.equal(Art.textureCanvas('sc_ny_midtown').height, 330 * Art.D);
  const angledSigns = canvas.ops.filter((op) => op[0] === 'transform' && op[2] !== 0);
  assert.equal(angledSigns.length, 2, 'billboards wrap both inward-facing building sides');
  assert.ok(canvas.ops.some((op) => op[0] === 'moveTo' && op[1] === 153 && op[2] === 151),
    'plaza perspective lines share a vanishing point');
  assert.ok(canvas.ops.filter((op) => op[0] === 'stop').length >= 20,
    'facades, plaza and screens have independent light gradients');
  assert.deepEqual(Array.from(Art.sceneryRoutes.eastus2.find((stop) => stop[1] === 'sc_ny_times')),
    [0.1, 'sc_ny_times']);
});

test('Amsterdam perspective rows retain gables and sit on continuous paved quays', () => {
  const Art = artwork();
  let curvedGables = 0;
  for (const [i, width, height] of [[1, 170, 174], [2, 150, 184], [3, 200, 164], [4, 180, 174], [5, 130, 184]]) {
    const canvas = Art.textureCanvas('sc_we_row' + i);
    assert.equal(canvas.width, width * Art.D, 'unchanged spacing width');
    assert.equal(canvas.height, height * Art.D);
    assert.ok(canvas.ops.some((op) => op[0] === 'fillRect' && op[1] === 0 &&
      op[2] === height - 12 && op[3] === width && op[4] === 12), 'continuous quay supports row ' + i);
    assert.ok(canvas.ops.some((op) => op[0] === 'lineTo' && op[2] === height - 12),
      'side walls meet quay, not empty sky');
    curvedGables += canvas.ops.filter((op) => op[0] === 'bezierCurveTo' || op[0] === 'quadraticCurveTo').length;
  }
  assert.ok(curvedGables > 0, 'ornamental Dutch gables remain alongside stepped and pointed roofs');
});

test('challenge platforms use finite exact-size art without changing collision geometry', () => {
  const calls = [], zones = [];
  const display = { setOrigin() { return this; }, setDepth() { return this; } };
  const AH = load('systems/scenes.js', {
    Levels: { ids: [1] },
    Art: { buildCloudPlatform(scene, p) { calls.push(['cargo', p.w, p.h]); return 'cargo'; } }
  }, 1, { Phaser: { Scene: class {} } });
  const scene = new AH.Scenes[5]();
  scene.L = { theme: 'roof' };
  scene.mode = 'run';
  scene.rects = [];
  scene.add = {
    image(...args) { calls.push(['image', ...args]); return display; },
    tileSprite(...args) { calls.push(['tile', ...args]); return display; },
    zone(...args) { zones.push(args); return {}; }
  };
  scene.solids = { add() {} };
  for (const theme of ['docker', 'aks', 'actions', 'pipelines', 'entra', 'functions', 'metro', 'tube']) {
    scene.addPlatform({ x: 100, y: 200, w: 110, h: 100, cloudKind: theme });
    scene.addPlatform({ x: 0, y: 300, w: 3500, h: 100, cloudKind: theme, pipeFloor: true });
    assert.ok(calls.some(c => c[0] === 'tile' && c[5] === 'cloud_floor_' + theme));
  }
  assert.equal(calls.filter(c => c[0] === 'cargo').length, 8);
  assert.equal(calls.filter(c => c[0] === 'image' && c[3] === 'cargo').length, 8);
  assert.deepEqual(zones[0], [155, 250, 110, 100]);
  assert.deepEqual(zones[1], [1750, 350, 3500, 100]);
  assert.equal(scene.rects.length, 16);
});

test('room scenery variants cover street ambience and parallax is isolated and density-aware', () => {
  const calls = [];
  const display = () => ({
    img: {}, visible: true, depth: 0,
    setOrigin() { return this; }, setScrollFactor() { return this; }, setTint() { return this; },
    setVisible(v) { this.visible = v; return this; },
    setDepth(d) { this.depth = d; return this; }
  });
  const AH = load('systems/scenes.js', {
    Levels: { ids: [1] }, Art: { D: 2 }, Audio: { music() {} },
    PixelText: class { constructor() { return display(); } }
  }, 1, { Phaser: { Scene: class {} } });
  const scene = new AH.Scenes[5]();
  const zone = { x: 10000, w: 3500, theme: 'docker', name: 'DOCKER', hint: 'SHIP',
    stages: [], exit: { x: 13400, y: 254 } };
  scene.L = { width: 9000, pipeZones: [zone] };
  scene.add = {
    image(...args) { calls.push(args); return display(); },
    tileSprite() { return display(); }
  };
  scene.tweens = { add() {} };
  scene.textures = { exists: () => false };
  scene.buildPipes();
  assert.deepEqual(calls.map(c => c[2]), [
    'challenge_bg_docker', 'challenge_bg_docker_1', 'challenge_bg_docker_2',
    'challenge_bg_docker', 'challenge_bg_docker_1', 'challenge_bg_docker_2'
  ]);
  const sky = scene.pipeSkies[0].sky;
  assert.ok(sky.depth > -16.9, 'room sky covers regional scenery, road and time-of-day wash');
  assert.equal(sky.visible, false);
  scene.fx = display();
  scene.cameras = { main: { scrollX: 11000, setBounds() {} } };
  scene.physics = { world: { setBounds() {} } };
  scene.inPipe = zone;
  scene.warping = true;
  scene.updatePipes(0, null);
  assert.equal(sky.visible, true);
  assert.equal(sky.tilePositionX, 440);
  assert.equal(scene.fx.visible, false);
  scene.leavePipeNow();
  assert.equal(sky.visible, false);
  assert.equal(scene.fx.visible, true);
  scene.updatePipes(0, null);
  assert.equal(sky.visible, false);
});

test('street walkways start low, return to street level after climbs and Amsterdam keeps its signature landmarks', () => {
  const Levels = levels();
  for (const meta of Levels.worlds.filter((w) => w.mode === 'run' && w.theme !== 'rack')) {
    let street = 0, total = 0;
    for (let run = 0; run < 30; run++) {
      const L = Levels.make(meta.id), ground = L.platforms.filter((p) => !p.float && !p.bridge && p.h > 60);
      assert.equal(ground[0].y, 300, 'the first walkway is a low street, not a raised block');
      assert.ok(ground[1].y >= 270, 'the opening segment stays near street level');
      ground.forEach((p, i) => {
        total += p.w; if (p.y >= 270) street += p.w;
        if (i && ground[i - 1].climb && !p.climb && p.x - (ground[i - 1].x + ground[i - 1].w) < 120) assert.ok(p.y > ground[i - 1].y, 'routes drop again after a climb');
      });
    }
    assert.ok(street / total >= 0.45, meta.name + ' keeps most walkway low');
  }
  const route = artwork().sceneryRoutes.westeurope;
  assert.equal(route[0][1], 'sc_we_centraal', 'Amsterdam opens with the detailed Centraal station');
  assert.ok(route.some((stop) => stop[1] === 'sc_we_schiphol'));
});

test('random worlds have distinct, disjoint, substantial cloud challenges and vertical routes', () => {
  const Levels = levels();
  const themes = new Set();
  let walls = 0, stairs = 0;
  for (const meta of Levels.worlds) {
    for (let run = 0; run < 80; run++) {
      const L = Levels.make(meta.id);
      assert.ok(L.width > 6000);
      const hackers = L.enemies.filter((e) => e.type === 'hacker');
      if (meta.mode === 'fly') {
        assert.equal(hackers.length, 0, 'flight-only worlds keep airborne threats');
      } else {
        assert.ok(hackers.length > 0, meta.city + ' has a rogue hacker');
        for (const e of hackers) {
          assert.ok(Math.abs(e.x - L.spawn.x) - e.range > 200, 'spawn stays clear of the patrol');
          assert.ok(L.checkpoints.every((c) => Math.abs(e.x - c.x) - e.range > 80), 'checkpoints stay clear of the patrol');
          assert.ok(e.x + e.range + 10 < L.boss.left, 'patrol stays outside the boss arena');
          const ground = L.platforms.find((p) => p.y === e.y && e.x - e.range - 10 >= p.x && e.x + e.range + 10 <= p.x + p.w);
          assert.ok(ground, 'the whole patrol stays on its ground platform');
          if (meta.theme === 'rack') {
            for (const other of L.enemies.filter((o) => o !== e && o.y === e.y)) {
              assert.ok(Math.abs(e.x - other.x) - e.range - (other.range || 0) > 60,
                'ground patrols have space to remain distinct');
            }
          } else {
            assert.ok(!L.enemies.some((o) => o !== e && o.y === e.y && o.x >= ground.x && o.x <= ground.x + ground.w),
              'the hacker has a separate street platform from other ground threats');
          }
          for (const o of L.obstacles || []) {
            if (o.y + o.h === e.y) assert.ok(e.x + e.range + 10 <= o.x || e.x - e.range - 10 >= o.x + o.w,
              'patrol does not overlap a solid street obstacle');
          }
          for (const bike of L.vehicles || []) {
            if (bike.y === e.y) assert.ok(Math.abs(e.x - bike.x) > e.range + 39, 'patrol does not overlap a parked bike');
          }
          if (meta.theme === 'rack') {
            for (const rack of L.platforms.filter((p) => p.y < e.y && p.y + p.h === e.y)) {
              assert.ok(e.x + e.range + 10 <= rack.x || e.x - e.range - 10 >= rack.x + rack.w,
                'patrol does not overlap a solid data-center rack');
            }
          }
        }
      }
      if (meta.mode !== 'run' || meta.theme === 'rack') continue;
      assert.equal(L.pipeZones.length, 2, meta.city + ' has two pipe challenges');
      assert.notEqual(L.pipeZones[0].theme, L.pipeZones[1].theme);
      assert.ok(L.pipeZones[0].x + L.pipeZones[0].w < L.pipeZones[1].x);
      const ground = L.platforms.filter((p) => p.x < L.width && p.h >= 100 && !p.pipe);
      // the street stays low; height comes from climb towers and Azure cloud stairways
      const sky = L.platforms.filter((p) => p.sky && p.x < L.width);
      assert.ok(sky.length >= 6 && Math.min(...sky.map((p) => p.y)) <= 180, meta.city + ' has cloud stairways into the sky');
      assert.ok(ground.filter((p) => !p.tower && p.y < 250).length === 0, 'no raised solid walkway blocks');
      for (let i = 1; i < ground.length; i++) {
        const a = ground[i - 1], b = ground[i], gap = b.x - a.x - a.w;
        const spanned = L.platforms.some((p) => p.bridge && p.x === a.x + a.w) ||
          L.movers.some((m) => m.x0 > a.x + a.w && m.x0 < b.x);
        if (!spanned) {
          assert.ok(gap <= 195, meta.city + ' needs a bridge/boat for a wider gap');
          if (gap > 140 && a.y - b.y > 20) {
            // ledge stairs: each hop (roof -> ledge -> ledge -> roof) stays within one jump
            const steps = L.platforms.filter((p) => p.ledge && p.x > a.x + a.w && p.x < b.x).sort((p, q) => p.x - q.x);
            assert.equal(steps.length, 2, 'wide-gap rises need ledge stairs');
            for (const [lo, hi] of [[a, steps[0]], [steps[0], steps[1]], [steps[1], b]]) assert.ok(lo.y - hi.y <= 60, 'stair hops stay one jump high');
            stairs++;
          }
        }
        if (gap === 0 && a.y - b.y > 70) {
          assert.ok(b.climb && b.wallFrom === a.y, 'rises above a jump are marked climb walls');
          assert.ok(a.y - b.y <= 186, 'climb walls stay within wall-jump reach');
          walls++;
        }
        assert.ok(b.y >= 106, 'rooftops stay below the HUD');
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
      if (meta.id === 3) assert.ok(L.obstacles.some((o) => o.kind === 'bakery'), 'Paris has a bakery stall');
      // Regional rooms stay home, always behind their first pipe.
      assert.equal(L.pipeZones[0].theme === 'metro', meta.region === 'francecentral');
      assert.equal(L.pipeZones[1].theme === 'metro', false);
      assert.equal(L.pipeZones[0].theme === 'tube', meta.region === 'uksouth');
      assert.equal(L.pipeZones[1].theme === 'tube', false);
      if (meta.id === 5) assert.ok(L.obstacles.some((o) => o.kind === 'outback4x4'), 'Australia guarantees an expedition vehicle');
      for (const q of L.platforms.filter((p) => p.pipe)) assert.ok(q.theme, 'pipes carry their room theme');
      for (const Z of L.pipeZones) {
        themes.add(Z.theme);
        assert.ok(Z.w >= 3200 && Z.w <= 3840);
        assert.equal(Z.stages.length, 5);
        assert.ok(Z.enemies.length >= 10);
        assert.ok(Z.timeBonus >= Z.w / 190);
        assert.ok(Z.platforms.some((p) => p.lowTunnel));
        assert.ok(Z.platforms.filter((p) => p.lowTunnel).length < Z.stages.length);
        assert.equal(new Set(Z.stages.map((s) => s.layout)).size, 5);
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
  assert.deepEqual([...themes].sort(), ['actions', 'aks', 'docker', 'entra', 'functions', 'metro', 'pipelines', 'tube']);
  assert.ok(walls > 50 && stairs > 50, 'run worlds regularly mix climb walls and ledge stairs');
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

test('regional scenic routes place every requested highlight and preserve landmark spacing', () => {
  const registeredArt = artwork(), routes = registeredArt.sceneryRoutes;
  const textureKeys = new Set(registeredArt.textureKeys);
  const Levels = levels();
  for (const id of [1, 4, 5, 11]) {
    const region = Levels.worlds.find((w) => w.id === id).region, route = routes[region];
    assert.ok(route.length >= 3);
    for (let i = 0; i < route.length; i++) {
      const key = route[i][1];
      assert.ok(route[i][0] >= 0 && route[i][0] <= 0.85 && registeredArt.scenerySizes[key]);
      assert.ok(textureKeys.has(key) && registeredArt.textureCanvas(key), key + ' is a registered city texture');
      if (i) assert.ok(route[i][0] > route[i - 1][0]);
    }
    for (let seed = 1; seed <= 30; seed++) {
      const art = {
        D: 2, sceneryRoutes: routes, sceneryKeys: { [region]: [...new Set(route.map((r) => r[1])), 'local', 'painted'] },
        panoramaLandmarks: { [region]: ['painted'] },
        billKeys: ['bb_a', 'bb_b', 'bb_c']
      };
      const AH = load('systems/scenes.js', { Levels: { ids: [1] }, Art: art }, seed, { Phaser: { Scene: class {} } });
      const s = new AH.Scenes[5](), placed = [];
      s.L = Levels.make(id);
      s.textures = { exists: (key) => key !== 'painted', get: (key) => ({ getSourceImage: () => ({ width: (registeredArt.scenerySizes[key]?.[0] || 140) * 2 }) }) };
      s.add = { image(x, y, key) {
        const o = { x, y, key, displayWidth: registeredArt.scenerySizes[key]?.[0] || 140,
          scaleX: 0.5, setOrigin() { return this; }, setScrollFactor() { return this; }, setDepth() { return this; },
          setScale(v) { this.displayWidth *= v / this.scaleX; this.scaleX = v; return this; } };
        placed.push(o); return o;
      } };
      s.buildScenery();
      assert.ok(!placed.some((p) => p.key === 'painted'), 'landmarks painted in the panorama are not repeated in the strip');
      assert.ok(placed.every((p) => p.scaleX === 0.5), 'local architecture keeps its full detail');
      const covered = placed.reduce((n, p) => n + p.displayWidth, 0), span = placed.at(-1).x + placed.at(-1).displayWidth - placed[0].x;
      assert.ok(covered / span > 0.6, 'the townscape stays dense, with only occasional sky windows');
      assert.ok(placed.some((p, i) => i && p.x - (placed[i - 1].x + placed[i - 1].displayWidth) >= 110), 'sky windows keep the sun and panorama visible');
      const highlights = placed.filter((p) => route.some((r) => r[1] === p.key));
      assert.deepEqual(highlights.map((p) => p.key), Array.from(route, (r) => r[1]));
      const end = (s.L.width - 640) * 0.5 + 700;
      highlights.forEach((p, i) => {
        assert.ok(p.x >= end * route[i][0] - 40);
        assert.ok(p.x < end * route[i][0] + 450, 'highlights appear close to their scheduled stop');
        assert.equal(p.y, route[i][2] === undefined ? (id === 4 ? 362 : 336) : route[i][2], 'scenic baseline aligns with streets and rails');
      });
      placed.forEach((p, i) => {
        const prev = placed.slice(0, i).filter((q) => q.key === p.key).pop();
        if (prev) assert.ok(p.x - prev.x > 680 + p.displayWidth, 'no same landmark twice on screen');
      });
    }
  }
});

test('regional transit moves behind landmarks with slim infrastructure and preserves Tokyo flight', () => {
  const Levels = levels();
  for (const id of [1, 2, 3, 4, 5, 6, 9, 11]) {
    const AH = load('systems/scenes.js', { Levels: { ids: [1] }, Art: { D: 2 } }, id, {
      Phaser: { Scene: class {}, Utils: { Array: { GetRandom: (xs) => xs[0] } } }
    });
    const s = new AH.Scenes[5](), objects = [];
    s.L = Levels.make(id); s.mode = s.L.mode;
    s.cameras = { main: { scrollX: 0 } }; s.textures = { exists: () => true };
    const display = (x, y, key) => {
      const o = { x, y, key, rotation: 0, setOrigin() { return this; }, setScrollFactor(n) { this.sf = n; return this; },
        setDepth(n) { this.depth = n; return this; }, setFlipX() { return this; }, setScale(n) { this.scale = n; return this; },
        setTint() { return this; }, setAlpha(n) { this.alpha = n; return this; }, fastForward() {}, destroy() {} };
      objects.push(o); return o;
    };
    s.add = { image: display, tileSprite: (x, y, w, h, key) => Object.assign(display(x, y, key), { w, h }), particles: display };
    s.ambSky = () => {}; s.ambBirds = () => {};
    s.buildAmbient();
    assert.equal(s.amb.filter((o) => o.img.key.startsWith('amb_car_')).length, 1, 'levels open with calm streets');
    assert.equal(s.road.h, 8, 'road is a slim distant band');
    assert.ok(s.road.depth < -18, 'road cannot cover the landmark strip');
    assert.ok(s.road.alpha < 1, 'the distant road is a soft band, not a hard line through the skyline');
    for (const o of s.amb.filter((o) => /^amb_(?:car|train)_/.test(o.img.key))) {
      assert.ok(o.img.depth < -18 && o.img.depth > -19, 'land transit sits between near skyline and landmarks');
    }
    assert.ok(s.amb.every((o) => o.img.x >= 0 && o.img.x <= 640));
    const startX = s.amb.map((o) => o.img.x);
    s.updateAmbient(0.1);
    assert.ok(s.amb.every((o, i) => o.img.x !== startX[i]), 'first wave really moves');
    if (id === 1 || id === 4) {
      const train = s.amb.find((o) => o.img.key.startsWith('amb_train_'));
      assert.ok(train); assert.equal(train.img.depth, -18.8); assert.equal(train.img.sf, 0.5);
      assert.equal(train.img.scale, 0.325);
      assert.equal(train.img.y, id === 1 ? 234 : 274, 'rail runs low, not across the middle of the skyline');
      assert.equal(s.railLine.h, 22, 'viaduct does not form a tall foreground wall');
      assert.ok(s.railLine.depth < train.img.depth);
      assert.ok(s.ambT.rail > 20, 'seeded train has breathing room before the next arrival');
    }
    if (id === 1) assert.ok(s.amb.some((o) => o.img.key === 'amb_canalboat'));
    if (id === 1) assert.equal(s.amb.find((o) => o.img.key === 'amb_car_tram').img.scale, 0.36);
    const carCount = () => s.amb.filter((o) => o.img.key.startsWith('amb_car_')).length;
    const cars = carCount();
    s.updateAmbient(1.5);
    if (id === 4) {
      assert.equal(s.mode, 'fly'); assert.equal(s.road.y, 326); assert.equal(s.L.ambient.fx, 'petals');
      assert.ok(carCount() > cars, 'busy Tokyo streets use a denser traffic rate');
    } else assert.equal(carCount(), cars, 'other streets leave long gaps between traffic');
    for (let t = 0; t < 120; t++) {
      s.updateAmbient(0.5);
      assert.ok(s.amb.filter((o) => o.car).length <= (id === 4 ? 3 : 2), 'never more than a few vehicles at once');
    }
    if (id === 5) assert.ok(s.amb.some((o) => o.img.key === 'amb_car_outback4x4'));
    if (id === 2) { assert.equal(s.L.pipeZones[0].music, 'metro'); assert.equal(s.L.pipeZones[1].music, undefined); }
  }
});

test('MFA shield works on E (ground and air) and as a crouch guard on DOWN; DOWN + direction slides', () => {
  const AH = load('systems/player.js', { Art: { D: 2 }, Audio: { play() {} } });
  const chain = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => chain) });
  const body = {
    x: 100, width: 14, height: 40, position: { y: 260 }, prev: { y: 260 }, prevFrame: { y: 260 },
    velocity: { x: 0, y: 0 }, blocked: { down: true }, touching: { down: false },
    get y() { return this.position.y; }, get bottom() { return this.y + this.height; }, get right() { return this.x + this.width; },
    setSize(w, h) { this.height = h / 2; }, setOffset() {}, updateCenter() {}
  };
  const sprite = Object.assign(Object.create(chain), { x: 107, y: 277, body, setVelocityX(v) { body.velocity.x = v; return this; } });
  const p = Object.create(AH.Player.prototype);
  Object.assign(p, {
    sprite, scene: { rects: [], burst() {}, cameras: { main: { scrollX: 0 } } }, shieldFx: chain, mode: 'run', facing: 1,
    invuln: 0, defender: 0, blastCd: 0, attackT: 0, slideT: 0, slideCd: 0, boost: 100, jumps: 0, coyote: 0,
    riding: false, speedMul: 1, runT: 0, pre: 'hl_', slideHits: new Set(), ducking: false, health: 100
  });
  const cmd = (o) => Object.assign({ left: false, right: false, up: false, down: false, jumpPressed: false, fire: false, boost: false, shield: false }, o);
  p.update(1 / 60, cmd({ shield: true }));
  assert.equal(p.shielding, true, 'E shields on the ground');
  p.update(1 / 60, cmd({ down: true }));
  assert.equal(p.shielding, true, 'DOWN while standing still is a crouch guard');
  assert.equal(p.ducking, true);
  const shots = [];
  p.scene.spawnBlast = (x, y, dir, o) => shots.push({ y, charge: o.charge });
  for (let i = 0; i < 80; i++) p.update(1 / 60, cmd({ down: true, fire: i === 0, fireHeld: true }));
  assert.equal(p.shielding, false, 'holding F lowers the crouch guard');
  assert.equal(p.ducking, true, 'and the hero stays ducked to charge a low shot');
  p.update(1 / 60, cmd({ down: true }));
  assert.equal(shots.length, 1, 'releasing F while ducking fires');
  assert.ok(shots[0].charge >= 0.3, 'the low shot keeps its charge');
  assert.equal(shots[0].y, body.bottom - 10 - 5 * shots[0].charge, 'and leaves at feet height, clear of the floor');
  p.update(1 / 60, cmd({}));
  body.blocked.down = false;
  p.update(1 / 60, cmd({ shield: true }));
  assert.equal(p.shielding, true, 'E also shields in the air');
  body.blocked.down = true;
  p.update(1 / 60, cmd({}));
  p.update(1 / 60, cmd({ down: true, right: true }));
  assert.equal(p.sliding, true, 'DOWN + direction slides');
  assert.equal(p.shielding, false, 'sliding is an attack, not a guard');
});

test('wall slide slows the fall and wall jumps kick away while keeping the double jump', () => {
  const AH = load('systems/player.js', { Art: { D: 2 }, Audio: { play() {} } });
  const chain = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => chain) });
  const body = {
    x: 100, width: 14, height: 40, position: { y: 200 }, prev: { y: 200 }, prevFrame: { y: 200 },
    velocity: { x: 0, y: 300 }, blocked: { down: false, right: true }, touching: { down: false },
    get y() { return this.position.y; }, get bottom() { return this.y + this.height; }, get right() { return this.x + this.width; },
    setSize(w, h) { this.height = h / 2; }, setOffset() {}, updateCenter() {},
    setVelocityX(v) { this.velocity.x = v; }, setVelocityY(v) { this.velocity.y = v; }
  };
  const sprite = Object.assign(Object.create(chain), {
    x: 107, y: 220, body,
    setVelocityX(v) { body.velocity.x = v; return this; }, setVelocityY(v) { body.velocity.y = v; return this; },
    setVelocity(x, y) { body.velocity.x = x; body.velocity.y = y; return this; }
  });
  const p = Object.create(AH.Player.prototype);
  Object.assign(p, {
    sprite, scene: { rects: [], burst() {}, cameras: { main: { scrollX: 0 } } }, shieldFx: chain, mode: 'run', facing: 1,
    invuln: 0, defender: 0, blastCd: 0, attackT: 0, slideT: 0, slideCd: 0, boost: 100, jumps: 2, coyote: 0,
    riding: false, speedMul: 1, runT: 0, pre: 'hl_', slideHits: new Set(), ducking: false, health: 100
  });
  const cmd = (o) => Object.assign({ left: false, right: false, up: false, down: false, jumpPressed: false, fire: false, boost: false, shield: false }, o);
  p.update(1 / 60, cmd({ right: true }));
  assert.equal(p.wallSliding, true, 'pushing into a wall in the air slides');
  assert.ok(body.velocity.y <= 110, 'wall slide caps the fall speed');
  p.update(1 / 60, cmd({ right: true, jumpPressed: true }));
  assert.equal(p.wallJumps, 1, 'jump on a wall is a wall jump even after a double jump');
  assert.ok(body.velocity.y < -380, 'wall jump launches upward');
  assert.ok(body.velocity.x < 0, 'wall jump kicks away from the wall');
  assert.equal(p.jumps, 1, 'wall jump restores the double jump');
  body.blocked.right = false;
  p.update(1 / 60, cmd({ right: true }));
  assert.ok(body.velocity.x < 0, 'the kick briefly overrides input toward the wall');
});

test('all cloud threat types retain two-hit health, shared behavior and credit drops', () => {
  let drops = 0;
  const tags = [];
  class PixelText {
    constructor(scene, x, y, str, o) { this.str = str; this.o = o; this.destroyed = false; tags.push(this); }
    setDepth() { return this; } setVisible(v) { this.visible = v; return this; } setPosition() { return this; }
    destroy() { this.destroyed = true; }
  }
  const AH = load('systems/enemies.js', { Art: { D: 2 }, Audio: { play() {} }, PixelText });
  const cats = Object.keys(AH.Enemy.CATS);
  for (const [type, spec] of Object.entries(AH.Enemy.SPEC)) {
    assert.ok(spec.label && spec.info && cats.includes(spec.cat), type + ' has a nameplate, threat category and guide text');
    assert.match(spec.label + spec.info, /^[A-Z0-9 .!':\/+,?-]+$/, type + ' text fits the pixel font');
  }
  for (const type of ['bug', 'image', 'rbac', 'endpoint', 'guest', 'hacker']) {
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
    assert.equal(tags[tags.length - 1].destroyed, true, 'nameplate is removed with the enemy');
  }
  assert.equal(drops, 6);
});

test('rogue hacker patrols, shoots toward the player and drops one credit with an MFA tip', () => {
  const bolts = [], coins = [], tips = [];
  class PixelText {
    setDepth() { return this; } setVisible() { return this; } setPosition() { return this; }
    destroy() { this.destroyed = true; }
  }
  const AH = load('systems/enemies.js', { Levels: { ids: [1] }, Art: { D: 2 }, Audio: { play() {} }, PixelText });
  load('systems/scenes.js', AH, 1, { Phaser: { Scene: class {} } });
  const body = {
    blocked: { left: false, right: false }, setSize() {}, setOffset() {}, setAllowGravity() {},
    setVelocityX(v) { this.vx = v; }, setVelocityY(v) { this.vy = v; }
  };
  const sprite = {
    x: 200, y: 300, displayHeight: 37, body,
    setOrigin() { return this; }, setDepth() { return this; }, play(key) { this.animation = key; },
    setFlipX(v) { this.flipped = v; }, setTint() {}, clearTint() {}, setTintFill() {}, destroy() {}
  };
  const scene = {
    anims: { exists() { return false; } }, physics: { add: { sprite() { return sprite; }, collider() {} } },
    time: { delayedCall() {} }, spawnEnemyBolt(...args) { bolts.push(args); },
    stats: { kills: 0 }, achieve() {}, addScore() {}, burst() {},
    spawnCoin(...args) { coins.push(args); }, toast(text) { tips.push(text); },
    onEnemyKilled: AH.Scenes[5].prototype.onEnemyKilled
  };
  const e = new AH.Enemy(scene, { type: 'hacker', x: 200, y: 300, range: 24, skin: 'westeurope' });
  assert.equal(sprite.animation, 'hacker_walk', 'regional skins fall back to the shared hacker art');
  assert.equal(e.spec.cat, 'identity');
  assert.equal(e.shoot, true);
  e.shootCd = 0;
  e.update(0.016, { x: 100, y: 280 });
  assert.deepEqual(bolts[0], [186, 278, -1]);
  assert.equal(sprite.flipped, false);
  assert.equal(body.vx, -40);
  e.shootCd = 0;
  e.update(0.016, { x: 300, y: 280 });
  assert.deepEqual(bolts[1], [214, 278, 1]);
  assert.equal(sprite.flipped, true);
  e.shootCd = 0;
  e.update(0.016, { x: 600, y: 280 });
  assert.equal(bolts.length, 2, 'the hacker cannot shoot outside the shared shooter range');
  e.hit(1);
  assert.equal(e.health, 1);
  assert.equal(e.dead, false);
  e.hit(1);
  assert.equal(e.dead, true);
  assert.deepEqual(coins, [[200, 282, true]], 'the shared death path drops one Azure Credit');
  assert.deepEqual(tips, ['INTRUSION STOPPED - ENABLE ENTRA MFA']);
  e.update(1, { x: 100, y: 280 });
  assert.equal(bolts.length, 2, 'a defeated hacker cannot shoot');
});

test('every region has exactly one unlockable hero suit and locked suits are enforced', () => {
  const Levels = levels(), hero = artwork().hero;
  const suitUnlock = Array.from(hero.suitUnlock);
  assert.deepEqual(suitUnlock.filter((unlock) => unlock >= 0), Array.from(Levels.ids, (_, i) => i), 'one suit per level, in world order');
  const firstRegional = suitUnlock.indexOf(0);
  assert.equal(hero.suitOpen(firstRegional, 1), false);
  assert.equal(hero.suitOpen(firstRegional, 2), true, 'a suit opens once its level index is cleared');
});

test('every regional boss has registered fighter textures, a bolt and readable metadata', () => {
  const Levels = levels(), art = artwork();
  const kinds = new Set();
  const textureKeys = new Set(art.textureKeys);
  for (const meta of Levels.worlds) {
    const B = Levels.make(meta.id).boss;
    assert.match(B.name, /^[A-Z0-9 \-.!':\/+,?]+$/, 'boss names use the pixel font charset');
    if (B.kind === 'guardian') continue;
    kinds.add(B.kind);
    for (const pose of ['0', '1', 'walk', 'attack', 'kick', 'jump', 'upper', 'stun']) {
      assert.ok(textureKeys.has('boss_' + B.kind + '_' + pose), B.kind + ' has ' + pose + ' fighter art');
    }
    assert.ok(textureKeys.has('bolt_' + B.proj), B.kind + ' has its own projectile art');
  }
  assert.ok(kinds.size >= 9, 'each region has a distinct fighter');
});

test('New York appends a complete varied waterfront world without changing existing IDs', () => {
  const Levels = levels();
  assert.deepEqual(Array.from(Levels.worlds.slice(0, 10), (w) => w.region),
    ['westeurope', 'uksouth', 'francecentral', 'japaneast', 'australiaeast', 'italynorth',
      'brazilsouth', 'mexicocentral', 'westus2', 'eastus']);
  const meta = Levels.meta(11);
  assert.equal(meta.region, 'eastus2');
  assert.equal(meta.city, 'NEW YORK');
  assert.equal(meta.mode, 'run');
  assert.match(meta.hint, /HOSTED IN AZURE EAST US 2/);
  assert.equal(new Set(Levels.worlds.map((w) => w.region)).size, Levels.ids.length);
  const layouts = new Set(), creatures = new Set(), props = new Set(), themes = new Set();
  for (let seed = 1; seed <= 100; seed++) {
    const L = levels(seed).make(11);
    assert.ok(L.width >= 8000 && L.width <= 13000, 'challenging world length');
    layouts.add(JSON.stringify(L.platforms));
    assert.equal(L.water, true);
    assert.equal(L.boss.kind, 'broker');
    assert.equal(L.boss.proj, 'broker');
    assert.ok(L.platforms.some((p) => p.x === L.boss.left && p.w === 760 && p.y === L.boss.floor));
    assert.ok(L.obstacles.some((o) => o.kind === 'hotdog' && o.w === 64 && o.h === 52), 'local stand appears every run');
    assert.equal(L.pipeZones.length, 2);
    assert.notEqual(L.pipeZones[0].theme, L.pipeZones[1].theme);
    L.pipeZones.forEach((z) => themes.add(z.theme));
    L.enemies.filter((e) => e.x < L.width).forEach((e) => {
      assert.equal(e.skin, 'eastus2');
      creatures.add(e.type);
    });
    L.props.forEach((p) => props.add(p.kind));
    assert.ok(L.powerups.some((p) => p.kind === 'spread'));
    assert.ok(L.powerups.some((p) => p.kind === 'pierce'));
  }
  assert.equal(layouts.size, 100);
  for (const type of ['robot', 'spider', 'drone', 'hacker']) assert.ok(creatures.has(type));
  assert.deepEqual([...props].sort(), ['hydrant', 'newsbox']);
  for (const theme of ['pipelines', 'aks', 'actions', 'docker', 'entra', 'functions']) assert.ok(themes.has(theme));
});

test('New York map pin uses city coordinates with space beside Virginia', () => {
  const Levels = levels(), map = Levels.meta(11).map;
  assert.equal(map[0], -74.006);
  assert.equal(map[1], 40.7128);
  assert.ok(map[2] >= 16 && map[3] <= -12, 'offset keeps neighboring pins tappable');
  assert.ok(Levels.worlds.every((world) => Array.isArray(world.map) && world.map.length === 4));
});
