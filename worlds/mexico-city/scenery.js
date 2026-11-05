/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['mexico-city'] = AH.Worlds['mexico-city'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { panoramaLandmarks: 7 };
  AH.ArtModules.regions['mexicocentral'] = content;

  AH.ArtModules.stages['worlds.mexico-city.scenery.112'] = function (C) {
    const { MX, SC, mxAgavesPiece, mxAngelPiece, mxBandstand, mxBarrio, mxBellasPiece, mxBoatPiece, mxCathedralPiece, mxDesertPiece, mxMariachi, mxMarket, mxOffice, mxPapelPiece, mxPyramidPiece, mxTowerPiece } = C;

    SC[MX] = {
        sc_mx_pyramidsun:[230,185,function(g,w,h){mxPyramidPiece(g,w,h,'sun');}],
        sc_mx_chichenitza:[200,175,function(g,w,h){mxPyramidPiece(g,w,h,'chichen');}],
        sc_mx_angel:[110,210,function(g,w,h){mxAngelPiece(g,w,h);}],
        sc_mx_bellasartes:[220,155,function(g,w,h){mxBellasPiece(g,w,h);}],
        sc_mx_latinoamericana:[120,210,function(g,w,h){mxTowerPiece(g,w,h);}],
        sc_mx_cathedral:[240,160,function(g,w,h){mxCathedralPiece(g,w,h);}],
        sc_mx_trajinera:[230,125,function(g,w,h){mxBoatPiece(g,w,h);}],
        sc_mx_papelpikado:[210,120,function(g,w,h){mxPapelPiece(g,w,h);}],
        sc_mx_mariachi:[190,145,function(g,w,h){mxMariachi(g,w,h);}],
        sc_mx_microsoft:[220,155,function(g,w,h){mxOffice(g,w,h);}],
        sc_mx_agaves:[140,125,function(g,w,h){mxAgavesPiece(g,w,h);}],
        sc_mx_mercado:[200,130,function(g,w,h){mxMarket(g,w,h);}],
        sc_mx_barrio:[190,155,function(g,w,h){mxBarrio(g,w,h);}],
        sc_mx_mesquite:[150,115,function(g,w,h){mxDesertPiece(g,w,h);}],
        sc_mx_bandstand:[190,140,function(g,w,h){mxBandstand(g,w,h);}]
      };
  };

  content.parts['panoramaLandmarks_mexicocentral'] = function (C) {

    return ['sc_mx_pyramidsun', 'sc_mx_angel'];
  };
})();
