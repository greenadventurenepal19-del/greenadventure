import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Green Adventure | Explore Nepal",
  description: "Perfect and accurate adventure and journey website. Book your next trek to Everest Base Camp or Annapurna.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overscroll-none bg-[#050505]">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col font-sans transition-colors duration-300 overscroll-none`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
