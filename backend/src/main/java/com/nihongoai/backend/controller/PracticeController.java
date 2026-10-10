package com.nihongoai.backend.controller;

import com.nihongoai.backend.ai.EvaluationResultDto;
import com.nihongoai.backend.ai.PracticeQuestionDto;
import com.nihongoai.backend.practice.PracticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    @PostMapping("/generate")
    public ResponseEntity<PracticeQuestionDto> generatePractice(@RequestParam(defaultValue = "N4") String level) {
        return ResponseEntity.ok(practiceService.generatePractice(level));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<EvaluationResultDto> evaluatePractice(@RequestBody Map<String, Object> body) {
        String userAnswer = body.getOrDefault("userAnswer", body.getOrDefault("learnerAnswerJa", "")).toString();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> questionMap = (Map<String, Object>) body.get("question");

        String sentenceVi = body.getOrDefault("sentenceVi", "").toString();
        String exampleJa = body.getOrDefault("exampleAnswerJa", "").toString();
        String level = body.getOrDefault("difficulty", "N4").toString();

        if (questionMap != null) {
            sentenceVi = questionMap.getOrDefault("sentenceVi", sentenceVi).toString();
            exampleJa = questionMap.getOrDefault("exampleAnswerJa", exampleJa).toString();
            level = questionMap.getOrDefault("difficulty", level).toString();
        }

        EvaluationResultDto result = practiceService.evaluatePractice(sentenceVi, exampleJa, userAnswer, level);
        return ResponseEntity.ok(result);
    }
}
