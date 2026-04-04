"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingBlock } from "@/components/LoadingBlock";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  if (isLoading) {
    return <LoadingBlock label="Нэвтрэлт шалгаж байна..." />;
  }

  if (!isAuthenticated && !isPublicRoute) {
    return <LoadingBlock label="Нэвтрэх хуудас руу шилжүүлж байна..." />;
  }

  if (isAuthenticated && isPublicRoute) {
    return <LoadingBlock label="Нүүр хуудас руу шилжүүлж байна..." />;
  }

  return <>{children}</>;
}
