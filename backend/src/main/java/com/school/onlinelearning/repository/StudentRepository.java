package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<Student, String> {
	boolean existsByEmail(String email);
}
