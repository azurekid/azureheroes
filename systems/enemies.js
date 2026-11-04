/* Enemies: patrol robot, drone, spider bot. Every enemy dies in 2 hits and drops 1 Azure Credit. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const SPEC = {
    robot: { tex: 'robot_0', anim: 'robot_walk', body: [20, 34, 6, 3], gravity: true, speed: 45, origin: 1 },
    drone: { tex: 'drone_0', anim: 'drone_fly', body: [24, 16, 4, 4], gravity: false, speed: 75, origin: 0.5 },
    spider: { tex: 'spider_0', anim: 'spider_crawl', body: [26, 12, 3, 8], gravity: true, speed: 55, origin: 1 }
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
      } else if (this.type === 'spider') {
        const near = Math.abs(player.x - s.x) < 170 && Math.abs(player.y - s.y) < 90;
        const lim = this.range + (near ? 60 : 0);
        if (near) this.dir = player.x < s.x ? -1 : 1;
        else if (s.x > this.homeX + this.range) this.dir = -1;
        else if (s.x < this.homeX - this.range) this.dir = 1;
        const out = (this.dir > 0 && s.x > this.homeX + lim) || (this.dir < 0 && s.x < this.homeX - lim);
        b.setVelocityX(out ? 0 : this.dir * (near ? sp * 1.8 : sp));
        s.setFlipX(this.dir < 0);
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
      if (this.type !== 'drone') s.body.setVelocityY(-120);
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
