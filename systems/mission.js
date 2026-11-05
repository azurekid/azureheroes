/* Run-local objectives and gem collection. No storage or account access. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  AH.Mission = class Mission {
    constructor(level) {
      this.mode = level.mode;
      this.objectives = (level.mission?.objectives || []).map((def) => ({ def, done: false, progress: 0 }));
      this.gems = (level.mission?.gems || []).map((def) => ({ def, done: false }));
      this.quota = level.mission?.gemQuota || 0;
      this.enabled = !!level.mission;
    }

    get cacheReady() { return this.objectives.filter((item) => item.def.kind === 'cache' && item.def.required).every((item) => item.done); }
    get gemCount() { return this.gems.filter((item) => item.done).length; }
    get ready() { return this.gemCount >= this.quota && this.objectives.every((item) => !item.def.required || item.done); }

    pending() {
      const required = this.objectives.filter((item) => item.def.required && !item.done);
      if (this.gemCount < this.quota) required.push(...this.gems.filter((item) => !item.done && item.def.zone === undefined));
      return required.sort((a, b) => a.def.x - b.def.x);
    }

    scrollLimit(desired) {
      const target = this.pending()[0];
      return target ? Math.min(desired, Math.max(0, target.def.x - 350)) : desired;
    }

    next() {
      const required = this.objectives.find((item) => item.def.required && !item.done);
      if (required) return required;
      if (this.gemCount < this.quota) return this.gems.find((item) => !item.done && item.def.zone === undefined);
      return null;
    }

    snapshot(x = 0) {
      if (!this.enabled) return null;
      const required = this.objectives.filter((item) => item.def.required), next = this.next();
      const direction = next ? Math.abs(next.def.x - x) < 70 ? 'NEAR' : next.def.x > x ? 'RIGHT' : 'LEFT' : '';
      let action = next?.def.label || 'FIND A GEM';
      if (next?.def.kind === 'relay') action = this.mode === 'fly' ? 'BLAST RELAY' : 'HOLD SHIELD AT RELAY';
      if (next?.progress) action += ' ' + Math.floor(next.progress * 100) + '%';
      return { done: required.filter((item) => item.done).length, total: required.length,
        gems: this.gemCount, quota: this.quota,
        bonus: this.objectives.filter((item) => !item.def.required && item.done).length,
        ready: this.ready, next: this.ready ? 'BOSS ACCESS GRANTED - EXTRA GEMS OPTIONAL' : action + ' ' + direction };
    }

    build(scene) {
      for (const item of [...this.objectives, ...this.gems]) {
        const def = item.def, gem = !def.kind;
        item.sprite = scene.add.image(def.x, def.y, gem ? 'mission_gem' : 'mission_' + def.kind).setDepth(28);
        item.label = new AH.PixelText(scene, def.x, def.y - (gem ? 21 : 30),
          gem ? 'GEM' : def.label, { scale: 1, color: gem ? '#ff7ad9' : '#7fe8ff', ox: 0.5 }).setDepth(29);
        scene.tweens.add({ targets: item.sprite, alpha: gem ? 0.6 : 0.8, yoyo: true, repeat: -1, duration: gem ? 800 : 1100 });
      }
      if (this.enabled && scene.L.boss) {
        this.accessLabel = new AH.PixelText(scene, scene.L.boss.trigger - 70,
          (scene.L.boss.floor || 250) - 72, 'BOSS ACCESS LOCKED', { scale: 1, color: '#ffb060', ox: 0.5 }).setDepth(29);
      }
    }

    complete(item, scene) {
      if (item.done) return false;
      item.done = true;
      item.progress = 1;
      if (item.sprite) item.sprite.setVisible(false);
      if (item.label) item.label.setVisible(false);
      const gem = !item.def.kind;
      scene.addScore(gem ? 750 : item.def.required ? 1000 : 1500, item.def.x, item.def.y - 20);
      scene.toast(gem ? 'AZURE GEM ' + this.gemCount + ' FOUND - ' + this.quota + ' REQUIRED'
        : item.def.kind === 'cache' ? 'DEPLOYMENT KEY FOUND - SECURE THE RELAY' : item.def.tip);
      AH.Audio.play(gem ? 'secret' : 'unlock');
      return true;
    }

    update(dt, player, scene) {
      if (!this.enabled || scene.warping || player.health <= 0) return;
      if (this.accessLabel) this.accessLabel.setText(this.ready ? 'BOSS ACCESS GRANTED' : 'BOSS ACCESS LOCKED')
        .setColor(this.ready ? '#4dff7a' : '#ffb060');
      const body = player.body, rect = { x: body.x, y: body.y, w: body.width, h: body.height };
      for (const item of [...this.objectives, ...this.gems]) {
        if (item.done) continue;
        const def = item.def;
        const inZone = def.zone === undefined ? !scene.inPipe && !scene.inBonus
          : scene.inPipe && scene.L.pipeZones[def.zone] === scene.inPipe;
        if (!inZone) continue;
        const near = overlaps(rect, { x: def.x - 22, y: def.y - 22, w: 44, h: 44 });
        if (!def.kind || def.kind === 'cache') {
          if (near) this.complete(item, scene);
          continue;
        }
        const active = near && (def.kind === 'relay'
          ? this.mode !== 'fly' && this.cacheReady && player.onGround && player.shielding
          : this.mode === 'fly' || player.ducking && player.onGround);
        item.progress = Math.max(0, Math.min(1, item.progress + (active ? dt / (def.kind === 'relay' ? 1.5 : 1) : -dt * 0.5)));
        if (near && item.label) item.label.setText(def.kind === 'relay'
          ? !this.cacheReady ? 'FIND DEPLOYMENT KEY FIRST' : this.mode === 'fly' ? 'F: BLAST RELAY' : 'E: HOLD SHIELD ' + Math.floor(item.progress * 100) + '%'
          : this.mode === 'fly' ? 'SCAN' : 'S: DUCK TO SCAN ' + Math.floor(item.progress * 100) + '%');
        else if (item.label) item.label.setText(def.label);
        if (item.progress >= 1) this.complete(item, scene);
      }
    }

    hit(rect, scene) {
      if (this.mode !== 'fly' || !this.cacheReady) return false;
      const relay = this.objectives.find((item) => item.def.kind === 'relay' && !item.done &&
        overlaps(rect, { x: item.def.x - 18, y: item.def.y - 18, w: 36, h: 36 }));
      return relay ? this.complete(relay, scene) : false;
    }
  };
})();
