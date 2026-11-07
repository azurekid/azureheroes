/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['tokyo'] = AH.Worlds['tokyo'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['japaneast'] = content;
  content.parts.foreground_japaneast = () => ({
    shape: 'flat', detail: 'lantern', roof: '#252d4a', wall: '#555275',
    light: '#b7abc9', accent: '#b46c8c'
  });
  content.parts.graffiti_japaneast = () => ({
    tags: ['トウキョウ', 'ミライ', 'アート'], paint: '#f49dcd', accent: '#74e6ef',
    glyphs: {
      'ト': ['001000000','001000000','001110000','001001100','001000110','001000000','001000000','001000000','001000000'],
      'ウ': ['000010000','000010000','111111111','100000001','100000001','000000010','000000100','000011000','001100000'],
      'キ': ['000100000','111111110','000100000','000100000','111111111','000010000','000010000','000010000','000010000'],
      'ョ': ['000000000','000000000','001111110','000000010','001111110','000000010','000000010','001111110','000000000'],
      'ミ': ['011111100','000000010','000000000','001111100','000000010','000000000','011111100','000000110','000000010'],
      'ラ': ['011111110','000000000','111111111','000000001','000000010','000000100','000001000','000110000','011000000'],
      'イ': ['000000010','000000100','000001000','000011000','000101000','011001000','000001000','000001000','000001000'],
      'ア': ['111111111','000000001','000010010','000010100','000011000','000010000','000100000','001000000','010000000'],
      'ー': ['000000000','000000000','000000000','000000000','111111111','000000000','000000000','000000000','000000000']
    }
  });

  content.parts['commuterTrain'] = function (C) {

    return { body: '#c8d6db', stripe: '#ed8a24', top: '#f1f3eb', bottom: '#7b8b94', stripeY: 29, stripeH: 4, door: '#9baab0', label: 'GINZA LINE G01' };
  };

  content.parts['SKIES_japaneast'] = function (C) {

    return { stops: [[0, '#12062e'], [0.3, '#3a0a5a'], [0.55, '#9a1a5a'], [0.75, '#e83a4a'], [0.9, '#ff8a5a'], [1, '#ffc880']], sun: { x: 420, y: 140, r: 66, c: ['#ff9a80', '#ff2a3a', '#c0103a'] }, halo: ['rgba(255,80,90,0.55)', 'rgba(255,60,120,0.2)'], cl: ['rgba(110,30,120,0.55)', 'rgba(255,100,130,0.65)', 'rgba(255,190,160,0.5)'], hz: 'rgba(255,160,110,0.5)', stars: 120, seed: 11, stripes: false };
  };

  content.parts['PAL_japaneast'] = function (C) {

    return { top: '#34106a', bot: '#5a1a8a', accent: '#ff6a8a', win: ['#ffd0e0', '#ff7a9a', '#ffe9a0'] };
  };

  content.parts.atmosphere_japaneast = () => ({
    layers: [
      { key: 'tokyo_blocks', width: 960, height: 220, y: 130, depth: -27, scroll: 0.12, alpha: 0.65 },
      { key: 'tokyo_yokocho', width: 960, height: 112, y: 234, depth: -18.15, scroll: 0.7, alpha: 1 },
      { key: 'tokyo_neon', width: 960, height: 112, y: 234, depth: -17.9, scroll: 0.7, alpha: 0.8, additive: true, night: true },
      { key: 'tokyo_wires', width: 960, height: 210, y: 98, depth: 60, scroll: 1.18, alpha: 0.55 }
    ],
    rain: { key: 'rain_japaneast', sections: [{ start: 0.16, end: 0.82, fade: 0.06 }] },
    wet: { road: 'tokyo_reflections', roadY: 326 }
  });

  AH.ArtModules.stages['worlds.tokyo.atmosphere'] = function (C) {
    const { ell, lg, line, lit, poly, reg, reg2, rrect, txt } = C;
    const glyphs = content.parts.graffiti_japaneast().glyphs;
    const vertical = (g, text, x, y, colour) => {
      [...text].forEach((letter, i) => glyphs[letter].forEach((row, dy) => {
        [...row].forEach((pixel, dx) => {
          if (pixel === '1') { g.fillStyle = colour; g.fillRect(x + dx, y + i * 12 + dy, 1, 1); }
        });
      }));
    };
    reg2('tokyo_blocks', 960, 220, function (g) {
      for (let i = 0; i < 17; i++) {
        const x = i * 58, top = 20 + (i * 47) % 92, w = 38 + i % 3 * 7;
        C.depthFace(g, x, top, w, 220, 7, '#070d24', '#263251');
        g.fillStyle = '#111931'; g.fillRect(x, top, w, 220 - top);
        line(g, x + w / 2, top - 17, x + w / 2, top, 1, '#293a53');
        for (let y = top + 9; y < 210; y += 14) for (let dx = 5; dx < w - 4; dx += 9) {
          if ((i + dx + y) % 4) lit(g, x + dx, y, 3, 5, '#536587');
        }
      }
    }, { shade: 0, noOutline: true });
    reg2('tokyo_yokocho', 960, 112, function (g) {
      g.fillStyle = '#18263a'; g.fillRect(0, 94, 960, 18);
      for (let x = 0; x < 960; x += 160) {
        g.fillStyle = '#0a1022'; g.fillRect(x + 118, 5, 36, 91);
        poly(g, [[x + 118, 5], [x + 135, 19], [x + 135, 95], [x + 118, 95]], '#282d46');
        C.depthFace(g, x + 3, 8, 104, 94, 8, '#111a30', '#49445e');
        g.fillStyle = '#30314a'; g.fillRect(x + 3, 8, 104, 86);
        for (let y = 12; y < 46; y += 14) for (let dx = 12; dx < 96; dx += 18) {
          rrect(g, x + dx, y, 11, 9, 1, '#142034'); lit(g, x + dx + 1, y + 1, 8, 6, '#b79b67');
        }
        rrect(g, x + 8, 55, 93, 36, 1, '#101c2b');
        // Fictional green/white convenience store, not a copied retail logo.
        g.fillStyle = '#dfefdf'; g.fillRect(x + 6, 48, 99, 7);
        g.fillStyle = '#33b37d'; g.fillRect(x + 6, 51, 99, 3);
        txt(g, 'OPEN 24', x + 24, 49, 0.5, '#125947');
        for (let dx = 12; dx < 90; dx += 24) {
          lit(g, x + dx, 60, 18, 27, '#638d8e');
          line(g, x + dx + 2, 62, x + dx + 14, 70, 1, '#b7d2c9');
        }
        // Lit drink vending machine, coin slot and individual product rows.
        rrect(g, x + 108, 50, 22, 44, 2, '#ece9e6');
        lit(g, x + 110, 53, 18, 26, '#a9e9ef');
        for (let y = 55; y < 78; y += 7) for (let dx = 112; dx < 127; dx += 5) {
          g.fillStyle = (dx + y) % 3 ? '#e7597c' : '#e7c56a'; g.fillRect(x + dx, y, 3, 5);
        }
        g.fillStyle = '#283749'; g.fillRect(x + 114, 85, 11, 5); g.fillRect(x + 126, 79, 2, 3);
        rrect(g, x + 4, 4, 13, 42, 1, '#432039');
        vertical(g, 'ミライ', x + 6, 7, '#ff8cd5');
        // Yellow tactile strip and blue bicycle-lane markings along the street.
        g.fillStyle = '#dbb853'; g.fillRect(x, 97, 160, 4);
        for (let dx = 0; dx < 160; dx += 5) g.fillStyle = '#967d3e', g.fillRect(x + dx, 98, 2, 1);
        line(g, x, 108, x + 158, 108, 1, '#62a9c4');
        ell(g, x + 47, 104, 3, 2, '#a3d2de'); ell(g, x + 57, 104, 3, 2, '#a3d2de');
        line(g, x + 47, 104, x + 52, 100, 1, '#a3d2de'); line(g, x + 52, 100, x + 57, 104, 1, '#a3d2de');
        // Umbrella pedestrians stay on the decorative street, not in the flight corridor.
        const px = x + 76;
        ell(g, px, 82, 2, 2, '#c1a59c');
        poly(g, [[px - 3, 85], [px + 3, 85], [px + 4, 94], [px - 4, 94]], '#182139');
        line(g, px - 2, 92, px - 4, 97, 1.5, '#182139'); line(g, px + 2, 92, px + 4, 97, 1.5, '#182139');
        ell(g, px, 78, 13, 5, '#796389'); line(g, px + 2, 77, px + 2, 90, 0.8, '#cec6db');
      }
    }, { shade: 0, noOutline: true });
    reg('tokyo_neon', 960, 112, function (g) {
      for (let x = 0; x < 960; x += 160) {
        lit(g, x + 4, 4, 13, 42, '#dd4b9d');
        vertical(g, 'ミライ', x + 6, 7, '#ffd7f0');
        line(g, x + 7, 55, x + 103, 55, 1, '#65ffc8');
        lit(g, x + 110, 53, 18, 26, '#61cad6');
        for (let dx = 12; dx < 96; dx += 18) lit(g, x + dx, 13, 8, 6, '#cfb66b');
        for (let i = 0; i < 10; i++) {
          line(g, x + 5 + i * 4, 99 + i % 8, x + 20 + i * 4, 99 + i % 8, 1,
            i % 2 ? 'rgba(255,83,192,0.5)' : 'rgba(73,242,235,0.4)');
        }
      }
    }, true);
    reg('tokyo_wires', 960, 210, function (g) {
      // Sparse framing: narrow poles, high cables, never a solid foreground wall.
      for (const x of [38, 690]) {
        g.fillStyle = '#172139'; g.fillRect(x, 38, 4, 172);
        line(g, x - 15, 40, x + 18, 40, 2, '#243148');
        for (let y = 6; y < 27; y += 6) {
          g.strokeStyle = '#223047'; g.lineWidth = 1; g.beginPath();
          g.moveTo(x - 180, y); g.quadraticCurveTo(x - 80, y + 40, x + 2, 40); g.stroke();
          g.beginPath(); g.moveTo(x + 2, 40); g.quadraticCurveTo(x + 100, y + 45, x + 200, y); g.stroke();
        }
        rrect(g, x - 12, 67, 30, 13, 1, '#294254');
        txt(g, 'TOKYO', x - 8, 70, 0.5, '#b8e5e6');
        rrect(g, x + 5, 150, 10, 25, 2, '#192437');
        ell(g, x + 10, 155, 2, 2, '#f87e72'); ell(g, x + 10, 170, 2, 2, '#77dfa9');
      }
    }, true);
    reg('rain_japaneast', 640, 360, function (g) {
      for (let i = 0; i < 90; i++) {
        const x = i * 193 % 640, y = i * 79 % 360;
        line(g, x, y, x - 2, y + 12, 0.7, 'rgba(153,190,220,0.38)');
      }
    }, true);
    reg('tokyo_reflections', 640, 25, function (g) {
      g.fillStyle = 'rgba(12,24,42,0.6)'; g.fillRect(0, 0, 640, 25);
      for (let i = 0; i < 100; i++) {
        const x = i * 47 % 640, y = i * 11 % 25;
        line(g, x, y, x + 9 + i % 17, y, 1,
          ['rgba(255,90,189,0.65)', 'rgba(79,225,240,0.65)', 'rgba(244,208,116,0.5)'][i % 3]);
      }
    }, true);
  };
})();
