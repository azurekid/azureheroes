/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['redmond'] = AH.Worlds['redmond'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['westus2'] = content;

  AH.ArtModules.stages['worlds.redmond.art.99'] = function (C) {
    const { FLAT, PAL, SKIES, ell, glowRect, lg, line, lit, makeSky, poly, reg2, rng, shade, skyline } = C;

    Object.assign(C, { rdRainier, rdNeedle, rdColumbia });
    const RD_REGION = 'westus2';

    const rdPal = { top: '#174d53', bot: '#102d48', accent: '#55d6a1', win: ['#9df4dc', '#ffd06e', '#e7a9ff'] };

    SKIES[RD_REGION] = {
        stops: [[0, '#100b32'], [0.3, '#22265e'], [0.55, '#514477'], [0.73, '#9a5d83'], [0.88, '#dc8c82'], [1, '#f4c38e']],
        sun: { x: 470, y: 205, r: 58, c: ['#fff0c4', '#efad87', '#bd6b91'] },
        halo: ['rgba(255,195,150,0.5)', 'rgba(125,110,210,0.2)'],
        cl: ['rgba(77,105,155,0.55)', 'rgba(190,130,165,0.55)', 'rgba(200,225,230,0.45)'],
        hz: 'rgba(170,207,190,0.45)', stars: 105, seed: 29, stripes: false
      };

    reg2('bg_sky_' + RD_REGION, 640, 360, makeSky(SKIES[RD_REGION]), FLAT);

    PAL[RD_REGION] = rdPal;

    function rdRainier(g, cx, base, s) {
        const snow = '#e9f4f3', shade = '#a4c4c6';
        poly(g, [[cx - 170 * s, base], [cx - 108 * s, base - 42 * s], [cx - 68 * s, base - 93 * s], [cx - 28 * s, base - 144 * s], [cx - 8 * s, base - 151 * s], [cx + 16 * s, base - 126 * s], [cx + 56 * s, base - 101 * s], [cx + 92 * s, base - 50 * s], [cx + 165 * s, base]], '#41566d');
        poly(g, [[cx - 69 * s, base - 94 * s], [cx - 28 * s, base - 144 * s], [cx - 8 * s, base - 151 * s], [cx + 17 * s, base - 126 * s], [cx + 38 * s, base - 111 * s], [cx + 15 * s, base - 112 * s], [cx + 3 * s, base - 123 * s], [cx - 9 * s, base - 108 * s], [cx - 26 * s, base - 117 * s]], snow);
        poly(g, [[cx - 68 * s, base - 94 * s], [cx - 28 * s, base - 144 * s], [cx - 9 * s, base - 151 * s], [cx - 37 * s, base - 109 * s], [cx - 47 * s, base - 113 * s]], '#ffffff');
        poly(g, [[cx - 165 * s, base], [cx - 90 * s, base - 36 * s], [cx - 65 * s, base - 28 * s], [cx - 18 * s, base]], '#314757');
        poly(g, [[cx + 15 * s, base], [cx + 56 * s, base - 52 * s], [cx + 85 * s, base - 34 * s], [cx + 158 * s, base]], '#32495a');
        line(g, cx - 95 * s, base - 48 * s, cx - 52 * s, base - 20 * s, 1.1, 'rgba(222,246,240,0.6)');
        line(g, cx + 28 * s, base - 96 * s, cx + 74 * s, base - 52 * s, 1, 'rgba(223,244,238,0.58)');
        g.fillStyle = '#294c46'; g.fillRect(cx - 176 * s, base - 4 * s, 350 * s, 4 * s);
      }

    function rdNeedle(g, cx, base, s, P) {
        const shaft = lg(g, cx - 9 * s, 0, cx + 9 * s, 0, [[0, '#b8d5d6'], [0.48, '#5e9d9e'], [1, '#244c59']]);
        poly(g, [[cx - 3 * s, base], [cx - 5 * s, base - 91 * s], [cx - 1 * s, base - 108 * s], [cx + 2 * s, base - 108 * s], [cx + 5 * s, base - 91 * s], [cx + 3 * s, base]], shaft);
        g.fillStyle = '#264c57'; g.fillRect(cx - 13 * s, base - 92 * s, 26 * s, 2 * s);
        g.fillStyle = '#a5d7cf'; g.fillRect(cx - 10 * s, base - 94 * s, 20 * s, 2 * s);
        poly(g, [[cx - 18 * s, base - 94 * s], [cx - 12 * s, base - 104 * s], [cx + 12 * s, base - 104 * s], [cx + 18 * s, base - 94 * s]], '#4c777b');
        ell(g, cx, base - 99 * s, 11 * s, 5 * s, '#f2c99a');
        ell(g, cx, base - 100 * s, 8.5 * s, 3.8 * s, '#75aaa6');
        g.fillStyle = P.accent; g.fillRect(cx - 0.6 * s, base - 117 * s, 1.2 * s, 10 * s);
        glowRect(g, '#8ef0c4', cx - 1.5 * s, base - 118 * s, 3 * s, 2 * s);
        for (let k = -2; k <= 2; k++) { g.fillStyle = 'rgba(223,255,239,0.6)'; g.fillRect(cx + k * 3 * s, base - 91 * s, 1 * s, 8 * s); }
      }

    function rdColumbia(g, cx, base, s, P) {
        const f = lg(g, cx - 20 * s, 0, cx + 20 * s, 0, [[0, '#54818c'], [0.45, '#315a70'], [1, '#20374f']]);
        poly(g, [[cx - 18 * s, base], [cx - 13 * s, base - 114 * s], [cx - 4 * s, base - 139 * s], [cx + 5 * s, base - 139 * s], [cx + 14 * s, base - 114 * s], [cx + 19 * s, base]], f);
        g.fillStyle = '#a8d7ce'; g.fillRect(cx - 13 * s, base - 114 * s, 27 * s, 1.2 * s);
        for (let y = base - 108 * s; y < base - 8 * s; y += 9 * s) {
          g.fillStyle = 'rgba(165,220,218,0.35)'; g.fillRect(cx - (12 - (base - y) * 0.02) * s, y, (24 - (base - y) * 0.04) * s, 0.6 * s);
          if ((y / s | 0) % 3 !== 0) { lit(g, cx - 8 * s, y + 2 * s, 2.2 * s, 3.4 * s, P.win[0]); lit(g, cx + 4 * s, y + 2 * s, 2.2 * s, 3.4 * s, P.win[1]); }
        }
        g.fillStyle = '#8bc5bd'; g.fillRect(cx - 4 * s, base - 144 * s, 8 * s, 3 * s);
        g.fillStyle = '#d5eee3'; g.fillRect(cx - 0.7 * s, base - 153 * s, 1.4 * s, 9 * s);
        for (let x = cx - 9 * s; x <= cx + 9 * s; x += 6 * s) g.fillStyle = P.accent, g.fillRect(x, base - 149 * s, 1.5 * s, 2 * s);
        g.fillStyle = '#263d52'; g.fillRect(cx - 22 * s, base - 2 * s, 44 * s, 2 * s);
      }

    reg2('bg_far_' + RD_REGION, 640, 220, function (g, w, h) {
        const base = h - 4;
        skyline(w, h, 291, '#1d3454', rdPal.accent, 28, 72, 0.24, rdPal.win)(g);
        rdRainier(g, 140, base - 5, 0.77);
        rdColumbia(g, 472, base, 0.85, rdPal);
        rdNeedle(g, 300, base, 0.9, rdPal);
        // Low Sound-facing skyline silhouettes bridge Seattle and the distant campus.
        for (let x = 14; x < 640; x += 34) {
          const bh = 22 + ((x * 7) % 29);
          g.fillStyle = '#21364e'; g.fillRect(x, base - bh, 26, bh);
          g.fillStyle = 'rgba(168,222,210,0.36)'; g.fillRect(x + 2, base - bh, 22, 0.8);
          for (let y = base - bh + 6; y < base - 4; y += 9) if ((x + y) % 3 < 1) lit(g, x + 5, y, 3, 4, rdPal.win[(x + y) % 3 | 0]);
        }
        g.fillStyle = 'rgba(240,198,154,0.16)'; g.fillRect(0, h - 28, w, 28);
      }, FLAT);

    reg2('bg_farp_' + RD_REGION, 640, 220, function (g, w, h) {
        const r = rng(329), base = h - 5;
        // Continuous, landmark-free rolling foothills with evergreen ranks.
        g.fillStyle = '#21394c'; g.beginPath(); g.moveTo(0, base - 30);
        for (let x = 0; x <= w; x += 32) g.quadraticCurveTo(x + 16, base - 44 - r() * 20, x + 32, base - 28 - r() * 14);
        g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
        g.fillStyle = '#1a3142'; g.beginPath(); g.moveTo(0, base - 10);
        for (let x = 0; x <= w; x += 24) g.quadraticCurveTo(x + 12, base - 28 - r() * 14, x + 24, base - 8 - r() * 7);
        g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
        for (let x = -6; x < w + 20; x += 13) {
          const th = 22 + r() * 28, tx = x + r() * 5;
          g.fillStyle = '#142d3a'; g.fillRect(tx + 5, base - th * 0.38, 2, th * 0.38);
          poly(g, [[tx, base - th * 0.28], [tx + 6, base - th], [tx + 12, base - th * 0.28]], r() > 0.5 ? '#1b493f' : '#1a403d');
          poly(g, [[tx + 1, base - th * 0.48], [tx + 6, base - th * 0.83], [tx + 11, base - th * 0.48]], '#205149');
        }
        // Repeated low glass campus blocks, deliberately generic and without landmark silhouettes.
        for (let x = 4; x < w; x += 92) {
          const bw = 36 + (x % 3) * 8, bh = 22 + (x % 4) * 4;
          g.fillStyle = '#294957'; g.fillRect(x, base - bh, bw, bh);
          g.fillStyle = 'rgba(119,193,184,0.55)'; g.fillRect(x + 2, base - bh + 3, bw - 4, bh - 5);
          g.fillStyle = 'rgba(17,42,58,0.75)';
          for (let wx = x + 6; wx < x + bw - 2; wx += 8) for (let wy = base - bh + 6; wy < base - 4; wy += 7) g.fillRect(wx, wy, 4, 3);
          g.fillStyle = '#a5c9b9'; g.fillRect(x, base - bh, bw, 1);
        }
        g.fillStyle = 'rgba(93,172,137,0.17)'; g.fillRect(0, h - 14, w, 14);
      }, FLAT);

    reg2('bg_near_' + RD_REGION, 640, 190, function (g, w, h) {
        const r = rng(337);
        g.fillStyle = '#101d34'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#142939'; g.beginPath(); g.moveTo(0, h - 38);
        for (let x = 0; x <= w; x += 48) g.quadraticCurveTo(x + 24, h - 56 - r() * 18, x + 48, h - 34 - r() * 8);
        g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
        for (let x = -5; x < w + 20; x += 17) {
          const hh = 35 + r() * 34;
          g.fillStyle = '#102733'; g.fillRect(x + 7, h - hh * 0.46, 2.5, hh * 0.46);
          poly(g, [[x, h - hh * 0.27], [x + 8, h - hh], [x + 16, h - hh * 0.27]], '#163d38');
          poly(g, [[x + 1, h - hh * 0.51], [x + 8, h - hh * 0.82], [x + 15, h - hh * 0.51]], '#1a4940');
        }
        g.fillStyle = 'rgba(74,203,159,0.28)'; g.fillRect(0, h - 6, w, 6);
        for (let x = 12; x < w; x += 47) lit(g, x, h - 12 - (x % 3) * 2, 1.6, 1.6, '#67e3b2');
      }, FLAT);

    Object.assign(C, { RD_REGION, rdPal });
  };

  AH.ArtModules.stages['worlds.redmond.art.101'] = function (C) {
    const { RD_REGION, regSkins } = C;

    regSkins(RD_REGION);
  };

  AH.ArtModules.stages['worlds.redmond.art.103'] = function (C) {
    const { FLAT, MP, RD_REGION, boatArt, ell, glowRect, lg, line, poly, reg2, regCoins, regOb, regWater, rng, rrect, shade, txt } = C;

    regCoins(RD_REGION);

    reg2('prop_coffee', 26, 30, function (g) {
        glowRect(g, '#8ee2c1', 2, 2, 22, 25);
        rrect(g, 4, 8, 17, 19, 2, lg(g, 4, 8, 21, 27, [[0, '#edf0e3'], [0.55, '#b9d1c5'], [1, '#698a83']]));
        rrect(g, 2, 6, 21, 4, 1.3, '#243a46');
        g.fillStyle = '#f2f1e4'; g.fillRect(6, 10, 13, 2);
        txt(g, 'COFFEE', 5, 14, 0.55, '#244d4d');
        g.fillStyle = '#7b4739'; g.fillRect(7, 22, 10, 2);
        g.strokeStyle = '#d6eee0'; g.lineWidth = 1.3; g.beginPath(); g.arc(21, 17, 4, -1.2, 1.2); g.stroke();
        g.fillStyle = '#f3d09a'; g.fillRect(10, 4, 1, 2); g.fillRect(14, 3, 1, 3);
      }, { shade: 0.4 });

    reg2('prop_mailbox', 20, 32, function (g) {
        g.fillStyle = '#46525f'; g.fillRect(9, 17, 2, 15);
        rrect(g, 2, 6, 16, 16, 4, lg(g, 2, 4, 18, 22, [[0, '#77b4e2'], [0.48, '#246da2'], [1, '#153d69']]));
        ell(g, 10, 7, 7.8, 3, '#77b4e2');
        g.fillStyle = '#c9e8f4'; g.fillRect(5, 11, 10, 1.5);
        g.fillStyle = '#f5f2df'; g.fillRect(14, 8, 2, 5); g.fillRect(14, 8, 3, 1.5);
        g.fillStyle = '#182a40'; g.fillRect(5, 16, 9, 0.7);
      }, { shade: 0.4 });

    reg2('rd_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#b7e879'], [0.28, '#60b95a'], [1, '#2e7045']]); g.fillRect(0, 0, 32, 8);
        for (let x = 0; x < 32; x += 2) { g.fillStyle = x % 4 ? 'rgba(235,255,183,0.7)' : 'rgba(31,111,59,0.75)'; g.fillRect(x, 0, 0.7, 1.2 + (x % 3) * 0.6); }
        g.fillStyle = '#254c43'; g.fillRect(0, 7, 32, 1);
      }, FLAT);

    reg2('rd', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#3c7b4a'], [0.35, '#2c6248'], [1, '#234d49']]); g.fillRect(0, 0, 32, 32);
        const r = rng(407);
        for (let i = 0; i < 20; i++) { const x = r() * 32, y = 2 + r() * 28; g.fillStyle = i % 2 ? 'rgba(144,197,107,0.38)' : 'rgba(23,66,54,0.55)'; g.fillRect(x, y, 2 + r() * 3, 0.8); }
        g.fillStyle = 'rgba(205,226,161,0.25)'; g.fillRect(0, 0, 32, 1);
      }, FLAT);

    reg2('rail_rd', 16, 12, function (g) {
        g.fillStyle = lg(g, 0, 1, 0, 11, [[0, '#3f8a53'], [0.5, '#27694b'], [1, '#17433d']]);
        g.beginPath(); g.moveTo(0, 11); g.lineTo(0, 7); g.quadraticCurveTo(3, 1, 8, 5); g.quadraticCurveTo(12, 0, 16, 6); g.lineTo(16, 11); g.closePath(); g.fill();
        g.fillStyle = 'rgba(167,217,129,0.45)'; g.fillRect(0, 9.8, 16, 0.7);
        // Campus path bollards repeat as small Microsoft-coloured beacons above the hedge.
        [[2, '#f25022'], [6, '#7fba00'], [10, '#00a4ef'], [14, '#ffb900']].forEach(function (b) {
          g.fillStyle = '#283940'; g.fillRect(b[0], 5.2, 1.5, 5.7);
          g.fillStyle = b[1]; g.fillRect(b[0] - 0.35, 4.2, 2.2, 1.6); glowRect(g, b[1], b[0] - 1.4, 3.2, 4, 3);
        });
      }, FLAT);

    regWater(RD_REGION, ['#17617b', '#071d38', '#8ccab7', '#396d67']);

    reg2('bridge_' + RD_REGION, 160, 100, function (g) {
        const deck = lg(g, 0, 30, 0, 100, [[0, '#b7c8c0'], [0.25, '#778d8d'], [1, '#344c59']]);
        // SR 520 inspired flat concrete causeway and pontoons, not a cable or arch bridge.
        g.fillStyle = deck; g.fillRect(0, 30, 160, 68);
        g.fillStyle = '#d1d9cb'; g.fillRect(0, 27, 160, 5);
        g.fillStyle = '#526e71'; g.fillRect(0, 32, 160, 1);
        g.fillStyle = '#e5eee0'; g.fillRect(0, 27, 160, 0.8);
        for (let x = 5; x < 160; x += 12) {
          g.fillStyle = '#263b49'; g.fillRect(x, 24, 1, 4);
          g.fillStyle = '#eef4da'; g.fillRect(x - 1, 22, 3, 2); glowRect(g, '#c9ef9a', x - 2, 20, 5, 5);
          g.fillStyle = 'rgba(31,54,62,0.72)'; g.fillRect(x + 3, 38, 1, 43);
        }
        for (let x = 14; x < 160; x += 24) { g.fillStyle = '#607e84'; g.fillRect(x, 55, 17, 29); g.fillStyle = '#9db9ae'; g.fillRect(x + 2, 57, 13, 1); g.fillStyle = '#162f42'; g.fillRect(x + 3, 62, 2, 19); }
        [28, 77, 126].forEach(function (x) {
          poly(g, [[x - 12, 72], [x - 9, 66], [x + 10, 66], [x + 14, 72], [x + 10, 87], [x - 8, 87]], lg(g, x - 10, 67, x + 12, 88, [[0, '#9ab8ad'], [1, '#426a70']]));
          g.fillStyle = '#b7d0bc'; g.fillRect(x - 8, 70, 17, 1);
          g.fillStyle = '#071d38'; g.fillRect(x - 5, 74, 2, 1); g.fillRect(x + 2, 74, 2, 1);
        });
        g.fillStyle = 'rgba(14,39,56,0.7)'; g.fillRect(0, 96, 160, 4);
      }, { shade: 0.2, noOutline: true });

    reg2('boat_' + RD_REGION, 120, 36, boatArt({ hull: ['#eff4ea', '#51836d'], stripe: '#178c57', cab: ['#ffffff', '#b5d5c9'], roof: '#f5f2e7', win: ['#9ed3d0', '#e9d99b'], logo: false, name: 'AZURE FERRY' }), { shade: 0.35 });

    regOb('pickup', 88, 44, function (g) {
        // Large modern US pickup, high hood, crew cab and open cargo bed.
        g.fillStyle = '#1c2736'; g.fillRect(4, 35, 80, 5);
        poly(g, [[3, 22], [9, 16], [30, 15], [39, 5], [63, 5], [72, 17], [84, 20], [86, 34], [2, 34]], lg(g, 0, 5, 0, 35, [[0, '#8fb6bd'], [0.45, '#347b85'], [1, '#193d52']]));
        poly(g, [[40, 8], [60, 8], [68, 17], [39, 17]], 'rgba(164,224,225,0.78)');
        g.fillStyle = '#193047'; g.fillRect(43, 9, 1.4, 8); g.fillRect(61, 9, 1.4, 8);
        g.fillStyle = '#627f81'; g.fillRect(7, 18, 27, 4); g.fillRect(3, 23, 33, 2);
        g.fillStyle = '#253c4a'; g.fillRect(69, 20, 13, 9); g.fillStyle = '#6e9a91'; g.fillRect(70, 21, 10, 1);
        g.fillStyle = '#eff2d5'; g.fillRect(81, 23, 3, 3); glowRect(g, '#fff0bd', 79, 21, 5, 5);
        g.fillStyle = '#d74748'; g.fillRect(3, 26, 2.2, 2.2);
        [20, 68].forEach(function (x) { ell(g, x, 35, 8, 8, '#111827'); ell(g, x, 35, 3.6, 3.6, '#a9c1bf'); ell(g, x, 35, 1.5, 1.5, '#eff2dc'); });
        g.fillStyle = '#c0d0c3'; g.fillRect(44, 31, 14, 2); g.fillStyle = '#b7d8c2'; g.fillRect(8, 27, 15, 1);
        txt(g, 'USA', 46, 26, 0.65, '#d9f5d6');
      });

    regOb('schoolbus', 96, 56, function (g) {
        rrect(g, 1, 3, 94, 47, 5, lg(g, 0, 3, 0, 50, [[0, '#ffe45c'], [0.52, '#edb728'], [1, '#a96a16']]));
        g.fillStyle = '#ffef90'; g.fillRect(3, 4, 89, 2);
        g.fillStyle = '#16283b'; g.fillRect(4, 10, 88, 13);
        for (let x = 7; x < 88; x += 12) { g.fillStyle = '#172d3f'; g.fillRect(x, 11, 10, 11); g.fillStyle = 'rgba(160,218,225,0.82)'; g.fillRect(x + 1, 12, 8, 9); g.fillStyle = '#d6f1e4'; g.fillRect(x + 2, 12, 1, 7); }
        g.fillStyle = '#f2cf45'; g.fillRect(3, 25, 90, 12);
        g.fillStyle = '#253d43'; g.fillRect(4, 26, 88, 1.3); g.fillRect(4, 35, 88, 1.3);
        txt(g, 'SCHOOL BUS', 14, 28, 0.78, '#283747');
        g.fillStyle = '#fff5c3'; g.fillRect(2, 38, 92, 3);
        g.fillStyle = '#ef4c45'; g.fillRect(2, 43, 5, 4); g.fillRect(89, 43, 5, 4);
        g.fillStyle = '#eff4d8'; g.fillRect(89, 26, 4, 5); g.fillRect(3, 26, 4, 5);
        [20, 76].forEach(function (x) { ell(g, x, 50, 7, 7, '#13202e'); ell(g, x, 50, 3, 3, '#a9b5b0'); });
        g.fillStyle = '#283848'; g.fillRect(4, 52, 88, 2);
      });

    regOb('taxi', 48, 28, function (g) {
        poly(g, [[1, 14], [8, 5], [34, 5], [43, 14], [47, 16], [47, 24], [1, 24]], lg(g, 0, 4, 0, 24, [[0, '#ffe54c'], [0.55, '#e4ad20'], [1, '#a56a11']]));
        poly(g, [[10, 7], [21, 7], [21, 14], [5, 14]], 'rgba(161,224,228,0.85)'); poly(g, [[23, 7], [33, 7], [40, 14], [23, 14]], 'rgba(161,224,228,0.82)');
        rrect(g, 19, 1.6, 11, 3.6, 1, '#e7ca55'); txt(g, 'TAXI', 20, 2.3, 0.55, '#183548');
        g.fillStyle = '#243847'; g.fillRect(3, 16, 42, 2); g.fillStyle = '#fff0a2'; g.fillRect(43, 17, 3, 2);
        [11, 37].forEach(function (x) { ell(g, x, 24, 4.6, 4.6, '#101827'); ell(g, x, 24, 2, 2, '#aababa'); });
      });

    reg2('secret_' + RD_REGION, 30, 62, function (g) {
        glowRect(g, '#6dff42', 1, 1, 28, 59);
        rrect(g, 3, 4, 24, 58, 2, lg(g, 3, 4, 27, 62, [[0, '#a5ff63'], [0.22, '#38c939'], [0.72, '#147c32'], [1, '#073a26']]));
        rrect(g, 6, 8, 18, 50, 1.5, '#0b382d');
        g.fillStyle = '#61f05c'; g.fillRect(7, 9, 16, 1.2); g.fillRect(7, 56, 16, 1.2);
        ell(g, 15, 29, 12, 12, 'rgba(91,255,73,0.22)'); ell(g, 15, 29, 9, 9, '#5fe943'); ell(g, 15, 29, 7.4, 7.4, '#158c3c');
        line(g, 10, 24, 20, 34, 2.4, '#f2fff1'); line(g, 20, 24, 10, 34, 2.4, '#f2fff1');
        g.fillStyle = '#b6ff92'; g.fillRect(14, 15, 2, 2); g.fillRect(14, 42, 2, 2); g.fillRect(6, 28, 2, 2); g.fillRect(22, 28, 2, 2);
        g.fillStyle = '#efffde'; g.fillRect(24, 39, 1.2, 1.2); glowRect(g, '#72ff5a', 22, 37, 5, 5);
        g.fillStyle = '#143626'; g.fillRect(2, 58, 26, 4);
      }, { shade: 0.3 });

    MP[RD_REGION] = { top: '#174d53', bot: '#294c58', accent: '#68dbac', win: ['#c5edcd', '#f4d28f', '#b8c5ff'] };
  };
})();
