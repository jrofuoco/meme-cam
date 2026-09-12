// Map normalized landmarks through the same cover crop used by the webcam.
export function faceTransform(points,width,height,mirror=false){
 if(!points?.[454]||!width||!height)return null;
 const scale=Math.max(1280/width,720/height);
 const map=p=>({x:p.x*width*scale+(1280-width*scale)/2,y:p.y*height*scale+(720-height*scale)/2});
 const left=map(points[33]),right=map(points[263]),top=map(points[10]),bottom=map(points[152]);
 const a=map(points[234]),b=map(points[454]);
 const x=(top.x+bottom.x)/2,y=(top.y+bottom.y)/2;
 const faceWidth=Math.hypot(b.x-a.x,b.y-a.y),faceHeight=Math.hypot(bottom.x-top.x,bottom.y-top.y);
 const w=Math.max(faceWidth*1.35,faceHeight*1.2*2/3);
 const angle=Math.atan2(right.y-left.y,right.x-left.x);
 return {x:mirror?1280-x:x,y,w,angle:mirror?-angle:angle};
}
