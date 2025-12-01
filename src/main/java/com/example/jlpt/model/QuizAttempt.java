package com.example.jlpt.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quiz_attempts")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class QuizAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "lesson_id")
    private Integer lessonId;
    
    @Column(name = "chapter_id")
    private Integer chapterId;
    
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;
    
    @Column(name = "correct_answers", nullable = false)
    private Integer correctAnswers;
    
    @Column(name = "score_percentage", precision = 5, scale = 2)
    private BigDecimal scorePercentage;
    
    @Column(name = "time_spent")
    private Integer timeSpent; // seconds
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lesson_id", insertable = false, updatable = false)
    private Lesson lesson;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chapter_id", insertable = false, updatable = false)
    private Chapter chapter;
    
    @JsonIgnore
    @OneToMany(mappedBy = "quizAttempt", cascade = CascadeType.ALL)
    private List<QuizAttemptDetail> attemptDetails;
}
