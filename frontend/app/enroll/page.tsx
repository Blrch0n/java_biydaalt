"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { createEnrollment, getCourses, getStudents } from "@/lib/api";
import { Course, Student } from "@/types";

export default function EnrollPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [progress, setProgress] = useState("0");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadData() {
    setError(null);
    setLoading(true);

    try {
      const [studentsData, coursesData] = await Promise.all([
        getStudents(),
        getCourses(),
      ]);

      setStudents(studentsData);
      setCourses(coursesData);

      if (studentsData.length > 0) {
        setStudentId((current) => current || studentsData[0].id);
      }

      if (coursesData.length > 0) {
        setCourseId((current) => current || coursesData[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load form data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!studentId || !courseId) {
      setError("Please select both student and course.");
      return;
    }

    const parsedProgress = Number(progress);

    if (Number.isNaN(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
      setError("Progress must be between 0 and 100.");
      return;
    }

    setSubmitting(true);

    try {
      await createEnrollment({
        studentId,
        courseId,
        progress: parsedProgress,
      });
      setSuccess("Enrollment created successfully.");
      setProgress("0");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to create enrollment",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Enroll Student"
        description="Pick a student and course to create a new enrollment."
      />

      {loading ? <LoadingBlock label="Loading students and courses..." /> : null}

      {!loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Student
              <select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.batch})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Course
              <select
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-700 sm:col-span-2">
              Initial Progress (optional)
              <input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(event) => setProgress(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
              />
            </label>

            <button
              type="submit"
              disabled={submitting || students.length === 0 || courses.length === 0}
              className="w-fit rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {submitting ? "Enrolling..." : "Enroll Student"}
            </button>
          </form>

          {students.length === 0 || courses.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              You need at least one student and one course before enrolling.
            </p>
          ) : null}

          <div className="mt-3 space-y-2">
            {error ? <StatusMessage type="error" message={error} /> : null}
            {success ? <StatusMessage type="success" message={success} /> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
