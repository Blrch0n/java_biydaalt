package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Instructor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InstructorRepository extends MongoRepository<Instructor, String> {
	boolean existsByEmail(String email);
}
