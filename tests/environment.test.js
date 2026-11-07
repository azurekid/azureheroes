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

function fixture(region = 'australiaeast', tod = 'day') {
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
    tod, state: 'play', L: { width: 10000, region }, cameras: { main: { scrollX: 680 } },
    sky: display(0, 0, 'bg_sky_tod_day'), far: display(), near: display(),
    road: display(), railLine: display(), children: { list: [
      display().setDepth(-18), display(0, 300, 'sc_au_beach').setDepth(-18)
    ] },
    amb: [{ img: display().setDepth(-18.5) }, { img: display().setDepth(-25) }],
    add: { image: display, rectangle: display }
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
