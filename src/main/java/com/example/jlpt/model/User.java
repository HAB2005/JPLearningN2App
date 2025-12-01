package com.example.jlpt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(length = 100)
    private String email;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
