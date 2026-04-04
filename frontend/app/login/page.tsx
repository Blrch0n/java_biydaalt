"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Имэйл болон нууц үгээ оруулна уу.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Нэвтрэх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <PageHeader title="Нэвтрэх" description="Системд нэвтэрч сургалтын мэдээллээ удирдана." />

      <div className="paper p-5">
        <form onSubmit={onSubmit} className="space-y-3">
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
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>

        {error ? (
          <div className="mt-3">
            <StatusMessage type="error" message={error} />
          </div>
        ) : null}

        <p className="muted-copy mt-4 text-sm">
          Бүртгэлгүй юу? <Link href="/signup" className="font-medium text-emerald-800">Бүртгүүлэх</Link>
        </p>
      </div>
    </section>
  );
}
