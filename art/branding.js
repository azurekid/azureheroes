/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.branding.80'] = function (C) {
    const { FLAT, ell, glow, glowRect, lg, line, msLogo, poly, reg2, rrect, shade, txt, txtW } = C;

    Object.assign(C, { tree, lamp, palm });
    reg2('ms_logo', 16, 16, function (g) { msLogo(g, 0.5, 0.5, 15); }, FLAT);

    reg2('clippy', 20, 30, function (g) {
        g.lineCap = 'round'; g.strokeStyle = '#c8cce8'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(7, 26); g.lineTo(7, 9); g.arc(11, 9, 4, Math.PI, 0); g.lineTo(15, 22); g.arc(11.5, 22, 3.5, 0, Math.PI); g.lineTo(8, 12); g.stroke();
        g.strokeStyle = '#7a7ea8'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(7.6, 26); g.lineTo(7.6, 9); g.stroke();
        [[6, 12], [14, 12]].forEach(function (e) { ell(g, e[0], e[1], 2.6, 3, '#ffffff'); ell(g, e[0] + 0.6, e[1] + 0.4, 1.2, 1.4, '#14082a'); });
        line(g, 3.6, 8, 7.4, 8.6, 0.8, '#14082a'); line(g, 12.6, 8.6, 16.4, 8, 0.8, '#14082a');
      }, { shade: 0.3 });

    reg2('ach_icon', 16, 16, function (g) {
        ell(g, 8, 8, 7.6, 7.6, lg(g, 0, 0, 0, 16, [[0, '#9aff7a'], [1, '#107c10']]));
        poly(g, [[4.6, 4], [11.4, 4], [10.6, 8.4], [8, 10], [5.4, 8.4]], '#ffffff'); g.fillStyle = '#ffffff'; g.fillRect(7.2, 9.6, 1.6, 2); g.fillRect(5.6, 11.4, 4.8, 1.2);
      }, FLAT);

    reg2('ebolt', 12, 6, function (g) {
        ell(g, 6, 3, 5.6, 2.6, 'rgba(255,90,60,0.6)'); ell(g, 7, 3, 3.6, 1.8, '#ff9a5a'); ell(g, 8, 3, 1.8, 1.1, '#ffffff');
      }, { shade: 0, noOutline: true, glow: '#ff5a3c' });

    const BILLS = [
        ['AZURE', '#27e0ff'], ['MICROSOFT 365', '#ff9a40'], ['XBOX GAME PASS', '#7dff7a'], ['COPILOT', '#c9a0ff'], ['TEAMS', '#9a8cff'],
        ['GITHUB', '#ffffff'], ['VS CODE', '#4ab4ff'], ['WINDOWS 11', '#4ad8ff'], ['POWER BI', '#ffd23f'], ['EDGE', '#4dffb0'],
        ['DEFENDER', '#7fe8ff'], ['AZURE AI', '#ff7ad9'], ['MINECRAFT', '#7dff7a'], ['OUTLOOK', '#4ab4ff'], ['BING', '#27e0ff']
      ];

    const billKeys = [];

    BILLS.forEach(function (b, i) {
        const tw = txtW(b[0], 1), w = Math.round(tw + 24), h = 50;
        billKeys.push('bb_' + i);
        reg2('bb_' + i, w, h, function (g) {
          g.fillStyle = '#1a1036'; g.fillRect(w * 0.25 - 1, 18, 2.4, h - 18); g.fillRect(w * 0.75 - 1, 18, 2.4, h - 18);
          g.fillStyle = 'rgba(10,6,30,0.92)'; rrect(g, 0.5, 0.5, w - 1, 19, 2, g.fillStyle);
          g.strokeStyle = b[1]; g.lineWidth = 1; g.globalAlpha = 0.35; g.strokeRect(-0.5, -0.5, w + 1, 21); g.globalAlpha = 1; g.strokeRect(1, 1, w - 2, 18);
          msLogo(g, 4.5, 5.5, 9);
          txt(g, b[0], 17, 6.6, 1, b[1]);
          g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(2, 2, w - 4, 2);
        }, FLAT);
      });

    const MP = {
    westeurope: C.part('amsterdam', 'MP_westeurope'),
    uksouth: C.part('london', 'MP_uksouth'),
    japaneast: C.part('tokyo', 'MP_japaneast'),
    australiaeast: C.part('sydney', 'MP_australiaeast'),
    brazilsouth: C.part('rio', 'MP_brazilsouth')
    };

    function tree(g, x, base, h, leaf) {
        g.fillStyle = '#2a1430'; g.fillRect(x - 1.2, base - h * 0.45, 2.4, h * 0.45);
        [[0, -0.7, 0.36], [-0.22, -0.55, 0.28], [0.22, -0.55, 0.28], [0, -0.92, 0.22]].forEach(function (c) { ell(g, x + c[0] * h, base + c[1] * h, c[2] * h, c[2] * h * 0.85, leaf); });
        ell(g, x - h * 0.1, base - h * 0.8, h * 0.12, h * 0.08, 'rgba(255,255,255,0.18)');
      }

    function lamp(g, x, base, h, col) { g.fillStyle = '#14082a'; g.fillRect(x - 0.6, base - h, 1.2, h); ell(g, x, base - h, 2.2, 2.6, col); glowRect(g, col, x - 4, base - h - 4, 8, 8); }

    function palm(g, x, base, h) {
        g.strokeStyle = '#5a3a2a'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + h * 0.18, base - h * 0.5, x + h * 0.06, base - h); g.stroke();
        const tx = x + h * 0.06, ty = base - h;
        for (let k = 0; k < 7; k++) { const a = -Math.PI * 0.95 + k * Math.PI * 0.3; g.strokeStyle = k % 2 ? '#2a9a5a' : '#1a7a4a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * h * 0.25, ty + Math.sin(a) * h * 0.25 - 6, tx + Math.cos(a) * h * 0.42, ty + Math.sin(a) * h * 0.18 + 6); g.stroke(); }
        ell(g, tx, ty + 2, 2.6, 2.6, '#6a3a1a');
      }

    Object.assign(C, { BILLS, billKeys, MP });
  };
})();
