import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, Mountain, DollarSign, Activity, 
  Map, CheckCircle, XCircle, ChevronDown, Star 
} from "lucide-react";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const title = params.slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${title} | Green Adventure`,
  };
}

export default function TripDetailPage({ params }: { params: { slug: string } }) {
  const title = params.slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <div className="pb-24">
      {/* 1. HERO IMAGE & TITLE */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
        <Image 
          src="/images/everest.png" 
          alt={title} 
          fill 
          className="object-cover"
          priority
        />
        <div className="container relative z-20 px-4 pb-16">
          <div className="flex gap-2 mb-4">
            <span className="bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">Trekking</span>
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
              <Star className="h-3 w-3 fill-white" /> 4.9
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link href="#book" className="px-8 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all">
              Book Now
            </Link>
            <Link href="#customize" className="px-8 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold transition-all">
              Customize Trip
            </Link>
          </div>
        </div>
      </section>

      {/* 2. QUICK INFO BAR */}
      <section className="relative z-30 -mt-8">
        <div className="container mx-auto px-4">
          <div className="bg-card shadow-xl rounded-2xl p-6 border border-border grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-border">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Calendar className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Duration</span>
              <span className="text-xl font-bold">14 Days</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <DollarSign className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Price</span>
              <span className="text-xl font-bold">$1,399 <span className="text-sm font-normal text-muted-foreground">/ person</span></span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Activity className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Difficulty</span>
              <span className="text-xl font-bold">Hard</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Mountain className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Max Altitude</span>
              <span className="text-xl font-bold">5,545 m</span>
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
            <div id="overview" className="scroll-mt-32">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <div className="prose dark:prose-invert max-w-none text-lg text-muted-foreground">
                <p>
                  The Everest Base Camp trek is the adventure of a lifetime, a journey for those whose dreams soar higher than the clouds. This classic trek takes you through the heart of the Khumbu region, offering unparalleled views of the world's highest peaks, including Mt. Everest, Lhotse, Nuptse, and Ama Dablam.
                </p>
                <p className="mt-4">
                  Along the way, you'll immerse yourself in the rich Sherpa culture, visit ancient monasteries, and walk through picturesque villages. The trail winds through lush rhododendron forests and barren, dramatic landscapes as you ascend higher into the Himalayas.
                </p>
              </div>
            </div>

            {/* Itinerary */}
            <div id="itinerary" className="scroll-mt-32">
              <h2 className="text-3xl font-bold mb-6">Day-by-Day Itinerary</h2>
              <div className="space-y-4">
                {[
                  { day: 1, title: "Arrival in Kathmandu (1,400m)", desc: "Welcome to Nepal! Upon your arrival at Tribhuvan International Airport, our representative will greet you and transfer you to your hotel." },
                  { day: 2, title: "Fly to Lukla (2,860m) and Trek to Phakding (2,610m)", desc: "A thrilling 30-minute flight to Lukla starts our trek. We walk for about 3 hours to reach Phakding." },
                  { day: 3, title: "Trek to Namche Bazaar (3,440m)", desc: "We enter the Sagarmatha National Park and cross suspension bridges to reach the Sherpa capital." },
                ].map((item) => (
                  <div key={item.day} className="border border-border rounded-2xl overflow-hidden bg-card">
                    <button className="w-full p-6 flex items-center justify-between font-bold text-lg hover:bg-muted/50 transition-colors text-left">
                      <span className="flex items-center gap-4">
                        <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-500 px-3 py-1 rounded-lg text-sm">Day {item.day}</span>
                        {item.title}
                      </span>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <div className="p-6 pt-0 text-muted-foreground border-t border-border">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Includes / Excludes */}
            <div id="includes" className="scroll-mt-32">
              <h2 className="text-3xl font-bold mb-6">Cost Includes & Excludes</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-2xl border border-green-100 dark:border-green-900/50">
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-500 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" /> Includes
                  </h3>
                  <ul className="space-y-3">
                    {["Airport pickups and drops", "3 nights hotel in Kathmandu", "All meals during the trek", "Experienced English-speaking guide", "Flight: Kathmandu-Lukla-Kathmandu"].map(item => (
                      <li key={item} className="flex items-start gap-2 text-muted-foreground">
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
                    {["International airfare", "Nepal entry visa", "Travel insurance", "Personal expenses", "Tips for guide and porters"].map(item => (
                      <li key={item} className="flex items-start gap-2 text-muted-foreground">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Route Map Placeholder */}
            <div id="map" className="scroll-mt-32">
              <h2 className="text-3xl font-bold mb-6">Route Map</h2>
              <div className="bg-muted h-[400px] rounded-3xl border border-border flex flex-col items-center justify-center text-muted-foreground relative overflow-hidden">
                <Map className="h-16 w-16 mb-4 opacity-50" />
                <p>Interactive Map Component</p>
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[2px]">
                   <span className="bg-background px-6 py-3 rounded-full font-bold border border-border shadow-lg">Map integration pending</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-32 space-y-8">
              {/* Booking Widget */}
              <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-2">Book This Trip</h3>
                <p className="text-muted-foreground mb-6">Secure your spot for the {title}</p>
                
                <div className="text-3xl font-bold mb-6 border-b border-border pb-6">
                  $1,399 <span className="text-base font-normal text-muted-foreground">/ person</span>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Select Date</label>
                    <input type="date" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Travelers</label>
                    <select className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none">
                      <option>1 Person</option>
                      <option>2 Persons</option>
                      <option>3-5 Persons</option>
                    </select>
                  </div>
                  <button type="button" className="w-full p-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/25 mt-4">
                    Book Now
                  </button>
                  <button type="button" className="w-full p-4 rounded-xl bg-background border border-border hover:bg-muted text-foreground font-bold transition-all">
                    Inquire / Customize
                  </button>
                </form>
              </div>

              {/* Need Help */}
              <div className="bg-muted rounded-3xl p-8 text-center border border-border">
                <h3 className="font-bold text-xl mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-6">Contact our travel experts</p>
                <a href="tel:+9771234567" className="block text-xl font-bold text-brand-600 dark:text-brand-500 hover:underline mb-2">
                  +977 1 4412345
                </a>
                <a href="mailto:info@greenadventure.com" className="block text-foreground hover:underline">
                  info@greenadventure.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
