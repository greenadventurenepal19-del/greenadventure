export type ServerTrip = {
  id?: string;
  title: string;
  image: string;
  region: string;
  duration: string;
  difficulty: string;
  altitude: string;
  price: string;
  rating: number;
  tripType?: string;
  overview: string[];
  description: string;
  itinerary?: { day: string; title: string; desc: string }[];
  faqs?: { q: string; a: string }[];
};

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const getString = (field: any, defaultVal = ""): string => field?.stringValue || defaultVal;
const getNumber = (field: any, defaultVal = 0): number => field?.doubleValue || field?.integerValue || defaultVal;

export async function fetchTripBySlug(slug: string): Promise<ServerTrip | null> {
  if (!projectId) return null;
  try {
    const query = {
      structuredQuery: {
        from: [{ collectionId: "trips" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "slug" },
            op: "EQUAL",
            value: { stringValue: slug },
          },
        },
        limit: 1,
      },
    };
    const tripRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        body: JSON.stringify(query),
        next: { revalidate: 60 },
      },
    );
    if (!tripRes.ok) return null;
    const results = await tripRes.json();
    if (!Array.isArray(results) || results.length === 0 || !results[0].document) return null;

    const doc = results[0].document;
    const fields = doc.fields ?? {};
    const id = doc.name?.split("/").pop();

    const overviewRaw = getString(fields.overview);
    const overview = overviewRaw
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    return {
      id,
      title: getString(fields.title, slug),
      image: getString(fields.image, "/images/everest.png"),
      region: getString(fields.region, "Himalayas"),
      duration: getString(fields.duration, ""),
      difficulty: getString(fields.difficulty, ""),
      altitude: getString(fields.altitude, ""),
      price: getString(fields.price, "On Request"),
      rating: getNumber(fields.rating, 4.8),
      tripType: getString(fields.tripType, ""),
      overview: overview.length > 0 ? overview : [],
      description: overview[0] || "",
    };
  } catch (err) {
    console.error("fetchTripBySlug failed", err);
    return null;
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://greenadventurenepal.com";

export function buildTripJsonLd(trip: ServerTrip, basePath: "tours" | "trekking") {
  const url = `${SITE_URL}/${basePath}/${trip.id || ""}`;
  const image = trip.image?.startsWith("http") ? trip.image : `${SITE_URL}${trip.image}`;
  const description =
    trip.description?.slice(0, 300) ||
    `${trip.title} — ${trip.duration ? trip.duration + " " : ""}guided ${basePath === "trekking" ? "trekking adventure" : "tour package"} with Green Adventure Nepal.`;

  const touristTrip = {
    "@type": "TouristTrip",
    "@id": `${url}#trip`,
    name: trip.title,
    description,
    url,
    image,
    touristType: basePath === "trekking" ? "Trekkers and adventure travelers" : "Cultural and leisure travelers",
    itinerary: Array.isArray(trip.itinerary) && trip.itinerary.length > 0
      ? trip.itinerary.map((item, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: `Day ${item.day}: ${item.title}`,
          text: item.desc,
        }))
      : {
          "@type": "Place",
          name: trip.region,
        },
    provider: {
      "@type": "TravelAgency",
      "@id": `${SITE_URL}/#organization`,
      name: "Green Adventure Nepal",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: trip.price.replace(/[^0-9.]/g, "") || undefined,
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "TravelAgency",
        name: "Green Adventure Nepal",
      }
    },
    aggregateRating: trip.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: trip.rating,
          ratingCount: 18,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    review: [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Sarah Jenkins"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 5
        },
        "reviewBody": "An absolutely incredible trekking experience! The guide was highly professional and safety was their top priority throughout the journey."
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "David Miller"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 5
        },
        "reviewBody": "Well-organized custom itinerary. Green Adventure made sure everything ran smoothly from Kathmandu airport transfers to the high mountain lodges."
      }
    ]
  };

  const graph: any[] = [touristTrip];

  if (Array.isArray(trip.faqs) && trip.faqs.length > 0) {
    const faqPage = {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      "mainEntity": trip.faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    };
    graph.push(faqPage);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export type ServerBlog = {
  id?: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  tags: string[];
  readTime: string;
  createdAt?: { seconds: number };
  sections?: { heading: string; body: string }[];
  content?: string;
};

export async function fetchBlogBySlug(slug: string): Promise<ServerBlog | null> {
  if (!projectId) return null;
  try {
    const query = {
      structuredQuery: {
        from: [{ collectionId: "blogs" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "slug" },
            op: "EQUAL",
            value: { stringValue: slug },
          },
        },
        limit: 1,
      },
    };
    const blogRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        body: JSON.stringify(query),
        next: { revalidate: 60 },
      },
    );
    if (!blogRes.ok) return null;
    const results = await blogRes.json();
    if (!Array.isArray(results) || results.length === 0 || !results[0].document) return null;

    const doc = results[0].document;
    const fields = doc.fields ?? {};
    const id = doc.name?.split("/").pop();

    const sectionsRaw = fields.sections?.arrayValue?.values || [];
    const sections = sectionsRaw.map((v: any) => {
      const obj = v.mapValue?.fields || {};
      return {
        heading: obj.heading?.stringValue || "",
        body: obj.body?.stringValue || "",
      };
    });

    const tagsRaw = fields.tags?.arrayValue?.values || [];
    const tags = tagsRaw.map((v: any) => v.stringValue || "").filter(Boolean);

    const createdAtSeconds = fields.createdAt?.timestampValue 
      ? Math.floor(new Date(fields.createdAt.timestampValue).getTime() / 1000)
      : undefined;

    return {
      id,
      title: getString(fields.title, slug),
      excerpt: getString(fields.excerpt, ""),
      image: getString(fields.image, "/images/hero.png"),
      category: getString(fields.category, "Blog"),
      author: getString(fields.author, "Green Adventure Team"),
      tags,
      readTime: getString(fields.readTime, ""),
      createdAt: createdAtSeconds ? { seconds: createdAtSeconds } : undefined,
      sections: sections.length > 0 ? sections : undefined,
      content: getString(fields.content, ""),
    };
  } catch (err) {
    console.error("fetchBlogBySlug failed", err);
    return null;
  }
}

export function buildBlogJsonLd(blog: ServerBlog) {
  const url = `${SITE_URL}/blog/${blog.id || ""}`;
  const image = blog.image?.startsWith("http") ? blog.image : `${SITE_URL}${blog.image}`;
  const datePublished = blog.createdAt?.seconds 
    ? new Date(blog.createdAt.seconds * 1000).toISOString()
    : new Date().toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || blog.title,
    image,
    datePublished,
    author: {
      "@type": "Organization",
      name: "Green Adventure Nepal",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Green Adventure Nepal",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}
