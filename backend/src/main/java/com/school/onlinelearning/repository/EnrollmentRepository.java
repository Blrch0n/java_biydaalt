package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Enrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EnrollmentRepository extends MongoRepository<Enrollment, String> {
	boolean existsByStudentIdAndCourseId(String studentId, String courseId);

	List<Enrollment> findByStudentId(String studentId);

	List<Enrollment> findByCourseId(String courseId);
}
