package com.example.jlpt.repository;

import com.example.jlpt.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Integer> {
    
    // Lấy tất cả lần làm bài của user
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.userId = :userId ORDER BY qa.completedAt DESC")
    List<QuizAttempt> findByUserIdOrderByCompletedAtDesc(@Param("userId") Integer userId);
    
    // Lấy lịch sử làm bài theo lesson
    List<QuizAttempt> findByUserIdAndLessonIdOrderByCompletedAtDesc(Integer userId, Integer lessonId);
    
    // Lấy lịch sử làm bài theo chapter
    List<QuizAttempt> findByUserIdAndChapterIdOrderByCompletedAtDesc(Integer userId, Integer chapterId);
    
    // Lấy lần làm bài gần nhất của user cho lesson
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.userId = :userId AND qa.lessonId = :lessonId ORDER BY qa.completedAt DESC LIMIT 1")
    QuizAttempt findLatestByUserIdAndLessonId(@Param("userId") Integer userId, @Param("lessonId") Integer lessonId);
    
    // Đếm số lần làm bài của user
    Long countByUserId(Integer userId);
    
    // Tính điểm trung bình của user
    @Query("SELECT AVG(qa.scorePercentage) FROM QuizAttempt qa WHERE qa.userId = :userId")
    Double getAverageScoreByUserId(@Param("userId") Integer userId);
}
