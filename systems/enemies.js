/* Enemies: patrol robots, drones, spider bots and cloud threats. Every enemy dies in 2 hits
   and drops 1 Azure Credit. Shooters fire slow energy bolts that the MFA Shield blocks. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const SPEC = {
    robot: { tex: 'robot_0', anim: 'robot_walk', body: [20, 34, 6, 3], gravity: true, speed: 45, origin: 1 },
    drone: { tex: 'drone_0', anim: 'drone_fly', body: [24, 16, 4, 4], gravity: false, speed: 75, origin: 0.5 },
    spider: { tex: 'spider_0', anim: 'spider_crawl', body: [26, 12, 3, 8], gravity: true, speed: 55, origin: 1 },
    phish: { tex: 'phish_0', anim: 'phish_swim', body: [24, 16, 4, 6], gravity: true, speed: 95, origin: 1 },
    ram: { tex: 'ram_0', anim: 'ram_run', body: [26, 20, 3, 8], gravity: true, speed: 35, origin: 1 },
    botnet: { tex: 'botnet_0', anim: 'botnet_float', body: [26, 16, 3, 3], gravity: false, speed: 70, origin: 0.5 },
    bug: { tex: 'bug_0', anim: 'bug_move', body: [26, 16, 3, 6], gravity: true, speed: 85, origin: 1, behaviour: 'phish', fix: 'PIPELINE BUG FIXED - TEST WITH GITHUB ACTIONS' },
    image: { tex: 'image_0', anim: 'image_move', body: [26, 20, 3, 8], gravity: true, speed: 40, origin: 1, behaviour: 'ram', fix: 'IMAGE PATCHED - SCAN WITH DEFENDER FOR CLOUD' },
    rbac: { tex: 'rbac_0', anim: 'rbac_move', body: [20, 34, 6, 3], gravity: true, speed: 40, origin: 1, behaviour: 'robot', fix: 'RBAC FIXED - USE LEAST PRIVILEGE IN ENTRA' },
    endpoint: { tex: 'endpoint_0', anim: 'endpoint_move', body: [26, 20, 3, 8], gravity: true, speed: 0, origin: 1, behaviour: 'robot', fix: 'ENDPOINT SECURED - USE AZURE PRIVATE LINK' },
    guest: { tex: 'guest_0', anim: 'guest_move', body: [26, 12, 3, 8], gravity: true, speed: 65, origin: 1, behaviour: 'spider', fix: 'GUEST REVIEWED - ENTRA ACCESS REVIEWS' },
    hacker: { tex: 'hacker_0', anim: 'hacker_walk', body: [20, 34, 6, 3], gravity: true, speed: 40, origin: 1, behaviour: 'robot', fix: 'INTRUSION STOPPED - ENABLE ENTRA MFA' }
  };
  // threat category drives the nameplate colour, so the hero can read what each enemy is at a glance
  const CATS = {
    malware: { name: 'MALWARE', color: '#ff4a5a', dark: '#5a0a14' },
    network: { name: 'NETWORK', color: '#ffa040', dark: '#5a2a04' },
    identity: { name: 'IDENTITY', color: '#ff7ad9', dark: '#4a0a3a' },
    devops: { name: 'DEVOPS', color: '#ffe14a', dark: '#4a3a04' }
  };
  const INFO = {
    robot: ['MALWARE BOT', 'malware', 'PATROLS, SOME SHOOT. BLAST OR STOMP'],
    spider: ['WORM CRAWLER', 'malware', 'SPREADS FAST WHEN NEAR. SLIDE INTO IT'],
    ram: ['RANSOMWARE', 'malware', 'GLOWS RED, THEN CHARGES. JUMP OVER'],
    drone: ['SPY DRONE', 'network', 'HOMES IN FROM THE AIR. BLAST IT'],
    botnet: ['DDOS BOTNET', 'network', 'DROPS PACKET BOMBS FROM ABOVE'],
    endpoint: ['PUBLIC ENDPOINT', 'network', 'EXPOSED TURRET. USE PRIVATE LINK'],
    phish: ['PHISHING LURE', 'identity', 'LEAPS AT YOU. NEVER TAKE THE BAIT'],
    rbac: ['OVERPRIVILEGED ROLE', 'identity', 'TOO MANY RIGHTS AND IT SHOOTS'],
    guest: ['STALE GUEST', 'identity', 'FORGOTTEN ACCOUNT. DUCK + SLIDE'],
    bug: ['PIPELINE BUG', 'devops', 'HOPS AROUND BUILDS. TEST IT AWAY'],
    image: ['VULNERABLE IMAGE', 'devops', 'UNPATCHED CONTAINER. IT CHARGES'],
    hacker: ['ROGUE HACKER', 'identity', 'FIRES BOLTS. BLOCK WITH MFA SHIELD']
  };
  Object.keys(INFO).forEach((k) => { SPEC[k].label = INFO[k][0]; SPEC[k].cat = INFO[k][1]; SPEC[k].info = INFO[k][2]; });
  const TAG_RANGE = 230;

  AH.Enemy = class Enemy {
    constructor(scene, def) {
      const spec = SPEC[def.type];
      this.scene = scene;
      this.type = def.type;
      this.bossToken = def.bossToken || null;
      this.health = 2;
      this.spec = spec;
      this.homeX = def.x;
      this.homeY = def.y;
      this.range = def.range || 0;
      this.dir = -1;
      this.dead = false;
      this.flash = 0;
      this.phase = Math.random() * 6;
      this.shoot = (def.type === 'rbac' || def.type === 'endpoint' || def.type === 'hacker') || (!!def.shoot && def.type === 'robot');
      this.shootCd = 1 + Math.random() * 1.5;
      this.act = 0;
      this.mode = 'walk';
      const skin = def.skin ? 'en_' + def.skin + '_' + def.type : null;
      const local = skin && scene.anims.exists(skin);
      this.sprite = scene.physics.add.sprite(def.x, def.y, local ? skin + '_0' : spec.tex).setOrigin(0.5, spec.origin).setDepth(40);
      this.sprite.play(local ? skin : spec.anim);
      this.sprite.body.setSize(spec.body[0] * AH.Art.D, spec.body[1] * AH.Art.D);
      this.sprite.body.setOffset(spec.body[2] * AH.Art.D, spec.body[3] * AH.Art.D);
      this.sprite.body.setAllowGravity(spec.gravity);
      if (spec.gravity) scene.physics.add.collider(this.sprite, scene.solids);
      this.sprite.enemy = this;
      const cat = CATS[spec.cat];
      this.tag = new AH.PixelText(scene, def.x, def.y, (this.bossToken ? 'TOKEN CARRIER - ' : '') + spec.label,
        { scale: 1, color: this.bossToken ? '#4dff7a' : cat.color, shadow: cat.dark, ox: 0.5, oy: 1 }).setDepth(41).setVisible(false);
    }

    // nameplate above the sprite, shown when the hero gets close
    updateTag(player) {
      const s = this.sprite, show = !this.dead && Math.abs(player.x - s.x) < TAG_RANGE && Math.abs(player.y - s.y) < 160;
      this.tag.setVisible(show);
      if (show) this.tag.setPosition(Math.round(s.x), Math.round(s.y - (this.spec.origin === 1 ? s.displayHeight : s.displayHeight / 2) - 3));
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    update(dt, player) {
      if (this.dead) return;
      const s = this.sprite, b = s.body, sp = this.spec.speed, type = this.spec.behaviour || this.type;
      this.phase += dt;
      this.updateTag(player);
      if (this.flash > 0) {
        this.flash -= dt;
        if (this.flash <= 0) s.clearTint();
        return;
      }
      if (type === 'robot') {
        if (s.x > this.homeX + this.range) this.dir = -1;
        else if (s.x < this.homeX - this.range) this.dir = 1;
        if (b.blocked.left) this.dir = 1;
        else if (b.blocked.right) this.dir = -1;
        b.setVelocityX(this.dir * sp);
        s.setFlipX(this.dir > 0);
        if (this.shoot) {
          this.shootCd -= dt;
          const dx = player.x - s.x;
          if (this.shootCd <= 0 && Math.abs(dx) < 330 && Math.abs(dx) > 40 && Math.abs(player.y - (s.y - 20)) < 70) {
            this.shootCd = 2.2 + Math.random() * 0.8;
            const d = dx > 0 ? 1 : -1;
            s.setFlipX(d > 0);
            s.setTint(0xffa080);
            this.scene.time.delayedCall(120, () => { if (!this.dead) s.clearTint(); });
            this.scene.spawnEnemyBolt(s.x + d * 14, s.y - (this.type === 'endpoint' ? 16 : 22), d);
          }
        }
      } else if (type === 'spider') {
        const near = Math.abs(player.x - s.x) < 170 && Math.abs(player.y - s.y) < 90;
        const lim = this.range + (near ? 60 : 0);
        if (near) this.dir = player.x < s.x ? -1 : 1;
        else if (s.x > this.homeX + this.range) this.dir = -1;
        else if (s.x < this.homeX - this.range) this.dir = 1;
        const out = (this.dir > 0 && s.x > this.homeX + lim) || (this.dir < 0 && s.x < this.homeX - lim);
        b.setVelocityX(out ? 0 : this.dir * (near ? sp * 1.8 : sp));
        s.setFlipX(this.dir < 0);
      } else if (type === 'phish') {
        // waits on the ground, then leaps at the hero like a lure
        const onGround = b.blocked.down || b.touching.down;
        const dx = player.x - s.x;
        this.act -= dt;
        if (onGround) {
          b.setVelocityX(0);
          if (this.act <= 0) {
            const near = Math.abs(dx) < 240 && Math.abs(player.y - s.y) < 120;
            let d = near ? (dx > 0 ? 1 : -1) : (s.x > this.homeX ? -1 : 1);
            if ((d > 0 && s.x > this.homeX + this.range) || (d < 0 && s.x < this.homeX - this.range)) d = -d;
            this.dir = d;
            this.act = near ? 1.1 + Math.random() * 0.5 : 1.6 + Math.random() * 0.8;
            b.setVelocity(d * (near ? sp : sp * 0.5), near ? -300 : -200);
            s.setFlipX(d < 0);
          }
        } else if ((this.dir > 0 && s.x > this.homeX + this.range + 20) || (this.dir < 0 && s.x < this.homeX - this.range - 20)) b.setVelocityX(0);
      } else if (type === 'ram') {
        // patrols slowly, lowers its horns, then charges across its rooftop
        const dx = player.x - s.x;
        const lo = this.homeX - this.range - 30, hi = this.homeX + this.range + 30;
        this.act -= dt;
        if (this.mode === 'walk') {
          if (s.x > this.homeX + this.range) this.dir = -1;
          else if (s.x < this.homeX - this.range) this.dir = 1;
          b.setVelocityX(this.dir * sp);
          if (this.act <= 0 && Math.abs(dx) < 230 && Math.abs(player.y - s.y) < 50) {
            this.mode = 'wind'; this.act = 0.55; this.dir = dx > 0 ? 1 : -1;
            b.setVelocityX(0); s.setTint(0xff7060);
          }
        } else if (this.mode === 'wind') {
          b.setVelocityX(0);
          s.x += Math.sin(this.phase * 60) * 0.6;
          if (this.act <= 0) { this.mode = 'dash'; this.act = 0.9; s.clearTint(); }
        } else {
          b.setVelocityX(this.dir * 240);
          if (this.act <= 0 || (this.dir > 0 && s.x >= hi) || (this.dir < 0 && s.x <= lo) || b.blocked.left || b.blocked.right) {
            this.mode = 'walk'; this.act = 1.4; this.dir = -this.dir; b.setVelocityX(0);
          }
        }
        s.setFlipX(this.dir < 0);
      } else if (this.type === 'botnet') {
        // shadows the hero from above and drops DDoS bombs
        const dx = player.x - s.x;
        const lim = this.range || 160;
        let vx = 0;
        if (Math.abs(dx) < 380) vx = Math.max(-sp, Math.min(sp, dx * 1.5));
        if ((vx > 0 && s.x > this.homeX + lim) || (vx < 0 && s.x < this.homeX - lim)) vx = 0;
        b.setVelocity(vx, (this.homeY + Math.sin(this.phase * 1.6) * 8 - s.y) * 3);
        this.shootCd -= dt;
        if (this.shootCd <= 0 && Math.abs(dx) < 36 && player.y > s.y + 30 && player.y - s.y < 300) {
          this.shootCd = 1.7 + Math.random() * 0.6;
          this.scene.spawnEnemyBolt(s.x, s.y + 12, 0, 150);
        }
      } else {
        const fly = this.scene.mode === 'fly';
        const dx = player.x - s.x, dy = player.y - s.y;
        if (Math.abs(dx) < (fly ? 420 : 340) && Math.abs(dy) < 260) {
          const tx = player.x, ty = player.y + Math.sin(this.phase * 3) * 26;
          const ang = Math.atan2(ty - s.y, tx - s.x);
          const v = fly ? 110 : sp;
          b.setVelocity(Math.cos(ang) * v, Math.sin(ang) * v);
          s.setFlipX(b.velocity.x < 0);
        } else {
          b.setVelocity(0, Math.cos(this.phase * 2) * 22);
        }
      }
    }

    hit(dir, damage = 1) {
      if (this.dead) return false;
      this.health -= damage;
      const s = this.sprite;
      if (this.health <= 0) { this.die(); return true; }
      AH.Audio.play('enemyHit');
      s.setTintFill(0xffffff);
      this.flash = 0.12;
      s.body.setVelocityX((dir || 1) * 140);
      if (this.spec.gravity) s.body.setVelocityY(-120);
      if ((this.spec.behaviour || this.type) === 'ram') { this.mode = 'walk'; this.act = 1; }
      this.scene.burst(s.x, s.y - 10, 'spark', 5, 100);
      return true;
    }

    remove() {
      this.dead = true;
      this.sprite.destroy();
      this.tag.destroy();
    }

    die() {
      this.dead = true;
      const s = this.sprite;
      this.scene.onEnemyKilled(this);
      s.destroy();
      this.tag.destroy();
    }
  };
  AH.Enemy.SPEC = SPEC;
  AH.Enemy.CATS = CATS;
})();
