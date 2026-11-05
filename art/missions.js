/* Shared mission equipment and faceted Azure gems. */
(function () {
  'use strict';
  const AH = window.AH;
  AH.ArtModules.stages['art.missions'] = function (C) {
    const { reg2, poly, rrect, ell, lg, line } = C;
    reg2('mission_gem', 26, 28, (g) => {
      ell(g, 13, 14, 12, 12, 'rgba(255,85,220,0.12)');
      poly(g, [[13, 2], [22, 8], [20, 19], [13, 26], [6, 19], [4, 8]], '#422090');
      poly(g, [[13, 3], [21, 8], [13, 12], [5, 8]], '#f5baff');
      poly(g, [[5, 9], [13, 13], [13, 24], [7, 18]], '#a657e8');
      poly(g, [[21, 9], [19, 18], [13, 24], [13, 13]], '#ff56d4');
      poly(g, [[13, 5], [16, 9], [13, 11], [10, 9]], '#ffffff');
      line(g, 4, 3, 4, 8, '#dffaff', 1);
      line(g, 2, 5, 6, 5, '#dffaff', 1);
    }, { shade: 0.2 });
    reg2('mission_cache', 36, 34, (g) => {
      rrect(g, 2, 5, 32, 27, 3, lg(g, 0, 5, 0, 32, [[0, '#4673a0'], [1, '#122840']]));
      rrect(g, 5, 9, 26, 18, 2, '#0b152d');
      [[6, 6], [27, 6], [6, 28], [27, 28]].forEach(([x, y]) => rrect(g, x, y, 3, 3, 0.5, '#a2cde1'));
      ell(g, 14, 17, 5, 5, '#ffe14a');
      ell(g, 14, 17, 2, 2, '#122840');
      rrect(g, 18, 16, 10, 3, 1, '#ffe14a');
      rrect(g, 24, 18, 3, 4, 0.5, '#ffe14a');
      line(g, 11, 3, 25, 3, '#4df2ff', 2);
    }, { shade: 0.2 });
    reg2('mission_relay', 40, 42, (g) => {
      rrect(g, 3, 12, 34, 28, 3, lg(g, 0, 12, 0, 40, [[0, '#667a9e'], [1, '#18253d']]));
      rrect(g, 7, 16, 26, 16, 2, '#08192d');
      poly(g, [[20, 17], [30, 20], [28, 27], [20, 31], [12, 27], [10, 20]], '#27d8f6');
      poly(g, [[20, 20], [25, 22], [24, 26], [20, 28], [16, 26], [15, 22]], '#174f8b');
      line(g, 20, 12, 20, 5, '#bdeeff', 2);
      ell(g, 20, 4, 3, 3, '#ffe14a');
      [10, 16, 22, 28].forEach((x) => rrect(g, x, 35, 3, 2, 0.5, '#4dff7a'));
    }, { shade: 0.2 });
    reg2('mission_scan', 30, 24, (g) => {
      rrect(g, 2, 4, 26, 18, 3, '#223651');
      rrect(g, 5, 7, 20, 11, 2, '#082431');
      [0, 1, 2, 3].forEach((i) => line(g, 8 + i * 4, 9, 8 + i * 4, 16, i % 2 ? '#27e0ff' : '#ffe14a', 2));
      line(g, 10, 2, 20, 2, '#ff7ad9', 2);
    }, { shade: 0.2 });
  };
})();
