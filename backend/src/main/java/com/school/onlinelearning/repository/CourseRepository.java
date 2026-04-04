package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CourseRepository extends MongoRepository<Course, String> {
	List<Course> findByLevelIgnoreCase(String level);
}
