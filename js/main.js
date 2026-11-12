"use strict";
// ===== Ввод, главный цикл и запуск =====
cv.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
cv.addEventListener('mousedown',e=>{
  if(state!=='play'||dialogNpc||charOpen)return;
  audio();
  const wx=e.clientX+cam.x-VW/2,wy=e.clientY+cam.y-VH/2;
  if(e.button===0){
    mouse.down=true;
    const n=npcs.find(n=>dist(wx,wy,n.x,n.y-20)<34);
    if(n&&dist(player.x,player.y,n.x,n.y)<90){openDialog(n);return;}
    const m=monsterAt(wx,wy);
    if(m){combatTarget=m;moveTarget=null;}
    else{combatTarget=null;moveTarget={x:wx,y:wy};fx.push({kind:'ring',x:wx,y:wy,r0:4,r1:18,t:0,dur:.3,col:'#e8c15a'});}
  }else if(e.button===2){castSkill(1);}
});
addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{
  if(e.repeat)return;keys[e.code]=true;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(e.code==='Escape'){
    if(dialogNpc)closeDialog();
    else if(charOpen)toggleCharPanel(false);
    else if(state==='play'||state==='pause')togglePause();
    return;
  }
  if(state!=='play')return;
  if(dialogNpc||charOpen)return;
  if(e.code==='Digit1')castSkill(0);if(e.code==='Digit2')castSkill(1);if(e.code==='Digit3')castSkill(2);if(e.code==='Digit4')castSkill(3);
  if(e.code==='KeyQ')usePotion('hp');if(e.code==='KeyE')usePotion('mp');
  if(e.code==='KeyF')interact();
  if(e.code==='Space')castSkill(0);
  if(e.code==='KeyC')toggleCharPanel(true);
});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('beforeunload',saveGame);
$('#btnStart').onclick=()=>{audio();sfx('click');try{localStorage.removeItem(SAVE_KEY);}catch(e){}initWorld();buildMinimap();startPlay();};
$('#btnContinue').onclick=()=>{audio();sfx('click');if(loadGame()){buildMinimap();startPlay();}else{initWorld();buildMinimap();startPlay();}};
$('#btnResume').onclick=()=>{sfx('click');togglePause();};
$('#btnRestart').onclick=()=>{sfx('click');saveGame();showTitle();};
$('#btnRespawn').onclick=()=>{sfx('click');stats.deaths++;respawn();};
$('#btnContinuePlay').onclick=()=>{sfx('click');$('#victoryScreen').classList.remove('open');state='play';};
$('#btnNewGame').onclick=()=>{sfx('click');try{localStorage.removeItem(SAVE_KEY);}catch(e){}initWorld();buildMinimap();showTitle();};
$('#btnPause').onclick=()=>{sfx('click');togglePause();};
$('#btnChar').onclick=()=>{if(state==='play')toggleCharPanel(true);};
$('#btnCloseChar').onclick=()=>toggleCharPanel(false);
$('#btnSound').onclick=()=>{audio();setMute(!muted);sfx('click');};
$('#btnSound2').onclick=()=>{audio();setMute(!muted);sfx('click');};
function loop(ts){
  const dt=Math.min(.033,(ts-last)/1000||.016);last=ts;
  update(dt);
  render();
  if(state==='title')drawPreviews(dt);
  if(state!=='title'){refreshHUD();updateHoverLoot();mmAcc+=dt;if(mmAcc>.15){mmAcc=0;renderMinimap();}}
  requestAnimationFrame(loop);
}
buildSprites();buildAtlas();initWorld();buildMinimap();buildTitle();setMute(false);showTitle();
requestAnimationFrame(loop);
