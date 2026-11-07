'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { artScripts, loadScripts, recordingDocument } = require('./helpers/load-game');
const Art = loadScripts(artScripts(), { globals: { document: recordingDocument() } }).Art;
const order = ['night', 'sunrise', 'morning', 'day', 'afternoon', 'sunset'];
const Environment = loadScripts(['systems/environment.js']).Environment;

test('outdoor clock smoothly wraps every 240 seconds through every phase', () => {
  for (let i = 0; i < order.length; i++) {
    const sample = Environment.sample(i * 40, order);
    assert.equal(sample.from, order[i]); assert.equal(sample.blend, 0);
    assert.equal(sample.to, order[(i + 1) % order.length]);
    assert.equal(Environment.sample(i * 40 + 20, order).blend, 0.5);
  }
  assert.deepEqual(Environment.sample(240, order), Environment.sample(0, order));
  assert.ok(Environment.sample(240 - 0.001, order).blend > 0.99999);
  assert.ok(Environment.sample(0.001, order).blend < 0.00001);
});

test('scenic sections fade at boundaries and hold full coverage over meaningful distances', () => {
  const sections = Art.environments.australiaeast;
  assert.equal(sections.length, 3);
  let end = 0;
  for (const section of sections) {
    assert.ok(section.start >= end && section.end <= 1);
    assert.ok(section.end - section.start - 2 * section.fade > 0.15);
    assert.equal(Environment.weight(section, section.start), 0);
    assert.equal(Environment.weight(section, section.end), 0);
    assert.ok(Math.abs(Environment.weight(section, section.start + section.fade / 2) - 0.5) < 1e-12);
    assert.equal(Environment.weight(section, (section.start + section.end) / 2), 1);
    const canvas = Art.textureCanvas(section.key);
    assert.deepEqual([canvas.width, canvas.height], [640 * Art.D, 360 * Art.D]);
    assert.ok(canvas.ops.length > 200, section.key + ' is detailed full-viewport artwork');
    assert.ok(!canvas.ops.some(op => op[0] === 'fillRect' && op[1] === 0 && op[2] === 0 && op[3] === 640 && op[4] === 360),
      'transparent sky area retains the dynamic lighting sky');
    end = section.end;
  }
  assert.equal(Object.keys(Art.environments).length, 1, 'other cities keep their own panorama');
});

function fixture(region = 'australiaeast', tod = 'day', level = {}) {
  const made = [];
  function display(x, y, key) {
    const o = { x, y, texture: { key }, alpha: 1, visible: true,
      setOrigin() { return this; }, setScrollFactor() { return this; }, setDisplaySize() { return this; },
      setDepth(n) { this.depth = n; return this; }, setBlendMode() { return this; },
      setAlpha(n) { this.alpha = n; return this; }, setTint(n) { this.tint = n; return this; },
      setTexture(key) { this.texture.key = key; return this; }, setVisible(n) { this.visible = n; return this; }
    };
    made.push(o); return o;
  }
  const AH = loadScripts(['systems/environment.js'], { AH: { Art },
    globals: { Phaser: { BlendModes: { ADD: 1 } } } });
  const s = {
    tod, state: 'play', L: { width: 10000, region, ...level }, cameras: { main: { scrollX: 680 } },
    sky: display(0, 0, 'bg_sky_tod_day'), far: display(), near: display(),
    road: display(), railLine: display(), children: { list: [
      display().setDepth(-18), display(0, 300, 'sc_au_beach').setDepth(-18)
    ] },
    amb: [{ img: display().setDepth(-18.5) }, { img: display().setDepth(-25) }],
    add: { image: display, rectangle: display, tileSprite: (x, y, w, h, key) => display(x, y, key) }
  };
  const palette = Object.fromEntries(order.map((name, i) => [name,
    { far: i === 0 ? 0x000000 : 0xffffff, near: 0xffffff, strip: 0xffffff,
      dark: i === 0 ? 0.26 : 0, wash: i === 1 ? [0xff9900, 0.1] : null }]));
  const env = new AH.Environment(s, palette, order);
  return { s, env, made };
}

test('section coverage suppresses city strips and decorative transit then restores them', () => {
  const { s, env } = fixture();
  s.fore = { setAlpha(n) { this.alpha = n; return this; }, setTint(n) { this.tint = n; return this; } };
  env.update(0);
  assert.equal(s.far.alpha, 0); assert.equal(s.near.alpha, 0); assert.equal(s.road.alpha, 0);
  assert.equal(s.fore.alpha, 0);
  assert.equal(s.children.list[0].alpha, 0); assert.equal(s.amb[0].img.alpha, 0);
  assert.equal(s.amb[1].img.alpha, 1, 'sky traffic remains');
  s.cameras.main.scrollX = 8180; env.update(0);
  assert.equal(s.far.alpha, 1); assert.equal(s.road.alpha, 0.55); assert.equal(s.railLine.alpha, 0.7);
  assert.equal(s.fore.alpha, 1); assert.equal(s.fore.tint, 0xffffff);
  assert.equal(s.children.list[0].alpha, 1); assert.equal(s.amb[0].img.alpha, 1);
  assert.equal(s.children.list[1].alpha, 0, 'old beach vignette never reappears between full environments');
});

test('clock freezes for pause, help, intro, warps, pipes and secrets without darkening room art', () => {
  const { s, env } = fixture('australiaeast', 'night');
  const start = env.seconds;
  for (const state of ['paused', 'help', 'intro', 'dying', 'complete', 'gameover']) {
    s.state = state; env.update(1); assert.equal(env.seconds, start);
  }
  s.state = 'play';
  for (const property of ['inPipe', 'inBonus', 'warping']) {
    s[property] = true; env.update(1); assert.equal(env.seconds, start);
    if (property !== 'warping') {
      assert.equal(env.dark.visible, false); assert.equal(env.wash.visible, false);
      assert.ok(env.sections.every(section => section.image.alpha === 0));
    }
    s[property] = false;
  }
  env.update(0); assert.equal(env.dark.visible, true); assert.equal(env.dark.alpha, 0.26);
  assert.equal(env.sections[0].image.alpha, 1);
  env.update(1); assert.equal(env.seconds, start + 1);
});

test('lighting interpolation uses persistent layers, not per-frame allocations', () => {
  const { s, env, made } = fixture('westeurope', 'night'), count = made.length;
  env.update(20);
  assert.equal(env.skyBlend.alpha, 0.5);
  assert.equal(env.dark.alpha, 0.13);
  assert.equal(s.far.tint, 0x808080);
  for (let i = 0; i < 1000; i++) env.update(0.05);
  assert.equal(made.length, count);
  assert.equal(env.sections.length, 0);
});

test('datacenter keeps its authored indoor lighting', () => {
  const { env } = fixture('eastus', null);
  assert.equal(env.skyBlend, undefined); assert.equal(env.dark, undefined);
  env.update(100);
});

test('regional weather and neon use city-owned art with bounded layers and section fades', () => {
  assert.deepEqual(Object.keys(Art.atmospheres).sort(), ['japaneast', 'westeurope']);
  for (const a of Object.values(Art.atmospheres)) {
    for (const layer of a.layers) {
      const canvas = Art.textureCanvas(layer.key);
      assert.deepEqual([canvas.width, canvas.height], [layer.width * Art.D, layer.height * Art.D]);
      if (layer.key === 'tokyo_blocks' || layer.key === 'tokyo_yokocho') assert.ok(canvas.ops.length > 80);
      else assert.ok(canvas.ops.some(op => op[0] === 'drawImage'), 'transparent layer uses uncrisped art');
    }
    assert.ok(Art.textureCanvas(a.rain.key));
    for (const section of a.rain.sections) {
      assert.equal(Environment.weight(section, section.start), 0);
      assert.equal(Environment.weight(section, section.end), 0);
      assert.equal(Environment.weight(section, (section.start + section.end) / 2), 1);
    }
  }
  const tokyo = Art.atmospheres.japaneast;
  assert.ok(tokyo.layers.some(l => l.additive && l.night));
  assert.ok(tokyo.layers.find(l => l.key === 'tokyo_blocks').scroll < 0.2);
  assert.ok(tokyo.layers.find(l => l.key === 'tokyo_wires').scroll > 1);
  assert.ok(Art.textureCanvas('tokyo_yokocho').ops.some(op => op[0] === 'fillRect'));
});

test('Amsterdam rain is local to stretches, freezes and restores with no per-frame allocation', () => {
  const { s, env, made } = fixture('westeurope');
  s.cameras.main.scrollX = 1800; env.update(1);
  assert.equal(env.rain.alpha, 1);
  assert.equal(env.overcast.alpha, 1);
  assert.equal(env.wetRoad.alpha, 1);
  const time = env.atmosphereTime, offset = env.rain.tilePositionY, count = made.length;
  for (const state of ['paused', 'help', 'intro', 'dying']) {
    s.state = state; env.update(10);
    assert.equal(env.atmosphereTime, time);
    assert.equal(env.rain.tilePositionY, offset);
  }
  s.state = 'play';
  for (const flag of ['inPipe', 'inBonus', 'warping']) {
    s[flag] = true; env.update(1);
    assert.equal(env.rain.visible, false);
    assert.equal(env.overcast.visible, false);
    assert.equal(env.wetRoad.visible, false);
    assert.equal(env.atmosphereTime, time);
    s[flag] = false;
  }
  env.update(0); assert.equal(env.rain.visible, true); assert.equal(env.rain.alpha, 1);
  s.cameras.main.scrollX = 0; env.update(0);
  assert.equal(env.rain.alpha, 0); assert.equal(env.overcast.alpha, 0);
  for (let i = 0; i < 500; i++) env.update(0.05);
  assert.equal(made.length, count);
});

test('Tokyo preserves landmarks and hides decorative framing in rooms', () => {
  const { s, env, made } = fixture('japaneast', 'night');
  s.cameras.main.scrollX = 2500; env.update(0);
  assert.equal(s.children.list[0].alpha, 1, 'weather layers never replace landmarks');
  assert.equal(env.weatherLayers.length, 4);
  assert.ok(env.weatherLayers.filter(l => l.depth < 0).every(l => l.height <= 220));
  assert.equal(env.weatherLayers.find(l => l.night).image.alpha, 0.8);
  const count = made.length;
  s.inPipe = true; env.update(1);
  assert.ok(env.weatherLayers.every(l => !l.image.visible));
  s.inPipe = false; env.update(0);
  assert.ok(env.weatherLayers.every(l => l.image.visible));
  assert.equal(made.length, count);
});

test('wet overlays match solid outdoor tops without covering gaps, clouds or rooms', () => {
  const ground = { x: 100, y: 300, w: 420, h: 100 };
  const platforms = [ground, { ...ground, x: 600, y: 180 },
    ...['cloud', 'ceil', 'pipe', 'bridge', 'cloudKind'].map((flag, i) =>
      ({ ...ground, x: 1000 + i * 500, [flag]: true })),
    { ...ground, x: 12000, pipeFloor: true }];
  const { s, env, made } = fixture('westeurope', 'day', { platforms, boss: { left: 9000 } });
  assert.equal(env.wetSurfaces.length, 1);
  assert.deepEqual([env.wetSurfaces[0].x, env.wetSurfaces[0].y], [100, 300]);
  s.cameras.main.scrollX = 1800; env.update(0);
  assert.equal(env.wetSurfaces[0].alpha, 0.85);
  const count = made.length;
  s.inPipe = true; env.update(1); assert.equal(env.wetSurfaces[0].visible, false);
  s.inPipe = false; env.update(0); assert.equal(env.wetSurfaces[0].visible, true);
  assert.equal(made.length, count);
});
