package com.nihongoai.backend.controller;

import com.nihongoai.backend.ai.EvaluationResultDto;
import com.nihongoai.backend.ai.PracticeQuestionDto;
import com.nihongoai.backend.dto.PracticeEvaluateRequestDto;
import com.nihongoai.backend.practice.PracticeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<EvaluationResultDto> evaluatePractice(@Valid @RequestBody PracticeEvaluateRequestDto request) {
        EvaluationResultDto result = practiceService.evaluatePractice(
                request.sentenceVi(),
                request.exampleAnswerJa(),
                request.userAnswer(),
                request.getEffectiveDifficulty()
        );
        return ResponseEntity.ok(result);
    }
}
