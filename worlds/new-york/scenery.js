/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['new-york'] = AH.Worlds['new-york'] || {};
  const content = world.art = world.art || { parts: {} };
  content.registryOrder = { sceneryStars: 1, panoramaLandmarks: 9, sceneryRoutes: 3 };
  AH.ArtModules.regions['eastus2'] = content;

  AH.ArtModules.stages['worlds.new-york.scenery.19'] = function (C) {
    const { ell, glowRect, lg, line, lit, poly } = C;

    Object.assign(C, { nyLiberty, nyEmpire, nyChrysler, nyBridge, nyFireEscape });
    function nyFireEscape(g, x, top, base, width, floor) {
        for (let y = top; y + floor < base; y += floor) {
          g.fillStyle = '#242b3b'; g.fillRect(x, y, width, 2.5);
          line(g, x, y - 6, x + width, y - 6, 1, '#b39b89');
          for (let rail = x; rail <= x + width; rail += 4) line(g, rail, y - 6, rail, y, 0.8, '#323644');
          const left = x + 2, right = x + width - 2;
          line(g, right, y + 3, left, y + floor, 2, '#202938');
          line(g, right, y - 2, left, y + floor - 5, 0.8, '#b39b89');
          for (let rung = 0; rung <= 6; rung++) {
            const t = rung / 6, rx = right + (left - right) * t, ry = y + 3 + (floor - 3) * t;
            line(g, rx - 2, ry, rx + 2, ry, 0.9, '#98908a');
          }
        }
      }
    function nyLiberty(g, x, base, s, P) {
        g.save(); g.translate(x, base); g.scale(s, s);
        g.fillStyle = '#294f67'; g.fillRect(-15, -12, 30, 12); g.fillRect(-12, -20, 24, 8);
        line(g, -17, -12, 17, -12, 1, '#91c9c1'); line(g, -13, -20, 13, -20, 1, '#91c9c1');
        poly(g, [[-7, -21], [-8, -39], [-5, -46], [4, -46], [8, -39], [7, -21]], lg(g, -8, -48, 8, -20, [[0, '#b8c2a0'], [0.5, '#668f87'], [1, '#315a68']]));
        poly(g, [[-7, -38], [-13, -33], [-12, -29], [-5, -33], [-1, -24], [5, -22], [8, -24], [4, -34], [2, -40]], '#638e87');
        ell(g, 0, -49, 4.3, 5, '#83a99b');
        poly(g, [[-6, -52], [-4, -59], [-1, -54], [1, -61], [3, -54], [7, -58], [6, -51]], '#83a99b');
        for (let i = 0; i < 7; i++) line(g, -6 + i * 2, -54, -6 + i * 2, -58 - (i % 2) * 2, 0.8, '#d2d3b0');
        line(g, 6, -39, 12, -49, 2, '#73988d'); line(g, 12, -49, 11, -62, 1.8, '#b6c4a4');
        ell(g, 11, -64, 3.2, 2.4, '#ffd36f'); glowRect(g, '#ffd36f', 8, -67, 6, 6);
        line(g, -3, -46, -2, -34, 0.7, 'rgba(230,239,209,0.75)'); line(g, 3, -46, 2, -34, 0.7, 'rgba(230,239,209,0.65)');
        line(g, -4, -29, 4, -29, 0.6, '#2e5261'); line(g, -4, -26, 4, -26, 0.6, '#2e5261');
        g.restore();
      }

    function nyEmpire(g, x, base, s, P) {
        g.save(); g.translate(x, base); g.scale(s, s);
        const fill = lg(g, -27, -132, 28, 0, [[0, '#8391aa'], [0.42, '#526681'], [1, '#293b5c']]);
        g.fillStyle = fill; g.fillRect(-25, -102, 50, 102); g.fillRect(-21, -115, 42, 13); g.fillRect(-16, -123, 32, 8); g.fillRect(-10, -129, 20, 6);
        g.fillRect(-6, -140, 12, 11); g.fillRect(-3, -151, 6, 11);
        poly(g, [[-3, -151], [0, -166], [3, -151]], '#9db0c5'); line(g, 0, -166, 0, -177, 1, '#ffd895');
        for (let y = -96; y < -10; y += 11) {
          line(g, -22, y, 22, y, 0.7, 'rgba(186,211,224,0.42)');
          for (let wx = -18; wx < 20; wx += 8) lit(g, wx, y + 2, 3, 5, P.win[(Math.abs(wx + y) / 8 | 0) % 3]);
        }
        for (let y = -113; y < -101; y += 5) { lit(g, -15, y, 3, 3, P.win[0]); lit(g, 12, y, 3, 3, P.win[1]); }
        g.fillStyle = '#253552'; g.fillRect(-29, -7, 58, 7);
        g.restore();
      }

    function nyChrysler(g, x, base, s, P) {
        g.save(); g.translate(x, base); g.scale(s, s);
        const body = lg(g, -27, -113, 24, 0, [[0, '#a2abb4'], [0.45, '#687a8b'], [1, '#35475e']]);
        g.fillStyle = body; g.fillRect(-19, -86, 38, 86); g.fillRect(-16, -96, 32, 10); g.fillRect(-13, -104, 26, 8); g.fillRect(-10, -110, 20, 6);
        g.fillStyle = '#b7c1bd'; g.beginPath(); g.moveTo(-12, -110); g.quadraticCurveTo(-9, -122, 0, -128); g.quadraticCurveTo(9, -122, 12, -110); g.closePath(); g.fill();
        for (let k = 0; k < 5; k++) {
          const y = -110 - k * 3.5, r = 13 - k * 1.9;
          g.beginPath(); g.arc(0, y, r, Math.PI, 0); g.strokeStyle = k % 2 ? '#d2d5cb' : '#87999f'; g.lineWidth = 1.5; g.stroke();
          for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 4) line(g, 0, y, Math.cos(a) * r, y + Math.sin(a) * r, 0.6, '#d1d1c5');
        }
        poly(g, [[-3, -128], [0, -153], [3, -128]], '#c7c7b9'); line(g, 0, -153, 0, -165, 1, '#ffd58e');
        for (let y = -81; y < -7; y += 12) { for (let wx = -14; wx < 15; wx += 9) lit(g, wx, y, 4, 6, P.win[(Math.abs(y + wx) / 3 | 0) % 3]); }
        line(g, -18, -86, 18, -86, 0.8, '#d4ccb0'); line(g, -15, -96, 15, -96, 0.8, '#d4ccb0');
        g.fillStyle = '#263950'; g.fillRect(-23, -5, 46, 5);
        g.restore();
      }

    function nyBridge(g, x, base, s, P) {
        g.save(); g.translate(x, base); g.scale(s, s);
        const deck = -25, towers = [39, 218];
        g.fillStyle = '#495a74'; g.fillRect(0, deck, 278, 4); line(g, 0, deck, 278, deck, 1, '#c2b9a2');
        towers.forEach(function (tx) {
          g.fillStyle = '#77829a'; g.fillRect(tx - 6, -94, 12, 69); g.fillRect(tx - 11, -96, 22, 3); g.fillRect(tx - 10, -63, 20, 3);
          g.fillStyle = '#1d3454'; g.fillRect(tx - 2, -92, 1.4, 66); g.fillRect(tx + 1, -92, 1.4, 66);
          poly(g, [[tx - 8, -94], [tx, -105], [tx + 8, -94]], '#9ca7a9');
          line(g, tx, -105, tx, -97, 0.8, '#d0c6a9');
        });
        g.strokeStyle = '#a4b2b7'; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(0, -56); g.quadraticCurveTo(39, -105, 88, -61); g.quadraticCurveTo(138, -27, 168, -60); g.quadraticCurveTo(218, -105, 278, -56); g.stroke();
        g.lineWidth = 0.6;
        for (let xw = 8; xw < 278; xw += 8) { const arch = xw < 39 ? -56 - xw * 1.1 : xw < 218 ? -61 + Math.sin((xw - 39) / 179 * Math.PI) * 42 : -56 - (278 - xw) * 1.1; line(g, xw, deck, xw, arch, 0.55, '#9ca8ae'); }
        for (let xw = 10; xw < 276; xw += 24) lit(g, xw, deck - 8, 2, 2.5, P.win[0]);
        g.restore();
      }
  };

  AH.ArtModules.stages['worlds.new-york.scenery.26'] = function (C) {
    const { FLAT, PAL, ell, line, lit, nyFireEscape, reg2, skyline } = C;

    reg2('bg_near_eastus2', 640, 190, function (g, w, h) {
        const P = PAL.eastus2;
        skyline(w, h, 211, '#172344', P.accent, 36, 105, 0.3, P.win)(g);
        for (let tile = 0; tile < w; tile += 160) {
          if (tile === 320) {
            g.fillStyle = '#284e49'; g.fillRect(tile, h - 26, 160, 26);
            ell(g, tile + 80, h - 13, 61, 10, '#456b73');
            for (let x = tile + 9; x < tile + 160; x += 23) {
              g.fillStyle = '#34394a'; g.fillRect(x, h - 51, 3, 32);
              ell(g, x + 1, h - 52, 13, 22, '#355e51');
            }
            line(g, tile + 48, h - 15, tile + 110, h - 15, 2, '#aca28d');
            continue;
          }
          for (let house = 0; house < 4; house++) {
            const x = tile + house * 40, top = h - 72 - (house % 2) * 13;
            g.fillStyle = ['#634755', '#785354', '#594354', '#70505b'][house];
            g.fillRect(x, top, 38, h - top);
            g.fillStyle = '#b28a79'; g.fillRect(x, top, 38, 3); g.fillRect(x + 2, top - 4, 34, 4);
            for (let y = top + 10; y < h - 16; y += 16) for (let wx = x + 6; wx < x + 34; wx += 13) {
              g.fillStyle = '#202d43'; g.fillRect(wx, y, 7, 10);
              lit(g, wx + 1, y + 1, 5, 7, P.win[house % 3]);
              line(g, wx - 1, y + 10, wx + 8, y + 10, 0.8, '#af8975');
            }
            nyFireEscape(g, x + 16, top + 25, h - 8, 17, 16);
          }
          g.fillStyle = '#d7bd93'; g.fillRect(tile + 6, h - 5, 148, 1);
        }
      }, FLAT);
  };

  AH.ArtModules.stages['worlds.new-york.scenery.82'] = function (C) {
    const { MP, SC, ell, lamp, lg, line, lit, msLogo, nyBridge, nyChrysler, nyEmpire, nyFireEscape, nyLiberty, poly, rrect, silFill, tree, txt } = C;

    // New York depth: sooty stone returns, warm cornice caps and granite kerbs/decks.
    const nyReturn = (g, x, top, width, base, depth, roof) => C.depthFace(g, x, top, width, base, depth, 'rgba(14,20,44,0.48)', roof === false ? 'rgba(0,0,0,0)' : 'rgba(255,214,160,0.36)');
    const nyKerb = (g, x, base, width, depth) => C.depthGround(g, x, base, width, depth, '#1d2338', 'rgba(200,190,170,0.45)');

    MP.eastus2 = { top: '#243c69', bot: '#6b476f', accent: '#ffb36b', win: ['#ffe9a0', '#98d9ff', '#ff9e86'] };

    Object.assign(SC, {
        eastus2: {
          sc_ny_liberty: [150, 178, function (g, w, h, P) { nyKerb(g, 35, h, 80, 4); nyLiberty(g, 75, h - 4, 1.7, P); nyReturn(g, 49.5, h - 24.4, 51, h - 4, 6); nyReturn(g, 54.6, h - 38, 40.8, h - 24.4, 4); }],
          sc_ny_empire: [100, 194, function (g, w, h, P) { nyKerb(g, 14, h, 72, 4); nyEmpire(g, 50, h - 4, 1.18, P); nyReturn(g, 20.5, h - 124.4, 59, h - 12.3, 8); nyReturn(g, 25.2, h - 139.7, 49.6, h - 124.4, 4); nyReturn(g, 31.1, h - 149.2, 37.8, h - 139.7, 3); }],
          sc_ny_chrysler: [80, 188, function (g, w, h, P) { nyKerb(g, 10, h, 60, 4); nyChrysler(g, 40, h - 4, 1.1, P); nyReturn(g, 19.1, h - 98.6, 41.8, h - 9.5, 6); nyReturn(g, 22.4, h - 109.6, 35.2, h - 98.6, 3); }],
          sc_ny_brooklynbridge: [300, 126, function (g, w, h, P) { nyBridge(g, 8, h - 4, 1.02, P); [39, 218].forEach((tx) => nyReturn(g, 8 + (tx - 6) * 1.02, h - 99.9, 12.24, h - 29.5, 4, false)); }],
          sc_ny_times: [300, 330, function (g, w, h, P) {
            g.save();
            g.translate(0, h - 235);
            const base = 232;
            // A painted street canyon: all perspective remains behind the playable plane.
            g.fillStyle = '#34384b'; g.fillRect(0, 145, w, base - 145);
            poly(g, [[100, 145], [204, 145], [297, base], [3, base]], lg(g, 150, 145, 150, base, [[0, '#4b5571'], [1, '#1b263b']]));
            poly(g, [[105, 155], [149, 151], [115, base], [18, base]], '#555267');
            poly(g, [[160, 151], [197, 155], [284, base], [203, base]], '#4c4a60');
            for (const x of [30, 78, 118, 190, 235, 280]) line(g, 153, 151, x, base, 0.6, '#8a7e8d');
            for (let y = 172; y < base; y += 13) line(g, 10, y, 290, y, 0.5, 'rgba(191,169,177,0.22)');
            poly(g, [[143, 166], [149, 166], [140, 191], [130, 191]], '#ddcfa9');
            poly(g, [[133, 201], [141, 201], [134, 220], [123, 220]], '#ddcfa9');
            // Distant frontage is quieter than the illuminated, close building faces.
            for (let i = 0; i < 5; i++) {
              const x = 81 + i * 27, top = -20 - (i % 3) * 18;
              g.fillStyle = i % 2 ? '#4b4c6a' : '#414663'; g.fillRect(x, top, 24, 192 - top);
              for (let y = top + 8; y < 183; y += 10) {
                for (let wx = x + 4; wx < x + 21; wx += 7) {
                  g.fillStyle = '#8f97af'; g.fillRect(wx, y, 2, 4);
                }
              }
            }
            const facade = function (x, y, width, height, side, wall) {
              const inset = side < 0 ? 20 : -20;
              poly(g, [[x, y], [x + width, y], [x + width + inset, y + 12], [x + inset, y + 12]], '#a8979d');
              poly(g, [[side < 0 ? x + width : x, y], [side < 0 ? x + width + inset : x + inset, y + 12],
                [side < 0 ? x + width + inset : x + inset, y + height - 14], [side < 0 ? x + width : x, y + height]], '#252c47');
              g.fillStyle = lg(g, x, y, x + width, y + height, [[0, wall], [1, '#32334e']]);
              g.fillRect(x, y, width, height);
              line(g, x, y, x + width, y, 2, '#c6b1a3');
              for (let wy = y + 9; wy < y + height - 9; wy += 11) {
                line(g, x, wy + 7, x + width, wy + 7, 0.6, '#252a43');
                for (let wx = x + 5; wx < x + width - 4; wx += 9) {
                  g.fillStyle = (wx + wy | 0) % 3 ? '#8f8ba0' : P.win[0];
                  g.fillRect(wx, wy, 3, 5);
                }
              }
            };
            facade(0, -62, 62, base + 62, -1, '#8f6c77');
            facade(246, -84, 54, base + 84, 1, '#657389');
            facade(119, -51, 43, base + 51, -1, '#91808c');
            g.fillStyle = '#d6c5a6'; g.fillRect(128, -58, 26, 7);
            line(g, 141, -58, 141, -72, 1.2, '#e5d7ba');
            ell(g, 141, -72, 3, 3, '#fff0be');
            line(g, 141, -76, 141, -68, 0.6, '#98d9ff');
            [[0, 62], [119, 43], [246, 54]].forEach(([x, width]) => {
              g.fillStyle = '#1c2438'; g.fillRect(x, 205, width, base - 205);
              line(g, x, 205, x + width, 205, 2, '#aaa0a0');
              for (let door = x + 5; door < x + width - 6; door += 12) {
                g.fillStyle = '#648090'; g.fillRect(door, 211, 7, 17);
                line(g, door + 3, 212, door + 3, 227, 0.7, '#c2c4b8');
              }
              line(g, x, base - 1, x + width, base - 1, 2, '#101a2d');
            });
            const screen = function (x, y, width, height, skew, top, bottom, title, scale) {
              g.save(); g.translate(x, y); g.transform(1, skew, 0, 1, 0, 0);
              g.fillStyle = '#121c32'; g.fillRect(-2, -2, width + 4, height + 5);
              g.fillStyle = lg(g, 0, 0, width, height, [[0, top], [1, bottom]]); g.fillRect(0, 0, width, height);
              line(g, 0, 0, width, 0, 1, '#f1ecdf'); line(g, width, 0, width, height, 1, '#77d7e8');
              for (let sy = 3; sy < height; sy += 4) line(g, 1, sy, width - 1, sy, 0.35, 'rgba(255,255,255,0.13)');
              txt(g, title, 4, 6, scale, '#f4fbff');
              g.restore();
            };
            screen(4, 64, 56, 46, 0, '#c34975', '#58244e', 'BROADWAY', 0.93);
            screen(5, 123, 52, 48, 0, '#c08036', '#693e54', 'NEW YORK', 0.87);
            screen(64, 83, 18, 45, 0.44, '#137dac', '#183a70', 'NY', 0.8);
            screen(121, 41, 39, 42, 0, '#178ab9', '#21336b', 'AZURE', 1);
            msLogo(g, 131, 61, 13);
            screen(121, 90, 39, 31, 0, '#b74273', '#542b59', 'TIMES', 1);
            txt(g, 'SQUARE', 123, 107, 0.9, '#ffe4ba');
            screen(249, 47, 48, 68, 0, '#246e92', '#172e5c', 'COPILOT', 0.87);
            poly(g, [[257, 78], [275, 68], [290, 83], [274, 103]], '#6bd6d6');
            poly(g, [[257, 78], [272, 83], [274, 103], [262, 94]], '#9a82ea');
            screen(249, 128, 48, 35, 0, '#986d3a', '#623d53', 'LIVE NYC', 0.85);
            screen(225, 89, 19, 53, -0.5, '#be497d', '#452b62', '365', 0.75);
            // Receding red steps, street furniture and reflected sign light anchor the plaza.
            for (let i = 0; i < 6; i++) {
              const y = 164 + i * 3, half = 13 + i * 2;
              poly(g, [[184 - half, y], [184 + half, y], [187 + half, y + 2], [181 - half, y + 2]], i % 2 ? '#c76073' : '#963d5c');
            }
            poly(g, [[30, 175], [49, 175], [106, 220], [55, 215]], 'rgba(239,111,163,0.15)');
            poly(g, [[251, 170], [269, 170], [239, 218], [201, 218]], 'rgba(87,201,232,0.16)');
            [90, 212].forEach((x) => lamp(g, x, 190, 29, '#ffdc9b'));
            for (const x of [101, 114, 204, 217]) {
              line(g, x, 199, x, 207, 1.6, '#28354b');
              ell(g, x, 199, 1.6, 1.1, '#e5c4a6');
            }
            line(g, 4, base, 296, base, 1, '#c9b0a0');
            g.restore();
          }],
          sc_ny_brownstones: [250, 188, function (g, w, h, P) {
            const base = h - 3;
            for (let i = 0; i < 3; i++) {
              const x = i * 82, width = i === 1 ? 84 : 78, tall = [122, 145, 128][i], top = base - tall;
              const brick = ['#794c54', '#995c55', '#69455a'][i];
              g.fillStyle = silFill(g, top, base, brick, '#322c4b'); g.fillRect(x, top, width, tall);
              g.fillStyle = '#c99b77'; g.fillRect(x - 2, top, width + 4, 4); g.fillRect(x + 3, top + 23, width - 6, 2);
              poly(g, [[x + width - 9, top + 4], [x + width, top + 9], [x + width, base], [x + width - 9, base]], '#44314b');
              g.fillStyle = '#453345'; g.fillRect(x + 3, top - 5, width - 6, 5);
              for (let corbel = x + 4; corbel < x + width - 3; corbel += 7) {
                g.fillStyle = '#d0a382'; g.fillRect(corbel, top + 4, 3, 4);
              }
              for (let y = top + 8; y < base - 3; y += 6) {
                line(g, x + 2, y, x + width - 10, y, 0.4, 'rgba(218,160,125,0.26)');
              }
              for (let y = top + 11; y < base - 32; y += 22) {
                for (let wx = x + 9; wx < x + width - 7; wx += 24) {
                  g.fillStyle = '#302b43'; g.fillRect(wx, y, 13, 14); g.fillStyle = '#a8c9cb'; g.fillRect(wx + 1, y + 1, 11, 10);
                  g.fillStyle = '#302b43'; g.fillRect(wx + 6, y, 1, 12); g.fillRect(wx, y + 5, 13, 1);
                  g.fillStyle = '#d2ad85'; g.fillRect(wx - 1, y + 12, 15, 2);
                }
              }
              g.fillStyle = '#342640'; g.fillRect(x + width / 2 - 9, base - 31, 18, 31);
              g.fillStyle = '#b98161'; g.fillRect(x + width / 2 - 12, base - 32, 24, 3);
              for (let step = 0; step < 4; step++) { g.fillStyle = step % 2 ? '#a9795f' : '#c08b68'; g.fillRect(x + width / 2 - 16 + step * 2, base - 6 + step * 1.4, 32 - step * 4, 2); }
              nyFireEscape(g, x + width - 33, top + 27, base - 20, 26, 22);
              line(g, x + width / 2 - 18, base - 16, x + width / 2 - 12, base - 3, 1.2, '#272b38');
              line(g, x + width / 2 + 18, base - 16, x + width / 2 + 12, base - 3, 1.2, '#272b38');
            }
            g.fillStyle = '#24283f'; g.fillRect(0, base - 2, w, 2);
            [27, 119, 207].forEach((x) => lamp(g, x, base - 1, 33, '#ffd17c'));
            txt(g, 'BROWNSTONES', 81, base - 10, 0.78, '#ffe8bd');
          }],
          sc_ny_subway: [200, 168, function (g, w, h, P) {
            const base = h - 3;
            g.fillStyle = '#5e5c70'; g.fillRect(2, base - 87, 196, 5);
            g.fillStyle = '#bcb29f'; g.fillRect(5, base - 82, 190, 5);
            for (let i = 0; i < 7; i++) {
              const y = base - 75 + i * 10, left = 43 + i * 7, right = 157 - i * 7;
              g.fillStyle = i % 2 ? '#a79484' : '#857c7e'; g.fillRect(left, y, right - left, 9);
              g.fillStyle = 'rgba(255,220,172,0.2)'; g.fillRect(left + 3, y + 1, right - left - 6, 1);
            }
            g.fillStyle = '#384355'; g.fillRect(39, base - 78, 4, 72); g.fillRect(157, base - 78, 4, 72);
            line(g, 41, base - 78, 18, base - 105, 2.2, '#c6bda8'); line(g, 159, base - 78, 182, base - 105, 2.2, '#c6bda8');
            line(g, 18, base - 105, 182, base - 105, 2.2, '#c6bda8');
            g.fillStyle = '#162944'; g.fillRect(45, base - 151, 110, 38);
            g.fillStyle = '#f1ede0'; g.fillRect(49, base - 147, 102, 30);
            ell(g, 72, base - 132, 13, 13, '#d73d50'); ell(g, 72, base - 132, 9.5, 9.5, '#f5f0df');
            txt(g, 'M', 68.5, base - 137, 1.35, '#245e9b');
            txt(g, 'SUBWAY', 91, base - 138, 1.15, '#1b426c');
            txt(g, '42 ST', 104, base - 124, 0.75, '#bf3344');
            for (let x = 5; x < 196; x += 16) { g.fillStyle = '#252b42'; g.fillRect(x, base - 7, 12, 7); }
            g.fillStyle = '#d5c8ae'; g.fillRect(0, base - 3, w, 3);
            nyReturn(g, 2, base - 87, 196, base - 77, 3); nyReturn(g, 157, base - 78, 4, base - 6, 2, false); nyKerb(g, 0, h, w, 3);
          }],
          sc_ny_centralpark: [250, 164, function (g, w, h, P) {
            const base = h - 3;
            [[74, 25, 16], [98, 9, 18], [124, 32, 13], [147, 18, 19], [172, 37, 15]].forEach(([x, top, width]) => {
              g.fillStyle = '#3e5365'; g.fillRect(x, top, width, base - 35 - top);
              for (let y = top + 6; y < base - 40; y += 10) for (let wx = x + 3; wx < x + width - 3; wx += 6) {
                lit(g, wx, y, 2, 4, '#a4b9b3');
              }
            });
            g.fillStyle = '#263d4e'; g.fillRect(0, base - 20, w, 20);
            g.fillStyle = '#6e7667'; g.beginPath(); g.moveTo(0, base - 21); g.quadraticCurveTo(118, base - 69, 250, base - 23); g.lineTo(250, base); g.lineTo(0, base); g.closePath(); g.fill();
            g.fillStyle = '#a29a7a'; g.beginPath(); g.moveTo(74, base); g.quadraticCurveTo(125, base - 50, 177, base - 3); g.lineTo(167, base); g.closePath(); g.fill();
            [[25, 117, '#35624a'], [64, 112, '#3e7251'], [192, 126, '#346148'], [228, 107, '#3f704c']].forEach((t) => tree(g, t[0], base - 15, t[1], t[2]));
            ell(g, 132, base - 28, 63, 16, lg(g, 0, base - 44, 0, base - 12, [[0, '#648f8d'], [1, '#304d6a']]));
            for (let y = base - 35; y < base - 17; y += 5) line(g, 97, y, 164, y, 0.6, '#8aaca3');
            // Bow Bridge's pale arch and open railing separate the park from a generic grove.
            g.beginPath(); g.moveTo(77, base - 29); g.quadraticCurveTo(132, base - 60, 184, base - 29);
            g.strokeStyle = '#dbcfb2'; g.lineWidth = 5; g.stroke();
            g.beginPath(); g.moveTo(77, base - 38); g.quadraticCurveTo(132, base - 69, 184, base - 38);
            g.strokeStyle = '#dbcfb2'; g.lineWidth = 1.3; g.stroke();
            for (let x = 81; x < 184; x += 7) {
              const t = (x - 77) / 107, y = base - 29 - 62 * t * (1 - t);
              line(g, x, y, x, y - 9, 0.9, '#dbcfb2');
            }
            for (let x = 7; x < 68; x += 14) { line(g, x, base - 27, x, base - 44, 0.8, '#c5c6b3'); ell(g, x, base - 44, 1.8, 2, '#ffe09c'); }
            line(g, 95, base - 20, 95, base - 35, 1.2, '#31384a'); line(g, 95, base - 34, 123, base - 34, 1.2, '#31384a');
            line(g, 95, base - 27, 123, base - 27, 1.2, '#31384a'); [98, 120].forEach((x) => line(g, x, base - 27, x, base - 19, 1, '#31384a'));
            g.fillStyle = '#d1be92'; g.fillRect(5, base - 17, 240, 2);
            rrect(g, 4, base - 84, 94, 15, 2, '#1e4c44');
            txt(g, 'CENTRAL PARK', 10, base - 79, 0.9, '#e8e4c4');
            nyKerb(g, 0, h, w, 3);
          }],
          sc_ny_midtown: [230, 330, function (g, w, h, P) {
            const base = h - 3, buildings = [[2, 61, 262], [68, 65, 291], [140, 86, 276], [192, 38, 310]];
            buildings.forEach(function (b, i) {
              const x = b[0], width = b[1], tall = b[2], top = base - tall;
              g.fillStyle = silFill(g, top, base, ['#3d5272', '#4b526d', '#3b465f', '#59495e'][i], '#202942'); g.fillRect(x, top, width, tall);
              if (i === 1) { g.fillStyle = '#6d7f91'; g.fillRect(x + width / 2 - 3, top - 19, 6, 19); line(g, x + width / 2, top - 31, x + width / 2, top - 19, 1, '#ffd38b'); }
              if (i === 2) { g.fillStyle = '#89939a'; g.fillRect(x + 9, top - 8, width - 18, 8); }
              for (let y = top + 8; y < base - 10; y += 12) {
                g.fillStyle = 'rgba(12,26,47,0.7)'; g.fillRect(x + 4, y, width - 8, 8);
                for (let wx = x + 7; wx < x + width - 6; wx += 9) lit(g, wx, y + 1, 4, 5, P.win[(wx + y + i) % 3]);
              }
              for (let y = top + 2; y < base - 4; y += 20) line(g, x + 2, y, x + width - 2, y, 0.55, 'rgba(200,218,222,0.35)');
              poly(g, [[x + width - 12, top], [x + width, top + 10], [x + width, base], [x + width - 12, base]], 'rgba(8,15,32,0.6)');
              g.fillStyle = '#141e31'; g.fillRect(x, base - 4, width, 4);
            });
            g.fillStyle = '#20283f'; g.fillRect(0, base - 3, w, 3);
            [28, 211].forEach((x) => lamp(g, x, base - 2, 38, '#ffc978'));
            txt(g, 'MANHATTAN', 84, base - 10, 0.75, '#ffe6ad');
          }],
          sc_ny_pier: [270, 156, function (g, w, h, P) {
            const base = h - 3, water = base - 36;
            g.fillStyle = lg(g, 0, water, 0, base, [[0, '#527d91'], [1, '#1f3b59']]); g.fillRect(0, water, w, base - water);
            for (let y = water + 8; y < base; y += 12) for (let x = 8 + (y % 3) * 7; x < w; x += 45) line(g, x, y, x + 27, y + 1, 0.7, 'rgba(192,225,230,0.46)');
            g.fillStyle = '#433c4d'; g.fillRect(0, base - 82, w, 7); g.fillStyle = '#8c806f'; g.fillRect(0, base - 86, w, 4);
            for (let x = 8; x < w; x += 28) { g.fillStyle = '#473b43'; g.fillRect(x, base - 78, 5, 78); line(g, x, base - 76, x + 3, base - 4, 0.8, '#927259'); }
            C.depthGround(g, 0, base - 75, w, 7, '#3c3443', 'rgba(184,157,117,0.55)');
            for (let x = 8; x < w; x += 28) nyReturn(g, x, base - 75, 5, base, 2, false);
            g.fillStyle = '#68574a'; g.fillRect(0, base - 113, w, 27);
            g.fillStyle = '#b89d75'; g.fillRect(0, base - 116, w, 3);
            for (let x = 11; x < w; x += 29) { g.fillStyle = '#292a3b'; g.fillRect(x, base - 108, 16, 14); lit(g, x + 2, base - 106, 12, 10, P.win[(x / 29 | 0) % 3]); }
            [27, 127, 230].forEach((x) => { line(g, x, base - 116, x, base - 140, 1.2, '#5e5147'); ell(g, x, base - 140, 3, 3, '#ffdc8a'); });
            txt(g, 'HUDSON PIER', 83, base - 92, 0.75, '#f7e4c1');
            nyReturn(g, 0, base - 116, w, base - 86, 6);
          }],
          sc_ny_elevated: [280, 164, function (g, w, h, P) {
            const base = h - 3;
            for (let x = 20; x < w; x += 84) {
              g.fillStyle = '#4d5364'; g.fillRect(x, base - 98, 5, 98); g.fillRect(x - 11, base - 99, 28, 4);
              line(g, x - 6, base - 98, x + 2, base - 3, 0.8, '#88939b');
            }
            g.fillStyle = '#49576a'; g.fillRect(0, base - 101, w, 5); g.fillStyle = '#aeb6b4'; g.fillRect(0, base - 104, w, 3);
            for (let x = 2; x < w; x += 18) g.fillStyle = '#5c6573', g.fillRect(x, base - 94, 2, 7);
            g.fillStyle = '#1a263b'; g.fillRect(20, base - 79, 235, 25); g.fillStyle = '#1c5d91'; g.fillRect(20, base - 62, 235, 6); g.fillStyle = '#e28c4c'; g.fillRect(20, base - 56, 235, 2);
            for (let x = 27; x < 242; x += 22) { g.fillStyle = '#10203a'; g.fillRect(x, base - 75, 15, 11); lit(g, x + 1, base - 74, 12, 8, '#b8dce2'); }
            g.fillStyle = '#121f34'; g.fillRect(13, base - 57, 14, 5); g.fillRect(244, base - 57, 14, 5);
            txt(g, 'MTA EXPRESS', 92, base - 43, 0.72, '#ffe4ae');
            nyReturn(g, 20, base - 79, 235, base - 54, 5); for (let x = 20; x + 17 <= w; x += 84) nyReturn(g, x - 11, base - 99, 28, base - 95, 2);
            nyKerb(g, 0, h, w, 3);
          }]
        }
      });
  };

  AH.ArtModules.stages['worlds.new-york.scenery.89'] = function (C) {
    const { FLAT, defs, ell, lg, line, lit, poly, reg2, rrect, shade, txt, wheels } = C;

    reg2('secret_eastus2', 54, 18, function (g) {
        ell(g, 27, 11, 26, 6, '#171e2b');
        ell(g, 27, 8, 24, 6, '#848b88');
        ell(g, 27, 8, 20, 4.5, '#39464e');
        for (let x = 12; x < 44; x += 5) line(g, x, 5, x - 3, 11, 0.8, '#a2aaa0');
        line(g, 13, 7, 42, 7, 1, '#1b2935');
        line(g, 10, 10, 39, 10, 1, '#1b2935');
        g.fillStyle = '#373e48'; g.fillRect(1, 15, 52, 3);
      }, FLAT);
    reg2('sewer', 64, 32, function (g) {
        g.fillStyle = '#3a4445'; g.fillRect(0, 0, 64, 32);
        for (let y = 0; y < 32; y += 8) for (let x = -16 + (y % 16 ? 16 : 0); x < 64; x += 32) {
          g.fillStyle = '#68726a'; g.fillRect(x + 1, y + 1, 30, 6);
          line(g, x + 2, y + 1, x + 29, y + 1, 0.7, '#899080');
        }
      }, FLAT);
    reg2('sewer_top', 64, 8, function (g) {
        g.fillStyle = '#afb49a'; g.fillRect(0, 0, 64, 3);
        g.fillStyle = '#555f58'; g.fillRect(0, 3, 64, 5);
        for (let x = 0; x < 64; x += 16) line(g, x, 0, x, 7, 1, '#303d40');
      }, FLAT);
    reg2('sewer_plat', 80, 20, function (g) {
        g.fillStyle = '#263d46'; g.fillRect(0, 0, 80, 16);
        g.fillStyle = '#9baba2'; g.fillRect(0, 0, 80, 3);
        for (let x = 3; x < 80; x += 7) {
          line(g, x, 4, x, 13, 1.5, '#718b8a');
          ell(g, x, 17, 1.4, 1.4, '#afab8b');
        }
      }, FLAT);
    reg2('bonus_bg_sewer', 640, 360, function (g, w, h) {
        g.fillStyle = lg(g, 0, 0, 0, h, [[0, '#101e2b'], [0.6, '#293e42'], [1, '#142f37']]);
        g.fillRect(0, 0, w, h);
        for (let y = 12; y < 300; y += 12) for (let x = -24 + (y % 24 ? 24 : 0); x < w; x += 48) {
          g.fillStyle = y % 24 ? '#394c4c' : '#354548'; g.fillRect(x + 1, y + 1, 46, 10);
          line(g, x + 2, y + 2, x + 44, y + 2, 0.5, '#52615a');
        }
        for (let x = 18; x < w; x += 154) {
          g.fillStyle = '#172d35'; g.fillRect(x, 164, 112, 137);
          g.beginPath(); g.arc(x + 56, 164, 56, Math.PI, 0); g.fill();
          g.beginPath(); g.arc(x + 56, 164, 58, Math.PI, 0);
          g.strokeStyle = '#778078'; g.lineWidth = 9; g.stroke();
          line(g, x - 2, 164, x - 2, 299, 8, '#657169');
          line(g, x + 114, 164, x + 114, 299, 8, '#657169');
          g.fillStyle = '#0b202c'; g.fillRect(x + 8, 170, 96, 130);
          for (let rib = 0; rib < 4; rib++) {
            const inset = rib * 9;
            line(g, x + 14 + inset, 190 + inset, x + 14 + inset, 295, 1, '#28414a');
          }
          rrect(g, x + 50, 116, 12, 19, 3, '#343f44');
          lit(g, x + 53, 121, 6, 9, '#eac887');
          ell(g, x + 56, 145, 22, 5, 'rgba(230,194,120,0.08)');
        }
        for (const y of [26, 44]) {
          line(g, 0, y, w, y, 9, '#152a34');
          line(g, 0, y - 2, w, y - 2, 2, '#718279');
          for (let x = 14; x < w; x += 80) { g.fillStyle = '#8b8b72'; g.fillRect(x, y - 7, 4, 14); }
        }
        g.fillStyle = '#284f4d'; g.fillRect(0, 287, w, 73);
        for (let y = 292; y < h; y += 11) for (let x = (y % 3) * 11; x < w; x += 43) {
          line(g, x, y, x + 22, y, 0.7, '#58786a');
        }
        poly(g, [[290, 300], [290, 210], [307, 210], [307, 300]], '#172c35');
        for (let y = 215; y < 298; y += 10) line(g, 291, y, 306, y, 2, '#9ba897');
        rrect(g, 410, 208, 190, 25, 2, '#193945');
        txt(g, 'AZURE MONITOR: CHECK THE FLOW', 418, 217, 0.65, '#b8ddd3');
      }, FLAT);

    reg2('amb_train_eastus2', 248, 46, function (g) {
        for (let car = 0; car < 2; car++) {
          const x = car * 124;
          rrect(g, x + 2, 5, 119, 32, 5, lg(g, 0, 5, 0, 37, [[0, '#d9e3df'], [0.52, '#aabac2'], [1, '#687e91']]));
          g.fillStyle = '#1f5f9a'; g.fillRect(x + 4, 28, 114, 5); g.fillStyle = '#f28a45'; g.fillRect(x + 4, 33, 114, 2);
          for (let win = 0; win < 6; win++) { const wx = x + 13 + win * 16; rrect(g, wx, 12, 11, 12, 1, '#14243c'); lit(g, wx + 1, 13, 9, 8, '#b8dce2'); }
          [29, 92].forEach((dx) => { g.fillStyle = '#8296a0'; g.fillRect(x + dx, 9, 13, 27); lit(g, x + dx + 2, 14, 9, 10, '#b9dbe1'); line(g, x + dx + 6.5, 11, x + dx + 6.5, 35, 0.7, '#435568'); });
          wheels(g, [x + 25, x + 99], 40, 4);
          txt(g, 'MTA', x + 54, 29, 0.7, '#f1f3eb'); line(g, x + 42, 5, x + 49, 0, 0.8, '#526578'); line(g, x + 49, 0, x + 57, 5, 0.8, '#526578');
          lit(g, x + 4, 13, 6, 12, '#a6cfdf');
        }
        g.fillStyle = '#526578'; g.fillRect(121, 13, 5, 21);
      }, { shade: 0.25 });

    defs.amb_train_nycmetro = defs.amb_train_eastus2;
  };

  content.parts['panorama'] = function (C) {
    const { PAL } = C;
    const lg = (...args) => C.lg(...args);
    const nyBridge = (...args) => C.nyBridge(...args);
    const nyChrysler = (...args) => C.nyChrysler(...args);
    const nyEmpire = (...args) => C.nyEmpire(...args);
    const nyLiberty = (...args) => C.nyLiberty(...args);
    const skyline = (...args) => C.skyline(...args);

    return function (g, w, h) {
    const P = PAL['eastus2'];
    const base = h - 6;
    
            skyline(w, h, 209, '#18284d', P.accent, 20, 57, 0.28, P.win)(g);
            nyBridge(g, 5, base, 1.12, P);
            nyEmpire(g, 315, base, 0.88, P);
            nyChrysler(g, 420, base, 0.76, P);
            nyLiberty(g, 566, base, 1.85, P);
            g.fillStyle = lg(g, 0, h - 24, 0, h, [[0, 'rgba(255,198,134,0)'], [1, 'rgba(255,198,134,0.32)']]); g.fillRect(0, h - 24, w, 24);
          
    };
  };

  content.parts['sceneryStars_eastus2'] = function (C) {

    return ['sc_ny_times', 'sc_ny_brownstones', 'sc_ny_subway', 'sc_ny_midtown'];
  };

  content.parts['panoramaLandmarks_eastus2'] = function (C) {

    return ['sc_ny_liberty', 'sc_ny_empire', 'sc_ny_chrysler', 'sc_ny_brooklynbridge'];
  };

  content.parts['sceneryRoutes_eastus2'] = function (C) {

    return [[0, 'sc_ny_brownstones'], [0.1, 'sc_ny_times'], [0.24, 'sc_ny_subway'], [0.4, 'sc_ny_centralpark'], [0.56, 'sc_ny_midtown'], [0.72, 'sc_ny_pier'], [0.84, 'sc_ny_elevated']];
  };
})();
