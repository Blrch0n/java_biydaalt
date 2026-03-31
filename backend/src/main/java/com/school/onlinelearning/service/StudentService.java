package com.school.onlinelearning.service;

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

	public List<Student> getAllStudents() {
		return studentRepository.findAll();
	}

	public Student createStudent(Student student) {
		if (studentRepository.existsByEmail(student.getEmail())) {
			throw new IllegalArgumentException("Student email already exists: " + student.getEmail());
		}
		return studentRepository.save(student);
	}
}
