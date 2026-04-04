package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

	private final StudentRepository studentRepository;

	public StudentService(StudentRepository studentRepository) {
		this.studentRepository = studentRepository;
	}

	public List<Student> getAllStudents(String search) {
		if (search != null && !search.isBlank()) {
			return studentRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search);
		}
		return studentRepository.findAll();
	}

	public Student getStudentById(String id) {
		return studentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
	}

	public Student createStudent(Student student) {
		if (studentRepository.existsByEmail(student.getEmail())) {
			throw new DuplicateResourceException("Student email already exists: " + student.getEmail());
		}
		return studentRepository.save(student);
	}

	public Student updateStudent(String id, Student payload) {
		Student existing = getStudentById(id);

		if (!existing.getEmail().equalsIgnoreCase(payload.getEmail())
				&& studentRepository.existsByEmail(payload.getEmail())) {
			throw new DuplicateResourceException("Student email already exists: " + payload.getEmail());
		}

		existing.setUserId(payload.getUserId());
		existing.setFullName(payload.getFullName());
		existing.setEmail(payload.getEmail());
		existing.setBatch(payload.getBatch());
		return studentRepository.save(existing);
	}

	public void deleteStudent(String id) {
		Student existing = getStudentById(id);
		studentRepository.delete(existing);
	}
}
