package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Question;
import com.school.onlinelearning.model.Quiz;
import com.school.onlinelearning.model.QuizAttempt;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.repository.QuizAttemptRepository;
import com.school.onlinelearning.repository.QuizRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentRepository studentRepository;

    public QuizService(QuizRepository quizRepository, QuizAttemptRepository quizAttemptRepository, StudentRepository studentRepository) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.studentRepository = studentRepository;
    }

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public List<Quiz> getQuizzesByCourse(String courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    public Quiz getQuizById(String quizId) {
        return quizRepository.findById(quizId).orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
    }

    public QuizAttempt submitQuizAttempt(String quizId, String studentId, Map<Integer, String> answers) {
        Quiz quiz = getQuizById(quizId);
        
        // Auto-grade
        int score = 0;
        List<Question> questions = quiz.getQuestions();
        for (int i = 0; i < questions.size(); i++) {
            String studentAnswer = answers.get(i);
            if (studentAnswer != null && studentAnswer.equals(questions.get(i).getCorrectAnswer())) {
                score++;
            }
        }

        // Calculate XP (10 XP per correct question)
        int xpEarned = score * 10;

        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndStudentId(quizId, studentId)
                .orElse(new QuizAttempt());
        
        attempt.setQuizId(quizId);
        attempt.setStudentId(studentId);
        attempt.setAnswers(answers);
        attempt.setScore(score);
        attempt.setTotalQuestions(questions.size());
        attempt.setAttemptedAt(LocalDateTime.now());

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        // Award XP
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setXp(student.getXp() + xpEarned);
        studentRepository.save(student);

        return savedAttempt;
    }

    public List<QuizAttempt> getAttemptsForQuiz(String quizId) {
        return quizAttemptRepository.findByQuizId(quizId);
    }

    public QuizAttempt getAttemptForStudent(String quizId, String studentId) {
        return quizAttemptRepository.findByQuizIdAndStudentId(quizId, studentId).orElse(null);
    }
}
