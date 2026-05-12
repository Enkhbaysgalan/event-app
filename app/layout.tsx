import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";
import BottomNav from "@/components/ui/layout/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventify",
  description: "Discover and organize events near you",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eventify",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
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
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        <AuthProvider>
          <main className="max-w-lg mx-auto min-h-screen bg-white relative">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
