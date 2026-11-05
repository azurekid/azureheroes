/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['sydney'] = AH.Worlds['sydney'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['australiaeast'] = content;

  AH.ArtModules.stages['worlds.sydney.sprites.31'] = function (C) {
    const { EYE, ell, eyeGlow, lg, limb, line, poly } = C;

    Object.assign(C, { walkEmu });
    function walkEmu(f) {
        return function (g) {
          const o = f ? 2 : 0;
          limb(g, 15, 25, 12 + o, 35, 2.6, '#5a3a1a', '#8a6a3a', null); limb(g, 19, 25, 20 - o, 35, 2.6, '#5a3a1a', '#8a6a3a', null);
          poly(g, [[8 + o, 35], [14 + o, 35], [14 + o, 36.8], [7 + o, 36.8]], '#3a2410'); poly(g, [[16 - o, 35], [22 - o, 35], [22 - o, 36.8], [15 - o, 36.8]], '#3a2410');
          limb(g, 10, 18, 7, 8, 3.2, '#5a4a3a', '#8a7a62', '#b8a888');
          ell(g, 17, 20, 10.4, 7.4, lg(g, 8, 12, 26, 28, [[0, '#c8b088'], [0.5, '#8a6a3a'], [1, '#4a3016']]));
          ell(g, 27, 17.4, 4, 5, '#6a4a22');
          for (let i = 0; i < 5; i++) line(g, 11 + i * 3.4, 15, 10 + i * 3.4, 24, 0.6, 'rgba(255,230,180,0.35)');
          ell(g, 6.4, 5.6, 3.8, 3, '#8a7a62'); poly(g, [[3.4, 4.6], [0.4, 5.6], [3.4, 6.8]], '#ffb030');
          eyeGlow(g, 7, 4.6, 1, EYE); ell(g, 7, 4.6, 1.1, 1.1, EYE);
        };
      }
  };

  AH.ArtModules.stages['worlds.sydney.sprites.36'] = function (C) {
    const { birdFrame } = C;

    const birdCockatoo = birdFrame({ body: '#ffffff', bodyD: '#c8c8e0', wing: '#f0f0ff', wingD: '#a8a8c8', head: '#ffffff', crest: '#ffd23f', beak: '#5a5a70', tail: '#d8d8ee' });

    Object.assign(C, { birdCockatoo });
  };

  AH.ArtModules.stages['worlds.sydney.sprites.41'] = function (C) {
    const { EYE, ell, eyeGlow, lg, limb, poly } = C;

    Object.assign(C, { crawlCroc });
    function crawlCroc(f) {
        return function (g) {
          poly(g, [[0.4, 14], [9, 10], [9, 16], [0.4, 16.8]], '#1a6a2a');
          limb(g, 12, 15, 12 + (f ? 2.4 : -2.4), 19, 2.8, '#14501e', '#2a8a3a', null); limb(g, 21, 15, 21 + (f ? -2.4 : 2.4), 19, 2.8, '#14501e', '#2a8a3a', null);
          ell(g, 15, 12, 10.4, 4.6, lg(g, 5, 7, 5, 17, [[0, '#6ad84a'], [0.5, '#2a8a3a'], [1, '#14501e']]));
          for (let i = 0; i < 5; i++) poly(g, [[8 + i * 3.4, 8.6], [9.6 + i * 3.4, 6], [11.2 + i * 3.4, 8.8]], '#14501e');
          poly(g, [[22, 9.2], [31.6, 10.6], [31.6, 14.6], [22, 15.4]], lg(g, 22, 9, 22, 15, [[0, '#4ab83a'], [1, '#1a6a2a']]));
          for (let i = 0; i < 4; i++) poly(g, [[24 + i * 2, 14.8], [25 + i * 2, 12.8], [26 + i * 2, 14.8]], '#ffffff');
          ell(g, 24.6, 9.2, 2, 1.8, '#2a8a3a'); eyeGlow(g, 24.8, 9, 1, EYE); ell(g, 24.8, 9, 1.1, 1.1, EYE);
        };
      }
  };

  AH.ArtModules.stages['worlds.sydney.sprites.49'] = function (C) {
    const { FSKIN, fPal, fighterReg } = C;

    fighterReg('brawler', { // Sydney: botnet brawler
        skin: FSKIN.tan, top: 'tank', topC: fPal('#fff06a', '#e8c014', '#8a6a04'), legs: 'shorts', legC: fPal('#3ad07a', '#14904a', '#064a22'),
        feet: 'boots', footC: fPal('#9a7a54', '#5a3e24', '#2a1a0c'), hands: 'gloves', handC: fPal('#ff6a6a', '#d01a2a', '#5a0a10'),
        hair: 'buzz', hairC: '#b0642a', face: 'shades', facial: 'beard', accent: '#2ae07a'
      });
  };

  AH.ArtModules.stages['worlds.sydney.sprites.60'] = function (C) {
    const { BOLT, ell, glow, lg, line, reg2, rrect, trail } = C;

    reg2('bolt_brawler', 22, 12, function (g) {
        trail(g, 7, 'rgba(42,224,122,0.6)');
        line(g, 3, 2.4, 8, 2.4, 0.8, '#d8dce8'); line(g, 9, 2.4, 14, 2.4, 0.8, '#d8dce8'); line(g, 5.4, 2.4, 6.4, 4.6, 0.8, '#5a5e70'); line(g, 11.6, 2.4, 10.6, 4.6, 0.8, '#5a5e70');
        rrect(g, 4, 4.4, 9.6, 4.6, 1.6, lg(g, 0, 4, 0, 9, [[0, '#5aff9a'], [1, '#0a6a30']])); ell(g, 6, 6.6, 1.2, 1.2, '#ff2a3a');
      }, Object.assign({ glow: '#2ae07a' }, BOLT));
  };

  content.parts['SKINS_australiaeast'] = function (C) {
    const { birdCockatoo, crawlCroc, walkEmu } = C;

    return { robot: walkEmu, drone: birdCockatoo, spider: crawlCroc };
  };

  content.parts['COINS_australiaeast'] = function (C) {

    return 'A$';
  };

  content.parts['PROPS_surf'] = function (C) {
    const { ell, line } = C;

    return [22, 30, function (g) {
          [[6, 4, '#ff2a9a', -0.18], [11, 3, '#27e0ff', 0], [16, 4, '#ffd23f', 0.18]].forEach((b) => { ell(g, b[0], 15, 3.8, 13, b[2], b[3]); line(g, b[0] - b[3] * 12, 4, b[0] + b[3] * 12, 26, 0.7, 'rgba(255,255,255,0.8)'); });
        }];
  };

  content.parts['PROPS_sign'] = function (C) {
    const { ell, poly, rrect } = C;

    return [20, 30, function (g) {
          rrect(g, 9, 14, 2.4, 16, 0.6, '#8a8aa8'); poly(g, [[10, 0.6], [19.4, 8], [10, 15.6], [0.6, 8]], '#ffd23f'); poly(g, [[10, 2.6], [17.4, 8], [10, 13.6], [2.6, 8]], '#14062a');
          ell(g, 9, 8.4, 3.2, 2.2, '#ffd23f'); ell(g, 12, 5.4, 1.4, 1.8, '#ffd23f'); poly(g, [[6, 9], [3.4, 11.4], [6.4, 11]], '#ffd23f');
        }];
  };

  content.parts['OBST_outback4x4'] = function (C) {
    const { outback4x4 } = C;

    return [88, 44, outback4x4];
  };

  content.parts['OBST_lifeguard'] = function (C) {
    const { lg, line, poly, rrect, txt } = C;

    return [34, 52, function (g) {
          [[6, 52, 10, 22], [28, 52, 24, 22]].forEach(function (l) { line(g, l[0], l[1], l[2], l[3], 1.8, '#e8e0f8'); });
          line(g, 8, 40, 26, 40, 1.2, '#e8e0f8');
          rrect(g, 4, 10, 26, 14, 1.4, lg(g, 0, 10, 0, 24, [[0, '#ffe14a'], [1, '#e89400']]));
          poly(g, [[1, 11], [17, 1], [33, 11]], '#ff2a4a'); g.fillStyle = 'rgba(10,10,40,0.7)'; g.fillRect(8, 13, 18, 6);
          txt(g, 'SURF', 11, 19.4, 0.5, '#ff2a4a');
        }];
  };
})();
