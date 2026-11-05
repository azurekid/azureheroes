/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['paris'] = AH.Worlds['paris'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { sceneryStars: 0, panoramaLandmarks: 8 };
  AH.ArtModules.regions['francecentral'] = content;

  AH.ArtModules.stages['worlds.paris.scenery.114'] = function (C) {
    const { FR_PREFIX, depthFace, depthGround, ell, glowRect, lamp, lg, line, lit, msLogo, poly, rrect, silFill, txt, txtW } = C;

    Object.assign(C, { frEiffel, frArc, frSacre, frMontparnasse, frNotreDame, frMoulin, frWallace, frHaussmann, frCafe, frBoulang, frOffice });
    function frEiffel(g, cx, base, s, FR_PREFIX) {
        // Puddled-iron lattice: splayed legs over the great arch, two platforms, tapering spire and beacon.
        const X = function (u) { return cx + u * s; }, Y = function (v) { return base - v * s; };
        function shape() {
          g.beginPath();
          g.moveTo(X(-38), Y(0)); g.quadraticCurveTo(X(-25), Y(26), X(-21), Y(44));
          g.quadraticCurveTo(X(-14), Y(68), X(-10), Y(90)); g.quadraticCurveTo(X(-5), Y(124), X(-2.3), Y(150));
          g.lineTo(X(2.3), Y(150)); g.quadraticCurveTo(X(5), Y(124), X(10), Y(90));
          g.quadraticCurveTo(X(14), Y(68), X(21), Y(44)); g.quadraticCurveTo(X(25), Y(26), X(38), Y(0));
          g.lineTo(X(27), Y(0)); g.bezierCurveTo(X(23), Y(21), X(10), Y(30), X(0), Y(30));
          g.bezierCurveTo(X(-10), Y(30), X(-23), Y(21), X(-27), Y(0)); g.closePath();
          g.moveTo(X(13), Y(50)); g.quadraticCurveTo(X(6), Y(70), X(3), Y(86)); g.lineTo(X(-3), Y(86));
          g.quadraticCurveTo(X(-6), Y(70), X(-13), Y(50)); g.closePath();
        }
        shape(); g.fillStyle = lg(g, X(-38), 0, X(38), 0, [[0, '#4d2b4f'], [0.45, '#8a5560'], [0.7, '#a2685d'], [1, '#4a2a4c']]); g.fill('evenodd');
        g.save(); shape(); g.clip('evenodd');
        for (let k = -80; k < 80; k += 4.2) {
          line(g, X(k), Y(0), X(k + 52), Y(156), 0.55 * s, 'rgba(255,206,132,0.5)');
          line(g, X(k), Y(0), X(k - 52), Y(156), 0.55 * s, 'rgba(255,206,132,0.5)');
        }
        for (let v = 6; v < 150; v += 7) line(g, X(-40), Y(v), X(40), Y(v), 0.5 * s, 'rgba(52,26,56,0.55)');
        g.fillStyle = 'rgba(255,240,190,0.18)'; g.fillRect(X(-40), Y(160), 40 * s, 160 * s);
        g.restore();
        shape(); g.strokeStyle = '#f2c56d'; g.lineWidth = 1.1 * s; g.stroke();
        // first and second floor galleries with warm windows, top cabin and beacon
        g.fillStyle = '#3c2345'; g.fillRect(X(-25), Y(49), 50 * s, 7 * s);
        g.fillStyle = '#e8b862'; g.fillRect(X(-26), Y(49), 52 * s, 1.4 * s); g.fillRect(X(-25), Y(43), 50 * s, 1 * s);
        for (let u = -22; u < 22; u += 4) lit(g, X(u), Y(47), 1.8 * s, 2.4 * s, FR_PREFIX.win[(u + 30) % 3]);
        for (let u = -24; u <= 24; u += 3) line(g, X(u), Y(52), X(u), Y(49), 0.5 * s, '#f3d08a');
        g.fillStyle = '#3c2345'; g.fillRect(X(-13), Y(94), 26 * s, 5 * s);
        g.fillStyle = '#e8b862'; g.fillRect(X(-14), Y(94), 28 * s, 1.2 * s);
        for (let u = -11; u < 11; u += 3.5) lit(g, X(u), Y(92.6), 1.5 * s, 2 * s, FR_PREFIX.win[(Math.round(u) + 30) % 3]);
        g.fillStyle = '#4a2b4c'; g.fillRect(X(-4), Y(155), 8 * s, 7 * s);
        lit(g, X(-2.6), Y(153), 5.2 * s, 2.2 * s, '#ffe7a0');
        g.fillStyle = '#e8b862'; g.fillRect(X(-4.6), Y(155.5), 9.2 * s, 1 * s);
        line(g, X(0), Y(155), X(0), Y(170), 1 * s, '#d6a961');
        glowRect(g, '#fff3a0', X(-3), Y(172), 6 * s, 4 * s); ell(g, X(0), Y(170.5), 1.4 * s, 1.4 * s, '#fff6c4');
        // arch filigree and sparkling lights along the edges
        g.strokeStyle = 'rgba(255,220,140,0.85)'; g.lineWidth = 0.8 * s; g.beginPath();
        g.moveTo(X(-22), Y(4)); g.bezierCurveTo(X(-18), Y(20), X(-8), Y(26), X(0), Y(26)); g.bezierCurveTo(X(8), Y(26), X(18), Y(20), X(22), Y(4)); g.stroke();
        [[-33, 8], [-24, 30], [-19, 58], [-13, 80], [-8, 108], [-5, 128], [-3, 142]].forEach(function (q) {
          [-1, 1].forEach(function (sd) { ell(g, X(q[0] * sd), Y(q[1]), 0.9 * s, 0.9 * s, '#fff0b0'); });
        });
        g.fillStyle = '#2c1c3c'; g.fillRect(X(-40), Y(1.5), 16 * s, 1.5 * s); g.fillRect(X(24), Y(1.5), 16 * s, 1.5 * s);
        [-40, 24].forEach((u) => depthGround(g, X(u), base, 16 * s, 2 * s, '#362c3b', '#a88a78'));
        poly(g, [[X(0), Y(94)], [X(13), Y(94)], [X(13), Y(89)], [X(4), Y(90)]], '#51374c');
        poly(g, [[X(25), Y(49)], [X(25), Y(42)], [X(18), Y(43)], [X(18), Y(48)]], '#65424e');
      }

    function frArc(g, cx, base, s, FR_PREFIX) {
        const w = 88 * s, h = 70 * s, x = cx - w / 2, y = base - h;
        g.fillStyle = silFill(g, y, base, '#d6a86e', '#71456d');
        g.fillRect(x, y + 13 * s, w, h - 13 * s);
        depthFace(g, x, y + 13 * s, w, base, 10 * s, '#805d6b', '#d2b88a');
        poly(g, [[x - 5 * s, y + 16 * s], [cx, y - 2 * s], [x + w + 5 * s, y + 16 * s], [x + w, y + 24 * s], [x, y + 24 * s]], '#e4b96e');
        g.fillStyle = '#f1d089'; g.fillRect(x - 3 * s, y + 20 * s, w + 6 * s, 4 * s);
        g.fillStyle = '#8d526e'; g.fillRect(cx - 12 * s, y + 30 * s, 24 * s, 37 * s);
        g.fillStyle = '#261a43'; g.fillRect(cx - 7 * s, y + 36 * s, 14 * s, 31 * s);
        poly(g, [[cx + 7 * s, y + 36 * s], [cx + 12 * s, y + 30 * s], [cx + 12 * s, y + 67 * s], [cx + 7 * s, y + 67 * s]], '#a47775');
        g.fillStyle = '#f0ce84'; g.fillRect(cx - 10 * s, y + 63 * s, 20 * s, 4 * s);
        for (let i = 0; i < 7; i++) {
          const px = x + (8 + i * 12) * s;
          line(g, px, y + 24 * s, px + 2 * s, y + 31 * s, 1.2 * s, '#f6d88e');
          ell(g, px + 1 * s, y + 28 * s, 1.7 * s, 2.2 * s, i % 2 ? '#f2bd76' : '#c98375');
        }
        for (let i = 0; i < 5; i++) {
          const px = x + (7 + i * 18) * s;
          lit(g, px, y + 43 * s, 3 * s, 10 * s, FR_PREFIX.win[i % FR_PREFIX.win.length]);
        }
        line(g, x - 4 * s, base - 2 * s, x + w + 4 * s, base - 2 * s, 2 * s, '#e8c77d');
        depthGround(g, x - 4 * s, base, w + 8 * s, 2 * s, '#624855', '#d7bc93');
      }

    function frSacre(g, cx, base, s, FR_PREFIX) {
        // Montmartre butte: wooded slopes, the long white stairway and the Romano-Byzantine basilica.
        const X = function (u) { return cx + u * s; }, Y = function (v) { return base - v * s; };
        const stone = function (top, bot) { return lg(g, 0, Y(top), 0, Y(bot), [[0, '#fff9ee'], [0.6, '#ecdcd4'], [1, '#b39cb2']]); };
        function dome(dx, y0, r, h) {
          g.beginPath(); g.moveTo(X(dx - r), Y(y0));
          g.bezierCurveTo(X(dx - r), Y(y0 + h * 0.58), X(dx - r * 0.42), Y(y0 + h), X(dx), Y(y0 + h));
          g.bezierCurveTo(X(dx + r * 0.42), Y(y0 + h), X(dx + r), Y(y0 + h * 0.58), X(dx + r), Y(y0)); g.closePath();
          g.fillStyle = lg(g, X(dx - r), 0, X(dx + r), 0, [[0, '#c9b4c6'], [0.38, '#fffaf2'], [0.7, '#eadbd6'], [1, '#9f86a4']]); g.fill();
          [-0.62, -0.25, 0.12, 0.5].forEach(function (k) {
            g.strokeStyle = 'rgba(146,112,146,0.45)'; g.lineWidth = 0.6 * s; g.beginPath();
            g.moveTo(X(dx + k * r), Y(y0)); g.quadraticCurveTo(X(dx + k * r * 0.9), Y(y0 + h * 0.6), X(dx), Y(y0 + h)); g.stroke();
          });
          g.fillStyle = '#d8c6c8'; g.fillRect(X(dx - r - 0.6), Y(y0 + 0.4), (2 * r + 1.2) * s, 1.4 * s);
        }
        function lantern(dx, y0, w, h) {
          g.fillStyle = stone(y0 + h, y0); g.fillRect(X(dx - w / 2), Y(y0 + h), w * s, h * s);
          for (let u = -w / 2 + 1; u < w / 2; u += 2) line(g, X(dx + u), Y(y0 + h - 1), X(dx + u), Y(y0 + 1), 0.4 * s, '#a28aa2');
          dome(dx, y0 + h, w / 2 + 0.4, w * 0.9);
          line(g, X(dx), Y(y0 + h + w * 0.9), X(dx), Y(y0 + h + w * 0.9 + 6), 0.9 * s, '#e3c27a');
          line(g, X(dx - 1.6), Y(y0 + h + w * 0.9 + 4), X(dx + 1.6), Y(y0 + h + w * 0.9 + 4), 0.7 * s, '#e3c27a');
        }
        // the butte with trees and the stair
        g.beginPath(); g.moveTo(X(-64), Y(0)); g.quadraticCurveTo(X(-46), Y(17), X(-28), Y(22)); g.lineTo(X(28), Y(22));
        g.quadraticCurveTo(X(46), Y(17), X(64), Y(0)); g.closePath();
        g.fillStyle = lg(g, 0, Y(22), 0, Y(0), [[0, '#5f7a63'], [0.6, '#3f4f55'], [1, '#2b2442']]); g.fill();
        [[-56, 3], [-48, 8], [-40, 12], [-33, 16], [-23, 6], [-17, 12], [17, 12], [23, 6], [33, 16], [40, 12], [48, 8], [56, 3]].forEach(function (t, i) {
          ell(g, X(t[0]), Y(t[1]), 4.6 * s, 3.8 * s, i % 2 ? '#4e7656' : '#3c6150');
          ell(g, X(t[0] - 1), Y(t[1] + 1.2), 2.6 * s, 1.6 * s, 'rgba(184,214,150,0.5)');
        });
        poly(g, [[X(-9), Y(0)], [X(9), Y(0)], [X(5), Y(22)], [X(-5), Y(22)]], '#e2d3cc');
        for (let v = 2; v < 22; v += 2.2) line(g, X(-9 + v * 0.18), Y(v), X(9 - v * 0.18), Y(v), 0.5 * s, '#a58fa3');
        [-10, 10].forEach(function (u) { lamp(g, X(u), Y(0), 9 * s, '#ffd78a'); });
        // campanile behind the right flank
        g.fillStyle = stone(86, 30); g.fillRect(X(27), Y(86), 11 * s, 56 * s);
        for (let v = 40; v < 82; v += 13) { g.fillStyle = '#5a3f62'; g.fillRect(X(30), Y(v + 7), 5 * s, 7 * s); ell(g, X(32.5), Y(v + 7), 2.5 * s, 2 * s, '#5a3f62'); }
        g.fillStyle = '#d8c6c8'; g.fillRect(X(26), Y(87), 13 * s, 1.6 * s);
        lantern(32.5, 87, 9, 5);
        // nave, flanking domes and the great ovoid dome on its colonnaded drum
        g.fillStyle = stone(58, 22); g.fillRect(X(-34), Y(58), 68 * s, 36 * s);
        g.fillStyle = '#d6c4c6'; g.fillRect(X(-35), Y(58.5), 70 * s, 1.6 * s); g.fillRect(X(-34), Y(46), 68 * s, 1 * s);
        for (let u = -30; u <= 30; u += 6) if (Math.abs(u) > 18) { g.fillStyle = '#6d4c70'; g.fillRect(X(u - 1.3), Y(55), 2.6 * s, 6 * s); ell(g, X(u), Y(55), 1.3 * s, 1 * s, '#6d4c70'); }
        [-24, 24].forEach(function (dx) {
          g.fillStyle = stone(68, 58); g.fillRect(X(dx - 6.5), Y(68), 13 * s, 10 * s);
          for (let u = -5; u <= 5; u += 2.5) line(g, X(dx + u), Y(67), X(dx + u), Y(59), 0.6 * s, '#a58fa3');
          dome(dx, 68, 7.5, 15);
          lantern(dx, 83, 3.6, 3);
        });
        g.fillStyle = stone(82, 58); g.fillRect(X(-14), Y(82), 28 * s, 24 * s);
        g.fillStyle = '#d6c4c6'; g.fillRect(X(-15), Y(82.5), 30 * s, 1.8 * s); g.fillRect(X(-15), Y(71), 30 * s, 1 * s);
        for (let u = -12; u <= 12; u += 3) {
          line(g, X(u), Y(81), X(u), Y(72), 0.9 * s, '#fffaf0'); line(g, X(u + 0.9), Y(81), X(u + 0.9), Y(72), 0.6 * s, '#9e86a0');
          if (u < 12) { g.fillStyle = '#5a3f62'; g.fillRect(X(u + 1.2), Y(68), 1.4 * s, 6 * s); }
        }
        dome(0, 82, 15, 31);
        lantern(0, 113, 6, 6);
        // portico with three arches and two bronze riders
        g.fillStyle = stone(46, 22); g.fillRect(X(-19), Y(46), 38 * s, 24 * s);
        poly(g, [[X(-20), Y(46)], [X(0), Y(52)], [X(20), Y(46)]], '#f2e6df');
        g.fillStyle = '#d6c4c6'; g.fillRect(X(-20), Y(46), 40 * s, 1.2 * s);
        [-11, 0, 11].forEach(function (u) {
          g.fillStyle = '#3e2a4e'; g.fillRect(X(u - 4), Y(39), 8 * s, 17 * s); ell(g, X(u), Y(39), 4 * s, 4 * s, '#3e2a4e');
          lit(g, X(u - 2), Y(32), 4 * s, 7 * s, FR_PREFIX.win[(u + 33) % 3]);
        });
        [-23, 23].forEach(function (u) {
          g.fillStyle = '#e6d6cf'; g.fillRect(X(u - 3), Y(32), 6 * s, 10 * s);
          ell(g, X(u), Y(35), 3.2 * s, 2 * s, '#4d6e65'); line(g, X(u + (u < 0 ? 2 : -2)), Y(35), X(u + (u < 0 ? 3 : -3)), Y(39), 1.2 * s, '#4d6e65');
          ell(g, X(u), Y(38), 1.2 * s, 1.4 * s, '#5c8075');
        });
        poly(g, [[X(20), Y(46)], [X(26), Y(42)], [X(26), Y(22)], [X(20), Y(22)]], '#b49daa');
        depthGround(g, X(-28), Y(22), 56 * s, 2 * s, '#8e7e8d', '#e9d8cd');
        poly(g, [[X(-9), Y(0)], [X(-5), Y(22)], [X(-3.5), Y(22)], [X(-6), Y(0)]], '#a1929d');
      }

    function frMontparnasse(g, cx, base, s, FR_PREFIX) {
        poly(g, [[cx - 19 * s, base], [cx - 13 * s, base - 128 * s], [cx - 6 * s, base - 146 * s], [cx + 6 * s, base - 146 * s], [cx + 13 * s, base - 128 * s], [cx + 19 * s, base]], lg(g, cx - 19 * s, base - 146 * s, cx + 19 * s, base, [[0, '#675278'], [0.55, '#332748'], [1, '#1c1834']]));
        poly(g, [[cx + 6 * s, base - 146 * s], [cx + 13 * s, base - 128 * s], [cx + 19 * s, base], [cx + 10 * s, base], [cx + 6 * s, base - 128 * s]], '#241f35');
        g.fillStyle = '#e9a6ac'; g.fillRect(cx - 20 * s, base - 128 * s, 40 * s, 2.5 * s);
        for (let y = 0; y < 12; y++) for (let x = 0; x < 5; x++) lit(g, cx - 11 * s + x * 5 * s, base - 119 * s + y * 9.2 * s, 2 * s, 3.6 * s, FR_PREFIX.win[(x + y) % 3]);
        line(g, cx, base - 146 * s, cx, base - 157 * s, 1.4 * s, '#e6c57f');
        glowRect(g, '#fff0a0', cx - 2 * s, base - 160 * s, 4 * s, 3 * s);
        depthGround(g, cx - 19 * s, base, 38 * s, 3 * s, '#252034', '#918391');
      }

    function frNotreDame(g, cx, base, s, FR_PREFIX) {
        const x = cx - 56 * s, y = base - 66 * s;
        g.fillStyle = silFill(g, y, base, '#9f6b78', '#482c59'); g.fillRect(x + 3 * s, y + 30 * s, 106 * s, 36 * s);
        g.fillRect(x, y + 4 * s, 31 * s, 62 * s); g.fillRect(x + 81 * s, y + 4 * s, 31 * s, 62 * s);
        [0, 81].forEach((u) => depthFace(g, x + u * s, y + 4 * s, 31 * s, base, 5 * s, '#654956', '#c4aa96'));
        g.fillStyle = '#d6a66f'; g.fillRect(x - 2 * s, y + 27 * s, 116 * s, 4 * s);
        for (let t = 0; t < 2; t++) {
          const tx = x + 3 * s + t * 81 * s;
          g.fillRect(tx, y, 31 * s, 5 * s); g.fillRect(tx + 5 * s, y - 6 * s, 21 * s, 7 * s);
          for (let k = 0; k < 4; k++) g.fillRect(tx + (4 + k * 7) * s, y + 8 * s, 2.5 * s, 13 * s);
          ell(g, tx + 15.5 * s, y + 23 * s, 6 * s, 6 * s, '#291b45');
          ell(g, tx + 15.5 * s, y + 23 * s, 4 * s, 4 * s, '#d4a266');
          line(g, tx + 15.5 * s, y - 6 * s, tx + 15.5 * s, y - 14 * s, 1.2 * s, '#e8c679');
        }
        ell(g, cx, y + 43 * s, 11 * s, 11 * s, '#25163e'); ell(g, cx, y + 43 * s, 8.5 * s, 8.5 * s, '#c67b93');
        for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4; line(g, cx, y + 43 * s, cx + Math.cos(an) * 8 * s, y + 43 * s + Math.sin(an) * 8 * s, 1 * s, '#f3d17f'); }
        g.fillStyle = '#2c1b42'; g.fillRect(cx - 5 * s, y + 52 * s, 10 * s, 14 * s);
        for (let i = 0; i < 8; i++) lit(g, x + 8 * s + i * 14 * s, y + 35 * s, 3 * s, 8 * s, FR_PREFIX.win[i % 3]);
        depthGround(g, x, base, 112 * s, 2 * s, '#473245', '#ac9291');
      }

    function frMoulin(g, cx, base, s, FR_PREFIX) {
        // The red cabaret: bulb-lit facade and marquee, rooftop windmill with lattice sails strung with lights.
        const X = function (u) { return cx + u * s; }, Y = function (v) { return base - v * s; };
        g.fillStyle = lg(g, 0, Y(42), 0, Y(0), [[0, '#ef4c68'], [0.55, '#b3264a'], [1, '#55163a']]);
        g.fillRect(X(-50), Y(42), 100 * s, 42 * s);
        depthFace(g, X(-50), Y(42), 100 * s, base, 6 * s, '#70233c', '#ba5a63');
        g.fillStyle = '#6e1838'; g.fillRect(X(-52), Y(44), 104 * s, 3 * s);
        for (let u = -48; u <= 48; u += 4) { glowRect(g, '#ffe39a', X(u - 1.2), Y(44.6), 2.4 * s, 2.4 * s); ell(g, X(u), Y(43.4), 0.9 * s, 0.9 * s, '#fff2c0'); }
        for (let u = -44; u <= 44; u += 11) if (u < -30 || u > -6) {
          lit(g, X(u - 2.5), Y(38), 5 * s, 7 * s, FR_PREFIX.win[(u + 66) % 3]);
          g.fillStyle = '#ffd2a0'; g.fillRect(X(u - 3.2), Y(31), 6.4 * s, 0.8 * s);
        }
        // marquee sign framed by chasing bulbs
        const sw = 78, sh = 12, sy = 27;
        glowRect(g, '#ff315f', X(-sw / 2 - 2), Y(sy + 2), (sw + 4) * s, (sh + 4) * s);
        rrect(g, X(-sw / 2), Y(sy), sw * s, sh * s, 1.5 * s, '#2a0d24');
        for (let u = -sw / 2 + 2; u < sw / 2; u += 4) { ell(g, X(u), Y(sy - 0.8), 0.8 * s, 0.8 * s, '#fff1b0'); ell(g, X(u), Y(sy - sh + 0.8), 0.8 * s, 0.8 * s, '#fff1b0'); }
        const sc = Math.min(1.05 * s, (sw - 8) * s / 72);
        txt(g, 'MOULIN ROUGE', cx - txtW('MOULIN ROUGE', sc) / 2, Y(sy) + (sh * s - 7 * sc) / 2, sc, '#fff2b0', '#c11d4c');
        // entrance and posters
        g.fillStyle = '#2a0d24'; g.fillRect(X(-9), Y(13), 18 * s, 13 * s);
        g.fillStyle = lg(g, 0, Y(12), 0, Y(0), [[0, '#ffd68f'], [1, '#c4523d']]); g.fillRect(X(-7), Y(11), 14 * s, 11 * s);
        poly(g, [[X(-13), Y(13)], [X(13), Y(13)], [X(10), Y(16)], [X(-10), Y(16)]], '#ffcf7c');
        [-33, -23, 23, 33].forEach(function (u, i) {
          rrect(g, X(u - 3.5), Y(13), 7 * s, 10 * s, 0.6 * s, i % 2 ? '#ffd27a' : '#f7f0d8');
          ell(g, X(u), Y(9), 2 * s, 2.2 * s, i % 2 ? '#c63158' : '#202a5a');
          poly(g, [[X(u - 2.5), Y(6)], [X(u), Y(9)], [X(u + 2.5), Y(6)]], i % 2 ? '#202a5a' : '#c63158');
        });
        // windmill tower and conical roof
        const mx = -18;
        poly(g, [[X(mx - 10), Y(44)], [X(mx + 10), Y(44)], [X(mx + 7.5), Y(68)], [X(mx - 7.5), Y(68)]], lg(g, X(mx - 10), 0, X(mx + 10), 0, [[0, '#7c1d40'], [0.45, '#e54a68'], [1, '#6b1838']]));
        for (let v = 48; v < 66; v += 4) line(g, X(mx - 9 + (v - 44) * 0.1), Y(v), X(mx + 9 - (v - 44) * 0.1), Y(v), 0.5 * s, 'rgba(70,10,30,0.5)');
        lit(g, X(mx - 2), Y(54), 4 * s, 5 * s, '#ffe3a0');
        poly(g, [[X(mx - 10), Y(68)], [X(mx), Y(80)], [X(mx + 10), Y(68)]], lg(g, X(mx - 10), 0, X(mx + 10), 0, [[0, '#4e1630'], [0.5, '#93324f'], [1, '#3d1027']]));
        g.fillStyle = '#ffd27a'; g.fillRect(X(mx - 10.5), Y(68.4), 21 * s, 1 * s);
        const hx = X(mx + 1), hy = Y(64);
        for (let k = 0; k < 4; k++) {
          g.save(); g.translate(hx, hy); g.rotate(k * Math.PI / 2 + 0.42);
          g.fillStyle = '#5b1430'; g.fillRect(0, -0.7 * s, 33 * s, 1.4 * s);
          g.strokeStyle = '#f6d8b6'; g.lineWidth = 0.7 * s; g.strokeRect(7 * s, 0.6 * s, 25 * s, 6 * s);
          for (let j = 0; j < 7; j++) line(g, (7 + j * 4) * s, 0.6 * s, (7 + j * 4) * s, 6.6 * s, 0.5 * s, '#f0c7a8');
          line(g, 7 * s, 3.6 * s, 32 * s, 3.6 * s, 0.4 * s, '#f0c7a8');
          for (let j = 0; j < 8; j++) { glowRect(g, '#ffd86a', (7.4 + j * 3.4) * s, 6.0 * s, 1.4 * s, 1.4 * s); ell(g, (8 + j * 3.4) * s, 6.6 * s, 0.6 * s, 0.6 * s, '#fff4c0'); }
          g.restore();
        }
        ell(g, hx, hy, 3.4 * s, 3.4 * s, '#3a0d22'); ell(g, hx, hy, 2.2 * s, 2.2 * s, '#ffd978');
        depthGround(g, X(-50), base, 100 * s, 2 * s, '#382131', '#b08b83');
      }

    function frWallace(g, cx, base, s) {
        const green = '#47795d', dark = '#234840', light = '#a4bf83';
        g.fillStyle = '#c9ab73'; g.fillRect(cx - 16 * s, base - 4 * s, 32 * s, 4 * s);
        g.fillStyle = dark; g.fillRect(cx - 12 * s, base - 42 * s, 24 * s, 38 * s);
        g.fillStyle = green; g.fillRect(cx - 9 * s, base - 39 * s, 18 * s, 31 * s);
        // Four cast-iron caryatids support the domed roof.
        [-10, -4, 4, 10].forEach(function (dx, i) {
          line(g, cx + dx * s, base - 39 * s, cx + dx * s * 1.1, base - 12 * s, 1.6 * s, i % 2 ? light : green);
          ell(g, cx + dx * s, base - 40 * s, 2.2 * s, 2.6 * s, '#d6c58e');
          line(g, cx + dx * s - 2 * s, base - 35 * s, cx + dx * s + 2 * s, base - 35 * s, 0.8 * s, light);
        });
        ell(g, cx, base - 43 * s, 15 * s, 4 * s, dark);
        ell(g, cx, base - 47 * s, 12 * s, 7 * s, green);
        poly(g, [[cx - 12 * s, base - 47 * s], [cx, base - 60 * s], [cx + 12 * s, base - 47 * s]], light);
        ell(g, cx, base - 61 * s, 2.2 * s, 2.2 * s, '#e0bf6c');
        g.fillStyle = '#2c594d'; g.fillRect(cx - 5 * s, base - 23 * s, 10 * s, 11 * s);
        for (let x = -8; x <= 8; x += 16) { ell(g, cx + x * s, base - 27 * s, 1.6 * s, 1.6 * s, '#d4c184'); line(g, cx + x * s, base - 27 * s, cx + x * s, base - 21 * s, 0.8 * s, light); }
        line(g, cx - 13 * s, base - 7 * s, cx + 13 * s, base - 7 * s, 1.4 * s, light);
        depthGround(g, cx - 16 * s, base, 32 * s, 3 * s, '#6d665c', '#d4c2a1');
      }

    function frHaussmann(g, x0, base, w, FR_PREFIX) {
        // Haussmann block: limestone facades, wrought-iron balconies, zinc mansards with dormers and chimney pots.
        const stone = FR_PREFIX.stone || ['#f6e6cc', '#dcc0a6', '#8f6e83'], zinc = FR_PREFIX.zinc || ['#a9b8d0', '#6f7c9c', '#3c3f62'];
        const widths = [w * 0.36, w * 0.31, w * 0.33]; let x = x0;
        widths.forEach(function (bw, index) {
          const hh = index === 1 ? 82 : 70, top = base - hh, eave = top + 16;
          // zinc mansard and chimney stacks with terracotta pots
          [0.22, 0.74].forEach(function (f, k) {
            if (k && bw < 50) return;
            const cxp = x + bw * f;
            g.fillStyle = stone[1]; g.fillRect(cxp - 4, top - 5, 8, 10);
            g.fillStyle = stone[0]; g.fillRect(cxp - 4.6, top - 6, 9.2, 1.4);
            for (let j = 0; j < 3; j++) { g.fillStyle = '#c56f4f'; g.fillRect(cxp - 3.4 + j * 2.5, top - 9, 1.6, 3.2); g.fillStyle = '#e89a6f'; g.fillRect(cxp - 3.4 + j * 2.5, top - 9, 1.6, 0.6); }
          });
          poly(g, [[x - 1.5, eave], [x + 3, top + 3], [x + bw - 3, top + 3], [x + bw + 1.5, eave]], lg(g, 0, top + 3, 0, eave, [[0, zinc[0]], [0.5, zinc[1]], [1, zinc[2]]]));
          for (let zx = x + 3; zx < x + bw - 2; zx += 3) line(g, zx, top + 4, zx + (zx - x - bw / 2) * 0.05, eave - 1, 0.35, 'rgba(230,240,255,0.25)');
          g.fillStyle = zinc[0]; g.fillRect(x + 3, top + 2.4, bw - 6, 1);
          poly(g, [[x + bw - 8, top + 3], [x + bw - 3, top + 3], [x + bw + 1, eave], [x + bw - 5, eave]], zinc[2]);
          line(g, x + bw - 8, top + 3, x + bw - 5, eave, 0.6, zinc[0]);
          const cols = Math.max(2, Math.floor(bw / 13)), step = (bw - 8) / cols;
          for (let c = 0; c < cols; c++) {
            const wx = x + 4 + c * step + step / 2 - 2.4;
            if (c % 2 === 0) {
              g.fillStyle = stone[1]; g.fillRect(wx - 1, top + 7, 6.8, 9);
              ell(g, wx + 2.4, top + 7, 3.4, 2.4, stone[0]);
              lit(g, wx + 0.6, top + 8.6, 3.6, 5, FR_PREFIX.win[(c + index + 1) % FR_PREFIX.win.length]);
            }
          }
          // limestone facade, cornice and string courses
          g.fillStyle = lg(g, x, eave, x + bw, base, [[0, stone[0]], [0.6, stone[1]], [1, stone[2]]]);
          g.fillRect(x, eave, bw, hh - 16);
          depthFace(g, x, eave, bw, base, 5, stone[2], stone[0]);
          g.fillStyle = stone[0]; g.fillRect(x - 1.5, eave, bw + 3, 1.8);
          g.fillStyle = 'rgba(40,24,52,0.35)'; g.fillRect(x - 1, eave + 1.8, bw + 2, 1); g.fillRect(x + bw - 1, eave, 1, hh - 16);
          const rows = Math.floor((hh - 16 - 14) / 12);
          for (let row = 0; row < rows; row++) {
            const wy = eave + 4 + row * 12;
            for (let c = 0; c < cols; c++) {
              const wx = x + 4 + c * step + step / 2 - 2.4;
              lit(g, wx, wy, 4.8, 8, FR_PREFIX.win[(row + c + index) % FR_PREFIX.win.length]);
              g.fillStyle = 'rgba(52,32,60,0.55)'; g.fillRect(wx + 2.2, wy, 0.5, 8);
              g.fillStyle = stone[0]; g.fillRect(wx - 0.8, wy - 1.4, 6.4, 1.2);
            }
            if (row === 0 || row === rows - 1) {
              // continuous wrought-iron balcony
              line(g, x + 1, wy + 8, x + bw - 1, wy + 8, 0.9, '#2a1d38');
              line(g, x + 1, wy + 5.4, x + bw - 1, wy + 5.4, 0.6, '#2a1d38');
              for (let bx = x + 2; bx < x + bw - 1; bx += 1.6) line(g, bx, wy + 5.4, bx, wy + 8, 0.35, '#2a1d38');
            }
          }
          // rusticated ground floor with arched shopfronts
          const gy = base - 13;
          g.fillStyle = stone[2]; g.fillRect(x, gy, bw, 13);
          for (let ry = gy + 3; ry < base; ry += 3) line(g, x, ry, x + bw, ry, 0.35, 'rgba(255,240,220,0.18)');
          for (let c = 0; c < cols; c += 2) {
            const sx = x + 4 + c * step + step / 2 - 4;
            g.fillStyle = '#2a1a36'; g.fillRect(sx, gy + 3, 8 + (c + 1 < cols ? step : 0) * 0.5, 10);
            lit(g, sx + 1, gy + 5, 6 + (c + 1 < cols ? step : 0) * 0.5, 7, FR_PREFIX.win[(c + index) % FR_PREFIX.win.length]);
          }
          poly(g, [[x + bw - 5, eave + 2], [x + bw, eave + 5], [x + bw, base], [x + bw - 5, base]], stone[2]);
          for (let sy = eave + 13; sy < base - 10; sy += 12) line(g, x + bw - 5, sy, x + bw, sy + 2, 0.5, stone[1]);
          depthGround(g, x, base, bw, 2, '#574453', '#baa59b');
          x += bw;
        });
      }

    function frCafe(g, x, base, w, FR_PREFIX) {
        const x0 = x - w / 2;
        g.fillStyle = '#432a57'; g.fillRect(x0 + 8, base - 53, w - 16, 53);
        depthFace(g, x0 + 8, base - 53, w - 16, base, 6, '#302439', '#a48a8d');
        poly(g, [[x0 + 4, base - 43], [x0 + w - 4, base - 43], [x0 + w - 10, base - 24], [x0 + 10, base - 24]], '#e8c796');
        const stripes = Math.floor((w - 20) / 12);
        for (let i = 0; i < stripes; i++) { g.fillStyle = i % 2 ? '#f5e1c2' : '#cf5675'; g.fillRect(x0 + 10 + i * ((w - 20) / stripes), base - 42, (w - 20) / stripes, 17); }
        g.fillStyle = '#f4e3c9'; g.fillRect(x0 + 10, base - 25, w - 20, 2);
        txt(g, 'CAFE', x0 + w / 2 - 12, base - 19, 0.8, '#ffe5a7', '#241832');
        g.fillStyle = '#231831'; g.fillRect(x0 + 13, base - 15, w - 26, 15);
        for (let px = x0 + 20; px < x0 + w - 15; px += 16) lit(g, px, base - 12, 5, 9, FR_PREFIX.win[Math.floor(px) % 3]);
        g.fillStyle = '#a87a70'; g.fillRect(x0 + 14, base - 1, w - 28, 1);
        poly(g, [[x0 + w - 10, base - 43], [x0 + w - 4, base - 43], [x0 + w - 10, base - 24], [x0 + w - 15, base - 24]], '#9b6470');
        depthGround(g, x0 + 8, base, w - 16, 2, '#4b3546', '#c4a697');
      }

    function frBoulang(g, x, base, w, FR_PREFIX) {
        // Corner boulangerie: painted wooden shopfront, gold fascia, striped awning and a window full of bread.
        const x0 = x - w / 2, top = base - 128, shop = base - 64;
        const stone = FR_PREFIX.stone || ['#f6e6cc', '#dcc0a6', '#8f6e83'], zinc = FR_PREFIX.zinc || ['#a9b8d0', '#6f7c9c', '#3c3f62'];
        poly(g, [[x0 - 1, top + 16], [x0 + 4, top + 2], [x0 + w - 4, top + 2], [x0 + w + 1, top + 16]], lg(g, 0, top, 0, top + 16, [[0, zinc[0]], [1, zinc[2]]]));
        poly(g, [[x0 + w - 10, top + 2], [x0 + w - 4, top + 2], [x0 + w + 1, top + 16], [x0 + w - 6, top + 16]], zinc[2]);
        for (let c = 0; c < 4; c++) {
          const dx = x0 + 14 + c * (w - 28) / 3 - 4;
          g.fillStyle = stone[1]; g.fillRect(dx, top + 6, 8, 10); ell(g, dx + 4, top + 6, 4, 3, stone[0]);
          lit(g, dx + 1.6, top + 8, 4.8, 6, FR_PREFIX.win[c % 3]);
        }
        g.fillStyle = lg(g, 0, top + 16, 0, shop, [[0, stone[0]], [1, stone[1]]]); g.fillRect(x0, top + 16, w, shop - top - 16);
        depthFace(g, x0, top + 16, w, base, 6, stone[2], stone[0]);
        g.fillStyle = stone[0]; g.fillRect(x0 - 2, top + 16, w + 4, 2);
        for (let row = 0; row < 2; row++) for (let c = 0; c < 5; c++) {
          const wx = x0 + 10 + c * (w - 26) / 4, wy = top + 22 + row * 16;
          lit(g, wx, wy, 6, 11, FR_PREFIX.win[(row + c) % 3]);
          g.fillStyle = stone[0]; g.fillRect(wx - 1, wy - 1.6, 8, 1.4);
          line(g, wx - 2, wy + 11, wx + 8, wy + 11, 0.9, '#2a1d38');
          for (let bx = wx - 1.5; bx < wx + 8; bx += 1.5) line(g, bx, wy + 8, bx, wy + 11, 0.35, '#2a1d38');
        }
        // painted shopfront with gold lettering
        g.fillStyle = '#1d4b57'; g.fillRect(x0 + 2, shop, w - 4, 52);
        g.fillStyle = '#123540'; g.fillRect(x0 + 2, shop + 16, w - 4, 2);
        rrect(g, x0 + 5, shop + 2, w - 10, 13, 1.5, '#163e49');
        g.strokeStyle = '#e6c06a'; g.lineWidth = 0.8; g.strokeRect(x0 + 6.5, shop + 3.5, w - 13, 10);
        const sc = Math.min(1.25, (w - 22) / 66);
        txt(g, 'BOULANGERIE', x - txtW('BOULANGERIE', sc) / 2, shop + 3.6 + (10 - 7 * sc) / 2, sc, '#ffe08a', '#0b2129');
        // scalloped striped awning
        const aw = shop + 18;
        poly(g, [[x0 + 3, aw], [x0 + w - 3, aw], [x0 + w + 2, aw + 9], [x0 - 2, aw + 9]], '#f3ead8');
        const n = Math.round((w + 4) / 8);
        for (let k = 0; k < n; k++) {
          const sx = x0 - 2 + k * (w + 4) / n, sw = (w + 4) / n;
          if (k % 2 === 0) poly(g, [[sx + 2, aw], [sx + sw + 2, aw], [sx + sw, aw + 9], [sx, aw + 9]], '#2f7da0');
          ell(g, sx + sw / 2, aw + 9, sw / 2, 2.4, k % 2 ? '#f3ead8' : '#2f7da0');
        }
        // bread-filled windows either side of the door
        const door = 18, ww = (w - 16 - door) / 2, wy = aw + 13;
        [x0 + 6, x0 + 10 + ww + door].forEach(function (wx, side) {
          g.fillStyle = '#0f2c34'; g.fillRect(wx - 1, wy - 1, ww + 2, base - wy - 3);
          g.fillStyle = lg(g, 0, wy, 0, base - 6, [[0, '#ffe2a8'], [1, '#d48a4c']]); g.fillRect(wx, wy, ww, base - wy - 6);
          glowRect(g, '#ffd58a', wx, wy, ww, base - wy - 6);
          line(g, wx, wy + 8, wx + ww, wy + 8, 0.8, '#8a5a3a');
          for (let b = 0; b < 4; b++) {
            const bx = wx + 4 + b * (ww - 8) / 3;
            g.save(); g.translate(bx, wy + 4); g.rotate(-0.9 + b * 0.15);
            ell(g, 0, 0, 6, 1.6, '#c9843f'); for (let c = -3; c <= 3; c += 3) line(g, c - 0.8, -0.6, c + 0.8, 0.6, 0.5, '#f4cf8d');
            g.restore();
          }
          for (let b = 0; b < 3; b++) {
            const bx = wx + 5 + b * (ww - 10) / 2, by = wy + 13;
            ell(g, bx, by, 4, 2.4, '#d08a3e'); ell(g, bx - 0.8, by - 0.8, 2.4, 1, '#f2c27a');
            ell(g, bx + (side ? 0 : 1), by + 4.8, 3.4, 3, '#a66a34'); line(g, bx - 1.6, by + 4, bx + 1.6, by + 5, 0.5, '#e8b56d');
          }
          line(g, wx, wy + 18, wx + ww, wy + 18, 0.8, '#8a5a3a');
        });
        const dx = x - door / 2;
        g.fillStyle = '#123540'; g.fillRect(dx, wy - 2, door, base - wy + 2);
        g.fillStyle = 'rgba(255,214,150,0.75)'; g.fillRect(dx + 3, wy + 1, door - 6, 14);
        ell(g, dx + door - 4, wy + 22, 0.9, 0.9, '#e6c06a');
        g.fillStyle = '#e6c06a'; g.fillRect(x0 + 2, base - 4, w - 4, 1);
        // chalkboard
        poly(g, [[x0 + w - 14, base], [x0 + w - 10, base - 15], [x0 + w - 3, base - 15], [x0 + w + 1, base]], '#3a2a24');
        g.fillStyle = '#25302c'; g.fillRect(x0 + w - 11, base - 14, 9, 10);
        txt(g, 'PAIN', x0 + w - 10.5, base - 11, 0.32, '#f4f1e6');
        poly(g, [[x0 + w - 6, shop + 30], [x0 + w - 2, shop + 31], [x0 + w - 2, base - 4], [x0 + w - 6, base - 4]], '#173d43');
        depthGround(g, x0, base, w, 2, '#4c3a45', '#bca99c');
      }

    function frOffice(g, x, base, w, FR_PREFIX) {
        const x0 = x - w / 2, bw = Math.min(w - 12, 130), left = x - bw / 2, h = 86;
        g.fillStyle = lg(g, left, base - h, left + bw, base, [[0, '#735481'], [0.55, '#493858'], [1, '#28223b']]);
        g.fillRect(left, base - h, bw, h);
        depthFace(g, left, base - h, bw, base, 9, '#352b42', '#b99ca5');
        g.fillStyle = '#f0bc72'; g.fillRect(left, base - h, bw, 2);
        for (let row = 0; row < 5; row++) for (let col = 0; col < 9; col++) {
          const wx = left + 6 + col * ((bw - 14) / 9), wy = base - h + 8 + row * 13;
          lit(g, wx, wy, 5.6, 7.5, FR_PREFIX.win[(row + col) % 3]);
        }
        rrect(g, x - 32, base - 32, 64, 18, 2, '#fff7ed');
        msLogo(g, x - 26, base - 28, 9);
        txt(g, 'MICROSOFT', x - 14, base - 25, 0.44, '#332642');
        g.fillStyle = '#f7e8d5'; g.fillRect(x - 15, base - 9, 30, 9);
        depthGround(g, left, base, bw, 3, '#332c3c', '#bba8a7');
      }
  };

  AH.ArtModules.stages['worlds.paris.scenery.120'] = function (C) {
    const { FR_PREFIX, FR_REGION, SC, depthFace, depthGround, ell, frArc, frBoulang, frCafe, frEiffel, frHaussmann, frMoulin, frNotreDame, frOffice, frSacre, frWallace, glowRect, lamp, lg, line, poly, txt } = C;

    SC[FR_REGION] = {
        sc_fr_eiffel: [176, 200, function (g, w, h, FR_PREFIX) {
          frEiffel(g, w / 2, h - 2, 1.1, FR_PREFIX);
          // Champ-de-Mars lawn, clipped trees and lamps keep the great arch visible
          g.fillStyle = lg(g, 0, h - 9, 0, h, [[0, '#6f9a68'], [1, '#2f4a45']]); g.fillRect(0, h - 8, w, 8);
          [8, 22, 36, 140, 154, 168].forEach(function (x, i) { g.fillStyle = '#3a2a3a'; g.fillRect(x - 0.8, h - 12, 1.6, 6); ell(g, x, h - 15, 7, 5.4, i % 2 ? '#4f7a58' : '#40664f'); ell(g, x - 2, h - 17, 3, 1.8, 'rgba(190,220,150,0.45)'); });
          [56, 120].forEach(function (x) { lamp(g, x, h - 4, 18, '#ffd98a'); });
          poly(g, [[70, h], [83, h - 8], [93, h - 8], [106, h]], '#aeaa8e');
          depthGround(g, 0, h, w, 2, '#35473d', '#89916e');
        }],
        sc_fr_arc: [176, 142, function (g, w, h, FR_PREFIX) { frHaussmann(g, 0, h - 2, w, FR_PREFIX); frArc(g, w / 2, h - 2, 1.45, FR_PREFIX); }],
        sc_fr_louvre: [194, 146, function (g, w, h, FR_PREFIX) {
          frHaussmann(g, 0, h - 2, w, FR_PREFIX);
          const base = h - 30, x = w / 2;
          g.fillStyle = '#6f4a67'; g.fillRect(13, base - 59, w - 26, 57);
          depthFace(g, 13, base - 59, w - 26, base - 2, 7, '#503849', '#ba9b86');
          g.fillStyle = '#d9ad73'; g.fillRect(11, base - 62, w - 22, 4);
          for (let i = 0; i < 13; i++) { const px = 21 + i * 12; g.fillStyle = '#d6b783'; g.fillRect(px, base - 53, 2.6, 34); }
          // glass pyramid, gold frame and cool lit panes
          poly(g, [[x - 39, base], [x, base - 52], [x + 39, base]], 'rgba(106,202,210,0.55)');
          poly(g, [[x, base - 52], [x + 39, base], [x + 12, base - 6]], 'rgba(45,99,124,0.7)');
          line(g, x - 39, base, x, base - 52, 2, '#e8c778'); line(g, x + 39, base, x, base - 52, 2, '#e8c778'); line(g, x - 39, base, x + 39, base, 2, '#e8c778');
          line(g, x - 19, base, x, base - 52, 0.8, '#e4ebdf'); line(g, x + 19, base, x, base - 52, 0.8, '#e4ebdf'); line(g, x - 26, base - 17, x + 26, base - 17, 0.8, '#f5df9b');
          glowRect(g, '#83e7e5', x - 17, base - 28, 34, 22);
          poly(g, [[13, base + 2], [w - 13, base + 2], [w, h - 2], [0, h - 2]], '#a68e8c');
          for (let px = 20; px < w; px += 30) line(g, x, base + 2, px, h - 2, 0.5, '#756275');
          depthGround(g, 0, h - 2, w, 2, '#594555', '#c9b3a5');
        }],
        sc_fr_notredame: [178, 160, function (g, w, h, FR_PREFIX) { frNotreDame(g, w / 2, h - 2, 1.28, FR_PREFIX); }],
        sc_fr_sacrecoeur: [176, 180, function (g, w, h, FR_PREFIX) { frSacre(g, w / 2, h - 2, 1.32, FR_PREFIX); }],
        sc_fr_moulinrouge: [154, 148, function (g, w, h, FR_PREFIX) { frHaussmann(g, 0, h - 2, w, FR_PREFIX); frMoulin(g, w / 2, h - 2, 1.28, FR_PREFIX); }],
        sc_fr_haussmann: [210, 142, function (g, w, h, FR_PREFIX) { frHaussmann(g, 0, h - 2, w, FR_PREFIX); }],
        sc_fr_rooftops: [230, 150, function (g, w, h, FR_PREFIX) {
          // Typical Paris roofscape: a stepped back row of zinc mansards behind a front block, with a cat on the ridge.
          const back = { win: FR_PREFIX.win, stone: ['#c9a7b4', '#a17f97', '#5e4568'], zinc: ['#7f8cad', '#5b6488', '#343659'] };
          frHaussmann(g, -30, h - 30, 150, back); frHaussmann(g, 110, h - 22, 140, back);
          frHaussmann(g, 0, h - 2, w, FR_PREFIX);
          const cx = 132, cy = h - 92;
          ell(g, cx, cy, 4.6, 3, '#231a2e'); ell(g, cx + 4.4, cy - 3, 2.4, 2.2, '#231a2e');
          poly(g, [[cx + 3, cy - 4.4], [cx + 3.6, cy - 7], [cx + 4.6, cy - 4.8]], '#231a2e'); poly(g, [[cx + 5, cy - 4.6], [cx + 6, cy - 7], [cx + 6.4, cy - 4.2]], '#231a2e');
          g.strokeStyle = '#231a2e'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(cx - 4, cy); g.quadraticCurveTo(cx - 9, cy - 1, cx - 8, cy - 7); g.stroke();
          ell(g, cx + 5.2, cy - 3.2, 0.5, 0.5, '#ffe58a');
        }],
        sc_fr_cafe: [146, 130, function (g, w, h, FR_PREFIX) { frHaussmann(g, 0, h - 2, 146, FR_PREFIX); frCafe(g, 73, h - 2, 100, FR_PREFIX); }],
        sc_fr_boulangerie: [150, 140, function (g, w, h, FR_PREFIX) { frBoulang(g, 75, h - 2, 140, FR_PREFIX); }],
        sc_fr_microsoft_office: [232, 172, function (g, w, h, FR_PREFIX) { frOffice(g, w / 2, h - 2, w, FR_PREFIX); txt(g, 'ISSY', 95, h - 14, 0.38, '#d4eaff', '#201b34'); }],
        sc_fr_wallace_fountain: [104, 126, function (g, w, h) { frWallace(g, w / 2, h - 2, 1.4); lamp(g, 14, h - 2, 27, '#ffd287'); }]
      };
  };

  AH.ArtModules.stages['worlds.paris.scenery.126'] = function (C) {
    const { SC, depthFace, depthGround, ell, lg, line, lit, poly, silFill, txt } = C;

    Object.assign(SC.francecentral, {
        sc_fr_montsaintmichel: [190, 210, function (g, w, h, P) {
          const cx = w / 2, base = h - 5;
          g.fillStyle = lg(g, 0, h - 33, 0, base, [[0, '#52a8b8'], [1, '#193d60']]);
          for (let x = 0; x < w; x += 22) { line(g, x, h - 27 + (x % 3) * 2, x + 12, h - 27 + (x % 3) * 2, 0.8, 'rgba(206,246,255,0.65)'); }
          poly(g, [[cx - 71, base], [cx - 55, h - 43], [cx - 38, h - 74], [cx - 18, h - 88], [cx + 28, h - 88], [cx + 51, h - 60], [cx + 75, base]], lg(g, 0, h - 90, 0, base, [[0, '#c6a579'], [1, '#543d5f']]));
          g.fillStyle = '#d4bd9b'; g.fillRect(cx - 38, h - 102, 75, 20); g.fillRect(cx - 28, h - 119, 56, 21); g.fillRect(cx - 20, h - 139, 41, 22); g.fillRect(cx - 12, h - 159, 25, 22);
          [[-38, 102, 75, 82], [-28, 119, 56, 98], [-20, 139, 41, 117], [-12, 159, 25, 137]].forEach((q) => depthFace(g, cx + q[0], h - q[1], q[2], h - q[3], 4, '#8f7480', '#e0cab1'));
          for (let x = cx - 36; x < cx + 35; x += 12) lit(g, x, h - 96, 4, 7, P.win[(x / 12 | 0) % 3]);
          for (let x = cx - 25; x < cx + 25; x += 12) lit(g, x, h - 114, 4, 7, P.win[(x / 12 | 0) % 3]);
          for (let x = cx - 18; x < cx + 18; x += 12) lit(g, x, h - 134, 4, 7, P.win[(x / 12 | 0) % 3]);
          g.fillStyle = '#d7bd99'; g.fillRect(cx - 7, h - 171, 14, 14); poly(g, [[cx - 12, h - 171], [cx, h - 184], [cx + 12, h - 171]], '#ead4af');
          g.fillStyle = '#4c3658'; g.fillRect(cx - 5, h - 186, 10, 17); poly(g, [[cx - 7, h - 186], [cx, h - 195], [cx + 7, h - 186]], P.accent);
          line(g, cx, h - 194, cx, h - 203, 1.2, P.accent);
          line(g, cx - 60, h - 51, cx + 58, h - 51, 1.2, P.accent);
          poly(g, [[cx + 13, h - 82], [cx + 51, h - 60], [cx + 75, base], [cx + 47, base]], '#6c5364');
          depthGround(g, cx - 71, base, 146, 3, '#433445', '#b69b8a');
        }],
        sc_fr_pontdugard: [230, 140, function (g, w, h, P) {
          const base = h - 4, arch = '#a998a9';
          g.fillStyle = silFill(g, h - 108, base, '#d3b39f', '#5a4668');
          g.fillRect(10, h - 35, 210, 31); g.fillRect(18, h - 76, 194, 22); g.fillRect(28, h - 109, 174, 18);
          [[10, 35, 210, 4], [18, 76, 194, 54], [28, 109, 174, 91]].forEach((q) => depthFace(g, q[0], h - q[1], q[2], h - q[3], 4, '#725b6a', '#cdb7a1'));
          for (let i = 0; i < 6; i++) {
            const x = 10 + i * 36;
            g.fillStyle = '#281d3b'; g.beginPath(); g.ellipse(x + 15, h - 4, 15, 29, 0, Math.PI, 0); g.fill(); g.fillRect(x, h - 4, 30, 29);
            g.fillStyle = '#281d3b'; g.beginPath(); g.ellipse(x + 15, h - 54, 11, 18, 0, Math.PI, 0); g.fill(); g.fillRect(x + 4, h - 54, 22, 18);
          }
          for (let i = 0; i < 9; i++) {
            const x = 27 + i * 21;
            g.fillStyle = '#281d3b'; g.beginPath(); g.ellipse(x + 7, h - 90, 6, 9, 0, Math.PI, 0); g.fill(); g.fillRect(x + 1, h - 90, 12, 9);
          }
          g.fillStyle = arch; g.fillRect(8, h - 110, 214, 3); g.fillRect(16, h - 78, 198, 3); g.fillRect(8, h - 38, 214, 3);
          for (let x = 14; x < 222; x += 13) line(g, x, h - 109, x, h - 103, 1, P.accent);
          g.fillStyle = lg(g, 0, h - 13, 0, base, [[0, '#3796aa'], [1, '#1b3c58']]); g.fillRect(0, h - 13, w, 9);
          line(g, 0, h - 13, w, h - 13, 1.5, '#e4c58e');
          [10, 208].forEach((x) => depthGround(g, x, base, 12, 3, '#57465b', '#b6a291'));
        }],
        sc_fr_carcassonne: [220, 150, function (g, w, h, P) {
          const base = h - 4, wall = lg(g, 0, h - 94, 0, base, [[0, '#d2ae88'], [0.55, '#9a6c76'], [1, '#503d62']]);
          g.fillStyle = wall; g.fillRect(12, h - 78, 196, 74);
          depthFace(g, 12, h - 78, 196, base, 7, '#704c5e', '#c3a08d');
          for (let i = 0; i < 8; i++) {
            const x = 8 + i * 27, hh = 86 + (i % 3) * 10;
            g.fillStyle = wall; g.fillRect(x, h - hh, 19, hh);
            depthFace(g, x, h - hh, 19, base, 4, '#775362', '#d5b095');
            poly(g, [[x - 2, h - hh], [x + 9.5, h - hh - 15], [x + 21, h - hh]], '#77516d');
            g.fillStyle = '#30203e'; g.fillRect(x + 5, h - hh + 12, 8, 17); lit(g, x + 7, h - hh + 14, 4, 10, P.win[i % 3]);
            g.fillStyle = '#d2ae88'; for (let k = 0; k < 4; k++) g.fillRect(x + k * 5, h - hh + 2, 3, 4);
          }
          g.fillStyle = '#281d3b'; g.fillRect(92, h - 41, 36, 37); g.beginPath(); g.ellipse(110, h - 41, 18, 13, 0, Math.PI, 0); g.fill();
          g.fillStyle = '#bb946f'; g.fillRect(88, h - 43, 44, 4);
          for (let x = 102; x < 120; x += 10) lit(g, x, h - 32, 4, 8, P.win[(x / 10 | 0) % 3]);
          line(g, 10, h - 77, 209, h - 77, 1.4, P.accent);
          txt(g, 'CARCASSONNE', 77, h - 8, 0.55, '#fff0b1', '#3e2943');
          depthGround(g, 8, h, 208, 4, '#433044', '#a18581');
        }],
        sc_fr_chambord: [230, 160, function (g, w, h, P) {
          const base = h - 4;
          g.fillStyle = silFill(g, h - 89, base, '#e1c9bb', '#765273'); g.fillRect(14, h - 68, 202, 64);
          depthFace(g, 14, h - 68, 202, base, 7, '#896878', '#d9c6b7');
          g.fillStyle = '#d8c0b9'; g.fillRect(4, h - 77, 222, 11);
          for (let x = 20; x < 216; x += 18) { lit(g, x, h - 52, 5, 9, P.win[(x / 18 | 0) % 3]); }
          [23, 60, 99, 138, 177, 208].forEach(function (x, i) {
            const hh = [53, 78, 112, 94, 76, 55][i];
            g.fillStyle = silFill(g, h - hh, h - 65, '#d7beb7', '#795576'); g.fillRect(x - 12, h - hh + 13, 24, hh - 13);
            depthFace(g, x - 12, h - hh + 13, 24, base, 4, '#8b6578', '#dac1ae');
            poly(g, [[x - 15, h - hh + 14], [x, h - hh - 3], [x + 15, h - hh + 14]], i % 2 ? '#9a7185' : '#c69a7f');
            g.fillStyle = '#d5b9ab'; g.fillRect(x - 2, h - hh - 10, 4, 10);
            if (i % 2 === 0) lit(g, x - 2, h - hh + 24, 4, 8, P.win[i % 3]);
          });
          g.fillStyle = '#d7bca9'; g.fillRect(91, h - 122, 48, 58); poly(g, [[87, h - 122], [115, h - 150], [143, h - 122]], '#bb8c82');
          g.fillStyle = '#241a3b'; g.fillRect(108, h - 112, 14, 48); g.fillStyle = '#d9bd9e'; g.fillRect(112, h - 111, 6, 46);
          poly(g, [[108, h - 112], [115, h - 126], [122, h - 112]], P.accent);
          for (let i = 0; i < 7; i++) { const x = 49 + i * 23; poly(g, [[x, h - 65], [x + 7, h - 78], [x + 14, h - 65]], '#8c657a'); }
          line(g, 8, h - 66, 222, h - 66, 1.2, P.accent);
          depthGround(g, 4, h, 222, 4, '#574153', '#ba9f9a');
        }],
        sc_fr_strasbourg: [150, 240, function (g, w, h, P) {
          const cx = w / 2, base = h - 4;
          g.fillStyle = silFill(g, h - 108, base, '#d6c1bd', '#664a74'); g.fillRect(24, h - 93, 102, 89);
          depthFace(g, 24, h - 93, 102, base, 7, '#7b5d76', '#d2b8ab');
          g.fillStyle = '#d9c1b6'; g.fillRect(16, h - 101, 118, 9);
          for (let x = 33; x < 121; x += 14) lit(g, x, h - 78, 5, 8, P.win[(x / 14 | 0) % 3]);
          g.fillStyle = '#d7c2b9'; g.fillRect(cx - 28, h - 136, 56, 42);
          poly(g, [[cx - 44, h - 133], [cx, h - 165], [cx + 44, h - 133]], '#b88e98');
          g.fillStyle = '#31213f'; g.fillRect(cx - 8, h - 125, 16, 31); ell(g, cx, h - 130, 12, 12, '#2b1c3d'); ell(g, cx, h - 130, 8, 8, '#dda77c');
          for (let i = 0; i < 6; i++) line(g, cx - 7, h - 131 + i * 2, cx + 7, h - 131 + i * 2, 0.6, '#2b1c3d');
          g.fillStyle = lg(g, cx - 20, h - 204, cx + 20, h - 156, [[0, '#d8c7c1'], [0.5, '#9a6a87'], [1, '#473456']]);
          poly(g, [[cx - 19, h - 159], [cx - 9, h - 174], [cx - 5, h - 190], [cx - 2, h - 206], [cx + 2, h - 206], [cx + 5, h - 190], [cx + 9, h - 174], [cx + 19, h - 159]], g.fillStyle);
          for (let y = h - 178; y < h - 158; y += 6) line(g, cx - 10 + (h - y) * 0.15, y, cx + 10 - (h - y) * 0.15, y, 1.1, '#e1bf8a');
          g.fillStyle = '#d9c1ad'; g.fillRect(cx - 3, h - 212, 6, 8); line(g, cx, h - 212, cx, h - 222, 1.2, P.accent);
          line(g, 18, h - 101, 132, h - 101, 1.5, P.accent);
          depthGround(g, 16, h, 118, 4, '#4b374c', '#b5a099');
        }],
        sc_fr_provence: [240, 110, function (g, w, h, P) {
          const base = h - 4;
          g.fillStyle = lg(g, 0, h - 65, 0, base, [[0, '#92a06a'], [1, '#58475c']]); g.fillRect(0, h - 30, w, 26);
          poly(g, [[0, h - 49], [44, h - 75], [88, h - 45], [126, h - 69], [171, h - 41], [209, h - 64], [240, h - 46], [240, base], [0, base]], '#5a4764');
          for (let row = 0; row < 7; row++) {
            const y = h - 12 - row * 9, spread = row * 3;
            g.strokeStyle = row % 2 ? '#6d46a0' : '#9d71c0'; g.lineWidth = row % 2 ? 2.2 : 1.6;
            g.beginPath(); g.moveTo(8 + spread, y); g.quadraticCurveTo(116, y - 10 - row, 232 - spread, y); g.stroke();
            for (let x = 18 + row * 4; x < 228 - row * 4; x += 18) { ell(g, x + ((row * 5) % 8), y - 2, 2.3, 1.8, row % 2 ? '#c29adb' : '#9d78cc'); }
          }
          for (let x = 12; x < 235; x += 43) { g.fillStyle = '#342d48'; g.fillRect(x, h - 55 - (x % 3) * 2, 2, 27); ell(g, x + 1, h - 60 - (x % 3) * 2, 6, 8, '#465441'); }
          txt(g, 'PROVENCE', 88, h - 8, 0.62, '#fff0ba', '#372141');
          poly(g, [[12, base], [104, h - 31], [116, h - 31], [43, base]], '#9f8c79');
          depthGround(g, 0, h, w, 4, '#423a46', '#8e856b');
        }]
      });
  };

  content.parts['sceneryStars_francecentral'] = function (C) {

    return ['sc_fr_eiffel', 'sc_fr_sacrecoeur', 'sc_fr_moulinrouge'];
  };

  content.parts['panoramaLandmarks_francecentral'] = function (C) {

    return ['sc_fr_eiffel', 'sc_fr_sacrecoeur', 'sc_fr_arc'];
  };
})();
