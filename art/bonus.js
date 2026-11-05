/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.bonus.74'] = function (C) {
    const { ell, glowRect, lg, line, msLogo, reg2, rrect, shade } = C;

    Object.assign(C, { bikeArt });
    function bikeArt(f) {
        return function (g) {
          [[8, 19], [32, 19]].forEach(function (w) {
            g.lineWidth = 2; g.strokeStyle = '#0a0620'; g.beginPath(); g.arc(w[0], w[1], 6.4, 0, 7); g.stroke();
            g.lineWidth = 0.5; g.strokeStyle = '#c4e6ff';
            for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4 + f * Math.PI / 8; g.beginPath(); g.moveTo(w[0] - Math.cos(a) * 5.4, w[1] - Math.sin(a) * 5.4); g.lineTo(w[0] + Math.cos(a) * 5.4, w[1] + Math.sin(a) * 5.4); g.stroke(); }
            ell(g, w[0], w[1], 1.2, 1.2, '#ffffff');
          });
          const fr = '#1a8fff';
          line(g, 8, 19, 17, 10, 1.8, fr); line(g, 17, 10, 28, 10, 1.8, fr); line(g, 17, 10, 20, 19, 1.8, fr); line(g, 20, 19, 8, 19, 1.8, fr); line(g, 28, 10, 32, 19, 1.8, fr); line(g, 20, 19, 28, 10, 1.4, fr);
          line(g, 28, 10, 29, 4.6, 1.4, '#0a0620'); line(g, 26.4, 4.4, 31, 4.4, 1.4, '#0a0620');
          rrect(g, 13.6, 7.6, 7, 2.2, 1, '#0a0620');
          rrect(g, 30, 6, 9, 7, 1.2, lg(g, 30, 6, 30, 13, [[0, '#ffffff'], [1, '#a8b8e0']])); msLogo(g, 32.2, 7.4, 4.6);
          ell(g, 38.4, 10.6, 1.2, 1.2, '#fff6c0'); glowRect(g, '#fff6c0', 37.4, 9.6, 2.2, 2.2);
          g.fillStyle = '#ff7ad9'; g.fillRect(6, 9.4, 4, 1.2);
        };
      }

    reg2('bike_ride0', 40, 26, bikeArt(0), { shade: 0.35 });

    reg2('bike_ride1', 40, 26, bikeArt(1), { shade: 0.35 });
  };

  AH.ArtModules.stages['art.bonus.76'] = function (C) {
    const { FLAT, ell, glow, lg, line, msLogo, reg2, rng, rrect, shade, txt, txtW } = C;

    reg2('bonus_bg', 640, 360, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 300, [[0, '#0a4ad8'], [0.6, '#4a9aff'], [1, '#bfe4ff']]); g.fillRect(0, 0, 640, 360);
        const r = rng(5);
        for (let i = 0; i < 11; i++) { const cx = r() * 640, cy = 30 + r() * 150, w = 30 + r() * 60; for (let k = 0; k < 5; k++) ell(g, cx + k * w / 5, cy - Math.sin(k) * 4, w / 4, 6 + r() * 4, 'rgba(255,255,255,0.75)'); }
        g.globalAlpha = 0.22; msLogo(g, 250, 40, 140); g.globalAlpha = 1;
        g.beginPath(); g.moveTo(0, 250); g.bezierCurveTo(160, 170, 420, 160, 640, 230); g.lineTo(640, 360); g.lineTo(0, 360); g.closePath();
        g.fillStyle = lg(g, 0, 170, 0, 360, [[0, '#8ae04a'], [0.4, '#3aa82a'], [1, '#1a5a1a']]); g.fill();
        g.fillStyle = 'rgba(255,255,200,0.3)'; for (let i = 0; i < 60; i++) g.fillRect(r() * 640, 220 + r() * 120, 3 + r() * 6, 0.6);
      }, FLAT);

    reg2('bonus_bg_retro', 640, 360, function (g) {
        g.fillStyle = '#0a8a8a'; g.fillRect(0, 0, 640, 360);
        g.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = 0; y < 360; y += 2) g.fillRect(0, y, 640, 1);
        const icon = function (x, y, kind, label) {
          if (kind === 0) { g.fillStyle = '#d8d8d8'; g.fillRect(x, y, 22, 16); g.fillStyle = '#1a3aa8'; g.fillRect(x + 2, y + 2, 18, 11); g.fillStyle = '#a8a8a8'; g.fillRect(x + 6, y + 16, 10, 4); }
          else if (kind === 1) { g.fillStyle = '#e8e8e8'; g.fillRect(x + 3, y + 2, 16, 18); g.fillStyle = '#a8a8a8'; for (let i = 0; i < 4; i++) g.fillRect(x + 6 + i * 3.4, y + 4, 1, 15); }
          else if (kind === 2) { g.fillStyle = '#ffd23f'; g.fillRect(x, y + 4, 22, 15); g.fillStyle = '#e8a820'; g.fillRect(x, y + 2, 9, 4); }
          else { msLogo(g, x + 2, y + 1, 18); }
          txt(g, label, x + 11 - txtW(label, 0.5) / 2, y + 24, 0.5, '#ffffff');
        };
        [[0, 'MY PC'], [1, 'RECYCLE'], [2, 'PROJECTS'], [3, 'AZURE'], [2, 'GAMES']].forEach(function (d, i) { icon(16, 16 + i * 44, d[0], d[1]); });
        const win = function (x, y, w, h, title) {
          g.fillStyle = '#c0c0c0'; g.fillRect(x, y, w, h);
          g.fillStyle = '#ffffff'; g.fillRect(x, y, w, 1); g.fillRect(x, y, 1, h);
          g.fillStyle = '#404040'; g.fillRect(x, y + h - 1, w, 1); g.fillRect(x + w - 1, y, 1, h);
          g.fillStyle = lg(g, x, 0, x + w, 0, [[0, '#0a1a8a'], [1, '#1a8ad8']]); g.fillRect(x + 2, y + 2, w - 4, 9);
          txt(g, title, x + 5, y + 4, 0.5, '#ffffff');
          g.fillStyle = '#c0c0c0'; [0, 1, 2].forEach(function (k) { g.fillRect(x + w - 11 - k * 9, y + 3, 7, 6); });
          g.fillStyle = '#ffffff'; g.fillRect(x + 3, y + 13, w - 6, h - 16);
        };
        win(110, 40, 230, 140, 'AZURE PORTAL.EXE');
        g.fillStyle = '#27a0ff'; g.fillRect(114, 56, 222, 14); txt(g, 'MICROSOFT AZURE', 120, 60, 0.6, '#ffffff');
        for (let i = 0; i < 6; i++) { g.fillStyle = ['#27a0ff', '#7dff7a', '#ffd23f', '#ff7ad9', '#c9a0ff', '#ff9a40'][i]; g.fillRect(122 + (i % 3) * 70, 82 + Math.floor(i / 3) * 44, 56, 34); }
        win(380, 70, 200, 110, 'MINESWEEPER');
        for (let r = 0; r < 6; r++) for (let c = 0; c < 12; c++) { g.fillStyle = (r * 7 + c * 3) % 11 === 0 ? '#ff2a4a' : '#bdbdbd'; g.fillRect(388 + c * 15.5, 88 + r * 14.5, 14, 13); }
        win(250, 150, 180, 70, 'CLIPPY.TXT');
        txt(g, 'IT LOOKS LIKE YOU', 260, 172, 0.6, '#14082a'); txt(g, 'FOUND A SECRET!', 260, 184, 0.6, '#14082a');
      }, FLAT);

    reg2('retro_top', 32, 8, function (g) {
        g.fillStyle = '#c0c0c0'; g.fillRect(0, 0, 32, 8); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 32, 1.2); g.fillStyle = '#808080'; g.fillRect(0, 7, 32, 1);
      }, FLAT);

    reg2('retro', 32, 32, function (g) {
        g.fillStyle = '#c0c0c0'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#a0a0a0'; g.fillRect(0, 0, 32, 2);
        g.fillStyle = '#d8d8d8'; g.fillRect(3, 6, 26, 10); g.fillStyle = '#808080'; g.fillRect(3, 15, 26, 1); g.fillRect(28, 6, 1, 10);
        msLogo(g, 5, 8, 6); txt(g, 'START', 13, 9, 0.5, '#14082a');
      }, FLAT);

    reg2('retro_plat', 80, 20, function (g) {
        g.fillStyle = '#c0c0c0'; g.fillRect(0, 2, 80, 18); g.fillStyle = '#ffffff'; g.fillRect(0, 2, 80, 1); g.fillStyle = '#404040'; g.fillRect(0, 19, 80, 1); g.fillRect(79, 2, 1, 18);
        g.fillStyle = lg(g, 0, 0, 80, 0, [[0, '#0a1a8a'], [1, '#1a8ad8']]); g.fillRect(2, 4, 76, 8);
        txt(g, 'OK', 6, 6, 0.5, '#ffffff'); g.fillStyle = '#c0c0c0'; g.fillRect(70, 5, 6, 6);
      }, { shade: 0.3 });

    reg2('bonus_bg_xbox', 640, 360, function (g) {
        g.fillStyle = '#050a05'; g.fillRect(0, 0, 640, 360);
        const rg = g.createRadialGradient(320, 140, 10, 320, 140, 320); rg.addColorStop(0, 'rgba(60,220,60,0.55)'); rg.addColorStop(0.5, 'rgba(16,124,16,0.25)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = rg; g.fillRect(0, 0, 640, 360);
        g.strokeStyle = 'rgba(80,255,80,0.22)'; g.lineWidth = 0.8;
        for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(320 + i * 14, 230); g.lineTo(320 + i * 70, 360); g.stroke(); }
        for (let k = 0; k < 7; k++) { const y = 230 + k * k * 2.9; g.beginPath(); g.moveTo(0, y); g.lineTo(640, y); g.stroke(); }
        ell(g, 320, 130, 62, 62, lg(g, 0, 68, 0, 192, [[0, '#f4fff4'], [0.6, '#c8d8c8'], [1, '#7a8a7a']]));
        g.save(); g.beginPath(); g.arc(320, 130, 62, 0, Math.PI * 2); g.clip();
        g.strokeStyle = '#107c10'; g.lineWidth = 15; g.lineCap = 'round';
        g.beginPath(); g.moveTo(278, 84); g.quadraticCurveTo(320, 128, 362, 176); g.stroke();
        g.beginPath(); g.moveTo(362, 84); g.quadraticCurveTo(320, 128, 278, 176); g.stroke();
        g.restore();
        ell(g, 300, 104, 20, 10, 'rgba(255,255,255,0.35)');
        const r = rng(9);
        for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(125,255,122,' + (0.2 + r() * 0.5) + ')'; g.fillRect(r() * 640, r() * 220, 1.4, 1.4); }
      }, FLAT);

    reg2('xbox_top', 32, 8, function (g) {
        g.fillStyle = '#0c140c'; g.fillRect(0, 0, 32, 8); g.fillStyle = '#7dff7a'; g.fillRect(0, 0, 32, 1.4); g.fillStyle = 'rgba(125,255,122,0.35)'; g.fillRect(0, 1.4, 32, 2);
      }, FLAT);

    reg2('xbox', 32, 32, function (g) {
        g.fillStyle = '#0a100a'; g.fillRect(0, 0, 32, 32); g.strokeStyle = 'rgba(16,124,16,0.8)'; g.lineWidth = 0.8; g.strokeRect(0.5, 0.5, 31, 31);
        ell(g, 16, 16, 5, 5, '#107c10'); line(g, 13, 13, 19, 19, 1.2, '#0a100a'); line(g, 19, 13, 13, 19, 1.2, '#0a100a');
      }, FLAT);

    reg2('xbox_plat', 80, 20, function (g) {
        rrect(g, 0, 2, 80, 16, 3, '#0c140c'); g.fillStyle = '#7dff7a'; g.fillRect(2, 2, 76, 1.6);
        g.fillStyle = 'rgba(125,255,122,0.45)'; g.fillRect(2, 15, 76, 1);
        for (let i = 0; i < 4; i++) { ell(g, 14 + i * 17, 10, 3, 3, ['#7dff7a', '#ff4a4a', '#4ab4ff', '#ffd23f'][i]); }
      }, { shade: 0.3, glow: '#7dff7a' });
  };
})();
