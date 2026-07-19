import type { MetadataRoute } from "next";
import { getAllPuzzleIds } from "@/lib/puzzles";

const BASE_URL = "https://autocrosswords.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/puzzles", "/daily", "/stats", "/achievements"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const puzzleRoutes = getAllPuzzleIds().map((id) => ({
    url: `${BASE_URL}/play/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...puzzleRoutes];
}
