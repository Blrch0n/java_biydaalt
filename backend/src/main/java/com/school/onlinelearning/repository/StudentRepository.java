package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
	boolean existsByEmail(String email);

	Optional<Student> findByEmail(String email);

	Optional<Student> findByUserId(String userId);

	List<Student> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullName, String email);
}
