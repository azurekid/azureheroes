/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['rio'] = AH.Worlds['rio'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['brazilsouth'] = content;

  AH.ArtModules.stages['worlds.rio.sprites.37'] = function (C) {
    const { birdFrame } = C;

    const birdMacaw = birdFrame({ body: '#ff4a3a', bodyD: '#a81818', wing: '#2a8aff', wingD: '#ffd23f', head: '#ff3a3a', patch: '#f4f4ff', beak: '#e8e8f0', tail: '#2a6aff' });

    Object.assign(C, { birdMacaw });
  };

  AH.ArtModules.stages['worlds.rio.sprites.51'] = function (C) {
    const { FSKIN, fPal, fighterReg } = C;

    fighterReg('capoeira', { // Rio: hovering cryptojacker
        air: true, plate: ['#fff06a', '#14904a', 'rgba(255,210,63,0.55)'], skin: FSKIN.deep, top: 'bare', legs: 'pants', legC: fPal('#ffffff', '#e2e2ec', '#8a8aa0'),
        belt: '#ffd23f', legStripe: '#14b04a', feet: 'bare', hands: 'bare', hair: 'dreads', hairC: '#1a1008', hat: 'bandana', hatC: fPal('#5aff9a', '#14b04a', '#06501e'),
        face: 'shades', accent: '#ffd23f', tattoo: true
      });
  };

  AH.ArtModules.stages['worlds.rio.sprites.62'] = function (C) {
    const { BOLT, GOLD, ell, glow, lg, reg2, trail } = C;

    reg2('bolt_capoeira', 22, 12, function (g) {
        trail(g, 6, 'rgba(255,210,63,0.6)');
        ell(g, 8, 6, 5.4, 5.4, lg(g, 3, 1, 13, 11, GOLD)); ell(g, 8, 6, 4, 4, 'rgba(255,255,255,0.18)');
        g.strokeStyle = '#7a4a04'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(7, 3); g.lineTo(7, 9); g.moveTo(7, 3); g.quadraticCurveTo(10.6, 3.2, 7, 6); g.quadraticCurveTo(11.4, 6.4, 7, 9); g.stroke();
      }, Object.assign({ glow: '#ffd23f' }, BOLT));
  };

  content.parts['SKINS_brazilsouth'] = function (C) {
    const { birdMacaw } = C;

    return { drone: birdMacaw };
  };

  content.parts['COINS_brazilsouth'] = function (C) {

    return 'R$';
  };

  content.parts['PROPS_balloon'] = function (C) {
    const { ell, lg, line, poly } = C;

    return [14, 24, function (g) {
          line(g, 7, 15, 7, 24, 0.7, '#e8e8f8');
          ell(g, 7, 8, 6, 7.4, lg(g, 2, 1, 12, 15, [[0, '#ffb0e0'], [0.5, '#ff2a9a'], [1, '#8a0a5a']])); poly(g, [[5, 15], [9, 15], [7, 17.2]], '#ff2a9a'); ell(g, 4.6, 5, 1.6, 2.6, 'rgba(255,255,255,0.55)');
        }];
  };
})();
