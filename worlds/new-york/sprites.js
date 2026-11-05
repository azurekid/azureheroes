/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['new-york'] = AH.Worlds['new-york'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['eastus2'] = content;

  AH.ArtModules.stages['worlds.new-york.sprites.54'] = function (C) {
    const { FSKIN, ell, fPal, fighterReg, line, poly } = C;

    fighterReg('broker', { // New York: zero-day access broker and street boxer
        skin: FSKIN.brown, top: 'tank', topC: fPal('#d5d7d4', '#77838b', '#374454'),
        sleeve: 'rolled', sleeveC: fPal('#d5d7d4', '#77838b', '#374454'),
        legs: 'shorts', legC: fPal('#345b82', '#1d3d62', '#12243f'), feet: 'boots', footC: fPal('#555a68', '#303644', '#171d2d'),
        hands: 'gloves', handC: fPal('#f05256', '#bd293c', '#61162b'), hair: 'buzz', hairC: '#211b1b',
        face: 'shades', facial: 'stubble', accent: '#ff5964', belt: '#d3ad61', buckle: true,
        front: function (g, P, T, S) {
          if (S.stun) return;
          const p = T.at(0.55, 0);
          poly(g, [[p[0] - 3.2, p[1] - 2.8], [p[0] + 2.6, p[1] - 3.2], [p[0] + 3.2, p[1] + 1], [p[0], p[1] + 3], [p[0] - 3.2, p[1] + 1]], '#20263a');
          line(g, p[0] - 1.8, p[1] - 0.4, p[0] + 1.8, p[1] - 0.4, 0.7, '#ff5964');
          line(g, p[0] - 1.6, p[1] + 1, p[0] + 1.6, p[1] + 1, 0.5, '#8ee2ef');
          ell(g, p[0], p[1] - 0.4, 0.55, 0.55, '#fff3d0');
        }
      });
  };

  AH.ArtModules.stages['worlds.new-york.sprites.65'] = function (C) {
    const { BOLT, ell, glow, lg, line, poly, reg2, trail } = C;

    reg2('bolt_broker', 22, 12, function (g) {
        trail(g, 6, 'rgba(255,76,92,0.68)');
        poly(g, [[2, 4], [6, 2], [12, 2], [16, 5], [14, 8], [9, 8], [6, 11], [3, 10], [4, 7]], lg(g, 1, 1, 16, 11, [[0, '#ffaaa0'], [0.48, '#ef4f59'], [1, '#a61835']]));
        ell(g, 13, 4.2, 2.3, 2.8, '#d33147'); poly(g, [[14, 4], [19, 3], [21, 5], [18, 7], [14, 7]], '#d33147');
        line(g, 5, 3, 11, 3, 0.6, 'rgba(255,255,255,0.8)');
        [5, 8, 11].forEach((x) => { g.globalAlpha = 0.6; ell(g, x, 10.2, 1.3, 1, '#ffd46f'); }); g.globalAlpha = 1;
      }, Object.assign({ glow: '#ff5964' }, BOLT));
  };

  content.parts['SKINS_eastus2'] = function (C) {
    const { EYE, birdFrame, ell, eyeGlow, lg, limb, line, poly, rrect, txt } = C;

    return {
          robot: function (f) { return function (g) {
            const step = f ? 2 : 0;
            limb(g, 11, 28, 10 + step, 35, 4.2, '#202941', '#526277', '#b9c9c6');
            limb(g, 21, 28, 22 - step, 35, 4.2, '#202941', '#526277', '#b9c9c6');
            rrect(g, 6 + step, 34, 8, 3, 0.8, '#172238'); rrect(g, 18 - step, 34, 8, 3, 0.8, '#172238');
            rrect(g, 7, 13, 18, 16, 2, lg(g, 6, 12, 26, 29, [[0, '#d7e1d9'], [0.45, '#778b8f'], [1, '#34495c']]));
            g.fillStyle = '#dbad55'; poly(g, [[8, 19], [24, 19], [22, 26], [10, 26]], '#dbad55');
            for (let y = 16; y < 28; y += 4) { line(g, 8, y, 24, y, 0.5, 'rgba(238,244,227,0.65)'); }
            rrect(g, 8, 5, 16, 10, 2, lg(g, 8, 5, 24, 15, [[0, '#d2d6d3'], [1, '#657985']]));
            rrect(g, 10, 8, 12, 3.8, 1, '#17253a'); ell(g, 13.4, 9.8, 1.3, 1.5, '#ff5464'); ell(g, 19, 9.8, 1.3, 1.5, '#ff5464');
            poly(g, [[8, 5], [10, 2], [22, 2], [24, 5]], '#303b4e'); g.fillStyle = '#ffcb59'; g.fillRect(12, 2, 8, 1.4);
            limb(g, 7, 17, 3, 25, 3.8, '#566b7a', '#aab8b8', '#d2dfd8'); limb(g, 25, 17, 29, 25, 3.8, '#566b7a', '#aab8b8', '#d2dfd8');
            ell(g, 3, 26, 2.4, 2.4, '#d7ded2'); ell(g, 29, 26, 2.4, 2.4, '#d7ded2');
            g.fillStyle = '#d73446'; g.fillRect(12, 21, 8, 1); txt(g, 'M', 14.3, 20.6, 0.55, '#f2eee0');
          }; },
          drone: birdFrame({
            body: '#aeb8c2', bodyD: '#515d73', wing: '#b8c2ce', wingD: '#414c65',
            head: '#527b79', beak: '#c4b8aa', tail: '#394157'
          }),
          spider: function (f) { return function (g) {
            const bob = f ? 1 : 0;
            for (const x of [10, 23]) {
              const stride = f ? 2 : -1;
              limb(g, x, 14, x - 2 - stride, 18, 1.6, '#4b4050', '#8e7770', '#c4aa90');
              limb(g, x + 1, 14, x + 3 + stride, 19, 1.6, '#4b4050', '#8e7770', '#c4aa90');
            }
            g.strokeStyle = '#5c4c51'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(5, 15); g.quadraticCurveTo(-3, 12, 1, 8); g.stroke();
            ell(g, 16, 12 - bob, 11.5, 6.4, lg(g, 4, 5, 27, 18, [[0, '#91806e'], [0.48, '#66575b'], [1, '#3e3746']]));
            poly(g, [[8, 13], [11, 7], [21, 6], [27, 11], [24, 16], [11, 17]], 'rgba(216,204,173,0.35)');
            ell(g, 9.2, 7, 2.4, 2.6, '#958578'); ell(g, 9.2, 7, 1.2, 1.4, '#c4b197');
            ell(g, 26, 10, 2, 1.7, '#7b6c66'); eyeGlow(g, 27, 9.8, 0.8, EYE); ell(g, 27, 9.8, 0.8, 0.8, EYE);
            line(g, 28, 11, 32, 10, 0.5, '#d0c0a7'); line(g, 28, 12, 32, 13, 0.5, '#d0c0a7');
            rrect(g, 14, 12, 5, 2.2, 0.6, '#cf3846'); ell(g, 17, 13, 0.5, 0.5, '#ffe079');
          }; }
        };
  };

  content.parts['COINS_eastus2'] = function (C) {

    return '$';
  };

  content.parts['PROPS_hydrant'] = function (C) {
    const { ell, lg, line, rrect } = C;

    return [18, 30, function (g) {
          g.fillStyle = '#8f1c32'; g.fillRect(7, 11, 4, 15); g.fillRect(7, 20, 4, 7);
          rrect(g, 5, 7, 8, 6, 2, lg(g, 4, 7, 14, 14, [[0, '#ff7465'], [0.55, '#df2f3c'], [1, '#852031']]));
          ell(g, 9, 6.8, 4.2, 2.2, '#ff8b67'); ell(g, 9, 8, 3.2, 1, '#b91f37');
          [3, 10].forEach((y) => { rrect(g, 1.5, y, 4.4, 3.4, 1.3, '#d62c3b'); rrect(g, 12.1, y, 4.4, 3.4, 1.3, '#d62c3b'); });
          g.fillStyle = '#ffd8a1'; g.fillRect(2.4, 11.6, 2.4, 1); g.fillRect(13.2, 11.6, 2.4, 1);
          g.fillStyle = '#aa2435'; g.fillRect(4, 25, 10, 3); g.fillStyle = '#555c72'; g.fillRect(3, 28, 12, 1.5);
          line(g, 7, 15, 11, 15, 0.6, '#ffd27f');
        }];
  };

  content.parts['PROPS_newsbox'] = function (C) {
    const { lg, rrect, txt } = C;

    return [22, 30, function (g) {
          g.fillStyle = '#252f48'; g.fillRect(9, 27, 4, 3); rrect(g, 2, 4, 18, 23, 1.4, lg(g, 1, 4, 21, 27, [[0, '#476a83'], [0.45, '#31506a'], [1, '#1c304a']]));
          g.fillStyle = '#0c182b'; g.fillRect(5, 9, 12, 2.2); g.fillStyle = '#e8eef0'; g.fillRect(5, 12.6, 12, 0.8);
          txt(g, 'NEWS', 5.2, 6.2, 0.55, '#fff0bd');
          g.fillStyle = '#89b4c3'; g.fillRect(5, 17, 12, 6); g.fillStyle = '#b7d0cf'; g.fillRect(6, 18, 10, 1);
          g.fillStyle = '#d9af66'; g.fillRect(6, 20, 4, 2); g.fillStyle = '#f2e7d2'; g.fillRect(12, 20, 4, 2);
          g.fillStyle = '#899da4'; g.fillRect(4, 25, 14, 1);
        }];
  };
})();
