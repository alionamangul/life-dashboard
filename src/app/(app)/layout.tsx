import { AppHeader } from "@/components/app-header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5">
        {children}
      </main>
      <ServiceWorkerRegister />
    </div>
  );
}
