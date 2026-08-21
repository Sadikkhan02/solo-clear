"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React from "react";

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user || null,
    session,
    status, // "loading" | "authenticated" | "unauthenticated"
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
