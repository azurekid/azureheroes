/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['rio'] = AH.Worlds['rio'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { panoramaLandmarks: 4 };
  AH.ArtModules.regions['brazilsouth'] = content;

  AH.ArtModules.stages['worlds.rio.scenery.14'] = function (C) {
    const { ell, lg, lit, poly } = C;

    Object.assign(C, { corcovado, sugarloaf });
    function corcovado(g, cx, base, s, P) {
        const hill = function () { g.beginPath(); g.moveTo(cx - 120 * s, base); g.bezierCurveTo(cx - 80 * s, base - 14 * s, cx - 50 * s, base - 72 * s, cx - 8 * s, base - 82 * s); g.lineTo(cx + 8 * s, base - 82 * s); g.bezierCurveTo(cx + 50 * s, base - 72 * s, cx + 90 * s, base - 14 * s, cx + 120 * s, base); g.closePath(); };
        const top = base - 82 * s;
        const halo = g.createRadialGradient(cx, top - 28 * s, 4, cx, top - 28 * s, 60 * s); halo.addColorStop(0, 'rgba(255,255,230,0.6)'); halo.addColorStop(1, 'rgba(255,255,230,0)');
        g.fillStyle = halo; g.fillRect(cx - 60 * s, top - 90 * s, 120 * s, 120 * s);
        hill(); g.fillStyle = lg(g, 0, top, 0, base, [[0, '#2a7a4a'], [0.4, '#1a5a5a'], [1, '#2a1470']]); g.fill();
        g.save(); hill(); g.clip(); g.fillStyle = 'rgba(10,4,50,0.3)'; g.fillRect(cx + 6 * s, top, 130 * s, 90 * s); g.fillStyle = 'rgba(160,255,150,0.25)'; g.fillRect(cx - 120 * s, top, 1.4, 90 * s); g.restore();
        // Cristo Redentor
        const st = lg(g, cx - 28 * s, 0, cx + 28 * s, 0, [[0, '#ffffff'], [0.5, '#e6e0ff'], [1, '#a8a0e0']]);
        g.fillStyle = st; g.fillRect(cx - 8 * s, top - 12 * s, 16 * s, 12 * s);
        poly(g, [[cx - 4 * s, top - 14 * s], [cx - 5.4 * s, top - 42 * s], [cx + 5.4 * s, top - 42 * s], [cx + 4 * s, top - 14 * s]], st);
        poly(g, [[cx - 27 * s, top - 38 * s], [cx - 5 * s, top - 43 * s], [cx + 5 * s, top - 43 * s], [cx + 27 * s, top - 38 * s], [cx + 27 * s, top - 35 * s], [cx + 5 * s, top - 38 * s], [cx - 5 * s, top - 38 * s], [cx - 27 * s, top - 35 * s]], st);
        ell(g, cx, top - 47 * s, 3.2 * s, 3.8 * s, st);
        g.fillStyle = 'rgba(80,60,180,0.35)'; g.fillRect(cx + 1.2 * s, top - 42 * s, 3.8 * s, 28 * s);
      }

    function sugarloaf(g, cx, base, s, P) {
        g.beginPath(); g.moveTo(cx - 64 * s, base); g.bezierCurveTo(cx - 66 * s, base - 62 * s, cx - 32 * s, base - 100 * s, cx + 2 * s, base - 100 * s);
        g.bezierCurveTo(cx + 38 * s, base - 100 * s, cx + 60 * s, base - 62 * s, cx + 66 * s, base); g.closePath();
        g.fillStyle = lg(g, cx - 60 * s, 0, cx + 66 * s, 0, [[0, '#7a5ad8'], [0.55, '#4a2a9a'], [1, '#2a1470']]); g.fill();
        g.strokeStyle = 'rgba(255,150,230,0.7)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(cx - 64 * s, base); g.bezierCurveTo(cx - 66 * s, base - 62 * s, cx - 32 * s, base - 100 * s, cx + 2 * s, base - 100 * s); g.stroke();
        // Urca hill + cable car
        g.beginPath(); g.moveTo(cx - 150 * s, base); g.bezierCurveTo(cx - 140 * s, base - 40 * s, cx - 120 * s, base - 50 * s, cx - 102 * s, base - 50 * s); g.bezierCurveTo(cx - 84 * s, base - 50 * s, cx - 64 * s, base - 30 * s, cx - 60 * s, base); g.closePath();
        g.fillStyle = lg(g, 0, base - 50 * s, 0, base, [[0, '#2a7a4a'], [1, '#2a1470']]); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(cx - 102 * s, base - 52 * s); g.lineTo(cx + 2 * s, base - 101 * s); g.stroke();
        lit(g, cx - 50 * s, base - 78 * s, 5 * s, 4 * s, '#ffd23f');
      }
  };

  AH.ArtModules.stages['worlds.rio.scenery.17'] = function (C) {
    const { lerpCol, lg, lit, palms, rng } = C;

    Object.assign(C, { favelaHills });
    function favelaHills(w, h, seed) {
        return function (g) {
          const r = rng(seed);
          const hillPath = function () {
            g.beginPath(); g.moveTo(0, h);
            for (let x = 0; x <= w; x += 8) g.lineTo(x, h - 34 - 30 * Math.sin(x / w * Math.PI * 4 + 1) - 14 * Math.sin(x * 0.07));
            g.lineTo(w, h); g.closePath();
          };
          hillPath(); g.fillStyle = lg(g, 0, h - 90, 0, h, [[0, '#2a7a4a'], [1, '#14083a']]); g.fill();
          g.save(); hillPath(); g.clip();
          const cols = ['#ff7ad9', '#27e0ff', '#ffd23f', '#4dff7a', '#ff8a5a', '#b88cff'];
          for (let i = 0; i < 150; i++) {
            const x = r() * w, y = h - 90 + r() * 90, bw = 6 + r() * 7, bh = 5 + r() * 6, c = cols[Math.floor(r() * cols.length)];
            g.fillStyle = lerpCol('#1a0c4a', c, 0.45); g.fillRect(x, y, bw, bh);
            g.fillStyle = c; g.globalAlpha = 0.5; g.fillRect(x, y, bw, 1); g.globalAlpha = 1;
            if (r() > 0.4) lit(g, x + 1.6, y + 2, 1.8, 2, '#ffe9a0');
          }
          g.restore();
          palms(g, w, h, r, 9, '#0d2a30');
        };
      }
  };

  AH.ArtModules.stages['worlds.rio.scenery.25'] = function (C) {
    const { FLAT, favelaHills, reg2 } = C;

    reg2('bg_near_brazilsouth', 640, 150, favelaHills(640, 150, 97), FLAT);
  };

  AH.ArtModules.stages['worlds.rio.scenery.125'] = function (C) {
    const { SC, ell, lg, line, lit, poly, silFill, txt } = C;

    Object.assign(SC.brazilsouth, {
        sc_br_brasilia: [160, 210, function (g, w, h, P) {
          const cx = w / 2, base = h - 4, top = h - 166;
          g.fillStyle = silFill(g, top, base, '#e6d9d4', '#74526d');
          g.beginPath(); g.moveTo(cx - 58, base); g.bezierCurveTo(cx - 26, base - 42, cx - 58, top + 39, cx - 46, top); g.lineTo(cx + 46, top); g.bezierCurveTo(cx + 58, top + 39, cx + 26, base - 42, cx + 58, base); g.closePath(); g.fill();
          for (let i = 0; i <= 16; i++) {
            const a = Math.PI * i / 16, bx = cx - 58 + 116 * i / 16, tx = cx - 46 + 92 * i / 16;
            g.beginPath(); g.moveTo(bx, base); g.quadraticCurveTo(cx + Math.cos(a) * 17, base - 63, tx, top); g.strokeStyle = i % 2 ? '#f0d9ce' : P.accent; g.lineWidth = i % 2 ? 2 : 1.15; g.stroke();
          }
          g.fillStyle = '#231536'; g.fillRect(cx - 24, base - 4, 48, 4);
          ell(g, cx, top + 1, 48, 4, '#f2d9d4');
          g.fillStyle = silFill(g, h - 177, h - 163, '#d7c6d6', '#72506d'); g.fillRect(cx - 3, h - 180, 6, 14);
          poly(g, [[cx - 3, h - 180], [cx, h - 188], [cx + 3, h - 180]], P.accent);
          line(g, cx, h - 186, cx, h - 198, 1.4, P.accent); line(g, cx - 5, h - 193, cx + 5, h - 193, 1.1, P.accent);
          for (let i = 0; i < 7; i++) lit(g, cx - 21 + i * 7, base - 16, 2.2, 4, P.win[i % 3]);
        }],
        sc_br_congress: [230, 150, function (g, w, h, P) {
          const base = h - 4;
          g.fillStyle = silFill(g, h - 72, base, '#d7c9d6', '#664c72'); g.fillRect(10, h - 62, 210, 58);
          g.fillStyle = '#dacbd2'; g.fillRect(64, h - 139, 25, 77); g.fillRect(142, h - 139, 25, 77);
          g.fillStyle = '#f2d8d1'; g.fillRect(60, h - 141, 33, 3); g.fillRect(138, h - 141, 33, 3);
          for (let y = h - 128; y < h - 68; y += 12) { lit(g, 70, y, 4, 7, P.win[0]); lit(g, 79, y, 4, 7, P.win[2]); lit(g, 148, y, 4, 7, P.win[1]); lit(g, 157, y, 4, 7, P.win[0]); }
          ell(g, 112, h - 70, 38, 17, '#60445f'); ell(g, 112, h - 77, 33, 14, lg(g, 0, h - 91, 0, h - 65, [[0, '#d8b7c8'], [1, '#79536e']]));
          ell(g, 112, h - 83, 27, 9, '#241634');
          ell(g, 190, h - 70, 22, 12, '#5d4260'); ell(g, 190, h - 73, 19, 9, lg(g, 0, h - 82, 0, h - 64, [[0, '#f0d6d1'], [1, '#77506f']]));
          ell(g, 190, h - 78, 13, 5, '#251637');
          g.fillStyle = '#eee0dd'; g.fillRect(18, h - 61, 194, 2);
          for (let x = 26; x < 207; x += 15) lit(g, x, h - 48, 5, 8, P.win[(x / 15 | 0) % 3]);
          txt(g, 'BRASILIA', 91, h - 8, 0.62, '#fff0b2', '#392044');
        }],
        sc_br_iguazu: [240, 150, function (g, w, h, P) {
          const base = h - 5;
          g.fillStyle = lg(g, 0, h - 110, 0, base, [[0, '#71a35f'], [1, '#173d43']]);
          poly(g, [[0, h - 118], [28, h - 110], [51, h - 118], [76, h - 108], [101, h - 119], [128, h - 112], [154, h - 120], [179, h - 109], [205, h - 116], [240, h - 108], [240, base], [0, base]], lg(g, 0, h - 115, 0, base, [[0, '#577d5d'], [1, '#223d45']]));
          for (let i = 0; i < 7; i++) {
            const x = 15 + i * 33, top = h - 110 - (i % 3) * 4, width = 17 + (i % 2) * 5;
            g.fillStyle = lg(g, x, top, x + width, base, [[0, '#dcf8ef'], [0.35, '#72dbe1'], [1, '#236e87']]);
            g.beginPath(); g.moveTo(x, top); g.bezierCurveTo(x + 2, top + 27, x - 4, base - 34, x + 3, base); g.lineTo(x + width - 2, base); g.bezierCurveTo(x + width + 4, base - 34, x + width - 2, top + 25, x + width, top); g.closePath(); g.fill();
            ell(g, x + width / 2, top + 3, width * 0.75, 4, 'rgba(220,255,255,0.65)');
          }
          for (let i = 0; i < 26; i++) { const x = (i * 47) % 236, y = h - 26 - ((i * 31) % 90); ell(g, x, y, 1.4 + (i % 3) * 0.6, 1, i % 2 ? '#b9fff0' : '#f0f9ff'); }
          for (let x = -6; x < w + 12; x += 24) { ell(g, x, h - 121 + (x % 3) * 3, 17, 15, '#1d5244'); ell(g, x - 4, h - 127 + (x % 3) * 3, 9, 8, '#46794e'); }
          line(g, 0, h - 116, w, h - 116, 1.5, P.accent);
          txt(g, 'IGUAZU', 95, h - 8, 0.7, '#ecffff', '#18405a');
        }],
        sc_br_amazontheatre: [190, 160, function (g, w, h, P) {
          const base = h - 4;
          g.fillStyle = silFill(g, h - 88, base, '#e3b3bd', '#75476e'); g.fillRect(28, h - 80, 134, 76);
          g.fillStyle = '#f1d8d1'; g.fillRect(22, h - 86, 146, 8); g.fillRect(40, h - 93, 110, 7);
          g.fillStyle = '#d9bec7'; g.fillRect(12, h - 75, 20, 71); g.fillRect(158, h - 75, 20, 71);
          for (let x = 16; x < 177; x += 9) lit(g, x, h - 56, 4, 8, P.win[(x / 9 | 0) % 3]);
          g.beginPath(); g.moveTo(29, h - 89); g.lineTo(42, h - 120); g.quadraticCurveTo(95, h - 139, 148, h - 120); g.lineTo(162, h - 89); g.closePath();
          g.fillStyle = lg(g, 30, h - 137, 160, h - 88, [[0, '#e0cfdb'], [0.52, '#976681'], [1, '#4e3c66']]); g.fill();
          g.save(); g.beginPath(); g.moveTo(29, h - 89); g.lineTo(42, h - 120); g.quadraticCurveTo(95, h - 139, 148, h - 120); g.lineTo(162, h - 89); g.closePath(); g.clip();
          const cols = ['#e9bf69', '#e65e62', '#55b6a0', '#6576bb', '#dbd1e0'];
          for (let y = h - 132; y < h - 92; y += 8) for (let x = 37; x < 158; x += 9) { g.fillStyle = cols[((x / 9 | 0) + (y / 8 | 0)) % cols.length]; g.fillRect(x, y, 7.5, 6); }
          g.restore();
          g.strokeStyle = '#f4d794'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(29, h - 89); g.lineTo(42, h - 120); g.quadraticCurveTo(95, h - 139, 148, h - 120); g.lineTo(162, h - 89); g.stroke();
          g.fillStyle = '#251536'; g.fillRect(79, h - 42, 33, 38); poly(g, [[75, h - 42], [95, h - 61], [116, h - 42]], '#e6c6d2');
          for (let x = 85; x < 108; x += 10) lit(g, x, h - 35, 4, 8, P.win[1]);
          txt(g, 'MANAUS', 73, h - 8, 0.58, '#fff1b4', '#422141');
        }],
        sc_br_masp: [200, 125, function (g, w, h, P) {
          const base = h - 5;
          g.fillStyle = '#e15d78'; g.fillRect(18, h - 102, 164, 8); g.fillRect(27, h - 94, 10, 86); g.fillRect(163, h - 94, 10, 86);
          g.fillStyle = lg(g, 24, h - 86, 177, h - 27, [[0, '#583c78'], [0.5, '#38294e'], [1, '#251936']]); g.fillRect(24, h - 86, 153, 55);
          for (let y = h - 77; y < h - 40; y += 11) for (let x = 33; x < 170; x += 12) lit(g, x, y, 5, 6, P.win[(x + y) % 3]);
          g.fillStyle = '#f0b887'; g.fillRect(16, h - 30, 168, 5);
          g.fillStyle = '#3a294c'; g.fillRect(0, h - 25, 200, 20);
          for (let x = 5; x < 197; x += 14) { g.fillStyle = '#493251'; g.fillRect(x, h - 21, 8, 16); lit(g, x + 1, h - 20, 5, 11, P.win[(x / 14 | 0) % 3]); }
          line(g, 23, h - 90, 177, h - 90, 1.1, P.accent);
          txt(g, 'MASP', 79, h - 8, 0.72, '#fff0b2', '#351c3e');
        }],
        sc_br_ouropreto: [190, 190, function (g, w, h, P) {
          const base = h - 4;
          g.fillStyle = '#3e3a58'; g.beginPath(); g.moveTo(0, base); g.lineTo(0, h - 25); g.lineTo(36, h - 37); g.lineTo(72, h - 26); g.lineTo(109, h - 41); g.lineTo(152, h - 24); g.lineTo(w, h - 35); g.lineTo(w, base); g.closePath(); g.fill();
          g.fillStyle = silFill(g, h - 113, base, '#e9d8cd', '#815773'); g.fillRect(29, h - 106, 132, 103);
          g.fillStyle = '#d7c5c8'; g.fillRect(23, h - 112, 144, 9); g.fillRect(32, h - 119, 126, 7);
          [49, 141].forEach(function (x, i) {
            g.fillStyle = silFill(g, h - 157, h - 104, '#f0ddd0', '#8d5d77'); g.fillRect(x - 12, h - 153, 24, 49);
            poly(g, [[x - 15, h - 153], [x, h - 165], [x + 15, h - 153]], '#d7bdd0');
            ell(g, x, h - 156, 8, 5, '#28203f'); line(g, x, h - 165, x, h - 176, 1.2, P.accent);
            lit(g, x - 2, h - 149, 4, 6, P.win[i]);
          });
          poly(g, [[90, h - 119], [95, h - 143], [100, h - 119]], '#d8c0ce');
          ell(g, 95, h - 126, 7, 7, '#33203f'); ell(g, 95, h - 126, 4, 4, P.accent);
          for (let x = 43; x < 152; x += 14) { lit(g, x, h - 91, 5, 8, P.win[(x / 14 | 0) % 3]); lit(g, x, h - 72, 5, 8, P.win[(x / 14 | 0) % 3]); }
          poly(g, [[78, base], [79, h - 64], [95, h - 78], [111, h - 64], [112, base]], '#281a3e');
          for (let x = 35; x < 158; x += 18) g.fillRect(x, h - 24, 2, 18);
          txt(g, 'OURO PRETO', 62, h - 8, 0.58, '#fff0b6', '#3e2347');
        }]
      });
  };

  content.parts['panorama'] = function (C) {
    const { PAL } = C;
    const corcovado = (...args) => C.corcovado(...args);
    const lg = (...args) => C.lg(...args);
    const sugarloaf = (...args) => C.sugarloaf(...args);

    return function (g, w, h) {
    const P = PAL['brazilsouth'];
    const base = h - 6;
    
            corcovado(g, 130, base, 1.0, P);
            sugarloaf(g, 430, base, 0.9, P);
            g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, 'rgba(255,230,120,0)'], [1, 'rgba(255,230,120,0.4)']]); g.fillRect(0, h - 26, w, 26);
          
    };
  };

  content.parts['plainPanorama'] = function (C) {
    const { PAL } = C;
    const lg = (...args) => C.lg(...args);
    const poly = (...args) => C.poly(...args);

    return function (g, w, h) {
    const P = PAL['brazilsouth'];
    const base = h - 6;
    
            [[0, 120, 70], [150, 340, 95], [330, 520, 60], [480, 660, 85]].forEach(function (m) { poly(g, [[m[0], base], [(m[0] + m[1]) / 2 - 10, base - m[2]], [(m[0] + m[1]) / 2 + 12, base - m[2] + 6], [m[1], base]], '#3a1a6a'); });
            g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, 'rgba(255,230,120,0)'], [1, 'rgba(255,230,120,0.4)']]); g.fillRect(0, h - 26, w, 26);
          
    };
  };

  content.parts['MP_brazilsouth'] = function (C) {

    return { top: '#4a2a90', bot: '#7a3a9a', accent: '#d8ff80', win: ['#ffe14a', '#ff7ad9', '#7dff7a'] };
  };

  content.parts['SC_brazilsouth'] = function (C) {
    const { corcovado, favelaHills, palm, sugarloaf, txt } = C;

    return {
          sc_br_favela: [200, 140, function (g, w, h, P) { favelaHills(w, h, 601)(g, w, h); }],
          sc_br_palms: [150, 130, function (g, w, h, P) { palm(g, 25, h, 110); palm(g, 85, h, 90); palm(g, 130, h, 120); }],
          sc_br_selaron: [140, 120, function (g, w, h, P) {
            const cols = ['#ff2a4a', '#ffd23f', '#2a8aff', '#3ac84a', '#ffffff'];
            for (let s = 0; s < 10; s++) { const y = h - (s + 1) * 10, x = s * 10; g.fillStyle = cols[s % 5]; g.fillRect(x, y, 140 - x, 10); for (let k = x; k < 140; k += 5) { g.fillStyle = cols[(k / 5 + s) % 5 | 0]; g.globalAlpha = 0.6; g.fillRect(k + 0.5, y + 0.5, 4, 4); g.globalAlpha = 1; } g.fillStyle = 'rgba(10,6,30,0.35)'; g.fillRect(x, y + 8, 140 - x, 2); }
            txt(g, 'RIO', 100, h - 118, 1, '#ffffff', '#ff2a4a');
          }],
          sc_br_christ: [220, 180, function (g, w, h, P) { corcovado(g, 110, h, 0.95, P); }],
          sc_br_sugar: [260, 110, function (g, w, h, P) { sugarloaf(g, 170, h, 0.95, P); }],
          sc_br_arcos: [200, 80, function (g, w, h, P) {
            g.fillStyle = '#f0e8ff'; g.fillRect(0, h - 80, 200, 80);
            g.save(); g.globalCompositeOperation = 'destination-out';
            for (let x = 4; x < 200; x += 20) { g.beginPath(); g.ellipse(x + 8, h - 44, 7, 9, 0, Math.PI, 0); g.fill(); g.fillRect(x + 1, h - 44, 14, 44); g.beginPath(); g.ellipse(x + 8, h - 66, 5, 5, 0, Math.PI, 0); g.fill(); g.fillRect(x + 3, h - 66, 10, 12); }
            g.restore();
            g.fillStyle = '#ffd23f'; g.fillRect(0, h - 82, 200, 2);
          }]
        };
  };

  content.parts['SC_EXTRA_brazilsouth'] = function (C) {
    const { glowRect, palm, poly, silFill, txt } = C;

    return {
          sc_br_maracana: [260, 90, function (g, w, h, P) {
            g.fillStyle = silFill(g, h - 60, h, '#d8d0f0', '#6a5ab0'); g.beginPath(); g.ellipse(130, h - 10, 126, 50, 0, Math.PI, 0); g.fill(); g.fillRect(4, h - 10, 252, 10);
            g.fillStyle = '#f4ecff'; g.beginPath(); g.ellipse(130, h - 44, 120, 14, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#2a8a3a'; g.beginPath(); g.ellipse(130, h - 44, 90, 9, 0, 0, Math.PI * 2); g.fill();
            g.strokeStyle = 'rgba(60,40,140,0.6)'; g.lineWidth = 0.8; for (let x = 12; x < 250; x += 9) { g.beginPath(); g.moveTo(x, h - 32 + Math.abs(x - 130) / 8); g.lineTo(x, h); g.stroke(); }
            [30, 230].forEach(function (x) { g.fillStyle = '#14082a'; g.fillRect(x, h - 86, 2, 40); g.fillStyle = '#ffffff'; g.fillRect(x - 6, h - 90, 14, 6); glowRect(g, '#ffffff', x - 6, h - 90, 14, 6); });
            txt(g, 'MARACANA', 106, h - 22, 1, '#ffe14a', '#1a0a3a');
          }],
          sc_br_copa: [220, 70, function (g, w, h, P) {
            g.fillStyle = '#f4ecff'; g.fillRect(0, h - 10, w, 10); g.fillStyle = '#14082a';
            for (let x = 0; x < w; x += 14) { g.beginPath(); g.moveTo(x, h - 10); g.quadraticCurveTo(x + 3.5, h - 4, x + 7, h - 7); g.quadraticCurveTo(x + 10.5, h - 10, x + 14, h - 4); g.lineTo(x + 14, h); g.quadraticCurveTo(x + 10.5, h - 6, x + 7, h - 3); g.quadraticCurveTo(x + 3.5, h, x, h - 6); g.fill(); }
            [[30, '#ff2a4a'], [90, '#ffd23f'], [150, '#2a8aff'], [200, '#3ac84a']].forEach(function (u) { g.fillStyle = '#ffffff'; g.fillRect(u[0] - 0.5, h - 34, 1, 24); g.fillStyle = u[1]; g.beginPath(); g.ellipse(u[0], h - 34, 14, 6, 0, Math.PI, 0); g.fill(); });
            g.fillStyle = '#2a8a5a'; g.fillRect(110, h - 30, 22, 20); poly(g, [[106, h - 30], [121, h - 40], [136, h - 30]], '#ffd23f'); txt(g, 'COCO', 110, h - 26, 0.5, '#ffffff');
            palm(g, 60, h - 10, 56); palm(g, 176, h - 10, 64);
            txt(g, 'COPACABANA', 70, h - 62, 1, '#ffe14a', '#c8102e');
          }]
        };
  };

  content.parts['panoramaLandmarks_brazilsouth'] = function (C) {

    return ['sc_br_christ', 'sc_br_sugar'];
  };
})();
