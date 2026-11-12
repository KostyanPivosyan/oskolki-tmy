"use strict";
// ===== Бой и игровой цикл: навыки, ИИ монстров, обновление мира =====
function castSkill(i){
  if(state!=='play'||dialogNpc||charOpen||player.dead)return;
  const sid=CLASSES[classId].skills[i],s=SK[sid];
  if(player.level<UNLOCK[i]){toast('Навык откроется на уровне '+UNLOCK[i]);sfx('error');return;}
  if(player.cds[i]>0)return;
  if(player.mp<s.mana){toast('Недостаточно маны');sfx('error');return;}
  const wx=mouse.x+cam.x-VW/2,wy=mouse.y+cam.y-VH/2;
  const a=Math.atan2(wy-player.y,wx-player.x);
  player.face=Math.cos(a)<0?-1:1;player.mp-=s.mana;player.cds[i]=s.cd;player.atkT=.28;player.animT=0;
  const dmg=pDmg()*s.mult,crit=chance(pCrit());
  if(s.type==='melee'){
    sfx('swing');fx.push({kind:'slash',x:player.x,y:player.y-14,ang:a,t:0,dur:.18,r:s.range,col:'#eef4fa'});
    monsters.forEach(m=>{if(m.state==='dead')return;const d=dist(player.x,player.y,m.x,m.y);if(d<s.range+m.r){const ma=Math.atan2(m.y-player.y,m.x-player.x);let da=Math.abs(ma-a);if(da>Math.PI)da=TAU-da;if(da<s.arc/2)hitMonster(m,Math.round(dmg*(crit?1.8:1)),{crit,kb:10});}});
  }else if(s.type==='proj'){
    sfx(s.proj==='arrow'?'swing':'fire');
    projs.push({x:player.x+Math.cos(a)*18,y:player.y-14+Math.sin(a)*18,vx:Math.cos(a)*s.speed,vy:Math.sin(a)*s.speed,r:s.proj==='firebig'?10:6,dmg:Math.round(dmg*(crit?1.8:1)),crit,type:s.proj,from:'p',life:s.range/s.speed,aoe:s.aoe,puddle:s.puddle,sndT:0});
  }else if(s.type==='multi'){
    sfx('swing');
    for(let k=0;k<s.count;k++){const aa=a+(k/(s.count-1)-.5)*s.spread;projs.push({x:player.x+Math.cos(aa)*18,y:player.y-14+Math.sin(aa)*18,vx:Math.cos(aa)*s.speed,vy:Math.sin(aa)*s.speed,r:5,dmg:Math.round(dmg*(chance(pCrit())?1.8:1)),type:'arrow',from:'p',life:.8,sndT:0});}
  }else if(s.type==='nova'){
    sfx(s.frost?'frost':'boom');shake(5,.2);
    fx.push({kind:'ring',x:player.x,y:player.y,r0:14,r1:s.radius,t:0,dur:.4,col:s.col});
    burst(player.x,player.y-10,20,s.col,180,true,0);
    monsters.forEach(m=>{if(m.state!=='dead'&&dist(player.x,player.y,m.x,m.y)<s.radius+m.r)hitMonster(m,Math.round(dmg*(crit?1.8:1)),{crit,frost:s.frost,kb:16});});
  }else if(s.type==='dash'){
    sfx('blink');player.invulnT=Math.max(player.invulnT,s.inv||.2);
    const hitSet=new Set();const steps=Math.floor(s.dist/8);
    for(let k=0;k<steps;k++){const nx=player.x+Math.cos(a)*8,ny=player.y+Math.sin(a)*8;if(blocked(nx,ny,player.r))break;player.x=nx;player.y=ny;
      if(s.mult)monsters.forEach(m=>{if(m.state!=='dead'&&!hitSet.has(m)&&dist(player.x,player.y,m.x,m.y)<34+m.r){hitSet.add(m);hitMonster(m,Math.round(dmg),{kb:14});}});
      if(k%2===0)parts.push({x:player.x,y:player.y-10,vx:rnd(-20,20),vy:rnd(-20,20),g:0,t:0,life:.3,size:3,col:s.col||'#ffb347',glow:true});}
    moveTarget=null;combatTarget=null;
  }else if(s.type==='blink'){
    sfx('blink');burst(player.x,player.y-12,14,'#8b3ff2',120,true,0);
    let d=Math.min(s.dist,dist(player.x,player.y,wx,wy)),tx=player.x+Math.cos(a)*d,ty=player.y+Math.sin(a)*d;
    for(let k=0;k<30&&blocked(tx,ty,player.r);k++){tx-=Math.cos(a)*9;ty-=Math.sin(a)*9;}
    if(!blocked(tx,ty,player.r)){player.x=tx;player.y=ty;}
    burst(player.x,player.y-12,14,'#6a9aff',120,true,0);moveTarget=null;
  }else if(s.type==='buff'){
    sfx('level');player.buffT=s.dur;banner('БОЕВОЙ КЛИЧ!');
    fx.push({kind:'ring',x:player.x,y:player.y,r0:10,r1:90,t:0,dur:.5,col:'#e8c15a'});
  }
}
function usePotion(k){
  if(player.potCd>0||player.dead)return;
  if(k==='hp'){if(player.potions.hp<=0){sfx('error');toast('Нет зелий здоровья');return;}if(player.hp>=player.maxhp)return;player.potions.hp--;player.hp=Math.min(player.maxhp,player.hp+Math.round(player.maxhp*.45));burst(player.x,player.y-16,10,'#ff5a4a',80,true,-30);}
  else{if(player.potions.mp<=0){sfx('error');toast('Нет зелий маны');return;}if(player.mp>=player.maxmp)return;player.potions.mp--;player.mp=Math.min(player.maxmp,player.mp+Math.round(player.maxmp*.5));burst(player.x,player.y-16,10,'#6a9aff',80,true,-30);}
  player.potCd=.5;sfx('potion');
}
function hitMonster(m,dmg,opts={}){
  if(m.state==='dead')return;
  const crit=opts.crit||false;
  m.hp-=dmg;m.hitT=.13;m.state='chase';
  if(opts.kb){const a=Math.atan2(m.y-player.y,m.x-player.x);moveEnt(m,Math.cos(a)*opts.kb,Math.sin(a)*opts.kb);}
  if(opts.frost)m.slowT=2.5;
  addFloat(m.x+rnd(-8,8),m.y-m.r*3,crit?dmg+'!':''+dmg,crit?'#ffb347':'#fff',crit?17:13);
  burst(m.x,m.y-m.r,6,m.undead?'#cfc6a8':'#8a1020',110);
  sfx(crit?'crit':'hit');
  if(m.hp<=0)killMonster(m);
}
function addFloat(x,y,txt,col,size=13){floats.push({x,y,txt,col,size,t:0,dur:.95});}
function burst(x,y,n,col,spd=120,glow=false,g=260){for(let i=0;i<n;i++){const a=rnd(0,TAU),s=rnd(spd*.3,spd);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-spd*.3,g,t:0,life:rnd(.3,.7),size:rnd(2,4),col,glow});}}
function addDecal(x,y,type,col){
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  if(type==='blood'){g.fillStyle=col;for(let i=0;i<7;i++){g.globalAlpha=rnd(.3,.7);g.beginPath();g.arc(32+rnd(-16,16),32+rnd(-12,12),rnd(3,9),0,TAU);g.fill();}}
  else if(type==='scorch'){g.fillStyle='rgba(10,8,6,.6)';g.beginPath();g.arc(32,32,22,0,TAU);g.fill();g.fillStyle='rgba(255,122,26,.25)';g.beginPath();g.arc(32,32,12,0,TAU);g.fill();}
  else{g.fillStyle='#cfc6a8';for(let i=0;i<6;i++){g.save();g.translate(32+rnd(-14,14),32+rnd(-10,10));g.rotate(rnd(0,TAU));g.fillRect(-6,-1,12,2);g.restore();}}
  decals.push({x,y,cv:c});if(decals.length>140)decals.shift();
}
function shake(mag,dur){shakeMag=Math.max(shakeMag,mag);shakeT=Math.max(shakeT,dur);}
function update(dt){
  time+=dt;
  torches.forEach(t=>{if(chance(dt*2))parts.push({x:t.x+rnd(-3,3),y:t.y-30,vx:rnd(-8,8),vy:rnd(-35,-15),g:-20,t:0,life:rnd(.5,1),size:rnd(1,2.5),col:'#ffb347',glow:true});});
  if(state==='title'){cam.x=19.5*T+Math.sin(time*.13)*90;cam.y=70*T+Math.cos(time*.1)*60;updateAmbient(dt);return;}
  if(state!=='play'||dialogNpc||charOpen)return;
  playT+=dt;saveAcc+=dt;if(saveAcc>8){saveAcc=0;saveGame();}
  portalCd=Math.max(0,portalCd-dt);
  player.cds=player.cds.map(c=>Math.max(0,c-dt));
  player.potCd=Math.max(0,player.potCd-dt);
  player.invulnT=Math.max(0,player.invulnT-dt);player.hitT=Math.max(0,player.hitT-dt);
  player.buffT=Math.max(0,player.buffT-dt);player.atkT=Math.max(0,player.atkT-dt);
  hurtT=Math.max(0,hurtT-dt);shakeT=Math.max(0,shakeT-dt);
  player.mp=Math.min(player.maxmp,player.mp+(3+player.level*.3)*dt);
  player.hp=Math.min(player.maxhp,player.hp+(inTown(player.x,player.y)?2:.4)*dt);
  if(combatTarget&&combatTarget.state==='dead')combatTarget=null;
  let mx=0,my=0;
  if(keys.KeyW||keys.ArrowUp)my--;if(keys.KeyS||keys.ArrowDown)my++;if(keys.KeyA||keys.ArrowLeft)mx--;if(keys.KeyD||keys.ArrowRight)mx++;
  if(mx||my){moveTarget=null;combatTarget=null;const l=Math.hypot(mx,my);moveEnt(player,mx/l*player.speed*dt,my/l*player.speed*dt);player.anim='run';if(mx)player.face=mx<0?-1:1;}
  else if(combatTarget&&combatTarget.state!=='dead'){
    const m=combatTarget,d=dist(player.x,player.y,m.x,m.y),s=SK[CLASSES[classId].skills[0]];
    const rng=(s.range||62)*.85;
    player.face=m.x<player.x?-1:1;
    if(d>rng){const a=Math.atan2(m.y-player.y,m.x-player.x);moveEnt(player,Math.cos(a)*player.speed*dt,Math.sin(a)*player.speed*dt);player.anim='run';}
    else{player.anim='idle';castSkill(0);}
  }else if(moveTarget){
    const d=dist(player.x,player.y,moveTarget.x,moveTarget.y);
    if(d<8){moveTarget=null;player.stuckT=0;}
    else{
      const a=Math.atan2(moveTarget.y-player.y,moveTarget.x-player.x);
      const sp=player.speed*dt,ox=player.x,oy=player.y;
      moveEnt(player,Math.cos(a)*sp,Math.sin(a)*sp);
      let moved=dist(player.x,player.y,ox,oy);
      if(moved<sp*.3){
        const side=player.slideSide||1,pa=a+side*Math.PI/2;
        moveEnt(player,Math.cos(pa)*sp,Math.sin(pa)*sp);
        moved=dist(player.x,player.y,ox,oy);
        if(moved<sp*.3){
          player.slideSide=-side;const pb=a-side*Math.PI/2;
          moveEnt(player,Math.cos(pb)*sp,Math.sin(pb)*sp);
          moved=dist(player.x,player.y,ox,oy);
        }
      }else player.slideSide=1;
      if(moved<sp*.15){player.stuckT=(player.stuckT||0)+dt;if(player.stuckT>.6){moveTarget=null;player.stuckT=0;}}
      else player.stuckT=0;
      player.anim='run';player.face=Math.cos(a)<0?-1:1;
    }
  }else player.anim=player.atkT>0?'attack':'idle';
  if(player.atkT>0)player.anim='attack';
  player.animT+=dt;
  if(mouse.down&&!dialogNpc){
    const wx=mouse.x+cam.x-VW/2,wy=mouse.y+cam.y-VH/2;
    const m=monsterAt(wx,wy);
    if(m){combatTarget=m;moveTarget=null;}
    else if(!combatTarget){moveTarget={x:wx,y:wy};}
  }
  portals.forEach((p,i)=>{
    if(portalCd<=0&&dist(player.x,player.y,p.x,p.y)<30){
      if(i===0&&Q.q3!=='active'&&Q.q3!=='ready'&&Q.q3!=='done'){toast('Врата запечатаны. Поговорите с жрицей Эланой.');portalCd=1.2;sfx('error');return;}
      const q=portals[p.to];fadeT=1;portalCd=1.2;sfx('portal');
      player.x=q.x;player.y=q.y+(p.to===1?-20:20);moveTarget=null;combatTarget=null;
      cam.x=player.x;cam.y=player.y;
    }
  });
  for(let i=loot.length-1;i>=0;i--){const l=loot[i];l.bob+=dt;
    const d=dist(player.x,player.y,l.x,l.y);
    if(l.kind==='gold'&&d<80){const a=Math.atan2(player.y-l.y,player.x-l.x);l.x+=Math.cos(a)*220*dt;l.y+=Math.sin(a)*220*dt;}
    if(d<26){if(pickup(l))loot.splice(i,1);}}
  monsters.forEach(m=>updateMonster(m,dt));
  for(let i=0;i<monsters.length;i++)for(let j=i+1;j<monsters.length;j++){
    const a=monsters[i],b=monsters[j];if(a.state==='dead'||b.state==='dead')continue;
    const d=dist(a.x,a.y,b.x,b.y),min=a.r+b.r;
    if(d<min&&d>0){const push=(min-d)*.5,ax=(a.x-b.x)/d,ay=(a.y-b.y)/d;moveEnt(a,ax*push,ay*push);moveEnt(b,-ax*push,-ay*push);}
  }
  monsters=monsters.filter(m=>!(m.state==='dead'&&m.dieT>1));
  // Респаун в духе Diablo: внутри одной сессии убитые монстры не возвращаются.
  // Мир обновляется при новом заходе в игру (загрузка сохранения пересоздаёт монстров).
  for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    p.sndT=(p.sndT||0)-dt;if(p.sndT<=0){p.sndT=.28;flySfx(p.type);}
    if(p.type==='fire'||p.type==='firebig')parts.push({x:p.x,y:p.y,vx:rnd(-15,15),vy:rnd(-15,15),g:0,t:0,life:.25,size:p.type==='firebig'?5:3,col:'#ff7a1a',glow:true});
    if(p.type==='poison'&&chance(.5))parts.push({x:p.x,y:p.y,vx:rnd(-10,10),vy:rnd(-10,10),g:0,t:0,life:.3,size:3,col:'#7fd421',glow:true});
    let dead=p.life<=0||blocked(p.x,p.y,3);
    if(p.from==='p'){for(const m of monsters){if(m.state==='dead')continue;if(dist(p.x,p.y,m.x,m.y-m.r)<p.r+m.r){hitMonster(m,p.dmg,{crit:p.crit});dead=true;break;}}}
    else if(dist(p.x,p.y,player.x,player.y-12)<p.r+player.r){playerHit(p.dmg);dead=true;}
    if(dead){
      if(p.aoe){sfx('boom');shake(6,.25);addDecal(p.x,p.y,'scorch');burst(p.x,p.y,22,'#ff7a1a',200,true,60);fx.push({kind:'ring',x:p.x,y:p.y,r0:8,r1:p.aoe,t:0,dur:.35,col:'#ff7a1a'});
        if(p.from==='p')monsters.forEach(m=>{if(m.state!=='dead'&&dist(p.x,p.y,m.x,m.y)<p.aoe+m.r)hitMonster(m,Math.round(p.dmg*.8));});}
      if(p.puddle||p.type==='poison'){fx.push({kind:'puddle',x:p.x,y:p.y,r:46,t:0,dur:4,dps:p.dmg*.4,col:'#7fd421'});}
      if(p.type==='fire'||p.type==='firebig')burst(p.x,p.y,8,'#ffb347',120,true,40);
      projs.splice(i,1);
    }
  }
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;
    if(f.kind==='puddle'){if(dist(player.x,player.y,f.x,f.y)<f.r&&Math.floor(f.t*2)!==Math.floor((f.t-dt)*2))playerHit(f.dps);
      if(chance(dt*6))parts.push({x:f.x+rnd(-f.r*.7,f.r*.7),y:f.y+rnd(-f.r*.4,f.r*.4),vx:0,vy:-20,g:0,t:0,life:.5,size:2.5,col:'#a8e85a',glow:true});}
    if(f.kind==='tele'&&f.t>=f.dur){
      if(dist(player.x,player.y,f.x,f.y)<f.r)playerHit(f.dmg);
      shake(9,.35);sfx('boom');burst(f.x,f.y,24,'#cfc6a8',200,true,100);
      fx.push({kind:'ring',x:f.x,y:f.y,r0:10,r1:f.r,t:0,dur:.3,col:'#ff3a2a'});
    }
    if(f.t>=f.dur)fx.splice(i,1);
  }
  updateAmbient(dt);
  for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.t+=dt;f.y-=34*dt;if(f.t>=f.dur)floats.splice(i,1);}
  cam.x=lerp(cam.x,player.x,1-Math.pow(.001,dt));cam.y=lerp(cam.y,player.y,1-Math.pow(.001,dt));
  barkAcc+=dt;if(barkAcc>11){barkAcc=0;const n=npcs[irnd(0,3)];const lines={elder:['Свет хранит нас…','Мёртвые не должны бродить.'],smith:['Сталь не лжёт.','Огонь готов.'],priest:['Я чувствую тьму на востоке…','Вера — наш щит.'],merchant:['Зелья! Свежие зелья!','Золото вперёд!']};addFloat(n.x,n.y-84,lines[n.id][irnd(0,1)],'#e6d8b8',11);}
  const near=nearestInteract();
  const hint=$('#interactHint');
  if(near){hint.style.display='block';hint.textContent=near.kind==='npc'?'F — говорить: '+near.obj.n:'F — открыть сундук';}
  else hint.style.display='none';
}
function updateAmbient(dt){
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;if(p.t>=p.life)parts.splice(i,1);}
  if(parts.length>420)parts.splice(0,parts.length-420);
}
function monsterAt(x,y){let best=null,bd=34;monsters.forEach(m=>{if(m.state==='dead')return;const d=dist(x,y,m.x,m.y-m.r);if(d<bd){bd=d;best=m;}});return best;}
function nearestInteract(){
  let best=null,bd=78;
  npcs.forEach(n=>{const d=dist(player.x,player.y,n.x,n.y);if(d<bd){bd=d;best={kind:'npc',obj:n};}});
  chests.forEach(c=>{if(c.opened)return;const d=dist(player.x,player.y,c.x,c.y);if(d<bd){bd=d;best={kind:'chest',obj:c};}});
  return best;
}
function interact(){
  const n=nearestInteract();if(!n)return;
  if(n.kind==='npc'){n.obj.face=player.x<n.obj.x?-1:1;openDialog(n.obj);}
  else{const c=n.obj;c.opened=true;sfx('chest');burst(c.x,c.y-10,16,'#e8c15a',140,true,60);
    const g=irnd(20,60);loot.push({x:c.x,y:c.y+16,kind:'gold',amount:g,bob:0});
    loot.push({x:c.x-14,y:c.y+18,kind:chance(.5)?'hp':'mp',bob:0});
    if(chance(.6))loot.push({x:c.x+14,y:c.y+18,kind:'equip',eq:genEquip(chance(.4)?3:2),bob:0});
    if(Q.q2==='active'&&qprog.q2<3&&chance(.5))loot.push({x:c.x,y:c.y+26,kind:'shard',bob:0});
    toast('Сундук открыт!');}
}
function updateMonster(m,dt){
  m.animT+=dt;m.hitT=Math.max(0,m.hitT-dt);m.slowT=Math.max(0,m.slowT-dt);
  if(m.state==='dead'){m.dieT+=dt;return;}
  m.cd=Math.max(0,m.cd-dt);
  const spd=m.spd*(m.slowT>0?.5:1)*(m.boss&&m.hp<m.maxhp*.33?1.35:1);
  const dp=dist(m.x,m.y,player.x,player.y);
  const playerSafe=inTown(player.x,player.y)||player.dead;
  if(m.boss){
    m.novaT-=dt;
    if(m.novaT<=0&&dp<m.aggro&&!playerSafe){m.novaT=6;sfx('roar');
      for(let k=0;k<12;k++){const a=k/12*TAU;projs.push({x:m.x,y:m.y-20,vx:Math.cos(a)*260,vy:Math.sin(a)*260,r:7,dmg:m.dmg*.7,type:'bone',from:'m',life:1.6,sndT:0});}
      fx.push({kind:'ring',x:m.x,y:m.y,r0:20,r1:150,t:0,dur:.5,col:'#8b3ff2'});}
    if(!m.summoned66&&m.hp<m.maxhp*.66){m.summoned66=true;summon(m);}
    if(!m.summoned33&&m.hp<m.maxhp*.33){m.summoned33=true;summon(m);banner('ВЛАДЫКА В ЯРОСТИ');}
  }
  if(m.state==='idle'){
    m.wanderT-=dt;
    if(m.wanderT<=0){m.wanderT=rnd(1.5,4);const a=rnd(0,TAU);m.wx=Math.cos(a);m.wy=Math.sin(a);if(chance(.4)){m.wx=0;m.wy=0;}}
    if(m.wx||m.wy){moveEnt(m,m.wx*spd*.35*dt,m.wy*spd*.35*dt);m.anim='run';if(m.wx)m.face=m.wx<0?-1:1;}else m.anim='idle';
    if(dp<m.aggro&&!playerSafe){m.state='chase';sfx('growl');}
  }else if(m.state==='chase'){
    if(playerSafe||dist(m.x,m.y,m.home.x,m.home.y)>560){m.state='return';return;}
    m.face=player.x<m.x?-1:1;
    if(m.ranged){
      if(dp<m.range*.5){const a=Math.atan2(m.y-player.y,m.x-player.x);moveEnt(m,Math.cos(a)*spd*dt,Math.sin(a)*spd*dt);m.anim='run';}
      else if(dp>m.range*.9){const a=Math.atan2(player.y-m.y,player.x-m.x);moveEnt(m,Math.cos(a)*spd*dt,Math.sin(a)*spd*dt);m.anim='run';}
      else m.anim='idle';
      if(dp<m.range&&m.cd<=0){m.cd=m.atkCd;m.atkT=.35;m.animT=0;
        sfx(m.ranged==='poison'?'spit':'throw');
        const a=Math.atan2(player.y-12-m.y+14,player.x-m.x);
        projs.push({x:m.x,y:m.y-14,vx:Math.cos(a)*300,vy:Math.sin(a)*300,r:6,dmg:m.dmg,type:m.ranged,from:'m',life:1.4,puddle:m.ranged==='poison',sndT:0});}
    }else{
      if(dp>m.range*.8){const a=Math.atan2(player.y-m.y,player.x-m.x);moveEnt(m,Math.cos(a)*spd*dt,Math.sin(a)*spd*dt);m.anim='run';}
      else{m.anim='idle';if(m.cd<=0){m.cd=m.atkCd;m.atkT=.3;m.animT=0;
        if(m.boss&&chance(.4)){m.slamX=player.x;m.slamY=player.y;fx.push({kind:'tele',x:m.slamX,y:m.slamY,r:80,t:0,dur:.75,dmg:m.dmg*1.4});sfx('growl');}
        else{sfx('swing');playerHit(m.dmg);burst(player.x,player.y-12,5,'#cfc6a8',90);}
      }}
    }
  }else if(m.state==='return'){
    const d=dist(m.x,m.y,m.home.x,m.home.y);
    if(d<20){m.state='idle';m.hp=Math.min(m.maxhp,m.hp+m.maxhp*.3);}
    else{const a=Math.atan2(m.home.y-m.y,m.home.x-m.x);moveEnt(m,Math.cos(a)*spd*dt,Math.sin(a)*spd*dt);m.anim='run';m.face=Math.cos(a)<0?-1:1;}
  }
  if(m.atkT>0){m.atkT-=dt;m.anim='attack';}
}
