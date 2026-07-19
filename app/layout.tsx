import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Autocrosswords — Automotive Crossword Puzzles",
  description:
    "52 handcrafted crossword puzzles celebrating cars, motorcycles, aircraft, Formula 1, MotoGP, Le Mans, and automotive history. Play free, daily, and unlock new puzzles every week.",
  keywords: ["crossword", "cars", "automotive", "formula 1", "motorcycles", "puzzle game", "car trivia"],
  metadataBase: new URL("https://autocrosswords.vercel.app"),
  openGraph: {
    title: "Autocrosswords — Automotive Crossword Puzzles",
    description: "52 handcrafted automotive crossword puzzles. Cars, F1, MotoGP, aircraft, and more.",
    type: "website",
    siteName: "Autocrosswords",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Autocrosswords" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Autocrosswords",
    description: "52 handcrafted automotive crossword puzzles.",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "Autocrosswords",
  description:
    "52 handcrafted crossword puzzles celebrating cars, motorcycles, aircraft, Formula 1, MotoGP, Le Mans, and automotive history.",
  genre: "Puzzle",
  numberOfPlayers: "1",
  url: "https://autocrosswords.vercel.app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <TooltipProvider delayDuration={200}>
          <AnimatedBackground />
          <Header />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
