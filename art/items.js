/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.items.6'] = function (C) {
    const { R, ell, glow, lg, limb, line, poly, reg, reg2, rrect, shade } = C;

    Object.assign(C, { flag });
    const FLAT = { shade: 0, noOutline: true };

    reg2('mission_briefing', 604, 282, function (g) {
      rrect(g, 1, 1, 602, 280, 9, '#0b1230');
      g.strokeStyle = '#27e0ff'; g.lineWidth = 2; g.strokeRect(5, 5, 594, 272);
      g.fillStyle = '#152c46'; g.fillRect(16, 56, 88, 178);
      line(g, 118, 62, 118, 236, 1, '#285268');
      line(g, 16, 42, 588, 42, 1, '#285268');
    }, FLAT);

    reg2('boss_access_token', 24, 28, function (g) {
      poly(g, [[12, 1], [22, 7], [22, 21], [12, 27], [2, 21], [2, 7]], '#39c985');
      poly(g, [[12, 4], [19, 9], [19, 19], [12, 24], [5, 19], [5, 9]], '#15435a');
      ell(g, 10, 12, 3.5, 3.5, '#d6ffca'); ell(g, 10, 12, 1.5, 1.5, '#15435a');
      line(g, 12, 14, 17, 19, 2, '#d6ffca'); line(g, 15, 16, 13, 18, 2, '#d6ffca');
    }, FLAT);
    for (const kind of ['suit', 'hat', 'gear', 'hair']) reg2('wardrobe_cache_' + kind, 30, 30, function (g) {
      rrect(g, 1, 1, 28, 28, 4, '#243452'); line(g, 5, 27, 25, 27, 1, '#ffb8e3');
      if (kind === 'hat') {
        rrect(g, 7, 8, 16, 10, 4, '#f3bb75'); rrect(g, 4, 17, 22, 4, 1, '#e38860');
      } else if (kind === 'suit') {
        poly(g, [[10, 6], [4, 11], [7, 16], [10, 14], [10, 24], [21, 24], [21, 14], [24, 16], [27, 11], [21, 6], [18, 10], [14, 10]], '#77dce6');
        line(g, 15, 11, 15, 23, 1, '#e8ffff');
      } else if (kind === 'gear') {
        rrect(g, 7, 10, 17, 14, 3, '#d5a467'); line(g, 11, 10, 11, 6, 2, '#f3d9a9');
        line(g, 11, 6, 20, 6, 2, '#f3d9a9'); line(g, 20, 6, 20, 10, 2, '#f3d9a9');
      } else {
        ell(g, 15, 15, 9, 10, '#b78c6c'); poly(g, [[6, 15], [6, 7], [12, 4], [23, 7], [24, 15], [19, 9], [9, 12]], '#593b51');
      }
    }, FLAT);

    [['coin0', 12], ['coin1', 8], ['coin2', 4], ['coin3', 8]].forEach(function (c) {
        reg2(c[0], 14, 14, function (g) {
          const w = c[1] / 2;
          ell(g, 7, 7, w, 6.2, lg(g, 7 - w, 1, 7 + w, 13, [[0, '#fff3a0'], [0.4, '#ffd23f'], [1, '#c77800']]));
          if (w > 3) {
            ell(g, 7, 7, w - 1.3, 4.9, lg(g, 0, 2, 0, 12, [[0, '#ffe680'], [1, '#e89400']]));
            poly(g, [[7, 3.6], [9.4, 9.6], [8.3, 9.6], [7.8, 8.3], [6.2, 8.3], [5.7, 9.6], [4.6, 9.6]], '#a85a00');
            ell(g, 5.2, 3.8, 1.2, 0.7, 'rgba(255,255,255,0.9)', -0.5);
          } else {
            rrect(g, 6.2, 1.4, 1.6, 11.2, 0.6, '#ffe680');
          }
        }, { shade: 0.4 });
      });

    reg2('mfa', 20, 22, function (g) {
        const sh = [[10, 0.8], [18.4, 3], [18, 12.6], [14.4, 18], [10, 21.2], [5.6, 18], [2, 12.6], [1.6, 3]];
        poly(g, sh, lg(g, 2, 1, 18, 21, [[0, '#d8fbff'], [0.35, '#27e0ff'], [1, '#0a6fa8']]));
        poly(g, [[10, 3], [16, 4.6], [15.8, 12], [13, 16], [10, 18.4], [7, 16], [4.2, 12], [4, 4.6]], lg(g, 4, 3, 16, 18, [[0, '#1a5fe0'], [1, '#0a2a80']]));
        // key
        ell(g, 7.6, 9, 2.6, 2.6, '#e8fbff'); ell(g, 7.6, 9, 1.1, 1.1, '#0a2a80');
        rrect(g, 9.4, 8.2, 6, 1.7, 0.6, '#e8fbff'); rrect(g, 12.2, 9.4, 1.3, 2.6, 0.4, '#e8fbff'); rrect(g, 14.2, 9.4, 1.3, 2, 0.4, '#e8fbff');
        poly(g, [[10, 1.6], [13, 2.2], [6, 8], [4, 6]], 'rgba(255,255,255,0.35)');
      }, { shade: 0.4 });

    reg2('ring', 56, 72, function (g) {
        g.lineWidth = 5.4; g.strokeStyle = lg(g, 6, 4, 50, 68, [[0, '#fff3a0'], [0.4, '#ffb000'], [1, '#a85a00']]);
        g.beginPath(); g.ellipse(28, 36, 21.4, 31.4, 0, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 1.6; g.strokeStyle = '#fff8d0';
        g.beginPath(); g.ellipse(28, 36, 22.6, 32.6, 0, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
        g.lineWidth = 1; g.strokeStyle = 'rgba(120,60,0,0.6)';
        g.beginPath(); g.ellipse(28, 36, 18.8, 28.8, 0, 0.2, Math.PI * 0.9); g.stroke();
      }, { shade: 0.3 });

    reg2('laser_emit', 14, 10, function (g) {
        rrect(g, 0.6, 2, 12.8, 7.6, 1.6, lg(g, 0, 2, 0, 10, [[0, '#b4b8e0'], [0.4, '#5a5e8a'], [1, '#2a2c4c']]));
        rrect(g, 4.6, 0, 4.8, 4, 1.4, '#ff2a4a'); ell(g, 7, 1.4, 1.2, 0.9, '#ffffff');
        [[2, 5.4], [11.4, 5.4], [2, 8], [11.4, 8]].forEach((p) => ell(g, p[0], p[1], 0.5, 0.5, '#e8e8ff'));
      }, { shade: 0.4 });

    reg2('laser_beam', 8, 8, function (g) {
        const gr = g.createLinearGradient(0, 0, 8, 0);
        gr.addColorStop(0, 'rgba(255,42,74,0)'); gr.addColorStop(0.3, 'rgba(255,42,74,0.55)'); gr.addColorStop(0.5, '#ffd0d8'); gr.addColorStop(0.7, 'rgba(255,42,74,0.55)'); gr.addColorStop(1, 'rgba(255,42,74,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 8, 8);
        g.fillStyle = '#ffffff'; g.fillRect(3.4, 0, 1.2, 8);
      }, FLAT);

    function flag(on) {
        return function (g) {
          rrect(g, 2, 0, 2, 44, 0.8, lg(g, 2, 0, 4, 0, [[0, '#e6e8ff'], [1, '#6a6e90']]));
          ell(g, 3, 1, 2, 2, on ? '#e8fbff' : '#9a9ec0');
          poly(g, [[4, 3], [14, 4.6], [12, 7.4], [14, 10.2], [4, 11.4]], on ? lg(g, 4, 3, 14, 11, [[0, '#d8fbff'], [0.5, '#27e0ff'], [1, '#0a7fc8']]) : lg(g, 4, 3, 14, 11, [[0, '#8a8ab0'], [1, '#444466']]));
          if (on) { [['#f25022', 5.6, 4.8], ['#7fba00', 8.4, 5.2], ['#00a4ef', 5.6, 7.6], ['#ffb900', 8.4, 8]].forEach(function (q) { g.fillStyle = q[0]; g.fillRect(q[1], q[2], 2.4, 2.4); }); }
          rrect(g, 0, 40, 16, 4, 1, on ? '#177660' : '#555a80');
          line(g, 1, 41, 15, 41, 1, on ? '#9fffd8' : '#d8e8ff');
        };
      }

    reg2('flag_off', 16, 44, flag(false), { shade: 0.4 });

    reg2('flag_on', 16, 44, flag(true), { shade: 0.4 });

    [['#c98e65', '#32496d', '#30251f'], ['#754f3d', '#287c83', '#221e28'],
      ['#e4b491', '#665184', '#67412b']].forEach(function (palette, i) {
      reg2('checkpoint_guide_' + i, 28, 44, function (g) {
        ell(g, 14, 42, 12, 2, '#242339');
        rrect(g, 6, 28, 6, 13, 1.5, '#263449');
        rrect(g, 16, 28, 6, 13, 1.5, '#263449');
        rrect(g, 4, 39, 9, 5, 1, '#182238');
        rrect(g, 15, 39, 10, 5, 1, '#182238');
        rrect(g, 5, 16, 18, 16, 3, palette[1]);
        line(g, 14, 18, 14, 30, 1, '#bedbe5');
        rrect(g, 16, 19, 5, 6, 0.5, '#e8f4ff');
        line(g, 17, 21, 20, 21, 1, '#0078d4');
        limb(g, 6, 19, 3, 29, 4, '#182238', palette[1], '#8ab8ca');
        ell(g, 3, 30, 2, 2.5, palette[0]);
        limb(g, 22, 19, 25, 13, 4, '#182238', palette[1], '#8ab8ca');
        ell(g, 25, 11, 2, 3, palette[0]);
        rrect(g, 7, 2, 14, 14, 5, palette[0]);
        poly(g, [[7, 8], [6, 3], [10, 0], [18, 0], [22, 4], [20, 8], [18, 4], [10, 5]], palette[2]);
        ell(g, 11, 9, 0.7, 0.8, '#252637');
        ell(g, 17, 9, 0.7, 0.8, '#252637');
        line(g, 12, 13, 16, 13, 0.7, '#6d493e');
      }, { shade: 0.3 });
    });

    reg2('checkpoint_lesson', 380, 44, function (g) {
      rrect(g, 0, 0, 380, 44, 4, 'rgba(10,18,40,0.94)');
      line(g, 8, 1, 372, 1, 1, '#7fe8ff');
      line(g, 8, 43, 372, 43, 1, '#287c83');
    }, { shade: 0, noOutline: true });

    reg2('terminal', 30, 40, function (g) {
        poly(g, [[3, 40], [27, 40], [26, 17], [4, 17]], lg(g, 0, 17, 0, 40, [[0, '#4a4a7c'], [1, '#1c1c3c']]));
        rrect(g, 3, 14, 24, 4, 1.4, '#8a8ab8');
        rrect(g, 4, 1, 22, 15, 2.4, '#0a1230');
        rrect(g, 6, 3, 18, 11, 1.4, lg(g, 6, 3, 24, 14, [[0, '#7fffd0'], [0.5, '#27e0ff'], [1, '#0a8fd8']]));
        [[8, 5, 7], [8, 7.6, 11], [8, 10.2, 5], [14.6, 10.2, 6]].forEach((l) => rrect(g, l[0], l[1], l[2], 1, 0.4, '#06203a'));
        ell(g, 21, 5.6, 1, 1, '#ff7ad9');
        rrect(g, 6, 21, 18, 2, 0.8, '#ff7ad9');
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) rrect(g, 6.4 + i * 6.2, 26 + j * 5.2, 5, 3.6, 1, lg(g, 0, 26 + j * 5, 0, 30 + j * 5, [[0, '#c8f4ff'], [1, '#4a9ac8']]));
      }, { shade: 0.4 });

    reg2('gate', 20, 16, function (g) {
        g.fillStyle = 'rgba(255,42,74,0.22)'; g.fillRect(0, 0, 20, 16);
        for (let x = 1; x < 20; x += 10) {
          const gr = g.createLinearGradient(x, 0, x + 8, 0);
          gr.addColorStop(0, 'rgba(255,42,74,0)'); gr.addColorStop(0.5, '#ff2a4a'); gr.addColorStop(1, 'rgba(255,42,74,0)');
          g.fillStyle = gr; g.fillRect(x, 0, 8, 16);
          g.fillStyle = '#ffffff'; g.fillRect(x + 3.4, 0, 1.2, 16);
        }
        g.fillStyle = 'rgba(255,42,74,0.9)'; g.fillRect(0, 6.6, 20, 1.6);
        g.fillStyle = '#ffd0d8'; g.fillRect(0, 7.2, 20, 0.6);
      }, FLAT);

    reg2('cable', 16, 10, function (g) {
        rrect(g, 0, 3.4, 16, 5.6, 2.4, lg(g, 0, 3, 0, 9, [[0, '#4a4a7a'], [0.5, '#1a1a3a'], [1, '#0a0a1e']]));
        rrect(g, 1.6, 4.6, 4, 3, 1, lg(g, 0, 4, 0, 8, [[0, '#fff3a0'], [1, '#e89400']]));
        rrect(g, 8.4, 4.6, 4, 3, 1, lg(g, 0, 4, 0, 8, [[0, '#ffb0ec'], [1, '#c02cc9']]));
        g.fillStyle = '#ffffff'; g.fillRect(5.4, 0, 1, 4); g.fillRect(11, 1, 1, 3);
        ell(g, 6, 1.6, 1.3, 1.3, '#7fe8ff'); ell(g, 11.5, 1.6, 1, 1, '#ff7ad9');
      }, { shade: 0.4 });

    reg2('portal', 40, 72, function (g) {
        const pts = [];
        for (let y = 0; y <= 72; y += 4) pts.push([20 + (6 + Math.sin((y / 72) * Math.PI) * 13), y]);
        for (let y = 72; y >= 0; y -= 4) pts.push([20 - (6 + Math.sin((y / 72) * Math.PI) * 13), y]);
        poly(g, pts, lg(g, 0, 0, 40, 0, [[0, 'rgba(39,224,255,0.25)'], [0.5, 'rgba(232,251,255,0.9)'], [1, 'rgba(39,224,255,0.25)']]));
        g.lineWidth = 0.8; g.strokeStyle = 'rgba(255,255,255,0.7)';
        for (let i = -2; i <= 2; i++) { g.beginPath(); for (let y = 0; y <= 72; y += 4) { const x = 20 + i * (3 + Math.sin((y / 72) * Math.PI) * 4); y === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
      }, FLAT);

    reg2('blast', 24, 14, function (g) {
        const tr = g.createLinearGradient(0, 0, 24, 0);
        tr.addColorStop(0, 'rgba(39,224,255,0)'); tr.addColorStop(0.7, 'rgba(39,224,255,0.65)'); tr.addColorStop(1, '#e8fbff');
        poly(g, [[0, 7], [10, 2.6], [20, 1.4], [23.6, 7], [20, 12.6], [10, 11.4]], tr);
        poly(g, [[8, 7], [14, 4.8], [21, 5], [21, 9], [14, 9.2]], '#e8fbff');
        ell(g, 20, 7, 3.4, 3.4, '#ffffff');
      }, { shade: 0, noOutline: true });

    reg2('blast_spread', 24, 14, function (g) {
        poly(g, [[1, 7], [15, 2], [23, 7], [15, 12]], lg(g, 0, 0, 24, 0, [[0, 'rgba(255,154,58,0)'], [0.6, '#ff9a3a'], [1, '#fff3b0']]));
        ell(g, 18, 7, 4, 3, '#fff3b0');
        line(g, 11, 7, 22, 7, 1, '#ffffff');
      }, { shade: 0, noOutline: true });

    reg2('blast_pierce', 38, 10, function (g) {
        rrect(g, 1, 2, 35, 6, 3, '#8150df');
        line(g, 0, 5, 37, 5, 3, '#c9a0ff');
        line(g, 6, 5, 37, 5, 1, '#ffffff');
        poly(g, [[31, 0], [38, 5], [31, 10], [34, 5]], '#f0d8ff');
      }, { shade: 0, noOutline: true });

    reg2('charge_fx', 32, 32, function (g) {
        const glow = g.createRadialGradient(16, 16, 1, 16, 16, 16);
        glow.addColorStop(0, '#ffffff'); glow.addColorStop(0.3, '#7fe8ff'); glow.addColorStop(1, 'rgba(39,224,255,0)');
        ell(g, 16, 16, 15, 15, glow);
        g.strokeStyle = '#d9ffff'; g.lineWidth = 1;
        g.beginPath(); g.arc(16, 16, 11, -0.5, 2.2); g.stroke();
        g.beginPath(); g.arc(16, 16, 14, 2.7, 5.2); g.stroke();
      }, { shade: 0, noOutline: true });

    reg2('boss_target', 68, 90, function (g) {
        g.strokeStyle = '#4dff7a'; g.lineWidth = 2;
        for (const [x, y, dx, dy] of [[2, 2, 1, 1], [66, 2, -1, 1], [2, 88, 1, -1], [66, 88, -1, -1]]) {
          g.beginPath(); g.moveTo(x, y + dy * 15); g.lineTo(x, y); g.lineTo(x + dx * 12, y); g.stroke();
        }
        poly(g, [[27, 0], [41, 0], [34, 8]], '#4dff7a');
      }, { shade: 0, noOutline: true });

    reg('spark', 4, 4, function (g) { R(g, '#ffffff', 0, 0, 4, 4); }, true);

    reg('spark_y', 4, 4, function (g) { R(g, '#ffd23f', 0, 0, 4, 4); }, true);

    reg('spark_c', 4, 4, function (g) { R(g, '#27e0ff', 0, 0, 4, 4); }, true);

    reg2('btn', 56, 56, function (g) {
        ell(g, 28, 28, 27, 27, 'rgba(10,7,32,0.55)');
        g.lineWidth = 2; g.strokeStyle = '#27e0ff'; g.beginPath(); g.arc(28, 28, 26, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 0.8; g.strokeStyle = 'rgba(232,251,255,0.7)'; g.beginPath(); g.arc(28, 28, 22.6, 0, Math.PI * 2); g.stroke();
      }, FLAT);

    reg2('btn_down', 56, 56, function (g) {
        ell(g, 28, 28, 27, 27, 'rgba(39,224,255,0.55)');
        g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(28, 28, 26, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 0.8; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(28, 28, 22.6, 0, Math.PI * 2); g.stroke();
      }, FLAT);

    Object.assign(C, { FLAT });
  };
})();
