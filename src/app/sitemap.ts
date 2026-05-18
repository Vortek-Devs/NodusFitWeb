import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const publicRoutes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/privacidade", changeFrequency: "yearly", priority: 0.4 },
  { path: "/termos", changeFrequency: "yearly", priority: 0.4 },
  { path: "/contato", changeFrequency: "monthly", priority: 0.7 },
] as const satisfies ReadonlyArray<{
  path: "" | `/${string}`;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
