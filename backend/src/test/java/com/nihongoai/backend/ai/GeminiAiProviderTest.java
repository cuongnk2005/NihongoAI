package com.nihongoai.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nihongoai.backend.entity.SystemSettingEntity;
import com.nihongoai.backend.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class GeminiAiProviderTest {

    private SystemSettingRepository settingRepository;
    private LocalMockAiProvider mockProvider;
    private GeminiAiProvider geminiProvider;
    private AiProviderFactory factory;

    @BeforeEach
    void setUp() {
        settingRepository = Mockito.mock(SystemSettingRepository.class);
        mockProvider = new LocalMockAiProvider();
        geminiProvider = new GeminiAiProvider(new ObjectMapper(), mockProvider, settingRepository);
        factory = new AiProviderFactory(mockProvider, geminiProvider, settingRepository);
    }

    @Test
    @DisplayName("GeminiAiProvider without API key falls back gracefully to LocalMockAiProvider")
    void testFallbackWhenApiKeyEmpty() {
        when(settingRepository.findById("ai.gemini.api-key")).thenReturn(Optional.empty());

        PracticeQuestionDto question = geminiProvider.generateExercise(
                List.of("食べる"), List.of("～たことがある"), "N5"
        );

        assertNotNull(question);
        assertNotNull(question.sentenceVi());
        assertNotNull(question.exampleAnswerJa());
        assertEquals("N5", question.difficulty());
    }

    @Test
    @DisplayName("GeminiAiProvider evaluation fallback provides Vietnamese explanation")
    void testEvaluationFallback() {
        when(settingRepository.findById("ai.gemini.api-key")).thenReturn(Optional.empty());

        EvaluationResultDto result = geminiProvider.evaluateAnswer(
                "Tôi đã từng ăn món này",
                "この料理を食べたことがあります。",
                "この料理を食べたことがあります。",
                "N5"
        );

        assertNotNull(result);
        assertTrue(result.correct());
        assertTrue(result.score() >= 80);
        assertNotNull(result.explanationVi());
    }

    @Test
    @DisplayName("AiProviderFactory dynamically routes between Gemini and Mock based on system setting")
    void testFactoryRouting() {
        when(settingRepository.findById("ai.provider")).thenReturn(Optional.of(
                new SystemSettingEntity("ai.provider", "gemini")
        ));
        assertEquals("gemini", factory.getProvider().getProviderName());

        when(settingRepository.findById("ai.provider")).thenReturn(Optional.of(
                new SystemSettingEntity("ai.provider", "mock")
        ));
        assertEquals("local-mock", factory.getProvider().getProviderName());
    }
}
