// One palm held horizontally above a second open palm.
export function flatHandsScore(hands){
 if(!hands||hands.length===0)return 0;
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const palm=h=>d(h[0],h[9]);
 if(hands.length===1){
  const h=hands[0],size=palm(h);
  if(size<.025)return 0;
  const horizontal=Math.abs(h[9].x-h[0].x)/(Math.abs(h[9].x-h[0].x)+Math.abs(h[9].y-h[0].y)+.001);
  const extended=[8,12,16,20].filter(t=>d(h[t],h[0])>d(h[t-3],h[0])*.98).length;
  if(horizontal<.62||extended<3)return 0;
  return Math.round(75+25*Math.min(1,(horizontal-.62)/.3));
 }
 if(hands.length!==2)return 0;
 if(hands.some(h=>palm(h)<.02))return 0;
 const centers=hands.map(h=>({x:(h[0].x+h[9].x)/2,y:(h[0].y+h[9].y)/2}));
 const vertical=Math.abs(centers[0].y-centers[1].y),horizontal=Math.abs(centers[0].x-centers[1].x);
 const size=(palm(hands[0])+palm(hands[1]))/2;
 if(vertical<size*.35||vertical>size*4||horizontal>size*3)return 0;
 const flat=hands.map(h=>Math.abs(h[0].y-h[9].y)/palm(h));
 return Math.round(100*Math.min(1,vertical/(size*1.2))*Math.min(1,1/(1+flat[0]+flat[1])));
}
