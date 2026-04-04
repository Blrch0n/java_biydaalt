"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const publicLinks = [
  { href: "/login", label: "Нэвтрэх" },
  { href: "/signup", label: "Бүртгүүлэх" },
];

export function NavBar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const links = isAuthenticated
    ? [
        { href: "/", label: "Нүүр" },
        { href: "/courses", label: "Хичээлүүд" },
        { href: "/enrollments", label: "Элсэлт" },
        ...(user?.role === "TEACHER"
          ? [
              { href: "/students", label: "Оюутнууд" },
              { href: "/instructors", label: "Багш нар" },
              { href: "/enroll", label: "Бүртгэх" },
            ]
          : []),
      ]
    : publicLinks;

  return (
    <nav className="top-nav">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="brand-title text-lg font-semibold sm:text-xl"
        >
          Сургуулийн LMS
        </Link>
        <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-pill ${
                    isActive
                      ? "nav-pill--active"
                      : "nav-pill--idle"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {isAuthenticated ? (
            <li className="ml-1 flex items-center gap-2">
              <span className="text-xs font-medium text-[#0f2434] sm:text-sm">
                {user?.fullName} ({user?.role === "TEACHER" ? "Багш" : "Сурагч"})
              </span>
              <button
                type="button"
                className="nav-pill nav-pill--idle"
                onClick={logout}
              >
                Гарах
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </nav>
  );
}
