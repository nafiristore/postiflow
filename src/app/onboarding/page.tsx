"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const PILLAR_OPTIONS = [
  "Edukasi",
  "Tips",
  "Behind the scene",
  "Testimoni",
  "Promo",
  "Tutorial",
  "FAQ",
  "Storytelling",
] as const;

type Language = "id" | "en" | "both";

type FormState = {
  name: string;
  niche: string;
  audience: string;
  pillars: string[];
  language: Language;
};

const INITIAL_STATE: FormState = {
  name: "",
  niche: "",
  audience: "",
  pillars: [],
  language: "id",
};

const STEP_TITLES = [
  "Tentang Brand Anda",
  "Niche Bisnis",
  "Target Audience",
  "Topik Konten",
  "Bahasa Konten",
];

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);

  // Make sure we have an authenticated user before showing the wizard.
  // If not, bounce to /login. The middleware should already do this,
  // but this is a safety net in case the session expired mid-flow.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.replace("/login");
        return;
      }
      // If they already finished onboarding, send them to the dashboard.
      const { data: existing } = await supabase
        .from("brands")
        .select("id")
        .eq("owner_user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (existing) {
        router.replace("/dashboard");
        return;
      }
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePillar = (pillar: string) => {
    setForm((prev) => {
      const has = prev.pillars.includes(pillar);
      if (has) {
        return { ...prev, pillars: prev.pillars.filter((p) => p !== pillar) };
      }
      // Hard-cap at 5 to keep the data set focused.
      if (prev.pillars.length >= 5) return prev;
      return { ...prev, pillars: [...prev.pillars, pillar] };
    });
  };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return form.name.trim().length > 0;
      case 2:
        return form.niche.trim().length > 0;
      case 3:
        return form.audience.trim().length > 0;
      case 4:
        return form.pillars.length >= 3 && form.pillars.length <= 5;
      case 5:
        return form.language !== undefined;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    setError(null);
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      void handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      // 1. Ensure the user row exists in public.users (Supabase auth user
      //    is the source of truth, but the brands FK points here).
      const { error: upsertUserError } = await supabase
        .from("users")
        .upsert(
          {
            id: user.id,
            email: user.email ?? "",
            full_name:
              (user.user_metadata?.full_name as string | undefined) ??
              (user.user_metadata?.name as string | undefined) ??
              null,
            avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
          },
          { onConflict: "id" },
        );
      if (upsertUserError) {
        setError(`Gagal menyimpan profil: ${upsertUserError.message}`);
        setSubmitting(false);
        return;
      }

      // 2. Create the brand record.
      const { error: insertError } = await supabase.from("brands").insert({
        owner_user_id: user.id,
        name: form.name.trim(),
        niche: form.niche.trim(),
        audience_description: form.audience.trim(),
        content_pillars: form.pillars,
        language: form.language,
      });
      if (insertError) {
        setError(`Gagal menyimpan brand: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </main>
    );
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Langkah {step} dari {TOTAL_STEPS} — {STEP_TITLES[step - 1]}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Brand Anda</CardTitle>
            <CardDescription>
              5 pertanyaan singkat — kurang dari 3 menit.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {error ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="brand-name">Nama brand Anda?</Label>
                <Input
                  id="brand-name"
                  name="brand-name"
                  autoFocus
                  placeholder="Contoh: Kopi Kenangan, Skincare By Lala"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Nama yang Anda gunakan untuk jualan.
                </p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="niche">Niche bisnis Anda?</Label>
                <Input
                  id="niche"
                  name="niche"
                  autoFocus
                  placeholder="Contoh: skincare, coffee shop, laundry, jasa"
                  value={form.niche}
                  onChange={(e) => update("niche", e.target.value)}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Industri atau kategori utama bisnis Anda.
                </p>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="audience">Siapa target audience Anda?</Label>
                <textarea
                  id="audience"
                  name="audience"
                  autoFocus
                  rows={3}
                  placeholder="Contoh: Ibu rumah tangga usia 28-40, suka hemat, aktif di Instagram."
                  value={form.audience}
                  onChange={(e) => update("audience", e.target.value)}
                  disabled={submitting}
                  className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30"
                />
                <p className="text-xs text-muted-foreground">1-2 kalimat sudah cukup.</p>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="flex flex-col gap-3">
                <Label>Pilih 3-5 topik konten yang relevan</Label>
                <div className="flex flex-wrap gap-2">
                  {PILLAR_OPTIONS.map((pillar) => {
                    const active = form.pillars.includes(pillar);
                    const disabled =
                      !active && form.pillars.length >= 5;
                    return (
                      <button
                        key={pillar}
                        type="button"
                        onClick={() => togglePillar(pillar)}
                        disabled={disabled || submitting}
                        aria-pressed={active}
                        className={
                          "rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 " +
                          (active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background text-foreground hover:bg-muted")
                        }
                      >
                        {pillar}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dipilih: {form.pillars.length} / 5
                </p>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="flex flex-col gap-3">
                <Label>Bahasa utama konten?</Label>
                <RadioGroup
                  value={form.language}
                  onValueChange={(value) =>
                    update("language", value as Language)
                  }
                  className="gap-2"
                >
                  {[
                    { value: "id", label: "Indonesia" },
                    { value: "en", label: "English" },
                    { value: "both", label: "Dua-duanya" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      htmlFor={`lang-${opt.value}`}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <RadioGroupItem id={`lang-${opt.value}`} value={opt.value} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="default"
                onClick={handleBack}
                disabled={step === 1 || submitting}
              >
                Kembali
              </Button>
              <Button
                type="button"
                variant="default"
                size="default"
                onClick={handleNext}
                disabled={!isStepValid() || submitting}
              >
                {step < TOTAL_STEPS
                  ? "Lanjut"
                  : submitting
                    ? "Menyimpan..."
                    : "Selesaikan Setup"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
