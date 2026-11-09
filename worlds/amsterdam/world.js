(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds.amsterdam = AH.Worlds.amsterdam || {};
  AH.Worlds.amsterdam.world = {"id":1,"region":"westeurope","ambient":{"sky":["plane","plane","balloon"],"birds":"gull","road":["tram","cyclist","cyclist","mini"],"rail":["nltrain"],"railY":234,"water":["canalboat"]},"regionName":"WEST EUROPE","city":"AMSTERDAM","name":"Amsterdam Canal Run","mode":"run","theme":"roof","tint":16760992,"landmarks":"AMSTERDAM - SCHIPHOL - MICROSOFT HQ - KINDERDIJK - ROTTERDAM - UTRECHT - THE HAGUE","hint":"RIDE CANAL BOATS, MIND THE PULL-UP BRIDGES, GRAB THE AZURE BIKE","ground":"quay","water":true,"rail":"quay","boss":{"kind":"kraker","name":"DE KRAKER: ACCESS BROKER","proj":"kraker"},"opt":{"count":24,"gapMin":100,"gapMax":175,"minW":220,"maxW":340,"cpEvery":7,"laserRate":0.2,"robotRate":0.34,"spiderRate":0.24,"droneRate":0.16,"stepRate":0.14,"dropRate":0.12,"floatRate":0.55,"stoneRate":0.45,"power":4,"props":["tulips","bike"],"water":true,"bridgeRate":0.2,"drawRate":0.6,"boatRate":0.14,"obstacles":["flowers","bikes"],"stand":"herring","obstacleRate":0.3,"bikes":2,"extraRate":0.35,"floatEnemyRate":0.3,"shootRate":0.3},"map":[4.9,52.4,7,-9]};
  AH.Worlds.amsterdam.world.opt.skyClimb = true;
})();
