// قارئي الذكي — Service Worker (الإصدار يُختم تلقائيًا عند النشر بواسطة tools/stamp.js)
const VERSION='21.0.0',BUILD='dev',C='qari-app-'+VERSION+'-'+BUILD;
const A=['./','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon-64.png','./lib/pdf.worker.min.mjs','./lib/pdf-lib.min.js'];
const clean=async r=>r.redirected?new Response(await r.blob(),{status:200,headers:r.headers}):r;
// التثبيت ذرّي: إن فشل تنزيل أي ملف يفشل التثبيت كله ويبقى الإصدار السابق عاملًا
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(C);try{for(const u of A){const r=await fetch(u,{cache:'reload'});if(!r.ok)throw new Error('تعذر تنزيل '+u);await c.put(u,await clean(r))}}catch(x){await caches.delete(C);throw x}})()));
// لا skipWaiting تلقائي: التفعيل يتم فقط عند ضغط المستخدم «تحديث الآن»
self.addEventListener('message',e=>{const d=e.data||{};if(d.type=='SKIP_WAITING')self.skipWaiting();if(d.type=='VERSION'&&e.source)e.source.postMessage({type:'VERSION',v:VERSION,b:BUILD})});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C&&(x.startsWith('qari-app-')||/^qari-v\d/.test(x))).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!='GET')return;const u=new URL(q.url);if(u.origin!==location.origin)return;
if(u.pathname=='/version.json'||u.pathname=='/sw.js')return; // دائمًا من الشبكة
if(q.mode=='navigate'){e.respondWith(caches.open(C).then(async c=>(await c.match('./'))||fetch(q).then(async r=>{if(r.ok)c.put('./',await clean(r.clone()));return r})).catch(()=>caches.match('./')));return}
e.respondWith(caches.open(C).then(async c=>(await c.match(q))||fetch(q).then(x=>{if(x.ok&&x.status==200&&!x.redirected)c.put(q,x.clone());return x})))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method=='POST'&&u.pathname=='/share-target'){e.respondWith((async()=>{const fd=await e.request.formData(),fs=fd.getAll('files'),c=await caches.open('qari-share');let i=0;for(const f of fs){if(f&&f.size)await c.put('/shared/'+Date.now()+'-'+(i++)+'/'+encodeURIComponent(f.name||'shared.pdf'),new Response(f,{headers:{'content-type':f.type||'application/pdf'}}))}const su=encodeURIComponent(((fd.get('url')||'')+' '+(fd.get('text')||'')).trim());return Response.redirect('/?shared='+fs.length+(su&&!fs.length?'&su='+su:''),303)})())}});
