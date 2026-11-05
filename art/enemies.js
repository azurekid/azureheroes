/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.enemies.3'] = function (C) {
    const { ell, hackerHood, hackerTerminal, lg, limb, line, poly, reg2, rrect, shade } = C;
    const txt = (...args) => C.txt(...args);

    Object.assign(C, { eyeGlow, robotFrame, hackerFrame, bugFrame, laptopFrame, registerCloudEnemies, droneFrame, spiderFrame, phishFrame, ramFrame, botnetFrame });
    const E = { p1: '#8a4cf0', p2: '#4a2399', p3: '#c39bff', pd: '#24104f', red: '#ff2a4a', steel: '#d4d6ec', steelD: '#7a7ea0' };

    function eyeGlow(g, x, y, r, col) {
        const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.6);
        gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.25, col); gr.addColorStop(1, 'rgba(255,42,74,0)');
        g.fillStyle = gr; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
      }

    function robotFrame(step) {
        return function (g) {
          const o = step ? 2.4 : 0;
          // legs
          limb(g, 12, 25, 10.4 + o, 31, 5.4, E.pd, E.p2, E.p1);
          poly(g, [[6.6 + o, 31], [14.6 + o, 31], [15.4 + o, 36.4], [5.4 + o, 36.4]], lg(g, 0, 31, 0, 37, [[0, E.p1], [1, E.pd]]));
          limb(g, 20, 25, 21.6 - o, 31, 5.4, E.pd, E.p2, E.p1);
          poly(g, [[16.6 - o, 31], [24.6 - o, 31], [25.4 - o, 36.4], [15.4 - o, 36.4]], lg(g, 0, 31, 0, 37, [[0, E.p1], [1, E.pd]]));
          // arms
          limb(g, 5.6, 14.4, 3.4, 22, 4.6, E.pd, E.p2, E.p1);
          ell(g, 3.2, 23.8, 3, 3, lg(g, 0, 21, 0, 27, [[0, E.steel], [1, E.steelD]]));
          limb(g, 26.4, 14.4, 28.6, 22, 4.6, E.pd, E.p2, E.p1);
          ell(g, 28.8, 23.8, 3, 3, lg(g, 0, 21, 0, 27, [[0, E.steel], [1, E.steelD]]));
          // torso
          rrect(g, 7, 12, 18, 15, 3.4, lg(g, 7, 12, 25, 27, [[0, E.p3], [0.35, E.p1], [1, E.pd]]));
          line(g, 9, 24, 23, 24, 0.9, 'rgba(20,6,60,0.7)');
          line(g, 9, 13.4, 23, 13.4, 0.9, 'rgba(232,215,255,0.75)');
          rrect(g, 10.4, 16, 11, 6, 2, '#1a0a30');
          eyeGlow(g, 16, 19, 1.5, E.red);
          ell(g, 16, 19, 1.8, 1.8, E.red); ell(g, 15.6, 18.6, 0.6, 0.6, '#ffffff');
          // rivets
          [[8.8, 14.4], [23.2, 14.4], [8.8, 25], [23.2, 25]].forEach((p) => ell(g, p[0], p[1], 0.6, 0.6, E.steel));
          // shoulder pads
          ell(g, 6, 13.6, 4, 3.4, lg(g, 2, 10, 10, 17, [[0, E.p3], [1, E.p2]]));
          ell(g, 26, 13.6, 4, 3.4, lg(g, 22, 10, 30, 17, [[0, E.p3], [1, E.p2]]));
          // head
          rrect(g, 9.4, 1.6, 13.2, 10.6, 3.4, lg(g, 9, 1, 23, 12, [[0, E.p3], [0.4, E.p1], [1, E.p2]]));
          rrect(g, 11, 4.6, 10, 4.6, 1.8, '#12062a');
          eyeGlow(g, 13.8, 6.9, 1.2, E.red); eyeGlow(g, 18.2, 6.9, 1.2, E.red);
          ell(g, 13.8, 6.9, 1.4, 1.4, E.red); ell(g, 18.2, 6.9, 1.4, 1.4, E.red);
          line(g, 12.6, 5.4, 15, 5.8, 0.6, '#ffb0c0'); line(g, 19.4, 5.4, 17, 5.8, 0.6, '#ffb0c0');
          line(g, 16, 1.8, 16, -0.2, 0.8, E.steel); ell(g, 16, 0.3, 1.2, 1.2, E.red);
          ell(g, 9.2, 7, 1.4, 2.4, E.steelD); ell(g, 22.8, 7, 1.4, 2.4, E.steelD);
        };
      }

    reg2('robot_0', 32, 37, robotFrame(0), { shade: 0.5 });

    reg2('robot_1', 32, 37, robotFrame(1), { shade: 0.5 });

    function hackerFrame(step) {
        return function (g) {
          const stride = step ? 2 : -1;
          limb(g, 13, 25, 11 + stride, 32, 5, '#190d20', '#3d2035', '#704052');
          limb(g, 21, 25, 22 - stride, 32, 5, '#190d20', '#3d2035', '#704052');
          rrect(g, 7 + stride, 32, 8, 4.5, 1.4, '#160d1b');
          rrect(g, 19 - stride, 32, 8, 4.5, 1.4, '#160d1b');
          line(g, 8 + stride, 34.8, 14 + stride, 34.8, 0.6, '#d36870');
          line(g, 20 - stride, 34.8, 26 - stride, 34.8, 0.6, '#d36870');
          limb(g, 11, 16, 7, 22, 4.5, '#240f1c', '#633047', '#b95a68');
          limb(g, 24, 16, 26, 23, 4.5, '#240f1c', '#633047', '#b95a68');
          rrect(g, 9, 12, 16, 16, 3.2, lg(g, 9, 12, 25, 28, [[0, '#c76b78'], [0.35, '#713449'], [1, '#28101e']]));
          line(g, 17, 15, 17, 26, 0.7, '#ec8a85');
          line(g, 11, 24, 15, 24, 0.7, '#321321');
          line(g, 19, 24, 23, 24, 0.7, '#321321');
          hackerHood(g);
          ell(g, 8.3, 21.3, 2.2, 2.1, '#dfa59c');
          hackerTerminal(g);
        };
      }

    reg2('hacker_0', 32, 37, hackerFrame(0), { shade: 0.5 });

    reg2('hacker_1', 32, 37, hackerFrame(1), { shade: 0.5 });

    reg2('climb_face', 10, 16, function (g) {
        rrect(g, 0, 0, 10, 16, 0, lg(g, 0, 0, 10, 0, [[0, '#2a2e48'], [0.5, '#5a6288'], [1, '#1c1f34']]));
        line(g, 2, 0, 2, 16, 0.8, '#8a92b8');
        rrect(g, 0.6, 5, 9.4, 3.4, 1.2, lg(g, 0, 5, 0, 8.4, [[0, '#ffe680'], [1, '#d89a10']]));
        line(g, 1.4, 5.6, 9, 5.6, 0.5, '#fff6c0');
        ell(g, 2.4, 13, 0.7, 0.7, '#9aa2c8'); ell(g, 7.6, 13, 0.7, 0.7, '#9aa2c8');
      });

    reg2('climb_sign', 18, 26, function (g) {
        line(g, 9, 14, 9, 26, 1.6, '#5a6080');
        rrect(g, 1, 1, 16, 14, 2.4, '#ffd23f');
        rrect(g, 2.4, 2.4, 13.2, 11.2, 1.6, '#1a1c2c');
        poly(g, [[9, 3.6], [13.6, 8.4], [10.6, 8.4], [10.6, 12.4], [7.4, 12.4], [7.4, 8.4], [4.4, 8.4]], '#ffd23f');
        line(g, 13, 5, 15, 3, 0.8, '#ffd23f');
      }, { shade: 0.3 });

    function bugFrame(f) {
        return function (g) {
          const a = f ? 1.6 : -1.6;
          // legs: three per side, alternating tripod gait
          [[11, 15, -1], [16, 16, 0], [20, 15, 1]].forEach((L, i) => {
            const s = (i % 2 ? a : -a);
            line(g, L[0], L[1], L[0] - 3 + L[2] * 2 + s, 19, 1.6, '#2a0d14');
            line(g, L[0] - 3 + L[2] * 2 + s, 19, L[0] - 5 + L[2] * 4 + s, 23.4, 1.3, '#2a0d14');
            line(g, L[0] + 1, L[1], L[0] + 3 + L[2] * 2 - s, 19.4, 1.4, '#4a1a24');
            line(g, L[0] + 3 + L[2] * 2 - s, 19.4, L[0] + 5 + L[2] * 3 - s, 23.4, 1.1, '#4a1a24');
          });
          // abdomen + wing cases
          ell(g, 12, 13.4, 10, 6.8, lg(g, 2, 6, 22, 20, [[0, '#ff8a5a'], [0.45, '#d8283a'], [1, '#5a0a1c']]));
          line(g, 12.6, 7, 13.4, 19.6, 0.8, '#3a0610');
          ell(g, 8.4, 10.4, 3.6, 1.6, 'rgba(255,230,200,0.55)', -0.3);
          // black spots like a ladybird gone wrong + a red-X crack
          [[7, 14], [10.6, 17], [16.4, 11.2], [17, 16.4], [8.2, 10.6]].forEach((p) => ell(g, p[0], p[1], 1.4, 1.2, '#1a0408'));
          line(g, 14.6, 12.4, 16.6, 14.4, 0.7, '#ffd0a0'); line(g, 16.6, 12.4, 14.6, 14.4, 0.7, '#ffd0a0');
          // thorax and head
          ell(g, 22.6, 12.6, 3.6, 4.4, lg(g, 19, 8, 26, 17, [[0, '#5a3048'], [1, '#1a0814']]));
          ell(g, 27, 12.8, 3.6, 3.4, lg(g, 24, 9, 30, 16, [[0, '#4a2840'], [1, '#140610']]));
          eyeGlow(g, 28.4, 11.4, 0.9, E.red);
          ell(g, 28.4, 11.4, 1.2, 1.2, E.red); ell(g, 28.2, 11, 0.4, 0.4, '#ffffff');
          // mandibles and twitching feelers
          line(g, 30, 14.2, 31.6, 15.4, 0.9, '#1a0408');
          line(g, 27.6, 9.8, 29.6 + f, 4.6, 0.7, '#2a0d14'); line(g, 29.6 + f, 4.6, 31.4, 2.6 + f, 0.7, '#2a0d14');
          line(g, 26.4, 9.8, 26 - f, 4, 0.7, '#2a0d14'); line(g, 26 - f, 4, 27.4 - f, 1.6, 0.7, '#2a0d14');
          ell(g, 31.4, 2.6 + f, 0.8, 0.8, '#ff9a5a'); ell(g, 27.4 - f, 1.6, 0.8, 0.8, '#ff9a5a');
        };
      }

    function laptopFrame(f) {
        return function (g) {
          // screen lid leaning back, screen glow
          poly(g, [[6, 21.6], [10, 2], [30, 2.4], [28.4, 21.6]], lg(g, 6, 2, 30, 22, [[0, '#cfd6ea'], [1, '#6a7290']]));
          poly(g, [[8.4, 19.6], [11.6, 4], [28.2, 4.4], [26.8, 19.6]], lg(g, 8, 4, 28, 20, [[0, f ? '#4a0a20' : '#2a0814'], [1, '#100410']]));
          // red public globe on screen
          const cx = 18.6, cy = 11.6;
          ell(g, cx, cy, 5.4, 5.4, f ? '#ff3a5a' : '#e0203f');
          g.strokeStyle = '#ffd0d8'; g.lineWidth = 0.7;
          g.beginPath(); g.ellipse(cx, cy, 2.2, 5.4, 0, 0, Math.PI * 2); g.stroke();
          line(g, cx - 5.4, cy, cx + 5.4, cy, 0.7, '#ffd0d8');
          line(g, cx - 4.6, cy - 2.6, cx + 4.6, cy - 2.6, 0.5, '#ffd0d8'); line(g, cx - 4.6, cy + 2.6, cx + 4.6, cy + 2.6, 0.5, '#ffd0d8');
          // open lock / warning pip in the screen corner and a webcam eye
          poly(g, [[23.6, 18.6], [25.6, 15], [27.4, 18.6]], '#ffd23f'); line(g, 25.5, 16.2, 25.5, 17.4, 0.6, '#3a1a00');
          eyeGlow(g, 20, 3.2, 0.6, E.red); ell(g, 20, 3.2, 0.7, 0.7, E.red);
          // keyboard base
          poly(g, [[2, 22], [30, 22], [31.4, 26.4], [0.6, 26.4]], lg(g, 0, 22, 0, 27, [[0, '#e4e8f4'], [1, '#7a80a0']]));
          for (let k = 0; k < 6; k++) rrect(g, 4.4 + k * 4.2, 22.8, 3.2, 1.4, 0.4, '#5a6080');
          rrect(g, 13, 24.6, 7, 1.2, 0.4, '#8a90b0');
          line(g, 0.6, 26.8, 31.4, 26.8, 0.8, '#3a3e58');
          // exposed port on the left edge: cable stub that recoils when firing
          rrect(g, 0, 10.4 - f * 0.6, 8 - f * 2, 3.4, 1, '#2a2e48');
          rrect(g, 0.4, 11 - f * 0.6, 2, 2.2, 0.5, f ? '#ffd23f' : '#ff507a');
          txt(g, '443', 11.6, 20.2, 0.32, '#ffb0c0');
        };
      }

    function registerCloudEnemies() {
        ['bug', 'image', 'rbac', 'endpoint', 'guest'].forEach(function (kind, ki) {
          const height = kind === 'rbac' ? 37 : kind === 'guest' || kind === 'bug' ? 24 : 28;
          for (let f = 0; f < 2; f++) reg2(kind + '_' + f, 32, height, function (g, w, h) {
            const col = ['#ff7a50', '#f0b040', '#c090ff', '#ff507a', '#70e0c0'][ki];
            if (kind === 'bug') { bugFrame(f)(g, w, h); return; }
            if (kind === 'endpoint') { laptopFrame(f)(g, w, h); return; }
            if (kind === 'rbac') {
              robotFrame(f)(g);
              rrect(g, 6, 15, 20, 13, 2, '#4a2080');
              txt(g, 'RBAC', 7, 18, 0.7, '#ffffff');
              poly(g, [[7, 2], [10, 6], [16, 0], [22, 6], [25, 2], [24, 9], [8, 9]], '#ffd23f');
            } else {
              for (let i = 0; i < 3; i++) {
                const x = 6 + i * 9, d = (f + i) % 2 ? 2 : 0;
                line(g, x, h - 9, x - 4, h - 2 - d, 2, col);
                line(g, x, h - 9, x + 3, h - 2 + d, 2, col);
              }
              rrect(g, 3, 5, 26, h - 8, 3, '#182844');
              g.strokeStyle = col; g.lineWidth = 1.5; g.strokeRect(4, 6, 24, h - 10);
              if (kind === 'image') {
                for (let x = 7; x < 27; x += 6) line(g, x, 8, x, 21, 1, col);
                txt(g, '!', 14, 11, 1, '#ff507a');
              } else if (kind === 'guest') {
                ell(g, 12, 11, 3, 3, col);
                rrect(g, 7, 15, 10, 4, 1, col);
                txt(g, '?', 21, 10, 1, '#ff507a');
              }
            }
          }, { shade: 0.4 });
        });
      }

    function droneFrame(f) {
        return function (g) {
          // rotor mast and blades
          line(g, 16, 7, 16, 3.4, 1.4, E.steelD);
          if (f) { poly(g, [[1, 3], [31, 2.6], [31, 3.8], [1, 4.2]], 'rgba(232,232,248,0.8)'); }
          else { poly(g, [[7, 2.2], [25, 3.8], [25, 4.6], [7, 3.2]], E.steel); poly(g, [[5, 4.4], [27, 2.2], [27, 3], [5, 5.2]], 'rgba(212,214,236,0.45)'); }
          ell(g, 16, 3.4, 1.8, 1.2, E.steel);
          // landing skids and legs
          limb(g, 8, 15, 5.4, 20.4, 2, E.steelD, E.steelD, null); limb(g, 24, 15, 26.6, 20.4, 2, E.steelD, E.steelD, null);
          rrect(g, 2.6, 20.4, 7.6, 2, 1, E.steel); rrect(g, 21.8, 20.4, 7.6, 2, 1, E.steel);
          // body
          rrect(g, 6, 6.6, 20, 10.4, 3.6, lg(g, 6, 6, 26, 17, [[0, '#f0f0ff'], [0.4, '#b5b8c9'], [1, '#5c6080']]));
          line(g, 8, 8, 24, 8, 0.8, 'rgba(255,255,255,0.85)');
          line(g, 8, 15.4, 24, 15.4, 0.9, 'rgba(40,40,70,0.6)');
          rrect(g, 8.4, 9.2, 15.2, 5, 2, '#14062a');
          eyeGlow(g, 12.6, 11.7, 1.2, E.red); eyeGlow(g, 19.4, 11.7, 1.2, E.red);
          ell(g, 12.6, 11.7, 1.5, 1.5, E.red); ell(g, 19.4, 11.7, 1.5, 1.5, E.red);
          ell(g, 12.2, 11.2, 0.5, 0.5, '#fff'); ell(g, 19, 11.2, 0.5, 0.5, '#fff');
          // sensor and thruster glow
          ell(g, 16, 16.8, 2.2, 1.2, '#ff7ad9');
          g.globalAlpha = 0.5; ell(g, 16, 18.6, 2, 2.2, '#ff7ad9'); g.globalAlpha = 1;
        };
      }

    reg2('drone_0', 32, 24, droneFrame(0), { shade: 0.5 });

    reg2('drone_1', 32, 24, droneFrame(1), { shade: 0.5 });

    function spiderFrame(f) {
        return function (g) {
          const legs = [[10, 9, 3, 13, 3.4], [13, 10, 6, 17, 4], [19, 10, 25.4, 13, 28.6], [22, 9, 26, 17, 31]];
          void legs;
          for (let i = 0; i < 4; i++) {
            const phase = (i + f) % 2 ? 1.8 : 0;
            const bx = 10 + i * 3.4, fx = 4 + i * 7.6 + (i > 1 ? 1 : 0);
            // left-side legs (behind) and right-side legs
            limb(g, bx, 11, fx - 1, 7.4 - phase * 0.4, 2, '#4a0f5a', '#5a1470', null);
            limb(g, fx - 1, 7.4 - phase * 0.4, fx - 2.6, 18.6 - phase, 1.8, '#4a0f5a', '#5a1470', null);
            limb(g, bx + 1.6, 11.4, fx + 2, 8 + phase * 0.3, 2, '#7a1a8a', '#a722b5', '#ff7ad9');
            limb(g, fx + 2, 8 + phase * 0.3, fx + 0.6, 19 - phase * 0.6, 1.8, '#7a1a8a', '#a722b5', '#ff7ad9');
          }
          // abdomen + carapace
          ell(g, 13, 9.4, 7.6, 5.8, lg(g, 6, 3, 20, 15, [[0, '#ff7ad9'], [0.4, '#c02cc9'], [1, '#4a0f5a']]));
          ell(g, 13, 8.2, 3, 1.8, 'rgba(255,255,255,0.35)');
          poly(g, [[10, 8], [13, 6], [16, 8], [13, 12]], '#ffd23f');
          ell(g, 13, 9, 1.4, 1.4, '#ff2a4a');
          // head
          ell(g, 22.6, 10, 5, 4.4, lg(g, 18, 5, 27, 15, [[0, '#e070ee'], [1, '#6a1a7a']]));
          rrect(g, 21, 7.6, 7, 3.4, 1.4, '#14062a');
          eyeGlow(g, 23.4, 9.2, 0.9, E.red); eyeGlow(g, 26, 9.2, 0.9, E.red);
          ell(g, 23.4, 9.2, 1.1, 1.1, E.red); ell(g, 26, 9.2, 1.1, 1.1, E.red);
          poly(g, [[27, 11.6], [29.6, 13.4], [28, 11]], '#f0f0ff'); poly(g, [[25, 12.4], [26.6, 14.6], [26, 12]], '#f0f0ff');
        };
      }

    reg2('spider_0', 32, 20, spiderFrame(0), { shade: 0.4 });

    reg2('spider_1', 32, 20, spiderFrame(1), { shade: 0.4 });

    function phishFrame(f) {
        return function (g) {
          const t = f ? 2.4 : -2.4;
          poly(g, [[4, 12], [-0.4 + 0.4, 6 + t], [1, 12], [-0.4 + 0.4, 18 + t]], lg(g, 0, 6, 4, 18, [[0, '#ff7ad9'], [1, '#7a1a8a']]));
          ell(g, 16, 13, 12.4, 8, lg(g, 4, 5, 28, 21, [[0, '#7df9ff'], [0.45, '#2a8ad8'], [1, '#1a2a70']]));
          ell(g, 16, 16.6, 9, 3.6, 'rgba(240,250,255,0.35)');
          for (let i = 0; i < 4; i++) line(g, 9 + i * 3.6, 9 + (i % 2), 9 + i * 3.6, 17 - (i % 2), 0.6, 'rgba(10,30,80,0.45)');
          // envelope dorsal fin
          rrect(g, 10, 1.4, 11, 7.4, 1, '#f4f0ff');
          poly(g, [[10.4, 1.8], [15.5, 5.6], [20.6, 1.8]], 'rgba(80,60,140,0.0)');
          line(g, 10.4, 1.8, 15.5, 5.6, 0.8, '#ff2a4a'); line(g, 20.6, 1.8, 15.5, 5.6, 0.8, '#ff2a4a');
          ell(g, 20.6, 1.6, 1.6, 1.6, '#ff2a4a');
          // lure hook from the head
          line(g, 25, 7, 28, 1.8, 0.7, '#e8e8f8'); line(g, 28, 1.8, 30.4, 3.4, 0.6, '#e8e8f8');
          eyeGlow(g, 30.4, 4.6, 1.4, '#ffd23f'); ell(g, 30.4, 4.6, 1.3, 1.3, '#ffd23f');
          // eye and grin
          ell(g, 23, 10.6, 2.8, 2.8, '#14062a'); eyeGlow(g, 23, 10.6, 1.4, E.red);
          ell(g, 23, 10.6, 1.5, 1.5, E.red); ell(g, 22.5, 10, 0.5, 0.5, '#fff');
          poly(g, [[22, 16], [28.4, 14.4], [26.6, 17.6]], '#14062a');
          for (let i = 0; i < 3; i++) poly(g, [[23 + i * 1.8, 15.6 - i * 0.3], [24 + i * 1.8, 17 - i * 0.3], [24.8 + i * 1.8, 15.2 - i * 0.3]], '#fff');
          poly(g, [[13, 20], [17, 23.4 - (f ? 1 : 0)], [19, 19.6]], '#7a1a8a');
        };
      }

    reg2('phish_0', 32, 24, phishFrame(0), { shade: 0.45 });

    reg2('phish_1', 32, 24, phishFrame(1), { shade: 0.45 });

    function ramFrame(f) {
        return function (g) {
          const a = f ? 2 : -2;
          [[7, a], [11, -a], [20, -a], [24, a]].forEach((l, i) => {
            limb(g, l[0], 18, l[0] + l[1] * 0.6, 26.4, 3.2, i % 2 ? '#3a1050' : '#5a1470', '#7a1a8a', null);
            rrect(g, l[0] + l[1] * 0.6 - 2, 26, 4, 2, 0.8, '#14062a');
          });
          rrect(g, 3, 9, 25, 12, 5, lg(g, 3, 9, 28, 21, [[0, '#ffb04a'], [0.4, '#e0503a'], [1, '#5a1430']]));
          for (let i = 0; i < 5; i++) ell(g, 6 + i * 4.6, 10.4, 2.6, 2.2, 'rgba(255,240,220,0.5)');
          // padlock badge
          rrect(g, 11, 12.6, 8, 6.4, 1.2, '#ffd23f');
          g.lineWidth = 1.1; g.strokeStyle = '#ffd23f'; g.beginPath(); g.arc(15, 12.6, 2.6, Math.PI, 0); g.stroke();
          ell(g, 15, 15.4, 1, 1, '#14062a'); rrect(g, 14.6, 15.6, 0.8, 2, 0.3, '#14062a');
          // head + horns
          rrect(g, 24, 6.6, 8, 9.6, 3, lg(g, 24, 6, 32, 16, [[0, '#d0c8e8'], [1, '#5c6080']]));
          g.lineWidth = 2.4; g.strokeStyle = '#f0d890'; g.beginPath(); g.arc(25.6, 7.4, 4, Math.PI * 0.9, Math.PI * 2.3); g.stroke();
          g.lineWidth = 0.8; g.strokeStyle = '#8a6a30'; g.beginPath(); g.arc(25.6, 7.4, 2.6, Math.PI, Math.PI * 2.1); g.stroke();
          eyeGlow(g, 29.6, 10, 1.2, E.red); ell(g, 29.6, 10, 1.3, 1.3, E.red);
          ell(g, 31, 14.4, 1, 0.8, '#14062a');
          line(g, 3.4, 12, 0.6, 9 + (f ? 1 : -1), 1.2, '#e0503a');
        };
      }

    reg2('ram_0', 32, 28, ramFrame(0), { shade: 0.5 });

    reg2('ram_1', 32, 28, ramFrame(1), { shade: 0.5 });

    function botnetFrame(f) {
        return function (g) {
          const c = lg(g, 0, 2, 0, 18, [[0, '#8a7ab0'], [0.5, '#4a3a78'], [1, '#22164a']]);
          [[9, 11, 7, 6], [16, 8, 8, 7], [24, 11, 7, 6], [13, 14, 9, 4.6], [20, 14, 9, 4.6]].forEach((e) => ell(g, e[0], e[1], e[2], e[3], c));
          ell(g, 14, 5, 4, 1.6, 'rgba(255,255,255,0.25)');
          // bot faces blinking inside the cloud
          [[10, 11], [16, 9], [22, 11]].forEach((p, i) => {
            rrect(g, p[0] - 2.4, p[1] - 1.6, 4.8, 3.2, 1, '#14062a');
            const on = (i + f) % 2 === 0;
            ell(g, p[0] - 1, p[1], 0.7, 0.7, on ? E.red : '#7df9ff'); ell(g, p[0] + 1, p[1], 0.7, 0.7, on ? E.red : '#7df9ff');
          });
          // lightning + bomb bay
          poly(g, [[7, 17], [5, 21], [7, 21], [5.6, 24], [9.4, 19.4], [7.4, 19.4], [8.6, 17]], f ? '#ffd23f' : 'rgba(255,210,63,0.35)');
          rrect(g, 13, 17, 6, 3.4, 1, '#14062a'); ell(g, 16, 19.4, 1.6, 1, '#ff7ad9');
          poly(g, [[25, 17], [27, 21], [25.4, 21], [26.8, 24], [23, 19.4], [24.8, 19.4], [23.6, 17]], f ? 'rgba(255,210,63,0.35)' : '#ffd23f');
        };
      }

    reg2('botnet_0', 32, 24, botnetFrame(0), { shade: 0.4 });

    reg2('botnet_1', 32, 24, botnetFrame(1), { shade: 0.4 });

    Object.assign(C, { E });
  };
})();
