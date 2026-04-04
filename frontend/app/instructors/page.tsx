"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { createInstructor, deleteInstructor, getInstructors } from "@/lib/api";
import { Instructor } from "@/types";

const initialForm = {
  fullName: "",
  email: "",
  specialization: "",
};

export default function InstructorsPage() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadInstructors() {
    setError(null);
    setLoading(true);

    try {
      const data = await getInstructors();
      setInstructors(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Багшийн мэдээлэл ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "TEACHER") {
      void loadInstructors();
      return;
    }

    setLoading(false);
  }, [user?.role]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const specialization = form.specialization.trim();

    if (!fullName || !email || !specialization) {
      setError("Бүх талбарыг бөглөнө үү.");
      return;
    }

    setSubmitting(true);

    try {
      await createInstructor({ fullName, email, specialization });
      setSuccess("Багшийг амжилттай нэмлээ.");
      setForm(initialForm);
      await loadInstructors();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Багш нэмэх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    setError(null);
    setSuccess(null);

    try {
      await deleteInstructor(id);
      setSuccess("Багшийг амжилттай устгалаа.");
      await loadInstructors();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Багш устгах үед алдаа гарлаа.");
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Багш нар" description="Багшийн жагсаалт болон мэргэжлийн мэдээлэл удирдах хэсэг." />

      {user?.role !== "TEACHER" ? (
        <div className="paper p-5">
          <StatusMessage type="error" message="Энэ хэсэг зөвхөн багш эрхтэй хэрэглэгчид нээлттэй." />
        </div>
      ) : null}

      {user?.role === "TEACHER" ? (
        <div className="paper p-5">
          <h2 className="section-title text-lg font-semibold">Багш Нэмэх</h2>
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
              placeholder="Мэргэшил"
              value={form.specialization}
              onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))}
              className="field"
            />
            <button type="submit" disabled={submitting} className="btn-primary w-fit">
              {submitting ? "Нэмж байна..." : "Багш Нэмэх"}
            </button>
          </form>

          <div className="mt-3 space-y-2">
            {error ? <StatusMessage type="error" message={error} /> : null}
            {success ? <StatusMessage type="success" message={success} /> : null}
          </div>
        </div>
      ) : null}

      <div className="paper p-5">
        <h2 className="section-title text-lg font-semibold">Багшийн Жагсаалт</h2>
        <div className="mt-4">
          {loading ? <LoadingBlock label="Багшийн мэдээлэл ачаалж байна..." /> : null}
          {!loading && instructors.length === 0 ? (
            <p className="muted-copy text-sm">Одоогоор багш бүртгэгдээгүй байна.</p>
          ) : null}
          {!loading && instructors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-amber-900/15 text-left text-slate-600">
                    <th className="py-2 pr-4">Нэр</th>
                    <th className="py-2 pr-4">Имэйл</th>
                    <th className="py-2">Мэргэшил</th>
                    <th className="py-2 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((instructor) => (
                    <tr key={instructor.id} className="border-b border-amber-900/10 align-top">
                      <td className="py-2 pr-4 font-medium text-slate-800">{instructor.fullName}</td>
                      <td className="py-2 pr-4">{instructor.email}</td>
                      <td className="py-2">{instructor.specialization}</td>
                      <td className="py-2 text-right">
                        <button type="button" className="btn-secondary" onClick={() => void onDelete(instructor.id)}>
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
