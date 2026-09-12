// Approximate two cupped/open hands, normalized by palm size. No face or hips needed.
export function handScore(hands, aspect=1){
 if(!hands||hands.length!==2||hands.some(h=>h.length<21||h.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))))return 0;
 const dist=(a,b)=>Math.hypot((a.x-b.x)*aspect,a.y-b.y);
 const palms=hands.map(h=>dist(h[0],h[9]));
 if(palms.some(s=>s<.025))return 0;
 const size=(palms[0]+palms[1])/2;
 const centers=hands.map(h=>({x:(h[0].x+h[9].x)/2,y:(h[0].y+h[9].y)/2}));
 const gap=Math.abs(centers[0].x-centers[1].x)*aspect/size;
 const offset=Math.abs(centers[0].y-centers[1].y)/size;
 if(gap<.65||gap>5.5||offset>2.5)return 0;
 const quality=hands.map((h,i)=>{
   const s=palms[i];
   const open=[8,12,16,20].filter(t=>dist(h[t],h[0])>dist(h[t-3],h[0])*1.15).length;
   const upright=(h[0].y-h[9].y)/s;
   const thumb=dist(h[4],h[5])/s;
   if(open<2||upright<.2||thumb<.25)return 0;
   return .65+.2*Math.min(1,open/3)+.15*Math.min(1,thumb/.65);
 });
 if(quality.some(q=>q===0))return 0;
 return Math.round(100*Math.min(...quality)*(1-.08*Math.min(1,offset/2)));
}
