/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.font.27'] = function (C) {
    const { D, E, H, R, cv, ell, glowRect, lg, poly } = C;

    Object.assign(C, { glyph, drawText, msLogo, txt, txtW, carBody, wheels });
    const FONT = {
        A: '.###./#...#/#...#/#####/#...#/#...#/#...#', B: '####./#...#/#...#/####./#...#/#...#/####.',
        C: '.####/#..../#..../#..../#..../#..../.####', D: '####./#...#/#...#/#...#/#...#/#...#/####.',
        E: '#####/#..../#..../####./#..../#..../#####', F: '#####/#..../#..../####./#..../#..../#....',
        G: '.####/#..../#..../#.###/#...#/#...#/.###.', H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
        I: '.###./..#../..#../..#../..#../..#../.###.', J: '..###/...#./...#./...#./...#./#..#./.##..',
        K: '#...#/#..#./#.#../##.../#.#../#..#./#...#', L: '#..../#..../#..../#..../#..../#..../#####',
        M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
        O: '.###./#...#/#...#/#...#/#...#/#...#/.###.', P: '####./#...#/#...#/####./#..../#..../#....',
        Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', R: '####./#...#/#...#/####./#.#../#..#./#...#',
        S: '.####/#..../#..../.###./....#/....#/####.', T: '#####/..#../..#../..#../..#../..#../..#..',
        U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.', V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
        W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#', X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
        Y: '#...#/#...#/.#.#./..#../..#../..#../..#..', Z: '#####/....#/...#./..#../.#.../#..../#####',
        0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', 1: '..#../.##../..#../..#../..#../..#../.###.',
        2: '.###./#...#/....#/...#./..#../.#.../#####', 3: '####./....#/....#/.###./....#/....#/####.',
        4: '#...#/#...#/#...#/#####/....#/....#/....#', 5: '#####/#..../####./....#/....#/#...#/.###.',
        6: '.###./#..../#..../####./#...#/#...#/.###.', 7: '#####/....#/...#./..#../.#.../.#.../.#...',
        8: '.###./#...#/#...#/.###./#...#/#...#/.###.', 9: '.###./#...#/#...#/.####/....#/....#/.###.',
        ':': '...../..#../..#../...../..#../..#../.....', '%': '##..#/##..#/...#./..#../.#.../#..##/#..##',
        '.': '...../...../...../...../...../.##../.##..', '-': '...../...../...../#####/...../...../.....',
        '!': '..#../..#../..#../..#../..#../...../..#..', '/': '....#/....#/...#./..#../.#.../#..../#....',
        '+': '...../..#../..#../#####/..#../..#../.....', '?': '.###./#...#/....#/...#./..#../...../..#..',
        ',': '...../...../...../...../.##../..#../.#...', "'": '..#../..#../.#.../...../...../...../.....',
        '<': '...#./..#../.#.../#..../.#.../..#../...#.', '>': '.#.../..#../...#./....#/...#./..#../.#...',
        '^': '..#../.#.#./#...#/...../...../...../.....', '=': '...../...../#####/...../#####/...../.....',
        '(': '...#./..#../.#.../.#.../.#.../..#../...#.', ')': '.#.../..#../...#./...#./...#./..#../.#...',
        '*': '...../#.#.#/.###./#####/.###./#.#.#/.....', '_': '...../...../...../...../...../...../#####', ' ': '...../...../...../...../...../...../.....'
      };

    const glyphCache = {};

    function glyph(ch) {
        if (glyphCache[ch]) return glyphCache[ch];
        const s = FONT[ch] || FONT['?'];
        return (glyphCache[ch] = s.split('/'));
      }

    function drawText(str, scale, color, shadow) {
        const sh = shadow ? scale : 0;
        const c = cv(Math.max(1, str.length * 6 * scale + sh), 7 * scale + sh);
        const g = c.getContext('2d');
        g.imageSmoothingEnabled = false;
        for (let pass = shadow ? 0 : 1; pass < 2; pass++) {
          g.fillStyle = pass === 0 ? shadow : color;
          const off = pass === 0 ? sh : 0;
          for (let i = 0; i < str.length; i++) {
            const rows = glyph(str[i]);
            for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) {
              if (rows[y][x] === '#') g.fillRect((i * 6 + x) * scale + off, y * scale + off, scale, scale);
            }
          }
        }
        return c;
      }

    let ptId = 0;

    AH.PixelText = class PixelText {
        constructor(scene, x, y, str, o) {
          this.scene = scene;
          this.o = Object.assign({ scale: 2, color: '#ffffff', shadow: '#1a0a40', ox: 0, oy: 0 }, o || {});
          this.img = scene.add.image(x, y, '__DEFAULT').setOrigin(this.o.ox, this.o.oy);
          this.key = null;
          this.str = null;
          this.setText(str);
          scene.events.once('shutdown', () => this.destroy());
        }
        setText(s) {
          s = String(s);
          if (s === this.str) return this;
          this.str = s;
          this.redraw();
          return this;
        }
        setColor(c) {
          if (c === this.o.color) return this;
          this.o.color = c;
          this.redraw();
          return this;
        }
        redraw() {
          if (!this.img || !this.img.scene) return;
          const key = 'pt' + ptId++;
          this.scene.textures.addCanvas(key, drawText(this.str.toUpperCase(), this.o.scale, this.o.color, this.o.shadow));
          this.img.setTexture(key);
          if (this.key && this.scene.textures.exists(this.key)) this.scene.textures.remove(this.key);
          this.key = key;
        }
        get width() { return this.img.width; }
        get height() { return this.img.height; }
        setPosition(x, y) { this.img.setPosition(x, y); return this; }
        setScrollFactor(v) { this.img.setScrollFactor(v); return this; }
        setDepth(v) { this.img.setDepth(v); return this; }
        setVisible(v) { this.img.setVisible(v); return this; }
        setAlpha(v) { this.img.setAlpha(v); return this; }
        setOrigin(a, b) { this.img.setOrigin(a, b); return this; }
        setScale(v) { this.img.setScale(v); return this; }
        setInteractive(o) { this.img.setInteractive(o); return this; }
        on(e, fn) { this.img.on(e, fn); return this; }
        destroy() {
          if (this.key && this.scene.textures && this.scene.textures.exists(this.key)) this.scene.textures.remove(this.key);
          this.key = null;
          if (this.img) { this.img.destroy(); this.img = null; }
        }
      };

    const MSC = ['#f25022', '#7fba00', '#00a4ef', '#ffb900'];

    function msLogo(g, x, y, s) {
        const q = s * 0.47, gp = s * 0.06;
        [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (p, i) { g.fillStyle = MSC[i]; g.fillRect(x + p[0] * (q + gp), y + p[1] * (q + gp), q, q); });
      }

    function txt(g, str, x, y, scale, col, shadow) {
        const c = drawText(str, 1, col, shadow || null);
        g.imageSmoothingEnabled = false;
        g.drawImage(c, x, y, c.width * scale, c.height * scale);
      }

    function txtW(str, scale) { return str.length * 6 * scale; }

    function carBody(g, w, h, top, bot, roofX0, roofX1, roofY, glass) {
        poly(g, [[1, h - 9], [3, h - 13], [roofX0, h - 13], [roofX0 + 4, roofY], [roofX1 - 3, roofY], [roofX1, h - 13], [w - 3, h - 12], [w - 1, h - 9], [w - 1, h - 5], [1, h - 5]], lg(g, 0, roofY, 0, h - 4, [[0, top], [1, bot]]));
        poly(g, [[roofX0 + 2, h - 13], [roofX0 + 5, roofY + 1.6], [roofX1 - 4, roofY + 1.6], [roofX1 - 1.4, h - 13]], glass || 'rgba(160,210,255,0.85)');
        g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(3, h - 12.4, w - 6, 0.6);
        ell(g, 1.8, h - 9.4, 1.2, 1, '#fff6c0'); glowRect(g, '#fff6c0', -2, h - 12, 6, 5); ell(g, w - 1.6, h - 9, 1, 1.2, '#ff2a4a');
      }

    function wheels(g, xs, y, r) { xs.forEach(function (x) { ell(g, x, y, r, r, '#0a0614'); ell(g, x, y, r * 0.45, r * 0.45, '#b8b8d8'); }); }

    Object.assign(C, { FONT, glyphCache, ptId, MSC });
  };
})();
