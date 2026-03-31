"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { getEnrollments, updateEnrollmentProgress } from "@/lib/api";
import { Enrollment } from "@/types";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadEnrollments() {
    setError(null);
    setLoading(true);

    try {
      const data = await getEnrollments();
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
        loadError instanceof Error ? loadError.message : "Failed to load enrollments",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEnrollments();
  }, []);

  async function onUpdateProgress(
    enrollmentId: string,
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const value = Number(progressInputs[enrollmentId]);

    if (Number.isNaN(value) || value < 0 || value > 100) {
      setError("Progress must be between 0 and 100.");
      return;
    }

    setUpdatingId(enrollmentId);

    try {
      await updateEnrollmentProgress(enrollmentId, value);
      setSuccess("Enrollment progress updated.");
      await loadEnrollments();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update progress");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Enrollments"
        description="Track student-course enrollments and update learning progress."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-900">
          Enrollment List
        </h2>
        <div className="mt-3 space-y-2">
          {error ? <StatusMessage type="error" message={error} /> : null}
          {success ? <StatusMessage type="success" message={success} /> : null}
        </div>

        <div className="mt-4">
          {loading ? <LoadingBlock label="Loading enrollments..." /> : null}
          {!loading && enrollments.length === 0 ? (
            <p className="text-sm text-slate-600">No enrollments yet.</p>
          ) : null}

          {!loading && enrollments.length > 0 ? (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <article
                  key={enrollment.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                    <p>
                      <span className="font-medium">ID:</span> {enrollment.id}
                    </p>
                    <p>
                      <span className="font-medium">Student ID:</span> {enrollment.studentId}
                    </p>
                    <p>
                      <span className="font-medium">Course ID:</span> {enrollment.courseId}
                    </p>
                    <p>
                      <span className="font-medium">Progress:</span> {enrollment.progress}%
                    </p>
                    <p className="sm:col-span-2 lg:col-span-2">
                      <span className="font-medium">Enrolled At:</span>{" "}
                      {formatDate(enrollment.enrolledAt)}
                    </p>
                  </div>

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
                      className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
                    />
                    <button
                      type="submit"
                      disabled={updatingId === enrollment.id}
                      className="w-fit rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {updatingId === enrollment.id ? "Updating..." : "Update Progress"}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
