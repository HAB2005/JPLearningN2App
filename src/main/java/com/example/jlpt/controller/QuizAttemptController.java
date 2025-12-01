package com.example.jlpt.controller;

import com.example.jlpt.model.QuizAttempt;
import com.example.jlpt.model.QuizAttemptDetail;
import com.example.jlpt.service.QuizAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizAttemptController {
    
    @Autowired
    private QuizAttemptService quizAttemptService;
    
    /**
     * Lưu kết quả làm bài quiz
     * POST /api/quiz-attempts/submit
     * Body: {
     *   userId: 1,
     *   lessonId: 1,
     *   chapterId: null,
     *   totalTimeSpent: 600,
     *   answers: [
     *     {questionId: 1, selectedOptionId: 5, isCorrect: true, timeSpent: 15},
     *     {questionId: 2, selectedOptionId: null, isCorrect: false, timeSpent: 0}
     *   ]
     * }
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitQuizAttempt(@RequestBody Map<String, Object> request) {
        try {
            // Parse với xử lý null và type conversion
            Integer userId = parseInteger(request.get("userId"));
            Integer lessonId = parseInteger(request.get("lessonId"));
            Integer chapterId = parseInteger(request.get("chapterId"));
            Integer totalTimeSpent = parseInteger(request.get("totalTimeSpent"));
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> answers = (List<Map<String, Object>>) request.get("answers");
            
            if (userId == null || answers == null || answers.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Thiếu thông tin bắt buộc: userId hoặc answers");
                return ResponseEntity.badRequest().body(error);
            }
            
            QuizAttempt attempt = quizAttemptService.saveQuizAttempt(
                userId, lessonId, chapterId, answers, totalTimeSpent
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attemptId", attempt.getId());
            response.put("score", attempt.getScorePercentage());
            response.put("message", "Đã lưu kết quả thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log chi tiết lỗi
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lưu kết quả: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private Integer parseInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
    
    /**
     * Lấy lịch sử làm bài của user
     * GET /api/quiz-attempts/history/{userId}
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<QuizAttempt>> getUserHistory(@PathVariable Integer userId) {
        List<QuizAttempt> history = quizAttemptService.getUserAttemptHistory(userId);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Lấy chi tiết một lần làm bài
     * GET /api/quiz-attempts/{attemptId}/details
     */
    @GetMapping("/{attemptId}/details")
    public ResponseEntity<Map<String, Object>> getAttemptDetails(@PathVariable Integer attemptId) {
        QuizAttempt attempt = quizAttemptService.getAttemptById(attemptId);
        if (attempt == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<QuizAttemptDetail> details = quizAttemptService.getAttemptDetails(attemptId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("attempt", attempt);
        response.put("details", details);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy thống kê của user
     * GET /api/quiz-attempts/stats/{userId}
     */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Integer userId) {
        Double averageScore = quizAttemptService.getAverageScore(userId);
        List<Object[]> mostWrongQuestions = quizAttemptService.getMostWrongQuestions(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageScore", averageScore != null ? averageScore : 0.0);
        stats.put("mostWrongQuestions", mostWrongQuestions);
        
        return ResponseEntity.ok(stats);
    }
}
