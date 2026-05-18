import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, Mountain, DollarSign, Activity, 
  Map, CheckCircle, XCircle, ChevronDown, Star,
  MapPin, Clock, TrendingUp, Leaf, Cloud, Users, Heart, MessageCircle, Compass, ArrowRight
} from "lucide-react";
import TripBookingWidget from "@/components/TripBookingWidget";
import TripBookingModalWrapper from "@/components/TripBookingModalWrapper";
import FaqAccordion from "@/components/FaqAccordion";
import ScrollReveal from "@/components/ScrollReveal";
import { fetchTripBySlug, buildTripJsonLd } from "@/lib/trip-server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const fallbackTitle = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const trip = await fetchTripBySlug(slug);
  const title = trip?.title || fallbackTitle;
  const description = trip?.description?.slice(0, 160)
    || `${title} — guided Himalayan trek in ${trip?.region || "Nepal"} by Green Adventure. ${trip?.duration ? trip.duration + ". " : ""}${trip?.altitude ? "Max altitude " + trip.altitude + ". " : ""}Book today for an unforgettable journey.`;
  const image = trip?.image && (trip.image.startsWith("http") ? trip.image : trip.image);
  return {
    title,
    description,
    alternates: { canonical: `/trekking/${slug}` },
    openGraph: {
      title,
      description,
      url: `/trekking/${slug}`,
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

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const defaultTitle = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  
  let trip: any = null;
  let relatedTrips: any[] = [];
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Fetch Contact Info Settings (only show what admin has saved)
  let contactSettings: any = {
    phonePrimary: "",
    phoneWhatsapp: "",
    emailPrimary: ""
  };

  try {
    if (projectId) {
      // 1. Fetch Contact Info
      const contactRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/contact_info`, { 
        next: { revalidate: 3600 } 
      });
      if (contactRes.ok) {
        const data = await contactRes.json();
        if (data.fields) {
          if (data.fields.phonePrimary?.stringValue) contactSettings.phonePrimary = data.fields.phonePrimary.stringValue;
          if (data.fields.phoneWhatsapp?.stringValue) contactSettings.phoneWhatsapp = data.fields.phoneWhatsapp.stringValue;
          if (data.fields.emailPrimary?.stringValue) contactSettings.emailPrimary = data.fields.emailPrimary.stringValue;
        }
      }

      // 2. Fetch Trip by Slug
      const query = {
        structuredQuery: {
          from: [{ collectionId: "trips" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "slug" },
              op: "EQUAL",
              value: { stringValue: slug }
            }
          },
          limit: 1
        }
      };

      const tripRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`, {
        method: "POST",
        body: JSON.stringify(query),
        next: { revalidate: 60 }
      });

      if (tripRes.ok) {
        const results = await tripRes.json();
        if (results && results.length > 0 && results[0].document) {
          const fields = results[0].document.fields;
          
          // Helper to safely extract Firestore fields
          const getString = (field: any, defaultVal = "") => field?.stringValue || defaultVal;
          const getNumber = (field: any, defaultVal = 0) => field?.doubleValue || field?.integerValue || defaultVal;
          
          trip = {
            id: results[0].document.name.split('/').pop(),
            title: getString(fields.title, defaultTitle),
            image: getString(fields.image, "/images/everest.png"),
            region: getString(fields.region, "Himalayas"),
            duration: getString(fields.duration, "Custom Days"),
            difficulty: getString(fields.difficulty, "Moderate"),
            altitude: getString(fields.altitude, "TBD"),
            price: getString(fields.price, "On Request"),
            rating: getNumber(fields.rating, 4.8).toString(),
            tripType: getString(fields.tripType, "Trekking"),
            isFeatured: fields.isFeatured?.booleanValue || false,
            overview: getString(fields.overview, `Welcome to the ${defaultTitle}. This is an incredible journey through some of the most beautiful landscapes in the world.\n\nContact us to customize this itinerary.`).split('\n').filter((p: string) => p.trim() !== ''),
            includes: Array.isArray(fields.includes?.arrayValue?.values)
              ? fields.includes.arrayValue.values.map((v: any) => v.stringValue || '').filter(Boolean)
              : getString(fields.includes, "Airport pickups and drops\nAccommodation\nMeals").split('\n').filter((p: string) => p.trim() !== ''),
            excludes: Array.isArray(fields.excludes?.arrayValue?.values)
              ? fields.excludes.arrayValue.values.map((v: any) => v.stringValue || '').filter(Boolean)
              : getString(fields.excludes, "International flights\nPersonal expenses\nTips").split('\n').filter((p: string) => p.trim() !== ''),
            faqs: fields.faqs?.arrayValue?.values?.map((v: any) => {
              const obj = v.mapValue.fields;
              const getString = (field: any, defaultVal = "") => field?.stringValue || defaultVal;
              return {
                q: getString(obj.q, "Question?"),
                a: getString(obj.a, "Answer.")
              };
            }) || [],
            itinerary: fields.itinerary?.arrayValue?.values?.map((v: any) => {
              const obj = v.mapValue.fields;
              return {
                day: getString(obj.day, "Day X"),
                title: getString(obj.title, "Activity"),
                desc: getString(obj.desc, "Description")
              };
            }) || [
              { day: "Day 1", title: "Arrival", desc: "Welcome and briefing." },
              { day: "Day 2", title: "Start Activity", desc: "Beginning of the adventure." },
              { day: "Day X", title: "Departure", desc: "End of the trip." }
            ]
          };
        }
      }
    }

      // 3. Fetch Related Featured Trips
      if (trip && trip.region) {
        const relatedQuery = {
          structuredQuery: {
            from: [{ collectionId: "trips" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "region" },
                op: "EQUAL",
                value: { stringValue: trip.region }
              }
            },
            limit: 20
          }
        };
        const relatedRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`, {
          method: "POST",
          body: JSON.stringify(relatedQuery),
          next: { revalidate: 60 }
        });
        if (relatedRes.ok) {
          const resJson = await relatedRes.json();
          const parsed = resJson.filter((r: any) => r.document).map((r: any) => {
             const f = r.document.fields;
             const isF = f.isFeatured?.booleanValue || false;
             const sl = f.slug?.stringValue || r.document.name.split('/').pop();
             return {
                id: r.document.name.split('/').pop(),
                title: f.title?.stringValue || "",
                image: f.image?.stringValue || "",
                region: f.region?.stringValue || "",
                slug: sl,
                duration: f.duration?.stringValue || "",
                difficulty: f.difficulty?.stringValue || "",
                price: f.price?.stringValue || "",
                isFeatured: isF,
                tripType: f.tripType?.stringValue || "",
             };
          });
          relatedTrips = parsed.filter((t: any) => t.isFeatured && t.slug !== slug && (t.tripType || "").toLowerCase() === (trip.tripType || "").toLowerCase()).slice(0, 3);
        }
      }
  } catch (error) {
    console.error("Failed to fetch data via REST", error);
  }

  // Fallback if trip not found
  if (!trip) {
    trip = {
      title: defaultTitle,
      image: "/images/everest.png",
      region: "Himalayas",
      duration: "Custom",
      difficulty: "Moderate",
      altitude: "TBD",
      price: "On Request",
      rating: "4.8",
      tripType: "Trekking",
      overview: [
        `Welcome to the ${defaultTitle}. This is an incredible journey through some of the most beautiful landscapes in the world.`,
        "Contact us to customize this itinerary to perfectly match your preferences and physical fitness level."
      ],
      includes: ["Guide and support staff", "Necessary permits", "Accommodation"],
      excludes: ["International flights", "Personal expenses", "Travel insurance"],
      faqs: [],
      itinerary: [
        { day: "Day 1", title: "Arrival", desc: "Welcome and briefing about the trip." },
        { day: "Day 2", title: "Start Activity", desc: "Beginning of the adventure." },
        { day: "Day X", title: "Conclusion", desc: "End of the trip and departure." }
      ]
    };
  }
  
  const jsonLd = buildTripJsonLd(
    {
      id: trip.id || slug,
      title: trip.title,
      image: trip.image,
      region: trip.region,
      duration: trip.duration,
      difficulty: trip.difficulty,
      altitude: trip.altitude,
      price: trip.price,
      rating: Number(trip.rating) || 4.8,
      tripType: trip.tripType,
      overview: Array.isArray(trip.overview) ? trip.overview : [],
      description: Array.isArray(trip.overview) ? trip.overview[0] || "" : "",
    },
    "trekking",
  );

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. HERO IMAGE & TITLE */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
        <Image 
          src={trip.image} 
          alt={trip.title} 
          fill 
          className="object-cover"
          priority
        />
        <div className="container relative z-20 px-4 pb-16">
          <div className="flex gap-2 mb-4">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {trip.tripType === "Trekking" ? "Trekking" : "Tour"}
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
              <Star className="h-3 w-3 fill-white" /> {trip.rating}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {trip.title}
          </h1>

          {/* Trip Detail Tags */}
          <div className="flex flex-wrap gap-3 mb-3">
            <span className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <MapPin className="h-4 w-4 text-white/70" /> {trip.region}
            </span>
            <span className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <Clock className="h-4 w-4 text-white/70" /> {trip.duration}
            </span>
            <span className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <TrendingUp className="h-4 w-4 text-white/70" /> {trip.difficulty}
            </span>
          </div>

          {/* Sustainability Tags */}
          {trip.tags && trip.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-10">
              {trip.tags.map((tag: any, idx: number) => {
                const isString = typeof tag === 'string';
                const label = isString ? tag : tag.label;
                const tagStr = label.toLowerCase();
                let Icon = Leaf;
                if (tagStr.includes('cultur') || tagStr.includes('local') || tagStr.includes('histor')) Icon = Compass;
                else if (tagStr.includes('spirit') || tagStr.includes('well') || tagStr.includes('honeymoon')) Icon = Heart;
                else if (tagStr.includes('wild') || tagStr.includes('animal')) Icon = Cloud;
                else if (tagStr.includes('famil') || tagStr.includes('group')) Icon = Users;
                else if (!isString && tag.icon) Icon = tag.icon;

                return (
                  <span key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                    <Icon className="h-4 w-4" /> {label}
                  </span>
                );
              })}
            </div>
          )}
          {(!trip.tags || trip.tags.length === 0) && (
            <div className="mb-10"></div>
          )}

          <TripBookingModalWrapper
            tripTitle={trip.title}
            tripSlug={slug}
            price={trip.price}
            contactSettings={contactSettings}
          />
        </div>
      </section>

      {/* 2. QUICK INFO BAR */}
      <section className="relative z-30 -mt-8">
        <div className="container mx-auto px-4">
          <div className="bg-card shadow-xl rounded-2xl p-6 border border-border grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-border">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Calendar className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Duration</span>
              <span className="text-xl font-bold">{trip.duration}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <DollarSign className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Price</span>
              <span className="text-xl font-bold">${trip.price?.replace(/usd|\$|per person|\/ person/gi, '').trim()} <span className="text-sm font-normal text-muted-foreground">/ person</span></span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Activity className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Difficulty</span>
              <span className="text-xl font-bold">{trip.difficulty}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Mountain className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Max Altitude</span>
              <span className="text-xl font-bold">{trip.altitude}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONTENT SECTIONS */}
      <section className="py-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="w-full lg:w-2/3 space-y-16">
            
            {/* Overview */}
            <ScrollReveal>
            <div id="overview" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6 uppercase">Over<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">view</span></h2>
              <div className="prose dark:prose-invert max-w-none text-lg text-muted-foreground leading-relaxed">
                {trip.overview.map((paragraph: string, idx: number) => (
                  <p key={idx} className={idx > 0 ? "mt-4" : ""}>{paragraph}</p>
                ))}
              </div>
            </div>
            </ScrollReveal>

            {/* Itinerary */}
            <ScrollReveal delay={0.1}>
            <div id="itinerary" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6 uppercase">Day-by-Day <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Itinerary</span></h2>
              <div className="space-y-4">
                {trip.itinerary.map((item: any) => (
                  <div key={item.day} className="border border-border rounded-2xl overflow-hidden bg-card">
                    <button className="w-full p-6 flex items-center justify-between font-bold text-lg hover:bg-muted/50 transition-colors text-left">
                      <span className="flex items-center gap-4">
                        <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-500 px-3 py-1 rounded-lg text-sm whitespace-nowrap">Day {item.day}</span>
                        {item.title}
                      </span>
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    </button>
                    <div className="p-6 pt-0 text-muted-foreground border-t border-border">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </ScrollReveal>

            {/* Includes / Excludes */}
            <ScrollReveal delay={0.15}>
            <div id="includes" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6 uppercase">Cost <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Includes & Excludes</span></h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-2xl border border-green-100 dark:border-green-900/50">
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-500 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" /> Includes
                  </h3>
                  <ul className="space-y-3">
                    {trip.includes.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/50">
                  <h3 className="text-xl font-bold text-red-700 dark:text-red-500 mb-4 flex items-center gap-2">
                    <XCircle className="h-6 w-6" /> Excludes
                  </h3>
                  <ul className="space-y-3">
                    {trip.excludes.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            </ScrollReveal>


          </div>

          {/* Sticky Sidebar */}
          <div className="w-full lg:w-1/3">
            <div id="booking-widget" className="sticky top-32 space-y-8 scroll-mt-32">
              {/* Booking Widget */}
              <TripBookingWidget 
                tripTitle={trip.title} 
                tripSlug={slug} 
                price={trip.price} 
              />

              {/* Need Help */}
              {(contactSettings.phonePrimary || contactSettings.emailPrimary) && (
                <div className="bg-muted rounded-3xl p-8 text-center border border-border">
                  <h3 className="font-bold text-xl mb-2">Need Help?</h3>
                  <p className="text-muted-foreground mb-6">Contact our travel experts</p>
                  {contactSettings.phonePrimary && (
                    <a href={`tel:${contactSettings.phonePrimary.replace(/[^0-9+]/g, '')}`} className="block text-xl font-bold text-brand-600 dark:text-brand-500 hover:underline mb-2">
                      {contactSettings.phonePrimary}
                    </a>
                  )}
                  {contactSettings.emailPrimary && (
                    <a href={`mailto:${contactSettings.emailPrimary}`} className="block text-foreground hover:underline break-all">
                      {contactSettings.emailPrimary}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
      {/* 3.5 FAQs SECTION */}
      {trip.faqs && trip.faqs.length > 0 && (
        <section className="py-24 relative z-10 border-t border-border/30">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-brand-500/5 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 uppercase">
                Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Questions</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                Everything you need to know about this trek.
              </p>
            </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <FaqAccordion faqs={trip.faqs} />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 4. RELATED TRIPS */}
      {relatedTrips.length > 0 && (
        <section className="py-24 relative z-10 border-t border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <ScrollReveal>
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 uppercase">
                  Related <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Treks</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                  Explore more featured treks in {trip.region}.
                </p>
              </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <Link
                  href="/trekking"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold hover:bg-brand-500 hover:text-white transition-all group border border-brand-500/20 shadow-md backdrop-blur-sm"
                >
                  View All Treks
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </ScrollReveal>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedTrips.map((rt: any, i: number) => (
                <ScrollReveal key={rt.id} delay={i * 0.1}>
                <Link href={`/${rt.tripType?.toLowerCase() === 'trekking' ? 'trekking' : 'tours'}/${rt.slug}`} className="group relative rounded-[2rem] overflow-hidden shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.15)] hover:border-brand-500/30 border border-border/50 block h-[400px] transition-all duration-500">
                  <Image src={rt.image || "/images/everest.png"} alt={rt.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                    <span className="text-brand-400 font-bold text-sm tracking-wider uppercase mb-2">{rt.region}</span>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-brand-300 transition-colors">{rt.title}</h3>
                    <div className="flex items-center gap-4 text-white/80 text-sm">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {rt.duration}</span>
                      <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> {rt.difficulty}</span>
                    </div>
                  </div>
                </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
