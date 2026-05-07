"use client";

import { Instructor } from "@/types";

export function InstructorTable({
  instructors,
  onDelete,
}: {
  instructors: Instructor[];
  onDelete: (id: string) => void;
}) {
  if (instructors.length === 0) {
    return <p className="muted-copy text-sm mt-4">Одоогоор багш бүртгэгдээгүй байна.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
      <table className="data-table">
        <thead>
          <tr>
            <th>Дугаар</th>
            <th>Нэр</th>
            <th>Имэйл</th>
            <th>Мэргэжил</th>
            <th className="text-right">Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map((instructor) => (
            <tr key={instructor.id}>
              <td className="text-slate-400 font-mono text-xs">{instructor.id}</td>
              <td className="font-bold text-slate-200">{instructor.fullName}</td>
              <td>{instructor.email}</td>
              <td>
                <span className="badge badge--neutral">{instructor.specialization}</span>
              </td>
              <td className="text-right">
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => onDelete(instructor.id)}
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
