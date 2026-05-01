import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mountain, Calendar, Star } from "lucide-react";

export const metadata = {
  title: "Trips & Packages | Green Adventure",
  description: "Browse our comprehensive list of trekking, tours, and adventure packages.",
};

const categories = ["All", "Trekking", "Tours", "Adventure", "Peak Climbing"];

const trips = [
  { 
    title: "Everest Base Camp Trek", 
    image: "/images/everest.png", 
    price: "$1,399", 
    duration: "14 Days", 
    difficulty: "Hard",
    category: "Trekking",
    slug: "everest-base-camp-trek",
    rating: 4.9,
    reviews: 124
  },
  { 
    title: "Annapurna Base Camp Trek", 
    image: "/images/annapurna.png", 
    price: "$1,150", 
    duration: "12 Days", 
    difficulty: "Moderate",
    category: "Trekking",
    slug: "annapurna-base-camp-trek",
    rating: 4.8,
    reviews: 98
  },
  { 
    title: "Langtang Valley Trek", 
    image: "/images/hero.png", 
    price: "$850", 
    duration: "8 Days", 
    difficulty: "Moderate",
    category: "Trekking",
    slug: "langtang-valley-trek",
    rating: 4.7,
    reviews: 56
  },
  { 
    title: "Kathmandu Valley Tour", 
    image: "/images/annapurna.png", 
    price: "$450", 
    duration: "4 Days", 
    difficulty: "Easy",
    category: "Tours",
    slug: "kathmandu-valley-tour",
    rating: 4.6,
    reviews: 42
  }
];

export default function TripsPage() {
  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image 
          src="/images/hero.png" 
          alt="Our Trips" 
          fill 
          className="object-cover"
          priority
        />
        <div className="container relative z-20 px-4 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Trips & Packages</h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 text-gray-200">
            Find the perfect adventure tailored to your interests, schedule, and experience level.
          </p>
          
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat, i) => (
              <button 
                key={cat}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  i === 0 
                    ? "bg-brand-600 text-white" 
                    : "bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((tour, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden bg-card border border-border shadow-lg flex flex-col">
                <Link href={`/trips/${tour.slug}`} className="flex flex-col h-full">
                  <div className="relative h-64 w-full overflow-hidden shrink-0">
                    <Image
                      src={tour.image}
                      alt={tour.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg text-foreground">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {tour.rating} ({tour.reviews})
                    </div>
                    <div className="absolute top-4 left-4 bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {tour.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-500 transition-colors line-clamp-2">{tour.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground mb-6 mt-auto">
                      <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg"><Calendar className="h-4 w-4"/> {tour.duration}</div>
                      <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg"><Mountain className="h-4 w-4"/> {tour.difficulty}</div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                      <div className="text-sm text-muted-foreground">From <span className="text-2xl font-bold text-foreground block">{tour.price}</span></div>
                      <div className="h-12 w-12 rounded-full bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-500 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
