"use strict";
// ===== Отрисовка мира, света, сущностей и миникарты =====
const lightCv=document.createElement('canvas'),lctx=lightCv.getContext('2d');
function render(){
  ctx.fillStyle='#07090f';ctx.fillRect(0,0,VW,VH);
  let sx=0,sy=0;if(shakeT>0){sx=rnd(-1,1)*shakeMag*shakeT;sy=rnd(-1,1)*shakeMag*shakeT;}
  const ox=VW/2-cam.x+sx,oy=VH/2-cam.y+sy;
  ctx.save();ctx.translate(ox,oy);
  const x0=Math.max(0,Math.floor((cam.x-VW/2)/T)-1),x1=Math.min(MW-1,Math.ceil((cam.x+VW/2)/T)+1);
  const y0=Math.max(0,Math.floor((cam.y-VH/2)/T)-1),y1=Math.min(MH-1,Math.ceil((cam.y+VH/2)/T)+1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=map[idx(x,y)];const vars=atlas[t];ctx.drawImage(vars[tvar[idx(x,y)]%vars.length],x*T,y*T);}
  decals.forEach(d=>ctx.drawImage(d.cv,d.x-32,d.y-32));
  fx.forEach(f=>{if(f.kind==='puddle'){ctx.fillStyle='rgba(90,140,20,.4)';ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*.6,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(168,232,90,.5)';for(let k=0;k<3;k++){const a=time*2+k*2.1;ctx.beginPath();ctx.arc(f.x+Math.cos(a)*f.r*.5,f.y+Math.sin(a*1.3)*f.r*.3,3,0,TAU);ctx.fill();}}
    if(f.kind==='tele'){const p=f.t/f.dur;ctx.strokeStyle='rgba(255,58,42,'+(0.4+p*.5)+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,TAU);ctx.stroke();ctx.fillStyle='rgba(255,58,42,'+(p*.25)+')';ctx.beginPath();ctx.arc(f.x,f.y,f.r*p,0,TAU);ctx.fill();}});
  if(moveTarget){ctx.strokeStyle='rgba(232,193,90,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(moveTarget.x,moveTarget.y,10+Math.sin(time*8)*2,0,TAU);ctx.stroke();}
  if(combatTarget&&combatTarget.state!=='dead'){const m=combatTarget;ctx.strokeStyle='rgba(212,58,47,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,m.y+2,m.r+8,(m.r+8)*.5,0,0,TAU);ctx.stroke();}
  portals.forEach(p=>{const locked=Q.q3!=='active'&&Q.q3!=='ready'&&Q.q3!=='done';const col=locked?'#4a4460':'#8b3ff2';
    ctx.strokeStyle=col;ctx.lineWidth=3;ctx.globalAlpha=.6+Math.sin(time*4)*.25;ctx.beginPath();ctx.ellipse(p.x,p.y,22,12,0,0,TAU);ctx.stroke();ctx.globalAlpha=1;
    if(!locked&&chance(.15))parts.push({x:p.x+rnd(-16,16),y:p.y,vx:0,vy:-40,g:0,t:0,life:.7,size:2.5,col:'#8b3ff2',glow:true});});
  const draws=[];
  decos.forEach(d=>{if(d.x>cam.x-VW/2-80&&d.x<cam.x+VW/2+80&&d.y>cam.y-VH/2-100&&d.y<cam.y+VH/2+100)draws.push({y:d.y,fn:()=>drawDeco(d)});});
  loot.forEach(l=>draws.push({y:l.y,fn:()=>drawLoot(l)}));
  npcs.forEach(n=>draws.push({y:n.y,fn:()=>drawNpc(n)}));
  monsters.forEach(m=>draws.push({y:m.y,fn:()=>drawMonster(m)}));
  draws.push({y:player.y,fn:drawPlayer});
  draws.sort((a,b)=>a.y-b.y);draws.forEach(d=>d.fn());
  projs.forEach(p=>drawProj(p));
  fx.forEach(f=>{
    if(f.kind==='ring'){const p=f.t/f.dur;ctx.strokeStyle=f.col;ctx.globalAlpha=1-p;ctx.lineWidth=4*(1-p)+1;ctx.beginPath();ctx.arc(f.x,f.y,lerp(f.r0,f.r1,p),0,TAU);ctx.stroke();ctx.globalAlpha=1;}
    if(f.kind==='slash'){const p=f.t/f.dur;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.ang);ctx.strokeStyle=f.col;ctx.globalAlpha=1-p;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,f.r*(.6+p*.4),-1,1);ctx.stroke();ctx.restore();ctx.globalAlpha=1;}
  });
  parts.forEach(p=>{const a=1-p.t/p.life;ctx.globalAlpha=a;ctx.fillStyle=p.col;if(p.glow){ctx.shadowColor=p.col;ctx.shadowBlur=8;}ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);ctx.shadowBlur=0;ctx.globalAlpha=1;});
  ctx.restore();
  renderLight(ox,oy);
  ctx.save();ctx.translate(ox,oy);
  npcs.forEach(n=>{const mk=npcMarker(n);if(mk){ctx.font='bold 20px Georgia';ctx.textAlign='center';ctx.fillStyle=mk==='!'?'#e8c15a':mk==='?'?'#ffb347':'#e8c15a';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillText(mk,n.x,n.y-92+Math.sin(time*4)*3);ctx.shadowBlur=0;}});
  floats.forEach(f=>{const a=1-f.t/f.dur;ctx.globalAlpha=a;ctx.font='bold '+f.size+'px Georgia';ctx.textAlign='center';ctx.fillStyle=f.col;ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillText(f.txt,f.x,f.y);ctx.shadowBlur=0;ctx.globalAlpha=1;});
  ctx.restore();
  const vg=ctx.createRadialGradient(VW/2,VH/2,VH*.35,VW/2,VH/2,VH*.85);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vg;ctx.fillRect(0,0,VW,VH);
  $('#hurtFx').style.opacity=Math.min(1,hurtT*2);
  $('#fadeFx').style.opacity=fadeT;fadeT=Math.max(0,fadeT-.04);
}
function renderLight(ox,oy){
  if(lightCv.width!==VW||lightCv.height!==VH){lightCv.width=VW;lightCv.height=VH;}
  const z=zoneAt(player.x,player.y);
  lctx.globalCompositeOperation='source-over';lctx.clearRect(0,0,VW,VH);
  lctx.fillStyle='rgba(5,7,16,'+z.dark+')';lctx.fillRect(0,0,VW,VH);
  lctx.globalCompositeOperation='destination-out';
  const hole=(x,y,r,a=1)=>{const g=lctx.createRadialGradient(x,y,r*.15,x,y,r);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(1,'rgba(255,255,255,0)');lctx.fillStyle=g;lctx.beginPath();lctx.arc(x,y,r,0,TAU);lctx.fill();};
  hole(player.x+ox,player.y-14+oy,player.light+Math.sin(time*5)*8);
  torches.forEach((t,i)=>{if(Math.abs(t.x-cam.x)<VW/2+200&&Math.abs(t.y-cam.y)<VH/2+200){const r=t.type==='lamp'?170:120;hole(t.x+ox,t.y-(t.type==='lamp'?45:26)+oy,r+Math.sin(time*12+i)*10,.9);}});
  projs.forEach(p=>hole(p.x+ox,p.y+oy,p.type==='firebig'?80:50,.8));
  portals.forEach(p=>hole(p.x+ox,p.y+oy,90,.7));
  ctx.drawImage(lightCv,0,0);
  ctx.globalCompositeOperation='lighter';
  torches.forEach(t=>{if(Math.abs(t.x-cam.x)<VW/2+160&&Math.abs(t.y-cam.y)<VH/2+160){const ty2=t.y-(t.type==='lamp'?45:26);const g=ctx.createRadialGradient(t.x+ox,ty2+oy,4,t.x+ox,ty2+oy,70);g.addColorStop(0,'rgba(255,140,40,.16)');g.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=g;ctx.fillRect(t.x+ox-70,ty2+oy-70,140,140);}});
  if(player.buffT>0){const g=ctx.createRadialGradient(player.x+ox,player.y-14+oy,4,player.x+ox,player.y-14+oy,60);g.addColorStop(0,'rgba(232,193,90,.2)');g.addColorStop(1,'rgba(232,193,90,0)');ctx.fillStyle=g;ctx.fillRect(player.x+ox-60,player.y-14+oy-60,120,120);}
  ctx.globalCompositeOperation='source-over';
}
function drawSpr(s,ent,scale){
  let mode=ent.anim||'idle',fr=0;
  if(ent.state==='dead'||ent.anim==='die'){mode='die';fr=Math.min(3,Math.floor((ent.dieT||0)/.22));}
  else if(mode==='attack')fr=Math.min(2,Math.floor(ent.animT/.09));
  else if(mode==='run')fr=Math.floor(ent.animT*9)%4;
  else fr=Math.floor(ent.animT*2)%2;
  const sh=(ent.hitT>0&&s.flash&&s.flash[mode])?s.flash[mode]:s[mode];
  const w=sh.w*scale,h=sh.h*scale;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(ent.x,ent.y+2,w*.28,w*.11,0,0,TAU);ctx.fill();
  ctx.save();ctx.translate(ent.x,ent.y);ctx.scale(ent.face||1,1);
  ctx.drawImage(sh.cv,fr*sh.w,0,sh.w,sh.h,-w/2,-h+4,w,h);
  ctx.restore();
}
function drawPlayer(){
  if(player.dead){drawSpr(SPR[classId],{...player,anim:'die',dieT:.7},2);return;}
  if(player.invulnT>0&&Math.floor(time*20)%2===0)return;
  drawSpr(SPR[CLASSES[classId].spr],player,2);
  if(player.buffT>0){ctx.strokeStyle='rgba(232,193,90,'+(0.4+Math.sin(time*8)*.2)+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(player.x,player.y+2,22,10,0,0,TAU);ctx.stroke();}
}
function drawMonster(m){
  drawSpr(m.spr,m,m.scale);
  const top=m.y-m.spr.idle.h*m.scale;
  if(m.state!=='dead'&&m.hp<m.maxhp){const w=m.boss?70:36;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(m.x-w/2,top-8,w,5);ctx.fillStyle=m.boss?'#8b3ff2':'#c01a20';ctx.fillRect(m.x-w/2,top-8,w*m.hp/m.maxhp,5);}
  if(m.boss&&m.state!=='dead'){ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillStyle='#e8c15a';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillText(m.n,m.x,top-22);ctx.shadowBlur=0;}
}
function drawNpc(n){
  n.animT+=1/60;drawSpr(SPR[n.spr],{...n,anim:'idle'},2);
  ctx.font='11px Georgia';ctx.textAlign='center';ctx.fillStyle='#e8c15a';ctx.shadowColor='#000';ctx.shadowBlur=3;ctx.fillText(n.n,n.x,n.y-76);ctx.shadowBlur=0;
}
function drawLoot(l){
  const bob=Math.sin(time*3+l.bob)*3;
  ctx.save();ctx.translate(l.x,l.y+bob);
  if(l===hoverLoot){ctx.strokeStyle='rgba(232,193,90,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-2,16,8,0,0,TAU);ctx.stroke();}
  if(l.kind==='gold'){ctx.fillStyle='#e8c15a';ctx.shadowColor='#e8c15a';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(0,-4,5,0,TAU);ctx.fill();ctx.fillStyle='#fff2c9';ctx.fillRect(-1,-6,2,2);}
  else if(l.kind==='hp'||l.kind==='mp'){const col=l.kind==='hp'?'#ff3a3a':'#3a6aff';ctx.fillStyle='#cfc6a8';ctx.fillRect(-2,-14,4,4);ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(0,-6,5,7,0,0,TAU);ctx.fill();}
  else if(l.kind==='shard'){ctx.fillStyle='#ff7a1a';ctx.shadowColor='#ff7a1a';ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(6,-4);ctx.lineTo(0,0);ctx.lineTo(-6,-4);ctx.fill();}
  else{const col=l.eq.tier===3?'#ffd75a':l.eq.tier===2?'#6a9aff':'#e6d8b8';ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=8;ctx.fillRect(-6,-10,12,8);ctx.font='10px Georgia';ctx.textAlign='center';ctx.shadowBlur=3;ctx.shadowColor='#000';ctx.fillStyle=col;ctx.fillText(l.eq.name,0,-16);}
  ctx.restore();ctx.shadowBlur=0;
}
function drawProj(p){
  ctx.save();ctx.translate(p.x,p.y);
  if(p.type==='arrow'){ctx.rotate(Math.atan2(p.vy,p.vx));ctx.fillStyle='#e6d8b8';ctx.fillRect(-8,-1,14,2);ctx.fillStyle='#9aa4b8';ctx.beginPath();ctx.moveTo(6,-3);ctx.lineTo(10,0);ctx.lineTo(6,3);ctx.fill();}
  else if(p.type==='bone'){ctx.rotate(time*10);ctx.fillStyle='#e6d8b8';ctx.fillRect(-7,-2,14,4);ctx.beginPath();ctx.arc(-7,0,3,0,TAU);ctx.arc(7,0,3,0,TAU);ctx.fill();}
  else{const col=p.type==='poison'?'#7fd421':'#ff7a1a';ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(0,0,p.r,0,TAU);ctx.fill();ctx.fillStyle='#fff2c9';ctx.beginPath();ctx.arc(0,0,p.r*.4,0,TAU);ctx.fill();}
  ctx.restore();ctx.shadowBlur=0;
}
// ===== Миникарта =====
const mm=$('#minimap'),mmc=mm.getContext('2d');let mmBase=null;
function buildMinimap(){
  mmBase=document.createElement('canvas');mmBase.width=MW;mmBase.height=MH;const c=mmBase.getContext('2d');
  const cols=['#1e3018','#3d3226','#6a5a40','#5a4d3a','#3a4356','#3a2a16','#122a3a','#262230','#1a1724','#2a3320','#33302a'];
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){c.fillStyle=cols[map[idx(x,y)]];c.fillRect(x,y,1,1);}
}
function renderMinimap(){
  if(!mmBase)return;
  mmc.imageSmoothingEnabled=false;mmc.clearRect(0,0,158,158);
  const sc=158/MW;mmc.drawImage(mmBase,0,0,158,158);
  mmc.fillStyle='rgba(5,7,16,.35)';mmc.fillRect(0,0,158,158);
  const dot=(x,y,col,r=2)=>{mmc.fillStyle=col;mmc.beginPath();mmc.arc(x/T*sc,y/T*sc,r,0,TAU);mmc.fill();};
  npcs.forEach(n=>dot(n.x,n.y,'#e8c15a',2));
  monsters.forEach(m=>{if(m.state!=='dead')dot(m.x,m.y,m.boss?'#8b3ff2':'#d43a2f',m.boss?3:1.5);});
  portals.forEach(p=>dot(p.x,p.y,'#8b3ff2',2));
  dot(player.x,player.y,'#ffffff',3);
  mmc.strokeStyle='rgba(255,255,255,.5)';mmc.strokeRect((cam.x-VW/2)/T*sc,(cam.y-VH/2)/T*sc,VW/T*sc,VH/T*sc);
}
