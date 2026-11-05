/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['london'] = AH.Worlds['london'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['uksouth'] = content;

  AH.ArtModules.stages['worlds.london.sprites.30'] = function (C) {
    const { ell, eyes, lg, limb, line, poly, rrect } = C;

    Object.assign(C, { walkGuard });
    function walkGuard(f) {
        return function (g) {
          const o = f ? 2 : 0;
          limb(g, 12.6, 26, 11.6 + o, 34.6, 5, '#0a0a1c', '#1a1a38', '#3a3a6a'); limb(g, 19.4, 26, 20.4 - o, 34.6, 5, '#0a0a1c', '#1a1a38', '#3a3a6a');
          rrect(g, 7.6 + o, 34, 8.4, 3, 1.4, '#050510'); rrect(g, 16 - o, 34, 8.4, 3, 1.4, '#050510');
          limb(g, 7, 15, 4, 24, 4.4, '#6a0a14', '#c81a2a', '#ff6a7a'); ell(g, 3.6, 25.4, 2.6, 2.6, '#f0f0ff');
          limb(g, 25, 15, 28, 24, 4.4, '#6a0a14', '#c81a2a', '#ff6a7a'); ell(g, 28.4, 25.4, 2.6, 2.6, '#f0f0ff');
          rrect(g, 7, 13, 18, 15, 3, lg(g, 7, 13, 25, 28, [[0, '#ff5a6a'], [0.4, '#c81a2a'], [1, '#6a0a14']]));
          line(g, 9, 14, 23, 26, 1.5, '#f0f0ff'); line(g, 23, 14, 9, 26, 1.5, '#f0f0ff');
          [[16, 17], [16, 21], [16, 25]].forEach((p) => ell(g, p[0], p[1], 0.9, 0.9, '#ffd23f'));
          rrect(g, 7, 25, 18, 2.2, 0.8, '#0a0a1c');
          ell(g, 16, 12, 5, 4.6, lg(g, 11, 8, 21, 16, [[0, '#ffd2ad'], [1, '#c98a66']]));
          rrect(g, 11.6, 10.6, 8.8, 2.8, 1.2, '#14062a'); eyes(g, 14, 18, 12, 1);
          poly(g, [[9, 9], [9.6, 2], [13, 0.2], [19, 0.2], [22.4, 2], [23, 9], [20, 7.4], [12, 7.4]], lg(g, 9, 0, 23, 9, [[0, '#4a4a6a'], [0.4, '#1a1a2a'], [1, '#050510']]));
          line(g, 12, 2.6, 13, 6, 0.6, 'rgba(180,180,220,0.6)'); line(g, 17, 1.4, 17.4, 6, 0.6, 'rgba(180,180,220,0.6)'); line(g, 21, 2.6, 20.4, 6, 0.6, 'rgba(180,180,220,0.6)');
          line(g, 12, 15.6, 20, 15.6, 0.7, '#ffd23f');
        };
      }
  };

  AH.ArtModules.stages['worlds.london.sprites.40'] = function (C) {
    const { ell, eyes, lg, line, rrect } = C;

    Object.assign(C, { crawlCab });
    function crawlCab(f) {
        return function (g) {
          rrect(g, 2, 8, 28, 8, 2.4, lg(g, 2, 8, 2, 16, [[0, '#5a5a82'], [1, '#10102a']]));
          rrect(g, 8, 3.4, 15, 6, 2.4, lg(g, 8, 3, 8, 9, [[0, '#5a5a82'], [1, '#10102a']]));
          rrect(g, 9.6, 4.8, 5.6, 3.6, 1, '#0d0424'); rrect(g, 16.4, 4.8, 5.4, 3.6, 1, '#0d0424'); eyes(g, 12.4, 19, 6.6, 0.9);
          rrect(g, 13, 1.2, 6, 2.4, 0.8, '#ffd23f'); line(g, 3, 12, 29, 12, 0.9, '#ffd23f');
          ell(g, 29, 10.6, 1.6, 1.6, '#fff3a0'); ell(g, 3, 10.6, 1.2, 1.2, '#ff2a4a');
          [9, 23].forEach((x) => { ell(g, x, 16, 3.4, 3.4, '#0a0418'); ell(g, x, 16, 1.5, 1.5, '#c4e6ff'); const a = f ? 0.8 : 0; line(g, x - Math.cos(a) * 3, 16 - Math.sin(a) * 3, x + Math.cos(a) * 3, 16 + Math.sin(a) * 3, 0.7, '#7a7ea0'); });
        };
      }
  };

  AH.ArtModules.stages['worlds.london.sprites.46'] = function (C) {
    const { FSKIN, fPal, fighterReg, line, rrect } = C;

    fighterReg('kingpin', { // London: bare-knuckle phishing boss
        skin: FSKIN.pale, top: 'waistcoat', topC: fPal('#5e5e70', '#3a3a4a', '#1a1a24'), top2: fPal('#ffffff', '#dadae6', '#8a8aa0'), tie: '#8a1020',
        sleeve: 'rolled', sleeveC: fPal('#ffffff', '#dadae6', '#8a8aa0'), legs: 'pants', legC: fPal('#50505e', '#30303c', '#14141c'),
        feet: 'boots', footC: fPal('#7a5434', '#4a2e18', '#1e1008'), hands: 'brass', hair: 'slick', hairC: '#3a2a1c',
        hat: 'flatcap', hatC: fPal('#8e7e5c', '#5e5038', '#2a2416'), facial: 'mustache', accent: '#27d0ff',
        front: function (g, P, T, S) {
          if (S.stun) return;
          const p = T.at(0.5, 3.2);
          rrect(g, p[0] - 1, p[1] - 3.4, 5, 3.4, 0.5, 'rgba(39,208,255,0.9)'); line(g, p[0] - 1, p[1] - 3.4, p[0] + 1.5, p[1] - 1.6, 0.5, '#ffffff'); line(g, p[0] + 4, p[1] - 3.4, p[0] + 1.5, p[1] - 1.6, 0.5, '#ffffff');
          rrect(g, p[0] - 1.6, p[1] - 0.6, 6.2, 2.6, 0.4, '#24242e');
        }
      });
  };

  AH.ArtModules.stages['worlds.london.sprites.57'] = function (C) {
    const { BOLT, glow, line, reg2, rrect, trail } = C;

    reg2('bolt_kingpin', 22, 12, function (g) {
        trail(g, 6, 'rgba(39,208,255,0.7)');
        rrect(g, 2, 2.4, 11.6, 7.4, 0.8, '#f4f8ff'); line(g, 2, 2.6, 7.8, 6.6, 0.8, '#7a8aa8'); line(g, 13.6, 2.6, 7.8, 6.6, 0.8, '#7a8aa8');
        g.strokeStyle = '#27d0ff'; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(16, 1.6); g.lineTo(16, 7); g.arc(13.8, 7, 2.2, 0, Math.PI * 0.85); g.stroke();
      }, Object.assign({ glow: '#27d0ff' }, BOLT));
  };

  content.parts['SKINS_uksouth'] = function (C) {
    const { birdRaven, crawlCab, walkGuard } = C;

    return { robot: walkGuard, drone: birdRaven, spider: crawlCab };
  };

  content.parts['COINS_uksouth'] = function (C) {

    return '\u00A3';
  };

  content.parts['PROPS_phone'] = function (C) {
    const { lg, rrect } = C;

    return [14, 28, function (g) {
          rrect(g, 1, 3, 12, 25, 1.4, lg(g, 1, 3, 13, 28, [[0, '#ff5a5a'], [1, '#a81818']])); rrect(g, 0, 0.8, 14, 3.6, 1.2, '#c81a1a');
          for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) rrect(g, 2.6 + c * 4.8, 6 + r * 5.6, 3.8, 4.6, 0.5, 'rgba(255,240,170,0.85)');
          rrect(g, 3, 23.4, 8, 3, 0.6, '#7a1010');
        }];
  };

  content.parts['PROPS_postbox'] = function (C) {
    const { ell, lg, rrect } = C;

    return [12, 18, function (g) {
          rrect(g, 1, 3, 10, 15, 2, lg(g, 1, 3, 11, 18, [[0, '#ff6a6a'], [1, '#a81818']])); ell(g, 6, 3, 5.4, 2.4, '#c81a1a');
          rrect(g, 2.4, 7, 7.2, 1.8, 0.6, '#14062a'); rrect(g, 1, 14, 10, 1.4, 0.4, '#7a1010');
        }];
  };

  content.parts['OBST_bus'] = function (C) {
    const { ell, lg, lit, msLogo, rrect, txt } = C;

    return [96, 56, function (g) {
          rrect(g, 1, 2, 94, 46, 4, lg(g, 0, 2, 0, 48, [[0, '#ff5a5a'], [0.5, '#d81a2a'], [1, '#8a0a1a']]));
          for (let r = 0; r < 2; r++) for (let x = 6; x < 90; x += 12) { g.fillStyle = '#1a0a2a'; g.fillRect(x, 6 + r * 20, 10, 10); lit(g, x + 0.6, 6.6 + r * 20, 8.8, 8.8, r ? '#ffd090' : '#ffe9c0'); }
          g.fillStyle = '#ffe9c0'; g.fillRect(1, 18, 94, 1); g.fillRect(1, 38, 94, 1);
          rrect(g, 20, 40, 56, 7, 1, '#ffffff'); msLogo(g, 22, 41, 5); txt(g, 'MICROSOFT AZURE', 29, 41.6, 0.5, '#0a3a8a');
          [18, 78].forEach(function (x) { ell(g, x, 49, 6.6, 6.6, '#14082a'); ell(g, x, 49, 2.8, 2.8, '#b8b8d8'); });
          g.fillStyle = '#1a0a2a'; g.fillRect(84, 8, 10, 3); txt(g, '27', 85, 8.4, 0.5, '#ffe14a');
        }];
  };

  content.parts['OBST_cab'] = function (C) {
    const { ell, lg, poly, rrect, txt } = C;

    return [48, 28, function (g) {
          poly(g, [[2, 14], [10, 4], [36, 4], [44, 13], [47, 15], [47, 24], [1, 24], [1, 15]], lg(g, 0, 4, 0, 24, [[0, '#5a5a7a'], [0.4, '#22223a'], [1, '#0a0a18']]));
          g.fillStyle = 'rgba(160,200,255,0.75)'; poly(g, [[11, 6], [22, 6], [22, 13], [5, 13]], g.fillStyle); poly(g, [[24, 6], [35, 6], [42, 13], [24, 13]], 'rgba(160,200,255,0.75)');
          rrect(g, 20, 1.6, 8, 3, 1, '#ffd23f'); txt(g, 'TAXI', 21, 2, 0.4, '#1a0a2a');
          [11, 37].forEach(function (x) { ell(g, x, 24, 4.4, 4.4, '#0a0614'); ell(g, x, 24, 2, 2, '#a8a8c8'); });
          ell(g, 45.4, 17, 1.6, 1.4, '#fff6c0');
        }];
  };
})();
