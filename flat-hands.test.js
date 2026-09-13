import {test} from 'node:test';
import assert from 'node:assert/strict';
import {flatHandsScore} from './flat-hands.js';
function hand(angle=0,aspect=1,curled=0){
 const h=Array.from({length:21},()=>({x:0,y:0}));
 for(const [i,b] of [5,9,13,17].entries()){
  for(let j=0;j<4;j++)h[b+j]={x:.1+j*.035,y:(i-1)*.025};
  if(i<curled){h[b+2].x=.115;h[b+3].x=.085;}
 }
 const a=angle*Math.PI/180;
 return h.map(p=>({x:.5+(p.x*Math.cos(a)-p.y*Math.sin(a))/aspect,y:.5+p.x*Math.sin(a)+p.y*Math.cos(a)}));
}
test('flat hands work in either direction and with moderate tilt',()=>{
 for(const angle of [0,180,-30,30])assert.ok(flatHandsScore([hand(angle)])>=75);
});
test('camera proportions preserve tilt scoring',()=>{
 for(const aspect of [1,16/9,9/16])assert.ok(flatHandsScore([hand(30,aspect)],aspect)>=75);
});
test('upright and steep diagonal hands reject',()=>{
 for(const angle of [45,90,-90])assert.equal(flatHandsScore([hand(angle)]),0);
});
test('three fingers suffice but fists and two fingers reject',()=>{
 assert.ok(flatHandsScore([hand(0,1,1)])>=75);
 for(const curled of [2,4])assert.equal(flatHandsScore([hand(0,1,curled)]),0);
});
test('second hand does not disable a flat hand',()=>{
 const flat=hand(),other=hand(90);
 assert.equal(flatHandsScore([flat,other]),flatHandsScore([flat]));
 assert.equal(flatHandsScore([other,flat]),flatHandsScore([flat]));
 assert.equal(flatHandsScore([other,other]),0);
});
test('invalid landmarks safely reject',()=>{
 for(const input of [undefined,[],[null],[[]],[Array(21).fill({x:NaN,y:0})]])assert.equal(flatHandsScore(input),0);
});
