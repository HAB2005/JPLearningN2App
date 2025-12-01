package com.example.jlpt.repository;

import com.example.jlpt.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Integer> {
    List<Flashcard> findByLessonId(Integer lessonId);
    List<Flashcard> findByType(Flashcard.FlashcardType type);
}
