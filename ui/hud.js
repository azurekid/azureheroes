/* HUD + small UI helpers. The HUD only reads a state snapshot, it never changes game state. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const T = (scene, x, y, s, o) => new AH.PixelText(scene, x, y, s, o);

  function fmtTime(t) {
    t = Math.max(0, Math.ceil(t));
    const m = Math.floor(t / 60), s = t % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function pad(n, len) {
    let s = String(Math.max(0, Math.floor(n)));
    while (s.length < len) s = '0' + s;
    return s;
  }

  function panel(g, x, y, w, h) {
    g.fillStyle(0x0b0830, 0.92).fillRect(x, y, w, h);
    g.lineStyle(2, 0x27e0ff, 1).strokeRect(x + 1, y + 1, w - 2, h - 2);
    g.lineStyle(1, 0x9a4cff, 1).strokeRect(x + 4, y + 4, w - 8, h - 8);
  }

  AH.HUD = class HUD {
    constructor(scene, levelId, levelName) {
      this.scene = scene;
      const D = 900;
      this.frame = scene.add.graphics().setScrollFactor(0).setDepth(D);
      panel(this.frame, 2, 2, 636, 44);
      panel(this.frame, 2, 324, 636, 34);
      this.bars = scene.add.graphics().setScrollFactor(0).setDepth(D + 1);
      const mk = (x, y, s, col, o) => T(scene, x, y, s, Object.assign({ scale: 2, color: col }, o || {})).setScrollFactor(0).setDepth(D + 2);
      mk(12, 7, 'HEALTH', '#ffffff');
      this.healthPct = mk(112, 25, '100%', '#7fe8ff');
      mk(176, 7, 'SCORE', '#ffe14a');
      this.score = mk(176, 25, '000000', '#ffe14a');
      mk(268, 7, 'MFA', '#7fe8ff');
      this.mfa = mk(268, 25, 'x0/5', '#7fe8ff');
      mk(338, 7, 'CREDITS', '#ffb000');
      this.credits = mk(338, 25, '00', '#ffb000');
      mk(442, 7, 'LIVES', '#ff7ad9');
      this.lives = mk(442, 25, 'x3', '#ff7ad9');
      mk(538, 7, 'TIME', '#ffffff');
      this.time = mk(538, 25, '00:00', '#7fe8ff');

      mk(12, 328, 'POWER:', '#ffffff', { scale: 1 });
      this.puText = mk(240, 327, '', '#ffe14a', { scale: 1 });
      this.power = mk(60, 327, 'AZURE BLAST READY', '#7fe8ff', { scale: 1 });
      this.charge = mk(60, 349, 'HOLD F TO CHARGE', '#c9a0ff', { scale: 1 });
      const full = 'LEVEL ' + levelId + ' - ' + levelName.toUpperCase();
      const sc = full.length * 12 > 380 ? 1 : 2;
      mk(630, 328, 'MICROSOFT AZURE HEROES 2027', '#9a8cff', { scale: 1, ox: 1 });
      scene.add.image(630 - 27 * 6 - 6, 331, 'ms_logo').setScrollFactor(0).setDepth(D + 2).setDisplaySize(8, 8);
      mk(630, sc === 2 ? 338 : 341, full, '#ffe14a', { scale: sc, ox: 1 });

      this.hackLabel = mk(12, 52, 'HACK PROGRESS', '#ffffff').setVisible(false);
      this.hackPct = mk(200, 52, '0%', '#4dff7a').setVisible(false);
      this.bossLabel = mk(12, 52, 'HIGH-RISK CYBERGUARDIAN', '#ffffff').setVisible(false);
      this.risk = mk(630, 52, 'RISK LEVEL: HIGH', '#ff2a4a', { ox: 1 }).setVisible(false);
      this.stun = mk(320, 90, 'STUNNED! BLAST NOW!', '#ffe14a', { ox: 0.5 }).setVisible(false);
      this.t = 0;
    }

    update(s, dt) {
      this.t += dt || 0;
      const b = this.bars;
      b.clear();
      const hp = Math.max(0, Math.min(100, Math.round(s.health)));
      b.fillStyle(0x1a1a3a, 1).fillRect(12, 27, 92, 12);
      b.fillStyle(hp > 50 ? 0x4dff4d : hp > 25 ? 0xffd23f : 0xff2a4a, 1).fillRect(12, 27, Math.round(92 * hp / 100), 12);
      b.fillStyle(0xffffff, 0.35).fillRect(12, 27, Math.round(92 * hp / 100), 3);
      this.healthPct.setText(hp + '%');
      this.score.setText(pad(s.score, 6));
      this.mfa.setText('x' + s.mfa + '/5');
      this.credits.setText(pad(s.credits, 2));
      this.lives.setText('x' + s.lives);
      this.time.setText(fmtTime(s.time)).setColor(s.time <= 15 && Math.floor(this.t * 4) % 2 ? '#ff2a4a' : '#7fe8ff');

      b.fillStyle(0x1a1a3a, 1).fillRect(60, 337, 150, 8);
      const ready = s.boost >= s.blastCost;
      b.fillStyle(ready ? 0x27e0ff : 0x9a4cff, 1).fillRect(60, 337, Math.round(150 * s.boost / 100), 8);
      b.fillStyle(0xffffff, 0.4).fillRect(60, 337, Math.round(150 * s.boost / 100), 2);
      const pw = s.powers || {};
      this.puText.setText(Object.keys(pw).map((k) => k.toUpperCase() + ' ' + Math.ceil(pw[k]) + 'S').join('  '));
      const weapon = AH.Weapons[s.weapon || 'azure'];
      this.power.setText(weapon.name + (s.weaponTime > 0 ? ' ' + Math.ceil(s.weaponTime) + 'S' : ''))
        .setColor(ready ? '#7fe8ff' : '#c9a0ff');
      this.charge.setText(!ready ? 'BOOST TOO LOW' : s.charge >= 1 ? 'CHARGED! RELEASE FIRE' : s.charge > 0 ? 'CHARGE ' + Math.round(s.charge * 100) + '%' : 'HOLD FIRE TO CHARGE')
        .setColor(s.charge >= 1 ? '#4dff7a' : '#c9a0ff');
      b.fillStyle(0x4dff7a, 1).fillRect(60, 346, Math.round(150 * (s.charge || 0)), 2);

      const showHack = s.hack !== null && s.hack !== undefined;
      this.hackLabel.setVisible(showHack);
      this.hackPct.setVisible(showHack);
      if (showHack) {
        const h = Math.round(s.hack);
        b.fillStyle(0x1a1a3a, 1).fillRect(12, 70, 240, 12);
        b.fillStyle(0x4dff7a, 1).fillRect(12, 70, Math.round(240 * h / 100), 12);
        b.lineStyle(1, 0xffffff, 0.6).strokeRect(12, 70, 240, 12);
        this.hackPct.setText(h + '%');
      }
      const bs = s.boss;
      this.bossLabel.setVisible(!!bs);
      if (bs && bs.name !== this.bossName) { this.bossName = bs.name; this.bossLabel.setText(bs.name); }
      this.risk.setVisible(!!bs).setAlpha(1);
      this.stun.setVisible(!!bs);
      if (bs) {
        this.risk.setText('ROUND ' + (bs.round || bs.phase || 1) + '  ' + (bs.vulnerable ? 'OPEN ' + Math.ceil(bs.window) + 'S' : 'ARMORED'))
          .setColor(bs.vulnerable ? '#4dff7a' : '#ffb060');
        this.stun.setText(bs.cue).setColor(bs.vulnerable ? '#4dff7a' : '#ffb060');
        const w = 616;
        b.fillStyle(0x1a0a2a, 1).fillRect(12, 70, w, 14);
        b.fillStyle(bs.vulnerable ? 0x4dff7a : 0xff2a4a, 1).fillRect(12, 70, Math.round(w * bs.hp / bs.max), 14);
        b.fillStyle(0xffffff, 0.3).fillRect(12, 70, Math.round(w * bs.hp / bs.max), 3);
        b.lineStyle(2, 0xffffff, 0.8).strokeRect(12, 70, w, 14);
      }
    }
  };

  AH.UI = {
    button(scene, x, y, str, cb, o) {
      const base = Object.assign({ scale: 3, color: '#7fe8ff', ox: 0.5, oy: 0.5 }, o || {});
      const t = T(scene, x, y, str, base).setScrollFactor(0).setDepth(1500);
      t.setInteractive({ useHandCursor: true });
      t.on('pointerover', () => t.setColor('#ffe14a'));
      t.on('pointerout', () => t.setColor(base.color));
      t.on('pointerdown', () => { if (AH.Audio) AH.Audio.play('select'); cb(); });
      return t;
    },
    soundButton(scene, x, y) {
      const t = T(scene, x, y, '', { scale: 1, color: '#c9a0ff', ox: 1 }).setScrollFactor(0).setDepth(1500);
      const refresh = () => t.setText(AH.Audio.muted ? 'M: SOUND OFF' : 'M: SOUND ON');
      refresh();
      t.setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => { AH.Audio.toggle(); refresh(); });
      scene.events.on('audio-changed', refresh);
      return t;
    },
    nextMusic(scene) {
      AH.Audio.init();
      AH.Audio.nextStyle();
      scene.events.emit('music-changed');
    },
    musicButton(scene, x, y, compact) {
      const t = T(scene, x, y, '', { scale: 1, color: '#ffe14a', ox: 1 }).setScrollFactor(0).setDepth(1501);
      const refresh = () => t.setText((compact ? 'MUSIC ' : 'N: MUSIC ') + AH.Audio.style.toUpperCase());
      const hit = scene.add.zone(x - 64, y + 16, 128, 44).setScrollFactor(0).setDepth(1500).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => { if (!scene.help) AH.UI.nextMusic(scene); });
      scene.events.on('music-changed', refresh);
      scene.events.once('shutdown', () => scene.events.off('music-changed', refresh));
      refresh();
      return t;
    },
    // paged help overlay (controls, threat guide, tips); the caller routes keys to page() / close()
    help(scene, onClose) {
      const items = [], D0 = 2000;
      const add = (o) => { items.push(o); return o.setScrollFactor ? o.setScrollFactor(0) : o; };
      const txt = (x, y, s, o) => add(T(scene, x, y, s, Object.assign({ scale: 1, color: '#ffffff' }, o)).setDepth(D0 + 2));
      const g = add(scene.add.graphics().setDepth(D0));
      g.fillStyle(0x05031a, 0.88).fillRect(0, 0, 640, 360);
      g.fillStyle(0x0b0830, 1).fillRoundedRect(18, 14, 604, 332, 10);
      g.lineStyle(3, 0x27e0ff, 1).strokeRoundedRect(18, 14, 604, 332, 10);
      g.lineStyle(1, 0xff7ad9, 1).strokeRoundedRect(24, 20, 592, 320, 8);
      txt(320, 26, 'HERO HANDBOOK', { scale: 3, color: '#ffe14a', ox: 0.5, shadow: '#b02a08' });
      const PAGES = ['CONTROLS', 'THREAT GUIDE', 'POWER-UPS + TIPS'];
      const tabs = PAGES.map((p, i) => {
        const b = AH.UI.button(scene, 130 + i * 190, 62, p, () => show(i), { scale: 1, color: '#c9a0ff' }).setDepth(D0 + 3);
        items.push(b);
        return b;
      });
      let page = 0, body = [];
      const btxt = (x, y, s, o) => { const t = T(scene, x, y, s, Object.assign({ scale: 1, color: '#ffffff' }, o)).setScrollFactor(0).setDepth(D0 + 2); body.push(t); return t; };
      const bg = add(scene.add.graphics().setDepth(D0 + 1));
      function show(i) {
        page = (i + PAGES.length) % PAGES.length;
        body.forEach((o) => o.destroy());
        body = [];
        bg.clear();
        tabs.forEach((t, k) => t.setColor(k === page ? '#ffe14a' : '#c9a0ff'));
        bg.fillStyle(0xffe14a, 1).fillRect(130 + page * 190 - 60, 70, 120, 2);
        if (page === 0) {
          [['LEFT / RIGHT  A / D', 'RUN'], ['SPACE / UP / W', 'JUMP - AIR: DOUBLE JUMP - ON A WALL: WALL JUMP'],
            ['F - TAP / HOLD', 'RELEASE TO FIRE / HOLD FOR A CHARGED SHOT'], ['E', 'MFA SHIELD - BLOCKS SHOTS AND HITS FROM THE FRONT'],
            ['DOWN / S', 'DUCK - STANDING STILL IT IS A LOW SHIELD GUARD'], ['DOWN + LEFT / RIGHT', 'SLIDE ATTACK UNDER LOW THREATS'],
            ['SHIFT', 'BOOST JETS - FLY UP FOR A MOMENT'], ['DOWN ON A PIPE', 'WARP INTO A CLOUD CHALLENGE'],
            ['P / ESC', 'PAUSE MENU'], ['Q', 'QUIT TO THE TITLE SCREEN'], ['R', 'RESTART THE LEVEL'], ['H   M   N', 'HELP   MUTE   CHANGE MUSIC STYLE']
          ].forEach((r, k) => { btxt(44, 90 + k * 18, r[0], { color: '#ffe14a' }); btxt(232, 90 + k * 18, r[1]); });
          btxt(320, 314, 'FLIGHT LEVELS: ARROWS OR WASD FLY IN ALL DIRECTIONS, F BLASTS', { color: '#7fe8ff', ox: 0.5 });
        } else if (page === 1) {
          const SPEC = (AH.Enemy && AH.Enemy.SPEC) || {}, CATS = (AH.Enemy && AH.Enemy.CATS) || {};
          let x = 52;
          Object.keys(CATS).forEach((c) => {
            bg.fillStyle(Phaser.Display.Color.HexStringToColor(CATS[c].color).color, 1).fillRect(x - 10, 86, 6, 6);
            const t = btxt(x, 85, CATS[c].name, { color: CATS[c].color });
            x += t.width + 30;
          });
          Object.keys(SPEC).filter((k) => SPEC[k].label).forEach((k, i) => {
            const sp = SPEC[k], cat = CATS[sp.cat], col = i % 2, row = Math.floor(i / 2);
            const x0 = 34 + col * 292, y0 = 102 + row * 36;
            bg.fillStyle(0x1a0a48, 1).fillRoundedRect(x0, y0, 280, 32, 5);
            bg.fillStyle(Phaser.Display.Color.HexStringToColor(cat.color).color, 1).fillRect(x0, y0 + 3, 3, 26);
            if (scene.textures.exists(sp.tex)) {
              const im = scene.add.image(x0 + 22, y0 + 16, sp.tex).setScrollFactor(0).setDepth(D0 + 2);
              const k2 = Math.min(28 / im.width, 28 / im.height);
              im.setScale(k2);
              body.push(im);
            }
            btxt(x0 + 42, y0 + 5, sp.label, { color: cat.color });
            btxt(x0 + 42, y0 + 18, sp.info, { color: '#c9d4ff' });
          });
        } else {
          [['COPILOT', 'SIDEKICK THAT BLASTS FOR YOU', '#7fe8ff'], ['DEFENDER', 'INVINCIBLE FOR A FEW SECONDS', '#4dff7a'],
            ['GITHUB ACTIONS', 'TURBO SPEED', '#ffffff'], ['POWER BI', 'COIN MAGNET + DOUBLE SCORE', '#ffe14a'],
            ['TEAMS CALL', '+30 HEALTH', '#c9a0ff'], ['AZURE BIKE', 'DOUBLE SPEED - RIDE THROUGH ENEMIES', '#ff9a3a'],
            ['EVENT GRID SPREAD', '25S - FAN SHOT. CHARGE FOR FIVE SHOTS', '#ffb060'],
            ['COSMOS BEAM', '25S - PIERCES ENEMIES, NOT WALLS', '#c9a0ff']
          ].forEach((r, k) => { btxt(44, 90 + k * 15, r[0], { color: r[2] }); btxt(200, 90 + k * 15, r[1]); });
          ['SHOTS DESTROY BULLETS. HOLD FIRE, THEN RELEASE TO CHARGE.',
            'BOSS RED: ARMORED. GREEN + OPEN: DAMAGE WINDOW.',
            'BLOCK 2 SHOTS OR A CHARGE. DODGE AIR BOSS VOLLEYS.',
            'PIPE ROOMS: AKS, DOCKER, ACTIONS, PIPELINES, ENTRA, FUNCTIONS.',
            'CLEAR REGIONS FOR OUTFITS, HAIR AND ACCESSORIES.',
            'COLLECT 5 MFA TOKENS. SECURE ACCESS, IMAGES AND ENDPOINTS.'
          ].forEach((l, k) => btxt(44, 220 + k * 15, l, { color: k === 1 || k === 4 ? '#4dff7a' : '#ffffff' }));
        }
      }
      txt(320, 330, 'LEFT / RIGHT: PAGE    H / ESC / ENTER: CLOSE', { color: '#9a8cff', ox: 0.5 });
      items.push(AH.UI.button(scene, 590, 30, 'X', () => close(), { scale: 2, color: '#ff7ad9' }).setDepth(D0 + 3));
      let open = true;
      function close() {
        if (!open) return;
        open = false;
        body.forEach((o) => o.destroy());
        items.forEach((o) => o.destroy());
        if (onClose) onClose();
      }
      show(0);
      return { page: (d) => show(page + d), close: close, get open() { return open; } };
    },
    fmtTime: fmtTime,
    pad: pad
  };
})();
