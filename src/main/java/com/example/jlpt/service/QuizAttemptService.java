package com.example.jlpt.service;

import com.example.jlpt.model.Lesson;
import com.example.jlpt.model.QuizAttempt;
import com.example.jlpt.model.QuizAttemptDetail;
import com.example.jlpt.repository.LessonRepository;
import com.example.jlpt.repository.QuizAttemptDetailRepository;
import com.example.jlpt.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class QuizAttemptService {
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private QuizAttemptDetailRepository quizAttemptDetailRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    /**
     * Lưu kết quả làm bài quiz
     * @param userId ID người dùng
     * @param lessonId ID lesson (nullable)
     * @param chapterId ID chapter (nullable)
     * @param questionAnswers List các câu trả lời: [{questionId, selectedOptionId, isCorrect, timeSpent}]
     * @param totalTimeSpent Tổng thời gian làm bài (giây)
     * @return QuizAttempt đã lưu
     */
    @Transactional
    public QuizAttempt saveQuizAttempt(
            Integer userId,
            Integer lessonId,
            Integer chapterId,
            List<Map<String, Object>> questionAnswers,
            Integer totalTimeSpent
    ) {
        // Nếu có lessonId nhưng không có chapterId, tự động lấy chapterId từ lesson
        if (lessonId != null && chapterId == null) {
            Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
            if (lesson != null) {
                chapterId = lesson.getChapterId();
            }
        }
        
        // Tính toán kết quả
        int totalQuestions = questionAnswers.size();
        long correctAnswers = questionAnswers.stream()
                .filter(qa -> Boolean.TRUE.equals(qa.get("isCorrect")))
                .count();
        
        BigDecimal scorePercentage = BigDecimal.valueOf(correctAnswers)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP);
        
        // Tạo QuizAttempt
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(userId);
        attempt.setLessonId(lessonId);
        attempt.setChapterId(chapterId);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setCorrectAnswers((int) correctAnswers);
        attempt.setScorePercentage(scorePercentage);
        attempt.setTimeSpent(totalTimeSpent);
        attempt.setCompletedAt(LocalDateTime.now());
        
        // Lưu attempt
        attempt = quizAttemptRepository.save(attempt);
        
        // Tạo chi tiết từng câu
        List<QuizAttemptDetail> details = new ArrayList<>();
        for (Map<String, Object> qa : questionAnswers) {
            QuizAttemptDetail detail = new QuizAttemptDetail();
            detail.setAttemptId(attempt.getId());
            detail.setQuestionId((Integer) qa.get("questionId"));
            detail.setSelectedOptionId((Integer) qa.get("selectedOptionId"));
            detail.setIsCorrect((Boolean) qa.get("isCorrect"));
            detail.setTimeSpent((Integer) qa.get("timeSpent"));
            details.add(detail);
        }
        
        // Lưu tất cả details
        quizAttemptDetailRepository.saveAll(details);
        
        return attempt;
    }
    
    /**
     * Lấy lịch sử làm bài của user
     */
    public List<QuizAttempt> getUserAttemptHistory(Integer userId) {
        return quizAttemptRepository.findByUserIdOrderByCompletedAtDesc(userId);
    }
    
    /**
     * Lấy thông tin một lần làm bài
     */
    @Transactional(readOnly = true)
    public QuizAttempt getAttemptById(Integer attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId).orElse(null);
        if (attempt != null) {
            // Force load lazy relationships
            if (attempt.getLesson() != null) {
                attempt.getLesson().getName();
            }
            if (attempt.getChapter() != null) {
                attempt.getChapter().getName();
            }
        }
        return attempt;
    }
    
    /**
     * Lấy chi tiết một lần làm bài
     */
    @Transactional(readOnly = true)
    public List<QuizAttemptDetail> getAttemptDetails(Integer attemptId) {
        List<QuizAttemptDetail> details = quizAttemptDetailRepository.findByAttemptIdOrderById(attemptId);
        // Force load lazy relationships
        details.forEach(detail -> {
            if (detail.getQuizQuestion() != null) {
                detail.getQuizQuestion().getQuizOptions().size(); // Force load options
                if (detail.getQuizQuestion().getFlashcard() != null) {
                    detail.getQuizQuestion().getFlashcard().getWord(); // Force load flashcard
                }
            }
        });
        return details;
    }
    
    /**
     * Lấy lần làm bài gần nhất của user cho lesson
     */
    public QuizAttempt getLatestAttempt(Integer userId, Integer lessonId) {
        return quizAttemptRepository.findLatestByUserIdAndLessonId(userId, lessonId);
    }
    
    /**
     * Lấy điểm trung bình của user
     */
    public Double getAverageScore(Integer userId) {
        return quizAttemptRepository.getAverageScoreByUserId(userId);
    }
    
    /**
     * Lấy các câu user hay sai nhất
     */
    public List<Object[]> getMostWrongQuestions(Integer userId) {
        return quizAttemptDetailRepository.findMostWrongQuestionsByUserId(userId);
    }
}
