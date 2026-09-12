export function poseScore(p){
 const ids=[11,12,13,14,15,16,23,24];
 if(!p||ids.some(i=>!p[i]||(p[i].visibility??0)<.55))return 0;
 const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 const shoulder=mid(p[11],p[12]),hip=mid(p[23],p[24]),hands=mid(p[15],p[16]);
 const torso=Math.hypot(hip.x-shoulder.x,hip.y-shoulder.y);
 if(torso<.1)return 0;
 const near=(v,target,tol)=>Math.max(0,1-Math.abs(v-target)/tol);
 const gap=Math.hypot(p[15].x-p[16].x,p[15].y-p[16].y)/torso;
 const height=(hands.y-shoulder.y)/torso;
 const centered=Math.abs(hands.x-hip.x)/torso;
 const elbows=(Math.abs(p[13].x-p[15].x)+Math.abs(p[14].x-p[16].x))/torso;
 return Math.round(100*(.3*near(gap,.25,.6)+.35*near(height,1,.6)+.25*near(centered,0,.45)+.1*Math.min(1,elbows/.5)));
}
