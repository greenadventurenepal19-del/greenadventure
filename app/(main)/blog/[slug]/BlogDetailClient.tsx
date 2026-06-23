"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, User, Tag, BookOpen,
  ArrowRight, Share2, Link2, CheckCircle,
  ChevronRight,
} from "lucide-react";

/* ── Helpers ────────────────────────────────────────────────────── */
function formatDate(ts: any) {
  if (!ts) return "";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/* ── Reading progress bar ───────────────────────────────────────── */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <motion.div
      style={{ width }}
      className="fixed top-0 left-0 z-[60] h-1 bg-gradient-to-r from-brand-500 to-brand-700 origin-left"
    />
  );
}

/* ── Copy link button ───────────────────────────────────────────── */
function CopyLinkBtn() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-brand-500 transition-colors">
      {copied ? <CheckCircle className="w-4 h-4 text-brand-500" /> : <Link2 className="w-4 h-4" />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

export default function BlogDetailClient({ initialPost, initialRelated }: { initialPost: any; initialRelated: any[] }) {
  const [post] = useState<any>(initialPost);
  const [related] = useState<any[]>(initialRelated);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);

  /* ── 404 ─────────────────────────────────────────────────────── */
  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
        <BookOpen className="w-20 h-20 text-brand-500/20" />
        <h1 className="text-4xl font-black">Article Not Found</h1>
        <p className="text-muted-foreground max-w-sm">This article doesn&apos;t exist or may have been removed.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-500 transition-all hover:scale-105">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const hasSections = Array.isArray(post.sections) && post.sections.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <ReadingProgress />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-[75vh] min-h-[520px] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          <Image
            src={post.image || "/images/hero.png"}
            alt={post.title}
            fill
            className="object-cover object-center"
            priority
          />
        </motion.div>
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Back nav */}
        <div className="absolute top-6 left-0 right-0 z-20 container mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft className="w-4 h-4" /> All Articles
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 container mx-auto px-4 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Category + read time */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="bg-brand-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                {post.category || "Blog"}
              </span>
              {post.readTime && (
                <span className="flex items-center gap-1.5 text-white/70 text-sm font-medium">
                  <Clock className="w-4 h-4" /> {post.readTime}
                </span>
              )}
            </div>
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6 drop-shadow-2xl">
              {post.title}
            </h1>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-5 text-white/60 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-brand-400" />
                </div>
                <span className="font-medium text-white/80">{post.author || "Green Adventure Team"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {formatDate(post.createdAt)}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Article Layout ─────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Excerpt callout */}
          {post.excerpt && (
            <motion.blockquote
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="border-l-4 border-brand-500 bg-gradient-to-r from-brand-500/8 to-transparent rounded-r-2xl pl-6 pr-6 py-5 mb-12 text-lg md:text-xl font-medium text-foreground/80 leading-relaxed italic"
            >
              {post.excerpt}
            </motion.blockquote>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {post.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 px-3 py-1.5 rounded-full border border-brand-500/20">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* ── SECTIONS (structured content, no HTML needed) ──── */}
          {hasSections && (
            <div className="space-y-16">
              {post.sections.map((section: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: 0.05 }}
                  className="group"
                >
                  {/* Section number + heading */}
                  <div className="flex items-start gap-5 mb-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                      <span className="text-brand-500 font-black text-sm">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight pt-1.5 group-hover:text-brand-500 transition-colors">
                      {section.heading}
                    </h2>
                  </div>
                  {/* Section body */}
                  <p className="text-base md:text-lg text-muted-foreground leading-[1.85] pl-15 ml-14">
                    {section.body}
                  </p>
                  {/* Divider (not on last) */}
                  {i < post.sections.length - 1 && (
                    <div className="mt-12 border-b border-border/40" />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Fallback: legacy HTML content ─────────────────── */}
          {!hasSections && post.content && (
            <div
              className="blog-article-content"
              style={{ lineHeight: "1.8", fontSize: "1.0625rem", color: "var(--foreground)" }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {/* ── Share bar ───────────────────────────────────────── */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share this article
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20 text-xs font-bold hover:bg-sky-500/20 transition-colors"
                >
                  𝕏 Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                >
                  f Facebook
                </a>
                <CopyLinkBtn />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Posts ─────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-16 border-t border-border/30 bg-brand-500/3">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-black mb-8 uppercase tracking-tight">
                More in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
                  {post.category}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rp: any) => (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug || rp.id}`}
                    className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-brand-500/40 transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <Image src={rp.image || "/images/hero.png"} alt={rp.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-3 group-hover:text-brand-500 transition-colors leading-snug">{rp.title}</h3>
                      <span className="mt-auto text-brand-500 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read Article <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
            Ready for Your Next Himalayan Adventure?
          </h3>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Let our expert guides design your perfect trek or tour — tailored to your pace, interests, and timeline.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-brand-700 font-black hover:scale-105 transition-all shadow-2xl">
              Plan My Trip <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/blog" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4" /> More Articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
