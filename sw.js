/* Service worker simplu: aplicația și lista de colinde funcționează și fără internet.
   Fișierele mp3 (de pe GitHub) nu sunt memorate; ele se redau doar online. */
const CACHE = "colinde-v1";
const CORE = ["./", "index.html", "manifest.json", "icon.png", "colinde.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;      /* mp3 și API GitHub: direct din rețea */
  const key = url.origin + url.pathname;            /* ignoră ?v=... */
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return res;
    }).catch(() =>
      caches.match(key).then(r => r || caches.match(new URL("index.html", location.href).href) )
    )
  );
});
