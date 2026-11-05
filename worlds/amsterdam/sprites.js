/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['amsterdam'] = AH.Worlds['amsterdam'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['westeurope'] = content;

  AH.ArtModules.stages['worlds.amsterdam.sprites.29'] = function (C) {
    const { ell, eyes, lg, limb, line, poly, rrect } = C;

    Object.assign(C, { walkClog });
    function walkClog(f) {
        return function (g) {
          const o = f ? 2 : 0;
          limb(g, 12, 28, 11 + o, 35, 4.4, '#0f1c66', '#2455e0', '#6fb4ff'); limb(g, 20, 28, 21 - o, 35, 4.4, '#0f1c66', '#2455e0', '#6fb4ff');
          rrect(g, 7 + o, 34, 8, 3, 1.4, '#14133f'); rrect(g, 17 - o, 34, 8, 3, 1.4, '#14133f');
          poly(g, [[5, 17], [8, 10], [24, 10], [27, 17], [26, 29], [6, 29]], lg(g, 5, 10, 27, 29, [[0, '#ffe08a'], [0.5, '#e0a040'], [1, '#8a5018']]));
          rrect(g, 5.4, 17, 21.2, 3, 1, '#2f6bff');
          [[9, 15], [23, 15], [10, 26], [22, 26]].forEach((p) => ell(g, p[0], p[1], 0.8, 0.8, '#fff3c0'));
          line(g, 16, 10, 16, 4, 1.2, '#2fa84a'); poly(g, [[16, 8], [21, 5], [18, 9.6]], '#2fa84a'); poly(g, [[16, 7], [11, 4.6], [14, 8.6]], '#2fa84a');
          poly(g, [[11.6, 4], [12.6, -0.2], [16, 2.2], [19.4, -0.2], [20.4, 4], [16, 6.6]], '#ff2a6a'); ell(g, 16, 3.6, 2, 1.6, '#ff8ab0');
          eyes(g, 12.4, 19.6, 23.4, 1.5);
          line(g, 10.6, 21.4, 14, 22.4, 0.8, '#3a1a08'); line(g, 21.4, 21.4, 18, 22.4, 0.8, '#3a1a08');
        };
      }
  };

  AH.ArtModules.stages['worlds.amsterdam.sprites.33'] = function (C) {
    const { ell, eyes, lg, line, poly, rrect } = C;

    Object.assign(C, { flyWindmill });
    function flyWindmill(f) {
        return function (g) {
          poly(g, [[12, 14], [20, 14], [23, 23.4], [9, 23.4]], lg(g, 9, 14, 23, 24, [[0, '#fff0d0'], [1, '#c8a878']]));
          rrect(g, 14.4, 19, 3.2, 4.4, 1.2, '#8a4a20');
          const a = f ? Math.PI / 4 : 0;
          for (let i = 0; i < 4; i++) {
            const an = a + i * Math.PI / 2, c = Math.cos(an), s = Math.sin(an);
            line(g, 16, 11, 16 + c * 10.4, 11 + s * 10.4, 1.4, '#8a5a30');
            line(g, 16 + c * 4, 11 + s * 4, 16 + c * 10.4, 11 + s * 10.4, 3.6, 'rgba(250,240,215,0.85)');
          }
          poly(g, [[10, 14], [16, 7], [22, 14]], lg(g, 10, 7, 22, 14, [[0, '#ff6a50'], [1, '#a82a1a']]));
          ell(g, 16, 11, 1.8, 1.8, '#4a2a10');
          eyes(g, 13, 19, 17.4, 1);
        };
      }
  };

  AH.ArtModules.stages['worlds.amsterdam.sprites.39'] = function (C) {
    const { ell, eyes, lg, limb, poly } = C;

    Object.assign(C, { crawlCheese });
    function crawlCheese(f) {
        return function (g) {
          for (let i = 0; i < 4; i++) limb(g, 8 + i * 5, 15, 8 + i * 5 + ((f + i) % 2 ? 1.4 : -1.4), 19, 1.8, '#7a4a10', '#a86a20', null);
          poly(g, [[3, 16.4], [29, 16.4], [29, 5]], lg(g, 3, 5, 29, 17, [[0, '#fff0a0'], [0.5, '#ffd23f'], [1, '#c98a14']]));
          poly(g, [[3, 16.4], [29, 5], [29, 8], [7, 16.4]], 'rgba(255,255,200,0.55)');
          [[12, 14.4, 1.7], [19, 13, 1.4], [24.6, 14, 1.2], [16, 15.6, 0.9]].forEach((h) => ell(g, h[0], h[1], h[2], h[2] * 0.8, '#b8780e'));
          eyes(g, 24.2, 27.4, 11.4, 0.9);
        };
      }
  };

  AH.ArtModules.stages['worlds.amsterdam.sprites.45'] = function (C) {
    const { FSKIN, fPal, fighterReg, line } = C;

    fighterReg('kraker', { // Amsterdam: Muay Thai access broker
        skin: FSKIN.tan, top: 'bare', tattoo: true, accent: '#ff7a1a', legs: 'shorts', legC: fPal('#ffa040', '#e8650c', '#8a3404'),
        feet: 'bare', hands: 'wraps', hair: 'buzz', hairC: '#2a1e14', face: 'balaclava', glowEyes: true, scar: true,
        front: function (g, P, T) {
          const r = T.at(-0.06, -T.W.h + 1.6);
          g.strokeStyle = '#ffd23f'; g.lineWidth = 0.8; g.beginPath(); g.arc(r[0], r[1] + 2.6, 2, 0, Math.PI * 2); g.stroke();
          [-1.4, 0.4, 2].forEach((o, i) => { line(g, r[0] + o, r[1] + 4, r[0] + o * 1.6, r[1] + 8 - i * 0.6, 0.9, i === 1 ? '#ff7a1a' : '#d8dce8'); });
        }
      });
  };

  AH.ArtModules.stages['worlds.amsterdam.sprites.56'] = function (C) {
    const { BOLT, GOLD, glow, lg, line, reg2, rrect, trail } = C;

    reg2('bolt_kraker', 22, 12, function (g) {
        trail(g, 6, 'rgba(255,122,26,0.7)');
        rrect(g, 2, 2.2, 12, 7.6, 1.4, lg(g, 0, 2, 0, 10, [[0, '#ffb060'], [1, '#c84a04']]));
        rrect(g, 4, 4, 3.4, 2.8, 0.6, lg(g, 0, 4, 0, 7, GOLD)); line(g, 9, 4.6, 12.6, 4.6, 0.7, '#ffffff'); line(g, 9, 7, 11.6, 7, 0.7, 'rgba(255,255,255,0.6)');
      }, Object.assign({ glow: '#ff7a1a' }, BOLT));
  };

  content.parts['SKINS_westeurope'] = function (C) {
    const { crawlCheese, flyWindmill, walkClog } = C;

    return { robot: walkClog, drone: flyWindmill, spider: crawlCheese };
  };

  content.parts['COINS_westeurope'] = function (C) {

    return '\u20AC';
  };

  content.parts['PROPS_tulips'] = function (C) {
    const { lg, line, poly } = C;

    return [24, 26, function (g) {
          poly(g, [[6, 17], [18, 17], [16, 25.6], [8, 25.6]], lg(g, 0, 17, 0, 26, [[0, '#e0804a'], [1, '#8a3a1a']]));
          [[7, 5, '#ff2a6a'], [12, 2, '#ffd23f'], [17, 5, '#ff7a2a']].forEach((t) => { line(g, t[0], 17, t[0], t[1] + 3, 1.2, '#2fa84a'); poly(g, [[t[0] - 3, t[1] - 1], [t[0] - 1.6, t[1] + 4], [t[0], t[1] + 1], [t[0] + 1.6, t[1] + 4], [t[0] + 3, t[1] - 1], [t[0], t[1] + 5.6]], t[2]); });
        }];
  };

  content.parts['PROPS_bike'] = function (C) {
    const { line, rrect } = C;

    return [48, 30, function (g) {
          g.save(); g.scale(1.5, 1.5);
          [[7, 14], [25, 14]].forEach((w) => { g.lineWidth = 1.4; g.strokeStyle = '#14062a'; g.beginPath(); g.arc(w[0], w[1], 5.4, 0, 7); g.stroke(); g.lineWidth = 0.5; g.strokeStyle = '#c4e6ff'; g.beginPath(); g.arc(w[0], w[1], 3, 0, 7); g.stroke(); });
          line(g, 7, 14, 14, 6, 1.4, '#ff7a2a'); line(g, 14, 6, 22, 6, 1.4, '#ff7a2a'); line(g, 14, 6, 17, 14, 1.4, '#ff7a2a'); line(g, 17, 14, 7, 14, 1.4, '#ff7a2a'); line(g, 22, 6, 25, 14, 1.4, '#ff7a2a'); line(g, 17, 14, 22, 6, 1.4, '#ff7a2a');
          line(g, 21, 6, 22.6, 2.6, 1.2, '#14062a'); line(g, 20, 2.6, 25, 2.6, 1.2, '#14062a'); rrect(g, 11.4, 3, 6, 1.8, 0.8, '#14062a');
          rrect(g, 20.6, 8, 6.6, 4.6, 1, '#8a5a2a');
          g.restore();
        }];
  };

  content.parts['OBST_flowers'] = function (C) {
    const { ell, lg, poly, rrect } = C;

    return [56, 34, function (g) {
          for (let x = 0; x < 56; x += 7) poly(g, [[x, 2], [x + 7, 2], [x + 7, 8], [x + 3.5, 10], [x, 8]], (x / 7) % 2 ? '#ffffff' : '#2a8a4a');
          g.fillStyle = '#6a3a2a'; g.fillRect(3, 8, 1.6, 18); g.fillRect(51.4, 8, 1.6, 18);
          rrect(g, 1, 18, 54, 12, 1.4, lg(g, 0, 18, 0, 30, [[0, '#a86a3a'], [1, '#5a2a1a']]));
          const cols = ['#ff2a6a', '#ffd23f', '#ff7a2a', '#ff7ad9', '#ffffff'];
          for (let i = 0; i < 9; i++) { const x = 5 + i * 5.6; rrect(g, x - 2.2, 14, 4.4, 5, 0.6, '#3a6aa8'); for (let k = 0; k < 3; k++) ell(g, x - 1.4 + k * 1.4, 12 - (k % 2), 1.2, 1.4, cols[(i + k) % cols.length]); }
          [10, 46].forEach(function (x) { ell(g, x, 30.6, 3, 3, '#1a0a2a'); });
        }];
  };

  content.parts['OBST_bikes'] = function (C) {
    const { line, rrect } = C;

    return [60, 24, function (g) {
          g.fillStyle = '#9a9ac0'; g.fillRect(2, 20, 56, 1.6);
          [[10, '#ff7a2a'], [30, '#27e0ff'], [50, '#ffd23f']].forEach(function (b) {
            const x = b[0];
            [[x - 7, 16], [x + 7, 16]].forEach(function (w) { g.lineWidth = 1.2; g.strokeStyle = '#14062a'; g.beginPath(); g.arc(w[0], w[1], 5, 0, 7); g.stroke(); });
            line(g, x - 7, 16, x - 1, 8, 1.2, b[1]); line(g, x - 1, 8, x + 5, 8, 1.2, b[1]); line(g, x - 1, 8, x + 1, 16, 1.2, b[1]); line(g, x + 1, 16, x - 7, 16, 1.2, b[1]); line(g, x + 5, 8, x + 7, 16, 1.2, b[1]);
            line(g, x + 5, 8, x + 6, 4, 1, '#14062a'); rrect(g, x - 3, 5.6, 4.4, 1.6, 0.6, '#14062a');
          });
        }];
  };
})();
