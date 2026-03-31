package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CourseRepository extends MongoRepository<Course, String> {
}
