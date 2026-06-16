"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Mountain, Compass, Heart, Cloud, Leaf, type LucideIcon } from "lucide-react";

export type TripCardTag = string | { label: string; icon?: LucideIcon };

export type TripCardData = {
  id?: string;
  slug?: string;
  title: string;
  image?: string;
  desc?: string;
  region?: string;
  duration?: string;
  groupSize?: string;
  difficulty?: string;
  price?: string;
  tags?: TripCardTag[];
};

type Props = {
  trip: TripCardData;
  index?: number;
  basePath: "tours" | "trekking";
};

function pickIcon(label: string) {
  const tagStr = label.toLowerCase();
  if (tagStr.includes("cultur") || tagStr.includes("local") || tagStr.includes("histor")) return Compass;
  if (tagStr.includes("spirit") || tagStr.includes("well") || tagStr.includes("honeymoon")) return Heart;
  if (tagStr.includes("wild") || tagStr.includes("animal")) return Cloud;
  if (tagStr.includes("famil") || tagStr.includes("group")) return Users;
  return Leaf;
}

export default function TripCard({ trip, index = 0, basePath }: Props) {
  const cleanedPrice = trip.price?.replace(/usd|\$|per person|\/ person/gi, "").trim();
  const detailHref = `/${basePath}/${trip.slug || trip.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.15)] hover:border-brand-500/30 transition-all duration-500 flex flex-col"
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={trip.image || "/images/everest.png"}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        {trip.difficulty && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500/40 to-brand-500/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20">
            {trip.difficulty}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <h3 className="text-2xl font-black tracking-tight mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
          {trip.title}
        </h3>

        {trip.desc && (
          <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-2">
            {trip.desc}
          </p>
        )}

        <div className="space-y-3 mb-6">
          {trip.region && (
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" /> {trip.region}
            </div>
          )}
          {trip.duration && (
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" /> {trip.duration}
            </div>
          )}
          {trip.groupSize && (
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" /> {trip.groupSize}
            </div>
          )}
        </div>
        <div className="mt-auto mb-4" />

        <div className="pt-5 border-t border-border/50 flex items-center justify-between mt-auto">
          {/* Commented out Pay Level as requested
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
              Pay Level
            </span>
            <span className="text-xl font-black text-foreground leading-none">
              {cleanedPrice ? (
                <>
                  ${cleanedPrice}{" "}
                  <span className="text-[13px] font-semibold text-muted-foreground">/ person</span>
                </>
              ) : (
                <span className="text-[13px] font-semibold text-muted-foreground">On request</span>
              )}
            </span>
          </div>
          */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
              Organized by
            </span>
            <span className="text-sm font-black tracking-wide shimmer-text">
              greenAdventure
            </span>
          </div>
          <Link
            href={detailHref}
            className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-bold text-[13px] hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-brand-500/25"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function EmptyTripsState({ kind }: { kind: "Tours" | "Treks" }) {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-brand-500/5 rounded-3xl border border-brand-500/10">
      <Mountain className="w-16 h-16 text-brand-500/40 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-foreground/70">More {kind} Coming Soon</h3>
      <p className="text-muted-foreground mt-2">
        We are currently curating the best experiences for you.
      </p>
    </div>
  );
}
