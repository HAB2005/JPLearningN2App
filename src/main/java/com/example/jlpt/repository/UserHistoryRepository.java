package com.example.jlpt.repository;

import com.example.jlpt.model.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserHistoryRepository extends JpaRepository<UserHistory, Integer> {
    List<UserHistory> findByUserId(Integer userId);
    List<UserHistory> findByFlashcardId(Integer flashcardId);
    Optional<UserHistory> findByUserIdAndFlashcardId(Integer userId, Integer flashcardId);
    List<UserHistory> findByUserIdAndMarkLearned(Integer userId, Boolean markLearned);
}
