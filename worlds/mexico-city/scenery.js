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

    // Mexico City depth: tezontle-red returns, warm cantera parapets and receding zócalo stone.
    const mxReturn = (g, x, top, width, base, depth, roof) => C.depthFace(g, x, top, width, base, depth, 'rgba(70,26,62,0.45)', roof === false ? 'rgba(0,0,0,0)' : 'rgba(255,214,140,0.4)');
    const mxZocalo = (g, x, base, width, depth) => C.depthGround(g, x, base, width, depth, '#4a2a46', 'rgba(240,190,140,0.5)');
    const mxPyramidSide = (g, x, base, width, height) => C.poly(g, [[x + width / 2, base - height], [x + width, base], [x + width * 0.74, base]], 'rgba(70,26,62,0.32)');

    SC[MX] = {
        sc_mx_pyramidsun:[230,185,function(g,w,h){mxZocalo(g,10,h,w-20,6);mxPyramidPiece(g,w,h,'sun');mxPyramidSide(g,18,h-4,w-36,h-49);}],
        sc_mx_chichenitza:[200,175,function(g,w,h){mxZocalo(g,15,h,w-30,6);mxPyramidPiece(g,w,h,'chichen');mxPyramidSide(g,23,h-4,w-46,h-38);}],
        sc_mx_angel:[110,210,function(g,w,h){mxZocalo(g,w/2-26,h,52,5);mxAngelPiece(g,w,h);mxReturn(g,w/2-9.3,h-82,18.6,h-3,4,false);}],
        sc_mx_bellasartes:[220,155,function(g,w,h){mxZocalo(g,0,h,w,6);mxBellasPiece(g,w,h);const bh=Math.min(126,h-12);mxReturn(g,17,h-3-bh*0.55,w-34,h-3,8,false);}],
        sc_mx_latinoamericana:[120,210,function(g,w,h){const th=h-10,tw=th*0.34,cx=w/2,b=h-3;mxZocalo(g,cx-42,h,84,6);mxTowerPiece(g,w,h);C.poly(g,[[cx+tw*0.24,b-th*0.84],[cx+tw*0.38,b-th*0.74],[cx+tw/2,b],[cx+tw*0.3,b]],'rgba(40,20,64,0.36)');}],
        sc_mx_cathedral:[240,160,function(g,w,h){const b=h-3,ch=h-12;mxZocalo(g,0,h,w,7);mxCathedralPiece(g,w,h);mxReturn(g,19,b-ch*0.62,w-38,b,8,false);mxReturn(g,w-41,b-ch*0.78,16,b,4,false);}],
        sc_mx_trajinera:[230,125,function(g,w,h){mxBoatPiece(g,w,h);}],
        sc_mx_papelpikado:[210,120,function(g,w,h){mxPapelPiece(g,w,h);const st=h-4;for(let i=0;i<7;i++){const x=i*31,bh=24+(i*17%20);if(x+29<=w)mxReturn(g,x,st-24-bh,29,st-24,4);}}],
        sc_mx_mariachi:[190,145,function(g,w,h){mxMariachi(g,w,h);mxReturn(g,4,h-15,w-8,h,5);}],
        sc_mx_microsoft:[220,155,function(g,w,h){mxOffice(g,w,h);mxReturn(g,12,18,w-24,h-2,9);mxZocalo(g,4,h,w-8,4);}],
        sc_mx_agaves:[140,125,function(g,w,h){mxAgavesPiece(g,w,h);}],
        sc_mx_mercado:[200,130,function(g,w,h){mxMarket(g,w,h);mxReturn(g,6,h-55,w-12,h,7,false);}],
        sc_mx_barrio:[190,155,function(g,w,h){mxBarrio(g,w,h);for(let x=0;x+30<=w;x+=32)mxReturn(g,x,h-45-(x*17%55),30,h,4);}],
        sc_mx_mesquite:[150,115,function(g,w,h){mxDesertPiece(g,w,h);}],
        sc_mx_bandstand:[190,140,function(g,w,h){const b=h-5;mxZocalo(g,0,h,w,5);mxBandstand(g,w,h);mxReturn(g,10,b-24,w-20,b,5);mxReturn(g,16,b-66,w-32,b-27,5,false);}]
      };
  };

  content.parts['panoramaLandmarks_mexicocentral'] = function (C) {

    return ['sc_mx_pyramidsun', 'sc_mx_angel'];
  };
})();
