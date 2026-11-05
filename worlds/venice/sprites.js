/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['venice'] = AH.Worlds['venice'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['italynorth'] = content;

  AH.ArtModules.stages['worlds.venice.sprites.50'] = function (C) {
    const { FSKIN, ell, fPal, fighterReg, line, rrect } = C;

    fighterReg('gladiator', { // Rome: ransomware gladiator
        skin: FSKIN.olive, top: 'harness', legs: 'skirt', legC: fPal('#a8703a', '#7a4a1e', '#3a200a'), feet: 'greaves', footC: fPal('#f0f0f8', '#a8acc0', '#4a4e64'),
        hands: 'cestus', handC: fPal('#a8703a', '#7a4a1e', '#3a200a'), manica: true, hat: 'helmet', hair: 'none', facial: 'beard', hairC: '#2a1a10',
        belt: '#5a3214', buckle: true, accent: '#ff3a2a',
        front: function (g, P, T, S) {
          if (S.stun) return;
          const p = T.at(-0.1, -T.W.h + 2.4); line(g, p[0], p[1] - 4, p[0], p[1] - 2.6, 0.6, '#d8dce8');
          g.strokeStyle = '#ffd23f'; g.lineWidth = 0.9; g.beginPath(); g.arc(p[0], p[1] - 1.6, 1.6, Math.PI, 0); g.stroke();
          rrect(g, p[0] - 2.4, p[1] - 1.4, 4.8, 3.8, 0.6, '#ff3a2a'); ell(g, p[0], p[1] + 0.4, 0.6, 0.8, '#2a0408');
        }
      });
  };

  AH.ArtModules.stages['worlds.venice.sprites.61'] = function (C) {
    const { BOLT, GOLD, ell, glow, lg, reg2, rrect, trail } = C;

    reg2('bolt_gladiator', 22, 12, function (g) {
        trail(g, 7, 'rgba(255,58,42,0.6)');
        g.strokeStyle = '#d8dce8'; g.lineWidth = 1.4; g.beginPath(); g.arc(8, 5, 3, Math.PI, 0); g.stroke();
        rrect(g, 3.6, 5, 8.8, 6, 1, lg(g, 0, 5, 0, 11, GOLD)); ell(g, 8, 7.4, 1, 1.2, '#4a1004'); g.fillStyle = '#4a1004'; g.fillRect(7.6, 7.6, 0.8, 2);
      }, Object.assign({ glow: '#ff3a2a' }, BOLT));
  };

  AH.ArtModules.stages['worlds.venice.sprites.94'] = function (C) {
    const { EYE, IT_REGION, SKINS, ell, eyeGlow, eyes, lg, limb, line, poly, rrect } = C;

    Object.assign(C, { centurion, pigeon, pizzaCrawler });
    function centurion(f) {
        return function (g) {
          const step = f ? 2 : 0;
          limb(g, 12, 28, 11 + step, 35, 4.5, '#572c2a', '#aa5440', '#e9b46f');
          limb(g, 20, 28, 21 - step, 35, 4.5, '#572c2a', '#aa5440', '#e9b46f');
          rrect(g, 6, 34, 9, 3, 1, '#442b38'); rrect(g, 17, 34, 9, 3, 1, '#442b38');
          limb(g, 7, 15, 3, 23, 4, '#814638', '#d07848', '#f3c27b');
          limb(g, 25, 15, 28, 23, 4, '#814638', '#d07848', '#f3c27b');
          rrect(g, 7, 13, 18, 16, 3, lg(g, 7, 13, 25, 29, [[0, '#d9a54f'], [0.5, '#9e533d'], [1, '#542b3d']]));
          line(g, 10, 14, 22, 27, 1.1, '#f4d08a'); line(g, 22, 14, 10, 27, 1.1, '#f4d08a');
          ell(g, 16, 10, 7.5, 6.8, '#d6a36e'); rrect(g, 10, 8, 12, 6, 2, '#4a3041'); eyes(g, 12.5, 19.5, 11, 1.15);
          poly(g, [[7, 8], [9, 2], [14, 0], [20, 2], [24, 8], [21, 7], [19, 5], [12, 5], [10, 8]], '#b98549');
          g.fillStyle = '#bd342e'; g.fillRect(14, 0, 4, 9); poly(g, [[18, 1], [29, 0], [26, 4], [18, 4]], '#e34c3b');
          ell(g, 5, 21, 5.5, 7, lg(g, 0, 15, 10, 28, [[0, '#e4c47f'], [1, '#866444']]));
          line(g, 5, 15, 5, 27, 0.7, '#f7e4ae'); line(g, 1, 21, 9, 21, 0.7, '#f7e4ae');
          if (f) ell(g, 27.5, 29, 1.3, 1.3, '#ffd58c');
        };
      }

    function pigeon(f) {
        return function (g) {
          const flap = f ? -4 : 4;
          ell(g, 16, 14, 9, 6.5, lg(g, 7, 8, 25, 20, [[0, '#9aa5a8'], [1, '#4b5964']]));
          poly(g, [[14, 13], [7, 8 + flap], [2, 11], [10, 16]], '#75848a');
          poly(g, [[18, 13], [27, 8 + flap], [31, 11], [22, 16]], '#bdc3b3');
          ell(g, 24, 10, 4.5, 4, '#aab4aa'); poly(g, [[27, 10], [32, 12], [27, 13]], '#dd9a50');
          eyeGlow(g, 25.3, 9.2, 0.9, EYE); ell(g, 25.3, 9.2, 1, 1, EYE);
          line(g, 14, 18, 13, 22, 0.8, '#dfaa63'); line(g, 18, 18, 19, 22, 0.8, '#dfaa63');
          g.fillStyle = '#00aeb0'; g.fillRect(13, 13, 6, 2); ell(g, 16, 14, 2, 1.2, '#65f5df');
        };
      }

    function pizzaCrawler(f) {
        return function (g) {
          for (let i = 0; i < 4; i++) limb(g, 7 + i * 6, 14, 6 + i * 7 + ((f + i) % 2 ? 2 : -2), 19, 1.8, '#67403c', '#d4a05b', null);
          poly(g, [[3, 16], [27, 4], [29, 16]], lg(g, 3, 4, 29, 16, [[0, '#f7d56d'], [0.5, '#eaa849'], [1, '#bf4d37']]));
          poly(g, [[5, 14], [27, 5], [28, 8], [8, 16]], '#fff0b4');
          [[12, 11, 1.8], [19, 9, 1.6], [21, 14, 1.3], [14, 15, 1]].forEach((q) => ell(g, q[0], q[1], q[2], q[2], '#bd352e'));
          eyes(g, 25, 29, 12, 0.85);
        };
      }

    SKINS[IT_REGION] = { robot: centurion, drone: pigeon, spider: pizzaCrawler };
  };

  AH.ArtModules.stages['worlds.venice.sprites.96'] = function (C) {
    const { COINS, IT_REGION } = C;

    COINS[IT_REGION] = '\u20AC';
  };

  content.parts['OBST_icecream'] = function (C) {
    const { ell, lg, lit, poly, rrect, txt } = C;

    return [64, 38, function (g) {
          rrect(g, 1, 6, 62, 26, 3, lg(g, 0, 6, 0, 32, [[0, '#ffffff'], [1, '#c8b8ff']]));
          rrect(g, 0, 2, 40, 5, 1.6, '#ff7ad9'); poly(g, [[44, 6], [56, 6], [63, 16], [44, 16]], 'rgba(150,220,255,0.85)');
          g.fillStyle = '#1a0a2a'; g.fillRect(8, 11, 28, 12); lit(g, 9, 12, 26, 10, '#ffe9a0');
          txt(g, 'GELATO', 10, 14.6, 0.5, '#ff2a9a');
          poly(g, [[14, -0.4], [20, -0.4], [17, 6]], '#e8a050'); ell(g, 17, -1, 3.4, 3, '#ff9ad8');
          g.fillStyle = '#27e0ff'; g.fillRect(1, 26, 62, 2);
          [14, 50].forEach(function (x) { ell(g, x, 32, 5, 5, '#14082a'); ell(g, x, 32, 2, 2, '#b8b8d8'); });
        }];
  };
})();
