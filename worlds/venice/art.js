/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['venice'] = AH.Worlds['venice'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['italynorth'] = content;
  content.parts.foreground_italynorth = () => ({
    shape: 'gable', detail: 'balcony', roof: '#40364b', wall: '#8a6562',
    light: '#d3b493', accent: '#9a888b'
  });
  content.parts.graffiti_italynorth = () => ({
    tags: ['CIAO VENEZIA', 'SOGNI SUI MURI', 'INSIEME'], paint: '#ffd279', accent: '#eb91bd'
  });

  AH.ArtModules.stages['worlds.venice.art.91'] = function (C) {
    const { FLAT, PAL, SKIES, ell, line, lit, makeSky, poly, reg2, rng } = C;

    Object.assign(C, { italyHouses, cypress });
    const IT_REGION = 'italynorth';

    const IT = {
        top: '#8b3c58', bot: '#412349', accent: '#ffc36b',
        win: ['#ffe6a0', '#ffad62', '#b9f4e5']
      };

    SKIES[IT_REGION] = {
        stops: [[0, '#170c39'], [0.3, '#4d236e'], [0.54, '#ad4a78'], [0.74, '#ec855e'], [0.9, '#ffc16e'], [1, '#ffe0a0']],
        sun: { x: 430, y: 212, r: 68, c: ['#fff8bc', '#ffc565', '#ed7765'] },
        halo: ['rgba(255,204,120,0.58)', 'rgba(255,110,135,0.2)'],
        cl: ['rgba(123,67,133,0.5)', 'rgba(255,170,151,0.6)', 'rgba(255,220,171,0.48)'],
        hz: 'rgba(255,193,113,0.48)', stars: 92, seed: 29
      };

    reg2('bg_sky_' + IT_REGION, 640, 360, makeSky(SKIES[IT_REGION]), FLAT);

    PAL[IT_REGION] = IT;

    function italyHouses(g, w, h, near) {
        const colors = ['#d66e53', '#e4a45e', '#be5e68', '#e5c080', '#b95252', '#d98967'];
        const r = rng(414 + (near ? 1 : 0));
        for (let x = -8, i = 0; x < w + 10; i++) {
          const bw = 34 + r() * 30, bh = (near ? 36 : 24) + r() * (near ? 55 : 36), y = h - bh;
          g.fillStyle = colors[i % colors.length]; g.fillRect(x, y, bw, bh);
          poly(g, [[x - 3, y], [x + bw * 0.5, y - 10 - r() * 8], [x + bw + 3, y]], i % 2 ? '#7a3545' : '#963e43');
          g.fillStyle = 'rgba(255,221,167,0.24)'; g.fillRect(x + 2, y + 2, 2, bh - 2);
          for (let wy = y + 9; wy < h - 7; wy += 13) for (let wx = x + 7; wx < x + bw - 4; wx += 13) {
            g.fillStyle = '#653047'; g.fillRect(wx - 1, wy - 1, 7, 9); lit(g, wx, wy, 5, 7, IT.win[(i + wx) % 3]);
            g.fillStyle = '#6f3642'; g.fillRect(wx - 1, wy + 6, 7, 1);
          }
          if (i % 3 === 1) { g.fillStyle = '#3e2342'; g.fillRect(x + bw * 0.44, h - 22, 8, 22); ell(g, x + bw * 0.5, h - 22, 4, 4, '#3e2342'); }
          x += bw - 1;
        }
      }

    function cypress(g, x, base, s, pot) {
        g.fillStyle = '#71394a'; g.fillRect(x - 1.5 * s, base - 34 * s, 3 * s, 34 * s);
        for (let j = 0; j < 5; j++) {
          const yy = base - (8 + j * 6) * s, ww = (10 - j * 1.15) * s;
          poly(g, [[x, yy - 10 * s], [x - ww, yy + 2 * s], [x + ww, yy + 2 * s]], j % 2 ? '#28644c' : '#347659');
          line(g, x, yy - 8 * s, x, yy + 1 * s, 0.7 * s, 'rgba(175,213,151,0.5)');
        }
        poly(g, [[x - 8 * s, base - 5 * s], [x + 8 * s, base - 5 * s], [x + 6 * s, base], [x - 6 * s, base]], pot || '#a94f3f');
        g.fillStyle = '#efb175'; g.fillRect(x - 7 * s, base - 5 * s, 14 * s, 1.2 * s);
      }

    Object.assign(C, { IT_REGION, IT });
  };

  AH.ArtModules.stages['worlds.venice.art.93'] = function (C) {
    const { FLAT, IT, IT_REGION, cypress, drawColosseum, drawDuomo, drawFlorence, drawPisa, ell, italyHouses, lg, poly, reg2, skyline } = C;

    reg2('bg_far_' + IT_REGION, 640, 220, function (g, w, h) {
        skyline(w, h, 301, '#54305b', IT.accent, 24, 58, 0.18, IT.win)(g);
        const base = h - 5;
        drawColosseum(g, 100, base, 0.66, IT);
        drawPisa(g, 295, base, 0.72, IT);
        drawDuomo(g, 465, base, 0.66, IT);
        drawFlorence(g, 585, base, 0.64, IT);
        g.fillStyle = 'rgba(255,195,118,0.16)'; g.fillRect(0, h - 16, w, 16);
      }, FLAT);

    reg2('bg_farp_' + IT_REGION, 640, 220, function (g, w, h) {
        const base = h - 4;
        g.fillStyle = '#54375b';
        poly(g, [[0, base], [0, 152], [90, 133], [170, 155], [265, 126], [355, 151], [455, 131], [550, 157], [640, 136], [640, base]], '#59405f');
        g.fillStyle = '#6d4b68';
        poly(g, [[0, base], [0, 177], [120, 157], [230, 177], [360, 152], [500, 177], [640, 156], [640, base]], '#6b4c62');
        for (let x = 35; x < 640; x += 125) cypress(g, x, base - 5, 0.8, '#75404a');
        italyHouses(g, w, h, false);
        g.fillStyle = '#51334f'; for (let x = 0; x < w; x += 22) g.fillRect(x, base - 2, 12, 2);
      }, FLAT);

    reg2('bg_near_' + IT_REGION, 640, 190, function (g, w, h) {
        italyHouses(g, w, h, true);
        for (let x = 25; x < 640; x += 118) {
          g.fillStyle = '#382543'; g.fillRect(x, h - 48, 2, 48);
          ell(g, x + 1, h - 47, 7, 5, '#315845'); ell(g, x + 1, h - 54, 5, 5, '#3a6a4c');
        }
        g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, 'rgba(239,135,104,0)'], [1, 'rgba(239,135,104,0.28)']]); g.fillRect(0, h - 26, w, 26);
      }, FLAT);
  };

  AH.ArtModules.stages['worlds.venice.art.95'] = function (C) {
    const { IT_REGION, regSkins } = C;

    regSkins(IT_REGION);
  };

  AH.ArtModules.stages['worlds.venice.art.97'] = function (C) {
    const { FLAT, IT, IT_REGION, MP, boatArt, cypress, ell, glowRect, lg, line, lit, poly, reg2, regCoins, regOb, regWater, rrect, shade, txt } = C;

    regCoins(IT_REGION);

    reg2('prop_cypress', 22, 34, function (g) { cypress(g, 11, 34, 0.82, '#a64b3c'); }, { shade: 0.4 });

    reg2('prop_amphora', 24, 30, function (g) {
        ell(g, 12, 18, 9, 11, lg(g, 3, 8, 21, 28, [[0, '#e5b46e'], [0.45, '#a85d43'], [1, '#66364a']]));
        g.fillStyle = '#d99a58'; g.fillRect(9, 3, 6, 5); g.fillRect(8, 1, 8, 3);
        ell(g, 4, 14, 4, 5, '#bb7650'); ell(g, 20, 14, 4, 5, '#bb7650');
        g.fillStyle = '#f0c27b'; g.fillRect(7, 12, 10, 1); g.fillRect(8, 22, 8, 1);
        poly(g, [[6, 27], [18, 27], [20, 30], [4, 30]], '#71384a');
      }, { shade: 0.4 });

    reg2('itcanal_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#f1d3a4'], [0.45, '#d4a475'], [1, '#a96e60']]); g.fillRect(0, 0, 32, 8);
        g.fillStyle = 'rgba(255,255,255,0.48)'; g.fillRect(0, 0, 32, 1);
        g.fillStyle = '#bd4c3b'; g.fillRect(0, 1, 32, 1.2);
        for (let x = 2; x < 32; x += 8) { line(g, x, 3, x - 2, 7, 0.5, 'rgba(105,65,57,0.6)'); }
        poly(g, [[0, 0], [27, 0], [32, 4], [5, 4]], 'rgba(241,214,178,0.35)');
        for (const x of [8, 24]) line(g, x, 0.5, x + 5, 4, 0.6, '#a47161');
      }, FLAT);

    reg2('itcanal', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#bb8c73'], [1, '#67475a']]); g.fillRect(0, 0, 32, 32);
        g.fillStyle = 'rgba(246,211,164,0.28)'; g.fillRect(0, 0, 32, 2);
        for (let y = 5; y < 32; y += 8) { g.fillStyle = 'rgba(82,49,62,0.35)'; g.fillRect(0, y, 32, 0.7); }
        for (let x = 3; x < 32; x += 10) line(g, x, 3, x - 3, 10, 0.6, 'rgba(255,224,184,0.3)');
      }, FLAT);

    reg2('rail_itcanal', 16, 12, function (g) {
        g.fillStyle = '#423844'; g.fillRect(0, 9, 16, 2);
        line(g, 0, 1, 16, 1, 1.5, '#d4c7b1'); line(g, 0, 4, 16, 4, 1, '#81766f');
        [2, 8, 14].forEach((x) => { g.fillStyle = '#c8b79c'; g.fillRect(x - 0.6, 1, 1.2, 9); ell(g, x, 0.8, 1.3, 1, '#f2dfbf'); });
        g.fillStyle = '#f1d5a7'; g.fillRect(0, 0, 16, 0.7);
      }, FLAT);

    regWater(IT_REGION, ['#32c6c1', '#075c70', '#9dfff0', '#43dfd0']);

    reg2('bridge_' + IT_REGION, 160, 100, function (g) {
        g.fillStyle = lg(g, 0, 30, 0, 100, [[0, '#c88665'], [0.55, '#a35f58'], [1, '#694158']]); g.fillRect(0, 30, 160, 70);
        g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(80, 105, 48, 56, 0, Math.PI, 0); g.fill(); g.restore();
        g.fillStyle = '#8b4b4a'; g.fillRect(0, 27, 160, 4);
        g.fillStyle = '#e6bc8e'; g.fillRect(0, 30, 160, 6); g.fillStyle = '#b44b40'; g.fillRect(0, 36, 160, 1.5);
        poly(g, [[0, 30], [80, -1], [160, 30]], 'rgba(255,221,173,0.38)');
        g.fillStyle = '#bd7758';
        for (let i = 0; i < 6; i++) {
          const x = 4 + i * 26; g.fillRect(x, 12, 21, 16);
          poly(g, [[x - 2, 12], [x + 10, 4], [x + 23, 12]], i % 2 ? '#9a4c4a' : '#c4614c');
          lit(g, x + 7, 17, 7, 8, IT.win[i % 3]);
        }
        g.fillStyle = '#f0d5aa'; g.fillRect(0, 28, 160, 2);
        g.strokeStyle = '#ddd0b6'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(2, 27); g.quadraticCurveTo(80, -7, 158, 27); g.stroke();
        for (let x = 6; x < 158; x += 9) { const t = (x - 2) / 156, y = 27 - 34 * t * (1 - t); line(g, x, y, x, 27, 0.8, '#ddd0b6'); ell(g, x, y, 1.2, 1.2, '#f5e1bd'); }
        [8, 152].forEach((x) => { g.fillStyle = '#6b3f4a'; g.fillRect(x - 2, 10, 4, 19); ell(g, x, 8, 3, 3, '#ffd480'); glowRect(g, '#ffc967', x - 4, 4, 8, 8); });
      }, { shade: 0.2, noOutline: true });

    reg2('boat_' + IT_REGION, 120, 36, boatArt({ hull: ['#a83f3d', '#55233f'], stripe: '#ffe2a0', cab: ['#f8ebd3', '#d4b287'], roof: '#fff3d4', win: ['#ffe9a0', '#9af3e3'], logo: false, name: 'ACTV AZURE' }), { shade: 0.35 });

    regOb('vespa', 52, 34, function (g) {
        ell(g, 12, 29, 5, 5, '#262437'); ell(g, 41, 29, 5, 5, '#262437');
        ell(g, 12, 29, 2, 2, '#c7c3b5'); ell(g, 41, 29, 2, 2, '#c7c3b5');
        poly(g, [[10, 27], [14, 15], [25, 11], [34, 13], [43, 21], [45, 28], [37, 30], [18, 30]], lg(g, 9, 12, 45, 30, [[0, '#ff7157'], [0.4, '#d73936'], [1, '#782d3e']]));
        rrect(g, 24, 8, 10, 5, 2, '#dbe5e0'); line(g, 30, 11, 36, 6, 1, '#413343'); line(g, 34, 6, 40, 6, 1, '#413343');
        ell(g, 44, 20, 2.2, 2, '#fff2bd'); glowRect(g, '#ffe5a0', 42, 18, 4, 4);
        g.fillStyle = '#f1d6a1'; g.fillRect(19, 17, 14, 1); rrect(g, 25, 13, 6, 2, 1, '#f3d2a3');
        line(g, 16, 19, 12, 28, 2, '#e4ddd0');
      });

    regOb('fiat', 60, 34, function (g) {
        ell(g, 13, 30, 5, 5, '#232332'); ell(g, 47, 30, 5, 5, '#232332');
        ell(g, 13, 30, 2.2, 2.2, '#d3c9b0'); ell(g, 47, 30, 2.2, 2.2, '#d3c9b0');
        rrect(g, 2, 16, 56, 14, 5, lg(g, 0, 15, 0, 31, [[0, '#ffcf70'], [0.45, '#e6a84d'], [1, '#a65344']]));
        poly(g, [[10, 17], [17, 7], [40, 7], [49, 17]], '#d8e6db');
        g.fillStyle = '#514357'; g.fillRect(19, 9, 8, 7); g.fillRect(29, 9, 10, 7);
        g.fillStyle = '#ffeac0'; g.fillRect(4, 19, 4, 3); g.fillRect(52, 19, 4, 3); rrect(g, 25, 17, 10, 2, 0.7, '#f6e4b7');
        g.fillStyle = '#a2433c'; g.fillRect(13, 27, 34, 2);
      });

    regOb('gelato', 68, 38, function (g) {
        g.fillStyle = '#543d4c'; g.fillRect(20, 33, 2, 5); g.fillRect(48, 33, 2, 5);
        rrect(g, 6, 12, 56, 23, 3, lg(g, 6, 12, 6, 35, [[0, '#fff0d1'], [1, '#d8af8d']]));
        g.fillStyle = '#c74e46'; g.fillRect(4, 8, 60, 5); g.fillStyle = '#ffe3a7'; g.fillRect(4, 7, 60, 1.5);
        for (let x = 7; x < 62; x += 8) { g.fillStyle = (x % 2 ? '#c64b48' : '#fff0d1'); poly(g, [[x, 13], [x + 7, 13], [x + 7, 19], [x + 3.5, 21], [x, 19]], g.fillStyle); }
        g.fillStyle = '#514050'; g.fillRect(13, 22, 42, 8); txt(g, 'GELATO', 16, 23.8, 0.65, '#ffe6ad');
        ell(g, 23, 5, 5, 5, '#ed78aa'); ell(g, 33, 4, 5, 5, '#a9df76'); ell(g, 43, 5, 5, 5, '#f7d467');
        line(g, 19, 0, 17, 9, 1.3, '#694049'); line(g, 50, 0, 53, 9, 1.3, '#694049');
      });

    reg2('secret_' + IT_REGION, 30, 62, function (g) {
        g.fillStyle = '#c8a47a'; g.fillRect(2, 6, 26, 56);
        poly(g, [[0, 8], [15, 0], [30, 8]], '#e1c49b');
        g.fillStyle = '#8f655f'; g.fillRect(5, 11, 20, 51);
        g.fillStyle = '#75e7d4'; g.fillRect(7, 34, 16, 25); g.fillStyle = 'rgba(255,255,255,0.65)'; g.fillRect(8, 35, 14, 2);
        for (let side of [0, 1]) {
          const x = side ? 22 : 8; g.fillStyle = '#d8b98f'; g.fillRect(x, 14, 3, 20); ell(g, x + 1.5, 14, 2, 2, '#d8b98f');
        }
        ell(g, 15, 23, 5.5, 9, '#d4a981'); ell(g, 15, 13, 4, 4, '#e5c5a1');
        poly(g, [[12, 14], [12, 10], [17, 9], [19, 15], [17, 19], [15, 16]], '#a48272');
        line(g, 15, 20, 15, 28, 0.7, '#f5e1c5');
        g.fillStyle = '#e4d0ad'; g.fillRect(3, 58, 24, 4);
        g.fillStyle = '#a67a60'; g.fillRect(5, 7, 20, 2);
        g.fillStyle = '#b8fff0'; g.globalAlpha = 0.7; g.fillRect(7, 34, 16, 25); g.globalAlpha = 1;
        glowRect(g, '#47e6d0', 7, 31, 16, 26);
      }, { shade: 0.3 });

    MP[IT_REGION] = { top: '#b76a62', bot: '#6b3a58', accent: '#ffd094', win: ['#ffe8a6', '#ffb46e', '#a8f4e0'] };
  };

  content.parts['CARS_vespa'] = function (C) {
    const { ell, line, poly, rrect, wheels } = C;

    return [24, 20, function (g) { ell(g, 15, 13, 6.4, 3.6, '#ff3a3a'); poly(g, [[4, 6], [7, 6], [8, 15], [5, 15]], '#ff3a3a'); line(g, 3, 5, 8, 5, 1, '#14082a'); ell(g, 13, 7, 3, 3.4, '#2a1a3a'); ell(g, 13.6, 3.6, 2.6, 2.6, '#ffffff'); rrect(g, 11, 2.6, 5, 1.6, 0.8, '#7fe8ff'); wheels(g, [5, 19], 17, 3); }];
  };
})();
