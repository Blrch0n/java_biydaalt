"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { addLesson, createCourse, getCourses } from "@/lib/api";
import { Course } from "@/types";

const initialCourseForm = {
  title: "",
  description: "",
  level: "BEGINNER",
  price: "0",
  instructorId: "",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [lessonForms, setLessonForms] = useState<
    Record<string, { title: string; durationMinutes: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [submittingLessonFor, setSubmittingLessonFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadCourses() {
    setError(null);
    setLoading(true);

    try {
      const data = await getCourses();
      setCourses(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  async function onCreateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const title = courseForm.title.trim();
    const description = courseForm.description.trim();
    const level = courseForm.level.trim();
    const instructorId = courseForm.instructorId.trim();
    const price = Number(courseForm.price);

    if (!title || !description || !level || !instructorId) {
      setError("Please complete all course fields.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setError("Price must be a number greater than or equal to 0.");
      return;
    }

    setSubmittingCourse(true);

    try {
      await createCourse({ title, description, level, price, instructorId });
      setSuccess("Course created successfully.");
      setCourseForm(initialCourseForm);
      await loadCourses();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create course");
    } finally {
      setSubmittingCourse(false);
    }
  }

  async function onAddLesson(courseId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const lesson = lessonForms[courseId] ?? { title: "", durationMinutes: "" };
    const title = lesson.title.trim();
    const durationMinutes = Number(lesson.durationMinutes);

    if (!title) {
      setError("Lesson title is required.");
      return;
    }

    if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      setError("Lesson duration must be greater than 0.");
      return;
    }

    setSubmittingLessonFor(courseId);

    try {
      await addLesson(courseId, { title, durationMinutes });
      setSuccess("Lesson added successfully.");
      setLessonForms((prev) => ({
        ...prev,
        [courseId]: { title: "", durationMinutes: "" },
      }));
      await loadCourses();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add lesson");
    } finally {
      setSubmittingLessonFor(null);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Courses"
        description="Create courses, review details, and attach lessons."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-900">
          Create Course
        </h2>
        <form onSubmit={onCreateCourse} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Title"
            value={courseForm.title}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, title: event.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
          />
          <input
            type="text"
            placeholder="Level (BEGINNER, INTERMEDIATE...)"
            value={courseForm.level}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, level: event.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Price"
            value={courseForm.price}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, price: event.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
          />
          <input
            type="text"
            placeholder="Instructor ID"
            value={courseForm.instructorId}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, instructorId: event.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
          />
          <textarea
            placeholder="Description"
            value={courseForm.description}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, description: event.target.value }))
            }
            className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
            rows={3}
          />
          <button
            type="submit"
            disabled={submittingCourse}
            className="w-fit rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {submittingCourse ? "Creating..." : "Create Course"}
          </button>
        </form>
        <div className="mt-3 space-y-2">
          {error ? <StatusMessage type="error" message={error} /> : null}
          {success ? <StatusMessage type="success" message={success} /> : null}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-900">
          Course List
        </h2>
        {loading ? <LoadingBlock label="Loading courses..." /> : null}
        {!loading && courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            No courses yet.
          </div>
        ) : null}
        {!loading &&
          courses.map((course) => {
            const lessonForm = lessonForms[course.id] ?? {
              title: "",
              durationMinutes: "",
            };

            return (
              <article
                key={course.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-900">
                    {course.title}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {course.lessons.length} lesson{course.lessons.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                  <p>
                    <span className="font-medium">Level:</span> {course.level}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> ${course.price.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-medium">Instructor:</span> {course.instructorId}
                  </p>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-slate-900">Lessons</h4>
                  {course.lessons.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-600">No lessons yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {course.lessons.map((lesson, index) => (
                        <li
                          key={`${course.id}-${lesson.title}-${index}`}
                          className="rounded-lg bg-slate-100 px-3 py-2"
                        >
                          {lesson.title} ({lesson.durationMinutes} min)
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <form
                  onSubmit={(event) => void onAddLesson(course.id, event)}
                  className="mt-4 flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    type="text"
                    placeholder="Lesson title"
                    value={lessonForm.title}
                    onChange={(event) =>
                      setLessonForms((prev) => ({
                        ...prev,
                        [course.id]: {
                          ...lessonForm,
                          title: event.target.value,
                        },
                      }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Duration (minutes)"
                    value={lessonForm.durationMinutes}
                    onChange={(event) =>
                      setLessonForms((prev) => ({
                        ...prev,
                        [course.id]: {
                          ...lessonForm,
                          durationMinutes: event.target.value,
                        },
                      }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
                  />
                  <button
                    type="submit"
                    disabled={submittingLessonFor === course.id}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submittingLessonFor === course.id ? "Adding..." : "Add Lesson"}
                  </button>
                </form>
              </article>
            );
          })}
      </div>
    </section>
  );
}
