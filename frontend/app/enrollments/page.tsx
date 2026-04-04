"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { deleteEnrollment, getEnrollments, updateEnrollmentProgress } from "@/lib/api";
import { EnrollmentView } from "@/types";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function EnrollmentsPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentView[]>([]);
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<"date" | "progress">("date");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadEnrollments = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await getEnrollments(user?.role === "TEACHER" ? sort : undefined);
      setEnrollments(data);
      setProgressInputs((prev) => {
        const next = { ...prev };
        for (const enrollment of data) {
          if (!next[enrollment.id]) {
            next[enrollment.id] = String(enrollment.progress);
          }
        }
        return next;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Элсэлтүүдийг ачаалж чадсангүй.",
      );
    } finally {
      setLoading(false);
    }
  }, [sort, user?.role]);

  useEffect(() => {
    if (user) {
      void loadEnrollments();
    }
  }, [user, loadEnrollments]);

  async function onDeleteEnrollment(id: string) {
    setError(null);
    setSuccess(null);

    try {
      await deleteEnrollment(id);
      setSuccess("Элсэлтийг амжилттай устгалаа.");
      await loadEnrollments();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Элсэлт устгах үед алдаа гарлаа.");
    }
  }

  async function onUpdateProgress(
    enrollmentId: string,
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const value = Number(progressInputs[enrollmentId]);

    if (Number.isNaN(value) || value < 0 || value > 100) {
      setError("Ахиц 0-100 хооронд байна.");
      return;
    }

    setUpdatingId(enrollmentId);

    try {
      await updateEnrollmentProgress(enrollmentId, value);
      setSuccess("Элсэлтийн ахицыг амжилттай шинэчиллээ.");
      await loadEnrollments();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Ахиц шинэчлэх үед алдаа гарлаа.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={user?.role === "TEACHER" ? "Элсэлтүүд" : "Миний Элсэлт"}
        description={
          user?.role === "TEACHER"
            ? "Оюутан-хичээлийн элсэлтийг хянаж, сургалтын ахицыг шинэчилнэ."
            : "Өөрийн элссэн хичээлүүдийн явц, ахицыг хянаарай."
        }
      />

      <div className="paper p-5">
        <h2 className="section-title text-lg font-semibold">
          Элсэлтийн Жагсаалт
        </h2>
        {user?.role === "TEACHER" ? (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="muted-copy">Эрэмбэлэх:</span>
            <button
              type="button"
              className={`nav-pill ${sort === "date" ? "nav-pill--active" : "nav-pill--idle"}`}
              onClick={() => setSort("date")}
            >
              Огноо
            </button>
            <button
              type="button"
              className={`nav-pill ${sort === "progress" ? "nav-pill--active" : "nav-pill--idle"}`}
              onClick={() => setSort("progress")}
            >
              Ахиц
            </button>
          </div>
        ) : null}
        <div className="mt-3 space-y-2">
          {error ? <StatusMessage type="error" message={error} /> : null}
          {success ? <StatusMessage type="success" message={success} /> : null}
        </div>

        <div className="mt-4">
          {loading ? <LoadingBlock label="Элсэлтүүдийг ачаалж байна..." /> : null}
          {!loading && enrollments.length === 0 ? (
            <p className="muted-copy text-sm">Одоогоор элсэлт бүртгэгдээгүй байна.</p>
          ) : null}

          {!loading && enrollments.length > 0 ? (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <article
                  key={enrollment.id}
                  className="rounded-lg border border-amber-900/15 bg-amber-50/40 p-4"
                >
                  <div className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                    <p>
                      <span className="font-medium">Дугаар:</span> {enrollment.id}
                    </p>
                    <p>
                      <span className="font-medium">Оюутан:</span> {enrollment.studentName}
                    </p>
                    <p>
                      <span className="font-medium">Хичээл:</span> {enrollment.courseTitle}
                    </p>
                    <p>
                      <span className="font-medium">Ахиц:</span> {enrollment.progress}%
                    </p>
                    <p className="sm:col-span-2 lg:col-span-2">
                      <span className="font-medium">Элссэн Огноо:</span>{" "}
                      {formatDate(enrollment.enrolledAt)}
                    </p>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-700 transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, enrollment.progress))}%` }}
                    />
                  </div>

                  {user?.role === "TEACHER" ? (
                    <form
                      onSubmit={(event) => void onUpdateProgress(enrollment.id, event)}
                      className="mt-3 flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={progressInputs[enrollment.id] ?? String(enrollment.progress)}
                        onChange={(event) =>
                          setProgressInputs((prev) => ({
                            ...prev,
                            [enrollment.id]: event.target.value,
                          }))
                        }
                        className="field w-40"
                      />
                      <button
                        type="submit"
                        disabled={updatingId === enrollment.id}
                        className="btn-secondary w-fit"
                      >
                        {updatingId === enrollment.id ? "Шинэчилж байна..." : "Ахиц Шинэчлэх"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary w-fit"
                        onClick={() => void onDeleteEnrollment(enrollment.id)}
                      >
                        Устгах
                      </button>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
