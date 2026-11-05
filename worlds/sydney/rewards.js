/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['sydney'] = AH.Worlds['sydney'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['australiaeast'] = content;

  world.rewards = {
    hair: ['surfcrop', 'SURF CROP', 'SYDNEY', 4],
    suit: { name: 'REEF', unlock: 4, suit: '#18c0c8', suitD: '#06585e', suitM: '#0e9098', suitL: '#9ff8f0', cape: '#ff6a52', capeL: '#ffa890', capeD: '#7a200e', boots: '#06585e', bootL: '#2ad0d0', cuff: '#ffe8a0' },
    outfit: ['REEF VEST', 'vest'],
    gear: ['shell', 'SHELL PENDANT', 'SYDNEY', 4],
    classicHat: ['cork', 'CORK HAT', 'OUTBACK, AUSTRALIA', 4]
  };
})();
