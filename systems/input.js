/* Keyboard + touch input, merged into one per-frame command object. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.Input = class Input {
    constructor(scene, opts) {
      this.scene = scene;
      this.opts = opts; // { fly, shield }
      const kb = scene.input.keyboard;
      this.k = kb.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE,F,SHIFT,E,P,R,M,N,ENTER,ESC,H,Q');
      kb.addCapture('SPACE,UP,DOWN,LEFT,RIGHT');
      this.t = { left: false, right: false, up: false, down: false, attack: false, boost: false, shield: false };
      this.tJump = false;
      this.tFire = false;
      this.tPause = false;
      this.tHelp = false;
      this.buttons = [];
      const forced = /[?&]touch=1/.test(location.search);
      this.isTouch = forced || scene.sys.game.device.input.touch;
      if (this.isTouch) this.buildTouch();
    }

    addButton(x, y, label, key, scale, o) {
      const s = this.scene;
      const img = s.add.image(x, y, 'btn').setScrollFactor(0).setDepth(1000).setScale((scale || 1) / AH.Art.D).setAlpha(0.85);
      const txt = new AH.PixelText(s, x, y, label, { scale: (o && o.ts) || 1, color: '#ffffff', ox: 0.5, oy: 0.5 }).setScrollFactor(0).setDepth(1001);
      img.setInteractive();
      const set = (v) => {
        if (v) {
          if (key === 'jump') this.tJump = true;
          else if (key === 'attack') { this.tFire = true; this.t.attack = true; } else this.t[key] = true;
        } else this.t[key] = false;
        img.setTexture(v ? 'btn_down' : 'btn');
      };
      img.on('pointerdown', () => { AH.Audio.init(); set(true); });
      img.on('pointerup', () => set(false));
      img.on('pointerout', () => set(false));
      img.on('pointerupoutside', () => set(false));
      this.buttons.push({ img, txt, key, set });
      return this.buttons[this.buttons.length - 1];
    }

    buildTouch() {
      const s = this.scene;
      s.input.addPointer(3);
      const o = this.opts;
      if (o.fly) {
        this.addButton(78, 224, '^', 'up', 1, { ts: 3 });
        this.addButton(36, 270, '<', 'left', 1, { ts: 3 });
        this.addButton(120, 270, '>', 'right', 1, { ts: 3 });
        this.addButton(78, 296, 'V', 'down', 0.85, { ts: 3 });
      } else {
        this.addButton(44, 288, '<', 'left', 1, { ts: 3 });
        this.addButton(116, 288, '>', 'right', 1, { ts: 3 });
        this.addButton(190, 288, 'DUCK', 'down', 0.85);
        this.addButton(592, 286, 'JUMP', 'jump', 1);
      }
      this.addButton(520, 296, 'BLAST', 'attack', 1);
      this.addButton(592, 222, 'BOOST', 'boost', 0.85);
      if (o.shield) this.addButton(520, 234, 'SHIELD', 'shield', 0.85);
      this.pauseBtn = new AH.PixelText(s, 630, 112, 'PAUSE', { scale: 1, color: '#c9a0ff', ox: 1 }).setScrollFactor(0).setDepth(1500);
      this.pauseBtn.setInteractive({ useHandCursor: true });
      this.pauseBtn.on('pointerdown', () => { this.tPause = true; });
      this.helpBtn = new AH.PixelText(s, 630, 126, 'HELP', { scale: 1, color: '#7fe8ff', ox: 1 }).setScrollFactor(0).setDepth(1500);
      this.helpBtn.setInteractive({ useHandCursor: true });
      this.helpBtn.on('pointerdown', () => { this.tHelp = true; });
    }

    destroy() {
      this.buttons.forEach((b) => { b.img.destroy(); b.txt.destroy(); });
      this.buttons = [];
    }

    read() {
      const k = this.k, t = this.t, J = Phaser.Input.Keyboard.JustDown;
      const space = J(k.SPACE), jumpKey = space || (!this.opts.fly && (J(k.UP) || J(k.W)));
      const cmd = {
        left: k.LEFT.isDown || k.A.isDown || t.left,
        right: k.RIGHT.isDown || k.D.isDown || t.right,
        up: k.UP.isDown || k.W.isDown || t.up || (this.opts.fly && k.SPACE.isDown),
        down: k.DOWN.isDown || k.S.isDown || t.down,
        jumpPressed: jumpKey || this.tJump,
        jumpHeld: k.SPACE.isDown || k.UP.isDown || k.W.isDown,
        fire: J(k.F) || this.tFire,
        fireHeld: k.F.isDown || t.attack,
        boost: k.SHIFT.isDown || t.boost,
        shield: !this.opts.fly && (k.E.isDown || t.shield),
        pause: J(k.P) || this.tPause,
        help: J(k.H) || this.tHelp,
        quit: J(k.Q),
        nav: J(k.LEFT) || J(k.A) ? -1 : J(k.RIGHT) || J(k.D) ? 1 : 0,
        restart: J(k.R),
        esc: J(k.ESC),
        mute: J(k.M),
        music: J(k.N),
        confirm: J(k.ENTER) || space
      };
      this.tJump = false;
      this.tFire = false;
      this.tPause = false;
      this.tHelp = false;
      return cmd;
    }
  };
})();
