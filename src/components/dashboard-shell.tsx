"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { MOCK_BRAND } from "@/lib/mock-data";

type NavLink = { href: string; label: string; icon: string };

const NAV: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/calendar", label: "Kalender", icon: "📅" },
  { href: "/brands", label: "Brand", icon: "✦" },
  { href: "/settings", label: "Pengaturan", icon: "⚙" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            P
          </div>
          <span className="text-sm font-semibold tracking-tight">Postiflow</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div className="rounded-md bg-muted/50 p-3 text-xs">
            <p className="font-medium text-foreground">Plan {MOCK_BRAND.plan.toUpperCase()}</p>
            <p className="mt-0.5 text-muted-foreground">14 / 30 posting terpakai</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <span className="text-sm font-semibold">Postiflow</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="text-base">✦</span>
                  {MOCK_BRAND.name}
                  <span className="text-muted-foreground">▾</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Brand Anda</DropdownMenuLabel>
                <DropdownMenuItem>{MOCK_BRAND.name} (aktif)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>+ Tambah Brand Baru</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                CN
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
