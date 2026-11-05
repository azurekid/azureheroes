/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['mexico-city'] = AH.Worlds['mexico-city'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['mexicocentral'] = content;

  AH.ArtModules.stages['worlds.mexico-city.sprites.52'] = function (C) {
    const { FBLACK, FSKIN, fPal, fighterReg } = C;

    fighterReg('luchador', { // Mexico City: zero-day luchador
        air: true, plate: ['#27e0ff', '#5a0a34', 'rgba(39,224,255,0.55)'], skin: FSKIN.brown, top: 'bare', legs: 'tights', legC: fPal('#ff5ab8', '#d01a7a', '#5a0a34'),
        legStripe: '#27e0ff', feet: 'boots', footC: fPal('#ff5ab8', '#d01a7a', '#5a0a34'), hands: 'fingerless', handC: FBLACK, hair: 'none',
        face: 'lucha', faceC: fPal('#ff6ac8', '#d01a7a', '#5a0a34'), belt: '#c89a20', buckle: true, accent: '#27e0ff'
      });
  };

  AH.ArtModules.stages['worlds.mexico-city.sprites.63'] = function (C) {
    const { BOLT, ell, glow, lg, line, poly, reg2 } = C;

    reg2('bolt_luchador', 22, 12, function (g) {
        poly(g, [[10, 2], [21, 4], [17, 6], [21, 8], [10, 10]], 'rgba(39,224,255,0.55)');
        ell(g, 7.6, 6, 5.6, 4.8, lg(g, 2, 1, 13, 11, [[0, '#ffb0e8'], [0.5, '#ff5ab8'], [1, '#8a0a4a']]));
        [3.6, 5.6, 7.6].forEach((y) => line(g, 3.4, y + 0.4, 6.4, y + 0.4, 0.6, '#5a0a34'));
      }, Object.assign({ glow: '#27e0ff' }, BOLT));
  };

  AH.ArtModules.stages['worlds.mexico-city.sprites.106'] = function (C) {
    const { MX, SKINS, ell, eyes, lg, limb, line, poly, rrect } = C;

    Object.assign(C, { mxRobot, mxDrone, mxSpider });
    function mxRobot(f) {
        return function(g){const bob=f?1:0;
          poly(g,[[8,13],[17,15],[17,25],[14,33],[4,29],[6,20]],lg(g,4,13,17,33,[[0,'#f34b66'],[.5,'#c93459'],[1,'#68264d']]));line(g,7,18,14,27,1,'#ffd05b');line(g,8,24,13,29,1,'#25cbbd');
          poly(g,[[4,9],[8,3],[24,3],[29,10],[25,14],[7,14]],'#301d42');
          poly(g,[[3,12],[11,8],[22,9],[29,14],[27,19],[22,18],[19,15],[16,18],[10,16],[6,20]],f?'#15a99e':'#ffb52e');
          limb(g,11,26,10+(f?2:-2),34,4,'#4a293e','#e24c55','#ffcf69');limb(g,21,26,22+(f?-2:2),34,4,'#4a293e','#15a99e','#7df3d8');
          rrect(g,6,14+bob,20,14,4,lg(g,6,14,26,28,[[0,'#ffe08b'],[.5,'#e5a84e'],[1,'#9f4d50']]));
          rrect(g,9,16+bob,14,8,2,'#322143');ell(g,12,20+bob,2.3,1.8,'#2ee5d2');ell(g,20,20+bob,2.3,1.8,'#fb496b');line(g,12,24+bob,21,24+bob,1.1,'#fff1c1');
          g.fillStyle='#e84462';g.fillRect(4,26,24,3);line(g,14,11,21,6,2,'#f9d44f');poly(g,[[13,9],[18,6],[22,9],[18,11]],'#20c6b7');
          ell(g,16,5,3.8,2.4,'#e93d60');ell(g,16,4,2.2,1.2,'#ffd36a');
        };
      }

    function mxDrone(f) {
        return function(g){const flap=f?0:1;
          ell(g,16,13,9,4.4,lg(g,7,9,25,18,[[0,'#14b8ac'],[1,'#176c78']]));
          poly(g,[[12,12],[6,4-flap*2],[2,2],[5,11],[11,15]],'#ee4267');poly(g,[[19,12],[25,4-flap*2],[30,2],[27,11],[21,15]],'#ffca55');
          poly(g,[[8,13],[1,9],[4,16],[12,17]],'#d33a63');poly(g,[[22,13],[31,8],[28,16],[20,17]],'#f38c3e');
          ell(g,25,12,3,2.5,'#ff854e');poly(g,[[27,12],[32,13],[27,14]],'#ffd24f');ell(g,25,11,1,1,'#fff4c4');
          line(g,14,11,17,13,1.5,'#fff0ac');line(g,14,14,18,14,1,'#ff5570');ell(g,5,19,1.4,1.4,'#55ffe4');ell(g,27,19,1.4,1.4,'#55ffe4');
        };
      }

    function mxSpider(f) {
        return function(g){
          for(let i=0;i<4;i++){const dx=(f?2:-2)*(i%2?1:-1);limb(g,9+i*4,12,6+i*5+dx,18,1.8,'#653642','#e24b45','#ffb74d');}
          g.strokeStyle='#d84949';g.lineWidth=2.4;g.beginPath();g.moveTo(9,10);g.quadraticCurveTo(2,7,5,3);g.lineTo(9,2);g.stroke();poly(g,[[8,3],[11,0],[12,4]],'#ffd25b');ell(g,8,4,1.2,1.2,'#24cbbd');
          ell(g,14,12,8,5,lg(g,6,7,22,18,[[0,'#ffb743'],[.5,'#dc4b4d'],[1,'#713247']]));
          ell(g,22,12,5,4,'#25203e');eyes(g,21,25,11,1.05);poly(g,[[9,8],[6,3],[11,6],[14,2],[17,7]],'#d43f45');
          line(g,12,14,21,10,.8,'#ffd46a');ell(g,10,12,1.3,1.3,'#27dbca');
        };
      }

    SKINS[MX] = { robot: mxRobot, drone: mxDrone, spider: mxSpider };
  };

  AH.ArtModules.stages['worlds.mexico-city.sprites.108'] = function (C) {
    const { COINS, MX } = C;

    COINS[MX] = 'MX$';
  };

  AH.ArtModules.stages['worlds.mexico-city.sprites.110'] = function (C) {
    const { ell, lg, line, poly } = C;

    Object.assign(C, { mxPinata });
    function mxPinata(g,w,h){
        for(let i=0;i<5;i++){const x=w/2+Math.cos(i*Math.PI*2/5)*8,y=14+Math.sin(i*Math.PI*2/5)*8;line(g,w/2,14,x,y,1,'#ffd45d');}
        const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?8:15;pts.push([w/2+Math.cos(a)*r,14+Math.sin(a)*r]);}poly(g,pts,lg(g,6,0,25,h,[[0,'#ef4a67'],[.28,'#ffc841'],[.53,'#25cbbd'],[.78,'#f27538'],[1,'#953a79']]));
        for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;ell(g,w/2+Math.cos(a)*10,14+Math.sin(a)*10,2,2,'#ffe59b');}
        line(g,15,28,11,34,1.4,'#f34d65');line(g,16,28,17,35,1.4,'#26c8b7');line(g,17,28,23,34,1.4,'#ffcf49');
      }
  };
})();
