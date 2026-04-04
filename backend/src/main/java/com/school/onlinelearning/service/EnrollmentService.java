package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.enrollment.EnrollmentResponse;
import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.model.UserRole;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

	private final EnrollmentRepository enrollmentRepository;
	private final StudentRepository studentRepository;
	private final CourseRepository courseRepository;

	public EnrollmentService(
			EnrollmentRepository enrollmentRepository,
			StudentRepository studentRepository,
			CourseRepository courseRepository
	) {
		this.enrollmentRepository = enrollmentRepository;
		this.studentRepository = studentRepository;
		this.courseRepository = courseRepository;
	}

	public List<EnrollmentResponse> getAllEnrollments(AuthenticatedUser currentUser, String sort) {
		if (currentUser.getRole() == UserRole.STUDENT) {
			Student student = studentRepository.findByUserId(currentUser.getId())
					.orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));
			return mapToResponses(getSortedStudentEnrollments(student.getId(), sort));
		}

		return mapToResponses(getSortedAllEnrollments(sort));
	}

	public EnrollmentResponse getEnrollmentById(String id, AuthenticatedUser currentUser) {
		Enrollment enrollment = enrollmentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + id));

		if (currentUser.getRole() == UserRole.STUDENT) {
			Student student = studentRepository.findByUserId(currentUser.getId())
					.orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));
			if (!enrollment.getStudentId().equals(student.getId())) {
				throw new IllegalArgumentException("You can only view your own enrollments");
			}
		}

		return mapToResponses(List.of(enrollment)).get(0);
	}

	public EnrollmentResponse createEnrollment(Enrollment enrollment) {
		if (!studentRepository.existsById(enrollment.getStudentId())) {
			throw new ResourceNotFoundException("Student not found: " + enrollment.getStudentId());
		}

		if (!courseRepository.existsById(enrollment.getCourseId())) {
			throw new ResourceNotFoundException("Course not found: " + enrollment.getCourseId());
		}

		if (enrollmentRepository.existsByStudentIdAndCourseId(enrollment.getStudentId(), enrollment.getCourseId())) {
			throw new DuplicateResourceException("Student is already enrolled in this course");
		}

		if (enrollment.getProgress() < 0 || enrollment.getProgress() > 100) {
			throw new IllegalArgumentException("Progress must be between 0 and 100");
		}

		enrollment.setProgress(enrollment.getProgress());
		enrollment.setEnrolledAt(LocalDateTime.now());

		Enrollment saved = enrollmentRepository.save(enrollment);
		return mapToResponses(List.of(saved)).get(0);
	}

	public EnrollmentResponse updateProgress(String enrollmentId, double progress) {
		if (progress < 0 || progress > 100) {
			throw new IllegalArgumentException("Progress must be between 0 and 100");
		}

		Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + enrollmentId));

		enrollment.setProgress(progress);
		Enrollment saved = enrollmentRepository.save(enrollment);
		return mapToResponses(List.of(saved)).get(0);
	}

	public void deleteEnrollment(String id) {
		Enrollment enrollment = enrollmentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + id));
		enrollmentRepository.delete(enrollment);
	}

	private List<Enrollment> getSortedAllEnrollments(String sort) {
		if ("progress".equalsIgnoreCase(sort)) {
			return enrollmentRepository.findAllByOrderByProgressDesc();
		}
		if ("date".equalsIgnoreCase(sort)) {
			return enrollmentRepository.findAllByOrderByEnrolledAtDesc();
		}
		return enrollmentRepository.findAll();
	}

	private List<Enrollment> getSortedStudentEnrollments(String studentId, String sort) {
		if ("progress".equalsIgnoreCase(sort)) {
			return enrollmentRepository.findByStudentIdOrderByProgressDesc(studentId);
		}
		if ("date".equalsIgnoreCase(sort)) {
			return enrollmentRepository.findByStudentIdOrderByEnrolledAtDesc(studentId);
		}
		return enrollmentRepository.findByStudentId(studentId);
	}

	private List<EnrollmentResponse> mapToResponses(List<Enrollment> enrollments) {
		Map<String, Student> studentMap = studentRepository.findAllById(
				enrollments.stream().map(Enrollment::getStudentId).collect(Collectors.toSet())
		).stream().collect(Collectors.toMap(Student::getId, Function.identity()));

		Map<String, Course> courseMap = courseRepository.findAllById(
				enrollments.stream().map(Enrollment::getCourseId).collect(Collectors.toSet())
		).stream().collect(Collectors.toMap(Course::getId, Function.identity()));

		return enrollments.stream().map(enrollment -> {
			Student student = studentMap.get(enrollment.getStudentId());
			Course course = courseMap.get(enrollment.getCourseId());

			return new EnrollmentResponse(
					enrollment.getId(),
					enrollment.getStudentId(),
					student != null ? student.getFullName() : "Unknown Student",
					enrollment.getCourseId(),
					course != null ? course.getTitle() : "Unknown Course",
					enrollment.getProgress(),
					enrollment.getEnrolledAt()
			);
		}).toList();
	}
}
