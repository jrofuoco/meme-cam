const CACHE='meme-cam-mobile-v3';
const LOCAL=['/mobile.html','/mobile.css','/mobile.js','/hands.js','/gestures.js','/mouth-gesture.js','/flat-hands.js','/face-overlay.js','/assets/basketball.png','/assets/ai-baino.png','/assets/eyes-closed.png','/assets/flat-hands.png','/assets/phone-meme.png','/assets/basketball.mp3','/assets/ai-baino.mp3','/assets/eyes-closed.mp3','/assets/flat-hands.mp3','/assets/phone-meme.mp3'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(LOCAL.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('meme-cam-mobile-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(caches.open(CACHE).then(async cache=>{
  const cached=await cache.match(e.request,{ignoreSearch:true});
  return cached||fetch(e.request);
 }));
});
