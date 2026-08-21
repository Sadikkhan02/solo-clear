import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const { pathname } = req.nextUrl;

      // Allow public endpoints and assets
      if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")
      ) {
        return true;
      }

      // Require valid session token for protected routes (/, /status, /log, /api/user, etc.)
      return !!token;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - Public auth endpoints (API auth routes)
     * - Login & Register pages
     * - Next.js internal assets (_next)
     * - Static assets (images, icons, manifest, favicon)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png|login|register).*)",
  ],
};
