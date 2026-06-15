// Postiflow — Content Generator
// Uses Claude API to generate weekly content calendars from brand context.
// For MVP: returns mock data. Real Claude API integration is a Phase 2 swap
// (just need an ANTHROPIC_API_KEY in env).

import { type Brand, type ContentItem, MOCK_BRAND } from "./mock-data";

export type GenerateRequest = {
  brand: Brand;
  weekStart: string; // ISO date
  platforms: ("instagram" | "tiktok")[];
  postsPerWeek: number;
};

export type GeneratedIdea = {
  type: "carousel" | "short_video" | "blog";
  platform: "instagram" | "tiktok";
  title: string;
  caption: string;
  script?: string;
  seo_keywords: string[];
  hashtags: string[];
  scheduledAt: string; // ISO
};

// Optimal posting times (Indonesian audience, 2026 data)
const POSTING_TIMES: Record<"instagram" | "tiktok", number[]> = {
  instagram: [11, 19], // 11am and 7pm
  tiktok: [12, 18, 21], // noon, 6pm, 9pm
};

function pickTime(platform: "instagram" | "tiktok", dayIndex: number, postIndex: number): string {
  const times = POSTING_TIMES[platform];
  const hour = times[postIndex % times.length];
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay() + 1 + dayIndex); // Monday + dayIndex
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const TYPE_BY_DAY: Array<"carousel" | "short_video" | "blog"> = [
  "carousel", // Mon — listicle
  "short_video", // Tue — engaging video
  "carousel", // Wed — story
  "blog", // Thu — long-form
  "short_video", // Fri — fun video
  "carousel", // Sat — BTS
  "short_video", // Sun — relaxing video
];

const PILLAR_TITLES = [
  "Edukasi",
  "Behind the scene",
  "Tips",
  "Testimoni",
  "Promo",
  "Tutorial",
  "FAQ",
  "Storytelling",
] as const;

const HASHTAG_POOL_INSTAGRAM = [
  "#umkmindonesia",
  "#bisnisrumahan",
  "#kualitaspremium",
  "#umkmsuksses",
  "#belajalocal",
  "#produklokal",
  "#indonesiabanget",
  "#supportlokal",
  "#brandlokal",
];

const HASHTAG_POOL_TIKTOK = [
  "#fyp",
  "#foryou",
  "#viral",
  "#xyzbca",
  "#indonesiantiktok",
  "#umkmtiktok",
  "#belajarditiktok",
  "#tiktokindonesia",
];

/**
 * Generate content ideas for a week. Returns an array of GeneratedIdea,
 * one per scheduled post.
 *
 * For MVP: returns curated mock data based on brand niche + pillars.
 * Real Claude API integration is a Phase 2 swap (just need an
 * ANTHROPIC_API_KEY in env + a call to the messages API).
 */
export async function generateWeeklyContent(
  req: GenerateRequest,
): Promise<GeneratedIdea[]> {
  // TODO: replace with real Claude API call
  // const response = await fetch("https://api.anthropic.com/v1/messages", { ... })
  // return response.json

  // For now, return curated ideas based on brand context
  return generateMockIdeas(req);
}

function generateMockIdeas(req: GenerateRequest): GeneratedIdea[] {
  const ideas: GeneratedIdea[] = [];
  const postsPerDay = Math.max(1, Math.floor(req.postsPerWeek / 7));
  const { brand } = req;

  for (let day = 0; day < 7; day++) {
    for (let p = 0; p < postsPerDay; p++) {
      const platform = req.platforms[p % req.platforms.length];
      const type = TYPE_BY_DAY[(day + p) % TYPE_BY_DAY.length];
      const pillarIndex = (day * 2 + p) % brand.content_pillars.length;
      const pillar = brand.content_pillars[pillarIndex] || PILLAR_TITLES[pillarIndex % PILLAR_TITLES.length];

      const idea = buildIdea(brand, pillar, type, platform, day, p);
      ideas.push(idea);
    }
  }

  return ideas;
}

function buildIdea(
  brand: Brand,
  pillar: string,
  type: "carousel" | "short_video" | "blog",
  platform: "instagram" | "tiktok",
  dayIndex: number,
  postIndex: number,
): GeneratedIdea {
  const scheduledAt = pickTime(platform, dayIndex, postIndex);
  const baseHashtags = platform === "instagram" ? HASHTAG_POOL_INSTAGRAM : HASHTAG_POOL_TIKTOK;
  const nicheHashtag = `#${brand.niche.toLowerCase().replace(/\s+/g, "")}`;

  // Title + caption templates by pillar + type
  const templates = getTemplates(brand.niche, pillar, type);
  const chosen = templates[dayIndex % templates.length];

  const seoKeywords = [
    brand.niche.toLowerCase().split(" ")[0],
    pillar.toLowerCase(),
    ...(chosen.seoKeywords ?? []),
  ].slice(0, 5);

  return {
    type,
    platform,
    title: chosen.title,
    caption: chosen.caption,
    script: type === "short_video" ? chosen.script : undefined,
    seo_keywords: seoKeywords,
    hashtags: [nicheHashtag, ...baseHashtags.slice(0, platform === "instagram" ? 13 : 5)],
    scheduledAt,
  };
}

function getTemplates(niche: string, pillar: string, type: "carousel" | "short_video" | "blog") {
  // Simplified template bank — real Claude API would generate fresh content
  return [
    {
      title: `5 ${pillar} yang Wajib Anda Tahu tentang ${niche}`,
      caption: `Edukasi singkat untuk Anda yang ingin lebih paham ${niche} ✨\n\nScroll untuk tahu lebih!`,
      script: `Hook: 'Kamu pasti belum tahu ini!'\nBody: 3 quick tips tentang ${pillar}\nClose: 'Save post ini buat referensi!'`,
      seoKeywords: [pillar.toLowerCase(), niche.toLowerCase()],
    },
    {
      title: `Story: Bagaimana ${pillar} Mengubah Bisnis Kami`,
      caption: `Cerita di balik layar tentang ${pillar} yang jadi game-changer untuk kami 🌱`,
      script: `Hook: 'Ini yang gak banyak orang tahu'\nBody: behind the scene 60 detik\nClose: 'Penasaran? Follow untuk lebih!'`,
      seoKeywords: ["story", "bisnis"],
    },
    {
      title: `${pillar} untuk Pemula: Mulai dari Sini`,
      caption: `Baru mulai? Ini panduan lengkapnya untuk Anda 🚀`,
      script: `Hook: 'Pemula? Mulai dari sini!'\nBody: step-by-step dalam 30 detik\nClose: 'Tag teman yang butuh ini!'`,
      seoKeywords: ["pemula", "tutorial"],
    },
    {
      title: `Testimoni Pelanggan: Pengalaman dengan ${niche}`,
      caption: `Kata mereka yang udah coba 💛 Lihat sendiri!`,
      script: `Hook: 'Pelanggan kami bilang...'\nBody: real customer reaction\nClose: 'Mau coba juga? Order di bio!'`,
      seoKeywords: ["testimoni", "review"],
    },
    {
      title: `Promo Spesial untuk Anda`,
      caption: `Cuma minggu ini! 🎉 Jangan sampai kelewat.`,
      script: `Hook: 'Flash sale alert!'\nBody: 3 product shots + harga\nClose: 'Checkout sekarang sebelum habis!'`,
      seoKeywords: ["promo", "diskon"],
    },
    {
      title: `FAQ: Pertanyaan yang Sering Ditanya`,
      caption: `Pertanyaan terpopuler dari pelanggan kami, dijawab jelas ✅`,
      script: `Hook: 'Pertanyaan yang sering ditanya'\nBody: 3 Q&A in 45 detik\nClose: 'Ada pertanyaan lain? Drop di komen!'`,
      seo_keywords: ["faq", "tanya jawab"],
    },
    {
      title: `Behind the Scene: Tim Kami Setiap Hari`,
      caption: `Lihat gimana kami kerja di balik layar ✨`,
      script: `Hook: 'POV: sehari di tim kami'\nBody: BTS montage 30 detik\nClose: 'Mau liat lebih? Follow terus!'`,
      seo_keywords: ["behind the scene", "bts"],
    },
  ];
}

/**
 * Convert GeneratedIdea to ContentItem (matches DB schema)
 */
export function ideaToContentItem(idea: GeneratedIdea, brandId: string, calendarId: string | null = null): Omit<ContentItem, "id"> {
  return {
    brand_id: brandId,
    calendar_id: calendarId,
    type: idea.type,
    platform: idea.platform,
    title: idea.title,
    caption: idea.caption,
    script: idea.script,
    seo_keywords: idea.seo_keywords,
    hashtags: idea.hashtags,
    media_urls: [],
    status: "draft",
    scheduled_at: idea.scheduledAt,
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  };
}
