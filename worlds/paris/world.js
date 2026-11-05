(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds.paris = AH.Worlds.paris || {};
  AH.Worlds.paris.world = {"id":3,"region":"francecentral","ambient":{"sky":["plane","balloon","heli"],"birds":"pigeon","road":["citroen","vespa","cyclist","cab"],"water":["region"]},"regionName":"FRANCE CENTRAL","city":"PARIS","name":"Paris Seine Run","mode":"run","theme":"roof","tint":16762839,"landmarks":"EIFFEL TOWER - SACRE-COEUR - MOULIN ROUGE - LOUVRE - MONT-SAINT-MICHEL - CARCASSONNE","hint":"RIDE THE METRO PIPES. A GHOST STATION HIDES A RETRO SECRET!","ground":"quai_paris","water":true,"rail":"quai_paris","boss":{"kind":"savate","name":"MADAME SAVATE: SPOOFER","proj":"savate"},"opt":{"count":24,"gapMin":105,"gapMax":185,"minW":210,"maxW":330,"cpEvery":7,"laserRate":0.18,"robotRate":0.34,"spiderRate":0.24,"droneRate":0.2,"stepRate":0.16,"dropRate":0.13,"floatRate":0.52,"stoneRate":0.45,"power":5,"props":["easel","macarons"],"water":true,"bridgeRate":0.12,"boatRate":0.24,"obstacles":["vespa","cafe","kiosk"],"stand":"bakery","obstacleRate":0.32,"secret":"retro","secretName":"GHOST STATION","pipeTheme":"metro","extraRate":0.38,"floatEnemyRate":0.34,"shootRate":0.28},"map":[2.35,48.86,-7,8]};
  AH.Worlds.paris.challenges = Object.assign(AH.Worlds.paris.challenges || {}, {
    metro: { region: 'francecentral', music: 'metro', name: 'PARIS METRO - LIGNE 14', hint: 'RIDE THE LINES. ROUTE TRAFFIC SAFELY.', stages: ['TICKET GATE', 'QUAI', 'CORRESPONDANCE', 'RUSH HOUR', 'SORTIE'], tips: ['FRONT DOOR WAF', 'LOAD BALANCE TRAFFIC', 'ROUTE WITH FRONT DOOR', 'DDOS PROTECTION', 'PRIVATE ENDPOINTS'], threats: ['guest', 'bug', 'endpoint', 'bug', 'rbac'] }
  });
})();
