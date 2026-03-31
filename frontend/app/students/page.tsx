"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { createStudent, getStudents } from "@/lib/api";
import { Student } from "@/types";

const initialForm = {
  fullName: "",
  email: "",
  batch: "",
};

export default function StudentsPage() {
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
      setError(loadError instanceof Error ? loadError.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const batch = form.batch.trim();

    if (!fullName || !email || !batch) {
      setError("Please complete all student fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      await createStudent({ fullName, email, batch });
      setSuccess("Student created successfully.");
      setForm(initialForm);
      await loadStudents();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage student records and add new students to your batch."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-900">
          Create Student
        </h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Full name"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
          />
          <input
            type="text"
            placeholder="Batch"
            value={form.batch}
            onChange={(event) => setForm((prev) => ({ ...prev, batch: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {submitting ? "Creating..." : "Create Student"}
          </button>
        </form>
        <div className="mt-3 space-y-2">
          {error ? <StatusMessage type="error" message={error} /> : null}
          {success ? <StatusMessage type="success" message={success} /> : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-900">
          Student List
        </h2>
        <div className="mt-4">
          {loading ? <LoadingBlock label="Loading students..." /> : null}
          {!loading && students.length === 0 ? (
            <p className="text-sm text-slate-600">No students yet.</p>
          ) : null}
          {!loading && students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2">Batch</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-4 text-slate-500">{student.id}</td>
                      <td className="py-2 pr-4 font-medium text-slate-800">{student.fullName}</td>
                      <td className="py-2 pr-4">{student.email}</td>
                      <td className="py-2">{student.batch}</td>
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
