import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Blog | Green Adventure",
  description: "Read the latest stories, guides, and tips from the Himalayas in the Green Adventure travel blog.",
};

export default function BlogPage() {
  const posts = [
    {
      title: "Top 5 Reasons to Trek the Annapurna Circuit This Year",
      excerpt: "Discover why the Annapurna Circuit remains one of the most spectacular treks in the world, combining diverse landscapes with rich cultural encounters.",
      date: "May 10, 2026",
      category: "Trekking Guides",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80"
    },
    {
      title: "How to Train for Everest Base Camp",
      excerpt: "A comprehensive physical preparation guide to ensure you reach the base of the world's highest peak safely and comfortably.",
      date: "April 28, 2026",
      category: "Preparation",
      image: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80"
    },
    {
      title: "Sustainable Travel: Packing Light and Green",
      excerpt: "Minimize your footprint in the Himalayas. Learn how to pack sustainably and leave nothing but footprints on your next adventure.",
      date: "April 15, 2026",
      category: "Eco-Tourism",
      image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Travel Blog</h1>
        <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Inspiring stories, practical guides, and expert tips to help you plan your ultimate Himalayan adventure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, idx) => (
          <article key={idx} className="group cursor-pointer flex flex-col bg-white dark:bg-[#0a110a] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 hover:border-brand-500/50 transition-all shadow-sm hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden relative">
              {/* Using standard img for quick mockup, standard Next Image should be used with real domains */}
              <img src={post.image} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out" />
              <div className="absolute top-4 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {post.category}
              </div>
            </div>
            <div className="p-8 flex flex-col flex-1">
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-3">{post.date}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-brand-500 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 flex-1">
                {post.excerpt}
              </p>
              <div className="text-brand-500 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Read Article <span aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
