/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.pickups.66'] = function (C) {
    const { defs, ell, glow, lg, line, poly, reg2, rrect, shade } = C;

    Object.assign(C, { regCoins });
    const COINS = {
    westeurope: C.part('amsterdam', 'COINS_westeurope'),
    uksouth: C.part('london', 'COINS_uksouth'),
    japaneast: C.part('tokyo', 'COINS_japaneast'),
    australiaeast: C.part('sydney', 'COINS_australiaeast'),
    brazilsouth: C.part('rio', 'COINS_brazilsouth'),
    eastus: C.part('virginia', 'COINS_eastus'),
    eastus2: C.part('new-york', 'COINS_eastus2')
    };

    function regCoins(r) {
        [12, 8, 4, 8].forEach(function (cw, i) {
          reg2('coin_' + r + i, 14, 14, function (g) {
            const w = cw / 2;
            ell(g, 7, 7, w, 6.2, lg(g, 7 - w, 1, 7 + w, 13, [[0, '#fff3a0'], [0.4, '#ffd23f'], [1, '#c77800']]));
            if (w > 3) {
              ell(g, 7, 7, w - 1.3, 4.9, lg(g, 0, 2, 0, 12, [[0, '#ffe680'], [1, '#e89400']]));
              g.save(); g.translate(7, 7.4); g.scale(cw / 12, 1);
              g.fillStyle = '#8a4a00'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold ' + (COINS[r].length > 1 ? 5.6 : 8) + 'px monospace';
              g.fillText(COINS[r], 0, 0);
              g.restore();
              ell(g, 5.2, 3.8, 1.2, 0.7, 'rgba(255,255,255,0.9)', -0.5);
            } else rrect(g, 6.2, 1.4, 1.6, 11.2, 0.6, '#ffe680');
          }, { shade: 0.4 });
        });
        ['coin_' + r + '0', 'coin_' + r + '1', 'coin_' + r + '2', 'coin_' + r + '3'].forEach(function (k) { defs[k] = glow(defs[k], '#ffb000', 4); });
      }

    Object.keys(COINS).forEach(regCoins);

    const PROPS = {
    tulips: C.part('amsterdam', 'PROPS_tulips'),
    bike: C.part('amsterdam', 'PROPS_bike'),
    phone: C.part('london', 'PROPS_phone'),
    postbox: C.part('london', 'PROPS_postbox'),
    lantern: C.part('tokyo', 'PROPS_lantern'),
    carp: C.part('tokyo', 'PROPS_carp'),
    surf: C.part('sydney', 'PROPS_surf'),
    sign: C.part('sydney', 'PROPS_sign'),
    balloon: C.part('rio', 'PROPS_balloon'),
    kite: C.part('virginia', 'PROPS_kite'),
    hydrant: C.part('new-york', 'PROPS_hydrant'),
    newsbox: C.part('new-york', 'PROPS_newsbox')
    };

    Object.keys(PROPS).forEach(function (k) { reg2('prop_' + k, PROPS[k][0], PROPS[k][1], PROPS[k][2], { shade: 0.4 }); });

    const PU = {
        copilot: ['#ffffff', '#7fe8ff', function (g) { rrect(g, 5, 7, 10, 7, 3, '#1a3fb0'); ell(g, 8, 10.4, 1.3, 1.6, '#9ff0ff'); ell(g, 12, 10.4, 1.3, 1.6, '#9ff0ff'); line(g, 10, 7, 10, 4.5, 1, '#1a3fb0'); ell(g, 10, 4, 1.2, 1.2, '#ff7ad9'); }],
        defender: ['#9ff0ff', '#1a8fe0', function (g) { poly(g, [[10, 3.5], [15.5, 5.5], [15, 11], [10, 16], [5, 11], [4.5, 5.5]], '#ffffff'); poly(g, [[10, 6], [13, 7.2], [12.6, 10.4], [10, 13], [7.4, 10.4], [7, 7.2]], '#1a8fe0'); }],
        actions: ['#7dffa0', '#1c8f44', function (g) { poly(g, [[6.5, 4.5], [15.5, 10], [6.5, 15.5]], '#ffffff'); line(g, 4.5, 10, 7, 10, 1.2, '#d6ffe0'); }],
        powerbi: ['#ffe14a', '#c27a00', function (g) { rrect(g, 4.5, 11, 3, 5, 0.6, '#fff3b0'); rrect(g, 8.5, 7, 3, 9, 0.6, '#ffffff'); rrect(g, 12.5, 4, 3, 12, 0.6, '#fff3b0'); }],
        teams: ['#c9a0ff', '#5a2fd0', function (g) { rrect(g, 4, 5, 12, 3.4, 1, '#ffffff'); rrect(g, 8.3, 5, 3.4, 11, 1, '#ffffff'); }],
        spread: ['#ffd878', '#a54818', function (g) {
          rrect(g, 4, 8, 7, 4, 1, '#ffffff');
          for (const y of [5, 10, 15]) { line(g, 10, 10, 16, y, 1, '#fff3b0'); ell(g, 16, y, 1.4, 1.4, '#ffffff'); }
        }],
        pierce: ['#e4bdff', '#6134ad', function (g) {
          rrect(g, 3, 8, 7, 5, 1, '#ffffff');
          line(g, 9, 10, 18, 10, 2, '#c9a0ff');
          poly(g, [[14, 5], [18, 10], [14, 15], [16, 10]], '#ffffff');
        }]
      };

    Object.keys(PU).forEach((k) => {
        const d = PU[k];
        reg2('pu_' + k, 20, 20, function (g) {
          ell(g, 10, 10, 9, 9, lg(g, 3, 2, 17, 18, [[0, d[0]], [1, d[1]]]));
          ell(g, 10, 10, 7.6, 7.6, 'rgba(10,10,60,0.35)');
          d[2](g);
          ell(g, 6.5, 5.5, 2.2, 1.3, 'rgba(255,255,255,0.7)');
        }, { shade: 0, glow: d[0] });
      });

    Object.assign(C, { COINS, PROPS, PU });
  };
})();
