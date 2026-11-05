/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['venice'] = AH.Worlds['venice'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { panoramaLandmarks: 5 };
  AH.ArtModules.regions['italynorth'] = content;

  AH.ArtModules.stages['worlds.venice.scenery.92'] = function (C) {
    const { IT, ell, lg, line, lit, poly, silFill } = C;

    Object.assign(C, { drawColosseum, drawPisa, drawDuomo, drawStMarks, drawRialto, drawTrevi, drawFlorence });
    function drawColosseum(g, cx, base, s, P) {
        const c = silFill(g, base - 60 * s, base, '#e8b17a', '#8b4b50');
        g.fillStyle = c; g.fillRect(cx - 36 * s, base - 48 * s, 72 * s, 48 * s);
        for (let tier = 0; tier < 3; tier++) {
          const y = base - (46 - tier * 14) * s; g.fillStyle = tier === 2 ? '#d9a06d' : '#bd765e';
          g.fillRect(cx - 37 * s, y, 74 * s, 12 * s);
          for (let i = 0; i < 7; i++) {
            const x = cx - 31 * s + i * 10.2 * s;
            g.fillStyle = '#653b4a'; g.fillRect(x, y + 2 * s, 5.6 * s, 9 * s);
            ell(g, x + 2.8 * s, y + 2.1 * s, 2.8 * s, 2.8 * s, '#653b4a');
            line(g, x - 1 * s, y + 11 * s, x + 7 * s, y + 11 * s, 0.9 * s, '#f2c586');
          }
          g.fillStyle = 'rgba(255,222,170,0.55)'; g.fillRect(cx - 37 * s, y + 11 * s, 74 * s, 1.2 * s);
        }
        g.fillStyle = '#79505a'; g.fillRect(cx + 18 * s, base - 62 * s, 18 * s, 14 * s);
        poly(g, [[cx + 16 * s, base - 62 * s], [cx + 29 * s, base - 72 * s], [cx + 38 * s, base - 60 * s]], '#a7554e');
        g.fillStyle = '#a15c52'; g.fillRect(cx - 39 * s, base - 1.2 * s, 80 * s, 2 * s);
      }

    function drawPisa(g, cx, base, s, P) {
        g.save(); g.translate(cx, base); g.rotate(-0.15);
        g.fillStyle = '#e5d0aa'; g.fillRect(-10 * s, -67 * s, 20 * s, 67 * s);
        for (let k = 0; k < 6; k++) {
          const y = -63 * s + k * 10.4 * s;
          g.fillStyle = k % 2 ? '#d0b38c' : '#f2dfbd'; g.fillRect(-12 * s, y, 24 * s, 3.2 * s);
          for (let j = 0; j < 4; j++) { const x = (-8 + j * 5.2) * s; g.fillStyle = '#977b72'; g.fillRect(x, y + 3.4 * s, 2.2 * s, 5.2 * s); ell(g, x + 1.1 * s, y + 3.5 * s, 1.1 * s, 1.1 * s, '#977b72'); }
          g.fillStyle = '#f2dfbd'; g.fillRect(-13 * s, y + 8 * s, 26 * s, 2 * s);
        }
        g.fillStyle = '#ad675d'; g.fillRect(-9 * s, -72 * s, 18 * s, 5 * s);
        ell(g, 0, -72 * s, 8 * s, 5 * s, '#e8d5b3');
        g.fillStyle = '#c9ae8b'; g.fillRect(-15 * s, -1.5 * s, 30 * s, 2 * s);
        g.restore();
      }

    function drawDuomo(g, cx, base, s, P) {
        const stone = lg(g, cx - 40 * s, base - 72 * s, cx + 42 * s, base, [[0, '#fff1d2'], [0.5, '#d6c6b7'], [1, '#a78e91']]);
        g.fillStyle = stone; g.fillRect(cx - 37 * s, base - 35 * s, 74 * s, 35 * s);
        for (let k = 0; k < 5; k++) {
          const x = cx - 33 * s + k * 16 * s;
          g.fillStyle = '#967f86'; g.fillRect(x, base - 29 * s, 5 * s, 13 * s); ell(g, x + 2.5 * s, base - 29 * s, 2.5 * s, 2.5 * s, '#967f86');
          line(g, x - 2 * s, base - 31 * s, x + 7 * s, base - 31 * s, 1.1 * s, '#f6e5c5');
          poly(g, [[x - 2 * s, base - 35 * s], [x + 2.5 * s, base - 44 * s], [x + 7 * s, base - 35 * s]], '#e6d4c2');
        }
        poly(g, [[cx - 30 * s, base - 36 * s], [cx - 20 * s, base - 47 * s], [cx - 10 * s, base - 36 * s]], '#e8d7c6');
        poly(g, [[cx + 10 * s, base - 36 * s], [cx + 20 * s, base - 47 * s], [cx + 30 * s, base - 36 * s]], '#e8d7c6');
        g.fillStyle = '#f3e5cf'; g.fillRect(cx - 2 * s, base - 55 * s, 4 * s, 20 * s);
        for (let k = 0; k < 5; k++) {
          const x = cx - 30 * s + k * 15 * s, top = base - (53 + (k === 2 ? 19 : 0)) * s;
          line(g, x, base - 34 * s, x, top + 4 * s, 1.2 * s, '#f1dfca');
          poly(g, [[x - 3 * s, top + 5 * s], [x, top], [x + 3 * s, top + 5 * s]], '#fff0d6');
          ell(g, x, top + 5 * s, 1.4 * s, 1.4 * s, '#d58a70');
        }
        line(g, cx, base - 75 * s, cx, base - 70 * s, 1 * s, '#fff1d0');
        g.fillStyle = '#fff0d8'; g.fillRect(cx - 39 * s, base - 2 * s, 78 * s, 2 * s);
      }

    function drawStMarks(g, cx, base, s, P) {
        const stone = lg(g, cx - 46 * s, base - 55 * s, cx + 46 * s, base, [[0, '#e9c696'], [0.6, '#bd8b69'], [1, '#795064']]);
        g.fillStyle = stone; g.fillRect(cx - 44 * s, base - 34 * s, 88 * s, 34 * s);
        for (let i = 0; i < 5; i++) {
          const x = cx - 37 * s + i * 18 * s;
          g.fillStyle = '#70445a'; g.fillRect(x, base - 26 * s, 10 * s, 26 * s); ell(g, x + 5 * s, base - 26 * s, 5 * s, 5 * s, '#70445a');
          line(g, x - 2 * s, base - 31 * s, x + 12 * s, base - 31 * s, 1.5 * s, '#f4d5a5');
          ell(g, x + 5 * s, base - 42 * s, 4 * s, 4 * s, i % 2 ? '#d8a777' : '#f1d4a0');
        }
        poly(g, [[cx - 46 * s, base - 34 * s], [cx, base - 57 * s], [cx + 46 * s, base - 34 * s]], '#dca978');
        for (let i = 0; i < 4; i++) poly(g, [[cx - 31 * s + i * 20 * s, base - 38 * s], [cx - 24 * s + i * 20 * s, base - 50 * s], [cx - 17 * s + i * 20 * s, base - 38 * s]], '#f1d6ac');
        g.fillStyle = '#c04742'; g.fillRect(cx + 47 * s, base - 66 * s, 13 * s, 66 * s);
        for (let y = base - 60 * s; y < base - 3 * s; y += 12 * s) { g.fillStyle = '#e2b27d'; g.fillRect(cx + 45 * s, y, 17 * s, 2 * s); }
        g.fillStyle = '#9b514b'; g.fillRect(cx + 45 * s, base - 69 * s, 17 * s, 4 * s);
        poly(g, [[cx + 46 * s, base - 69 * s], [cx + 53 * s, base - 79 * s], [cx + 61 * s, base - 69 * s]], '#d8a26f');
        line(g, cx + 53 * s, base - 84 * s, cx + 53 * s, base - 79 * s, 1 * s, '#ffe0a0');
      }

    function drawRialto(g, x, base, w, s, P) {
        g.fillStyle = '#bc8062'; g.fillRect(x, base - 15 * s, w, 15 * s);
        poly(g, [[x, base - 15 * s], [x + w * .5, base - 50 * s], [x + w, base - 15 * s]], '#d8a077');
        g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(x + w * .5, base - 3 * s, w * .28, 17 * s, 0, Math.PI, 0); g.fill(); g.restore();
        g.fillStyle = '#e9be8c'; g.fillRect(x - 2 * s, base - 19 * s, w + 4 * s, 5 * s);
        for (let j = 0; j < 5; j++) {
          const bx = x + 4 * s + j * (w - 8 * s) / 5;
          g.fillStyle = j % 2 ? '#c65048' : '#e5a56d'; g.fillRect(bx, base - 34 * s, 12 * s, 15 * s);
          poly(g, [[bx - 1 * s, base - 34 * s], [bx + 6 * s, base - 40 * s], [bx + 13 * s, base - 34 * s]], '#a34947');
          lit(g, bx + 3 * s, base - 29 * s, 5 * s, 7 * s, IT.win[j % 3]);
        }
        line(g, x + 3 * s, base - 20 * s, x + w - 3 * s, base - 20 * s, 1.2 * s, '#f8deb4');
        for (let px = x + 3 * s; px < x + w; px += 7 * s) line(g, px, base - 19 * s, px, base - 24 * s, 0.7 * s, '#74495a');
      }

    function drawTrevi(g, cx, base, s, P) {
        const stone = lg(g, cx - 44 * s, base - 60 * s, cx + 44 * s, base, [[0, '#f4ddba'], [0.5, '#c6a889'], [1, '#806079']]);
        g.fillStyle = stone; g.fillRect(cx - 42 * s, base - 42 * s, 84 * s, 42 * s);
        g.fillStyle = '#e5ccaa'; g.fillRect(cx - 47 * s, base - 45 * s, 94 * s, 4 * s);
        poly(g, [[cx - 45 * s, base - 45 * s], [cx, base - 63 * s], [cx + 45 * s, base - 45 * s]], '#d1b18f');
        g.fillStyle = '#7ce5d2'; g.fillRect(cx - 34 * s, base - 13 * s, 68 * s, 13 * s);
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(cx - 32 * s, base - 12 * s, 64 * s, 1.3 * s);
        for (let side of [-1, 1]) {
          g.fillStyle = '#a78a84'; g.fillRect(cx + side * 26 * s - 5 * s, base - 37 * s, 10 * s, 24 * s);
          ell(g, cx + side * 26 * s, base - 37 * s, 5 * s, 5 * s, '#a78a84');
          poly(g, [[cx + side * 26 * s - 7 * s, base - 42 * s], [cx + side * 26 * s, base - 48 * s], [cx + side * 26 * s + 7 * s, base - 42 * s]], '#e7cfaf');
          ell(g, cx + side * 26 * s, base - 8 * s, 4 * s, 2 * s, '#9cf6df');
        }
        ell(g, cx, base - 40 * s, 9 * s, 13 * s, '#c69983');
        ell(g, cx, base - 54 * s, 6 * s, 7 * s, '#e5c6a6');
        poly(g, [[cx - 4 * s, base - 55 * s], [cx + 3 * s, base - 58 * s], [cx + 7 * s, base - 49 * s], [cx + 3 * s, base - 45 * s]], '#a1837c');
        for (let j = 0; j < 3; j++) { g.fillStyle = 'rgba(118,240,222,0.8)'; g.fillRect(cx - (10 + j * 4) * s, base - (21 + j * 4) * s, 2 * s, 8 * s); }
      }

    function drawFlorence(g, cx, base, s, P) {
        const stone = lg(g, cx - 40 * s, base - 58 * s, cx + 40 * s, base, [[0, '#fff0d0'], [0.5, '#dbbf9c'], [1, '#916579']]);
        g.fillStyle = stone; g.fillRect(cx - 35 * s, base - 24 * s, 70 * s, 24 * s);
        for (let i = 0; i < 5; i++) { const x = cx - 28 * s + i * 14 * s; g.fillStyle = '#8b5a66'; g.fillRect(x, base - 18 * s, 5 * s, 12 * s); ell(g, x + 2.5 * s, base - 18 * s, 2.5 * s, 2.5 * s, '#8b5a66'); }
        ell(g, cx, base - 45 * s, 31 * s, 19 * s, '#b95e47');
        g.fillStyle = '#cb7351'; g.fillRect(cx - 31 * s, base - 47 * s, 62 * s, 5 * s);
        for (let i = 0; i < 11; i++) { const x = cx - 27 * s + i * 5.4 * s; line(g, x, base - 47 * s, x + (x - cx) * .1, base - (55 - Math.abs(x - cx) * .14) * s, 0.9 * s, '#f0b77b'); }
        ell(g, cx, base - 57 * s, 13 * s, 7 * s, '#c76a4a');
        g.fillStyle = '#f3dfbd'; g.fillRect(cx - 7 * s, base - 64 * s, 14 * s, 5 * s);
        poly(g, [[cx - 6 * s, base - 64 * s], [cx, base - 71 * s], [cx + 6 * s, base - 64 * s]], '#d88963');
        line(g, cx, base - 76 * s, cx, base - 70 * s, 1 * s, '#fff0d0');
      }
  };

  AH.ArtModules.stages['worlds.venice.scenery.98'] = function (C) {
    const { IT_REGION, SC, cypress, drawColosseum, drawDuomo, drawFlorence, drawPisa, drawRialto, drawStMarks, drawTrevi, ell, glowRect, italyHouses, lit, msLogo, poly, txt } = C;

    SC[IT_REGION] = {
        sc_it_colosseum: [210, 170, function (g, w, h, P) { italyHouses(g, 0, 70, true); drawColosseum(g, 108, h, 1.65, P); txt(g, 'ROMA', 164, h - 9, 1, '#ffe5ad'); }],
        sc_it_pisa: [150, 190, function (g, w, h, P) { g.fillStyle = '#759455'; g.fillRect(0, h - 18, w, 18); cypress(g, 20, h, 1, '#9a5843'); drawPisa(g, 82, h, 1.65, P); }],
        sc_it_milano: [230, 185, function (g, w, h, P) { drawDuomo(g, 115, h, 1.7, P); txt(g, 'MILANO', 89, h - 9, 1, '#fff0d7'); }],
        sc_it_sanmarco: [220, 180, function (g, w, h, P) { drawStMarks(g, 98, h, 1.35, P); txt(g, 'SAN MARCO', 115, h - 10, 1, '#ffe3a1'); }],
        sc_it_rialto: [250, 145, function (g, w, h, P) { g.fillStyle = '#28b8b2'; g.fillRect(0, h - 48, w, 48); drawRialto(g, 12, h - 4, 226, 1.45, P); }],
        sc_it_trevi: [180, 160, function (g, w, h, P) { drawTrevi(g, 90, h, 1.5, P); txt(g, 'TREVI', 72, h - 5, 1, '#fff0cf'); }],
        sc_it_firenze: [210, 170, function (g, w, h, P) { drawFlorence(g, 106, h, 1.55, P); txt(g, 'FIRENZE', 80, h - 8, 1, '#ffe2a4'); }],
        sc_it_burano: [240, 150, function (g, w, h, P) { const cols = ['#e86f62', '#49b4a1', '#e2b64e', '#7a83cb', '#e49b58']; for (let i = 0; i < 5; i++) { const x = i * 48; g.fillStyle = cols[i]; g.fillRect(x, h - 93 - (i % 2) * 13, 48, 93 + (i % 2) * 13); poly(g, [[x - 2, h - 93 - (i % 2) * 13], [x + 24, h - 108 - (i % 2) * 13], [x + 50, h - 93 - (i % 2) * 13]], i % 2 ? '#85424b' : '#a84a45'); lit(g, x + 10, h - 72, 10, 18, P.win[i % 3]); lit(g, x + 28, h - 72, 10, 18, P.win[(i + 1) % 3]); g.fillStyle = '#f4d5a4'; g.fillRect(x + 23, h - 32, 6, 32); } g.fillStyle = '#2c989b'; g.fillRect(0, h - 8, w, 8); }],
        sc_it_pizzeria: [190, 135, function (g, w, h, P) { g.fillStyle = '#c57059'; g.fillRect(5, h - 78, 180, 78); poly(g, [[0, h - 78], [94, h - 120], [190, h - 78]], '#7d3947'); g.fillStyle = '#f1cf9b'; g.fillRect(18, h - 67, 154, 12); txt(g, 'PIZZERIA', 61, h - 65, 1.2, '#b84238'); g.fillStyle = '#593344'; g.fillRect(70, h - 48, 52, 48); ell(g, 96, h - 27, 19, 19, '#713d44'); ell(g, 96, h - 27, 12, 12, '#ffad56'); ell(g, 96, h - 27, 7, 7, '#ffe28a'); glowRect(g, '#ff9d4e', 84, h - 40, 24, 24); for (let x = 20; x < 175; x += 22) lit(g, x, h - 43, 13, 15, P.win[(x / 22 | 0) % 3]); }],
        sc_it_msoffice: [220, 185, function (g, w, h, P) { g.fillStyle = '#59415b'; g.fillRect(12, h - 128, 196, 128); g.fillRect(148, h - 160, 58, 32); for (let y = h - 118; y < h - 10; y += 12) for (let x = 20; x < 202; x += 15) lit(g, x, y, 9, 7, P.win[(x + y) % 3]); g.fillStyle = '#251f42'; g.fillRect(45, h - 152, 114, 20); glowRect(g, '#5fb8ff', 45, h - 152, 114, 20); msLogo(g, 50, h - 148, 13); txt(g, 'MICROSOFT', 69, h - 146, 1, '#ffffff'); txt(g, 'MILANO', 84, h - 11, 1, '#ffe6a5'); }],
        sc_it_canalcafe: [195, 115, function (g, w, h, P) { g.fillStyle = '#d18b65'; g.fillRect(4, h - 57, 187, 57); g.fillStyle = '#a94943'; g.fillRect(0, h - 61, w, 5); g.fillStyle = '#f4d8a8'; g.fillRect(14, h - 53, 167, 8); txt(g, 'CAFFE  VENEZIA', 46, h - 52, 0.85, '#963f42'); g.fillStyle = '#593d50'; g.fillRect(20, h - 38, 45, 38); g.fillRect(74, h - 38, 45, 38); g.fillRect(128, h - 38, 45, 38); [24, 78, 132].forEach((x) => lit(g, x, h - 34, 36, 22, '#9ae7d3')); }],
        sc_it_cypressyard: [155, 150, function (g, w, h, P) { g.fillStyle = '#99754f'; g.fillRect(0, h - 16, w, 16); cypress(g, 34, h, 1.15, '#ad5843'); cypress(g, 78, h, 0.9, '#dfb16e'); cypress(g, 122, h, 1.2, '#8e4d49'); for (let x = 0; x < w; x += 18) { g.fillStyle = '#bd9a70'; g.fillRect(x, h - 17, 9, 1); } }]
      };
  };

  content.parts['panoramaLandmarks_italynorth'] = function (C) {

    return ['sc_it_colosseum', 'sc_it_pisa', 'sc_it_milano', 'sc_it_firenze'];
  };
})();
