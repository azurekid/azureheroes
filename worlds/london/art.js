/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['london'] = AH.Worlds['london'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['uksouth'] = content;

  AH.ArtModules.stages['worlds.london.art.75'] = function (C) {
    const { ell, lg, line, lit, reg2, rrect, shade, sprayTag, txt } = C;

    reg2('ground_face_uksouth', 320, 64, function (g) {
      g.fillStyle = '#45404b'; g.fillRect(0, 0, 320, 64);
      for (let y = 0; y < 64; y += 10) for (let x = y % 20 ? -16 : 0; x < 320; x += 32) {
        g.fillStyle = (x + y) % 64 ? '#8b7e79' : '#9e8e83';
        g.fillRect(x + 1, y + 1, 30, 8);
        line(g, x + 1, y + 1, x + 29, y + 1, 0.7, '#b5a69a');
      }
      for (const x of [4, 272]) {
        g.fillStyle = '#29303f'; g.fillRect(x, 9, 43, 39);
        for (let y = 12; y < 47; y += 5) line(g, x + 2, y, x + 41, y, 1, '#636c75');
        line(g, x - 1, 49, x + 44, 49, 3, '#c3b7a2');
      }
      sprayTag(g, 'LDN', 59, 14, 3, '#f684b7', '#49354d');
      sprayTag(g, 'THAMES', 126, 26, 2.2, '#71d9ec', '#293b58');
      sprayTag(g, 'A', 226, 11, 3, '#ffd370', '#674655');
    }, { shade: 0, noOutline: true });
    content.parts.groundFace_uksouth = () => 'ground_face_uksouth';

    reg2('booth', 30, 62, function (g) {
        rrect(g, 2, 8, 26, 54, 1.4, lg(g, 2, 0, 28, 0, [[0, '#ff6a5a'], [0.5, '#e81a2a'], [1, '#8a0a14']]));
        g.fillStyle = '#c8101e'; g.beginPath(); g.moveTo(1, 9); g.quadraticCurveTo(15, -1, 29, 9); g.fill();
        ell(g, 15, 3, 2.4, 2, '#ffd23f');
        g.fillStyle = '#14081e'; g.fillRect(4, 10, 22, 5); txt(g, 'TELEPHONE', 4.6, 11, 0.4, '#ffffff');
        g.fillStyle = '#7a0a14'; g.fillRect(4, 17, 22, 38);
        for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) lit(g, 5.4 + c * 6.6, 18.4 + r * 6, 5.4, 4.8, '#ffe9b0');
        g.fillStyle = '#c8101e'; g.fillRect(14.4, 17, 1.2, 38);
        g.fillStyle = '#5a0a10'; g.fillRect(1, 56, 28, 6);
      }, { shade: 0.4 });
  };

  AH.ArtModules.stages['worlds.london.art.79'] = function (C) {
    const { FLAT, cargoBox, cloudDeck, cloudFacility, depthFace, depthGround, dockCrane, ell, glow, lg, line, lit, metroPoster, metroTiles, poly, reg2, rng, rrect, shade, txt, txtW, wheels, workshopArm } = C;

    Object.assign(C, { tubeRoundel, tubeBlock });
    function tubeRoundel(g, x, y, r, label) {
        ell(g, x, y, r, r, '#d72f40'); ell(g, x, y, r * 0.63, r * 0.63, '#ede9df');
        g.fillStyle = '#183d78'; g.fillRect(x - r * 1.3, y - r * 0.23, r * 2.6, r * 0.46);
        if (label) { const s = Math.min(0.7, r * 2.35 / txtW(label, 1)); txt(g, label, x - txtW(label, s) / 2, y - 2.5 * s, s, '#ffffff'); }
      }

    function tubeBlock(g, w, h, low) {
        metroTiles(g, 0, 0, w, h, '#ddd9ca', '#817f79');
        g.fillStyle = '#183d78'; g.fillRect(0, 0, w, Math.min(5, h)); g.fillRect(0, h - 4, w, 4);
        line(g, 0, 0.8, w, 0.8, 1.2, '#fff0b3');
        if (h <= 24) {
          g.fillStyle = '#61717f'; g.fillRect(0, 5, w, Math.max(0, h - 9));
          for (let x = 5; x < w; x += 14) { line(g, x, 6, x + 6, h - 5, 0.7, '#a0acaf'); ell(g, x, 3, 0.7, 0.7, '#ffffff'); }
        } else if (w >= 40) tubeRoundel(g, w / 2, h / 2, Math.min(12, w / 4, h / 4), '');
        if (low) {
          g.fillStyle = '#efc34b'; g.fillRect(0, h - 5, w, 5);
          for (let x = 0; x < w; x += 10) poly(g, [[x, h], [x + 4, h - 5], [x + 8, h - 5], [x + 4, h]], '#26344f');
        }
        depthFace(g, 0, 0, w, h, Math.min(5, h / 5), '#555f6a', '#b8c0bb');
      }

    reg2('cloud_floor_tube', 128, 64, function (g) {
        tubeBlock(g, 128, 64, false);
        g.fillStyle = '#777c80'; g.fillRect(0, 0, 128, 9);
        g.fillStyle = '#f1ca48'; g.fillRect(0, 1, 128, 2);
        for (let x = 3; x < 128; x += 5) { ell(g, x, 5, 0.5, 0.5, '#c0bba5'); line(g, x, 10, x, 14, 0.6, '#a7a69c'); }
        txt(g, 'MIND THE GAP', 36, 16, 0.65, '#183d78');
        g.fillStyle = 'rgba(10,18,37,0.4)'; g.fillRect(0, 34, 128, 30);
        for (let x = 8; x < 128; x += 24) line(g, x, 0.5, x + 6, 8, 0.8, '#454f5e');
      }, FLAT);

    reg2('challenge_sign_tube', 248, 36, function (g) {
        rrect(g, 0, 0, 248, 36, 3, '#183d78');
        g.strokeStyle = '#ebe9dc'; g.lineWidth = 1; g.strokeRect(2, 2, 244, 32);
        tubeRoundel(g, 17, 18, 10, '');
      }, FLAT);

    reg2('challenge_far_tube', 640, 360, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 360, [[0, '#080e1c'], [0.55, '#26303c'], [1, '#131c2a']]); g.fillRect(0, 0, 640, 360);
        for (let x = -160; x < 800; x += 320) {
          for (let r = 150; r >= 30; r -= 18) { g.strokeStyle = r % 36 ? '#4a535e' : '#1a2532'; g.lineWidth = 4; g.beginPath(); g.ellipse(x + 160, 205, r, r * 0.86, 0, 0, Math.PI * 2); g.stroke(); }
          line(g, x + 10, 286, x + 310, 286, 2, '#9e9c92');
          line(g, x + 10, 293, x + 310, 293, 2, '#3c4653');
          poly(g, [[x + 147, 217], [x + 173, 217], [x + 300, 360], [x + 20, 360]], '#141c28');
          for (const dx of [-1, 1]) line(g, x + 160 + dx * 8, 217, x + 160 + dx * 112, 360, 1.5, '#66717a');
          for (const y of [230, 250, 280, 325]) {
            const reach = (y - 217) * 0.85;
            line(g, x + 160 - reach, y, x + 160 + reach, y, 2, '#34414c');
          }
        }
      }, FLAT);

    for (let variant = 0; variant < 3; variant++) reg2('challenge_bg_tube' + (variant ? '_' + variant : ''), 640, 360, function (g) {
        const station = ['WESTMINSTER', 'BAKER STREET', 'PICCADILLY'][variant];
        depthGround(g, 0, 272, 640, 25, '#686d70', '#a8a99d');
        metroTiles(g, 0, 140, 640, 125, '#b8b8b0', '#707781');
        for (let x = 0; x < 640; x += 128) {
          g.strokeStyle = '#626c79'; g.lineWidth = 9; g.beginPath(); g.arc(x + 64, 140, 60, Math.PI, 0); g.stroke();
          g.strokeStyle = '#c1c5be'; g.lineWidth = 2; g.beginPath(); g.arc(x + 64, 140, 55, Math.PI, 0); g.stroke();
          g.fillStyle = '#53616d'; g.fillRect(x, 137, 8, 128);
          poly(g, [[x + 8, 137], [x + 18, 146], [x + 18, 265], [x + 8, 265]], '#3d4d5c');
          g.strokeStyle = '#344352'; g.lineWidth = 6; g.beginPath(); g.arc(x + 69, 145, 60, Math.PI, 0); g.stroke();
          lit(g, x + 26, 143, 71, 2.6, '#f0ecd3');
        }
        g.fillStyle = '#183d78'; g.fillRect(0, 160, 640, 3);
        g.fillStyle = '#ac3747'; g.fillRect(0, 164, 640, 1.4);
        tubeRoundel(g, 118, 201, 26, station);
        metroPoster(g, 208, 177, 69, 64, variant === 2 ? 3 : variant);
        rrect(g, 304, 178, 126, 54, 2, '#dfded2');
        txt(g, 'PLAN YOUR JOURNEY', 312, 183, 0.65, '#233955');
        ['#d73343', '#2981a6', '#d2ad31', '#288969'].forEach((color, i) => {
          line(g, 313, 201 + i * 6, 345 + i * 9, 201 + i * 6, 1.8, color);
          line(g, 345 + i * 9, 201 + i * 6, 365 + i * 9, 195 + i * 6, 1.8, color);
          line(g, 365 + i * 9, 195 + i * 6, 418, 195 + i * 6, 1.8, color);
          ell(g, 345 + i * 9, 201 + i * 6, 1.7, 1.7, '#f4f1e4');
        });
        rrect(g, 460, 162, 162, 24, 2, '#222a32');
        txt(g, 'WAY OUT', 473, 168, 1, '#f6d348');
        poly(g, [[591, 169], [601, 174], [591, 179], [591, 176], [581, 176], [581, 172], [591, 172]], '#f6d348');
        g.fillStyle = '#192431'; g.fillRect(461, 197, 160, 65);
        for (let step = 0; step < 7; step++) { line(g, 474 + step * 9, 258 - step * 7, 617, 258 - step * 7, 1.4, '#75818a'); }
        rrect(g, 19, 220, 32, 41, 2, '#35527a'); lit(g, 24, 225, 22, 15, '#92d8e6');
        txt(g, 'TICKETS', 22, 247, 0.6, '#faf1ce');
        [177, 298].forEach((x) => { g.fillStyle = '#6e463b'; g.fillRect(x, 246, 72, 4); line(g, x + 6, 250, x + 6, 263, 2, '#283d53'); line(g, x + 66, 250, x + 66, 263, 2, '#283d53'); });
        g.fillStyle = '#b7b4a1'; g.fillRect(0, 264, 640, 5); g.fillStyle = '#e0bf54'; g.fillRect(0, 269, 640, 1.5);
        for (let x = 20; x < 640; x += 40) line(g, x - 7, 265, x, 269, 0.8, '#71796f');
        g.fillStyle = '#171d2a'; g.fillRect(0, 272, 640, 28);
        for (let x = 0; x < 640; x += 13) line(g, x, 279, x + 4, 297, 2, '#414652');
        line(g, 0, 284, 640, 284, 1.8, '#a7a99e'); line(g, 0, 296, 640, 296, 1.5, '#777d83');
        txt(g, 'MIND THE GAP', 343, 259, 0.6, '#3b4150');
      }, FLAT);

    reg2('challenge_train_tube', 360, 76, function (g) {
        for (let car = 0; car < 2; car++) {
          const x = car * 181;
          rrect(g, x + 2, 9, 174, 54, 16, lg(g, 0, 9, 0, 63, [[0, '#e5e6de'], [0.6, '#f1f0df'], [1, '#b2b5b4']]));
          g.fillStyle = '#153b72'; g.fillRect(x + 7, 52, 164, 10);
          for (let d = 0; d < 3; d++) {
            const dx = x + 25 + d * 49;
            rrect(g, dx, 20, 21, 32, 2, '#bd293c'); lit(g, dx + 3, 23, 6, 17, '#a6ccd7'); lit(g, dx + 12, 23, 6, 17, '#a6ccd7');
            line(g, dx + 10.5, 22, dx + 10.5, 51, 0.7, '#721c2b');
            if (d < 2) { rrect(g, dx + 25, 23, 20, 18, 2, '#253646'); lit(g, dx + 27, 25, 16, 14, '#d6dfd8'); ell(g, dx + 35, 34, 2.4, 2.6, '#6d5957'); }
          }
          wheels(g, [x + 34, x + 141], 66, 5);
          tubeRoundel(g, x + 98, 47, 5, '');
          rrect(g, x + 3, 19, 18, 34, 7, '#c72f43'); rrect(g, x + 6, 23, 12, 18, 4, '#233b4d');
          ell(g, x + 8, 48, 1.8, 1.8, '#fff2b8'); ell(g, x + 17, 48, 1.8, 1.8, '#fff2b8');
          txt(g, 'BAKERLOO', x + 54, 13, 0.6, '#253c52');
        }
      }, FLAT);

    reg2('pipe_tube', 44, 46, function (g) {
        metroTiles(g, 2, 5, 40, 41, '#c8c6ba', '#777f83');
        g.fillStyle = '#183d78'; g.fillRect(0, 0, 44, 5); g.fillStyle = '#f3d16b'; g.fillRect(0, 0, 44, 1);
        g.fillStyle = '#25374a'; g.fillRect(8, 10, 28, 29);
        for (let y = 16; y < 40; y += 5) line(g, 9, y, 35, y, 1, '#aeb8b6');
        tubeRoundel(g, 22, 26, 10, '');
      }, { shade: 0.2 });

    reg2('pipe_tube_top', 70, 80, function (g) {
        [9, 61].forEach((x) => { g.fillStyle = '#243b48'; g.fillRect(x, 28, 2, 52); ell(g, x + 1, 27, 3, 3, '#e1c88c'); });
        tubeRoundel(g, 35, 28, 22, 'UNDERGROUND');
        rrect(g, 15, 55, 40, 9, 1, '#202d3f'); txt(g, 'SUBWAY', 22, 57, 0.65, '#ffffff');
        line(g, 10, 71, 61, 71, 1.3, '#748c8e');
      }, { shade: 0.2 });

    ['pipelines', 'aks', 'actions', 'docker', 'entra', 'functions'].forEach(function (theme, i) {
        const dock = theme === 'docker' || theme === 'aks';
        const facility = theme === 'entra' || theme === 'functions';
        const accent = ['#7dc1d0', '#8fceb8', '#bfb0df', '#e9b875', '#82cfc1', '#dec284'][i];
        reg2('cloud_floor_' + theme, 128, 64, function (g) {
          g.fillStyle = lg(g, 0, 0, 0, 64, [[0, '#566778'], [0.12, '#324456'], [1, '#182533']]); g.fillRect(0, 0, 128, 64);
          g.fillStyle = '#c2bb9d'; g.fillRect(0, 0, 128, 2);
          g.fillStyle = '#1c2a36'; g.fillRect(0, 9, 128, 4);
          for (let x = 0; x < 128; x += 32) {
            g.strokeStyle = '#10212d'; g.lineWidth = 1; g.strokeRect(x + 2, 18, 28, 38);
            line(g, x + 4, 20, x + 28, 20, 0.8, '#576773');
            for (const y of [5, 48]) ell(g, x + 8, y, 1.2, 1.2, '#a9b5b3');
            for (let k = 0; k < 4; k++) line(g, x + 6, 28 + k * 5, x + 24, 28 + k * 5, 1.2, '#0f202c');
          }
          const r = rng(700 + i);
          for (let n = 0; n < 60; n++) { g.fillStyle = 'rgba(195,173,128,0.15)'; g.fillRect(r() * 128, 14 + r() * 50, 1 + r() * 6, 0.7); }
          g.fillStyle = accent; g.fillRect(88, 5, 12, 1);
          for (let x = 0; x < 128; x += 32) {
            poly(g, [[x, 0], [x + 25, 0], [x + 31, 8], [x + 6, 8]], '#75858b');
            line(g, x + 6, 8, x + 31, 8, 0.8, '#263d4c');
          }
          line(g, 0, 0.5, 128, 0.5, 1, accent);
        }, FLAT);
        reg2('challenge_sign_' + theme, 248, 36, function (g) {
          rrect(g, 0, 0, 248, 36, 3, '#172834');
          g.strokeStyle = '#697e88'; g.lineWidth = 1; g.strokeRect(1, 1, 246, 34);
          g.fillStyle = accent; g.fillRect(8, 6, 3, 24);
          for (const x of [4, 243]) for (const y of [4, 31]) ell(g, x, y, 1, 1, '#aeb8af');
          line(g, 13, 3, 237, 3, 0.8, '#cad2c3');
        }, FLAT);
        reg2('challenge_far_' + theme, 640, 360, function (g) {
          if (facility) { cloudFacility(g, theme, 0, true); return; }
          g.fillStyle = lg(g, 0, 0, 0, 360, dock ?
            [[0, '#19273f'], [0.38, '#715770'], [0.62, '#d19a7b'], [1, '#243f51']] :
            [[0, '#17283e'], [0.52, '#425a6b'], [1, '#887d79']]);
          g.fillRect(0, 0, 640, 360);
          if (dock) {
            ell(g, 474, 144, 28, 28, '#efd1aa');
            for (let n = 0; n < 8; n++) {
              ell(g, n * 100, 89 + n % 3 * 17, 70, 4, 'rgba(206,187,190,0.2)');
            }
            for (let x = 0; x < 640; x += 64) {
              g.fillStyle = '#555469'; g.fillRect(x, 183 - x % 38, 54, 59 + x % 38);
              for (let wx = x + 5; wx < x + 50; wx += 10) lit(g, wx, 199, 2, 3, '#baa47e');
            }
            dockCrane(g, 40, 130, 244, 110, '#5c6076');
            dockCrane(g, 342, 110, 244, 134, '#636378');
            g.fillStyle = lg(g, 0, 235, 0, 360, [[0, '#384e5d'], [1, '#122d40']]); g.fillRect(0, 235, 640, 125);
            poly(g, [[110, 239], [313, 239], [285, 259], [136, 259]], '#283749');
            cargoBox(g, 144, 214, 60, 24, 1, ''); cargoBox(g, 205, 214, 60, 24, 3, '');
            g.fillStyle = '#3a4655'; g.fillRect(269, 209, 20, 30);
            const r = rng(530 + i);
            for (let n = 0; n < 180; n++) {
              g.fillStyle = n % 3 ? 'rgba(218,184,147,0.19)' : 'rgba(126,168,181,0.3)';
              g.fillRect(r() * 640, 242 + r() * 92, 3 + r() * 35, 0.7);
            }
          } else {
            poly(g, [[0, 0], [640, 0], [540, 84], [100, 84]], '#203747');
            for (const x of [0, 160, 320, 480, 640]) line(g, x, 0, 320 + (x - 320) * 0.68, 84, 2, '#526976');
            g.fillStyle = '#293f4c'; g.fillRect(0, 270, 640, 90);
            for (let x = 0; x <= 640; x += 80) line(g, 320 + (x - 320) * 0.65, 270, x, 360, 1, '#526572');
            for (const y of [282, 307, 344]) line(g, 0, y, 640, y, 1, '#526572');
            for (let x = 8; x < 640; x += 104) {
              g.fillStyle = '#233b4c'; g.fillRect(x, 92, 92, 146);
              g.fillStyle = lg(g, x, 92, x, 238, [[0, '#759297'], [0.6, '#b6b59e'], [1, '#5d777e']]);
              g.fillRect(x + 4, 96, 84, 138);
              for (let y = 122; y < 238; y += 28) line(g, x + 4, y, x + 88, y, 2, '#425a65');
              line(g, x + 45, 96, x + 45, 234, 2, '#425a65');
              poly(g, [[x + 12, 237], [x + 60, 237], [x + 90, 300], [x - 20, 300]], 'rgba(231,208,158,0.08)');
            }
            for (let x = 12; x < 640; x += 160) {
              g.fillStyle = '#3b505d'; g.fillRect(x, 225, 125, 45);
              for (let y = 231; y < 266; y += 9) line(g, x + 8, y, x + 116, y, 1, '#61727b');
              depthFace(g, x, 225, 125, 270, 8, '#213746', '#758792');
            }
          }
        }, FLAT);
        for (let variant = 0; variant < 3; variant++) {
          reg2('challenge_bg_' + theme + (variant ? '_' + variant : ''), 640, 360, function (g) {
            if (facility) cloudFacility(g, theme, variant, false);
            else if (dock) {
              dockCrane(g, 58 + variant * 32, 82, 280, 220, '#3c5361');
              dockCrane(g, 430 - variant * 24, 62, 280, 150, '#6b5b52');
              g.fillStyle = '#273e4c'; g.fillRect(0, 264, 640, 36);
              line(g, 0, 265, 640, 265, 2, '#70818a');
              for (let x = -32; x < 640; x += 64) line(g, x, 265, x + 28, 299, 0.8, '#4a626b');
              line(g, 0, 282, 640, 282, 1, '#203541');
              for (let x = 8; x < 640; x += 160) {
                const stack = (Math.floor((x - 8) / 160) + variant) % 3;
                cargoBox(g, x, 222, 138, 40, stack, theme === 'aks' ? 'AKS FREIGHT' : 'AZURE CARGO');
                if (stack !== 1) cargoBox(g, x + 12, 183, 118, 38, stack + 1, 'CONTAINER');
              }
              const lx = 398 + variant * 45;
              line(g, lx, 163, lx, 264, 3, '#324851');
              line(g, lx - 18, 163, lx + 18, 163, 2, '#758b8e');
              for (const dx of [-16, 12]) {
                lit(g, lx + dx, 164, 6, 3, '#f3cf92');
                poly(g, [[lx + dx, 168], [lx + dx - 25, 264], [lx + dx + 35, 264]], 'rgba(242,207,146,0.06)');
              }
            } else {
              depthGround(g, 0, 300, 640, 32, '#152b39', '#4b626c');
              for (const x of [5, 632]) {
                g.fillStyle = lg(g, x, 0, x + 8, 0, [[0, '#344c5e'], [0.4, '#80918c'], [1, '#283d50']]); g.fillRect(x, 46, 8, 254);
                for (let y = 60; y < 300; y += 24) ell(g, x + 4, y, 1, 1, '#b1b8a5');
              }
              g.fillStyle = '#263d50'; g.fillRect(0, 48, 640, 8);
              for (let x = 12; x < 640; x += 40) {
                line(g, x, 56, x + 20, 74, 2, '#59717e'); line(g, x + 20, 74, x + 40, 56, 2, '#59717e');
              }
              line(g, 0, 74, 640, 74, 2, '#243a4b');
              for (const x of [110 + variant * 36, 490 - variant * 24]) {
                line(g, x, 76, x, 160, 1, '#8e9b95'); line(g, x + 7, 76, x + 7, 160, 1, '#4d6371');
                rrect(g, x - 8, 157, 24, 13, 2, '#b29364');
                line(g, x + 4, 170, x + 4, 186, 2, '#9ba89f');
                ell(g, x + 7, 186, 4, 4, '#83918d');
              }
              rrect(g, 377, 168, 210, 78, 3, '#304957');
              depthFace(g, 377, 168, 210, 246, 12, '#203743', '#657e86');
              for (let x = 389; x < 570; x += 58) {
                rrect(g, x, 178, 48, 35, 2, '#192c3b');
                g.fillStyle = '#69a1a1'; g.fillRect(x + 3, 181, 42, 27);
                for (let n = 0; n < 4; n++) {
                  g.fillStyle = n === variant ? '#dbbf87' : '#375e73'; g.fillRect(x + 7, 186 + n * 5, 18 + n * 4, 2);
                }
              }
              txt(g, theme === 'actions' ? 'GITHUB ACTIONS - RUNNER 0' + (variant + 1) : 'AZURE PIPELINES - BUILD LAB', 386, 221, 1, '#c6d9cd');
              line(g, 374, 246, 374, 271, 3, '#243a47'); line(g, 590, 246, 590, 271, 3, '#243a47');
              workshopArm(g, 220 + variant * 14, 267, false);
              workshopArm(g, 325 - variant * 8, 267, true);
              if (theme === 'pipelines') {
                for (const x of [40, 113]) {
                  rrect(g, x, 177, 52, 83, 12, lg(g, x, 0, x + 52, 0, [[0, '#344d5a'], [0.4, '#9da99c'], [1, '#3f5b69']]));
                  ell(g, x + 26, 208, 12, 12, '#263c4a'); ell(g, x + 26, 208, 9, 9, '#b7c9bd');
                  line(g, x + 26, 208, x + 31, 203, 1.5, '#ad724c');
                  line(g, x + 26, 177, x + 26, 157, 7, '#657d81');
                }
              } else {
                cargoBox(g, 34, 239, 59, 29, variant, '');
                cargoBox(g, 102, 243, 48, 25, variant + 1, '');
              }
              g.save(); g.translate(0, 272); cloudDeck(g, 640, 16, theme, false); g.restore();
            }
            const r = rng(940 + i * 10 + variant);
            for (let n = 0; n < 70; n++) {
              g.fillStyle = 'rgba(225,201,158,0.08)'; g.fillRect(r() * 640, 280 + r() * 20, r() * 22, 0.7);
            }
          }, FLAT);
        }
      });

    reg2('cloud_plat', 80, 20, function (g) {
        [[12, 12, 12], [30, 8, 14], [50, 9, 13], [68, 12, 11]].forEach(function (c) { ell(g, c[0], c[1], c[2], c[2] * 0.7, '#ffffff'); });
        g.fillStyle = '#ffffff'; g.fillRect(4, 10, 72, 8);
        g.fillStyle = 'rgba(160,200,255,0.8)'; g.fillRect(4, 16, 72, 2);
      }, { shade: 0.5 });

    reg2('sky_cloud', 120, 20, function (g) {
        [[14, 11, 11], [34, 7, 12], [56, 5, 13], [78, 7, 12], [98, 9, 11], [110, 12, 8]].forEach(function (c) {
          ell(g, c[0], c[1] + 1, c[2], c[2] * 0.62, '#c8dcff');
          ell(g, c[0] - 1, c[1], c[2] * 0.92, c[2] * 0.56, lg(g, 0, c[1] - c[2] * 0.6, 0, c[1] + c[2] * 0.5, [[0, '#ffffff'], [1, '#e2eeff']]));
        });
        rrect(g, 3, 9, 114, 8, 4, lg(g, 0, 9, 0, 17, [[0, '#eef5ff'], [0.55, '#9cc8ff'], [1, '#2f86e0']]));
        g.fillStyle = 'rgba(80,224,255,0.95)'; g.fillRect(6, 16.6, 108, 1.2);
        [18, 40, 62, 84, 104].forEach(function (x, i) { g.fillStyle = i % 2 ? '#0078d4' : '#50e6ff'; g.fillRect(x, 13, 3, 1.2); g.fillRect(x + 1, 12, 1.2, 3); });
      }, { shade: 0.4, glow: '#50c8ff' });
  };

  content.parts['bridge'] = function (C) {
    const ell = (...args) => C.ell(...args);
    const glowRect = (...args) => C.glowRect(...args);
    const lg = (...args) => C.lg(...args);

    return function (g) {
    const D0 = 30;
    
            g.fillStyle = '#c8c4e0'; [0, 148].forEach(function (x) { g.fillRect(x, D0, 12, 70); });
            g.strokeStyle = '#2a8a5a'; g.lineWidth = 3;
            g.beginPath(); g.moveTo(12, 96); g.quadraticCurveTo(80, 34, 148, 96); g.stroke();
            g.strokeStyle = '#1a5a3a'; g.lineWidth = 0.8;
            for (let x = 20; x < 144; x += 8) { const t = (x - 12) / 136, y = 96 - 4 * t * (1 - t) * 62 * 0.95; g.beginPath(); g.moveTo(x, y); g.lineTo(x, D0 + 10); g.stroke(); }
            g.fillStyle = lg(g, 0, D0, 0, D0 + 10, [[0, '#4ac88a'], [1, '#1a5a3a']]); g.fillRect(0, D0, 160, 10);
            g.fillStyle = '#ffd23f'; g.fillRect(0, D0 + 8, 160, 1);
            g.fillStyle = '#1a5a3a'; g.fillRect(0, D0 - 8, 160, 1.6); for (let x = 3; x < 160; x += 5) g.fillRect(x, D0 - 7, 0.8, 7);
            [20, 80, 140].forEach(function (x) { g.fillStyle = '#1a3a2a'; g.fillRect(x - 0.8, D0 - 26, 1.6, 20); [-3, 0, 3].forEach(function (o) { ell(g, x + o, D0 - 27 + Math.abs(o) * 0.6, 1.6, 1.8, '#fff0b0'); }); glowRect(g, '#ffd070', x - 5, D0 - 31, 10, 8); });
          
    };
  };

  content.parts['SKIES_uksouth'] = function (C) {

    return { stops: [[0, '#0a0c30'], [0.35, '#1c2a6a'], [0.58, '#4a4a9a'], [0.75, '#c05a9a'], [0.9, '#ff9a80'], [1, '#ffd0a0']], sun: { x: 500, y: 190, r: 44, c: ['#fff0d8', '#ffc8b8', '#e890c8'] }, halo: ['rgba(255,220,200,0.5)', 'rgba(200,140,255,0.2)'], cl: ['rgba(60,70,150,0.55)', 'rgba(255,160,200,0.55)', 'rgba(200,220,255,0.5)'], hz: 'rgba(255,180,160,0.5)', stars: 80, seed: 7, stripes: false };
  };

  content.parts['PAL_uksouth'] = function (C) {

    return { top: '#2a2a78', bot: '#4a3a9a', accent: '#8ab4ff', win: ['#ffe9a0', '#ffc070', '#9ad8ff'] };
  };

  content.parts['WATER_uksouth'] = function (C) {

    return ['#2a3a8a', '#080c30', '#ffd0a0', '#8ab4ff'];
  };

  content.parts['BOATS_uksouth'] = function (C) {

    return { hull: ['#1a1a4a', '#06061c'], stripe: '#ff3a3a', cab: ['#e0e0f0', '#6a6a9a'], roof: '#ffffff', win: ['#ffe9a0', '#ffd0a0'], logo: true, name: 'CLIPPER' };
  };

  content.parts['CARS_redbus'] = function (C) {
    const { lg, lit, rrect, wheels } = C;

    return [62, 34, function (g, w, h) { rrect(g, 1, 1, w - 2, h - 7, 3, lg(g, 0, 1, 0, h - 6, [[0, '#ff5a5a'], [1, '#8a0a1a']])); for (let r = 0; r < 2; r++) for (let x = 5; x < w - 6; x += 8) { g.fillStyle = '#1a0a2a'; g.fillRect(x, 4 + r * 12, 6, 6); lit(g, x + 0.5, 4.5 + r * 12, 5, 5, '#ffe9c0'); } g.fillStyle = '#ffe9c0'; g.fillRect(1, 13, w - 2, 0.8); wheels(g, [12, 50], h - 5, 4.6); }];
  };

  content.parts['CARS_cab'] = function (C) {
    const { carBody, rrect, wheels } = C;

    return [42, 20, function (g, w, h) { carBody(g, w, h, '#4a4a6a', '#0a0a18', 9, 30, 3); rrect(g, 17, 0.6, 7, 2.6, 1, '#ffd23f'); wheels(g, [9, 33], h - 4, 4); }];
  };

  content.parts['CARS_mini'] = function (C) {
    const { carBody, ell, wheels } = C;

    return [34, 18, function (g, w, h) { carBody(g, w, h, '#7fe8ff', '#2a8aa8', 7, 26, 3, 'rgba(230,250,255,0.85)'); ell(g, 17, 9, 2, 2, '#ffffff'); wheels(g, [8, 26], h - 4, 3.6); }];
  };
})();
