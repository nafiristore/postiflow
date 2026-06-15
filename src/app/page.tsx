import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  // If the user is already signed in, send them straight to the dashboard.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <span className="text-base font-semibold tracking-tight">Postiflow</span>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link href="/login">
              <Button variant="default" size="sm">Mulai Gratis</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Untuk UMKM Indonesia
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Konten Rutin Otomatis, Tanpa Tampil di Kamera.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Postiflow buatkan carousel Instagram, video TikTok, dan artikel blog
            untuk UMKM Anda — siap posting tiap hari, tanpa ribet.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="h-11 px-6 text-sm">
                Mulai Gratis — Tanpa Kartu Kredit
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Gratis selamanya untuk 1 brand. Tidak perlu kartu kredit. Setup
            dalam 5 menit.
          </p>

          <div className="mt-16 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {[
              {
                title: "Brand Voice Generator",
                body: "Sekali setup, Postiflow pahami gaya bahasa, nada, dan target pasar bisnis Anda.",
              },
              {
                title: "Faceless Content Engine",
                body: "Carousel, video TikTok, dan blog post — semua tanpa harus muncul di kamera.",
              },
              {
                title: "Auto-Post Scheduler",
                body: "Tulis sekali, posting otomatis ke Instagram & TikTok sesuai jadwal Anda.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-4 text-card-foreground"
              >
                <h3 className="text-sm font-medium">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Postiflow</span>
          <span>Dibuat untuk UMKM Indonesia</span>
        </div>
      </footer>
    </div>
  );
}
