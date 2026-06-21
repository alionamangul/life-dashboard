"use client";

import { useEffect } from "react";

// Регистрирует service worker и следит за обновлениями: при выходе новой
// версии (новый деплой) приложение на домашнем экране подхватывает её и
// перезагружается, а не залипает на старой.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let reloading = false;
    // Когда активировался новый SW — перезагружаем страницу один раз.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Если уже есть «ожидающий» новый SW — активируем сразу.
        if (reg.waiting) reg.waiting.postMessage("skip-waiting");

        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              sw.postMessage("skip-waiting");
            }
          });
        });

        // Проверяем обновление при каждом открытии приложения (возврат на
        // передний план) — для PWA с домашнего экрана это ключевой момент.
        const checkUpdate = () => {
          if (document.visibilityState === "visible") reg.update();
        };
        document.addEventListener("visibilitychange", checkUpdate);
      })
      .catch(() => {
        /* тихо игнорируем — приложение работает и без SW */
      });
  }, []);

  return null;
}
