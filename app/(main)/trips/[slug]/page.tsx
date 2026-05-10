import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, Mountain, DollarSign, Activity, 
  Map, CheckCircle, XCircle, ChevronDown, Star,
  MapPin, Clock, TrendingUp, Leaf, Cloud, Users, Heart, MessageCircle
} from "lucide-react";
import TripBookingWidget from "@/components/TripBookingWidget";

const tripData: Record<string, any> = {
  "annapurna-base-camp-trek": {
    title: "Annapurna Base Camp Trek",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2074&auto=format&fit=crop",
    region: "Annapurna Region",
    duration: "14 Days",
    difficulty: "Moderate to Hard",
    altitude: "4,130 m",
    price: "$1,199",
    rating: "4.9",
    overview: [
      "The Annapurna Base Camp Trek is one of the most popular and breathtaking treks in the world. This journey takes you through diverse landscapes, from lush rhododendron forests and terraced farmlands to high-altitude landscapes surrounded by snow-capped peaks.",
      "You will reach the base camp of Mt. Annapurna (8,091m), the 10th highest mountain in the world, standing face-to-face with a spectacular 360-degree panorama of the Annapurna massif."
    ],
    itinerary: [
      { day: 1, title: "Arrival in Kathmandu", desc: "Welcome to Nepal! Upon your arrival at Tribhuvan International Airport, our representative will greet you and transfer you to your hotel." },
      { day: 2, title: "Drive to Pokhara", desc: "A scenic 6-7 hour drive along the Trishuli river brings us to the beautiful lake city of Pokhara." },
      { day: 3, title: "Drive to Nayapul and Trek to Tikhedhunga", desc: "We start our trek with a gentle walk through villages and terraced fields." },
      { day: 4, title: "Trek to Ghorepani", desc: "A steep ascent with thousands of stone steps takes us through rhododendron forests to Ghorepani." },
      { day: 5, title: "Poon Hill Sunrise and Trek to Tadapani", desc: "Early morning hike to Poon Hill for a stunning sunrise over the Himalayas, followed by a trek to Tadapani." },
      { day: 6, title: "Trek to Chhomrong", desc: "We descend through forests and cross a suspension bridge to reach the large Gurung village of Chhomrong." },
      { day: 7, title: "Trek to Dovan", desc: "The trail descends to the Chhomrong Khola, then climbs steeply up through bamboo and rhododendron forests." },
      { day: 8, title: "Trek to Machhapuchhre Base Camp", desc: "The valley narrows as we ascend past the Hinku Cave towards MBC, with spectacular views of Machhapuchhre (Fishtail)." },
      { day: 9, title: "Trek to Annapurna Base Camp", desc: "A short trek takes us into the Annapurna Sanctuary to ABC, surrounded by towering peaks." },
      { day: 10, title: "Trek to Bamboo", desc: "After watching the sunrise over the Annapurna range, we retrace our steps down to Bamboo." },
      { day: 11, title: "Trek to Jhinu Danda", desc: "We trek back to Chhomrong and descend to Jhinu Danda, where you can relax in natural hot springs." },
      { day: 12, title: "Trek to Nayapul and Drive to Pokhara", desc: "Our final day of trekking brings us back to Nayapul, followed by a drive to Pokhara." },
      { day: 13, title: "Drive back to Kathmandu", desc: "We drive back to Kathmandu, where you can spend the evening exploring or shopping for souvenirs." },
      { day: 14, title: "Departure", desc: "Transfer to the airport for your flight home. Farewell!" }
    ]
  },
  "everest-base-camp-trek": {
    title: "Everest Base Camp Trek",
    image: "/images/everest.png",
    region: "Everest Region",
    duration: "14 Days",
    difficulty: "Hard",
    altitude: "5,545 m",
    price: "$1,399",
    rating: "4.9",
    overview: [
      "The Everest Base Camp trek is the adventure of a lifetime, a journey for those whose dreams soar higher than the clouds. This classic trek takes you through the heart of the Khumbu region, offering unparalleled views of the world's highest peaks.",
      "Along the way, you'll immerse yourself in the rich Sherpa culture, visit ancient monasteries, and walk through picturesque villages. The trail winds through lush rhododendron forests and barren, dramatic landscapes as you ascend higher into the Himalayas."
    ],
    itinerary: [
      { day: 1, title: "Arrival in Kathmandu (1,400m)", desc: "Welcome to Nepal! Upon your arrival at Tribhuvan International Airport, our representative will greet you and transfer you to your hotel." },
      { day: 2, title: "Fly to Lukla (2,860m) and Trek to Phakding (2,610m)", desc: "A thrilling 30-minute flight to Lukla starts our trek. We walk for about 3 hours to reach Phakding." },
      { day: 3, title: "Trek to Namche Bazaar (3,440m)", desc: "We enter the Sagarmatha National Park and cross suspension bridges to reach the Sherpa capital." },
      { day: 4, title: "Acclimatization Day at Namche", desc: "A rest day for acclimatization. We can hike to the Everest View Hotel for panoramic mountain views." },
      { day: 5, title: "Trek to Tengboche (3,860m)", desc: "We trek through forests and across rivers to reach Tengboche, home to the famous Tengboche Monastery." },
      { day: 6, title: "Trek to Dingboche (4,410m)", desc: "The trail climbs through birch and rhododendron forests, opening up to high-altitude landscapes." },
      { day: 7, title: "Acclimatization Day at Dingboche", desc: "Another important rest day. We can hike to Nangkartshang Peak for better acclimatization and views." },
      { day: 8, title: "Trek to Lobuche (4,940m)", desc: "We trek past the Khumbu Glacier terminal moraine, passing the memorials for climbers who lost their lives on Everest." },
      { day: 9, title: "Trek to Gorak Shep and EBC (5,364m)", desc: "The big day! We trek to Gorak Shep, drop our bags, and continue to Everest Base Camp." },
      { day: 10, title: "Hike Kala Patthar (5,545m) and Trek to Pheriche", desc: "Early morning hike to Kala Patthar for the best sunrise views of Everest, then descend to Pheriche." },
      { day: 11, title: "Trek to Namche Bazaar", desc: "We continue our descent back through the familiar trails of the Khumbu region." },
      { day: 12, title: "Trek to Lukla", desc: "Our final day of trekking brings us back to Lukla, where we celebrate the end of our journey." },
      { day: 13, title: "Fly back to Kathmandu", desc: "A scenic morning flight back to Kathmandu. Free day to relax or explore." },
      { day: 14, title: "Departure", desc: "Transfer to the airport for your onward flight." }
    ]
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const title = resolvedParams.slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${title} | Green Adventure`,
  };
}

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const defaultTitle = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  
  const trip = tripData[slug] || {
    title: defaultTitle,
    image: "/images/everest.png",
    region: "Himalayas",
    duration: "Custom",
    difficulty: "Moderate",
    altitude: "TBD",
    price: "On Request",
    rating: "4.8",
    overview: [
      `Welcome to the ${defaultTitle}. This is an incredible journey through some of the most beautiful landscapes in the world.`,
      "Contact us to customize this itinerary to perfectly match your preferences and physical fitness level."
    ],
    itinerary: [
      { day: 1, title: "Arrival", desc: "Welcome and briefing about the trip." },
      { day: 2, title: "Start Trek", desc: "Beginning of the adventure." },
      { day: 3, title: "Conclusion", desc: "End of the trip and departure." }
    ]
  };

  // Fetch Contact Info Settings for Need Help section
  let contactSettings: any = {
    phonePrimary: "+977 1 4412345",
    phoneWhatsapp: "+977 9801234567",
    emailPrimary: "info@greenadventure.com"
  };

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/contact_info`, { 
        next: { revalidate: 3600 } 
      });
      if (res.ok) {
        const data = await res.json();
        if (data.fields) {
          if (data.fields.phonePrimary?.stringValue) contactSettings.phonePrimary = data.fields.phonePrimary.stringValue;
          if (data.fields.phoneWhatsapp?.stringValue) contactSettings.phoneWhatsapp = data.fields.phoneWhatsapp.stringValue;
          if (data.fields.emailPrimary?.stringValue) contactSettings.emailPrimary = data.fields.emailPrimary.stringValue;
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch contact settings via REST", error);
  }
  
  return (
    <div className="pb-24">
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
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">Trekking</span>
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
          <div className="flex flex-wrap gap-3 mb-10">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <Leaf className="h-4 w-4" /> Zero Waste
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <Cloud className="h-4 w-4" /> Low-carbon
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <Users className="h-4 w-4" /> Local Hire
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <Heart className="h-4 w-4" /> Inclusive Growth
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="#booking-widget" className="px-8 py-3 rounded-full bg-white text-black font-semibold transition-all hover:bg-gray-100 shadow-xl">
              Book Now
            </Link>
            <Link href="#booking-widget" className="px-8 py-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md text-white font-semibold transition-all shadow-xl">
              Customize Trip
            </Link>
            {contactSettings.phoneWhatsapp && (
              <a
                href={`https://wa.me/${contactSettings.phoneWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I am interested in the ${trip.title} trip.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-full bg-[#25D366]/80 hover:bg-[#25D366] border border-[#25D366]/20 backdrop-blur-md text-white font-semibold transition-all shadow-xl flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
            )}
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
              <span className="text-xl font-bold">{trip.duration}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <DollarSign className="h-8 w-8 text-brand-600 dark:text-brand-500 mb-2" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Price</span>
              <span className="text-xl font-bold">{trip.price} <span className="text-sm font-normal text-muted-foreground">/ person</span></span>
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
            <div id="overview" className="scroll-mt-32">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <div className="prose dark:prose-invert max-w-none text-lg text-muted-foreground">
                {trip.overview.map((paragraph: string, idx: number) => (
                  <p key={idx} className={idx > 0 ? "mt-4" : ""}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div id="itinerary" className="scroll-mt-32">
              <h2 className="text-3xl font-bold mb-6">Day-by-Day Itinerary</h2>
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

            {/* Includes / Excludes */}
            <div id="includes" className="scroll-mt-32">
              <h2 className="text-3xl font-bold mb-6">Cost Includes & Excludes</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-2xl border border-green-100 dark:border-green-900/50">
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-500 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" /> Includes
                  </h3>
                  <ul className="space-y-3">
                    {["Airport pickups and drops", "3 nights hotel in Kathmandu", "All meals during the trek", "Experienced English-speaking guide", "Required permits and fees"].map(item => (
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
            <div id="booking-widget" className="sticky top-32 space-y-8 scroll-mt-32">
              {/* Booking Widget */}
              <TripBookingWidget 
                tripTitle={trip.title} 
                tripSlug={slug} 
                price={trip.price} 
              />

              {/* Need Help */}
              <div className="bg-muted rounded-3xl p-8 text-center border border-border">
                <h3 className="font-bold text-xl mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-6">Contact our travel experts</p>
                <a href={`tel:${contactSettings.phonePrimary?.replace(/[^0-9+]/g, '')}`} className="block text-xl font-bold text-brand-600 dark:text-brand-500 hover:underline mb-2">
                  {contactSettings.phonePrimary}
                </a>
                <a href={`mailto:${contactSettings.emailPrimary}`} className="block text-foreground hover:underline">
                  {contactSettings.emailPrimary}
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

