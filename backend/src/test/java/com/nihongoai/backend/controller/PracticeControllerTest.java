package com.nihongoai.backend.controller;

import com.nihongoai.backend.ai.EvaluationResultDto;
import com.nihongoai.backend.ai.PracticeQuestionDto;
import com.nihongoai.backend.dto.PracticeEvaluateRequestDto;
import com.nihongoai.backend.practice.PracticeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class PracticeControllerTest {

    private PracticeService practiceService;
    private PracticeController controller;

    @BeforeEach
    void setUp() {
        practiceService = Mockito.mock(PracticeService.class);
        controller = new PracticeController(practiceService);
    }

    @Test
    @DisplayName("Generate practice calls practice service with JLPT level")
    void testGeneratePractice() {
        PracticeQuestionDto mockDto = new PracticeQuestionDto(
                "Tôi đã từng ăn món này",
                "この料理を食べたことがあります。",
                List.of("食べる"),
                List.of("～たことがある"),
                "N5"
        );
        when(practiceService.generatePractice("N5")).thenReturn(mockDto);

        ResponseEntity<PracticeQuestionDto> response = controller.generatePractice("N5");
        assertNotNull(response.getBody());
        assertEquals("N5", response.getBody().difficulty());
        assertEquals("Tôi đã từng ăn món này", response.getBody().sentenceVi());
    }

    @Test
    @DisplayName("Evaluate practice forwards typed DTO parameters to practice service")
    void testEvaluatePracticeWithDto() {
        EvaluationResultDto mockEval = new EvaluationResultDto(
                true, 90, 95, 90, 85,
                "友達とこの映画を見たことがあります。",
                "Rất tốt!"
        );
        when(practiceService.evaluatePractice(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(mockEval);

        PracticeEvaluateRequestDto request = new PracticeEvaluateRequestDto(
                "Tôi đã từng xem phim",
                "映画を見たことがあります。",
                "映画を見たことがあります。",
                List.of("映画", "見る"),
                List.of("～たことがある"),
                "N4"
        );

        ResponseEntity<EvaluationResultDto> response = controller.evaluatePractice(request);
        assertNotNull(response.getBody());
        assertTrue(response.getBody().correct());
        assertEquals(90, response.getBody().score());
    }
}
