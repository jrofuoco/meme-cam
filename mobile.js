import {handScore} from './hands.js';import {capTouchScore} from './gestures.js';import {handNearMouthScore} from './mouth-gesture.js';import {flatHandsScore} from './flat-hands.js';import {faceTransform} from './face-overlay.js';
const $=id=>document.getElementById(id),video=$('video'),canvas=$('output'),ctx=canvas.getContext('2d');
const assets={ball:'basketball.png',cap:'ai-baino.png',mouth:'eyes-closed.png',flat:'flat-hands.png',phone:'phone-meme.png'},images={};for(const [k,v] of Object.entries(assets)){images[k]=new Image();images[k].src='assets/'+v;}
let stream,handModel,faceModel,objectModel,running=false,facing='user',last=-1,held=0,shown=0,cooldown=0,active=null,faceBox=null,heldKey=null;
let audioContext,audioSource,audioMessage='';
const audioBuffers=new Map(),audioLoads=new Map();
const setState=s=>$('state').textContent=s;
const fullscreenButton=document.querySelector("#fullscreen");
function prepareSound(){
 try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
 audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
 const resumed=audioContext.resume();
 audioMessage='';
 return Promise.all([resumed,...Object.entries(assets).map(([key,file])=>{
  if(!audioLoads.has(key))audioLoads.set(key,fetch('assets/'+file.replace('.png','.mp3')).then(r=>{
   if(!r.ok)throw Error('Sound unavailable');return r.arrayBuffer();
  }).then(b=>audioContext.decodeAudioData(b)).then(b=>audioBuffers.set(key,b)).catch(()=>{
   audioLoads.delete(key);throw Error('Could not load '+file.replace('.png','')+' sound. Tap Start to retry.');
  }));
  return audioLoads.get(key);
 })]).then(()=>{if(audioContext.state!=='running')throw Error('Tap Start to enable sound.');});
}
function stopSound(){if(audioSource){audioSource.stop();audioSource=null;}}
async function testSound(){
 const button=$('test-sound');button.disabled=true;
 try{
  await prepareSound();stopSound();
  audioSource=audioContext.createBufferSource();audioSource.buffer=audioBuffers.get('flat');
  audioSource.connect(audioContext.destination);audioSource.start(0,0,5);
  audioMessage='Sound test playing. If silent, turn up media volume and turn off Silent Mode.';
 }catch(e){audioMessage=e.message;}
 $('match').textContent=audioMessage;button.disabled=false;
}
document.addEventListener('DOMContentLoaded',()=>{$('test-sound').onclick=testSound;});
async function models(){const V=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs'),files=await V.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');handModel||=await V.HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'},runningMode:'VIDEO',numHands:2});faceModel||=await V.FaceLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'},runningMode:'VIDEO',numFaces:1});objectModel||=await V.ObjectDetector.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float32/1/efficientdet_lite0.tflite'},runningMode:'VIDEO',scoreThreshold:.35,maxResults:5});}
async function camera(){stopSound();held=0;heldKey=null;shown=0;cooldown=0;active=null;faceBox=null;last=-1;stream?.getTracks().forEach(t=>t.stop());stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}},audio:false});video.srcObject=stream;await video.play();running=true;$('empty').hidden=true;$('flip').disabled=$('capture').disabled=false;setState('LIVE');}
function trigger(match,now){
 if(!faceBox)return;
 active=match;shown=now+5000;cooldown=shown+1500;held=0;heldKey=null;
 stopSound();
 const sound=audioBuffers.get(match.key);
 audioMessage=!sound?'Sound unavailable. Tap Start to retry.':audioContext?.state!=='running'?'Sound paused. Tap Start to enable sound.':'';
 if(sound&&audioContext?.state==='running'){
  audioSource=audioContext.createBufferSource();audioSource.buffer=sound;
  audioSource.connect(audioContext.destination);audioSource.start(0,0,5);
 }
 $('match').textContent=audioMessage||`Playing: ${match.name}`;
}
function draw(now){ctx.fillStyle='#070907';ctx.fillRect(0,0,720,1280);if(running&&video.readyState>1){const s=Math.max(720/video.videoWidth,1280/video.videoHeight),w=video.videoWidth*s,h=video.videoHeight*s;ctx.save();if(facing==='user'){ctx.translate(720,0);ctx.scale(-1,1);}ctx.drawImage(video,(720-w)/2,(1280-h)/2,w,h);ctx.restore();if(now<shown&&active&&faceBox){const im=images[active.key],scale=720/1280,f={x:faceBox.x*scale,y:faceBox.y/720*1280,w:faceBox.w*scale,angle:faceBox.angle};const ih=f.w*im.naturalHeight/im.naturalWidth;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.drawImage(im,-f.w/2,-ih/2,f.w,ih);ctx.restore();}}
 if(running&&video.currentTime!==last&&video.readyState>1){last=video.currentTime;try{const face=faceModel.detectForVideo(video,now),fp=face.faceLandmarks[0],hands=handModel.detectForVideo(video,now).landmarks,objects=objectModel.detectForVideo(video,now);faceBox=faceTransform(fp,video.videoWidth,video.videoHeight,facing==='user');const phone=objects.detections.some(d=>d.categories.some(c=>/cell phone|mobile phone|phone/i.test(c.categoryName)))?100:0;const list=[{key:'phone',name:'Phone',score:phone},{key:'mouth',name:'Hand near mouth',score:handNearMouthScore(hands,fp)},{key:'flat',name:'Flat hand',score:flatHandsScore(hands,video.videoWidth/video.videoHeight)},{key:'cap',name:'Invisible cap',score:capTouchScore(hands,fp)},{key:'ball',name:'Invisible ball',score:handScore(hands,video.videoWidth/video.videoHeight)}];const m=list.find(x=>x.score>=(x.key==='flat'?55:72))||list.reduce((a,b)=>a.score>b.score?a:b);$('match').textContent=audioMessage||(now<shown&&active?`Playing: ${active.name}`:`${m.name} · ${m.score}%`);if(faceBox&&m.score>=(m.key==='flat'?55:72)&&now>cooldown){if(heldKey!==m.key||!held){heldKey=m.key;held=now;}if(now-held>450)trigger(m,now);}else{held=0;heldKey=null;}}catch{}}
 requestAnimationFrame(draw);
}
$('start').onclick=async()=>{setState('LOADING');$('start').disabled=true;running=false;stopSound();try{await prepareSound();await models();await camera();$('start').textContent='Restart';}catch(e){$('match').textContent='Could not start: '+e.message;setState('ERROR');}$('start').disabled=false;};$('flip').onclick=async()=>{facing=facing==='user'?'environment':'user';await camera();};$('capture').onclick=()=>{const a=document.createElement('a');a.download=`meme-cam-${Date.now()}.png`;a.href=canvas.toDataURL('image/png');a.click();};fullscreenButton.addEventListener("click",async()=>{const preview=document.querySelector(".camera");try{if(!document.fullscreenElement){await(preview.requestFullscreen?.()||preview.webkitRequestFullscreen?.());}else{await(document.exitFullscreen?.()||document.webkitExitFullscreen?.());}}catch{}}); function updateFullscreenButton(){fullscreenButton.textContent=document.fullscreenElement?"×":"⛶";}document.addEventListener("fullscreenchange",updateFullscreenButton);document.addEventListener("webkitfullscreenchange",updateFullscreenButton);navigator.serviceWorker?.register('./sw.js').catch(()=>{});requestAnimationFrame(draw);
window.addEventListener('pagehide',()=>{stopSound();stream?.getTracks().forEach(t=>t.stop());running=false;});
