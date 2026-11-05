/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['amsterdam'] = AH.Worlds['amsterdam'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { panoramaLandmarks: 0, sceneryRoutes: 0 };
  AH.ArtModules.regions['westeurope'] = content;

  AH.ArtModules.stages['worlds.amsterdam.scenery.10'] = function (C) {
    const { ell, lit, poly, rim, silFill } = C;

    Object.assign(C, { windmill, canalHouses, westerkerk });
    function windmill(g, cx, base, s, P) {
        const body = silFill(g, base - 78 * s, base, P.top, P.bot);
        poly(g, [[cx - 15 * s, base], [cx - 9 * s, base - 62 * s], [cx + 9 * s, base - 62 * s], [cx + 15 * s, base]], body);
        poly(g, [[cx - 12 * s, base - 62 * s], [cx, base - 78 * s], [cx + 12 * s, base - 62 * s]], P.top);
        g.fillStyle = P.accent; g.fillRect(cx - 11 * s, base - 62 * s, 22 * s, 1.2);
        rim(g, cx - 14 * s, base - 62 * s, 62 * s, 'rgba(255,255,255,0.3)');
        lit(g, cx - 2 * s, base - 20 * s, 4 * s, 7 * s, P.win[0]);
        lit(g, cx - 2 * s, base - 40 * s, 4 * s, 6 * s, P.win[1]);
        const hy = base - 56 * s;
        for (let k = 0; k < 4; k++) {
          g.save(); g.translate(cx, hy); g.rotate(0.35 + k * Math.PI / 2);
          g.strokeStyle = P.top; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(48 * s, 0); g.stroke();
          g.fillStyle = 'rgba(20,8,70,0.55)'; g.fillRect(9 * s, 0.5, 38 * s, 10 * s);
          g.strokeStyle = P.accent; g.lineWidth = 0.6; g.strokeRect(9 * s, 0.5, 38 * s, 10 * s);
          for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(9 * s + i * 6.3 * s, 0.5); g.lineTo(9 * s + i * 6.3 * s, 10.5 * s); g.stroke(); }
          g.restore();
        }
        ell(g, cx, hy, 3 * s, 3 * s, P.accent);
      }

    function canalHouses(g, x0, x1, base, r, P, hmin, hmax, dark) {
        let x = x0;
        const hues = dark ? ['#1a0c4a', '#220f5a', '#2a1468'] : ['#34187a', '#4a1f86', '#5a2a96', '#3c1c80'];
        while (x < x1) {
          const w = 19 + Math.floor(r() * 9), h = hmin + Math.floor(r() * (hmax - hmin)), top = base - h;
          const col = hues[Math.floor(r() * hues.length)], gt = Math.floor(r() * 4);
          g.fillStyle = silFill(g, top, base, col, P.bot); g.fillRect(x, top, w, h);
          g.fillStyle = 'rgba(0,0,12,0.28)'; g.fillRect(x + w * 0.74, top, w * 0.26, h);
          if (gt === 0) { // stepped gable
            for (let k = 0; k < 4; k++) { const sw = w - k * (w * 0.22); g.fillStyle = col; g.fillRect(x + (w - sw) / 2, top - (k + 1) * 3, sw, 3.2); g.fillStyle = P.accent; g.fillRect(x + (w - sw) / 2, top - (k + 1) * 3, sw, 0.6); }
          } else if (gt === 1) { // bell gable
            g.fillStyle = col; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(x + w * 0.1, top - 8, x + w * 0.3, top - 9); g.quadraticCurveTo(x + w * 0.5, top - 15, x + w * 0.7, top - 9); g.quadraticCurveTo(x + w * 0.9, top - 8, x + w, top); g.fill();
            g.strokeStyle = P.accent; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(x + w * 0.1, top - 8, x + w * 0.3, top - 9); g.quadraticCurveTo(x + w * 0.5, top - 15, x + w * 0.7, top - 9); g.quadraticCurveTo(x + w * 0.9, top - 8, x + w, top); g.stroke();
          } else if (gt === 2) { // spout gable
            poly(g, [[x + 1, top], [x + w / 2, top - 11], [x + w - 1, top]], col);
            g.fillStyle = P.accent; g.fillRect(x + w / 2 - 0.5, top - 13, 1, 4);
          } else { // neck gable with hoist beam
            g.fillStyle = col; g.fillRect(x + 3, top - 7, w - 6, 7); poly(g, [[x + 3, top - 7], [x + w / 2, top - 12], [x + w - 3, top - 7]], col);
            g.fillStyle = P.accent; g.fillRect(x + w / 2 - 0.5, top - 15, 2.5, 0.9); g.fillRect(x + w / 2 - 0.5, top - 15, 0.9, 4);
          }
          g.fillStyle = P.accent; g.fillRect(x, top, w, 0.9);
          rim(g, x, top, h, 'rgba(255,255,255,0.22)');
          for (let wy = top + 6; wy < base - 8; wy += 11) {
            for (let wx = x + 3; wx < x + w - 5; wx += 8) {
              if (r() < 0.62) lit(g, wx, wy, 3.6, 6, P.win[Math.floor(r() * P.win.length)]);
              else { g.fillStyle = 'rgba(8,4,40,0.6)'; g.fillRect(wx, wy, 3.6, 6); }
            }
          }
          x += w + 0.8;
        }
      }

    function westerkerk(g, cx, base, s, P) {
        const f = silFill(g, base - 150 * s, base, P.top, P.bot);
        g.fillStyle = f; g.fillRect(cx - 11 * s, base - 80 * s, 22 * s, 80 * s);
        g.fillRect(cx - 8 * s, base - 108 * s, 16 * s, 28 * s);
        g.fillRect(cx - 6 * s, base - 124 * s, 12 * s, 16 * s);
        [80, 108, 124].forEach(function (yv, i) { g.fillStyle = P.accent; g.fillRect(cx - (11 - i * 2.5) * s, base - yv * s, (22 - i * 5) * s, 1); });
        lit(g, cx - 3 * s, base - 70 * s, 6 * s, 10 * s, P.win[0]);
        ell(g, cx, base - 98 * s, 4.6 * s, 4.6 * s, '#ffe9a0'); ell(g, cx, base - 98 * s, 3.4 * s, 3.4 * s, '#2a1470'); g.fillStyle = '#ffe9a0'; g.fillRect(cx - 0.4, base - 101 * s, 0.8, 3.4 * s); g.fillRect(cx, base - 98 * s, 2.4 * s, 0.8);
        lit(g, cx - 2 * s, base - 120 * s, 4 * s, 8 * s, P.win[1]);
        // imperial crown and spire
        g.fillStyle = P.top; g.beginPath(); g.moveTo(cx - 8 * s, base - 124 * s); g.quadraticCurveTo(cx - 8 * s, base - 140 * s, cx, base - 142 * s); g.quadraticCurveTo(cx + 8 * s, base - 140 * s, cx + 8 * s, base - 124 * s); g.fill();
        g.strokeStyle = '#ffd23f'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx - 8 * s, base - 128 * s); g.quadraticCurveTo(cx, base - 146 * s, cx + 8 * s, base - 128 * s); g.stroke();
        g.fillStyle = P.top; g.fillRect(cx - 0.6, base - 162 * s, 1.2, 22 * s);
        lit(g, cx - 1.2, base - 164 * s, 2.4, 2.4, '#ffd23f');
      }
  };

  AH.ArtModules.stages['worlds.amsterdam.scenery.21'] = function (C) {
    const { FLAT, canalHouses, lg, reg2, rng } = C;

    reg2('bg_near_westeurope', 640, 190, function (g, w, h) {
        const P = { top: '#170a48', bot: '#2a1068', accent: '#ff7a59', win: ['#ffd070', '#ff8a5a'] };
        canalHouses(g, 0, 640, h - 4, rng(81), P, 40, 86, true);
        g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, 'rgba(255,120,200,0)'], [1, 'rgba(255,120,200,0.35)']]); g.fillRect(0, h - 26, w, 26);
      }, FLAT);
  };

  AH.ArtModules.stages['worlds.amsterdam.scenery.83'] = function (C) {
    const { ell, lit, poly, rng, rrect, silFill } = C;

    Object.assign(C, { gracht, grachtRow, bikeSil, plane });
    const GRACHT_COLS = ['#8a3a5a', '#5a2a6a', '#3a4a7a', '#6a3a4a', '#cfc0ec', '#2a4a5a', '#7a4a3a', '#4a2a4a'];

    function gracht(g, x, base, w, h, type, col, P, r) {
        const top = base - h, trim = '#f4ecff';
        g.fillStyle = silFill(g, top, base, col, P.bot); g.fillRect(x, top, w, h);
        g.fillStyle = 'rgba(0,0,12,0.22)'; g.fillRect(x + w - 3, top, 3, h);
        const gw = type === 'cornice' ? w : w * 0.7, gx = x + (w - gw) / 2;
        if (type === 'step') {
          for (let k = 0; k < 5; k++) { const sw = w - k * w * 0.18, sx = x + (w - sw) / 2, sy = top - (k + 1) * 4; g.fillStyle = col; g.fillRect(sx, sy, sw, 4.2); g.fillStyle = trim; g.fillRect(sx, sy, 1.4, 1); g.fillRect(sx + sw - 1.4, sy, 1.4, 1); }
          g.fillStyle = trim; g.fillRect(x + w / 2 - 0.6, top - 24, 1.2, 4);
        } else if (type === 'bell') {
          g.fillStyle = col; g.beginPath(); g.moveTo(x, top); g.bezierCurveTo(x + 1, top - 10, gx, top - 8, gx + 1, top - 14); g.bezierCurveTo(gx + gw * 0.3, top - 24, gx + gw * 0.7, top - 24, gx + gw - 1, top - 14); g.bezierCurveTo(x + w - gx + x, top - 8, x + w - 1, top - 10, x + w, top); g.closePath(); g.fill();
          g.strokeStyle = trim; g.lineWidth = 1; g.stroke();
          ell(g, x + w / 2, top - 12, 2.2, 2.2, P.win[0]);
        } else if (type === 'neck') {
          g.fillStyle = col; g.fillRect(gx, top - 14, gw, 14); poly(g, [[gx - 1, top - 14], [x + w / 2, top - 20], [gx + gw + 1, top - 14]], col);
          g.strokeStyle = trim; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(gx - 3, top - 2, gx, top - 10); g.moveTo(x + w, top); g.quadraticCurveTo(gx + gw + 3, top - 2, gx + gw, top - 10); g.stroke();
          poly(g, [[gx - 1, top - 14], [x + w / 2, top - 20], [gx + gw + 1, top - 14]], 'rgba(0,0,0,0)'); g.fillStyle = trim; g.fillRect(gx - 1, top - 14.6, gw + 2, 1);
        } else if (type === 'spout') {
          poly(g, [[x, top], [x + w / 2, top - 16], [x + w, top]], col);
          g.strokeStyle = trim; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x, top); g.lineTo(x + w / 2, top - 16); g.lineTo(x + w, top); g.stroke();
          g.fillStyle = '#2a1a3a'; g.fillRect(x + w / 2 - 2, top - 8, 4, 6);
        } else if (type === 'cornice') {
          g.fillStyle = trim; g.fillRect(x - 1, top - 3, w + 2, 3);
          g.fillStyle = col; g.fillRect(x + w * 0.3, top - 9, w * 0.4, 6);
          g.fillStyle = trim; g.beginPath(); g.ellipse(x + w / 2, top - 9, w * 0.2, 4, 0, Math.PI, 0); g.fill();
          for (let k = 2; k < w - 2; k += 4) { g.fillStyle = 'rgba(30,10,50,0.5)'; g.fillRect(x + k, top - 2, 1, 2); }
        } else { // clock gable
          g.fillStyle = col; g.fillRect(gx + 2, top - 18, gw - 4, 18); g.beginPath(); g.ellipse(x + w / 2, top - 18, gw / 2 - 2, 6, 0, Math.PI, 0); g.fill();
          g.strokeStyle = trim; g.lineWidth = 0.9; g.beginPath(); g.arc(gx, top - 4, 4, -Math.PI / 2, 0); g.moveTo(gx + gw, top - 8); g.arc(gx + gw, top - 4, 4, Math.PI, -Math.PI / 2); g.stroke();
          ell(g, x + w / 2, top - 14, 2.6, 2.6, trim);
        }
        if (type !== 'cornice') { g.fillStyle = '#e8e0f8'; g.fillRect(x + w / 2 - 0.5, top - 4, 1, 3); g.fillRect(x + w / 2 - 0.5, top - 4, 4, 1); }
        const cols = w > 28 ? 3 : 2, cw = (w - 6) / cols;
        for (let wy = top + 5, row = 0; wy < base - 16; wy += 14, row++) {
          for (let c = 0; c < cols; c++) {
            const wx = x + 3 + c * cw + cw / 2 - 2.6;
            g.fillStyle = trim; g.fillRect(wx - 0.8, wy - 0.8, 6.8, 10.6);
            if (r() < 0.7) lit(g, wx, wy, 5.2, 9, P.win[Math.floor(r() * P.win.length)]); else { g.fillStyle = '#140a30'; g.fillRect(wx, wy, 5.2, 9); }
            g.fillStyle = trim; g.fillRect(wx, wy + 4, 5.2, 0.7); g.fillRect(wx + 2.3, wy, 0.7, 9);
          }
        }
        const dx = x + w / 2 - 3;
        g.fillStyle = ['#1a6a4a', '#2a2a6a', '#7a1a2a', '#1a1a2a'][Math.floor(r() * 4)]; g.fillRect(dx, base - 12, 6, 12);
        g.fillStyle = trim; g.fillRect(dx - 1, base - 13, 8, 1); lit(g, dx + 1, base - 12, 4, 2, '#ffe9a0');
        g.fillStyle = '#4a3a5a'; g.fillRect(dx - 3, base - 2, 12, 2); g.fillRect(dx - 2, base - 4, 10, 2);
        if (r() < 0.5) { g.fillStyle = '#3a8a3a'; g.fillRect(x + 3, base - 18, 6, 2); ell(g, x + 4, base - 19, 1, 1, '#ff5a8a'); ell(g, x + 7, base - 19, 1, 1, '#ffe14a'); }
      }

    const GTYPES = ['step', 'bell', 'neck', 'spout', 'cornice', 'clock'];

    function grachtRow(g, x0, x1, base, seed, P, hmin, hmax) {
        const r = rng(seed); let x = x0, last = -1;
        while (x < x1 - 18) {
          const w = Math.min(x1 - x, 22 + Math.floor(r() * 12)), h = hmin + Math.floor(r() * (hmax - hmin));
          let t; do { t = Math.floor(r() * GTYPES.length); } while (t === last); last = t;
          gracht(g, x, base, w, h, GTYPES[t], GRACHT_COLS[Math.floor(r() * GRACHT_COLS.length)], P, r);
          x += w + 0.6;
        }
      }

    function bikeSil(g, x, base, col) {
        g.strokeStyle = col; g.lineWidth = 0.9;
        g.beginPath(); g.arc(x, base - 3, 3, 0, Math.PI * 2); g.moveTo(x + 13, base - 3); g.arc(x + 10, base - 3, 3, 0, Math.PI * 2);
        g.moveTo(x, base - 3); g.lineTo(x + 4, base - 8); g.lineTo(x + 9, base - 8); g.lineTo(x + 10, base - 3); g.moveTo(x + 4, base - 8); g.lineTo(x + 5, base - 3); g.lineTo(x + 9, base - 8); g.moveTo(x + 9, base - 8); g.lineTo(x + 8.5, base - 10); g.stroke();
      }

    function plane(g, x, y, s, ang) {
        g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(s, s);
        rrect(g, -40, -5, 80, 10, 5, '#f4f4ff'); g.fillStyle = '#2a8aff'; g.fillRect(-36, 1, 72, 2.4);
        poly(g, [[-6, 0], [6, 0], [-10, 22], [-18, 22]], '#d8d8f0'); poly(g, [[-6, -2], [6, -2], [-14, -14], [-20, -14]], '#c8c8e8');
        poly(g, [[-30, -4], [-38, -4], [-44, -20], [-38, -20]], '#2a8aff'); poly(g, [[-34, 0], [-28, 0], [-42, 8], [-46, 8]], '#d8d8f0');
        for (let k = -26; k < 30; k += 5) lit(g, k, -2.6, 2, 2, '#7fe8ff');
        poly(g, [[34, -5], [42, -1], [40, 2], [32, 2]], '#14143a');
        ell(g, -2, 12, 5, 2.4, '#b8b8d8');
        g.restore();
      }

    Object.assign(C, { GRACHT_COLS, GTYPES });
  };

  AH.ArtModules.stages['worlds.amsterdam.scenery.85'] = function (C) {
    const { line, lit, reg2, shade } = C;

    reg2('draw_leaf', 32, 10, function (g) {
        g.fillStyle = '#e8e0f8'; g.fillRect(0, 2, 32, 6); g.fillStyle = '#b8b0d8'; g.fillRect(0, 6, 32, 2);
        g.fillStyle = '#8a6a4a'; g.fillRect(0, 1, 32, 1.4); g.fillStyle = '#5a4a8a'; for (let x = 1; x < 32; x += 4) g.fillRect(x, 2.6, 0.7, 3.4);
        g.fillStyle = '#f4ecff'; g.fillRect(0, 0, 32, 0.8); for (let x = 2; x < 32; x += 8) g.fillRect(x, -0, 1, 2);
      }, { shade: 0.2, noOutline: true });

    reg2('draw_gantry', 44, 86, function (g) {
        const W = '#f4ecff';
        g.fillStyle = W; g.fillRect(4, 18, 4, 68); g.fillRect(36, 18, 4, 68); g.fillRect(0, 16, 44, 4);
        line(g, 6, 20, 38, 50, 1.1, W); line(g, 38, 20, 6, 50, 1.1, W);
        g.fillStyle = '#e8e0f8'; g.fillRect(2, 8, 40, 4); g.fillStyle = '#6a5a9a'; g.fillRect(2, 11, 40, 1);
        g.fillStyle = '#3a2a5a'; g.fillRect(30, 4, 12, 10);
        lit(g, 20, 0, 4, 4, '#ff2a4a');
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(36, 18, 4, 68);
      }, { shade: 0.25 });
  };

  AH.ArtModules.stages['worlds.amsterdam.scenery.87'] = function (C) {
    const { commuterTrain, reg2, shade } = C;

    reg2('amb_train_nltrain', 248, 46, (g) => commuterTrain(g, C.part('amsterdam', 'commuterTrain')), { shade: 0.25 });
  };

  AH.ArtModules.stages['worlds.amsterdam.scenery.121'] = function (C) {
    const { SC, ell, lg, line, lit, poly } = C;

    Object.assign(SC.westeurope, {
        sc_we_kinderdijk: [250, 190, function (g, w, h, P) {
          g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, '#477a62'], [1, '#173b43']]);
          g.fillRect(0, h - 26, w, 26);
          g.fillStyle = '#294c58'; g.fillRect(0, h - 17, w, 10);
          for (let i = 0; i < 3; i++) {
            const x = 43 + i * 82, top = h - (112 + (i === 1 ? 18 : 0));
            poly(g, [[x - 19, h - 20], [x - 12, top + 23], [x + 12, top + 23], [x + 20, h - 20]], lg(g, x - 16, top, x + 17, h, [[0, '#d7b87e'], [0.55, '#835264'], [1, '#34264d']]));
            poly(g, [[x - 13, top + 25], [x + 13, top + 25], [x + 10, top + 53], [x - 10, top + 53]], '#503650');
            for (let row = 0; row < 2; row++) for (let col = -1; col <= 1; col++) lit(g, x + col * 7 - 1.5, top + 31 + row * 10, 3, 5, P.win[(i + row + col + 3) % 3]);
            ell(g, x, top + 21, 21, 5, '#d8b676');
            for (let b = 0; b < 4; b++) {
              const a = b * Math.PI / 2 + 0.18;
              const bx = x + Math.cos(a) * 51, by = top + 21 + Math.sin(a) * 51;
              line(g, x, top + 21, bx, by, 4, '#211d43');
              line(g, x, top + 21, bx, by, 1.4, P.accent);
              ell(g, bx, by, 2.2, 2.2, '#fff0bd');
            }
            ell(g, x, top + 21, 5, 5, P.accent);
          }
          line(g, 0, h - 17, w, h - 17, 1, '#8ad4c4');
        }],
        sc_we_erasmus: [250, 165, function (g, w, h, P) {
          const deck = h - 30;
          g.fillStyle = lg(g, 0, deck, 0, h, [[0, '#355477'], [1, '#172b50']]); g.fillRect(0, deck, w, h - deck);
          // The Swan's long, sloping white pylon is the bridge's defining silhouette.
          line(g, 127, deck, 172, 14, 12, '#a9c7e9');
          line(g, 128, deck, 173, 14, 3, P.accent);
          line(g, 20, deck - 8, 235, deck - 8, 9, '#1b2451');
          line(g, 20, deck - 11, 235, deck - 11, 3, '#d7eaff');
          line(g, 128, deck - 12, 239, deck - 11, 2, '#c6d9ee');
          for (let x = 32; x <= 226; x += 16) {
            const t = (x - 128) / 111;
            const y = deck - 13 - Math.max(0, t) * 2;
            line(g, 128, 22, x, y, 1.1, '#89a9d2');
          }
          for (let x = 32; x < 230; x += 23) lit(g, x, deck - 7, 3, 2, P.win[(x / 23 | 0) % 3]);
          line(g, 10, h - 5, 240, h - 5, 2, '#6d7da8');
          ell(g, 40, deck + 14, 20, 3, '#78bed2'); ell(g, 205, deck + 14, 25, 3, '#78bed2');
        }],
        sc_we_cubes: [210, 170, function (g, w, h, P) {
          g.fillStyle = lg(g, 0, h - 25, 0, h, [[0, '#563c76'], [1, '#242344']]); g.fillRect(0, h - 25, w, 25);
          const cubes = [[58, h - 68, 0], [112, h - 82, 1], [163, h - 60, 2]];
          cubes.forEach(function (c, i) {
            const x = c[0], y = c[1], shift = c[2] * 2;
            line(g, x - 5, h - 22, x - 5, y + 24, 5, '#332746');
            line(g, x + 5, h - 22, x + 5, y + 24, 5, '#332746');
            poly(g, [[x, y], [x + 24, y - 22], [x + 48, y], [x + 24, y + 23]], '#ffd178');
            poly(g, [[x, y], [x + 24, y + 23], [x + 24, y + 57], [x, y + 34]], lg(g, x, y, x + 25, y + 57, [[0, '#e99d73'], [1, '#914a79']]));
            poly(g, [[x + 24, y + 23], [x + 48, y], [x + 48, y + 34], [x + 24, y + 57]], lg(g, x + 24, y, x + 48, y + 58, [[0, '#8f78bd'], [1, '#39406c']]));
            line(g, x + 1, y + 2, x + 23, y + 22, 1.5, P.accent);
            lit(g, x + 7, y + 22 + shift, 4, 7, P.win[i % 3]); lit(g, x + 31, y + 23, 4, 7, P.win[(i + 1) % 3]);
          });
        }],
        sc_we_euromast: [120, 225, function (g, w, h, P) {
          const cx = 59;
          g.fillStyle = '#382e5e'; g.fillRect(17, h - 20, 88, 8);
          poly(g, [[cx - 9, h - 19], [cx - 5, 68], [cx + 5, 68], [cx + 10, h - 19]], lg(g, cx - 8, 68, cx + 9, h, [[0, '#d5d9ee'], [0.48, '#806eaa'], [1, '#40305f']]));
          line(g, cx - 3, 68, cx - 3, h - 20, 1.7, P.accent);
          g.fillStyle = '#29244f'; g.fillRect(cx - 29, 66, 58, 8);
          ell(g, cx, 57, 30, 14, '#a6c4df'); ell(g, cx, 55, 24, 11, '#534d88');
          line(g, cx - 23, 62, cx - 23, 69, 2, '#ecdbb1'); line(g, cx + 23, 62, cx + 23, 69, 2, '#ecdbb1');
          for (let x = cx - 19; x <= cx + 19; x += 8) lit(g, x, 53, 4, 4, P.win[(x / 8 | 0) % 3]);
          ell(g, cx, 77, 12, 4, '#e2c6a0');
          line(g, cx, 41, cx, 4, 2, P.accent); ell(g, cx, 4, 2, 2, '#fff0bd');
          line(g, 16, h - 11, 104, h - 11, 2, P.accent);
        }],
        sc_we_domtower: [130, 245, function (g, w, h, P) {
          const x = 64;
          const fill = lg(g, x - 28, h - 205, x + 30, h, [[0, '#b9a2c9'], [0.48, '#74588d'], [1, '#342b5c']]);
          g.fillStyle = fill; g.fillRect(x - 25, h - 174, 50, 174);
          for (let y = h - 172; y < h - 16; y += 30) { line(g, x - 24, y, x + 24, y, 2, P.accent); }
          g.fillStyle = '#30254d'; g.fillRect(x - 31, h - 205, 62, 33);
          for (let j = 0; j < 4; j++) {
            const wx = x - 21 + j * 14;
            g.fillRect(wx, h - 200, 6, 24); poly(g, [[wx - 1, h - 200], [wx + 3, h - 207], [wx + 7, h - 200]], '#d7bdd7');
          }
          g.fillStyle = '#59456f'; g.fillRect(x - 21, h - 231, 42, 26);
          ell(g, x, h - 231, 27, 8, '#d1b3c9');
          poly(g, [[x - 21, h - 229], [x, h - 245], [x + 21, h - 229]], '#c6a6c7');
          for (let i = -1; i <= 1; i++) { ell(g, x + i * 14, h - 188, 4, 5, '#201c49'); lit(g, x + i * 14 - 1, h - 190, 2, 3, P.win[(i + 4) % 3]); }
          g.fillStyle = '#392a58'; g.fillRect(x - 31, h - 7, 62, 7);
          line(g, x - 30, h - 8, x + 30, h - 8, 2, P.accent);
        }],
        sc_we_peacepalace: [230, 160, function (g, w, h, P) {
          const base = h - 14;
          g.fillStyle = lg(g, 0, base - 87, 0, h, [[0, '#d2b6aa'], [0.55, '#765375'], [1, '#302747']]);
          g.fillRect(18, base - 75, 194, 75);
          g.fillRect(7, base - 54, 216, 54);
          poly(g, [[11, base - 75], [57, base - 108], [104, base - 75]], '#8a687b');
          poly(g, [[126, base - 75], [174, base - 108], [220, base - 75]], '#8a687b');
          g.fillStyle = '#52415f'; g.fillRect(97, base - 97, 36, 97);
          poly(g, [[94, base - 97], [115, base - 125], [136, base - 97]], '#ddbd88');
          g.fillStyle = '#4d4268'; g.fillRect(108, base - 119, 14, 22);
          for (let x = 26; x < 208; x += 13) {
            g.fillRect(x, base - 60, 5, 29); lit(g, x + 1, base - 54, 3, 8, P.win[(x / 13 | 0) % 3]);
            g.fillRect(x, base - 90, 4, 14);
          }
          g.fillStyle = '#b2939b'; g.fillRect(4, base - 11, 222, 11);
          line(g, 5, base - 12, 225, base - 12, 2, P.accent);
          ell(g, 12, base - 15, 9, 5, '#387454'); ell(g, 216, base - 15, 9, 5, '#387454');
        }]
      });
  };

  AH.ArtModules.stages['worlds.amsterdam.scenery.127'] = function (C) {
    const { SC, canalBoat, ell, line, lit, poly, rrect, txt } = C;

    Object.assign(SC.westeurope, {
        sc_nl_transit: [280, 150, function (g, w, h) {
          g.fillStyle = '#af7558'; g.fillRect(22, 38, 236, 97);
          for (let y = 42; y < 130; y += 6) for (let x = 25 + y % 12; x < 255; x += 16) line(g, x, y, x + 12, y, 0.6, '#d7ab84');
          poly(g, [[15, 40], [62, 18], [113, 40]], '#624952'); poly(g, [[166, 40], [216, 18], [265, 40]], '#624952');
          g.fillStyle = '#d7c3a0'; g.fillRect(120, 11, 40, 124);
          poly(g, [[114, 13], [140, 0], [166, 13]], '#375968');
          ell(g, 140, 32, 13, 13, '#efe2b7'); ell(g, 140, 32, 10, 10, '#334f5c');
          line(g, 140, 32, 140, 24, 1, '#fff0bd'); line(g, 140, 32, 147, 35, 1, '#fff0bd');
          for (let x = 33; x < 252; x += 28) {
            rrect(g, x, 55, 17, 35, 7, '#324f62'); lit(g, x + 2, 60, 13, 25, '#dfd3a6'); line(g, x + 8.5, 58, x + 8.5, 88, 1, '#685655');
          }
          rrect(g, 63, 94, 155, 16, 2, '#1d5386'); txt(g, 'STATION SLOTERDIJK', 75, 99, 1, '#f5efcc');
          g.fillStyle = '#555c61'; g.fillRect(0, 136, w, 14); line(g, 0, 137, w, 137, 1.5, '#d8d0b4');
          [18, 262].forEach((x) => { line(g, x, 99, x, 136, 1.5, '#314556'); rrect(g, x - 8, 95, 16, 12, 1, '#1965a4'); txt(g, 'TRAM', x - 6, 99, 0.5, '#ffffff'); });
        }],
        sc_nl_canalcruise: [260, 115, function (g, w, h) {
          g.fillStyle = '#497588'; g.fillRect(0, 54, w, 61);
          for (let x = 0; x < w; x += 43) {
            g.fillStyle = ['#875449', '#b2886e', '#665260'][x / 43 % 3 | 0]; g.fillRect(x + 2, 14, 37, 45);
            poly(g, [[x, 14], [x + 20, 0], [x + 41, 14]], '#545365');
            for (let y = 22; y < 54; y += 14) { lit(g, x + 9, y, 7, 9, '#dbc496'); lit(g, x + 25, y, 7, 9, '#b7ccd2'); }
          }
          g.fillStyle = '#b7b7a5'; g.fillRect(0, 57, w, 3);
          for (let x = 8; x < w; x += 20) line(g, x, 63 + x % 9, x + 15, 63 + x % 9, 0.7, '#a3c8d0');
          g.save(); g.translate(45, 65); canalBoat(g); g.restore();
          txt(g, 'RONDVAART', 100, 49, 0.7, '#f9edd4');
        }]
      });
  };

  content.parts['panorama'] = function (C) {
    const { PAL } = C;
    const canalHouses = (...args) => C.canalHouses(...args);
    const rng = (...args) => C.rng(...args);
    const skyline = (...args) => C.skyline(...args);
    const westerkerk = (...args) => C.westerkerk(...args);
    const windmill = (...args) => C.windmill(...args);

    return function (g, w, h) {
    const P = PAL['westeurope'];
    const base = h - 6;
    
            skyline(w, h, 61, '#2a1070', P.accent, 26, 60, 0.2, P.win)(g);
            canalHouses(g, 0, 640, base, rng(71), P, 58, 98, false);
            windmill(g, 80, base - 28, 1.0, P); windmill(g, 520, base - 20, 0.8, P);
            westerkerk(g, 300, base - 50, 0.85, P);
          
    };
  };

  content.parts['plainPanorama'] = function (C) {
    const { PAL } = C;
    const canalHouses = (...args) => C.canalHouses(...args);
    const rng = (...args) => C.rng(...args);
    const skyline = (...args) => C.skyline(...args);

    return function (g, w, h) {
    const P = PAL['westeurope'];
    const base = h - 6;
     skyline(w, h, 161, '#2a1070', P.accent, 22, 50, 0.2, P.win)(g); canalHouses(g, 0, 640, base, rng(171), P, 40, 70, false); 
    };
  };

  content.parts['MP_westeurope'] = function (C) {

    return { top: '#4a2a9a', bot: '#7a3aa8', accent: '#ffb07a', win: ['#ffd070', '#ff9a6a', '#ffe9a0'] };
  };

  content.parts['SC_westeurope'] = function (C) {
    const { canalHouses, lamp, lg, line, lit, poly, rng, silFill, tree, txt, westerkerk, windmill } = C;

    return {
          sc_we_row1: [170, 140, function (g, w, h, P) { canalHouses(g, 0, w, h, rng(301), P, 80, 125, false); for (let x = 20; x < w; x += 45) tree(g, x, h, 46, '#3a7a4a'); }],
          sc_we_row2: [140, 150, function (g, w, h, P) { canalHouses(g, 0, w, h, rng(302), P, 90, 135, false); lamp(g, 30, h, 34, '#ffd070'); lamp(g, 110, h, 34, '#ffd070'); }],
          sc_we_row3: [200, 130, function (g, w, h, P) { canalHouses(g, 0, w, h, rng(303), P, 70, 110, false); for (let x = 35; x < w; x += 60) tree(g, x, h, 40, '#4a8a3a'); }],
          sc_we_rijks: [210, 150, function (g, w, h, P) {
            const f = silFill(g, h - 120, h, '#a8483a', '#5a1a3a');
            g.fillStyle = f; g.fillRect(10, h - 80, 190, 80); g.fillRect(60, h - 110, 24, 110); g.fillRect(126, h - 110, 24, 110);
            poly(g, [[56, h - 110], [72, h - 140], [88, h - 110]], '#3a5a6a'); poly(g, [[122, h - 110], [138, h - 140], [154, h - 110]], '#3a5a6a');
            poly(g, [[6, h - 80], [105, h - 100], [204, h - 80]], '#3a4a6a');
            for (let x = 18; x < 196; x += 11) { lit(g, x, h - 70, 5, 10, P.win[(x / 11 | 0) % 3]); lit(g, x, h - 45, 5, 10, P.win[(x / 11 + 1 | 0) % 3]); }
            g.fillStyle = '#1a0a2a'; g.beginPath(); g.ellipse(105, h - 10, 12, 18, 0, Math.PI, 0); g.fill(); g.fillRect(93, h - 10, 24, 10);
            txt(g, 'I AMSTERDAM', 60, h - 8, 1, '#ff2a4a', '#ffffff');
          }],
          sc_we_mill: [130, 150, function (g, w, h, P) { g.fillStyle = lg(g, 0, h - 20, 0, h, [[0, '#3a7a3a'], [1, '#1a3a2a']]); g.beginPath(); g.ellipse(65, h, 70, 20, 0, Math.PI, 0); g.fill(); windmill(g, 65, h - 16, 1.4, P); }],
          sc_we_kerk: [150, 210, function (g, w, h, P) { westerkerk(g, 75, h, 1.2, P); canalHouses(g, 0, 50, h, rng(305), P, 60, 90, false); canalHouses(g, 100, 150, h, rng(306), P, 60, 90, false); }],
          sc_we_magere: [220, 90, function (g, w, h, P) {
            g.fillStyle = '#f0e8ff'; g.fillRect(0, h - 40, 220, 4);
            [60, 160].forEach(function (x) { g.fillRect(x - 3, h - 80, 6, 80); g.fillRect(x - 14, h - 80, 28, 3); line(g, x - 12, h - 78, x - 40, h - 40, 1, '#f0e8ff'); line(g, x + 12, h - 78, x + 40, h - 40, 1, '#f0e8ff'); });
            g.strokeStyle = '#f0e8ff'; g.lineWidth = 1.4; [40, 110, 180].forEach(function (x) { g.beginPath(); g.ellipse(x, h, 32, 34, 0, Math.PI, 0); g.stroke(); });
            for (let x = 4; x < 220; x += 6) lit(g, x, h - 42, 1.4, 1.4, '#ffe9a0');
          }]
        };
  };

  content.parts['SC_EXTRA_westeurope'] = function (C) {
    const { bikeSil, ell, glowRect, grachtRow, lamp, lg, line, lit, msLogo, plane, poly, rng, silFill, tree, txt } = C;

    return {
          sc_we_row1: [170, 150, function (g, w, h, P) { grachtRow(g, 0, w, h, 301, P, 80, 120); for (let x = 22; x < w; x += 52) tree(g, x, h, 48, '#3a7a4a'); bikeSil(g, 40, h, '#14082a'); bikeSil(g, 120, h, '#14082a'); }],
          sc_we_row2: [150, 160, function (g, w, h, P) { grachtRow(g, 0, w, h, 302, P, 90, 132); lamp(g, 30, h, 34, '#ffd070'); lamp(g, 115, h, 34, '#ffd070'); }],
          sc_we_row3: [200, 140, function (g, w, h, P) { grachtRow(g, 0, w, h, 303, P, 74, 112); for (let x = 36; x < w; x += 64) tree(g, x, h, 42, '#4a8a3a'); }],
          sc_we_row4: [180, 150, function (g, w, h, P) { grachtRow(g, 0, w, h, 304, P, 84, 128); for (let x = 8; x < w - 14; x += 26) bikeSil(g, x, h, '#1a0a3a'); }],
          sc_we_row5: [130, 160, function (g, w, h, P) { grachtRow(g, 0, w, h, 305, P, 96, 140); lamp(g, 64, h, 36, '#ffd070'); }],
          sc_we_centraal: [290, 175, function (g, w, h, P) {
            g.fillStyle = 'rgba(200,210,255,0.35)'; g.beginPath(); g.ellipse(150, h - 50, 150, 40, 0, Math.PI, 0); g.fill();
            g.strokeStyle = 'rgba(40,30,80,0.6)'; g.lineWidth = 0.8; for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(10 + k * 20, h - 50); g.lineTo(10 + k * 20, h - 50 - Math.sqrt(Math.max(0, 1 - Math.pow((k * 20 - 140) / 150, 2))) * 40); g.stroke(); }
            const brick = silFill(g, h - 160, h, '#a8483a', '#5a1a3a');
            g.fillStyle = brick; g.fillRect(6, h - 64, 278, 64);
            for (let k = 0; k < 4; k++) { const bx = 6 + k * 70 + (k > 1 ? 10 : 0); poly(g, [[bx, h - 64], [bx + 25, h - 82], [bx + 50, h - 64]], brick); g.fillStyle = '#f0e0d0'; g.fillRect(bx, h - 65, 50, 1.2); }
            g.fillStyle = brick; g.fillRect(118, h - 96, 54, 96); poly(g, [[114, h - 96], [145, h - 118], [176, h - 96]], brick);
            ell(g, 145, h - 106, 6, 6, '#ffd890'); ell(g, 145, h - 106, 4.6, 4.6, '#f4ecff');
            line(g, 145, h - 106, 145, h - 109, 0.7, '#14082a'); line(g, 145, h - 106, 147.4, h - 106, 0.7, '#14082a');
            [[60, 'clock'], [230, 'vane']].forEach(function (t) {
              const tx = t[0]; g.fillStyle = brick; g.fillRect(tx - 11, h - 124, 22, 124);
              poly(g, [[tx - 13, h - 124], [tx, h - 150], [tx + 13, h - 124]], '#3a5a6a'); g.fillStyle = '#ffd23f'; g.fillRect(tx - 0.6, h - 162, 1.2, 12);
              if (t[1] === 'clock') { ell(g, tx, h - 112, 7, 7, '#ffd23f'); ell(g, tx, h - 112, 5.6, 5.6, '#f4ecff'); line(g, tx, h - 112, tx, h - 116, 0.8, '#14082a'); line(g, tx, h - 112, tx + 3, h - 112, 0.8, '#14082a'); }
              else { poly(g, [[tx, h - 162], [tx + 7, h - 160], [tx, h - 158]], '#ffd23f'); lit(g, tx - 4, h - 116, 8, 10, P.win[1]); }
              for (let y = h - 96; y < h - 14; y += 16) { lit(g, tx - 6, y, 4, 9, P.win[0]); lit(g, tx + 2, y, 4, 9, P.win[2]); }
            });
            for (let x = 14; x < 280; x += 9) { if (x > 112 && x < 176) continue; if ((x > 46 && x < 76) || (x > 216 && x < 246)) continue; g.fillStyle = '#f0e0d0'; g.fillRect(x - 0.6, h - 52, 6.2, 13); lit(g, x, h - 51, 5, 11, P.win[(x / 9 | 0) % 3]); g.fillStyle = '#f0e0d0'; g.fillRect(x - 0.6, h - 28, 6.2, 11); lit(g, x, h - 27, 5, 9, P.win[(x / 9 + 1 | 0) % 3]); }
            g.fillStyle = '#f0e0d0'; g.fillRect(6, h - 34, 278, 1.2);
            g.fillStyle = '#1a0a2a'; [126, 140, 154].forEach(function (x) { g.beginPath(); g.ellipse(x + 5, h - 16, 5, 6, 0, Math.PI, 0); g.fill(); g.fillRect(x, h - 16, 10, 16); });
            txt(g, 'CENTRAAL', 121, h - 92, 1, '#ffe14a', '#3a0a1a');
          }],
          sc_we_schiphol: [300, 175, function (g, w, h, P) {
            g.fillStyle = '#2a2a5a'; g.fillRect(0, h - 4, w, 4);
            g.fillStyle = silFill(g, h - 90, h, '#c8d0f8', '#4a4aa8'); g.fillRect(150, h - 132, 12, 132);
            g.fillStyle = '#d8e0ff'; g.beginPath(); g.moveTo(140, h - 132); g.lineTo(172, h - 132); g.lineTo(168, h - 152); g.lineTo(144, h - 152); g.closePath(); g.fill();
            g.fillStyle = '#7fe8ff'; g.fillRect(143, h - 148, 26, 10); g.fillStyle = '#2a2a6a'; for (let k = 0; k < 6; k++) g.fillRect(145 + k * 4.4, h - 148, 0.8, 10);
            g.fillStyle = '#e8e8ff'; g.fillRect(146, h - 158, 20, 6); lit(g, 155, h - 166, 2, 6, '#ff2a4a');
            g.fillStyle = silFill(g, h - 50, h, '#5a5ab0', '#2a2a6a'); g.fillRect(10, h - 46, 280, 42);
            g.fillStyle = 'rgba(160,220,255,0.5)'; g.fillRect(14, h - 40, 272, 24);
            g.strokeStyle = 'rgba(30,30,80,0.7)'; g.lineWidth = 0.7; for (let x = 14; x < 286; x += 8) { g.beginPath(); g.moveTo(x, h - 40); g.lineTo(x, h - 16); g.stroke(); }
            for (let x = 18; x < 286; x += 16) lit(g, x, h - 36, 6, 6, P.win[(x / 16 | 0) % 3]);
            g.fillStyle = '#d8d8f8'; g.beginPath(); g.moveTo(6, h - 46); g.quadraticCurveTo(150, h - 62, 294, h - 46); g.lineTo(294, h - 44); g.lineTo(6, h - 44); g.fill();
            g.fillStyle = '#ffd23f'; g.fillRect(40, h - 14, 80, 10); txt(g, 'SCHIPHOL', 44, h - 12.4, 1, '#14145a');
            g.fillStyle = '#2a2aa8'; g.fillRect(190, h - 14, 70, 10); txt(g, 'GATES D-E', 194, h - 12.4, 1, '#ffffff');
            plane(g, 80, h - 128, 0.8, -0.22);
            plane(g, 250, h - 80, 0.55, 0);
          }],
          sc_we_mshq: [190, 175, function (g, w, h, P) {
            g.fillStyle = silFill(g, h - 150, h, '#3a4aa0', '#1a1a5a'); g.fillRect(14, h - 140, 104, 140); g.fillRect(100, h - 100, 80, 100);
            const glass = lg(g, 0, h - 140, 0, h, [[0, 'rgba(140,220,255,0.6)'], [1, 'rgba(60,90,200,0.3)']]);
            g.fillStyle = glass; g.fillRect(18, h - 134, 96, 130); g.fillRect(104, h - 94, 72, 90);
            g.strokeStyle = 'rgba(200,240,255,0.5)'; g.lineWidth = 0.6;
            for (let y = h - 130; y < h; y += 8) { g.beginPath(); g.moveTo(18, y); g.lineTo(114, y); g.stroke(); }
            for (let y = h - 90; y < h; y += 8) { g.beginPath(); g.moveTo(104, y); g.lineTo(176, y); g.stroke(); }
            const r = rng(717); for (let y = h - 128; y < h - 8; y += 8) for (let x = 22; x < 112; x += 6) if (r() < 0.45) lit(g, x, y + 2, 4, 4, P.win[Math.floor(r() * 3)]);
            for (let y = h - 88; y < h - 8; y += 8) for (let x = 108; x < 174; x += 6) if (r() < 0.45) lit(g, x, y + 2, 4, 4, P.win[Math.floor(r() * 3)]);
            g.fillStyle = 'rgba(10,6,30,0.9)'; g.fillRect(16, h - 160, 100, 18); glowRect(g, '#ffffff', 16, h - 160, 100, 18);
            msLogo(g, 20, h - 157, 12); txt(g, 'MICROSOFT', 36, h - 154, 1, '#ffffff');
            g.fillStyle = '#14082a'; g.fillRect(64, h - 142, 2, 2); g.fillRect(64, h - 142, 1, 0);
            g.fillStyle = 'rgba(10,6,30,0.85)'; g.fillRect(110, h - 112, 62, 12); txt(g, 'AZURE', 124, h - 109, 1, '#27e0ff');
            g.fillStyle = '#ff9a40'; g.fillRect(150, h - 120, 2, 8); g.fillRect(150, h - 120, 10, 6);
            txt(g, 'SCHIPHOL HQ', 30, h - 14, 1, '#ffe14a', '#1a0a3a');
            g.fillStyle = '#1a1a3a'; g.fillRect(56, h - 12, 22, 12); lit(g, 58, h - 10, 18, 9, '#bff0ff');
          }],
          sc_we_amstel: [240, 140, function (g, w, h, P) {
            const f = silFill(g, h - 110, h, '#f0e8ff', '#8a7ac8');
            g.fillStyle = f; g.fillRect(8, h - 80, 224, 80);
            g.fillStyle = '#3a3a6a'; g.beginPath(); g.moveTo(4, h - 80); g.lineTo(14, h - 100); g.lineTo(226, h - 100); g.lineTo(236, h - 80); g.closePath(); g.fill();
            for (let x = 22; x < 222; x += 20) { g.fillStyle = f; g.fillRect(x, h - 100, 8, 9); poly(g, [[x - 1, h - 100], [x + 4, h - 105], [x + 9, h - 100]], f); lit(g, x + 2, h - 98, 4, 5, P.win[0]); }
            g.fillStyle = f; g.fillRect(96, h - 108, 48, 108); poly(g, [[92, h - 108], [120, h - 126], [148, h - 108]], f);
            g.strokeStyle = '#8a7ac8'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(98, h - 110); g.lineTo(120, h - 123); g.lineTo(142, h - 110); g.stroke();
            [100, 140].forEach(function (x) { g.fillStyle = '#14082a'; g.fillRect(x - 0.4, h - 140, 0.8, 32); g.fillStyle = '#ff2a4a'; g.fillRect(x, h - 140, 9, 2); g.fillStyle = '#ffffff'; g.fillRect(x, h - 138, 9, 2); g.fillStyle = '#2a4ab8'; g.fillRect(x, h - 136, 9, 2); });
            for (let y = h - 72; y < h - 14; y += 18) for (let x = 14; x < 228; x += 12) { if (x > 92 && x < 146 && y > h - 30) continue; g.fillStyle = '#c8b8f0'; g.fillRect(x - 1, y - 1, 7, 12); lit(g, x, y, 5, 10, P.win[(x + y) % 3]); }
            for (let x = 98; x < 144; x += 6) { g.fillStyle = '#ffffff'; g.fillRect(x, h - 30, 2, 30); }
            g.fillStyle = '#1a1a4a'; g.fillRect(108, h - 22, 24, 22); lit(g, 110, h - 20, 20, 18, '#ffd890');
            g.fillStyle = '#2a1a5a'; g.fillRect(70, h - 92, 100, 10); txt(g, 'AMSTEL HOTEL', 85, h - 90, 1, '#ffd23f');
            for (let x = 10; x < 232; x += 6) lit(g, x, h - 81, 1.4, 1.4, '#ffe9a0');
          }],
          sc_we_wallen: [210, 175, function (g, w, h, P) {
            const K = { top: P.top, bot: P.bot, accent: '#ff5a7a', win: ['#ff3a5a', '#ff6a8a', '#ffd070'] };
            g.fillStyle = silFill(g, h - 175, h, '#5a3a7a', '#2a1a4a'); g.fillRect(96, h - 120, 34, 120);
            poly(g, [[92, h - 120], [113, h - 140], [134, h - 120]], '#3a5a6a'); g.fillStyle = '#5a3a7a'; g.fillRect(106, h - 160, 14, 22);
            poly(g, [[104, h - 160], [113, h - 175], [122, h - 160]], '#3a5a6a'); ell(g, 113, h - 150, 3.6, 3.6, '#ffd23f');
            grachtRow(g, 0, 96, h, 311, K, 80, 118); grachtRow(g, 130, 210, h, 312, K, 80, 118);
            g.strokeStyle = '#2a0a1a'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(0, h - 70); g.quadraticCurveTo(105, h - 56, 210, h - 70); g.stroke();
            for (let k = 0; k < 14; k++) { const lx = 6 + k * 15, ly = h - 70 + Math.sin(k / 13 * Math.PI) * 13; glowRect(g, '#ff2a4a', lx - 3, ly - 1, 6, 8); ell(g, lx, ly + 3, 2.4, 3.2, '#ff3a4a'); g.fillStyle = '#ffd070'; g.fillRect(lx - 0.5, ly + 1, 1, 4); }
            g.fillStyle = 'rgba(255,40,80,0.18)'; g.fillRect(0, h - 40, w, 40);
            txt(g, 'OUDE KERK', 86, h - 12, 1, '#ffe14a', '#3a0a1a');
          }],
          sc_we_ophaal: [150, 120, function (g, w, h, P) {
            const W = '#f4ecff';
            g.fillStyle = W; g.fillRect(14, h - 34, 4, 34); g.fillRect(132, h - 34, 4, 34);
            g.fillRect(0, h - 36, 40, 3); g.fillRect(110, h - 36, 40, 3);
            [[40, -1], [110, 1]].forEach(function (b) {
              const hx = b[0], s = b[1];
              g.fillStyle = W; g.fillRect(hx - 2 + (s > 0 ? -6 : 0), h - 100, 4, 66); g.fillRect(hx - 2 + (s > 0 ? -6 : 0) + 8 * -s * 0, h - 100, 4, 66);
              g.save(); g.translate(hx, h - 36); g.rotate(s * -1.15); g.fillStyle = '#e8e0f8'; g.fillRect(s > 0 ? -34 : 0, -3, 34, 4);
              g.fillStyle = '#5a4a8a'; for (let k = 0; k < 34; k += 4) g.fillRect((s > 0 ? -34 : 0) + k, -5, 0.8, 2); g.restore();
              g.save(); g.translate(hx + (s > 0 ? -4 : 0), h - 100); g.fillStyle = W; g.fillRect(s > 0 ? 0 : -30, 0, 34, 3); g.restore();
              line(g, hx + s * -30, h - 98, hx + s * -30 + s * 6, h - 64, 0.6, '#14082a');
            });
            for (let x = 4; x < 146; x += 6) lit(g, x, h - 39, 1.4, 1.4, '#ffe9a0');
            g.strokeStyle = '#ffe9a0'; g.lineWidth = 0.6; g.beginPath(); g.ellipse(75, h, 30, 22, 0, Math.PI, 0); g.stroke();
          }]
        };
  };

  content.parts['panoramaLandmarks_westeurope'] = function (C) {

    return ['sc_we_mill', 'sc_we_kerk'];
  };

  content.parts['sceneryRoutes_westeurope'] = function (C) {

    return [[0, 'sc_we_centraal'], [0.18, 'sc_we_schiphol'], [0.36, 'sc_nl_canalcruise'], [0.52, 'sc_nl_transit', 270], [0.68, 'sc_we_centraal'], [0.84, 'sc_we_schiphol']];
  };
})();
