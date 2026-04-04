"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats } from "@/lib/api";
import { DashboardStats } from "@/types";

const teacherCards = [
  { href: "/students", title: "Оюутнууд", description: "Оюутны мэдээлэл удирдах" },
  { href: "/courses", title: "Хичээлүүд", description: "Хөтөлбөр, сэдэв, үнийг шинэчлэх" },
  { href: "/instructors", title: "Багш нар", description: "Багшийн баг болон мэргэжил" },
  { href: "/enroll", title: "Бүртгэл", description: "Оюутныг хичээлд шууд бүртгэх" },
  { href: "/enrollments", title: "Элсэлт", description: "Ахиц шинэчилж хянах" },
];

const studentCards = [
  { href: "/courses", title: "Хичээлүүд", description: "Нээлттэй бүх хичээл харах" },
  { href: "/enrollments", title: "Миний элсэлт", description: "Өөрийн элсэлт ба ахиц" },
];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDashboardStats();
        if (active) {
          setStats(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Статистик ачаалж чадсангүй.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  const cards = user?.role === "TEACHER" ? teacherCards : studentCards;

  return (
    <section className="space-y-8">
      <div className="paper p-6 sm:p-8">
        <p className="inline-flex rounded-full border border-emerald-700/25 bg-emerald-100/70 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800">
          СУРГУУЛИЙН УДИРДЛАГЫН ХЯНАЛТ
        </p>
        <h1 className="section-title mt-4 text-3xl font-semibold sm:text-4xl">
          Сайн байна уу, {user?.fullName}
        </h1>
        <p className="muted-copy mt-3 max-w-2xl text-sm leading-6 sm:text-base">
          Таны эрх: {user?.role === "TEACHER" ? "БАГШ" : "СУРАГЧ"}. Доорх самбараас
          сургалтын мэдээллээ хурдан удирдаарай.
        </p>
      </div>

      {loading ? <LoadingBlock label="Самбарын статистик ачаалж байна..." /> : null}
      {error ? <StatusMessage type="error" message={error} /> : null}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="paper p-4">
            <p className="muted-copy text-xs">Нийт оюутан</p>
            <p className="section-title mt-1 text-2xl">{stats.totalStudents}</p>
          </article>
          <article className="paper p-4">
            <p className="muted-copy text-xs">Нийт хичээл</p>
            <p className="section-title mt-1 text-2xl">{stats.totalCourses}</p>
          </article>
          <article className="paper p-4">
            <p className="muted-copy text-xs">Нийт элсэлт</p>
            <p className="section-title mt-1 text-2xl">{stats.totalEnrollments}</p>
          </article>
          <article className="paper p-4">
            <p className="muted-copy text-xs">Дундаж ахиц</p>
            <p className="section-title mt-1 text-2xl">{Math.round(stats.averageProgress)}%</p>
          </article>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="paper group p-5 transition hover:-translate-y-1"
          >
            <h2 className="section-title text-lg font-semibold text-slate-900 group-hover:text-emerald-800">
              {card.title}
            </h2>
            <p className="muted-copy mt-2 text-sm">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
