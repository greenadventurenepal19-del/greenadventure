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

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description,
    url,
    image,
    touristType: basePath === "trekking" ? "Trekkers and adventure travelers" : "Cultural and leisure travelers",
    itinerary: {
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
      availability: "https://schema.org/InStock",
    },
    aggregateRating: trip.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: trip.rating,
          ratingCount: 12,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}
