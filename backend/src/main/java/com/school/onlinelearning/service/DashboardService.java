package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.dashboard.DashboardStatsResponse;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

	private final StudentRepository studentRepository;
	private final CourseRepository courseRepository;
	private final EnrollmentRepository enrollmentRepository;

	public DashboardService(
			StudentRepository studentRepository,
			CourseRepository courseRepository,
			EnrollmentRepository enrollmentRepository
	) {
		this.studentRepository = studentRepository;
		this.courseRepository = courseRepository;
		this.enrollmentRepository = enrollmentRepository;
	}

	public DashboardStatsResponse getStats() {
		long totalStudents = studentRepository.count();
		long totalCourses = courseRepository.count();
		long totalEnrollments = enrollmentRepository.count();

		List<Enrollment> enrollments = enrollmentRepository.findAll();
		double averageProgress = enrollments.stream()
				.mapToDouble(Enrollment::getProgress)
				.average()
				.orElse(0.0);

		List<Course> courses = courseRepository.findAll();
		Course courseWithMostLessons = null;
		for (Course course : courses) {
			if (courseWithMostLessons == null || course.getLessons().size() > courseWithMostLessons.getLessons().size()) {
				courseWithMostLessons = course;
			}
		}

		String topTitle = courseWithMostLessons != null ? courseWithMostLessons.getTitle() : "N/A";
		int topCount = courseWithMostLessons != null ? courseWithMostLessons.getLessons().size() : 0;

		return new DashboardStatsResponse(
				totalStudents,
				totalCourses,
				totalEnrollments,
				Math.round(averageProgress * 100.0) / 100.0,
				topTitle,
				topCount
		);
	}
}
