"use strict";
// ===== Звук: Web Audio-синтез, без внешних файлов =====
let AC=null,master=null,muted=false,ambNodes=[];
function audio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=muted?0:.5;master.connect(AC.destination);}catch(e){}}
function setMute(m){muted=m;if(master)master.gain.value=m?0:.5;$('#btnSound').textContent=m?'🔇':'🔊';$('#btnSound2').textContent=m?'🔇 Звук выкл':'🔊 Звук вкл';}
function tone(f0,f1,dur,type,vol,delay=0){if(!AC||muted)return;const t=AC.currentTime+delay;const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);}
function noise(dur,vol,f=800,q=1,delay=0){if(!AC||muted)return;const t=AC.currentTime+delay;const n=AC.createBufferSource();const b=AC.createBuffer(1,AC.sampleRate*dur,AC.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;n.buffer=b;const fl=AC.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f;fl.Q.value=q;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);n.connect(fl);fl.connect(g);g.connect(master);n.start(t);n.stop(t+dur);}
function sfx(n){if(!AC||muted)return;switch(n){
  case'click':tone(700,500,.06,'square',.12);break;
  case'swing':noise(.12,.25,900,2);break;
  case'hit':tone(150,60,.1,'square',.3);noise(.08,.2,300,1);break;
  case'crit':tone(220,70,.14,'square',.35);noise(.12,.3,500,1);break;
  case'hurt':tone(200,80,.18,'sawtooth',.3);break;
  case'growl':tone(110,45,.3,'sawtooth',.2);break;
  case'fire':noise(.25,.25,600,.7);tone(300,90,.25,'sawtooth',.12);break;
  case'boom':noise(.4,.4,180,.6);tone(90,30,.4,'sine',.5);break;
  case'frost':tone(1200,300,.3,'sine',.2);noise(.25,.15,2400,3);break;
  case'coin':tone(1300,1300,.07,'sine',.18);tone(1900,1900,.09,'sine',.15,.06);break;
  case'potion':tone(300,520,.12,'sine',.2);tone(380,640,.12,'sine',.18,.1);break;
  case'level':[523,659,784,1047].forEach((f,i)=>tone(f,f,.22,'triangle',.22,i*.09));break;
  case'quest':tone(880,880,.4,'sine',.22);tone(1320,1320,.5,'sine',.15,.08);break;
  case'portal':tone(200,950,.4,'sine',.22);noise(.35,.12,1200,2);break;
  case'equip':tone(500,900,.1,'triangle',.2);break;
  case'chest':tone(400,700,.12,'triangle',.2);tone(900,1200,.1,'sine',.15,.1);break;
  case'roar':tone(70,35,.8,'sawtooth',.5);noise(.7,.35,150,.5);break;
  case'die':tone(160,30,.7,'sawtooth',.35);break;
  case'error':tone(200,150,.12,'square',.15);break;
  case'blink':tone(900,200,.18,'sine',.2);break;
  // Броски и плевки монстров
  case'throw':noise(.22,.28,1400,.8);tone(700,180,.22,'sawtooth',.1);break;   // шаман: взмах посохом
  case'spit':tone(500,140,.14,'sawtooth',.22);noise(.16,.2,500,1.5,.03);break; // плевун: влажный плевок
  // Полёт снарядов (тихие, повторяющиеся)
  case'flyfire':noise(.16,.05,700,.6);tone(rnd(160,240),90,.14,'sawtooth',.025);break;
  case'flypoison':tone(rnd(260,340),180,.12,'sine',.045);noise(.08,.03,400,2);break;
  case'flybone':noise(.13,.05,1500,1.2);break;
  case'flyarrow':noise(.1,.03,2200,1.5);break;
}}
// Звук полёта по типу снаряда
function flySfx(type){
  if(type==='fire'||type==='firebig')sfx('flyfire');
  else if(type==='poison')sfx('flypoison');
  else if(type==='bone')sfx('flybone');
  else if(type==='arrow')sfx('flyarrow');
}
function ambient(){if(!AC||ambNodes.length)return;
  const g=AC.createGain();g.gain.value=.05;g.connect(master);
  [55,82.5].forEach(f=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=f;const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=160;o.connect(fl);fl.connect(g);o.start();ambNodes.push(o);});
  const b=AC.createBuffer(1,AC.sampleRate*3,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const n=AC.createBufferSource();n.buffer=b;n.loop=true;const fl=AC.createBiquadFilter();fl.type='bandpass';fl.frequency.value=400;fl.Q.value=.4;const wg=AC.createGain();wg.gain.value=.03;
  const lfo=AC.createOscillator();lfo.frequency.value=.13;const lg=AC.createGain();lg.gain.value=.02;lfo.connect(lg);lg.connect(wg.gain);lfo.start();
  n.connect(fl);fl.connect(wg);wg.connect(master);n.start();ambNodes.push(n,lfo);
}
