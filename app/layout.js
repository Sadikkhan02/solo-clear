import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f0f4f8",
};

export const metadata = {
  title: "Solo Clear | System Quest",
  description: "Gamified Solo Leveling fitness system.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SoloClear",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary font-sans antialiased min-h-screen relative overflow-x-hidden">
        <AuthProvider>
          <NotificationProvider>
            {/* Global Slide-down Floating Notification Banners */}
            <NotificationBanner />

            {/* Atmospheric Glow Orb - Top Right */}
            <div
              className="fixed -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10"
              aria-hidden="true"
            />

            {/* Atmospheric Glow Orb - Bottom Left */}
            <div
              className="fixed -bottom-16 -left-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none -z-10"
              aria-hidden="true"
            />

            {/* Mobile-Capped Application Frame */}
            <main className="max-w-sm mx-auto px-4 py-4 min-h-screen flex flex-col relative z-0">
              {children}
            </main>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
