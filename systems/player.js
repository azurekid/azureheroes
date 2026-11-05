/* Player: movement, double jump, flight boost, Azure Blast, MFA Shield. Matches the game-contract Player API. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const GRAV = 1100, RUN = 190, JUMP_V = -440, DJUMP_V = -400, FLY_SPEED = 190, WALL_V = -420, WALL_SLIDE = 105, BIKE_JUMP = 1.1;
  AH.BLAST_COST = 20;
  AH.Weapons = {
    azure: { name: 'AZURE BLAST', cost: 20 },
    spread: { name: 'EVENT GRID SPREAD', cost: 24 },
    pierce: { name: 'COSMOS BEAM', cost: 26 }
  };
  const CHARGE_TIME = 1.2;

  AH.Player = class Player {
    constructor(scene, x, y, mode) {
      this.scene = scene;
      this.mode = mode;
      this.pre = AH.Art.buildHero(scene, AH.Gold ? AH.Gold.look(AH.Art.lookOf(AH.Save.data)) : AH.Art.lookOf(AH.Save.data));
      this.speedMul = 1;
      this.defender = 0;
      this.riding = false;
      this.sprite = scene.physics.add.sprite(x, y, this.pre + (mode === 'fly' ? 'fly' : 'idle')).setDepth(50);
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
      this.ducking = false;
      this.sliding = false;
      this.slideT = 0;
      this.slideCd = 0;
      this.slideHits = new Set();
      this.weapon = 'azure';
      this.weaponTime = 0;
      this.charge = 0;
      this.charging = false;
      this.fireBlocked = false;
      this.chargeFx = scene.add.image(x, y, 'charge_fx').setDepth(52).setVisible(false);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get body() { return this.sprite.body; }

    jump() {
      if (this.mode === 'fly') return false;
      this.sprite.setVelocityY(JUMP_V * (this.riding ? BIKE_JUMP : 1));
      this.jumps = 1;
      this.coyote = 0;
      this.onGround = false;
      AH.Audio.play('jump');
      return true;
    }

    // Wall jump: kick up and away from the wall. Holding toward the wall again climbs it.
    wallJump() {
      if (this.mode === 'fly' || !this.wallDir) return false;
      const s = this.sprite, side = this.wallDir;
      s.setVelocity(-side * 170, WALL_V);
      this.facing = -side;
      this.jumps = 1;
      this.wallT = 0;
      this.wallLock = 0.12;
      this.kickDir = -side;
      this.wallJumps = (this.wallJumps || 0) + 1;
      AH.Audio.play('jump');
      this.scene.burst(this.x + side * 8, this.y + 10, 'spark_c', 5, 80, 0.25);
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

    azureBlast(charge = 0) {
      const weapon = this.weapon || 'azure', spec = AH.Weapons[weapon];
      charge = Math.max(0, Math.min(1, charge));
      const cost = spec.cost + Math.round(20 * charge);
      if (this.boost < spec.cost || this.blastCd > 0) return false;
      charge = Math.min(charge, Math.max(0, (this.boost - spec.cost) / 20));
      this.boost -= Math.min(cost, this.boost);
      this.blastCd = 0.16 + charge * 0.2;
      this.attackT = 0.22;
      // low shots rise with charge so the bigger blast clears the floor it is fired along
      this.scene.spawnBlast(this.x + this.facing * 20, this.ducking ? this.body.bottom - 10 - 5 * charge : this.y - (this.mode === 'fly' ? 0 : 6), this.facing, { weapon, charge });
      AH.Audio.play('blast');
      return true;
    }

    equipWeapon(kind) {
      this.cancelCharge();
      this.weapon = kind;
      this.weaponTime = 25;
    }

    cancelCharge() {
      this.charge = 0;
      this.charging = false;
      this.fireBlocked = true;
      if (this.chargeFx) this.chargeFx.setVisible(false);
    }

    updateWeapon(dt, cmd) {
      if (this.weaponTime > 0) {
        this.weaponTime = Math.max(0, this.weaponTime - dt);
        if (!this.weaponTime) { this.weapon = 'azure'; this.cancelCharge(); }
      }
      const held = !!cmd.fireHeld;
      if (this.shielding || this.scene.warping) this.cancelCharge();
      else if (!this.fireBlocked) {
        if (held) {
          this.charging = true;
          this.charge = Math.min(1, (this.charge || 0) + dt / CHARGE_TIME);
        } else if (this.charging || cmd.fire) {
          this.azureBlast(this.charging && this.charge >= 0.3 ? this.charge : 0);
          this.charge = 0;
          this.charging = false;
        }
      }
      if (!held) this.fireBlocked = false;
      if (this.chargeFx) {
        const low = this.ducking ? 13 : -6;
        this.chargeFx.setVisible(this.charging && this.charge >= 0.3)
          .setPosition(this.x + this.facing * 21, this.y + low)
          .setScale((0.45 + this.charge * 0.65) / AH.Art.D)
          .setAlpha(this.charge >= 1 ? 0.9 : 0.55);
      }
    }

    // run mode: dx/dy ignored except dy<0 = thrust. fly mode: free movement vector.
    fly(dx, dy, dt, boosting) {
      const v = this.sprite.body;
      if (this.mode === 'fly') {
        const sp = FLY_SPEED * (boosting ? 1.5 : 1) * this.speedMul;
        const len = Math.hypot(dx, dy) || 1;
        const sc = this.scene.scrollSpeed || 0;
        v.setVelocity((dx / len) * sp * (dx || dy ? 1 : 0) + sc, (dy / len) * sp * (dx || dy ? 1 : 0));
        return true;
      }
      v.setVelocityY(Math.max(v.velocity.y - 2600 * dt, -230));
      return true;
    }

    hurt(amount, srcX) {
      if (this.invuln > 0 || this.defender > 0 || this.health <= 0) return false;
      this.cancelCharge();
      if (this.riding) {
        // a hit while on the bike only knocks the hero off it
        this.invuln = 1.1;
        this.scene.dismount();
        this.sprite.setVelocity((this.x < srcX ? -1 : 1) * 160, -260);
        AH.Audio.play('hit');
        return true;
      }
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
      this.setDucking(false);
      this.sliding = false;
      this.slideT = this.slideCd = 0;
      this.sprite.setPosition(x, y);
      this.sprite.setVelocity(0, 0);
      this.health = 100;
      this.boost = 100;
      this.weapon = 'azure';
      this.weaponTime = 0;
      this.cancelCharge();
      this.invuln = 1.6;
      this.jumps = 0;
    }

    setDucking(value) {
      if (this.ducking === value) return;
      const b = this.body;
      const bottom = b.bottom;
      b.setSize(14 * AH.Art.D, (value ? 20 : 40) * AH.Art.D, false);
      b.setOffset(9 * AH.Art.D, (value ? 27 : 7) * AH.Art.D);
      // Resizing is not movement; keep Arcade's post-update delta unchanged.
      const dy = bottom - b.height - b.y;
      b.position.y += dy;
      b.prev.y += dy;
      b.prevFrame.y += dy;
      b.updateCenter();
      this.ducking = value;
    }

    canStand() {
      const b = this.body;
      return !this.scene.rects.some((r) => r.active && !r.hazard &&
        b.right > r.x && b.x < r.x + r.w &&
        b.bottom - 40 < r.y + r.h && b.y > r.y);
    }

    update(dt, cmd) {
      const s = this.sprite, b = s.body;
      this.invuln = Math.max(0, this.invuln - dt);
      this.guardT = Math.max(0, (this.guardT || 0) - dt);
      this.defender = Math.max(0, this.defender - dt);
      this.blastCd = Math.max(0, this.blastCd - dt);
      this.attackT = Math.max(0, this.attackT - dt);
      this.onGround = b.blocked.down || b.touching.down;
      this.slideT = Math.max(0, this.slideT - dt);
      this.slideCd = Math.max(0, this.slideCd - dt);
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
        s.setTexture(this.attackT > 0 ? this.pre + 'attack' : this.pre + 'fly');
        if (this.attackT > 0) s.setAngle(0);
        s.setFlipX(false);
      } else {
        if (this.onGround) { this.jumps = 0; this.coyote = 0.1; } else this.coyote -= dt;
        let dir = (cmd.right ? 1 : 0) - (cmd.left ? 1 : 0);
        this.wallLock = Math.max(0, (this.wallLock || 0) - dt);
        if (this.wallLock > 0) dir = this.kickDir;
        if (dir !== 0) this.facing = dir;
        // wall slide: airborne and pushing into a solid side wall slows the fall and arms a wall jump
        const wallR = b.blocked.right || b.touching.right, wallL = b.blocked.left || b.touching.left;
        const pushWall = !this.onGround && !this.riding && !this.ducking && !cmd.shield && this.wallLock <= 0 ?
          (wallR && dir > 0 ? 1 : wallL && dir < 0 ? -1 : 0) : 0;
        if (pushWall) { this.wallDir = pushWall; this.wallT = 0.14; }
        else { this.wallT = Math.max(0, (this.wallT || 0) - dt); if (this.onGround) this.wallT = 0; }
        this.wallSliding = !!pushWall && b.velocity.y > 0;
        if (this.wallSliding) {
          b.setVelocityY(Math.min(b.velocity.y, WALL_SLIDE));
          if (Math.random() < 0.3) this.scene.burst(this.x + pushWall * 8, this.y + 14, 'spark_y', 1, 30, 0.2);
        }
        // E raises the MFA Shield (ground or air); holding DOWN while standing still is a crouch guard with the shield low
        const held = !!cmd.shield && !this.riding;
        // pressing or holding F lowers the crouch guard so low (charged) shots can fire
        const guard = !!cmd.down && !dir && this.onGround && !this.riding && this.slideT <= 0 && !cmd.fire && !cmd.fireHeld && !this.charging;
        if (cmd.down && dir && this.onGround && !this.riding && !held && this.slideCd <= 0) {
          this.slideT = 0.42;
          this.slideCd = 0.85;
          this.slideHits.clear();
        }
        this.sliding = this.slideT > 0 && this.onGround && !this.riding && !held;
        const wantDuck = !this.riding && !held && (this.sliding || (cmd.down && this.onGround));
        this.setDucking(wantDuck || (this.ducking && !this.canStand()));
        this.shielding = held || guard;
        if (this.ducking && !guard) this.shielding = false;
        const speed = (this.shielding ? RUN * 0.2 : this.ducking ? RUN * 0.32 : RUN) * this.speedMul;
        const target = this.sliding ? this.facing * 310 : dir * speed;
        const vx = b.velocity.x;
        const acc = this.onGround ? (this.riding ? 3000 : 2400) : 1500;
        const step = acc * dt;
        s.setVelocityX(Math.abs(target - vx) <= step ? target : vx + Math.sign(target - vx) * step);

        if (cmd.jumpPressed && !this.shielding && !this.ducking) {
          if (this.onGround || this.coyote > 0) this.jump();
          else if (this.wallT > 0) this.wallJump();
          else this.doubleJump();
        }
        if (cmd.boost && this.boost > 1 && !this.shielding && !this.ducking) {
          this.boosting = true;
          this.fly(0, -1, dt);
          this.boost = Math.max(0, this.boost - 30 * dt);
          if (Math.random() < 0.6) this.scene.burst(this.x - this.facing * 6, this.y + 22, 'spark_y', 1, 60, 0.3);
        }

        if (this.ducking) s.setTexture(this.pre + (this.sliding ? 'slide' : 'duck'));
        else if (this.attackT > 0) s.setTexture(this.pre + 'attack');
        else if (this.shielding) s.setTexture(this.pre + 'shield');
        else if (this.riding && this.onGround) s.setTexture(this.pre + 'idle');
        else if (!this.onGround) s.setTexture(this.pre + 'jump');
        else if (Math.abs(b.velocity.x) > 20) {
          this.runT += dt * 12;
          s.setTexture(this.pre + 'run' + (Math.floor(this.runT) % 4));
        } else s.setTexture(this.pre + 'idle');
        s.setFlipX(this.wallSliding ? this.wallDir > 0 : this.facing < 0);
        s.setAngle(0);
      }

      this.updateWeapon(dt, cmd);
      if (!this.boosting) this.boost = Math.min(100, this.boost + 14 * dt);
      s.setAlpha(this.invuln > 0 && Math.floor(this.invuln * 14) % 2 ? 0.35 : 1);
      const showShield = this.shielding;
      const low = this.ducking ? 13 : 0;
      this.shieldFx.setVisible(showShield).setPosition(s.x + this.facing * 17, s.y + 2 + low).setFlipX(this.facing < 0);
      this.shieldFx.setScale(this.shieldFx.scaleX, Math.abs(this.shieldFx.scaleX) * (this.ducking ? 0.6 : 1));
    }
  };
})();
