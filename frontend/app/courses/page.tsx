"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { addLesson, createCourse, deleteCourse, getCourses, getInstructors } from "@/lib/api";
import { Course, Instructor } from "@/types";

const initialCourseForm = {
  title: "",
  description: "",
  level: "BEGINNER",
  price: "0",
  instructorId: "",
};

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filterLevel, setFilterLevel] = useState("ALL");
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
      const [coursesData, instructorsData] = await Promise.all([getCourses(), getInstructors()]);
      setCourses(coursesData);
      setInstructors(instructorsData);

      if (instructorsData.length > 0) {
        setCourseForm((prev) => ({
          ...prev,
          instructorId: prev.instructorId || instructorsData[0].id,
        }));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Хичээлүүдийг ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  async function onDeleteCourse(courseId: string) {
    setError(null);
    setSuccess(null);

    try {
      await deleteCourse(courseId);
      setSuccess("Хичээлийг амжилттай устгалаа.");
      await loadCourses();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Хичээл устгах үед алдаа гарлаа.");
    }
  }

  const filteredCourses =
    filterLevel === "ALL" ? courses : courses.filter((course) => course.level === filterLevel);

  const levels = ["ALL", ...Array.from(new Set(courses.map((course) => course.level)))];

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
      setError("Хичээлийн бүх талбарыг бөглөнө үү.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setError("Үнэ нь 0-ээс их эсвэл тэнцүү тоо байна.");
      return;
    }

    setSubmittingCourse(true);

    try {
      await createCourse({ title, description, level, price, instructorId });
      setSuccess("Хичээлийг амжилттай үүсгэлээ.");
      setCourseForm(initialCourseForm);
      await loadCourses();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Хичээл үүсгэх үед алдаа гарлаа.");
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
      setError("Хичээлийн сэдвийн нэр шаардлагатай.");
      return;
    }

    if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      setError("Хугацаа 0-ээс их байх ёстой.");
      return;
    }

    setSubmittingLessonFor(courseId);

    try {
      await addLesson(courseId, { title, durationMinutes });
      setSuccess("Сэдвийг амжилттай нэмлээ.");
      setLessonForms((prev) => ({
        ...prev,
        [courseId]: { title: "", durationMinutes: "" },
      }));
      await loadCourses();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Сэдэв нэмэх үед алдаа гарлаа.");
    } finally {
      setSubmittingLessonFor(null);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Хичээлүүд"
        description="Хичээлүүдийг харах, багш эрхтэй хэрэглэгч нэмэлт удирдлага хийнэ."
      />

      <div className="paper p-5">
        <label className="flex flex-col gap-1 text-sm text-slate-700 sm:max-w-xs">
          Түвшнээр шүүх
          <select
            value={filterLevel}
            onChange={(event) => setFilterLevel(event.target.value)}
            className="field"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level === "ALL" ? "Бүгд" : level}
              </option>
            ))}
          </select>
        </label>
      </div>

      {user?.role === "TEACHER" ? (
      <div className="paper p-5">
        <h2 className="section-title text-lg font-semibold">
          Хичээл Үүсгэх
        </h2>
        <form onSubmit={onCreateCourse} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Хичээлийн нэр"
            value={courseForm.title}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, title: event.target.value }))
            }
            className="field"
          />
          <input
            type="text"
            placeholder="Түвшин (BEGINNER, INTERMEDIATE...)"
            value={courseForm.level}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, level: event.target.value }))
            }
            className="field"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Үнэ"
            value={courseForm.price}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, price: event.target.value }))
            }
            className="field"
          />
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Багш
            <select
              value={courseForm.instructorId}
              onChange={(event) =>
                setCourseForm((prev) => ({ ...prev, instructorId: event.target.value }))
              }
              className="field"
            >
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.fullName}
                </option>
              ))}
            </select>
          </label>
          <textarea
            placeholder="Тайлбар"
            value={courseForm.description}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, description: event.target.value }))
            }
            className="field sm:col-span-2"
            rows={3}
          />
          <button
            type="submit"
            disabled={submittingCourse}
            className="btn-primary w-fit"
          >
            {submittingCourse ? "Үүсгэж байна..." : "Хичээл Үүсгэх"}
          </button>
        </form>
        <div className="mt-3 space-y-2">
          {error ? <StatusMessage type="error" message={error} /> : null}
          {success ? <StatusMessage type="success" message={success} /> : null}
        </div>
      </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="section-title text-lg font-semibold">
          Хичээлийн Жагсаалт
        </h2>
        {loading ? <LoadingBlock label="Хичээлүүдийг ачаалж байна..." /> : null}
        {!loading && filteredCourses.length === 0 ? (
          <div className="paper muted-copy p-4 text-sm">
            Одоогоор хичээл бүртгэгдээгүй байна.
          </div>
        ) : null}
        {!loading &&
          filteredCourses.map((course) => {
            const lessonForm = lessonForms[course.id] ?? {
              title: "",
              durationMinutes: "",
            };
            const instructor = instructors.find((item) => item.id === course.instructorId);

            return (
              <article
                key={course.id}
                className="paper p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="section-title text-lg font-semibold">
                    {course.title}
                  </h3>
                  <span className="rounded-full bg-slate-200/60 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {course.lessons.length} сэдэв
                  </span>
                </div>
                <p className="muted-copy mt-2 text-sm">{course.description}</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                  <p>
                    <span className="font-medium">Түвшин:</span> {course.level}
                  </p>
                  <p>
                    <span className="font-medium">Үнэ:</span> ${course.price.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-medium">Багш:</span> {instructor?.fullName ?? course.instructorId}
                  </p>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-slate-900">Сэдвүүд</h4>
                  {course.lessons.length === 0 ? (
                    <p className="muted-copy mt-2 text-sm">Сэдэв нэмэгдээгүй байна.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {course.lessons.map((lesson, index) => (
                        <li
                          key={`${course.id}-${lesson.title}-${index}`}
                          className="rounded-lg bg-slate-100/80 px-3 py-2"
                        >
                          {lesson.title} ({lesson.durationMinutes} мин)
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {user?.role === "TEACHER" ? (
                  <>
                    <form
                      onSubmit={(event) => void onAddLesson(course.id, event)}
                      className="mt-4 flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        type="text"
                        placeholder="Сэдвийн нэр"
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
                        className="field"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="Хугацаа (минут)"
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
                        className="field"
                      />
                      <button
                        type="submit"
                        disabled={submittingLessonFor === course.id}
                        className="btn-secondary"
                      >
                        {submittingLessonFor === course.id ? "Нэмж байна..." : "Сэдэв Нэмэх"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => void onDeleteCourse(course.id)}
                      >
                        Устгах
                      </button>
                    </form>
                  </>
                ) : null}
              </article>
            );
          })}
      </div>
    </section>
  );
}
