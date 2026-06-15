import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MOCK_BRAND,
  MOCK_CONTENT_ITEMS,
  formatTime,
} from "@/lib/mock-data";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  scheduled: { label: "Terjadwal", variant: "secondary" },
  posted: { label: "Terposting", variant: "default" },
  failed: { label: "Gagal", variant: "destructive" },
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const monthItems = MOCK_CONTENT_ITEMS.filter(
    (i) => new Date(i.scheduled_at) >= thisMonth,
  );
  const posted = monthItems.filter((i) => i.status === "posted");
  const scheduled = monthItems.filter((i) => i.status === "scheduled");
  const drafts = MOCK_CONTENT_ITEMS.filter((i) => i.status === "draft");

  // Next scheduled
  const upcoming = MOCK_CONTENT_ITEMS
    .filter((i) => i.status === "scheduled" && new Date(i.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];

  // Recent items
  const recent = [...MOCK_CONTENT_ITEMS]
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 5);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Selamat datang kembali!
            </h1>
            <p className="text-sm text-muted-foreground">
              Ini ringkasan aktivitas brand <strong>{MOCK_BRAND.name}</strong> minggu ini.
            </p>
          </div>
          <Link href="/calendar" className="w-fit">
            <Button className="w-fit">Buka Kalender →</Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Postingan bulan ini</CardDescription>
              <CardTitle className="text-3xl">{monthItems.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {posted.length} terposting · {scheduled.length} terjadwal · {drafts.length} draft
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Brand aktif</CardDescription>
              <CardTitle className="text-3xl">1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {MOCK_BRAND.name} · plan {MOCK_BRAND.plan}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Jadwal terdekat</CardDescription>
              <CardTitle className="text-base leading-tight">
                {upcoming ? upcoming.title : "Belum ada"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {upcoming
                  ? `${PLATFORM_ICON[upcoming.platform]} ${upcoming.platform} · ${formatTime(upcoming.scheduled_at)}`
                  : "Buat konten baru untuk mulai"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick action */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Buat konten minggu ini</CardTitle>
              <CardDescription className="mt-1">
                AI akan generate 7 hari konten sesuai brand voice & niche Anda.
              </CardDescription>
            </div>
            <Button>
              <Link href="/calendar">Generate Sekarang</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent items */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Postingan Terbaru</h2>
            <Button variant="ghost" size="sm">
              <Link href="/calendar">Lihat semua →</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="divide-y p-0">
              {recent.map((item) => {
                const s = STATUS_LABEL[item.status];
                return (
                  <div key={item.id} className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{PLATFORM_ICON[item.platform]}</span>
                        <p className="truncate text-sm font-medium">{item.title}</p>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {item.type === "carousel" ? "Carousel" : item.type === "short_video" ? "Video Pendek" : "Blog"} · {formatTime(item.scheduled_at)}
                      </p>
                    </div>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
