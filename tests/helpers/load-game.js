'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../..');

function localScripts() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)]
    .map((m) => m[1]).filter((src) => !/^(?:[a-z]+:|\/\/)/i.test(src));
}

function levelScripts() {
  return localScripts().filter((file) =>
    file === 'worlds/catalogue.js' || /^worlds\/[^/]+\/world\.js$/.test(file) || file.startsWith('levels/'));
}

function artScripts() {
  return localScripts().filter((file) =>
    file.startsWith('art/') || file === 'worlds/catalogue.js' ||
    /^worlds\/[^/]+\/(?:world|art|scenery|sprites|rewards)\.js$/.test(file));
}

function audioScripts() {
  return localScripts().filter((file) =>
    file === 'worlds/catalogue.js' || /^worlds\/[^/]+\/(?:world|music)\.js$/.test(file) ||
    file.startsWith('audio/') || ['systems/save.js', 'systems/audio.js'].includes(file));
}

function loadScripts(files, { AH = {}, seed = 1, globals = {} } = {}) {
  const math = Object.create(Math);
  math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const context = vm.createContext({ ...globals, window: { AH }, Math: math });
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  return context.window.AH;
}

function recordingDocument() {
  return { createElement() {
    const canvas = { width: 0, height: 0, ops: [] };
    const gradient = () => ({ addColorStop(...args) { canvas.ops.push(['stop', ...args]); } });
    const ctx = new Proxy({
      createLinearGradient: gradient, createRadialGradient: gradient,
      getImageData() { return { data: new Uint8ClampedArray(canvas.width * canvas.height * 4) }; },
      putImageData() {}
    }, {
      get(target, key) { return key in target ? target[key] : (...args) => canvas.ops.push([key, ...args]); },
      set(target, key, value) { target[key] = value; canvas.ops.push([key, value]); return true; }
    });
    canvas.getContext = () => ctx;
    return canvas;
  } };
}

module.exports = { localScripts, levelScripts, artScripts, audioScripts, loadScripts, recordingDocument };
