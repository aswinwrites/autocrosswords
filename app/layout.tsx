import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Autocrosswords",
    description: "52 handcrafted automotive crossword puzzles.",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <AnimatedBackground />
        <Header />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
