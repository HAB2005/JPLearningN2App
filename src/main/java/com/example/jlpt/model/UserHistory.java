package com.example.jlpt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_history", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "flashcard_id"}))
@Data
public class UserHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "flashcard_id", nullable = false)
    private Integer flashcardId;
    
    @Column
    private Boolean correct;
    
    @Column
    private Integer attempts = 0;
    
    @Column(name = "mark_learned")
    private Boolean markLearned = false;
    
    @Column(name = "last_attempt")
    private LocalDateTime lastAttempt;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flashcard_id", insertable = false, updatable = false)
    private Flashcard flashcard;
}
