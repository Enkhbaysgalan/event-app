import type { Metadata, Viewport } from "next";
import { DM_Mono, Barlow_Condensed, DM_Sans, Oswald, Rubik } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { LikesProvider } from "@/lib/likes-context";
import { FollowsProvider } from "@/lib/follows-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { GoogleMapsProvider } from "@/components/providers/GoogleMapsProvider";
import BottomNav from "@/components/ui/layout/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});

// Cyrillic-supporting equivalents
const oswald = Oswald({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cyrillic-display",
});

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cyrillic-sans",
});

export const metadata: Metadata = {
  title: "Imin",
  description: "Discover and organize events near you",
};

export const viewport: Viewport = {
  themeColor: "#457534",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmMono.variable} ${dmSans.variable} ${barlowCondensed.variable} ${oswald.variable} ${rubik.variable}`}
    >
      <body className="bg-gray-50 antialiased font-sans">
        <AuthProvider>
          <LikesProvider>
            <FollowsProvider>
            <NotificationsProvider>
            <GoogleMapsProvider>
              <main className="max-w-lg mx-auto min-h-screen bg-white relative">
                {children}
              </main>
              <Toaster position="top-center" />
              <BottomNav />
            </GoogleMapsProvider>
            </NotificationsProvider>
            </FollowsProvider>
          </LikesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
