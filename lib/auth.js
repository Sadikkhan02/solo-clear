import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongodb";
import User from "./models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        // Strong input validation
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Normalize email
        const email = credentials.email.toLowerCase().trim();
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("No hunter found with this email");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Enforce email verification (if emailVerified is false)
        if (user.emailVerified === false) {
          throw new Error("Please verify your email before logging in.");
        }

        // Return sanitized hunter profile (strictly excludes password)
        return {
          id: user._id.toString(),
          email: user.email,
          level: user.level ?? 0,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.level = user.level;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.level = token.level;
      }
      return session;
    },
  },
};
