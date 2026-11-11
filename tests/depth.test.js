'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { artScripts, loadScripts, recordingDocument } = require('./helpers/load-game');

const document = recordingDocument();
const AH = loadScripts(artScripts(), { globals: { document } });
const C = AH.ArtModules.context;
const themes = ['pipelines', 'aks', 'actions', 'docker', 'entra', 'functions', 'tube', 'metro'];

test('backgrounds register without allocating canvases and redraw identically after eviction', () => {
  const game = loadScripts(artScripts(), { globals: { document: recordingDocument() } });
  const lazy = game.ArtModules.context.lazyTextures;
  assert.ok(lazy.size > 200, 'regional scenery and indoor layers are deferred');
  assert.ok([...lazy.values()].every(entry => entry.canvas === null));
  const key = 'bg_far_westeurope';
  const first = game.Art.textureCanvas(key);
  const ops = JSON.stringify(first.ops);
  assert.equal(game.Art.textureCanvas(key), first, 'repeat requests reuse the canvas');
  lazy.get(key).canvas = null;
  const second = game.Art.textureCanvas(key);
  assert.notEqual(first, second);
  assert.equal(JSON.stringify(second.ops), ops, 'local seeded drawing is independent of request order');
  assert.equal(lazy.get('bg_far_japaneast').canvas, null, 'another city stays unrendered');
});

test('texture requests load lazily and scene teardown releases only unreferenced artwork', () => {
  class Image { setTexture() { return this; } }
  class Sprite { setTexture() { return this; } }
  class Factory { tileSprite() { return { setTileScale() {} }; } }
  const game = loadScripts(artScripts(), { globals: {
    document: recordingDocument(),
    Phaser: { GameObjects: { Image, Sprite, GameObjectFactory: Factory } }
  } });
  const events = new EventEmitter(), shutdown = new EventEmitter(), children = [];
  const loaded = new Map();
  const textures = {
    exists: key => loaded.has(key), get: key => loaded.get(key),
    addCanvas(key, canvas) {
      assert.equal(this.exists(key), false, 'upload handles its own existence check without recursion');
      loaded.set(key, { key, canvas });
    },
    remove: key => loaded.delete(key)
  };
  const scene = {
    textures, anims: { exists: () => false, create() {} },
    sys: { events: shutdown, displayList: { getChildren: () => children } }
  };
  scene.sys.game = { events, scene: { scenes: [scene] } };
  game.Art.generate(scene);
  assert.equal(loaded.has('bg_far_westeurope'), false, 'boot skips city uploads');
  const first = textures.get('bg_far_westeurope');
  assert.ok(first.canvas.width > 0);
  assert.equal(textures.exists('bg_far_japaneast'), true, 'optional queries see registered lazy art');
  const unreferenced = loaded.get('bg_far_japaneast').canvas;
  children.push({ list: [{ displayTexture: first }] });
  shutdown.emit('shutdown'); events.emit('poststep');
  assert.equal(loaded.has(first.key), true, 'retained container/TileSprite references keep their source');
  assert.equal(loaded.has('bg_far_japaneast'), false);
  assert.equal(unreferenced.width, 0, 'released canvases free their backing storage');
  children.length = 0;
  shutdown.emit('shutdown'); events.emit('poststep');
  assert.equal(loaded.has(first.key), false);
  assert.equal(game.ArtModules.context.lazyTextures.get(first.key).canvas, null);
  assert.ok(textures.get(first.key).canvas.width > 0, 'revisiting rebuilds an evicted texture');
});

test('touch artwork retains every texture with a bounded startup memory footprint', () => {
  const mobile = loadScripts(artScripts(), {
    globals: {
      document: recordingDocument(),
      matchMedia(query) {
        assert.equal(query, '(pointer: coarse)');
        return { matches: true };
      }
    }
  }).Art;
  assert.equal(AH.Art.D, 2, 'desktop density remains unchanged');
  assert.equal(mobile.D, 1, 'touch devices use logical-resolution artwork');
  assert.deepEqual(Array.from(mobile.textureKeys), Array.from(AH.Art.textureKeys));
  const bytes = (art) => art.textureKeys.reduce((sum, key) => {
    const canvas = art.textureCanvas(key);
    return sum + canvas.width * canvas.height * 4;
  }, 0);
  assert.ok(bytes(mobile) < 128 * 1024 * 1024, 'touch startup canvases stay below 128 MiB');
  assert.ok(bytes(mobile) <= bytes(AH.Art) * 0.27, 'canvas bytes fall by at least 73 percent');
  for (const [key, w, h] of [['bg_sky', 640, 360], ['hero_idle', 32, 48], ['roof_top', 32, 8]]) {
    const canvas = mobile.textureCanvas(key);
    assert.deepEqual([canvas.width, canvas.height], [w, h], key + ' preserves logical bounds');
  }
});

test('artwork canvases select readback-friendly contexts before drawing', () => {
  const calls = [];
  const isolated = loadScripts(['art/core.js'], { globals: {
    document: { createElement: () => ({
      getContext(type, options) { calls.push({ type, options }); return {}; }
    }) }
  } });
  const context = isolated.ArtModules.context;
  isolated.ArtModules.stages['art.core.0'](context);
  const canvas = context.cv(32, 48);
  assert.deepEqual([canvas.width, canvas.height], [32, 48]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, '2d');
  assert.equal(calls[0].options.willReadFrequently, true);
});

test('fine-pointer browsers keep desktop density', () => {
  const isolated = loadScripts(['art/core.js'], { globals: {
    matchMedia: () => ({ matches: false })
  } });
  isolated.ArtModules.stages['art.core.0'](isolated.ArtModules.context);
  assert.equal(isolated.ArtModules.context.D, 2);
});

test('painted depth helpers stay within their supplied rectangles and consume no random values', () => {
  const isolated = loadScripts(['art/core.js'], { globals: { document } });
  const helpers = isolated.ArtModules.context;
  isolated.ArtModules.stages['art.core.0'](helpers);
  for (const [width, height, depth] of [[120, 80, 14], [12, 8, 24], [640, 24, 6]]) {
    for (const helper of ['depthFace', 'depthGround']) {
      const canvas = document.createElement('canvas'), g = canvas.getContext('2d');
      if (helper === 'depthFace') helpers[helper](g, 13, 7, width, 7 + height, depth, '#111111', '#aaaaaa');
      else helpers[helper](g, 13, 7 + height, width, Math.min(depth, height), '#111111', '#aaaaaa');
      for (const op of canvas.ops) {
        if (op[0] === 'moveTo' || op[0] === 'lineTo') {
          assert.ok(op[1] >= 13 && op[1] <= 13 + width, `${helper} x ${op[1]}`);
          assert.ok(op[2] >= 7 && op[2] <= 7 + height, `${helper} y ${op[2]}`);
        }
        for (const value of op.slice(1).filter((v) => typeof v === 'number')) assert.ok(Number.isFinite(value));
      }
      assert.ok(canvas.ops.some((op) => op[0] === 'lineTo'));
    }
  }
  assert.doesNotMatch(C.depthFace.toString() + C.depthGround.toString(), /\brng\b|\brandom\b/);
});

test('all eight underground themes retain full-size far layers and three distinct dimensional backgrounds', () => {
  for (const theme of themes) {
    const backgrounds = [];
    for (const suffix of ['far', 'bg', 'bg_1', 'bg_2']) {
      const key = 'challenge_' + (suffix.startsWith('bg') ? 'bg_' + theme + suffix.slice(2) : 'far_' + theme);
      const canvas = AH.Art.textureCanvas(key);
      assert.ok(canvas, key);
      assert.equal(canvas.width, 640 * AH.Art.D);
      assert.equal(canvas.height, 360 * AH.Art.D);
      assert.ok(canvas.ops.some((op) => op[0] === 'lineTo'), key + ' has painted planes');
      if (suffix !== 'far') backgrounds.push(canvas.ops);
    }
    assert.notDeepEqual(backgrounds[0], backgrounds[1], theme + ' second room remains distinct');
    assert.notDeepEqual(backgrounds[1], backgrounds[2], theme + ' third room remains distinct');
  }
});

test('depth-painted cloud solids preserve exact platform bounds, low-duct geometry and cache keys', () => {
  for (const theme of themes) for (const [w, h] of [[64, 18], [120, 48], [192, 96]]) for (const lowTunnel of [false, true]) {
    const platform = { x: 200, y: 140, w, h, cloudKind: theme, lowTunnel };
    const before = JSON.stringify(platform), cache = new Map();
    const scene = { textures: { exists: (key) => cache.has(key), addCanvas: (key, value) => cache.set(key, value) } };
    const key = AH.Art.buildCloudPlatform(scene, platform), canvas = cache.get(key);
    assert.equal(JSON.stringify(platform), before);
    assert.equal(canvas.width, w * AH.Art.D);
    assert.equal(canvas.height, h * AH.Art.D);
    assert.ok(canvas.ops.filter((op) => op[0] === 'lineTo').length >= 6, theme + ' has roof and side returns');
    assert.equal(AH.Art.buildCloudPlatform(scene, platform), key);
    assert.equal(cache.size, 1);
  }
});

test('street, datacenter, flight and secret floor tops keep their collision-aligned sizes', () => {
  for (const key of ['roof', 'rack', 'rock', 'quay', 'embank', 'pier', 'neon', 'grass',
    'quai_paris', 'itcanal', 'rd', 'adobe', 'pbrick', 'retro', 'xbox']) {
    const canvas = AH.Art.textureCanvas(key + '_top');
    assert.equal(canvas.width, 32 * AH.Art.D, key);
    assert.equal(canvas.height, 8 * AH.Art.D, key);
    assert.ok(canvas.ops.some((op) => op[0] === 'lineTo'), key + ' has receding top seams');
    assert.ok(canvas.ops.some((op) => op[0] === 'fillRect' && op[1] === 0 && op[2] === 0 && op[3] === 32),
      key + ' still paints the original collision top');
  }
});

test('all existing secret-room backgrounds retain their dimensions and local perspective', () => {
  for (const key of ['bonus_bg', 'bonus_bg_retro', 'bonus_bg_xbox', 'bonus_bg_sewer']) {
    const canvas = AH.Art.textureCanvas(key);
    assert.equal(canvas.width, 640 * AH.Art.D, key);
    assert.equal(canvas.height, 360 * AH.Art.D, key);
    assert.ok(canvas.ops.filter((op) => op[0] === 'lineTo').length >= 12, key + ' has physical interior or terrain planes');
  }
});

test('active datacenter near layer has cabinet returns while Redmond leaves its skyline visible', () => {
  const dc = AH.Art.textureCanvas('bg_dc_near');
  assert.equal(dc.width, 640 * AH.Art.D);
  assert.equal(dc.height, 120 * AH.Art.D);
  assert.ok(dc.ops.filter((op) => op[0] === 'lineTo').length >= 100, 'actual rack gameplay layer contains aisle and cabinet planes');
  const redmond = AH.Art.textureCanvas('bg_near_westus2');
  assert.ok(!redmond.ops.some((op) => op[0] === 'fillRect' && op[1] === 0 && op[2] === 0 && op[3] === 640 && op[4] === 190),
    'near vegetation has transparent sky rather than an opaque rectangular backplate');
});
