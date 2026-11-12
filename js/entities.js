"use strict";
// ===== Сущности: игрок, монстры, лут, снаряжение, прогресс =====
function newPlayer(){
  const c=CLASSES[classId];
  return{x:SPAWN.x,y:SPAWN.y,r:13,face:1,anim:'idle',animT:0,atkT:0,stuckT:0,slideSide:1,
    hp:c.hp,maxhp:c.hp,mp:c.mp,maxmp:c.mp,baseDmg:c.dmg,level:1,xp:0,gold:60,
    potions:{hp:3,mp:2},potCd:0,cds:[0,0,0,0],equip:{weapon:null,armor:null,ring:null},bag:[],
    buffT:0,invulnT:0,hitT:0,speed:178,crit:.08,light:400,dead:false};
}
function pDmg(){let d=player.baseDmg+player.level*2;if(player.equip.weapon)d+=player.equip.weapon.dmg||0;if(player.equip.ring)d+=player.equip.ring.dmg||0;if(player.buffT>0)d*=1.5;return d;}
function pDef(){return player.equip.armor?(player.equip.armor.def||0):0;}
function pCrit(){return player.crit+(player.equip.ring?(player.equip.ring.crit||0)/100:0);}
function xpNeed(l){return Math.floor(50*Math.pow(l,1.55));}
function initWorld(){
  genMap();
  monsters=[];loot=[];projs=[];parts=[];decals=[];fx=[];floats=[];spawners=[];
  npcs=NPCS.map(n=>({...n,x:n.x*T+T/2,y:n.y*T+T/2,r:14,face:1,animT:rnd(0,9)}));
  player=newPlayer();
  Q={q1:'avail',q2:'locked',q3:'locked'};qprog={q1:0,q2:0,q3:0};q2Pity=0;
  stats={kills:0,deaths:0,goldEarned:0};playT=0;
  moveTarget=null;combatTarget=null;dialogNpc=null;charOpen=false;hoverLoot=null;
  const S=(x,y,type,count,rad,lvl)=>spawners.push({x:x*T,y:y*T,type,count,rad,lvl,timer:0,alive:0});
  S(24,26,'imp',8,7*T,2);S(20,18,'shaman',3,6*T,2);
  S(52,46,'zombie',6,8*T,3);S(58,50,'skeleton',6,8*T,3);
  S(74,66,'spitter',5,7*T,4);S(70,72,'zombie',3,6*T,4);
  S(80,14,'skeleton',6,7*T,5);
  S(24,44,'imp',3,4*T,1);S(38,52,'zombie',3,4*T,2);
  spawners.forEach(s=>{for(let i=0;i<s.count;i++)spawnFrom(s,true);});
  spawnMonster('boss',81*T,12*T,6,null);
  cam.x=player.x;cam.y=player.y;
  refreshTracker();buildSkillbar();
}
function spawnFrom(s,initial){
  for(let t=0;t<24;t++){
    const a=rnd(0,TAU),r=rnd(0,s.rad),x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;
    if(blocked(x,y,14)||inTown(x,y))continue;
    if(!initial&&dist(x,y,player.x,player.y)<320)continue;
    spawnMonster(s.type,x,y,s.lvl,s);return;
  }
}
function spawnMonster(type,x,y,lvl,spawner){
  const b=MT[type],D=DIFFS[diff],sc=1+(lvl-1)*.16;
  const m={type,n:b.n,x,y,home:{x,y},r:b.r,lvl,spr:SPR[b.spr],scale:b.scale,face:1,
    hp:Math.round(b.hp*sc*D.hp),maxhp:Math.round(b.hp*sc*D.hp),dmg:b.dmg*sc*D.dmg,spd:b.spd,
    xp:Math.round(b.xp*sc*D.xp),range:b.range,atkCd:b.atkCd,aggro:b.aggro,undead:!!b.undead,ranged:b.ranged,boss:!!b.boss,
    state:'idle',animT:rnd(0,9),atkT:0,cd:rnd(0,1),hitT:0,slowT:0,wanderT:rnd(0,3),wx:0,wy:0,
    dieT:0,spawner,novaT:5,summoned66:false,summoned33:false,slamX:0,slamY:0};
  monsters.push(m);if(spawner)spawner.alive++;
  if(m.boss&&state==='play'){sfx('roar');banner('ВЛАДЫКА КОСТЕЙ ПРОБУДИЛСЯ');}
  return m;
}
// ===== Снаряжение =====
function genEquip(tier,slot){
  slot=slot||['weapon','armor','ring'][irnd(0,2)];
  const lv=player?player.level:1;
  const e={slot,tier,name:EQ_BASE[slot][irnd(0,2)]};
  if(tier>=2)e.name=EQ_PRE[irnd(1,4)]+' '+e.name.toLowerCase();
  if(tier>=3)e.name+=' '+EQ_SUF[irnd(0,4)];
  if(slot==='weapon')e.dmg=Math.round(rnd(3,6)+lv*1.2+tier*3);
  if(slot==='armor'){e.def=Math.round(rnd(3,6)+lv+tier*3);e.hp=Math.round(rnd(4,10)*tier);}
  if(slot==='ring'){e.crit=Math.round(rnd(2,4)*tier);e.mp=Math.round(rnd(4,10)*tier);if(tier>=2)e.dmg=Math.round(rnd(1,3)*tier);}
  return e;
}
function eqScore(e){if(!e)return 0;return(e.dmg||0)*4+(e.def||0)*2+(e.hp||0)+(e.crit||0)*8+(e.mp||0)*.5;}
function eqDesc(e){const p=[];if(e.dmg)p.push('+'+e.dmg+' урон');if(e.def)p.push('+'+e.def+' защита');if(e.hp)p.push('+'+e.hp+' HP');if(e.crit)p.push('+'+e.crit+'% крит');if(e.mp)p.push('+'+e.mp+' мана');return p.join(', ');}
// Положить предмет в сумку; если места нет — бросить под ноги
function giveEquip(e){
  if(player.bag.length<BAG_SIZE){player.bag.push(e);toast('В сумку: <b class="t'+e.tier+'">'+e.name+'</b> ('+eqDesc(e)+')');}
  else{loot.push({x:player.x+rnd(-16,16),y:player.y+rnd(-12,12),kind:'equip',eq:e,bob:rnd(0,9)});toast('Сумка полна — предмет упал на землю');}
}
function equipFromBag(i){
  const e=player.bag[i];if(!e)return;
  const old=player.equip[e.slot];
  player.bag.splice(i,1);
  if(old)player.bag.push(old);
  player.equip[e.slot]=e;recalcStats();sfx('equip');
  toast('Надето: <b class="t'+e.tier+'">'+e.name+'</b>');
  if(charOpen)renderInv();
}
function unequipSlot(slot){
  const old=player.equip[slot];if(!old)return;
  if(player.bag.length>=BAG_SIZE){toast('Сумка полна');sfx('error');return;}
  player.equip[slot]=null;player.bag.push(old);recalcStats();sfx('click');
  if(charOpen)renderInv();
}
function sellFromBag(i){
  const e=player.bag[i];if(!e)return;
  player.bag.splice(i,1);
  const g=8*e.tier;player.gold+=g;stats.goldEarned+=g;sfx('coin');
  toast('Продано: '+e.name+' (+'+g+' 💰)');
  if(charOpen)renderInv();
}
function recalcStats(){
  const c=CLASSES[classId];
  player.maxhp=c.hp+(player.level-1)*14+(player.equip.armor?(player.equip.armor.hp||0):0);
  player.maxmp=c.mp+(player.level-1)*8+(player.equip.ring?(player.equip.ring.mp||0):0);
  player.hp=Math.min(player.hp,player.maxhp);player.mp=Math.min(player.mp,player.maxmp);
  player.light=400+player.level*8;
}
function dropLoot(m){
  const D=DIFFS[diff];
  const g=Math.round(irnd(3,10)*m.lvl*D.gold*(m.boss?12:1));
  loot.push({x:m.x+rnd(-14,14),y:m.y+rnd(-10,10),kind:'gold',amount:g,bob:rnd(0,9)});
  if(chance(m.boss?1:.16))loot.push({x:m.x+rnd(-18,18),y:m.y+rnd(-12,12),kind:chance(.6)?'hp':'mp',bob:rnd(0,9)});
  if(chance(m.boss?1:.09))loot.push({x:m.x+rnd(-18,18),y:m.y+rnd(-12,12),kind:'equip',eq:genEquip(m.boss?3:chance(.2)?3:chance(.5)?2:1),bob:rnd(0,9)});
  if(Q.q2==='active'&&(m.type==='imp'||m.type==='shaman')){
    q2Pity++;
    if(chance(.4)||q2Pity>=5){loot.push({x:m.x,y:m.y-8,kind:'shard',bob:rnd(0,9)});q2Pity=0;}
  }
}
// Возвращает true, если предмет подобран (иначе остаётся лежать)
function pickup(l){
  if(l.kind==='gold'){player.gold+=l.amount;stats.goldEarned+=l.amount;sfx('coin');addFloat(l.x,l.y-14,'+'+l.amount+' 💰','#e8c15a');}
  else if(l.kind==='hp'){player.potions.hp++;sfx('potion');toast('Зелье здоровья +1 (Q)');}
  else if(l.kind==='mp'){player.potions.mp++;sfx('potion');toast('Зелье маны +1 (E)');}
  else if(l.kind==='equip'){
    if(player.bag.length>=BAG_SIZE){if(!l.warned){l.warned=true;toast('Сумка полна — освободите место (C)');sfx('error');}return false;}
    player.bag.push(l.eq);sfx('equip');
    toast('В сумку: <b class="t'+l.eq.tier+'">'+l.eq.name+'</b> — нажмите C, чтобы надеть');
  }
  else if(l.kind==='shard'){qprog.q2=Math.min(3,qprog.q2+1);sfx('quest');addFloat(l.x,l.y-14,'ОСКОЛОК '+qprog.q2+'/3','#ff7a1a',15);questCheck('q2');}
  return true;
}
// ===== Квесты =====
function questCheck(id){
  const q=QUESTS.find(x=>x.id===id);
  if(Q[id]==='active'&&qprog[id]>=q.need){Q[id]='ready';sfx('quest');banner('ЗАДАНИЕ ВЫПОЛНЕНО');toast('Вернитесь: '+NPCS.find(n=>n.id===q.npc).n);}
  refreshTracker();saveGame();
}
function acceptQuest(id){Q[id]='active';sfx('quest');banner('НОВОЕ ЗАДАНИЕ');toast('Принято: «'+QUESTS.find(q=>q.id===id).name+'»');refreshTracker();saveGame();}
function turnIn(id){
  const q=QUESTS.find(x=>x.id===id),r=q.reward;
  Q[id]='done';player.gold+=r.gold||0;stats.goldEarned+=r.gold||0;
  if(r.xp)gainXP(r.xp);
  if(r.hp){player.potions.hp+=r.hp;}
  if(r.eq)giveEquip(genEquip(3,r.eq));
  const i=QUESTS.findIndex(x=>x.id===id);
  if(QUESTS[i+1]){Q[QUESTS[i+1].id]='avail';toast('Новое задание доступно: '+NPCS.find(n=>n.id===QUESTS[i+1].npc).n);}
  sfx('level');banner('ЗАДАНИЕ СДАНО');refreshTracker();saveGame();
  if(r.victory)setTimeout(showVictory,600);
}
// ===== Бой: общие события =====
function killMonster(m){
  m.state='dead';m.dieT=0;m.animT=0;
  if(m.spawner)m.spawner.alive--;
  stats.kills++;gainXP(m.xp);dropLoot(m);
  addDecal(m.x,m.y,m.undead?'bones':'blood',m.type==='imp'?'#7a1a12':'#5a0810');
  burst(m.x,m.y-m.r,10,'#8b3ff2',60,true,-40);
  sfx('growl');
  if(m.undead&&Q.q1==='active'){qprog.q1++;questCheck('q1');}
  if(m.boss){qprog.q3=1;questCheck('q3');banner('ВЛАДЫКА КОСТЕЙ ПОВЕРЖЕН');shake(14,.6);sfx('boom');
    loot.push({x:m.x,y:m.y,kind:'equip',eq:genEquip(3,'weapon'),bob:0});}
}
function playerHit(dmg,src){
  if(player.invulnT>0||player.dead||state!=='play')return;
  const red=pDef()/(pDef()+60);
  const d=Math.max(1,Math.round(dmg*(1-red)));
  player.hp-=d;player.invulnT=.3;player.hitT=.15;hurtT=.5;
  addFloat(player.x,player.y-40,'-'+d,'#ff5a4a',15);
  burst(player.x,player.y-14,7,'#c01a20',130);
  shake(6,.25);sfx('hurt');
  if(player.hp<=0){player.hp=0;player.dead=true;die();}
}
function gainXP(n){
  player.xp+=n;addFloat(player.x,player.y-52,'+'+n+' опыта','#8b3ff2',12);
  while(player.xp>=xpNeed(player.level)&&player.level<12){
    player.xp-=xpNeed(player.level);player.level++;
    recalcStats();player.hp=player.maxhp;player.mp=player.maxmp;
    sfx('level');banner('УРОВЕНЬ '+player.level+'!');
    burst(player.x,player.y-16,26,'#e8c15a',160,true,-60);
    fx.push({kind:'ring',x:player.x,y:player.y,r0:10,r1:120,t:0,dur:.7,col:'#e8c15a'});
    UNLOCK.forEach((lv,i)=>{if(lv===player.level)toast('Открыт навык: '+SK[CLASSES[classId].skills[i]].n+' ['+(i+1)+']');});
    buildSkillbar();
  }
  saveGame();
}
function die(){
  state='dead';sfx('die');shake(12,.6);
  $('#deathStats').innerHTML='<div>Уровень<b>'+player.level+'</b></div><div>Убито чудовищ<b>'+stats.kills+'</b></div><div>Золото потеряно<b>'+Math.round(player.gold*.15)+' 💰</b></div><div>Время<b>'+fmtTime(playT)+'</b></div>';
  $('#deathScreen').classList.add('open');saveGame();
}
function respawn(){
  player.gold=Math.round(player.gold*.85);
  player.dead=false;player.hp=player.maxhp;player.mp=player.maxmp;
  player.x=SPAWN.x;player.y=SPAWN.y;player.invulnT=2;player.stuckT=0;
  monsters.forEach(m=>{if(m.state!=='dead'){m.hp=m.maxhp;m.x=m.home.x;m.y=m.home.y;m.state='idle';}});
  projs=[];fx=fx.filter(f=>f.kind!=='puddle'&&f.kind!=='tele');
  $('#deathScreen').classList.remove('open');state='play';cam.x=player.x;cam.y=player.y;
  toast('Вы воскресли в Очаге. Свет хранит вас.');
}
function summon(m){
  sfx('roar');banner('ВЛАДЫКА ПРИЗЫВАЕТ СЛУГ');
  for(let k=0;k<3;k++){const a=rnd(0,TAU);const x=m.x+Math.cos(a)*70,y=m.y+Math.sin(a)*70;
    if(!blocked(x,y,13)&&monsters.length<75){spawnMonster('skeleton',x,y,5,null);burst(x,y-10,10,'#8b3ff2',100,true,0);}}
}
