"use client";

import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/context/AuthContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
