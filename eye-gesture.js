// MediaPipe face landmarks: low eye height relative to eye width means closed eyes.
export function eyesClosedScore(face){
 if(!face||face.length<468)return 0;
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const eye=(outer,inner,top,bottom)=>{const w=d(face[outer],face[inner]);const h=d(face[top],face[bottom]);return w>.001?Math.max(0,1-h/w/0.5):0;};
 return Math.round(100*Math.min(1,(eye(33,133,159,145)+eye(362,263,386,374))/2));
}
