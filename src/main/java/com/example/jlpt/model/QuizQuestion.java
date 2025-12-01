package com.example.jlpt.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quiz_questions")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class QuizQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "flashcard_id", nullable = false)
    private Integer flashcardId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;
    
    @Column(name = "question_text", length = 255)
    private String questionText;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flashcard_id", insertable = false, updatable = false)
    private Flashcard flashcard;
    
    @JsonManagedReference
    @OneToMany(mappedBy = "quizQuestion", cascade = CascadeType.ALL)
    private List<QuizOption> quizOptions;
    
    public enum QuestionType {
        meaning, reading, audio, kanji_image, example
    }
}
