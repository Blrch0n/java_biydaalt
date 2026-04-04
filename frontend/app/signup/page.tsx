"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгттэй байна.");
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.push("/");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Бүртгүүлэх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <PageHeader title="Бүртгүүлэх" description="Шинэ хэрэглэгч үүсгээд систем рүү нэвтэрнэ." />

      <div className="paper p-5">
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Овог нэр"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="field"
          />
          <input
            type="email"
            placeholder="Имэйл"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
          />
          <input
            type="password"
            placeholder="Нууц үг"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
          />
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Эрхийн төрөл
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="field">
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
            </select>
          </label>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Бүртгэж байна..." : "Бүртгүүлэх"}
          </button>
        </form>

        {error ? (
          <div className="mt-3">
            <StatusMessage type="error" message={error} />
          </div>
        ) : null}

        <p className="muted-copy mt-4 text-sm">
          Бүртгэлтэй юу? <Link href="/login" className="font-medium text-emerald-800">Нэвтрэх</Link>
        </p>
      </div>
    </section>
  );
}
