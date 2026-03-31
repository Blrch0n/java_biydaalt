package com.school.onlinelearning.service;

import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

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

	public List<Enrollment> getAllEnrollments() {
		return enrollmentRepository.findAll();
	}

	public Enrollment createEnrollment(Enrollment enrollment) {
		if (!studentRepository.existsById(enrollment.getStudentId())) {
			throw new NoSuchElementException("Student not found: " + enrollment.getStudentId());
		}

		if (!courseRepository.existsById(enrollment.getCourseId())) {
			throw new NoSuchElementException("Course not found: " + enrollment.getCourseId());
		}

		if (enrollmentRepository.existsByStudentIdAndCourseId(enrollment.getStudentId(), enrollment.getCourseId())) {
			throw new IllegalArgumentException("Student is already enrolled in this course");
		}

		if (enrollment.getProgress() < 0 || enrollment.getProgress() > 100) {
			throw new IllegalArgumentException("Progress must be between 0 and 100");
		}

		enrollment.setProgress(enrollment.getProgress());
		enrollment.setEnrolledAt(LocalDateTime.now());

		return enrollmentRepository.save(enrollment);
	}

	public Enrollment updateProgress(String enrollmentId, double progress) {
		if (progress < 0 || progress > 100) {
			throw new IllegalArgumentException("Progress must be between 0 and 100");
		}

		Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
				.orElseThrow(() -> new NoSuchElementException("Enrollment not found: " + enrollmentId));

		enrollment.setProgress(progress);
		return enrollmentRepository.save(enrollment);
	}
}
