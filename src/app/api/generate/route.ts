// Postiflow — API: /api/generate
// Generates a week of content for the current user's brand.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyContent, ideaToContentItem } from "@/lib/content-generator";
import { MOCK_BRAND } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { postsPerWeek = 14, platforms = ["instagram", "tiktok"] } = body;

    // For MVP: use mock brand (real version will fetch from Supabase)
    const brand = MOCK_BRAND;
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

    const ideas = await generateWeeklyContent({
      brand,
      weekStart: weekStart.toISOString(),
      platforms,
      postsPerWeek,
    });

    const items = ideas.map((idea) =>
      ideaToContentItem(idea, brand.id, null)
    );

    return NextResponse.json({
      success: true,
      generated_count: items.length,
      items,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Internal error", details: String(error) },
      { status: 500 },
    );
  }
}
