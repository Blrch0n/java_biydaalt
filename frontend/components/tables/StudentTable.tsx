"use client";

import { Student } from "@/types";

export function StudentTable({
  students,
  onDelete,
}: {
  students: Student[];
  onDelete: (id: string) => void;
}) {
  if (students.length === 0) {
    return <p className="muted-copy text-sm mt-4">Одоогоор оюутан бүртгэгдээгүй байна.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
      <table className="data-table">
        <thead>
          <tr>
            <th>Дугаар</th>
            <th>Нэр</th>
            <th>Имэйл</th>
            <th>Анги</th>
            <th className="text-right">Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="text-slate-400 font-mono text-xs">{student.id}</td>
              <td className="font-bold text-slate-200">{student.fullName}</td>
              <td>{student.email}</td>
              <td>
                <span className="badge badge--neutral">{student.batch}</span>
              </td>
              <td className="text-right">
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => onDelete(student.id)}
                >
                  Устгах
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
