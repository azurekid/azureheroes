/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['sydney'] = AH.Worlds['sydney'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { panoramaLandmarks: 3, sceneryRoutes: 2 };
  AH.ArtModules.regions['australiaeast'] = content;

  AH.ArtModules.stages['worlds.sydney.scenery.13'] = function (C) {
    const { ell, lg, lit, poly, silFill } = C;

    Object.assign(C, { operaHouse, harbourBridge, sydneyTower });
    function operaHouse(g, x0, base, s, P) {
        const cream = lg(g, 0, base - 95 * s, 0, base, [[0, '#fff4e8'], [0.5, '#e3c8ff'], [1, '#9a7ae0']]);
        const sail = function (x, w, h, lean, flip) {
          g.save(); if (flip) { g.translate(x * 2 + w, 0); g.scale(-1, 1); }
          g.beginPath(); g.moveTo(x, base - 8 * s); g.quadraticCurveTo(x + w * 0.02, base - h * 0.95, x + lean, base - h - 8 * s);
          g.quadraticCurveTo(x + w * 0.98, base - h * 0.62, x + w, base - 8 * s); g.closePath();
          g.fillStyle = cream; g.fill();
          g.strokeStyle = 'rgba(150,100,255,0.55)'; g.lineWidth = 0.6;
          for (let k = 1; k < 7; k++) { g.beginPath(); g.moveTo(x + lean, base - h - 8 * s); g.lineTo(x + w * (k / 7) + w * 0.06, base - 8 * s); g.stroke(); }
          g.fillStyle = 'rgba(255,122,217,0.3)'; g.fillRect(x, base - 8 * s - 1.4, w, 1.4);
          g.restore();
        };
        g.fillStyle = silFill(g, base - 10 * s, base, '#c8a8ff', '#5a3aa8'); g.fillRect(x0 - 6 * s, base - 9 * s, 160 * s, 9 * s);
        for (let k = 0; k < 14; k++) lit(g, x0 - 2 * s + k * 11 * s, base - 5 * s, 3, 2, P.win[k % P.win.length]);
        sail(x0, 52 * s, 78 * s, 6 * s, false); sail(x0 + 22 * s, 40 * s, 58 * s, 5 * s, false); sail(x0 + 40 * s, 28 * s, 40 * s, 4 * s, false);
        sail(x0 + 66 * s, 62 * s, 96 * s, 8 * s, true); sail(x0 + 92 * s, 44 * s, 72 * s, 6 * s, true); sail(x0 + 112 * s, 34 * s, 50 * s, 4 * s, true);
      }

    function harbourBridge(g, x0, x1, base, P) {
        const f = silFill(g, base - 110, base, P.top, P.bot);
        const mid = (x0 + x1) / 2, deck = base - 30;
        const arcY = function (x, top) { const t = (x - (x0 + 12)) / (x1 - x0 - 24); return (1 - t) * (1 - t) * (base - 20) + 2 * (1 - t) * t * top + t * t * (base - 20); };
        g.strokeStyle = 'rgba(160,130,255,0.55)'; g.lineWidth = 0.7;
        for (let x = x0 + 22; x < x1 - 20; x += 9) { g.beginPath(); g.moveTo(x, arcY(x, base - 160)); g.lineTo(x, deck); g.stroke(); }
        g.strokeStyle = P.top; g.lineWidth = 2.6;
        [-170, -150].forEach(function (c) { g.beginPath(); g.moveTo(x0 + 12, base - 20); g.quadraticCurveTo(mid, base + c + 20, x1 - 12, base - 20); g.stroke(); });
        g.strokeStyle = P.accent; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x0 + 12, base - 20); g.quadraticCurveTo(mid, base - 150, x1 - 12, base - 20); g.stroke();
        g.fillStyle = f; g.fillRect(x0, deck, x1 - x0, 5);
        g.fillStyle = '#ffb347'; for (let x = x0 + 4; x < x1; x += 8) g.fillRect(x, deck - 1.2, 1.4, 1.2);
        g.fillStyle = P.accent; g.fillRect(x0, deck, x1 - x0, 0.8);
        [x0 + 8, x1 - 8].forEach(function (px) { g.fillStyle = f; g.fillRect(px - 8, base - 48, 16, 48); g.fillStyle = P.accent; g.fillRect(px - 8, base - 48, 16, 1); lit(g, px - 1.6, base - 42, 3.2, 8, P.win[0]); lit(g, px - 1.6, base - 24, 3.2, 8, P.win[1]); poly(g, [[px - 9, base - 48], [px, base - 56], [px + 9, base - 48]], P.top); });
      }

    function sydneyTower(g, cx, base, s, P) {
        g.fillStyle = silFill(g, base - 130 * s, base, P.top, P.bot); g.fillRect(cx - 2.4 * s, base - 118 * s, 4.8 * s, 118 * s);
        poly(g, [[cx - 13 * s, base - 98 * s], [cx + 13 * s, base - 98 * s], [cx + 9 * s, base - 82 * s], [cx - 9 * s, base - 82 * s]], '#ffb347');
        ell(g, cx, base - 99 * s, 13 * s, 3 * s, '#ffe9a0');
        for (let k = 0; k < 6; k++) lit(g, cx - 10 * s + k * 3.6 * s, base - 94 * s, 2 * s, 5 * s, k % 2 ? '#fff6c0' : '#ff9a40');
        g.fillStyle = P.top; g.fillRect(cx - 0.5, base - 140 * s, 1, 22 * s);
        lit(g, cx - 1.2, base - 142 * s, 2.4, 2.4, '#ff2a4a');
        for (let k = 0; k < 8; k++) { g.strokeStyle = 'rgba(255,230,150,0.55)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(cx, base - 98 * s); g.lineTo(cx + (k - 3.5) * 10 * s, base - 118 * s - 4 * s); g.stroke(); }
      }
  };

  AH.ArtModules.stages['worlds.sydney.scenery.24'] = function (C) {
    const { FLAT, PAL, reg2, skyline } = C;

    reg2('bg_near_australiaeast', 640, 190, skyline(640, 190, 89, '#170a48', '#ffc860', 40, 100, 0.28, PAL.australiaeast.win), FLAT);
  };

  AH.ArtModules.stages['worlds.sydney.scenery.124'] = function (C) {
    const { SC, ell, glowRect, lg, line, lit, poly, rng, shade, txt } = C;

    Object.assign(SC.australiaeast, {
        sc_au_uluru: [340, 210, function (g, w, h) {
          g.beginPath(); g.moveTo(3, h - 8); g.lineTo(14, h - 62);
          g.quadraticCurveTo(26, h - 118, 63, h - 143); g.quadraticCurveTo(99, h - 165, 165, h - 163);
          g.quadraticCurveTo(233, h - 164, 270, h - 145); g.quadraticCurveTo(300, h - 126, 313, h - 91);
          g.quadraticCurveTo(330, h - 67, 337, h - 10); g.closePath();
          g.fillStyle = lg(g, 0, h - 165, 80, h, [[0, '#e3a06a'], [0.38, '#c46e49'], [1, '#894739']]); g.fill();
          g.save(); g.clip();
          const r = rng(1287);
          for (let x = 22; x < w; x += 8) {
            const top = h - 159 + r() * 18;
            g.strokeStyle = x % 16 ? 'rgba(106,54,39,0.42)' : 'rgba(247,173,110,0.5)'; g.lineWidth = 1 + r() * 2;
            g.beginPath(); g.moveTo(x, top); g.bezierCurveTo(x + 4, top + 32, x - 5, h - 54, x + 6, h - 12); g.stroke();
          }
          for (let y = h - 140; y < h - 15; y += 14) line(g, 10, y, w - 10, y + 9, 0.6, 'rgba(242,160,103,0.18)');
          g.restore();
          poly(g, [[0, h - 14], [75, h - 22], [167, h - 9], [268, h - 19], [340, h - 13], [340, h], [0, h]], '#bd7851');
          for (let x = 7; x < w; x += 21) { ell(g, x, h - 7 - x % 5, 5, 1.4, '#88835c'); line(g, x, h - 9, x + 1, h - 13, 0.7, '#c1ad79'); }
          txt(g, 'ULURU', 146, h - 9, 0.9, '#f3d09a', '#7f4e3a');
        }],
        sc_au_flinders: [220, 190, function (g, w, h, P) {
          const stone = lg(g, 0, h - 160, 0, h, [[0, '#d9c9c4'], [0.5, '#907a9d'], [1, '#3a315f']]);
          g.fillStyle = stone; g.fillRect(22, h - 79, 176, 79); g.fillRect(35, h - 103, 151, 24); g.fillRect(51, h - 129, 116, 26);
          g.fillStyle = '#34294f'; g.fillRect(96, h - 178, 30, 49); poly(g, [[91, h - 178], [111, h - 190], [131, h - 178]], '#47375f');
          g.fillStyle = stone; g.fillRect(99, h - 169, 24, 32); g.fillStyle = '#282348'; g.beginPath(); g.arc(111, h - 154, 9, Math.PI, 0); g.fill(); g.fillRect(102, h - 154, 18, 10);
          ell(g, 111, h - 157, 6, 6, '#f4cf77'); ell(g, 111, h - 157, 4, 4, '#5a3b69'); line(g, 111, h - 157, 111, h - 160, 0.8, '#fff1ab'); line(g, 111, h - 157, 114, h - 156, 0.8, '#fff1ab');
          for (let x = 35; x < 187; x += 14) { lit(g, x, h - 69, 7, 11, P.win[(x / 14 | 0) % 3]); lit(g, x + 5, h - 94, 6, 9, P.win[(x / 14 + 1 | 0) % 3]); }
          for (let x = 48; x < 175; x += 20) { g.fillStyle = '#35305f'; g.fillRect(x, h - 127, 9, 15); poly(g, [[x - 2, h - 127], [x + 4.5, h - 138], [x + 11, h - 127]], '#4a3a68'); }
          line(g, 22, h - 80, 198, h - 80, 1.5, P.accent); txt(g, 'FLINDERS ST', 72, h - 14, 1, '#ffe8a0', '#292146');
        }],
        sc_au_apostles: [250, 150, function (g, w, h, P) {
          g.fillStyle = lg(g, 0, h - 61, 0, h, [[0, '#3e8eb0'], [1, '#132c66']]); g.fillRect(0, h - 60, w, 60);
          for (let y = h - 51; y < h - 5; y += 12) line(g, 5 + y % 9, y, w - 8, y, 0.8, 'rgba(148,225,255,0.5)');
          const stack = function (x, base, wid, high, shade) {
            g.fillStyle = shade; g.beginPath(); g.moveTo(x - wid / 2, base); g.lineTo(x - wid / 2 + 3, base - high * 0.55); g.quadraticCurveTo(x - wid / 2 + 4, base - high, x, base - high); g.quadraticCurveTo(x + wid / 2 - 3, base - high * 0.91, x + wid / 2 - 2, base - high * 0.48); g.lineTo(x + wid / 2, base); g.closePath(); g.fill();
            line(g, x - wid * 0.24, base - high * 0.76, x - wid * 0.18, base - 4, 1, 'rgba(255,190,126,0.7)');
          };
          stack(25, h - 44, 30, 52, '#bd705d'); stack(67, h - 43, 35, 75, '#d17b60'); stack(113, h - 45, 40, 96, '#c67561'); stack(161, h - 43, 34, 78, '#b56361'); stack(205, h - 44, 32, 60, '#cc745c');
          g.fillStyle = '#322957'; g.beginPath(); g.moveTo(0, h - 17); g.quadraticCurveTo(56, h - 39, 110, h - 27); g.quadraticCurveTo(172, h - 44, 250, h - 20); g.lineTo(250, h); g.lineTo(0, h); g.closePath(); g.fill();
          line(g, 4, h - 17, 247, h - 20, 1.4, P.accent); txt(g, 'TWELVE APOSTLES', 76, h - 10, 1, '#ffe8a0', '#1b2451');
        }],
        sc_au_storybridge: [270, 165, function (g, w, h, P) {
          g.fillStyle = '#244477'; g.fillRect(0, h - 28, w, 28); g.fillStyle = '#d7d2ef'; g.fillRect(0, h - 32, w, 4);
          const top = h - 128, deck = h - 35;
          g.fillStyle = '#33345f'; g.fillRect(20, top + 12, 18, h - top - 40); g.fillRect(232, top + 12, 18, h - top - 40);
          g.fillStyle = '#4d426f'; g.fillRect(16, top + 9, 26, 7); g.fillRect(228, top + 9, 26, 7);
          g.strokeStyle = '#34335f'; g.lineWidth = 8; g.beginPath(); g.moveTo(33, deck); g.quadraticCurveTo(135, top - 5, 239, deck); g.stroke();
          g.strokeStyle = P.accent; g.lineWidth = 1.5; g.beginPath(); g.moveTo(34, deck - 2); g.quadraticCurveTo(135, top, 238, deck - 2); g.stroke();
          g.strokeStyle = '#77739a'; g.lineWidth = 1.2;
          for (let i = 0; i <= 12; i++) { const x = 38 + i * 16; const t = (x - 33) / 206; const y = top - 1 + 4 * Math.pow((t - 0.5) * 2, 2); g.beginPath(); g.moveTo(x, y); g.lineTo(x, deck - 1); g.stroke(); }
          g.fillStyle = '#3a3b67'; g.fillRect(5, deck, 260, 7); line(g, 8, deck, 262, deck, 1.3, '#ffe09a');
          for (let x = 12; x < 263; x += 20) lit(g, x, deck + 8, 3, 4, '#ffd58a');
          txt(g, 'STORY BRIDGE', 99, h - 14, 1, '#ffe8a0', '#25244b');
        }],
        sc_au_q1: [95, 250, function (g, w, h, P) {
          const cx = 48;
          g.fillStyle = lg(g, 28, 0, 68, 0, [[0, '#d8edff'], [0.3, '#a9c6ed'], [0.65, '#5c6eae'], [1, '#29284f']]);
          g.beginPath(); g.moveTo(cx - 9, h); g.lineTo(cx - 17, h - 128); g.quadraticCurveTo(cx - 13, h - 179, cx - 7, h - 198); g.lineTo(cx - 4, h - 204); g.lineTo(cx + 4, h - 204); g.lineTo(cx + 7, h - 198); g.quadraticCurveTo(cx + 13, h - 179, cx + 17, h - 128); g.lineTo(cx + 9, h); g.closePath(); g.fill();
          g.fillStyle = '#39335f'; g.fillRect(cx - 20, h - 206, 40, 12); g.fillRect(cx - 15, h - 216, 30, 8); ell(g, cx, h - 219, 10, 4, '#6d5f8c');
          line(g, cx - 19, h - 202, cx + 19, h - 202, 1.5, P.accent);
          for (let y = h - 190; y < h - 16; y += 13) { line(g, cx - 10 + (h - y) * 0.015, y, cx + 10 - (h - y) * 0.015, y, 0.6, 'rgba(235,244,255,0.55)'); if (y % 2) lit(g, cx - 3, y + 2, 5, 3, P.win[(y / 13 | 0) % 3]); }
          g.fillStyle = '#36335f'; g.fillRect(cx - 16, h - 6, 32, 6); txt(g, 'Q1', cx - 7, h - 22, 1, '#ffe8a0', '#25244b');
        }],
        sc_au_byronlighthouse: [155, 175, function (g, w, h, P) {
          g.fillStyle = '#252f62'; g.fillRect(0, h - 19, w, 19);
          g.fillStyle = '#35536f'; g.beginPath(); g.moveTo(0, h - 19); g.quadraticCurveTo(40, h - 45, 79, h - 28); g.quadraticCurveTo(120, h - 47, 155, h - 21); g.lineTo(155, h); g.lineTo(0, h); g.closePath(); g.fill();
          const tower = lg(g, 61, h - 141, 93, h - 15, [[0, '#fff0ce'], [0.5, '#d7c8c0'], [1, '#72628d']]);
          g.fillStyle = tower; g.beginPath(); g.moveTo(67, h - 23); g.lineTo(71, h - 133); g.lineTo(85, h - 133); g.lineTo(90, h - 23); g.closePath(); g.fill();
          g.fillStyle = '#ede0d4'; g.fillRect(67, h - 139, 23, 8); g.fillStyle = '#34315d'; g.fillRect(70, h - 153, 17, 14); g.fillStyle = '#f2dfbd'; g.fillRect(73, h - 151, 11, 8);
          g.fillStyle = '#352f5e'; g.beginPath(); g.moveTo(67, h - 153); g.lineTo(78, h - 165); g.lineTo(90, h - 153); g.closePath(); g.fill();
          g.fillStyle = '#f5dc9a'; g.fillRect(75, h - 149, 7, 5); glowRect(g, '#ffe9a0', 76, h - 149, 5, 4); line(g, 78, h - 149, 31, h - 165, 1, 'rgba(255,233,160,0.55)'); line(g, 82, h - 149, 129, h - 166, 1, 'rgba(255,233,160,0.55)');
          line(g, 68, h - 21, 91, h - 21, 1.5, P.accent); g.fillStyle = '#4a416c'; g.fillRect(61, h - 19, 38, 8);
          for (let x = 9; x < 150; x += 15) ell(g, x, h - 14 - (x % 3), 5, 2, '#7ab3c1');
          txt(g, 'BYRON BAY', 47, h - 10, 1, '#ffe8a0', '#25244b');
        }]
      });
  };

  AH.ArtModules.stages['worlds.sydney.scenery.129'] = function (C) {
    const { SC, ell, lg, line, lit, outback4x4, palm, poly, rng, rrect, txt } = C;

    Object.assign(SC.australiaeast, {
        sc_au_beach: [360, 170, function (g, w, h) {
          g.fillStyle = lg(g, 0, 30, 0, h, [[0, '#348baf'], [0.45, '#65becb'], [1, '#bcdfce']]); g.fillRect(0, 48, w, 122);
          poly(g, [[0, 170], [0, 123], [64, 117], [147, 129], [227, 98], [300, 84], [360, 90], [360, 170]], lg(g, 0, 90, 0, 170, [[0, '#e9c78e'], [1, '#c19e79']]));
          for (let wave = 0; wave < 4; wave++) {
            g.strokeStyle = wave % 2 ? '#bde7df' : '#f1f5df'; g.lineWidth = wave % 2 ? 1 : 2;
            g.beginPath(); g.moveTo(0, 66 + wave * 13); g.bezierCurveTo(120, 52 + wave * 16, 176, 113 + wave * 5, 360, 56 + wave * 7); g.stroke();
          }
          g.fillStyle = '#c9d6c6'; g.fillRect(263, 57, 91, 28); g.fillStyle = '#f0efda'; g.fillRect(265, 47, 87, 11);
          for (let x = 270; x < 350; x += 13) lit(g, x, 61, 8, 12, '#7dadae');
          txt(g, 'BONDI SURF', 273, 50, 0.8, '#226879');
          palm(g, 336, 121, 106);
          [[42, 137, '#d87b66'], [126, 145, '#598da6'], [219, 129, '#d9ac51']].forEach(([x, y, color]) => {
            line(g, x, y, x, y - 22, 0.9, '#765d55');
            poly(g, [[x - 16, y - 20], [x, y - 30], [x + 16, y - 20]], color);
            ell(g, x + 10, y + 3, 12, 2, '#e8d8ae');
          });
          [181, 249].forEach((x) => { line(g, x, 143, x, 108, 1, '#e9dfc2'); poly(g, [[x, 108], [x + 14, 113], [x, 117]], '#cf4750'); poly(g, [[x, 117], [x + 14, 113], [x + 14, 120], [x, 124]], '#efc24c'); });
          ell(g, 196, 146, 3, 17, '#e9d8ae', 0.24); line(g, 196, 131, 197, 160, 0.8, '#dc755c');
          txt(g, 'SYDNEY BEACH', 16, 156, 0.85, '#5e6057');
        }],
        sc_au_outback: [340, 170, function (g, w, h) {
          poly(g, [[0, 85], [35, 63], [76, 72], [122, 42], [162, 62], [211, 51], [257, 70], [298, 56], [340, 84], [340, 170], [0, 170]], lg(g, 0, 60, 0, 170, [[0, '#bc7159'], [1, '#b35c43']]));
          g.fillStyle = '#d39365'; g.beginPath(); g.moveTo(86, 170); g.quadraticCurveTo(112, 132, 229, 97); g.quadraticCurveTo(165, 133, 154, 170); g.closePath(); g.fill();
          const r = rng(303);
          for (let i = 0; i < 70; i++) {
            const x = r() * w, y = 97 + r() * 72; ell(g, x, y, 2 + r() * 5, 1, '#916e4b');
            if (i % 5 === 0) { line(g, x, y, x - 2, y - 4, 0.6, '#a49a68'); line(g, x, y, x + 2, y - 6, 0.6, '#c8b47d'); }
          }
          [28, 284].forEach((x, i) => {
            line(g, x, 133, x + 7, 50 + i * 18, 5, '#797264'); line(g, x + 5, 80, x - 17, 57, 2.2, '#87816c'); line(g, x + 6, 75, x + 26, 43, 2, '#87816c');
            [[-15, 55], [8, 38], [30, 44], [11, 65]].forEach(([dx, y]) => ell(g, x + dx, y + i * 18, 22, 8, '#6d8068', -0.1));
          });
          g.fillStyle = '#e5cda4'; g.fillRect(185, 90, 93, 30); poly(g, [[179, 91], [193, 80], [271, 80], [284, 91]], '#81685c');
          rrect(g, 193, 96, 77, 12, 1, '#66473e'); txt(g, 'OUTBACK ROADHOUSE', 197, 100, 0.65, '#ffe1a3');
          g.save(); g.translate(188, 120); g.scale(0.9, 0.9); outback4x4(g); g.restore();
          line(g, 163, 99, 163, 137, 1.6, '#625a4a'); rrect(g, 139, 94, 48, 16, 1, '#d3a442'); txt(g, 'ULURU', 148, 99, 0.9, '#4e4b3b');
        }]
      });
  };

  content.parts['panorama'] = function (C) {
    const { PAL } = C;
    const harbourBridge = (...args) => C.harbourBridge(...args);
    const operaHouse = (...args) => C.operaHouse(...args);
    const skyline = (...args) => C.skyline(...args);
    const sydneyTower = (...args) => C.sydneyTower(...args);

    return function (g, w, h) {
    const P = PAL['australiaeast'];
    const base = h - 6;
    
            skyline(w, h, 73, '#2a1a78', P.accent, 26, 64, 0.22, P.win)(g);
            operaHouse(g, 18, base, 0.9, P);
            harbourBridge(g, 190, 470, base, P);
            sydneyTower(g, 560, base, 0.8, P);
          
    };
  };

  content.parts['MP_australiaeast'] = function (C) {

    return { top: '#3a3a98', bot: '#6a4aa8', accent: '#ffd070', win: ['#ffe9a0', '#ffb060', '#7fe8ff'] };
  };

  content.parts['SC_australiaeast'] = function (C) {
    const { ell, harbourBridge, lit, operaHouse, palm, silFill, skyline, sydneyTower, txt } = C;

    return {
          sc_au_opera: [200, 130, function (g, w, h, P) { operaHouse(g, 18, h, 1.15, P); }],
          sc_au_bridge: [300, 170, function (g, w, h, P) { harbourBridge(g, 0, 300, h, P); }],
          sc_au_tower: [60, 210, function (g, w, h, P) { sydneyTower(g, 30, h, 1.45, P); }],
          sc_au_luna: [130, 120, function (g, w, h, P) {
            [12, 118].forEach(function (x) { g.fillStyle = silFill(g, h - 100, h, '#ffd23f', '#e8508a'); g.fillRect(x - 7, h - 100, 14, 100); lit(g, x - 2, h - 106, 4, 6, '#ff2a4a'); });
            ell(g, 65, h - 62, 42, 46, '#ffd8b0'); ell(g, 65, h - 62, 38, 42, '#ffe9c8');
            ell(g, 50, h - 74, 7, 8, '#ffffff'); ell(g, 80, h - 74, 7, 8, '#ffffff'); ell(g, 50, h - 72, 3.4, 4, '#2a6aff'); ell(g, 80, h - 72, 3.4, 4, '#2a6aff');
            g.fillStyle = '#c8102e'; g.beginPath(); g.ellipse(65, h - 36, 26, 22, 0, 0, Math.PI); g.fill(); g.fillStyle = '#1a0a2a'; g.fillRect(40, h - 36, 50, 36);
            for (let x = 44; x < 88; x += 8) { g.fillStyle = '#ffffff'; g.fillRect(x, h - 36, 6, 6); }
            txt(g, 'LUNA PARK', 38, h - 116, 1, '#ffe14a', '#c8102e');
          }],
          sc_au_palms: [150, 130, function (g, w, h, P) { palm(g, 20, h, 100); palm(g, 70, h, 120); palm(g, 120, h, 90); }],
          sc_au_city: [160, 170, function (g, w, h, P) { skyline(w, h, 401, '#2a2a80', P.accent, 60, 160, 0.3, P.win)(g); }]
        };
  };

  content.parts['SC_EXTRA_australiaeast'] = function (C) {
    const { lit, palm, poly, silFill, txt } = C;

    return {
          sc_au_bondi: [230, 100, function (g, w, h, P) {
            g.fillStyle = silFill(g, h - 60, h, '#f0e8ff', '#8a7ac8'); g.fillRect(130, h - 56, 96, 56);
            for (let y = h - 50; y < h - 10; y += 12) for (let x = 136; x < 222; x += 10) lit(g, x, y, 6, 7, P.win[(x + y) % 3]);
            g.fillStyle = '#2a8aff'; g.fillRect(130, h - 66, 96, 10); txt(g, 'ICEBERGS', 150, h - 64, 1, '#ffffff');
            g.fillStyle = '#c8c0e0'; g.fillRect(0, h - 18, 130, 18); g.fillStyle = '#27c8ff'; g.fillRect(6, h - 16, 118, 12);
            g.fillStyle = 'rgba(255,255,255,0.7)'; for (let x = 10; x < 120; x += 22) g.fillRect(x, h - 14, 1, 10);
            g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.moveTo(0, h - 18); for (let x = 0; x <= 130; x += 10) g.quadraticCurveTo(x + 5, h - 30 - (x % 20 ? 4 : 0), x + 10, h - 18); g.lineTo(0, h - 18); g.fill();
            palm(g, 120, h - 18, 60);
            txt(g, 'BONDI', 34, h - 46, 2, '#ffe14a', '#c8102e');
          }],
          sc_au_wharf: [220, 90, function (g, w, h, P) {
            for (let k = 0; k < 5; k++) { const x = 6 + k * 43; g.fillStyle = '#2a8a5a'; g.fillRect(x, h - 40, 38, 40); poly(g, [[x - 2, h - 40], [x + 19, h - 54], [x + 40, h - 40]], '#ffd23f'); txt(g, String(k + 2), x + 16, h - 34, 1, '#ffffff'); lit(g, x + 6, h - 22, 26, 8, P.win[k % 3]); }
            g.fillStyle = '#1a0a2a'; g.fillRect(0, h - 4, w, 4);
            txt(g, 'CIRCULAR QUAY', 60, h - 70, 1, '#ffe14a', '#1a0a3a');
          }]
        };
  };

  content.parts['panoramaLandmarks_australiaeast'] = function (C) {

    return ['sc_au_opera', 'sc_au_bridge', 'sc_au_tower'];
  };

  content.parts['sceneryRoutes_australiaeast'] = function (C) {

    return [[0, 'sc_au_beach', 270], [0.23, 'sc_au_outback', 270], [0.42, 'sc_au_uluru', 260], [0.62, 'sc_au_outback', 270], [0.81, 'sc_au_beach', 270]];
  };
})();
