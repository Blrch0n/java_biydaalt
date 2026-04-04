package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Instructor;
import com.school.onlinelearning.service.InstructorService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

	private final InstructorService instructorService;

	public InstructorController(InstructorService instructorService) {
		this.instructorService = instructorService;
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping
	public ResponseEntity<List<Instructor>> getAllInstructors() {
		return ResponseEntity.ok(instructorService.getAllInstructors());
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping("/{id}")
	public ResponseEntity<Instructor> getInstructorById(@PathVariable String id) {
		return ResponseEntity.ok(instructorService.getInstructorById(id));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping
	public ResponseEntity<Instructor> createInstructor(@Valid @RequestBody Instructor instructor) {
		return ResponseEntity.status(HttpStatus.CREATED).body(instructorService.createInstructor(instructor));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PutMapping("/{id}")
	public ResponseEntity<Instructor> updateInstructor(@PathVariable String id, @Valid @RequestBody Instructor instructor) {
		return ResponseEntity.ok(instructorService.updateInstructor(id, instructor));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteInstructor(@PathVariable String id) {
		instructorService.deleteInstructor(id);
		return ResponseEntity.noContent().build();
	}
}
