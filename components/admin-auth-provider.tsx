"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        
        const userEmail = currentUser.email.toLowerCase().trim();
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN?.toLowerCase().trim();
        
        // Check if user is Super Admin
        if (userEmail === superAdminEmail) {
          setIsSuperAdmin(true);
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Check if user is in Firestore 'admins' collection
        try {
          const adminDoc = await getDoc(doc(db, "admins", userEmail));
          if (adminDoc.exists()) {
            setIsAdmin(true);
            setIsSuperAdmin(false);
          } else {
            setIsAdmin(false);
            setIsSuperAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching admin status:", error);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, isSuperAdmin, loading, loginWithGoogle, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
