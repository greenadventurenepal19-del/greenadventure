import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  DollarSign,
  Mountain,
  Users,
  Heart,
  Compass,
  Star,
  Globe,
  Sparkles,
  Award,
  Headphones,
  Clock,
  Leaf,
  MapPin,
  Tent,
  Plane,
} from "lucide-react";

export const WHY_CHOOSE_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  DollarSign,
  Mountain,
  Users,
  Heart,
  Compass,
  Star,
  Globe,
  Sparkles,
  Award,
  Headphones,
  Clock,
  Leaf,
  MapPin,
  Tent,
  Plane,
};

export const WHY_CHOOSE_ICON_NAMES = Object.keys(WHY_CHOOSE_ICONS);

export type WhyChooseFeature = {
  iconName: string;
  title: string;
  desc: string;
};

export type WhyChooseSettings = {
  title: string;
  titleHighlight: string;
  description: string;
  trustBadge: string;
  features: WhyChooseFeature[];
};

export const DEFAULT_WHY_CHOOSE: WhyChooseSettings = {
  title: "Why Choose",
  titleHighlight: "Us",
  description:
    "We provide the best experiences for your Himalayan adventures with safety and reliability as our top priorities.",
  trustBadge: "Trusted by 10,000+ Explorers",
  features: [
    {
      iconName: "ShieldCheck",
      title: "Safety & Trust",
      desc: "Expert licensed guides and prioritizing your safety above all else.",
    },
    {
      iconName: "DollarSign",
      title: "Affordable Pricing",
      desc: "Best value packages without hidden costs or compromises.",
    },
    {
      iconName: "Mountain",
      title: "Adventure Experiences",
      desc: "Curated itineraries to deliver breathtaking memories.",
    },
    {
      iconName: "Users",
      title: "Custom Trips",
      desc: "Tailor-made holidays designed specifically for your group.",
    },
  ],
};

export function resolveIcon(name: string | undefined): LucideIcon {
  if (name && WHY_CHOOSE_ICONS[name]) return WHY_CHOOSE_ICONS[name];
  return Sparkles;
}
