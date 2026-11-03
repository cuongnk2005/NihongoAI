package com.nihongoai.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nihongoai.backend.entity.SystemSettingEntity;
import com.nihongoai.backend.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class GeminiAiProviderTest {

    private SystemSettingRepository settingRepository;
    private LocalMockAiProvider mockProvider;
    private GeminiAiProvider geminiProvider;
    private OpenAiCompatibleAiProvider openAiProvider;
    private AiProviderFactory factory;

    @BeforeEach
    void setUp() {
        settingRepository = Mockito.mock(SystemSettingRepository.class);
        mockProvider = new LocalMockAiProvider();
        geminiProvider = new GeminiAiProvider(new ObjectMapper(), mockProvider, settingRepository);
        openAiProvider = new OpenAiCompatibleAiProvider(new ObjectMapper(), mockProvider, settingRepository);
        factory = new AiProviderFactory(mockProvider, geminiProvider, openAiProvider, settingRepository);
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
    @DisplayName("AiProviderFactory dynamically routes between Gemini, FreeLLMAPI, and Mock based on system setting")
    void testFactoryRouting() {
        when(settingRepository.findById("ai.provider")).thenReturn(Optional.of(
                new SystemSettingEntity("ai.provider", "gemini")
        ));
        assertEquals("gemini", factory.getProvider().getProviderName());

        when(settingRepository.findById("ai.provider")).thenReturn(Optional.of(
                new SystemSettingEntity("ai.provider", "freellmapi")
        ));
        assertEquals("freellmapi", factory.getProvider().getProviderName());

        when(settingRepository.findById("ai.provider")).thenReturn(Optional.of(
                new SystemSettingEntity("ai.provider", "mock")
        ));
        assertEquals("local-mock", factory.getProvider().getProviderName());
    }

    @Test
    @DisplayName("GeminiAiProvider parses multiple keys correctly from repository setting")
    void testResolveMultipleKeys() {
        when(settingRepository.findById("ai.gemini.api-keys")).thenReturn(Optional.of(
                new SystemSettingEntity("ai.gemini.api-keys", "key1, key2; key3\nkey4")
        ));

        List<String> keys = geminiProvider.resolveApiKeys();
        assertEquals(4, keys.size());
        assertEquals("key1", keys.get(0));
        assertEquals("key2", keys.get(1));
        assertEquals("key3", keys.get(2));
        assertEquals("key4", keys.get(3));
    }
}
