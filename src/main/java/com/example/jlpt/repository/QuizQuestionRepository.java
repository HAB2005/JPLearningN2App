package com.example.jlpt.repository;

import com.example.jlpt.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Integer> {
    
    List<QuizQuestion> findByFlashcardId(Integer flashcardId);
    
    // Lấy tất cả quiz questions theo lesson
    @Query("SELECT qq FROM QuizQuestion qq JOIN qq.flashcard f WHERE f.lessonId = :lessonId")
    List<QuizQuestion> findByLessonId(@Param("lessonId") Integer lessonId);
    
    // Lấy tất cả quiz questions theo chapter
    @Query("SELECT qq FROM QuizQuestion qq JOIN qq.flashcard f JOIN f.lesson l WHERE l.chapterId = :chapterId")
    List<QuizQuestion> findByChapterId(@Param("chapterId") Integer chapterId);
    
    // Đếm số câu hỏi theo lesson
    @Query("SELECT COUNT(qq) FROM QuizQuestion qq JOIN qq.flashcard f WHERE f.lessonId = :lessonId")
    Long countByLessonId(@Param("lessonId") Integer lessonId);
    
    // Đếm số câu hỏi theo chapter
    @Query("SELECT COUNT(qq) FROM QuizQuestion qq JOIN qq.flashcard f JOIN f.lesson l WHERE l.chapterId = :chapterId")
    Long countByChapterId(@Param("chapterId") Integer chapterId);
}
