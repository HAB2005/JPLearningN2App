package com.example.jlpt.service;

import com.example.jlpt.model.Flashcard;
import com.example.jlpt.model.QuizOption;
import com.example.jlpt.model.QuizQuestion;
import com.example.jlpt.repository.QuizQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {
    
    @Autowired
    private QuizQuestionRepository quizQuestionRepository;
    
    // Lấy câu hỏi theo lesson
    public List<Map<String, Object>> getQuizByLessonId(Integer lessonId) {
        List<QuizQuestion> quizQuestions = quizQuestionRepository.findByLessonId(lessonId);
        return buildQuizData(quizQuestions);
    }
    
    // Lấy câu hỏi theo chapter
    public List<Map<String, Object>> getQuizByChapterId(Integer chapterId) {
        List<QuizQuestion> quizQuestions = quizQuestionRepository.findByChapterId(chapterId);
        return buildQuizData(quizQuestions);
    }
    
    // Đếm số câu hỏi theo lesson
    public Long countQuestionsByLessonId(Integer lessonId) {
        return quizQuestionRepository.countByLessonId(lessonId);
    }
    
    // Đếm số câu hỏi theo chapter
    public Long countQuestionsByChapterId(Integer chapterId) {
        return quizQuestionRepository.countByChapterId(chapterId);
    }
    
    // Xây dựng dữ liệu quiz từ quiz questions
    private List<Map<String, Object>> buildQuizData(List<QuizQuestion> quizQuestions) {
        List<Map<String, Object>> quizData = new ArrayList<>();
        
        for (QuizQuestion question : quizQuestions) {
            Flashcard flashcard = question.getFlashcard();
            List<QuizOption> options = question.getQuizOptions();
            
            if (options != null && !options.isEmpty()) {
                Map<String, Object> questionData = new HashMap<>();
                questionData.put("id", question.getId());
                questionData.put("questionType", question.getQuestionType().toString());
                questionData.put("questionText", question.getQuestionText());
                questionData.put("word", flashcard.getWord());
                questionData.put("reading", flashcard.getReading());
                questionData.put("meaning", flashcard.getMeaning());
                questionData.put("type", flashcard.getType().toString());
                
                // Shuffle options để random thứ tự
                List<QuizOption> shuffledOptions = new ArrayList<>(options);
                Collections.shuffle(shuffledOptions);
                
                List<Map<String, Object>> optionsList = shuffledOptions.stream()
                    .map(opt -> {
                        Map<String, Object> optMap = new HashMap<>();
                        optMap.put("id", opt.getId());
                        optMap.put("text", opt.getOptionText());
                        optMap.put("audio", opt.getOptionAudio());
                        optMap.put("image", opt.getOptionImage());
                        optMap.put("extraData", opt.getExtraData());
                        optMap.put("isCorrect", opt.getIsCorrect());
                        return optMap;
                    })
                    .collect(Collectors.toList());
                
                questionData.put("options", optionsList);
                quizData.add(questionData);
            }
        }
        
        // Shuffle câu hỏi
        Collections.shuffle(quizData);
        
        return quizData;
    }
}
