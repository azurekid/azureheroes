/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['amsterdam'] = AH.Worlds['amsterdam'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['westeurope'] = content;
  content.parts.foreground_westeurope = () => ({
    shape: 'gable', detail: 'balcony', roof: '#28354b', wall: '#665052',
    light: '#caa57d', accent: '#778c88'
  });
  content.parts.graffiti_westeurope = () => ({
    tags: ['SAMEN STERK', 'VRIJE GEEST', 'GROETEN UIT AMS'], paint: '#67e9da', accent: '#ffc179'
  });
  content.parts.atmosphere_westeurope = () => ({
    layers: [],
    rain: { key: 'rain_westeurope', sections: [
      { start: 0.12, end: 0.35, fade: 0.035 }, { start: 0.48, end: 0.75, fade: 0.04 }
    ] },
    overcast: { key: 'overcast_westeurope', sections: [
      { start: 0.1, end: 0.37, fade: 0.04 }, { start: 0.46, end: 0.77, fade: 0.045 }
    ] },
    wet: { key: 'wet_westeurope', road: 'wet_road_westeurope', roadY: 256 }
  });

  AH.ArtModules.stages['worlds.amsterdam.art.68'] = function (C) {
    const { ell, lg, line, lit, poly, reg, reg2, rrect, shade, txt } = C;

    reg('rain_westeurope', 640, 360, function (g) {
      for (let i = 0; i < 110; i++) {
        const x = (i * 179 + 23) % 640, y = (i * 73 + 19) % 360;
        line(g, x, y, x - 4, y + 13, 0.8, 'rgba(188,221,233,0.55)');
      }
    }, true);
    reg('overcast_westeurope', 640, 200, function (g) {
      g.fillStyle = lg(g, 0, 0, 0, 200, [[0, 'rgba(51,66,83,0.94)'],
        [0.6, 'rgba(110,126,140,0.85)'], [1, 'rgba(142,158,172,0)']]);
      g.fillRect(0, 0, 640, 200);
      for (let i = 0; i < 18; i++) ell(g, (i * 117) % 700 - 30, 60 + (i * 31) % 90,
        100, 20, 'rgba(124,141,153,0.24)');
    }, true);
    reg('wet_westeurope', 320, 10, function (g) {
      g.fillStyle = 'rgba(39,62,79,0.65)'; g.fillRect(0, 0, 320, 10);
      for (let i = 0; i < 28; i++) line(g, (i * 43) % 320, 1 + i % 8,
        (i * 43) % 320 + 9 + i % 12, 1 + i % 8, 0.8,
        i % 3 ? 'rgba(169,210,230,0.55)' : 'rgba(245,204,117,0.6)');
    }, true);
    reg('wet_road_westeurope', 640, 22, function (g) {
      g.fillStyle = 'rgba(35,55,73,0.65)'; g.fillRect(0, 0, 640, 22);
      for (let i = 0; i < 60; i++) {
        const x = i * 37 % 640, y = i * 7 % 22;
        line(g, x, y, x + 15, y, 0.8, i % 4 ? 'rgba(130,176,204,0.45)' : 'rgba(255,218,147,0.55)');
      }
    }, true);

    reg2('ground_face_westeurope', 320, 64, function (g) {
      g.fillStyle = '#4b3a39'; g.fillRect(0, 0, 320, 64);
      for (let y = 0; y < 64; y += 8) for (let x = y % 16 ? -12 : 0; x < 320; x += 24) {
        g.fillStyle = (x + y) % 48 ? '#986e5a' : '#a87e61';
        g.fillRect(x + 1, y + 1, 22, 6);
        line(g, x + 1, y + 1, x + 22, y + 1, 0.6, '#be997b');
      }
      for (const x of [8, 282]) {
        rrect(g, x, 10, 28, 33, 2, '#29394b');
        line(g, x + 14, 12, x + 14, 40, 2, '#71888c');
        line(g, x + 2, 25, x + 26, 25, 2, '#71888c');
        line(g, x - 2, 44, x + 30, 44, 3, '#d1b997');
      }
      line(g, 0, 59, 320, 59, 3, '#314853');
    }, { shade: 0, noOutline: true });
    content.parts.groundFace_westeurope = () => 'ground_face_westeurope';

    Object.assign(C, { canalBoat });
    reg2('houseboat', 90, 30, function (g) {
        poly(g, [[0, 18], [90, 18], [86, 30], [4, 30]], lg(g, 0, 18, 0, 30, [[0, '#2a4a3a'], [1, '#0a1a14']]));
        rrect(g, 8, 4, 70, 15, 1.6, lg(g, 0, 4, 0, 19, [[0, '#4a8a6a'], [1, '#1a4a3a']]));
        poly(g, [[6, 5], [45, -1], [80, 5]], '#6a2a3a');
        for (let x = 14; x < 74; x += 11) lit(g, x, 9, 5, 5, x % 2 ? '#ffd070' : '#ff9a6a');
        ell(g, 82, 14, 4, 3, '#ff7ad9'); ell(g, 6, 15, 3, 2.4, '#ffd23f');
      }, { shade: 0.3 });

    function canalBoat(g) {
        poly(g, [[1, 25], [145, 25], [155, 30], [145, 43], [14, 43], [3, 35]], lg(g, 0, 25, 0, 43, [[0, '#f4f0e2'], [1, '#246b95']]));
        line(g, 10, 36, 148, 36, 2, '#c72f40');
        rrect(g, 17, 9, 118, 20, 7, '#c0d5d9');
        for (let x = 20; x < 130; x += 14) {
          poly(g, [[x, 27], [x + 1, 14], [x + 5, 10], [x + 12, 10], [x + 12, 27]], lg(g, 0, 10, 0, 27, [[0, '#b8ecf1'], [1, '#39728c']]));
          line(g, x + 2, 15, x + 11, 12, 0.8, '#e8ffff');
          ell(g, x + 7, 22, 2, 2, '#d6a17f'); g.fillStyle = '#283b68'; g.fillRect(x + 4, 24, 6, 3);
        }
        line(g, 15, 29, 136, 29, 1, '#ffffff');
        txt(g, 'AMSTERDAM CANAL CRUISE', 32, 32, 0.6, '#153d69');
        ell(g, 142, 31, 3, 3, '#e97736'); ell(g, 142, 31, 1.5, 1.5, '#fff0cc');
        [12, 147].forEach((x) => { line(g, x, 20, x, 27, 0.8, '#d9e7ea'); });
        g.fillStyle = 'rgba(230,250,255,0.65)'; g.fillRect(4, 44, 148, 0.8);
      }

    reg2('amb_canalboat', 156, 46, canalBoat, { shade: 0.25 });
  };

  AH.ArtModules.stages['worlds.amsterdam.art.72'] = function (C) {
    const { ell, poly, regOb, rrect, txt } = C;

    regOb('herring', 88, 62, function (g) {
        rrect(g, 3, 26, 82, 31, 2, '#e8e4d8');
        g.fillStyle = '#194a9a'; g.fillRect(4, 41, 80, 14);
        [6, 80].forEach(function (x) { g.fillStyle = '#d4d8e0'; g.fillRect(x, 8, 2, 35); });
        for (let x = 0; x < 88; x += 11) {
          g.fillStyle = x % 22 ? '#ffffff' : '#2168ba';
          g.fillRect(x, 8, 11, 9);
        }
        rrect(g, 8, 0, 72, 10, 1, '#194a9a');
        txt(g, 'HOLLANDSE HARING', 11, 2, 0.7, '#ffffff');
        txt(g, 'VERSE VIS', 19, 44, 1, '#ffffff');
        for (let x = 14; x < 76; x += 18) {
          ell(g, x, 30, 6, 2, '#75a9c5');
          poly(g, [[x + 5, 30], [x + 9, 27], [x + 9, 33]], '#a8d8e8');
        }
        ell(g, 46, 22, 5, 5, '#d6a078');
        g.fillStyle = '#ffffff'; g.fillRect(40, 15, 12, 3);
        [15, 73].forEach(function (x) { ell(g, x, 58, 4, 4, '#182844'); });
      });
  };

  content.parts['bridge'] = function (C) {
    const ell = (...args) => C.ell(...args);
    const glowRect = (...args) => C.glowRect(...args);
    const lg = (...args) => C.lg(...args);
    const lit = (...args) => C.lit(...args);

    return function (g) {
    const D0 = 30;
    
            g.fillStyle = lg(g, 0, D0, 0, 100, [[0, '#9a4040'], [1, '#4a1838']]); g.fillRect(0, D0, 160, 70);
            for (let y = D0 + 8; y < 100; y += 3.2) { g.fillStyle = 'rgba(30,8,30,0.4)'; g.fillRect(0, y, 160, 0.5); }
            g.save(); g.globalCompositeOperation = 'destination-out'; ell(g, 80, 104, 62, 62, '#000'); g.restore();
            g.fillStyle = '#d8b8c8'; g.fillRect(0, D0, 160, 6); g.fillRect(0, D0 - 9, 160, 2.4);
            for (let x = 4; x < 160; x += 10) { g.fillStyle = '#2a1a3a'; g.fillRect(x, D0 - 7, 1.2, 7); }
            for (let a = 0.12; a < 0.9; a += 0.055) { const t = Math.PI * (1 + a); lit(g, 80 + Math.cos(t) * 64 - 0.8, 104 + Math.sin(t) * 64 - 0.8, 1.6, 1.6, '#ffe9a0'); }
            [12, 148].forEach(function (x) { g.fillStyle = '#1a0a2a'; g.fillRect(x - 0.8, D0 - 26, 1.6, 20); ell(g, x, D0 - 27, 3, 3, '#ffe9a0'); glowRect(g, '#ffd070', x - 4, D0 - 31, 8, 8); });
          
    };
  };

  content.parts['commuterTrain'] = function (C) {

    return { body: '#f5cb3d', stripe: '#23538d', top: '#ffe46b', bottom: '#c08e21', stripeY: 12, stripeH: 13, door: '#e5b72c', label: 'AMSTERDAM' };
  };

  content.parts['SKIES_westeurope'] = function (C) {

    return { stops: [[0, '#14083a'], [0.35, '#4a1a8a'], [0.58, '#b83a9a'], [0.75, '#ff6a5a'], [0.9, '#ffa860'], [1, '#ffd890']], sun: { x: 330, y: 232, r: 62, c: ['#fff2a0', '#ffb060', '#ff5a8a'] }, halo: ['rgba(255,200,130,0.55)', 'rgba(255,100,140,0.2)'], cl: ['rgba(140,60,170,0.5)', 'rgba(255,130,160,0.65)', 'rgba(255,210,150,0.5)'], hz: 'rgba(255,190,120,0.5)', stars: 110, seed: 5 };
  };

  content.parts['PAL_westeurope'] = function (C) {

    return { top: '#3a1a80', bot: '#6a2aa0', accent: '#ff9a6a', win: ['#ffd070', '#ff8a5a', '#ffe9a0'] };
  };

  content.parts['WATER_westeurope'] = function (C) {

    return ['#4a2a9a', '#120838', '#ffb07a', '#ff7ad9'];
  };

  content.parts['BOATS_westeurope'] = function (C) {

    return { hull: ['#2a3aa8', '#0a1048'], stripe: '#ffffff', cab: ['#c8f0ff', '#4a7ad8'], roof: '#e8f4ff', win: ['#ffe9a0', '#bff0ff'], logo: true, name: 'AZURE' };
  };

  content.parts['CARS_tram'] = function (C) {
    const { ell, lg, line, lit, rrect, txt, wheels } = C;

    return [112, 42, function (g, w) {
          rrect(g, 1, 10, w - 2, 25, 4, lg(g, 0, 10, 0, 35, [[0, '#f3f5ef'], [1, '#afbfc7']]));
          g.fillStyle = '#1967b2'; g.fillRect(2, 29, w - 4, 5);
          for (let x = 6; x < w - 9; x += 13) { rrect(g, x, 14, 10, 12, 1, '#182b42'); lit(g, x + 1, 15, 8, 9, '#c2dfe5'); }
          [24, 76].forEach((x) => { g.fillStyle = '#2178bc'; g.fillRect(x, 13, 12, 21); line(g, x + 6, 15, x + 6, 33, 0.6, '#dcecf4'); });
          g.fillStyle = '#384851'; g.fillRect(52, 11, 6, 23); for (let x = 53; x < 58; x += 1.5) line(g, x, 12, x, 32, 0.5, '#9aa5a5');
          line(g, 39, 10, 49, 3, 1.1, '#263c51'); line(g, 49, 3, 60, 10, 1.1, '#263c51'); line(g, 44, 2, 56, 2, 1, '#263c51');
          rrect(g, 84, 11, 21, 4, 1, '#142935'); txt(g, 'CENTRAAL', 86, 11.6, 0.36, '#ffd672');
          txt(g, 'AMSTERDAM', 6, 30, 0.45, '#ffffff'); wheels(g, [15, 42, 69, 97], 37, 3.7);
          ell(g, 4, 29, 1.6, 1.2, '#fff0bd');
        }];
  };

  content.parts['CARS_cyclist'] = function (C) {
    const { ell, limb, line } = C;

    return [26, 24, function (g) { [[5, 19], [21, 19]].forEach((wv) => { g.lineWidth = 1.2; g.strokeStyle = '#14062a'; g.beginPath(); g.arc(wv[0], wv[1], 4.4, 0, 7); g.stroke(); }); line(g, 5, 19, 12, 12, 1.2, '#ff7a2a'); line(g, 12, 12, 19, 12, 1.2, '#ff7a2a'); line(g, 12, 12, 14, 19, 1.2, '#ff7a2a'); line(g, 19, 12, 21, 19, 1.2, '#ff7a2a'); limb(g, 14, 9, 13, 16, 2.4, '#2a3a8a', '#3a5ad8'); limb(g, 13, 4, 15, 10, 4, '#ff4fa0', '#ff8ac8'); line(g, 12, 5, 7, 10, 1.4, '#ffd2ad'); ell(g, 12.6, 1.8, 2.2, 2.2, '#c98a66'); ell(g, 12.6, 0.8, 2.4, 1.4, '#ffe14a'); }];
  };
})();
