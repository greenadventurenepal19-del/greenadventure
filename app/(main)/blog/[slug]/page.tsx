import type { Metadata } from "next";
import { fetchBlogBySlug, buildBlogJsonLd } from "@/lib/trip-server";
import BlogDetailClient from "./BlogDetailClient";

/* ── Fallback posts (shown when Firestore has no data) ─────────── */
const FALLBACK_POSTS: Record<string, any> = {
  "annapurna-circuit-top-5-reasons": {
    title: "Top 5 Reasons to Trek the Annapurna Circuit",
    excerpt: "The Annapurna Circuit is consistently ranked among the world's greatest treks. Spanning 160–230 km, it takes trekkers through extraordinary landscapes from subtropical lowlands to high alpine deserts.",
    image: "/images/annapurna.png",
    category: "Trekking Guides",
    author: "Green Adventure Team",
    tags: ["Nepal", "Trekking", "Annapurna"],
    readTime: "6 min read",
    createdAt: { seconds: 1746835200 },
    sections: [
      { heading: "Unparalleled Landscape Diversity", body: "No other trek in Nepal offers such a dramatic shift in scenery. In a single journey you pass through lush rhododendron forests, terraced rice paddies, arid Mustang-like plateaus, and glaciated high passes. The sheer variety means every day on trail feels completely different from the last." },
      { heading: "The Iconic Thorong La Pass (5,416 m)", body: "Crossing Thorong La is a milestone moment — the highest point on the circuit at 5,416 metres. The sunrise views from the pass over a sea of peaks are genuinely life-altering. Standing above the clouds with prayer flags snapping in the wind, you'll understand why trekkers return to Nepal again and again." },
      { heading: "Rich Cultural Encounters", body: "The circuit passes through Gurung, Manangi, and Tibetan Buddhist communities. From prayer wheels to yak herders, every village offers authentic cultural immersion. The town of Manang is a highlight — a high-altitude settlement where locals have lived for centuries, untouched by mass tourism." },
      { heading: "Excellent Tea House Infrastructure", body: "The trail is well-serviced with tea houses offering hot meals, warm lodges, and friendly hosts at every stop. You don't need to carry a tent or cooking equipment — just your personal gear. This makes the circuit accessible even for less experienced trekkers who want a real Himalayan adventure." },
      { heading: "Now Is the Perfect Time to Go", body: "After years of variable weather, the classic October–November and March–April windows are producing reliably clear skies. New infrastructure improvements and responsible tourism initiatives mean the experience is better than ever." },
    ],
  },
  "altitude-sickness-prevention-guide": {
    title: "Altitude Sickness: Prevention, Symptoms & Treatment",
    excerpt: "High altitude trekking is one of the most rewarding experiences in the world — but it comes with real risks. Altitude sickness affects thousands of trekkers every year in the Himalayas.",
    image: "/images/hero-nepal.PNG",
    category: "Safety",
    author: "Green Adventure Team",
    tags: ["Safety", "Health", "High Altitude"],
    readTime: "7 min read",
    createdAt: { seconds: 1745625600 },
    sections: [
      { heading: "What Is Altitude Sickness?", body: "Acute Mountain Sickness (AMS) occurs when you ascend too quickly and your body doesn't have enough time to acclimatize to lower oxygen levels. It can affect anyone — regardless of fitness level or age. The key trigger is speed of ascent, not physical ability." },
      { heading: "Recognizing the Symptoms", body: "Early symptoms include headache, fatigue, loss of appetite, dizziness, and nausea. These typically appear within 6–12 hours of arriving at altitude. If symptoms worsen — especially if you develop confusion or extreme breathlessness at rest — this is a medical emergency." },
      { heading: "The Golden Rule: Ascend Slowly", body: "The most effective prevention is a slow, gradual ascent. Above 3,000 m, follow the 300 m rule — don't increase your sleeping altitude by more than 300 m per day. Build in acclimatization days every 3 days, where you hike high but sleep low." },
      { heading: "Hydration and Medications", body: "Drink 3–4 litres of water per day at altitude. Avoid alcohol and sleeping pills during the first few days. Many trekkers take Diamox (acetazolamide) as a preventive measure — consult your doctor before your trip." },
      { heading: "When to Descend", body: "Never ignore worsening symptoms. If your headache doesn't respond to ibuprofen or you feel confused or unsteady, descend immediately — even in the middle of the night. A descent of just 300–500 m can make a dramatic difference." },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const fallbackTitle = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const post = await fetchBlogBySlug(slug) || FALLBACK_POSTS[slug];
  const title = post?.title || fallbackTitle;
  const description = post?.excerpt?.slice(0, 160) || `${title} — read our comprehensive guide by Green Adventure Nepal.`;
  const image = post?.image;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `/blog/${slug}`,
      type: "article",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug) || FALLBACK_POSTS[slug] || null;
  let related: any[] = [];

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (post && post.category && projectId) {
    try {
      const q = {
        structuredQuery: {
          from: [{ collectionId: "blogs" }],
          where: {
            compositeFilter: {
              op: "AND",
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: "category" },
                    op: "EQUAL",
                    value: { stringValue: post.category }
                  }
                },
                {
                  fieldFilter: {
                    field: { fieldPath: "status" },
                    op: "EQUAL",
                    value: { stringValue: "published" }
                  }
                }
              ]
            }
          },
          limit: 4
        }
      };

      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`, {
        method: "POST",
        body: JSON.stringify(q),
        next: { revalidate: 60 }
      });

      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results)) {
          const parsed = results.filter((r: any) => r.document).map((r: any) => {
            const fields = r.document.fields;
            const sl = fields.slug?.stringValue || r.document.name.split('/').pop();
            return {
              id: r.document.name.split('/').pop(),
              title: fields.title?.stringValue || "",
              slug: sl,
              image: fields.image?.stringValue || "",
              category: fields.category?.stringValue || "",
              status: fields.status?.stringValue || "",
            };
          });
          related = parsed.filter((p: any) => p.slug !== slug).slice(0, 3);
        }
      }
    } catch (e) {
      console.error("Error fetching related posts on server", e);
    }
  }

  const jsonLd = post ? buildBlogJsonLd(post) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogDetailClient initialPost={post} initialRelated={related} />
    </>
  );
}
