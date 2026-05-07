"use client";

import { useState } from "react";
import useSWR from "swr";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { StudentForm } from "@/components/forms/StudentForm";
import { StudentTable } from "@/components/tables/StudentTable";
import { Pagination } from "@/components/Pagination";

export default function StudentsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  const { data, error, mutate, isLoading } = useSWR(
    user?.role === "TEACHER" ? `/api/students?page=${page}` : null,
    () => api.getStudents(page, 10)
  );

  const onDeleteStudent = async (id: string) => {
    if (!window.confirm("Энэ оюутныг устгахдаа итгэлтэй байна уу?")) return;
    try {
      await api.deleteStudent(id);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Оюутан устгах үед алдаа гарлаа.");
    }
  };

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <PageHeader
        title="Оюутнууд 👨‍🎓"
        description="Оюутны бүртгэлийг удирдаж, шинэ оюутан нэмнэ."
      />

      {user?.role !== "TEACHER" ? (
        <div className="paper p-5">
          <StatusMessage type="error" message="Энэ хэсэг зөвхөн багш эрхтэй хэрэглэгчид нээлттэй." />
        </div>
      ) : null}

      {user?.role === "TEACHER" && (
        <StudentForm onSuccess={() => mutate()} />
      )}

      {user?.role === "TEACHER" && (
        <div className="paper p-5 sm:p-6">
          <h2 className="section-title text-xl font-bold text-white">
            Оюутны Жагсаалт 📋
            {data ? (
              <span className="ml-2 badge badge--neutral">{data.totalElements}</span>
            ) : null}
          </h2>
          
          {isLoading && <LoadingBlock label="Оюутнуудыг ачаалж байна..." />}
          {error && <StatusMessage type="error" message="Мэдээлэл татахад алдаа гарлаа." />}
          
          {!isLoading && data && (
            <>
              <StudentTable students={data.content} onDelete={onDeleteStudent} />
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
