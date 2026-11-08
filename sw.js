/* Tablée — service worker : l'appli marche hors ligne, les mises à jour arrivent au rechargement suivant. */
const VERSION = "tablee-dd29787a";
const COQUILLE = ["./", "./index.html", "./manifest.webmanifest", "./data/ingredients.json", "./data/aisles.json", "./data/recipes.json",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(COQUILLE))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k.startsWith("tablee-")).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.hostname.endsWith("supabase.co")) return;                       // données du foyer : toujours en direct
  if (url.origin === location.origin) {                                     // coquille : réseau d'abord (revalidé, jamais le cache HTTP périmé), cache en secours
    e.respondWith(fetch(url.href, { cache: "no-cache", credentials: "same-origin" }).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(url.hostname)) {   // polices et librairie : cache d'abord
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })));
  }
});
