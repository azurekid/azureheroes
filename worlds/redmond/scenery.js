/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['redmond'] = AH.Worlds['redmond'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { panoramaLandmarks: 6 };
  AH.ArtModules.regions['westus2'] = content;

  AH.ArtModules.stages['worlds.redmond.scenery.104'] = function (C) {
    const { RD_REGION, SC, ell, glowRect, lg, lit, msLogo, poly, rdColumbia, rdNeedle, rdRainier, rng, rrect, silFill, skyline, tree, txt } = C;

    SC[RD_REGION] = {
        sc_rd_microsoft: [200, 175, function (g, w, h, P) {
          const f = silFill(g, h - 142, h, '#8eb8ad', '#304d59');
          g.fillStyle = '#152c3e'; g.fillRect(7, h - 150, 186, 15);
          msLogo(g, 17, h - 147, 11); txt(g, 'MICROSOFT', 35, h - 143, 1, '#f5f5e9');
          g.fillStyle = f; g.fillRect(15, h - 130, 170, 130);
          const glass = lg(g, 0, h - 130, 0, h, [[0, '#8bbdb5'], [0.35, '#477a83'], [1, '#263f55']]);
          g.fillStyle = glass; g.fillRect(19, h - 126, 162, 126);
          g.strokeStyle = 'rgba(211,247,226,0.48)'; g.lineWidth = 0.7;
          for (let y = h - 122; y < h; y += 11) { g.beginPath(); g.moveTo(19, y); g.lineTo(181, y); g.stroke(); }
          for (let x = 30; x < 180; x += 15) { g.beginPath(); g.moveTo(x, h - 126); g.lineTo(x, h); g.stroke(); }
          const r = rng(701); for (let y = h - 120; y < h - 6; y += 11) for (let x = 23; x < 178; x += 15) if (r() < 0.43) lit(g, x + 3, y + 2, 6, 5, P.win[Math.floor(r() * 3)]);
          g.fillStyle = 'rgba(255,255,255,0.46)'; g.fillRect(20, h - 125, 3, 120);
          g.fillStyle = '#1c3e4c'; g.fillRect(4, h - 4, 192, 4);
        }],
        sc_rd_commons: [230, 145, function (g, w, h, P) {
          // Open campus plaza, central reflecting pool, flags and a planted perimeter.
          g.fillStyle = '#293f52'; g.fillRect(0, h - 24, 230, 24);
          g.fillStyle = '#91aa9c'; g.fillRect(4, h - 26, 222, 3);
          for (let x = 8; x < 225; x += 24) { g.fillStyle = x % 48 ? '#607d73' : '#d4cda1'; g.fillRect(x, h - 24, 12, 1); }
          ell(g, 116, h - 19, 38, 8, '#1a6072'); ell(g, 116, h - 20, 34, 5, '#5cafa3');
          g.fillStyle = '#c2d5c4'; g.fillRect(12, h - 65, 206, 3);
          for (let x = 30; x < 210; x += 44) { g.fillStyle = '#253b4c'; g.fillRect(x, h - 110, 1.5, 45); poly(g, [[x + 2, h - 108], [x + 19, h - 103], [x + 2, h - 97]], x % 3 ? '#d4b8e4' : '#e8d58a'); }
          // Low modern plaza canopy.
          g.fillStyle = '#375b60'; g.fillRect(38, h - 91, 154, 4); g.fillStyle = '#9ec8b7'; g.fillRect(38, h - 92, 154, 1);
          for (let x = 44; x < 190; x += 20) { g.fillStyle = '#435f62'; g.fillRect(x, h - 88, 2, 23); }
          txt(g, 'THE COMMONS', 72, h - 57, 1, '#eff3da', '#1d3746');
          for (let x = 12; x < 220; x += 34) tree(g, x, h - 25, 27 + (x % 3) * 3, '#27684e');
          g.fillStyle = 'rgba(240,219,168,0.38)'; g.fillRect(0, h - 5, 230, 2);
        }],
        sc_rd_building92: [190, 160, function (g, w, h, P) {
          g.fillStyle = '#213a4c'; g.fillRect(6, h - 108, 178, 108);
          g.fillStyle = '#6ca59e'; g.fillRect(10, h - 104, 170, 100);
          g.fillStyle = 'rgba(12,36,55,0.55)'; g.fillRect(10, h - 66, 170, 6);
          for (let x = 16; x < 180; x += 12) { g.fillStyle = 'rgba(218,244,224,0.42)'; g.fillRect(x, h - 100, 1, 35); g.fillRect(x, h - 55, 1, 46); }
          for (let y = h - 95; y < h - 10; y += 17) for (let x = 18; x < 174; x += 17) lit(g, x, y, 5, 7, P.win[(x + y) % 3]);
          g.fillStyle = '#132c3d'; g.fillRect(8, h - 133, 174, 22); msLogo(g, 13, h - 130, 13);
          txt(g, 'BUILDING 92', 32, h - 126, 1, '#f2f1db');
          g.fillStyle = '#b6d6c3'; g.fillRect(5, h - 4, 182, 4);
          g.fillStyle = '#35534e'; g.fillRect(73, h - 25, 43, 20); g.fillStyle = '#c4e7d4'; g.fillRect(77, h - 23, 35, 18);
          for (let x = 80; x < 112; x += 7) g.fillStyle = '#41616a', g.fillRect(x, h - 23, 1, 18);
          txt(g, 'VISITOR CENTER', 35, h - 12, 0.75, '#ecf4df');
        }],
        sc_rd_sports: [260, 140, function (g, w, h, P) {
          // New glass campus block and an adjacent cricket/soccer practice field.
          g.fillStyle = '#284959'; g.fillRect(5, h - 96, 120, 96);
          g.fillStyle = lg(g, 5, h - 96, 5, h, [[0, '#83bab2'], [1, '#28465a']]); g.fillRect(9, h - 92, 112, 92);
          g.strokeStyle = 'rgba(223,246,229,0.48)'; g.lineWidth = 0.8;
          for (let y = h - 84; y < h; y += 12) { g.beginPath(); g.moveTo(9, y); g.lineTo(121, y); g.stroke(); }
          for (let x = 18; x < 120; x += 16) { g.beginPath(); g.moveTo(x, h - 92); g.lineTo(x, h); g.stroke(); }
          for (let y = h - 84; y < h - 4; y += 17) for (let x = 15; x < 116; x += 16) if ((x + y) % 4) lit(g, x + 3, y + 2, 5, 6, P.win[(x + y) % 3]);
          // Field at foreground with white boundary and center circle.
          g.fillStyle = '#20684b'; g.fillRect(128, h - 42, 126, 31);
          g.fillStyle = '#94d479'; g.fillRect(131, h - 39, 120, 25);
          g.strokeStyle = '#e6f4ce'; g.lineWidth = 1; g.strokeRect(134, h - 37, 113, 21);
          g.beginPath(); g.moveTo(190, h - 37); g.lineTo(190, h - 16); g.stroke(); g.beginPath(); g.ellipse(190, h - 26.5, 8, 7, 0, 0, Math.PI * 2); g.stroke();
          g.strokeRect(134, h - 33, 11, 13); g.strokeRect(236, h - 33, 11, 13);
          // Cricket practice wickets and pavilion.
          g.fillStyle = '#f7eed4'; [175, 181, 187].forEach((x) => g.fillRect(x, h - 12, 1.2, 7));
          g.fillStyle = '#dae7d2'; g.fillRect(131, h - 48, 116, 5); txt(g, 'CAMPUS FIELD', 154, h - 46.5, 0.65, '#244958');
          tree(g, 10, h - 42, 40, '#1d5948'); tree(g, 251, h - 42, 34, '#28664b');
        }],
        sc_rd_needle: [100, 200, function (g, w, h, P) { rdNeedle(g, 50, h - 4, 1.5, P); }],
        sc_rd_rainier: [260, 190, function (g, w, h, P) { rdRainier(g, 130, h - 2, 1.12); for (let x = 8; x < 260; x += 24) tree(g, x, h - 1, 22 + (x % 3) * 3, '#1c5747'); }],
        sc_rd_seattle: [280, 170, function (g, w, h, P) {
          skyline(w, h, 713, '#20384f', P.accent, 45, 120, 0.25, P.win)(g);
          rdColumbia(g, 87, h - 4, 0.9, P); rdNeedle(g, 217, h - 3, 0.92, P);
          g.fillStyle = '#1c344b'; g.fillRect(0, h - 5, 280, 5);
          g.fillStyle = 'rgba(139,206,190,0.28)'; g.fillRect(0, h - 7, 280, 1);
        }],
        sc_rd_ballpark: [250, 140, function (g, w, h, P) {
          // Retractable-roof ballpark silhouette, intentionally generic and named BALLPARK.
          g.fillStyle = '#253a4e'; g.beginPath(); g.ellipse(125, h - 19, 120, 45, 0, Math.PI, 0); g.fill();
          g.fillStyle = '#617e83'; g.beginPath(); g.ellipse(125, h - 34, 112, 22, 0, Math.PI, 0); g.fill();
          g.fillStyle = '#243c4b'; g.beginPath(); g.ellipse(125, h - 39, 85, 15, 0, Math.PI, 0); g.fill();
          g.fillStyle = '#476b62'; g.beginPath(); g.ellipse(125, h - 21, 56, 17, 0, Math.PI, 0); g.fill();
          g.fillStyle = '#e5d7aa'; g.beginPath(); g.moveTo(125, h - 19); g.lineTo(59, h - 8); g.lineTo(125, h - 4); g.lineTo(191, h - 8); g.closePath(); g.fill();
          g.fillStyle = '#2c7753'; g.beginPath(); g.ellipse(125, h - 16, 41, 11, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#bfd6c0'; g.lineWidth = 1; g.beginPath(); g.ellipse(125, h - 22, 98, 16, 0, Math.PI, 0); g.stroke();
          g.fillStyle = '#b6c8b7'; g.fillRect(26, h - 61, 198, 2); for (let x = 29; x < 224; x += 12) { g.fillStyle = x % 3 ? '#304b5b' : '#455f6b'; g.fillRect(x, h - 59, 7, 24); lit(g, x + 1, h - 54, 5, 5, P.win[x % 3]); }
          txt(g, 'BALLPARK', 94, h - 70, 1, '#f0d998', '#24374b');
          g.fillStyle = '#b7d1bb'; [24, 228].forEach((x) => { g.fillRect(x, h - 84, 2, 20); g.fillRect(x - 8, h - 84, 18, 2); });
          g.fillStyle = '#f5f0d8'; g.fillRect(0, h - 4, 250, 4);
        }],
        sc_rd_stadium: [260, 165, function (g, w, h, P) {
          // Open American-football bowl with original twin arch trusses; no league marks.
          g.fillStyle = '#273d51'; g.beginPath(); g.moveTo(5, h - 5); g.lineTo(20, h - 92); g.quadraticCurveTo(130, h - 149, 240, h - 92); g.lineTo(255, h - 5); g.closePath(); g.fill();
          for (let i = 0; i < 8; i++) { const x = 26 + i * 28, y = h - 31 - Math.abs(3.5 - i) * 8; g.fillStyle = i % 2 ? '#627d80' : '#77908a'; g.fillRect(x, y, 18, 24); g.fillStyle = '#e0cf93'; g.fillRect(x, y, 18, 1); for (let j = 0; j < 3; j++) lit(g, x + 3 + j * 5, y + 5, 2, 4, P.win[(i + j) % 3]); }
          g.fillStyle = '#245b46'; g.fillRect(53, h - 15, 154, 9); g.strokeStyle = '#d8e5be'; g.lineWidth = 0.7; g.strokeRect(56, h - 14, 148, 7); g.beginPath(); g.moveTo(130, h - 14); g.lineTo(130, h - 7); g.stroke();
          g.strokeStyle = '#9fb9b1'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, h - 91); g.quadraticCurveTo(130, h - 163, 240, h - 91); g.stroke();
          g.lineWidth = 2; g.beginPath(); g.moveTo(38, h - 82); g.quadraticCurveTo(130, h - 144, 222, h - 82); g.stroke();
          g.strokeStyle = '#839f9d'; g.lineWidth = 0.7;
          for (let x = 37; x < 224; x += 12) { const t = (x - 20) / 220, y = h - 91 - Math.sin(t * Math.PI) * 72; g.beginPath(); g.moveTo(x, y); g.lineTo(x, h - 19 - Math.abs(130 - x) * 0.12); g.stroke(); }
          [20, 238].forEach((x) => { g.fillStyle = '#e6ddbd'; g.fillRect(x, h - 99, 2, 26); g.fillRect(x - 6, h - 99, 14, 2); });
          txt(g, 'STADIUM', 96, h - 50, 1, '#ecf0d9', '#1b3042');
          g.fillStyle = '#9fc4b0'; g.fillRect(0, h - 4, 260, 4);
        }],
        sc_rd_market: [190, 160, function (g, w, h, P) {
          g.fillStyle = '#385963'; g.fillRect(8, h - 98, 174, 98);
          g.fillStyle = '#a7b9a2'; g.fillRect(5, h - 103, 180, 7);
          g.fillStyle = '#274556'; g.fillRect(15, h - 89, 160, 9); txt(g, 'PUBLIC MARKET', 28, h - 87, 0.8, '#f3d876', '#263c4b');
          glowRect(g, '#ffd85a', 22, h - 93, 146, 19);
          for (let x = 20; x < 180; x += 12) { g.fillStyle = 'rgba(216,231,201,0.5)'; g.fillRect(x, h - 73, 1, 67); }
          for (let x = 23; x < 175; x += 21) { g.fillStyle = '#2b7d75'; g.fillRect(x, h - 45, 17, 27); g.fillStyle = '#e6d69d'; g.fillRect(x, h - 47, 17, 3); }
          g.fillStyle = '#a85e61'; g.fillRect(13, h - 5, 172, 5);
          for (let x = 20; x < 180; x += 10) lit(g, x, h - 34, 4, 6, P.win[(x / 10 | 0) % 3]);
          g.fillStyle = '#395c57'; g.fillRect(0, h - 115, 190, 3);
        }],
        sc_rd_coffee: [120, 100, function (g, w, h, P) {
          g.fillStyle = '#294858'; g.fillRect(7, h - 57, 106, 57); g.fillStyle = '#759e91'; g.fillRect(11, h - 54, 98, 51);
          g.fillStyle = '#1a3444'; g.fillRect(10, h - 76, 100, 18); glowRect(g, '#8ce3c2', 10, h - 76, 100, 18);
          txt(g, 'COFFEE', 26, h - 72, 1, '#f4dfaa', '#193a46');
          rrect(g, 48, h - 48, 27, 27, 3, '#eef0dc'); rrect(g, 44, h - 51, 35, 5, 1.4, '#e5d29e');
          g.strokeStyle = '#d1e8d8'; g.lineWidth = 2; g.beginPath(); g.arc(77, h - 38, 7, -1.3, 1.3); g.stroke();
          g.fillStyle = '#754c3b'; g.fillRect(53, h - 44, 17, 5); txt(g, 'JAVA', 54, h - 43, 0.55, '#f4dfb2');
          for (let x = 18; x < 105; x += 24) lit(g, x, h - 14, 13, 8, P.win[(x / 24 | 0) % 3]);
          g.fillStyle = '#203c49'; g.fillRect(0, h - 3, 120, 3);
        }],
        sc_rd_forest: [210, 190, function (g, w, h, P) {
          g.fillStyle = '#25394b'; g.fillRect(0, h - 8, 210, 8);
          for (let i = 0; i < 8; i++) {
            const x = 7 + i * 28, th = 82 + (i * 17 % 65);
            g.fillStyle = '#283d43'; g.fillRect(x + 10, h - th * 0.33, 3, th * 0.33);
            poly(g, [[x, h - th * 0.25], [x + 11, h - th * 0.63], [x + 22, h - th * 0.25]], '#194e42');
            poly(g, [[x + 1, h - th * 0.44], [x + 11, h - th * 0.81], [x + 21, h - th * 0.44]], '#1d5d49');
            poly(g, [[x + 3, h - th * 0.65], [x + 11, h - th], [x + 19, h - th * 0.65]], '#246b4c');
            g.fillStyle = 'rgba(163,218,147,0.28)'; g.fillRect(x + 10, h - th + 4, 1, th * 0.23);
          }
          g.fillStyle = '#254641'; g.fillRect(0, h - 7, 210, 1);
        }]
      };
  };

  content.parts['panoramaLandmarks_westus2'] = function (C) {

    return ['sc_rd_rainier', 'sc_rd_needle'];
  };
})();
