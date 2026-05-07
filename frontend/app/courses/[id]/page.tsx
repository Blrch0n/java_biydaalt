"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { triggerConfetti } from "@/lib/gamification";
import { useAuth } from "@/context/AuthContext";

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { user } = useAuth();

  const { data: course } = useSWR(`/api/courses/${courseId}`, () => api.getCourse(courseId));
  const { data: assignments } = useSWR(`/api/assignments/course/${courseId}`, () => api.getAssignmentsByCourse(courseId));
  const { data: quizzes } = useSWR(`/api/quizzes/course/${courseId}`, () => api.getQuizzesByCourse(courseId));

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (assignmentId: string) => {
    if (!file) return;
    setUploading(true);
    try {
      await api.submitAssignment(assignmentId, file);
      triggerConfetti();
      alert("Assignment submitted successfully!");
      setFile(null);
    } catch {
      alert("Failed to submit assignment.");
    } finally {
      setUploading(false);
    }
  };

  if (!course) return <div className="p-10 text-white">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="paper p-8 bg-[var(--brand-yellow)] text-black">
        <h1 className="text-4xl font-black uppercase tracking-tight">{course.title}</h1>
        <p className="mt-2 text-lg font-bold">{course.description}</p>
      </div>

      {/* Assignments Section */}
      <div className="paper p-6">
        <h2 className="section-title text-2xl font-bold text-white mb-4">Assignments</h2>
        <div className="space-y-4">
          {assignments?.length === 0 && <p className="text-slate-400">No assignments yet.</p>}
          {assignments?.map((assignment) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={assignment.id}
              className="p-4 border-2 border-black bg-[var(--brand-cyan)] text-black shadow-[4px_4px_0_0_#000]"
            >
              <h3 className="font-bold text-xl">{assignment.title}</h3>
              <p>{assignment.description}</p>
              <div className="mt-4 flex flex-col gap-2">
                {user?.role === "STUDENT" && (
                  <div className="flex gap-2 items-center">
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-white p-1 border-2 border-black" />
                    <button
                      disabled={uploading || !file}
                      onClick={() => handleUpload(assignment.id)}
                      className="btn-primary py-1 px-4 text-sm"
                    >
                      {uploading ? "Uploading..." : "Upload PDF"}
                    </button>
                  </div>
                )}
                {user?.role === "TEACHER" && (
                  <button onClick={() => window.location.href = `/assignments/${assignment.id}/grade`} className="btn-secondary py-1 px-4 w-max">
                    Grade Submissions
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="paper p-6">
        <h2 className="section-title text-2xl font-bold text-white mb-4">Quizzes</h2>
        <div className="space-y-4">
          {quizzes?.length === 0 && <p className="text-slate-400">No quizzes yet.</p>}
          {quizzes?.map((quiz) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={quiz.id}
              className="p-4 border-2 border-black bg-[var(--brand-magenta)] text-white shadow-[4px_4px_0_0_#000]"
            >
              <h3 className="font-bold text-xl">{quiz.title}</h3>
              <p>{quiz.questions?.length || 0} Questions</p>
              <div className="mt-4">
                {user?.role === "STUDENT" && (
                  <button onClick={() => window.location.href = `/quizzes/${quiz.id}/take`} className="btn-primary bg-yellow-400 text-black py-1 px-4">
                    Take Quiz
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
