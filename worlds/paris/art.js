/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['paris'] = AH.Worlds['paris'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['francecentral'] = content;
  content.parts.foreground_francecentral = () => ({
    shape: 'terrace', detail: 'balcony', roof: '#3a3d56', wall: '#766572',
    light: '#d3b8a0', accent: '#9d919d'
  });
  content.parts.graffiti_francecentral = () => ({
    tags: ['BONJOUR PARIS', 'LIBERTE', 'REVONS ENSEMBLE'], paint: '#f5a0c8', accent: '#83dce9'
  });

  AH.ArtModules.stages['worlds.paris.art.78'] = function (C) {
    const { FLAT, depthFace, ell, glowRect, lg, line, lit, msLogo, poly, reg2, rng, rrect, shade, txt, txtW } = C;

    Object.assign(C, { metroTiles, metroRoundel, metroPoster, metroBlock, metroDeck });
    function metroTiles(g, x, y, w, h, light, dark) {
        g.fillStyle = dark; g.fillRect(x, y, w, h);
        for (let ty = y, row = 0; ty < y + h; ty += 5, row++) {
          for (let tx = x - (row % 2 ? 5 : 0); tx < x + w; tx += 10) {
            const lx = Math.max(x, tx), rw = Math.min(x + w, tx + 9.2) - lx;
            if (rw <= 0) continue;
            g.fillStyle = light; g.fillRect(lx, ty, rw, 4.2);
            g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(lx, ty, rw, 0.7);
            g.fillStyle = 'rgba(80,70,70,0.18)'; g.fillRect(lx, ty + 3.4, rw, 0.8);
          }
        }
      }

    function metroRoundel(g, x, y, r) {
        ell(g, x, y, r, r, '#f4efe2'); ell(g, x, y, r * 0.84, r * 0.84, '#1f3f8a');
        txt(g, 'M', x - txtW('M', r / 7) / 2, y - r * 0.5, r / 7, '#ffffff');
      }

    function metroPoster(g, x, y, w, h, k) {
        rrect(g, x - 3, y - 3, w + 6, h + 6, 1, '#b99a5c'); g.fillStyle = '#f1e2b6'; g.fillRect(x - 2, y - 2, w + 4, 1);
        const P2 = [
          ['AZURE FRONT DOOR', '#0f6cbd', '#5fd0ff'], ['GITHUB COPILOT', '#24292f', '#9be9a8'],
          ['VISIT PARIS', '#e86a7a', '#ffd38a'], ['MICROSOFT TEAMS', '#4b53bc', '#c5c9ff'], ['DDOS PROTECTION', '#1b4f72', '#ffb35c']
        ][k % 5];
        g.fillStyle = lg(g, 0, y, 0, y + h, [[0, P2[1]], [1, '#16182e']]); g.fillRect(x, y, w, h);
        if (k % 5 === 2) {
          const ex = x + w * 0.7;
          poly(g, [[ex - 9, y + h - 4], [ex - 1.4, y + 10], [ex + 1.4, y + 10], [ex + 9, y + h - 4]], P2[2]);
          poly(g, [[ex - 5, y + h - 4], [ex, y + h - 14], [ex + 5, y + h - 4]], P2[1]);
          ell(g, x + 16, y + 18, 8, 8, '#fff1c8');
        } else if (k % 5 === 1) {
          ell(g, x + w * 0.7, y + h * 0.48, 11, 9, '#e8e8f0'); ell(g, x + w * 0.66, y + h * 0.48, 2, 2.4, '#24292f'); ell(g, x + w * 0.74, y + h * 0.48, 2, 2.4, '#24292f');
          g.fillStyle = P2[2]; for (let i = 0; i < 4; i++) g.fillRect(x + 8, y + 14 + i * 6, 14 + (i * 7) % 12, 2);
        } else {
          for (let i = 0; i < 4; i++) { g.strokeStyle = P2[2]; g.globalAlpha = 0.85 - i * 0.18; g.lineWidth = 2; g.beginPath(); g.arc(x + w * 0.72, y + h * 0.55, 6 + i * 6, Math.PI, Math.PI * 1.9); g.stroke(); }
          g.globalAlpha = 1; msLogo(g, x + w * 0.72 - 5, y + h * 0.55 - 5, 10);
        }
        txt(g, P2[0], x + w / 2 - txtW(P2[0], 0.62) / 2, y + h - 9, 0.62, '#ffffff', '#101020');
      }

    reg2('cloud_floor_metro', 128, 64, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 12, [[0, '#e6dece'], [0.25, '#7a7268'], [1, '#4f4a4a']]); g.fillRect(0, 0, 128, 12);
        const r = rng(1414);
        for (let n = 0; n < 70; n++) { g.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.22)' : 'rgba(30,24,30,0.3)'; g.fillRect(r() * 128, 3 + r() * 8, 1, 0.8); }
        g.fillStyle = '#f3efe4'; g.fillRect(0, 0, 128, 1.6);
        g.fillStyle = '#262126'; g.fillRect(0, 12, 128, 2.4);
        metroTiles(g, 0, 14.4, 128, 50, '#d9d1c2', '#8e8578');
        g.fillStyle = lg(g, 0, 14, 0, 64, [[0, 'rgba(10,12,30,0.1)'], [1, 'rgba(10,12,30,0.72)']]); g.fillRect(0, 14, 128, 50);
        g.fillStyle = '#1f3f8a'; g.fillRect(0, 22, 128, 3); g.fillStyle = '#e8c56d'; g.fillRect(0, 21.4, 128, 0.6);
        for (let x = 0; x < 128; x += 32) {
          poly(g, [[x, 0], [x + 26, 0], [x + 31, 10], [x + 5, 10]], 'rgba(226,215,193,0.3)');
          line(g, x + 5, 10, x + 31, 10, 0.8, '#514f52');
        }
      }, FLAT);

    reg2('challenge_sign_metro', 248, 36, function (g) {
        rrect(g, 0, 0, 248, 36, 4, '#13306e');
        g.strokeStyle = '#f2efe6'; g.lineWidth = 1.4; g.strokeRect(3, 3, 242, 30);
        metroRoundel(g, 16, 18, 9);
        line(g, 6, 2, 242, 2, 0.6, 'rgba(255,255,255,0.4)');
      }, FLAT);

    reg2('challenge_far_metro', 640, 360, function (g) {
        // receding tunnel mouth glimpsed above the station vault
        g.fillStyle = lg(g, 0, 0, 0, 360, [[0, '#0d0f1e'], [0.5, '#1d2034'], [1, '#2a2638']]); g.fillRect(0, 0, 640, 360);
        for (let x = 0; x < 640; x += 80) {
          g.fillStyle = 'rgba(255,210,140,0.12)'; ell(g, x + 40, 40, 30, 10, 'rgba(255,210,140,0.12)');
          lit(g, x + 36, 38, 8, 2, '#ffd99a');
          line(g, x, 66, x + 80, 66, 1, 'rgba(160,150,170,0.25)');
        }
        ell(g, 320, 190, 98, 119, '#0a101c');
        for (const r of [140, 110, 82, 57, 35]) {
          g.strokeStyle = '#3b3e50'; g.lineWidth = 3; g.beginPath(); g.ellipse(320, 190, r, r * 1.06, 0, Math.PI, Math.PI * 2); g.stroke();
        }
        for (const dx of [-1, 1]) line(g, 320 + dx * 9, 211, 320 + dx * 190, 360, 2, '#74757b');
        for (const y of [230, 258, 304, 350]) {
          const reach = (y - 211) * 1.28;
          line(g, 320 - reach, y, 320 + reach, y, 2, '#3e3542');
        }
      }, FLAT);

    const STATIONS = ['CHATELET', 'ABBESSES', 'BASTILLE'];

    for (let variant = 0; variant < 3; variant++) {
        reg2('challenge_bg_metro' + (variant ? '_' + variant : ''), 640, 360, function (g) {
          // barrel vault of bevelled white tiles, lamp strip, framed posters and an enamel station plate
          metroTiles(g, 0, 40, 640, 196, '#f1ebdd', '#b8ae9f');
          g.fillStyle = lg(g, 0, 40, 0, 236, [[0, 'rgba(14,16,34,0.85)'], [0.22, 'rgba(14,16,34,0.35)'], [0.5, 'rgba(255,214,150,0.06)'], [1, 'rgba(30,24,40,0.35)']]); g.fillRect(0, 40, 640, 196);
          g.fillStyle = '#121426'; g.fillRect(0, 0, 640, 40);
          g.fillStyle = '#3a3448'; g.fillRect(0, 38, 640, 3);
          for (let x = 0; x < 640; x += 212) {
            poly(g, [[x, 41], [x + 17, 58], [x + 17, 236], [x, 236]], '#807984');
            poly(g, [[x + 17, 58], [x + 196, 58], [x + 211, 41], [x, 41]], '#d8cfc0');
            line(g, x + 17, 59, x + 196, 59, 1, '#f4e3bf');
            line(g, x + 17, 60, x + 17, 235, 0.8, '#d7d0bc');
          }
          for (let x = 20 + variant * 13; x < 640; x += 70) {
            g.fillStyle = '#2b2a38'; g.fillRect(x, 64, 34, 4);
            glowRect(g, '#ffe3a8', x - 6, 66, 46, 8); lit(g, x + 2, 67, 30, 2, '#fff2c8');
          }
          // posters in bevelled-tile frames; plates sit low in the gaps, clear of the room's stage signs
          const order = [variant, variant + 2, variant + 4];
          [36, 248, 460].forEach(function (px, i) { metroPoster(g, px, 150, 140, 70, order[i]); });
          const st = STATIONS[variant];
          [[189, 0], [401, 1]].forEach(function (q) {
            const nx = q[0], plate = q[1] ? 'SORTIE' : st;
            rrect(g, nx, 168, 46, 14, 3, q[1] ? '#e9e3d4' : '#13306e');
            g.strokeStyle = q[1] ? '#1f3f8a' : '#f2efe6'; g.lineWidth = 0.8; g.strokeRect(nx + 2, 170, 42, 10);
            const sc = Math.min(0.8, 38 / txtW(plate, 1));
            txt(g, plate, nx + 23 - txtW(plate, sc) / 2, 172.5, sc, q[1] ? '#1f3f8a' : '#ffffff');
          });
          // benches, a ticket machine and line roundels along the platform wall
          [[96, '#c84a4a'], [520, '#3c8f6a']].forEach(function (b) {
            g.fillStyle = '#2a2836'; g.fillRect(b[0], 226, 2, 10); g.fillRect(b[0] + 30, 226, 2, 10);
            for (let k = 0; k < 4; k++) rrect(g, b[0] + k * 8, 220, 7, 7, 1.5, b[1]);
          });
          const tm = variant === 1 ? 414 : 202;
          rrect(g, tm, 196, 18, 40, 2, '#3b4d6e'); lit(g, tm + 3, 200, 12, 7, '#9fe7ff'); g.fillStyle = '#ffd36a'; g.fillRect(tm + 4, 212, 10, 2);
          [[608, '#62259d', '14'], [628, '#ffcd00', '1'], [588, '#be418d', '4']].forEach(function (c, i) {
            if (i > variant) return;
            ell(g, c[0], 140, 8, 8, c[1]); txt(g, c[2], c[0] - txtW(c[2], 0.9) / 2, 137, 0.9, i === 1 ? '#1d1d1d' : '#ffffff');
          });
          // track bed: platform edge across the rails, ballast and the third rail
          g.fillStyle = '#d9d2c2'; g.fillRect(0, 236, 640, 3);
          for (let x = 0; x < 640; x += 32) {
            poly(g, [[x, 231], [x + 25, 231], [x + 31, 236], [x + 6, 236]], '#b6b2a7');
            line(g, x + 6, 236, x + 31, 236, 0.6, '#efe2c7');
          }
          g.fillStyle = lg(g, 0, 239, 0, 300, [[0, '#191823'], [1, '#2a2632']]); g.fillRect(0, 239, 640, 61);
          const r = rng(2200 + variant);
          for (let n = 0; n < 260; n++) { g.fillStyle = 'rgba(150,140,140,' + (0.12 + r() * 0.2) + ')'; g.fillRect(r() * 640, 262 + r() * 36, 1.6, 1.2); }
          for (let x = 0; x < 640; x += 18) { g.fillStyle = '#3a3036'; g.fillRect(x, 276, 12, 4); }
          g.fillStyle = '#9da3ad'; g.fillRect(0, 273, 640, 2); g.fillRect(0, 281, 640, 2);
          g.fillStyle = '#c9b06a'; g.fillRect(0, 266, 640, 1.4);
        }, FLAT);
      }
      reg2('challenge_train_metro', 360, 74, function (g) {
        // Two-car automatic Ligne 14 train: rounded cab, lit windows, double doors, purple line livery.
        [0, 180].forEach(function (ox, car) {
          const x = ox + 2, w = 176;
          rrect(g, x, 6, w, 60, car ? 6 : 6, lg(g, 0, 6, 0, 66, [[0, '#f4f6f8'], [0.55, '#cfd6de'], [1, '#7c8696']]));
          if (!car) { poly(g, [[x, 12], [x - 2, 30], [x + 2, 60], [x + 10, 64], [x + 10, 8]], '#e9eef3'); }
          g.fillStyle = '#62259d'; g.fillRect(x + 2, 46, w - 4, 4); g.fillStyle = '#9f6fd6'; g.fillRect(x + 2, 46, w - 4, 0.8);
          g.fillStyle = '#1b1f2e'; g.fillRect(x + 4, 16, w - 8, 22);
          for (let k = 0; k < 4; k++) {
            const dx = x + 14 + k * 42;
            g.fillStyle = '#b7c0cc'; g.fillRect(dx, 12, 16, 50); g.fillStyle = '#7d8696'; g.fillRect(dx + 7.6, 12, 0.8, 50);
            lit(g, dx + 2, 18, 5, 18, '#ffeab0'); lit(g, dx + 9, 18, 5, 18, '#ffeab0');
            if (k < 3) for (let wv = 0; wv < 2; wv++) {
              const wx = dx + 20 + wv * 11; lit(g, wx, 18, 9, 18, '#ffe1a0');
              ell(g, wx + 4.5, 30, 2, 2.4, wv ? '#5a3c4c' : '#3c3c5c'); g.fillStyle = 'rgba(40,30,50,0.8)'; g.fillRect(wx + 2, 32, 5, 4);
            }
          }
          g.fillStyle = '#3a3f4e'; g.fillRect(x + 6, 64, w - 12, 5);
          [x + 24, x + w - 24].forEach(function (bx) { ell(g, bx - 8, 70, 4, 4, '#1a1a22'); ell(g, bx + 8, 70, 4, 4, '#1a1a22'); g.fillStyle = '#2a2a36'; g.fillRect(bx - 14, 64, 28, 4); });
        });
        g.fillStyle = '#4a4f5e'; g.fillRect(176, 20, 8, 40);
        // front cab: dark windscreen, headlights and the line roundel
        rrect(g, 360 - 22, 14, 18, 26, 4, '#1b1f2e'); lit(g, 360 - 19, 16, 10, 8, '#7fd3ff');
        ell(g, 360 - 10, 54, 2.4, 2, '#fff6c8'); glowRect(g, '#fff6c8', 360 - 14, 50, 8, 8);
        ell(g, 360 - 30, 42, 6, 6, '#62259d'); txt(g, '14', 360 - 30 - txtW('14', 0.7) / 2, 39.4, 0.7, '#ffffff');
        txt(g, 'AZURE LIGNE 14', 196, 52.4, 0.6, '#3a2a5a');
      }, FLAT);

    reg2('pipe_metro', 44, 46, function (g) {
        g.fillStyle = lg(g, 0, 0, 44, 0, [[0, '#1e3f33'], [0.35, '#4f8a68'], [1, '#183329']]); g.fillRect(2, 5, 40, 41);
        g.fillStyle = '#d8cdb5'; g.fillRect(0, 0, 44, 5); g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, 44, 1.2); g.fillStyle = '#8f846f'; g.fillRect(0, 4.2, 44, 1);
        g.fillStyle = '#132a22'; g.fillRect(5, 9, 34, 30);
        for (let x = 7; x < 38; x += 3) line(g, x, 10, x, 38, 0.8, '#5d9a74');
        g.strokeStyle = '#7fbf92'; g.lineWidth = 1;
        for (let x = 9; x < 38; x += 9) { g.beginPath(); g.ellipse(x + 2, 20, 3.4, 6, 0, 0, Math.PI * 2); g.stroke(); }
        g.fillStyle = '#e9dfc4'; rrect(g, 9, 30, 26, 8, 1.5, '#e9dfc4');
        txt(g, 'METRO', 22 - txtW('METRO', 0.6) / 2, 31.6, 0.6, '#1f4d3a');
        g.fillStyle = '#0d1d18'; g.fillRect(2, 43, 40, 3);
      }, { shade: 0.3 });

    reg2('pipe_metro_top', 64, 72, function (g) {
        const stem = function (sx, dir) {
          g.strokeStyle = '#1f4a38'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(sx, 72); g.bezierCurveTo(sx, 44, sx - dir * 6, 26, sx + dir * 2, 10); g.stroke();
          g.strokeStyle = '#6fae84'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx - 0.8, 72); g.bezierCurveTo(sx - 0.8, 44, sx - dir * 6 - 0.8, 26, sx + dir * 2 - 0.8, 10); g.stroke();
          ell(g, sx + dir * 2, 8, 4.4, 6, '#ff8a3c'); ell(g, sx + dir * 2, 7, 2.6, 3.6, '#ffd08a');
          glowRect(g, '#ff9a4a', sx + dir * 2 - 7, 1, 14, 14);
          line(g, sx + dir * 2 - 3, 14, sx + dir * 2 + 3, 14, 1.2, '#1f4a38');
        };
        stem(8, -1); stem(56, 1);
        g.strokeStyle = '#1f4a38'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(8, 34); g.quadraticCurveTo(32, 22, 56, 34); g.stroke();
        rrect(g, 9, 14, 46, 11, 2, '#e9dfc4');
        g.strokeStyle = '#2d6a4f'; g.lineWidth = 1; g.strokeRect(10.5, 15.5, 43, 8);
        txt(g, 'METROPOLITAIN', 32 - txtW('METROPOLITAIN', 0.48) / 2, 17.4, 0.48, '#1f4d3a');
      }, { shade: 0.2 });

    function metroBlock(g, w, h, variant) {
        // tiled station pillar: white bevelled tiles, green cast-iron cap and a line roundel
        metroTiles(g, 0, 0, w, h, '#e9e1d0', '#9d9384');
        g.fillStyle = lg(g, 0, 0, w, 0, [[0, 'rgba(20,20,40,0.35)'], [0.3, 'rgba(255,255,255,0)'], [1, 'rgba(20,20,40,0.45)']]); g.fillRect(0, 0, w, h);
        g.fillStyle = '#2d5d47'; g.fillRect(0, 0, w, 6); g.fillStyle = '#7fbf92'; g.fillRect(0, 0, w, 1.2);
        for (let x = 4; x < w - 2; x += 8) ell(g, x, 3.6, 1, 1, '#c9dcae');
        g.fillStyle = '#2d5d47'; g.fillRect(0, h - 4, w, 4);
        if (w >= 40 && h >= 40) metroRoundel(g, w / 2, h / 2 + 2, 8);
        else if (w >= 40) { g.fillStyle = ['#62259d', '#ffcd00', '#be418d', '#3c8f6a'][variant % 4]; g.fillRect(4, h / 2, w - 8, 3); }
        depthFace(g, 0, 0, w, h, Math.min(7, h / 5), '#777b76', '#bbc7af');
      }

    function metroDeck(g, w, h, low) {
        // riveted green iron footbridge with lattice
        g.fillStyle = lg(g, 0, 0, 0, h, [[0, '#8fc6a0'], [0.15, '#3f7a5b'], [1, '#183329']]); g.fillRect(0, 0, w, h);
        g.fillStyle = '#d8cdb5'; g.fillRect(0, 0, w, 2.4); g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, 0.8);
        g.save(); g.beginPath(); g.rect(2, 4, w - 4, h - (low ? 11 : 6)); g.clip();
        for (let x = -h; x < w + h; x += 8) { line(g, x, 4, x + h, h, 0.8, '#7fbf92'); line(g, x + h, 4, x, h, 0.8, '#2a5642'); }
        g.restore();
        for (let x = 4; x < w - 2; x += 7) ell(g, x, 3.4, 0.9, 0.9, '#e7e0c4');
        if (low) {
          g.save(); g.beginPath(); g.rect(2, h - 7, w - 4, 6); g.clip();
          g.fillStyle = '#e8c56d'; g.fillRect(2, h - 7, w - 4, 6);
          for (let x = -6; x < w; x += 12) poly(g, [[x, h - 1], [x + 6, h - 7], [x + 12, h - 7], [x + 6, h - 1]], '#13306e');
          g.restore();
        }
        depthFace(g, 0, 0, w, h, Math.min(4, h / 5), '#17382d', '#91b798');
      }

    Object.assign(C, { STATIONS });
  };

  AH.ArtModules.stages['worlds.paris.art.113'] = function (C) {
    const { FLAT, PAL, SKIES, makeSky, reg2 } = C;

    const FR_REGION = 'francecentral', FR_PREFIX = 'fr';

    const FP = { top: '#533079', bot: '#8b477e', accent: '#ffd17a', win: ['#ffe6a4', '#ffc28e', '#e7ccff'] };

    SKIES[FR_REGION] = {
        stops: [[0, '#160b3b'], [0.28, '#432064'], [0.5, '#a33c8c'], [0.68, '#df5c91'], [0.84, '#ff9b72'], [1, '#ffe0a2']],
        sun: { x: 470, y: 218, r: 68, c: ['#fff3bd', '#ffbd79', '#f35c9d'] },
        halo: ['rgba(255,205,145,0.6)', 'rgba(248,105,174,0.22)'],
        cl: ['rgba(154,91,178,0.55)', 'rgba(255,151,179,0.6)', 'rgba(255,219,168,0.52)'],
        hz: 'rgba(255,194,142,0.5)', stars: 105, seed: 33
      };

    reg2('bg_sky_' + FR_REGION, 640, 360, makeSky(SKIES[FR_REGION]), FLAT);

    PAL[FR_REGION] = FP;

    Object.assign(C, { FR_REGION, FR_PREFIX, FP });
  };

  AH.ArtModules.stages['worlds.paris.art.115'] = function (C) {
    const { FLAT, FP, FR_REGION, frArc, frEiffel, frHaussmann, frMontparnasse, frSacre, lamp, lg, lit, poly, reg2, skyline } = C;

    reg2('bg_far_' + FR_REGION, 640, 220, function (g, w, h) {
        skyline(w, h, 301, '#3f275f', FP.accent, 27, 68, 0.22, FP.win)(g);
        const base = h - 5;
        frSacre(g, 90, base, 0.86, FP);
        frArc(g, 245, base, 0.96, FP);
        frMontparnasse(g, 404, base, 0.9, FP);
        frEiffel(g, 552, base, 0.9, FP);
        g.fillStyle = lg(g, 0, h - 35, 0, h, [[0, 'rgba(255,183,126,0)'], [1, 'rgba(255,183,126,0.35)']]); g.fillRect(0, h - 35, w, 35);
      }, FLAT);

    reg2('bg_farp_' + FR_REGION, 640, 220, function (g, w, h) {
        // Landmark-free, seamless band of mansard rooftops, chimneys and tiny dormers.
        const base = h - 5;
        for (let tile = 0; tile < 640; tile += 160) {
          // Repeat the same background block and foreground roof module exactly every 160px.
          [[8, 92, 48], [62, 116, 35], [112, 82, 54]].forEach(function (b, i) {
            g.fillStyle = i % 2 ? '#49345f' : '#3f2b56'; g.fillRect(tile + b[0], base - b[1], b[2], b[1]);
            g.fillStyle = 'rgba(255,209,122,0.48)'; g.fillRect(tile + b[0], base - b[1], b[2], 1);
            for (let wy = base - b[1] + 8; wy < base - 5; wy += 10) lit(g, tile + b[0] + 6, wy, 2.4, 3.2, FP.win[(i + wy) % 3]);
          });
          frHaussmann(g, tile, base, 160, { win: FP.win, stone: ['#a98096', '#7f5d80', '#4a3462'], zinc: ['#69698f', '#4b476f', '#2f2a4c'] });
          [24, 80, 136].forEach(function (offset, i) {
            const x = tile + offset;
            g.fillStyle = '#59405d'; g.fillRect(x, base - 83 - (i % 2) * 4, 4, 18 + (i % 2) * 5);
            g.fillStyle = '#d49a71'; g.fillRect(x - 1, base - 84 - (i % 2) * 4, 6, 1.2);
            poly(g, [[x + 4, base - 73], [x + 9, base - 82 - (i % 2) * 4], [x + 14, base - 73]], '#352641');
            lit(g, x + 7, base - 72, 4, 7, FP.win[i % 3]);
          });
        }
      }, FLAT);

    reg2('bg_near_' + FR_REGION, 640, 190, function (g, w, h) {
        const dark = { top: '#1e1238', bot: '#24133f', accent: '#774566', win: ['#ffcc7c', '#d982a1', '#b69bdf'], stone: ['#4a3260', '#35234c', '#1f1438'], zinc: ['#3a3866', '#29254f', '#171233'] };
        for (let tile = 0; tile < 640; tile += 160) {
          frHaussmann(g, tile, h - 3, 160, dark);
          [24, 80, 136].forEach(function (offset, i) { lamp(g, tile + offset, h - 3, 35 + (i % 2) * 8, i % 2 ? '#ffd58b' : '#f5a8bd'); });
        }
        g.fillStyle = lg(g, 0, h - 24, 0, h, [[0, 'rgba(219,102,161,0)'], [1, 'rgba(219,102,161,0.25)']]); g.fillRect(0, h - 24, w, 24);
      }, FLAT);
  };

  AH.ArtModules.stages['worlds.paris.art.117'] = function (C) {
    const { FR_REGION, regSkins } = C;

    regSkins(FR_REGION);
  };

  AH.ArtModules.stages['worlds.paris.art.119'] = function (C) {
    const { FLAT, FP, FR_REGION, MP, ell, glowRect, lg, line, lit, obSize, poly, reg2, regCoins, regOb, regWater, rng, rrect, shade, txt, txtW } = C;

    regCoins(FR_REGION);

    const props = {
        easel: [28, 38, function (g) {
          line(g, 14, 12, 5, 37, 1.8, '#6a3d34'); line(g, 14, 12, 24, 37, 1.8, '#8d5941'); line(g, 8, 27, 21, 27, 1.4, '#b78352');
          rrect(g, 3, 1, 22, 20, 1, '#6b3f42'); rrect(g, 5, 3, 18, 16, 0.5, '#f6dfbd');
          poly(g, [[6, 17], [10, 10], [14, 14], [18, 6], [22, 17]], '#bd5384'); ell(g, 11, 8, 2, 2, '#ffd26e');
          line(g, 14, 21, 14, 35, 1, '#d5a56b');
        }],
        macarons: [28, 26, function (g) {
          [[14, 20, '#ed648c'], [14, 14, '#80c6a9'], [14, 8, '#dba1d1'], [14, 2, '#f0ca78']].forEach(function (q) {
            ell(g, q[0], q[1], 10.5, 4.8, q[2]); ell(g, q[0], q[1] - 1.2, 9.6, 3.2, lg(g, 4, q[1] - 4, 24, q[1] + 3, [[0, '#fff2d6'], [0.45, q[2]], [1, '#74415f']]));
            g.fillStyle = 'rgba(255,255,255,0.65)'; g.fillRect(6, q[1] - 2, 10, 0.7);
          });
        }]
      };

    Object.keys(props).forEach(function (k) { reg2('prop_' + k, props[k][0], props[k][1], props[k][2], { shade: 0.4 }); });

    reg2('quai_paris_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ddd2c2'], [0.2, '#8d8390'], [1, '#3c354b']]); g.fillRect(0, 0, 32, 8);
        for (let x = 0; x < 32; x += 5) { ell(g, x + 2.5, 2.4, 2.2, 1.5, x % 2 ? '#8a7f90' : '#a99aac'); line(g, x + 1, 2, x + 3, 1.8, 0.5, 'rgba(255,245,219,0.65)'); }
        g.fillStyle = '#3e263d'; g.fillRect(0, 7, 32, 1);
        g.fillStyle = '#bfd19a'; g.globalAlpha = 0.48; g.fillRect(0, 0, 32, 0.8); g.globalAlpha = 1;
        poly(g, [[0, 0], [27, 0], [32, 4], [5, 4]], 'rgba(227,212,190,0.25)');
        for (const x of [8, 24]) line(g, x, 0.5, x + 5, 4, 0.6, '#837683');
      }, FLAT);

    reg2('quai_paris', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#6f6174'], [0.45, '#53485e'], [1, '#31283f']]); g.fillRect(0, 0, 32, 32);
        const r = rng(414);
        for (let y = 0; y < 32; y += 6) {
          const off = (y / 6) % 2 ? 3 : 0;
          for (let x = off; x < 34; x += 8) {
            g.fillStyle = 'rgba(20,14,34,0.45)'; g.fillRect(x, y, 7.4, 5.3);
            g.fillStyle = 'rgba(214,197,196,' + (0.12 + r() * 0.22) + ')'; g.fillRect(x + 0.7, y + 0.5, 5.8, 0.7);
            g.fillStyle = 'rgba(173,146,164,0.25)'; g.fillRect(x + 1, y + 2, 5.6, 0.8);
          }
        }
        g.fillStyle = '#b9a79c'; g.fillRect(0, 0, 32, 1.2);
        g.fillStyle = 'rgba(88,135,86,0.24)'; g.fillRect(0, 29, 32, 3);
      }, FLAT);

    reg2('rail_quai_paris', 16, 14, function (g) {
        // Repeated dark-green bouquiniste boxes with pale trim and tiny gilded books.
        g.fillStyle = '#182a34'; g.fillRect(0, 4, 16, 10);
        g.fillStyle = '#2e6750'; g.fillRect(1, 2, 14, 10);
        g.fillStyle = '#47795d'; g.fillRect(1, 2, 14, 1.2);
        g.fillStyle = '#203b39'; g.fillRect(3, 5, 10, 6.6);
        for (let x = 4; x < 12; x += 2) { g.fillStyle = x % 4 ? '#cfb873' : '#b56c6e'; g.fillRect(x, 6, 1.1, 4.4); g.fillStyle = '#f0d7a1'; g.fillRect(x, 6, 0.4, 3.4); }
        g.fillStyle = '#d2bd8c'; g.fillRect(0, 1, 16, 1); g.fillRect(1, 12, 14, 1);
        g.fillStyle = '#e2ca91'; g.fillRect(0, 13, 2, 1); g.fillRect(14, 13, 2, 1);
      }, FLAT);

    regWater(FR_REGION, ['#54a995', '#123f54', '#b9e8ca', '#edc891']);

    reg2('bridge_' + FR_REGION, 160, 100, function (g) {
        const gold = '#e4b756', hi = '#fff0a4', dark = '#5c3964';
        g.fillStyle = 'rgba(29,20,47,0.66)'; g.fillRect(0, 30, 160, 7);
        g.fillStyle = '#c9a66c'; g.fillRect(0, 28, 160, 2);
        g.fillStyle = '#ead089'; g.fillRect(0, 28, 160, 0.8);
        // graceful arch, spandrel lattice and deck balustrade
        g.strokeStyle = dark; g.lineWidth = 7; g.beginPath(); g.moveTo(6, 31); g.quadraticCurveTo(80, 104, 154, 31); g.stroke();
        g.strokeStyle = gold; g.lineWidth = 4; g.beginPath(); g.moveTo(6, 30); g.quadraticCurveTo(80, 99, 154, 30); g.stroke();
        g.strokeStyle = hi; g.lineWidth = 0.8; g.beginPath(); g.moveTo(7, 29); g.quadraticCurveTo(80, 97, 153, 29); g.stroke();
        for (let x = 10; x < 151; x += 8) {
          const t = (x - 6) / 148, y = 30 + 70 * (1 - 4 * t * (1 - t));
          line(g, x, y, x, 27, 0.8, '#bd9957');
        }
        g.fillStyle = '#b9934e'; g.fillRect(0, 23, 160, 2); g.fillStyle = '#f2d382'; g.fillRect(0, 23, 160, 0.8);
        for (let x = 8; x < 158; x += 7) { g.fillStyle = '#f2d382'; g.fillRect(x, 19, 1, 5); ell(g, x + 0.5, 18, 1, 1.4, '#fff0a4'); }
        // four monumental pylons and gold winged ornaments
        [9, 45, 115, 151].forEach(function (x, i) {
          g.fillStyle = lg(g, x - 7, 0, x + 7, 0, [[0, '#fff0b2'], [0.5, '#c99a4e'], [1, '#68445d']]);
          g.fillRect(x - 5, 8, 10, 20); g.fillRect(x - 7, 25, 14, 3);
          poly(g, [[x - 8, 10], [x, 1], [x + 8, 10]], '#d5aa5a');
          ell(g, x, 2, 3, 3, '#ffe38c');
          line(g, x, 2, x + (i % 2 ? 6 : -6), -7, 1.3, '#f6d982');
          ell(g, x + (i % 2 ? 6 : -6), -8, 3, 1.5, '#f5d377');
          line(g, x - 4, 12, x + 4, 12, 0.8, '#fff0a4');
          lit(g, x - 1.5, 17, 3, 4, '#ffe2a0');
        });
        for (let x = 54; x < 108; x += 9) { ell(g, x, 26, 2.4, 2.4, '#f1d48a'); }
      }, { shade: 0.2, noOutline: true });

    reg2('boat_' + FR_REGION, 120, 36, function (g) {
        poly(g, [[2, 20], [117, 20], [110, 30], [104, 32], [16, 32], [6, 27]], lg(g, 0, 20, 0, 32, [[0, '#f7f1e6'], [0.35, '#d9cfc4'], [0.4, '#2f4c78'], [1, '#182644']]));
        g.fillStyle = '#e1b55e'; g.fillRect(4, 24, 110, 1);
        g.fillStyle = '#efe6d8'; g.fillRect(14, 17, 96, 4);
        // glazed saloon: curved glass roof, slim mullions, passengers' silhouettes
        poly(g, [[16, 18], [18, 9], [24, 6], [100, 6], [106, 9], [108, 18]], lg(g, 0, 6, 0, 18, [[0, '#d8f2f6'], [0.4, '#8fc4d4'], [1, '#3d6b8a']]));
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(24, 6.6, 76, 0.9);
        for (let x = 22; x < 106; x += 6) line(g, x, 7, x - 1, 18, 0.6, '#e6eef0');
        for (let x = 27; x < 100; x += 9) { ell(g, x, 15.2, 1.5, 1.7, x % 2 ? '#4a3a5a' : '#704a5a'); g.fillStyle = 'rgba(40,34,60,0.7)'; g.fillRect(x - 1.8, 16.4, 3.6, 1.6); }
        g.fillStyle = '#f6efe2'; g.fillRect(22, 5, 80, 1.6);
        // open stern deck with rail, flag mast and wheelhouse
        g.fillStyle = '#3c2f4a'; g.fillRect(6, 13, 9, 1); for (let x = 6; x <= 14; x += 2) line(g, x, 13, x, 18, 0.5, '#e8dccb');
        line(g, 4, 20, 4, 8, 0.8, '#d7c7b2'); poly(g, [[4, 8], [10, 9.5], [4, 11]], '#3f8ff0');
        rrect(g, 104, 10, 9, 9, 1.4, '#f2eadc'); lit(g, 106, 11.6, 5, 3.6, '#bfe8f3');
        rrect(g, 42, 21, 38, 6, 1, '#1d2b4a'); txt(g, 'BATEAU AZURE', 61 - txtW('BATEAU AZURE', 0.5) / 2, 22.2, 0.5, '#ffe7a6');
        for (let x = 18; x < 104; x += 7) ell(g, x, 28.4, 0.9, 0.9, '#9fd8f0');
        ell(g, 112, 21, 1.4, 1.2, '#fff1b1'); glowRect(g, '#fff1b1', 110, 19, 4, 4);
      }, { shade: 0.35 });

    regOb('bakery', 88, 62, function (g) {
        rrect(g, 3, 28, 82, 28, 2, '#1d4b57');
        g.strokeStyle = '#e6c06a'; g.lineWidth = 0.8; g.strokeRect(6, 40, 76, 13);
        txt(g, 'PAIN CHAUD', 44 - txtW('PAIN CHAUD', 0.9) / 2, 43, 0.9, '#ffe08a', '#0b2129');
        [7, 79].forEach(function (x) { g.fillStyle = '#d9c8a4'; g.fillRect(x, 9, 2, 20); });
        for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#f3ead8' : '#2f7da0'; g.fillRect(2 + k * 10.5, 8, 10.5, 8); ell(g, 7.25 + k * 10.5, 16, 5.25, 2.2, k % 2 ? '#f3ead8' : '#2f7da0'); }
        rrect(g, 12, 0, 64, 9, 1.4, '#163e49');
        txt(g, 'BOULANGERIE', 44 - txtW('BOULANGERIE', 0.8) / 2, 1.6, 0.8, '#ffe08a');
        // counter of bread
        g.fillStyle = '#8a5a3a'; g.fillRect(4, 27, 80, 3);
        rrect(g, 9, 21, 22, 7, 2, '#b9874e');
        for (let b = 0; b < 4; b++) { g.save(); g.translate(13 + b * 5, 19); g.rotate(-0.5 + b * 0.25); ell(g, 0, 0, 1.8, 7, '#d0883f'); for (let c = -4; c <= 4; c += 4) line(g, -0.8, c - 0.6, 0.8, c + 0.6, 0.45, '#f6d496'); g.restore(); }
        for (let b = 0; b < 3; b++) { const bx = 42 + b * 9; ell(g, bx, 24.5, 4.2, 2.6, '#d58e3f'); ell(g, bx - 0.8, 23.6, 2.4, 1, '#f5c97e'); ell(g, bx - 4, 25.6, 1.4, 1.2, '#c97c35'); ell(g, bx + 4, 25.6, 1.4, 1.2, '#c97c35'); }
        ell(g, 73, 24, 6, 4, '#a76a33'); line(g, 69, 23, 77, 25, 0.6, '#e8b56d'); line(g, 70, 25.6, 76, 22, 0.6, '#e8b56d');
        [15, 73].forEach(function (x) { ell(g, x, 57, 4.4, 4.4, '#182844'); ell(g, x, 57, 1.6, 1.6, '#c9b98d'); });
      });

    const parisObs = {
        vespa: [62, 36, function (g, w, h) {
          ell(g, 14, 29, 6, 6, '#1f1b34'); ell(g, 14, 29, 3.4, 3.4, '#ccd0d5'); ell(g, 49, 29, 6, 6, '#1f1b34'); ell(g, 49, 29, 3.4, 3.4, '#ccd0d5');
          poly(g, [[9, 26], [18, 20], [28, 22], [38, 17], [47, 19], [52, 24], [49, 28], [20, 28], [15, 25]], lg(g, 9, 17, 52, 29, [[0, '#ffd568'], [0.5, '#4bc8b2'], [1, '#1d6874']]));
          ell(g, 26, 20, 7, 3, '#e9ece7'); line(g, 26, 19, 25, 12, 1.2, '#342444'); line(g, 23, 12, 30, 12, 1.5, '#c6a75e');
          ell(g, 48, 21, 2, 1.5, '#fff6c1'); line(g, 16, 18, 13, 16, 1.4, '#d6b870');
        }],
        cafe: [78, 48, function (g, w, h) {
          // little café table with two chairs as a solid, flat obstacle.
          g.fillStyle = '#37263e'; g.fillRect(5, 43, 68, 3);
          g.fillStyle = '#d28c53'; g.fillRect(20, 25, 38, 4); line(g, 39, 29, 39, 43, 2, '#d0a76e');
          g.fillStyle = '#ead3ad'; g.fillRect(16, 18, 45, 6);
          for (let x = 17; x < 60; x += 8) { g.fillStyle = x % 2 ? '#d34f70' : '#f2e4cc'; g.fillRect(x, 18, 4, 6); }
          line(g, 13, 28, 9, 43, 2, '#b08a69'); line(g, 9, 28, 13, 28, 2, '#b08a69');
          line(g, 66, 29, 66, 44, 2, '#b08a69'); line(g, 61, 29, 69, 29, 2, '#b08a69'); line(g, 61, 30, 61, 44, 2, '#b08a69');
          ell(g, 34, 15, 5, 2.2, '#fff3d4'); rrect(g, 35, 11, 7, 4, 1.5, '#6a4771');
        }],
        kiosk: [56, 58, function (g, w, h) {
          // Parisian Morris column with poster panels and a domed green crown.
          g.fillStyle = '#293c3b'; g.fillRect(18, 10, 20, 46); g.fillStyle = '#47745a'; g.fillRect(21, 14, 14, 37);
          ell(g, 28, 12, 12, 5.5, '#46745b'); ell(g, 28, 8, 9, 5, '#6b9670');
          rrect(g, 22, 17, 12, 15, 2, '#203e40'); rrect(g, 24, 19, 8, 11, 1, '#edb9a2');
          txt(g, 'THEATRE', 23.2, 20, 0.28, '#fff1c5', '#5a294e');
          rrect(g, 22, 34, 12, 14, 1, '#284440');
          for (let y = 36; y < 46; y += 4) { g.fillStyle = y % 2 ? '#d14f78' : '#e8cc8d'; g.fillRect(24, y, 8, 2.6); }
          g.fillStyle = '#d8bc82'; g.fillRect(16, 54, 24, 3); g.fillRect(18, 50, 20, 2);
        }]
      };

    Object.keys(parisObs).forEach(function (k) { obSize[k] = parisObs[k].slice(0, 2); regOb(k, parisObs[k][0], parisObs[k][1], parisObs[k][2]); });

    reg2('secret_' + FR_REGION, 30, 62, function (g) {
        // Guimard Art Nouveau Metro surround: cast green iron vines and METROPOLITAIN nameplate.
        const iron = '#38775f', light = '#9cbd83', dark = '#1c4a48';
        g.fillStyle = 'rgba(15,9,36,0.72)'; g.fillRect(8, 23, 14, 39);
        rrect(g, 7, 21, 16, 42, 8, iron); g.fillStyle = '#201831'; g.fillRect(10, 31, 10, 31);
        g.fillStyle = '#76a777'; g.fillRect(7, 20, 16, 3); g.fillStyle = '#dbcb8b'; g.fillRect(1, 16.5, 28, 6);
        g.save(); g.translate(3.3, 17.8); g.scale(0.72, 1); txt(g, 'METROPOLITAIN', 0, 0, 0.4, '#fff1b4', '#214437'); g.restore();
        // iconic sweeping Guimard canopy and stems
        g.strokeStyle = dark; g.lineWidth = 3; g.beginPath(); g.moveTo(7, 22); g.quadraticCurveTo(2, 9, 7, 3); g.quadraticCurveTo(15, -1, 23, 4); g.quadraticCurveTo(29, 10, 23, 22); g.stroke();
        g.strokeStyle = light; g.lineWidth = 1.4; g.beginPath(); g.moveTo(7, 21); g.quadraticCurveTo(1, 9, 7, 3); g.quadraticCurveTo(15, -2, 23, 4); g.quadraticCurveTo(29, 10, 23, 21); g.stroke();
        line(g, 7, 20, 7, 28, 2.4, iron); line(g, 23, 20, 23, 28, 2.4, iron);
        for (let i = 0; i < 3; i++) {
          const x = 7 + i * 8;
          g.beginPath(); g.moveTo(x, 17); g.bezierCurveTo(x - 4, 12, x + 3, 9, x, 5); g.strokeStyle = light; g.lineWidth = 0.8; g.stroke();
          ell(g, x + (i % 2 ? 2 : -2), 8, 1.6, 2, '#91bd7c');
        }
        // Repaint the full station name over the ironwork so it remains legible at game scale.
        rrect(g, 1, 16, 28, 8, 1.2, '#214a40'); g.strokeStyle = '#d7c58c'; g.lineWidth = 0.7; g.strokeRect(1, 16, 28, 8);
        g.save(); g.translate(2.8, 18.1); g.scale(0.63, 1); txt(g, 'METROPOLITAIN', 0, 0, 0.48, '#fff1b4', '#183a34'); g.restore();
        g.fillStyle = '#b4c78c'; g.fillRect(12, 39, 1, 16); g.fillRect(17, 39, 1, 16);
        ell(g, 15, 35, 2.4, 2.4, '#e8c77a');
        g.fillStyle = '#d7c58c'; g.fillRect(6, 60, 18, 2);
      }, { shade: 0.3 });

    MP[FR_REGION] = FP;

    Object.assign(C, { props, parisObs });
  };

  content.parts['CARS_citroen'] = function (C) {
    const { lg, line, poly, wheels } = C;

    return [38, 20, function (g, w, h) { poly(g, [[2, h - 6], [3, h - 11], [10, h - 13], [13, 4], [26, 3], [33, h - 12], [37, h - 10], [37, h - 6]], lg(g, 0, 3, 0, h, [[0, '#ff8ab8'], [1, '#a82a6a']])); poly(g, [[14, 5.4], [25, 4.6], [30, h - 12], [12, h - 12]], 'rgba(200,230,255,0.85)'); line(g, 21, 5, 21, h - 12, 0.8, '#a82a6a'); wheels(g, [9, 30], h - 4.4, 3.8); }];
  };
})();
