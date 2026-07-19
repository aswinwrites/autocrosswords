import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Autocrosswords",
    short_name: "Autocrosswords",
    description: "52 handcrafted automotive crossword puzzles — cars, F1, MotoGP, aircraft, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0B0D",
    theme_color: "#E10600",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
