package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

	private final EnrollmentService enrollmentService;

	public EnrollmentController(EnrollmentService enrollmentService) {
		this.enrollmentService = enrollmentService;
	}

	@GetMapping
	public ResponseEntity<List<Enrollment>> getAllEnrollments() {
		return ResponseEntity.ok(enrollmentService.getAllEnrollments());
	}

	@PostMapping
	public ResponseEntity<?> createEnrollment(@Valid @RequestBody Enrollment enrollment) {
		try {
			Enrollment createdEnrollment = enrollmentService.createEnrollment(enrollment);
			return ResponseEntity.status(HttpStatus.CREATED).body(createdEnrollment);
		} catch (NoSuchElementException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
		}
	}

	@PatchMapping("/{id}/progress")
	public ResponseEntity<?> updateProgress(@PathVariable String id, @RequestParam("value") double value) {
		try {
			Enrollment updatedEnrollment = enrollmentService.updateProgress(id, value);
			return ResponseEntity.ok(updatedEnrollment);
		} catch (NoSuchElementException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
		}
	}
}
