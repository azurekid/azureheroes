/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['new-york'] = AH.Worlds['new-york'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['eastus2'] = content;

  AH.ArtModules.stages['worlds.new-york.art.69'] = function (C) {
    const { lg, line, lit, poly, reg2, rrect, shade, sprayTag, txt } = C;

    reg2('ground_face_eastus2', 320, 64, function (g, w, h) {
        g.fillStyle = '#63384b'; g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 8) {
          for (let x = (y / 8 % 2 ? -8 : 0); x < w; x += 16) {
            g.fillStyle = (x + y * 3) % 48 ? '#95555a' : '#aa665e';
            g.fillRect(x + 1, y + 1, 14, 6);
            g.fillStyle = 'rgba(255,201,156,0.2)'; g.fillRect(x + 1, y + 1, 14, 1);
          }
        }
        // Storefront recesses are painted on the wall, below the collision top.
        for (const x of [3, 224]) {
          g.fillStyle = '#333b50'; g.fillRect(x, 6, 40, 51);
          g.fillStyle = '#b88e79'; g.fillRect(x, 6, 40, 3); g.fillRect(x + 2, 54, 36, 3);
          g.fillStyle = '#648294'; g.fillRect(x + 5, 12, 30, 26);
          g.fillStyle = '#29364a'; g.fillRect(x + 19, 12, 2, 26); g.fillRect(x + 5, 25, 30, 2);
          line(g, x + 7, 15, x + 15, 15, 1, '#c6e8df');
          g.fillStyle = '#d1b09a'; g.fillRect(x + 4, 41, 32, 3);
        }
        g.fillStyle = '#293446'; g.fillRect(270, 7, 42, 48);
        g.fillStyle = '#556a76'; g.fillRect(273, 10, 36, 42);
        for (let y = 13; y < 51; y += 5) line(g, 274, y, 308, y, 1, '#9aaca7');
        g.fillStyle = '#cfb092'; g.fillRect(270, 6, 42, 2);
        // Large, contrasting tags sit on the actual walking-path wall.
        poly(g, [[48, 13], [62, 6], [82, 10], [96, 6], [111, 12], [109, 39], [91, 44],
          [76, 39], [60, 44], [47, 37]], '#292843');
        poly(g, [[51, 15], [62, 9], [80, 13], [96, 9], [108, 14], [105, 35],
          [91, 40], [76, 35], [60, 40], [50, 34]], '#f05d9e');
        poly(g, [[54, 17], [64, 13], [78, 17], [96, 13], [104, 17], [101, 30],
          [90, 35], [76, 31], [62, 35], [54, 30]], '#40d6e5');
        sprayTag(g, 'NYC', 59, 17, 2.2, '#fff3cb', '#40345a');
        line(g, 58, 39, 58, 47, 2, '#f05d9e'); line(g, 100, 36, 100, 43, 2, '#40d6e5');
        poly(g, [[126, 16], [137, 8], [152, 12], [166, 8], [184, 12], [200, 8], [214, 17],
          [211, 38], [196, 43], [178, 39], [160, 43], [143, 38], [127, 42]], '#342c4c');
        poly(g, [[130, 17], [139, 12], [153, 16], [167, 12], [184, 16], [200, 12], [210, 18],
          [207, 34], [195, 38], [178, 35], [160, 39], [143, 34], [130, 38]], '#ffc75c');
        sprayTag(g, 'AZURE', 138, 19, 2.2, '#253b5a', '#f2819e');
        line(g, 136, 40, 136, 47, 2, '#ffc75c'); line(g, 197, 39, 197, 45, 2, '#ffc75c');
      }, { shade: 0, noOutline: true });

    reg2('bridge_eastus2', 160, 100, function (g) {
        g.fillStyle = lg(g, 0, 30, 0, 95, [[0, '#697882'], [1, '#24374d']]);
        g.fillRect(0, 30, 160, 10);
        g.fillStyle = '#b5c5bd'; g.fillRect(0, 27, 160, 3);
        g.fillStyle = '#39475a'; g.fillRect(0, 39, 160, 4);
        for (let x = 0; x < 160; x += 20) {
          line(g, x, 38, x + 20, 72, 2, '#536879');
          line(g, x + 20, 38, x, 72, 2, '#536879');
        }
        g.fillStyle = '#344b60'; g.fillRect(0, 70, 160, 5);
        line(g, 0, 71, 160, 71, 1, '#8a9da0');
        line(g, 0, 20, 160, 20, 2, '#bac6bb');
        for (let x = 5; x < 160; x += 10) line(g, x, 20, x, 27, 1, '#71858d');
        [16, 144].forEach((x) => {
          g.fillStyle = '#536572'; g.fillRect(x - 3, 7, 6, 23);
          g.fillStyle = '#d1c9a9'; g.fillRect(x - 4, 6, 8, 2);
          line(g, x, 10, x, 27, 1, '#aeb8ac');
        });
      }, { shade: 0.2, noOutline: true });

    reg2('boat_eastus2', 138, 44, function (g) {
        poly(g, [[3, 29], [134, 29], [126, 40], [16, 40], [7, 36]], lg(g, 0, 29, 0, 40, [[0, '#f4eee0'], [0.48, '#e2e4df'], [1, '#8e9ba5']]));
        g.fillStyle = '#d74a4e'; g.fillRect(10, 34, 116, 3); line(g, 9, 29, 132, 29, 1, '#ffffff');
        rrect(g, 24, 13, 88, 16, 2, lg(g, 0, 13, 0, 29, [[0, '#eceee6'], [1, '#aabac0']]));
        rrect(g, 34, 7, 62, 10, 1.5, '#d7e1df'); rrect(g, 39, 8, 50, 7, 1, '#183651');
        for (let x = 28; x < 109; x += 13) { rrect(g, x, 17, 9, 8, 0.8, '#19314a'); lit(g, x + 1, 18, 7, 5, '#b8dce2'); }
        g.fillStyle = '#23405c'; g.fillRect(23, 25, 90, 2);
        g.fillStyle = '#d74a4e'; g.fillRect(4, 27, 16, 5); g.fillRect(115, 27, 15, 5);
        for (let x = 32; x < 110; x += 16) line(g, x, 11, x, 5, 0.7, '#71828a');
        txt(g, 'STATEN ISLAND', 45, 37, 0.48, '#f6f0df');
        poly(g, [[1, 41], [30, 42], [58, 41], [81, 43], [111, 41], [137, 42]], 'rgba(170,221,238,0.65)');
      }, { shade: 0.25 });
  };

  content.parts['groundFace_eastus2'] = function () {
    return 'ground_face_eastus2';
  };

  AH.ArtModules.stages['worlds.new-york.art.73'] = function (C) {
    const { ell, lg, line, poly, regOb, rrect, txt } = C;

    regOb('hotdog', 64, 52, function (g) {
        g.fillStyle = '#28243a'; g.fillRect(7, 40, 50, 3); g.fillRect(12, 43, 3, 7); g.fillRect(49, 43, 3, 7);
        [13, 51].forEach(function (x) { ell(g, x, 50, 4.4, 2, '#171827'); ell(g, x, 50, 1.5, 0.8, '#b2a99b'); });
        rrect(g, 5, 25, 54, 17, 2, lg(g, 0, 25, 0, 42, [[0, '#ead7ad'], [1, '#a97d54']]));
        g.fillStyle = '#f1eee0'; g.fillRect(7, 27, 50, 10); g.fillStyle = '#d7283f'; g.fillRect(7, 37, 50, 2);
        for (let x = 7; x < 57; x += 10) { poly(g, [[x, 27], [x + 5, 27], [x + 5, 37], [x, 37]], '#c9283d'); }
        g.fillStyle = '#574238'; g.fillRect(10, 28, 2, 11); g.fillRect(52, 28, 2, 11);
        g.fillStyle = '#f6e8cd'; g.fillRect(6, 24, 52, 3); g.fillStyle = '#53413a'; g.fillRect(13, 13, 38, 12);
        g.fillStyle = '#d7283f'; g.fillRect(13, 13, 38, 2); g.fillStyle = '#f6e8cd'; g.fillRect(15, 15, 34, 8);
        txt(g, 'HOT DOGS', 18, 17, 0.7, '#c12837');
        [18, 29, 40].forEach(function (x) { rrect(g, x, 7, 2.4, 8, 0.8, '#eee6d4'); ell(g, x + 1.2, 7, 1.4, 1.4, '#ffd67a'); });
        rrect(g, 22, 31, 20, 4.4, 1.5, '#e99a39'); line(g, 24, 32, 39, 32, 1.2, '#ffdb69'); line(g, 24, 34, 36, 34, 0.8, '#c53b34');
        g.fillStyle = '#b9c9cc'; g.fillRect(47, 29, 5, 9); g.fillStyle = '#8bd5d3'; g.fillRect(48, 30, 3, 4);
      });
  };

  content.parts['SKIES_eastus2'] = function (C) {

    return { stops: [[0, '#090d2c'], [0.3, '#253b77'], [0.56, '#94618d'], [0.78, '#ef8b73'], [1, '#ffd19a']], sun: { x: 405, y: 208, r: 56, c: ['#fff8d8', '#ffc56e', '#eb6370'] }, halo: ['rgba(255,201,138,0.48)', 'rgba(255,112,139,0.18)'], cl: ['rgba(88,70,160,0.5)', 'rgba(255,146,196,0.58)', 'rgba(255,214,226,0.42)'], hz: 'rgba(255,167,133,0.42)', stars: 140, seed: 29, stripes: false };
  };

  content.parts['PAL_eastus2'] = function (C) {

    return { top: '#172c68', bot: '#744578', accent: '#ffb36b', win: ['#ffe9a0', '#98d9ff', '#ff9e86'] };
  };

  content.parts['CARS_taxi'] = function (C) {
    const { carBody, rrect, txt, wheels } = C;

    return [46, 20, function (g, w, h) { carBody(g, w, h, '#ffe14a', '#d89a10', 12, 34, 4); rrect(g, 19, 1.4, 9, 3, 1, '#14082a'); txt(g, 'TAXI', 20, 1.8, 0.4, '#ffe14a'); g.fillStyle = '#14082a'; for (let x = 4; x < 42; x += 4) g.fillRect(x, h - 8, 2, 1.2); wheels(g, [10, 36], h - 4, 4); }];
  };

  content.parts['CARS_mtabus'] = function (C) {
    const { ell, lg, lit, rrect, txt, wheels } = C;

    return [86, 30, function (g, w, h) {
          rrect(g, 1, 2, w - 2, h - 7, 3, lg(g, 0, 2, 0, h - 5, [[0, '#f4f0e2'], [0.55, '#d7e1df'], [1, '#8a9da7']]));
          g.fillStyle = '#185e9c'; g.fillRect(2, 17, w - 4, 7); g.fillStyle = '#d93645'; g.fillRect(2, 24, w - 4, 2);
          for (let x = 7; x < 77; x += 12) { rrect(g, x, 5, 9, 9, 1, '#172c46'); lit(g, x + 1, 6, 7, 6, '#a9d8e5'); }
          g.fillStyle = '#153f6e'; g.fillRect(2, 4, 5, 20); g.fillRect(77, 4, 6, 20);
          txt(g, 'MTA', 38, 18, 0.7, '#ffffff'); ell(g, 3, 20, 1.1, 1, '#fff3c4');
          wheels(g, [17, 68], h - 4, 4.5);
        }];
  };
})();
