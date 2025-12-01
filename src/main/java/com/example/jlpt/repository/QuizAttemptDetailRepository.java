package com.example.jlpt.repository;

import com.example.jlpt.model.QuizAttemptDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptDetailRepository extends JpaRepository<QuizAttemptDetail, Integer> {
    
    // Lấy tất cả chi tiết của một lần làm bài
    List<QuizAttemptDetail> findByAttemptIdOrderById(Integer attemptId);
    
    // Lấy các câu sai của user trong một lần làm bài
    List<QuizAttemptDetail> findByAttemptIdAndIsCorrectFalse(Integer attemptId);
    
    // Thống kê câu hỏi user hay sai nhất
    @Query("SELECT qad.questionId, COUNT(qad) as wrongCount " +
           "FROM QuizAttemptDetail qad " +
           "JOIN qad.quizAttempt qa " +
           "WHERE qa.userId = :userId AND qad.isCorrect = false " +
           "GROUP BY qad.questionId " +
           "ORDER BY wrongCount DESC")
    List<Object[]> findMostWrongQuestionsByUserId(@Param("userId") Integer userId);
    
    // Đếm số câu đúng/sai của user cho một question cụ thể
    @Query("SELECT qad.isCorrect, COUNT(qad) " +
           "FROM QuizAttemptDetail qad " +
           "JOIN qad.quizAttempt qa " +
           "WHERE qa.userId = :userId AND qad.questionId = :questionId " +
           "GROUP BY qad.isCorrect")
    List<Object[]> getQuestionStatsByUserId(@Param("userId") Integer userId, @Param("questionId") Integer questionId);
}
