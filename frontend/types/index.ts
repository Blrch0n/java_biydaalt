export type UserRole = "STUDENT" | "TEACHER";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type Student = {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  batch: string;
};

export type Instructor = {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  specialization: string;
};

export type Lesson = {
  title: string;
  durationMinutes: number;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  instructorId: string;
  lessons: Lesson[];
};

export type Enrollment = {
  id: string;
  studentId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
};

export type EnrollmentView = {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  enrolledAt: string;
};

export type DashboardStats = {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  averageProgress: number;
  courseWithMostLessonsTitle: string;
  courseWithMostLessonsCount: number;
};

export type LoginResponse = {
  token: string;
  user: User;
};
