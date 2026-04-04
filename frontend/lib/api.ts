import {
  Course,
  DashboardStats,
  Enrollment,
  EnrollmentView,
  Instructor,
  Lesson,
  LoginResponse,
  Student,
  User,
  UserRole,
} from "@/types";
import { clearStoredToken, getStoredToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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

type InstructorPayload = {
  fullName: string;
  email: string;
  specialization: string;
};

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function extractErrorMessage(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    if ("message" in payload && typeof payload.message === "string") {
      return payload.message;
    }
    if ("error" in payload && typeof payload.error === "string") {
      return payload.error;
    }
  }
  return typeof payload === "string" ? payload : null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  const token = getStoredToken();

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = response.status === 204 ? undefined : isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const backendMessage = extractErrorMessage(payload);
    if (response.status === 401) {
      clearStoredToken();
    }
    throw new ApiError(backendMessage || `Request failed with status ${response.status}`, response.status);
  }

  return payload as T;
}

export const api = {
  signup: (data: { fullName: string; email: string; password: string; role: UserRole }) =>
    request<User>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<User>("/api/auth/me", { cache: "no-store" }),

  getDashboardStats: () => request<DashboardStats>("/api/dashboard/stats", { cache: "no-store" }),

  getStudents: () => request<Student[]>("/api/students", { cache: "no-store" }),
  createStudent: (data: StudentPayload) =>
    request<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStudent: (id: string, data: StudentPayload) =>
    request<Student>(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStudent: (id: string) => request<void>(`/api/students/${id}`, { method: "DELETE" }),

  getInstructors: () => request<Instructor[]>("/api/instructors", { cache: "no-store" }),
  createInstructor: (data: InstructorPayload) =>
    request<Instructor>("/api/instructors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateInstructor: (id: string, data: InstructorPayload) =>
    request<Instructor>(`/api/instructors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteInstructor: (id: string) => request<void>(`/api/instructors/${id}`, { method: "DELETE" }),

  getCourses: () => request<Course[]>("/api/courses", { cache: "no-store" }),
  createCourse: (data: CoursePayload) =>
    request<Course>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCourse: (id: string, data: CoursePayload) =>
    request<Course>(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCourse: (id: string) => request<void>(`/api/courses/${id}`, { method: "DELETE" }),
  addLesson: (courseId: string, data: Lesson) =>
    request<Course>(`/api/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getEnrollments: (sort?: "progress" | "date") =>
    request<EnrollmentView[]>(`/api/enrollments${sort ? `?sort=${encodeURIComponent(sort)}` : ""}`, {
      cache: "no-store",
    }),
  createEnrollment: (data: EnrollmentPayload) =>
    request<Enrollment>("/api/enrollments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEnrollmentProgress: (id: string, progress: number) =>
    request<EnrollmentView>(`/api/enrollments/${id}/progress?value=${encodeURIComponent(progress)}`, {
      method: "PATCH",
    }),
  deleteEnrollment: (id: string) => request<void>(`/api/enrollments/${id}`, { method: "DELETE" }),
};

export const signup = api.signup;
export const login = api.login;
export const getMe = api.me;
export const getDashboardStats = api.getDashboardStats;
export const getStudents = api.getStudents;
export const createStudent = api.createStudent;
export const updateStudent = api.updateStudent;
export const deleteStudent = api.deleteStudent;
export const getInstructors = api.getInstructors;
export const createInstructor = api.createInstructor;
export const updateInstructor = api.updateInstructor;
export const deleteInstructor = api.deleteInstructor;
export const getCourses = api.getCourses;
export const createCourse = api.createCourse;
export const updateCourse = api.updateCourse;
export const deleteCourse = api.deleteCourse;
export const addLesson = api.addLesson;
export const getEnrollments = api.getEnrollments;
export const createEnrollment = api.createEnrollment;
export const updateEnrollmentProgress = api.updateEnrollmentProgress;
export const deleteEnrollment = api.deleteEnrollment;
