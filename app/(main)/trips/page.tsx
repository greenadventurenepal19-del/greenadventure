import Image from "next/image";
import Link from "next/link";
import { Calendar, Star, MapPin, Users, Cloud, Heart, Leaf } from "lucide-react";

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
    difficulty: "challenging",
    category: "Trekking",
    region: "Everest Region",
    groupSize: "Max 12 people",
    desc: "Experience the ultimate adventure to the base of the world's highest peak, surrounded by breathtaking Himalayan scenery and Sherpa culture.",
    tags: [
      { icon: Cloud, label: "Low-carbon" },
      { icon: Users, label: "Local Hire" }
    ],
    slug: "everest-base-camp-trek",
    rating: 4.9,
    reviews: 124
  },
  { 
    title: "Annapurna Base Camp Trek", 
    image: "/images/annapurna.png", 
    price: "$1,150", 
    duration: "12 Days", 
    difficulty: "moderate",
    category: "Trekking",
    region: "Annapurna Region",
    groupSize: "Max 10 people",
    desc: "Trek through diverse landscapes and traditional villages to the heart of the Annapurna Sanctuary, surrounded by towering peaks.",
    tags: [
      { icon: Leaf, label: "Zero Waste" },
      { icon: Heart, label: "Inclusive Growth" }
    ],
    slug: "annapurna-base-camp-trek",
    rating: 4.8,
    reviews: 98
  },
  { 
    title: "Langtang Valley Trek", 
    image: "/images/hero.png", 
    price: "$850", 
    duration: "8 Days", 
    difficulty: "moderate",
    category: "Trekking",
    region: "Langtang Region",
    groupSize: "Max 8 people",
    desc: "Explore the beautiful Valley of Glaciers, experience rich Tamang culture, and enjoy stunning alpine scenery close to Kathmandu.",
    tags: [
      { icon: Users, label: "Local Hire" },
      { icon: Cloud, label: "Low-carbon" }
    ],
    slug: "langtang-valley-trek",
    rating: 4.7,
    reviews: 56
  },
  { 
    title: "Kathmandu Valley Tour", 
    image: "/images/annapurna.png", 
    price: "$450", 
    duration: "4 Days", 
    difficulty: "easy",
    category: "Tours",
    region: "Kathmandu Valley",
    groupSize: "Max 15 people",
    desc: "Discover the rich history, ancient temples, and vibrant culture of Nepal's capital city and its surrounding historic sites.",
    tags: [
      { icon: Heart, label: "Inclusive Growth" },
      { icon: Users, label: "Local Hire" }
    ],
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
              <div 
                key={i}
                className="group relative rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.15)] hover:border-brand-500/30 transition-all duration-500 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={tour.image}
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  
                  {/* Glassmorphic Greenish Difficulty Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500/40 to-brand-500/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20">
                    {tour.difficulty}
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-brand-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                    {tour.category}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-black tracking-tight mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                    {tour.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-2">
                    {tour.desc}
                  </p>
                  
                  {/* Details List */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {tour.region}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" /> {tour.duration}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <Users className="h-4 w-4" /> {tour.groupSize}
                    </div>
                  </div>

                  {/* Sustainability Tags & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-8 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {tour.tags.map((tag, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background/60 backdrop-blur-md border border-border shadow-sm transition-transform hover:scale-105 cursor-default text-foreground">
                          <tag.icon className="h-3.5 w-3.5 opacity-70" /> {tag.label}
                        </span>
                      ))}
                    </div>
                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-full text-xs font-bold shrink-0">
                      <Star className="h-3.5 w-3.5 fill-current" /> {tour.rating}
                    </div>
                  </div>

                  {/* Footer (Price & Button) */}
                  <div className="pt-6 border-t border-border/50 flex items-end justify-between">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">From</span>
                      <span className="text-3xl font-black text-foreground leading-none">{tour.price}</span>
                    </div>
                    <Link 
                      href={`/trips/${tour.slug}`}
                      className="px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-brand-500/25"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
