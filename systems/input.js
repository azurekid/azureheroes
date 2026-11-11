/* Keyboard + touch input, merged into one per-frame command object. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.Input = class Input {
    constructor(scene, opts) {
      this.scene = scene;
      this.opts = opts; // { fly, shield }
      const kb = scene.input.keyboard;
      this.k = kb.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE,F,SHIFT,E,P,R,M,N,ENTER,ESC,H,Q,J,K');
      kb.addCapture('SPACE,UP,DOWN,LEFT,RIGHT');
      this.t = { left: false, right: false, up: false, down: false, attack: false, boost: false, shield: false };
      this.tJump = false;
      this.tFire = false;
      this.tPause = false;
      this.tHelp = false;
      this.tPunch = false;
      this.tKick = false;
      this.buttons = [];
      const forced = /[?&]touch=1/.test(location.search);
      this.isTouch = forced || scene.sys.game.device.input.touch;
      if (this.isTouch) this.buildTouch();
      scene.events.once('shutdown', () => this.destroy());
    }

    addButton(label, key) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.dataset.action = key;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', 'false');
      const pointers = new Set();
      const set = (v) => {
        if (v) {
          if (key === 'jump') this.tJump = true;
          else if (key === 'punch') this.tPunch = true;
          else if (key === 'kick') this.tKick = true;
          else if (key === 'pause') this.tPause = true;
          else if (key === 'help') this.tHelp = true;
          else if (key === 'attack') { this.tFire = true; this.t.attack = true; } else this.t[key] = true;
        } else this.t[key] = false;
        button.setAttribute('aria-pressed', String(v));
      };
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        AH.Audio.init();
        pointers.add(event.pointerId);
        set(true);
      });
      const release = (event) => {
        pointers.delete(event.pointerId);
        if (!pointers.size) set(false);
      };
      for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
        button.addEventListener(event, release);
      const reset = () => { pointers.clear(); set(false); };
      this.dock.appendChild(button);
      this.buttons.push({ button, key, set, reset });
      return this.buttons[this.buttons.length - 1];
    }

    buildJoystick() {
      const stick = document.createElement('div');
      stick.id = 'touch-joystick';
      stick.setAttribute('role', 'group');
      stick.setAttribute('aria-label', this.opts.fly ? 'Flight joystick' : 'Movement joystick');
      stick.title = this.opts.fly ? 'DRAG TO FLY' : 'UP: JUMP - CENTRE THEN UP: DOUBLE JUMP - DOWN: DUCK';
      const thumb = document.createElement('span');
      thumb.className = 'joystick-thumb';
      thumb.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'joystick-label';
      label.textContent = this.opts.fly ? 'FLY' : 'MOVE';
      stick.appendChild(thumb);
      stick.appendChild(label);
      this.dock.appendChild(stick);
      this.joystick = stick;
      let pointer = null;
      const reset = () => {
        const captured = pointer;
        pointer = null;
        this.t.left = this.t.right = this.t.up = this.t.down = false;
        this.tJump = false;
        thumb.style.transform = 'translate(0px, 0px)';
        stick.dataset.active = 'false';
        if (captured !== null && stick.hasPointerCapture(captured)) stick.releasePointerCapture(captured);
      };
      const move = event => {
        if (event.pointerId !== pointer) return;
        event.preventDefault();
        const bounds = stick.getBoundingClientRect(), radius = bounds.width * 0.32;
        const dx = event.clientX - bounds.left - bounds.width / 2;
        const dy = event.clientY - bounds.top - bounds.height / 2;
        const length = Math.hypot(dx, dy), scale = length > radius ? radius / length : 1;
        const x = dx * scale / radius, y = dy * scale / radius;
        const heldUp = this.t.up;
        const axis = (value, held) => value >= (held ? 0.2 : 0.35);
        this.t.left = axis(-x, this.t.left);
        this.t.right = axis(x, this.t.right);
        this.t.up = axis(-y, this.t.up);
        this.t.down = axis(y, this.t.down);
        if (!this.opts.fly && this.t.up && !heldUp) this.tJump = true;
        thumb.style.transform = 'translate(' + dx * scale + 'px, ' + dy * scale + 'px)';
      };
      stick.addEventListener('pointerdown', event => {
        event.preventDefault();
        if (pointer !== null) return;
        AH.Audio.init();
        pointer = event.pointerId;
        stick.setPointerCapture(pointer);
        stick.dataset.active = 'true';
        move(event);
      });
      stick.addEventListener('pointermove', move);
      for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
        stick.addEventListener(event, e => { if (e.pointerId === pointer) reset(); });
      this.resetJoystick = reset;
      reset();
    }

    buildTouch() {
      this.dock = document.createElement('div');
      this.dock.id = 'touch-controls';
      this.dock.dataset.mode = this.opts.fly ? 'fly' : 'run';
      this.dock.setAttribute('role', 'group');
      this.dock.setAttribute('aria-label', 'Game controls');
      document.body.appendChild(this.dock);
      document.body.classList.add('touch-play');
      this.buildJoystick();
      const controls = [['BLAST', 'attack'], ['BOOST', 'boost'], ['PAUSE', 'pause'], ['HELP', 'help']];
      if (!this.opts.fly) controls.push(['PUNCH', 'punch'], ['KICK', 'kick']);
      if (this.opts.shield) controls.push(['SHIELD', 'shield']);
      controls.forEach(([label, key]) => this.addButton(label, key));
      this.releaseTouch = () => {
        this.resetJoystick();
        this.buttons.forEach(button => button.reset());
        this.tJump = this.tFire = this.tPunch = this.tKick = this.tPause = this.tHelp = false;
        if (this.scene.player) this.scene.player.cancelCharge();
      };
      this.onVisibility = () => { if (document.hidden) this.releaseTouch(); };
      window.addEventListener('blur', this.releaseTouch);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.onResize = () => {
        this.releaseTouch();
        const bounds = this.scene.sys.game.canvas.getBoundingClientRect();
        Object.assign(this.dock.style, {
          left: bounds.left + 'px', top: bounds.top + 'px',
          width: bounds.width + 'px', height: bounds.height + 'px'
        });
      };
      this.scene.scale.on('resize', this.onResize);
      this.scene.scale.setParentSize(this.scene.scale.parent.clientWidth, this.scene.scale.parent.clientHeight);
      this.onResize();
    }

    destroy() {
      if (!this.dock) return;
      this.releaseTouch();
      window.removeEventListener('blur', this.releaseTouch);
      document.removeEventListener('visibilitychange', this.onVisibility);
      this.scene.scale.off('resize', this.onResize);
      this.dock.remove();
      this.dock = null;
      document.body.classList.remove('touch-play');
      this.buttons = [];
      this.scene.scale.setParentSize(this.scene.scale.parent.clientWidth, this.scene.scale.parent.clientHeight);
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
        jumpHeld: k.SPACE.isDown || k.UP.isDown || k.W.isDown || (!this.opts.fly && t.up),
        fire: J(k.F) || this.tFire,
        fireHeld: k.F.isDown || t.attack,
        boost: k.SHIFT.isDown || t.boost,
        shield: k.E.isDown || t.shield,
        punch: J(k.J) || this.tPunch,
        kick: J(k.K) || this.tKick,
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
      this.tPunch = false;
      this.tKick = false;
      return cmd;
    }
  };
})();
