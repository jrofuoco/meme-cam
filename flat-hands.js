// Detect an open hand pointing sideways, independently of the other hand.
export function flatHandsScore(hands,aspect=1){
 if(!Array.isArray(hands)||!Number.isFinite(aspect)||aspect<=0)return 0;
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 return hands.reduce((best,points)=>{
  if(!Array.isArray(points)||points.length<21||points.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return best;
  const h=points.map(p=>({x:p.x*aspect,y:p.y})),size=d(h[0],h[9]);
  if(size<.025)return best;
  const x=(h[9].x-h[0].x)/size,y=(h[9].y-h[0].y)/size;
  const horizontal=Math.abs(x),limit=Math.cos(35*Math.PI/180);
  if(horizontal<limit)return best;
  const extended=[5,9,13,17].filter(b=>{
   const root=h[b],tip=h[b+3];
   const reach=(tip.x-root.x)*x+(tip.y-root.y)*y;
   const length=d(root,h[b+1])+d(h[b+1],h[b+2])+d(h[b+2],tip);
   return reach>size*.35&&d(h[0],tip)>d(h[0],root)+size*.3&&length>0&&d(root,tip)/length>.8;
  }).length;
  if(extended<3)return best;
  return Math.max(best,Math.round(75+15*(horizontal-limit)/(1-limit)+10*(extended-3)));
 },0);
}
