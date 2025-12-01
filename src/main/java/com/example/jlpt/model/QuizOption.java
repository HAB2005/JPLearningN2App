package com.example.jlpt.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_options")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class QuizOption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "question_id", nullable = false)
    private Integer questionId;
    
    @Column(name = "option_text", nullable = false, length = 255)
    private String optionText;
    
    @Column(name = "option_audio", length = 255)
    private String optionAudio;
    
    @Column(name = "option_image", length = 255)
    private String optionImage;
    
    @Column(name = "extra_data", columnDefinition = "JSON")
    private String extraData;
    
    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    private QuizQuestion quizQuestion;
}
