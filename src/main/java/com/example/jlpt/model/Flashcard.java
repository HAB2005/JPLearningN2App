package com.example.jlpt.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "flashcard")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Flashcard {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlashcardType type;
    
    @Column(nullable = false, length = 50)
    private String word;
    
    @Column(length = 50)
    private String reading;
    
    @Column(length = 255)
    private String meaning;
    
    @Column(columnDefinition = "JSON")
    private String note;
    
    @Column(name = "lesson_id")
    private Integer lessonId;
    
    @Column(name = "mark_learned")
    private Boolean markLearned = false;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", insertable = false, updatable = false)
    private Lesson lesson;
    
    @JsonIgnore
    @OneToMany(mappedBy = "flashcard", cascade = CascadeType.ALL)
    private List<QuizQuestion> quizQuestions;
    
    public enum FlashcardType {
        vocabulary, kanji
    }
}
