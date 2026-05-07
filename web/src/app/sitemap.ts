import { getConfiguredOrigin } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getConfiguredOrigin();
  const paths = ["", "/browse", "/recommend", "/login", "/signup", "/feedback"];

  return paths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));
}
