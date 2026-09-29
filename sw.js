const CACHE="habit-grid-v6";
const SHELL=["./","index.html","privacy.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon.svg"];
// only these outside hosts are safe to keep offline (fonts, pinned library); sign-in and data always go to the network
const CACHE_HOSTS=/^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)$/;
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(url.pathname.endsWith("privacy.html")?"privacy.html":"index.html",c));return r})
      .catch(()=>caches.match(url.pathname.endsWith("privacy.html")?"privacy.html":"index.html")));
    return;
  }
  if(url.origin!==location.origin&&!CACHE_HOSTS.test(url.hostname))return; // network only
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
    if(r.ok||r.type==="opaque"){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}
    return r;
  })));
});
