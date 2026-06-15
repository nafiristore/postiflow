"use client";

import * as React from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type ContentItem,
  type ContentStatus,
  MOCK_CONTENT_ITEMS,
  getMockContentForWeek,
  getWeekStart,
  getWeekDays,
  formatDayHeader,
  formatTime,
  formatWeekRange,
  isToday,
} from "@/lib/mock-data";

const STATUS_LABEL: Record<ContentStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  scheduled: { label: "Terjadwal", variant: "secondary" },
  posted: { label: "Terposting", variant: "default" },
  failed: { label: "Gagal", variant: "destructive" },
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
};

const TYPE_LABEL: Record<string, string> = {
  carousel: "Carousel",
  short_video: "Video",
  blog: "Blog",
};

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "instagram", label: "📷 IG" },
  { id: "tiktok", label: "🎵 TikTok" },
  { id: "draft", label: "Draft" },
  { id: "scheduled", label: "Terjadwal" },
  { id: "posted", label: "Posted" },
] as const;

export default function CalendarPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [weekStart, setWeekStart] = React.useState<Date>(() => getWeekStart());
  const [filter, setFilter] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<ContentItem | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Auth check
  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then((response: { data: { user: unknown } }) => {
      if (mounted && !response.data.user) router.push("/login");
    });
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const weekDays = React.useMemo(() => getWeekDays(weekStart), [weekStart]);
  const itemsThisWeek = React.useMemo(
    () => getMockContentForWeek(weekStart),
    [weekStart],
  );

  const filteredItems = React.useMemo(() => {
    if (filter === "all") return itemsThisWeek;
    if (filter === "instagram" || filter === "tiktok") {
      return itemsThisWeek.filter((i) => i.platform === filter);
    }
    return itemsThisWeek.filter((i) => i.status === filter);
  }, [itemsThisWeek, filter]);

  const itemsByDay = React.useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    weekDays.forEach((d) => {
      const key = d.toISOString().split("T")[0];
      map.set(key, []);
    });
    filteredItems.forEach((item) => {
      const key = item.scheduled_at.split("T")[0];
      const arr = map.get(key);
      if (arr) arr.push(item);
    });
    // sort by time
    map.forEach((arr) => {
      arr.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    });
    return map;
  }, [weekDays, filteredItems]);

  const totalCount = filteredItems.length;
  const stats = React.useMemo(() => {
    const drafts = filteredItems.filter((i) => i.status === "draft").length;
    const scheduled = filteredItems.filter((i) => i.status === "scheduled").length;
    const posted = filteredItems.filter((i) => i.status === "posted").length;
    return { drafts, scheduled, posted };
  }, [filteredItems]);

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goThisWeek = () => {
    setWeekStart(getWeekStart());
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postsPerWeek: 14,
          platforms: ["instagram", "tiktok"],
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.generated_count} ide konten ter-generate! Lihat di kalender. (Untuk MVP, ini masih curated template — real Claude API integration menyusul)`);
      } else {
        alert(`❌ Error: ${data.error || "Unknown"}`);
      }
    } catch (err) {
      alert(`❌ Network error: ${String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Kalender Konten</h1>
            <p className="text-sm text-muted-foreground">
              Lihat dan atur jadwal postingan untuk minggu ini.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-fit">
            {isGenerating ? "⏳ Generating..." : "✨ Generate Konten"}
          </Button>
        </div>

        {/* Week selector + filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goPrevWeek}>
              ←
            </Button>
            <div className="min-w-[180px] text-center text-sm font-medium">
              {formatWeekRange(weekStart)}
            </div>
            <Button variant="outline" size="sm" onClick={goNextWeek}>
              →
            </Button>
            <Button variant="ghost" size="sm" onClick={goThisWeek}>
              Hari ini
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map((f) => (
              <Button
                key={f.id}
                variant={filter === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.id)}
                className="h-8"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{totalCount}</strong> item minggu ini
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">{stats.drafts}</strong> draft
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">{stats.scheduled}</strong> terjadwal
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">{stats.posted}</strong> posted
          </span>
        </div>

        {/* 7-day grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {weekDays.map((day) => {
            const key = day.toISOString().split("T")[0];
            const items = itemsByDay.get(key) ?? [];
            const todayMark = isToday(day);
            return (
              <div
                key={key}
                className={`rounded-lg border bg-card ${
                  todayMark ? "ring-2 ring-primary" : ""
                }`}
              >
                <div
                  className={`border-b p-2 ${
                    todayMark ? "bg-primary/5" : ""
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {formatDayHeader(day).split(",")[0]}
                  </p>
                  <p className="text-sm font-medium">
                    {day.getDate()}
                    {todayMark && (
                      <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        HARI INI
                      </span>
                    )}
                  </p>
                </div>
                <div className="min-h-[140px] space-y-1.5 p-2">
                  {items.length === 0 ? (
                    <p className="grid h-24 place-items-center text-center text-[10px] text-muted-foreground/60">
                      Belum ada
                    </p>
                  ) : (
                    items.map((item) => {
                      const s = STATUS_LABEL[item.status];
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelected(item)}
                          className="w-full rounded-md border bg-background p-2 text-left transition-colors hover:border-primary hover:bg-primary/5"
                        >
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span>{PLATFORM_ICON[item.platform]}</span>
                            <span>{formatTime(item.scheduled_at)}</span>
                            <span>·</span>
                            <span className="truncate">{TYPE_LABEL[item.type]}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-tight">
                            {item.title}
                          </p>
                          <Badge variant={s.variant} className="mt-1.5 h-4 px-1 text-[9px]">
                            {s.label}
                          </Badge>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected item detail panel (simple inline) */}
        {selected && (
          <Card className="border-primary/40">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {PLATFORM_ICON[selected.platform]} {selected.platform} ·{" "}
                    {formatDayHeader(new Date(selected.scheduled_at))} ·{" "}
                    {formatTime(selected.scheduled_at)}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{selected.title}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  ✕
                </Button>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Caption</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{selected.caption}</p>
              </div>
              {selected.script && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Script</p>
                  <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                    {selected.script}
                  </p>
                </div>
              )}
              {selected.hashtags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Hashtags</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.hashtags.join(" ")}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm">Edit</Button>
                {selected.status === "draft" && (
                  <Button size="sm" variant="default">
                    Jadwalkan
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
