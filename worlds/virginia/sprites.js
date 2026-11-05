/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['virginia'] = AH.Worlds['virginia'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['eastus'] = content;

  AH.ArtModules.stages['worlds.virginia.sprites.32'] = function (C) {
    const { ell, eyes, lg, limb, line, poly, rrect } = C;

    Object.assign(C, { walkMinute });
    function walkMinute(f) {
        return function (g) {
          const o = f ? 2 : 0;
          limb(g, 12.6, 26, 11.6 + o, 34.6, 5, '#b8b8d0', '#f0f0ff', '#ffffff'); limb(g, 19.4, 26, 20.4 - o, 34.6, 5, '#b8b8d0', '#f0f0ff', '#ffffff');
          rrect(g, 7.6 + o, 33.6, 8.4, 3.4, 1.4, '#14133f'); rrect(g, 16 - o, 33.6, 8.4, 3.4, 1.4, '#14133f');
          limb(g, 7, 15, 4, 24, 4.4, '#101e70', '#2f4fd0', '#6fb4ff'); ell(g, 3.6, 25.4, 2.6, 2.6, '#d4d6ec');
          limb(g, 25, 15, 28, 24, 4.4, '#101e70', '#2f4fd0', '#6fb4ff'); ell(g, 28.4, 25.4, 2.6, 2.6, '#d4d6ec');
          rrect(g, 7, 13, 18, 15, 3, lg(g, 7, 13, 25, 28, [[0, '#6f8cff'], [0.4, '#2f4fd0'], [1, '#14206a']]));
          line(g, 9, 14, 23, 26, 1.4, '#ffffff'); line(g, 23, 14, 9, 26, 1.4, '#ffffff');
          ell(g, 16, 20, 1, 1, '#ffd23f'); ell(g, 16, 24, 1, 1, '#ffd23f');
          rrect(g, 10.4, 6.6, 11.2, 7, 3, lg(g, 10, 6, 22, 14, [[0, '#d4d6ec'], [1, '#7a7ea0']]));
          rrect(g, 11.6, 9, 8.8, 3, 1.2, '#14062a'); eyes(g, 14, 18, 10.6, 1);
          poly(g, [[5, 8], [16, 0.4], [27, 8], [22.4, 8.4], [16, 4.4], [9.6, 8.4]], '#14133f');
          line(g, 6, 7.6, 16, 1.2, 0.7, '#ffffff'); line(g, 26, 7.6, 16, 1.2, 0.7, '#ffffff');
          ell(g, 16, 3.4, 1.2, 1.2, '#ff2a4a');
        };
      }
  };

  AH.ArtModules.stages['worlds.virginia.sprites.38'] = function (C) {
    const { birdFrame } = C;

    const birdEagle = birdFrame({ body: '#7a5028', bodyD: '#3a2410', wing: '#8a5c30', wingD: '#3a2410', head: '#ffffff', beak: '#ffd23f', tail: '#ffffff' });

    Object.assign(C, { birdEagle });
  };

  AH.ArtModules.stages['worlds.virginia.sprites.53'] = function (C) {
    const { FBLACK, FSKIN, fPal, fighterReg } = C;

    fighterReg('enforcer', { // New York: DDoS enforcer
        skin: FSKIN.brown, top: 'jacket', topC: fPal('#4a4a56', '#26262e', '#0c0c12'), top2: fPal('#ff4a4a', '#c81a1a', '#5a0808'), sleeve: 'long',
        sleeveC: fPal('#4a4a56', '#26262e', '#0c0c12'), legs: 'pants', legC: fPal('#5a7ab8', '#34508a', '#162444'), feet: 'boots', footC: FBLACK,
        hands: 'fingerless', handC: FBLACK, hair: 'mohawk', hairC: '#2a1a10', face: 'shades', facial: 'stubble', accent: '#ff2a3a',
        front: function (g, P, T) {
          const a = T.at(-0.04, -T.W.h + 1), b = T.at(-0.04, T.W.h - 1);
          g.strokeStyle = '#d8dce8'; g.lineWidth = 0.8; g.setLineDash([1.2, 0.8]); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 6, b[0], b[1]); g.stroke(); g.setLineDash([]);
        }
      });
  };

  AH.ArtModules.stages['worlds.virginia.sprites.64'] = function (C) {
    const { BOLT, glow, lg, reg2, rrect } = C;

    reg2('bolt_enforcer', 22, 12, function (g) {
        [[2, 3.4, 1], [8, 4, 0.85], [14, 4.6, 0.6]].forEach(function (b) {
          g.globalAlpha = b[2]; rrect(g, b[0], b[1], 5.4, 5.4 - (b[1] - 3.4) * 2, 0.8, lg(g, 0, 3, 0, 9, [[0, '#ff7a7a'], [1, '#a80a14']]));
          g.fillStyle = '#ffffff'; g.fillRect(b[0] + 1.2, b[1] + 1.2, 1.2, 0.8); g.fillRect(b[0] + 3, b[1] + 1.2, 1.2, 0.8);
        });
        g.globalAlpha = 1;
      }, Object.assign({ glow: '#ff2a3a' }, BOLT));
  };

  content.parts['SKINS_eastus'] = function (C) {
    const { birdEagle, crawlCrab, walkMinute } = C;

    return { robot: walkMinute, drone: birdEagle, spider: crawlCrab };
  };

  content.parts['COINS_eastus'] = function (C) {

    return '$';
  };

  content.parts['PROPS_kite'] = function (C) {
    const { lg, line, poly } = C;

    return [18, 26, function (g) {
          poly(g, [[9, 0.6], [17.4, 8], [9, 17], [0.6, 8]], lg(g, 0, 0, 18, 17, [[0, '#ffd23f'], [0.5, '#ff7a2a'], [1, '#4dff7a']]));
          line(g, 9, 0.6, 9, 17, 0.6, 'rgba(255,255,255,0.8)'); line(g, 0.6, 8, 17.4, 8, 0.6, 'rgba(255,255,255,0.8)');
          g.lineWidth = 0.8; g.strokeStyle = '#e8e8f8'; g.beginPath(); g.moveTo(9, 17); g.quadraticCurveTo(5, 21, 9, 25); g.stroke();
          [[7.6, 20], [10.4, 23]].forEach((b) => poly(g, [[b[0] - 1.8, b[1] - 1], [b[0] + 1.8, b[1] - 1], [b[0], b[1] + 1.4]], '#ff2a9a'));
        }];
  };
})();
