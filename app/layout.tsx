import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://greenadventurenepal.com";
const SITE_NAME = "Green Adventure Nepal";
const SITE_TAGLINE = "Tours, Trekking & Himalayan Expeditions";
const SITE_DESCRIPTION =
  "Green Adventure Nepal — a trusted Kathmandu-based trekking and tour company offering Everest Base Camp, Annapurna Circuit, Manaslu, Langtang treks plus cultural tours across Nepal, Bhutan and India. Licensed local guides, fair pricing, custom itineraries and 100% safety-first expeditions.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Travel & Adventure",
  keywords: [
    "Nepal trekking",
    "Everest Base Camp trek",
    "Annapurna Circuit trek",
    "Annapurna Base Camp trek",
    "Manaslu Circuit trek",
    "Langtang Valley trek",
    "Upper Mustang trek",
    "Nepal tours",
    "Kathmandu tour",
    "Pokhara tour",
    "Chitwan jungle safari",
    "Bhutan tour packages",
    "Tiger's Nest Bhutan",
    "India spiritual tours",
    "Varanasi Taj Mahal tour",
    "Himalayan expedition",
    "trekking company Nepal",
    "tour operator Kathmandu",
    "licensed trekking guide Nepal",
    "Green Adventure Nepal",
    "sustainable trekking Himalayas",
    "custom Nepal itinerary",
    "Nepal trekking permits",
    "Sherpa guides",
    "high altitude trekking",
  ],
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    creator: "@greenadventurenepal",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  other: {
    "geo.region": "NP-BA",
    "geo.placename": "Kathmandu",
    "geo.position": "27.7172;85.3240",
    ICBM: "27.7172, 85.3240",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TravelAgency",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      legalName: "Green Adventure Treks & Expeditions Pvt. Ltd.",
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      image: `${SITE_URL}/opengraph-image`,
      description: SITE_DESCRIPTION,
      priceRange: "$$",
      slogan: SITE_TAGLINE,
      areaServed: [
        { "@type": "Country", name: "Nepal" },
        { "@type": "Country", name: "Bhutan" },
        { "@type": "Country", name: "India" },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Thamel",
        addressLocality: "Kathmandu",
        addressRegion: "Bagmati Province",
        postalCode: "44600",
        addressCountry: "NP",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 27.7172,
        longitude: 85.3240,
      },
      sameAs: [
        "https://www.facebook.com/greenadventurenepal",
        "https://www.instagram.com/greenadventurenepal",
        "https://www.youtube.com/@greenadventurenepal",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/tours?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: SITE_NAME,
      image: `${SITE_URL}/images/logo.png`,
      url: SITE_URL,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Thamel",
        addressLocality: "Kathmandu",
        addressRegion: "Bagmati Province",
        postalCode: "44600",
        addressCountry: "NP",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 27.7172,
        longitude: 85.3240,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "08:00",
          closes: "20:00",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overscroll-none">
      <body className={`${inter.variable} ${nunito.variable} antialiased min-h-screen flex flex-col font-sans transition-colors duration-300 overscroll-none`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
