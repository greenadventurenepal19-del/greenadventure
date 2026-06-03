"use client";
import React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, Clock, Calendar, Tag, Search, Loader2,
  PenLine, X, Send, CheckCircle, ChevronRight, User
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection, query, where, onSnapshot, doc,
  addDoc, serverTimestamp,
} from "firebase/firestore";

const ALL_CATEGORIES = ["All", "Trekking Guides", "Destination Guides", "Preparation", "Eco-Tourism", "Safety", "Culture", "News"];

function formatDate(ts: any) {
  if (!ts) return "";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/* ── Submit Story Modal (matches admin New Blog Post form) ──────── */
function SubmitStoryModal({ onClose }: { onClose: () => void }) {
  const CATEGORIES = ["Trekking Guides", "Destination Guides", "Preparation", "Eco-Tourism", "Safety", "Culture", "News"];

  const [form, setForm] = useState({
    // Author
    name: "", email: "", photoURL: "",
    // Post fields (same as admin)
    title: "", image: "", category: "Trekking Guides",
    tags: "", readTime: "", excerpt: "",
    sections: [{ heading: "", body: "" }] as { heading: string; body: string }[],
    status: "published" as string,
    isFeatured: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const addSection = () => set("sections", [...form.sections, { heading: "", body: "" }]);
  const removeSection = (i: number) => set("sections", form.sections.filter((_, idx) => idx !== i));
  const updateSection = (i: number, field: "heading" | "body", val: string) =>
    set("sections", form.sections.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const moveSection = (i: number, dir: -1 | 1) => {
    const arr = [...form.sections];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set("sections", arr);
  };

  const handleUpload = async (
    file: File,
    setLoading: (v: boolean) => void,
    onSuccess: (url: string) => void,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      onSuccess(url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again or paste a URL.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const autoSlug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.title) return;
    setSubmitting(true);
    try {
      const cleanSections = form.sections.filter(s => s.body.trim());
      await addDoc(collection(db, "blogs"), {
        title: form.title,
        slug: autoSlug,
        excerpt: form.excerpt,
        image: form.image,
        category: form.category,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        readTime: form.readTime,
        sections: cleanSections,
        status: "pending_review",
        isFeatured: false,
        source: "user",
        submittedBy: { name: form.name, email: form.email, photoURL: form.photoURL },
        author: form.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5 shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Share Your Story</h2>
              <p className="text-white/70 text-xs">Submit a travel story — our team will review &amp; publish it</p>
            </div>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="text-xl font-black">Story Submitted!</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Thank you! Our team will review your submission and publish it soon. You&apos;ll be featured as the author.
            </p>
            <button onClick={onClose} className="mt-2 px-6 py-3 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-500 transition-all">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="p-6 space-y-5">

              {/* ── Author info ──────────────────────────────────── */}
              <div className="bg-brand-500/5 border border-brand-500/20 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-brand-500 uppercase tracking-wider">Your Info — shown as author when published</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name *</label>
                    <input required value={form.name} onChange={e => set("name", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                      placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Email *</label>
                    <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                      placeholder="you@email.com" />
                  </div>
                </div>
                {/* Profile Photo — Upload or URL */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Profile Photo (optional)</label>
                  <div className="flex gap-2">
                    <input value={form.photoURL} onChange={e => set("photoURL", e.target.value)}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                      placeholder="https://... (optional URL)" />
                    <label className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-bold border transition-all ${uploadingPhoto ? "opacity-50 cursor-not-allowed border-border text-muted-foreground" : "border-brand-500/40 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10"}`}>
                      {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5 rotate-[-90deg]" />}
                      {uploadingPhoto ? "Uploading…" : "Upload"}
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" disabled={uploadingPhoto}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, setUploadingPhoto, (url) => set("photoURL", url), photoInputRef as React.RefObject<HTMLInputElement>); }} />
                    </label>
                  </div>
                  {form.photoURL && (
                    <div className="mt-2 flex items-center gap-2">
                      <Image src={form.photoURL} alt="profile preview" width={36} height={36} className="rounded-full object-cover border border-border" unoptimized />
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">{form.photoURL}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Article fields (same as admin) ───────────────── */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Article Title *</label>
                <input required value={form.title} onChange={e => set("title", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="e.g. My Everest Base Camp Experience" />
                {form.title && <p className="text-[10px] text-muted-foreground mt-1 pl-1">Slug: /blog/{autoSlug}</p>}
              </div>

              {/* Cover Image — Upload or URL */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Cover Image (optional)</label>
                <div className="flex gap-2">
                  <input value={form.image} onChange={e => set("image", e.target.value)}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    placeholder="https://... (optional URL)" />
                  <label className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-bold border transition-all ${uploadingCover ? "opacity-50 cursor-not-allowed border-border text-muted-foreground" : "border-brand-500/40 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10"}`}>
                    {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5 rotate-[-90deg]" />}
                    {uploadingCover ? "Uploading…" : "Upload Photo"}
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" disabled={uploadingCover}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, setUploadingCover, (url) => set("image", url), coverInputRef as React.RefObject<HTMLInputElement>); }} />
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2 relative h-24 w-full rounded-xl overflow-hidden border border-border">
                    <Image src={form.image} alt="cover preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                  <select value={form.category} onChange={e => set("category", e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Tags (comma-sep)</label>
                  <input value={form.tags} onChange={e => set("tags", e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    placeholder="Nepal, Trekking" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Read Time</label>
                  <input value={form.readTime} onChange={e => set("readTime", e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    placeholder="5 min read" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Short Summary (shown in cards)</label>
                <textarea rows={2} value={form.excerpt} onChange={e => set("excerpt", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none"
                  placeholder="A brief description shown in listing cards..." />
              </div>

              {/* ── Section-based editor ─────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Article Sections *</label>
                  <button type="button" onClick={addSection}
                    className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
                    <span className="text-base leading-none">+</span> Add Section
                  </button>
                </div>
                <div className="space-y-3">
                  {form.sections.map((sec, i) => (
                    <div key={i} className="bg-background border border-border rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Section {i + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0}
                            className="w-6 h-6 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground flex items-center justify-center text-xs disabled:opacity-30">↑</button>
                          <button type="button" onClick={() => moveSection(i, 1)} disabled={i === form.sections.length - 1}
                            className="w-6 h-6 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground flex items-center justify-center text-xs disabled:opacity-30">↓</button>
                          <button type="button" onClick={() => removeSection(i)}
                            className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 flex items-center justify-center text-xs">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <input value={sec.heading} onChange={e => updateSection(i, "heading", e.target.value)}
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-brand-500"
                        placeholder="Section heading (optional)" />
                      <textarea required rows={4} value={sec.body} onChange={e => updateSection(i, "body", e.target.value)}
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-y leading-relaxed"
                        placeholder="Write this section's content..." />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky submit bar */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 shrink-0">
              <button type="submit" disabled={submitting || uploadingCover || uploadingPhoto}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black transition-all disabled:opacity-60 text-sm">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit for Review</>}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}



/* ── Blog Card ──────────────────────────────────────────────────── */
function BlogCard({ post, i }: { post: any; i: number }) {
  const isUserSubmission = post.source === "user" && post.submittedBy;
  const authorName = isUserSubmission ? post.submittedBy.name : "Green Adventure";
  const authorPhoto = isUserSubmission ? post.submittedBy.photoURL : null;

  return (
    <motion.article
      key={post.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (i % 3) * 0.08 }}
      className="group flex flex-col bg-card rounded-[2rem] overflow-hidden border border-border/60 hover:border-brand-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1"
    >
      <Link href={`/blog/${post.slug || post.id}`} className="block">
        <div className="relative h-52 overflow-hidden">
          <Image src={post.image || "/images/hero.png"} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 bg-brand-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
            {post.category || "General"}
          </span>
          {post.isFeatured && (
            <span className="absolute top-4 right-4 bg-yellow-400/90 text-black text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              ★ Featured
            </span>
          )}
          {post.readTime && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full font-medium">
              <Clock className="w-3 h-3" /> {post.readTime}
            </span>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-500/8 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full border border-brand-500/15">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>
        )}

        <Link href={`/blog/${post.slug || post.id}`}>
          <h2 className="text-base font-black text-foreground mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors leading-snug">
            {post.title}
          </h2>
        </Link>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">{post.excerpt}</p>

        {/* Author + CTA row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {authorPhoto ? (
              <Image src={authorPhoto} alt={authorName} width={24} height={24} className="rounded-full object-cover border border-border" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand-500/15 flex items-center justify-center">
                {isUserSubmission
                  ? <User className="w-3.5 h-3.5 text-brand-500" />
                  : <span className="text-[9px] font-black text-brand-500">GA</span>}
              </div>
            )}
            <span className="text-xs font-semibold text-muted-foreground truncate max-w-[100px]">{authorName}</span>
          </div>
          <Link href={`/blog/${post.slug || post.id}`}
            className="inline-flex items-center gap-1 text-brand-500 font-bold text-xs hover:gap-2 transition-all">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeBgIndex, setActiveBgIndex] = React.useState(0);
  const [hero, setHero] = useState<any>({
    title: "Travel Blog",
    subtitle: "Inspiring stories, practical guides, and expert tips from the heart of the Himalayas.",
    bgImage: "/images/hero.png",
  });

  
  React.useEffect(() => {
    const bgList = ((hero as any).bgImages && (hero as any).bgImages.length > 0) ? (hero as any).bgImages : [hero.bgImage];
    if (bgList.length > 1) {
      const interval = setInterval(() => {
        setActiveBgIndex(prev => (prev + 1) % bgList.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [(hero as any).bgImages, hero.bgImage]);
  
  React.useEffect(() => {
    const unsubHero = onSnapshot(doc(db, "settings", "pages_hero"), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as any;
        if (d?.blog) setHero((p: any) => ({ ...p, ...d.blog }));
      }
    });

    // Fetch ALL published blogs — no orderBy here to avoid requiring a composite
    // Firestore index (status + createdAt). Sort client-side instead.
    const q = query(
      collection(db, "blogs"),
      where("status", "==", "published")
    );
    const unsub = onSnapshot(q,
      (snap) => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        // Sort newest-first by createdAt (Firestore Timestamp or ISO string)
        all.sort((a, b) => {
          const aTime = a.createdAt?.seconds ?? (new Date(a.createdAt ?? 0).getTime() / 1000);
          const bTime = b.createdAt?.seconds ?? (new Date(b.createdAt ?? 0).getTime() / 1000);
          return bTime - aTime;
        });
        setPosts(all);
        setLoading(false);
      },
      (err) => {
        console.error("Blog fetch error:", err);
        setLoading(false);
      }
    );

    return () => { unsubHero(); unsub(); };
  }, []);


  const filtered = posts.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const bgList = ((hero as any).bgImages && (hero as any).bgImages.length > 0) ? (hero as any).bgImages : [hero.bgImage];
  const activeBgUrl = bgList[activeBgIndex % bgList.length] || hero.bgImage;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative h-[52vh] min-h-[360px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeBgUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image src={activeBgUrl} alt="Hero Background" fill className="object-cover object-center" priority />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-sm font-semibold mb-6">
            <BookOpen className="h-4 w-4 text-brand-400" />
            <span className="uppercase tracking-[0.3em] text-xs">Our Stories</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Travel</span> Blog
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-lg md:text-xl max-w-2xl mx-auto text-white/80 font-medium leading-relaxed">
            {hero.subtitle}
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ── Filter Bar ───────────────────────────────────────────── */}
      <section className="relative z-20 py-6 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeCategory === cat
                    ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "border-border text-muted-foreground hover:border-brand-500/50 bg-card"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-border bg-card text-sm focus:outline-none focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ──────────────────────────────────────────────────── */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen className="w-16 h-16 text-brand-500/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try a different category or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, i) => <BlogCard key={post.id} post={post} i={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Write for Us Banner ───────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-700/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-bold uppercase tracking-widest mb-6">
              <PenLine className="w-3.5 h-3.5" /> Write for Us
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Share</span> Your Adventure
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Have an incredible Himalayan story to tell? Submit your travel experience and get featured on our blog — complete with your photo and name as the author.
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-black text-base transition-all hover:scale-105 shadow-2xl shadow-brand-500/25"
            >
              <PenLine className="w-5 h-5" /> Submit Your Story
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Submit Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showSubmitModal && <SubmitStoryModal onClose={() => setShowSubmitModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
