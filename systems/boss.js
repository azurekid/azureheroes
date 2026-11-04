/* Local region bosses (and the High-Risk CyberGuardian): block with the MFA Shield to stun, then hit with Azure Blasts. 3 attack phases.
   Air bosses (flight levels) cannot be blocked; they tire after every third attack and are exposed for a few seconds. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const STUN_TIME = 4;

  AH.Boss = class Boss {
    constructor(scene, arena) {
      this.scene = scene;
      this.arena = arena;
      this.max = 100;
      this.hp = 100;
      this.homeX = arena.right - 100;
      const k = arena.kind === 'guardian' ? 'boss' : 'boss_' + arena.kind;
      this.tx = { idle: k + '_0', attack: k + '_attack', stun: k + '_stun' };
      this.proj = arena.proj ? 'bolt_' + arena.proj : 'bolt';
      this.name = arena.name;
      this.air = !!arena.air;
      this.volleys = 0;
      this.sprite = scene.add.sprite(arena.right + 80, arena.floor, this.tx.idle).setOrigin(0.5, 1).setDepth(45);
      this.sprite.x = this.homeX;
      this.state = 'intro';
      this.timer = 1.6;
      this.cd = 1.2;
      this.blocks = 0;
      this.dir = -1;
      this.bolts = [];
      this.pending = [];
      this.dead = false;
      this.stunned = false;
      this.marker = scene.add.image(this.x, this.y - 38, 'boss_target').setDepth(44).setVisible(false);
      this.status = new AH.PixelText(scene, this.x, this.y - 94, '', { scale: 1, color: '#ffb060', ox: 0.5 }).setDepth(60);
      AH.Audio.play('boss');
      AH.Audio.music('boss');
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get phase() { return this.hp > this.max * 0.66 ? 1 : this.hp > this.max * 0.33 ? 2 : 3; }
    get vulnerable() { return !this.dead && (this.stunned || this.state === 'recover'); }
    get cue() {
      if (this.vulnerable) return 'OPEN - FIRE! ' + Math.ceil(Math.max(0, this.timer)) + 'S';
      if (this.state === 'intro') return 'GET READY';
      if (this.state === 'windup' || this.state === 'charge') return this.attack === 'charge' ? 'CHARGE - SHIELD OR JUMP' : 'VOLLEY - DODGE OR BLOCK';
      return this.air ? 'ARMORED - DODGE 3 VOLLEYS' : 'ARMORED - BLOCK ' + Math.max(1, 2 - this.blocks) + ' SHOTS';
    }
    snapshot() {
      return { hp: this.hp, max: this.max, stunned: this.stunned, phase: this.phase, name: this.name,
        state: this.state, vulnerable: this.vulnerable, window: this.vulnerable ? Math.max(0, this.timer) : 0, cue: this.cue };
    }

    fireBolt(h, speed) {
      const y = this.air ? Phaser.Math.Clamp(this.sprite.y - 40 + (34 - h) * 1.4, 70, 312) : this.arena.floor - h;
      const dir = this.aimDir || -1;
      const s = this.scene.add.image(this.sprite.x + dir * 34, y, this.proj).setDepth(46).setFlipX(dir > 0);
      this.bolts.push({ s, vx: dir * speed });
    }

    stun(msg, time) {
      this.state = 'stunned';
      this.stunned = true;
      this.volleys = 0;
      this.timer = time || (this.air ? 4.5 : STUN_TIME);
      this.blocks = 0;
      this.clearBolts();
      this.sprite.setTexture(this.tx.stun);
      AH.Audio.play('stun');
      this.scene.burst(this.sprite.x, this.sprite.y - 60, 'spark_y', 14, 160);
      this.scene.toast(msg || (this.air ? 'EXPOSED - BLAST IT!' : 'BOSS STUNNED - BLAST IT!'));
    }

    // returns true when the blast damaged the boss
    hitByBlast(damage = 10) {
      if (this.dead) return false;
      if (!this.vulnerable) {
        AH.Audio.play('block');
        this.scene.burst(this.sprite.x, this.sprite.y - 40, 'spark_c', 6, 120);
        if (!this.armorTipAt || this.scene.time.now >= this.armorTipAt) {
          this.armorTipAt = this.scene.time.now + 2000;
          this.scene.toast(this.air ? 'ARMORED! DODGE 3 VOLLEYS. FIRE WHEN GREEN' : 'ARMORED! BLOCK 2 SHOTS OR DODGE A CHARGE');
        }
        return false;
      }
      this.hp = Math.max(0, this.hp - damage);
      AH.Audio.play('bossHit');
      this.sprite.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => { if (this.sprite && this.sprite.active) this.sprite.clearTint(); });
      this.scene.burst(this.sprite.x, this.sprite.y - 40, 'spark', 10, 170);
      this.scene.cameras.main.shake(120, 0.008);
      if (this.hp <= 0) this.die();
      return true;
    }

    die() {
      this.dead = true;
      this.state = 'dying';
      this.stunned = false;
      this.timer = 1.6;
      this.clearBolts();
      this.marker.setVisible(false);
      this.status.setVisible(false);
      this.sprite.setTexture(this.tx.stun);
      this.scene.toast(this.name + ' DEFEATED!');
    }

    pickAttack() {
      const p = this.phase;
      const r = Math.random();
      if (this.air) return r < (p === 1 ? 0.6 : 0.35) ? 'shoot' : 'barrage';
      if (p === 1) return r < 0.7 ? 'shoot' : 'charge';
      if (p === 2) return r < 0.35 ? 'shoot' : r < 0.7 ? 'charge' : 'barrage';
      return r < 0.5 ? 'barrage' : 'charge';
    }

    update(dt, player) {
      const s = this.sprite, a = this.arena;
      this.timer -= dt;
      if (this.dead) {
        s.setAlpha(Math.max(0, this.timer / 1.6));
        if (Math.random() < 0.5) this.scene.burst(s.x + (Math.random() - 0.5) * 50, s.y - Math.random() * 70, 'spark_y', 2, 120);
        if (this.timer <= 0 && !this.finished) { this.finished = true; this.scene.onBossDefeated(); }
        return;
      }
      switch (this.state) {
        case 'intro':
          s.setTexture(this.tx.attack);
          if (this.timer <= 0) { this.state = 'idle'; s.setTexture(this.tx.idle); }
          break;
        case 'idle':
          s.setTexture(this.tx.idle);
          if (this.air) s.y += Phaser.Math.Clamp(Phaser.Math.Clamp(player.y + 40, 150, 300) - s.y, -90 * dt, 90 * dt);
          else s.y = a.floor + Math.sin(this.scene.time.now / 250) * 2;
          s.x += Math.sign(this.homeX - s.x) * Math.min(Math.abs(this.homeX - s.x), 160 * dt);
          this.cd -= dt;
          if (this.cd <= 0) {
            this.attack = this.pickAttack();
            this.state = 'windup';
            this.aimDir = player.x < s.x ? -1 : 1;
            this.timer = this.attack === 'charge' ? 0.85 : 0.65 - this.phase * 0.05;
            if (this.attack === 'charge') this.scene.toast('INCOMING! RAISE YOUR MFA SHIELD!');
            if (this.air && this.volleys >= 2) this.scene.toast('DODGE THE VOLLEY!');
          }
          break;
        case 'windup':
          s.setTexture(this.tx.attack);
          s.setTint(this.attack === 'charge' && Math.floor(this.timer * 12) % 2 ? 0xff9090 : 0xffffff);
          if (this.timer <= 0) {
            s.clearTint();
            const ph = this.phase;
            this.volleys += 1;
            if (this.attack === 'shoot') {
              this.fireBolt(ph === 2 ? 34 : 14, 210 + ph * 25);
              this.state = 'idle';
              this.cd = 1.15 - ph * 0.15;
            } else if (this.attack === 'barrage') {
              this.fireBolt(14, 230 + ph * 15);
              this.pending.push({ t: 0.22, h: 34 });
              this.pending.push({ t: 0.48, h: 72 });
              this.state = 'idle';
              this.cd = 1.1 - ph * 0.1;
            } else {
              this.dir = player.x < s.x ? -1 : 1;
              this.state = 'charge';
              AH.Audio.play('boss');
            }
          }
          break;
        case 'charge':
          s.setTexture(this.tx.attack);
          s.x += this.dir * (330 + this.phase * 25) * dt;
          if (s.x < a.left + 50 || s.x > a.right - 50) {
            s.x = Phaser.Math.Clamp(s.x, a.left + 50, a.right - 50);
            // slamming into the arena wall dazes the boss: a full damage window
            this.scene.cameras.main.shake(160, 0.01);
            this.stun('BONK! BOSS DAZED - BLAST IT!', STUN_TIME - 0.5);
            break;
          }
          this.checkCharge(player);
          break;
        case 'recover':
          s.setTexture(this.tx.idle);
          if (this.timer <= 0) { this.state = 'idle'; this.cd = 0.8; }
          break;
        case 'stunned':
          s.setTexture(this.tx.stun);
          s.setAngle(Math.sin(this.scene.time.now / 60) * 2);
          if (this.timer <= 0) {
            this.stunned = false;
            s.setAngle(0);
            this.state = 'idle';
            this.cd = 0.7;
          }
          break;
        default: break;
      }
      // Let the final volley travel before opening a clean damage window.
      if (this.state === 'idle' && this.volleys >= 3 && this.cd <= 0.15) this.stun();
      for (let i = this.pending.length - 1; i >= 0; i--) {
        this.pending[i].t -= dt;
        if (this.pending[i].t <= 0) { this.fireBolt(this.pending[i].h, 230); this.pending.splice(i, 1); }
      }
      this.updateBolts(dt, player);
      this.checkTouch(player);
      this.marker.setVisible(this.vulnerable).setPosition(s.x, s.y - 38);
      this.status.setVisible(true).setPosition(s.x, Math.max(100, s.y - 94))
        .setText(this.cue).setColor(this.vulnerable ? '#4dff7a' : '#ffb060');
    }

    rect() {
      const s = this.sprite;
      return new Phaser.Geom.Rectangle(s.x - 22, s.y - 76, 44, 76);
    }

    facesBoss(player) { return (this.sprite.x - player.x) * player.facing > 0; }

    checkCharge(player) {
      if (player.invuln > 0 || player.health <= 0) return;
      const pr = player.body;
      if (!Phaser.Geom.Intersects.RectangleToRectangle(this.rect(), new Phaser.Geom.Rectangle(pr.x, pr.y, pr.width, pr.height))) return;
      if (player.shielding && this.facesBoss(player)) {
        AH.Audio.play('block');
        player.invuln = 0.4;
        this.sprite.x -= this.dir * 30;
        this.stun();
      } else {
        player.hurt(25, this.sprite.x);
      }
    }

    checkTouch(player) {
      if (this.vulnerable || this.state === 'charge' || player.invuln > 0 || player.guardT > 0 || player.health <= 0) return;
      const pr = player.body;
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.rect(), new Phaser.Geom.Rectangle(pr.x, pr.y, pr.width, pr.height))) {
        if (player.shielding && this.facesBoss(player)) {
          // the MFA Shield holds the boss off: push the hero back without damage
          AH.Audio.play('block');
          player.guardT = 0.35;
          player.sprite.body.setVelocityX(-player.facing * 160);
          this.scene.burst(player.x + player.facing * 16, player.y - 20, 'spark_c', 5, 100, 0.25);
        } else player.hurt(10, this.sprite.x);
      }
    }

    updateBolts(dt, player) {
      const pr = player.body;
      const prect = new Phaser.Geom.Rectangle(pr.x, pr.y, pr.width, pr.height);
      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.s.x += b.vx * dt;
        let gone = b.s.x < this.arena.left - 30 || b.s.x > this.arena.right + 30;
        let blocked = false;
        const br = new Phaser.Geom.Rectangle(b.s.x - 11, b.s.y - 6, 22, 12);
        if (!gone && Phaser.Geom.Intersects.RectangleToRectangle(br, prect) && player.health > 0) {
          if (player.shielding && (b.s.x - player.x) * player.facing > 0) {
            gone = true;
            AH.Audio.play('block');
            this.scene.burst(b.s.x, b.s.y, 'spark_c', 8, 140);
            this.blocks += 1;
            this.scene.addScore(100, b.s.x, b.s.y - 10);
            blocked = this.blocks >= 2 && !this.vulnerable && this.state !== 'charge';
          } else if (player.invuln <= 0) {
            gone = true;
            player.hurt(15, b.s.x);
          }
        }
        if (gone) { b.s.destroy(); this.bolts.splice(i, 1); }
        if (blocked) { this.stun(); break; }
      }
    }

    clearBolts() {
      this.bolts.forEach((b) => b.s.destroy());
      this.bolts = [];
      this.pending = [];
    }

    destroy() {
      this.clearBolts();
      this.marker.destroy();
      this.status.destroy();
      this.sprite.destroy();
    }
  };
})();
