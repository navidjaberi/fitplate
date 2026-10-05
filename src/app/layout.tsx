import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Vazirmatn } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const vazir = Vazirmatn({ variable: "--font-vazir", subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "FitPlate · Nutrition and fitness dashboard",
  description: "Personal calorie and macro targets, photo-based meal logging, and progress tracking.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#12100e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${vazir.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers>
          <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6">
            <Header />
            <main className="flex-1 pb-12">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
