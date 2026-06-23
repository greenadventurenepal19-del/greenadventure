import type { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://greenadventurenepal.com";
const cleanSiteUrl = SITE_URL.endsWith("/") ? SITE_URL.slice(0, -1) : SITE_URL;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/destinations", changeFrequency: "weekly", priority: 0.9 },
  { path: "/tours", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trekking", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/faqs", changeFrequency: "monthly", priority: 0.5 },
  { path: "/booking-terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cancellation-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/visa-info", changeFrequency: "monthly", priority: 0.5 },
];

const STATIC_DESTINATIONS = ["nepal", "bhutan", "india"];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const baseEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${cleanSiteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const destinationEntries: MetadataRoute.Sitemap = STATIC_DESTINATIONS.map((slug) => ({
    url: `${cleanSiteUrl}/destinations/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const tripsSnap = await getDocs(collection(db, "trips"));
    dynamicEntries = tripsSnap.docs
      .map((d) => {
        const data = d.data() as { slug?: string; tripType?: string; updatedAt?: { seconds?: number } };
        const slug = data.slug || d.id;
        if (!slug) return null;
        const isTour = data.tripType === "Tour" || data.tripType === "Tours";
        const isTrek = data.tripType === "Trekking";
        const base = isTour ? "/tours" : isTrek ? "/trekking" : "/tours";
        const lastModified = data.updatedAt?.seconds
          ? new Date(data.updatedAt.seconds * 1000)
          : now;
        return {
          url: `${cleanSiteUrl}${base}/${slug}`,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  } catch (error) {
    console.error("sitemap: failed to read trips collection", error);
  }

  return [...baseEntries, ...destinationEntries, ...dynamicEntries];
}
