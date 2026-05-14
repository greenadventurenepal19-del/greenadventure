import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Green Adventure Nepal — Tours & Trekking",
    short_name: "Green Adventure",
    description:
      "Trusted Nepal-based trekking and tour company offering Everest Base Camp, Annapurna and Himalayan expeditions, plus tours across Nepal, Bhutan and India.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050505",
    theme_color: "#16a34a",
    categories: ["travel", "lifestyle", "tourism"],
    lang: "en-US",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
