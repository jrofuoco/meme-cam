import {handScore} from './hands.js';
import {faceTransform} from './face-overlay.js';
import {capTouchScore} from './gestures.js';
import {handNearMouthScore} from './mouth-gesture.js';
import {flatHandsScore} from './flat-hands.js';
let objectModel;
let faceModel,faceTarget=null,faceSmooth=null;
async function loadFace(){
 if(faceModel)return;
 const {FilesetResolver,FaceLandmarker}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');
 const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
 faceModel=await FaceLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'},runningMode:'VIDEO',numFaces:1});
}
const $=id=>document.getElementById(id),video=$('video'),canvas=$('output'),ctx=canvas.getContext('2d');
const meme=new Image();meme.src='assets/basketball.png';
const capMeme=new Image();capMeme.src='assets/ai-baino.png';
const eyesMeme=new Image();eyesMeme.src='assets/eyes-closed.png';
const flatMeme=new Image();flatMeme.src='assets/flat-hands.png';
const phoneMeme=new Image();phoneMeme.src='assets/phone-meme.png';
let stream,model,raf,running=false,lastTime=-1,lastDetect=0,held=0,shownUntil=0,cooldown=0,score=0,outputWindow,activeMeme=meme,pendingMeme=meme;
function status(s){$('status').textContent=s;}
let audioContext,audioBuffer,audioLoading,audioSource;
function prepareSound(){
 audioContext ||= new AudioContext();
 audioContext.resume().catch(()=>status('Click Test meme to enable sound.'));
 audioLoading ||= fetch('assets/basketball.mp3').then(r=>{if(!r.ok)throw Error('Sound file unavailable');return r.arrayBuffer();}).then(b=>audioContext.decodeAudioData(b)).then(b=>audioBuffer=b).catch(()=>{audioLoading=null;status('Could not load the meme sound. Click Test meme to retry.');});
 return audioLoading;
}
function stopSound(){if(audioSource){audioSource.stop();audioSource=null;}}
function show(){
 if(running&&!faceTarget){status('Show your face before triggering the sticker.');return;}
 activeMeme=pendingMeme;
 shownUntil=performance.now()+5000;cooldown=shownUntil+1500;held=0;
 stopSound();
 if(activeMeme===meme&&audioBuffer&&audioContext?.state==='running'){audioSource=audioContext.createBufferSource();audioSource.buffer=audioBuffer;audioSource.connect(audioContext.destination);audioSource.start(0,0,5);}
}
function drawImageFit(image){const scale=Math.min(1280/image.width,720/image.height);ctx.drawImage(image,(1280-image.width*scale)/2,(720-image.height*scale)/2,image.width*scale,image.height*scale);}
function render(now){ctx.fillStyle='#090c09';ctx.fillRect(0,0,1280,720);if(running&&video.readyState>=2){ctx.save();if($('mirror').checked){ctx.translate(1280,0);ctx.scale(-1,1);}const s=Math.max(1280/video.videoWidth,720/video.videoHeight);ctx.drawImage(video,(1280-video.videoWidth*s)/2,(720-video.videoHeight*s)/2,video.videoWidth*s,video.videoHeight*s);ctx.restore();}
 if(faceTarget){if(!faceSmooth)faceSmooth={...faceTarget};for(const k of ['x','y','w','angle'])faceSmooth[k]+=(faceTarget[k]-faceSmooth[k])*.45;}else faceSmooth=null;
 if(now<shownUntil&&activeMeme.complete&&activeMeme.naturalWidth){const f=running?faceSmooth:{x:640,y:360,w:220,angle:0};if(f){const h=f.w*activeMeme.naturalHeight/activeMeme.naturalWidth;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.drawImage(activeMeme,-f.w/2,-h/2,f.w,h);ctx.restore();}}
 if(outputWindow&&!outputWindow.closed){const out=outputWindow.document.querySelector('canvas');out?.getContext('2d').drawImage(canvas,0,0);}
 if(running&&model&&now-lastDetect>90&&video.readyState>=2&&video.currentTime!==lastTime){
  lastTime=video.currentTime;lastDetect=now;
  try{
   const face=faceModel.detectForVideo(video,now);
   const facePoints=face.faceLandmarks[0];
   faceTarget=faceTransform(facePoints,video.videoWidth,video.videoHeight,$('mirror').checked);
   const result=model.detectForVideo(video,now);
   const ballScore=handScore(result.landmarks,video.videoWidth/video.videoHeight);
   const capScore=capTouchScore(result.landmarks,facePoints);
   const mouthScore=handNearMouthScore(result.landmarks,facePoints);
   const flatScore=flatHandsScore(result.landmarks);
   const objects=objectModel.detectForVideo(video,now);
   const phoneScore=objects.detections.some(d=>d.categories.some(c=>/cell phone|mobile phone|phone/i.test(c.categoryName)))?100:0;
   const threshold=Number($('threshold').value);
   const matches=[
    {name:'Phone detected',score:phoneScore,min:threshold,meme:phoneMeme},
    {name:'Hand near mouth',score:mouthScore,min:threshold,meme:eyesMeme},
    {name:'Flat hands',score:flatScore,min:55,meme:flatMeme},
    {name:'Invisible cap',score:capScore,min:threshold,meme:capMeme},
    {name:'Invisible ball',score:ballScore,min:threshold,meme:meme}
   ];
   const match=matches.find(item=>item.score>=item.min)??matches.reduce((a,b)=>a.score>b.score?a:b);
   score=match.score;pendingMeme=match.meme;
   $('meter').style.width=score+'%';$('score').textContent=`${match.name}: ${score}%`;
   if(score>=match.min&&now>cooldown){held ||=now;if(now-held>450)show();}else held=0;
  }catch(e){stop();status('Tracking stopped: '+e.message);}
 }
 raf=requestAnimationFrame(render);
}
function stop(){stopSound();running=false;faceTarget=null;faceSmooth=null;stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;held=0;score=0;shownUntil=0;$('start').disabled=false;$('stop').disabled=true;$('indicator').textContent='Camera off';$('empty').style.display='grid';$('meter').style.width='0';$('score').textContent='Waiting for a pose';status('Camera stopped.');}
$('start').onclick=async()=>{ prepareSound();$('start').disabled=true;status('Loading hand recognition…');try{if(!model){const {FilesetResolver,HandLandmarker,ObjectDetector}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');model=await HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'},runningMode:'VIDEO',numHands:2});}status('Loading object tracking…');if(!objectModel){const {FilesetResolver, ObjectDetector}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');objectModel=await ObjectDetector.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float32/1/efficientdet_lite0.tflite'},runningMode:'VIDEO',scoreThreshold:.35,maxResults:5});}await loadFace();status('Allow camera access to continue…');stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720}},audio:false});video.srcObject=stream;await video.play();running=true;lastTime=-1;$('stop').disabled=false;$('empty').style.display='none';$('indicator').textContent='● Live';status('Raise both cupped hands like you are holding an invisible ball. Hold for half a second.');}catch(e){stop();status(`Could not start: ${e.message}. Check camera permission and internet access, then retry.`);}};
$('stop').onclick=stop;$('preview').onclick=async()=>{await prepareSound();$('empty').style.display='none';show();setTimeout(()=>{if(!running)$('empty').style.display='grid';},5100);};
$('threshold').oninput=()=>{$('level').textContent=Number($('threshold').value)<65?'Relaxed':Number($('threshold').value)>80?'Strict':'Balanced';};
$('clean').onclick=()=>{outputWindow=window.open('','meme-cam-output','popup,width=1280,height=720');if(!outputWindow){status('Allow popups for this page to open the call output.');return;}outputWindow.document.title='Meme Cam — Call Output';outputWindow.document.body.innerHTML='<canvas width="1280" height="720" style="width:100vw;height:100vh;object-fit:contain;display:block"></canvas>';outputWindow.document.body.style.cssText='margin:0;background:black;overflow:hidden';};
window.addEventListener('beforeunload',()=>{stream?.getTracks().forEach(t=>t.stop());model?.close();faceModel?.close();objectModel?.close();outputWindow?.close();cancelAnimationFrame(raf);});
raf=requestAnimationFrame(render);






