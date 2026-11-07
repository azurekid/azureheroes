/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['mexico-city'] = AH.Worlds['mexico-city'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['mexicocentral'] = content;
  content.parts.foreground_mexicocentral = () => ({
    shape: 'terrace', detail: 'lantern', roof: '#493e53', wall: '#8e625f',
    light: '#d3ae82', accent: '#998b78'
  });
  content.parts.graffiti_mexicocentral = () => ({
    tags: ['HOLA MEXICO', 'ARTE EN LA CALLE', 'JUNTOS CREAMOS'], paint: '#6fe0cd', accent: '#ffc370'
  });

  AH.ArtModules.stages['worlds.mexico-city.art.105'] = function (C) {
    const { FLAT, MP, PAL, SKIES, ell, lg, line, lit, makeSky, poly, reg2, skyline } = C;

    Object.assign(C, { mxVolcano, mxPyramid, mxAngel, mxBellas, mxTower, mxCathedral, mxAgave, mxStreet });
    const MX = 'mexicocentral';

    const mxPal = { top: '#89304d', bot: '#d45a3c', accent: '#ffd15a', win: ['#ffcc62', '#ff8b57', '#5ee4d0'] };

    SKIES[MX] = {
        stops: [[0, '#220b43'], [0.28, '#55205f'], [0.52, '#a93368'], [0.72, '#ef554a'], [0.88, '#ff963f'], [1, '#ffd45e']],
        sun: { x: 426, y: 210, r: 78, c: ['#fff8b0', '#ffbd45', '#ef4760'] },
        halo: ['rgba(255,195,95,0.65)', 'rgba(255,80,130,0.24)'],
        cl: ['rgba(126,45,104,0.52)', 'rgba(255,116,119,0.62)', 'rgba(255,207,136,0.55)'],
        hz: 'rgba(255,174,90,0.55)', stars: 82, seed: 29, stripes: false
      };

    reg2('bg_sky_' + MX, 640, 360, makeSky(SKIES[MX]), FLAT);

    PAL[MX] = { top: '#71304f', bot: '#a94b58', accent: '#ffc15a', win: ['#ffe08a', '#ff985f', '#62e1d4'] };

    MP[MX] = { top: '#6f2a4a', bot: '#a94a52', accent: '#ffcb58', win: ['#ffcf68', '#ff9261', '#5ce1d4'] };

    function mxVolcano(g, cx, base, s, snow) {
        poly(g, [[cx-118*s,base],[cx-73*s,base-35*s],[cx-42*s,base-67*s],[cx-12*s,base-99*s],[cx+6*s,base-109*s],[cx+24*s,base-87*s],[cx+45*s,base-61*s],[cx+83*s,base-33*s],[cx+120*s,base]], lg(g,cx,base-110*s,cx,base,[[0,'#5b315e'],[0.55,'#49264f'],[1,'#291b48']]));
        poly(g, [[cx-19*s,base-89*s],[cx-7*s,base-104*s],[cx+6*s,base-109*s],[cx+17*s,base-94*s],[cx+5*s,base-98*s],[cx-1*s,base-90*s],[cx-9*s,base-96*s]], snow || '#e5b7a0');
        g.strokeStyle='rgba(255,178,132,0.55)'; g.lineWidth=1.1*s; g.beginPath(); g.moveTo(cx-118*s,base); g.lineTo(cx-42*s,base-67*s); g.lineTo(cx-12*s,base-99*s); g.stroke();
      }

    function mxPyramid(g, x, base, w, h, color) {
        const c=color||'#bd654a';
        poly(g,[[x,base],[x+w/2,base-h],[x+w,base]],lg(g,x,base-h,x+w,base,[[0,'#e28b5b'],[0.45,c],[1,'#773c50']]));
        for(let i=1;i<=7;i++){const y=base-i*h/8, half=w*i/16;g.fillStyle=i%2?'rgba(255,203,112,0.78)':'rgba(67,36,55,0.58)';g.fillRect(x+w/2-half,y,half*2,2.1);g.fillStyle='rgba(255,226,164,0.5)';g.fillRect(x+w/2-half,y,half*2,0.65);}
        const stairW=Math.max(5,w*0.055);g.fillStyle='#f0bd77';g.fillRect(x+w/2-stairW/2,base-h+8,stairW,h-8);
        for(let y=base-h+12;y<base;y+=9){g.fillStyle='rgba(92,43,52,0.65)';g.fillRect(x+w/2-stairW/2,y,stairW,1);}
        g.fillStyle='#47283f';g.fillRect(x+w/2-5,base-15,10,15);g.fillStyle='#ffd06a';g.fillRect(x+w/2-4,base-14,1,7);g.fillRect(x+w/2+2,base-14,1,7);
      }

    function mxAngel(g,cx,base,s) {
        const gold=lg(g,cx-13*s,base-120*s,cx+13*s,base,[[0,'#fff0a0'],[0.4,'#e4a948'],[1,'#8e563e']]);
        g.fillStyle='#6b4352';g.fillRect(cx-10*s,base-85*s,20*s,85*s);g.fillStyle='#f6c76c';g.fillRect(cx-13*s,base-86*s,26*s,3*s);g.fillRect(cx-15*s,base-4*s,30*s,4*s);
        for(let y=base-72*s;y<base-9*s;y+=13*s){g.fillStyle='rgba(255,215,132,0.6)';g.fillRect(cx-6*s,y,12*s,2*s);}
        // winged Victory, lifted arm and spread wings
        poly(g,[[cx-5*s,base-94*s],[cx-27*s,base-107*s],[cx-42*s,base-126*s],[cx-20*s,base-119*s],[cx-8*s,base-110*s],[cx-2*s,base-98*s]],gold);
        poly(g,[[cx+5*s,base-94*s],[cx+26*s,base-107*s],[cx+39*s,base-128*s],[cx+22*s,base-118*s],[cx+8*s,base-109*s],[cx+2*s,base-98*s]],gold);
        ell(g,cx,base-101*s,5*s,7*s,'#edc16c');line(g,cx+2*s,base-108*s,cx+8*s,base-137*s,2*s,'#ffe27b');ell(g,cx+9*s,base-139*s,3*s,4*s,'#ffd85e');
        poly(g,[[cx-4*s,base-96*s],[cx+5*s,base-96*s],[cx+7*s,base-82*s],[cx-6*s,base-82*s]],'#e4a948');
      }

    function mxBellas(g,x,base,w,h) {
        const domeY=base-h*0.72;g.fillStyle=lg(g,x,base-h,x+w,base,[[0,'#ffb65c'],[1,'#a94e54']]);
        g.fillRect(x+12,base-h*0.55,w-24,h*0.55);g.fillRect(x+4,base-h*0.51,w-8,5);g.fillRect(x+8,base-h*0.2,w-16,4);
        for(let i=0;i<7;i++){const xx=x+20+i*(w-40)/6;g.fillStyle='#f2bd6d';g.fillRect(xx,base-h*0.47,5,h*0.26);g.fillStyle='#542d4b';g.fillRect(xx+1,base-h*0.45,3,h*0.23);}
        [x+w*0.3,x+w*0.7].forEach((cx)=>{ell(g,cx,domeY, w*0.17,h*0.24,lg(g,cx-w*.17,domeY-h*.24,cx+w*.17,domeY,[[0,'#ffc86b'],[1,'#b85c50']]));g.fillStyle='#ffe29a';g.fillRect(cx-w*.17,domeY,w*.34,2);g.fillStyle='#ffe29a';g.fillRect(cx-1,domeY-h*.34,2,h*.11);});
        g.fillStyle='#f8c56d';g.fillRect(x,base-3,w,3);g.fillStyle='#50304a';g.fillRect(x+w*.43,base-h*.19,w*.14,h*.19);
      }

    function mxTower(g,cx,base,h) {
        const w=h*.34;poly(g,[[cx-w/2,base],[cx-w*.38,base-h*.74],[cx-w*.24,base-h*.84],[cx-w*.14,base-h*.94],[cx,base-h],[cx+w*.14,base-h*.94],[cx+w*.24,base-h*.84],[cx+w*.38,base-h*.74],[cx+w/2,base]],lg(g,cx-w/2,base-h,cx+w/2,base,[[0,'#9bdbd8'],[0.35,'#527d91'],[0.7,'#dda35a'],[1,'#4d395d']]));
        g.save();g.beginPath();g.moveTo(cx-w/2,base);g.lineTo(cx-w*.38,base-h*.74);g.lineTo(cx-w*.24,base-h*.84);g.lineTo(cx-w*.14,base-h*.94);g.lineTo(cx,base-h);g.lineTo(cx+w*.14,base-h*.94);g.lineTo(cx+w*.24,base-h*.84);g.lineTo(cx+w*.38,base-h*.74);g.lineTo(cx+w/2,base);g.closePath();g.clip();
        for(let y=base-h*.9;y<base;y+=8){g.fillStyle='rgba(24,38,64,0.55)';g.fillRect(cx-w/2,y,w,1.3);for(let xx=cx-w*.36;xx<cx+w*.36;xx+=7){lit(g,xx,y+2,3,3,['#ffd36a','#58e2d4','#ff8965'][Math.abs(Math.floor(xx+y))%3]);}}
        g.restore();g.fillStyle='#ffcb68';g.fillRect(cx-1,base-h-5,2,6);
      }

    function mxCathedral(g,x,base,w,h) {
        const body=lg(g,x,base-h,x+w,base,[[0,'#e8c995'],[0.55,'#ad766f'],[1,'#65435a']]);g.fillStyle=body;g.fillRect(x+15,base-h*.62,w-30,h*.62);
        for(let i=0;i<3;i++){const cx=x+w*(.23+i*.27),r=w*.095;g.beginPath();g.arc(cx,base-h*.62,r,r*.75,Math.PI,0);g.fill();g.fillRect(cx-r,base-h*.62,r*2,h*.62);g.fillStyle='#392844';g.fillRect(cx-r*.56,base-h*.5,r*1.12,h*.48);g.fillStyle=body;}
        for(const cx of [x+29,x+w/2,x+w-29]){g.fillStyle='#e6ca94';g.fillRect(cx-8,base-h*.78,16,h*.78);g.fillRect(cx-12,base-h*.8,24,4);poly(g,[[cx-12,base-h*.8],[cx,base-h*.98],[cx+12,base-h*.8]],'#d6ae77');g.fillStyle='#4b3150';g.fillRect(cx-2,base-h*.74,4,10);}
        g.fillStyle='#f2d89e';g.fillRect(x+8,base-h*.64,w-16,4);g.fillRect(x+6,base-5,w-12,5);
      }

    function mxAgave(g,cx,base,s,col) {
        const green=col||'#367d65';for(let i=-4;i<=4;i++){const ang=i*.21, len=(30+Math.abs(i)*3)*s;g.save();g.translate(cx,base);g.rotate(ang);poly(g,[[-2*s,0],[-1.3*s,-len*.72],[0,-len],[2*s,-len*.68],[2*s,0]],i%2?'#286754':green);line(g,0,-len*.1,0,-len*.83,.55,'rgba(169,230,174,.6)');g.restore();}
        ell(g,cx,base,9*s,3*s,'#315544');
      }

    function mxStreet(g,w,h,P) {
        g.fillStyle=lg(g,0,h*.45,0,h,[[0,'#532c56'],[1,'#231b42']]);g.fillRect(0,h*.45,w,h*.55);
        for(let x=0;x<w;x+=34){const bh=55+(x*13%39);g.fillStyle=x%2?'#713c5b':'#8c4a59';g.fillRect(x,h-bh,30,bh);g.fillStyle='#d27a55';g.fillRect(x,h-bh,30,2);for(let y=h-bh+10;y<h-16;y+=14)for(let xx=x+5;xx<x+27;xx+=10)lit(g,xx,y,4,5,P.win[(x+xx+y)%3]);}
      }

    reg2('bg_far_' + MX,640,220,function(g,w,h){
        const base=h-5;skyline(w,h,293,'#653455',PAL[MX].accent,22,55,.18,PAL[MX].win)(g);
        mxVolcano(g,480,base-8,.72,'#e5b7a0');mxPyramid(g,15,base,188,104,'#ba644d');mxAngel(g,355,base,.88);
        g.fillStyle=lg(g,0,h-28,0,h,[[0,'rgba(255,205,105,0)'],[1,'rgba(255,182,89,.38)']]);g.fillRect(0,h-28,w,28);
      },FLAT);

    reg2('bg_farp_' + MX,640,220,function(g,w,h){
        const base=h-2;mxVolcano(g,310,base,1.0,'#c79aa0');
        const hills=[[0,base,150,82],[112,base,305,56],[280,base,450,72],[430,base,640,88]];
        hills.forEach((v,i)=>{poly(g,[[v[0],base],[v[0]+(v[2]-v[0])*.42,base-v[3]],[v[0]+(v[2]-v[0])*.55,base-v[3]+7],[v[2],base]],i%2?'#513257':'#60375a');g.strokeStyle='rgba(255,190,115,.28)';g.lineWidth=1;g.beginPath();g.moveTo(v[0],base);g.lineTo(v[0]+(v[2]-v[0])*.42,base-v[3]);g.stroke();});
        mxAgave(g,44,base,1.15);mxAgave(g,584,base,1.05);mxAgave(g,220,base,.66,'#315d54');mxAgave(g,414,base,.72,'#315d54');
        g.fillStyle='rgba(255,157,92,.18)';g.fillRect(0,h-12,w,12);
      },FLAT);

    reg2('bg_near_' + MX,640,150,function(g,w,h){
        mxStreet(g,w,h,{win:PAL[MX].win});mxAgave(g,34,h,1.15,'#142d39');mxAgave(g,605,h,1.2,'#142d39');mxAgave(g,180,h,0.65,'#193d45');mxAgave(g,470,h,.7,'#193d45');
        g.fillStyle='rgba(17,12,39,.32)';g.fillRect(0,h-18,w,18);g.fillStyle='rgba(255,104,126,.25)';g.fillRect(0,h-20,w,2);
      },FLAT);

    Object.assign(C, { MX, mxPal });
  };

  AH.ArtModules.stages['worlds.mexico-city.art.107'] = function (C) {
    const { MX, regSkins } = C;

    regSkins(MX);
  };

  AH.ArtModules.stages['worlds.mexico-city.art.109'] = function (C) {
    const { FLAT, MX, lg, poly, reg2, regCoins } = C;

    regCoins(MX);

    reg2('adobe',32,32,function(g){
        const rows=[0,8,16,24];
        rows.forEach((y,r)=>{g.fillStyle=lg(g,0,y,32,y+8,[[0,r%2?'#d18457':'#c97a50'],[.45,'#9f594b'],[1,'#75434b']]);g.fillRect(0,y,32,8);g.fillStyle='rgba(255,219,143,.55)';g.fillRect(0,y,32,.8);g.fillStyle='rgba(64,39,54,.42)';g.fillRect(0,y+7,32,1);const shift=r%2?0:8;for(let x=shift-8;x<32;x+=16){g.strokeStyle='rgba(255,205,139,.32)';g.lineWidth=.65;g.strokeRect(x+1,y+1,14,5.4);g.fillStyle=(r+x)%3?'#19a99d':'#d94557';poly(g,[[x+7,y+1.6],[x+10,y+3.4],[x+7,y+5.4],[x+4,y+3.4]],g.fillStyle);g.fillStyle='#ffd362';g.fillRect(x+6.5,y+2.7,1,1);}});
      },FLAT);

    reg2('adobe_top',32,8,function(g){
        g.fillStyle=lg(g,0,0,0,8,[[0,'#ffd182'],[.45,'#b96b4e'],[1,'#75404a']]);g.fillRect(0,0,32,8);g.fillStyle='#ffdf98';g.fillRect(0,0,32,1.2);g.fillStyle='#704050';g.fillRect(0,6.8,32,1.2);
        for(let x=2;x<32;x+=6){g.fillStyle='#1bb7ad';poly(g,[[x,2],[x+2,4],[x,6],[x-2,4]],g.fillStyle);g.fillStyle='#e84b5c';g.fillRect(x+2,3,1,2);}
        poly(g,[[0,0],[27,0],[32,4],[5,4]],'rgba(246,192,132,.3)');
        for(const x of [8,24])poly(g,[[x,0],[x+1,0],[x+6,4],[x+5,4]],'#a46650');
      },FLAT);
  };

  AH.ArtModules.stages['worlds.mexico-city.art.111'] = function (C) {
    const { ell, lg, line, lit, msLogo, mxAgave, mxAngel, mxBellas, mxCathedral, mxPinata, mxPyramid, mxTower, poly, reg2, shade, txt } = C;

    Object.assign(C, { mxPyramidPiece, mxAngelPiece, mxBellasPiece, mxTowerPiece, mxCathedralPiece, mxBoatPiece, mxPapelPiece, mxMariachi, mxOffice, mxMarket, mxBarrio, mxAgavesPiece, mxDesertPiece, mxBandstand });
    reg2('prop_pinata',30,36,mxPinata,{shade:.4});

    reg2('prop_papel',38,22,function(g,w,h){
        line(g,0,1,w,1,1,'#f4d77e');for(let i=0;i<5;i++){const x=i*8;poly(g,[[x+1,3],[x+7,3],[x+7,17],[x+4,20],[x+1,17]],['#eb4770','#ffb53d','#1cc8b5','#bf56a1','#f07140'][i]);
          g.strokeStyle='rgba(255,240,190,.78)';g.lineWidth=.65;g.strokeRect(x+2.5,5,3,8);line(g,x+4,4,x+4,14,.55,'#fff0c0');line(g,x+2,9,x+6,9,.55,'#fff0c0');}
      },{shade:.35});

    function mxPyramidPiece(g,w,h,kind){
        const top=kind==='chichen'?34:45, base=h-4;
        mxPyramid(g,kind==='chichen'?23:18,base,w-(kind==='chichen'?46:36),base-top,kind==='chichen'?'#d59a62':'#bc674e');
        if(kind==='chichen'){
          const cx=w/2;g.fillStyle='#4c2b43';g.fillRect(cx-2,base-top+7,4,base-top-7);
          for(let y=base-4;y>base-top+10;y-=6){g.fillStyle='#f2c583';g.fillRect(cx-5,y,10,1.2);}
          poly(g,[[cx-7,base-top+8],[cx,base-top-3],[cx+7,base-top+8]],'#8e4850');
        }
      }

    function mxAngelPiece(g,w,h){mxAngel(g,w*.5,h-3,.93);}

    function mxBellasPiece(g,w,h){mxBellas(g,5,h-3,w-10,Math.min(126,h-12));}

    function mxTowerPiece(g,w,h){mxTower(g,w/2,h-3,h-10);}

    function mxCathedralPiece(g,w,h){mxCathedral(g,4,h-3,w-8,h-12);}

    function mxBoatPiece(g,w,h){
        // Trajinera hull with the local MARIA arch overhead
        line(g,25,15,w-22,15,2,'#ffd76b');for(let x=36;x<w-24;x+=13)line(g,x,15,x-5,4,.8,'#efc477');
        g.strokeStyle='#f2d28c';g.lineWidth=3;g.beginPath();g.moveTo(w*.27,17);g.quadraticCurveTo(w*.5,-4,w*.73,17);g.stroke();
        txt(g,'MARIA',w*.39,1,1,'#ffdb68','#872d57');
        poly(g,[[12,18],[w-12,18],[w-22,35],[24,35]],lg(g,0,18,0,36,[[0,'#ef455d'],[.5,'#24bcb1'],[1,'#e39445']]));
        for(let x=27;x<w-22;x+=16){g.fillStyle=['#ffd053','#fe7890','#6ce2d2'][Math.floor(x/16)%3];g.fillRect(x,21,9,7);g.fillStyle='rgba(255,241,190,.75)';g.fillRect(x,21,9,1);}
        line(g,7,37,w-5,37,1,'#27d0c4');
      }

    function mxPapelPiece(g,w,h){
        const street=h-4;
        g.fillStyle='#37233f';g.fillRect(0,street-23,w,27);g.fillStyle='#dc8551';g.fillRect(0,street-24,w,2);
        for(let i=0;i<7;i++){const x=i*31,bh=24+(i*17%20),col=['#d34a59','#cf7946','#487b76','#a9436c'][i%4];g.fillStyle=col;g.fillRect(x,street-24-bh,29,bh);g.fillStyle='#ffd16a';g.fillRect(x,street-24-bh,29,1.4);for(let y=street-20-bh;y<street-28;y+=9){g.fillStyle='#342547';g.fillRect(x+5,y,5,5);g.fillStyle='#ffe18a';g.fillRect(x+6,y+1,3,3);g.fillStyle='#30c5b5';g.fillRect(x+18,y+1,5,5);}}
        g.fillStyle='#221d38';g.fillRect(0,street-4,w,8);g.fillStyle='#ffd166';g.fillRect(0,street-4,w,1.3);
        line(g,2,12,w-2,4,1.2,'#ffd976');for(let i=0;i<8;i++){const x=8+i*25,y=11-i*1.15;poly(g,[[x-9,y],[x+9,y-1],[x+8,y+13],[x,y+18],[x-8,y+13]],['#ef4267','#ffbd42','#27c5b6','#a84a91'][i%4]);g.strokeStyle='rgba(255,244,197,.8)';g.lineWidth=.7;g.strokeRect(x-4,y+2,8,8);line(g,x,y+1,x,y+11,.5,'#fff0b0');}
      }

    function mxMariachi(g,w,h){
        const xs=[w*.25,w*.5,w*.75];xs.forEach((x,i)=>{const c=['#ec485d','#17a99e','#e4a63c'][i];g.fillStyle=c;g.fillRect(x-10,h-48,20,30);g.fillStyle='#f5cb6b';g.fillRect(x-10,h-20,20,3);ell(g,x,h-55,7,7,'#c98761');
          poly(g,[[x-8,h-58],[x-14,h-62],[x,h-66],[x+14,h-62],[x+8,h-58]],'#22203b');g.fillStyle='#f6d05f';g.fillRect(x-9,h-59,18,1.5);line(g,x-8,h-46,x-16,h-33,3,c);line(g,x+8,h-46,x+15,h-35,3,c);
          if(i===0){line(g,x+6,h-41,x+20,h-30,1.4,'#f5d477');line(g,x+19,h-30,x+22,h-19,1,'#e9c27a');}else if(i===1){line(g,x+7,h-45,x+18,h-45,1.6,'#ebd79a');line(g,x+18,h-48,x+18,h-41,1,'#ebd79a');}else{ell(g,x+17,h-41,7,5,'#f0c64c');line(g,x+11,h-40,x+6,h-32,1,'#f0c64c');}
        });g.fillStyle='#482a48';g.fillRect(4,h-15,w-8,15);g.fillStyle='#f3c45f';g.fillRect(7,h-15,w-14,2);
      }

    function mxOffice(g,w,h){
        g.fillStyle=lg(g,10,0,w-10,h,[[0,'#659b9d'],[.5,'#476b80'],[1,'#352c53']]);g.fillRect(12,18,w-24,h-20);g.fillStyle='#ffc45d';g.fillRect(9,17,w-18,3);
        for(let y=26;y<h-12;y+=12)for(let x=20;x<w-18;x+=13){g.fillStyle='#1e2b4a';g.fillRect(x,y,8,7);lit(g,x+1,y+1,6,5,['#51d4cf','#ffcc62','#f98169'][(x+y)%3]);}
        g.fillStyle='#f5d078';g.fillRect(w/2-23,h-35,46,24);msLogo(g,w/2-17,h-30,13);txt(g,'MICROSOFT',w/2-13,h-19,.72,'#fff0c8','#5a3151');g.fillStyle='#f3c465';g.fillRect(w/2-2,5,4,13);
      }

    function mxMarket(g,w,h){
        g.fillStyle='#673854';g.fillRect(6,h-55,w-12,55);poly(g,[[4,h-54],[w/2,h-93],[w-4,h-54]],'#e3a34f');
        for(let x=12;x<w-12;x+=22){g.fillStyle=(x%2)?'#e84966':'#21b8a8';g.fillRect(x,h-55,12,54);g.fillStyle='rgba(255,224,142,.7)';g.fillRect(x,h-55,12,2);}
        txt(g,'MERCADO',w/2-25,h-42,1,'#ffdf74','#6a2c51');
      }

    function mxBarrio(g,w,h){
        for(let x=0;x<w;x+=32){const bh=45+(x*17%55);g.fillStyle=['#743d59','#a54856','#48516f','#b65b4b'][x/32%4|0];g.fillRect(x,h-bh,30,bh);g.fillStyle='#e8a45b';g.fillRect(x,h-bh,30,2);for(let y=h-bh+9;y<h-9;y+=13){g.fillStyle='#ffd06a';g.fillRect(x+5,y,5,5);g.fillStyle='#46c8b8';g.fillRect(x+18,y+3,5,5);}}
      }

    function mxAgavesPiece(g,w,h){mxAgave(g,27,h-4,.8);mxAgave(g,64,h-5,1.15);mxAgave(g,104,h-4,.92);}

    function mxDesertPiece(g,w,h){
        const base=h-3;for(let i=0;i<4;i++){const x=8+i*31,hh=37+(i*19%34);g.fillStyle=i%2?'#5c3551':'#733b52';g.beginPath();g.moveTo(x,base);g.lineTo(x+7,base-hh);g.lineTo(x+20,base-hh-5);g.lineTo(x+28,base-hh*.48);g.lineTo(x+38,base);g.fill();}mxAgave(g,31,base,.65,'#376454');mxAgave(g,105,base,.7,'#376454');
      }

    function mxBandstand(g,w,h){
        const base=h-5;g.fillStyle='#402947';g.fillRect(10,base-24,w-20,24);g.fillStyle='#e3b457';g.fillRect(6,base-27,w-12,4);g.fillStyle='#ab4a57';g.fillRect(16,base-66,w-32,39);for(let x=22;x<w-20;x+=17){g.fillStyle='#eecb7e';g.fillRect(x,base-65,4,38);}
        poly(g,[[4,base-66],[w/2,base-94],[w-4,base-66]],'#edaa4d');g.fillStyle='#ffd778';g.fillRect(w/2-2,base-99,4,8);for(let x=18;x<w-20;x+=18){lit(g,x,base-20,4,6,'#ffdf71');}
      }
  };
})();
