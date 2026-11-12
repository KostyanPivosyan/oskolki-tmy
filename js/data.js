"use strict";
// ===== Игровые данные: классы, навыки, монстры, NPC, квесты =====
const SAVE_KEY='darklands_save_v2';
const SPAWN={x:19.5*T,y:73*T};

// Типы тайлов: 0 трава, 1 грязь, 2 тропа, 3 камень, 4 пол, 5 стена,
// 6 вода, 7 крипта, 8 стена крипты, 9 топь, 10 кладбище
const WALK=[1,1,1,1,0,0,0,1,0,1,1];

const DIFFS={normal:{n:'Обычный',hp:1,dmg:1,xp:1,gold:1},nightmare:{n:'Кошмар',hp:1.65,dmg:1.5,xp:1.4,gold:1.5},hell:{n:'Ад',hp:2.5,dmg:2.1,xp:1.9,gold:2.2}};

const SK={
  slash:{n:'Рассекающий удар',icon:'⚔️',type:'melee',cd:.45,mana:0,range:62,arc:2,mult:1},
  whirl:{n:'Вихрь стали',icon:'🌀',type:'nova',cd:6,mana:18,radius:115,mult:1.7,col:'#cfd6e0'},
  charge:{n:'Рывок',icon:'💨',type:'dash',cd:5,mana:12,dist:230,mult:1.3,col:'#ffb347'},
  cry:{n:'Боевой клич',icon:'📯',type:'buff',cd:14,mana:20,dur:8,col:'#e8c15a'},
  firebolt:{n:'Огненная стрела',icon:'🔥',type:'proj',cd:.4,mana:4,speed:520,mult:1.15,proj:'fire',range:430},
  frostnova:{n:'Кольцо льда',icon:'❄️',type:'nova',cd:7,mana:22,radius:135,mult:1.35,col:'#6ac8ff',frost:true},
  teleport:{n:'Телепорт',icon:'✨',type:'blink',cd:6,mana:16,dist:270},
  fireball:{n:'Огненный шар',icon:'☄️',type:'proj',cd:2.4,mana:14,speed:380,mult:2.3,proj:'firebig',aoe:95,range:460},
  shot:{n:'Выстрел',icon:'🏹',type:'proj',cd:.42,mana:0,speed:620,mult:1,proj:'arrow',range:440},
  multi:{n:'Веер стрел',icon:'🎯',type:'multi',cd:5,mana:14,count:7,spread:1.15,speed:580,mult:.85,proj:'arrow',range:440},
  roll:{n:'Кувырок',icon:'🤸',type:'dash',cd:4,mana:8,dist:190,mult:0,inv:.4,col:'#7fd421'},
  poisonshot:{n:'Ядовитый залп',icon:'☠️',type:'proj',cd:6,mana:16,speed:520,mult:1.5,proj:'poison',puddle:true,range:440}
};

const CLASSES={
  warrior:{n:'Варвар',spr:'warrior',desc:'Сталь и ярость. Сокрушает врагов в ближнем бою, вихрь и рывок.',hp:110,mp:40,dmg:13,skills:['slash','whirl','charge','cry'],st:'HP 110 · Урон 13 · Ближний бой'},
  mage:{n:'Чародейка',spr:'mage',desc:'Повелительница стихий. Огонь, лёд и телепортация.',hp:80,mp:75,dmg:11,skills:['firebolt','frostnova','teleport','fireball'],st:'HP 80 · Мана 75 · Дальний бой'},
  ranger:{n:'Следопыт',spr:'ranger',desc:'Стрелы и яды. Быстрые ноги, смертельная точность.',hp:92,mp:55,dmg:12,skills:['shot','multi','roll','poisonshot'],st:'HP 92 · Урон 12 · Дальний бой'}
};

const MT={
  zombie:{n:'Зомби',spr:'zombie',hp:48,dmg:8,spd:52,xp:15,range:36,atkCd:1.5,aggro:220,undead:true,scale:2,r:14},
  skeleton:{n:'Скелет-воин',spr:'skeleton',hp:36,dmg:7,spd:86,xp:13,range:38,atkCd:1.1,aggro:250,undead:true,scale:2,r:13},
  imp:{n:'Падший',spr:'imp',hp:20,dmg:5,spd:132,xp:8,range:28,atkCd:.8,aggro:270,scale:2,r:11},
  shaman:{n:'Шаман падших',spr:'shaman',hp:28,dmg:9,spd:68,xp:17,range:270,atkCd:2.3,aggro:310,ranged:'fire',scale:2,r:13},
  spitter:{n:'Плевун',spr:'spitter',hp:32,dmg:7,spd:58,xp:16,range:280,atkCd:2.6,aggro:290,ranged:'poison',scale:2,r:14},
  boss:{n:'Владыка костей',spr:'boss',hp:950,dmg:22,spd:76,xp:420,range:64,atkCd:1.6,aggro:430,boss:true,scale:2.4,r:22}
};

const NPCS=[
  {id:'elder',n:'Старейшина Морган',role:'ХРАНИТЕЛЬ ОЧАГА',x:19,y:65,spr:'elder'},
  {id:'smith',n:'Кузнец Гаррет',role:'МАСТЕР СТАЛИ',x:12,y:71,spr:'smith'},
  {id:'priest',n:'Жрица Элана',role:'СВЕТ И ВЕРА',x:26,y:71,spr:'priest'},
  {id:'merchant',n:'Торговец Финн',role:'РЕДКИЕ ТОВАРЫ',x:19,y:75,spr:'merchant'}
];

const QUESTS=[
  {id:'q1',npc:'elder',name:'Мёртвые не спят',type:'kill',target:'undead',need:10,
   offer:'Странник… Кладбище к востоку больше не знает покоя. Мёртвые встают из могил и бредут к нашим стенам. Упокой десять из них — зомби и скелетов — и Очаг будет в долгу перед тобой.',
   active:'Кладбище — по дороге на восток. Десять восставших мертвецов должны вернуться в землю. Будь осторожен: они атакуют толпой.',
   ready:'Ты слышишь? Ветер стих… Мёртвые наконец спят. Возьми это золото и зелья — ты заслужил. Гаррет, наш кузнец, тоже хочет тебя видеть.',
   done:'Свет хранит тебя, герой. Но тьма лишь отступила — не рассеялась.',
   reward:{gold:150,xp:220,hp:2},hint:'Кладбище — восток'},
  {id:'q2',npc:'smith',name:'Адское железо',type:'collect',item:'shard',need:3,
   offer:'Слышал, ты управился с мертвецами? Тогда у меня есть работа. В груди падших и их шаманов пылают осколки адского железа. Принеси мне ТРИ таких — я выкую тебе клинок, какого не видело это королевство. Лагерь падших — к северо-западу.',
   active:'Три осколка адского железа. Падшие и их шаманы в лагере к северо-западу — вот твои цели. Осколки выпадают не из каждого, бей всех.',
   ready:'Да это же чистейшее адское железо! Держи клинок — он пел в огне всю ночь. А теперь ступай к жрице Элане… она говорит о чём-то куда более тёмном.',
   done:'Мой клинок ещё послужит тебе. Береги его — и себя.',
   reward:{gold:120,eq:'weapon'},hint:'Лагерь падших — северо-запад'},
  {id:'q3',npc:'priest',name:'Владыка костей',type:'kill',target:'boss',need:1,
   offer:'Я чувствую его даже здесь, за стенами… В крипте на северо-востоке пробудился ВЛАДЫКА КОСТЕЙ. Пока он жив, мёртвые будут вставать снова и снова. Я сниму печать с врат, когда ты будешь готов. Уничтожь его и вернись ко мне.',
   active:'Врата крипты открыты — северо-восток, за кладбищем. Владыка костей силён: он призывает слуг и бьёт волнами костей. Уклоняйся от красных кругов!',
   ready:'Осколок Тьмы… он наконец холоден. Свет вернулся в эти земли. Ты — щит Очага, герой. Прими это кольцо и мою благодарность — и знай: тьма запомнит твоё имя.',
   done:'Иди с миром, защитник. Свет идёт за тобой.',
   reward:{gold:500,eq:'ring',victory:true},hint:'Крипта — северо-восток'}
];

const UNLOCK=[1,1,3,5];

// ===== Генерация снаряжения =====
const EQ_BASE={weapon:['Клинок','Тесак','Палаш'],armor:['Кольчуга','Латы','Панцирь'],ring:['Кольцо','Перстень','Печать']};
const EQ_PRE=['Ржавый','Стальной','Ветерана','Адский','Проклятый'],EQ_SUF=['Силы','Ярости','Тьмы','Очага','Пепла'];
const EQ_SLOT_NAME={weapon:'ОРУЖИЕ',armor:'БРОНЯ',ring:'КОЛЬЦО'};
const EQ_ICON={weapon:'⚔️',armor:'🛡️',ring:'💍'};
const EQ_STAT_LABEL={dmg:'Урон',def:'Защита',hp:'HP',crit:'Крит, %',mp:'Мана'};
const BAG_SIZE=12;
