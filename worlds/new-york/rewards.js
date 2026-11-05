/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['new-york'] = AH.Worlds['new-york'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['eastus2'] = content;

  world.rewards = {
    collectibleHats: [['cowboy', 'COWBOY HAT', 'TEXAS, USA', 10]],
    hair: ['boroughwaves', 'BOROUGH WAVES', 'NEW YORK', 10],
    suit: { name: 'CITY VARSITY', unlock: 10, suit: '#19385e', suitD: '#101c36', suitM: '#214f78', suitL: '#86c9ee', cape: '#c83e49', capeL: '#f07b75', capeD: '#6f1f34', boots: '#101c36', bootL: '#4678a0', cuff: '#f2e7c9', outfit: 'varsity' },
    gear: ['messenger', 'MESSENGER BAG', 'NEW YORK', 10],
    hat: ['nycap', 'NEW YORK CAP', 'NEW YORK', 10]
  };
})();
