/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.skins.28'] = function (C) {
    const { ell, eyeGlow } = C;

    Object.assign(C, { eyes });
    const EYE = '#ff2a4a';

    function eyes(g, x1, x2, y, r) {
        [x1, x2].forEach(function (x) { eyeGlow(g, x, y, r, EYE); ell(g, x, y, r * 1.1, r * 1.1, EYE); ell(g, x - r * 0.3, y - r * 0.4, r * 0.35, r * 0.35, '#ffffff'); });
      }

    const GOLD = [[0, '#fff3a0'], [0.5, '#ffd23f'], [1, '#c77800']];

    Object.assign(C, { EYE, GOLD });
  };

  AH.ArtModules.stages['art.skins.35'] = function (C) {
    const { EYE, ell, eyeGlow, lg, poly } = C;

    Object.assign(C, { birdFrame });
    function birdFrame(o) {
        return function (f) {
          return function (g) {
            const up = f ? -6.4 : 5;
            poly(g, [[14, 11], [9, 11 + up * 0.2], [6, 12 + up], [13, 14]], o.wingD);
            poly(g, [[9, 13], [0.8, 10.6], [0.8, 16], [10, 16]], o.tail);
            ell(g, 16, 13.4, 8.4, 5.2, lg(g, 8, 8, 24, 19, [[0, o.body], [1, o.bodyD || o.body]]));
            poly(g, [[15, 11], [11, 9.6], [6.6, 10 + up], [8.4, 13 + up * 0.4], [19, 13.6]], lg(g, 6, 9, 19, 14, [[0, o.wing], [1, o.wingD]]));
            if (o.crest) poly(g, [[21, 7.4], [19.4, 1.6], [23.4, 5.4], [24.4, 0.6], [26, 6.4]], o.crest);
            ell(g, 24, 10.4, 4.2, 3.8, o.head);
            if (o.patch) ell(g, 25.6, 11, 2.4, 2, o.patch);
            poly(g, [[27, 9.6], [31.6, 11], [27.4, 13]], o.beak);
            eyeGlow(g, 25.4, 9.4, 1, EYE); ell(g, 25.4, 9.4, 1.1, 1.1, EYE);
          };
        };
      }

    const birdRaven = birdFrame({ body: '#2a2a5a', bodyD: '#10102a', wing: '#3a3a7a', wingD: '#10102a', head: '#1a1a3a', beak: '#ffb030', tail: '#10102a' });

    Object.assign(C, { birdRaven });
  };

  AH.ArtModules.stages['art.skins.42'] = function (C) {
    const { ell, eyes, lg, limb, line, reg2, shade } = C;

    Object.assign(C, { crawlCrab, regSkins });
    function crawlCrab(f) {
        return function (g) {
          for (let i = 0; i < 3; i++) {
            const w = (f + i) % 2 ? 1.4 : 0;
            limb(g, 10 + i * 4, 14, 7 + i * 3.4, 19 - w, 1.6, '#14339e', '#2a6aff', null);
            limb(g, 20 + i * 2, 14, 24 + i * 2.6, 19 - w, 1.6, '#14339e', '#2a6aff', null);
          }
          const c = f ? 1.4 : 0;
          limb(g, 8, 11, 4, 6 - c, 2.4, '#14339e', '#2a6aff', null); ell(g, 3.4, 5 - c, 3, 2.6, lg(g, 1, 2, 6, 8, [[0, '#ffa050'], [1, '#d84a1a']]));
          limb(g, 24, 11, 28, 6 - c * 0.5, 2.4, '#14339e', '#2a6aff', null); ell(g, 28.6, 5 - c * 0.5, 3, 2.6, lg(g, 26, 2, 31, 8, [[0, '#ffa050'], [1, '#d84a1a']]));
          ell(g, 16, 12.4, 11.4, 5.4, lg(g, 5, 7, 25, 18, [[0, '#8ab4ff'], [0.5, '#2a6aff'], [1, '#14339e']]));
          line(g, 12, 9, 12, 5.6, 1, '#14339e'); line(g, 20, 9, 20, 5.6, 1, '#14339e'); eyes(g, 12, 20, 5, 1);
        };
      }

    const SKINS = {
    westeurope: C.part('amsterdam', 'SKINS_westeurope'),
    uksouth: C.part('london', 'SKINS_uksouth'),
    japaneast: C.part('tokyo', 'SKINS_japaneast'),
    australiaeast: C.part('sydney', 'SKINS_australiaeast'),
    brazilsouth: C.part('rio', 'SKINS_brazilsouth'),
    eastus: C.part('virginia', 'SKINS_eastus'),
    eastus2: C.part('new-york', 'SKINS_eastus2')
    };

    const SKIN_SIZE = { robot: [32, 37], drone: [32, 24], spider: [32, 20] };

    const skinKeys = [];

    function regSkins(r) {
        Object.keys(SKINS[r]).forEach(function (t) {
          skinKeys.push('en_' + r + '_' + t);
          for (let f = 0; f < 2; f++) reg2('en_' + r + '_' + t + '_' + f, SKIN_SIZE[t][0], SKIN_SIZE[t][1], SKINS[r][t](f), { shade: 0.5 });
        });
      }

    Object.keys(SKINS).forEach(regSkins);

    Object.assign(C, { SKINS, SKIN_SIZE, skinKeys });
  };
})();
