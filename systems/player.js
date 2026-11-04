/* Player: movement, double jump, flight boost, Azure Blast, MFA Shield. Matches the game-contract Player API. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const GRAV = 1100, RUN = 190, JUMP_V = -440, DJUMP_V = -400, FLY_SPEED = 190;
  AH.BLAST_COST = 20;

  AH.Player = class Player {
    constructor(scene, x, y, mode) {
      this.scene = scene;
      this.mode = mode;
      this.sprite = scene.physics.add.sprite(x, y, mode === 'fly' ? 'hero_fly' : 'hero_idle').setDepth(50);
      const b = this.sprite.body;
      if (mode === 'fly') {
        b.setAllowGravity(false);
        b.setSize(24 * AH.Art.D, 14 * AH.Art.D);
        b.setOffset(4 * AH.Art.D, 17 * AH.Art.D);
      } else {
        b.setGravityY(GRAV - scene.physics.world.gravity.y);
        b.setSize(14 * AH.Art.D, 40 * AH.Art.D);
        b.setOffset(9 * AH.Art.D, 7 * AH.Art.D);
        b.setMaxVelocity(400, 720);
      }
      this.shieldFx = scene.add.image(x, y, 'shield_fx').setDepth(51).setVisible(false);
      this.health = 100;
      this.mfa = 0;
      this.credits = 0;
      this.boost = 100;
      this.facing = 1;
      this.jumps = 0;
      this.coyote = 0;
      this.invuln = 0;
      this.attackT = 0;
      this.blastCd = 0;
      this.runT = 0;
      this.shielding = false;
      this.boosting = false;
      this.onGround = false;
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get body() { return this.sprite.body; }

    jump() {
      if (this.mode === 'fly') return false;
      this.sprite.setVelocityY(JUMP_V);
      this.jumps = 1;
      this.coyote = 0;
      this.onGround = false;
      AH.Audio.play('jump');
      return true;
    }

    doubleJump() {
      if (this.mode === 'fly' || this.jumps >= 2 || this.onGround) return false;
      this.sprite.setVelocityY(DJUMP_V);
      this.jumps = 2;
      AH.Audio.play('doubleJump');
      this.scene.burst(this.x, this.y + 22, 'spark_c', 8, 90);
      return true;
    }

    azureBlast() {
      if (this.boost < AH.BLAST_COST || this.blastCd > 0) return false;
      this.boost -= AH.BLAST_COST;
      this.blastCd = 0.3;
      this.attackT = 0.22;
      this.scene.spawnBlast(this.x + this.facing * 20, this.y - (this.mode === 'fly' ? 0 : 6), this.facing);
      AH.Audio.play('blast');
      return true;
    }

    // run mode: dx/dy ignored except dy<0 = thrust. fly mode: free movement vector.
    fly(dx, dy, dt, boosting) {
      const v = this.sprite.body;
      if (this.mode === 'fly') {
        const sp = FLY_SPEED * (boosting ? 1.5 : 1);
        const len = Math.hypot(dx, dy) || 1;
        const sc = this.scene.scrollSpeed || 0;
        v.setVelocity((dx / len) * sp * (dx || dy ? 1 : 0) + sc, (dy / len) * sp * (dx || dy ? 1 : 0));
        return true;
      }
      v.setVelocityY(Math.max(v.velocity.y - 2600 * dt, -230));
      return true;
    }

    hurt(amount, srcX) {
      if (this.invuln > 0 || this.health <= 0) return false;
      this.health = Math.max(0, this.health - amount);
      this.invuln = 1.1;
      const dir = this.x < srcX ? -1 : 1;
      if (this.mode === 'run') this.sprite.setVelocity(dir * 180, -220);
      AH.Audio.play('hit');
      this.scene.cameras.main.shake(120, 0.006);
      this.scene.burst(this.x, this.y, 'spark_y', 8, 140);
      return true;
    }

    respawn(x, y) {
      this.sprite.setPosition(x, y);
      this.sprite.setVelocity(0, 0);
      this.health = 100;
      this.boost = 100;
      this.invuln = 1.6;
      this.jumps = 0;
    }

    update(dt, cmd) {
      const s = this.sprite, b = s.body;
      this.invuln = Math.max(0, this.invuln - dt);
      this.blastCd = Math.max(0, this.blastCd - dt);
      this.attackT = Math.max(0, this.attackT - dt);
      this.onGround = b.blocked.down || b.touching.down;
      this.boosting = false;

      if (this.mode === 'fly') {
        const dx = (cmd.right ? 1 : 0) - (cmd.left ? 1 : 0);
        const dy = (cmd.down ? 1 : 0) - (cmd.up ? 1 : 0);
        const wantBoost = cmd.boost && this.boost > 1;
        this.boosting = wantBoost && (dx || dy);
        this.fly(dx, dy, dt, this.boosting);
        if (this.boosting) this.boost = Math.max(0, this.boost - 26 * dt);
        const cam = this.scene.cameras.main;
        const minX = cam.scrollX + 24, maxX = cam.scrollX + 616;
        if (s.x < minX) { s.x = minX; }
        if (s.x > maxX) { s.x = maxX; b.setVelocityX(Math.min(b.velocity.x, this.scene.scrollSpeed)); }
        s.y = Phaser.Math.Clamp(s.y, 66, 312);
        s.setAngle(Phaser.Math.Clamp((b.velocity.y / FLY_SPEED) * 18, -20, 20));
        s.setTexture(this.attackT > 0 ? 'hero_attack' : 'hero_fly');
        if (this.attackT > 0) s.setAngle(0);
        s.setFlipX(false);
        if (cmd.fire) this.azureBlast();
      } else {
        if (this.onGround) { this.jumps = 0; this.coyote = 0.1; } else this.coyote -= dt;
        this.shielding = !!cmd.shield && this.onGround;
        let dir = (cmd.right ? 1 : 0) - (cmd.left ? 1 : 0);
        if (dir !== 0) this.facing = dir;
        const speed = this.shielding ? RUN * 0.2 : RUN;
        const target = dir * speed;
        const vx = b.velocity.x;
        const acc = this.onGround ? 2400 : 1500;
        const step = acc * dt;
        s.setVelocityX(Math.abs(target - vx) <= step ? target : vx + Math.sign(target - vx) * step);

        if (cmd.jumpPressed && !this.shielding) {
          if (this.onGround || this.coyote > 0) this.jump();
          else this.doubleJump();
        }
        if (cmd.boost && this.boost > 1 && !this.shielding) {
          this.boosting = true;
          this.fly(0, -1, dt);
          this.boost = Math.max(0, this.boost - 30 * dt);
          if (Math.random() < 0.6) this.scene.burst(this.x - this.facing * 6, this.y + 22, 'spark_y', 1, 60, 0.3);
        }
        if (cmd.fire && !this.shielding) this.azureBlast();

        if (this.attackT > 0) s.setTexture('hero_attack');
        else if (this.shielding) s.setTexture('hero_shield');
        else if (!this.onGround) s.setTexture('hero_jump');
        else if (Math.abs(b.velocity.x) > 20) {
          this.runT += dt * 12;
          s.setTexture('hero_run' + (Math.floor(this.runT) % 4));
        } else s.setTexture('hero_idle');
        s.setFlipX(this.facing < 0);
        s.setAngle(0);
      }

      if (!this.boosting) this.boost = Math.min(100, this.boost + 14 * dt);
      s.setAlpha(this.invuln > 0 && Math.floor(this.invuln * 14) % 2 ? 0.35 : 1);
      const showShield = this.shielding;
      this.shieldFx.setVisible(showShield).setPosition(s.x + this.facing * 17, s.y + 2).setFlipX(this.facing < 0);
    }
  };
})();
