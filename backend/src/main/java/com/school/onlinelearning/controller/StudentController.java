package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

	private final StudentService studentService;

	public StudentController(StudentService studentService) {
		this.studentService = studentService;
	}

	@PreAuthorize("hasRole('TEACHER')")
	@GetMapping
	public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) String search) {
		return ResponseEntity.ok(studentService.getAllStudents(search));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@GetMapping("/{id}")
	public ResponseEntity<Student> getStudentById(@PathVariable String id) {
		return ResponseEntity.ok(studentService.getStudentById(id));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping
	public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
		return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(student));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PutMapping("/{id}")
	public ResponseEntity<Student> updateStudent(@PathVariable String id, @Valid @RequestBody Student student) {
		return ResponseEntity.ok(studentService.updateStudent(id, student));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
		studentService.deleteStudent(id);
		return ResponseEntity.noContent().build();
	}
}
