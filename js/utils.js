"use strict";
// ===== Константы мира и утилиты =====
const T=48, MW=96, MH=96, TAU=Math.PI*2;
const rnd=(a,b)=>a+Math.random()*(b-a), irnd=(a,b)=>Math.floor(rnd(a,b+1)), chance=p=>Math.random()<p;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const dist=(ax,ay,bx,by)=>Math.hypot(bx-ax,by-ay);
const $=s=>document.querySelector(s);
function fmtTime(s){const m=Math.floor(s/60),ss=Math.floor(s%60);return m+':'+String(ss).padStart(2,'0');}

// ===== Холст и экран =====
const cv=$('#game'), ctx=cv.getContext('2d');
let VW=0,VH=0,DPR=1;
function resize(){DPR=Math.min(devicePixelRatio||1,1.5);VW=innerWidth;VH=innerHeight;cv.width=VW*DPR;cv.height=VH*DPR;cv.style.width=VW+'px';cv.style.height=VH+'px';ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;}
addEventListener('resize',resize);resize();
