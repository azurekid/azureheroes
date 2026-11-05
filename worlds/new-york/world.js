(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds['new-york'] = AH.Worlds['new-york'] || {};
  AH.Worlds['new-york'].world = {"id":11,"region":"eastus2","regionName":"EAST US 2","city":"NEW YORK","name":"New York Hudson Run","mode":"run","theme":"roof","ambient":{"sky":["heli","plane"],"birds":"pigeon","road":["taxi","taxi","mtabus"],"roadRate":6.5,"roadMax":2,"rail":["nycmetro"],"railY":238,"water":["region"]},"tint":16770758,"landmarks":"STATUE OF LIBERTY - EMPIRE STATE - CHRYSLER - BROOKLYN BRIDGE - TIMES SQUARE","hint":"NEW YORK CITY - HOSTED IN AZURE EAST US 2. DEFEND THE HUDSON CLOUD ROUTE!","ground":"quay","water":true,"rail":"quay","boss":{"kind":"broker","name":"ZERO DAY BOXER","proj":"broker"},"opt":{"count":26,"gapMin":100,"gapMax":180,"minW":220,"maxW":320,"cpEvery":7,"laserRate":0.18,"robotRate":0.3,"spiderRate":0.32,"droneRate":0.24,"stepRate":0.16,"dropRate":0.14,"wallRate":0.16,"stairRate":0.14,"floatRate":0.55,"stoneRate":0.5,"power":6,"props":["hydrant","newsbox"],"water":true,"bridgeRate":0.12,"boatRate":0.14,"obstacles":["taxi","hotdog"],"stand":"hotdog","obstacleRate":0.34,"bikes":1,"secret":"sewer","secretName":"MANHOLE","extraRate":0.4,"floatEnemyRate":0.35,"shootRate":0.3},"map":[-74.006,40.7128,16,-12]};
  const city = AH.Worlds['new-york'];
  city.bonus = {
    theme: 'sewer', floor: 'sewer', platform: 'sewer_plat', width: 1280,
    title: 'NEW YORK SEWERS', y: 58, shadow: '#111d2b',
    sub: '#b8ddd3', subShadow: '#111d2b', ach: 'HUDSON UNDERGROUND', music: 'pipe',
    threats: [250, 470, 710, 940, 1090].map((x) => ({ type: 'spider', x, y: 300, range: 40 }))
  };
})();
