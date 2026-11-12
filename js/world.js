"use strict";
// ===== Мир: тайлы, генерация карты, декорации, коллизии =====
let map,tvar,decBlock,decos=[],torches=[],portals=[],chests=[],atlas={};
function tileCv(base,fn){const c=document.createElement('canvas');c.width=c.height=T;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,T,T);fn(x);return c;}
function speck(x,col,n,s=2){for(let i=0;i<n;i++){x.fillStyle=col;x.fillRect(irnd(0,T-s),irnd(0,T-s),s,s);}}
function buildAtlas(){
  atlas[0]=[0,1,2,3].map(()=>tileCv('#22331c',x=>{speck(x,'#2c4222',26);speck(x,'#1a2a16',18);for(let i=0;i<7;i++){x.fillStyle='#3a5a2c';x.fillRect(irnd(2,44),irnd(4,40),1,irnd(3,6));}}));
  atlas[1]=[0,1,2,3].map(()=>tileCv('#3d3226',x=>{speck(x,'#4a3d2c',24);speck(x,'#2e2418',16);}));
  atlas[2]=[0,1,2,3].map(()=>tileCv('#4a4438',x=>{speck(x,'#5a5446',20);speck(x,'#38322a',14);x.strokeStyle='#302a22';x.strokeRect(irnd(2,8),irnd(2,8),irnd(14,26),irnd(10,20));}));
  atlas[3]=[0,1,2,3].map(()=>tileCv('#4a3f30',x=>{speck(x,'#5a4d3a',22);speck(x,'#3a3024',14);x.strokeStyle='#332a1e';x.beginPath();x.moveTo(0,24);x.lineTo(48,24);x.moveTo(24,0);x.lineTo(24,48);x.stroke();}));
  atlas[4]=[0,1].map(()=>tileCv('#2a3140',x=>{x.fillStyle='#3a4356';for(let r=0;r<3;r++)for(let c2=0;c2<2;c2++)x.fillRect(c2*24+(r%2?12:0)+1,r*16+1,22,14);speck(x,'#1a2029',12);x.fillStyle='#4a5568';x.fillRect(0,0,T,3);}));
  atlas[5]=[0,1].map(()=>tileCv('#22331c',x=>{speck(x,'#2c4222',14);x.fillStyle='#5a3a1a';x.fillRect(6,10,4,30);x.fillRect(36,10,4,30);x.fillRect(0,16,48,4);x.fillRect(0,30,48,4);x.fillStyle='#7a5228';x.fillRect(6,10,4,3);x.fillRect(36,10,4,3);}));
  atlas[6]=[0,1,2].map(()=>tileCv('#122a3a',x=>{speck(x,'#1a3a4e',16);x.fillStyle='#2a5a72';for(let i=0;i<4;i++)x.fillRect(irnd(0,36),irnd(0,44),irnd(8,14),1);}));
  atlas[7]=[0,1,2,3].map(()=>tileCv('#262230',x=>{speck(x,'#302a3e',18);speck(x,'#1a1724',12);x.strokeStyle='#181420';x.strokeRect(1,1,46,46);if(chance(.3)){x.fillStyle='#3a3448';x.fillRect(20,20,8,8);}}));
  atlas[8]=[0,1].map(()=>tileCv('#1a1724',x=>{x.fillStyle='#2a2438';for(let r=0;r<3;r++)for(let c2=0;c2<2;c2++)x.fillRect(c2*24+(r%2?12:0)+1,r*16+1,22,14);speck(x,'#0e0c16',10);if(chance(.4)){x.fillStyle='#4a4460';x.fillRect(20,18,8,7);x.fillStyle='#1a1724';x.fillRect(22,21,2,2);x.fillRect(25,21,2,2);}}));
  atlas[9]=[0,1,2,3].map(()=>tileCv('#2a3320',x=>{speck(x,'#3a4a26',22);speck(x,'#1e2a18',16);speck(x,'#4a5a30',8,3);}));
  atlas[10]=[0,1,2,3].map(()=>tileCv('#33302a',x=>{speck(x,'#403c32',22);speck(x,'#26241e',16);speck(x,'#4a463a',6,3);}));
}
const idx=(x,y)=>y*MW+x;
function setT(x,y,t){if(x>=0&&y>=0&&x<MW&&y<MH){map[idx(x,y)]=t;tvar[idx(x,y)]=irnd(0,3);}}
function rectT(x0,y0,x1,y1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)setT(x,y,t);}
function path(pts){for(let i=0;i<pts.length-1;i++){let[x0,y0]=pts[i],[x1,y1]=pts[i+1];const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2;for(let s=0;s<=steps;s++){const x=Math.round(lerp(x0,x1,s/steps)),y=Math.round(lerp(y0,y1,s/steps));setT(x,y,2);setT(x+1,y,2);setT(x,y+1,2);}}}
function addDeco(x,y,type,block=true){const d={x:x*T+T/2,y:y*T+T/2,type,v:irnd(0,999),opened:false};decos.push(d);if(block){decBlock[idx(x,y)]=1;}if(type==='torch'||type==='lamp')torches.push(d);if(type==='chest')chests.push(d);return d;}
function addBlock(x0,y0,x1,y1){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x>=0&&y>=0&&x<MW&&y<MH)decBlock[idx(x,y)]=1;}
function genMap(){
  map=new Uint8Array(MW*MH);tvar=new Uint8Array(MW*MH);decBlock=new Uint8Array(MW*MH);
  decos=[];torches=[];chests=[];
  for(let i=0;i<MW*MH;i++){map[i]=0;tvar[i]=irnd(0,3);}
  rectT(62,52,88,82,9);for(let i=0;i<14;i++)setT(irnd(64,86),irnd(54,80),6);
  rectT(12,10,36,34,1);
  rectT(42,36,68,58,10);
  rectT(8,58,30,82,3);
  for(let x=8;x<=30;x++){setT(x,58,5);setT(x,82,5);}for(let y=58;y<=82;y++){setT(8,y,5);setT(30,y,5);}
  setT(18,58,3);setT(19,58,3);setT(20,58,3);
  rectT(16,60,22,63,4);setT(19,63,3);
  rectT(10,66,14,69,4);setT(14,68,3);
  rectT(24,66,28,69,4);setT(24,68,3);
  path([[19,57],[19,50],[46,48]]);path([[19,50],[22,36]]);path([[46,48],[72,64]]);path([[46,48],[62,36],[79,27]]);
  rectT(70,4,92,24,8);rectT(71,5,91,23,7);
  [[74,9],[78,15],[84,9],[88,15]].forEach(([x,y])=>addDeco(x,y,'pillar'));
  addDeco(73,7,'chest');addDeco(88,7,'chest');addDeco(88,18,'chest');addDeco(16,16,'chest');
  addDeco(80,24,'gate',false);
  portals=[{x:80.5*T,y:26.5*T,to:1},{x:80.5*T,y:21.5*T,to:0}];
  for(let i=0;i<150;i++){const x=irnd(1,MW-2),y=irnd(1,MH-2),t=map[idx(x,y)];if(t===0&&!(x>6&&x<32&&y>56&&y<84)&&chance(.75))addDeco(x,y,chance(.5)?'tree':'pine');}
  for(let i=0;i<26;i++){const x=irnd(43,67),y=irnd(37,57);if(map[idx(x,y)]===10&&!decBlock[idx(x,y)])addDeco(x,y,chance(.6)?'grave':'cross');}
  for(let i=0;i<16;i++){const x=irnd(63,87),y=irnd(53,81);if(map[idx(x,y)]===9&&!decBlock[idx(x,y)])addDeco(x,y,'mushroom',false);}
  [[14,14],[26,20],[30,12]].forEach(([x,y])=>addDeco(x,y,'tent'));
  [[19,59],[12,72],[26,72],[19,76],[30,48],[52,47],[66,40],[76,30],[24,32],[70,62]].forEach(([x,y])=>addDeco(x,y,'torch',false));
  addDeco(20,18,'fire',false);addDeco(16,74,'well');
  for(let i=0;i<40;i++){const x=irnd(2,MW-3),y=irnd(2,MH-3);if(WALK[map[idx(x,y)]]&&!decBlock[idx(x,y)]&&chance(.5))addDeco(x,y,chance(.5)?'rock':'bone',map[idx(x,y)]!==7);}
  addDeco(11,74,'banner',false);addDeco(27,74,'banner',false);
  // ===== Наполнение города Очаг =====
  // Дома (камень + деревянный каркас, светящиеся окна)
  addDeco(16,63,'house');addBlock(15,60,17,63);
  addDeco(23,63,'house');addBlock(22,60,24,63);
  addDeco(12,68,'house');addBlock(10,66,14,69);
  addDeco(26,68,'house');addBlock(24,66,28,69);
  addDeco(12,77,'house');addBlock(10,75,14,78);
  addDeco(26,77,'house');addBlock(24,75,28,78);
  // Рыночная лавка у торговца
  addDeco(21,76,'stall');addBlock(21,76,22,76);
  // Бочки, ящики, телега
  addDeco(15,70,'barrel');addDeco(24,70,'barrel');addDeco(13,80,'barrel');
  addDeco(13,64,'crate');addDeco(24,64,'crate');addDeco(25,80,'crate');
  addDeco(15,72,'cart');
  // Фонари по углам площади — светят ярче факелов
  [[11,61],[27,61],[11,79],[27,79]].forEach(([x,y])=>addDeco(x,y,'lamp'));
  // Клумбы
  [[14,64],[25,64],[16,79],[23,79],[13,74],[24,74],[18,60],[21,60]].forEach(([x,y])=>{if(!decBlock[idx(x,y)])addDeco(x,y,'flowers',false);});
}
function tileAt(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);if(tx<0||ty<0||tx>=MW||ty>=MH)return 4;return map[idx(tx,ty)];}
function blocked(x,y,r){
  const x0=Math.floor((x-r)/T),x1=Math.floor((x+r)/T),y0=Math.floor((y-r)/T),y1=Math.floor((y+r)/T);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    if(tx<0||ty<0||tx>=MW||ty>=MH)return true;
    if(!WALK[map[idx(tx,ty)]]||decBlock[idx(tx,ty)]){
      const cx=clamp(x,tx*T,tx*T+T),cy=clamp(y,ty*T,ty*T+T);
      if((x-cx)**2+(y-cy)**2<r*r)return true;
    }
  }return false;
}
function moveEnt(e,dx,dy){
  const r=e.r||13;
  if(blocked(e.x,e.y,r)){
    for(let ring of[7,15,26]){let escaped=false;
      for(let k=0;k<16;k++){const a=k/16*TAU,nx=e.x+Math.cos(a)*ring,ny=e.y+Math.sin(a)*ring;
        if(!blocked(nx,ny,r)){e.x=nx;e.y=ny;escaped=true;break;}}
      if(escaped)break;}
  }
  if(!blocked(e.x+dx,e.y,r))e.x+=dx;
  if(!blocked(e.x,e.y+dy,r))e.y+=dy;
}
function inTown(x,y){const tx=x/T,ty=y/T;return tx>8&&tx<30&&ty>58&&ty<82;}
function zoneAt(x,y){const tx=x/T,ty=y/T;
  if(inTown(x,y))return{name:'ГОРОД ОЧАГ',dark:.2};
  if(tx>=70&&tx<=92&&ty>=4&&ty<=24)return{name:'КРИПТА ВЛАДЫКИ',dark:.86};
  if(tx>=42&&tx<=68&&ty>=36&&ty<=58)return{name:'ПРОКЛЯТОЕ КЛАДБИЩЕ',dark:.72};
  if(tx>=12&&tx<=36&&ty>=10&&ty<=34)return{name:'ЛАГЕРЬ ПАДШИХ',dark:.66};
  if(tx>=62&&tx<=88&&ty>=52&&ty<=82)return{name:'ГНИЛЫЕ ТОПИ',dark:.75};
  return{name:'ДИКИЕ ЗЕМЛИ',dark:.7};
}
function drawDeco(d){
  const x=d.x,y=d.y;ctx.save();ctx.translate(x,y);
  const sh=()=>{ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,2,16,6,0,0,TAU);ctx.fill();};
  switch(d.type){
    case'tree':sh();px(ctx,-3,-26,6,28,'#3a2a16');ctx.fillStyle='#1e3a16';ctx.beginPath();ctx.arc(0,-34,20,0,TAU);ctx.fill();ctx.fillStyle='#2a4a1e';ctx.beginPath();ctx.arc(-6,-40,12,0,TAU);ctx.arc(8,-32,11,0,TAU);ctx.fill();break;
    case'pine':sh();px(ctx,-3,-20,6,22,'#2e2010');ctx.fillStyle='#16301a';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(0,-58+i*14);ctx.lineTo(-16+i*3,-26+i*10);ctx.lineTo(16-i*3,-26+i*10);ctx.fill();}break;
    case'rock':sh();ctx.fillStyle='#4a505c';ctx.beginPath();ctx.ellipse(0,-6,13,9,0,0,TAU);ctx.fill();ctx.fillStyle='#5a6270';ctx.beginPath();ctx.ellipse(-3,-9,7,4,0,0,TAU);ctx.fill();break;
    case'grave':sh();ctx.fillStyle='#5a606c';ctx.fillRect(-9,-24,18,24);ctx.beginPath();ctx.arc(0,-24,9,Math.PI,0);ctx.fill();ctx.fillStyle='#3a404c';ctx.fillRect(-6,-18,12,2);ctx.fillRect(-6,-13,12,2);break;
    case'cross':sh();ctx.fillStyle='#6a6a72';ctx.fillRect(-2,-30,4,30);ctx.fillRect(-9,-24,18,4);break;
    case'tent':sh();ctx.fillStyle='#5a3a20';ctx.beginPath();ctx.moveTo(0,-34);ctx.lineTo(-24,0);ctx.lineTo(24,0);ctx.fill();ctx.fillStyle='#3a2410';ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(-8,0);ctx.lineTo(8,0);ctx.fill();px(ctx,-1,-38,2,6,'#8a6a2a');break;
    case'pillar':sh();ctx.fillStyle='#3a3448';ctx.fillRect(-8,-52,16,52);ctx.fillStyle='#4a4460';ctx.fillRect(-11,-56,22,6);ctx.fillRect(-11,-4,22,4);ctx.fillStyle='#2a2438';ctx.fillRect(-8,-30,16,2);break;
    case'torch':{px(ctx,-2,-22,4,22,'#4a3018');px(ctx,-4,-24,8,4,'#6a4a26');const f=Math.sin(time*13+d.v)*2;ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.ellipse(0,-30+f*.4,5,8+f*.5,0,0,TAU);ctx.fill();ctx.fillStyle='#ffe95a';ctx.beginPath();ctx.ellipse(0,-28,2.5,4,0,0,TAU);ctx.fill();break;}
    case'fire':{sh();px(ctx,-10,-4,20,5,'#3a2410');const f=Math.sin(time*11+d.v)*3;ctx.fillStyle='#ff5a1a';ctx.beginPath();ctx.ellipse(0,-14,10,16+f,0,0,TAU);ctx.fill();ctx.fillStyle='#ffb347';ctx.beginPath();ctx.ellipse(0,-10,6,10+f*.6,0,0,TAU);ctx.fill();ctx.fillStyle='#fff2c9';ctx.beginPath();ctx.ellipse(0,-7,3,5,0,0,TAU);ctx.fill();break;}
    case'well':sh();ctx.fillStyle='#4a505c';ctx.beginPath();ctx.ellipse(0,-6,16,10,0,0,TAU);ctx.fill();ctx.fillStyle='#122a3a';ctx.beginPath();ctx.ellipse(0,-7,11,6,0,0,TAU);ctx.fill();px(ctx,-14,-30,3,24,'#5a3a1a');px(ctx,11,-30,3,24,'#5a3a1a');px(ctx,-16,-32,32,4,'#6a4a26');break;
    case'bone':ctx.fillStyle='#cfc6a8';ctx.fillRect(-8,-3,16,3);ctx.fillRect(-4,-6,3,6);ctx.beginPath();ctx.arc(6,-5,4,0,TAU);ctx.fill();ctx.fillStyle='#1a1a1a';ctx.fillRect(5,-6,1,1);ctx.fillRect(7,-6,1,1);break;
    case'mushroom':px(ctx,-2,-8,4,8,'#cfc6a8');ctx.fillStyle='#7fd421';ctx.beginPath();ctx.arc(0,-9,6,Math.PI,0);ctx.fill();px(ctx,-3,-11,2,2,'#c8f060');break;
    case'banner':px(ctx,-1,-40,2,40,'#4a3018');ctx.fillStyle='#8a1020';ctx.beginPath();ctx.moveTo(1,-40);ctx.lineTo(16,-36);ctx.lineTo(1,-26);ctx.fill();break;
    case'gate':ctx.fillStyle='#2a2438';ctx.fillRect(-22,-46,44,46);ctx.fillStyle='#0e0c16';ctx.beginPath();ctx.arc(0,-24,14,Math.PI,0);ctx.fill();ctx.fillRect(-14,-24,28,24);ctx.fillStyle='#8b3ff2';ctx.globalAlpha=.5+Math.sin(time*3)*.2;ctx.beginPath();ctx.arc(0,-18,10,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
    case'chest':sh();ctx.fillStyle=d.opened?'#3a2a16':'#6a4a26';ctx.fillRect(-12,-14,24,14);ctx.fillStyle=d.opened?'#241a0c':'#8a6a2a';ctx.fillRect(-12,-18,24,6);ctx.fillStyle='#e8c15a';ctx.fillRect(-2,-12,4,5);if(d.opened){ctx.fillStyle='#120c06';ctx.fillRect(-9,-13,18,4);}break;
    // ===== Городские декорации =====
    case'house':{
      ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,2,66,10,0,0,TAU);ctx.fill();
      const w=116,h=60;
      px(ctx,-w/2,-h,w,h,'#4a4438');
      px(ctx,-w/2,-h,6,h,'#3a2a16');px(ctx,w/2-6,-h,6,h,'#3a2a16');
      px(ctx,-w/2,-h,w,5,'#3a2a16');px(ctx,-w/2,-10,w,6,'#3a2a16');
      for(let i=-1;i<=1;i++)px(ctx,i*34-2,-h+5,4,h-15,'#3a2a16');
      ctx.fillStyle='#5a2a16';ctx.beginPath();ctx.moveTo(-w/2-10,-h+2);ctx.lineTo(0,-h-44);ctx.lineTo(w/2+10,-h+2);ctx.fill();
      ctx.fillStyle='#6a3a1e';ctx.beginPath();ctx.moveTo(-w/2-10,-h+2);ctx.lineTo(0,-h-44);ctx.lineTo(0,-h+2);ctx.fill();
      px(ctx,-3,-h-46,6,4,'#8a6a2a');
      px(ctx,-9,-34,18,34,'#241608');px(ctx,-11,-38,22,5,'#3a2a16');
      const fl=.75+Math.sin(time*7+d.v)*.25;
      ctx.fillStyle='rgba(255,179,71,'+fl+')';
      ctx.fillRect(-w/2+13,-42,14,12);ctx.fillRect(w/2-27,-42,14,12);
      px(ctx,-w/2+11,-44,18,16,'#3a2a16');px(ctx,-w/2+13,-42,14,12,'rgba(255,179,71,'+fl+')');
      px(ctx,w/2-29,-44,18,16,'#3a2a16');px(ctx,w/2-27,-42,14,12,'rgba(255,179,71,'+fl+')');
      px(ctx,w/2-24,-h-32,10,20,'#3a3448');px(ctx,w/2-26,-h-34,14,4,'#2a2438');
      break;}
    case'stall':{
      sh();px(ctx,-24,-30,4,30,'#5a3a1a');px(ctx,20,-30,4,30,'#5a3a1a');
      px(ctx,-26,-14,52,12,'#6a4a26');px(ctx,-26,-14,52,3,'#8a6a2a');
      for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#8a1020':'#e6d8b8';ctx.beginPath();ctx.moveTo(-28+i*11.2,-46);ctx.lineTo(-28+(i+1)*11.2,-46);ctx.lineTo(-26+(i+1)*11.2,-30);ctx.lineTo(-26+i*11.2,-30);ctx.fill();}
      px(ctx,-20,-22,8,8,'#c84a28');px(ctx,-8,-21,7,7,'#7fd421');px(ctx,4,-23,9,9,'#e8c15a');px(ctx,14,-21,6,6,'#8b3ff2');
      break;}
    case'barrel':{sh();ctx.fillStyle='#6a4a26';ctx.beginPath();ctx.ellipse(0,-9,10,12,0,0,TAU);ctx.fill();ctx.fillStyle='#8a6a2a';ctx.fillRect(-10,-14,20,2);ctx.fillRect(-10,-6,20,2);ctx.fillStyle='#4a3018';ctx.beginPath();ctx.ellipse(0,-20,8,3,0,0,TAU);ctx.fill();break;}
    case'crate':{sh();ctx.fillStyle='#6a4a26';ctx.fillRect(-11,-20,22,20);ctx.strokeStyle='#3a2a16';ctx.lineWidth=2;ctx.strokeRect(-11,-20,22,20);ctx.beginPath();ctx.moveTo(-11,-20);ctx.lineTo(11,0);ctx.moveTo(11,-20);ctx.lineTo(-11,0);ctx.stroke();break;}
    case'cart':{sh();px(ctx,-18,-18,36,10,'#6a4a26');px(ctx,-20,-20,4,6,'#4a3018');px(ctx,16,-20,4,6,'#4a3018');px(ctx,18,-14,14,3,'#5a3a1a');ctx.fillStyle='#3a2a16';ctx.beginPath();ctx.arc(-10,-4,7,0,TAU);ctx.arc(10,-4,7,0,TAU);ctx.fill();ctx.fillStyle='#8a6a2a';ctx.beginPath();ctx.arc(-10,-4,2.5,0,TAU);ctx.arc(10,-4,2.5,0,TAU);ctx.fill();px(ctx,-14,-24,10,6,'#e6d8b8');px(ctx,-2,-26,12,8,'#8a6a2a');break;}
    case'lamp':{px(ctx,-2,-42,4,42,'#2a3140');px(ctx,-6,-50,12,10,'#3a2f18');const fl=.8+Math.sin(time*9+d.v)*.2;ctx.fillStyle='rgba(255,215,120,'+fl+')';ctx.beginPath();ctx.arc(0,-45,4,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,215,120,'+(fl*.35)+')';ctx.beginPath();ctx.arc(0,-45,9,0,TAU);ctx.fill();px(ctx,-1,-54,2,4,'#2a3140');break;}
    case'flowers':{const cols=['#d43a2f','#ffb347','#8b3ff2','#ff7a1a'];for(let i=0;i<5;i++){const fx2=((d.v+i*37)%17)-8,fy2=((d.v+i*53)%9)-4;px(ctx,fx2,fy2-4,1,4,'#3a5a2c');px(ctx,fx2-1,fy2-6,3,3,cols[(d.v+i)%4]);}break;}
  }
  ctx.restore();
}
