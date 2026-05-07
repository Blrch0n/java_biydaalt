package com.school.onlinelearning.service;

import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.repository.CourseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

	@Mock
	private CourseRepository courseRepository;

	@InjectMocks
	private CourseServiceImpl courseService;

	@Test
	void addLessonThrowsWhenLessonTitleAlreadyExists() {
		Lesson existing = new Lesson("Intro", 10);
		Course course = new Course();
		course.setId("course-1");
		course.setLessons(List.of(existing));

		Lesson incoming = new Lesson("intro", 15);

		when(courseRepository.findById("course-1")).thenReturn(Optional.of(course));

		assertThrows(IllegalArgumentException.class, () -> courseService.addLesson("course-1", incoming));
	}
}
