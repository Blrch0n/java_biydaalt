package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

	private final CourseService courseService;

	public CourseController(CourseService courseService) {
		this.courseService = courseService;
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping
	public ResponseEntity<List<Course>> getAllCourses(@RequestParam(required = false) String level) {
		return ResponseEntity.ok(courseService.getAllCourses(level));
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping("/{id}")
	public ResponseEntity<Course> getCourseById(@PathVariable String id) {
		return ResponseEntity.ok(courseService.getCourseById(id));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping
	public ResponseEntity<Course> createCourse(@Valid @RequestBody Course course) {
		Course createdCourse = courseService.createCourse(course);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PutMapping("/{id}")
	public ResponseEntity<Course> updateCourse(@PathVariable String id, @Valid @RequestBody Course course) {
		return ResponseEntity.ok(courseService.updateCourse(id, course));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
		courseService.deleteCourse(id);
		return ResponseEntity.noContent().build();
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping("/{courseId}/lessons")
	public ResponseEntity<Course> addLesson(@PathVariable String courseId, @Valid @RequestBody Lesson lesson) {
		return ResponseEntity.ok(courseService.addLesson(courseId, lesson));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{courseId}/lessons/{lessonIndex}")
	public ResponseEntity<Course> removeLesson(@PathVariable String courseId, @PathVariable int lessonIndex) {
		return ResponseEntity.ok(courseService.removeLesson(courseId, lessonIndex));
	}
}
