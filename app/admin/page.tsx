"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/components/admin-auth-provider";
import { db, storage } from "@/lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, 
  doc, setDoc, deleteDoc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  Clock, Trash2, Plus, ShieldCheck, AlertCircle, Sparkles, User, MessageSquare, Settings, CheckCircle, LogOut, Mail, Shield, Users, Map, MapPin, Edit, Navigation, X, UploadCloud, Award, Upload, BookOpen
} from "lucide-react";
import Image from "next/image";
import ParticleLoader from "@/components/ParticleLoader";
import {
  WHY_CHOOSE_ICON_NAMES,
  DEFAULT_WHY_CHOOSE,
  resolveIcon,
  type WhyChooseSettings,
  type WhyChooseFeature,
} from "@/lib/why-choose";

export default function AdminPage() {
  const { user, isAdmin, isSuperAdmin, loading, loginWithGoogle, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"contacts" | "access" | "settings" | "hero" | "trips" | "regions" | "reviews" | "whyChoose" | "pagesHero" | "aboutPage" | "blog">("contacts");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [contactFilter, setContactFilter] = useState<"all" | "booking" | "inquiry">("all");
  
  // Data states
  const [contacts, setContacts] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  
  // Trip Modal State
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [tripFormData, setTripFormData] = useState({
    title: "",
    region: "",
    duration: "",
    price: "",
    difficulty: "moderate",
    desc: "",
    image: "",
    isFeatured: false,
    tripType: "Tour",
    groupSize: "",
    tags: [] as string[],
    slug: "",
    rating: 5,
    altitude: "",
    overview: "",
    itinerary: [] as { day: string; title: string; desc: string }[],
    includes: [] as string[],
    excludes: [] as string[],
    faqs: [] as { q: string; a: string }[],
  });
  
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  // Available tags for selection
  const availableTags = [
    "Eco-Friendly", "Small Group", "Cultural", "Spiritual", 
    "Wildlife", "Adventure", "Family", "Honeymoon", 
    "Photography", "Zero Waste", "Local Guide", "Wellness"
  ];

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);

  // Blog State
  const [blogs, setBlogs] = useState<any[]>([]);
  const [pendingBlogs, setPendingBlogs] = useState<any[]>([]);
  const [blogTab, setBlogTab] = useState<"published" | "pending">("published");
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogTagInput, setBlogTagInput] = useState("");
  const [isDeletingBlog, setIsDeletingBlog] = useState<string | null>(null);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false);
  const BLOG_CATEGORIES = ["Trekking Guides", "Destination Guides", "Preparation", "Eco-Tourism", "Safety", "Culture", "News"];
  const DEFAULT_BLOG_FORM = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",       // legacy fallback, kept for reading old posts
    image: "",
    category: "Trekking Guides",
    author: "Green Adventure Team",
    tags: [] as string[],
    isFeatured: false,
    status: "published",
    readTime: "",
    sections: [] as { heading: string; body: string }[],
  };
  const [blogFormData, setBlogFormData] = useState(DEFAULT_BLOG_FORM);


  // Featured Testimonial (About Page)
  const [showPickTestimonialModal, setShowPickTestimonialModal] = useState(false);
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string>("");
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Region Modal State
  const [regions, setRegions] = useState<any[]>([]);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<any>(null);
  const [regionFormData, setRegionFormData] = useState({
    title: "",
    desc: "",
    image: "",
    heroImage: "",
    subtitle: "",
    overview: "",
    tours: 0,
    featured: true,
    order: 0,
  });

  // Settings state - empty by default so admin must explicitly fill them in.
  // The frontend reads from `settings/contact_info` and only displays values
  // that have been saved here.
  const [settings, setSettings] = useState({
    officeDesc: "",
    locationLine1: "",
    locationLine2: "",
    phonePrimary: "",
    phoneWhatsapp: "",
    emailPrimary: "",
    emailSecondary: "",
    mapLat: 27.7126,
    mapLng: 85.3145,
    mapZoom: 15
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const [isUploadingTripImage, setIsUploadingTripImage] = useState(false);
  const [isUploadingRegionImage, setIsUploadingRegionImage] = useState(false);
  const [isUploadingRegionHeroImage, setIsUploadingRegionHeroImage] = useState(false);
  const [uploadingHeroSlide, setUploadingHeroSlide] = useState<number | null>(null);
  const [uploadingHeroMobile, setUploadingHeroMobile] = useState<number | null>(null);
  const [uploadingHeroTablet, setUploadingHeroTablet] = useState<number | null>(null);

  // Delete an image from Vercel Blob and clear the field
  const deleteBlobImage = async (blobUrl: string) => {
    if (!blobUrl) return;
    // Only delete blobs hosted on Vercel (skip local /images/ paths)
    if (blobUrl.includes('vercel-storage.com') || blobUrl.includes('blob.vercel-storage.com')) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(blobUrl)}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete blob:', err);
      }
    }
  };

  const handleTripImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      alert("File is too large! Please choose an image smaller than 4.5MB.");
      return;
    }

    setIsUploadingTripImage(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        // Delete old blob if replacing
        if (tripFormData.image) await deleteBlobImage(tripFormData.image);
        setTripFormData({ ...tripFormData, image: data.url });
      } else {
        throw new Error(data.error || `Failed with status ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image to blob: " + error.message);
    } finally {
      setIsUploadingTripImage(false);
    }
  };

  const handleRegionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "heroImage" = "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      alert("File is too large! Please choose an image smaller than 4.5MB.");
      return;
    }

    if (field === "heroImage") setIsUploadingRegionHeroImage(true);
    else setIsUploadingRegionImage(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        // Delete old blob if replacing
        if (regionFormData[field]) await deleteBlobImage(regionFormData[field]);
        setRegionFormData({ ...regionFormData, [field]: data.url });
      } else {
        throw new Error(data.error || `Failed with status ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image to blob: " + error.message);
    } finally {
      if (field === "heroImage") setIsUploadingRegionHeroImage(false);
      else setIsUploadingRegionImage(false);
    }
  };

  
  const handleHeroBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIdx: number, field: string = "bgImages") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      alert("File is too large! Please choose an image smaller than 4.5MB.");
      return;
    }

    if (field === "mobileBgImages") setUploadingHeroMobile(slideIdx);
    else if (field === "tabletBgImages") setUploadingHeroTablet(slideIdx);
    else setUploadingHeroSlide(slideIdx);

    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setHeroSlides(prev => prev.map((s, i) => {
          if (i === slideIdx) {
            const currentArray = s[field] || [];
            const newBgImages = [...currentArray, data.url];
            return { ...s, [field]: newBgImages };
          }
          return s;
        }));
      } else {
        throw new Error(data.error || `Failed with status ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error uploading hero bg image:", error);
      alert("Failed to upload image to blob: " + error.message);
    } finally {
      if (field === "mobileBgImages") setUploadingHeroMobile(null);
      else if (field === "tabletBgImages") setUploadingHeroTablet(null);
      else setUploadingHeroSlide(null);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIdx: number, field: string = "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      alert("File is too large! Please choose an image smaller than 4.5MB.");
      return;
    }

    if (field === "mobileImage") setUploadingHeroMobile(slideIdx);
    else if (field === "tabletImage") setUploadingHeroTablet(slideIdx);
    else setUploadingHeroSlide(slideIdx);

    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        // Delete old blob if replacing
        const oldUrl = heroSlides[slideIdx]?.[field];
        if (oldUrl) await deleteBlobImage(oldUrl);
        setHeroSlides(prev => prev.map((s, i) => i === slideIdx ? { ...s, [field]: data.url } : s));
      } else {
        throw new Error(data.error || `Failed with status ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error uploading hero image:", error);
      alert("Failed to upload image to blob: " + error.message);
    } finally {
      if (field === "mobileImage") setUploadingHeroMobile(null);
      else if (field === "tabletImage") setUploadingHeroTablet(null);
      else setUploadingHeroSlide(null);
    }
  };


  // Tag suggestion options for hero slides
  const upperTagSuggestions = [
    "Everest Region", "Annapurna Region", "Langtang Region", "Manaslu Region",
    "Kanchenjunga Region", "Upper Mustang", "Dolpo Region", "Makalu Region",
    "Paro Valley", "Punakha Valley", "Thimphu Valley", "Bumthang Valley",
    "Ladakh", "Sikkim", "Himachal Pradesh", "Uttarakhand", "Kashmir",
    "3 days", "5 days", "7 days", "10 days", "12 days", "14 days", "15 days", "18 days", "21 days", "28 days",
    "Easy", "Moderate", "Challenging", "Strenuous", "Extreme",
    "Cultural Tour", "Trekking", "Wildlife Safari", "Pilgrimage", "Adventure",
    "Spring", "Summer", "Autumn", "Winter", "Year-round"
  ];
  const lowerTagSuggestions = [
    "Zero Waste", "Low-carbon", "Local Hire", "Inclusive Growth",
    "Eco-Friendly", "Carbon Neutral", "Community Support", "Fair Trade",
    "Wildlife Protection", "Plastic Free", "Renewable Energy", "Water Conservation",
    "Cultural Preservation", "Organic Food", "Tree Planting", "Responsible Tourism"
  ];

  // Hero settings state — array-based slides
  const defaultSlides = [
    { title: "NEPAL", subtitle: "Discover the breathtaking landscapes, vibrant culture, and ancient heritage of the Himalayas.", image: "/images/everest.png", mobileImage: "", tabletImage: "", bgImages: [], mobileBgImages: [], tabletBgImages: [], upperTags: ["Everest Region", "15 days", "Challenging"], lowerTags: ["Zero Waste", "Low-carbon", "Local Hire", "Inclusive Growth"] },
    { title: "INDIA", subtitle: "Explore the diverse beauty of the Indian Himalayas, from spiritual journeys to thrilling treks.", image: "/images/hero.png", mobileImage: "", tabletImage: "", bgImages: [], mobileBgImages: [], tabletBgImages: [], upperTags: ["Ladakh", "15 days", "Challenging"], lowerTags: ["Zero Waste", "Low-carbon", "Local Hire", "Inclusive Growth"] },
    { title: "BHUTAN", subtitle: "Experience the magic of the Land of the Thunder Dragon, with its pristine landscapes and ancient monasteries.", image: "/images/hero-grass.jpg", mobileImage: "", tabletImage: "", bgImages: [], mobileBgImages: [], tabletBgImages: [], upperTags: ["Paro Valley", "7 days", "Moderate"], lowerTags: ["Eco-Friendly", "Cultural Preservation", "Local Hire", "Inclusive Growth"] },
  ];
  const [heroSlides, setHeroSlides] = useState<any[]>(defaultSlides);
  const [heroTagInput, setHeroTagInput] = useState<{ [key: string]: string }>({});
  const [isSavingHero, setIsSavingHero] = useState(false);

  // "Why Choose Us" section state
  const [whyChoose, setWhyChoose] = useState<WhyChooseSettings>(DEFAULT_WHY_CHOOSE);
  const [isSavingWhyChoose, setIsSavingWhyChoose] = useState(false);

  // Pages Hero state (for Destinations, Tours, Trekking pages)
  const DEFAULT_PAGES_HERO = {
    destinations: { title: "Our Destinations", subtitle: "Choose your next adventure from our carefully curated destinations.", bgImage: "", tags: ["Nepal", "Bhutan", "India"], tabs: ["Nepal", "Bhutan", "India"] },
    tours: { title: "Our Tours", subtitle: "Curated cultural, wildlife and scenic tour packages — handpicked by our team.", bgImage: "", tags: ["Cultural", "Adventure", "Family"], tabs: ["Cultural", "Adventure", "Family", "Wildlife", "Day Trips"] },
    trekking: { title: "Himalayan Trekking", subtitle: "From the iconic trails of Everest to the hidden valleys of Annapurna.", bgImage: "", tags: ["Everest Region", "Annapurna"], tabs: ["Everest Region", "Annapurna", "Langtang", "Manaslu"] },
    blog: { title: "Travel Stories", subtitle: "Inspiring adventures, honest guides, and tales from the trail — told by explorers like you.", bgImage: "", tags: ["Featured", "Community", "Trekking"], tabs: ["All", "Featured", "Trekking", "Culture", "Wildlife"] },
  };

  // Suggested tags/tabs palette per section
  const PAGES_HERO_TAG_SUGGESTIONS: Record<string, string[]> = {
    destinations: ["Nepal", "Bhutan", "India", "Himalayas", "Cultural", "Adventure", "Eco-Tourism", "Popular"],
    tours: ["Cultural", "Adventure", "Family", "Wildlife", "Day Trips", "Popular", "Scenic", "Historical", "Featured", "Budget"],
    trekking: ["Everest Region", "Annapurna", "Langtang", "Manaslu", "Upper Mustang", "Easy", "Moderate", "Hard", "Popular", "Off-beat"],
    blog: ["Featured", "Community", "Trekking", "Culture", "Wildlife", "Adventure", "Tips", "Guides"],
  };
  const PAGES_HERO_TAB_SUGGESTIONS: Record<string, string[]> = {
    destinations: ["Nepal", "Bhutan", "India", "Himalayas", "All"],
    tours: ["Cultural", "Adventure", "Family", "Wildlife", "Day Trips", "Budget", "Luxury"],
    trekking: ["Everest Region", "Annapurna", "Langtang", "Manaslu", "Upper Mustang", "Dolpo"],
    blog: ["All", "Featured", "Trekking", "Culture", "Wildlife", "Adventure", "Tips"],
  };
  const [pagesHero, setPagesHero] = useState(DEFAULT_PAGES_HERO);
  const [isSavingPagesHero, setIsSavingPagesHero] = useState(false);
  const [uploadingPagesHeroImage, setUploadingPagesHeroImage] = useState<string | null>(null);
  const [activePagesHeroSection, setActivePagesHeroSection] = useState<"destinations" | "tours" | "trekking" | "blog" | "footer">("destinations");

  // Footer Settings state
  const DEFAULT_FOOTER_SETTINGS = {
    tagline: "Ready to embark on the adventure of a lifetime?",
    description: "Experience the breathtaking landscapes and vibrant cultures of the Himalayas. We craft sustainable and unforgettable mountain expeditions tailored for the true explorer.",
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    tiktok: "",
  };
  const [footerSettings, setFooterSettings] = useState(DEFAULT_FOOTER_SETTINGS);
  const [isSavingFooter, setIsSavingFooter] = useState(false);

  // About Page admin state
  const DEFAULT_ABOUT_PAGE = {
    heroTitle: "About Green Adventure",
    heroSubtitle: "We are passionate about sharing the breathtaking beauty of the Himalayas while promoting responsible and sustainable tourism.",
    heroImage: "",
    storyTitle: "Our Story",
    storyText1: "Founded in 2010 by a group of passionate local guides, Green Adventure started with a simple mission: to provide authentic, safe, and unforgettable Himalayan experiences while giving back to the local communities.",
    storyText2: "Over the years, we have grown from a small team organizing local hikes to one of Nepal's most trusted adventure travel companies.",
    storyImage: "",
    features: [
      "Licensed by Government of Nepal",
      "Members of TAAN & NMA",
      "100% Local Expert Guides",
      "Committed to Eco-Tourism",
    ] as string[],
  };
  const [aboutPage, setAboutPage] = useState(DEFAULT_ABOUT_PAGE);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState<string | null>(null);
  const [newAboutFeature, setNewAboutFeature] = useState("");

  // Subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    // Listen to contacts
    const qContacts = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
    const unsubContacts = onSnapshot(qContacts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(data);
    });

    // Listen to admins
    const qAdmins = query(collection(db, "admins"));
    const unsubAdmins = onSnapshot(qAdmins, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdminsList(data);
    });

    // Listen to trips
    const qTrips = query(collection(db, "trips"));
    const unsubTrips = onSnapshot(qTrips, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(data);
      setPermissionError(false); // Clear error if successful
    }, (error: any) => {
      console.error("Error fetching trips:", error);
      if (error.code === 'permission-denied') {
        setPermissionError(true);
      }
    });

    // Listen to settings (merge so partial saves preserve unspecified fields)
    const unsubSettings = onSnapshot(doc(db, "settings", "contact_info"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setSettings(prev => ({ ...prev, ...data }));
      }
    });

    // Listen to hero settings
    const unsubHero = onSnapshot(doc(db, "settings", "hero_content"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        // Support new array format
        if (Array.isArray(data.slides)) {
          const defaultImages = ["/images/everest.png", "/images/hero.png", "/images/hero-grass.jpg"];
          const corrected = data.slides.map((s: any, idx: number) => {
            let img = s.image || "";
            const lowerTitle = (s.title || "").toLowerCase();
            if (!img || img === "/images/everest.png" || img === "/images/hero-grass.jpg" || img === "/images/hero.png" || img === "/images/hero-nepal.PNG" || img === "/images/hero-india.PNG" || img === "/images/hero-bhutan.PNG") {
              if (lowerTitle.includes("nepal")) {
                img = "/images/everest.png";
              } else if (lowerTitle.includes("india")) {
                img = "/images/hero.png";
              } else if (lowerTitle.includes("bhutan")) {
                img = "/images/hero-grass.jpg";
              } else {
                img = defaultImages[idx] || defaultImages[0];
              }
            }
            return {
              ...s,
              image: img
            };
          });
          setHeroSlides(corrected);
        } else if (data.slide1Title) {
          // Migrate old flat format to array
          const defaultImages = ["/images/everest.png", "/images/hero.png", "/images/hero-grass.jpg"];
          const migrated = [];
          let i = 1;
          while (data[`slide${i}Title`]) {
            const title = data[`slide${i}Title`] || "";
            const lowerTitle = title.toLowerCase();
            let img = data[`slide${i}Image`] || "";
            if (!img || img === "/images/everest.png" || img === "/images/hero-grass.jpg" || img === "/images/hero.png" || img === "/images/hero-nepal.PNG" || img === "/images/hero-india.PNG" || img === "/images/hero-bhutan.PNG") {
              if (lowerTitle.includes("nepal")) {
                img = "/images/everest.png";
              } else if (lowerTitle.includes("india")) {
                img = "/images/hero.png";
              } else if (lowerTitle.includes("bhutan")) {
                img = "/images/hero-grass.jpg";
              } else {
                img = defaultImages[i - 1] || defaultImages[0];
              }
            }
            migrated.push({
              title,
              subtitle: data[`slide${i}Subtitle`] || "",
              image: img,
              upperTags: data[`slide${i}UpperTags`] || [],
              lowerTags: data[`slide${i}LowerTags`] || [], bgImages: data[`slide${i}BgImages`] || [], mobileBgImages: data[`slide${i}MobileBgImages`] || [], tabletBgImages: data[`slide${i}TabletBgImages`] || [],
            });
            i++;
          }
          if (migrated.length > 0) setHeroSlides(migrated);
        }
      }
    });

    // Listen to "Why Choose Us" settings (merge with defaults so partial saves are safe)
    const unsubWhyChoose = onSnapshot(doc(db, "settings", "why_choose_us"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<WhyChooseSettings>;
        setWhyChoose(prev => ({
          ...prev,
          ...data,
          features: Array.isArray(data.features) && data.features.length > 0 ? data.features : prev.features,
        }));
      }
    });

    // Listen to Pages Hero settings
    const unsubPagesHero = onSnapshot(doc(db, "settings", "pages_hero"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setPagesHero(prev => ({ ...prev, ...data }));
      }
    });

    // Listen to Footer settings
    const unsubFooter = onSnapshot(doc(db, "settings", "footer_settings"), (docSnap) => {
      if (docSnap.exists()) {
        setFooterSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    // Listen to About Page settings
    const unsubAboutPage = onSnapshot(doc(db, "settings", "about_page"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setAboutPage(prev => ({ ...prev, ...data, features: Array.isArray(data.features) && data.features.length > 0 ? data.features : prev.features }));
        if (data.featuredTestimonialId) setSelectedTestimonialId(data.featuredTestimonialId);
      }
    });

    // Listen to regions
    const unsubRegions = onSnapshot(collection(db, "regions"), async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      
      // Auto-seed Nepal/Bhutan/India if missing
      const defaultRegions = [
        { title: "Nepal", desc: "Home to eight of the world's ten tallest mountains, Nepal is a trekker's paradise with rich cultural heritage.", image: "/images/everest.png", subtitle: "The land of the Himalayas", tours: 45, featured: true, order: 1 },
        { title: "Bhutan", desc: "A unique kingdom where tradition and natural beauty reign supreme with untouched landscapes.", image: "/images/annapurna.png", subtitle: "The Last Shangri-La", tours: 8, featured: true, order: 2 },
        { title: "India", desc: "The Indian Himalayas offer breathtaking treks, spiritual retreats, and thrilling adventure sports.", image: "/images/everest.png", subtitle: "Incredible diversity from Himalayas to coasts", tours: 24, featured: true, order: 3 },
      ];
      const existingTitles = data.map((r: any) => r.title?.toLowerCase());
      for (const def of defaultRegions) {
        if (!existingTitles.includes(def.title.toLowerCase())) {
          try {
            const newRef = doc(collection(db, "regions"));
            await setDoc(newRef, { ...def, heroImage: "", overview: "", createdAt: serverTimestamp() });
          } catch (err) {
            console.error("Failed to seed region:", def.title, err);
          }
        }
      }
      
      setRegions(data);
    });

    // Listen to reviews
    const unsubReviews = onSnapshot(collection(db, "reviews"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setReviews(data);
    });

    // Listen to blogs — split published vs pending
    const unsubBlogs = onSnapshot(collection(db, "blogs"), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBlogs(data.filter(b => b.status !== "pending_review"));
      setPendingBlogs(data.filter(b => b.status === "pending_review"));
    });

    return () => {
      unsubContacts();
      unsubAdmins();
      unsubTrips();
      unsubSettings();
      unsubHero();
      unsubWhyChoose();
      unsubPagesHero();
      unsubFooter();
      unsubAboutPage();
      unsubRegions();
      unsubReviews();
      unsubBlogs();
    };
  }, [isAdmin]);

  const handleSetReviewStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    try {
      await updateDoc(doc(db, "reviews", id), { status });
    } catch (err) {
      console.error("Error updating review status:", err);
      alert("Failed to update review.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Permanently delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review.");
    }
  };

  // ── Blog helpers ────────────────────────────────────────────────
  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openBlogModal = (blog?: any) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogFormData({
        ...DEFAULT_BLOG_FORM,
        ...blog,
        tags: Array.isArray(blog.tags) ? blog.tags : [],
        sections: Array.isArray(blog.sections) ? blog.sections : [],
      });
    } else {
      setEditingBlog(null);
      setBlogFormData(DEFAULT_BLOG_FORM);
    }
    setBlogTagInput("");
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBlog(true);
    try {
      const slug = blogFormData.slug || slugify(blogFormData.title);
      // Filter out empty sections
      const cleanSections = (blogFormData.sections || []).filter(
        (s) => s.heading.trim() || s.body.trim()
      );
      const payload = {
        ...blogFormData,
        slug,
        sections: cleanSections,
        updatedAt: serverTimestamp(),
      };
      if (editingBlog) {
        await setDoc(doc(db, "blogs", editingBlog.id), payload, { merge: true });
      } else {
        const newRef = doc(collection(db, "blogs"));
        await setDoc(newRef, { ...payload, createdAt: serverTimestamp() });
      }
      setIsBlogModalOpen(false);
    } catch (err) {
      console.error("Error saving blog:", err);
      alert("Failed to save blog post.");
    } finally {
      setIsSavingBlog(false);
    }
  };


  const handleSeedDemoPosts = async () => {
    if (!confirm("This will add 3 demo blog posts to Firestore. Continue?")) return;
    const DEMO_POSTS = [
      {
        title: "Top 5 Reasons to Trek the Annapurna Circuit",
        slug: "annapurna-circuit-top-5-reasons",
        excerpt: "The Annapurna Circuit is consistently ranked among the world's greatest treks. Spanning 160–230 km, it takes trekkers through extraordinary landscapes from subtropical lowlands to high alpine deserts.",
        image: "/images/hero-nepal.PNG",
        category: "Trekking Guides",
        author: "Green Adventure Team",
        tags: ["Nepal", "Trekking", "Annapurna"],
        readTime: "6 min read",
        isFeatured: true,
        status: "published",
        sections: [
          { heading: "Unparalleled Landscape Diversity", body: "No other trek in Nepal offers such a dramatic shift in scenery. In a single journey you pass through lush rhododendron forests, terraced rice paddies, arid Mustang-like plateaus, and glaciated high passes. The sheer variety means every day on trail feels completely different from the last." },
          { heading: "The Iconic Thorong La Pass (5,416 m)", body: "Crossing Thorong La is a milestone moment — the highest point on the circuit. The sunrise views from the pass over a sea of peaks are genuinely life-altering. Standing above the clouds with prayer flags snapping in the wind, you'll understand why trekkers return to Nepal again and again." },
          { heading: "Rich Cultural Encounters", body: "The circuit passes through Gurung, Manangi, and Tibetan Buddhist communities. From prayer wheels to yak herders, every village offers authentic cultural immersion. The town of Manang is a high-altitude settlement where locals have lived for centuries." },
          { heading: "Excellent Tea House Infrastructure", body: "The trail is well-serviced with tea houses offering hot meals, warm lodges, and friendly hosts at every stop. You don't need to carry a tent or cooking equipment — just your personal gear, making it accessible for less experienced trekkers too." },
          { heading: "Now Is the Best Time to Go", body: "After years of variable weather, the classic October–November and March–April windows are producing reliably clear skies. New infrastructure and responsible tourism initiatives mean the experience is better than ever." },
        ],
      },
      {
        title: "Altitude Sickness: Prevention, Symptoms & Treatment",
        slug: "altitude-sickness-prevention-guide",
        excerpt: "High altitude trekking is one of the most rewarding experiences in the world — but it comes with real risks. Altitude sickness affects thousands of trekkers every year in the Himalayas.",
        image: "/images/hero-nepal.PNG",
        category: "Safety",
        author: "Green Adventure Team",
        tags: ["Safety", "Health", "High Altitude"],
        readTime: "7 min read",
        isFeatured: true,
        status: "published",
        sections: [
          { heading: "What Is Altitude Sickness?", body: "Acute Mountain Sickness (AMS) occurs when you ascend too quickly and your body doesn't have enough time to acclimatize. It can affect anyone — regardless of fitness level or age. The key trigger is speed of ascent, not physical ability." },
          { heading: "Recognizing the Symptoms", body: "Early symptoms include headache, fatigue, loss of appetite, dizziness, and nausea, appearing within 6–12 hours of arriving at altitude. If symptoms worsen — especially confusion or extreme breathlessness at rest — this is a medical emergency requiring immediate descent." },
          { heading: "The Golden Rule: Ascend Slowly", body: "The most effective prevention is a slow, gradual ascent. Above 3,000 m, follow the 300 m rule — don't increase your sleeping altitude by more than 300 m per day. Build in acclimatization days every 3 days, where you hike high but sleep low." },
          { heading: "Hydration and Medications", body: "Drink 3–4 litres of water per day at altitude. Avoid alcohol and sleeping pills during the first few days. Many trekkers take Diamox (acetazolamide) as a preventive measure — consult your doctor before your trip." },
          { heading: "When to Descend", body: "Never ignore worsening symptoms. If your headache doesn't respond to ibuprofen or you feel confused or unsteady, descend immediately — even at night. A descent of just 300–500 m can make a dramatic difference." },
        ],
      },
      {
        title: "Bhutan: The Kingdom of Happiness — A Complete Travel Guide",
        slug: "bhutan-kingdom-happiness-travel-guide",
        excerpt: "Bhutan, the only carbon-negative country on Earth, offers a travel experience unlike anywhere else. With its high-value, low-impact tourism policy, ancient dzongs, and the majestic Tiger's Nest monastery, every moment here is unforgettable.",
        image: "/images/hero-bhutan.PNG",
        category: "Destination Guides",
        author: "Green Adventure Team",
        tags: ["Bhutan", "Culture", "Monastery"],
        readTime: "8 min read",
        isFeatured: true,
        status: "published",
        sections: [
          { heading: "Why Bhutan Is Unlike Any Other Destination", body: "Bhutan measures success not in GDP, but in Gross National Happiness. This philosophy permeates every aspect of life — from its pristine forests (70% of the country is forested by law) to its preserved traditional architecture that keeps the country visually stunning." },
          { heading: "The Tiger's Nest Monastery", body: "Paro Taktsang, or Tiger's Nest, is Bhutan's most iconic landmark. Perched 3,120 metres above sea level on a sheer cliff face, this 17th-century monastery seems to defy gravity. The 2–3 hour hike winds through pine forests and past prayer flags — the view is extraordinary." },
          { heading: "The Sustainable Daily Fee", body: "Bhutan charges a Sustainable Development Fee of $100 USD per person per day. This funds free education, healthcare, and environmental conservation. It's the world's most intelligent tourism model and includes your guide, accommodation, and meals." },
          { heading: "Best Time to Visit", body: "Spring (March–May) brings rhododendron blooms and clear mountain views. Autumn (September–November) offers the best trekking conditions and famous festivals (tsechus). Avoid the monsoon season (June–August) when trails can be muddy." },
          { heading: "Essential Cultural Etiquette", body: "Dress modestly when visiting monasteries and dzongs — no shorts or sleeveless tops. Always walk clockwise around stupas and mani walls. Photography inside religious sites is generally prohibited. Bhutanese people are warm and welcoming." },
        ],
      },
    ];
    try {
      for (const post of DEMO_POSTS) {
        const newRef = doc(collection(db, "blogs"));
        await setDoc(newRef, { ...post, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      alert("✅ 3 demo blog posts added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to seed posts. Make sure you are logged in.");
    }
  };

  const handleDeleteBlog = async (id: string) => {


    if (!confirm("Permanently delete this blog post?")) return;
    setIsDeletingBlog(id);
    try {
      await deleteDoc(doc(db, "blogs", id));
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert("Failed to delete blog post.");
    } finally {
      setIsDeletingBlog(null);
    }
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBlogImage(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setBlogFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      console.error("Error uploading blog image:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingBlogImage(false);
      // Reset the input so the same file can be re-selected after an error
      e.target.value = "";
    }
  };




  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    
    try {
      await setDoc(doc(db, "admins", newAdminEmail.toLowerCase().trim()), {
        email: newAdminEmail.toLowerCase().trim(),
        addedBy: user?.email,
        createdAt: serverTimestamp()
      });
      setNewAdminEmail("");
      alert("Admin added successfully!");
    } catch (error) {
      console.error("Error adding admin", error);
      alert("Failed to add admin. Ensure you have permission.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "contact_info"), settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings", error);
      alert("Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);
    try {
      await setDoc(doc(db, "settings", "hero_content"), { slides: heroSlides });
      alert("Hero settings saved successfully!");
    } catch (error) {
      console.error("Error saving hero settings", error);
      alert("Failed to save hero settings.");
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleSaveWhyChoose = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWhyChoose(true);
    try {
      const cleaned: WhyChooseSettings = {
        title: whyChoose.title.trim(),
        titleHighlight: whyChoose.titleHighlight.trim(),
        description: whyChoose.description.trim(),
        trustBadge: whyChoose.trustBadge.trim(),
        features: whyChoose.features
          .map(f => ({
            iconName: f.iconName,
            title: (f.title || "").trim(),
            desc: (f.desc || "").trim(),
          }))
          .filter(f => f.title || f.desc),
      };
      await setDoc(doc(db, "settings", "why_choose_us"), cleaned);
      alert('"Why Choose Us" section saved successfully!');
    } catch (error) {
      console.error("Error saving Why Choose Us settings", error);
      alert("Failed to save. Make sure you have admin permission.");
    } finally {
      setIsSavingWhyChoose(false);
    }
  };

  const updateWhyChooseFeature = (index: number, patch: Partial<WhyChooseFeature>) => {
    setWhyChoose(prev => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }));
  };

  const addWhyChooseFeature = () => {
    setWhyChoose(prev => ({
      ...prev,
      features: [
        ...prev.features,
        { iconName: "Sparkles", title: "New Feature", desc: "Describe what makes this special." },
      ],
    }));
  };

  const removeWhyChooseFeature = (index: number) => {
    setWhyChoose(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSavePagesHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPagesHero(true);
    try {
      await setDoc(doc(db, "settings", "pages_hero"), pagesHero);
      alert("Pages Hero saved successfully!");
    } catch (error) {
      console.error("Error saving pages hero", error);
      alert("Failed to save. Make sure you have admin permission.");
    } finally {
      setIsSavingPagesHero(false);
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFooter(true);
    try {
      await setDoc(doc(db, "settings", "footer_settings"), footerSettings);
      alert("Footer settings saved!");
    } catch (error) {
      console.error("Error saving footer settings", error);
      alert("Failed to save. Check admin permissions.");
    } finally {
      setIsSavingFooter(false);
    }
  };

  const handlePagesHeroBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      alert("File is too large! Please choose an image smaller than 4.5MB.");
      return;
    }

    setUploadingPagesHeroImage(section);

    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setPagesHero(prev => ({
          ...prev,
          [section]: {
            ...(prev as any)[section],
            bgImages: [...((prev as any)[section].bgImages || []), data.url]
          }
        }));
      } else {
        throw new Error(data.error || `Failed with status ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error uploading pages hero bg image:", error);
      alert("Failed to upload image to blob: " + error.message);
    } finally {
      setUploadingPagesHeroImage(null);
    }
  };

  const handlePagesHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: "destinations" | "tours" | "trekking" | "blog") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) { alert("File too large! Max 4.5MB."); return; }
    setUploadingPagesHeroImage(section);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, { method: 'POST', body: file });
      const data = await res.json();
      if (res.ok && data.url) {
        const oldUrl = (pagesHero as any)[section]?.bgImage;
        if (oldUrl) await deleteBlobImage(oldUrl);
        setPagesHero(prev => ({ ...prev, [section]: { ...(prev as any)[section], bgImage: data.url } }));
      } else throw new Error(data.error || `Status ${res.status}`);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingPagesHeroImage(null);
    }
  };

  const handleSaveAboutPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAbout(true);
    try {
      await setDoc(doc(db, "settings", "about_page"), { ...aboutPage, featuredTestimonialId: selectedTestimonialId }, { merge: true });
      alert("About Page saved successfully!");
    } catch (error) {
      console.error("Error saving about page", error);
      alert("Failed to save. Make sure you have admin permission.");
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "heroImage" | "storyImage") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) { alert("File too large! Max 4.5MB."); return; }
    setUploadingAboutImage(field);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, { method: 'POST', body: file });
      const data = await res.json();
      if (res.ok && data.url) {
        const oldUrl = (aboutPage as any)[field];
        if (oldUrl) await deleteBlobImage(oldUrl);
        setAboutPage(prev => ({ ...prev, [field]: data.url }));
      } else throw new Error(data.error || `Status ${res.status}`);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingAboutImage(null);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (confirm(`Are you sure you want to remove ${email} from admins?`)) {
      try {
        await deleteDoc(doc(db, "admins", email));
      } catch (error) {
        console.error("Error removing admin", error);
        alert("Failed to remove admin.");
      }
    }
  };

  const handleProcessContact = async (id: string) => {
    try {
      await updateDoc(doc(db, "contacts", id), {
        status: "processed",
        processedAt: serverTimestamp(),
        processedBy: user?.email
      });
    } catch (error) {
      console.error("Error processing contact", error);
      alert("Failed to update status.");
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact request?")) {
      try {
        await deleteDoc(doc(db, "contacts", id));
      } catch (error) {
        console.error("Error deleting contact", error);
        alert("Failed to delete contact request.");
      }
    }
  };

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = tripFormData.slug || tripFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const dataToSave = { ...tripFormData, slug };

      if (editingTrip) {
        await updateDoc(doc(db, "trips", editingTrip.id), dataToSave);
      } else {
        const newTripRef = doc(collection(db, "trips"));
        await setDoc(newTripRef, { ...dataToSave, createdAt: serverTimestamp() });
      }
      setIsTripModalOpen(false);
      setEditingTrip(null);
      setShowDetailedInfo(false);
      setTripFormData({ title: "", region: "", duration: "", price: "", difficulty: "moderate", desc: "", image: "", isFeatured: false, tripType: "Tour", groupSize: "", tags: [], slug: "", rating: 5, altitude: "", overview: "", itinerary: [], includes: [], excludes: [], faqs: [] });
    } catch (error) {
      console.error("Error saving trip", error);
      alert("Failed to save trip.");
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteDoc(doc(db, "trips", id));
      } catch (error) {
        console.error("Error deleting trip", error);
        alert("Failed to delete trip.");
      }
    }
  };

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRegion) {
        await updateDoc(doc(db, "regions", editingRegion.id), regionFormData);
      } else {
        const newRegionRef = doc(collection(db, "regions"));
        await setDoc(newRegionRef, { ...regionFormData, createdAt: serverTimestamp() });
      }
      setIsRegionModalOpen(false);
      setEditingRegion(null);
      setRegionFormData({ title: "", desc: "", image: "", heroImage: "", subtitle: "", overview: "", tours: 0, featured: true, order: 0 });
    } catch (error) {
      console.error("Error saving region", error);
      alert("Failed to save region.");
    }
  };

  const handleDeleteRegion = async (id: string) => {
    if (confirm("Are you sure you want to delete this region?")) {
      try {
        await deleteDoc(doc(db, "regions", id));
      } catch (error) {
        console.error("Error deleting region", error);
        alert("Failed to delete region.");
      }
    }
  };

  const toggleFeatured = async (trip: any) => {
    try {
      await updateDoc(doc(db, "trips", trip.id), { isFeatured: !trip.isFeatured });
    } catch (error) {
      console.error("Error toggling featured", error);
    }
  };


  if (loading) {
    return <ParticleLoader />;
  }

  // Not Logged In
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('/images/everest.png')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-[#050505] backdrop-blur-sm"></div>
        
        <div className="relative z-10 max-w-md w-full bg-black/40 border border-white/10 p-10 rounded-[2rem] backdrop-blur-2xl text-center shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-lg shadow-brand-500/30 transform -rotate-3">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Admin Portal</h1>
          <p className="text-white/60 mb-10 leading-relaxed">Secure access to manage operations, inquiries, and platform permissions.</p>
          
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Logged in but not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-950/20 border border-red-500/20 p-10 rounded-[2rem] text-center backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(239,68,68,0.2)]">
          <div className="w-20 h-20 bg-red-500/10 rounded-full mx-auto flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-white">Access Denied</h1>
          <p className="text-red-200/70 mb-8 leading-relaxed">
            The account <span className="text-white font-medium">{user.email}</span> does not have administrator privileges.
          </p>
          <button 
            onClick={logout}
            className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign Out & Try Another Account
          </button>
        </div>
      </div>
    );
  }

  // Dashboard for Admins
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans selection:bg-brand-500/30">
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Slide-in Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 z-[70] bg-[#0a1a0a] border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Admin Console</span>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {([
            { id: "contacts", icon: <Mail className="w-4 h-4" />, label: "Contact Requests", badge: contacts.filter(c => c.status !== "processed").length || 0 },
            { id: "access", icon: <Users className="w-4 h-4" />, label: "Admin Access" },
            { id: "regions", icon: <Navigation className="w-4 h-4" />, label: "Destinations" },
            { id: "trips", icon: <Map className="w-4 h-4" />, label: "Destinations & Trips" },
            { id: "settings", icon: <Settings className="w-4 h-4" />, label: "Contact Info" },
            { id: "reviews", icon: <MessageSquare className="w-4 h-4" />, label: "Client Reviews", badge: reviews.filter(r => r.status === "pending").length || 0 },
            { id: "hero", icon: <Sparkles className="w-4 h-4" />, label: "Hero Settings" },
            { id: "whyChoose", icon: <Award className="w-4 h-4" />, label: "Why Choose Us" },
            { id: "pagesHero", icon: <MapPin className="w-4 h-4" />, label: "Pages Hero" },
            { id: "aboutPage", icon: <User className="w-4 h-4" />, label: "About Page" },
            { id: "blog", icon: <BookOpen className="w-4 h-4" />, label: "Blog Posts", badge: blogs.length || 0 },
          ] as { id: string; icon: React.ReactNode; label: string; badge?: number }[]).map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30"
                  : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              {item.icon}
              {item.label}
              {!!(item.badge && item.badge > 0) && (
                <span className="ml-auto bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-white">Admin Console</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                <span className="text-xs text-brand-400 font-medium tracking-widest uppercase">{isSuperAdmin ? 'Super Administrator' : 'Administrator'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white">{user.displayName}</div>
              <div className="text-xs text-white/50">{user.email}</div>
            </div>
            <button 
              onClick={logout}
              className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 rounded-xl border border-white/10 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {permissionError && (
        <div className="bg-red-950/40 border-b border-red-500/30 text-red-200 p-4 text-center z-40 relative">
          <p className="flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>
              <strong>Firebase Permission Error:</strong> Your Firestore security rules are blocking access. 
              Please deploy <code className="bg-black/30 px-1.5 py-0.5 rounded text-red-300 font-mono text-sm mx-1">docs/firebase.rules</code> to your Firebase project console to enable data fetching and seeding.
            </span>
          </p>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 container mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10 relative z-10">
        
        {/* Sidebar Nav — desktop only; mobile uses the slide-in drawer */}
        <div className="hidden lg:flex w-full lg:w-72 shrink-0 flex-col gap-3">
          <button 
            onClick={() => setActiveTab("contacts")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "contacts" 
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]" 
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Mail className="w-5 h-5" /> 
            Contact Requests
            {contacts.filter(c => c.status !== "processed").length > 0 && (
              <span className="ml-auto bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {contacts.filter(c => c.status !== "processed").length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab("access")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "access" 
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]" 
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Users className="w-5 h-5" /> 
            Admin Access
          </button>
          
          <button 
            onClick={() => setActiveTab("regions")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "regions" 
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]" 
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Navigation className="w-5 h-5" /> 
            Destinations
          </button>
          
          <button 
            onClick={() => setActiveTab("trips")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "trips" 
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]" 
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Map className="w-5 h-5" /> 
            Destinations & Trips
          </button>
          
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "settings" 
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]" 
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Settings className="w-5 h-5" /> 
            Contact Info Settings
          </button>
          
          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "reviews"
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]"
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Client Reviews
            {reviews.filter(r => r.status === "pending").length > 0 && (
              <span className="ml-auto bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {reviews.filter(r => r.status === "pending").length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("hero")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "hero" 
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]" 
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Sparkles className="w-5 h-5" /> 
            Hero Settings
          </button>

          <button
            onClick={() => setActiveTab("whyChoose")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "whyChoose"
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]"
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Award className="w-5 h-5" />
            Why Choose Us
          </button>

          <button
            onClick={() => setActiveTab("pagesHero")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "pagesHero"
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]"
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <MapPin className="w-5 h-5" />
            Pages Hero
          </button>

          <button
            onClick={() => setActiveTab("aboutPage")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "aboutPage"
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]"
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <User className="w-5 h-5" />
            About Page
          </button>

          <button
            onClick={() => setActiveTab("blog")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeTab === "blog"
                ? "bg-gradient-to-r from-brand-500/20 to-transparent text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]"
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Blog Posts
            {blogs.length > 0 && (
              <span className="ml-auto bg-white/10 text-white/60 text-xs font-bold px-2 py-0.5 rounded-full">
                {blogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* CONTACTS TAB */}
          {activeTab === "contacts" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Contact Requests</h2>
                  <p className="text-white/50 mt-1">Manage and respond to customer inquiries.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-xl overflow-x-auto">
                  <button 
                    onClick={() => setContactFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${contactFilter === "all" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"}`}
                  >
                    All Requests
                  </button>
                  <button 
                    onClick={() => setContactFilter("booking")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${contactFilter === "booking" ? "bg-brand-500/20 text-brand-400" : "text-white/50 hover:text-white/80"}`}
                  >
                    Booking Requests
                  </button>
                  <button 
                    onClick={() => setContactFilter("inquiry")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${contactFilter === "inquiry" ? "bg-blue-500/20 text-blue-400" : "text-white/50 hover:text-white/80"}`}
                  >
                    Inquiries
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-xl shrink-0">
                  <div className="px-4 py-2 bg-black/40 rounded-lg">
                    <span className="text-2xl font-bold text-brand-400">{contacts.filter(c => c.status !== "processed" && (contactFilter === "all" || c.type === contactFilter || (contactFilter === "inquiry" && !c.type))).length}</span>
                    <span className="text-xs text-white/50 ml-2 uppercase tracking-wider">Pending</span>
                  </div>
                  <div className="px-4 py-2">
                    <span className="text-2xl font-bold text-white/80">{contacts.filter(c => c.status === "processed" && (contactFilter === "all" || c.type === contactFilter || (contactFilter === "inquiry" && !c.type))).length}</span>
                    <span className="text-xs text-white/50 ml-2 uppercase tracking-wider">Done</span>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6">
                {contacts.filter(c => contactFilter === "all" || c.type === contactFilter || (contactFilter === "inquiry" && !c.type)).length === 0 ? (
                  <div className="bg-white/5 border border-white/5 p-16 rounded-[2rem] text-center text-white/50 backdrop-blur-md">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                    <p>There are no contact requests to display.</p>
                  </div>
                ) : (
                  contacts.filter(c => contactFilter === "all" || c.type === contactFilter || (contactFilter === "inquiry" && !c.type)).map(contact => (
                    <div key={contact.id} className={`group border p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row gap-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                      contact.status === "processed" 
                        ? "bg-white/[0.02] border-white/5 opacity-75 hover:opacity-100" 
                        : "bg-white/5 border-white/10 hover:border-brand-500/30 hover:bg-white/10"
                    }`}>
                      
                      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
                        {contact.status === "processed" && (
                          <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[10px] font-bold text-green-500 tracking-wider uppercase">Processed</span>
                          </div>
                        )}
                        <button 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-2 bg-black/40 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-full transition-all backdrop-blur-sm"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center shrink-0">
                              <User className="w-6 h-6 text-white/70" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-bold text-white tracking-tight">{contact.name}</h3>
                                {contact.type === "booking" && (
                                  <span className="px-2.5 py-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    Booking Request
                                  </span>
                                )}
                                {contact.type === "inquiry" && (
                                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    Trip Inquiry
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                                <a href={`mailto:${contact.email}`} className="text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-1.5 transition-colors">
                                  <Mail className="w-4 h-4" /> {contact.email}
                                </a>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-left md:text-right flex items-center gap-2 text-xs text-white/40 font-medium bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 shrink-0 self-start">
                            <Clock className="w-3.5 h-3.5" />
                            {contact.createdAt?.toDate ? contact.createdAt.toDate().toLocaleString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : 'Just now'}
                          </div>
                        </div>
                        
                        <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                          {contact.whatsapp && (
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-white/40 shrink-0 mt-1 w-20">WhatsApp</span>
                              <div className="text-lg font-medium text-[#25D366]">{contact.whatsapp}</div>
                            </div>
                          )}
                          {contact.tripTitle && (
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-white/40 shrink-0 mt-1 w-20">Trip</span>
                              <div className="text-lg font-medium text-white">{contact.tripTitle}</div>
                            </div>
                          )}
                          {(contact.tripDate || contact.travelers) && (
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-white/40 shrink-0 mt-1 w-20">Details</span>
                              <div className="text-white/80">
                                {contact.tripDate && <span className="mr-4">Date: <strong>{contact.tripDate}</strong></span>}
                                {contact.travelers && <span>Travelers: <strong>{contact.travelers}</strong></span>}
                              </div>
                            </div>
                          )}
                          {contact.subject && (
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-white/40 shrink-0 mt-1 w-20">Subject</span>
                              <div className="text-lg font-medium text-white">{contact.subject}</div>
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/40 shrink-0 mt-1 w-20">Message</span>
                            <div className="text-white/80 leading-relaxed whitespace-pre-wrap">{contact.message}</div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-56 flex flex-col justify-end gap-3 shrink-0">
                        {contact.status === "processed" ? (
                          <div className="bg-green-500/5 text-green-400/80 border border-green-500/10 px-5 py-4 rounded-xl text-sm font-medium flex flex-col items-center justify-center text-center gap-1">
                            <span className="text-xs text-green-500/50 uppercase tracking-wider">Processed By</span>
                            <span className="truncate w-full">{contact.processedBy}</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleProcessContact(contact.id)}
                            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/20"
                          >
                            <CheckCircle className="w-5 h-5" /> Mark Processed
                          </button>
                        )}
                        <a 
                          href={`mailto:${contact.email}?subject=Re: ${contact.subject || 'Your Inquiry to Green Adventure'}`}
                          className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10"
                        >
                          <MessageSquare className="w-4 h-4" /> Reply via Email
                        </a>
                        {contact.whatsapp && (
                          <a 
                            href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${contact.name}, this is Green Adventure Nepal. `)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-medium py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#25D366]/20"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                            </svg>
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ADMIN ACCESS TAB */}
          {activeTab === "access" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Admin Management</h2>
                <p className="text-white/50 mt-1">Control who has access to this portal.</p>
              </div>
              
              <div className="bg-gradient-to-br from-brand-900/20 to-black/40 border border-brand-500/20 p-8 rounded-[2rem] relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2 text-white">Grant Admin Access</h3>
                  <p className="text-sm text-brand-200/60 mb-6 max-w-2xl">
                    Invite team members to manage contact requests. They must log in with the exact Google account email you provide below.
                  </p>
                  
                  <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="email" 
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="Enter Google email address..."
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shrink-0"
                    >
                      <Plus className="w-5 h-5" /> Add Admin
                    </button>
                  </form>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <div className="px-8 py-5 border-b border-white/10 bg-black/20 font-bold flex items-center justify-between text-lg text-white">
                  <span>Authorized Administrators</span>
                  <span className="text-xs bg-brand-500 text-white px-3 py-1 rounded-full">{adminsList.length + 1} Users</span>
                </div>
                
                <div className="divide-y divide-white/5">
                  {/* Always show Super Admin */}
                  <div className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white tracking-tight">{process.env.NEXT_PUBLIC_SUPER_ADMIN}</div>
                        <div className="text-xs text-brand-400 font-medium uppercase tracking-wider mt-1">Super Admin (System Owner)</div>
                      </div>
                    </div>
                    <div className="text-white/20 px-4 py-2 bg-black/30 rounded-lg text-sm border border-white/5 font-medium">
                      Cannot be removed
                    </div>
                  </div>

                  {/* Show other admins */}
                  {adminsList.map(admin => (
                    <div key={admin.id} className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                          <Users className="w-6 h-6 text-white/50 group-hover:text-white/80 transition-colors" />
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white tracking-tight">{admin.email}</div>
                          <div className="text-xs text-white/40 mt-1 flex items-center gap-2">
                            <span>Added by <span className="text-white/60 font-medium">{admin.addedBy || 'Unknown'}</span></span>
                            {admin.createdAt?.toDate && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span>{admin.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="text-white/30 hover:text-red-400 p-3 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        title="Revoke Access"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TRIPS TAB */}
          {activeTab === "trips" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Destinations & Trips</h2>
                  <p className="text-white/50 mt-1">Manage your tour packages and feature them on the home page.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setEditingTrip(null);
                      setShowDetailedInfo(false);
                      setTripFormData({ title: "", region: "", duration: "", price: "", difficulty: "moderate", desc: "", image: "", isFeatured: false, tripType: "Tour", groupSize: "", tags: [], slug: "", rating: 5, altitude: "", overview: "", itinerary: [], includes: [], excludes: [], faqs: [] });
                      setIsTripModalOpen(true);
                    }}
                    className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/20"
                  >
                    <Plus className="w-5 h-5" /> Add Trip
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.length === 0 ? (
                  <div className="col-span-full bg-white/5 border border-white/5 p-16 rounded-[2rem] text-center text-white/50 backdrop-blur-md">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Map className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No trips added yet.</h3>
                    <p>Click "Add Trip" to create your first package.</p>
                  </div>
                ) : (
                  trips.map(trip => (
                    <div key={trip.id} className="bg-card/80 backdrop-blur-md border border-border/50 rounded-[2rem] overflow-hidden hover:border-brand-500/30 transition-all flex flex-col relative group">
                      <div className="relative h-48 w-full overflow-hidden bg-black/50">
                        {trip.image ? (
                          <img src={trip.image} alt={trip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-white/20"><Map className="w-10 h-10" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => { setEditingTrip(trip); setShowDetailedInfo(false); setTripFormData({ tags: [], groupSize: "", slug: "", rating: 5, altitude: "", overview: "", itinerary: [], ...trip, includes: Array.isArray(trip.includes) ? trip.includes : (typeof trip.includes === 'string' ? trip.includes.split('\n').filter(Boolean) : []), excludes: Array.isArray(trip.excludes) ? trip.excludes : (typeof trip.excludes === 'string' ? trip.excludes.split('\n').filter(Boolean) : []) }); setIsTripModalOpen(true); }}
                            className="p-2 bg-black/60 hover:bg-brand-500/80 text-white backdrop-blur-sm rounded-lg transition-colors border border-white/20"
                            title="Edit Trip"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="p-2 bg-black/60 hover:bg-red-500/80 text-white backdrop-blur-sm rounded-lg transition-colors border border-white/20"
                            title="Delete Trip"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="text-xl font-bold text-white tracking-tight line-clamp-2">{trip.title}</h3>
                        </div>
                        <p className="text-sm text-white/50 mb-4 line-clamp-2">{trip.desc}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                          <div className="text-brand-400 font-bold">{trip.price}</div>
                          <button 
                            onClick={() => toggleFeatured(trip)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${trip.isFeatured ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}
                          >
                            {trip.isFeatured ? <Sparkles className="w-3.5 h-3.5" /> : null}
                            {trip.isFeatured ? 'Featured' : 'Not Featured'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CONTACT INFO SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Contact Info Settings</h2>
                <p className="text-white/50 mt-1">Manage public contact information and map integration.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <form onSubmit={handleSaveSettings} className="p-8 space-y-8">
                  
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-white">Office Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Office Description</label>
                      <textarea
                        value={settings.officeDesc}
                        onChange={(e) => setSettings({ ...settings, officeDesc: e.target.value })}
                        placeholder="Drop by our office in the heart of Kathmandu for a cup of tea and let's discuss your next adventure."
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white min-h-[100px] placeholder:text-white/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Location Line 1</label>
                        <input
                          type="text"
                          value={settings.locationLine1}
                          onChange={(e) => setSettings({ ...settings, locationLine1: e.target.value })}
                          placeholder="e.g. Thamel, Kathmandu"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Location Line 2</label>
                        <input
                          type="text"
                          value={settings.locationLine2}
                          onChange={(e) => setSettings({ ...settings, locationLine2: e.target.value })}
                          placeholder="e.g. Bagmati Province, Nepal 44600"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <h3 className="font-bold text-xl text-white">Contact Methods</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Primary Phone</label>
                        <input
                          type="text"
                          value={settings.phonePrimary}
                          onChange={(e) => setSettings({ ...settings, phonePrimary: e.target.value })}
                          placeholder="e.g. +977 1 4412345"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">WhatsApp Phone</label>
                        <input
                          type="text"
                          value={settings.phoneWhatsapp}
                          onChange={(e) => setSettings({ ...settings, phoneWhatsapp: e.target.value })}
                          placeholder="e.g. +977 9801234567"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Primary Email</label>
                        <input
                          type="email"
                          value={settings.emailPrimary}
                          onChange={(e) => setSettings({ ...settings, emailPrimary: e.target.value })}
                          placeholder="e.g. info@yourdomain.com"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Secondary Email</label>
                        <input
                          type="email"
                          value={settings.emailSecondary}
                          onChange={(e) => setSettings({ ...settings, emailSecondary: e.target.value })}
                          placeholder="e.g. bookings@yourdomain.com"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <h3 className="font-bold text-xl text-white">Map Integration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={settings.mapLat || 27.7126}
                          onChange={(e) => setSettings({ ...settings, mapLat: parseFloat(e.target.value) })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={settings.mapLng || 85.3145}
                          onChange={(e) => setSettings({ ...settings, mapLng: parseFloat(e.target.value) })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Zoom Level</label>
                        <input
                          type="number"
                          value={settings.mapZoom || 15}
                          onChange={(e) => setSettings({ ...settings, mapZoom: parseInt(e.target.value) })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
                          min="1"
                          max="20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSavingSettings}
                      className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    >
                      {isSavingSettings ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" /> Save Settings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Client Reviews</h2>
                  <p className="text-white/50 mt-1">Approve, reject or delete reviews submitted by your clients.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-xl overflow-x-auto">
                  {(["pending", "approved", "rejected", "all"] as const).map((f) => {
                    const count = f === "all" ? reviews.length : reviews.filter(r => r.status === f).length;
                    return (
                      <button
                        key={f}
                        onClick={() => setReviewFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap capitalize flex items-center gap-2 ${
                          reviewFilter === f
                            ? f === "approved"
                              ? "bg-brand-500/20 text-brand-400"
                              : f === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : f === "pending"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-white/10 text-white"
                            : "text-white/50 hover:text-white/80"
                        }`}
                      >
                        {f}
                        <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full font-bold">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const visible = reviewFilter === "all"
                  ? reviews
                  : reviews.filter(r => r.status === reviewFilter);

                if (visible.length === 0) {
                  return (
                    <div className="bg-white/5 border border-white/5 p-16 rounded-[2rem] text-center text-white/50 backdrop-blur-md">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-white/20" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No {reviewFilter !== "all" ? reviewFilter : ""} reviews</h3>
                      <p>When clients submit reviews on the home page, they&apos;ll appear here.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visible.map((review: any) => {
                      const status: string = review.status || "pending";
                      const statusBadge =
                        status === "approved"
                          ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                          : status === "rejected"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30";
                      return (
                        <div
                          key={review.id}
                          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col gap-4 hover:border-brand-500/30 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadge}`}>
                              {status}
                            </span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, j) => (
                                <svg
                                  key={j}
                                  className={`w-4 h-4 ${j < (review.rating || 5) ? "text-yellow-500" : "text-white/20"}`}
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              ))}
                            </div>
                          </div>

                          <p className="text-white/80 text-sm leading-relaxed line-clamp-5 italic">
                            &quot;{review.message}&quot;
                          </p>

                          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                            {review.photo ? (
                              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                                <Image src={review.photo} alt={review.name || ""} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {review.name?.[0] || "?"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-white truncate">{review.name || "Anonymous"}</h4>
                              {review.role && <p className="text-xs text-white/50 truncate">{review.role}</p>}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-white/5">
                            {status !== "approved" && (
                              <button
                                onClick={() => handleSetReviewStatus(review.id, "approved")}
                                className="flex-1 px-3 py-2 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                            )}
                            {status !== "rejected" && (
                              <button
                                onClick={() => handleSetReviewStatus(review.id, "rejected")}
                                className="flex-1 px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* HERO SETTINGS TAB */}
          {activeTab === "hero" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Hero Settings</h2>
                <p className="text-white/50 mt-1">Manage the massive titles and descriptions on the Home Page hero section.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <form onSubmit={handleSaveHeroSettings} className="p-8 space-y-8">
                  
                  {heroSlides.map((slide: any, idx: number) => {
                    const updateSlide = (field: string, value: any) => {
                      setHeroSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
                    };
                    const removeTag = (field: string, tag: string) => {
                      updateSlide(field, (slide[field] || []).filter((t: string) => t !== tag));
                    };
                    const addTag = (field: string, inputKey: string) => {
                      const val = (heroTagInput[inputKey] || "").trim();
                      if (!val) return;
                      const current = slide[field] || [];
                      if (!current.includes(val)) {
                        updateSlide(field, [...current, val]);
                      }
                      setHeroTagInput(prev => ({ ...prev, [inputKey]: "" }));
                    };
                    const addSuggestionTag = (field: string, tag: string) => {
                      const current = slide[field] || [];
                      if (!current.includes(tag)) {
                        updateSlide(field, [...current, tag]);
                      }
                    };

                    return (
                      <div key={idx} className={`space-y-4 ${idx > 0 ? "pt-6 border-t border-white/10" : ""}`}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-xl text-white">Slide {idx + 1}{slide.title ? `: ${slide.title}` : ""}</h3>
                          {heroSlides.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setHeroSlides(prev => prev.filter((_, i) => i !== idx))}
                              className="text-red-400/60 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                              title="Remove slide"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {/* Background Images Upload — Auto Changing */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">🖥️ Auto-Changing Background Images</label>
                          <p className="text-xs text-white/40 mb-4">These images will smoothly crossfade in the background every 5 seconds while this slide is active.</p>
                          <div className="flex flex-wrap items-center gap-4">
                            {(slide.bgImages || []).length > 0 ? (slide.bgImages || []).map((imgUrl: string, imgIdx: number) => (
                              <div key={imgIdx} className="relative group shrink-0">
                                <div className="w-24 h-16 relative rounded-xl overflow-hidden border border-white/10">
                                  <Image src={imgUrl} alt={`Slide ${idx + 1} bg preview ${imgIdx}`} fill className="object-cover" />
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => { 
                                    await deleteBlobImage(imgUrl); 
                                    const newBgImages = [...slide.bgImages];
                                    newBgImages.splice(imgIdx, 1);
                                    updateSlide("bgImages", newBgImages); 
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  title="Remove image"
                                >✕</button>
                              </div>
                            )) : (
                              slide.image && (
                                <div className="relative group shrink-0 opacity-50">
                                  <div className="w-24 h-16 relative rounded-xl overflow-hidden border border-white/10">
                                    <Image src={slide.image} alt={`Slide ${idx + 1} old desktop preview`} fill className="object-cover" />
                                  </div>
                                  <p className="text-[10px] text-center mt-1 text-white/40">Legacy Image</p>
                                </div>
                              )
                            )}
                            <label className="flex items-center gap-2 px-4 py-3 bg-black/60 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors text-sm font-medium text-white/80 w-full sm:w-auto">
                              <UploadCloud className="w-4 h-4" />
                              {uploadingHeroSlide === idx ? "Uploading..." : "Add Background Image"}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleHeroBgImageUpload(e, idx)} disabled={uploadingHeroSlide === idx} />
                            </label>
                          </div>
                        </div>

                        {/* Background Image Upload — Mobile & Tablet */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Mobile */}
                          <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">📱 Mobile Images</label>
                            <div className="flex flex-wrap items-center gap-4">
                              {(slide.mobileBgImages || []).length > 0 ? (slide.mobileBgImages || []).map((imgUrl: string, imgIdx: number) => (
                                <div key={imgIdx} className="relative group shrink-0">
                                  <div className="w-16 h-24 relative rounded-xl overflow-hidden border border-white/10">
                                    <Image src={imgUrl} alt={`Slide ${idx + 1} mobile preview ${imgIdx}`} fill className="object-cover" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={async () => { 
                                      await deleteBlobImage(imgUrl); 
                                      const newBgImages = [...slide.mobileBgImages];
                                      newBgImages.splice(imgIdx, 1);
                                      updateSlide("mobileBgImages", newBgImages); 
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remove image"
                                  >✕</button>
                                </div>
                              )) : (
                                slide.mobileImage && (
                                  <div className="relative group shrink-0 opacity-50">
                                    <div className="w-16 h-24 relative rounded-xl overflow-hidden border border-white/10">
                                      <Image src={slide.mobileImage} alt={`Slide ${idx + 1} old mobile preview`} fill className="object-cover" />
                                    </div>
                                    <p className="text-[10px] text-center mt-1 text-white/40">Legacy Image</p>
                                  </div>
                                )
                              )}
                              <label className="flex items-center gap-2 px-4 py-3 bg-black/60 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors text-sm font-medium text-white/80 w-full">
                                <UploadCloud className="w-4 h-4" />
                                {uploadingHeroMobile === idx ? "Uploading..." : "Add Mobile Image"}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleHeroBgImageUpload(e, idx, "mobileBgImages")} disabled={uploadingHeroMobile === idx} />
                              </label>
                            </div>
                            {(!slide.mobileBgImages || slide.mobileBgImages.length === 0) && !slide.mobileImage && <p className="text-xs text-white/30 mt-1">Falls back to desktop images if empty.</p>}
                          </div>
                          {/* Tablet */}
                          <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">📟 Tablet Images</label>
                            <div className="flex flex-wrap items-center gap-4">
                              {(slide.tabletBgImages || []).length > 0 ? (slide.tabletBgImages || []).map((imgUrl: string, imgIdx: number) => (
                                <div key={imgIdx} className="relative group shrink-0">
                                  <div className="w-20 h-16 relative rounded-xl overflow-hidden border border-white/10">
                                    <Image src={imgUrl} alt={`Slide ${idx + 1} tablet preview ${imgIdx}`} fill className="object-cover" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={async () => { 
                                      await deleteBlobImage(imgUrl); 
                                      const newBgImages = [...slide.tabletBgImages];
                                      newBgImages.splice(imgIdx, 1);
                                      updateSlide("tabletBgImages", newBgImages); 
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remove image"
                                  >✕</button>
                                </div>
                              )) : (
                                slide.tabletImage && (
                                  <div className="relative group shrink-0 opacity-50">
                                    <div className="w-20 h-16 relative rounded-xl overflow-hidden border border-white/10">
                                      <Image src={slide.tabletImage} alt={`Slide ${idx + 1} old tablet preview`} fill className="object-cover" />
                                    </div>
                                    <p className="text-[10px] text-center mt-1 text-white/40">Legacy Image</p>
                                  </div>
                                )
                              )}
                              <label className="flex items-center gap-2 px-4 py-3 bg-black/60 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors text-sm font-medium text-white/80 w-full">
                                <UploadCloud className="w-4 h-4" />
                                {uploadingHeroTablet === idx ? "Uploading..." : "Add Tablet Image"}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleHeroBgImageUpload(e, idx, "tabletBgImages")} disabled={uploadingHeroTablet === idx} />
                              </label>
                            </div>
                            {(!slide.tabletBgImages || slide.tabletBgImages.length === 0) && !slide.tabletImage && <p className="text-xs text-white/30 mt-1">Falls back to desktop images if empty.</p>}
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Main Title (Massive Text)</label>
                          <input
                            type="text"
                            value={slide.title || ""}
                            onChange={(e) => updateSlide("title", e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white font-bold"
                            placeholder="e.g. NEPAL"
                            required
                          />
                        </div>

                        {/* Subtitle */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Subtitle / Description</label>
                          <textarea
                            value={slide.subtitle || ""}
                            onChange={(e) => updateSlide("subtitle", e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white min-h-[100px]"
                            placeholder="Describe this destination..."
                            required
                          />
                        </div>

                        {/* Upper Tags (Trip Details) — Editable */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">
                            Upper Tags — Trip Details
                            <span className="text-white/30 ml-2">({(slide.upperTags || []).length} tags)</span>
                          </label>
                          {/* Selected tags with X */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(slide.upperTags || []).map((tag: string, ti: number) => (
                              <span key={ti} className="flex items-center gap-1.5 bg-brand-600 border border-brand-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg shadow-brand-600/20">
                                {tag}
                                <button type="button" onClick={() => removeTag("upperTags", tag)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          {/* Custom input */}
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              value={heroTagInput[`upper-${idx}`] || ""}
                              onChange={(e) => setHeroTagInput(prev => ({ ...prev, [`upper-${idx}`]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("upperTags", `upper-${idx}`); } }}
                              placeholder="Type a custom tag..."
                              className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 text-white placeholder:text-white/30"
                            />
                            <button type="button" onClick={() => addTag("upperTags", `upper-${idx}`)} className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Suggestions */}
                          <div className="flex flex-wrap gap-1.5">
                            {upperTagSuggestions.filter(t => !(slide.upperTags || []).includes(t)).slice(0, 12).map((tag) => (
                              <button key={tag} type="button" onClick={() => addSuggestionTag("upperTags", tag)}
                                className="px-2.5 py-1 rounded-full text-[10px] font-medium border bg-black/40 border-white/10 text-white/40 hover:border-white/30 hover:text-white/70 transition-all cursor-pointer">
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Lower Tags (Sustainability) — Editable */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">
                            Lower Tags — Sustainability
                            <span className="text-white/30 ml-2">({(slide.lowerTags || []).length} tags)</span>
                          </label>
                          {/* Selected tags with X */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(slide.lowerTags || []).map((tag: string, ti: number) => (
                              <span key={ti} className="flex items-center gap-1.5 bg-emerald-600 border border-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg shadow-emerald-600/20">
                                {tag}
                                <button type="button" onClick={() => removeTag("lowerTags", tag)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          {/* Custom input */}
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              value={heroTagInput[`lower-${idx}`] || ""}
                              onChange={(e) => setHeroTagInput(prev => ({ ...prev, [`lower-${idx}`]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("lowerTags", `lower-${idx}`); } }}
                              placeholder="Type a custom tag..."
                              className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 text-white placeholder:text-white/30"
                            />
                            <button type="button" onClick={() => addTag("lowerTags", `lower-${idx}`)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Suggestions */}
                          <div className="flex flex-wrap gap-1.5">
                            {lowerTagSuggestions.filter(t => !(slide.lowerTags || []).includes(t)).slice(0, 10).map((tag) => (
                              <button key={tag} type="button" onClick={() => addSuggestionTag("lowerTags", tag)}
                                className="px-2.5 py-1 rounded-full text-[10px] font-medium border bg-black/40 border-white/10 text-white/40 hover:border-white/30 hover:text-white/70 transition-all cursor-pointer">
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Slide Button */}
                  <div className="pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setHeroSlides(prev => [...prev, { title: "", subtitle: "", image: "", bgImages: [], mobileBgImages: [], tabletBgImages: [], mobileImage: "", tabletImage: "", upperTags: [], lowerTags: [] }])}
                      className="w-full py-4 border-2 border-dashed border-white/15 hover:border-brand-500/50 rounded-2xl text-white/40 hover:text-brand-400 font-medium flex items-center justify-center gap-2 transition-all hover:bg-brand-500/5"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Slide
                    </button>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSavingHero}
                      className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    >
                      {isSavingHero ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" /> Save Hero Settings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* WHY CHOOSE US TAB */}
          {activeTab === "whyChoose" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">&quot;Why Choose Us&quot; Section</h2>
                <p className="text-white/50 mt-1">Manage the heading, trust badge, and feature cards shown on the home page.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <form onSubmit={handleSaveWhyChoose} className="p-8 space-y-8">

                  {/* Heading group */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-white">Heading</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/60 mb-2">Title</label>
                        <input
                          type="text"
                          value={whyChoose.title}
                          onChange={(e) => setWhyChoose({ ...whyChoose, title: e.target.value })}
                          placeholder="e.g. Why Choose"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Highlighted word</label>
                        <input
                          type="text"
                          value={whyChoose.titleHighlight}
                          onChange={(e) => setWhyChoose({ ...whyChoose, titleHighlight: e.target.value })}
                          placeholder="e.g. Us"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-brand-400 font-bold placeholder:text-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
                      <textarea
                        value={whyChoose.description}
                        onChange={(e) => setWhyChoose({ ...whyChoose, description: e.target.value })}
                        placeholder="Short paragraph displayed below the heading."
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white min-h-[100px] placeholder:text-white/30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Trust badge text</label>
                      <input
                        type="text"
                        value={whyChoose.trustBadge}
                        onChange={(e) => setWhyChoose({ ...whyChoose, trustBadge: e.target.value })}
                        placeholder="e.g. Trusted by 10,000+ Explorers"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder:text-white/30"
                      />
                      <p className="text-xs text-white/40 mt-2">Leave empty to hide the badge.</p>
                    </div>
                  </div>

                  {/* Feature cards */}
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-white">Feature cards</h3>
                        <p className="text-sm text-white/50 mt-1">Add up to 8 cards. They render in a responsive grid.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addWhyChooseFeature}
                        disabled={whyChoose.features.length >= 8}
                        className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add feature
                      </button>
                    </div>

                    <div className="space-y-4">
                      {whyChoose.features.length === 0 && (
                        <p className="text-sm text-white/40 italic">No feature cards yet. Click &quot;Add feature&quot; to create one.</p>
                      )}
                      {whyChoose.features.map((feature, idx) => {
                        const PreviewIcon = resolveIcon(feature.iconName);
                        return (
                          <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
                                  <PreviewIcon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-white/80">Feature {idx + 1}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeWhyChooseFeature(idx)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                aria-label="Remove feature"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-white/50 mb-2">Icon</label>
                                <select
                                  value={feature.iconName}
                                  onChange={(e) => updateWhyChooseFeature(idx, { iconName: e.target.value })}
                                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white text-sm"
                                >
                                  {WHY_CHOOSE_ICON_NAMES.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-white/50 mb-2">Title</label>
                                <input
                                  type="text"
                                  value={feature.title}
                                  onChange={(e) => updateWhyChooseFeature(idx, { title: e.target.value })}
                                  placeholder="e.g. Safety & Trust"
                                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white text-sm placeholder:text-white/30"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white/50 mb-2">Description</label>
                              <textarea
                                value={feature.desc}
                                onChange={(e) => updateWhyChooseFeature(idx, { desc: e.target.value })}
                                placeholder="Short sentence describing this feature."
                                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white text-sm min-h-[70px] placeholder:text-white/30"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingWhyChoose}
                      className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    >
                      {isSavingWhyChoose ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" /> Save &quot;Why Choose Us&quot;
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PAGES HERO TAB */}
          {activeTab === "pagesHero" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Pages Hero</h2>
                <p className="text-white/50 mt-1">Manage the hero content and backgrounds for Destinations, Tours, Trekking, and Blog pages.</p>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-xl w-fit flex-wrap">
                {(["destinations", "tours", "trekking", "blog", "footer"] as const).map(section => (
                  <button
                    key={section}
                    onClick={() => setActivePagesHeroSection(section)}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-colors capitalize ${
                      activePagesHeroSection === section ? "bg-brand-500 text-white shadow-lg" : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {section === "footer" ? "🔗 Footer" : section}
                  </button>
                ))}
              </div>

              {/* Footer Settings sub-tab */}
              {activePagesHeroSection === "footer" ? (
                <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                  <form onSubmit={handleSaveFooter} className="p-8 space-y-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Tagline (large heading)</label>
                        <input
                          type="text"
                          value={footerSettings.tagline}
                          onChange={e => setFooterSettings(p => ({ ...p, tagline: e.target.value }))}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500"
                          placeholder="Ready to embark on the adventure of a lifetime?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Short Description</label>
                        <textarea
                          rows={3}
                          value={footerSettings.description}
                          onChange={e => setFooterSettings(p => ({ ...p, description: e.target.value }))}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500 resize-none"
                          placeholder="A short paragraph about your company…"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-bold text-white/70 mb-1 uppercase tracking-widest">Social Media Links</label>
                        <p className="text-xs text-white/40 mb-4">Paste the full URL for each platform. Leave blank to use the default # placeholder.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {([
                            { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
                            { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/yourhandle" },
                            { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
                            { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
                            { key: "tiktok", label: "TikTok (optional)", placeholder: "https://tiktok.com/@yourhandle" },
                          ] as { key: keyof typeof footerSettings; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                            <div key={key}>
                              <label className="block text-xs font-semibold text-white/50 mb-1">{label}</label>
                              <input
                                type="url"
                                value={(footerSettings as any)[key]}
                                onChange={e => setFooterSettings(p => ({ ...p, [key]: e.target.value }))}
                                placeholder={placeholder}
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 placeholder:text-white/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingFooter}
                        className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                      >
                        {isSavingFooter ? (
                          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                        ) : (
                          <><CheckCircle className="w-5 h-5" /> Save Footer Settings</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <form onSubmit={handleSavePagesHero} className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2 capitalize">{activePagesHeroSection} Title</label>
                      <input
                        type="text"
                        value={(pagesHero as any)[activePagesHeroSection]?.title || ""}
                        onChange={(e) => setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], title: e.target.value } }))}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2 capitalize">{activePagesHeroSection} Subtitle</label>
                      <textarea
                        value={(pagesHero as any)[activePagesHeroSection]?.subtitle || ""}
                        onChange={(e) => setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], subtitle: e.target.value } }))}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500 min-h-[100px]"
                        required
                      />
                    </div>
                    
                    {/* ── Hero Tags Chip Selector ── */}
                    <div>
                      <label className="block text-sm font-bold text-white/70 mb-1 uppercase tracking-widest">
                        Hero Tags
                      </label>
                      <p className="text-xs text-white/40 mb-3">Tags that appear floating on the hero image. Click to toggle.</p>
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
                        {/* Suggestion pills */}
                        <div className="flex flex-wrap gap-2">
                          {(PAGES_HERO_TAG_SUGGESTIONS[activePagesHeroSection] || []).map((suggestion) => {
                            const currentTags: string[] = (pagesHero as any)[activePagesHeroSection]?.tags || [];
                            const isSelected = currentTags.includes(suggestion);
                            return isSelected ? (
                              <span key={suggestion} className="inline-flex items-center gap-1 pl-4 pr-2 py-1.5 rounded-full text-xs font-bold bg-brand-500 border border-brand-400 text-white shadow-lg shadow-brand-500/30">
                                {suggestion}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = currentTags.filter((t) => t !== suggestion);
                                    setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], tags: arr } }));
                                  }}
                                  className="ml-0.5 w-4 h-4 rounded-full bg-white/20 hover:bg-red-500/80 flex items-center justify-center transition-colors"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ) : (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                  const arr = [...currentTags, suggestion];
                                  setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], tags: arr } }));
                                }}
                                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border bg-white/5 border-white/15 text-white/50 hover:border-white/30 hover:text-white/80 hover:bg-white/10"
                              >
                                + {suggestion}
                              </button>
                            );
                          })}
                        </div>
                        {/* Custom tags (those not in suggestions) */}
                        {((pagesHero as any)[activePagesHeroSection]?.tags || []).filter((t: string) => !(PAGES_HERO_TAG_SUGGESTIONS[activePagesHeroSection] || []).includes(t)).length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                            <span className="text-white/30 text-xs self-center">Custom:</span>
                            {((pagesHero as any)[activePagesHeroSection]?.tags || []).filter((t: string) => !(PAGES_HERO_TAG_SUGGESTIONS[activePagesHeroSection] || []).includes(t)).map((tag: string) => (
                              <span key={tag} className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-semibold">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = ((pagesHero as any)[activePagesHeroSection]?.tags || []).filter((t2: string) => t2 !== tag);
                                    setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], tags: arr } }));
                                  }}
                                  className="ml-0.5 w-4 h-4 rounded-full bg-white/20 hover:bg-red-500/80 flex items-center justify-center transition-colors"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Custom tag input */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <input
                            type="text"
                            placeholder="Add a custom tag…"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (!val) return;
                                const currentTags: string[] = (pagesHero as any)[activePagesHeroSection]?.tags || [];
                                if (!currentTags.includes(val)) {
                                  setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], tags: [...currentTags, val] } }));
                                }
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 placeholder:text-white/30"
                          />
                          <span className="text-white/30 text-xs">Press Enter</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Category Tabs Chip Selector ── */}
                    <div>
                      <label className="block text-sm font-bold text-white/70 mb-1 uppercase tracking-widest">
                        Category Tabs
                      </label>
                      <p className="text-xs text-white/40 mb-3">These override the auto-generated filter tabs on the page. Click to toggle.</p>
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
                        {/* Suggestion pills */}
                        <div className="flex flex-wrap gap-2">
                          {(PAGES_HERO_TAB_SUGGESTIONS[activePagesHeroSection] || []).map((suggestion) => {
                            const currentTabs: string[] = (pagesHero as any)[activePagesHeroSection]?.tabs || [];
                            const isSelected = currentTabs.includes(suggestion);
                            return isSelected ? (
                              <span key={suggestion} className="inline-flex items-center gap-1 pl-4 pr-2 py-1.5 rounded-full text-xs font-bold bg-emerald-500 border border-emerald-400 text-white shadow-lg shadow-emerald-500/30">
                                {suggestion}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = currentTabs.filter((t) => t !== suggestion);
                                    setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], tabs: arr } }));
                                  }}
                                  className="ml-0.5 w-4 h-4 rounded-full bg-white/20 hover:bg-red-500/80 flex items-center justify-center transition-colors"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ) : (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                  const arr = [...currentTabs, suggestion];
                                  setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], tabs: arr } }));
                                }}
                                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border bg-white/5 border-white/15 text-white/50 hover:border-white/30 hover:text-white/80 hover:bg-white/10"
                              >
                                + {suggestion}
                              </button>
                            );
                          })}
                        </div>
                        {/* Custom tabs (those not in suggestions) */}
                        {((pagesHero as any)[activePagesHeroSection]?.tabs || []).filter((t: string) => !(PAGES_HERO_TAB_SUGGESTIONS[activePagesHeroSection] || []).includes(t)).length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                            <span className="text-white/30 text-xs self-center">Custom:</span>
                            {((pagesHero as any)[activePagesHeroSection]?.tabs || []).filter((t: string) => !(PAGES_HERO_TAB_SUGGESTIONS[activePagesHeroSection] || []).includes(t)).map((tab: string) => (
                              <span key={tab} className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                                {tab}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = ((pagesHero as any)[activePagesHeroSection]?.tabs || []).filter((t2: string) => t2 !== tab);
                                    setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], tabs: arr } }));
                                  }}
                                  className="ml-0.5 w-4 h-4 rounded-full bg-white/20 hover:bg-red-500/80 flex items-center justify-center transition-colors"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Custom tab input */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <input
                            type="text"
                            placeholder="Add a custom tab…"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (!val) return;
                                const currentTabs: string[] = (pagesHero as any)[activePagesHeroSection]?.tabs || [];
                                if (!currentTabs.includes(val)) {
                                  setPagesHero(prev => ({ ...prev, [activePagesHeroSection]: { ...(prev as any)[activePagesHeroSection], tabs: [...currentTabs, val] } }));
                                }
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 placeholder:text-white/30"
                          />
                          <span className="text-white/30 text-xs">Press Enter</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2 capitalize">{activePagesHeroSection} Auto-Changing Background Images</label>
                      <p className="text-xs text-white/40 mb-4">These images will smoothly crossfade in the background every 5 seconds.</p>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        {((pagesHero as any)[activePagesHeroSection]?.bgImages || []).length > 0 ? ((pagesHero as any)[activePagesHeroSection]?.bgImages || []).map((imgUrl: string, imgIdx: number) => (
                          <div key={imgIdx} className="relative group shrink-0">
                            <div className="w-32 h-20 relative rounded-xl overflow-hidden border border-white/10 bg-black/50">
                              <Image src={imgUrl} alt={`${activePagesHeroSection} bg preview ${imgIdx}`} fill className="object-cover" />
                            </div>
                            <button
                              type="button"
                              onClick={async () => { 
                                await deleteBlobImage(imgUrl); 
                                const newBgImages = [...(pagesHero as any)[activePagesHeroSection].bgImages];
                                newBgImages.splice(imgIdx, 1);
                                setPagesHero(prev => ({
                                  ...prev,
                                  [activePagesHeroSection]: {
                                    ...(prev as any)[activePagesHeroSection],
                                    bgImages: newBgImages
                                  }
                                }));
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              title="Remove image"
                            >✕</button>
                          </div>
                        )) : (
                          (pagesHero as any)[activePagesHeroSection]?.bgImage && (
                            <div className="relative group shrink-0 opacity-50">
                              <div className="w-32 h-20 relative rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                <Image src={(pagesHero as any)[activePagesHeroSection].bgImage} alt="Legacy Image" fill className="object-cover" />
                              </div>
                              <p className="text-[10px] text-center mt-1 text-white/40">Legacy Image</p>
                            </div>
                          )
                        )}
                        <label className="flex items-center gap-2 px-4 py-3 bg-black/60 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors text-sm font-medium text-white/80 w-full sm:w-auto h-20">
                          <UploadCloud className="w-5 h-5" />
                          {uploadingPagesHeroImage === activePagesHeroSection ? "Uploading..." : "Add Background Image"}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePagesHeroBgImageUpload(e, activePagesHeroSection)} disabled={uploadingPagesHeroImage === activePagesHeroSection} />
                        </label>
                      </div>
                      
                      {/* hidden to gracefully remove old UI logic block */}{(pagesHero as any)[activePagesHeroSection]?.bgImage && (
                        <div className="mt-4 relative h-48 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                          <Image src={(pagesHero as any)[activePagesHeroSection].bgImage} alt={`${activePagesHeroSection} Hero`} fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingPagesHero}
                      className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    >
                      {isSavingPagesHero ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                      ) : (
                        <><CheckCircle className="w-5 h-5" /> Save Pages Hero</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              )}
            </div>
          )}

          {/* ABOUT PAGE TAB */}
          {activeTab === "aboutPage" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">About Page</h2>
                <p className="text-white/50 mt-1">Manage the content, story, features, and imagery for the About Us page.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <form onSubmit={handleSaveAboutPage} className="p-8 space-y-12">
                  
                  {/* Hero Section */}
                  <div className="space-y-6">
                    <h3 className="font-bold text-xl text-white border-b border-white/10 pb-2">Hero Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Hero Title</label>
                        <input
                          type="text"
                          value={aboutPage.heroTitle}
                          onChange={(e) => setAboutPage({ ...aboutPage, heroTitle: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Hero Subtitle</label>
                        <textarea
                          value={aboutPage.heroSubtitle}
                          onChange={(e) => setAboutPage({ ...aboutPage, heroSubtitle: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500 h-[56px] resize-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Hero Image</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="url"
                          value={aboutPage.heroImage}
                          onChange={(e) => setAboutPage({ ...aboutPage, heroImage: e.target.value })}
                          placeholder="Image URL..."
                          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500"
                        />
                        <div className="relative shrink-0">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleAboutImageUpload(e, "heroImage")}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingAboutImage === "heroImage"}
                          />
                          <button 
                            type="button" 
                            className="bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-6 rounded-xl flex items-center gap-2 border border-white/10 transition-colors disabled:opacity-50"
                            disabled={uploadingAboutImage === "heroImage"}
                          >
                            {uploadingAboutImage === "heroImage" ? "Uploading..." : <><Upload className="w-5 h-5" /> Upload File</>}
                          </button>
                        </div>
                      </div>
                      {aboutPage.heroImage && (
                        <div className="mt-4 relative h-48 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                          <Image src={aboutPage.heroImage} alt="Hero" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Section */}
                  <div className="space-y-6">
                    <h3 className="font-bold text-xl text-white border-b border-white/10 pb-2">Our Story</h3>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Story Title</label>
                      <input
                        type="text"
                        value={aboutPage.storyTitle}
                        onChange={(e) => setAboutPage({ ...aboutPage, storyTitle: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Story Text 1</label>
                        <textarea
                          value={aboutPage.storyText1}
                          onChange={(e) => setAboutPage({ ...aboutPage, storyText1: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500 min-h-[150px]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Story Text 2</label>
                        <textarea
                          value={aboutPage.storyText2}
                          onChange={(e) => setAboutPage({ ...aboutPage, storyText2: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500 min-h-[150px]"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Story Side Image</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="url"
                          value={aboutPage.storyImage}
                          onChange={(e) => setAboutPage({ ...aboutPage, storyImage: e.target.value })}
                          placeholder="Image URL..."
                          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500"
                        />
                        <div className="relative shrink-0">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleAboutImageUpload(e, "storyImage")}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingAboutImage === "storyImage"}
                          />
                          <button 
                            type="button" 
                            className="bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-6 rounded-xl flex items-center gap-2 border border-white/10 transition-colors disabled:opacity-50"
                            disabled={uploadingAboutImage === "storyImage"}
                          >
                            {uploadingAboutImage === "storyImage" ? "Uploading..." : <><Upload className="w-5 h-5" /> Upload File</>}
                          </button>
                        </div>
                      </div>
                      {aboutPage.storyImage && (
                        <div className="mt-4 relative h-48 w-full md:w-1/2 rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                          <Image src={aboutPage.storyImage} alt="Story" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-white border-b border-white/10 pb-2">Bullet Features</h3>
                    <div className="space-y-3">
                      {aboutPage.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...aboutPage.features];
                              newFeatures[i] = e.target.value;
                              setAboutPage({ ...aboutPage, features: newFeatures });
                            }}
                            className="flex-1 bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFeatures = aboutPage.features.filter((_, idx) => idx !== i);
                              setAboutPage({ ...aboutPage, features: newFeatures });
                            }}
                            className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="text"
                        value={newAboutFeature}
                        onChange={(e) => setNewAboutFeature(e.target.value)}
                        placeholder="Add new feature..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newAboutFeature.trim()) {
                              setAboutPage({ ...aboutPage, features: [...aboutPage.features, newAboutFeature.trim()] });
                              setNewAboutFeature("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newAboutFeature.trim()) {
                            setAboutPage({ ...aboutPage, features: [...aboutPage.features, newAboutFeature.trim()] });
                            setNewAboutFeature("");
                          }
                        }}
                        className="p-3 bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Featured Testimonial */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-white border-b border-white/10 pb-2">Featured Testimonial</h3>
                    <p className="text-white/50 text-sm">Choose one client review to feature on the About page story section.</p>

                    {/* Current Selection Preview */}
                    {selectedTestimonialId && reviews.find(r => r.id === selectedTestimonialId) ? (() => {
                      const t = reviews.find(r => r.id === selectedTestimonialId);
                      return (
                        <div className="relative bg-black/40 border border-brand-500/30 rounded-2xl p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(t.rating || 5)].map((_: any, j: number) => (
                                  <svg key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                ))}
                              </div>
                              <p className="text-white/80 text-sm leading-relaxed">&ldquo;{t.message}&rdquo;</p>
                              <p className="text-brand-400 text-xs font-bold mt-2 uppercase tracking-wider">— {t.name || "Verified Traveler"}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedTestimonialId("")}
                              className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                              title="Remove selection"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="absolute top-3 right-10 text-[10px] bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Selected</span>
                        </div>
                      );
                    })() : (
                      <div className="bg-black/20 border border-white/10 border-dashed rounded-2xl p-6 text-center text-white/30 text-sm">
                        No testimonial selected — default text will be shown.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowPickTestimonialModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-xl transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {selectedTestimonialId ? "Change Testimonial" : "Pick a Testimonial"}
                    </button>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingAbout}
                      className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    >
                      {isSavingAbout ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                      ) : (
                        <><CheckCircle className="w-5 h-5" /> Save About Page</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* BLOG POSTS TAB */}
          {activeTab === "blog" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Blog Management</h2>
                  <p className="text-white/50 mt-1">Manage published posts and review user submissions.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {blogs.length === 0 && blogTab === "published" && (
                    <button onClick={handleSeedDemoPosts}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 font-bold transition-all border border-white/10 text-sm">
                      🌱 Seed Demo Posts
                    </button>
                  )}
                  {blogTab === "published" && (
                    <button onClick={() => openBlogModal()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all hover:scale-105 shadow-xl shadow-brand-500/20">
                      <Plus className="w-5 h-5" /> New Post
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
                <button onClick={() => setBlogTab("published")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${blogTab === "published" ? "bg-brand-600 text-white shadow-lg" : "text-white/50 hover:text-white"}`}>
                  Blog Posts
                  <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{blogs.length}</span>
                </button>
                <button onClick={() => setBlogTab("pending")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${blogTab === "pending" ? "bg-brand-600 text-white shadow-lg" : "text-white/50 hover:text-white"}`}>
                  Blog Requests
                  {pendingBlogs.length > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-black">{pendingBlogs.length}</span>
                  )}
                </button>
              </div>

              {/* ── PUBLISHED POSTS ──────────────────────────────── */}
              {blogTab === "published" && (
                blogs.length === 0 ? (
                  <div className="text-center py-24 bg-white/5 rounded-[2rem] border border-white/10">
                    <BookOpen className="w-16 h-16 text-brand-500/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No blog posts yet</h3>
                    <p className="text-white/40 mb-6">Click &ldquo;New Post&rdquo; to write your first article.</p>
                    <button onClick={() => openBlogModal()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all">
                      <Plus className="w-4 h-4" /> Create First Post
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {blogs.map((blog: any) => (
                      <div key={blog.id}
                        className="group relative bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden hover:border-brand-500/30 transition-all hover:shadow-xl hover:shadow-brand-500/10">
                        <div className="relative h-44 overflow-hidden">
                          {blog.image ? (
                            <Image src={blog.image} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <div className="h-full bg-gradient-to-br from-brand-500/20 to-brand-700/20 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-brand-500/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-brand-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {blog.category || "General"}
                            </span>
                            {blog.isFeatured && (
                              <span className="text-[10px] font-black bg-yellow-500 text-black px-2 py-0.5 rounded-full uppercase">Featured</span>
                            )}
                          </div>
                          {/* Author badge */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                            {blog.source === "user" && blog.submittedBy?.photoURL ? (
                              <Image src={blog.submittedBy.photoURL} alt={blog.submittedBy.name} width={18} height={18} className="rounded-full border border-white/30 object-cover" />
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-brand-500/80 flex items-center justify-center text-[8px] font-black text-white">GA</span>
                            )}
                            <span className="text-white/70 text-[10px] font-semibold">
                              {blog.source === "user" && blog.submittedBy ? blog.submittedBy.name : "Green Adventure"}
                            </span>
                          </div>
                          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${blog.status === "published" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                            {blog.status || "draft"}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-400 transition-colors">{blog.title}</h3>
                          <p className="text-white/40 text-xs line-clamp-2 mb-4 leading-relaxed">{blog.excerpt}</p>
                          {blog.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {blog.tags.slice(0, 3).map((t: string) => (
                                <span key={t} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{t}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <button onClick={() => openBlogModal(blog)}
                              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => setDoc(doc(db, "blogs", blog.id), { isFeatured: !blog.isFeatured }, { merge: true })}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${blog.isFeatured ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"}`}>
                              {blog.isFeatured ? "★ Featured" : "☆ Feature"}
                            </button>
                            <button onClick={() => handleDeleteBlog(blog.id)} disabled={isDeletingBlog === blog.id}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 disabled:opacity-50">
                              {isDeletingBlog === blog.id
                                ? <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── PENDING REQUESTS ─────────────────────────────── */}
              {blogTab === "pending" && (
                pendingBlogs.length === 0 ? (
                  <div className="text-center py-24 bg-white/5 rounded-[2rem] border border-white/10">
                    <BookOpen className="w-16 h-16 text-brand-500/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No pending submissions</h3>
                    <p className="text-white/40">User-submitted stories will appear here for review.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingBlogs.map((blog: any) => (
                      <div key={blog.id}
                        className="group relative bg-white/5 border border-amber-500/20 rounded-[1.5rem] overflow-hidden hover:border-amber-500/40 transition-all hover:shadow-xl hover:shadow-amber-500/10">
                        {/* Pending badge */}
                        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
                          <span className="text-amber-400 text-[11px] font-black uppercase tracking-wider">⏳ Pending Review</span>
                          <span className="text-white/30 text-[10px]">{blog.createdAt?.seconds ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}</span>
                        </div>
                        {/* Author info */}
                        {blog.submittedBy && (
                          <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5">
                            {blog.submittedBy.photoURL ? (
                              <Image src={blog.submittedBy.photoURL} alt={blog.submittedBy.name} width={36} height={36} className="rounded-full border-2 border-brand-500/30 object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center text-xs font-black text-brand-400">
                                {blog.submittedBy.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-white font-bold text-sm truncate">{blog.submittedBy.name}</p>
                              <p className="text-white/40 text-[11px] truncate">{blog.submittedBy.email}</p>
                            </div>
                          </div>
                        )}
                        <div className="p-4">
                          <span className="text-[10px] font-bold bg-brand-500/20 text-brand-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                            {blog.category || "General"}
                          </span>
                          <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-2">{blog.title}</h3>
                          <p className="text-white/40 text-xs line-clamp-3 mb-4 leading-relaxed">{blog.excerpt}</p>
                          {blog.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {blog.tags.slice(0, 3).map((t: string) => (
                                <span key={t} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{t}</span>
                              ))}
                            </div>
                          )}
                          {/* Approve / Edit / Reject */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                if (!confirm(`Approve "${blog.title}" and publish it?`)) return;
                                await setDoc(doc(db, "blogs", blog.id), { status: "published", approvedAt: serverTimestamp() }, { merge: true });
                                setBlogTab("published");
                              }}
                              className="flex-1 py-2 rounded-xl bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-black flex items-center justify-center gap-1.5 transition-colors border border-green-500/25">
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => openBlogModal(blog)}
                              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              disabled={isDeletingBlog === blog.id}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 disabled:opacity-50">
                              {isDeletingBlog === blog.id
                                ? <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}


          {/* REGIONS TAB */}

          {activeTab === "regions" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Regional Cards</h2>
                  <p className="text-white/50 mt-1">Manage the "Himalayan Adventures" destination cards shown on the home page.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingRegion(null);
                    setRegionFormData({ title: "", desc: "", image: "", heroImage: "", subtitle: "", overview: "", tours: 0, featured: true, order: 0 });
                    setIsRegionModalOpen(true);
                  }}
                  className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                >
                  <Plus className="w-5 h-5" /> Add Region
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regions.map((region) => (
                  <div key={region.id} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden group hover:border-brand-500/30 transition-colors flex flex-col relative">
                    <div className="h-48 w-full relative overflow-hidden bg-black/50">
                      {region.image ? (
                        <Image src={region.image} alt={region.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2 z-10">
                        {region.featured !== false && (
                          <span className="bg-brand-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Featured</span>
                        )}
                        {region.tours > 0 && (
                          <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">{region.tours} Packages</span>
                        )}
                      </div>
                      {region.heroImage && (
                        <span className="absolute top-3 right-3 bg-blue-500/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm z-10">Hero ✓</span>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{region.title}</h3>
                      {region.subtitle && <p className="text-brand-400 text-xs font-medium mb-2">{region.subtitle}</p>}
                      <p className="text-white/60 text-sm mb-6 flex-1 line-clamp-2">{region.desc}</p>
                      
                      <div className="pt-4 border-t border-white/10 flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingRegion(region);
                            setRegionFormData({
                              title: region.title || "",
                              desc: region.desc || "",
                              image: region.image || "",
                              heroImage: region.heroImage || "",
                              subtitle: region.subtitle || "",
                              overview: region.overview || "",
                              tours: region.tours || 0,
                              featured: region.featured !== false,
                              order: region.order || 0
                            });
                            setIsRegionModalOpen(true);
                          }}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteRegion(region.id)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {regions.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
                    <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">No regions found. Click 'Add Region' to create one.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TRIP MODAL */}
      {isTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => {
            setIsTripModalOpen(false);
            setEditingTrip(null);
          }}></div>
          <div className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Map className="w-5 h-5 text-brand-500" />
                {editingTrip ? "Edit Trip Package" : "Add New Trip Package"}
              </h2>
              <button 
                onClick={() => {
                  setIsTripModalOpen(false);
                  setEditingTrip(null);
                }}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="trip-form" onSubmit={handleSaveTrip} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Trip Title</label>
                    <input
                      type="text"
                      required
                      value={tripFormData.title}
                      onChange={(e) => setTripFormData({...tripFormData, title: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. Everest Base Camp Trek"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Region/Country</label>
                    <select
                      required
                      value={tripFormData.region}
                      onChange={(e) => setTripFormData({...tripFormData, region: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a Region</option>
                      {/* Always show core regions */}
                      {["Nepal", "Bhutan", "India"].map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                      {/* Show any additional regions from DB that aren't already listed */}
                      {regions
                        .filter((r: any) => !["Nepal", "Bhutan", "India"].includes(r.title))
                        .map((r: any) => (
                          <option key={r.id} value={r.title}>{r.title}</option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Duration</label>
                    <input
                      type="text"
                      required
                      value={tripFormData.duration}
                      onChange={(e) => setTripFormData({...tripFormData, duration: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. 14 Days"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Pay Level</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">$</span>
                      <input
                        type="text"
                        required
                        value={tripFormData.price}
                        onChange={(e) => setTripFormData({...tripFormData, price: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-20 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                        placeholder="e.g. 250 - 400"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">/ person</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Difficulty</label>
                    <select
                      required
                      value={tripFormData.difficulty}
                      onChange={(e) => setTripFormData({...tripFormData, difficulty: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                      <option value="extreme">Extreme</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-white/70">Rating</label>
                      <span className="text-xs font-bold text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-full">{tripFormData.rating} Stars</span>
                    </div>
                    <div className="flex gap-1 items-center h-[50px] px-4 bg-black/50 border border-white/10 rounded-xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="relative cursor-pointer w-7 h-7">
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-1/2 z-10" 
                            onClick={() => setTripFormData({...tripFormData, rating: star - 0.5})}
                          />
                          <div 
                            className="absolute right-0 top-0 bottom-0 w-1/2 z-10" 
                            onClick={() => setTripFormData({...tripFormData, rating: star})}
                          />
                          <svg className="w-full h-full text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" fill={tripFormData.rating >= star ? "currentColor" : "none"} />
                          </svg>
                          {tripFormData.rating === star - 0.5 && (
                            <svg className="w-full h-full text-yellow-500 absolute top-0 left-0 pointer-events-none" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} fill="currentColor" viewBox="0 0 24 24">
                               <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Trip Type</label>
                    <select
                      required
                      value={tripFormData.tripType}
                      onChange={(e) => setTripFormData({...tripFormData, tripType: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                    >
                      <option value="Tour">Tour</option>
                      <option value="Trekking">Trekking</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Group Size</label>
                    <input
                      type="text"
                      value={tripFormData.groupSize}
                      onChange={(e) => setTripFormData({...tripFormData, groupSize: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. Max 8 people"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-white/70">Tags</label>
                    <div className="flex flex-wrap gap-3 p-4 bg-black/30 border border-white/10 rounded-xl">
                      {availableTags.map((tag) => (
                        <label key={tag} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={tripFormData.tags?.includes(tag) || false}
                            onChange={(e) => {
                              const newTags = e.target.checked 
                                ? [...(tripFormData.tags || []), tag]
                                : (tripFormData.tags || []).filter(t => t !== tag);
                              setTripFormData({...tripFormData, tags: newTags});
                            }}
                          />
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            tripFormData.tags?.includes(tag) 
                              ? 'bg-brand-500 border-brand-400 text-white shadow-lg shadow-brand-500/20' 
                              : 'bg-black/50 border-white/10 text-white/50 hover:text-white/80 hover:border-white/30'
                          }`}>
                            {tag}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-white/70">Image (Upload or URL)</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 bg-black/50 border border-white/10 hover:border-brand-500/50 rounded-xl px-4 py-3 text-white cursor-pointer transition-colors flex items-center justify-center gap-2 group">
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={handleTripImageUpload}
                            disabled={isUploadingTripImage}
                          />
                          {isUploadingTripImage ? (
                            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <UploadCloud className="w-5 h-5 text-white/50 group-hover:text-brand-400 transition-colors" />
                          )}
                          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                            {isUploadingTripImage ? "Uploading..." : "Upload from Computer"}
                          </span>
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-xs text-white/40 uppercase tracking-widest font-bold">OR</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          required
                          value={tripFormData.image}
                          onChange={(e) => setTripFormData({...tripFormData, image: e.target.value})}
                          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                          placeholder="https://images.unsplash.com/..."
                        />
                        {tripFormData.image && (
                          <button
                            type="button"
                            onClick={async () => { await deleteBlobImage(tripFormData.image); setTripFormData({...tripFormData, image: ""}); }}
                            className="w-9 h-9 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-center transition-colors border border-red-500/20 shrink-0"
                            title="Remove image"
                          >✕</button>
                        )}
                      </div>
                    </div>
                    {tripFormData.image && (
                      <div className="mt-3 relative h-40 w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 group">
                        <Image src={tripFormData.image} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={async () => { await deleteBlobImage(tripFormData.image); setTripFormData({...tripFormData, image: ""}); }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Remove image"
                        >✕</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">Description / Highlights</label>
                  <textarea
                    required
                    rows={4}
                    value={tripFormData.desc}
                    onChange={(e) => setTripFormData({...tripFormData, desc: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors resize-none"
                    placeholder="Brief description of the trip highlights..."
                  ></textarea>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                    className="w-full py-4 bg-gradient-to-r from-brand-500/10 to-transparent border border-brand-500/30 rounded-xl text-brand-400 font-bold flex justify-center items-center gap-2 hover:bg-brand-500/20 transition-colors shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]"
                  >
                    {showDetailedInfo ? "Hide Detailed Information" : "Manage Detailed Information"}
                  </button>
                  
                  {showDetailedInfo && (
                    <div className="space-y-6 border border-white/5 bg-white/[0.02] p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
                      <div className="flex items-center gap-2 text-white/70 font-medium pb-2 border-b border-white/10">
                        <Map className="w-4 h-4 text-brand-400" /> Complete Trip Details
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white/70">Custom Slug (Optional)</label>
                          <input
                            type="text"
                            value={tripFormData.slug}
                            onChange={(e) => setTripFormData({...tripFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                            placeholder="e.g. everest-base-camp"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white/70">Altitude</label>
                          <input
                            type="text"
                            value={tripFormData.altitude}
                            onChange={(e) => setTripFormData({...tripFormData, altitude: e.target.value})}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                            placeholder="e.g. 5,364m / 17,598ft"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/70">Overview (Paragraphs)</label>
                        <textarea
                          rows={6}
                          value={tripFormData.overview}
                          onChange={(e) => setTripFormData({...tripFormData, overview: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors resize-none"
                          placeholder="Detailed overview of the trip. Each new line will be a new paragraph."
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-white uppercase tracking-wider">Includes (What's included)</label>
                            <button
                              type="button"
                              onClick={() => setTripFormData({ ...tripFormData, includes: [...tripFormData.includes, ""] })}
                              className="text-xs font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg border border-brand-500/20 flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Include
                            </button>
                          </div>
                          <div className="space-y-3">
                            {tripFormData.includes.map((item, index) => (
                              <div key={index} className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5 relative group">
                                <span className="text-green-500 mt-2 shrink-0">✓</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newIncludes = [...tripFormData.includes];
                                    newIncludes[index] = e.target.value;
                                    setTripFormData({ ...tripFormData, includes: newIncludes });
                                  }}
                                  placeholder="e.g. Airport pickups and drops"
                                  className="flex-1 bg-transparent border-none px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 rounded text-white text-sm"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newIncludes = [...tripFormData.includes];
                                    newIncludes.splice(index, 1);
                                    setTripFormData({ ...tripFormData, includes: newIncludes });
                                  }}
                                  className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {tripFormData.includes.length === 0 && (
                              <div className="text-center py-6 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                                No includes added yet. Click "+ Add Include" to start.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-white uppercase tracking-wider">Excludes (What's not included)</label>
                            <button
                              type="button"
                              onClick={() => setTripFormData({ ...tripFormData, excludes: [...tripFormData.excludes, ""] })}
                              className="text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Exclude
                            </button>
                          </div>
                          <div className="space-y-3">
                            {tripFormData.excludes.map((item, index) => (
                              <div key={index} className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5 relative group">
                                <span className="text-red-500 mt-2 shrink-0">✗</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newExcludes = [...tripFormData.excludes];
                                    newExcludes[index] = e.target.value;
                                    setTripFormData({ ...tripFormData, excludes: newExcludes });
                                  }}
                                  placeholder="e.g. International flights"
                                  className="flex-1 bg-transparent border-none px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 rounded text-white text-sm"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newExcludes = [...tripFormData.excludes];
                                    newExcludes.splice(index, 1);
                                    setTripFormData({ ...tripFormData, excludes: newExcludes });
                                  }}
                                  className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {tripFormData.excludes.length === 0 && (
                              <div className="text-center py-6 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                                No excludes added yet. Click "+ Add Exclude" to start.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* FAQs Section */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-white uppercase tracking-wider">Frequently Asked Questions (FAQs)</label>
                            <button
                              type="button"
                              onClick={() => setTripFormData({ ...tripFormData, faqs: [...(tripFormData.faqs || []), { q: "", a: "" }] })}
                              className="text-xs font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg border border-brand-500/20 flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add FAQ
                            </button>
                          </div>
                          <div className="space-y-4">
                            {(tripFormData.faqs || []).map((faq, index) => (
                              <div key={index} className="bg-black/40 p-4 rounded-xl border border-white/5 relative group">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1 pr-4">
                                    <input
                                      type="text"
                                      value={faq.q}
                                      onChange={(e) => {
                                        const newFaqs = [...(tripFormData.faqs || [])];
                                        newFaqs[index].q = e.target.value;
                                        setTripFormData({ ...tripFormData, faqs: newFaqs });
                                      }}
                                      placeholder="Question (e.g. What is the best time to visit?)"
                                      className="w-full bg-transparent border-b border-white/10 px-0 py-1.5 focus:outline-none focus:border-brand-500 text-white font-medium text-sm"
                                      required
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newFaqs = [...(tripFormData.faqs || [])];
                                      newFaqs.splice(index, 1);
                                      setTripFormData({ ...tripFormData, faqs: newFaqs });
                                    }}
                                    className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div>
                                  <textarea
                                    value={faq.a}
                                    onChange={(e) => {
                                      const newFaqs = [...(tripFormData.faqs || [])];
                                      newFaqs[index].a = e.target.value;
                                      setTripFormData({ ...tripFormData, faqs: newFaqs });
                                    }}
                                    placeholder="Answer..."
                                    className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-brand-500 min-h-[60px] resize-y"
                                    required
                                  />
                                </div>
                              </div>
                            ))}
                            {(tripFormData.faqs || []).length === 0 && (
                              <div className="text-center py-6 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                                No FAQs added yet. Click "+ Add FAQ" to start.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-t border-white/10 pt-6">
                          <label className="block font-medium text-white">Itinerary Builder</label>
                          <button 
                            type="button" 
                            onClick={() => setTripFormData({...tripFormData, itinerary: [...(tripFormData.itinerary || []), { day: `Day ${(tripFormData.itinerary?.length || 0) + 1}`, title: "", desc: "" }]})}
                            className="px-3 py-1.5 bg-brand-500/20 border border-brand-500/30 text-brand-400 hover:bg-brand-500/30 rounded-lg text-xs font-bold transition-colors shadow-lg"
                          >
                            + Add Day
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {(!tripFormData.itinerary || tripFormData.itinerary.length === 0) && (
                            <div className="p-8 bg-black/30 border border-white/5 rounded-xl text-center text-white/30 text-sm">
                              No itinerary days added yet. Click "+ Add Day" to start building your itinerary.
                            </div>
                          )}
                          {tripFormData.itinerary?.map((day, idx) => (
                            <div key={idx} className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3 relative group transition-all hover:border-white/20">
                              <button 
                                type="button"
                                onClick={() => {
                                  const newItinerary = [...tripFormData.itinerary];
                                  newItinerary.splice(idx, 1);
                                  setTripFormData({...tripFormData, itinerary: newItinerary});
                                }}
                                className="absolute top-2 right-2 p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Day"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pr-8">
                                <div className="md:col-span-1">
                                  <input
                                    type="text"
                                    value={day.day}
                                    onChange={(e) => {
                                      const newItinerary = [...tripFormData.itinerary];
                                      newItinerary[idx].day = e.target.value;
                                      setTripFormData({...tripFormData, itinerary: newItinerary});
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
                                    placeholder="Day (e.g. Day 1)"
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <input
                                    type="text"
                                    value={day.title}
                                    onChange={(e) => {
                                      const newItinerary = [...tripFormData.itinerary];
                                      newItinerary[idx].title = e.target.value;
                                      setTripFormData({...tripFormData, itinerary: newItinerary});
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
                                    placeholder="Title (e.g. Arrival in Kathmandu)"
                                  />
                                </div>
                              </div>
                              <textarea
                                rows={2}
                                value={day.desc}
                                onChange={(e) => {
                                  const newItinerary = [...tripFormData.itinerary];
                                  newItinerary[idx].desc = e.target.value;
                                  setTripFormData({...tripFormData, itinerary: newItinerary});
                                }}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-sm resize-none"
                                placeholder="Description of the day's activities..."
                              ></textarea>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={tripFormData.isFeatured}
                    onChange={(e) => setTripFormData({...tripFormData, isFeatured: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-black/50 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                  />
                  <label htmlFor="isFeatured" className="text-white cursor-pointer font-medium flex-1">
                    Feature on Home Page
                    <p className="text-white/50 text-sm font-normal">Featured trips will be displayed in the Featured Tours section on the main landing page.</p>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsTripModalOpen(false);
                  setEditingTrip(null);
                }}
                className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="trip-form"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-500/20"
              >
                <CheckCircle className="w-5 h-5" />
                {editingTrip ? "Save Changes" : "Create Trip"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-brand-500" />
                {editingRegion ? "Edit Region" : "Add New Region"}
              </h2>
              <button
                onClick={() => {
                  setIsRegionModalOpen(false);
                  setEditingRegion(null);
                }}
                className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form id="region-form" onSubmit={handleSaveRegion} className="space-y-6">
                {/* Row 1: Title, Order, Tours */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Region Title</label>
                    <input
                      type="text"
                      required
                      value={regionFormData.title}
                      onChange={(e) => setRegionFormData({...regionFormData, title: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. Nepal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Order</label>
                    <input
                      type="number"
                      value={regionFormData.order}
                      onChange={(e) => setRegionFormData({...regionFormData, order: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Tour Packages Count</label>
                    <input
                      type="number"
                      value={regionFormData.tours}
                      onChange={(e) => setRegionFormData({...regionFormData, tours: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. 45"
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={regionFormData.subtitle}
                    onChange={(e) => setRegionFormData({...regionFormData, subtitle: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                    placeholder="e.g. The land of the Himalayas, offering spectacular trekking routes..."
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-4 p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regionFormData.featured}
                      onChange={(e) => setRegionFormData({...regionFormData, featured: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                  <div>
                    <span className="text-sm font-bold text-white">Show on Home Page</span>
                    <p className="text-xs text-white/50 mt-0.5">Display this region in the &ldquo;Himalayan Adventures&rdquo; section</p>
                  </div>
                </div>

                {/* Card Image */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Card Image <span className="text-white/30">(shown in cards)</span></label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 bg-black/50 border border-white/10 hover:border-brand-500/50 rounded-xl px-4 py-3 text-white cursor-pointer transition-colors flex items-center justify-center gap-2 group">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => handleRegionImageUpload(e, "image")}
                          disabled={isUploadingRegionImage}
                        />
                        {isUploadingRegionImage ? (
                          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <UploadCloud className="w-5 h-5 text-white/50 group-hover:text-brand-400 transition-colors" />
                        )}
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                          {isUploadingRegionImage ? "Uploading..." : "Upload Card Image"}
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={regionFormData.image}
                        onChange={(e) => setRegionFormData({...regionFormData, image: e.target.value})}
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                        placeholder="Or paste image URL..."
                      />
                      {regionFormData.image && (
                        <button
                          type="button"
                          onClick={async () => { await deleteBlobImage(regionFormData.image); setRegionFormData({...regionFormData, image: ""}); }}
                          className="w-9 h-9 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-center transition-colors border border-red-500/20 shrink-0"
                          title="Remove image"
                        >✕</button>
                      )}
                    </div>
                  </div>
                  {regionFormData.image && (
                    <div className="mt-3 relative h-36 w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 group">
                      <Image src={regionFormData.image} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={async () => { await deleteBlobImage(regionFormData.image); setRegionFormData({...regionFormData, image: ""}); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove image"
                      >✕</button>
                    </div>
                  )}
                </div>

                {/* Hero Background Image */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Hero Background Image <span className="text-white/30">(destination page hero)</span></label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 bg-black/50 border border-white/10 hover:border-blue-500/50 rounded-xl px-4 py-3 text-white cursor-pointer transition-colors flex items-center justify-center gap-2 group">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => handleRegionImageUpload(e, "heroImage")}
                          disabled={isUploadingRegionHeroImage}
                        />
                        {isUploadingRegionHeroImage ? (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <UploadCloud className="w-5 h-5 text-white/50 group-hover:text-blue-400 transition-colors" />
                        )}
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                          {isUploadingRegionHeroImage ? "Uploading..." : "Upload Hero Image"}
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={regionFormData.heroImage}
                        onChange={(e) => setRegionFormData({...regionFormData, heroImage: e.target.value})}
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                        placeholder="Or paste hero image URL..."
                      />
                      {regionFormData.heroImage && (
                        <button
                          type="button"
                          onClick={async () => { await deleteBlobImage(regionFormData.heroImage); setRegionFormData({...regionFormData, heroImage: ""}); }}
                          className="w-9 h-9 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-center transition-colors border border-red-500/20 shrink-0"
                          title="Remove hero image"
                        >✕</button>
                      )}
                    </div>
                  </div>
                  {regionFormData.heroImage && (
                    <div className="mt-3 relative h-36 w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 group">
                      <Image src={regionFormData.heroImage} alt="Hero Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={async () => { await deleteBlobImage(regionFormData.heroImage); setRegionFormData({...regionFormData, heroImage: ""}); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove hero image"
                      >✕</button>
                    </div>
                  )}
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Short Description <span className="text-white/30">(card text)</span></label>
                  <textarea
                    required
                    rows={2}
                    value={regionFormData.desc}
                    onChange={(e) => setRegionFormData({...regionFormData, desc: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors resize-none"
                    placeholder="Brief description for cards..."
                  ></textarea>
                </div>

                {/* Full Overview */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Full Overview <span className="text-white/30">(destination detail page)</span></label>
                  <textarea
                    rows={4}
                    value={regionFormData.overview}
                    onChange={(e) => setRegionFormData({...regionFormData, overview: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors resize-none"
                    placeholder="Detailed overview of the destination..."
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsRegionModalOpen(false);
                  setEditingRegion(null);
                }}
                className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="region-form"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-500/20"
              >
                <CheckCircle className="w-5 h-5" />
                {editingRegion ? "Save Changes" : "Create Region"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Testimonial Picker Modal ──────────────────────────── */}
      {showPickTestimonialModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">Pick a Testimonial</h3>
                <p className="text-white/40 text-sm mt-0.5">Select a client review to feature on the About page.</p>
              </div>
              <button
                onClick={() => setShowPickTestimonialModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Review List */}
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {reviews.filter((r: any) => r.status === "approved").length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No approved reviews yet.</p>
                  <p className="text-xs mt-1">Approve reviews in the Reviews tab first.</p>
                </div>
              ) : (
                reviews
                  .filter((r: any) => r.status === "approved")
                  .map((review: any) => {
                    const isSelected = selectedTestimonialId === review.id;
                    return (
                      <button
                        key={review.id}
                        type="button"
                        onClick={() => {
                          setSelectedTestimonialId(review.id);
                          setShowPickTestimonialModal(false);
                        }}
                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
                          isSelected
                            ? "bg-brand-500/15 border-brand-500/50 ring-1 ring-brand-500/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-base">
                            {review.name?.[0] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-0.5 mb-1.5">
                              {[...Array(review.rating || 5)].map((_: any, j: number) => (
                                <svg key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              ))}
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed line-clamp-3">&ldquo;{review.message}&rdquo;</p>
                            <p className="text-brand-400 text-xs font-bold mt-2 uppercase tracking-wider">{review.name || "Verified Traveler"}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="shrink-0 w-5 h-5 text-brand-500 mt-0.5" />
                          )}
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setShowPickTestimonialModal(false)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BLOG CREATE/EDIT MODAL ─────────────────────────────── */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f1f0f] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-brand-400" />
                </div>
                <h2 className="text-xl font-bold text-white">{editingBlog ? "Edit Blog Post" : "New Blog Post"}</h2>
              </div>
              <button onClick={() => setIsBlogModalOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <form onSubmit={handleSaveBlog} className="overflow-y-auto flex-1 p-8 space-y-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Title *</label>
                  <input
                    required
                    type="text"
                    value={blogFormData.title}
                    onChange={(e) => setBlogFormData((p) => ({
                      ...p,
                      title: e.target.value,
                      slug: p.slug || slugify(e.target.value),
                    }))}
                    placeholder="Top 5 Treks in Nepal..."
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 placeholder-white/30"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Slug (URL)</label>
                  <input
                    type="text"
                    value={blogFormData.slug}
                    onChange={(e) => setBlogFormData((p) => ({ ...p, slug: slugify(e.target.value) }))}
                    placeholder="auto-generated-from-title"
                    className="w-full bg-white/5 border border-white/10 text-white/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              {/* Category & Author & Read Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={blogFormData.category}
                    onChange={(e) => setBlogFormData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
                  >
                    {BLOG_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0f1f0f]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Author</label>
                  <input
                    type="text"
                    value={blogFormData.author}
                    onChange={(e) => setBlogFormData((p) => ({ ...p, author: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Read Time</label>
                  <input
                    type="text"
                    value={blogFormData.readTime}
                    onChange={(e) => setBlogFormData((p) => ({ ...p, readTime: e.target.value }))}
                    placeholder="5 min read"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 placeholder-white/30"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Excerpt (short description)</label>
                <textarea
                  rows={2}
                  value={blogFormData.excerpt}
                  onChange={(e) => setBlogFormData((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="A compelling one or two-sentence summary..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 resize-none placeholder-white/30"
                />
              </div>


              {/* ── Article Sections (no HTML needed) ───────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider">Article Sections</label>
                    <p className="text-white/30 text-[11px] mt-0.5">Each section = one heading + paragraph. No HTML needed!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBlogFormData((p) => ({
                        ...p,
                        sections: [...(p.sections || []), { heading: "", body: "" }],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 text-xs font-bold hover:bg-brand-500/30 transition-all border border-brand-500/30"
                  >
                    + Add Section
                  </button>
                </div>

                {/* Section list */}
                <div className="space-y-4">
                  {(blogFormData.sections || []).length === 0 && (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl py-10 text-center">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                        <span className="text-xl">📝</span>
                      </div>
                      <p className="text-white/40 text-sm font-medium">No sections yet</p>
                      <p className="text-white/25 text-xs mt-1">Click &quot;Add Section&quot; above to start writing your article</p>
                    </div>
                  )}
                  {(blogFormData.sections || []).map((sec, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                      {/* Section header row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-xs font-black text-brand-400 uppercase tracking-wider">
                          <span className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center text-[11px]">{i + 1}</span>
                          Section {i + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {/* Move up */}
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const arr = [...(blogFormData.sections || [])];
                                [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                                setBlogFormData((p) => ({ ...p, sections: arr }));
                              }}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs flex items-center justify-center transition-all"
                              title="Move up"
                            >↑</button>
                          )}
                          {/* Move down */}
                          {i < (blogFormData.sections || []).length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const arr = [...(blogFormData.sections || [])];
                                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                                setBlogFormData((p) => ({ ...p, sections: arr }));
                              }}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs flex items-center justify-center transition-all"
                              title="Move down"
                            >↓</button>
                          )}
                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...(blogFormData.sections || [])];
                              arr.splice(i, 1);
                              setBlogFormData((p) => ({ ...p, sections: arr }));
                            }}
                            className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center transition-all"
                            title="Remove section"
                          >✕</button>
                        </div>
                      </div>
                      {/* Heading */}
                      <div>
                        <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wider block mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={(e) => {
                            const arr = [...(blogFormData.sections || [])];
                            arr[i] = { ...arr[i], heading: e.target.value };
                            setBlogFormData((p) => ({ ...p, sections: arr }));
                          }}
                          placeholder="e.g. Why the Annapurna Circuit is Unmissable"
                          className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 placeholder-white/20"
                        />
                      </div>
                      {/* Body */}
                      <div>
                        <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wider block mb-1">Paragraph Text</label>
                        <textarea
                          rows={4}
                          value={sec.body}
                          onChange={(e) => {
                            const arr = [...(blogFormData.sections || [])];
                            arr[i] = { ...arr[i], body: e.target.value };
                            setBlogFormData((p) => ({ ...p, sections: arr }));
                          }}
                          placeholder="Write the content for this section..."
                          className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 resize-y placeholder-white/20 leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                  {/* Quick add at the bottom */}
                  {(blogFormData.sections || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setBlogFormData((p) => ({
                          ...p,
                          sections: [...(p.sections || []), { heading: "", body: "" }],
                        }))
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/30 text-xs font-bold hover:border-brand-500/30 hover:text-brand-400 transition-all"
                    >
                      + Add Another Section
                    </button>
                  )}
                </div>
              </div>


              {/* Image */}
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Cover Image</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={blogFormData.image}
                    onChange={(e) => setBlogFormData((p) => ({ ...p, image: e.target.value }))}
                    placeholder="https://... or upload below"
                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 placeholder-white/30"
                  />
                  <label className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer text-sm font-bold transition-all border ${uploadingBlogImage ? "bg-white/5 border-white/10 text-white/30" : "bg-brand-500/10 border-brand-500/30 text-brand-400 hover:bg-brand-500/20"}`}>
                    {uploadingBlogImage ? (
                      <><div className="w-4 h-4 border border-brand-400 border-t-transparent rounded-full animate-spin" /> Uploading</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload</>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBlogImageUpload} disabled={uploadingBlogImage} />
                  </label>
                </div>
                {blogFormData.image && (
                  <div className="mt-3 relative h-28 w-full rounded-xl overflow-hidden border border-white/10">
                    <Image src={blogFormData.image} alt="cover preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {blogFormData.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
                      {tag}
                      <button type="button" onClick={() => setBlogFormData((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))} className="hover:text-red-400 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={blogTagInput}
                    onChange={(e) => setBlogTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === ",") && blogTagInput.trim()) {
                        e.preventDefault();
                        const tag = blogTagInput.trim();
                        if (!blogFormData.tags.includes(tag)) {
                          setBlogFormData((p) => ({ ...p, tags: [...p.tags, tag] }));
                        }
                        setBlogTagInput("");
                      }
                    }}
                    placeholder="Type tag & press Enter..."
                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 placeholder-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (blogTagInput.trim() && !blogFormData.tags.includes(blogTagInput.trim())) {
                        setBlogFormData((p) => ({ ...p, tags: [...p.tags, blogTagInput.trim()] }));
                        setBlogTagInput("");
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 transition-colors text-sm font-bold"
                  >
                    Add
                  </button>
                </div>
                {/* Popular tag suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["Nepal", "Trekking", "Himalaya", "Bhutan", "Culture", "Safety", "Eco"].filter(t => !blogFormData.tags.includes(t)).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBlogFormData((p) => ({ ...p, tags: [...p.tags, t] }))}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-brand-500/10 hover:text-brand-400 hover:border-brand-500/30 transition-colors"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles: Featured & Status */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setBlogFormData((p) => ({ ...p, isFeatured: !p.isFeatured }))}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border font-bold text-sm transition-all ${blogFormData.isFeatured ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}
                >
                  <span className="text-xl">{blogFormData.isFeatured ? "★" : "☆"}</span>
                  {blogFormData.isFeatured ? "Featured on Home" : "Not Featured"}
                </button>
                <button
                  type="button"
                  onClick={() => setBlogFormData((p) => ({ ...p, status: p.status === "published" ? "draft" : "published" }))}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border font-bold text-sm transition-all ${blogFormData.status === "published" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${blogFormData.status === "published" ? "bg-green-400" : "bg-white/30"}`} />
                  {blogFormData.status === "published" ? "Published" : "Draft"}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-white/10 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsBlogModalOpen(false)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="blog-form-internal"
                onClick={handleSaveBlog}
                disabled={isSavingBlog || !blogFormData.title}
                className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all hover:scale-105 shadow-xl shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isSavingBlog ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                ) : (
                  <>{editingBlog ? "Update Post" : "Publish Post"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

