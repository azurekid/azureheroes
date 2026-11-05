'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const { localScripts, levelScripts, loadScripts } = require('./helpers/load-game');

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

test('documentation local links and screenshot files remain valid and referenced', () => {
  const docs = ['README.md', 'CONTRIBUTING.md', 'AGENTS.md', 'SECURITY.md', 'docs/article.md', 'tests/playtest.md'];
  const screenshotsDir = path.join(root, 'docs/screenshots');
  const screenshots = new Set();
  for (const file of docs) {
    for (const match of read(file).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const link = match[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(link)) continue;
      const target = path.resolve(root, path.dirname(file), link.split(/[?#]/)[0]);
      assert.ok(target.startsWith(root + path.sep), file + ' link must stay repository-local: ' + link);
      assert.ok(fs.existsSync(target), file + ' broken reference: ' + link);
      if (path.dirname(target) === screenshotsDir && path.extname(target) === '.png') {
        assert.deepEqual(fs.readFileSync(target).subarray(0, 8),
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), link + ' must be a PNG');
        screenshots.add(path.basename(target));
      }
    }
  }
  const files = fs.readdirSync(screenshotsDir).filter((file) => file.endsWith('.png'));
  assert.ok(files.length, 'player documentation needs screenshots');
  for (const file of files) assert.ok(screenshots.has(file), 'unreferenced screenshot: ' + file);
});

test('temporary Playwright browser output is ignored', () => {
  assert.match(read('.gitignore'), /^\.playwright-mcp\/$/m);
});

test('skill discovery failures retain the complete repository workflow', () => {
  const instructions = read('AGENTS.md');
  assert.match(instructions, /read its linked `SKILL\.md`\s+directly and follow it in full/);
  assert.match(instructions, /Do not treat a discovery failure as permission to skip/);
  assert.match(read('CONTRIBUTING.md'), /Chat: Open Customizations/);
});

test('every level-building route requires music production and listening evidence', () => {
  for (const file of ['AGENTS.md', '.github/skills/game-contract/SKILL.md',
    '.github/skills/game-orchestrator/SKILL.md', '.github/skills/level-builder/SKILL.md',
    '.github/skills/region-world-generator/SKILL.md', '.github/skills/qa-playtester/SKILL.md']) {
    assert.match(read(file), /music-producer/, file);
  }
  const producer = read('.github/skills/music-producer/SKILL.md');
  assert.match(producer, /required part of every new\s+level/i);
  assert.match(producer, /human listening approval/);
  assert.match(producer, /actual Web Audio output/);
  assert.match(producer, /never invent an audition/);
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
  assert.equal(sources[0], 'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js');
  assert.equal(sources.filter((src) => /^(?:[a-z]+:|\/\/)/i.test(src)).length, 1);
  assert.equal(new Set(sources).size, sources.length, 'scripts are loaded exactly once');
  const local = localScripts();
  for (const file of local) {
    assert.match(file, /^(?:worlds|art|audio|levels|systems|ui)\/[a-z0-9/-]+\.js$/);
    assert.ok(fs.existsSync(path.join(root, file)), file + ' exists');
  }
  const runtimeFiles = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const file = dir + '/' + entry.name;
      if (entry.isDirectory()) collect(file);
      else if (file.endsWith('.js')) runtimeFiles.push(file);
    }
  }
  for (const dir of ['worlds', 'art', 'audio', 'levels', 'systems', 'ui']) collect(dir);
  assert.deepEqual([...local].sort(), runtimeFiles.sort(), 'every runtime module has an explicit entry');
  assert.ok(local.indexOf('worlds/catalogue.js') < local.indexOf('levels/worlds.js'));
  assert.ok(local.indexOf('systems/save.js') < local.indexOf('systems/audio.js'));
  assert.equal(local.at(-1), 'systems/scenes.js', 'scene startup follows content and engines');
  assert.match(scripts[0], /integrity="sha384-Fi7F0CYQBHYa\+s2vvYJeiqvOQf3tuZ28vafRGXvMt7ijxNTVf3\+eXPkNRIUi9JD2"/);
  assert.match(scripts[0], /crossorigin="anonymous"/);
});

test('city catalogue is complete and preserves progression and local ownership', () => {
  const AH = loadScripts(levelScripts());
  assert.deepEqual(Array.from(AH.WorldOrder), [
    'amsterdam', 'london', 'paris', 'tokyo', 'sydney', 'venice', 'rio',
    'mexico-city', 'redmond', 'virginia', 'new-york'
  ]);
  assert.equal(new Set(AH.WorldOrder).size, AH.WorldOrder.length);
  assert.deepEqual(Array.from(AH.Levels.ids), Array.from(AH.WorldOrder, (_, i) => i + 1));
  assert.equal(new Set(AH.Levels.worlds.map((w) => w.region)).size, AH.WorldOrder.length);
  for (const slug of AH.WorldOrder) {
    const world = AH.Worlds[slug].world;
    assert.equal(AH.Levels.meta(world.id), world);
    assert.equal(world.map.length, 4);
    assert.ok(world.map.every(Number.isFinite));
    for (const file of ['world.js', 'art.js', 'scenery.js', 'sprites.js', 'rewards.js', 'music.js']) {
      assert.ok(fs.existsSync(path.join(root, 'worlds', slug, file)), slug + '/' + file);
    }
    const source = read('worlds/' + slug + '/world.js');
    assert.doesNotMatch(source, /class\s+(?:Player|Boss)|function\s+make(?:Run|Fly|DataCenter)/,
      'city content reuses shared gameplay and generation');
  }
});

test('skills enforce modular ownership rather than the old monolith', () => {
  for (const skill of ['game-contract', 'game-orchestrator', 'region-world-generator', 'sprite-artist']) {
    const source = read('.github/skills/' + skill + '/SKILL.md');
    assert.match(source, /worlds\//, skill + ' directs city work to city modules');
    assert.doesNotMatch(source, /All sprites (?:must be drawn|live) in `?art\/sprites\.js/);
  }
  assert.match(read('AGENTS.md'), /never slice/);
  assert.match(read('.github/workflows/validate.yml'), /git ls-files -z -- '\*\.js'/,
    'syntax checking includes nested city modules and test helpers');
});
