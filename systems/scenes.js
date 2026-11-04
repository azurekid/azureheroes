/* Scenes: Boot, Title, LevelSelect, Level (run / fly / boss), overlays for pause, game over and level complete. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const T = (scene, x, y, s, o) => new AH.PixelText(scene, x, y, s, o);
  const LEVEL_IDS = AH.Levels.ids;
  AH.Run = { score: 0, lives: 3, startScore: 0, startLives: 3 };

  function newRun(score, lives) {
    AH.Run = { score: score, lives: lives, startScore: score, startLives: lives };
  }

  /* ---------------------------------------------------------------- BOOT */
  class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() {
      AH.Art.generate(this);
      AH.Save.load();
      AH.Audio.muted = !!AH.Save.data.muted;
      this.scene.start('Title');
    }
  }

  function drawBackdrop(scene, withSun) {
    scene.add.image(0, 0, 'bg_sky').setOrigin(0).setDepth(-30);
    scene.add.image(0, 140, 'bg_city_far').setOrigin(0).setDepth(-20);
    scene.add.image(0, 170, 'bg_city_near').setOrigin(0).setDepth(-19);
  }

  /* ---------------------------------------------------------------- TITLE */
  class TitleScene extends Phaser.Scene {
    constructor() { super('Title'); }
    create() {
      drawBackdrop(this);
      AH.Audio.music(null);
      const g = this.add.graphics().setDepth(-10);
      g.fillStyle(0x1a0a48, 1).fillRect(0, 332, 640, 28);
      g.fillStyle(0x0a0720, 1).fillTriangle(430, 360, 520, 300, 640, 360);
      g.fillStyle(0xff7ad9, 1).fillRect(0, 332, 640, 2);

      const heroTex = () => (AH.Save.data.hero === 'f' ? 'hero_f_idle' : 'hero_idle');
      this.hero = this.add.image(545, 238, heroTex()).setScale(4.5 / AH.Art.D).setDepth(5);
      this.add.tween({ targets: this.hero, y: 232, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.easeInOut' });

      this.heroLabel = T(this, 470, 342, 'H: HERO  < HIM >', { scale: 1, color: '#7fe8ff', ox: 0.5 }).setDepth(20);
      const setHero = (h) => {
        AH.Save.data.hero = h; AH.Save.save();
        this.hero.setTexture(heroTex());
        this.heroLabel.setText('H: HERO  ' + (h === 'f' ? '< HER >' : '< HIM >'));
      };
      setHero(AH.Save.data.hero === 'f' ? 'f' : 'm');
      this.hero.setInteractive({ useHandCursor: true }).on('pointerdown', () => { AH.Audio.init(); AH.Audio.play('select'); setHero(AH.Save.data.hero === 'f' ? 'm' : 'f'); });
      const W = 10;
      this.add.image(10, 21, 'ms_logo').setOrigin(0).setDisplaySize(22, 22);
      T(this, 24 + W, 20, 'MICROSOFT', { scale: 4, color: '#ffffff', shadow: '#2a8cff' });
      T(this, 24, 54, 'AZURE', { scale: 10, color: '#7fe8ff', shadow: '#3a1fb0' });
      T(this, 24, 130, 'HEROES', { scale: 9, color: '#ffffff', shadow: '#5a2fd0' });
      T(this, 24 + W, 198, '2027', { scale: 8, color: '#ffe14a', shadow: '#b02a08' });

      this.status = T(this, 24 + W, 272, 'COMING SOON', { scale: 4, color: '#ffffff', shadow: '#ff2fb0' });
      this.sub = T(this, 24 + W, 308, '', { scale: 2, color: '#c9a0ff' }).setVisible(false);
      this.ready = false;
      this.blink = 0;
      this.time.delayedCall(2300, () => {
        this.ready = true;
        this.status.setText('PRESS START').setColor('#ffe14a');
        this.sub.setText('ENTER / SPACE / TAP').setVisible(true);
        AH.Audio.play('select');
      });
      const best = AH.Save.data.best;
      T(this, 630, 340, best > 0 ? 'BEST SCORE ' + AH.UI.pad(best, 6) : 'AZURE HEROES 2027', { scale: 1, color: '#9a8cff', ox: 1 });
      AH.UI.soundButton(this, 630, 328);

      const go = () => {
        if (!this.ready) return;
        this.ready = false;
        AH.Audio.play('start');
        this.scene.start('Select');
      };
      this.input.keyboard.on('keydown', (e) => {
        if (e.code === 'KeyM') { AH.Audio.toggle(); this.events.emit('audio-changed'); return; }
        if (e.code === 'KeyH') { AH.Audio.play('select'); setHero(AH.Save.data.hero === 'f' ? 'm' : 'f'); return; }
        go();
      });
      this.input.on('pointerdown', (p, over) => { AH.Audio.init(); if (!over.length) go(); });
    }
    update(t, d) {
      this.blink += d;
      if (this.ready) this.status.setAlpha(Math.floor(this.blink / 450) % 2 ? 0.35 : 1);
    }
  }

  /* ---------------------------------------------------------------- LEVEL SELECT */
  const POWERS = {
    copilot: { time: 12, msg: 'COPILOT SIDEKICK! AUTO-BLAST' },
    defender: { time: 8, msg: 'DEFENDER SHIELD! INVINCIBLE' },
    actions: { time: 9, msg: 'GITHUB ACTIONS! TURBO SPEED' },
    powerbi: { time: 12, msg: 'POWER BI! COIN MAGNET + 2X SCORE' },
    teams: { time: 0, msg: 'TEAMS CALL! +30 HEALTH' },
    bike: { time: 20, msg: 'AZURE BIKE! RIDE THROUGH ENEMIES' }
  };
  const KIND = { run: 'RUN AND JUMP', fly: 'FLIGHT PURSUIT', rack: 'HACK + BOSS FIGHT' };
  const COLS = 3;

  class SelectScene extends Phaser.Scene {
    constructor() { super('Select'); }
    create() {
      drawBackdrop(this);
      AH.Audio.music(null);
      const n = LEVEL_IDS.length;
      this.sel = Math.min(AH.Save.data.unlocked, n) - 1;
      this.add.graphics().setDepth(-10).fillStyle(0x0a0720, 0.62).fillRect(0, 0, 640, 360);
      T(this, 320, 8, 'SELECT AZURE REGION', { scale: 3, color: '#7fe8ff', shadow: '#3a1fb0', ox: 0.5 });
      T(this, 320, 34, 'BEST SCORE ' + AH.UI.pad(AH.Save.data.best, 6), { scale: 1, color: '#ffe14a', ox: 0.5 });
      this.gfx = this.add.graphics().setDepth(5);
      this.cards = [];
      const CW = 200, CH = 140, TH = 68;
      LEVEL_IDS.forEach((id, i) => {
        const m = AH.Levels.meta(id), locked = i >= AH.Save.data.unlocked;
        const x = 10 + (i % COLS) * 208, y = 46 + Math.floor(i / COLS) * 148;
        const k = 184 / 640, region = m.region;
        // landmark preview: sky + far skyline, cropped to the thumbnail window
        const sy0 = 360 - TH / k;
        const sky = this.add.image(x + 8, y + 6 - sy0 * k, 'bg_sky_' + region).setOrigin(0).setDepth(6);
        sky.setScale(k / AH.Art.D).setCrop(0, sy0 * AH.Art.D, 640 * AH.Art.D, (TH / k) * AH.Art.D);
        const far = this.add.image(x + 8, y + 6 + TH - 220 * k, 'bg_far_' + region).setOrigin(0).setDepth(7);
        far.setScale(k / AH.Art.D);
        if (locked) { sky.setTintFill(0x1a1a3a); far.setTintFill(0x2a2a4a); }
        T(this, x + 12, y + 10, 'LEVEL ' + id, { scale: 1, color: locked ? '#6a6a8a' : '#ffffff' }).setDepth(9);
        T(this, x + 100, y + TH + 12, m.city, { scale: 2, color: locked ? '#6a6a8a' : '#ffe14a', ox: 0.5 }).setDepth(9);
        T(this, x + 100, y + TH + 30, m.regionName + ' - ' + KIND[m.theme === 'rack' ? 'rack' : m.mode], { scale: 1, color: locked ? '#55557a' : '#c9a0ff', ox: 0.5 }).setDepth(9);
        const bs = AH.Save.data.bests[id] || 0;
        T(this, x + 100, y + TH + 46, locked ? 'LOCKED' : (bs ? 'BEST ' + AH.UI.pad(bs, 6) : 'NOT PLAYED'), { scale: 1, color: locked ? '#ff2a4a' : '#7fe8ff', ox: 0.5 }).setDepth(9);
        const zone = this.add.zone(x, y, CW, CH).setOrigin(0).setInteractive({ useHandCursor: !locked });
        zone.on('pointerdown', () => { AH.Audio.init(); if (!locked) { this.sel = i; this.start(); } else AH.Audio.play('hit'); });
        zone.on('pointerover', () => { this.sel = i; });
        this.cards.push({ x, y, w: CW, h: CH, id, locked, col: [0xff7ad9, 0x27e0ff, 0xffd23f][i % 3] });
      });
      T(this, 14, 342, 'ARROWS: CHOOSE   ENTER: START   ESC: TITLE', { scale: 1, color: '#9a8cff' });
      AH.UI.soundButton(this, 630, 340);
      const kb = this.input.keyboard;
      kb.on('keydown', (e) => {
        const mv = (d) => { this.sel = (this.sel + d + n) % n; AH.Audio.play('select'); };
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') mv(-1);
        else if (e.code === 'ArrowRight' || e.code === 'KeyD') mv(1);
        else if (e.code === 'ArrowUp' || e.code === 'KeyW') mv(-COLS);
        else if (e.code === 'ArrowDown' || e.code === 'KeyS') mv(COLS);
        else if (e.code === 'Enter' || e.code === 'Space') this.start();
        else if (e.code === 'Escape') this.scene.start('Title');
        else if (e.code === 'KeyM') { AH.Audio.toggle(); this.events.emit('audio-changed'); }
      });
      this.t = 0;
    }
    start() {
      const card = this.cards[this.sel];
      if (card.locked) { AH.Audio.play('hit'); return; }
      AH.Audio.play('start');
      newRun(0, 3);
      this.scene.start('Level', { id: card.id });
    }
    update(time, d) {
      this.t += d;
      const g = this.gfx;
      g.clear();
      this.cards.forEach((k, i) => {
        const on = i === this.sel;
        g.fillStyle(0x0b0830, 0.92).fillRect(k.x, k.y, k.w, k.h);
        const pulse = on ? 0.6 + 0.4 * Math.sin(this.t / 150) : 0.4;
        g.lineStyle(on ? 4 : 2, k.locked ? 0x44446a : on ? 0xffe14a : k.col, on ? 1 : pulse).strokeRect(k.x + 1, k.y + 1, k.w - 2, k.h - 2);
        if (on) g.lineStyle(1, 0xffffff, pulse).strokeRect(k.x + 5, k.y + 5, k.w - 10, k.h - 10);
      });
    }
  }

  /* ---------------------------------------------------------------- LEVEL */
  function rectOf(b) { return { x: b.x, y: b.y, w: b.width, h: b.height }; }
  function ov(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  class LevelScene extends Phaser.Scene {
    constructor() { super('Level'); }

    init(data) {
      this.levelId = data.id;
    }

    create() {
      const L = (this.L = AH.Levels.make(this.levelId));
      this.mode = L.mode;
      this.scrollSpeed = L.mode === 'fly' ? L.scroll : 0;
      this.state = 'intro';
      this.introT = 2.2;
      this.timeLeft = L.time;
      this.stats = { kills: 0, mfa: 0, credits: 0 };
      this.checkpoint = { x: L.spawn.x, y: L.spawn.y };
      this.boss = null;
      this.bossDone = false;
      this.arenaLocked = false;
      this.exitActive = !L.boss;
      this.dyingT = 0;
      this.overlayItems = [];
      this.draws = [];
      this.achQ = [];
      this.ach = {};
      this.drawTip = false;
      this.warping = false;

      this.physics.world.gravity.y = 1100;
      this.physics.world.setBounds(0, -400, L.width, 1200);
      this.physics.world.setBoundsCollision(true, true, false, false);

      const bg = ['bg_sky_' + L.region, this.textures.exists('bg_farp_' + L.region) ? 'bg_farp_' + L.region : 'bg_far_' + L.region, L.theme === 'rack' ? 'bg_dc_near' : 'bg_near_' + L.region];
      this.add.image(0, 0, bg[0]).setOrigin(0).setScrollFactor(0).setDepth(-30);
      this.far = this.add.tileSprite(0, 360 - (L.mode === 'run' ? 54 : 0) - this.textures.get(bg[1]).getSourceImage().height / AH.Art.D, 640, this.textures.get(bg[1]).getSourceImage().height / AH.Art.D, bg[1]).setOrigin(0).setScrollFactor(0).setDepth(-20);
      this.near = this.add.tileSprite(0, 360 - this.textures.get(bg[2]).getSourceImage().height / AH.Art.D, 640, this.textures.get(bg[2]).getSourceImage().height / AH.Art.D, bg[2]).setOrigin(0).setScrollFactor(0).setDepth(-19);

      this.solids = this.physics.add.staticGroup();
      this.rects = []; // solid / hazard rectangles used for blasts and rock damage
      L.platforms.forEach((p) => this.addPlatform(p));
      this.buildScenery();
      this.buildStreet();
      this.buildGates();
      this.buildHazards();
      this.buildPickups();
      this.buildTerminals();

      this.player = new AH.Player(this, L.spawn.x, L.spawn.y, this.mode);
      this.physics.add.collider(this.player.sprite, this.solids);
      this.boats.forEach((b) => this.physics.add.collider(this.player.sprite, b.z));
      this.enemies = [];
      L.enemies.forEach((d) => this.enemies.push(new AH.Enemy(this, d)));
      this.blasts = [];
      this.ebolts = [];
      this.riding = false;
      this.inBonus = false;
      this.bikeImg = this.add.sprite(0, 0, 'bike_ride0').setOrigin(0.5, 1).setDepth(52).setVisible(false);

      const cam = this.cameras.main;
      if (this.mode === 'run') {
        this.player.sprite.setCollideWorldBounds(true);
        cam.setBounds(0, 0, L.width, 360);
        cam.startFollow(this.player.sprite, true, 0.12, 0.12, -40, 0);
      } else {
        cam.setBounds(0, 0, L.width, 360);
        cam.scrollX = 0;
      }

      // exit portal
      const ex = L.exit;
      this.portal = this.add.image(ex.x + ex.w / 2, ex.y + ex.h, 'portal').setOrigin(0.5, 1).setDepth(30);
      if (this.mode === 'fly') this.portal.setDisplaySize(ex.w, 360).setOrigin(0.5, 1).setPosition(ex.x + ex.w / 2, 360).setAlpha(0.7);
      else this.portal.setDisplaySize(ex.w + 10, ex.h + 10);
      this.portal.setVisible(this.exitActive);
      this.tweens.add({ targets: this.portal, alpha: 0.55, yoyo: true, repeat: -1, duration: 500 });

      this.input2 = new AH.Input(this, { fly: this.mode === 'fly', shield: this.mode === 'run' });
      this.hud = new AH.HUD(this, this.levelId, L.name);
      this.soundBtn = AH.UI.soundButton(this, 630, 98);
      this.toastText = T(this, 320, 110, '', { scale: 2, color: '#ffffff', ox: 0.5 }).setScrollFactor(0).setDepth(950).setVisible(false);
      this.toastT = 0;
      this.powers = {};
      this.pal = 0;
      this.clippyAt = 0;
      this.clippyImg = this.add.image(0, 118, 'clippy').setScrollFactor(0).setDepth(951).setVisible(false);
      this.buildIntro();
      AH.Audio.music('main');
      this.cameras.main.fadeIn(350, 10, 7, 32);
      this.game.events.on('blur', this.onBlur, this);
      this.events.once('shutdown', () => this.game.events.off('blur', this.onBlur, this));
    }

    onBlur() {
      if (this.state === 'play') this.setPaused(true);
    }

    /* ----- construction helpers */
    addPlatform(p) {
      const L = this.L, th = L.theme;
      if (this.mode === 'fly') {
        const hang = p.y === 0;
        const body = this.add.tileSprite(p.x, p.y, p.w, p.h, th).setOrigin(0).setDepth(9).setTint(L.tint);
        const edge = this.add.tileSprite(p.x, hang ? p.y + p.h - 8 : p.y, p.w, 8, th + '_top').setOrigin(0).setDepth(10).setTint(L.tint);
        if (hang) edge.setFlipY(true);
        this.rects.push({ x: p.x + 3, y: p.y + (hang ? 0 : 3), w: p.w - 6, h: p.h - 3, hazard: true, active: true });
        void body;
        return;
      }
      if (p.bridge && p.draw) {
        this.buildDrawbridge(p);
        return;
      } else if (p.bridge) {
        this.add.image(p.x, p.y - 30, 'bridge_' + L.region).setOrigin(0).setDisplaySize(p.w, 100).setDepth(10);
      } else if (p.cloud) {
        this.add.image(p.x, p.y - 2, 'cloud_plat').setOrigin(0).setDisplaySize(p.w, 20).setDepth(10);
      } else if (p.bliss || L.ground) {
        const g = p.bliss ? 'grass' : L.ground;
        this.add.tileSprite(p.x, p.y, p.w, 8, g + '_top').setOrigin(0).setDepth(10);
        this.add.tileSprite(p.x, p.y + 8, p.w, Math.min(p.h - 8, 220), g).setOrigin(0).setDepth(9);
        if (L.rail && !p.bliss && p.h >= 60 && p.w >= 64) {
          const rh = this.textures.get('rail_' + L.rail).getSourceImage().height / AH.Art.D;
          this.add.tileSprite(p.x + 4, p.y - rh, p.w - 8, rh, 'rail_' + L.rail).setOrigin(0).setDepth(11).setAlpha(0.95);
        }
      } else {
        this.add.tileSprite(p.x, p.y, p.w, 8, th + '_top').setOrigin(0).setDepth(10).setTint(L.tint);
        this.add.tileSprite(p.x, p.y + 8, p.w, Math.min(p.h - 8, 220), th).setOrigin(0).setDepth(9).setTint(L.tint);
      }
      const z = this.add.zone(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h);
      this.solids.add(z);
      this.rects.push({ x: p.x, y: p.y, w: p.w, h: p.h, active: true });
    }

    /* parallax strip of regional landmarks and Microsoft billboards (scroll factor 0.5) */
    buildScenery() {
      const L = this.L, keys = (AH.Art.sceneryKeys[L.region] || []).slice(), bills = AH.Art.billKeys;
      if (L.theme === 'rack') return;
      const sf = 0.5, end = Math.max(0, L.width - 640) * sf + 700;
      const base = L.mode === 'fly' ? 362 : 336;
      // every piece keeps a minimum distance from its last copy so no landmark shows twice in one frame
      const lastAt = {}, wOf = (k) => this.textures.get(k).getSourceImage().width / AH.Art.D;
      const choose = (list, x) => {
        const ok = list.filter((k) => lastAt[k] === undefined || x - lastAt[k] > 680 + wOf(k));
        return ok.length ? ok[Math.floor(Math.random() * ok.length)] : null;
      };
      let x = -40, sinceBill = 0, nextBill = 2 + Math.floor(Math.random() * 2);
      while (x < end) {
        let key;
        if (!keys.length || sinceBill >= nextBill) { key = choose(bills, x); sinceBill = 0; nextBill = 2 + Math.floor(Math.random() * 2); }
        else { key = choose(keys, x); sinceBill++; }
        if (!key) { x += 40; continue; }
        lastAt[key] = x;
        const img = this.add.image(x, base - (key.indexOf('bb_') === 0 ? 4 : 0), key).setOrigin(0, 1).setScrollFactor(sf).setDepth(-18);
        x += img.displayWidth + 6 + Math.floor(Math.random() * 34);
      }
    }

    /* water, boats, street obstacles, bikes and the London phone box */
    buildStreet() {
      const L = this.L;
      this.water = null;
      if (L.water && this.textures.exists('water_' + L.region)) {
        this.water = this.add.tileSprite(0, 304, 640, 56, 'water_' + L.region).setOrigin(0).setScrollFactor(0).setDepth(8);
      }
      (L.deco || []).forEach((d) => {
        const img = this.add.image(d.x, d.y, d.key).setOrigin(0.5, 1).setDepth(8.5);
        this.tweens.add({ targets: img, y: d.y + 2, yoyo: true, repeat: -1, duration: 1300, ease: 'Sine.easeInOut' });
      });
      this.boats = (L.movers || []).map((m) => {
        const z = this.add.zone(m.x0 + m.w / 2, m.y + 5, m.w, 10);
        this.physics.add.existing(z);
        z.body.setAllowGravity(false).setImmovable(true);
        z.body.checkCollision.down = z.body.checkCollision.left = z.body.checkCollision.right = false;
        z.body.setVelocityX(m.speed);
        const img = this.add.image(z.x, m.y - 6, 'boat_' + L.region).setOrigin(0.5, 0).setDepth(9.5);
        return { def: m, z, img };
      });
      (L.obstacles || []).forEach((o) => {
        this.add.image(o.x, o.y, 'ob_' + o.kind).setOrigin(0).setDepth(12);
        const z = this.add.zone(o.x + o.w / 2, o.y + 4 + (o.h - 4) / 2, o.w - 4, o.h - 4);
        this.solids.add(z);
        this.rects.push({ x: o.x + 2, y: o.y + 4, w: o.w - 4, h: o.h - 4, active: true });
      });
      this.bikes = (L.vehicles || []).map((v) => {
        const spr = this.add.sprite(v.x, v.y, 'bike_ride0').setOrigin(0.5, 1).setDepth(14);
        const tag = T(this, v.x, v.y - 40, 'BIKE', { scale: 1, color: '#7fe8ff', ox: 0.5 }).setDepth(21);
        this.tweens.add({ targets: [spr, tag.img], alpha: 0.6, yoyo: true, repeat: -1, duration: 450 });
        return { spr, tag, def: v, taken: false };
      });
      this.secret = null;
      if (L.secret && L.bonus) {
        const S = L.secret, B = L.bonus;
        const booth = this.add.image(S.x, S.y, 'booth').setOrigin(0.5, 1).setDepth(13);
        const label = T(this, S.x, S.y - 74, '?', { scale: 2, color: '#ffe14a', ox: 0.5 }).setDepth(21);
        this.tweens.add({ targets: label.img, y: S.y - 80, yoyo: true, repeat: -1, duration: 500 });
        this.add.image(B.x, 0, 'bonus_bg').setOrigin(0).setDepth(-17);
        T(this, B.x + 320, 92, 'SECRET LEVEL: CLOUD NINE', { scale: 2, color: '#ffffff', shadow: '#0a3a8a', ox: 0.5 }).setDepth(21);
        T(this, B.x + 320, 112, 'GRAB EVERYTHING, THEN RING THE PHONE BOX HOME', { scale: 1, color: '#0a2a6a', shadow: '#ffffff', ox: 0.5 }).setDepth(21);
        this.addPlatform(B.floor);
        B.clouds.forEach((c) => this.addPlatform(c));
        const exitBooth = this.add.image(B.exit.x, B.exit.y, 'booth').setOrigin(0.5, 1).setDepth(13);
        this.secret = { booth, label, exitBooth, used: false, t: 0, tipped: false };
      }
    }

    /* Amsterdam pull-up bridge: two leaves lift on a timer, the deck is only solid while it is down */
    buildDrawbridge(p) {
      const half = p.w / 2, y = p.y;
      const gl = this.add.image(p.x - 6, y + 14, 'draw_gantry').setOrigin(0.5, 1).setDepth(9.6);
      const gr = this.add.image(p.x + p.w + 6, y + 14, 'draw_gantry').setOrigin(0.5, 1).setDepth(9.6).setFlipX(true);
      const left = this.add.tileSprite(p.x, y + 5, half, 10, 'draw_leaf').setOrigin(0, 0.5).setDepth(10);
      const right = this.add.tileSprite(p.x + p.w, y + 5, half, 10, 'draw_leaf').setOrigin(1, 0.5).setDepth(10);
      const lamps = [gl, gr];
      const z = this.add.zone(p.x + p.w / 2, y + 7, p.w, 14);
      this.solids.add(z);
      const r = { x: p.x, y: y, w: p.w, h: 14, active: true };
      this.rects.push(r);
      const cycle = 7200, up = 2200;
      this.draws.push({ p, left, right, z, r, lamps, cycle, up, phase: Math.floor(Math.random() * cycle), down: true });
    }

    updateDraws(p) {
      if (!this.draws) return;
      const now = this.time.now;
      this.draws.forEach((d) => {
        const t = (now + d.phase) % d.cycle, open = d.cycle - d.up;
        let ang = 0;
        if (t > open) { const k = (t - open) / d.up; ang = Math.sin(Math.min(1, k * 2.2) * Math.PI / 2) * (k > 0.8 ? Math.max(0, (1 - k) / 0.2) : 1) * 1.25; }
        const warn = t > open - 1100 && t <= open;
        d.left.setRotation(-ang);
        d.right.setRotation(ang);
        d.lamps.forEach((l) => l.setTint(warn && Math.floor(now / 160) % 2 ? 0xff8080 : 0xffffff));
        const down = ang < 0.12;
        if (down !== d.down) {
          d.down = down;
          d.z.body.enable = down;
          d.r.active = down;
          if (!down && Math.abs(p.x - (d.p.x + d.p.w / 2)) < 400) AH.Audio.play('bike');
        }
        if (warn && !this.drawTip && Math.abs(p.x - d.p.x) < 300) { this.drawTip = true; this.toast('CLIPPY: BRIDGE GOING UP! WAIT OR DOUBLE JUMP'); }
      });
    }

    spawnEnemyBolt(x, y, dir) {
      const s = this.add.image(x, y, 'ebolt').setDepth(54).setFlipX(dir < 0);
      this.ebolts.push({ s, dir, dist: 0 });
      const cam = this.cameras.main;
      if (x > cam.scrollX - 20 && x < cam.scrollX + 660) AH.Audio.play('zap');
    }

    mountBike(b) {
      b.taken = true;
      b.spr.destroy();
      b.tag.destroy();
      this.riding = true;
      this.player.riding = true;
      this.powers.bike = POWERS.bike.time;
      this.bikeImg.setVisible(true).play('bike_ride');
      AH.Audio.play('bike');
      this.toast(POWERS.bike.msg);
      this.achieve('PEDAL POWER', 'bike');
    }

    dismount() {
      if (!this.riding) return;
      this.riding = false;
      this.player.riding = false;
      delete this.powers.bike;
      this.bikeImg.setVisible(false).stop();
      this.burst(this.player.x, this.player.y + 16, 'spark_c', 8, 120);
    }

    enterBonus() {
      const B = this.L.bonus, p = this.player, cam = this.cameras.main;
      this.secret.used = true;
      this.warping = true;
      AH.Audio.play('secret');
      cam.fadeOut(260, 255, 255, 255);
      cam.once('camerafadeoutcomplete', () => {
        this.inBonus = true;
        this.physics.world.setBounds(B.x, -400, B.w, 1200);
        cam.setBounds(B.x, 0, B.w, 360);
        p.sprite.setPosition(B.x + 60, 250);
        p.sprite.setVelocity(0, 0);
        cam.fadeIn(300, 255, 255, 255);
        this.warping = false;
        this.toast('CLIPPY: IT LOOKS LIKE YOU FOUND A SECRET!');
        this.achieve('PHONE A FRIEND', 'secret');
      });
    }

    leaveBonus(fade) {
      const S = this.L.secret, p = this.player, cam = this.cameras.main, L = this.L;
      const back = () => {
        this.inBonus = false;
        this.physics.world.setBounds(0, -400, L.width, 1200);
        cam.setBounds(0, 0, L.width, 360);
        this.secret.booth.setTint(0x777799);
        this.secret.label.setVisible(false);
        this.warping = false;
      };
      if (!fade) { back(); return; }
      this.warping = true;
      AH.Audio.play('secret');
      cam.fadeOut(260, 255, 255, 255);
      cam.once('camerafadeoutcomplete', () => {
        back();
        p.sprite.setPosition(S.x + 34, S.y - 30);
        p.sprite.setVelocity(0, 0);
        cam.fadeIn(300, 255, 255, 255);
      });
    }

    buildGates() {
      this.gates = {};
      (this.L.gates || []).forEach((g) => {
        const vis = this.add.tileSprite(g.x, g.y, g.w, g.h, 'gate').setOrigin(0).setDepth(20);
        const z = this.add.zone(g.x + g.w / 2, g.y + g.h / 2, g.w, g.h);
        this.solids.add(z);
        const r = { x: g.x, y: g.y, w: g.w, h: g.h, active: true };
        this.rects.push(r);
        this.gates[g.id] = { vis, z, r };
        this.tweens.add({ targets: vis, alpha: 0.6, yoyo: true, repeat: -1, duration: 350 });
        T(this, g.x + g.w / 2, g.y + g.h - 120, 'SEC GATE', { scale: 1, color: '#ff2a4a', ox: 0.5 }).setDepth(21);
      });
    }

    buildHazards() {
      const L = this.L;
      this.lasers = (L.lasers || []).map((l) => {
        const beam = this.add.tileSprite(l.x - l.w / 2, l.y, l.w, l.h, 'laser_beam').setOrigin(0).setDepth(30);
        const top = this.add.image(l.x, l.y - 3, 'laser_emit').setDepth(31).setFlipY(true);
        const bot = this.add.image(l.x, l.y + l.h + 3, 'laser_emit').setDepth(31);
        return { def: l, beam, top, bot, active: false, rect: { x: l.x - l.w / 2 - 1, y: l.y, w: l.w + 2, h: l.h } };
      });
      this.cables = (L.cables || []).map((c) => {
        const spr = this.add.tileSprite(c.x, c.y - 10, c.w, 10, 'cable').setOrigin(0).setDepth(30);
        return { spr, rect: { x: c.x, y: c.y - 10, w: c.w, h: 10 }, t: Math.random() * 3 };
      });
    }

    spawnCoin(x, y, drop) {
      const ck = 'coin_' + this.L.region;
      const local = this.anims.exists(ck);
      const spr = this.add.sprite(x, y, local ? ck + '0' : 'coin0').setDepth(35);
      spr.play(local ? ck : 'coin_spin');
      spr.anims.setProgress(Math.random());
      const c = { spr, taken: false, kind: 'coin' };
      this.coins.push(c);
      if (drop) {
        spr.y = y;
        this.tweens.add({ targets: spr, y: y - 22, yoyo: true, duration: 260, ease: 'Sine.easeOut' });
      }
      return c;
    }

    buildPickups() {
      const L = this.L;
      this.coins = [];
      (L.coins || []).forEach((c) => this.spawnCoin(c.x, c.y));
      this.tokens = (L.mfaTokens || []).map((m) => {
        const spr = this.add.image(m.x, m.y, 'mfa').setDepth(35);
        this.tweens.add({ targets: spr, y: m.y - 5, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut' });
        return { spr, taken: false };
      });
      this.rings = (L.rings || []).map((r) => ({
        def: r, taken: false, spr: this.add.image(r.x, r.y, 'ring').setDepth(30)
      }));
      (L.props || []).forEach((p) => {
        const img = this.add.image(p.x, p.y, 'prop_' + p.kind).setOrigin(0.5, p.float ? 0.5 : 1).setDepth(p.float ? 8 : 12);
        if (p.float) this.tweens.add({ targets: img, y: p.y + 7, yoyo: true, repeat: -1, duration: 1400 + (p.x % 600), ease: 'Sine.easeInOut' });
      });
      this.pups = (L.powerups || []).map((u) => {
        const spr = this.add.image(u.x, u.y, 'pu_' + u.kind).setDepth(36);
        this.tweens.add({ targets: spr, y: u.y - 6, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
        return { spr, def: u, taken: false };
      });
      if (L.bonus && L.secret) {
        const B = L.bonus;
        B.coins.forEach((c) => this.spawnCoin(c.x, c.y));
        const spr = this.add.image(B.token.x, B.token.y, 'mfa').setDepth(35);
        this.tweens.add({ targets: spr, y: B.token.y - 5, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut' });
        this.tokens.push({ spr, taken: false });
        const ps = this.add.image(B.power.x, B.power.y, 'pu_' + B.power.kind).setDepth(36);
        this.tweens.add({ targets: ps, y: B.power.y - 6, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
        this.pups.push({ spr: ps, def: B.power, taken: false });
      }
      this.flags = (L.checkpoints || []).map((c) => ({
        def: c, hit: false, spr: this.add.image(c.x, c.y, 'flag_off').setOrigin(0.5, 1).setDepth(15)
      }));
    }

    buildTerminals() {
      this.terminals = (this.L.terminals || []).map((t) => {
        const spr = this.add.image(t.x, t.y, 'terminal').setOrigin(0.5, 1).setDepth(15);
        const label = T(this, t.x, t.y - 50, 'HACK TERMINAL', { scale: 1, color: '#4dff7a', ox: 0.5 }).setDepth(21);
        return { def: t, spr, label, progress: 0, done: false, rect: { x: t.x - 36, y: t.y - 50, w: 72, h: 50 } };
      });
    }

    buildIntro() {
      const mk = (y, s, scale, col) => T(this, 320, y, s, { scale, color: col, ox: 0.5, oy: 0.5 }).setScrollFactor(0).setDepth(1300);
      this.introItems = [
        mk(140, 'LEVEL ' + this.levelId, 6, '#ffffff'),
        mk(184, this.L.name.toUpperCase(), 3, '#ffe14a'),
        mk(214, 'AZURE REGION: ' + this.L.regionName, 2, '#ff7ad9'),
        mk(240, this.L.landmarks, 1, '#7fe8ff')
      ];
      const hint = T(this, 320, 276, this.L.hint, { scale: 1, color: '#c9a0ff', ox: 0.5 }).setScrollFactor(0).setDepth(1300);
      this.introItems.push(hint);
    }

    /* ----- shared services used by systems */
    burst(x, y, tex, n, speed, life) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, d = (0.4 + Math.random() * 0.6) * (speed || 100) * (life || 0.4);
        const p = this.add.image(x, y, tex).setDepth(60);
        this.tweens.add({
          targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, duration: (life || 0.4) * 1000,
          onComplete: () => p.destroy()
        });
      }
    }

    spawnBlast(x, y, dir) {
      const s = this.add.image(x, y, 'blast').setDepth(55).setFlipX(dir < 0);
      this.blasts.push({ s, dir, dist: 0 });
    }

    addScore(n, x, y) {
      if (this.powers && this.powers.powerbi) n *= 2;
      AH.Run.score += n;
      if (x === undefined) return;
      const t = T(this, x, y, '+' + n, { scale: 1, color: '#ffe14a', ox: 0.5 }).setDepth(70);
      this.tweens.add({ targets: t.img, y: y - 26, alpha: 0, duration: 700, onComplete: () => t.destroy() });
    }

    activatePower(kind, x, y) {
      const P = POWERS[kind];
      AH.Audio.play('power');
      this.burst(x, y, 'spark_c', 14, 160);
      this.addScore(300, x, y - 14);
      if (kind === 'teams') this.player.health = Math.min(100, this.player.health + 30);
      else this.powers[kind] = P.time;
      this.toast(P.msg);
      this.achieve('FIRST POWER-UP', 'power');
    }

    achieve(name, key) {
      this.ach = this.ach || {};
      if (this.ach[key]) return;
      this.ach[key] = true;
      this.achQ = this.achQ || [];
      this.achQ.push(name);
      if (this.achQ.length === 1) this.showAch(name);
    }

    showAch(name) {
      AH.Audio.play('achieve');
      const w = Math.max(170, name.length * 6 + 64), x = 320 - w / 2, y = 52;
      const g = this.add.graphics().setScrollFactor(0).setDepth(960);
      g.fillStyle(0x101010, 0.92).fillRoundedRect(x, y, w, 30, 15);
      g.lineStyle(1, 0x107c10, 1).strokeRoundedRect(x, y, w, 30, 15);
      g.fillStyle(0x107c10, 1).fillCircle(x + 15, y + 15, 13);
      const icon = this.add.image(x + 15, y + 15, 'ach_icon').setScrollFactor(0).setDepth(961);
      const t1 = T(this, x + 34, y + 6, 'ACHIEVEMENT UNLOCKED', { scale: 1, color: '#9be09b', shadow: '#000000' }).setScrollFactor(0).setDepth(961);
      const t2 = T(this, x + 34, y + 17, '50G - ' + name, { scale: 1, color: '#ffffff', shadow: '#000000' }).setScrollFactor(0).setDepth(961);
      const all = [g, icon, t1.img, t2.img];
      all.forEach((o) => o.setAlpha(0));
      this.tweens.add({ targets: all, alpha: 1, duration: 200 });
      this.tweens.add({ targets: all, alpha: 0, delay: 2800, duration: 500, onComplete: () => { g.destroy(); icon.destroy(); t1.destroy(); t2.destroy(); this.achQ.shift(); if (this.achQ.length) this.showAch(this.achQ[0]); } });
    }

    updatePowers(dt, p) {
      const pw = this.powers;
      Object.keys(pw).forEach((k) => { pw[k] -= dt; if (pw[k] <= 0) delete pw[k]; });
      if (this.riding && !pw.bike) this.dismount();
      this.player.speedMul = (pw.actions ? 1.35 : 1) * (this.riding ? 1.45 : 1);
      this.player.defender = pw.defender ? 1 : 0;
      this.player.sprite.setAlpha(pw.defender ? 0.55 + 0.3 * Math.sin(this.time.now / 60) : 1);
      if (pw.copilot) {
        this.pal -= dt;
        if (this.pal <= 0) {
          let tgt = null, bd = 340;
          this.enemies.forEach((e) => { const d = Math.abs(e.x - p.x); if (!e.dead && d < bd) { bd = d; tgt = e; } });
          if (tgt) {
            this.pal = 0.9;
            this.spawnBlast(p.x + (tgt.x > p.x ? 26 : -26), p.y - 30, tgt.x > p.x ? 1 : -1);
            AH.Audio.play('blast');
          }
        }
      }
      if (pw.powerbi) {
        this.coins.forEach((c) => {
          if (c.taken) return;
          const dx = p.x - c.spr.x, dy = p.y - c.spr.y, d = Math.hypot(dx, dy);
          if (d < 170 && d > 1) { c.spr.x += dx / d * 260 * dt; c.spr.y += dy / d * 260 * dt; }
        });
      }
      if (this.player.health < 35 && this.time.now > this.clippyAt && this.state === 'play') {
        this.clippyAt = this.time.now + 20000;
        this.toast('CLIPPY: LOW HEALTH! GRAB A TEAMS ORB');
      }
    }

    toast(msg) {
      this.toastText.setText(msg).setVisible(true).setAlpha(1);
      this.toastT = 2.2;
      const clippy = msg.indexOf('CLIPPY') === 0;
      this.clippyImg.setVisible(clippy).setAlpha(1);
      if (clippy) this.clippyImg.setX(320 - this.toastText.img.displayWidth / 2 - 16);
    }

    onEnemyKilled(e) {
      this.stats.kills++;
      this.achieve('FIRST KO', 'ko');
      this.addScore(200, e.x, e.y - 20);
      AH.Audio.play('kill');
      this.burst(e.x, e.y - (e.type === 'drone' ? 0 : 14), 'spark_y', 12, 160);
      this.spawnCoin(e.x, e.y - (e.type === 'drone' ? 4 : 18), true);
    }

    snapshot() {
      const p = this.player;
      let hack = null;
      if (this.terminals.length && !this.boss) {
        let best = null, bd = 520;
        this.terminals.forEach((t) => {
          const d = Math.abs(t.def.x - p.x);
          if (!t.done && d < bd) { bd = d; best = t; }
        });
        if (best) hack = best.progress;
        else if (this.terminals.every((t) => t.done)) hack = 100;
      }
      return {
        levelId: this.levelId, levelName: this.L.name, health: p.health, score: AH.Run.score, mfa: p.mfa, credits: p.credits,
        lives: AH.Run.lives, time: this.timeLeft, powers: this.powers, boost: p.boost, blastCost: AH.BLAST_COST, hack: hack,
        boss: this.boss && !this.boss.dead ? this.boss.snapshot() : null, mode: this.mode
      };
    }

    /* ----- state changes */
    setPaused(on) {
      if (on && this.state !== 'play') return;
      if (!on && this.state !== 'paused') return;
      this.state = on ? 'paused' : 'play';
      if (on) {
        this.physics.world.pause();
        this.tweens.pauseAll();
        this.showPanel('PAUSED', '#ffe14a', ['P: RESUME   R: RESTART'], [
          ['RESUME', () => this.setPaused(false)],
          ['LEVEL SELECT', () => this.scene.start('Select')]
        ]);
      } else {
        this.physics.world.resume();
        this.tweens.resumeAll();
        this.clearPanel();
      }
    }

    showPanel(title, col, lines, buttons, style) {
      this.clearPanel();
      if (style === 'bsod') return this.showBsod(lines, buttons);
      if (style === 'azure') return this.showDeploy(title, lines, buttons);
      const g = this.add.graphics().setScrollFactor(0).setDepth(1400);
      g.fillStyle(0x0a0720, 0.82).fillRect(0, 0, 640, 360);
      g.fillStyle(0x0b0830, 1).fillRect(90, 96, 460, 190);
      g.lineStyle(3, 0x27e0ff, 1).strokeRect(91, 97, 458, 188);
      g.lineStyle(1, 0xff7ad9, 1).strokeRect(96, 102, 448, 178);
      this.overlayItems.push(g);
      const add = (t) => { this.overlayItems.push(t); return t; };
      add(T(this, 320, 118, title, { scale: 5, color: col, ox: 0.5 }).setScrollFactor(0).setDepth(1450));
      let y = 160;
      lines.forEach((l) => {
        add(T(this, 320, y, l, { scale: 2, color: '#ffffff', ox: 0.5 }).setScrollFactor(0).setDepth(1450));
        y += 20;
      });
      const by = 252;
      const step = 450 / (buttons.length + 1) * (buttons.length === 1 ? 1 : 1);
      buttons.forEach((b, i) => {
        add(AH.UI.button(this, 95 + step * (i + 1), by, b[0], b[1], { scale: 2 }));
      });
    }

    /* Game over in the style of a Windows stop screen */
    showBsod(lines, buttons) {
      const add = (t) => { this.overlayItems.push(t); return t; };
      const g = add(this.add.graphics().setScrollFactor(0).setDepth(1400));
      g.fillStyle(0x0078d7, 1).fillRect(0, 0, 640, 360);
      const txt = (x, y, s, sc, c) => add(T(this, x, y, s, { scale: sc, color: c || '#ffffff', shadow: '#00509a' }).setScrollFactor(0).setDepth(1450));
      add(T(this, 60, 40, ':(', { scale: 10, color: '#ffffff', shadow: '' }).setScrollFactor(0).setDepth(1450));
      txt(60, 122, 'YOUR HERO RAN INTO A PROBLEM AND', 2);
      txt(60, 142, 'NEEDS TO RESTART. GAME PROGRESS:', 2);
      txt(60, 168, '100% COMPLETE', 2);
      lines.forEach((l, i) => txt(60, 196 + i * 16, l, 1, '#cfe8ff'));
      g.fillStyle(0xffffff, 1).fillRect(60, 240, 40, 40);
      g.fillStyle(0x0078d7, 1);
      for (let i = 0; i < 64; i++) { const qx = i % 8, qy = (i / 8) | 0; if ((qx * 7 + qy * 13 + qx * qy) % 3 === 0) g.fillRect(64 + qx * 4, 244 + qy * 4, 4, 4); }
      [[64, 244], [88, 244], [64, 268]].forEach((c) => { g.fillRect(c[0], c[1], 8, 8); g.fillStyle(0xffffff, 1).fillRect(c[0] + 2, c[1] + 2, 4, 4); g.fillStyle(0x0078d7, 1); });
      txt(112, 242, 'FOR MORE INFO, VISIT AKA.MS/AZUREHEROES', 1, '#cfe8ff');
      txt(112, 256, 'STOP CODE: HERO_OUT_OF_LIVES', 1);
      buttons.forEach((b, i) => add(AH.UI.button(this, 200 + i * 240, 310, b[0], b[1], { scale: 2, color: '#ffffff' })));
    }

    /* Level complete in the style of an Azure portal deployment */
    showDeploy(title, lines, buttons) {
      const add = (t) => { this.overlayItems.push(t); return t; };
      const g = add(this.add.graphics().setScrollFactor(0).setDepth(1400));
      g.fillStyle(0x0a0720, 0.7).fillRect(0, 0, 640, 360);
      g.fillStyle(0xf3f2f1, 1).fillRect(80, 64, 480, 236);
      g.fillStyle(0x0078d4, 1).fillRect(80, 64, 480, 22);
      g.fillStyle(0xffffff, 1).fillRect(80, 86, 480, 46);
      g.fillStyle(0x107c10, 1).fillCircle(112, 109, 14);
      g.lineStyle(4, 0xffffff, 1).beginPath().moveTo(104, 109).lineTo(110, 115).lineTo(121, 102).strokePath();
      g.lineStyle(1, 0xc8c6c4, 1).strokeRect(80, 64, 480, 236);
      add(this.add.image(90, 75, 'ms_logo').setScrollFactor(0).setDepth(1450).setDisplaySize(12, 12));
      const txt = (x, y, s, sc, c, ox) => add(T(this, x, y, s, { scale: sc, color: c, shadow: '', ox: ox || 0 }).setScrollFactor(0).setDepth(1450));
      txt(102, 71, 'MICROSOFT AZURE   HOME > DEPLOYMENTS', 1, '#ffffff');
      txt(136, 92, title, 3, '#107c10');
      txt(136, 119, 'RESOURCE GROUP: RG-HEROES-' + this.L.region.toUpperCase(), 1, '#605e5c');
      lines.forEach((l, i) => txt(100, 146 + i * 20, l, (l.length * 12 > 440 ? 1 : 2), '#323130'));
      g.fillStyle(0xe1dfdd, 1).fillRect(80, 252, 480, 1);
      buttons.forEach((b, i) => {
        const bx = 200 + i * 240;
        g.fillStyle(i === 0 ? 0x0078d4 : 0xffffff, 1).fillRect(bx - 90, 262, 180, 26);
        g.lineStyle(1, 0x0078d4, 1).strokeRect(bx - 90, 262, 180, 26);
        add(AH.UI.button(this, bx, 275, b[0], b[1], { scale: 2, color: i === 0 ? '#ffffff' : '#0078d4', shadow: '' }));
      });
    }

    clearPanel() {
      this.overlayItems.forEach((o) => (o.destroy ? o.destroy() : null));
      this.overlayItems = [];
    }

    loseLife(reason) {
      if (this.state !== 'play') return;
      this.state = 'dying';
      AH.Run.lives -= 1;
      const p = this.player;
      p.health = 0;
      AH.Audio.play(reason === 'fall' ? 'fall' : 'hit');
      this.burst(p.x, Math.min(p.y, 340), 'spark_c', 18, 200, 0.6);
      p.sprite.setVisible(false);
      p.shieldFx.setVisible(false);
      p.sprite.body.enable = false;
      this.bikeImg.setVisible(false);
      this.cameras.main.flash(250, 255, 60, 90);
      if (reason === 'time') this.toast('TIME UP!');
      this.time.delayedCall(950, () => {
        if (this.state !== 'dying') return;
        if (AH.Run.lives <= 0) this.gameOver();
        else this.respawn();
      });
    }

    respawn() {
      const p = this.player, cam = this.cameras.main, L = this.L;
      if (this.boss) { this.boss.destroy(); this.boss = null; }
      if (L.boss && !this.bossDone) {
        this.arenaLocked = false;
        cam.setBounds(0, 0, L.width, 360);
        cam.startFollow(p.sprite, true, 0.12, 0.12, -40, 0);
        AH.Audio.music('main');
      }
      if (this.inBonus) this.leaveBonus(false);
      this.dismount();
      this.ebolts.forEach((b) => b.s.destroy());
      this.ebolts = [];
      p.sprite.body.enable = true;
      p.sprite.setVisible(true);
      if (this.mode === 'fly') {
        cam.scrollX = Math.max(0, this.checkpoint.x - 120);
        p.respawn(cam.scrollX + 120, this.checkpoint.y);
      } else {
        p.respawn(this.checkpoint.x, this.checkpoint.y - 30);
      }
      this.blasts.forEach((b) => b.s.destroy());
      this.blasts = [];
      this.timeLeft = Math.max(this.timeLeft, 45);
      this.state = 'play';
    }

    gameOver() {
      this.state = 'gameover';
      this.completeT = 0.8;
      AH.Audio.music(null);
      AH.Audio.play('lose');
      AH.Save.recordScore(this.levelId, AH.Run.score);
      this.showPanel('GAME OVER', '#ff2a4a', ['GAME OVER  -  SCORE ' + AH.UI.pad(AH.Run.score, 6) + '   BEST ' + AH.UI.pad(AH.Save.data.best, 6), 'REGION: ' + this.L.regionName.toUpperCase()], [
        ['RETRY', () => this.restart()],
        ['LEVEL SELECT', () => this.scene.start('Select')]
      ], 'bsod');
    }

    levelComplete() {
      if (this.state !== 'play') return;
      this.state = 'complete';
      this.completeT = 0.8;
      AH.Audio.music(null);
      AH.Audio.play('win');
      const bonus = Math.floor(this.timeLeft) * 10;
      AH.Run.score += bonus;
      const idx = LEVEL_IDS.indexOf(this.levelId);
      AH.Save.unlock(Math.min(LEVEL_IDS.length, idx + 2));
      AH.Save.recordScore(this.levelId, AH.Run.score);
      this.player.sprite.setVelocity(0, 0);
      this.physics.world.pause();
      const next = LEVEL_IDS[idx + 1];
      const lines = [
        'SCORE ' + AH.UI.pad(AH.Run.score, 6) + '  TIME BONUS ' + bonus,
        'HERO DEPLOYED TO ' + this.L.regionName.toUpperCase(),
        'CREDITS ' + this.player.credits + '  MFA ' + this.stats.mfa + '  KO ' + this.stats.kills
      ];
      const buttons = [];
      if (next) {
        this.nextAction = () => {
          const lives = AH.Run.lives;
          AH.Run = { score: AH.Run.score, lives: lives, startScore: AH.Run.score, startLives: lives };
          this.scene.start('Level', { id: next });
        };
        buttons.push(['NEXT LEVEL', this.nextAction]);
      } else {
        lines.push('ALL SYSTEMS SECURED! YOU ARE AN AZURE HERO!');
        this.nextAction = () => this.scene.start('Select');
      }
      buttons.push(['LEVEL SELECT', () => this.scene.start('Select')]);
      this.showPanel(next ? 'DEPLOYMENT SUCCEEDED' : 'ALL REGIONS SECURED', '#4dff7a', lines.slice(0, 3), buttons, 'azure');
    }

    restart() {
      AH.Run = { score: AH.Run.startScore, lives: 3, startScore: AH.Run.startScore, startLives: 3 };
      this.scene.restart({ id: this.levelId });
    }

    startBoss() {
      const B = this.L.boss, cam = this.cameras.main;
      this.arenaLocked = true;
      cam.stopFollow();
      this.tweens.add({
        targets: cam, scrollX: B.left, duration: 600,
        onComplete: () => cam.setBounds(B.left, 0, 640, 360)
      });
      this.boss = new AH.Boss(this, B);
      this.toast(B.name);
    }

    onBossDefeated() {
      const B = this.L.boss;
      this.addScore(5000, this.boss.x, this.boss.y - 90);
      this.achieve('GIANT SLAYER', 'boss');
      this.boss.destroy();
      this.boss = null;
      this.bossDone = true;
      this.exitActive = true;
      this.portal.setVisible(true);
      AH.Audio.music(null);
      AH.Audio.play('win');
      this.toast('THREAT REMEDIATED BY DEFENDER! ENTER THE EXIT');
      void B;
    }

    /* ----- per-frame */
    update(time, delta) {
      const dt = Math.min(delta / 1000, 0.05);
      const cmd = this.input2.read();
      if (cmd.mute) { AH.Audio.toggle(); this.events.emit('audio-changed'); }
      if (cmd.restart) { this.restart(); return; }
      if (cmd.esc && this.state !== 'play' && this.state !== 'intro' && this.state !== 'dying') { this.scene.start('Select'); return; }

      if (this.state === 'complete') { this.completeT -= dt; if (cmd.confirm && this.nextAction && this.completeT < 0) this.nextAction(); this.hud.update(this.snapshot(), dt); return; }
      if (this.state === 'gameover') { this.completeT -= dt; if (cmd.confirm && this.completeT < 0) this.restart(); return; }
      if (cmd.pause && (this.state === 'play' || this.state === 'paused')) this.setPaused(this.state === 'play');
      if (this.state === 'paused') return;

      if (this.toastT > 0) {
        this.toastT -= dt;
        if (this.toastT < 0.5) this.toastText.setAlpha(Math.max(0, this.toastT / 0.5));
        if (this.toastT <= 0) this.toastText.setVisible(false);
      }

      if (this.state === 'intro') {
        this.introT -= dt;
        if (this.introT <= 0) {
          this.introItems.forEach((i) => i.destroy());
          this.state = 'play';
          if (this.mode === 'run') this.toast(this.L.theme === 'rack' ? 'FIND THE HACK TERMINALS' : 'REACH THE EXIT PORTAL');
        }
        this.hud.update(this.snapshot(), dt);
        return;
      }

      const cam = this.cameras.main, L = this.L, p = this.player;
      if (this.mode === 'fly') {
        const maxS = L.width - 640;
        this.scrollSpeed = cam.scrollX >= maxS ? 0 : L.scroll;
        if (this.state === 'play') cam.scrollX = Math.min(maxS, cam.scrollX + this.scrollSpeed * dt);
      }
      this.far.tilePositionX = cam.scrollX * 0.15 * AH.Art.D;
      this.near.tilePositionX = cam.scrollX * 0.35 * AH.Art.D;
      if (this.water) { this.water.tilePositionX = (cam.scrollX + this.time.now * 0.012) * AH.Art.D; this.water.tilePositionY = Math.sin(this.time.now / 600) * 2 * AH.Art.D; }

      if (this.state === 'dying') { this.hud.update(this.snapshot(), dt); return; }

      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.loseLife('time'); return; }

      p.update(dt, cmd);
      if (this.arenaLocked) {
        const B = L.boss;
        if (p.sprite.x < B.left + 16) { p.sprite.x = B.left + 16; p.sprite.body.setVelocityX(0); }
        if (p.sprite.x > B.right - 16) { p.sprite.x = B.right - 16; p.sprite.body.setVelocityX(0); }
      }
      if (this.mode === 'run' && this.water && p.y > 340) {
        this.burst(p.x, 306, 'spark_c', 16, 180, 0.5);
        AH.Audio.play('splash');
        this.toast('SPLASH! WATCH THE WATER');
        this.loseLife('fall');
        return;
      }
      if (this.mode === 'run' && p.y > 430) { this.loseLife('fall'); return; }
      if (L.boss && !this.boss && !this.bossDone && !this.inBonus && !this.warping && p.x > L.boss.trigger) this.startBoss();

      this.updateDraws(p);
      this.updateStreet(dt, p);
      this.updateWorld(dt, p);
      if (this.state === 'play' && p.health <= 0) this.loseLife('hit');
      if (this.boss) this.boss.update(dt, p);
      this.hud.update(this.snapshot(), dt);
    }

    updateWorld(dt, p) {
      const pb = p.body;
      const pr = { x: pb.x, y: pb.y, w: pb.width, h: pb.height };
      const now = this.time.now;
      const cam = this.cameras.main;

      // pickups
      this.coins.forEach((c) => {
        if (c.taken) return;
        if (ov(pr, { x: c.spr.x - 8, y: c.spr.y - 8, w: 16, h: 16 })) {
          c.taken = true;
          c.spr.destroy();
          p.credits += 1;
          this.stats.credits += 1;
          this.addScore(100, c.spr.x, c.spr.y - 10);
          AH.Audio.play('coin');
        }
      });
      this.pups.forEach((u) => {
        if (u.taken) return;
        if (ov(pr, { x: u.spr.x - 12, y: u.spr.y - 12, w: 24, h: 24 })) {
          u.taken = true;
          u.spr.destroy();
          this.activatePower(u.def.kind, u.def.x, u.def.y);
        }
      });
      this.updatePowers(dt, p);
      this.tokens.forEach((t) => {
        if (t.taken) return;
        if (ov(pr, { x: t.spr.x - 11, y: t.spr.y - 12, w: 22, h: 24 })) {
          t.taken = true;
          t.spr.destroy();
          p.mfa += 1;
          this.stats.mfa += 1;
          this.addScore(250, t.spr.x, t.spr.y - 12);
          AH.Audio.play('mfa');
          if (p.mfa >= 5) {
            p.mfa -= 5;
            AH.Run.lives += 1;
            AH.Audio.play('life');
            this.toast('5 MFA TOKENS = +1 LIFE!');
            this.achieve('MFA ENABLED', 'mfa');
          }
        }
      });
      this.rings.forEach((r) => {
        if (r.taken) return;
        if (Math.abs(p.x - r.def.x) < 14 && Math.abs(p.y - r.def.y) < r.def.r) {
          r.taken = true;
          r.spr.setTint(0xffffff);
          this.tweens.add({ targets: r.spr, alpha: 0, scale: 1.5, duration: 400, onComplete: () => r.spr.destroy() });
          p.credits += 1;
          this.stats.credits += 1;
          this.addScore(150, r.def.x, r.def.y - 40);
          AH.Audio.play('ring');
        }
      });
      this.flags.forEach((f) => {
        if (!f.hit && p.x >= f.def.x) {
          f.hit = true;
          f.spr.setTexture('flag_on');
          this.checkpoint = { x: f.def.x, y: f.def.y };
          AH.Audio.play('checkpoint');
          this.toast('CHECKPOINT!');
        }
      });

      // hazards
      this.lasers.forEach((l) => {
        const cyc = l.def.on + l.def.off;
        l.active = ((now + l.def.phase) % cyc) < l.def.on;
        l.beam.setVisible(l.active);
        l.top.setAlpha(l.active ? 1 : 0.5);
        l.bot.setAlpha(l.active ? 1 : 0.5);
        if (l.active) {
          l.beam.setAlpha(0.7 + 0.3 * Math.sin(now / 40));
          if (ov(pr, l.rect)) p.hurt(15, l.def.x);
        }
      });
      this.cables.forEach((c) => {
        c.t += dt;
        c.spr.tilePositionX = Math.floor(c.t * 8) % 2 ? 4 : 0;
        if (ov(pr, c.rect) && p.hurt(8, c.rect.x + c.rect.w / 2)) {
          p.sprite.body.setVelocityY(-240);
          this.burst(c.rect.x + c.rect.w / 2, c.rect.y, 'spark_c', 8, 150);
        }
      });
      if (this.mode === 'fly') {
        for (const r of this.rects) {
          if (ov(pr, r) && p.hurt(12, r.x + r.w / 2)) {
            const dy = p.y < r.y + r.h / 2 ? -1 : 1;
            p.sprite.body.setVelocityY(dy * 200);
          }
        }
      }

      // terminals
      this.terminals.forEach((t) => {
        if (t.done) return;
        const standing = ov(pr, t.rect) && (this.mode === 'fly' || p.onGround);
        if (standing) {
          t.progress = Math.min(100, t.progress + 40 * dt);
          if (Math.random() < 0.3) AH.Audio.play('hack');
          t.label.setText('HACKING ' + Math.floor(t.progress) + '%').setColor('#ffe14a');
          if (t.progress >= 100) this.completeHack(t);
        } else {
          t.progress = Math.max(0, t.progress - 15 * dt);
          t.label.setText('STAND HERE TO HACK').setColor('#4dff7a');
        }
      });

      // blasts
      for (let i = this.blasts.length - 1; i >= 0; i--) {
        const b = this.blasts[i];
        const v = b.dir * 480 + (this.mode === 'fly' ? this.scrollSpeed : 0);
        b.s.x += v * dt;
        b.dist += Math.abs(v) * dt;
        const br = { x: b.s.x - 12, y: b.s.y - 7, w: 24, h: 14 };
        let kill = b.dist > 560 || b.s.x < cam.scrollX - 30 || b.s.x > cam.scrollX + 670;
        if (!kill) {
          for (const e of this.enemies) {
            if (e.dead) continue;
            if (ov(br, rectOf(e.sprite.body))) { e.hit(b.dir); kill = true; break; }
          }
        }
        if (!kill && this.boss && !this.boss.dead && ov(br, (() => { const r = this.boss.rect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })())) { this.boss.hitByBlast(); kill = true; }
        if (!kill) {
          for (const r of this.rects) {
            if (r.active && ov(br, r)) { kill = true; this.burst(b.s.x, b.s.y, 'spark_c', 4, 80, 0.25); break; }
          }
        }
        if (kill) { b.s.destroy(); this.blasts.splice(i, 1); }
      }

      // enemy bolts
      for (let i = this.ebolts.length - 1; i >= 0; i--) {
        const b = this.ebolts[i];
        b.s.x += b.dir * 170 * dt;
        b.dist += 170 * dt;
        const br = { x: b.s.x - 6, y: b.s.y - 3, w: 12, h: 6 };
        let kill = b.dist > 420;
        if (!kill && ov(pr, br)) {
          kill = true;
          if (p.shielding && b.dir * p.facing < 0) {
            AH.Audio.play('block');
            this.burst(b.s.x, b.s.y, 'spark_c', 6, 120, 0.3);
            this.addScore(50, b.s.x, b.s.y - 12);
          } else p.hurt(10, b.s.x);
        }
        if (!kill) for (const r of this.rects) { if (r.active && ov(br, r)) { kill = true; break; } }
        if (kill) { b.s.destroy(); this.ebolts.splice(i, 1); }
      }

      // enemies
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (e.dead) { this.enemies.splice(i, 1); continue; }
        e.update(dt, p);
        if (this.mode === 'fly' && e.x < cam.scrollX - 80) { e.sprite.destroy(); e.dead = true; continue; }
        if (e.sprite.y > 460) { e.sprite.destroy(); e.dead = true; continue; }
        const er = rectOf(e.sprite.body);
        if (!ov(pr, er)) continue;
        const falling = this.mode === 'run' && pb.velocity.y > 60 && pb.bottom < er.y + er.h * 0.65;
        if (this.riding && !falling) {
          e.hit(p.facing);
          if (!e.dead) e.hit(p.facing);
          this.cameras.main.shake(80, 0.004);
        } else if (falling) {
          e.hit(p.facing);
          pb.setVelocityY(-320);
          p.jumps = 1;
        } else if (p.shielding && (e.x - p.x) * p.facing > 0) {
          e.sprite.body.setVelocityX(p.facing * 220);
          AH.Audio.play('block');
        } else if (p.invuln <= 0) {
          p.hurt(e.type === 'spider' ? 10 : 12, e.x);
        }
      }

      // exit
      const ex = this.L.exit;
      if (this.exitActive && ov(pr, { x: ex.x, y: ex.y, w: ex.w, h: ex.h })) this.levelComplete();
    }

    /* boats, bike pickup + riding, phone box secret */
    updateStreet(dt, p) {
      this.boats.forEach((b) => {
        const z = b.z, m = b.def, body = z.body;
        if (body.x <= m.x0) { body.x = m.x0; body.setVelocityX(m.speed); }
        else if (body.x >= m.x1) { body.x = m.x1; body.setVelocityX(-m.speed); }
        b.img.setPosition(z.x, m.y - 6).setFlipX(body.velocity.x < 0);
      });
      const pr = { x: p.body.x, y: p.body.y, w: p.body.width, h: p.body.height };
      this.bikes.forEach((b) => {
        if (b.taken || this.riding) return;
        if (ov(pr, { x: b.def.x - 18, y: b.def.y - 26, w: 36, h: 26 })) this.mountBike(b);
      });
      if (this.riding) {
        this.bikeImg.setPosition(p.x - p.facing * 2, p.body.bottom + 3).setFlipX(p.facing < 0);
        this.bikeImg.anims.timeScale = Math.abs(p.body.velocity.x) > 20 ? 1 : 0;
      }
      const S = this.secret;
      if (S && !this.warping) {
        const sec = this.L.secret, B = this.L.bonus;
        if (!this.inBonus && !S.used) {
          const near = Math.abs(p.x - sec.x) < 15 && p.onGround && Math.abs(p.body.bottom - sec.y) < 6;
          if (!S.tipped && Math.abs(p.x - sec.x) < 160) { S.tipped = true; this.toast('CLIPPY: STEP INTO THE PHONE BOX...'); }
          S.t = near ? S.t + dt : 0;
          S.booth.setTint(near ? 0xfff0a0 : 0xffffff);
          if (S.t > 0.45) { S.t = 0; this.enterBonus(); }
        } else if (this.inBonus) {
          const near = Math.abs(p.x - B.exit.x) < 15 && p.onGround;
          S.t = near ? S.t + dt : 0;
          S.exitBooth.setTint(near ? 0xfff0a0 : 0xffffff);
          if (S.t > 0.45) { S.t = 0; this.leaveBonus(true); }
        }
      }
    }

    completeHack(t) {
      t.done = true;
      t.progress = 100;
      t.label.setText('ACCESS GRANTED').setColor('#4dff7a');
      this.addScore(500, t.def.x, t.def.y - 70);
      AH.Audio.play('unlock');
      this.toast('HACK COMPLETE - SEC GATE OPEN');
      const g = this.gates[t.def.id];
      if (g) {
        g.r.active = false;
        this.solids.remove(g.z, true, true);
        this.tweens.killTweensOf(g.vis);
        this.tweens.add({ targets: g.vis, alpha: 0, duration: 400, onComplete: () => g.vis.destroy() });
      }
    }
  }

  AH.Scenes = [BootScene, TitleScene, SelectScene, LevelScene];
})();
