"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { StatusMessage } from "@/components/StatusMessage";
import { api } from "@/lib/api";
import { instructorSchema, InstructorFormData } from "@/lib/validations";

export function InstructorForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      fullName: "",
      email: "",
      specialization: "",
    },
  });

  const onSubmit = async (data: InstructorFormData) => {
    setError(null);
    setSuccess(null);
    try {
      await api.createInstructor(data);
      setSuccess("Багшийн мэдээллийг амжилттай нэмлээ.");
      setTimeout(() => setSuccess(null), 3000);
      reset();
      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Багш нэмэх үед алдаа гарлаа.");
    }
  };

  return (
    <div className="paper p-5 sm:p-6">
      <h2 className="section-title text-xl font-bold text-white">Багш Нэмэх ✨</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="fullName" className="block text-sm font-bold text-slate-300">
            Овог нэр
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Сүхбат"
            {...register("fullName")}
            className="field"
          />
          {errors.fullName && <p className="text-red-500 text-xs font-bold">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-bold text-slate-300">
            Имэйл
          </label>
          <input
            id="email"
            type="email"
            placeholder="instructor@example.com"
            {...register("email")}
            className="field"
          />
          {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="specialization" className="block text-sm font-bold text-slate-300">
            Мэргэжил
          </label>
          <input
            id="specialization"
            type="text"
            placeholder="Backend Developer"
            {...register("specialization")}
            className="field"
          />
          {errors.specialization && <p className="text-red-500 text-xs font-bold">{errors.specialization.message}</p>}
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Нэмж байна..." : "Багш Нэмэх"}
          </button>
        </div>
      </form>
      <div className="mt-4 space-y-2">
        {error ? <StatusMessage type="error" message={error} /> : null}
        {success ? <StatusMessage type="success" message={success} /> : null}
      </div>
    </div>
  );
}
