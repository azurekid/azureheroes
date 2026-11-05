/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.guardian.5'] = function (C) {
    const { ell, glow, lg, limb, line, poly, reg2, rrect, shade } = C;

    Object.assign(C, { bossFrame });
    function bossFrame(mode) {
        return function (g) {
          const stun = mode === 'stun', atk = mode === 'attack';
          const eye = stun ? '#6a6a80' : '#ff2a4a';
          const up = atk ? 10 : 0;
          const A = { a: '#7a3fe0', b: '#4a1f9a', c: '#b48cff', d: '#1d0a48' };
          // legs
          limb(g, 23, 58, 22, 70, 11, A.d, A.b, A.a);
          poly(g, [[14, 70], [30, 70], [32, 79.6], [11, 79.6]], lg(g, 0, 70, 0, 80, [[0, A.a], [1, A.d]]));
          limb(g, 41, 58, 42, 70, 11, A.d, A.b, A.a);
          poly(g, [[34, 70], [50, 70], [53, 79.6], [32, 79.6]], lg(g, 0, 70, 0, 80, [[0, A.a], [1, A.d]]));
          // arms
          limb(g, 9, 28, 8, 42 - up, 10, A.d, A.b, A.a);
          limb(g, 8, 42 - up, 8, 52 - up, 9, A.d, A.b, A.a);
          ell(g, 8, 56 - up, 6.4, 6, lg(g, 2, 50 - up, 14, 62 - up, [[0, '#f0f0ff'], [1, '#6a6e90']]));
          limb(g, 55, 28, 56, 42 - up, 10, A.d, A.b, A.a);
          limb(g, 56, 42 - up, 56, 52 - up, 9, A.d, A.b, A.a);
          ell(g, 56, 56 - up, 6.4, 6, lg(g, 50, 50 - up, 62, 62 - up, [[0, '#f0f0ff'], [1, '#6a6e90']]));
          if (atk) { [8, 56].forEach((x) => { const gr = g.createRadialGradient(x, 52, 0, x, 52, 9); gr.addColorStop(0, 'rgba(255,200,215,0.95)'); gr.addColorStop(1, 'rgba(255,42,74,0)'); g.fillStyle = gr; g.fillRect(x - 10, 42, 20, 20); }); }
          // torso
          poly(g, [[12, 24], [52, 24], [49, 40], [44, 60], [20, 60], [15, 40]], lg(g, 12, 24, 52, 60, [[0, A.c], [0.3, A.a], [1, A.d]]));
          rrect(g, 19, 29, 26, 24, 4, '#1a0a3a');
          rrect(g, 21, 31, 22, 20, 3, lg(g, 21, 31, 43, 51, [[0, A.b], [1, A.d]]));
          [[23, 34], [23, 38], [23, 42], [39, 34], [39, 38], [39, 42]].forEach((p) => { line(g, p[0], p[1], p[0] + 3, p[1], 0.8, stun ? '#555570' : '#ff7ad9'); });
          const core = stun ? '#555570' : '#ff5a7a';
          const cg = g.createRadialGradient(32, 41, 0, 32, 41, 11);
          cg.addColorStop(0, stun ? 'rgba(160,160,180,0.9)' : 'rgba(255,255,255,0.95)'); cg.addColorStop(0.35, core); cg.addColorStop(1, 'rgba(255,42,74,0)');
          g.fillStyle = cg; g.fillRect(20, 29, 24, 24);
          line(g, 14, 48, 50, 48, 0.8, 'rgba(13,4,40,0.6)');
          rrect(g, 20, 55.4, 24, 3.4, 1.4, '#c4e6ff');
          // shoulder pads
          ell(g, 9.6, 24.6, 8.6, 6.4, lg(g, 2, 18, 18, 31, [[0, A.c], [0.5, A.a], [1, A.b]]));
          ell(g, 54.4, 24.6, 8.6, 6.4, lg(g, 46, 18, 62, 31, [[0, A.c], [0.5, A.a], [1, A.b]]));
          [[5, 22], [9.6, 20], [14, 22]].forEach((p) => ell(g, p[0], p[1], 0.9, 0.9, '#f0f0ff'));
          [[50, 22], [54.4, 20], [59, 22]].forEach((p) => ell(g, p[0], p[1], 0.9, 0.9, '#f0f0ff'));
          // head
          rrect(g, 20, 3, 24, 21, 6, lg(g, 20, 3, 44, 24, [[0, A.c], [0.4, A.a], [1, A.b]]));
          rrect(g, 22.4, 8.6, 19.2, 9, 3, '#0d0424');
          [26.6, 37.4].forEach((x) => { if (!stun) { const eg = g.createRadialGradient(x, 13, 0, x, 13, 6); eg.addColorStop(0, 'rgba(255,255,255,0.95)'); eg.addColorStop(0.3, '#ff2a4a'); eg.addColorStop(1, 'rgba(255,42,74,0)'); g.fillStyle = eg; g.fillRect(x - 7, 6, 14, 14); } ell(g, x, 13, 3.2, 2.6, eye); });
          line(g, 24, 11, 29, 12, 0.9, stun ? '#8a8aa0' : '#ffb0c0'); line(g, 40, 11, 35, 12, 0.9, stun ? '#8a8aa0' : '#ffb0c0');
          rrect(g, 25, 19.4, 14, 3.4, 1.4, A.d);
          for (let i = 0; i < 5; i++) line(g, 27 + i * 2.5, 19.8, 27 + i * 2.5, 22.4, 0.5, '#b48cff');
          line(g, 32, 3.4, 32, 0, 1.1, '#d4d6ec'); ell(g, 32, 0.8, 1.6, 1.6, stun ? '#888' : '#ff2a4a');
          ell(g, 19.4, 13, 2.2, 4, '#6a6e90'); ell(g, 44.6, 13, 2.2, 4, '#6a6e90');
          if (stun) {
            [[7, 10], [53, 6], [45, 2], [20, 1]].forEach((p) => { poly(g, [[p[0], p[1] - 3.4], [p[0] + 1, p[1] - 1], [p[0] + 3.4, p[1]], [p[0] + 1, p[1] + 1], [p[0], p[1] + 3.4], [p[0] - 1, p[1] + 1], [p[0] - 3.4, p[1]], [p[0] - 1, p[1] - 1]], '#ffd23f'); });
          }
        };
      }

    reg2('boss_0', 64, 80, bossFrame('idle'), { shade: 0.5 });

    reg2('boss_attack', 64, 80, bossFrame('attack'), { shade: 0.5 });

    reg2('boss_stun', 64, 80, bossFrame('stun'), { shade: 0.5 });

    reg2('bolt', 22, 12, function (g) {
        const gr = g.createLinearGradient(0, 0, 22, 0);
        gr.addColorStop(0, 'rgba(255,42,74,0)'); gr.addColorStop(0.5, 'rgba(255,42,74,0.7)'); gr.addColorStop(1, '#ff2a4a');
        poly(g, [[0, 6], [8, 3], [18, 2], [21.6, 6], [18, 10], [8, 9]], gr);
        poly(g, [[6, 6], [12, 4.6], [19, 5], [19, 7], [12, 7.4]], '#ffb0c0');
        ell(g, 18, 6, 2.6, 2.6, '#ffffff');
      }, { shade: 0, noOutline: true, glow: '#ff2a4a' });
  };
})();
