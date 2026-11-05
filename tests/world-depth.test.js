'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { artScripts, loadScripts, recordingDocument } = require('./helpers/load-game');

const regions = ['japaneast', 'australiaeast', 'brazilsouth', 'mexicocentral', 'westus2', 'eastus', 'eastus2'];
const document = recordingDocument();
const AH = loadScripts(artScripts().filter(file => file !== 'art/sprites.js'), { globals: { document } });
const draws = {}, planes = {};
let active;
const core = AH.ArtModules.stages['art.core.0'];
AH.ArtModules.stages['art.core.0'] = C => {
  core(C);
  const rng = C.rng, reg2 = C.reg2;
  C.rng = seed => {
    const r = rng(seed);
    return () => {
      const value = r();
      if (active) (draws[active] ||= []).push(value);
      return value;
    };
  };
  C.reg2 = (key, w, h, draw, opt) => reg2(key, w, h, (...args) => {
    const previous = active;
    active = key;
    draw(...args);
    active = previous;
  }, opt);
  for (const name of ['depthFace', 'depthGround']) {
    const draw = C[name];
    C[name] = (...args) => {
      if (active) (planes[active] ||= []).push([name, ...args.slice(1)]);
      return draw(...args);
    };
  }
};
loadScripts(['art/sprites.js'], { AH, globals: { document } });
const Art = AH.Art;
const keys = regions.flatMap(region => Array.from(Art.sceneryKeys[region] || []));
const panoramas = regions.flatMap(region => ['bg_far_' + region, 'bg_near_' + region]).filter(key => Art.textureCanvas(key));
const all = keys.concat(panoramas);
all.forEach(key => Art.textureCanvas(key));
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('world scenery depth keeps texture keys, sizes and seeded random consumption', () => {
  // Captured from the pre-depth HEAD modules.
  // Link is a later additive scenic stop; the original assets retain their bounds.
  const originalKeys = keys.filter(key => key !== 'sc_rd_link');
  const originalAll = all.filter(key => key !== 'sc_rd_link');
  assert.equal(originalKeys.length, 84);
  assert.equal(hash(originalKeys.map(key => [key, ...Art.scenerySizes[key]])),
    '50f0da4c6ffd2157cf93dfc0bd1eb0d958ee8dd88b82e1279893ac599f29eefe');
  assert.equal(hash(originalAll.map(key => { const c = Art.textureCanvas(key); return [key, c.width, c.height]; })),
    'f45dfa8da47a5385b51ddd0d766174bc321725e40c96f46af1b23bb6b6938ed2');
  assert.equal(hash(originalAll.map(key => [key, draws[key] || []])),
    '20e55e82d3f9b3c534bd81f49ee7c0bafcf0ee822fa737e455541fb0ed76e016');
});

test('each city paints bounded returns and grounded contact planes across its scenery', () => {
  const prefixes = { japaneast: 'sc_jp_', australiaeast: 'sc_au_', brazilsouth: 'sc_br_', mexicocentral: 'sc_mx_', westus2: 'sc_rd_', eastus2: 'sc_ny_' };
  for (const [region, prefix] of Object.entries(prefixes)) {
    const local = Array.from(Art.sceneryKeys[region]).filter(key => key.startsWith(prefix));
    const shaped = local.filter(key => (planes[key] || []).some(p => p[0] === 'depthFace'));
    const grounded = local.filter(key => (planes[key] || []).some(p => p[0] === 'depthGround'));
    const painted = local.filter(key => planes[key]);
    // Some pieces (paths, tracks, surf) keep bespoke perspective rather than the shared planes.
    assert.ok(painted.length >= local.length * 0.65, region + ' depth on ' + painted.length + '/' + local.length);
    assert.ok(shaped.length >= 3 && grounded.length >= 3, region + ' mixes building returns with contact ground');
  }
  for (const key of all) {
    const [w, h] = Art.scenerySizes[key] || [Art.textureCanvas(key).width / Art.D, Art.textureCanvas(key).height / Art.D];
    for (const [kind, x, a, width, b] of planes[key] || []) {
      assert.ok(x >= -0.001 && x + width <= w + 0.001, key + ' ' + kind + ' stays inside its texture');
      if (kind === 'depthFace') assert.ok(a >= 0 && b > a && b <= h + 0.001, key + ' facade base is valid');
      else assert.ok(a <= h + 0.001 && a > 0, key + ' ground sits on the texture');
    }
  }
});

test('Virginia rack-theme gameplay panorama carries the visible monument depth', () => {
  const local = planes.bg_far_eastus || [];
  assert.ok(local.filter(p => p[0] === 'depthFace').length >= 6, 'capitol, monument and memorial returns');
  assert.ok(local.some(p => p[0] === 'depthGround'), 'Mall terrace contact ground');
});

test('Sydney coast and outback are grounded silhouettes rather than scenic cards', () => {
  const route = Array.from(Art.sceneryRoutes.australiaeast, stop => Array.from(stop));
  assert.deepEqual(route, [
    [0, 'sc_au_beach', 300], [0.23, 'sc_au_outback', 300], [0.42, 'sc_au_uluru', 260],
    [0.62, 'sc_au_outback', 300], [0.81, 'sc_au_beach', 300]
  ]);
  for (const key of ['sc_au_beach', 'sc_au_outback']) {
    const [w, h] = Art.scenerySizes[key], ops = Art.textureCanvas(key).ops;
    assert.ok(!ops.some(op => op[0] === 'fillRect' && op[3] >= w * 0.9 && op[4] > 20),
      key + ' has no opaque ocean/terrain rectangle');
    assert.ok(ops.some(op => op[0] === 'moveTo' && op[1] === 0 && op[2] === h),
      key + ' tapered land starts at its bottom anchor');
    assert.ok(ops.some(op => op[0] === 'lineTo' && op[1] === w && op[2] === h),
      key + ' tapered land meets the anchor at the far edge');
  }
});
