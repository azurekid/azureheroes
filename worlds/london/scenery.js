/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['london'] = AH.Worlds['london'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { panoramaLandmarks: 1 };
  AH.ArtModules.regions['uksouth'] = content;

  AH.ArtModules.stages['worlds.london.scenery.11'] = function (C) {
    const { R, depthFace, depthGround, ell, lg, line, lit, poly, rim, silFill } = C;

    Object.assign(C, { gothWin, bigBen, parliament, towerBridge, londonEye, shard });
    function gothWin(g, x, y, w, h, c) {
        poly(g, [[x, y + h], [x, y + w * 0.6], [x + w / 2, y], [x + w, y + w * 0.6], [x + w, y + h]], c);
        if (c[0] === '#') { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + w * 0.2, y + w * 0.6, Math.max(0.5, w * 0.2), h - w * 0.6); }
      }

    function bigBen(g, cx, base, s, P) {
        const stone = lg(g, cx - 13 * s, 0, cx + 13 * s, 0, [[0, '#9a86c8'], [0.35, '#d8c4a8'], [0.7, '#a890b8'], [1, '#4a3a88']]);
        const dark = 'rgba(30,16,70,0.55)', gold = '#ffd23f';
        // shaft
        g.fillStyle = stone; g.fillRect(cx - 10 * s, base - 106 * s, 20 * s, 106 * s);
        depthFace(g, cx - 10 * s, base - 106 * s, 20 * s, base, 4 * s, '#5e526f', '#d2bdaf');
        g.fillStyle = 'rgba(20,10,60,0.25)'; g.fillRect(cx + 4 * s, base - 106 * s, 6 * s, 106 * s);
        [-10, -1, 8].forEach(function (o) { g.fillStyle = 'rgba(255,240,220,0.32)'; g.fillRect(cx + o * s, base - 106 * s, 2 * s, 106 * s); });
        for (let y = 12; y < 104; y += 15) {
          g.fillStyle = 'rgba(255,236,200,0.5)'; g.fillRect(cx - 10.5 * s, base - y * s, 21 * s, 0.9);
          [-7, -3, 2, 6].forEach(function (o, k) { gothWin(g, cx + o * s - 0.7 * s, base - (y + 11) * s, 1.6 * s, 8 * s, (y + k) % 3 ? dark : P.win[(y + k) % P.win.length]); });
        }
        // clock stage with gilded frame
        const fy = base - 120 * s;
        g.fillStyle = stone; g.fillRect(cx - 13 * s, base - 136 * s, 26 * s, 31 * s);
        depthFace(g, cx - 13 * s, base - 136 * s, 26 * s, base - 105 * s, 5 * s, '#625771', '#dfc9ad');
        g.fillStyle = 'rgba(20,10,60,0.25)'; g.fillRect(cx + 6 * s, base - 136 * s, 7 * s, 31 * s);
        g.fillStyle = '#b8902a'; g.fillRect(cx - 11.5 * s, fy - 11.5 * s, 23 * s, 23 * s);
        g.fillStyle = gold; g.fillRect(cx - 11 * s, fy - 11 * s, 22 * s, 0.9); g.fillRect(cx - 11 * s, fy + 10.5 * s, 22 * s, 0.9);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { ell(g, cx + c[0] * 9 * s, fy + c[1] * 9 * s, 1.4 * s, 1.4 * s, gold); });
        ell(g, cx, fy, 12.5 * s, 12.5 * s, 'rgba(255,214,110,0.22)');
        ell(g, cx, fy, 9.6 * s, 9.6 * s, gold); ell(g, cx, fy, 8.4 * s, 8.4 * s, '#fff6d0');
        ell(g, cx, fy, 5.6 * s, 5.6 * s, 'rgba(255,230,160,0.55)');
        for (let k = 0; k < 12; k++) {
          const a = k * Math.PI / 6;
          line(g, cx + Math.sin(a) * 6.4 * s, fy - Math.cos(a) * 6.4 * s, cx + Math.sin(a) * 7.8 * s, fy - Math.cos(a) * 7.8 * s, k % 3 ? 0.6 : 1, '#3a2408');
        }
        line(g, cx, fy, cx, fy - 6 * s, 1, '#2a1404'); line(g, cx, fy, cx + 3.8 * s, fy + 1.4 * s, 1.2, '#2a1404');
        ell(g, cx, fy, 1, 1, '#2a1404');
        g.fillStyle = gold; g.fillRect(cx - 13.5 * s, base - 106 * s, 27 * s, 1.2); g.fillRect(cx - 13.5 * s, base - 137 * s, 27 * s, 1.4);
        // corner pinnacles on the clock stage
        [-12, 12].forEach(function (o) { g.fillStyle = stone; g.fillRect(cx + o * s - 1.2 * s, base - 142 * s, 2.4 * s, 6 * s); poly(g, [[cx + o * s - 1.4 * s, base - 142 * s], [cx + o * s, base - 147 * s], [cx + o * s + 1.4 * s, base - 142 * s]], gold); });
        // belfry arcade
        g.fillStyle = stone; g.fillRect(cx - 11 * s, base - 153 * s, 22 * s, 16 * s);
        for (let k = 0; k < 4; k++) { gothWin(g, cx - 9.4 * s + k * 5 * s, base - 151 * s, 3.4 * s, 12 * s, 'rgba(12,6,40,0.85)'); lit(g, cx - 8.6 * s + k * 5 * s, base - 145 * s, 1.8 * s, 5 * s, P.win[k % P.win.length]); }
        g.fillStyle = gold; g.fillRect(cx - 11.5 * s, base - 154 * s, 23 * s, 1);
        for (let k = 0; k <= 11; k++) g.fillRect(cx - 11 * s + k * 2 * s, base - 156 * s, 0.7, 2 * s);
        // slate spire with gilded ribs, dormers and lantern
        const slate = lg(g, cx - 12 * s, 0, cx + 12 * s, 0, [[0, '#2a2a6a'], [0.45, '#5a5aa8'], [1, '#1a1450']]);
        poly(g, [[cx - 12 * s, base - 156 * s], [cx - 5 * s, base - 178 * s], [cx + 5 * s, base - 178 * s], [cx + 12 * s, base - 156 * s]], slate);
        [-12, -4, 4, 12].forEach(function (o) { line(g, cx + o * s, base - 156 * s, cx + o * 0.42 * s, base - 178 * s, 0.7, gold); });
        [-6, 6].forEach(function (o) { poly(g, [[cx + o * s - 2 * s, base - 160 * s], [cx + o * s, base - 165 * s], [cx + o * s + 2 * s, base - 160 * s]], '#d8c4a8'); lit(g, cx + o * s - 0.6 * s, base - 163 * s, 1.2 * s, 2.4 * s, gold); });
        g.fillStyle = '#d8c4a8'; g.fillRect(cx - 4 * s, base - 186 * s, 8 * s, 8 * s);
        lit(g, cx - 2.6 * s, base - 185 * s, 1.6 * s, 5 * s, gold); lit(g, cx + 1 * s, base - 185 * s, 1.6 * s, 5 * s, gold);
        poly(g, [[cx - 4.5 * s, base - 186 * s], [cx, base - 199 * s], [cx + 4.5 * s, base - 186 * s]], slate);
        line(g, cx, base - 199 * s, cx, base - 206 * s, 1, gold);
        ell(g, cx, base - 203 * s, 1.3, 1.3, gold); lit(g, cx - 1.4, base - 208 * s, 2.8, 2.8, gold);
        rim(g, cx - 10 * s, base - 106 * s, 106 * s, 'rgba(255,255,255,0.35)');
        depthGround(g, cx - 12 * s, base, 24 * s, 3 * s, '#393047', '#b5a2a3');
      }

    function parliament(g, x0, x1, base, P) {
        const stone = silFill(g, base - 50, base, '#c8b4b0', '#5a4a98');
        g.fillStyle = 'rgba(40,30,90,0.9)'; poly(g, [[x0, base - 32], [x0 + 6, base - 39], [x1 - 6, base - 39], [x1, base - 32]], '#3a3a80');
        g.fillStyle = stone; g.fillRect(x0, base - 32, x1 - x0, 32);
        depthFace(g, x0, base - 32, x1 - x0, base, 5, '#53465f', '#b3a5ab');
        g.fillStyle = 'rgba(255,236,200,0.5)'; g.fillRect(x0, base - 32, x1 - x0, 1); g.fillRect(x0, base - 17, x1 - x0, 0.8);
        for (let x = x0 + 3; x < x1 - 3; x += 6) {
          g.fillStyle = 'rgba(30,16,70,0.35)'; g.fillRect(x + 4.4, base - 32, 0.8, 32);
          lit(g, x + 1, base - 28, 2.4, 8, P.win[Math.floor((x * 7) % P.win.length)]);
          gothWin(g, x + 1, base - 14, 2.4, 9, (x | 0) % 3 ? 'rgba(20,10,60,0.6)' : P.win[1]);
        }
        for (let x = x0 + 5; x < x1 - 2; x += 12) {
          g.fillStyle = '#c8b4b0'; g.fillRect(x - 1, base - 44, 2, 12);
          poly(g, [[x - 1.6, base - 44], [x, base - 50], [x + 1.6, base - 44]], '#3a3a80');
          g.fillStyle = '#ffd23f'; g.fillRect(x - 0.3, base - 52, 0.6, 2);
        }
        const vx = x1 - 26;
        if (vx > x0 + 40) {
          g.fillStyle = stone; g.fillRect(vx, base - 70, 18, 70);
          depthFace(g, vx, base - 70, 18, base, 4, '#58465f', '#c4b1b1');
          g.fillStyle = 'rgba(20,10,60,0.25)'; g.fillRect(vx + 12, base - 70, 6, 70);
          for (let y = base - 64; y < base - 34; y += 10) { gothWin(g, vx + 4, y, 2.4, 7, P.win[0]); gothWin(g, vx + 10, y, 2.4, 7, 'rgba(20,10,60,0.6)'); }
          [vx, vx + 18].forEach(function (x) { g.fillStyle = '#c8b4b0'; g.fillRect(x - 1, base - 78, 2.4, 8); poly(g, [[x - 1.4, base - 78], [x + 0.2, base - 84], [x + 1.8, base - 78]], '#3a3a80'); });
          g.fillStyle = '#ffd23f'; g.fillRect(vx + 8.6, base - 86, 0.8, 16); g.fillRect(vx + 6, base - 85, 6, 2.6);
        }
        depthGround(g, x0, base, x1 - x0, 3, '#393047', '#aa9499');
      }

    function towerBridge(g, x0, x1, base, P) {
        const tw = [x0 + 34, x1 - 34], deck = base - 30;
        const stone = lg(g, 0, base - 104, 0, base, [[0, '#d8c8c0'], [0.5, '#a894c0'], [1, '#5a4a98']]);
        const blue = '#2a7ad8', pale = '#dff0ff';
        // river piers
        tw.forEach(function (tx) {
          poly(g, [[tx - 16, deck + 4], [tx + 16, deck + 4], [tx + 18, base], [tx - 18, base]], '#3a2e78');
          poly(g, [[tx + 9, deck + 4], [tx + 16, deck + 4], [tx + 18, base], [tx + 11, base]], '#302844');
          depthGround(g, tx - 18, base, 36, 3, '#29263f', '#a69ba8');
          g.fillStyle = 'rgba(160,200,255,0.4)'; g.fillRect(tx - 18, base - 3, 36, 1);
        });
        // side-span suspension chains (blue with white edge) and hangers
        [[x0, tw[0] - 13, 1], [x1, tw[1] + 13, -1]].forEach(function (c) {
          const sx = c[0], ex = c[1], top = base - 74;
          const cpx = sx + (ex - sx) * 0.55, cpy = deck + 6;
          g.lineCap = 'round';
          [[2.6, blue], [0.8, pale]].forEach(function (st, i) { g.strokeStyle = st[1]; g.lineWidth = st[0]; g.beginPath(); g.moveTo(sx, deck - 2 - i); g.quadraticCurveTo(cpx, cpy - i, ex, top - i); g.stroke(); });
          for (let i = 1; i < 8; i++) {
            const t = i / 8, hx = (1 - t) * (1 - t) * sx + 2 * t * (1 - t) * cpx + t * t * ex, hy = (1 - t) * (1 - t) * (deck - 2) + 2 * t * (1 - t) * cpy + t * t * top;
            line(g, hx, hy, hx, deck, 0.6, 'rgba(223,240,255,0.7)');
          }
          g.fillStyle = '#c8b4b0'; g.fillRect(sx + (c[2] > 0 ? 0 : -6), deck - 10, 6, 10);
        });
        // road deck and central bascules (blue girders, rivets, lamps)
        g.fillStyle = '#3a3a80'; g.fillRect(x0, deck, x1 - x0, 5);
        g.fillStyle = blue; g.fillRect(x0, deck + 1, x1 - x0, 2.4);
        for (let x = x0 + 2; x < x1; x += 4) { g.fillStyle = pale; g.fillRect(x, deck + 1.8, 0.8, 0.8); }
        const mid = (tw[0] + tw[1]) / 2;
        g.fillStyle = '#10082a'; g.fillRect(mid - 0.5, deck - 1, 1, 7);
        g.fillStyle = 'rgba(255,236,200,0.6)'; g.fillRect(x0, deck - 0.8, x1 - x0, 0.8);
        for (let x = tw[0] + 18; x < tw[1] - 14; x += 18) { g.fillStyle = '#1a1450'; g.fillRect(x, deck - 7, 0.8, 7); lit(g, x - 0.8, deck - 9, 2.4, 2, '#ffe9a0'); }
        // high-level walkways: twin latticed girders
        const wy0 = base - 80, wy1 = base - 70, wl = tw[0] + 13, wr = tw[1] - 13;
        g.fillStyle = 'rgba(42,122,216,0.22)'; g.fillRect(wl, wy0, wr - wl, wy1 - wy0 + 3);
        g.fillStyle = blue; g.fillRect(wl, wy0, wr - wl, 2.4); g.fillRect(wl, wy1, wr - wl, 2.6);
        g.fillStyle = pale; g.fillRect(wl, wy0, wr - wl, 0.7); g.fillRect(wl, wy1, wr - wl, 0.7);
        g.strokeStyle = 'rgba(160,210,255,0.85)'; g.lineWidth = 0.6;
        for (let x = wl; x < wr - 1; x += 5) { g.beginPath(); g.moveTo(x, wy0 + 2.4); g.lineTo(x + 2.5, wy1); g.lineTo(x + 5, wy0 + 2.4); g.stroke(); }
        for (let x = wl + 4; x < wr - 3; x += 9) lit(g, x, wy1 + 0.6, 2, 1.4, P.win[0]);
        // gothic towers
        tw.forEach(function (tx) {
          g.fillStyle = stone; g.fillRect(tx - 13, base - 86, 26, deck - (base - 86));
          depthFace(g, tx - 13, base - 86, 26, deck + 4, 5, '#675974', '#d2c2b9');
          g.fillStyle = 'rgba(20,10,60,0.28)'; g.fillRect(tx + 6, base - 86, 7, deck - (base - 86));
          g.fillStyle = 'rgba(255,240,220,0.55)'; [base - 86, base - 66, base - 48].forEach(function (y) { g.fillRect(tx - 13.5, y, 27, 1); });
          gothWin(g, tx - 7, deck - 15, 14, 15, '#14082e');
          g.fillStyle = 'rgba(255,214,110,0.3)'; g.fillRect(tx - 6, deck - 4, 12, 4);
          [-6, 3].forEach(function (o, i) { gothWin(g, tx + o, base - 63, 3, 11, P.win[i]); gothWin(g, tx + o, base - 82, 3, 12, P.win[(i + 1) % P.win.length]); });
          // corner turrets with spirelets and gilded finials
          [-12, 12].forEach(function (o) {
            g.fillStyle = '#e0d0c8'; g.fillRect(tx + o - 2, base - 96, 4, 12);
            g.fillStyle = 'rgba(20,10,60,0.3)'; g.fillRect(tx + o + 0.6, base - 96, 1.4, 12);
            poly(g, [[tx + o - 2.6, base - 96], [tx + o, base - 106], [tx + o + 2.6, base - 96]], '#3a3a80');
            g.fillStyle = '#ffd23f'; g.fillRect(tx + o - 0.3, base - 109, 0.6, 3);
          });
          // steep central slate roof with dormer and spire
          poly(g, [[tx - 10, base - 86], [tx - 3, base - 104], [tx + 3, base - 104], [tx + 10, base - 86]], '#34347c');
          line(g, tx - 6, base - 86, tx - 1.6, base - 104, 0.5, 'rgba(160,190,255,0.7)'); line(g, tx + 6, base - 86, tx + 1.6, base - 104, 0.5, 'rgba(160,190,255,0.7)');
          poly(g, [[tx - 3, base - 92], [tx, base - 97], [tx + 3, base - 92]], '#e0d0c8'); lit(g, tx - 0.8, base - 94, 1.6, 2, P.win[0]);
          g.fillStyle = '#3a3a80'; g.fillRect(tx - 0.8, base - 112, 1.6, 8);
          g.fillStyle = '#ffd23f'; g.fillRect(tx - 0.3, base - 115, 0.6, 3);
          rim(g, tx - 13, base - 86, deck - (base - 86), 'rgba(255,255,255,0.35)');
        });
        poly(g, [[x0, deck - 3], [x1 - 5, deck - 3], [x1, deck + 1], [x0, deck + 1]], '#8b94aa');
        line(g, x0, deck + 3, x1, deck + 3, 1.2, '#4d536e');
      }

    function londonEye(g, cx, base, s, P) {
        const cy = base - 58 * s, R = 43 * s, Ri = R - 3.4 * s, n = 32;
        // A-frame legs and back-stay cables
        const legs = [cx - 20 * s, cx + 20 * s];
        line(g, cx + 34 * s, base, cx, cy, 0.6, 'rgba(220,230,255,0.55)'); line(g, cx + 30 * s, base, cx, cy, 0.6, 'rgba(220,230,255,0.45)');
        legs.forEach(function (lx) { line(g, lx, base, cx, cy, 3 * s, '#c8d0ff'); line(g, lx + 0.8, base, cx + 0.4, cy, 0.8, '#ffffff'); });
        line(g, cx - 10 * s, base - 29 * s, cx + 10 * s, base - 29 * s, 1.2, '#c8d0ff');
        // cable spokes
        g.strokeStyle = 'rgba(200,210,255,0.55)'; g.lineWidth = 0.45;
        for (let k = 0; k < 64; k++) { const a = k * Math.PI * 2 / 64; g.beginPath(); g.moveTo(cx + Math.cos(a) * 3 * s, cy + Math.sin(a) * 3 * s); g.lineTo(cx + Math.cos(a) * Ri, cy + Math.sin(a) * Ri); g.stroke(); }
        // trussed rim
        g.strokeStyle = '#e8ecff'; g.lineWidth = 1.3; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, Ri, 0, Math.PI * 2); g.stroke();
        g.strokeStyle = 'rgba(232,236,255,0.8)'; g.lineWidth = 0.5; g.beginPath();
        for (let k = 0; k <= 96; k++) { const a = k * Math.PI * 2 / 96, r = k % 2 ? R : Ri; const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; if (k) g.lineTo(px, py); else g.moveTo(px, py); }
        g.stroke();
        g.strokeStyle = 'rgba(39,224,255,0.45)'; g.lineWidth = 2.2; g.beginPath(); g.arc(cx, cy, R + 0.6, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
        // capsules mounted outside the rim, always level
        for (let k = 0; k < n; k++) {
          const a = k * Math.PI * 2 / n, px = cx + Math.cos(a) * (R + 3.2 * s), py = cy + Math.sin(a) * (R + 3.2 * s);
          line(g, cx + Math.cos(a) * R, cy + Math.sin(a) * R, px, py, 0.6, '#e8ecff');
          ell(g, px, py, 3 * s, 2.1 * s, '#e8ecff');
          ell(g, px, py, 2.4 * s, 1.5 * s, k % 8 === 3 ? '#ff9aff' : '#9ad8ff');
          g.fillStyle = 'rgba(255,240,180,0.85)'; g.fillRect(px - 1.6 * s, py - 0.3 * s, 3.2 * s, 0.6 * s);
        }
        // hub and spindle
        ell(g, cx, cy, 4.2 * s, 4.2 * s, '#c8d0ff'); ell(g, cx, cy, 2.6 * s, 2.6 * s, '#5a5aa8'); ell(g, cx, cy, 1.2 * s, 1.2 * s, P.accent);
        // boarding pier
        g.fillStyle = '#3a2e78'; g.fillRect(cx - 26 * s, base - 4 * s, 52 * s, 4 * s);
        g.fillStyle = '#e8ecff'; g.fillRect(cx - 26 * s, base - 4 * s, 52 * s, 0.8);
        for (let k = 0; k < 6; k++) lit(g, cx - 22 * s + k * 9 * s, base - 2.8 * s, 2 * s, 1.4 * s, P.win[k % P.win.length]);
        depthGround(g, cx - 26 * s, base, 52 * s, 2 * s, '#343149', '#9c9eb4');
      }

    function shard(g, cx, base, s, P) {
        const f = lg(g, cx - 12 * s, 0, cx + 12 * s, 0, [[0, '#5a4ad8'], [0.45, '#b8a0ff'], [1, '#34187a']]);
        poly(g, [[cx - 12 * s, base], [cx - 5 * s, base - 100 * s], [cx - 1 * s, base - 140 * s], [cx + 1 * s, base - 140 * s], [cx + 6 * s, base - 100 * s], [cx + 12 * s, base]], f);
        poly(g, [[cx + 1 * s, base - 140 * s], [cx + 6 * s, base - 100 * s], [cx + 12 * s, base], [cx + 3 * s, base]], '#34374f');
        g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 0.6;
        for (let k = 1; k < 9; k++) { const y = base - k * 14 * s, w = (12 - k * 1.2) * s; g.beginPath(); g.moveTo(cx - w, y); g.lineTo(cx + w, y); g.stroke(); }
        g.beginPath(); g.moveTo(cx, base); g.lineTo(cx, base - 140 * s); g.stroke();
        lit(g, cx - 1, base - 143 * s, 2, 2.4, '#ff2a4a');
        depthGround(g, cx - 12 * s, base, 24 * s, 2 * s, '#29283c', '#9792aa');
      }
  };

  AH.ArtModules.stages['worlds.london.scenery.22'] = function (C) {
    const { FLAT, PAL, reg2, skyline } = C;

    reg2('bg_near_uksouth', 640, 190, skyline(640, 190, 83, '#170a48', '#8ab4ff', 40, 110, 0.26, PAL.uksouth.win), FLAT);
  };

  AH.ArtModules.stages['worlds.london.scenery.122'] = function (C) {
    const { SC, depthFace, depthGround, ell, lg, line, lit, poly } = C;

    Object.assign(SC.uksouth, {
        sc_uk_stonehenge: [210, 155, function (g, w, h, P) {
          g.fillStyle = lg(g, 0, h - 28, 0, h, [[0, '#62764a'], [1, '#263c40']]); g.fillRect(0, h - 28, w, 28);
          const stones = [[28, 56, 23], [65, 36, 27], [110, 30, 26], [154, 43, 26], [183, 63, 24]];
          stones.forEach(function (s, i) {
            const x = s[0], top = h - s[1], sw = s[2];
            poly(g, [[x, top + 8], [x + 4, top], [x + sw - 3, top + 2], [x + sw, h - 26], [x + 2, h - 26]], lg(g, x, top, x + sw, h, [[0, '#c8b7a3'], [0.48, '#766b83'], [1, '#3a3b59']]));
            poly(g, [[x + sw - 7, top + 3], [x + sw - 3, top + 2], [x + sw, h - 26], [x + sw - 5, h - 26]], '#575365');
            line(g, x + 4, top + 4, x + sw - 4, top + 5, 1.2, i % 2 ? P.accent : '#e5cda9');
          });
          [[51, h - 96, 58], [97, h - 102, 62], [142, h - 89, 61]].forEach(function (b, i) {
            poly(g, [[b[0], b[1] + 8], [b[0] + 5, b[1]], [b[0] + b[2] - 4, b[1] + 1], [b[0] + b[2], b[1] + 9], [b[0] + b[2] - 2, b[1] + 14], [b[0] + 1, b[1] + 13]], '#a89a9c');
            line(g, b[0] + 4, b[1] + 2, b[0] + b[2] - 5, b[1] + 3, 1.5, P.accent);
          });
          ell(g, 104, h - 23, 64, 5, 'rgba(255,215,145,0.22)');
          poly(g, [[72, h], [110, h - 28], [124, h - 28], [126, h]], '#7c7966');
          depthGround(g, 0, h, w, 4, '#293a38', '#647455');
        }],
        sc_uk_edinburgh: [230, 205, function (g, w, h, P) {
          poly(g, [[8, h - 23], [29, h - 66], [56, h - 82], [77, h - 119], [109, h - 141], [145, h - 151], [181, h - 119], [211, h - 49], [226, h - 23]], lg(g, 0, h - 151, 0, h, [[0, '#88749a'], [0.5, '#544568'], [1, '#252441']]));
          const base = h - 48;
          g.fillStyle = lg(g, 34, base - 83, 177, h, [[0, '#c3a9a7'], [0.45, '#805b77'], [1, '#322b54']]);
          g.fillRect(40, base - 39, 139, 39); g.fillRect(54, base - 76, 115, 38);
          depthFace(g, 40, base - 39, 139, base, 8, '#51394e', '#a58a96');
          depthFace(g, 54, base - 76, 115, base - 38, 6, '#593e56', '#af939a');
          poly(g, [[42, base - 76], [95, base - 99], [151, base - 76]], '#a88493');
          g.fillStyle = '#4a3a60'; g.fillRect(67, base - 127, 42, 53);
          poly(g, [[63, base - 127], [88, base - 158], [113, base - 127]], '#c7a8a0');
          g.fillStyle = '#3e3459'; g.fillRect(79, base - 148, 18, 22);
          for (let x = 49; x < 172; x += 15) { lit(g, x, base - 29, 5, 9, P.win[(x / 15 | 0) % 3]); lit(g, x + 2, base - 65, 4, 8, P.win[(x / 15 + 1 | 0) % 3]); }
          for (let x = 46; x < 178; x += 26) { line(g, x, base - 3, x, base - 22, 1.3, P.accent); }
          line(g, 24, h - 21, 221, h - 21, 3, P.accent);
          poly(g, [[54, base], [160, base], [181, h - 22], [28, h - 22]], '#5b4b60');
          depthGround(g, 24, h, 197, 22, '#302d43', '#6e5d70');
        }],
        sc_uk_angel: [250, 185, function (g, w, h, P) {
          const cx = 124, foot = h - 16;
          g.fillStyle = lg(g, 0, foot - 18, 0, h, [[0, '#607554'], [1, '#283d48']]); g.fillRect(0, foot - 18, w, 18);
          // Broad, slightly swept wings and the upright body give the sculpture its unmistakable outline.
          poly(g, [[cx - 7, foot - 60], [cx - 31, foot - 95], [cx - 94, foot - 134], [cx - 108, foot - 139], [cx - 98, foot - 120], [cx - 40, foot - 70], [cx - 17, foot - 40]], lg(g, 18, foot - 140, cx - 10, foot - 30, [[0, '#d3a9a5'], [0.45, '#855b81'], [1, '#383058']]));
          poly(g, [[cx + 7, foot - 60], [cx + 31, foot - 95], [cx + 94, foot - 134], [cx + 108, foot - 139], [cx + 98, foot - 120], [cx + 40, foot - 70], [cx + 17, foot - 40]], lg(g, cx + 10, foot - 140, 231, foot - 30, [[0, '#d3a9a5'], [0.5, '#80618b'], [1, '#37335e']]));
          poly(g, [[cx - 13, foot - 100], [cx + 13, foot - 100], [cx + 18, foot - 38], [cx + 31, foot - 8], [cx - 30, foot - 8], [cx - 17, foot - 38]], '#4a3b68');
          ell(g, cx, foot - 111, 12, 14, '#d4b8aa');
          poly(g, [[cx - 13, foot - 97], [cx + 13, foot - 97], [cx + 10, foot - 68], [cx - 10, foot - 68]], '#a16b88');
          line(g, cx - 10, foot - 89, cx + 9, foot - 89, 2, P.accent);
          line(g, 16, foot - 17, 235, foot - 17, 2, '#a9bd84');
          line(g, 20, foot - 10, 230, foot - 10, 1, P.accent);
          poly(g, [[93, foot - 8], [155, foot - 8], [166, h], [82, h]], '#4e4b54');
          depthGround(g, 82, h, 84, 5, '#30353f', '#8f8b7a');
        }],
        sc_uk_liver: [190, 215, function (g, w, h, P) {
          const base = h - 15;
          g.fillStyle = lg(g, 0, base - 125, 0, h, [[0, '#c7b1a2'], [0.55, '#735878'], [1, '#2c294e']]);
          g.fillRect(18, base - 110, 154, 110);
          depthFace(g, 18, base - 110, 154, base, 9, '#4c3b55', '#a58c98');
          g.fillRect(30, base - 135, 32, 25); g.fillRect(128, base - 135, 32, 25);
          [46, 144].forEach(function (x, i) {
            g.fillStyle = '#554269'; g.fillRect(x - 12, base - 165, 24, 32);
            poly(g, [[x - 12, base - 165], [x, base - 194], [x + 12, base - 165]], '#c8a9a1');
            g.fillStyle = '#28244a'; g.fillRect(x - 7, base - 185, 14, 19);
            ell(g, x, base - 116, 10, 10, '#d7c294');
            line(g, x - 6, base - 116, x + 6, base - 116, 1, '#40365c');
            lit(g, x - 2, base - 118, 4, 4, P.win[i]);
          });
          // The Liver Birds sit atop the twin towers as small outward-facing silhouettes.
          [46, 144].forEach(function (x, i) {
            ell(g, x, base - 198, 5, 7, '#c49b78');
            poly(g, [[x - 3, base - 199], [x - 18, base - 205], [x - 9, base - 195]], '#d0aa81');
            poly(g, [[x + 3, base - 199], [x + 18, base - 205], [x + 9, base - 195]], '#d0aa81');
            line(g, x - 2, base - 190, x + 2, base - 190, 1, P.accent);
          });
          for (let x = 25; x < 166; x += 12) for (let y = base - 100; y < base - 25; y += 19) lit(g, x, y, 4, 7, P.win[(x / 12 + y / 19 | 0) % 3]);
          line(g, 13, base - 4, 179, base - 4, 2, P.accent);
          depthGround(g, 13, h, 166, 15, '#2b2b40', '#8b7d8c');
        }],
        sc_uk_blackpool: [130, 225, function (g, w, h, P) {
          const cx = 65, base = h - 13;
          g.fillStyle = '#393457'; g.fillRect(24, base - 8, 82, 8);
          // Four lattice legs spread to a wide base beneath the narrow red tower.
          line(g, cx - 5, base - 192, 34, base - 9, 5, '#b35d77');
          line(g, cx + 5, base - 192, 96, base - 9, 5, '#b35d77');
          line(g, 34, base - 9, 96, base - 9, 4, '#d08b88');
          line(g, cx, base - 194, cx - 8, base - 10, 4, '#de8b86');
          line(g, cx, base - 194, cx + 8, base - 10, 4, '#de8b86');
          for (let y = base - 165; y > base - 184; y -= 9) line(g, cx - (base - y) * 0.16, y, cx + (base - y) * 0.16, y - 1, 2, '#e2aaa0');
          g.fillStyle = '#45385e'; g.fillRect(cx - 18, base - 190, 36, 8);
          poly(g, [[cx - 16, base - 190], [cx, base - 210], [cx + 16, base - 190]], '#c27783');
          line(g, cx, base - 210, cx, base - 220, 2, P.accent);
          for (let y = base - 170; y < base - 30; y += 27) {
            const half = 4 + (base - y) * 0.045;
            line(g, cx - half, y, cx + half, y, 1.3, P.accent);
          }
          line(g, 26, base - 9, 105, base - 9, 2, '#efb894');
          poly(g, [[34, base - 9], [96, base - 9], [106, h], [24, h]], '#62556b');
          depthGround(g, 24, h, 82, 5, '#302b40', '#9b7e8d');
        }],
        sc_uk_glenfinnan: [270, 165, function (g, w, h, P) {
          const viaductTop = h - 71;
          poly(g, [[0, h - 20], [27, h - 90], [65, h - 119], [93, h - 77], [132, h - 112], [168, h - 96], [205, h - 132], [260, h - 100], [270, h - 20]], lg(g, 0, h - 132, 0, h, [[0, '#526b73'], [0.56, '#384660'], [1, '#25334d']]));
          // Long stone viaduct with repeated rounded arches.
          g.fillStyle = lg(g, 0, viaductTop, 0, h, [[0, '#b39b9f'], [0.5, '#735c79'], [1, '#34314f']]);
          g.fillRect(12, viaductTop, 246, 12);
          poly(g, [[12, viaductTop], [249, viaductTop - 5], [258, viaductTop], [12, viaductTop + 3]], '#b6a4a1');
          for (let x = 23; x < 250; x += 38) {
            g.fillRect(x, viaductTop + 9, 8, h - viaductTop - 9);
            poly(g, [[x + 5, viaductTop + 12], [x + 8, viaductTop + 9], [x + 8, h], [x + 5, h]], '#4e4256');
            g.beginPath(); g.ellipse(x + 4, viaductTop + 26, 15, 18, 0, Math.PI, 0); g.fill();
            g.fillRect(x - 11, viaductTop + 26, 30, h - viaductTop - 26);
            g.fillStyle = '#27304a'; g.beginPath(); g.ellipse(x + 4, viaductTop + 27, 11, 14, 0, Math.PI, 0); g.fill();
            g.fillRect(x - 7, viaductTop + 27, 22, h - viaductTop - 27);
            g.fillStyle = '#735c79';
          }
          line(g, 9, viaductTop, 261, viaductTop, 2, P.accent);
          // Steam locomotive and two coaches crossing the curved arches.
          g.fillStyle = '#202747'; g.fillRect(78, viaductTop - 26, 61, 16);
          g.fillStyle = '#a84861'; g.fillRect(86, viaductTop - 21, 31, 11);
          g.fillStyle = '#303457'; g.fillRect(119, viaductTop - 32, 20, 22);
          g.fillStyle = '#252344'; g.fillRect(141, viaductTop - 23, 42, 13); g.fillRect(187, viaductTop - 23, 42, 13);
          for (let x = 87; x < 230; x += 14) lit(g, x, viaductTop - 20, 5, 4, P.win[(x / 14 | 0) % 3]);
          for (let x = 90; x < 224; x += 20) ell(g, x, viaductTop - 8, 5, 5, '#171a37');
          g.fillStyle = '#42456c'; g.fillRect(92, viaductTop - 35, 18, 4); ell(g, 101, viaductTop - 41, 5, 7, 'rgba(220,210,220,0.55)');
          depthGround(g, 12, h, 246, 3, '#293344', '#63706f');
        }]
      });
  };

  content.parts['panorama'] = function (C) {
    const { PAL } = C;
    const bigBen = (...args) => C.bigBen(...args);
    const londonEye = (...args) => C.londonEye(...args);
    const parliament = (...args) => C.parliament(...args);
    const shard = (...args) => C.shard(...args);
    const skyline = (...args) => C.skyline(...args);
    const towerBridge = (...args) => C.towerBridge(...args);

    return function (g, w, h) {
    const P = PAL['uksouth'];
    const base = h - 6;
    
            skyline(w, h, 63, '#2a1a78', P.accent, 34, 90, 0.2, P.win)(g);
            parliament(g, 0, 170, base, P); bigBen(g, 40, base, 0.95, P);
            towerBridge(g, 200, 400, base, P);
            londonEye(g, 490, base, 0.9, P); shard(g, 595, base, 0.85, P);
          
    };
  };

  content.parts['MP_uksouth'] = function (C) {

    return { top: '#3a3a90', bot: '#5a4aa8', accent: '#a8c8ff', win: ['#ffe9a0', '#ffc070', '#bfe8ff'] };
  };

  content.parts['SC_uksouth'] = function (C) {
    const { bigBen, depthFace, depthGround, lg, line, lit, londonEye, parliament, poly, shard, silFill, towerBridge } = C;

    return {
          sc_uk_bigben: [190, 272, function (g, w, h, P) { parliament(g, 30, 190, h, P); bigBen(g, 28, h, 1.28, P); }],
          sc_uk_eye: [150, 180, function (g, w, h, P) { londonEye(g, 75, h, 1.4, P); }],
          sc_uk_stpauls: [170, 170, function (g, w, h, P) {
            const f = silFill(g, h - 160, h, '#c8c0f0', '#5a4aa8');
            g.fillStyle = f; g.fillRect(10, h - 60, 150, 60); g.fillRect(55, h - 90, 60, 30);
            depthFace(g, 10, h - 60, 150, h, 8, '#71617e', '#dbd0ce');
            depthFace(g, 55, h - 90, 60, h - 60, 5, '#8a7892', '#ddd4cf');
            g.beginPath(); g.ellipse(85, h - 90, 32, 40, 0, Math.PI, 0); g.fill();
            g.fillRect(80, h - 140, 10, 14); poly(g, [[78, h - 140], [85, h - 152], [92, h - 140]], f);
            lit(g, 84, h - 156, 2, 3, '#ffd23f');
            [20, 150].forEach(function (x) { g.fillStyle = f; g.fillRect(x - 8, h - 100, 16, 40); poly(g, [[x - 8, h - 100], [x, h - 118], [x + 8, h - 100]], f); });
            for (let x = 16; x < 156; x += 8) { g.fillStyle = 'rgba(60,40,140,0.6)'; g.fillRect(x, h - 56, 1.6, 50); }
            for (let k = -4; k <= 4; k++) { g.fillStyle = 'rgba(60,40,140,0.5)'; g.fillRect(85 + k * 6, h - 88, 1, 26); }
            depthGround(g, 10, h, 150, 5, '#51435b', '#c3b5b7');
          }],
          sc_uk_gherkin: [80, 200, function (g, w, h, P) {
            g.beginPath(); g.moveTo(22, h); g.bezierCurveTo(4, h - 110, 20, h - 180, 40, h - 196); g.bezierCurveTo(60, h - 180, 76, h - 110, 58, h); g.closePath();
            g.fillStyle = lg(g, 10, 0, 70, 0, [[0, '#1a6a8a'], [0.5, '#7fe8ff'], [1, '#1a3a6a']]); g.fill();
            g.save(); g.clip(); g.strokeStyle = 'rgba(10,30,60,0.6)'; g.lineWidth = 1.2;
            for (let k = -12; k < 12; k++) { g.beginPath(); g.moveTo(k * 12, h); g.lineTo(k * 12 + 80, h - 200); g.stroke(); }
            g.restore();
            depthGround(g, 20, h, 40, 4, '#303342', '#8c9ca2');
          }],
          sc_uk_terrace: [180, 110, function (g, w, h, P) {
            for (let x = 0; x < w; x += 30) {
              const hh = 70 + ((x * 7) % 30);
              g.fillStyle = silFill(g, h - hh, h, x % 60 ? '#5a3a8a' : '#4a3a7a', P.bot); g.fillRect(x, h - hh, 30, hh);
              depthFace(g, x, h - hh, 30, h, 4, '#403044', '#9c8293');
              poly(g, [[x, h - hh], [x + 4, h - hh - 4], [x + 25, h - hh - 4], [x + 30, h - hh]], '#706779');
              for (let by = h - hh + 5; by < h - 12; by += 5) {
                line(g, x + 1, by, x + 25, by, 0.35, '#a27986');
                for (let bx = x + 3 + (by % 2) * 3; bx < x + 25; bx += 8) line(g, bx, by, bx, by + 4, 0.3, '#947381');
              }
              g.fillStyle = '#2a1a4a'; g.fillRect(x + 4, h - hh - 8, 6, 8); g.fillRect(x + 20, h - hh - 8, 6, 8);
              for (let y = h - hh + 8; y < h - 12; y += 14) for (let k = 0; k < 3; k++) lit(g, x + 4 + k * 9, y, 4, 8, P.win[(x + y + k) % 3]);
              g.fillStyle = ['#ff2a4a', '#2a8a5a', '#2a4ab8'][(x / 30) % 3]; g.fillRect(x + 12, h - 12, 6, 12);
              poly(g, [[x + 10, h - 3], [x + 18, h - 3], [x + 22, h], [x + 8, h]], '#ad949e');
            }
            depthGround(g, 0, h, w, 2, '#30283c', '#aa949c');
          }],
          sc_uk_tbridge: [240, 120, function (g, w, h, P) { towerBridge(g, 0, 240, h, P); }],
          sc_uk_shard: [60, 210, function (g, w, h, P) { shard(g, 30, h, 1.45, P); }]
        };
  };

  content.parts['SC_EXTRA_uksouth'] = function (C) {
    const { depthFace, depthGround, ell, lit, poly, silFill, txt } = C;

    return {
          sc_uk_buckingham: [240, 110, function (g, w, h, P) {
            const f = silFill(g, h - 80, h, '#d8d0f0', '#6a5ab0');
            g.fillStyle = f; g.fillRect(6, h - 56, 228, 56); g.fillRect(90, h - 66, 60, 66);
            depthFace(g, 6, h - 56, 228, h, 8, '#807287', '#ddd1d1');
            depthFace(g, 90, h - 66, 60, h, 6, '#8f7e94', '#e6d9d3');
            poly(g, [[86, h - 66], [120, h - 78], [154, h - 66]], f);
            for (let x = 94; x < 148; x += 7) { g.fillStyle = '#ffffff'; g.fillRect(x, h - 62, 2.4, 40); }
            for (let y = h - 50; y < h - 8; y += 14) for (let x = 12; x < 228; x += 10) { if (x > 88 && x < 152) continue; lit(g, x, y, 5, 9, P.win[(x + y) % 3]); }
            g.fillStyle = '#14082a'; g.fillRect(119.4, h - 96, 1.2, 18); g.fillStyle = '#c8102e'; g.fillRect(120.6, h - 96, 14, 9); g.fillStyle = '#ffd23f'; g.fillRect(124, h - 94, 6, 5); g.fillStyle = '#2a4ab8'; g.fillRect(126, h - 92, 4, 2);
            [24, 216].forEach(function (x) { g.fillStyle = '#c8102e'; g.fillRect(x - 5, h - 18, 10, 18); poly(g, [[x - 6, h - 18], [x, h - 24], [x + 6, h - 18]], '#14082a'); g.fillStyle = '#14082a'; g.fillRect(x - 2, h - 15, 4, 6); });
            g.fillStyle = '#ffd23f'; g.fillRect(118, h - 14, 4, 14); ell(g, 120, h - 18, 3, 4, '#ffd23f');
            g.fillStyle = '#14082a'; for (let x = 0; x < w; x += 4) g.fillRect(x, h - 8, 0.8, 8); g.fillRect(0, h - 8, w, 0.8);
            depthGround(g, 0, h, w, 3, '#3f354a', '#b7a8b0');
          }],
          sc_uk_towerldn: [170, 140, function (g, w, h, P) {
            const f = silFill(g, h - 120, h, '#e0d8f8', '#6a5ab0');
            g.fillStyle = '#6a5a9a'; g.fillRect(0, h - 40, 170, 40); for (let x = 0; x < 170; x += 8) g.fillRect(x, h - 44, 5, 4);
            g.fillStyle = f; g.fillRect(40, h - 100, 90, 100);
            depthFace(g, 40, h - 100, 90, h, 8, '#796986', '#cfc4d0');
            [[40, 1], [130, 0], [40, 0], [130, 1]].slice(0, 4).forEach(function (t, i) { const tx = i < 2 ? (i === 0 ? 44 : 126) : (i === 2 ? 70 : 100); g.fillStyle = f; g.fillRect(tx - 7, h - 122, 14, 22); if (i === 0 || i === 1) { g.beginPath(); g.ellipse(tx, h - 122, 7, 8, 0, Math.PI, 0); g.fill(); g.fillStyle = '#ffd23f'; g.fillRect(tx - 0.5, h - 134, 1, 5); } else { for (let k = -6; k < 7; k += 4) g.fillRect(tx + k, h - 126, 2.6, 4); } });
            for (let x = 46; x < 128; x += 6) g.fillRect(x, h - 104, 3.6, 4);
            for (let y = h - 90; y < h - 20; y += 18) for (let x = 52; x < 122; x += 14) { g.fillStyle = '#1a0a2a'; g.beginPath(); g.ellipse(x + 2.5, y, 2.5, 3, 0, Math.PI, 0); g.fill(); lit(g, x, y, 5, 9, P.win[(x + y) % 3]); }
            txt(g, 'TOWER OF LONDON', 40, h - 12, 1, '#ffe14a', '#1a0a3a');
            depthGround(g, 0, h, w, 3, '#45374f', '#a995ac');
          }]
        };
  };

  content.parts['panoramaLandmarks_uksouth'] = function (C) {

    return ['sc_uk_bigben', 'sc_uk_eye', 'sc_uk_tbridge', 'sc_uk_shard'];
  };
})();
