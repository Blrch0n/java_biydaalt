"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { createStudent, deleteStudent, getStudents } from "@/lib/api";
import { Student } from "@/types";

const initialForm = {
  fullName: "",
  email: "",
  batch: "",
};

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadStudents() {
    setError(null);
    setLoading(true);

    try {
      const data = await getStudents();
      setStudents(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Оюутнуудыг ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "TEACHER") {
      void loadStudents();
      return;
    }

    setLoading(false);
  }, [user?.role]);

  async function onDeleteStudent(id: string) {
    setError(null);
    setSuccess(null);

    try {
      await deleteStudent(id);
      setSuccess("Оюутныг амжилттай устгалаа.");
      await loadStudents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Оюутан устгах үед алдаа гарлаа.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const batch = form.batch.trim();

    if (!fullName || !email || !batch) {
      setError("Оюутны бүх талбарыг бөглөнө үү.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Зөв имэйл хаяг оруулна уу.");
      return;
    }

    setSubmitting(true);

    try {
      await createStudent({ fullName, email, batch });
      setSuccess("Оюутны мэдээллийг амжилттай нэмлээ.");
      setForm(initialForm);
      await loadStudents();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Оюутан нэмэх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Оюутнууд"
        description="Оюутны бүртгэлийг удирдаж, шинэ оюутан нэмнэ."
      />

      {user?.role !== "TEACHER" ? (
        <div className="paper p-5">
          <StatusMessage type="error" message="Энэ хэсэг зөвхөн багш эрхтэй хэрэглэгчид нээлттэй." />
        </div>
      ) : null}

      {user?.role === "TEACHER" ? (
      <div className="paper p-5">
        <h2 className="section-title text-lg font-semibold">Оюутан Нэмэх</h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Овог нэр"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            className="field"
          />
          <input
            type="email"
            placeholder="Имэйл"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="field"
          />
          <input
            type="text"
            placeholder="Анги"
            value={form.batch}
            onChange={(event) => setForm((prev) => ({ ...prev, batch: event.target.value }))}
            className="field"
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Нэмж байна..." : "Оюутан Нэмэх"}
          </button>
        </form>
        <div className="mt-3 space-y-2">
          {error ? <StatusMessage type="error" message={error} /> : null}
          {success ? <StatusMessage type="success" message={success} /> : null}
        </div>
      </div>
      ) : null}

      <div className="paper p-5">
        <h2 className="section-title text-lg font-semibold">Оюутны Жагсаалт</h2>
        <div className="mt-4">
          {loading ? <LoadingBlock label="Оюутнуудыг ачаалж байна..." /> : null}
          {!loading && students.length === 0 ? (
            <p className="muted-copy text-sm">Одоогоор оюутан бүртгэгдээгүй байна.</p>
          ) : null}
          {!loading && students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-amber-900/15 text-left text-slate-600">
                    <th className="py-2 pr-4">Дугаар</th>
                    <th className="py-2 pr-4">Нэр</th>
                    <th className="py-2 pr-4">Имэйл</th>
                    <th className="py-2">Анги</th>
                    <th className="py-2 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-amber-900/10 align-top">
                      <td className="py-2 pr-4 text-slate-500">{student.id}</td>
                      <td className="py-2 pr-4 font-medium text-slate-800">{student.fullName}</td>
                      <td className="py-2 pr-4">{student.email}</td>
                      <td className="py-2">{student.batch}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => void onDeleteStudent(student.id)}
                        >
                          Устгах
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
