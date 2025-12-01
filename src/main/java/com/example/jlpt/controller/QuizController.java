package com.example.jlpt.controller;

import com.example.jlpt.model.Chapter;
import com.example.jlpt.model.Lesson;
import com.example.jlpt.repository.ChapterRepository;
import com.example.jlpt.repository.LessonRepository;
import com.example.jlpt.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class QuizController {

    @Autowired
    private ChapterRepository chapterRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private QuizService quizService;

    @GetMapping("/quiz")
    public String quiz(Model model) {
        List<Chapter> chapters = chapterRepository.findAll();
        
        // Thêm số câu hỏi thực tế cho mỗi lesson
        for (Chapter chapter : chapters) {
            if (chapter.getLessons() != null) {
                for (Lesson lesson : chapter.getLessons()) {
                    Long questionCount = quizService.countQuestionsByLessonId(lesson.getId());
                    lesson.setDescription(questionCount + " câu"); // Tạm thời dùng description để hiển thị
                }
            }
        }
        
        model.addAttribute("chapters", chapters);
        model.addAttribute("pageTitle", "Luyện tập");
        return "quiz";
    }
    
    @GetMapping("/quiz-preview")
    public String quizPreview(@RequestParam String type, @RequestParam Integer id, Model model) {
        model.addAttribute("pageTitle", "Thông tin bài luyện tập");
        model.addAttribute("quizType", type);
        model.addAttribute("quizId", id);
        return "quiz-preview";
    }
    
    @GetMapping("/quiz-practice")
    public String quizPractice(Model model) {
        model.addAttribute("pageTitle", "Làm bài luyện tập");
        return "quiz-practice";
    }
    
    @GetMapping("/quiz-history")
    public String quizHistory(Model model) {
        model.addAttribute("pageTitle", "Lịch sử làm bài");
        return "quiz-history";
    }
    
    @GetMapping("/quiz-history/{attemptId}")
    public String quizHistoryDetail(@PathVariable Integer attemptId, Model model) {
        model.addAttribute("pageTitle", "Chi tiết bài làm");
        return "quiz-history-detail";
    }
    
    // API để lấy câu hỏi theo lesson
    @GetMapping("/api/quiz/lesson/{lessonId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getQuizByLesson(@PathVariable Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<Map<String, Object>> questions = quizService.getQuizByLessonId(lessonId);
        Long totalQuestions = quizService.countQuestionsByLessonId(lessonId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("lessonId", lessonId);
        response.put("lessonName", lesson.getName());
        response.put("totalQuestions", totalQuestions);
        response.put("questions", questions);
        
        return ResponseEntity.ok(response);
    }
    
    // API để lấy câu hỏi theo chapter
    @GetMapping("/api/quiz/chapter/{chapterId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getQuizByChapter(@PathVariable Integer chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
        if (chapter == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<Map<String, Object>> questions = quizService.getQuizByChapterId(chapterId);
        Long totalQuestions = quizService.countQuestionsByChapterId(chapterId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("chapterId", chapterId);
        response.put("chapterName", chapter.getName());
        response.put("totalQuestions", totalQuestions);
        response.put("questions", questions);
        
        return ResponseEntity.ok(response);
    }
}
