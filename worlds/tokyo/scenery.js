/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['tokyo'] = AH.Worlds['tokyo'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { panoramaLandmarks: 2, sceneryRoutes: 1 };
  AH.ArtModules.regions['japaneast'] = content;

  AH.ArtModules.stages['worlds.tokyo.scenery.12'] = function (C) {
    const { glowRect, lg, lit, poly, silFill } = C;

    Object.assign(C, { fuji, tokyoTower, torii, pagoda });
    function fuji(g, cx, base, s, P) {
        const path = function () {
          g.beginPath(); g.moveTo(cx - 190 * s, base);
          g.bezierCurveTo(cx - 100 * s, base - 22 * s, cx - 52 * s, base - 95 * s, cx - 20 * s, base - 122 * s);
          g.lineTo(cx + 20 * s, base - 122 * s);
          g.bezierCurveTo(cx + 52 * s, base - 95 * s, cx + 100 * s, base - 22 * s, cx + 190 * s, base); g.closePath();
        };
        path(); g.fillStyle = lg(g, 0, base - 122 * s, 0, base, [[0, '#7a4ad8'], [0.5, '#4a2a9a'], [1, '#2a1470']]); g.fill();
        g.save(); path(); g.clip();
        const cap = [[cx - 80 * s, base - 78 * s], [cx - 56 * s, base - 70 * s], [cx - 44 * s, base - 86 * s], [cx - 30 * s, base - 72 * s], [cx - 14 * s, base - 90 * s], [cx, base - 74 * s], [cx + 12 * s, base - 88 * s], [cx + 28 * s, base - 70 * s], [cx + 44 * s, base - 84 * s], [cx + 58 * s, base - 68 * s], [cx + 80 * s, base - 78 * s], [cx + 80 * s, base - 130 * s], [cx - 80 * s, base - 130 * s]];
        poly(g, cap, lg(g, 0, base - 122 * s, 0, base - 70 * s, [[0, '#ffffff'], [1, '#ffb0e0']]));
        g.fillStyle = 'rgba(80,40,160,0.3)'; g.fillRect(cx + 4 * s, base - 130 * s, 90 * s, 130 * s);
        g.restore();
        g.strokeStyle = 'rgba(255,150,230,0.7)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(cx - 190 * s, base); g.bezierCurveTo(cx - 100 * s, base - 22 * s, cx - 52 * s, base - 95 * s, cx - 20 * s, base - 122 * s); g.lineTo(cx + 20 * s, base - 122 * s); g.stroke();
      }

    function tokyoTower(g, cx, base, s, P) {
        const half = function (y) { return (30 - y * 0.2) * s; };
        const body = [[cx - 30 * s, base], [cx - half(60) + 0, base - 60 * s], [cx - 10 * s, base - 105 * s], [cx - 4 * s, base - 150 * s], [cx - 1.2 * s, base - 175 * s], [cx + 1.2 * s, base - 175 * s], [cx + 4 * s, base - 150 * s], [cx + 10 * s, base - 105 * s], [cx + half(60), base - 60 * s], [cx + 30 * s, base]];
        poly(g, body, 'rgba(255,90,60,0.92)');
        g.save(); g.beginPath(); g.moveTo(body[0][0], body[0][1]); body.forEach((p) => g.lineTo(p[0], p[1])); g.clip();
        for (let k = 0; k < 14; k++) { const y = base - k * 13 * s; g.fillStyle = k % 2 ? 'rgba(255,240,220,0.9)' : 'rgba(255,90,60,0)'; g.fillRect(cx - 40 * s, y, 80 * s, 6.5 * s); }
        g.strokeStyle = 'rgba(40,10,70,0.85)'; g.lineWidth = 0.9;
        for (let k = 0; k < 8; k++) { const y0 = base - k * 22 * s, w = (28 - k * 3.2) * s; g.beginPath(); g.moveTo(cx - w, y0); g.lineTo(cx + w * 0.8, y0 - 22 * s); g.moveTo(cx + w, y0); g.lineTo(cx - w * 0.8, y0 - 22 * s); g.stroke(); }
        g.fillStyle = 'rgba(30,6,60,0.22)'; g.fillRect(cx + 2 * s, base - 180 * s, 40 * s, 180 * s);
        g.restore();
        g.fillStyle = '#ff5a3c'; g.fillRect(cx - 13 * s, base - 72 * s, 26 * s, 6 * s); g.fillRect(cx - 6.5 * s, base - 108 * s, 13 * s, 5 * s);
        for (let k = 0; k < 7; k++) { lit(g, cx - 12 * s + k * 3.8 * s, base - 70 * s, 2, 2.4, '#ffe9a0'); }
        g.fillStyle = '#ff5a3c'; g.fillRect(cx - 0.5, base - 200 * s, 1, 26 * s);
        lit(g, cx - 1.4, base - 202 * s, 2.8, 2.8, '#ff2a4a');
        glowRect(g, '#ff5a3c', cx - 30 * s, base - 8, 60 * s, 8);
      }

    function torii(g, cx, base, s, P) {
        const red = lg(g, 0, base - 60 * s, 0, base, [[0, '#ff6a50'], [1, '#c0123a']]);
        g.fillStyle = red; g.fillRect(cx - 21 * s, base - 50 * s, 5 * s, 50 * s); g.fillRect(cx + 16 * s, base - 50 * s, 5 * s, 50 * s);
        g.fillRect(cx - 18 * s, base - 40 * s, 36 * s, 3.6 * s);
        poly(g, [[cx - 34 * s, base - 62 * s], [cx - 24 * s, base - 54 * s], [cx + 24 * s, base - 54 * s], [cx + 34 * s, base - 62 * s], [cx + 30 * s, base - 50 * s], [cx - 30 * s, base - 50 * s]], red);
        g.fillStyle = '#1a0a3a'; g.fillRect(cx - 24 * s, base - 54 * s, 48 * s, 2 * s);
        glowRect(g, '#ff3a3a', cx - 34 * s, base - 62 * s, 68 * s, 3);
      }

    function pagoda(g, cx, base, s, P) {
        const tiers = 5; let y = base;
        for (let t = 0; t < tiers; t++) {
          const w = (40 - t * 6) * s, h = 11 * s;
          g.fillStyle = silFill(g, y - h, y, '#4a2aa0', '#241070'); g.fillRect(cx - w * 0.38, y - h, w * 0.76, h);
          lit(g, cx - w * 0.26, y - h + 3 * s, 3 * s, 4.6 * s, P.win[t % P.win.length]); lit(g, cx + w * 0.26 - 3 * s, y - h + 3 * s, 3 * s, 4.6 * s, P.win[(t + 1) % P.win.length]);
          const ry = y - h;
          poly(g, [[cx - w / 2 - 6 * s, ry + 1], [cx - w / 2 + 3 * s, ry - 5 * s], [cx + w / 2 - 3 * s, ry - 5 * s], [cx + w / 2 + 6 * s, ry + 1], [cx + w / 2, ry + 2.5 * s], [cx - w / 2, ry + 2.5 * s]], '#1a0a50');
          g.fillStyle = '#ff7ad9'; g.fillRect(cx - w / 2 - 5 * s, ry + 0.5, w + 10 * s, 0.8);
          y = ry - 4 * s;
        }
        g.fillStyle = '#ffd23f'; g.fillRect(cx - 0.5, y - 14 * s, 1, 14 * s);
        for (let k = 0; k < 4; k++) g.fillRect(cx - 2.2 + k * 0.1, y - 4 * s - k * 2.6 * s, 4.4 - k, 0.8);
      }
  };

  AH.ArtModules.stages['worlds.tokyo.scenery.23'] = function (C) {
    const { FLAT, PAL, mesas, pagoda, reg2, torii } = C;

    reg2('bg_near_japaneast', 640, 150, function (g, w, h) {
        mesas(w, h, 23, '#1f0e55', '#ff6a8a', 20, 80)(g);
        torii(g, 150, h - 14, 0.9, PAL.japaneast); pagoda(g, 430, h - 14, 0.9, PAL.japaneast);
      }, FLAT);
  };

  AH.ArtModules.stages['worlds.tokyo.scenery.88'] = function (C) {
    const { commuterTrain, reg2, shade } = C;

    reg2('amb_train_tokyometro', 248, 46, (g) => commuterTrain(g, C.part('tokyo', 'commuterTrain')), { shade: 0.25 });
  };

  AH.ArtModules.stages['worlds.tokyo.scenery.123'] = function (C) {
    const { SC, ell, lg, line, lit, poly, txt } = C;

    Object.assign(SC.japaneast, {
        sc_jp_himeji: [220, 210, function (g, w, h, P) {
          const wall = lg(g, 0, h - 190, 0, h, [[0, '#f4efff'], [0.55, '#b8c5f0'], [1, '#514e9b']]);
          const roof = '#25234e';
          g.fillStyle = wall; g.fillRect(30, h - 64, 160, 64); g.fillRect(48, h - 105, 124, 41);
          g.fillRect(66, h - 147, 88, 42); g.fillRect(83, h - 181, 54, 34);
          [[26, h - 64, 168], [43, h - 105, 134], [61, h - 147, 98], [78, h - 181, 64], [90, h - 194, 40]].forEach(function (r, i) {
            poly(g, [[r[0] - 8, r[1]], [r[0] + r[2] * 0.18, r[1] - 5], [r[0] + r[2] * 0.5, r[1] - 13], [r[0] + r[2] * 0.82, r[1] - 5], [r[0] + r[2] + 8, r[1]], [r[0] + r[2], r[1] + 4], [r[0], r[1] + 4]], roof);
            line(g, r[0] + 3, r[1], r[0] + r[2] - 3, r[1], 1.2, P.accent);
            if (i < 4) { const cols = [4, 3, 2, 1][i], step = r[2] / (cols + 1); for (let k = 1; k <= cols; k++) lit(g, r[0] + step * k - 2, r[1] + 13, 4, 8, P.win[(k + i) % 3]); }
          });
          g.fillStyle = roof; g.fillRect(106, h - 202, 8, 8); poly(g, [[104, h - 202], [110, h - 210], [116, h - 202]], '#d9bb67');
          for (let x = 38; x < 190; x += 14) { line(g, x, h - 61, x + 7, h - 52, 1, 'rgba(80,90,160,0.65)'); }
          txt(g, 'HIMEJI', 86, h - 18, 1, '#ffe8a0', '#24204e');
        }],
        sc_jp_osakacastle: [210, 190, function (g, w, h, P) {
          const stone = lg(g, 0, h - 130, 0, h, [[0, '#b9c9e8'], [1, '#51527f']]);
          g.fillStyle = stone; g.fillRect(24, h - 52, 162, 52); g.fillRect(43, h - 91, 124, 39); g.fillRect(61, h - 127, 88, 36); g.fillRect(78, h - 157, 54, 30);
          for (let x = 30; x < 182; x += 18) { lit(g, x, h - 40, 6, 9, P.win[(x / 18 | 0) % 3]); if (x < 164) lit(g, x + 9, h - 79, 5, 8, P.win[(x / 18 + 1 | 0) % 3]); }
          [[18, h - 52, 174], [38, h - 91, 134], [56, h - 127, 98], [73, h - 157, 64], [87, h - 170, 36]].forEach(function (r, i) {
            const y = r[1]; poly(g, [[r[0] - 7, y], [r[0] + 6, y - 2], [r[0] + r[2] * 0.5, y - 14], [r[0] + r[2] - 6, y - 2], [r[0] + r[2] + 7, y], [r[0] + r[2], y + 4], [r[0], y + 4]], i % 2 ? '#23756f' : '#2a887b');
            line(g, r[0] + 2, y, r[0] + r[2] - 2, y, 1.3, P.accent);
            if (i < 4) { ell(g, r[0] + r[2] / 2, y - 6, 3, 2, '#f1cb55'); }
          });
          g.fillStyle = '#d7b84f'; g.fillRect(100, h - 177, 12, 4); poly(g, [[101, h - 173], [105, h - 181], [109, h - 173]], '#f1cf68');
          txt(g, 'OSAKA', 86, h - 14, 1, '#ffe8a0', '#1d2345');
        }],
        sc_jp_miyajima: [220, 145, function (g, w, h, P) {
          g.fillStyle = lg(g, 0, h - 50, 0, h, [[0, '#276b9a'], [1, '#142b68']]); g.fillRect(0, h - 48, w, 48);
          for (let y = h - 37; y < h - 5; y += 11) line(g, 7 + (y % 13), y, w - 9, y, 0.7, 'rgba(130,220,255,0.5)');
          const red = '#d94a4f';
          g.fillStyle = red; g.fillRect(68, h - 90, 9, 89); g.fillRect(145, h - 90, 9, 89);
          g.fillStyle = '#822f55'; g.fillRect(64, h - 91, 17, 7); g.fillRect(141, h - 91, 17, 7);
          poly(g, [[38, h - 106], [62, h - 112], [109, h - 113], [164, h - 109], [185, h - 104], [184, h - 98], [160, h - 101], [105, h - 104], [62, h - 103], [39, h - 100]], '#e56b65');
          line(g, 42, h - 102, 181, h - 102, 2, '#ffd38a');
          g.fillStyle = '#3e3972'; g.fillRect(105, h - 107, 3, 7); poly(g, [[100, h - 107], [106, h - 115], [113, h - 107]], '#3e3972');
          ell(g, 37, h - 26, 34, 15, '#292b61'); ell(g, 186, h - 24, 42, 19, '#30336b');
          for (let x = 15; x < 215; x += 16) ell(g, x, h - 10 - (x % 3) * 2, 5, 2, 'rgba(255,205,130,0.65)');
          txt(g, 'MIYAJIMA', 82, h - 18, 1, '#ffe8a0', '#16254b');
        }],
        sc_jp_fushimi: [230, 190, function (g, w, h, P) {
          g.fillStyle = '#171a42'; g.fillRect(0, h - 8, w, 8);
          for (let i = 0; i < 6; i++) {
            const depth = i / 5, scale = 1 - depth * 0.66, cx = 114 + (i % 2 ? 3 : -3) * depth;
            const base = h - 10 - depth * 78, top = base - 82 * scale, half = 82 * scale;
            g.fillStyle = '#c94c4d'; g.fillRect(cx - half * 0.72, top + 8 * scale, 9 * scale, base - top - 8 * scale); g.fillRect(cx + half * 0.61, top + 8 * scale, 9 * scale, base - top - 8 * scale);
            poly(g, [[cx - half, top + 8 * scale], [cx - half * 0.68, top], [cx + half * 0.68, top], [cx + half, top + 8 * scale], [cx + half * 0.9, top + 12 * scale], [cx - half * 0.9, top + 12 * scale]], '#f06a55');
            g.fillStyle = '#f18b59'; g.fillRect(cx - half * 0.9, top + 12 * scale, half * 1.8, 4 * scale);
            if (i < 3) { txt(g, 'INARI', cx - 11 * scale, top + 26 * scale, 0.65 * scale, '#ffe5a0', '#8e2647'); }
          }
          ell(g, 24, h - 25, 30, 21, '#26365f'); ell(g, 207, h - 32, 34, 25, '#26365f');
          line(g, 114, h - 10, 114, h - 86, 1, P.accent);
          txt(g, 'FUSHIMI INARI', 72, h - 13, 1, '#ffe8a0', '#24204e');
        }],
        sc_jp_kinkakuji: [190, 155, function (g, w, h, P) {
          g.fillStyle = lg(g, 0, h - 45, 0, h, [[0, '#286995'], [1, '#172e68']]); g.fillRect(0, h - 40, w, 40);
          for (let x = 5; x < w; x += 25) line(g, x, h - 20 - (x % 4), x + 16, h - 20 - (x % 4), 0.7, 'rgba(155,225,255,0.6)');
          const gold = lg(g, 45, h - 130, 155, h - 35, [[0, '#fff1a0'], [0.45, '#e3b846'], [1, '#8a573e']]);
          g.fillStyle = gold; g.fillRect(56, h - 81, 80, 46); g.fillRect(66, h - 111, 60, 30); g.fillRect(78, h - 132, 36, 21);
          poly(g, [[47, h - 81], [65, h - 95], [96, h - 101], [145, h - 81], [136, h - 77], [56, h - 77]], '#2b3059');
          poly(g, [[60, h - 111], [73, h - 123], [96, h - 128], [132, h - 111], [125, h - 107], [66, h - 107]], '#30315c');
          poly(g, [[73, h - 132], [85, h - 143], [96, h - 147], [120, h - 132], [113, h - 128], [78, h - 128]], '#34325e');
          line(g, 55, h - 79, 137, h - 79, 1.4, P.accent); line(g, 65, h - 109, 127, h - 109, 1.2, '#fff0a0');
          for (let x = 64; x < 131; x += 16) lit(g, x, h - 68, 6, 10, P.win[(x / 16 | 0) % 3]);
          g.fillStyle = '#d4ad4b'; g.fillRect(94, h - 151, 3, 7); poly(g, [[91, h - 151], [95, h - 157], [99, h - 151]], '#ffe594');
          ell(g, 22, h - 33, 38, 17, '#253d62'); ell(g, 168, h - 34, 36, 16, '#29385e');
          txt(g, 'KINKAKUJI', 69, h - 13, 1, '#ffe8a0', '#1d254b');
        }],
        sc_jp_shinkansen: [250, 125, function (g, w, h, P) {
          g.fillStyle = '#494a79'; g.fillRect(0, h - 29, w, 29); g.fillStyle = '#a8b7db'; g.fillRect(0, h - 32, w, 4);
          for (let x = 10; x < w; x += 21) { line(g, x, h - 26, x + 12, h - 3, 2, '#777fa9'); }
          const body = lg(g, 27, h - 86, 27, h - 32, [[0, '#f5f4ff'], [0.5, '#a9c5ed'], [1, '#59669b']]);
          g.fillStyle = body; g.beginPath(); g.moveTo(20, h - 52); g.quadraticCurveTo(55, h - 60, 82, h - 92); g.lineTo(208, h - 92); g.quadraticCurveTo(228, h - 89, 237, h - 72); g.lineTo(237, h - 40); g.quadraticCurveTo(235, h - 32, 222, h - 32); g.lineTo(32, h - 32); g.quadraticCurveTo(20, h - 34, 20, h - 44); g.closePath(); g.fill();
          g.strokeStyle = P.accent; g.lineWidth = 1.4; g.beginPath(); g.moveTo(27, h - 50); g.quadraticCurveTo(64, h - 58, 84, h - 87); g.lineTo(229, h - 87); g.stroke();
          g.fillStyle = '#e83f59'; g.beginPath(); g.moveTo(22, h - 48); g.quadraticCurveTo(58, h - 54, 78, h - 72); g.lineTo(235, h - 72); g.lineTo(237, h - 63); g.quadraticCurveTo(60, h - 61, 22, h - 48); g.fill();
          for (let x = 99; x < 211; x += 22) { lit(g, x, h - 82, 13, 8, '#b9edff'); }
          for (let x = 59; x < 220; x += 39) { ell(g, x, h - 31, 8, 4, '#211f48'); ell(g, x, h - 31, 4, 2, '#d4deff'); }
          g.fillStyle = '#343960'; g.fillRect(0, h - 3, w, 3); txt(g, 'SHINKANSEN', 104, h - 42, 1, '#fff1a0', '#30335c');
        }]
      });
  };

  AH.ArtModules.stages['worlds.tokyo.scenery.128'] = function (C) {
    const { SC, commuterTrain, ell, lg, limb, line, lit, msLogo, poly, rng, rrect, txt, txtW } = C;

    Object.assign(SC.japaneast, {
        sc_jp_metro: [320, 180, function (g, w, h) {
          g.fillStyle = '#4c626f'; g.fillRect(3, 73, 314, 75);
          poly(g, [[0, 74], [36, 34], [282, 34], [320, 74]], lg(g, 0, 34, 0, 74, [[0, '#9aa9ae'], [1, '#3c5664']]));
          for (let x = 20; x < 308; x += 24) { line(g, x, 48, x, 128, 2, '#c2c7bf'); line(g, x, 49, x + 18, 66, 0.8, '#d6d3c4'); }
          g.fillStyle = '#202f40'; g.fillRect(15, 76, 290, 39);
          for (let x = 25; x < 300; x += 29) lit(g, x, 79, 20, 3, '#f4dfb1');
          rrect(g, 72, 43, 175, 23, 2, '#e3e5da');
          ell(g, 86, 54, 8, 8, '#e9982e'); txt(g, 'G', 82.4, 50.3, 1, '#283d53');
          txt(g, 'SHIBUYA - G01', 101, 48, 1.25, '#1e4057');
          g.save(); g.translate(35, 83); commuterTrain(g, C.part('tokyo', 'commuterTrain')); g.restore();
          g.fillStyle = '#91a0a5'; g.fillRect(0, 127, 320, 6);
          for (let x = 22; x < 314; x += 72) { g.fillStyle = '#606f79'; g.fillRect(x, 133, 12, 47); line(g, x + 2, 135, x + 2, 178, 1, '#a7b3b0'); }
          rrect(g, 198, 139, 103, 17, 1, '#087caa'); txt(g, 'TOKYO METRO', 207, 144, 0.9, '#ffffff');
          g.fillStyle = '#283b4c'; g.fillRect(0, 172, w, 8);
          [51, 120, 184].forEach((x) => { ell(g, x, 161, 2, 2.5, '#caa18c'); line(g, x, 164, x, 171, 3, '#3f5b77'); });
        }],
        sc_jp_billboards: [300, 240, function (g, w, h) {
          const ads = [['AZURE', '#147cb3'], ['COPILOT', '#5a589d'], ['GITHUB', '#255341'], ['XBOX', '#287647'], ['TEAMS', '#6555a3'], ['TOKYO', '#ad416c']];
          [10, 110, 211].forEach((x, i) => {
            const top = [22, 0, 35][i], bw = i === 1 ? 93 : 80;
            g.fillStyle = lg(g, 0, top, 0, h, [[0, '#414f69'], [1, '#18283d']]); g.fillRect(x, top, bw, h - top - 26);
            for (let y = top + 8; y < 198; y += 10) for (let wx = x + 5; wx < x + bw - 4; wx += 10) lit(g, wx, y, 5, 4, '#a9bdc8');
            for (let ad = 0; ad < 2; ad++) {
              const a = ads[i * 2 + ad], y = top + 12 + ad * 76;
              rrect(g, x + 3, y, bw - 6, 62, 2, '#b4cccd');
              g.fillStyle = lg(g, 0, y, 0, y + 60, [[0, a[1]], [1, '#152a42']]); g.fillRect(x + 5, y + 2, bw - 10, 58);
              if (!i && !ad) msLogo(g, x + 26, y + 8, 22);
              else { ell(g, x + bw / 2, y + 24, 15, 12, 'rgba(217,243,235,0.2)'); txt(g, ad ? 'CLOUD' : 'AI', x + 24, y + 18, 1, '#e6ece2'); }
              txt(g, a[0], x + bw / 2 - txtW(a[0], 1.1) / 2, y + 43, 1.1, '#ffffff');
            }
          });
          g.fillStyle = '#29364a'; g.fillRect(0, 215, w, 25);
          for (let x = -20; x < 300; x += 22) poly(g, [[x, 240], [x + 13, 220], [x + 23, 220], [x + 10, 240]], '#c1c9c5');
          const r = rng(754);
          for (let i = 0; i < 29; i++) {
            const x = 9 + r() * 280, y = 216 + r() * 14;
            ell(g, x, y - 5, 1.5, 1.8, '#bfa493'); line(g, x, y - 3, x + 1, y + 1, 2.8, ['#314a66', '#a16b75', '#c4b397'][i % 3]);
            line(g, x, y + 1, x - 1.5, y + 4, 0.7, '#1b293e'); line(g, x + 1, y + 1, x + 2.5, y + 4, 0.7, '#1b293e');
          }
          [4, 294].forEach((x) => { line(g, x, 193, x, 232, 1.3, '#58717c'); rrect(g, x - 3, 190, 6, 13, 1, '#193443'); ell(g, x, 199, 1.7, 1.7, '#7dbb89'); });
        }],
        sc_jp_sakura: [260, 160, function (g, w, h) {
          const r = rng(912);
          for (let t = 0; t < 3; t++) {
            const x = 43 + t * 85, top = 33 + (t % 2) * 13;
            limb(g, x, h, x - 5, top + 44, 7, '#644d5a', '#a6807a');
            [[-30, 7], [24, -4], [-7, -15], [37, 21]].forEach(([dx, dy]) => {
              line(g, x - 4, top + 52, x + dx, top + dy + 17, 2.4, '#725662');
              for (let i = 0; i < 27; i++) {
                const bx = x + dx + (r() - 0.5) * 45, by = top + dy + (r() - 0.5) * 24;
                ell(g, bx, by, 4 + r() * 5, 2.6 + r() * 3, ['#d885b3', '#efb1ca', '#f7d4df', '#ffe6e7'][i % 4]);
                ell(g, bx + 1, by - 1, 0.8, 0.7, '#fff0e6');
              }
            });
          }
          g.fillStyle = '#6e6667'; g.fillRect(0, h - 9, w, 9);
          for (let i = 0; i < 60; i++) ell(g, r() * w, h - r() * 18, 1.5, 0.6, '#f3c9df');
          line(g, 0, h - 10, w, h - 10, 1, '#c1bba7');
        }]
      });
  };

  content.parts['panorama'] = function (C) {
    const { PAL } = C;
    const fuji = (...args) => C.fuji(...args);
    const skyline = (...args) => C.skyline(...args);
    const tokyoTower = (...args) => C.tokyoTower(...args);

    return function (g, w, h) {
    const P = PAL['japaneast'];
    const base = h - 6;
    
            fuji(g, 190, base, 0.95, P);
            skyline(w, h, 67, '#2a1070', P.accent, 18, 54, 0.3, P.win)(g);
            tokyoTower(g, 470, base, 0.8, P);
            skyline(w, h, 68, '#341278', P.accent, 6, 26, 0.35, P.win)(g);
          
    };
  };

  content.parts['plainPanorama'] = function (C) {
    const { PAL } = C;
    const fuji = (...args) => C.fuji(...args);
    const skyline = (...args) => C.skyline(...args);

    return function (g, w, h) {
    const P = PAL['japaneast'];
    const base = h - 6;
     fuji(g, 190, base, 0.95, P); skyline(w, h, 167, '#2a1070', P.accent, 18, 54, 0.3, P.win)(g); 
    };
  };

  content.parts['MP_japaneast'] = function (C) {

    return { top: '#4a1a80', bot: '#6a2a9a', accent: '#ff7a9a', win: ['#ffd0e0', '#ff7a9a', '#7fe8ff'] };
  };

  content.parts['SC_japaneast'] = function (C) {
    const { ell, glowRect, lg, lit, msLogo, pagoda, poly, rng, rrect, silFill, tokyoTower, torii, tree, txt } = C;

    return {
          sc_jp_neon1: [110, 230, function (g, w, h, P) {
            g.fillStyle = silFill(g, h - 220, h, '#3a1a7a', '#1a0a40'); g.fillRect(10, h - 220, 90, 220);
            const r = rng(501);
            for (let y = h - 210; y < h - 6; y += 8) for (let x = 16; x < 92; x += 7) if (r() < 0.5) lit(g, x, y, 4, 4, P.win[Math.floor(r() * 3)]);
            [['#ff2a9a', 4], ['#27e0ff', 96]].forEach(function (s) { glowRect(g, s[0], s[1], h - 180, 10, 90); g.fillStyle = s[0]; g.fillRect(s[1], h - 180, 10, 90); for (let k = 0; k < 6; k++) { g.fillStyle = '#ffffff'; g.fillRect(s[1] + 2, h - 172 + k * 14, 6, 2); g.fillRect(s[1] + 4, h - 176 + k * 14, 2, 10); } });
            g.fillStyle = 'rgba(10,6,30,0.9)'; g.fillRect(20, h - 120, 70, 26); msLogo(g, 24, h - 115, 16); txt(g, 'XBOX', 44, h - 112, 1, '#7dff7a');
          }],
          sc_jp_neon2: [90, 180, function (g, w, h, P) {
            g.fillStyle = silFill(g, h - 170, h, '#5a1a6a', '#200a40'); g.fillRect(5, h - 170, 80, 170);
            for (let y = h - 160; y < h - 10; y += 22) { const c = ['#ff7ad9', '#ffe14a', '#27e0ff', '#7dff7a'][(y / 22 | 0) % 4]; glowRect(g, c, 10, y, 70, 10); g.fillStyle = c; g.fillRect(10, y, 70, 10); g.fillStyle = 'rgba(10,4,30,0.8)'; for (let x = 14; x < 76; x += 9) g.fillRect(x, y + 2, 5, 6); }
          }],
          sc_jp_skytree: [70, 260, function (g, w, h, P) {
            poly(g, [[15, h], [31, h - 200], [33, h - 250], [37, h - 250], [39, h - 200], [55, h]], lg(g, 15, 0, 55, 0, [[0, '#a8b8ff'], [0.5, '#ffffff'], [1, '#6a6ad8']]));
            g.strokeStyle = 'rgba(40,40,120,0.6)'; g.lineWidth = 0.6; for (let y = h; y > h - 200; y -= 8) { const k = (h - y) / 200, hw = 20 - k * 16; g.beginPath(); g.moveTo(35 - hw, y); g.lineTo(35 + hw, y - 8); g.moveTo(35 + hw, y); g.lineTo(35 - hw, y - 8); g.stroke(); }
            rrect(g, 26, h - 150, 18, 8, 2, '#c8d8ff'); rrect(g, 28, h - 196, 14, 6, 2, '#c8d8ff');
            for (let k = 0; k < 4; k++) lit(g, 27 + k * 4.4, h - 147, 2, 2, '#7fe8ff');
            lit(g, 34, h - 254, 2, 3, '#ff2a4a');
          }],
          sc_jp_tower: [90, 230, function (g, w, h, P) { tokyoTower(g, 45, h, 1.12, P); }],
          sc_jp_shrine: [200, 150, function (g, w, h, P) { pagoda(g, 140, h, 1.3, P); torii(g, 50, h, 1.1, P); }],
          sc_jp_sakura: [160, 100, function (g, w, h, P) { for (let x = 25; x < w; x += 55) tree(g, x, h, 70, '#ffa8d8'); const r = rng(9); for (let i = 0; i < 40; i++) ell(g, r() * w, h - r() * 90, 1, 0.7, '#ffd8ec'); }]
        };
  };

  content.parts['SC_EXTRA_japaneast'] = function (C) {
    const { ell, glowRect, lg, lit, msLogo, poly, rng, silFill, txt } = C;

    return {
          sc_jp_shibuya: [190, 200, function (g, w, h, P) {
            g.fillStyle = silFill(g, h - 190, h, '#3a1a7a', '#1a0a40'); g.fillRect(10, h - 170, 90, 170); g.fillRect(100, h - 190, 80, 190);
            [[16, h - 160, 78, 46, '#27e0ff'], [106, h - 182, 68, 40, '#ff7ad9'], [106, h - 130, 68, 30, '#7dff7a']].forEach(function (s, i) {
              glowRect(g, s[4], s[0], s[1], s[2], s[3]); g.fillStyle = '#0a0a2a'; g.fillRect(s[0], s[1], s[2], s[3]);
              g.fillStyle = lg(g, s[0], s[1], s[0] + s[2], s[1] + s[3], [[0, s[4]], [1, '#2a0a5a']]); g.fillRect(s[0] + 2, s[1] + 2, s[2] - 4, s[3] - 4);
              if (i === 0) { msLogo(g, s[0] + 6, s[1] + 12, 20); txt(g, 'AZURE', s[0] + 32, s[1] + 18, 1, '#ffffff'); }
              if (i === 1) txt(g, 'COPILOT', s[0] + 12, s[1] + 16, 1, '#ffffff');
              if (i === 2) txt(g, 'XBOX', s[0] + 22, s[1] + 11, 1, '#0a2a0a');
            });
            const r = rng(531); for (let y = h - 100; y < h - 20; y += 8) for (let x = 16; x < 176; x += 7) if (r() < 0.4) lit(g, x, y, 4, 4, P.win[Math.floor(r() * 3)]);
            g.fillStyle = '#f4ecff'; for (let x = 0; x < w; x += 10) g.fillRect(x, h - 6, 6, 6);
          }],
          sc_jp_lanterns: [170, 110, function (g, w, h, P) {
            for (let k = 0; k < 4; k++) { const x = k * 42; g.fillStyle = silFill(g, h - 80, h, '#5a2a4a', '#2a0a2a'); g.fillRect(x, h - 70 - k % 2 * 10, 40, 70 + k % 2 * 10); poly(g, [[x - 3, h - 70 - k % 2 * 10], [x + 20, h - 82 - k % 2 * 10], [x + 43, h - 70 - k % 2 * 10]], '#2a1a3a'); g.fillStyle = '#ffd890'; g.fillRect(x + 6, h - 30, 28, 30); g.fillStyle = '#2a1a5a'; g.fillRect(x + 6, h - 30, 28, 8); }
            g.strokeStyle = '#14082a'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, h - 46); g.quadraticCurveTo(85, h - 36, 170, h - 46); g.stroke();
            for (let k = 0; k < 11; k++) { const x = 8 + k * 15, y = h - 46 + Math.sin(k / 10 * Math.PI) * 9; glowRect(g, '#ff3a3a', x - 4, y, 8, 10); ell(g, x, y + 5, 3.4, 4.6, '#ff2a2a'); g.fillStyle = '#1a0a0a'; g.fillRect(x - 3, y + 1, 6, 1); g.fillRect(x - 3, y + 9, 6, 1); }
          }]
        };
  };

  content.parts['panoramaLandmarks_japaneast'] = function (C) {

    return ['sc_jp_tower'];
  };

  content.parts['sceneryRoutes_japaneast'] = function (C) {

    return [[0, 'sc_jp_billboards'], [0.15, 'sc_jp_metro', 325], [0.34, 'sc_jp_sakura', 300], [0.56, 'sc_jp_shibuya'], [0.76, 'sc_jp_sakura', 300]];
  };
})();
