/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['tokyo'] = AH.Worlds['tokyo'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['japaneast'] = content;

  AH.ArtModules.stages['worlds.tokyo.sprites.34'] = function (C) {
    const { ell, eyes, lg, line, poly, rrect } = C;

    Object.assign(C, { flySushi });
    function flySushi(f) {
        return function (g) {
          line(g, 16, 8, 16, 4.4, 1.4, '#7a7ea0');
          if (f) poly(g, [[2, 3], [30, 2.6], [30, 3.8], [2, 4.2]], 'rgba(232,232,248,0.8)');
          else { poly(g, [[8, 2.4], [24, 4], [24, 4.8], [8, 3.4]], '#d4d6ec'); poly(g, [[6, 4.6], [26, 2.4], [26, 3.2], [6, 5.4]], 'rgba(212,214,236,0.45)'); }
          rrect(g, 6, 13, 20, 8.4, 3.6, lg(g, 6, 13, 26, 21, [[0, '#ffffff'], [1, '#bcbcd8']]));
          rrect(g, 5, 7.6, 22, 7.4, 3.4, lg(g, 5, 7, 27, 15, [[0, '#ffb080'], [1, '#ff5a3a']]));
          [[10, 8.6, 9, 14], [15, 8.2, 14, 14.4], [21, 8.6, 20, 14]].forEach((l) => line(g, l[0], l[1], l[2], l[3], 0.8, 'rgba(255,235,220,0.8)'));
          rrect(g, 14, 7.4, 4, 14, 1, '#14301f');
          ell(g, 25.6, 19, 2, 1.5, '#6ad84a');
          eyes(g, 10.6, 21.4, 17.2, 1.1);
          g.globalAlpha = 0.6; ell(g, 16, 22.6, 3, 1.2, '#27e0ff'); g.globalAlpha = 1;
        };
      }
  };

  AH.ArtModules.stages['worlds.tokyo.sprites.48'] = function (C) {
    const { FSKIN, fAt, fPal, fighterReg, limb } = C;

    fighterReg('ronin', { // Tokyo: hovering rootkit ronin
        air: true, plate: ['#4a4a6a', '#0a0a1a', 'rgba(255,42,58,0.55)'], skin: FSKIN.olive, top: 'gi', topC: fPal('#4e4e8e', '#2a2a5e', '#121232'),
        top2: fPal('#ff5a5a', '#c81a2a', '#5a0a10'), sleeve: 'gi', sleeveC: fPal('#4e4e8e', '#2a2a5e', '#121232'), legs: 'gi', legC: fPal('#3e3e4e', '#22222e', '#0e0e16'),
        belt: '#c81a2a', feet: 'sandal', hands: 'wraps', hair: 'topknot', hairC: '#121014', face: 'oni', glowEyes: true, accent: '#ff2a3a',
        back: function (g, P, T) {
          const a = T.at(0.05, T.W.h + 2), b = T.at(1.42, T.W.s - 2);
          limb(g, a[0], a[1], b[0], b[1], 2.6, '#000000', '#1a1a24', '#4a4a5a');
          const h = fAt(a, b, 0.78); limb(g, h[0], h[1], b[0], b[1], 2.2, '#5a0a10', '#c81a2a', null);
        }
      });
  };

  AH.ArtModules.stages['worlds.tokyo.sprites.59'] = function (C) {
    const { BOLT, ell, fStar, glow, lg, reg2, trail } = C;

    reg2('bolt_ronin', 22, 12, function (g) {
        trail(g, 6, 'rgba(255,42,58,0.6)');
        fStar(g, 8, 6, 5.6, lg(g, 2, 0, 14, 12, [[0, '#ffffff'], [0.5, '#b4b8c8'], [1, '#4a4e64']]));
        ell(g, 8, 6, 1.6, 1.6, '#ff2a3a'); ell(g, 8, 6, 0.6, 0.6, '#1a0408');
      }, Object.assign({ glow: '#ff2a3a' }, BOLT));
  };

  content.parts['SKINS_japaneast'] = function (C) {
    const { flySushi } = C;

    return { drone: flySushi };
  };

  content.parts['COINS_japaneast'] = function (C) {

    return '\u00A5';
  };

  content.parts['PROPS_lantern'] = function (C) {
    const { ell, lg, line, rrect } = C;

    return [16, 24, function (g) {
          line(g, 8, 0, 8, 3, 0.8, '#14062a'); rrect(g, 3.6, 2.4, 8.8, 2.4, 0.8, '#14062a');
          ell(g, 8, 12.4, 6.6, 8, lg(g, 2, 4, 14, 20, [[0, '#ff7a6a'], [0.5, '#e82a2a'], [1, '#8a1010']]));
          [8, 11.6, 15.4].forEach((y) => line(g, 2.8, y + 1, 13.2, y + 1, 0.6, '#5a0a0a'));
          ell(g, 8, 12, 3, 4, 'rgba(255,230,140,0.55)'); rrect(g, 3.6, 19.6, 8.8, 2.4, 0.8, '#14062a'); line(g, 8, 22, 8, 24, 0.8, '#ffd23f');
        }];
  };

  content.parts['PROPS_carp'] = function (C) {
    const { ell, lg, poly } = C;

    return [32, 16, function (g) {
          poly(g, [[2, 2], [9, 8], [2, 14]], '#2a6aff'); ell(g, 18, 8, 12, 6, lg(g, 6, 2, 6, 14, [[0, '#ffb060'], [1, '#e84a1a']]));
          for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) ell(g, 11 + c * 4 + (r % 2) * 2, 5 + r * 2.6, 1.8, 1.4, 'rgba(255,240,200,0.45)');
          ell(g, 26, 6, 2.2, 2.2, '#ffffff'); ell(g, 26.6, 6, 1.1, 1.1, '#14062a'); poly(g, [[16, 2.4], [22, 3], [18, 0.2]], '#2a6aff');
        }];
  };
})();
