/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['redmond'] = AH.Worlds['redmond'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['westus2'] = content;

  AH.ArtModules.stages['worlds.redmond.sprites.100'] = function (C) {
    const { RD_REGION, SKINS, ell, eyeGlow, eyes, lg, limb, line, poly, rrect, txt } = C;

    Object.assign(C, { rdBug, rdCrow, rdBlueScreen });
    function rdBug(f) {
        return function (g) {
          const step = f ? 2 : -1;
          for (let i = 0; i < 3; i++) {
            limb(g, 9 + i * 5, 27, 5 + i * 4 + (i % 2 ? step : -step), 34, 2.3, '#153e3d', '#2ca875', '#7ce4bc');
            limb(g, 22 + i * 2, 27, 26 + i * 3 - (i % 2 ? step : -step), 34, 2.3, '#153e3d', '#2ca875', '#7ce4bc');
          }
          ell(g, 16, 23, 12, 9, lg(g, 4, 13, 28, 32, [[0, '#65d2a4'], [0.55, '#187d67'], [1, '#113f4e']]));
          g.strokeStyle = '#8cf0c4'; g.lineWidth = 0.7; g.beginPath(); g.ellipse(16, 22, 8.2, 6.2, -0.3, 0, Math.PI * 2); g.stroke();
          poly(g, [[6, 20], [3, 13], [9, 17]], '#267e67'); poly(g, [[25, 20], [29, 13], [23, 17]], '#267e67');
          line(g, 10, 15, 8, 8, 1.2, '#4cd6a0'); line(g, 22, 15, 25, 8, 1.2, '#4cd6a0');
          ell(g, 7.5, 7, 2, 2, '#ff445b'); ell(g, 25.8, 7, 2, 2, '#ff445b');
          rrect(g, 8, 19, 16, 8, 2, '#102e4c');
          txt(g, '404', 10, 20.4, 0.55, '#ff6b73');
          eyes(g, 11.6, 20.4, 17, 1.7);
          for (let x = 7; x <= 25; x += 6) line(g, x, 30, x - 2, 35, 1.3, '#54b98e');
        };
      }

    function rdCrow(f) {
        return function (g) {
          const flap = f ? -5 : 4;
          ell(g, 16, 14, 11, 6, lg(g, 5, 7, 27, 21, [[0, '#354b67'], [0.55, '#18263c'], [1, '#0c1428']]));
          poly(g, [[12, 13], [6, 9 + flap], [2, 4 + flap], [5, 16], [13, 18]], '#263b54');
          poly(g, [[17, 12], [23, 8 + flap], [29, 5 + flap], [25, 17], [17, 18]], '#41566e');
          poly(g, [[7, 17], [0.5, 20], [8, 20]], '#11192b');
          ell(g, 24, 11, 5.2, 4.3, '#263a54');
          poly(g, [[27, 10], [32, 12], [27, 14]], '#70b5ad');
          eyeGlow(g, 24.7, 9.8, 1.2, '#ff5364'); ell(g, 24.7, 9.8, 1.1, 1.1, '#ff5364');
          rrect(g, 11, 14, 12, 4, 1, '#51d1a2');
          g.fillStyle = '#e2fff0'; g.fillRect(14, 15, 5, 1); g.fillRect(16, 16.8, 4, 0.7);
          g.fillStyle = '#768ca4'; g.fillRect(15, 4, 1, 4); ell(g, 15.5, 3, 1.4, 1.4, '#a4f6df');
        };
      }

    function rdBlueScreen(f) {
        return function (g) {
          for (let i = 0; i < 4; i++) {
            const x = 7 + i * 5.5, a = (f + i) % 2 ? 2 : -2;
            limb(g, x, 15, x + a, 19, 1.8, '#244b73', '#4b8ac4', '#a8e3ff');
          }
          rrect(g, 4, 5, 25, 12, 2, lg(g, 4, 4, 29, 18, [[0, '#67b9ee'], [0.5, '#1766aa'], [1, '#103263']]));
          g.fillStyle = '#0a1e3b'; g.fillRect(7, 7, 19, 8);
          txt(g, 'ERROR', 8, 8.2, 0.55, '#a9eaff');
          line(g, 8, 16, 25, 16, 0.6, '#7ee8ff');
          eyes(g, 24, 28, 9, 1.2);
          for (let i = 0; i < 4; i++) line(g, 8 + i * 5, 17, 5 + i * 6, 20, 1.4, '#2d5a80');
          line(g, 10, 4, 7, 1, 0.8, '#65c6f4'); line(g, 23, 4, 26, 1, 0.8, '#65c6f4');
          ell(g, 7, 1, 1.1, 1.1, '#ff4c61'); ell(g, 26, 1, 1.1, 1.1, '#ff4c61');
        };
      }

    SKINS[RD_REGION] = { robot: rdBug, drone: rdCrow, spider: rdBlueScreen };
  };

  AH.ArtModules.stages['worlds.redmond.sprites.102'] = function (C) {
    const { COINS, RD_REGION } = C;

    COINS[RD_REGION] = '$';
  };
})();
