"use strict";
// ===== Процедурные пиксельные спрайты (генерируются кодом, без файлов) =====
function px(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);}
function sheet(w,h,n,fn){const c=document.createElement('canvas');c.width=w*n;c.height=h;const x=c.getContext('2d');for(let i=0;i<n;i++){x.save();x.translate(i*w,0);fn(x,i);x.restore();}return{cv:c,w,h,n};}
function flash(s){const c=document.createElement('canvas');c.width=s.cv.width;c.height=s.cv.height;const x=c.getContext('2d');x.drawImage(s.cv,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);return{cv:c,w:s.w,h:s.h,n:s.n};}
function humanoid(o){
  const W=o.w||34,H=o.h||34,cx=W/2;
  function draw(c,f,mode){
    const gy=H-2;let bob=0,lp=0,wa=.18,lean=0;
    if(mode==='run'){lp=Math.sin(f/4*TAU)*3;bob=Math.abs(Math.cos(f/4*TAU))*1.6;wa=.18+Math.sin(f/4*TAU)*.3;}
    if(mode==='idle')bob=f?.8:0;
    if(mode==='attack'){wa=[-1.15,.15,1.3][f];lean=[-1,1,2][f];}
    if(mode==='die'){
      if(f===3){const b=o.bone||'#cfc6a8';px(c,cx-9,gy-3,18,3,b);px(c,cx-6,gy-6,5,3,b);px(c,cx+2,gy-5,6,3,b);px(c,cx-2,gy-9,5,5,o.skin);px(c,cx-1,gy-8,1,1,'#111');px(c,cx+1,gy-8,1,1,'#111');return;}
      c.translate(cx,gy);c.rotate(f*.32);c.globalAlpha=1-f*.18;c.translate(-cx,-gy);lean=f*2;
    }
    const y0=gy-15-bob+(o.hunch?2:0);
    if(o.cape)px(c,cx-8+lp*.3,y0+1,4,13,o.cape);
    px(c,cx-5+(mode==='run'?lp*.5:0),gy-8,4,8,o.legs);
    px(c,cx+1-(mode==='run'?lp*.5:0),gy-8,4,8,o.legs);
    if(o.robe){px(c,cx-7,y0+5,14,13,o.robe);px(c,cx-7,y0+16,14,2,o.trim||'#3a2c18');}
    px(c,cx-6+lean*.4,y0,12,10,o.armor);px(c,cx-6+lean*.4,y0+8,12,2,o.trim||'#3a2c18');
    px(c,cx-9+lean*.4,y0,3,5,o.armor2||o.armor);px(c,cx+6+lean*.4,y0,3,5,o.armor2||o.armor);
    if(o.ribs){for(let i=0;i<3;i++)px(c,cx-4,y0+2+i*3,8,1,'#8a8468');}
    const hx=cx-4+lean*.6+(o.hunch?2:0),hy=y0-9+(o.hunch?2:0);
    px(c,hx,hy,8,8,o.skin);
    px(c,hx+2,hy+3,1,1,o.eyes||'#141414');px(c,hx+5,hy+3,1,1,o.eyes||'#141414');
    if(o.helm){px(c,hx-1,hy-2,10,4,o.helm);px(c,hx+1,hy-4,6,2,o.helm);}
    if(o.crown){px(c,hx-1,hy-3,10,2,'#e8c15a');px(c,hx,hy-6,2,3,'#e8c15a');px(c,hx+3,hy-7,2,4,'#e8c15a');px(c,hx+6,hy-6,2,3,'#e8c15a');}
    if(o.hood){px(c,hx-2,hy-2,12,5,o.hood);px(c,hx-2,hy+3,2,5,o.hood);px(c,hx+8,hy+3,2,5,o.hood);}
    px(c,cx-9,y0+2,3,7,o.skin);
    if(o.shield){px(c,cx-13,y0+1,5,10,'#6a4a26');px(c,cx-12,y0+3,3,6,'#8a6a2a');}
    c.save();c.translate(cx+7+lean*.5,y0+4);c.rotate(wa);
    px(c,-1,-2,3,7,o.skin);
    if(o.weapon==='sword'){px(c,-1,-13,2,11,o.blade||'#cfd6e0');px(c,-3,-3,6,2,'#8a6a2a');px(c,-1,-15,2,2,'#eef4fa');}
    if(o.weapon==='great'){px(c,-2,-19,4,17,o.blade||'#dfe6ee');px(c,-4,-3,8,3,'#8a6a2a');px(c,-2,-22,4,3,'#f4f8fc');}
    if(o.weapon==='staff'){px(c,-1,-14,2,18,'#6a4a26');px(c,-3,-18,6,5,o.orb||'#3f7dff');px(c,-1,-17,2,2,'#fff');}
    if(o.weapon==='hammer'){px(c,-1,-10,2,14,'#6a4a26');px(c,-4,-14,8,5,'#9aa4b8');}
    if(o.weapon==='dagger'){px(c,-1,-8,2,7,'#cfd6e0');px(c,-2,-2,4,2,'#5a3a1a');}
    if(o.weapon==='bow'){c.strokeStyle='#8a5a2a';c.lineWidth=2;c.beginPath();c.arc(2,-4,8,-1.25,1.25);c.stroke();c.strokeStyle='#ddd';c.lineWidth=1;c.beginPath();c.moveTo(2+8*Math.cos(-1.25),-4+8*Math.sin(-1.25));c.lineTo(2+8*Math.cos(1.25),-4+8*Math.sin(1.25));c.stroke();if(mode==='attack')px(c,0,-5,10,1,'#e6d8b8');}
    c.restore();
  }
  const s={idle:sheet(W,H,2,(c,f)=>draw(c,f,'idle')),run:sheet(W,H,4,(c,f)=>draw(c,f,'run')),attack:sheet(W,H,3,(c,f)=>draw(c,f,'attack')),die:sheet(W,H,4,(c,f)=>draw(c,f,'die'))};
  s.flash={};for(const k of['idle','run','attack'])s.flash[k]=flash(s[k]);return s;
}
function impSpr(){
  const W=24,H=24,cx=12;
  function draw(c,f,mode){const gy=22;let bob=0,lp=0,wa=.3;
    if(mode==='run'){lp=Math.sin(f/4*TAU)*2.5;bob=Math.abs(Math.sin(f/4*TAU))*2;}
    if(mode==='idle')bob=f?.7:0;
    if(mode==='attack')wa=[-1,.2,1.2][f];
    if(mode==='die'){if(f===3){px(c,4,gy-3,16,3,'#7a1a12');px(c,8,gy-5,6,2,'#a03a20');return;}c.translate(cx,gy);c.rotate(f*.35);c.globalAlpha=1-f*.2;c.translate(-cx,-gy);}
    const y0=gy-10-bob;
    px(c,7+lp*.4,gy-4,3,4,'#7a1a12');px(c,14-lp*.4,gy-4,3,4,'#7a1a12');
    px(c,7,y0+4,10,7,'#b03a20');px(c,7,y0+8,10,2,'#5a2a10');
    px(c,8,y0-3,8,7,'#c84a28');px(c,7,y0-6,2,4,'#e8c15a');px(c,15,y0-6,2,4,'#e8c15a');
    px(c,10,y0-1,1,1,'#ffe95a');px(c,13,y0-1,1,1,'#ffe95a');
    c.save();c.translate(16,y0+5);c.rotate(wa);px(c,-1,-7,2,6,'#cfd6e0');px(c,-2,-1,4,2,'#5a3a1a');c.restore();
  }
  const s={idle:sheet(W,H,2,(c,f)=>draw(c,f,'idle')),run:sheet(W,H,4,(c,f)=>draw(c,f,'run')),attack:sheet(W,H,3,(c,f)=>draw(c,f,'attack')),die:sheet(W,H,4,(c,f)=>draw(c,f,'die'))};
  s.flash={};for(const k of['idle','run','attack'])s.flash[k]=flash(s[k]);return s;
}
function spitterSpr(){
  const W=30,H=24,cx=15;
  function draw(c,f,mode){const gy=22;let sq=0,lp=0,mouth=0;
    if(mode==='run'){lp=Math.sin(f/4*TAU)*2;sq=Math.abs(Math.sin(f/4*TAU))*1.5;}
    if(mode==='idle')sq=f?.8:0;
    if(mode==='attack')mouth=[2,5,3][f];
    if(mode==='die'){if(f===3){px(c,6,gy-3,18,3,'#3f6a12');px(c,10,gy-5,8,2,'#5a8f1a');return;}c.translate(cx,gy);c.scale(1+f*.15,1-f*.22);c.globalAlpha=1-f*.2;c.translate(-cx,-gy);}
    const y0=gy-12+sq;
    for(let i=0;i<4;i++)px(c,6+i*6+(i%2?lp:-lp)*.4,gy-3,3,3,'#2a4a0c');
    c.fillStyle='#4a7f16';c.beginPath();c.ellipse(cx,y0+6,11,7-sq*.4,0,0,TAU);c.fill();
    px(c,8,y0+2,3,2,'#2a4a0c');px(c,16,y0+4,4,2,'#2a4a0c');px(c,12,y0+8,3,2,'#7fd421');
    px(c,20,y0+1,4,3,'#ffe95a');px(c,21,y0+2,1,1,'#111');
    px(c,22,y0+6,6,2+mouth,'#1a2a08');if(mouth>2){px(c,23,y0+6,1,1,'#e6d8b8');px(c,26,y0+6,1,1,'#e6d8b8');}
  }
  const s={idle:sheet(W,H,2,(c,f)=>draw(c,f,'idle')),run:sheet(W,H,4,(c,f)=>draw(c,f,'run')),attack:sheet(W,H,3,(c,f)=>draw(c,f,'attack')),die:sheet(W,H,4,(c,f)=>draw(c,f,'die'))};
  s.flash={};for(const k of['idle','run','attack'])s.flash[k]=flash(s[k]);return s;
}
const SPR={};
function buildSprites(){
  SPR.warrior=humanoid({skin:'#d8a878',armor:'#7a8498',armor2:'#5a6478',legs:'#3a3f4c',helm:'#8a94a8',cape:'#8a1020',weapon:'sword',trim:'#3a2c18'});
  SPR.mage=humanoid({skin:'#d8b898',armor:'#2a3a7a',robe:'#1b3fae',hood:'#16295e',legs:'#1a2450',weapon:'staff',orb:'#6a9aff',trim:'#e8c15a'});
  SPR.ranger=humanoid({skin:'#d8a878',armor:'#3f6a2a',armor2:'#2a4a1c',hood:'#2a4a1c',legs:'#2a3a1c',weapon:'bow',trim:'#5a3a1a'});
  SPR.zombie=humanoid({skin:'#6a8f3a',armor:'#4a4a3a',legs:'#3a3a2a',hunch:true,eyes:'#c8e85a',weapon:'none',bone:'#8a9a5a'});
  SPR.skeleton=humanoid({skin:'#e6d8b8',armor:'#cfc6a8',armor2:'#b8ae90',legs:'#cfc6a8',ribs:true,eyes:'#ff3a2a',weapon:'sword',shield:true,blade:'#b8c0cc',bone:'#e6d8b8'});
  SPR.imp=impSpr();
  SPR.shaman=humanoid({skin:'#c84a28',armor:'#5a2a4a',robe:'#4a1a3a',hood:'#3a1030',legs:'#3a1030',weapon:'staff',orb:'#ff7a1a',eyes:'#ffe95a',trim:'#e8c15a'});
  SPR.spitter=spitterSpr();
  SPR.boss=humanoid({w:46,h:50,skin:'#e6d8b8',armor:'#b8ae90',armor2:'#8a8468',legs:'#cfc6a8',ribs:true,crown:true,eyes:'#ff2a1a',weapon:'great',blade:'#dfe6ee',bone:'#e6d8b8'});
  SPR.elder=humanoid({skin:'#d8b898',armor:'#6a6a72',robe:'#5a5a64',hood:'#4a4a54',legs:'#3a3a42',weapon:'staff',orb:'#e8c15a',trim:'#8a6a2a'});
  SPR.smith=humanoid({skin:'#c89868',armor:'#6a4a2a',armor2:'#4a3a2a',legs:'#3a2a1a',weapon:'hammer',trim:'#2a1a0a'});
  SPR.priest=humanoid({skin:'#e0c0a0',armor:'#d8d0c0',robe:'#cfc6b0',hood:'#b8ae98',legs:'#a89e88',weapon:'staff',orb:'#ffe9a0',trim:'#e8c15a'});
  SPR.merchant=humanoid({skin:'#d8a878',armor:'#7a5a2a',robe:'#6a4a20',legs:'#3a2a1a',weapon:'none',helm:'#5a3a1a',trim:'#e8c15a'});
}
