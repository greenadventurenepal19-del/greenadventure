import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinations | Green Adventure",
  description:
    "Explore our breathtaking destinations across the Himalayas — Nepal, Bhutan, India and beyond.",
};

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
