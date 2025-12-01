package com.example.jlpt.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "quiz_attempt_details")
@Data
public class QuizAttemptDetail {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "attempt_id", nullable = false)
    private Integer attemptId;
    
    @Column(name = "question_id", nullable = false)
    private Integer questionId;
    
    @Column(name = "selected_option_id")
    private Integer selectedOptionId;
    
    @Column(name = "is_correct")
    private Boolean isCorrect;
    
    @Column(name = "time_spent")
    private Integer timeSpent; // seconds per question
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", insertable = false, updatable = false)
    private QuizAttempt quizAttempt;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    private QuizQuestion quizQuestion;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id", insertable = false, updatable = false)
    private QuizOption selectedOption;
}
