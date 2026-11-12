"use strict";
// ===== Общее изменяемое состояние игры =====
let state='title',time=0,playT=0,last=0,mmAcc=0,saveAcc=0;
let diff='normal',classId='warrior';
let player=null,monsters=[],npcs=[],loot=[],projs=[],parts=[],decals=[],fx=[],floats=[],spawners=[];
let cam={x:0,y:0},shakeT=0,shakeMag=0,hurtT=0,fadeT=0,portalCd=0;
let Q={},qprog={},q2Pity=0,stats={kills:0,deaths:0,goldEarned:0};
let moveTarget=null,combatTarget=null,dialogNpc=null,charOpen=false,barkAcc=0;
let hoverLoot=null;
const keys={},mouse={x:VW/2,y:VH/2,down:false};
