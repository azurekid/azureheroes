/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.ambient.86'] = function (C) {
    const { ell, lg, line, lit, msLogo, outback4x4, poly, reg2, rrect, shade, txt, wheels } = C;
    const pigeon = (...args) => C.pigeon(...args);

    Object.assign(C, { commuterTrain });
    reg2('amb_plane', 72, 22, function (g) {
        poly(g, [[60, 9], [70, 1], [72, 1], [70, 11]], lg(g, 60, 0, 72, 12, [[0, '#2f6bff'], [1, '#0a2a8a']]));
        rrect(g, 4, 8, 66, 9, 4.4, lg(g, 0, 8, 0, 17, [[0, '#ffffff'], [0.6, '#d8e0f4'], [1, '#8a94c0']]));
        poly(g, [[4, 12.6], [0.4, 13.6], [4, 15.6]], '#c8d0ea');
        rrect(g, 5, 9.4, 4, 2.4, 1, '#14205a');
        for (let x = 12; x < 58; x += 3.2) ell(g, x, 11.4, 0.8, 0.9, '#2a4aa8');
        g.fillStyle = '#2f6bff'; g.fillRect(8, 14.4, 60, 1.2);
        msLogo(g, 63, 3.4, 4.4);
        txt(g, 'AZURE AIR', 24, 13.8, 0.4, '#2f6bff');
        poly(g, [[30, 14], [46, 14], [52, 21], [46, 21.4]], lg(g, 30, 14, 52, 21, [[0, '#a8b0d8'], [1, '#5a6290']]));
        rrect(g, 38, 17.4, 7, 3, 1.4, '#6a7298');
        poly(g, [[62, 13], [68, 13], [70, 17], [66, 17]], '#8a94c0');
        ell(g, 6.4, 16, 0.9, 0.9, '#ff2a4a'); ell(g, 70.6, 1.6, 0.9, 0.9, '#ffffff');
      }, { shade: 0.3 });

    for (let f = 0; f < 2; f++) reg2('amb_heli_' + f, 44, 20, function (g) {
        line(g, f ? 4 : 10, 2.4, f ? 40 : 34, 2.4, 1, '#14082a');
        rrect(g, 20, 2, 2, 4, 0.6, '#14082a');
        ell(g, 16, 11, 9, 6.4, lg(g, 8, 5, 24, 17, [[0, '#ff5a6a'], [1, '#9a1a3a']]));
        poly(g, [[22, 9], [40, 9.6], [40, 12], [22, 13.6]], '#c02a4a');
        poly(g, [[38, 5], [42, 5], [41, 12], [38, 12]], '#c02a4a');
        ell(g, 41, 9.6, 3, 3, 'rgba(255,255,255,0.35)');
        ell(g, 11.6, 9.4, 4.6, 3.6, lg(g, 7, 6, 15, 13, [[0, '#d8f4ff'], [1, '#4a8ac8']]));
        line(g, 8, 18.4, 24, 18.4, 1, '#14082a'); line(g, 12, 16, 11, 18.4, 0.8, '#14082a'); line(g, 20, 16, 21, 18.4, 0.8, '#14082a');
        ell(g, 6, 12, 1, 1, '#ffffff');
      }, { shade: 0.3 });

    [['#ff2a6a', '#ffd23f', '#ff7a2a'], ['#27e0ff', '#ffffff', '#2f6bff'], ['#7dff7a', '#ffe14a', '#c04bff'], ['#f25022', '#7fba00', '#00a4ef']].forEach(function (c, i) {
        reg2('amb_balloon_' + i, 28, 42, function (g) {
          g.save(); g.beginPath(); g.ellipse(14, 13, 12.6, 13, 0, 0, Math.PI * 2); g.clip();
          for (let k = 0; k < 7; k++) { g.fillStyle = c[k % 3]; g.beginPath(); g.ellipse(14, 13, 12.6 * (1 - k / 7), 13, 0, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(0, 8, 28, 2); g.fillStyle = 'rgba(10,6,40,0.25)'; g.fillRect(0, 18, 28, 2);
          g.restore();
          poly(g, [[4, 21], [24, 21], [18, 29], [10, 29]], c[0]);
          ell(g, 9, 7, 3, 4, 'rgba(255,255,255,0.4)');
          line(g, 10.4, 29, 11, 35, 0.5, '#2a1a3a'); line(g, 17.6, 29, 17, 35, 0.5, '#2a1a3a');
          rrect(g, 10, 34.6, 8, 6, 1, lg(g, 0, 35, 0, 41, [[0, '#c8864a'], [1, '#5a3020']]));
          if (i === 3) msLogo(g, 10.2, 9.4, 7.6);
          ell(g, 14, 31.4, 1.6, 1.6, 'rgba(255,200,80,0.8)');
        }, { shade: 0.35 });
      });

    reg2('amb_blimp', 96, 32, function (g) {
        ell(g, 48, 14, 44, 12.6, lg(g, 0, 2, 0, 27, [[0, '#f4f4ff'], [0.5, '#b8bcd8'], [1, '#5a5e88']]));
        poly(g, [[82, 12], [95, 2], [95, 12]], '#107c10'); poly(g, [[82, 16], [95, 26], [95, 16]], '#107c10');
        rrect(g, 38, 24, 20, 6, 2, '#3a3e60'); for (let x = 41; x < 56; x += 4) lit(g, x, 25.4, 2.4, 2.6, '#ffe9a0');
        ell(g, 22, 14, 7.4, 7.4, lg(g, 15, 7, 29, 21, [[0, '#7dff7a'], [1, '#107c10']]));
        line(g, 18.4, 10.2, 25.6, 17.8, 1.8, '#ffffff'); line(g, 25.6, 10.2, 18.4, 17.8, 1.8, '#ffffff');
        txt(g, 'XBOX', 34, 8.6, 1, '#107c10');
        txt(g, 'GAME PASS', 34, 16, 0.5, '#2a2e50');
      }, { shade: 0.3 });

    const AMB_BIRDS = {
        gull: ['#ffffff', '#c8c8e0', '#ffb030'], pigeon: ['#9a98c0', '#5a587a', '#ff9a6a'], parrot: ['#ff3a3a', '#2a8aff', '#ffd23f'],
        crow: ['#2a2a4a', '#10102a', '#3a3a5a'], cockatoo: ['#ffffff', '#d8d8ee', '#ffd23f'], crane: ['#ffffff', '#20203a', '#ff2a3a']
      };

    Object.keys(AMB_BIRDS).forEach(function (k) {
        const c = AMB_BIRDS[k];
        for (let f = 0; f < 2; f++) reg2('amb_bird_' + k + '_' + f, 16, 12, function (g) {
          const u = f ? -4.4 : 3.6;
          if (k === 'pigeon') {
            const wing = f ? -0.5 : 8.5;
            poly(g, [[6, 6], [3, 3 + wing], [1, 2 + wing], [3, 7]], '#525e73');
            poly(g, [[5, 7], [0.5, 6], [0.5, 9], [6, 8.5]], '#3f4960');
            ell(g, 7, 7.5, 4, 2.2, '#aeb8c2');
            ell(g, 10.5, 6.7, 1.8, 2.2, '#507e78');
            ell(g, 11.6, 5.2, 2, 1.8, '#687e91');
            poly(g, [[13, 5.2], [15.4, 6], [13, 6.5]], '#c4b8aa');
            poly(g, [[6, 6], [4, 2 + wing], [2, 1 + wing], [3.5, 5 + wing * 0.5], [8.5, 7]], '#bcc6d0');
            line(g, 4.3, 4.4 + wing * 0.5, 6.5, 5.8, 0.7, '#46536a');
            ell(g, 12.1, 4.9, 0.45, 0.45, '#0a0620');
            return;
          }
          poly(g, [[7, 6.4], [9.4, 6.2], [5, 6 + u], [3.4, 6.4 + u * 0.8]], c[1]);
          ell(g, 8, 7, 4.6, 1.8, c[0]);
          poly(g, [[12, 7], [15, 7.6], [12, 8.2]], c[2]);
          ell(g, 3.6, 7, 1.8, 1, c[1]);
          poly(g, [[7.6, 6.6], [10.4, 6.4], [12, 6 + u], [9.4, 5.8 + u * 0.7]], c[0]);
          if (k === 'crane') ell(g, 3, 3, 1, 1, c[2]);
          ell(g, 11.6, 6.4, 0.5, 0.5, '#0a0620');
        }, { shade: 0.2 });
      });

    const CARS = {
    taxi: C.part('new-york', 'CARS_taxi'),
    mtabus: C.part('new-york', 'CARS_mtabus'),
    pickup: C.part('virginia', 'CARS_pickup'),
    muscle: C.part('virginia', 'CARS_muscle'),
    schoolbus: C.part('virginia', 'CARS_schoolbus'),
    redbus: C.part('london', 'CARS_redbus'),
    cab: C.part('london', 'CARS_cab'),
    mini: C.part('london', 'CARS_mini'),
    citroen: C.part('paris', 'CARS_citroen'),
    vespa: C.part('venice', 'CARS_vespa'),
    tram: C.part('amsterdam', 'CARS_tram'),
    outback4x4: C.part('sydney', 'CARS_outback4x4'),
    cyclist: C.part('amsterdam', 'CARS_cyclist')
    };

    Object.keys(CARS).forEach(function (k) { reg2('amb_car_' + k, CARS[k][0], CARS[k][1], function (g, w, h) { CARS[k][2](g, w, h); }, { shade: 0.35 }); });

    function commuterTrain(g, style) {
        const body = style.body, stripe = style.stripe;
        for (let car = 0; car < 2; car++) {
          const x = car * 124;
          rrect(g, x + 2, 5, 119, 32, 6, lg(g, 0, 5, 0, 37, [[0, style.top], [0.5, body], [1, style.bottom]]));
          g.fillStyle = stripe; g.fillRect(x + 4, style.stripeY, 114, style.stripeH);
          for (let win = 0; win < 6; win++) { const wx = x + 13 + win * 16; rrect(g, wx, 14, 11, 9, 1, '#19354b'); lit(g, wx + 1, 15, 9, 6, '#b7d9de'); }
          [29, 92].forEach((dx) => {
            g.fillStyle = style.door; g.fillRect(x + dx, 10, 13, 25);
            lit(g, x + dx + 2, 14, 9, 11, '#b2d8de'); line(g, x + dx + 6.5, 12, x + dx + 6.5, 34, 0.7, '#4e616a');
          });
          wheels(g, [x + 25, x + 99], 40, 4);
          line(g, x + 42, 5, x + 49, 0, 0.8, '#364e5d'); line(g, x + 49, 0, x + 57, 5, 0.8, '#364e5d');
          txt(g, style.label, x + 47, 7, 0.46, '#19384e');
          lit(g, x + 4, 13, 6, 12, '#a6cfdf'); ell(g, x + 5, 31, 1.5, 1, '#fff6b8');
        }
        g.fillStyle = '#344654'; g.fillRect(121, 13, 5, 21);
      }

    Object.assign(C, { AMB_BIRDS, CARS });
  };

  AH.ArtModules.stages['art.ambient.90'] = function (C) {
    const { FLAT, ell, lg, line, poly, reg2, shade } = C;

    reg2('amb_rail', 128, 22, function (g) {
        g.fillStyle = '#526674'; g.fillRect(0, 1, 128, 4);
        line(g, 0, 0.5, 128, 0.5, 0.8, '#87969a');
        for (let x = 4; x < 128; x += 8) line(g, x, 0, x + 2, 3, 0.7, '#455968');
        g.fillStyle = lg(g, 0, 5, 0, 22, [[0, '#697d85'], [1, '#455d6c']]); g.fillRect(60, 5, 5, 17);
        poly(g, [[55, 5], [70, 5], [65, 10], [60, 10]], '#596f7b');
        line(g, 61, 10, 61, 22, 0.6, '#819298');
      }, FLAT);

    reg2('amb_football', 10, 6, function (g) { ell(g, 5, 3, 4.6, 2.6, lg(g, 0, 0, 0, 6, [[0, '#c8682a'], [1, '#5a2a10']])); line(g, 3, 3, 7, 3, 0.5, '#ffffff'); [4, 5, 6].forEach((x) => line(g, x, 2.4, x, 3.6, 0.4, '#ffffff')); }, { shade: 0.2 });

    reg2('amb_baseball', 6, 6, function (g) { ell(g, 3, 3, 2.6, 2.6, '#ffffff'); g.strokeStyle = '#ff2a3a'; g.lineWidth = 0.4; g.beginPath(); g.arc(0.6, 3, 1.8, -1, 1); g.stroke(); g.beginPath(); g.arc(5.4, 3, 1.8, 2.1, 4.2); g.stroke(); }, { shade: 0.2 });

    reg2('amb_petal', 5, 4, function (g) { ell(g, 2.5, 2, 2.2, 1.4, '#ffc0dc', 0.4); ell(g, 2, 1.6, 0.8, 0.5, '#ffffff'); }, FLAT);

    reg2('amb_leaf', 6, 5, function (g) { ell(g, 3, 2.5, 2.6, 1.6, '#ff8a2a', -0.5); line(g, 1, 4, 5, 1, 0.3, '#8a3a10'); }, FLAT);

    reg2('amb_confetti', 3, 3, function (g) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 3, 3); }, FLAT);

    reg2('amb_road', 64, 8, function (g) {
        g.fillStyle = '#748793'; g.fillRect(0, 0, 64, 1);
        g.fillStyle = lg(g, 0, 1, 0, 6, [[0, '#455b6d'], [1, '#344858']]); g.fillRect(0, 1, 64, 5);
        g.fillStyle = '#8c9b9d'; for (let x = 3; x < 64; x += 20) g.fillRect(x, 3.4, 6, 0.5);
        g.fillStyle = '#5c7180'; g.fillRect(0, 6, 64, 2);
      }, FLAT);

    reg2('amb_trail', 8, 2, function (g) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(0, 0, 8, 2); }, FLAT);
  };
})();
