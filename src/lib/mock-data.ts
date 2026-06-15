// Mock data for Postiflow — used until real Supabase backend is connected.
// Schema matches: ~/boss-system/projects/p007-faceless-saas/code-refs/supabase-schema.md

export type Brand = {
  id: string;
  name: string;
  niche: string;
  audience_description: string;
  language: "id" | "en" | "both";
  content_pillars: string[];
  plan: "free" | "starter" | "pro" | "agency";
};

export type ContentType = "carousel" | "short_video" | "blog";
export type ContentPlatform = "instagram" | "tiktok";
export type ContentStatus = "draft" | "scheduled" | "posted" | "failed";

export type ContentItem = {
  id: string;
  brand_id: string;
  calendar_id: string | null;
  type: ContentType;
  platform: ContentPlatform;
  title: string;
  caption: string;
  script?: string;
  seo_keywords: string[];
  hashtags: string[];
  media_urls: string[];
  status: ContentStatus;
  scheduled_at: string; // ISO
  posted_at: string | null;
  platform_post_id: string | null;
  analytics: { views?: number; likes?: number; comments?: number; shares?: number };
};

export const MOCK_BRAND: Brand = {
  id: "brand-001",
  name: "Kopi Nusantara",
  niche: "Coffee shop lokal dengan biji kopi single-origin Indonesia",
  audience_description:
    "Pencinta kopi usia 25-40, urban, yang peduli origin cerita di balik cangkir mereka. Mayoritas Jakarta, Bandung, Surabaya.",
  language: "id",
  content_pillars: ["Edukasi", "Behind the scene", "Tips", "Storytelling"],
  plan: "starter",
};

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function dayOffset(daysFromToday: number, hour: number, minute = 0): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const MOCK_CONTENT_ITEMS: ContentItem[] = [
  // Senin (Day 0)
  {
    id: "c-001",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "carousel",
    platform: "instagram",
    title: "5 Single Origin Terbaik untuk V60",
    caption:
      "Pilih biji kopi yang tepat, rasa yang pas di lidah Anda. ✨\n\nMana favoritmu?",
    seo_keywords: ["kopi single origin", "V60", "manual brew"],
    hashtags: ["#kopinusantara", "#singleorigin", "#v60brew", "#kopilokal"],
    media_urls: [],
    status: "scheduled",
    scheduled_at: dayOffset(0, 19, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  {
    id: "c-002",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "short_video",
    platform: "tiktok",
    title: "Barista spill: cara pouring yang benar",
    caption: "Pouring = seni, bukan asal ☕",
    script:
      "Hook: 'Barista pro tuh pouring-nya beda, nih buktinya!'\nBody: tunjukin teknik pouring dari rendah ke tinggi\nClose: 'Coba di rumah, tag kita ya!'",
    seo_keywords: ["barista", "latte art", "pouring"],
    hashtags: ["#barista", "#latteart", "#kopinusantara", "#coffeetok"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(0, 12, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  // Selasa (Day 1)
  {
    id: "c-003",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "carousel",
    platform: "instagram",
    title: "Story: Dari Petani ke Cangkir Anda",
    caption:
      "Setiap cangkir ada cerita. Hari ini: Pak Darwis dari Gayo, petani di balik Kopi Gayo kami 🌱",
    seo_keywords: ["kopi gayo", "petani kopi", "story kopi"],
    hashtags: ["#kopigayo", "#petanikopi", "#fairtrade", "#kopinusantara"],
    media_urls: [],
    status: "scheduled",
    scheduled_at: dayOffset(1, 20, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  {
    id: "c-004",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "blog",
    platform: "instagram",
    title: "Cara Menyimpan Biji Kopi Agar Tetap Segar",
    caption:
      "Biji kopi mulai kehilangan rasa 7 hari setelah di-roast. Simak tips penyimpanan yang benar dari tim kami.",
    seo_keywords: ["simpan biji kopi", "freshness kopi", "roast date"],
    hashtags: ["#kopitips", "#kopinusantara", "#baristalife"],
    media_urls: [],
    status: "posted",
    scheduled_at: dayOffset(1, 10, 0),
    posted_at: dayOffset(-2, 10, 0),
    platform_post_id: "ig_post_xyz123",
    analytics: { views: 1842, likes: 156, comments: 23, shares: 12 },
  },
  // Rabu (Day 2)
  {
    id: "c-005",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "short_video",
    platform: "tiktok",
    title: "ASMR: roasting kopi dari green bean",
    caption: "Suara roasting yang satisfying 🔥",
    script:
      "Hook: 'Kamu butuh denger ini 1 menit'\nBody: 60 detik ASMR roasting, fokus ke suara beans cracking\nClose: 'Mau roasting-an mana lagi?'",
    seo_keywords: ["roasting kopi", "ASMR kopi", "coffee roasting"],
    hashtags: ["#coffeeroaster", "#asmr", "#kopinusantara", "#coffeelife"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(2, 18, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  {
    id: "c-006",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "carousel",
    platform: "instagram",
    title: "Brewing Guide: French Press vs V60",
    caption:
      "Dua metode, dua karakter rasa. Mana yang cocok untuk mood Anda hari ini? ☕",
    seo_keywords: ["french press", "V60", "brewing kopi"],
    hashtags: ["#brewingguide", "#kopinusantara", "#manualbrew"],
    media_urls: [],
    status: "scheduled",
    scheduled_at: dayOffset(2, 11, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  // Kamis (Day 3)
  {
    id: "c-007",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "short_video",
    platform: "tiktok",
    title: "Myth busted: cold brew vs iced coffee",
    caption: "Beda banget ternyata!",
    script:
      "Hook: 'Kamu pasti salah satu yang bingung'\nBody: visual side-by-side cold brew vs iced coffee\nClose: 'Sekarang udah jelas kan?'",
    seo_keywords: ["cold brew", "iced coffee", "bedanya"],
    hashtags: ["#coldbrew", "#icedcoffee", "#kopinusantara"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(3, 13, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  {
    id: "c-008",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "carousel",
    platform: "instagram",
    title: "Quote Hari Ini: Secangkir Inspirasi",
    caption: '"Kopi itu bukan cuma minuman, itu jeda yang berkualitas." — Tim Kopi Nusantara',
    seo_keywords: ["quote kopi", "inspirasi"],
    hashtags: ["#kopiquotes", "#kopinusantara", "#morningcoffee"],
    media_urls: [],
    status: "posted",
    scheduled_at: dayOffset(3, 7, 0),
    posted_at: dayOffset(-1, 7, 0),
    platform_post_id: "ig_post_abc456",
    analytics: { views: 3201, likes: 287, comments: 41, shares: 89 },
  },
  // Jumat (Day 4)
  {
    id: "c-009",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "short_video",
    platform: "tiktok",
    title: "Friday vibes: 3 kopi recommend untuk weekend",
    caption: "Yang cozy buat ngabuburit weekend ☕",
    script:
      "Hook: 'Weekend tinggal 1 hari lagi, siapin kopinya!'\nBody: 3 quick shots kopi dengan caption singkat\nClose: 'Mana yang bakal lo coba dulu?'",
    seo_keywords: ["kopi weekend", "friday vibes"],
    hashtags: ["#weekendvibes", "#kopinusantara", "#coffeelover"],
    media_urls: [],
    status: "scheduled",
    scheduled_at: dayOffset(4, 17, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  {
    id: "c-010",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "blog",
    platform: "instagram",
    title: "5 Tempat Ngopi Tersembunyi di Jakarta",
    caption:
      "Spot ngopi yang nggak ada di Google Maps, rekomendasi langsung dari tim kami 🌿",
    seo_keywords: ["kafe jakarta", "tempat ngopi"],
    hashtags: ["#jakartanihongo", "#kopinusantara", "#caferecommendation"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(4, 14, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  // Sabtu (Day 5)
  {
    id: "c-011",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "carousel",
    platform: "instagram",
    title: "Behind the scene: Cupping session tim",
    caption: "Setiap Jumat kami cupping 10+ origin untuk pilih yang terbaik 👃",
    seo_keywords: ["coffee cupping", "behind the scene"],
    hashtags: ["#cupping", "#kopinusantara", "#specialtycoffee"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(5, 10, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  {
    id: "c-012",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "short_video",
    platform: "tiktok",
    title: "POV: pertama kali coba kopi Aceh Gayo",
    caption: "Reaction jujur dari tim kami!",
    script:
      "Hook: 'POV: coba kopi Aceh Gayo first time'\nBody: reaction shot + taste description\nClose: 'Penasaran? Order di bio!'",
    seo_keywords: ["kopi aceh gayo", "first reaction"],
    hashtags: ["#acehgayo", "#kopinusantara", "#coffeetok"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(5, 19, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  // Minggu (Day 6)
  {
    id: "c-013",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "carousel",
    platform: "instagram",
    title: "Minggu tenang: ritual ngopi pagi",
    caption: "Slow morning, good coffee. Selamat minggu ☁️",
    seo_keywords: ["ritual pagi", "morning routine"],
    hashtags: ["#sundaymorning", "#kopinusantara", "#slowliving"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(6, 9, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  {
    id: "c-014",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "short_video",
    platform: "tiktok",
    title: "Sunday recipe: kopi susu gula aren homemade",
    caption: "Bikin sendiri di rumah, hemat & puas 🧊",
    script:
      "Hook: 'Kopi susu gula aren cafe vs homemade, mana yang lebih enak?'\nBody: step-by-step recipe\nClose: 'Save dulu, coba weekend ini!'",
    seo_keywords: ["kopi susu", "gula aren", "homemade"],
    hashtags: ["#kopisusuaren", "#homemade", "#kopinusantara"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(6, 15, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  // Beberapa posting sudah lewat untuk variety
  {
    id: "c-015",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-prev-week",
    type: "carousel",
    platform: "instagram",
    title: "Promo weekend: free shipping ke seluruh Indonesia",
    caption: "Cuma weekend ini! 🎉",
    seo_keywords: ["promo kopi", "free shipping"],
    hashtags: ["#promo", "#kopinusantara", "#weekenddeals"],
    media_urls: [],
    status: "posted",
    scheduled_at: dayOffset(-3, 10, 0),
    posted_at: dayOffset(-3, 10, 0),
    platform_post_id: "ig_post_def789",
    analytics: { views: 4521, likes: 412, comments: 67, shares: 145 },
  },
  {
    id: "c-016",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-prev-week",
    type: "short_video",
    platform: "tiktok",
    title: "Test: mana yang lebih creamy, susu UHT atau susu segar?",
    caption: "Spoiler: hasilnya surprising!",
    script: "Hook: 'Susu mana yang bikin kopi lebih creamy?'\nBody: side-by-side taste test\nClose: 'Yang mana favoritmu?'",
    seo_keywords: ["susu kopi", "taste test"],
    hashtags: ["#kopitok", "#kopinusantara", "#tastetest"],
    media_urls: [],
    status: "posted",
    scheduled_at: dayOffset(-4, 16, 0),
    posted_at: dayOffset(-4, 16, 0),
    platform_post_id: "tt_video_ghi012",
    analytics: { views: 12483, likes: 1247, comments: 89, shares: 234 },
  },
  {
    id: "c-017",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "blog",
    platform: "instagram",
    title: "Kenapa kopi specialty lebih mahal? Ini penjelasannya",
    caption: "Specialty vs commercial — beda kualitas, beda cerita.",
    seo_keywords: ["specialty coffee", "harga kopi"],
    hashtags: ["#specialtycoffee", "#kopinusantara", "#edukasikopi"],
    media_urls: [],
    status: "failed",
    scheduled_at: dayOffset(2, 15, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
  {
    id: "c-018",
    brand_id: MOCK_BRAND.id,
    calendar_id: "cal-this-week",
    type: "carousel",
    platform: "instagram",
    title: "Testimoni pelanggan minggu ini",
    caption: "Kopi kami sampai di tangan Anda 💛 Lihat kata mereka!",
    seo_keywords: ["testimoni", "review pelanggan"],
    hashtags: ["#testimoni", "#kopinusantara", "#customerlove"],
    media_urls: [],
    status: "draft",
    scheduled_at: dayOffset(1, 16, 0),
    posted_at: null,
    platform_post_id: null,
    analytics: {},
  },
];

// Helper: ambil 7 hari items (mulai dari Senin) untuk current week
export function getMockContentForWeek(weekStart: Date): ContentItem[] {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return MOCK_CONTENT_ITEMS.filter((item) => {
    const itemDate = new Date(item.scheduled_at);
    return itemDate >= start && itemDate < end;
  });
}

// Helper: start of week (Monday)
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

// Helper: array of 7 Date objects for the week
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// Helper: format date for display
const DAY_NAMES_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function formatDayHeader(date: Date): string {
  const dayName = DAY_NAMES_ID[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES_ID[date.getMonth()];
  return `${dayName}, ${day} ${month}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function formatWeekRange(weekStart: Date): string {
  const start = weekStart;
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const startMonth = MONTH_NAMES_ID[start.getMonth()];
  const endMonth = MONTH_NAMES_ID[end.getMonth()];
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${startMonth} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
