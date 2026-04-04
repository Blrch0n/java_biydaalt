import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Сургуулийн Онлайн Систем",
  description: "Оюутан, хичээл, элсэлтийн удирдлагын интерфейс",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-base text-main">
        <AppProviders>
          <div className="app-shell">
            <aside className="left-rail">
              <div className="left-rail__badge">СИСТЕМАТИК СУРГУУЛЬ</div>
              <h1 className="left-rail__title">Бүтээлч Сургалтын Орчин</h1>
              <p className="left-rail__subtitle">
                Хичээл, оюутан, элсэлтийн бүх мэдээллийг нэг урсгалд удирдана.
              </p>
              <div className="left-rail__grid" aria-hidden="true" />
              <div className="left-rail__shape left-rail__shape--one" aria-hidden="true" />
              <div className="left-rail__shape left-rail__shape--two" aria-hidden="true" />
            </aside>

            <div className="content-column">
              <NavBar />
              <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
