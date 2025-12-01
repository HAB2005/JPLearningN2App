package com.example.jlpt.service;

import com.example.jlpt.model.User;
import com.example.jlpt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User authenticate(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // TODO: Implement password hashing (BCrypt) in production
            if (user.getPassword().equals(password)) {
                return user;
            }
        }
        return null;
    }

    public User register(String username, String email, String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        // TODO: Hash password before saving in production
        user.setPassword(password);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
