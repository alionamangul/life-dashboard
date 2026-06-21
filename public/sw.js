// Service worker «Центра жизни».
// Стратегия — «сначала сеть» (always fresh): при онлайне всегда берём свежие
// данные и код с сервера; кеш не отдаёт устаревшее. Это не даёт приложению на
// домашнем экране залипать на старой версии.

const VERSION = "v3";

self.addEventListener("install", () => {
  // Новый SW активируется сразу, не ждёт закрытия вкладок.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Чистим любые старые кеши прошлых версий.
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

// Навигации и запросы к данным — только из сети (свежее). Без офлайн-кеша:
// приложение всегда онлайн, и устаревание важнее отсутствия офлайна.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Статика Next с хешами в имени кешируется браузером сама — не вмешиваемся.
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

void VERSION;
