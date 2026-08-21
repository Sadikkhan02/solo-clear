import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export const metadata = {
  title: "Solo Clear | System Quest",
  description: "Mobile-first Solo Leveling fitness system.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SoloClear",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-bg text-gray-100 antialiased min-h-screen relative overflow-x-hidden selection:bg-accent-cyan/30 selection:text-white">
        {/* Atmospheric Glow Orb - Top Right */}
        <div
          className="fixed -top-12 -right-12 w-48 h-48 rounded-full bg-accent-cyan/25 blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Atmospheric Glow Orb - Bottom Left */}
        <div
          className="fixed -bottom-12 -left-12 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Mobile-Capped Application Frame */}
        <main className="max-w-sm mx-auto px-4 py-4 min-h-screen flex flex-col relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
