"use client";

import { useEffect } from "react";

// Регистрирует service worker — нужно для установки PWA на домашний экран
// и для будущих push-уведомлений.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* тихо игнорируем — приложение работает и без SW */
    });
  }, []);

  return null;
}
