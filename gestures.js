// Detects the action in the reference image: a hand raised to the forehead.
export function capTouchScore(hands,face){
 if(!hands?.length||!face?.length)return 0;
 const nose=face[1], forehead=face[10];
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const faceSize=Math.max(.08,d(face[234],face[454]));
 return Math.round(100*Math.max(...hands.map(h=>{
   const fingertips=[h[4],h[8],h[12],h[16],h[20]];
   const near=Math.min(...fingertips.map(p=>d(p,forehead)))/faceSize;
   const raised=(nose.y-h[0].y)/faceSize;
   return near<.72&&raised>.05?Math.max(0,1-near/.72):0;
 })));
}

