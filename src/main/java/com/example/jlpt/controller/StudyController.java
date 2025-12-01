package com.example.jlpt.controller;

import com.example.jlpt.model.Chapter;
import com.example.jlpt.model.Flashcard;
import com.example.jlpt.model.Lesson;
import com.example.jlpt.repository.ChapterRepository;
import com.example.jlpt.repository.FlashcardRepository;
import com.example.jlpt.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
public class StudyController {

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private FlashcardRepository flashcardRepository;

    @GetMapping("/study")
    public String study(Model model) {
        List<Chapter> chapters = chapterRepository.findAll();
        model.addAttribute("chapters", chapters);
        model.addAttribute("pageTitle", "Học tập");
        return "study";
    }

    @GetMapping("/study/lesson/{id}")
    public String studyLesson(@PathVariable Integer id, Model model) {
        Lesson lesson = lessonRepository.findById(id).orElse(null);
        if (lesson == null) {
            return "redirect:/study";
        }

        List<Flashcard> flashcards = flashcardRepository.findByLessonId(id);
        model.addAttribute("lesson", lesson);
        model.addAttribute("flashcards", flashcards);
        model.addAttribute("pageTitle", "Học tập - " + lesson.getName());
        return "study-flashcard";
    }
}
