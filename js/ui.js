"use strict";
// ===== Интерфейс: HUD, инвентарь, тултипы, диалоги, сохранения =====
function buildSkillbar(){
  const bar=$('#skillbar');bar.innerHTML='';
  CLASSES[classId].skills.forEach((sid,i)=>{
    const s=SK[sid],b=document.createElement('button');b.className='slot';b.title=s.n+(s.mana?' · '+s.mana+' маны':'');
    b.innerHTML='<span class="key">'+(i+1)+'</span>'+s.icon+'<div class="cd"></div>'+(player&&player.level<UNLOCK[i]?'<div class="lock">Ур. '+UNLOCK[i]+'</div>':'');
    b.onclick=()=>castSkill(i);bar.appendChild(b);
  });
  const ph=document.createElement('button');ph.className='slot pot hp';ph.title='Зелье здоровья (Q)';ph.innerHTML='<span class="key">Q</span>🧪<span class="cnt" id="potHpCnt">0</span>';ph.onclick=()=>usePotion('hp');bar.appendChild(ph);
  const pm=document.createElement('button');pm.className='slot pot mp';pm.title='Зелье маны (E)';pm.innerHTML='<span class="key">E</span>🔷<span class="cnt" id="potMpCnt">0</span>';pm.onclick=()=>usePotion('mp');bar.appendChild(pm);
}
function refreshHUD(){
  if(!player)return;
  $('#hpFill').style.height=(player.hp/player.maxhp*100)+'%';
  $('#mpFill').style.height=(player.mp/player.maxmp*100)+'%';
  $('#hpText').textContent=Math.ceil(player.hp)+' / '+player.maxhp;
  $('#mpText').textContent=Math.ceil(player.mp)+' / '+player.maxmp;
  $('#lvlBadge').textContent=player.level;
  $('#xpFill').style.width=(player.xp/xpNeed(player.level)*100)+'%';
  $('#goldText').textContent='💰 '+player.gold;
  $('#zoneName').textContent=zoneAt(player.x,player.y).name;
  const slots=$('#skillbar').querySelectorAll('.slot:not(.pot)');
  slots.forEach((sl,i)=>{const s=SK[CLASSES[classId].skills[i]];sl.querySelector('.cd').style.height=(player.cds[i]/s.cd*100)+'%';});
  const ph=$('#potHpCnt'),pm=$('#potMpCnt');if(ph)ph.textContent=player.potions.hp;if(pm)pm.textContent=player.potions.mp;
}
// ===== Тултип предмета со сравнением в процентах =====
function eqTooltipHTML(e,compare){
  let h='<div class="tn t'+e.tier+'">'+EQ_ICON[e.slot]+' '+e.name+'</div>';
  h+='<div class="ts">'+EQ_SLOT_NAME[e.slot]+' · '+(e.tier===3?'РЕДКИЙ':e.tier===2?'МАГИЧЕСКИЙ':'ОБЫЧНЫЙ')+'</div>';
  const old=compare&&player?player.equip[e.slot]:null;
  const keys2=['dmg','def','hp','crit','mp'].filter(k=>(e[k]||0)||(old&&old[k]));
  keys2.forEach(k=>{
    const nv=e[k]||0,ov=old?(old[k]||0):0;
    h+='<div class="st">'+EQ_STAT_LABEL[k]+': <b>'+nv+'</b>';
    if(compare){
      if(!old)h+=' <span class="cmp-new">(сейчас пусто)</span>';
      else if(ov===0&&nv>0)h+=' <span class="cmp-new">(новое свойство)</span>';
      else if(nv!==ov){const pct=Math.round((nv-ov)/Math.max(1,Math.abs(ov))*100);
        h+=' <span class="'+(pct>0?'cmp-up':'cmp-dn')+'">('+(pct>0?'+':'')+pct+'% · было '+ov+')</span>';}
      else h+=' <span style="color:#7a8498">(как надетое)</span>';
    }
    h+='</div>';
  });
  if(compare){
    const ns=eqScore(e),os=eqScore(old);
    if(!old)h+='<div class="sum">Суммарно: лучше пустого слота — берите!</div>';
    else if(ns!==os){const pct=Math.round((ns-os)/Math.max(1,os)*100);
      h+='<div class="sum">Суммарно: <span class="'+(pct>0?'cmp-up':'cmp-dn')+'">'+(pct>0?'+':'')+pct+'%</span> к надетому ('+EQ_SLOT_NAME[e.slot].toLowerCase()+')</div>';}
    else h+='<div class="sum">Суммарно: равноценно надетому</div>';
  }
  return h;
}
function showTooltip(html,cx,cy){
  const t=$('#tooltip');t.innerHTML=html;t.style.display='block';
  const r=t.getBoundingClientRect();
  let x=cx+16,y=cy+12;
  if(x+r.width>innerWidth-8)x=cx-r.width-12;
  if(y+r.height>innerHeight-8)y=innerHeight-r.height-8;
  t.style.left=x+'px';t.style.top=y+'px';
}
function hideTooltip(){$('#tooltip').style.display='none';}
function updateHoverLoot(){
  if(state!=='play'){hoverLoot=null;hideTooltip();return;}
  if(charOpen||dialogNpc){hoverLoot=null;return;}
  const wx=mouse.x+cam.x-VW/2,wy=mouse.y+cam.y-VH/2;
  let best=null,bd=26;
  loot.forEach(l=>{if(l.kind!=='equip')return;const d=dist(wx,wy,l.x,l.y);if(d<bd){bd=d;best=l;}});
  if(best){hoverLoot=best;showTooltip(eqTooltipHTML(best.eq,true),mouse.x,mouse.y);}
  else{hoverLoot=null;hideTooltip();}
}
// ===== Панель героя и инвентаря =====
function renderInv(){
  const c=CLASSES[classId];
  $('#charStats').innerHTML=
    '<div>Класс <span>'+c.n+'</span></div><div>Уровень <span>'+player.level+'</span></div><div>Золото <span>'+player.gold+' 💰</span></div>'+
    '<div>Урон <span>'+Math.round(pDmg())+'</span></div><div>Защита <span>'+pDef()+'</span></div><div>Крит <span>'+Math.round(pCrit()*100)+'%</span></div>'+
    '<div>Здоровье <span>'+Math.ceil(player.hp)+' / '+player.maxhp+'</span></div><div>Мана <span>'+Math.ceil(player.mp)+' / '+player.maxmp+'</span></div><div>Сложность <span>'+DIFFS[diff].n+'</span></div>';
  const es=$('#equipSlots');es.innerHTML='';
  ['weapon','armor','ring'].forEach(slot=>{
    const e=player.equip[slot];
    const d=document.createElement('div');d.className='eqSlot'+(e?'':' empty');
    d.innerHTML='<div class="sl">'+EQ_ICON[slot]+' '+EQ_SLOT_NAME[slot]+'</div>'+
      (e?'<span class="en t'+e.tier+'">'+e.name+'</span><span class="ed">'+eqDesc(e)+'</span>':'<span class="en">— пусто —</span>');
    if(e){
      d.title='Клик — снять в сумку';
      d.onclick=()=>{hideTooltip();unequipSlot(slot);};
      d.onmouseenter=ev=>showTooltip(eqTooltipHTML(e,false),ev.clientX,ev.clientY);
      d.onmousemove=ev=>showTooltip(eqTooltipHTML(e,false),ev.clientX,ev.clientY);
      d.onmouseleave=hideTooltip;
    }
    es.appendChild(d);
  });
  const bg=$('#bagGrid');bg.innerHTML='';
  for(let i=0;i<BAG_SIZE;i++){
    const e=player.bag[i];
    const d=document.createElement('div');
    d.className='bagSlot'+(e?' t'+e.tier:' empty');
    if(e){
      d.innerHTML=EQ_ICON[e.slot];
      d.onclick=()=>{hideTooltip();equipFromBag(i);};
      d.oncontextmenu=ev=>{ev.preventDefault();hideTooltip();sellFromBag(i);};
      d.onmouseenter=ev=>showTooltip(eqTooltipHTML(e,true),ev.clientX,ev.clientY);
      d.onmousemove=ev=>showTooltip(eqTooltipHTML(e,true),ev.clientX,ev.clientY);
      d.onmouseleave=hideTooltip;
    }
    bg.appendChild(d);
  }
}
function toggleCharPanel(open){
  charOpen=open;hideTooltip();
  if(open){renderInv();$('#charPanel').classList.add('open');sfx('click');}
  else $('#charPanel').classList.remove('open');
}
// ===== Тосты и баннеры =====
function toast(html){const t=document.createElement('div');t.className='toast';t.innerHTML=html;$('#toasts').appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .4s';setTimeout(()=>t.remove(),400);},3200);while($('#toasts').children.length>5)$('#toasts').firstChild.remove();}
let bannerT=null;
function banner(txt){const b=$('#banner');b.textContent=txt;b.classList.add('show');clearTimeout(bannerT);bannerT=setTimeout(()=>b.classList.remove('show'),2200);}
// ===== Квестовый трекер =====
function refreshTracker(){
  const el=$('#questList');let h='';
  QUESTS.forEach(q=>{
    if(Q[q.id]==='active'||Q[q.id]==='ready'){
      const p=Math.min(qprog[q.id],q.need),ready=Q[q.id]==='ready';
      h+='<div class="qitem'+(ready?' ready':'')+'"><div class="qn">'+(ready?'✦ ':'◆ ')+q.name+'</div><div class="qp">'+(ready?'Вернитесь к: '+NPCS.find(n=>n.id===q.npc).n:(q.type==='kill'?'Убито: ':'Собрано: ')+p+' / '+q.need+' · '+q.hint)+'</div><div class="qbar"><i style="width:'+(p/q.need*100)+'%"></i></div></div>';
    }
  });
  if(!h)h='<div class="qempty">Поговорите с жителями Очага — у них есть работа для вас.</div>';
  el.innerHTML=h;
}
function npcMarker(n){
  let has=null;
  QUESTS.forEach(q=>{if(q.npc===n.id){if(Q[q.id]==='avail')has='!';else if(Q[q.id]==='ready')has='?';}});
  if(n.id==='merchant'&&!has)has='💰';
  return has;
}
// ===== Диалоги =====
function openDialog(n){
  dialogNpc=n;hideTooltip();$('#dialog').classList.add('open');sfx('click');
  $('#npcName').textContent=n.n;$('#npcRole').textContent=n.role;
  const pc=$('#npcPortrait'),pxc=pc.getContext('2d');pxc.imageSmoothingEnabled=false;pxc.clearRect(0,0,84,84);
  const s=SPR[n.spr].idle;pxc.drawImage(s.cv,0,0,s.w,s.h,8,6,68,68);
  renderDialog();
}
function closeDialog(){dialogNpc=null;$('#dialog').classList.remove('open');}
function dlgBtn(txt,fn,primary){const b=document.createElement('button');b.className='gbtn'+(primary?' primary':'');b.textContent=txt;b.onclick=()=>{sfx('click');fn();};$('#dlgButtons').appendChild(b);}
function renderDialog(){
  const n=dialogNpc,body=$('#dlgText'),btns=$('#dlgButtons');btns.innerHTML='';
  if(n.id==='merchant'){
    body.innerHTML='Добро пожаловать, путник! Зелья — свежайшие, цены — честнейшие.<br><br>💰 Ваше золото: <b style="color:var(--gold)">'+player.gold+'</b><br><br><i style="color:#8a94a8">«Говорят, в крипте на северо-востоке кто-то шевелится… Жрица знает больше.»</i>';
    dlgBtn('🧪 Зелье здоровья — 25 💰',()=>{if(player.gold>=25){player.gold-=25;player.potions.hp++;sfx('potion');renderDialog();}else sfx('error');});
    dlgBtn('🔷 Зелье маны — 20 💰',()=>{if(player.gold>=20){player.gold-=20;player.potions.mp++;sfx('potion');renderDialog();}else sfx('error');});
    dlgBtn('Уйти',closeDialog);return;
  }
  const q=QUESTS.find(x=>x.npc===n.id),st=Q[q.id];
  if(st==='locked'){const qi=QUESTS.findIndex(y=>y.id===q.id);const prev=QUESTS[qi-1];body.innerHTML='Терпение, герой. Сначала заверши дело, о котором просил '+(prev?NPCS.find(x=>x.id===prev.npc).n:'старейшина')+'.';dlgBtn('Уйти',closeDialog);return;}
  if(st==='avail'){body.innerHTML='<span class="qname">◆ '+q.name+'</span><br><br>'+q.offer;dlgBtn('Принять задание',()=>{acceptQuest(q.id);renderDialog();},true);dlgBtn('Не сейчас',closeDialog);return;}
  if(st==='active'){body.innerHTML='<span class="qname">◆ '+q.name+'</span><br><br>'+q.active+'<br><br><b style="color:var(--ember2)">Прогресс: '+Math.min(qprog[q.id],q.need)+' / '+q.need+'</b>';dlgBtn('Я скоро вернусь',closeDialog);return;}
  if(st==='ready'){body.innerHTML='<span class="qname">✦ '+q.name+' — выполнено!</span><br><br>'+q.ready+'<br><br><b style="color:var(--gold)">Награда: '+(q.reward.gold?q.reward.gold+' 💰 ':'')+(q.reward.xp?q.reward.xp+' опыта ':'')+(q.reward.hp?'· зелья ×'+q.reward.hp:'')+(q.reward.eq?'· редкий предмет':'')+'</b>';dlgBtn('Сдать задание',()=>{turnIn(q.id);renderDialog();},true);return;}
  body.innerHTML=q.done;dlgBtn('Уйти',closeDialog);
}
// ===== Сохранения =====
function saveGame(){
  if(state==='title'||!player)return;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:2,classId,diff,player:{x:player.x,y:player.y,hp:player.hp,mp:player.mp,level:player.level,xp:player.xp,gold:player.gold,potions:player.potions,equip:player.equip,bag:player.bag},Q,qprog,q2Pity,stats,playT}));}catch(e){}
}
function loadGame(){
  try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(!s||s.v!==2)return false;
    classId=s.classId;diff=s.diff;initWorld();
    Object.assign(player,s.player);player.bag=s.player.bag||[];player.cds=[0,0,0,0];player.dead=false;player.invulnT=1;player.stuckT=0;
    Q=s.Q;qprog=s.qprog;q2Pity=s.q2Pity||0;stats=s.stats;playT=s.playT||0;
    recalcStats();
    if(player.hp<=0){player.hp=player.maxhp;player.mp=player.maxmp;player.x=SPAWN.x;player.y=SPAWN.y;}
    player.hp=Math.min(player.hp,player.maxhp);
    if(Q.q3==='ready'||Q.q3==='done')monsters=monsters.filter(m=>!m.boss);
    cam.x=player.x;cam.y=player.y;refreshTracker();buildSkillbar();return true;
  }catch(e){return false;}
}
// ===== Экраны =====
function startPlay(){
  state='play';$('#titleScreen').classList.remove('open');$('#hud').style.display='block';
  audio();ambient();setMute(muted);
  banner('ДОБРО ПОЖАЛОВАТЬ В ОЧАГ');toast('Поговорите со старейшиной Морганом — у него есть задание.');
  saveGame();
}
function showTitle(){
  state='title';$('#hud').style.display='none';hideTooltip();
  ['#pauseScreen','#deathScreen','#victoryScreen','#dialog','#charPanel'].forEach(s=>$(s).classList.remove('open'));
  $('#titleScreen').classList.add('open');
  $('#btnContinue').style.display=localStorage.getItem(SAVE_KEY)?'':'none';
}
function showVictory(){
  state='victory';
  $('#victoryStats').innerHTML='<div>Уровень героя<b>'+player.level+'</b></div><div>Чудовищ убито<b>'+stats.kills+'</b></div><div>Золота добыто<b>'+stats.goldEarned+'</b></div><div>Время похода<b>'+fmtTime(playT)+'</b></div><div>Смертей<b>'+stats.deaths+'</b></div><div>Сложность<b>'+DIFFS[diff].n+'</b></div>';
  $('#victoryScreen').classList.add('open');sfx('level');saveGame();
}
function togglePause(){
  if(state==='play'){state='pause';hideTooltip();$('#pauseDiff').textContent='Сложность: '+DIFFS[diff].n+' · '+CLASSES[classId].n+' '+player.level+' ур.';$('#pauseScreen').classList.add('open');}
  else if(state==='pause'){state='play';$('#pauseScreen').classList.remove('open');}
}
function buildTitle(){
  const cc=$('#classCards');cc.innerHTML='';
  Object.entries(CLASSES).forEach(([id,c])=>{
    const d=document.createElement('div');d.className='ccard'+(id===classId?' sel':'');
    d.innerHTML='<canvas width="84" height="84"></canvas><h3>'+c.n+'</h3><p>'+c.desc+'</p><div class="st">'+c.st+'</div>';
    d.onclick=()=>{classId=id;sfx('click');buildTitle();};
    cc.appendChild(d);
  });
  const dr=$('#diffRow');dr.innerHTML='';
  Object.entries(DIFFS).forEach(([id,d])=>{
    const b=document.createElement('button');b.className='dpill'+(id===diff?' sel':'');b.textContent=d.n;
    b.onclick=()=>{diff=id;sfx('click');buildTitle();};dr.appendChild(b);
  });
}
let prevAcc=0;
function drawPreviews(dt){
  prevAcc+=dt;if(prevAcc<.15)return;prevAcc=0;
  document.querySelectorAll('.ccard').forEach((card,i)=>{
    const id=Object.keys(CLASSES)[i],c=card.querySelector('canvas'),x=c.getContext('2d');
    x.imageSmoothingEnabled=false;x.clearRect(0,0,84,84);
    const s=SPR[CLASSES[id].spr].run,f=Math.floor(time*8)%4;
    x.drawImage(s.cv,f*s.w,0,s.w,s.h,8,8,68,68);
  });
}
