import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export const metadata = {
  title: "Destinations | Green Adventure",
  description: "Explore our breathtaking destinations across the Himalayas and beyond.",
};

const destinations = [
  {
    name: "Nepal",
    image: "/images/everest.png",
    description: "The land of the Himalayas, offering the world's most spectacular trekking routes and rich cultural heritage.",
    tours: 45
  },
  {
    name: "Bhutan",
    image: "/images/annapurna.png",
    description: "The Last Shangri-La, known for its pristine environment, traditional architecture, and Gross National Happiness.",
    tours: 8
  },
  {
    name: "India",
    image: "/images/everest.png",
    description: "A land of incredible diversity, from the towering Indian Himalayas to vibrant cultures and historical monuments.",
    tours: 24
  }
];

export default function DestinationsPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image 
          src="/images/hero.png" 
          alt="Himalayan Destinations" 
          fill 
          className="object-cover"
          priority
        />
        <div className="container relative z-20 px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Destinations</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-200">
            Choose your next adventure from our carefully curated destinations across the majestic Himalayas.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {destinations.map((dest, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden bg-card border border-border shadow-lg flex flex-col md:flex-row h-full">
                <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden shrink-0">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center flex-1">
                  <div className="flex items-center gap-2 text-brand-600 dark:text-brand-500 mb-2 font-medium">
                    <MapPin className="h-4 w-4" /> Destination
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{dest.name}</h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">{dest.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-semibold bg-muted px-4 py-2 rounded-full">{dest.tours} Packages</span>
                    <Link href={`/destinations/${dest.name.toLowerCase()}`} className="text-brand-600 dark:text-brand-500 font-bold hover:gap-2 flex items-center gap-1 transition-all">
                      Explore <ArrowRight className="h-4 w-4" />
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
