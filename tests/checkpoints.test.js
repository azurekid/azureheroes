'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { artScripts, levelScripts, loadScripts, recordingDocument } = require('./helpers/load-game');

function fixture(mode = 'run') {
  function display(x, y, key) {
    return {
      x, y, key, visible: true,
      setOrigin(x, y) { this.origin = [x, y]; return this; },
      setDisplaySize() { return this; }, setDepth() { return this; }, setScrollFactor() { return this; },
      setVisible(value) { this.visible = value; return this; },
      setText(value) { this.text = value; return this; },
      setTexture(value) { this.key = value; return this; }, setColor() { return this; }
    };
  }
  const AH = loadScripts(['systems/scenes.js'], {
    AH: {
      Levels: { ids: [1, 2, 3, 4] }, Audio: { play() {} },
      Art: { buildGuide(scene, region, variant) { return 'checkpoint_local_' + region + '_' + variant; } },
      PixelText: function (scene, x, y, text) { return display(x, y).setText(text); }
    },
    globals: { Phaser: { Scene: class {} } }
  });
  const scene = new AH.Scenes[5]();
  Object.assign(scene, {
    mode, levelId: 1, state: 'play',
    L: { city: 'AMSTERDAM', checkpoints: [0, 1, 2, 3].map((i) => ({ x: 400 + i * 400, y: 280 })) },
    add: { image: display }, player: { x: 400, body: { bottom: 280 } },
    toast() { this.notices = (this.notices || 0) + 1; }
  });
  scene.buildCheckpoints();
  return scene;
}

test('checkpoint and pipe artwork has no transparent glow padding beneath its base', () => {
  const Art = loadScripts(artScripts(), { globals: { document: recordingDocument() } }).Art;
  for (const [key, w, h] of [['flag_off', 16, 44], ['flag_on', 16, 44],
    ['pipe', 44, 46], ['pipe_metro', 44, 46], ['pipe_tube', 44, 46], ['terminal', 30, 40]]) {
    const canvas = Art.textureCanvas(key);
    assert.equal(canvas.width, w * Art.D, key + ' visible body fills its declared width');
    assert.equal(canvas.height, h * Art.D, key + ' base aligns with ground anchor');
  }
  for (let i = 0; i < 3; i++) {
    const canvas = Art.textureCanvas('checkpoint_guide_' + i);
    assert.equal(canvas.height, 44 * Art.D);
    assert.ok(canvas.ops.length > 30);
  }
});

test('friendly checkpoints show all four lessons, activate once and keep feet grounded', () => {
  const scene = fixture();
  const products = [];
  for (const flag of scene.flags) {
    assert.equal(flag.spr.y, flag.def.y);
    assert.equal(flag.guide.y, flag.def.y);
    assert.deepEqual(flag.guide.origin, [0.5, 1]);
    scene.player.x = flag.def.x;
    scene.updateCheckpoints();
    assert.equal(flag.hit, true);
    assert.equal(flag.label.text, 'CHECKPOINT ACTIVE');
    assert.equal(scene.guidePanel.visible, true);
    assert.match(scene.guideText[0].text, /^AMSTERDAM GUIDE/);
    products.push(flag.lesson[0]);
    for (const text of scene.guideText) {
      assert.match(text.text, /^[A-Z0-9 .!':/+,?-]+$/);
      assert.ok(text.text.length * 6 <= 364, 'lesson fits its panel');
    }
    scene.updateCheckpoints();
  }
  assert.deepEqual(products, ['AZURE', 'ENTRA', 'DEFENDER', 'MICROSOFT 365']);
  assert.equal(scene.notices, 4, 'one notification per checkpoint');
  scene.player.x += 200;
  scene.updateCheckpoints();
  assert.equal(scene.guidePanel.visible, false);
  assert.ok(scene.guideText.every((text) => !text.visible));
});

test('rooms and warps cannot advance main-world checkpoints or show their lessons', () => {
  for (const state of [{ inPipe: {} }, { inBonus: true }, { warping: true }, { state: 'dying' }]) {
    const scene = fixture();
    Object.assign(scene, state);
    scene.player.x = 10000;
    scene.updateCheckpoints();
    assert.ok(scene.flags.every((flag) => !flag.hit));
    assert.equal(scene.guidePanel.visible, false);
    assert.equal(scene.checkpoint, undefined);
  }
  const flight = fixture('fly');
  flight.updateCheckpoints();
  assert.equal(flight.flags[0].hit, true);
  assert.equal(flight.flags[0].guide, undefined);
  assert.equal(flight.guidePanel.visible, false);
});

test('generated ground checkpoint and pipe bases stay on supporting terrain', () => {
  for (const seed of [1, 7, 42, 2027]) {
    const Levels = loadScripts(levelScripts(), { seed }).Levels;
    for (const id of Levels.ids) {
      const L = Levels.make(id);
      if (L.mode !== 'run') continue;
      for (const c of L.checkpoints) {
        assert.ok(L.platforms.some((p) => !p.pipe && p.x <= c.x && p.x + p.w >= c.x && p.y === c.y));
      }
      for (const pipe of L.platforms.filter((p) => p.pipe)) {
        assert.ok(L.platforms.some((p) => !p.pipe && p.x <= pipe.x &&
          p.x + p.w >= pipe.x + pipe.w && p.y === pipe.y + pipe.h));
      }
    }
  }
});

test('revisited nearby checkpoints offer token recovery time once and never reset the run', () => {
  const scene = fixture();
  const AH = loadScripts(['systems/mission.js']);
  scene.mission = new AH.Mission({ mode: 'run', mission: { tokens: [
    { id: 'token', x: 100, y: 256 }
  ], tokenQuota: 1 } });
  scene.timeLeft = 500; scene.updateCheckpoints();
  scene.timeLeft = 12;
  scene.updateCheckpoints();
  assert.equal(scene.timeLeft, 64, '60 seconds plus 600px round-trip at 150px/s');
  assert.equal(scene.flags[0].hit, true);
  assert.deepEqual([scene.checkpoint.x, scene.checkpoint.y], [400, 280]);
  scene.timeLeft = 5; scene.updateCheckpoints();
  assert.equal(scene.timeLeft, 5);
  for (const state of [{ inPipe: {} }, { inBonus: true }, { warping: true }, { state: 'paused' }]) {
    const s = fixture();
    Object.assign(s, state);
    s.timeLeft = 5; s.mission = { recoveryTime() { throw Error('room recovery grant'); } };
    s.updateCheckpoints();
    assert.equal(s.timeLeft, 5);
  }
});
