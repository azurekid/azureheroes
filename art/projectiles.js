/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.projectiles.44'] = function (C) {
    const { fPal } = C;

    const FBLACK = fPal('#44444f', '#22222b', '#0a0a10');

    Object.assign(C, { FBLACK });
  };

  AH.ArtModules.stages['art.projectiles.55'] = function (C) {
    const { line } = C;

    Object.assign(C, { trail });
    function trail(g, y, col) { [0, 1, 2].forEach((i) => line(g, 14 + i * 2, y - 2 + i * 2, 21, y - 2 + i * 2, 0.8, col)); }
  };
})();
