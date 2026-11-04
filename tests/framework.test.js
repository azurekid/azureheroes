'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('community skills have discoverable metadata and resolvable local references', () => {
  const skillsDir = path.join(root, '.github/skills');
  const router = read('.github/skills/game-orchestrator/SKILL.md');
  for (const name of fs.readdirSync(skillsDir)) {
    const file = path.join(skillsDir, name, 'SKILL.md');
    const text = fs.readFileSync(file, 'utf8');
    const header = /^---\n([\s\S]*?)\n---\n/.exec(text);
    assert.ok(header, name + ' needs YAML frontmatter');
    assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(/^name: (.+)$/m.exec(header[1])?.[1], name);
    const description = /^description: (.+)$/m.exec(header[1])?.[1];
    assert.ok(description && description.length <= 1024, name + ' needs a useful description');
    assert.ok(text.includes('game-security') || name === 'game-security', name + ' must route to security guidance');
    assert.ok(router.includes(name), name + ' must be registered with orchestration');
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(match[1])) continue;
      const target = path.resolve(path.dirname(file), match[1].split('#')[0]);
      assert.ok(target.startsWith(root + path.sep), name + ' links must stay repository-local');
      assert.ok(fs.existsSync(target), name + ' broken reference: ' + match[1]);
    }
  }
});

test('CI actions remain immutable and PR validation stays unprivileged', () => {
  for (const file of fs.readdirSync(path.join(root, '.github/workflows'))) {
    const text = read('.github/workflows/' + file);
    assert.doesNotMatch(text, /\bpull_request_target\s*:/, file + ' must not execute privileged PR code');
    assert.match(text, /permissions:\n  contents: read/);
    assert.doesNotMatch(text, /(?:write-all|contents:\s*write)/);
    for (const use of text.matchAll(/uses:\s*(\S+)/g)) {
      assert.match(use[1], /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_./-]+@[0-9a-f]{40}$/, 'pin ' + use[1] + ' to an upstream commit');
    }
    assert.match(text, /persist-credentials: false/);
  }
  const validation = read('.github/workflows/validate.yml');
  assert.match(validation, /pull_request:/);
  assert.doesNotMatch(validation, /secrets\.|environment:|webapps-deploy|self-hosted/);
  assert.match(validation, /npm test/);
  assert.match(validation, /node --check/);
  assert.match(read('.github/CODEOWNERS'), /^\* @azurekid$/m);
});

test('browser script entry points are explicit and the only external script has pinned integrity', () => {
  const html = read('index.html');
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((s) => s[1]);
  const sources = scripts.map((s) => /\bsrc="([^"]+)"/.exec(s)?.[1]).filter(Boolean);
  assert.deepEqual(sources, [
    'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js',
    'art/sprites.js', 'ui/hud.js', 'levels/worlds.js', 'systems/audio.js',
    'systems/online.js', 'systems/input.js', 'systems/player.js',
    'systems/enemies.js', 'systems/boss.js', 'systems/scenes.js'
  ]);
  assert.match(scripts[0], /integrity="sha384-Fi7F0CYQBHYa\+s2vvYJeiqvOQf3tuZ28vafRGXvMt7ijxNTVf3\+eXPkNRIUi9JD2"/);
  assert.match(scripts[0], /crossorigin="anonymous"/);
});
