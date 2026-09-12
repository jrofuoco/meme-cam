// Detect one or more hand landmarks near the mouth area.
export function handNearMouthScore(hands,face){
 if(!hands?.length||!face?.length)return 0;
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const mouth={x:(face[13].x+face[14].x)/2,y:(face[13].y+face[14].y)/2};
 const faceWidth=Math.max(.08,d(face[234],face[454]));
 const points=[0,4,5,8,9,12,13,16,17,20];
 const nearest=Math.min(...hands.flatMap(h=>points.map(i=>d(h[i],mouth))))/faceWidth;
 if(nearest>.58)return 0;
 return Math.round(100*Math.max(0,1-nearest/.75));
}
