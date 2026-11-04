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
      this.power = mk(60, 327, 'AZURE BLAST READY', '#7fe8ff', { scale: 1 });
      const full = 'LEVEL ' + levelId + ' - ' + levelName.toUpperCase();
      const sc = full.length * 12 > 380 ? 1 : 2;
      mk(630, 328, 'MICROSOFT AZURE HEROES 2027', '#9a8cff', { scale: 1, ox: 1 });
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
      this.power.setText(ready ? 'AZURE BLAST READY' : 'BLAST CHARGING...').setColor(ready ? '#7fe8ff' : '#c9a0ff');

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
      this.risk.setVisible(!!bs).setAlpha(Math.floor(this.t * 3) % 2 ? 0.55 : 1);
      this.stun.setVisible(!!bs && bs.stunned);
      if (bs) {
        const w = 616;
        b.fillStyle(0x1a0a2a, 1).fillRect(12, 70, w, 14);
        b.fillStyle(bs.stunned ? 0xffd23f : 0xff2a4a, 1).fillRect(12, 70, Math.round(w * bs.hp / bs.max), 14);
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
    fmtTime: fmtTime,
    pad: pad
  };
})();
