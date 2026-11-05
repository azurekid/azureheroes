'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');

test('music control shows the current style, has a fixed touch target and is disabled by help', () => {
  const styles = ['dance', 'jazz', 'country', 'blues', 'rock'];
  let inits = 0;
  const AH = {
    Audio: {
      style: 'dance',
      init() { inits++; },
      nextStyle() { this.style = styles[(styles.indexOf(this.style) + 1) % styles.length]; }
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
  assert.equal(label.text, 'N: MUSIC DANCE');
  assert.deepEqual([scene.hit.width, scene.hit.height], [128, 44]);
  scene.hit.pointerdown();
  assert.equal(label.text, 'N: MUSIC JAZZ');
  assert.equal(inits, 1);
  scene.help = { open: true };
  scene.hit.pointerdown();
  assert.equal(label.text, 'N: MUSIC JAZZ');
  assert.equal(inits, 1);
  scene.help = null;
  AH.UI.nextMusic(scene);
  assert.equal(label.text, 'N: MUSIC COUNTRY');
  scene.events.emit('shutdown');
  assert.equal(scene.events.listenerCount('music-changed'), 0);
  const compact = AH.UI.musicButton(scene, 630, 144, true);
  assert.equal(compact.text, 'MUSIC COUNTRY');
  scene.hit.pointerdown();
  assert.equal(compact.text, 'MUSIC BLUES');
});
