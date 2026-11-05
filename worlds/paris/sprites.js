/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['paris'] = AH.Worlds['paris'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['francecentral'] = content;

  AH.ArtModules.stages['worlds.paris.sprites.47'] = function (C) {
    const { FBLACK, FSKIN, fPal, fighterReg, limb, rrect } = C;

    fighterReg('savate', { // Paris: savate spoofer
        fem: true, skin: FSKIN.pale, top: 'stripe', topC: fPal('#ffffff', '#ececf4', '#9a9ab0'), top2: fPal('#3a4aa0', '#1e2a70', '#0c1236'),
        sleeve: 'long', sleeveC: fPal('#3a4aa0', '#1e2a70', '#0c1236'), legs: 'tights', legC: FBLACK, feet: 'shoes', footC: fPal('#5a2a3a', '#2a0e18', '#0a0206'),
        hands: 'fingerless', handC: FBLACK, hair: 'ponytail', hairC: '#2a1810', hat: 'beret', hatC: fPal('#ff5a6a', '#d01a2a', '#6a0a12'),
        face: 'domino', glowEyes: true, accent: '#ff3aa8', browC: '#2a1810',
        front: function (g, P) {
          const hx = P.head[0], hy = P.head[1];
          rrect(g, hx - 4.4, hy + 7, 9, 2.6, 1.2, '#d01a2a'); limb(g, hx + 3, hy + 8.4, hx + 8, hy + 14, 2, '#6a0a12', '#d01a2a', null);
        }
      });
  };

  AH.ArtModules.stages['worlds.paris.sprites.58'] = function (C) {
    const { BOLT, ell, glow, lg, reg2, trail } = C;

    reg2('bolt_savate', 22, 12, function (g) {
        trail(g, 6, 'rgba(255,58,168,0.6)');
        ell(g, 8, 6, 6.4, 5.6, lg(g, 2, 0, 14, 12, [[0, '#ffffff'], [0.4, '#ff6ac8'], [1, '#a0105a']]));
        g.globalCompositeOperation = 'destination-out'; ell(g, 11, 6, 5.4, 5, '#000'); g.globalCompositeOperation = 'source-over';
      }, Object.assign({ glow: '#ff3aa8' }, BOLT));
  };

  AH.ArtModules.stages['worlds.paris.sprites.116'] = function (C) {
    const { EYE, FR_REGION, SKINS, ell, eyeGlow, lg, limb, line, poly, rrect } = C;

    SKINS[FR_REGION] = {
        robot: function (f) { return function (g) {
          const step = f ? 2 : 0;
          limb(g, 12, 28, 11 + step, 35, 4.5, '#222039', '#5a4868', '#d9cae6');
          limb(g, 21, 28, 22 - step, 35, 4.5, '#222039', '#5a4868', '#d9cae6');
          rrect(g, 7 + step, 34, 8, 3, 1, '#241835'); rrect(g, 18 - step, 34, 8, 3, 1, '#241835');
          rrect(g, 7, 13, 18, 16, 3, lg(g, 7, 13, 25, 29, [[0, '#f5e8dc'], [0.45, '#172238'], [0.55, '#f5e8dc'], [1, '#172238']]));
          for (let y = 15; y < 28; y += 5) { line(g, 8, y, 24, y, 2.5, '#283d5a'); line(g, 8, y + 1.2, 24, y + 1.2, 0.6, '#8fc2d0'); }
          ell(g, 16, 10.4, 9, 8.4, lg(g, 8, 3, 24, 17, [[0, '#fff9ee'], [1, '#aaa0b5']]));
          rrect(g, 5.6, 4.6, 20.8, 4.2, 2, lg(g, 5, 3, 27, 9, [[0, '#242039'], [0.5, '#100f20'], [1, '#51415d']]));
          ell(g, 16, 5, 2, 1.2, '#dcd0df');
          ell(g, 13, 10.8, 1.5, 1.8, '#e63760'); ell(g, 19, 10.8, 1.5, 1.8, '#e63760');
          line(g, 12, 13, 20, 13, 0.8, '#46313d');
          limb(g, 7, 17, 4, 25, 4, '#a99ab1', '#e2d7e5', '#fff'); limb(g, 25, 17, 28, 25, 4, '#a99ab1', '#e2d7e5', '#fff');
          ell(g, 4, 26, 2.4, 2.4, '#dad0dc'); ell(g, 28, 26, 2.4, 2.4, '#dad0dc');
          line(g, 16, 1, 16, -1, 1, '#dce4ef'); ell(g, 16, 1, 1.2, 1.2, EYE);
        }; },
        drone: function (f) { return function (g) {
          const wing = f ? -3 : 3;
          ell(g, 16, 13, 12, 6.3, lg(g, 4, 8, 27, 19, [[0, '#9da9c0'], [0.55, '#4c4a66'], [1, '#272039']]));
          ell(g, 24, 10, 5.7, 4.8, '#69758b'); ell(g, 25, 8.5, 1.1, 1.1, '#ff3d5c');
          poly(g, [[28, 11], [32, 12], [28, 14]], '#d4a646');
          line(g, 8, 10, 2, 7 + wing, 2, '#a8b7c8'); line(g, 17, 9, 12, 2 + wing, 2, '#a8b7c8');
          ell(g, 2, 7 + wing, 2.2, 1.1, '#dce4ef'); ell(g, 12, 2 + wing, 2.5, 1.2, '#dce4ef');
          // Tech baguette cargo pod with laser eyes.
          poly(g, [[9, 13], [19, 10], [23, 12], [19, 16], [10, 17]], lg(g, 8, 10, 23, 17, [[0, '#f4d18c'], [1, '#a75d37']]));
          for (let i = 0; i < 3; i++) line(g, 12 + i * 3, 12 + i * 0.2, 13 + i * 3, 15, 0.7, '#fff1c6');
          eyeGlow(g, 22, 13, 1.5, EYE);
        }; },
        spider: function (f) { return function (g) {
          const bob = f ? 1 : 0;
          for (let i = 0; i < 4; i++) {
            const dx = i * 5;
            limb(g, 8 + dx, 13, 5 + dx + (i % 2 ? 2 : -1), 19, 1.8, '#5d3d5a', '#b07867', '#edcc98');
          }
          ell(g, 15, 12 - bob, 11.5, 6.4, lg(g, 4, 5, 26, 19, [[0, '#e9bc83'], [0.5, '#c98559'], [1, '#70445c']]));
          poly(g, [[5, 14], [10, 6], [25, 5], [30, 12], [24, 17], [9, 17]], 'rgba(255,238,200,0.36)');
          for (let i = 0; i < 4; i++) ell(g, 10 + i * 4, 11 + (i % 2) * 2, 1.2, 1, '#9f613d');
          eyeGlow(g, 23, 9, 1.1, EYE); ell(g, 28, 10, 1.2, 1.2, EYE);
          poly(g, [[25, 15], [31, 14], [28, 18]], '#fff0d1');
        }; }
      };
  };

  AH.ArtModules.stages['worlds.paris.sprites.118'] = function (C) {
    const { COINS, FR_REGION } = C;

    COINS[FR_REGION] = '\u20AC';
  };
})();
