package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

	private final CourseService courseService;

	public CourseController(CourseService courseService) {
		this.courseService = courseService;
	}

	@GetMapping
	public ResponseEntity<List<Course>> getAllCourses() {
		return ResponseEntity.ok(courseService.getAllCourses());
	}

	@PostMapping
	public ResponseEntity<Course> createCourse(@Valid @RequestBody Course course) {
		Course createdCourse = courseService.createCourse(course);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
	}

	@PostMapping("/{courseId}/lessons")
	public ResponseEntity<?> addLesson(@PathVariable String courseId, @Valid @RequestBody Lesson lesson) {
		try {
			Course updatedCourse = courseService.addLesson(courseId, lesson);
			return ResponseEntity.ok(updatedCourse);
		} catch (NoSuchElementException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
		}
	}
}
