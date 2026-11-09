'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');

test('music control shows the current style, has a fixed touch target and is disabled by help', () => {
  const selections = ['TRANCE', 'HOUSE', 'POP', 'NIGHT DRIVE', 'SOFT SKIES'];
  let inits = 0;
  const AH = {
    Audio: {
      selection: 0,
      init() { inits++; },
      nextSelection() { this.selection = (this.selection + 1) % selections.length; },
      selectionLabel() { return selections[this.selection]; }
    },
    PixelText: class {
      constructor(scene, x, y, text) { this.text = text; }
      setText(text) { this.text = text; return this; }
      setScrollFactor() { return this; }
      setDepth() { return this; }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'ui/hud.js'), 'utf8'), { window: { AH } });
  const scene = {
    events: new EventEmitter(),
    add: {
      zone(x, y, width, height) {
        scene.hit = {
          x, y, width, height,
          setScrollFactor() { return this; },
          setDepth() { return this; },
          setInteractive() { return this; },
          on(name, fn) { this[name] = fn; return this; }
        };
        return scene.hit;
      }
    }
  };
  const label = AH.UI.musicButton(scene, 630, 144);
  assert.equal(label.text, 'N: MUSIC TRANCE');
  assert.deepEqual([scene.hit.width, scene.hit.height], [128, 44]);
  scene.hit.pointerdown();
  assert.equal(label.text, 'N: MUSIC HOUSE');
  assert.equal(inits, 1);
  scene.help = { open: true };
  scene.hit.pointerdown();
  assert.equal(label.text, 'N: MUSIC HOUSE');
  assert.equal(inits, 1);
  scene.help = null;
  AH.UI.nextMusic(scene);
  assert.equal(label.text, 'N: MUSIC POP');
  scene.events.emit('shutdown');
  assert.equal(scene.events.listenerCount('music-changed'), 0);
  const compact = AH.UI.musicButton(scene, 630, 144, true);
  assert.equal(compact.text, 'MUSIC POP');
  scene.hit.pointerdown();
  assert.equal(compact.text, 'MUSIC NIGHT DRIVE');
  scene.hit.pointerdown();
  assert.equal(compact.text, 'MUSIC SOFT SKIES');
  scene.hit.pointerdown();
  assert.equal(compact.text, 'MUSIC TRANCE');
});
