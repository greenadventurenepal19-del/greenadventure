import Image from "next/image";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "About Us | Green Adventure",
  description: "Learn about our company story, mission, and our team of experts.",
};

export default function AboutPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image 
          src="/images/annapurna.png" 
          alt="About Us" 
          fill 
          className="object-cover"
          priority
        />
        <div className="container relative z-20 px-4 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Green Adventure</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-200">
            We are passionate about sharing the breathtaking beauty of the Himalayas while promoting responsible and sustainable tourism.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl border border-border">
            <Image src="/images/annapurna.png" alt="Our Story" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground text-lg">
              <p>
                Founded in 2010 by a group of passionate local guides, Green Adventure started with a simple mission: to provide authentic, safe, and unforgettable Himalayan experiences while giving back to the local communities.
              </p>
              <p className="mt-4">
                Over the years, we have grown from a small team organizing local hikes to one of Nepal's most trusted adventure travel companies. We pride ourselves on our deep local knowledge, exceptional safety standards, and commitment to sustainable tourism.
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
              {["Licensed by Government of Nepal", "Members of TAAN & NMA", "100% Local Expert Guides", "Committed to Eco-Tourism"].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-brand-600 dark:text-brand-500" />
                  <span className="font-medium text-lg">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
