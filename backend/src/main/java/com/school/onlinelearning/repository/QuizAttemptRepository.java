package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByStudentId(String studentId);
    List<QuizAttempt> findByQuizId(String quizId);
    Optional<QuizAttempt> findByQuizIdAndStudentId(String quizId, String studentId);
}
