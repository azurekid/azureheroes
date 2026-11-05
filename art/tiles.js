/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.tiles.7'] = function (C) {
    const { FLAT, ell, lg, line, poly, reg2, rng, rrect } = C;
    const lit = (...args) => C.lit(...args);

    Object.assign(C, { glowRect });
    function glowRect(g, c, x, y, w, h) {
        g.fillStyle = c; g.globalAlpha = 0.22; g.fillRect(x - 1.2, y - 1.2, w + 2.4, h + 2.4); g.globalAlpha = 1;
      }

    reg2('roof_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ffffff'], [0.12, '#ff7ad9'], [0.26, '#27e0ff'], [0.4, '#6a4ad8'], [1, '#2a1a70']]); g.fillRect(0, 0, 32, 8);
        for (let x = 0; x < 32; x += 8) { g.fillStyle = 'rgba(160,130,255,0.55)'; g.fillRect(x, 4, 4, 0.8); g.fillStyle = 'rgba(10,5,50,0.35)'; g.fillRect(x + 4, 5.4, 0.8, 2.6); }
        poly(g, [[0, 0], [27, 0], [32, 4], [5, 4]], 'rgba(185,163,233,0.32)');
        for (const x of [8, 24]) line(g, x, 0.5, x + 5, 4, 0.7, '#4d3178');
        line(g, 0, 4.5, 32, 4.5, 0.8, '#251746');
      }, FLAT);

    reg2('roof', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#4a35a8'], [1, '#1a0e4c']]); g.fillRect(0, 0, 32, 32);
        // brick courses
        g.fillStyle = 'rgba(10,5,50,0.35)';
        for (let y = 0; y < 32; y += 4) { g.fillRect(0, y, 32, 0.6); for (let x = (y / 4) % 2 ? 0 : 4; x < 32; x += 8) g.fillRect(x, y, 0.6, 4); }
        g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(0, 0, 0.8, 32);
        for (let wy = 3; wy < 32; wy += 15) for (let wx = 3; wx < 32; wx += 15) {
          const lit = ((wx * 7 + wy * 3) % 5) < 2;
          rrect(g, wx - 0.8, wy - 0.8, 10.6, 10.6, 1, '#120a3c');
          if (lit) {
            glowRect(g, '#ffb000', wx, wy, 9, 9);
            g.fillStyle = lg(g, wx, wy, wx, wy + 9, [[0, '#fff3a0'], [1, '#ff9a20']]); g.fillRect(wx, wy, 9, 9);
            g.fillStyle = 'rgba(90,40,0,0.5)'; g.fillRect(wx + 4.4, wy, 0.7, 9); g.fillRect(wx, wy + 4.4, 9, 0.7);
            g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(wx + 0.6, wy + 0.6, 3, 1);
          } else {
            g.fillStyle = lg(g, wx, wy, wx + 9, wy + 9, [[0, '#6a56d8'], [1, '#231470']]); g.fillRect(wx, wy, 9, 9);
            g.fillStyle = 'rgba(10,5,60,0.6)'; g.fillRect(wx + 4.4, wy, 0.7, 9); g.fillRect(wx, wy + 4.4, 9, 0.7);
            g.fillStyle = 'rgba(180,200,255,0.4)'; g.fillRect(wx + 0.6, wy + 0.6, 2.4, 0.9);
          }
          g.fillStyle = '#6a56d8'; g.fillRect(wx - 1.4, wy + 9.4, 11.8, 1);
        }
      }, FLAT);

    reg2('rack_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#c8f8ff'], [0.15, '#27e0ff'], [0.3, '#6a6aa8'], [1, '#2a2a4c']]); g.fillRect(0, 0, 32, 8);
        for (let x = 2; x < 32; x += 8) { g.fillStyle = 'rgba(10,10,40,0.55)'; g.fillRect(x, 4.4, 5, 0.9); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x, 5.4, 5, 0.5); }
        poly(g, [[0, 0], [27, 0], [32, 4], [5, 4]], '#7b97a4');
        for (const x of [8, 24]) line(g, x, 0.5, x + 5, 4, 0.7, '#334b64');
        line(g, 0, 4, 32, 4, 0.7, '#b8d2d7');
      }, FLAT);

    reg2('rack', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#34346a'], [1, '#1a1a3a']]); g.fillRect(0, 0, 32, 32);
        for (let y = 0; y < 32; y += 8) {
          g.fillStyle = '#0c0c26'; g.fillRect(1.4, y + 0.8, 29.2, 6);
          g.fillStyle = lg(g, 0, y + 1, 0, y + 7, [[0, '#4a4a80'], [1, '#26264c']]); g.fillRect(1.8, y + 1.2, 28.4, 5.2);
          for (let v = 0; v < 6; v++) { g.fillStyle = 'rgba(8,8,30,0.7)'; g.fillRect(4 + v * 1.8, y + 2.2, 0.8, 3.2); }
          const colors = ['#27e0ff', '#ff7ad9', '#4dff7a', '#ffd23f'];
          for (let k = 0; k < 4; k++) { const on = ((y * 3 + k * 5) % 7) < 4; const c = colors[(y / 8 + k) % 4]; if (on) glowRect(g, c, 18 + k * 3, y + 3, 1.6, 1.6); g.fillStyle = on ? c : '#2a2a50'; g.fillRect(18 + k * 3, y + 3, 1.6, 1.6); }
          g.fillStyle = '#8a8ab8'; g.fillRect(27.4, y + 2, 1.4, 1); g.fillRect(27.4, y + 4.4, 1.4, 1);
        }
      }, FLAT);

    reg2('rock_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ffe6ff'], [0.12, '#ff7ad9'], [0.3, '#8a5cd8'], [1, '#3a1a80']]); g.fillRect(0, 0, 32, 8);
        const r = rng(77);
        for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(20,8,70,0.4)'; g.fillRect(Math.floor(r() * 28), 3 + Math.floor(r() * 4), 2 + r() * 4, 0.8); }
        for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(Math.floor(r() * 28), 1.6 + Math.floor(r() * 2), 1 + r() * 3, 0.7); }
        poly(g, [[0, 0], [21, 0], [28, 2], [32, 5], [8, 5]], 'rgba(194,152,209,0.32)');
        line(g, 7, 0.5, 12, 3.5, 0.7, '#67418b'); line(g, 21, 0.5, 25, 4, 0.7, '#67418b');
      }, FLAT);

    reg2('rock', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#5a3aa8'], [0.6, '#33196e'], [1, '#1e0e4c']]); g.fillRect(0, 0, 32, 32);
        const r = rng(91);
        for (let y = 2; y < 32; y += 5) {
          g.fillStyle = 'rgba(14,5,56,0.45)'; g.fillRect(0, y + r() * 2, 32, 0.9);
          g.fillStyle = 'rgba(190,150,255,0.22)'; g.fillRect(0, y + 1 + r() * 2, 32, 0.6);
        }
        for (let i = 0; i < 9; i++) { const x = r() * 28, y = r() * 28; g.fillStyle = 'rgba(14,5,56,0.5)'; g.fillRect(x, y, 1 + r() * 3, 0.8); g.fillStyle = 'rgba(255,150,230,0.35)'; g.fillRect(x + 0.6, y + 1, 1 + r() * 2, 0.6); }
        for (let i = 0; i < 4; i++) { const x = 2 + r() * 26, y = 4 + r() * 24; ell(g, x, y, 1.2, 0.8, 'rgba(39,224,255,0.55)'); }
      }, FLAT);
  };
})();
