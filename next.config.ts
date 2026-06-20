import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // По умолчанию 1 МБ — мало для фото/сканов. Поднимаем для загрузки
      // вложений и обложек категорий.
      bodySizeLimit: "100mb",
    },
    // Второй лимит: тело запроса, проходящего через proxy.ts (по умолчанию
    // 10 МБ). Фото с телефона бывают больше — иначе тело обрезается и форма
    // рвётся («Unexpected end of form»).
    proxyClientMaxBodySize: 100 * 1024 * 1024,
  },
};

export default nextConfig;
