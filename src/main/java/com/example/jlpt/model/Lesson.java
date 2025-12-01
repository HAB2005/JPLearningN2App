package com.example.jlpt.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lesson")
@Data
public class Lesson {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "chapter_id", nullable = false)
    private Integer chapterId;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", insertable = false, updatable = false)
    private Chapter chapter;
    
    @JsonIgnore
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<Flashcard> flashcards;
}
