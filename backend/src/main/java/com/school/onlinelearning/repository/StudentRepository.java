package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
	boolean existsByEmail(String email);

	Optional<Student> findByEmail(String email);

	Optional<Student> findByUserId(String userId);

	Page<Student> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullName, String email, Pageable pageable);
}
