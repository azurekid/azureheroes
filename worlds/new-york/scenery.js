/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['new-york'] = AH.Worlds['new-york'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { sceneryStars: 1, panoramaLandmarks: 9, sceneryRoutes: 3 };
  AH.ArtModules.regions['eastus2'] = content;

  AH.ArtModules.stages['worlds.new-york.scenery.19'] = function (C) {
    const { ell, glowRect, lg, line, lit, poly } = C;

    Object.assign(C, { nyLiberty, nyEmpire, nyChrysler, nyBridge });
    function nyLiberty(g, x, base, s, P) {
        g.save(); g.translate(x, base); g.scale(s, s);
        g.fillStyle = '#294f67'; g.fillRect(-15, -12, 30, 12); g.fillRect(-12, -20, 24, 8);
        line(g, -17, -12, 17, -12, 1, '#91c9c1'); line(g, -13, -20, 13, -20, 1, '#91c9c1');
        poly(g, [[-7, -21], [-8, -39], [-5, -46], [4, -46], [8, -39], [7, -21]], lg(g, -8, -48, 8, -20, [[0, '#b8c2a0'], [0.5, '#668f87'], [1, '#315a68']]));
        poly(g, [[-7, -38], [-13, -33], [-12, -29], [-5, -33], [-1, -24], [5, -22], [8, -24], [4, -34], [2, -40]], '#638e87');
        ell(g, 0, -49, 4.3, 5, '#83a99b');
        poly(g, [[-6, -52], [-4, -59], [-1, -54], [1, -61], [3, -54], [7, -58], [6, -51]], '#83a99b');
        for (let i = 0; i < 7; i++) line(g, -6 + i * 2, -54, -6 + i * 2, -58 - (i % 2) * 2, 0.8, '#d2d3b0');
        line(g, 6, -39, 12, -49, 2, '#73988d'); line(g, 12, -49, 11, -62, 1.8, '#b6c4a4');
        ell(g, 11, -64, 3.2, 2.4, '#ffd36f'); glowRect(g, '#ffd36f', 8, -67, 6, 6);
        line(g, -3, -46, -2, -34, 0.7, 'rgba(230,239,209,0.75)'); line(g, 3, -46, 2, -34, 0.7, 'rgba(230,239,209,0.65)');
        line(g, -4, -29, 4, -29, 0.6, '#2e5261'); line(g, -4, -26, 4, -26, 0.6, '#2e5261');
        g.restore();
      }

    function nyEmpire(g, x, base, s, P) {
        g.save(); g.translate(x, base); g.scale(s, s);
        const fill = lg(g, -27, -132, 28, 0, [[0, '#8391aa'], [0.42, '#526681'], [1, '#293b5c']]);
        g.fillStyle = fill; g.fillRect(-25, -102, 50, 102); g.fillRect(-21, -115, 42, 13); g.fillRect(-16, -123, 32, 8); g.fillRect(-10, -129, 20, 6);
        g.fillRect(-6, -140, 12, 11); g.fillRect(-3, -151, 6, 11);
        poly(g, [[-3, -151], [0, -166], [3, -151]], '#9db0c5'); line(g, 0, -166, 0, -177, 1, '#ffd895');
        for (let y = -96; y < -10; y += 11) {
          line(g, -22, y, 22, y, 0.7, 'rgba(186,211,224,0.42)');
          for (let wx = -18; wx < 20; wx += 8) lit(g, wx, y + 2, 3, 5, P.win[(Math.abs(wx + y) / 8 | 0) % 3]);
        }
        for (let y = -113; y < -101; y += 5) { lit(g, -15, y, 3, 3, P.win[0]); lit(g, 12, y, 3, 3, P.win[1]); }
        g.fillStyle = '#253552'; g.fillRect(-29, -7, 58, 7);
        g.restore();
      }

    function nyChrysler(g, x, base, s, P) {
        g.save(); g.translate(x, base); g.scale(s, s);
        const body = lg(g, -27, -113, 24, 0, [[0, '#a2abb4'], [0.45, '#687a8b'], [1, '#35475e']]);
        g.fillStyle = body; g.fillRect(-19, -86, 38, 86); g.fillRect(-16, -96, 32, 10); g.fillRect(-13, -104, 26, 8); g.fillRect(-10, -110, 20, 6);
        g.fillStyle = '#b7c1bd'; g.beginPath(); g.moveTo(-12, -110); g.quadraticCurveTo(-9, -122, 0, -128); g.quadraticCurveTo(9, -122, 12, -110); g.closePath(); g.fill();
        for (let k = 0; k < 5; k++) {
          const y = -110 - k * 3.5, r = 13 - k * 1.9;
          g.beginPath(); g.arc(0, y, r, Math.PI, 0); g.strokeStyle = k % 2 ? '#d2d5cb' : '#87999f'; g.lineWidth = 1.5; g.stroke();
          for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 4) line(g, 0, y, Math.cos(a) * r, y + Math.sin(a) * r, 0.6, '#d1d1c5');
        }
        poly(g, [[-3, -128], [0, -153], [3, -128]], '#c7c7b9'); line(g, 0, -153, 0, -165, 1, '#ffd58e');
        for (let y = -81; y < -7; y += 12) { for (let wx = -14; wx < 15; wx += 9) lit(g, wx, y, 4, 6, P.win[(Math.abs(y + wx) / 3 | 0) % 3]); }
        line(g, -18, -86, 18, -86, 0.8, '#d4ccb0'); line(g, -15, -96, 15, -96, 0.8, '#d4ccb0');
        g.fillStyle = '#263950'; g.fillRect(-23, -5, 46, 5);
        g.restore();
      }

    function nyBridge(g, x, base, s, P) {
        g.save(); g.translate(x, base); g.scale(s, s);
        const deck = -25, towers = [39, 218];
        g.fillStyle = '#495a74'; g.fillRect(0, deck, 278, 4); line(g, 0, deck, 278, deck, 1, '#c2b9a2');
        towers.forEach(function (tx) {
          g.fillStyle = '#77829a'; g.fillRect(tx - 6, -94, 12, 69); g.fillRect(tx - 11, -96, 22, 3); g.fillRect(tx - 10, -63, 20, 3);
          g.fillStyle = '#1d3454'; g.fillRect(tx - 2, -92, 1.4, 66); g.fillRect(tx + 1, -92, 1.4, 66);
          poly(g, [[tx - 8, -94], [tx, -105], [tx + 8, -94]], '#9ca7a9');
          line(g, tx, -105, tx, -97, 0.8, '#d0c6a9');
        });
        g.strokeStyle = '#a4b2b7'; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(0, -56); g.quadraticCurveTo(39, -105, 88, -61); g.quadraticCurveTo(138, -27, 168, -60); g.quadraticCurveTo(218, -105, 278, -56); g.stroke();
        g.lineWidth = 0.6;
        for (let xw = 8; xw < 278; xw += 8) { const arch = xw < 39 ? -56 - xw * 1.1 : xw < 218 ? -61 + Math.sin((xw - 39) / 179 * Math.PI) * 42 : -56 - (278 - xw) * 1.1; line(g, xw, deck, xw, arch, 0.55, '#9ca8ae'); }
        for (let xw = 10; xw < 276; xw += 24) lit(g, xw, deck - 8, 2, 2.5, P.win[0]);
        g.restore();
      }
  };

  AH.ArtModules.stages['worlds.new-york.scenery.26'] = function (C) {
    const { FLAT, PAL, lit, reg2, skyline } = C;

    reg2('bg_near_eastus2', 640, 190, function (g, w, h) {
        const P = PAL.eastus2;
        skyline(w, h, 211, '#172344', P.accent, 36, 105, 0.3, P.win)(g);
        for (let tile = 0; tile < w; tile += 160) {
          g.fillStyle = 'rgba(12,25,48,0.88)'; g.fillRect(tile, h - 37, 160, 37);
          g.fillStyle = '#496078'; g.fillRect(tile, h - 39, 160, 2);
          for (let x = tile + 5; x < tile + 156; x += 16) {
            g.fillStyle = '#233650'; g.fillRect(x, h - 31, 11, 24);
            lit(g, x + 1.4, h - 29, 7.5, 18, P.win[(x / 16 | 0) % 3]);
          }
          g.fillStyle = '#d7bd93'; g.fillRect(tile + 6, h - 5, 148, 1);
        }
      }, FLAT);
  };

  AH.ArtModules.stages['worlds.new-york.scenery.82'] = function (C) {
    const { MP, SC, ell, lamp, lg, line, lit, msLogo, nyBridge, nyChrysler, nyEmpire, nyLiberty, poly, silFill, tree, txt } = C;

    MP.eastus2 = { top: '#243c69', bot: '#6b476f', accent: '#ffb36b', win: ['#ffe9a0', '#98d9ff', '#ff9e86'] };

    Object.assign(SC, {
        eastus2: {
          sc_ny_liberty: [150, 178, function (g, w, h, P) { nyLiberty(g, 75, h - 4, 1.7, P); }],
          sc_ny_empire: [100, 194, function (g, w, h, P) { nyEmpire(g, 50, h - 4, 1.18, P); }],
          sc_ny_chrysler: [80, 188, function (g, w, h, P) { nyChrysler(g, 40, h - 4, 1.1, P); }],
          sc_ny_brooklynbridge: [300, 126, function (g, w, h, P) { nyBridge(g, 8, h - 4, 1.02, P); }],
          sc_ny_times: [300, 235, function (g, w, h, P) {
            const base = h - 3;
            const tower = function (x, width, tall, wall) {
              g.fillStyle = silFill(g, base - tall, base, wall, '#202a4a'); g.fillRect(x, base - tall, width, tall);
              g.fillStyle = '#d6c6a9'; g.fillRect(x, base - tall, width, 3); g.fillRect(x, base - 25, width, 2);
              for (let y = base - tall + 9; y < base - 28; y += 14) {
                for (let wx = x + 7; wx < x + width - 6; wx += 13) {
                  g.fillStyle = '#24324e'; g.fillRect(wx, y, 7, 9);
                  lit(g, wx + 1, y + 1, 5, 6, P.win[((wx + y) / 13 | 0) % 3]);
                }
              }
            };
            tower(0, 76, 158, '#68496f'); tower(225, 75, 181, '#4b4c73');
            g.fillStyle = '#1e2844'; g.fillRect(81, base - 196, 140, 193); g.fillRect(84, base - 200, 134, 5);
            g.fillStyle = '#19223e'; g.fillRect(87, base - 184, 127, 61);
            const neon = lg(g, 90, base - 184, 90, base - 123, [[0, '#173d79'], [0.5, '#126eaa'], [1, '#1a2647']]);
            g.fillStyle = neon; g.fillRect(90, base - 184, 121, 61); g.strokeStyle = '#56d9ff'; g.lineWidth = 1.3; g.strokeRect(90, base - 184, 121, 61);
            g.globalAlpha = 0.18; msLogo(g, 113, base - 177, 42); g.globalAlpha = 1;
            msLogo(g, 103, base - 168, 18); txt(g, 'AZURE', 130, base - 163, 1.8, '#d6f8ff');
            txt(g, 'CLOUD FOR ALL', 106, base - 135, 0.62, '#ffe9a0');
            g.fillStyle = '#1a2340'; g.fillRect(83, base - 112, 137, 83);
            g.fillStyle = '#df3e66'; g.fillRect(88, base - 104, 126, 28); txt(g, 'NEW YORK', 115, base - 95, 1.3, '#fff0d6');
            g.fillStyle = '#202642'; g.fillRect(0, base - 24, 300, 24);
            for (let x = 4; x < 298; x += 16) { lit(g, x, base - 21, 7, 12, P.win[(x / 16 | 0) % 3]); }
            [24, 269].forEach((x) => lamp(g, x, base, 32, '#ffc969'));
            line(g, 2, base - 2, 296, base - 2, 1, '#f4bd78');
          }],
          sc_ny_brownstones: [250, 188, function (g, w, h, P) {
            const base = h - 3;
            for (let i = 0; i < 3; i++) {
              const x = i * 82, width = i === 1 ? 84 : 78, tall = [122, 145, 128][i], top = base - tall;
              const brick = ['#794c54', '#995c55', '#69455a'][i];
              g.fillStyle = silFill(g, top, base, brick, '#322c4b'); g.fillRect(x, top, width, tall);
              g.fillStyle = '#c99b77'; g.fillRect(x - 2, top, width + 4, 4); g.fillRect(x + 3, top + 23, width - 6, 2);
              poly(g, [[x - 3, top], [x + width / 2, top - 8], [x + width + 3, top]], '#44314b');
              for (let y = top + 11; y < base - 32; y += 22) {
                for (let wx = x + 9; wx < x + width - 7; wx += 24) {
                  g.fillStyle = '#302b43'; g.fillRect(wx, y, 13, 14); g.fillStyle = '#a8c9cb'; g.fillRect(wx + 1, y + 1, 11, 10);
                  g.fillStyle = '#302b43'; g.fillRect(wx + 6, y, 1, 12); g.fillRect(wx, y + 5, 13, 1);
                  g.fillStyle = '#d2ad85'; g.fillRect(wx - 1, y + 12, 15, 2);
                }
              }
              g.fillStyle = '#342640'; g.fillRect(x + width / 2 - 9, base - 31, 18, 31);
              g.fillStyle = '#b98161'; g.fillRect(x + width / 2 - 12, base - 32, 24, 3);
              for (let step = 0; step < 4; step++) { g.fillStyle = step % 2 ? '#a9795f' : '#c08b68'; g.fillRect(x + width / 2 - 16 + step * 2, base - 6 + step * 1.4, 32 - step * 4, 2); }
              for (let y = top + 12; y < base - 37; y += 18) {
                const fx = x + width - 12;
                line(g, fx, y, fx + 9, y, 1, '#302941'); line(g, fx + 9, y, fx + 9, y + 5, 0.9, '#302941');
                line(g, fx + 9, y + 5, fx - 2, y + 5, 0.9, '#302941');
                line(g, fx - 2, y + 5, fx - 2, y + 11, 0.9, '#302941');
                line(g, fx - 3, y + 10, fx + 10, y + 10, 0.7, '#c2a282');
              }
            }
            g.fillStyle = '#24283f'; g.fillRect(0, base - 2, w, 2);
            [27, 119, 207].forEach((x) => lamp(g, x, base - 1, 33, '#ffd17c'));
            txt(g, 'BROWNSTONES', 81, base - 10, 0.78, '#ffe8bd');
          }],
          sc_ny_subway: [200, 168, function (g, w, h, P) {
            const base = h - 3;
            g.fillStyle = '#5e5c70'; g.fillRect(2, base - 87, 196, 5);
            g.fillStyle = '#bcb29f'; g.fillRect(5, base - 82, 190, 5);
            for (let i = 0; i < 7; i++) {
              const y = base - 75 + i * 10, left = 43 + i * 7, right = 157 - i * 7;
              g.fillStyle = i % 2 ? '#a79484' : '#857c7e'; g.fillRect(left, y, right - left, 9);
              g.fillStyle = 'rgba(255,220,172,0.2)'; g.fillRect(left + 3, y + 1, right - left - 6, 1);
            }
            g.fillStyle = '#384355'; g.fillRect(39, base - 78, 4, 72); g.fillRect(157, base - 78, 4, 72);
            line(g, 41, base - 78, 18, base - 105, 2.2, '#c6bda8'); line(g, 159, base - 78, 182, base - 105, 2.2, '#c6bda8');
            line(g, 18, base - 105, 182, base - 105, 2.2, '#c6bda8');
            g.fillStyle = '#162944'; g.fillRect(45, base - 151, 110, 38);
            g.fillStyle = '#f1ede0'; g.fillRect(49, base - 147, 102, 30);
            ell(g, 72, base - 132, 13, 13, '#d73d50'); ell(g, 72, base - 132, 9.5, 9.5, '#f5f0df');
            txt(g, 'M', 68.5, base - 137, 1.35, '#245e9b');
            txt(g, 'SUBWAY', 91, base - 138, 1.15, '#1b426c');
            txt(g, '42 ST', 104, base - 124, 0.75, '#bf3344');
            for (let x = 5; x < 196; x += 16) { g.fillStyle = '#252b42'; g.fillRect(x, base - 7, 12, 7); }
            g.fillStyle = '#d5c8ae'; g.fillRect(0, base - 3, w, 3);
          }],
          sc_ny_centralpark: [250, 164, function (g, w, h, P) {
            const base = h - 3;
            g.fillStyle = '#263d4e'; g.fillRect(0, base - 20, w, 20);
            g.fillStyle = '#6e7667'; g.beginPath(); g.moveTo(0, base - 21); g.quadraticCurveTo(118, base - 69, 250, base - 23); g.lineTo(250, base); g.lineTo(0, base); g.closePath(); g.fill();
            g.fillStyle = '#a29a7a'; g.beginPath(); g.moveTo(74, base); g.quadraticCurveTo(125, base - 50, 177, base - 3); g.lineTo(167, base); g.closePath(); g.fill();
            [[25, 117, '#35624a'], [64, 112, '#3e7251'], [192, 126, '#346148'], [228, 107, '#3f704c']].forEach((t) => tree(g, t[0], base - 15, t[1], t[2]));
            for (let x = 7; x < 68; x += 14) { line(g, x, base - 27, x, base - 44, 0.8, '#c5c6b3'); ell(g, x, base - 44, 1.8, 2, '#ffe09c'); }
            line(g, 95, base - 20, 95, base - 35, 1.2, '#31384a'); line(g, 95, base - 34, 123, base - 34, 1.2, '#31384a');
            line(g, 95, base - 27, 123, base - 27, 1.2, '#31384a'); [98, 120].forEach((x) => line(g, x, base - 27, x, base - 19, 1, '#31384a'));
            g.fillStyle = '#d1be92'; g.fillRect(5, base - 17, 240, 2);
            txt(g, 'CENTRAL PARK', 81, base - 11, 0.76, '#e8e4c4');
          }],
          sc_ny_midtown: [230, 224, function (g, w, h, P) {
            const base = h - 3, buildings = [[2, 61, 142], [68, 65, 183], [140, 86, 164], [192, 38, 207]];
            buildings.forEach(function (b, i) {
              const x = b[0], width = b[1], tall = b[2], top = base - tall;
              g.fillStyle = silFill(g, top, base, ['#3d5272', '#4b526d', '#3b465f', '#59495e'][i], '#202942'); g.fillRect(x, top, width, tall);
              if (i === 1) { g.fillStyle = '#6d7f91'; g.fillRect(x + width / 2 - 3, top - 19, 6, 19); line(g, x + width / 2, top - 31, x + width / 2, top - 19, 1, '#ffd38b'); }
              if (i === 2) { g.fillStyle = '#89939a'; g.fillRect(x + 9, top - 8, width - 18, 8); }
              for (let y = top + 8; y < base - 10; y += 12) {
                g.fillStyle = 'rgba(12,26,47,0.7)'; g.fillRect(x + 4, y, width - 8, 8);
                for (let wx = x + 7; wx < x + width - 6; wx += 9) lit(g, wx, y + 1, 4, 5, P.win[(wx + y + i) % 3]);
              }
              for (let y = top + 2; y < base - 4; y += 20) line(g, x + 2, y, x + width - 2, y, 0.55, 'rgba(200,218,222,0.35)');
            });
            g.fillStyle = '#20283f'; g.fillRect(0, base - 3, w, 3);
            [28, 211].forEach((x) => lamp(g, x, base - 2, 38, '#ffc978'));
            txt(g, 'MANHATTAN', 84, base - 10, 0.75, '#ffe6ad');
          }],
          sc_ny_pier: [270, 156, function (g, w, h, P) {
            const base = h - 3, water = base - 36;
            g.fillStyle = lg(g, 0, water, 0, base, [[0, '#527d91'], [1, '#1f3b59']]); g.fillRect(0, water, w, base - water);
            for (let y = water + 8; y < base; y += 12) for (let x = 8 + (y % 3) * 7; x < w; x += 45) line(g, x, y, x + 27, y + 1, 0.7, 'rgba(192,225,230,0.46)');
            g.fillStyle = '#433c4d'; g.fillRect(0, base - 82, w, 7); g.fillStyle = '#8c806f'; g.fillRect(0, base - 86, w, 4);
            for (let x = 8; x < w; x += 28) { g.fillStyle = '#473b43'; g.fillRect(x, base - 78, 5, 78); line(g, x, base - 76, x + 3, base - 4, 0.8, '#927259'); }
            g.fillStyle = '#68574a'; g.fillRect(0, base - 113, w, 27);
            g.fillStyle = '#b89d75'; g.fillRect(0, base - 116, w, 3);
            for (let x = 11; x < w; x += 29) { g.fillStyle = '#292a3b'; g.fillRect(x, base - 108, 16, 14); lit(g, x + 2, base - 106, 12, 10, P.win[(x / 29 | 0) % 3]); }
            [27, 127, 230].forEach((x) => { line(g, x, base - 116, x, base - 140, 1.2, '#5e5147'); ell(g, x, base - 140, 3, 3, '#ffdc8a'); });
            txt(g, 'HUDSON PIER', 83, base - 92, 0.75, '#f7e4c1');
          }],
          sc_ny_elevated: [280, 164, function (g, w, h, P) {
            const base = h - 3;
            for (let x = 20; x < w; x += 84) {
              g.fillStyle = '#4d5364'; g.fillRect(x, base - 98, 5, 98); g.fillRect(x - 11, base - 99, 28, 4);
              line(g, x - 6, base - 98, x + 2, base - 3, 0.8, '#88939b');
            }
            g.fillStyle = '#49576a'; g.fillRect(0, base - 101, w, 5); g.fillStyle = '#aeb6b4'; g.fillRect(0, base - 104, w, 3);
            for (let x = 2; x < w; x += 18) g.fillStyle = '#5c6573', g.fillRect(x, base - 94, 2, 7);
            g.fillStyle = '#1a263b'; g.fillRect(20, base - 79, 235, 25); g.fillStyle = '#1c5d91'; g.fillRect(20, base - 62, 235, 6); g.fillStyle = '#e28c4c'; g.fillRect(20, base - 56, 235, 2);
            for (let x = 27; x < 242; x += 22) { g.fillStyle = '#10203a'; g.fillRect(x, base - 75, 15, 11); lit(g, x + 1, base - 74, 12, 8, '#b8dce2'); }
            g.fillStyle = '#121f34'; g.fillRect(13, base - 57, 14, 5); g.fillRect(244, base - 57, 14, 5);
            txt(g, 'MTA EXPRESS', 92, base - 43, 0.72, '#ffe4ae');
          }]
        }
      });
  };

  AH.ArtModules.stages['worlds.new-york.scenery.89'] = function (C) {
    const { defs, lg, line, lit, reg2, rrect, shade, txt, wheels } = C;

    reg2('amb_train_eastus2', 248, 46, function (g) {
        for (let car = 0; car < 2; car++) {
          const x = car * 124;
          rrect(g, x + 2, 5, 119, 32, 5, lg(g, 0, 5, 0, 37, [[0, '#d9e3df'], [0.52, '#aabac2'], [1, '#687e91']]));
          g.fillStyle = '#1f5f9a'; g.fillRect(x + 4, 28, 114, 5); g.fillStyle = '#f28a45'; g.fillRect(x + 4, 33, 114, 2);
          for (let win = 0; win < 6; win++) { const wx = x + 13 + win * 16; rrect(g, wx, 12, 11, 12, 1, '#14243c'); lit(g, wx + 1, 13, 9, 8, '#b8dce2'); }
          [29, 92].forEach((dx) => { g.fillStyle = '#8296a0'; g.fillRect(x + dx, 9, 13, 27); lit(g, x + dx + 2, 14, 9, 10, '#b9dbe1'); line(g, x + dx + 6.5, 11, x + dx + 6.5, 35, 0.7, '#435568'); });
          wheels(g, [x + 25, x + 99], 40, 4);
          txt(g, 'MTA', x + 54, 29, 0.7, '#f1f3eb'); line(g, x + 42, 5, x + 49, 0, 0.8, '#526578'); line(g, x + 49, 0, x + 57, 5, 0.8, '#526578');
          lit(g, x + 4, 13, 6, 12, '#a6cfdf');
        }
        g.fillStyle = '#526578'; g.fillRect(121, 13, 5, 21);
      }, { shade: 0.25 });

    defs.amb_train_nycmetro = defs.amb_train_eastus2;
  };

  content.parts['panorama'] = function (C) {
    const { PAL } = C;
    const lg = (...args) => C.lg(...args);
    const nyBridge = (...args) => C.nyBridge(...args);
    const nyChrysler = (...args) => C.nyChrysler(...args);
    const nyEmpire = (...args) => C.nyEmpire(...args);
    const nyLiberty = (...args) => C.nyLiberty(...args);
    const skyline = (...args) => C.skyline(...args);

    return function (g, w, h) {
    const P = PAL['eastus2'];
    const base = h - 6;
    
            skyline(w, h, 209, '#18284d', P.accent, 20, 57, 0.28, P.win)(g);
            nyBridge(g, 5, base, 1.12, P);
            nyEmpire(g, 315, base, 0.88, P);
            nyChrysler(g, 420, base, 0.76, P);
            nyLiberty(g, 566, base, 1.85, P);
            g.fillStyle = lg(g, 0, h - 24, 0, h, [[0, 'rgba(255,198,134,0)'], [1, 'rgba(255,198,134,0.32)']]); g.fillRect(0, h - 24, w, 24);
          
    };
  };

  content.parts['sceneryStars_eastus2'] = function (C) {

    return ['sc_ny_times', 'sc_ny_brownstones', 'sc_ny_subway', 'sc_ny_midtown'];
  };

  content.parts['panoramaLandmarks_eastus2'] = function (C) {

    return ['sc_ny_liberty', 'sc_ny_empire', 'sc_ny_chrysler', 'sc_ny_brooklynbridge'];
  };

  content.parts['sceneryRoutes_eastus2'] = function (C) {

    return [[0, 'sc_ny_brownstones'], [0.1, 'sc_ny_times'], [0.24, 'sc_ny_subway'], [0.4, 'sc_ny_centralpark'], [0.56, 'sc_ny_midtown'], [0.72, 'sc_ny_pier'], [0.84, 'sc_ny_elevated']];
  };
})();
