import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FitPlate",
    short_name: "FitPlate",
    description: "Calorie and macro targets, meal logging from a photo, and workout plans.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#06070a",
    theme_color: "#06070a",
    categories: ["health", "fitness", "food"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Scan a meal", short_name: "Scan", url: "/scan", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Workouts", url: "/workouts", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
