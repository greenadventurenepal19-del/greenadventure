"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/components/admin-auth-provider";
import { db } from "@/lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, 
  doc, setDoc, deleteDoc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { 
  Clock, Trash2, Plus, ShieldCheck, AlertCircle, Sparkles, User, MessageSquare, Settings, CheckCircle, LogOut, Mail, Shield, Users
} from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin, isSuperAdmin, loading, loginWithGoogle, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"contacts" | "access" | "settings" | "hero">("contacts");
  
  // Data states
  const [contacts, setContacts] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Settings state
  const [settings, setSettings] = useState({
    officeDesc: "Drop by our office in the heart of Kathmandu for a cup of tea and let's discuss your next adventure.",
    locationLine1: "Thamel, Kathmandu",
    locationLine2: "Bagmati Province, Nepal 44600",
    phonePrimary: "+977 1 4412345",
    emailPrimary: "info@greenadventure.com",
    emailSecondary: "bookings@greenadventure.com",
    mapLat: 27.7126,
    mapLng: 85.3145,
    mapZoom: 15
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Hero settings state
  const [heroSettings, setHeroSettings] = useState({
    slide1Title: "NEPAL",
    slide1Subtitle: "Discover the breathtaking landscapes, vibrant culture, and ancient heritage of the Himalayas. The perfect start to your unforgettable journey.",
    slide2Title: "ANNAPURNA",
    slide2Subtitle: "Trek through lush valleys and traditional mountain villages to the heart of the majestic Annapurna sanctuary."
  });
  const [isSavingHero, setIsSavingHero] = useState(false);

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

    // Listen to settings
    const unsubSettings = onSnapshot(doc(db, "settings", "contact_info"), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as any);
      }
    });

    // Listen to hero settings
    const unsubHero = onSnapshot(doc(db, "settings", "hero_content"), (docSnap) => {
      if (docSnap.exists()) {
        setHeroSettings(docSnap.data() as any);
      }
    });

    return () => {
      unsubContacts();
      unsubAdmins();
      unsubSettings();
      unsubHero();
    };
  }, [isAdmin]);

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
      await setDoc(doc(db, "settings", "hero_content"), heroSettings);
      alert("Hero settings saved successfully!");
    } catch (error) {
      console.error("Error saving hero settings", error);
      alert("Failed to save hero settings.");
    } finally {
      setIsSavingHero(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-500 blur-xl opacity-50 rounded-full animate-pulse"></div>
          <div className="animate-spin relative rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
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
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-xl">
                  <div className="px-4 py-2 bg-black/40 rounded-lg">
                    <span className="text-2xl font-bold text-brand-400">{contacts.filter(c => c.status !== "processed").length}</span>
                    <span className="text-xs text-white/50 ml-2 uppercase tracking-wider">Pending</span>
                  </div>
                  <div className="px-4 py-2">
                    <span className="text-2xl font-bold text-white/80">{contacts.filter(c => c.status === "processed").length}</span>
                    <span className="text-xs text-white/50 ml-2 uppercase tracking-wider">Done</span>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6">
                {contacts.length === 0 ? (
                  <div className="bg-white/5 border border-white/5 p-16 rounded-[2rem] text-center text-white/50 backdrop-blur-md">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                    <p>There are no contact requests to display.</p>
                  </div>
                ) : (
                  contacts.map(contact => (
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
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white min-h-[100px]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Location Line 1</label>
                        <input
                          type="text"
                          value={settings.locationLine1}
                          onChange={(e) => setSettings({ ...settings, locationLine1: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Location Line 2</label>
                        <input
                          type="text"
                          value={settings.locationLine2}
                          onChange={(e) => setSettings({ ...settings, locationLine2: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
                          required
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
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">WhatsApp Phone</label>
                        <input
                          type="text"
                          value={settings.phoneWhatsapp}
                          onChange={(e) => setSettings({ ...settings, phoneWhatsapp: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
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
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Secondary Email</label>
                        <input
                          type="email"
                          value={settings.emailSecondary}
                          onChange={(e) => setSettings({ ...settings, emailSecondary: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
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

          {/* HERO SETTINGS TAB */}
          {activeTab === "hero" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Hero Settings</h2>
                <p className="text-white/50 mt-1">Manage the massive titles and descriptions on the Home Page hero section.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <form onSubmit={handleSaveHeroSettings} className="p-8 space-y-8">
                  
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-white">Slide 1: Default/Nepal</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Main Title (Massive Text)</label>
                      <input
                        type="text"
                        value={heroSettings.slide1Title}
                        onChange={(e) => setHeroSettings({ ...heroSettings, slide1Title: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Subtitle / Description</label>
                      <textarea
                        value={heroSettings.slide1Subtitle}
                        onChange={(e) => setHeroSettings({ ...heroSettings, slide1Subtitle: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white min-h-[100px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <h3 className="font-bold text-xl text-white">Slide 2: Annapurna</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Main Title (Massive Text)</label>
                      <input
                        type="text"
                        value={heroSettings.slide2Title}
                        onChange={(e) => setHeroSettings({ ...heroSettings, slide2Title: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Subtitle / Description</label>
                      <textarea
                        value={heroSettings.slide2Subtitle}
                        onChange={(e) => setHeroSettings({ ...heroSettings, slide2Subtitle: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white min-h-[100px]"
                        required
                      />
                    </div>
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

        </div>
      </div>
    </div>
  );
}
