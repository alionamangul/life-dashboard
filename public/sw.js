// Service worker «Центра жизни».
// Сейчас минимальный — нужен для установки PWA на домашний экран.
// Обработчики push-уведомлений добавим в разделе уведомлений.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Пока сквозной проход в сеть. Здесь позже появится офлайн-кеш.
});
