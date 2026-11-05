'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { artScripts, loadScripts, recordingDocument } = require('./helpers/load-game');

const document = recordingDocument();
const AH = loadScripts(artScripts(), { globals: { document } });
const C = AH.ArtModules.context;
const themes = ['pipelines', 'aks', 'actions', 'docker', 'entra', 'functions', 'tube', 'metro'];

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
