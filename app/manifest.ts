import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "allergyZEN Wellness Assistant",
    short_name: "allergyZEN",
    description: "Your personal wellness companion for navigating life with allergies and sensitivities",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#8E55A2",
    orientation: "portrait",
    icons: [
      {
        src: "/images/allergyzen-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/allergyzen-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["health", "lifestyle", "food"],
  }
}
