package com.school.onlinelearning.service;

import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CourseService {

	private final CourseRepository courseRepository;

	public CourseService(CourseRepository courseRepository) {
		this.courseRepository = courseRepository;
	}

	public List<Course> getAllCourses() {
		return courseRepository.findAll();
	}

	public Course createCourse(Course course) {
		return courseRepository.save(course);
	}

	public Course addLesson(String courseId, Lesson lesson) {
		Course course = courseRepository.findById(courseId)
				.orElseThrow(() -> new NoSuchElementException("Course not found: " + courseId));

		boolean duplicateTitle = course.getLessons().stream()
				.anyMatch(existingLesson -> existingLesson.getTitle() != null
						&& existingLesson.getTitle().equalsIgnoreCase(lesson.getTitle()));

		if (duplicateTitle) {
			throw new IllegalArgumentException("Lesson title already exists in this course: " + lesson.getTitle());
		}

		course.getLessons().add(lesson);
		return courseRepository.save(course);
	}
}
