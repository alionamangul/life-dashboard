import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Центр жизни",
    template: "%s — Центр жизни",
  },
  description: "Семейный центр жизни — всё важное в одном месте",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Центр жизни",
    statusBarStyle: "default",
  },
  // iOS Safari до сих пор полагается на устаревший тег для полноэкранного режима.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
