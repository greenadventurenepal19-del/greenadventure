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
  Clock, Trash2, Plus, ShieldCheck, AlertCircle, Sparkles, User, MessageSquare, Settings, CheckCircle, LogOut, Mail, Shield, Users, Map, MapPin, Edit, Navigation, X, UploadCloud, Award
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
  const [activeTab, setActiveTab] = useState<"contacts" | "access" | "settings" | "hero" | "trips" | "regions" | "reviews" | "whyChoose">("contacts");
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
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Region Modal State
  const [regions, setRegions] = useState<any[]>([]);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<any>(null);
  const [regionFormData, setRegionFormData] = useState({
    title: "",
    desc: "",
    image: "",
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
  const [uploadingHeroSlide, setUploadingHeroSlide] = useState<number | null>(null);

  const handleTripImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingTripImage(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (data.url) {
        setTripFormData({ ...tripFormData, image: data.url });
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image to blob");
    } finally {
      setIsUploadingTripImage(false);
    }
  };

  const handleRegionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingRegionImage(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (data.url) {
        setRegionFormData({ ...regionFormData, image: data.url });
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image to blob");
    } finally {
      setIsUploadingRegionImage(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      alert("File is too large! Please choose an image smaller than 4.5MB.");
      return;
    }

    setUploadingHeroSlide(slideIdx);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setHeroSlides(prev => prev.map((s, i) => i === slideIdx ? { ...s, image: data.url } : s));
      } else {
        throw new Error(data.error || `Failed with status ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error uploading hero image:", error);
      alert("Failed to upload image to blob: " + error.message);
    } finally {
      setUploadingHeroSlide(null);
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
    { title: "INDIA", subtitle: "Explore the diverse beauty of the Indian Himalayas, from spiritual journeys to thrilling treks.", image: "", upperTags: ["Ladakh", "15 days", "Challenging"], lowerTags: ["Zero Waste", "Low-carbon", "Local Hire", "Inclusive Growth"] },
    { title: "NEPAL", subtitle: "Discover the breathtaking landscapes, vibrant culture, and ancient heritage of the Himalayas.", image: "", upperTags: ["Everest Region", "15 days", "Challenging"], lowerTags: ["Zero Waste", "Low-carbon", "Local Hire", "Inclusive Growth"] },
    { title: "BHUTAN", subtitle: "Experience the magic of the Land of the Thunder Dragon, with its pristine landscapes and ancient monasteries.", image: "", upperTags: ["Paro Valley", "7 days", "Moderate"], lowerTags: ["Eco-Friendly", "Cultural Preservation", "Local Hire", "Inclusive Growth"] },
  ];
  const [heroSlides, setHeroSlides] = useState<any[]>(defaultSlides);
  const [heroTagInput, setHeroTagInput] = useState<{ [key: string]: string }>({});
  const [isSavingHero, setIsSavingHero] = useState(false);

  // "Why Choose Us" section state
  const [whyChoose, setWhyChoose] = useState<WhyChooseSettings>(DEFAULT_WHY_CHOOSE);
  const [isSavingWhyChoose, setIsSavingWhyChoose] = useState(false);

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
          setHeroSlides(data.slides);
        } else if (data.slide1Title) {
          // Migrate old flat format to array
          const migrated = [];
          let i = 1;
          while (data[`slide${i}Title`]) {
            migrated.push({
              title: data[`slide${i}Title`] || "",
              subtitle: data[`slide${i}Subtitle`] || "",
              image: data[`slide${i}Image`] || "",
              upperTags: data[`slide${i}UpperTags`] || [],
              lowerTags: data[`slide${i}LowerTags`] || [],
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

    // Listen to regions
    const unsubRegions = onSnapshot(collection(db, "regions"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
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

    return () => {
      unsubContacts();
      unsubAdmins();
      unsubTrips();
      unsubSettings();
      unsubHero();
      unsubWhyChoose();
      unsubRegions();
      unsubReviews();
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
      setTripFormData({ title: "", region: "", duration: "", price: "", difficulty: "moderate", desc: "", image: "", isFeatured: false, tripType: "Tour", groupSize: "", tags: [], slug: "", rating: 5, altitude: "", overview: "", itinerary: [], includes: [], excludes: [] });
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
      setRegionFormData({ title: "", desc: "", image: "", order: 0 });
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

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
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
                      setTripFormData({ title: "", region: "", duration: "", price: "", difficulty: "moderate", desc: "", image: "", isFeatured: false, tripType: "Tour", groupSize: "", tags: [], slug: "", rating: 5, altitude: "", overview: "", itinerary: [], includes: [], excludes: [] });
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
                        
                        {/* Background Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Background Image</label>
                          <div className="flex items-center gap-4">
                            {slide.image && (
                              <div className="w-24 h-16 relative rounded-xl overflow-hidden shrink-0 border border-white/10">
                                <Image src={slide.image} alt={`Slide ${idx + 1} preview`} fill className="object-cover" />
                              </div>
                            )}
                            <label className="flex items-center gap-2 px-4 py-3 bg-black/60 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors text-sm font-medium text-white/80 w-full sm:w-auto">
                              <UploadCloud className="w-4 h-4" />
                              {uploadingHeroSlide === idx ? "Uploading..." : "Upload Photo"}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleHeroImageUpload(e, idx)} disabled={uploadingHeroSlide === idx} />
                            </label>
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
                      onClick={() => setHeroSlides(prev => [...prev, { title: "", subtitle: "", image: "", upperTags: [], lowerTags: [] }])}
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
                    setRegionFormData({ title: "", desc: "", image: "", order: 0 });
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
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{region.title}</h3>
                      <p className="text-white/60 text-sm mb-6 flex-1 line-clamp-2">{region.desc}</p>
                      
                      <div className="pt-4 border-t border-white/10 flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingRegion(region);
                            setRegionFormData({
                              title: region.title || "",
                              desc: region.desc || "",
                              image: region.image || "",
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
                      {regions.map((r: any) => (
                        <option key={r.id} value={r.title}>{r.title}</option>
                      ))}
                      {/* Fallbacks if DB is empty */}
                      {regions.length === 0 && (
                        <>
                          <option value="Nepal">Nepal</option>
                          <option value="Bhutan">Bhutan</option>
                          <option value="India">India</option>
                        </>
                      )}
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
                      <input
                        type="text"
                        required
                        value={tripFormData.image}
                        onChange={(e) => setTripFormData({...tripFormData, image: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="block text-sm font-medium text-white/70 mb-2">Order (Sorting)</label>
                    <input
                      type="number"
                      value={regionFormData.order}
                      onChange={(e) => setRegionFormData({...regionFormData, order: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Image (Upload or URL)</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 bg-black/50 border border-white/10 hover:border-brand-500/50 rounded-xl px-4 py-3 text-white cursor-pointer transition-colors flex items-center justify-center gap-2 group">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={handleRegionImageUpload}
                          disabled={isUploadingRegionImage}
                        />
                        {isUploadingRegionImage ? (
                          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <UploadCloud className="w-5 h-5 text-white/50 group-hover:text-brand-400 transition-colors" />
                        )}
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                          {isUploadingRegionImage ? "Uploading..." : "Upload from Computer"}
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-xs text-white/40 uppercase tracking-widest font-bold">OR</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                    <input
                      type="url"
                      required
                      value={regionFormData.image}
                      onChange={(e) => setRegionFormData({...regionFormData, image: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  {regionFormData.image && (
                    <div className="mt-3 relative h-40 w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
                      <Image src={regionFormData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Short Description</label>
                  <textarea
                    required
                    rows={3}
                    value={regionFormData.desc}
                    onChange={(e) => setRegionFormData({...regionFormData, desc: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors resize-none"
                    placeholder="Brief description of the region..."
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
    </div>
  );
}
