export type Student = {
  id: string;
  fullName: string;
  email: string;
  batch: string;
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
