package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Instructor;
import com.school.onlinelearning.repository.InstructorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstructorService {

	private final InstructorRepository instructorRepository;

	public InstructorService(InstructorRepository instructorRepository) {
		this.instructorRepository = instructorRepository;
	}

	public List<Instructor> getAllInstructors() {
		return instructorRepository.findAll();
	}

	public Instructor getInstructorById(String id) {
		return instructorRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Instructor not found: " + id));
	}

	public Instructor createInstructor(Instructor instructor) {
		if (instructorRepository.existsByEmail(instructor.getEmail())) {
			throw new DuplicateResourceException("Instructor email already exists: " + instructor.getEmail());
		}
		return instructorRepository.save(instructor);
	}

	public Instructor updateInstructor(String id, Instructor payload) {
		Instructor existing = getInstructorById(id);
		if (!existing.getEmail().equalsIgnoreCase(payload.getEmail()) && instructorRepository.existsByEmail(payload.getEmail())) {
			throw new DuplicateResourceException("Instructor email already exists: " + payload.getEmail());
		}

		existing.setUserId(payload.getUserId());
		existing.setFullName(payload.getFullName());
		existing.setEmail(payload.getEmail());
		existing.setSpecialization(payload.getSpecialization());
		return instructorRepository.save(existing);
	}

	public void deleteInstructor(String id) {
		Instructor existing = getInstructorById(id);
		instructorRepository.delete(existing);
	}
}
