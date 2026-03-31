import { Course, Enrollment, Lesson, Student } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080";

type EnrollmentPayload = {
  studentId: string;
  courseId: string;
  progress?: number;
};

type CoursePayload = {
  title: string;
  description: string;
  level: string;
  price: number;
  instructorId: string;
};

type StudentPayload = {
  fullName: string;
  email: string;
  batch: string;
};

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const backendMessage =
      isJson && payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : typeof payload === "string"
          ? payload
          : null;

    throw new Error(backendMessage || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export function getStudents() {
  return request<Student[]>("/api/students", { cache: "no-store" });
}

export function createStudent(data: StudentPayload) {
  return request<Student>("/api/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCourses() {
  return request<Course[]>("/api/courses", { cache: "no-store" });
}

export function createCourse(data: CoursePayload) {
  return request<Course>("/api/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function addLesson(courseId: string, data: Lesson) {
  return request<Course>(`/api/courses/${courseId}/lessons`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getEnrollments() {
  return request<Enrollment[]>("/api/enrollments", { cache: "no-store" });
}

export function createEnrollment(data: EnrollmentPayload) {
  return request<Enrollment>("/api/enrollments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateEnrollmentProgress(id: string, value: number) {
  return request<Enrollment>(
    `/api/enrollments/${id}/progress?value=${encodeURIComponent(value)}`,
    {
      method: "PATCH",
    },
  );
}
