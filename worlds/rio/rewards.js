/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['rio'] = AH.Worlds['rio'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['brazilsouth'] = content;

  world.rewards = {
    hair: ['curls', 'RIO CURLS', 'RIO', 6],
    suit: { name: 'SAMBA', unlock: 6, suit: '#18a040', suitD: '#06481a', suitM: '#0e7a30', suitL: '#8af0a0', cape: '#ffd020', capeL: '#fff07a', capeD: '#8a6a04', boots: '#06481a', bootL: '#2ac860', cuff: '#2a6aff' },
    outfit: ['RIO TRACKSUIT', 'tracksuit'],
    gear: ['wristbands', 'SPORT WRISTBANDS', 'RIO', 6],
    classicHat: ['plumes', 'CARNAVAL PLUMES', 'RIO, BRAZIL'],
    classicGear: ['lei', 'FLOWER GARLAND', 'RIO, BRAZIL']
  };
})();
