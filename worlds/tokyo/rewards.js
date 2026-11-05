/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['tokyo'] = AH.Worlds['tokyo'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['japaneast'] = content;

  world.rewards = {
    hair: ['tidybun', 'TIDY BUN', 'TOKYO', 3],
    suit: { name: 'NEON', unlock: 3, suit: '#3a1a6a', suitD: '#140628', suitM: '#2a1050', suitL: '#ff4fd0', cape: '#08a8c8', capeL: '#5af0ff', capeD: '#043a50', boots: '#140628', bootL: '#ff4fd0', cuff: '#5af0ff' },
    outfit: ['KIMONO', 'kimono'],
    gear: ['obi', 'OBI CORD', 'TOKYO', 3],
    classicHat: ['hachimaki', 'HACHIMAKI', 'TOKYO, JAPAN']
  };
})();
