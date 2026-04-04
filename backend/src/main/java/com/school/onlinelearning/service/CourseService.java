package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

	private final CourseRepository courseRepository;

	public CourseService(CourseRepository courseRepository) {
		this.courseRepository = courseRepository;
	}

	public List<Course> getAllCourses(String level) {
		if (level != null && !level.isBlank()) {
			return courseRepository.findByLevelIgnoreCase(level);
		}
		return courseRepository.findAll();
	}

	public Course getCourseById(String id) {
		return courseRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
	}

	public Course createCourse(Course course) {
		return courseRepository.save(course);
	}

	public Course updateCourse(String id, Course payload) {
		Course existing = getCourseById(id);
		existing.setTitle(payload.getTitle());
		existing.setDescription(payload.getDescription());
		existing.setLevel(payload.getLevel());
		existing.setPrice(payload.getPrice());
		existing.setInstructorId(payload.getInstructorId());
		existing.setLessons(payload.getLessons());
		return courseRepository.save(existing);
	}

	public void deleteCourse(String id) {
		Course existing = getCourseById(id);
		courseRepository.delete(existing);
	}

	public Course addLesson(String courseId, Lesson lesson) {
		Course course = getCourseById(courseId);

		boolean duplicateTitle = course.getLessons().stream()
				.anyMatch(existingLesson -> existingLesson.getTitle() != null
						&& existingLesson.getTitle().equalsIgnoreCase(lesson.getTitle()));

		if (duplicateTitle) {
			throw new IllegalArgumentException("Lesson title already exists in this course: " + lesson.getTitle());
		}

		course.getLessons().add(lesson);
		return courseRepository.save(course);
	}

	public Course removeLesson(String courseId, int lessonIndex) {
		Course course = getCourseById(courseId);
		if (lessonIndex < 0 || lessonIndex >= course.getLessons().size()) {
			throw new IllegalArgumentException("Lesson index is out of range");
		}
		course.getLessons().remove(lessonIndex);
		return courseRepository.save(course);
	}
}
