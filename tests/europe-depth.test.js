'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { artScripts, loadScripts, recordingDocument } = require('./helpers/load-game');

const regions = ['westeurope', 'uksouth', 'francecentral', 'italynorth'];
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
const keys = regions.flatMap(region => Array.from(Art.sceneryKeys[region]));
keys.forEach(key => Art.textureCanvas(key));
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ops = key => Art.textureCanvas(key).ops;

test('European painted scenery preserves texture order, sizes and seeded random consumption', () => {
  // Captured from the real pre-depth modules, not reconstructed drawing declarations.
  assert.equal(hash(keys.map(key => [key, ...Art.scenerySizes[key]])),
    '581b058dbd793e631fcfef182ae0d9b44abbf2b54c12e17e8d927468ea9fca54');
  assert.equal(hash(keys.map(key => [key, draws[key] || []])),
    'c4d30a3d61656218cc4bd135c03c9b8a15dec6df0cbfb0fe32f3eb28f3b4e72c');
  for (const key of keys) {
    const canvas = Art.textureCanvas(key), [w, h] = Art.scenerySizes[key];
    assert.equal(canvas.width, w * Art.D, key);
    assert.equal(canvas.height, h * Art.D, key);
    assert.ok(canvas.ops.length > 20, key + ' paints actual local geometry');
  }
});

test('landmark masonry and street architecture receive bounded, grounded local depth', () => {
  const facades = [
    'sc_we_rijks', 'sc_we_centraal', 'sc_we_schiphol', 'sc_we_mshq', 'sc_we_amstel',
    'sc_we_domtower', 'sc_we_peacepalace', 'sc_nl_transit',
    'sc_uk_bigben', 'sc_uk_stpauls', 'sc_uk_terrace', 'sc_uk_buckingham',
    'sc_uk_towerldn', 'sc_uk_edinburgh', 'sc_uk_liver',
    'sc_fr_arc', 'sc_fr_notredame', 'sc_fr_moulinrouge', 'sc_fr_haussmann',
    'sc_fr_rooftops', 'sc_fr_cafe', 'sc_fr_boulangerie', 'sc_fr_microsoft_office',
    'sc_fr_louvre', 'sc_fr_montsaintmichel', 'sc_fr_chambord', 'sc_fr_strasbourg',
    'sc_it_colosseum', 'sc_it_milano', 'sc_it_sanmarco', 'sc_it_trevi',
    'sc_it_firenze', 'sc_it_burano', 'sc_it_pizzeria', 'sc_it_msoffice', 'sc_it_canalcafe'
  ];
  for (const key of facades) {
    const local = planes[key] || [], [w, h] = Art.scenerySizes[key];
    assert.ok(local.some(p => p[0] === 'depthFace'), key + ' has masonry/roof returns');
    assert.ok(local.some(p => p[0] === 'depthGround'), key + ' has contact ground');
    for (const [kind, x, a, width, b, d] of local) {
      // Rooftops retains the original two off-edge, canvas-clipped back rows.
      const backRow = key === 'sc_fr_rooftops' && (kind === 'depthFace' ? b : a) <= h - 22;
      assert.ok(x >= (backRow ? -30 : 0) && x + width <= w + (backRow ? 20 : 0.001),
        key + ' depth stays within its existing row footprint');
      if (kind === 'depthFace') {
        assert.ok(a >= 0 && b > a && b <= h, key + ' facade has a valid base');
        assert.ok(d > 0, key + ' side is visible');
      } else {
        assert.ok(a > 0 && a <= h && b > 0, key + ' foundation stays within height');
      }
    }
    assert.ok(local.some(p => p[0] === 'depthGround' && p[2] >= h - 8),
      key + ' foundation reaches its established baseline');
  }
});

test('city details and open silhouettes survive local depth painting', () => {
  const count = (key, name) => ops(key).filter(op => op[0] === name).length;
  assert.ok(count('sc_we_row2', 'bezierCurveTo') >= 2, 'Dutch bell gables remain curved');
  assert.ok(count('sc_we_centraal', 'ellipse') >= 6, 'station clocks and arched doors remain');
  assert.ok(count('sc_uk_terrace', 'fillRect') > 100, 'brick joints, chimneys, sash windows and doors remain');
  assert.ok(count('sc_fr_haussmann', 'lineTo') > 150, 'zinc seams and wrought-iron balconies remain detailed');
  assert.ok(count('sc_fr_sacrecoeur', 'bezierCurveTo') > 10, 'white basilica domes remain modeled');
  assert.ok(ops('sc_fr_eiffel').some(op => op[0] === 'fill' && op[1] === 'evenodd'),
    'Eiffel arch/lattice silhouette retains its sky opening');
  assert.ok(ops('sc_it_rialto').some(op => op[0] === 'globalCompositeOperation' && op[1] === 'destination-out'),
    'Rialto canal arch remains open');
  assert.ok(count('sc_it_sanmarco', 'ellipse') >= 10, 'Venetian portals and arcades remain');
  assert.ok(count('sc_it_canalcafe', 'ellipse') >= 3, 'canalside cafe gains recessed arcades');
  for (const key of ['sc_we_erasmus', 'sc_we_magere', 'sc_we_ophaal',
    'sc_uk_tbridge', 'sc_uk_glenfinnan', 'sc_fr_pontdugard', 'sc_it_rialto']) {
    assert.ok(count(key, 'lineTo') > 15, key + ' keeps individually painted bridge geometry');
  }
});
