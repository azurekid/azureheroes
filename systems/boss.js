/* Regional street-fighter bosses (and the High-Risk CyberGuardian). Three rounds (phases) of 33% health.
   The boss is ARMORED by default and only takes damage while vulnerable:
   - stunned: after 2 MFA Shield blocks, a charge/dash into the arena wall, or every third attack;
   - recover: after a melee combo, jump kick or uppercut that missed ("WHIFF - PUNISH").
   Ground fighters walk in and out of range (footsies) and mix projectiles with combos, jump kicks,
   anti-air uppercuts and a round-3 super. Air bosses hover, volley, swoop (dash) and fan shots. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const STUN_TIME = 4;
  const WHIFF_TIME = 1.5;
  const GRAVITY = 1400;
  const CUES = {
    shoot: 'VOLLEY - DODGE OR BLOCK', barrage: 'VOLLEY - DODGE OR BLOCK', charge: 'CHARGE - SHIELD OR JUMP',
    combo: 'COMBO - BACK OFF OR SHIELD', leap: 'JUMP KICK - DASH AWAY', upper: 'UPPERCUT - STAY LOW',
    super: 'SUPER - JUMP AND BLOCK', dash: 'DASH - CHANGE HEIGHT', fan: 'FAN - FIND THE GAP'
  };
  const MELEE = { combo: 1, leap: 1, upper: 1 };

  AH.Boss = class Boss {
    constructor(scene, arena) {
      this.scene = scene;
      this.arena = arena;
      this.max = 100;
      this.hp = 100;
      this.homeX = arena.right - 100;
      const k = arena.kind === 'guardian' ? 'boss' : 'boss_' + arena.kind;
      const tex = scene.textures;
      const has = (key) => !!(tex && tex.exists && tex.exists(key));
      const idle = k + '_0', attack = k + '_attack';
      this.tx = { idle: idle, attack: attack, stun: k + '_stun' };
      [['bob', '_1', idle], ['walk', '_walk', idle], ['kick', '_kick', attack], ['jump', '_jump', attack], ['upper', '_upper', attack]]
        .forEach((f) => { this.tx[f[0]] = has(k + f[1]) ? k + f[1] : f[2]; });
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
      this.facing = -1;
      this.vx = 0;
      this.vy = 0;
      this.round = 1;
      this.superCd = 4;
      this.streak = 0;
      this.bolts = [];
      this.pending = [];
      this.dead = false;
      this.stunned = false;
      this.marker = scene.add.image(this.x, this.y - 38, 'boss_target').setDepth(44).setVisible(false);
      this.status = new AH.PixelText(scene, this.x, this.y - 94, '', { scale: 1, color: '#ffb060', ox: 0.5 }).setDepth(60);
      AH.Audio.play('boss');
      AH.Audio.music('boss', this.scene.L?.region);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get phase() { return this.hp > this.max * 0.66 ? 1 : this.hp > this.max * 0.33 ? 2 : 3; }
    get vulnerable() { return !this.dead && (this.stunned || this.state === 'recover'); }
    get cue() {
      if (this.vulnerable) {
        const open = 'OPEN - FIRE! ' + Math.ceil(Math.max(0, this.timer)) + 'S';
        if (this.streak > 1) return this.streak + ' HIT COMBO! ' + open;
        return this.state === 'recover' ? 'WHIFF! ' + open : open;
      }
      if (this.state === 'intro') return 'ROUND ' + this.phase + ' - GET READY';
      if ((this.state !== 'idle' || this.pending.length) && CUES[this.attack]) return CUES[this.attack];
      return this.air ? 'ARMORED - DODGE 3 VOLLEYS' : 'ARMORED - BLOCK 2 HITS OR BAIT A MISS';
    }
    snapshot() {
      return { hp: this.hp, max: this.max, stunned: this.stunned, phase: this.phase, round: this.phase, name: this.name,
        state: this.state, vulnerable: this.vulnerable, window: this.vulnerable ? Math.max(0, this.timer) : 0, cue: this.cue };
    }

    fireBolt(h, speed, vy) {
      const y = this.air ? Phaser.Math.Clamp(this.sprite.y - 40 + (34 - h) * 1.4, 70, 312) : this.arena.floor - h;
      const dir = this.aimDir || -1;
      const s = this.scene.add.image(this.sprite.x + dir * 34, y, this.proj).setDepth(46).setFlipX(dir > 0);
      this.bolts.push({ s, vx: dir * speed, vy: vy || 0 });
    }

    stun(msg, time) {
      this.state = 'stunned';
      this.stunned = true;
      this.volleys = 0;
      this.timer = time || (this.air ? 4.5 : STUN_TIME);
      this.blocks = 0;
      this.vx = this.vy = 0;
      this.clearBolts();
      this.sprite.clearTint();
      this.sprite.setTexture(this.tx.stun);
      if (!this.air) this.sprite.y = this.arena.floor;
      AH.Audio.play('stun');
      this.scene.burst(this.sprite.x, this.sprite.y - 60, 'spark_y', 14, 160);
      this.scene.toast(msg || (this.air ? 'EXPOSED - BLAST IT!' : 'BOSS STUNNED - BLAST IT!'));
    }

    // a missed melee move leaves the fighter off balance: a short, clearly marked punish window
    whiff(msg) {
      this.state = 'recover';
      this.timer = WHIFF_TIME;
      this.volleys = 0;
      this.blocks = 0;
      this.vx = this.vy = 0;
      if (!this.air) this.sprite.y = this.arena.floor;
      this.sprite.clearTint();
      this.sprite.setTexture(this.tx.bob);
      AH.Audio.play('stun');
      this.scene.toast(msg || 'WHIFFED - PUNISH IT!');
    }

    // returns true when the blast damaged the boss
    hitByBlast(damage = 10) {
      if (this.dead) return false;
      if (!this.vulnerable) {
        AH.Audio.play('block');
        this.scene.burst(this.sprite.x, this.sprite.y - 40, 'spark_c', 6, 120);
        if (!this.armorTipAt || this.scene.time.now >= this.armorTipAt) {
          this.armorTipAt = this.scene.time.now + 2000;
          this.scene.toast(this.air ? 'ARMORED! DODGE 3 VOLLEYS. FIRE WHEN GREEN' : 'ARMORED! BLOCK 2 HITS OR BAIT A MISS, FIRE WHEN GREEN');
        }
        return false;
      }
      this.hp = Math.max(0, this.hp - damage);
      this.streak += 1;
      if (this.streak > 1) this.scene.addScore(50 * (this.streak - 1), this.sprite.x, this.sprite.y - 100);
      AH.Audio.play('bossHit');
      AH.Audio.play('punch');
      const a = this.arena, s = this.sprite;
      s.x = Phaser.Math.Clamp(s.x - this.facing * 8, a.left + 40, a.right - 40);
      s.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => { if (s && s.active) s.clearTint(); });
      this.scene.burst(s.x, s.y - 40, 'spark', 10, 170);
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
      this.flash(255, 255, 255);
      AH.Audio.play('ko');
      this.scene.toast('K.O.! ' + this.name + ' DEFEATED!');
    }

    flash(r, g, b) {
      const cam = this.scene.cameras.main;
      if (cam.flash) cam.flash(180, r, g, b);
    }

    pickAttack(player) {
      const p = this.phase, r = Math.random();
      const dx = player ? Math.abs(player.x - this.sprite.x) : 300;
      const above = player ? player.y < this.arena.floor - 70 : false;
      if (this.air) {
        if (p === 3 && r < 0.3) return 'fan';
        if (p === 1) return r < 0.5 ? 'shoot' : r < 0.8 ? 'barrage' : 'dash';
        return r < 0.3 ? 'shoot' : r < 0.6 ? 'barrage' : 'dash';
      }
      if (p >= 2 && above && dx < 130 && r < 0.65) return 'upper';
      if (p === 3 && this.superCd <= 0 && r < 0.3) return 'super';
      const close = dx < 170;
      if (p === 1) return close ? (r < 0.55 ? 'combo' : r < 0.8 ? 'shoot' : 'leap') : (r < 0.45 ? 'shoot' : r < 0.7 ? 'leap' : r < 0.85 ? 'charge' : 'combo');
      if (p === 2) return close ? (r < 0.5 ? 'combo' : r < 0.75 ? 'leap' : 'barrage') : (r < 0.3 ? 'shoot' : r < 0.55 ? 'leap' : r < 0.75 ? 'charge' : 'barrage');
      return close ? (r < 0.5 ? 'combo' : r < 0.75 ? 'leap' : 'barrage') : (r < 0.3 ? 'leap' : r < 0.55 ? 'charge' : r < 0.8 ? 'barrage' : 'shoot');
    }

    face(dir) {
      this.facing = dir;
      this.sprite.setFlipX(dir > 0);
    }

    update(dt, player) {
      const s = this.sprite, a = this.arena, now = this.scene.time.now;
      this.timer -= dt;
      this.superCd -= dt;
      if (this.dead) {
        s.setAlpha(Math.max(0, this.timer / 1.6));
        s.setAngle(-this.facing * Math.min(80, (1.6 - this.timer) * 170));
        if (Math.random() < 0.5) this.scene.burst(s.x + (Math.random() - 0.5) * 50, s.y - Math.random() * 70, 'spark_y', 2, 120);
        if (this.timer <= 0 && !this.finished) { this.finished = true; this.scene.onBossDefeated(); }
        return;
      }
      if (this.phase !== this.round) {
        this.round = this.phase;
        this.flash(255, 80, 80);
        AH.Audio.play('bell');
        this.scene.toast('ROUND ' + this.round + ' - ' + (this.round === 3 ? 'FINAL ROUND! FIGHT!' : 'FIGHT!'));
      }
      const committed = this.state === 'charge' || this.state === 'lunge' || this.state === 'strike' || this.state === 'leap' || this.state === 'upper';
      if (!committed && this.state !== 'stunned') this.face(player.x < s.x ? -1 : 1);
      switch (this.state) {
        case 'intro':
          s.setTexture(Math.floor(now / 300) % 2 ? this.tx.bob : this.tx.idle);
          if (this.timer <= 0) {
            this.state = 'idle';
            AH.Audio.play('bell');
            this.scene.toast('ROUND 1 - FIGHT!');
          }
          break;
        case 'idle': {
          let moving = false;
          if (this.air) {
            s.y += Phaser.Math.Clamp(Phaser.Math.Clamp(player.y + 40, 150, 300) - s.y, -90 * dt, 90 * dt);
          } else s.y = a.floor;
          // footsies: drift in and out of striking range on the player's side
          const side = s.x >= player.x ? 1 : -1;
          const want = Phaser.Math.Clamp(player.x + side * ((this.air ? 210 : 150) + Math.sin(now / 650) * 40), a.left + 50, a.right - 50);
          const step = Math.min(Math.abs(want - s.x), (this.air ? 110 : 70 + this.phase * 20) * dt);
          if (step > 0.5) { s.x += Math.sign(want - s.x) * step; moving = true; }
          s.setTexture(moving && !this.air ? (Math.floor(now / 170) % 2 ? this.tx.walk : this.tx.idle) : (Math.floor(now / 320) % 2 ? this.tx.bob : this.tx.idle));
          this.cd -= dt;
          if (this.cd <= 0) {
            this.attack = this.pickAttack(player);
            this.state = 'windup';
            this.aimDir = player.x < s.x ? -1 : 1;
            const t = { charge: 0.85, dash: 0.75, combo: 0.5, leap: 0.55, upper: 0.32, super: 0.9, fan: 0.6 };
            this.timer = t[this.attack] || 0.65 - this.phase * 0.05;
            if (this.attack === 'charge') this.scene.toast('INCOMING! RAISE YOUR MFA SHIELD!');
            if (this.attack === 'super') { this.flash(255, 210, 63); this.superCd = 9; this.scene.toast('SUPER MOVE! JUMP THE LOW SHOTS, BLOCK THE HIGH!'); }
            if (this.air && this.volleys >= 2) this.scene.toast('DODGE THE VOLLEY!');
          }
          break;
        }
        case 'windup': {
          const atk = this.attack;
          s.setTexture(atk === 'charge' || atk === 'dash' ? this.tx.walk : MELEE[atk] ? this.tx.bob : this.tx.attack);
          s.setTint((atk === 'charge' || atk === 'dash' || MELEE[atk] || atk === 'super') && Math.floor(this.timer * 12) % 2 ? 0xff9090 : 0xffffff);
          if (this.timer <= 0) {
            s.clearTint();
            const ph = this.phase;
            this.volleys += 1;
            this.hitLanded = false;
            if (atk === 'shoot') {
              this.fireBolt(ph === 2 ? 34 : 14, 210 + ph * 25);
              this.state = 'idle';
              this.cd = 1.15 - ph * 0.15;
            } else if (atk === 'barrage') {
              this.fireBolt(14, 230 + ph * 15);
              this.pending.push({ t: 0.22, h: 34 });
              this.pending.push({ t: 0.48, h: 72 });
              this.state = 'idle';
              this.cd = 1.1 - ph * 0.1;
            } else if (atk === 'super') {
              [14, 72, 14, 72, 14].forEach((h, i) => this.pending.push({ t: i * 0.2, h: h, speed: 300 }));
              this.state = 'idle';
              this.cd = 1.4;
            } else if (atk === 'fan') {
              [-80, 0, 80].forEach((vy) => this.fireBolt(34, 230, vy));
              this.state = 'idle';
              this.cd = 1;
            } else if (atk === 'combo') {
              this.dir = this.aimDir;
              this.face(this.dir);
              this.state = 'lunge';
              this.timer = 0.5;
              AH.Audio.play('swing');
            } else if (atk === 'leap') {
              this.dir = this.aimDir;
              this.face(this.dir);
              this.state = 'leap';
              this.vx = Phaser.Math.Clamp((player.x - s.x) / 0.62, -340, 340);
              this.vy = -430;
              this.struck = false;
              AH.Audio.play('jump');
            } else if (atk === 'upper') {
              this.dir = this.aimDir;
              this.face(this.dir);
              this.state = 'upper';
              this.vx = this.dir * 70;
              this.vy = -470;
              this.struck = false;
              AH.Audio.play('swing');
            } else {
              // charge (ground) or dash (air): a straight run at the player that ends against the wall
              this.dir = player.x < s.x ? -1 : 1;
              this.face(this.dir);
              this.state = 'charge';
              AH.Audio.play('boss');
            }
          }
          break;
        }
        case 'charge':
          s.setTexture(Math.floor(now / 90) % 2 ? this.tx.walk : this.tx.attack);
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
        case 'lunge':
          s.setTexture(this.tx.walk);
          s.x = Phaser.Math.Clamp(s.x + this.dir * 300 * dt, a.left + 40, a.right - 40);
          if (Math.abs(player.x - s.x) < 54 || this.timer <= 0 || s.x <= a.left + 40 || s.x >= a.right - 40) {
            this.state = 'strike';
            this.strikes = 0;
            this.timer = 0;
          }
          break;
        case 'strike':
          if (this.timer <= 0) {
            if (this.strikes >= 3) {
              if (this.hitLanded) { this.state = 'idle'; this.cd = 0.9 - this.phase * 0.1; } else this.whiff();
              break;
            }
            const i = this.strikes++;
            this.timer = 0.24;
            s.setTexture(i === 1 ? this.tx.kick : this.tx.attack);
            s.x = Phaser.Math.Clamp(s.x + this.dir * 10, a.left + 40, a.right - 40);
            AH.Audio.play('swing');
            // jab (high), low kick, jab: the kick can be jumped, the jabs ducked or blocked
            const x0 = this.dir < 0 ? s.x - 60 : s.x + 6;
            const box = i === 1 ? new Phaser.Geom.Rectangle(x0, a.floor - 40, 54, 34) : new Phaser.Geom.Rectangle(x0, a.floor - 66, 54, 30);
            if (this.meleeHit(player, box, 12)) break;
          }
          break;
        case 'leap':
        case 'upper': {
          this.vy += (this.state === 'upper' ? 1600 : GRAVITY) * dt;
          s.x = Phaser.Math.Clamp(s.x + this.vx * dt, a.left + 40, a.right - 40);
          s.y += this.vy * dt;
          s.setTexture(this.state === 'upper' && this.vy < 0 ? this.tx.upper : this.tx.jump);
          if (!this.struck) {
            const box = this.state === 'upper'
              ? new Phaser.Geom.Rectangle(this.dir < 0 ? s.x - 46 : s.x - 4, s.y - 104, 50, 74)
              : new Phaser.Geom.Rectangle(s.x - 30, s.y - 52, 60, 52);
            if (this.meleeHit(player, box, this.state === 'upper' ? 22 : 20)) break;
          }
          if (s.y >= a.floor && this.vy > 0) {
            s.y = a.floor;
            this.vx = this.vy = 0;
            this.scene.cameras.main.shake(110, 0.008);
            this.scene.burst(s.x, a.floor - 4, 'spark_y', 8, 140);
            if (this.state === 'leap' && this.phase === 3) {
              // round 3 landing: shockwaves along the floor in both directions
              const keep = this.aimDir;
              [-1, 1].forEach((d) => { this.aimDir = d; this.fireBolt(8, 260); });
              this.aimDir = keep;
            }
            if (this.hitLanded) { this.state = 'idle'; this.cd = 0.8; } else this.whiff(this.state === 'upper' ? 'UPPERCUT MISSED - PUNISH!' : 'JUMP KICK MISSED - PUNISH!');
          }
          break;
        }
        case 'recover':
          s.setTexture(this.tx.bob);
          s.setAngle(Math.sin(now / 90) * 3);
          if (this.timer <= 0) { s.setAngle(0); this.state = 'idle'; this.cd = 0.8; this.streak = 0; }
          break;
        case 'stunned':
          s.setTexture(this.tx.stun);
          s.setAngle(Math.sin(now / 60) * 2);
          if (this.timer <= 0) {
            this.stunned = false;
            s.setAngle(0);
            this.state = 'idle';
            this.cd = 0.7;
            this.streak = 0;
          }
          break;
        default: break;
      }
      // Let the final volley travel before opening a clean damage window.
      if (this.state === 'idle' && this.volleys >= 3 && this.cd <= 0.15) this.stun();
      for (let i = this.pending.length - 1; i >= 0; i--) {
        this.pending[i].t -= dt;
        if (this.pending[i].t <= 0) { this.fireBolt(this.pending[i].h, this.pending[i].speed || 230); this.pending.splice(i, 1); }
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

    playerRect(player) {
      const pr = player.body;
      return new Phaser.Geom.Rectangle(pr.x, pr.y, pr.width, pr.height);
    }

    // one melee strike: a facing MFA Shield blocks it (2 blocks stagger the boss), otherwise it hurts
    meleeHit(player, box, damage) {
      if (player.health <= 0 || !Phaser.Geom.Intersects.RectangleToRectangle(box, this.playerRect(player))) return false;
      this.struck = true;
      if (player.shielding && this.facesBoss(player)) {
        AH.Audio.play('block');
        this.blocks += 1;
        this.scene.addScore(100, player.x, player.y - 40);
        this.scene.burst(player.x + player.facing * 16, player.y - 20, 'spark_c', 8, 140);
        if (player.sprite && player.sprite.body) player.sprite.body.setVelocityX(-player.facing * 180);
        if (this.blocks >= 2) { this.stun('PARRIED! BOSS STAGGERED - BLAST IT!'); return true; }
        return false;
      }
      if (player.invuln > 0 || player.guardT > 0) return false;
      AH.Audio.play('punch');
      this.hitLanded = true;
      player.hurt(damage, this.sprite.x);
      return false;
    }

    checkCharge(player) {
      if (player.invuln > 0 || player.health <= 0) return;
      if (!Phaser.Geom.Intersects.RectangleToRectangle(this.rect(), this.playerRect(player))) return;
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
      const st = this.state;
      if (this.vulnerable || st === 'charge' || st === 'lunge' || st === 'strike' || st === 'leap' || st === 'upper') return;
      if (player.invuln > 0 || player.guardT > 0 || player.health <= 0) return;
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.rect(), this.playerRect(player))) {
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
      const prect = this.playerRect(player);
      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.s.x += b.vx * dt;
        b.s.y += b.vy * dt;
        let gone = b.s.x < this.arena.left - 30 || b.s.x > this.arena.right + 30 || b.s.y < -20 || b.s.y > 380;
        let blocked = false;
        const br = new Phaser.Geom.Rectangle(b.s.x - 11, b.s.y - 6, 22, 12);
        if (!gone && Phaser.Geom.Intersects.RectangleToRectangle(br, prect) && player.health > 0) {
          if (player.shielding && (b.s.x - player.x) * player.facing > 0) {
            gone = true;
            AH.Audio.play('block');
            this.scene.burst(b.s.x, b.s.y, 'spark_c', 8, 140);
            this.blocks += 1;
            this.scene.addScore(100, b.s.x, b.s.y - 10);
            blocked = this.blocks >= 2 && !this.vulnerable && this.state === 'idle';
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
