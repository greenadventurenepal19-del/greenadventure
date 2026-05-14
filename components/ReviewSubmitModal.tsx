"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReviewSubmitModal({ open, onClose }: Props) {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const reset = React.useCallback(() => {
    setName("");
    setRole("");
    setMessage("");
    setRating(5);
    setPhotoUrl("");
    setSubmitted(false);
    setError("");
  }, []);

  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(reset, 300);
      return () => clearTimeout(t);
    }
  }, [open, reset]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError("");
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      const data = await res.json();
      if (data.url) setPhotoUrl(data.url);
      else throw new Error(data.error || "Upload failed");
    } catch (err) {
      console.error(err);
      setError("Could not upload photo. You can still submit without one.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please add your name and a short message.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const newRef = doc(collection(db, "reviews"));
      await setDoc(newRef, {
        name: name.trim().slice(0, 80),
        role: role.trim().slice(0, 80),
        message: message.trim().slice(0, 1000),
        rating: Math.max(1, Math.min(5, rating)),
        photo: photoUrl || "",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Could not submit your review. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-xl font-black tracking-tight">Share Your Story</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Reviews are published after a quick check by our team.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-10 flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-black">Thank you!</h4>
                <p className="text-muted-foreground max-w-sm">
                  Your review has been submitted and is awaiting approval. It will appear on the
                  site shortly.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 transition-colors shadow-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={80}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      maxLength={80}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. Adventure Traveler"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                    Your Message *
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-brand-500 transition-colors resize-none"
                    placeholder="Tell us about your experience..."
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">
                    {message.length}/1000
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                    Photo (Optional)
                  </label>
                  {photoUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border border-border">
                        <Image src={photoUrl} alt="Your photo" fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl("")}
                        className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 bg-background border border-dashed border-border hover:border-brand-500/50 rounded-xl px-4 py-4 text-muted-foreground cursor-pointer transition-colors">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-sm font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-5 w-5" />
                          <span className="text-sm font-medium">Choose a photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 rounded-full border border-border text-foreground font-bold text-sm hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
