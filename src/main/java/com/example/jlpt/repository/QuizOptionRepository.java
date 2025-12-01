package com.example.jlpt.repository;

import com.example.jlpt.model.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, Integer> {
    
    List<QuizOption> findByQuestionId(Integer questionId);
}
