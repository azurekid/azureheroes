/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.scenery.81'] = function (C) {

    const SC = {
    westeurope: C.part('amsterdam', 'SC_westeurope'),
    uksouth: C.part('london', 'SC_uksouth'),
    australiaeast: C.part('sydney', 'SC_australiaeast'),
    japaneast: C.part('tokyo', 'SC_japaneast'),
    brazilsouth: C.part('rio', 'SC_brazilsouth')
    };

    Object.assign(C, { SC });
  };

  AH.ArtModules.stages['art.scenery.84'] = function (C) {
    const { SC } = C;

    const SC_EXTRA = {
    westeurope: C.part('amsterdam', 'SC_EXTRA_westeurope'),
    uksouth: C.part('london', 'SC_EXTRA_uksouth'),
    australiaeast: C.part('sydney', 'SC_EXTRA_australiaeast'),
    japaneast: C.part('tokyo', 'SC_EXTRA_japaneast'),
    brazilsouth: C.part('rio', 'SC_EXTRA_brazilsouth')
    };

    Object.keys(SC_EXTRA).forEach(function (r) { Object.keys(SC_EXTRA[r]).forEach(function (k) { SC[r][k] = SC_EXTRA[r][k]; }); });

    Object.assign(C, { SC_EXTRA });
  };
})();
