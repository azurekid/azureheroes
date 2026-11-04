/* Enemies: patrol robot, drone, spider bot, plus the cyber-threat trio: phish (hopper),
   ram (Ransomware charger) and botnet (DDoS bomber). Every enemy dies in 2 hits and drops 1 Azure Credit.
   Some patrol robots (def.shoot) fire slow energy bolts at the hero; the MFA Shield blocks them. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const SPEC = {
    robot: { tex: 'robot_0', anim: 'robot_walk', body: [20, 34, 6, 3], gravity: true, speed: 45, origin: 1 },
    drone: { tex: 'drone_0', anim: 'drone_fly', body: [24, 16, 4, 4], gravity: false, speed: 75, origin: 0.5 },
    spider: { tex: 'spider_0', anim: 'spider_crawl', body: [26, 12, 3, 8], gravity: true, speed: 55, origin: 1 },
    phish: { tex: 'phish_0', anim: 'phish_swim', body: [24, 16, 4, 6], gravity: true, speed: 95, origin: 1 },
    ram: { tex: 'ram_0', anim: 'ram_run', body: [26, 20, 3, 8], gravity: true, speed: 35, origin: 1 },
    botnet: { tex: 'botnet_0', anim: 'botnet_float', body: [26, 16, 3, 3], gravity: false, speed: 70, origin: 0.5 }
  };

  AH.Enemy = class Enemy {
    constructor(scene, def) {
      const spec = SPEC[def.type];
      this.scene = scene;
      this.type = def.type;
      this.health = 2;
      this.spec = spec;
      this.homeX = def.x;
      this.homeY = def.y;
      this.range = def.range || 0;
      this.dir = -1;
      this.dead = false;
      this.flash = 0;
      this.phase = Math.random() * 6;
      this.shoot = !!def.shoot && def.type === 'robot';
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
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    update(dt, player) {
      if (this.dead) return;
      const s = this.sprite, b = s.body, sp = this.spec.speed;
      this.phase += dt;
      if (this.flash > 0) {
        this.flash -= dt;
        if (this.flash <= 0) s.clearTint();
        return;
      }
      if (this.type === 'robot') {
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
            this.scene.spawnEnemyBolt(s.x + d * 14, s.y - 22, d);
          }
        }
      } else if (this.type === 'spider') {
        const near = Math.abs(player.x - s.x) < 170 && Math.abs(player.y - s.y) < 90;
        const lim = this.range + (near ? 60 : 0);
        if (near) this.dir = player.x < s.x ? -1 : 1;
        else if (s.x > this.homeX + this.range) this.dir = -1;
        else if (s.x < this.homeX - this.range) this.dir = 1;
        const out = (this.dir > 0 && s.x > this.homeX + lim) || (this.dir < 0 && s.x < this.homeX - lim);
        b.setVelocityX(out ? 0 : this.dir * (near ? sp * 1.8 : sp));
        s.setFlipX(this.dir < 0);
      } else if (this.type === 'phish') {
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
      } else if (this.type === 'ram') {
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

    hit(dir) {
      if (this.dead) return false;
      this.health -= 1;
      const s = this.sprite;
      if (this.health <= 0) { this.die(); return true; }
      AH.Audio.play('enemyHit');
      s.setTintFill(0xffffff);
      this.flash = 0.12;
      s.body.setVelocityX((dir || 1) * 140);
      if (this.spec.gravity) s.body.setVelocityY(-120);
      if (this.type === 'ram') { this.mode = 'walk'; this.act = 1; }
      this.scene.burst(s.x, s.y - 10, 'spark', 5, 100);
      return true;
    }

    die() {
      this.dead = true;
      const s = this.sprite;
      this.scene.onEnemyKilled(this);
      s.destroy();
    }
  };
})();
