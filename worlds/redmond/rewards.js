/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['redmond'] = AH.Worlds['redmond'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['westus2'] = content;

  world.rewards = {
    collectibleHats: [['cowboy', 'COWBOY HAT', 'TEXAS, USA', 8]],
    hair: ['undercut', 'CAMPUS UNDERCUT', 'REDMOND', 8],
    suit: { name: 'XBOX', unlock: 8, suit: '#107c10', suitD: '#04380a', suitM: '#0a5e0e', suitL: '#7ae07a', cape: '#202024', capeL: '#4a4a52', capeD: '#08080a', boots: '#08080a', bootL: '#3a3a42', cuff: '#9bf09b' },
    outfit: ['CAMPUS HOODIE', 'hoodie'],
    gear: ['satchel', 'CAMPUS SATCHEL', 'REDMOND', 8],
    classicHat: ['cap', 'AZURE CAP', 'REDMOND, USA']
  };
})();
