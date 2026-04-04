package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

	@Mock
	private EnrollmentRepository enrollmentRepository;

	@Mock
	private StudentRepository studentRepository;

	@Mock
	private CourseRepository courseRepository;

	@InjectMocks
	private EnrollmentService enrollmentService;

	@Test
	void createEnrollmentThrowsWhenDuplicateEnrollmentExists() {
		Enrollment enrollment = new Enrollment();
		enrollment.setStudentId("student-1");
		enrollment.setCourseId("course-1");
		enrollment.setProgress(20);

		when(studentRepository.existsById("student-1")).thenReturn(true);
		when(courseRepository.existsById("course-1")).thenReturn(true);
		when(enrollmentRepository.existsByStudentIdAndCourseId("student-1", "course-1")).thenReturn(true);

		assertThrows(DuplicateResourceException.class, () -> enrollmentService.createEnrollment(enrollment));
	}

	@Test
	void updateProgressThrowsWhenProgressIsOutOfRange() {
		assertThrows(IllegalArgumentException.class, () -> enrollmentService.updateProgress("enr-1", 120));
	}
}
