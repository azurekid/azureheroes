/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.obstacles.71'] = function (C) {
    const { outback4x4, reg2, shade } = C;

    Object.assign(C, { regOb });
    const OBST = {
    bus: C.part('london', 'OBST_bus'),
    cab: C.part('london', 'OBST_cab'),
    flowers: C.part('amsterdam', 'OBST_flowers'),
    bikes: C.part('amsterdam', 'OBST_bikes'),
    icecream: C.part('venice', 'OBST_icecream'),
    outback4x4: C.part('sydney', 'OBST_outback4x4'),
    lifeguard: C.part('sydney', 'OBST_lifeguard')
    };

    const obSize = {};

    function regOb(k, w, h, fn) {
        const scale = { cab: 1.5, taxi: 1.5, bikes: 1.4, vespa: 1.3, fiat: 1.3 }[k] || 1;
        obSize[k] = [Math.round(w * scale), Math.round(h * scale)];
        reg2('ob_' + k, obSize[k][0], obSize[k][1], function (g) {
          g.save(); g.scale(scale, scale); fn(g, w, h); g.restore();
        }, { shade: 0.45 });
      }

    Object.keys(OBST).forEach(function (k) { regOb(k, OBST[k][0], OBST[k][1], OBST[k][2]); });

    Object.assign(C, { OBST, obSize });
  };
})();
