(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds.london = AH.Worlds.london || {};
  AH.Worlds.london.world = {"id":2,"region":"uksouth","ambient":{"sky":["plane","heli"],"birds":"pigeon","road":["redbus","cab","cab","cyclist"]},"regionName":"UK SOUTH","city":"LONDON","name":"London Thames Run","mode":"run","theme":"roof","tint":11847935,"landmarks":"BIG BEN - THAMES - UNDERGROUND - STONEHENGE - EDINBURGH - LIVERPOOL - BLACKPOOL","hint":"RIDE THE UNDERGROUND PIPES. THE RED PHONE BOX HIDES A SECRET!","ground":"embank","water":true,"rail":"embank","boss":{"kind":"kingpin","name":"THE PHISHING KINGPIN","proj":"kingpin"},"opt":{"count":28,"gapMin":105,"gapMax":185,"minW":210,"maxW":330,"cpEvery":7,"laserRate":0.22,"robotRate":0.36,"spiderRate":0.25,"droneRate":0.2,"stepRate":0.16,"dropRate":0.12,"floatRate":0.55,"stoneRate":0.5,"power":5,"props":["postbox","phone"],"water":true,"bridgeRate":0.12,"boatRate":0.14,"obstacles":["bus","cab","cab"],"obstacleRate":0.35,"bikes":1,"secret":true,"pipeTheme":"tube","extraRate":0.4,"floatEnemyRate":0.35,"shootRate":0.35},"map":[-0.1,51.5,-10,-4]};
  AH.Worlds.london.challenges = Object.assign(AH.Worlds.london.challenges || {}, {
    tube: { region: 'uksouth', music: 'metro', name: 'LONDON UNDERGROUND', hint: 'MIND THE GAP. KEEP YOUR NETWORK PRIVATE.', stages: ['TICKET HALL', 'BAKER STREET', 'INTERCHANGE', 'WESTMINSTER', 'WAY OUT'], tips: ['ENTRA ACCESS REVIEWS', 'AZURE MONITOR', 'ROUTE WITH FRONT DOOR', 'PRIVATE ENDPOINTS', 'LEAST PRIVILEGE'], threats: ['guest', 'bug', 'endpoint', 'rbac', 'bug'] }
  });
})();
