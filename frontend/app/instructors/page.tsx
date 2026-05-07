"use client";

import { useState } from "react";
import useSWR from "swr";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { InstructorForm } from "@/components/forms/InstructorForm";
import { InstructorTable } from "@/components/tables/InstructorTable";
import { Pagination } from "@/components/Pagination";

export default function InstructorsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  const { data, error, mutate, isLoading } = useSWR(
    user?.role === "TEACHER" ? `/api/instructors?page=${page}` : null,
    () => api.getInstructors(page, 10)
  );

  const onDeleteInstructor = async (id: string) => {
    if (!window.confirm("Энэ багшийг устгахдаа итгэлтэй байна уу?")) return;
    try {
      await api.deleteInstructor(id);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Багш устгах үед алдаа гарлаа.");
    }
  };

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <PageHeader
        title="Багш нар 👨‍🏫"
        description="Багшийн бүртгэлийг удирдаж, шинэ багш нэмнэ."
      />

      {user?.role !== "TEACHER" ? (
        <div className="paper p-5">
          <StatusMessage type="error" message="Энэ хэсэг зөвхөн багш эрхтэй хэрэглэгчид нээлттэй." />
        </div>
      ) : null}

      {user?.role === "TEACHER" && (
        <InstructorForm onSuccess={() => mutate()} />
      )}

      {user?.role === "TEACHER" && (
        <div className="paper p-5 sm:p-6">
          <h2 className="section-title text-xl font-bold text-white">
            Багшийн Жагсаалт 📋
            {data ? (
              <span className="ml-2 badge badge--neutral">{data.totalElements}</span>
            ) : null}
          </h2>
          
          {isLoading && <LoadingBlock label="Багш нарыг ачаалж байна..." />}
          {error && <StatusMessage type="error" message="Мэдээлэл татахад алдаа гарлаа." />}
          
          {!isLoading && data && (
            <>
              <InstructorTable instructors={data.content} onDelete={onDeleteInstructor} />
              <Pagination
                pageNo={data.pageNo}
                totalPages={data.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}
