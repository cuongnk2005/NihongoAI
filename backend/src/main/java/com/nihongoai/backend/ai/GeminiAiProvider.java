package com.nihongoai.backend.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nihongoai.backend.repository.SystemSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class GeminiAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiProvider.class);
    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final LocalMockAiProvider fallbackMockProvider;
    private final SystemSettingRepository settingRepository;

    @Value("${ai.gemini.api-key:}")
    private String configuredApiKey;

    @Value("${ai.gemini.model:gemini-1.5-flash}")
    private String configuredModel;

    public GeminiAiProvider(
            ObjectMapper objectMapper,
            LocalMockAiProvider fallbackMockProvider,
            SystemSettingRepository settingRepository
    ) {
        this.restClient = RestClient.builder().build();
        this.objectMapper = objectMapper;
        this.fallbackMockProvider = fallbackMockProvider;
        this.settingRepository = settingRepository;
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public PracticeQuestionDto generateExercise(List<String> targetVocab, List<String> targetGrammar, String level) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Gemini API key is not configured. Falling back to LocalMockAiProvider for exercise generation.");
            return fallbackMockProvider.generateExercise(targetVocab, targetGrammar, level);
        }

        String prompt = buildExercisePrompt(targetVocab, targetGrammar, level);
        try {
            String jsonText = callGemini(prompt, apiKey);
            JsonNode root = objectMapper.readTree(jsonText);

            String sentenceVi = root.path("sentenceVi").asText("Tôi đã từng xem bộ phim này cùng với bạn bè.");
            String exampleAnswerJa = root.path("exampleAnswerJa").asText("友達とこの映画を見たことがあります。");
            String difficulty = root.path("difficulty").asText(level != null ? level : "N4");

            List<String> vocabs = new ArrayList<>();
            if (root.has("targetVocabulary") && root.get("targetVocabulary").isArray()) {
                root.get("targetVocabulary").forEach(node -> vocabs.add(node.asText()));
            } else {
                vocabs.addAll(targetVocab);
            }

            List<String> grammars = new ArrayList<>();
            if (root.has("targetGrammar") && root.get("targetGrammar").isArray()) {
                root.get("targetGrammar").forEach(node -> grammars.add(node.asText()));
            } else {
                grammars.addAll(targetGrammar);
            }

            return new PracticeQuestionDto(sentenceVi, exampleAnswerJa, vocabs, grammars, difficulty);
        } catch (Exception e) {
            log.warn("Gemini generateExercise failed ({}: {}). Gracefully falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.generateExercise(targetVocab, targetGrammar, level);
        }
    }

    @Override
    public EvaluationResultDto evaluateAnswer(String sentenceVi, String exampleJa, String userAnswer, String level) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Gemini API key is not configured. Falling back to LocalMockAiProvider for answer evaluation.");
            return fallbackMockProvider.evaluateAnswer(sentenceVi, exampleJa, userAnswer, level);
        }

        String prompt = buildEvaluationPrompt(sentenceVi, exampleJa, userAnswer, level);
        try {
            String jsonText = callGemini(prompt, apiKey);
            JsonNode root = objectMapper.readTree(jsonText);

            boolean correct = root.path("correct").asBoolean(true);
            int score = root.path("score").asInt(85);
            int meaningScore = root.path("meaningScore").asInt(90);
            int grammarScore = root.path("grammarScore").asInt(85);
            int naturalnessScore = root.path("naturalnessScore").asInt(80);
            String suggestedAnswer = root.path("suggestedAnswer").asText(exampleJa != null ? exampleJa : "");
            String explanationVi = root.path("explanationVi").asText("Câu trả lời của bạn tốt.");

            return new EvaluationResultDto(
                    correct,
                    score,
                    meaningScore,
                    grammarScore,
                    naturalnessScore,
                    suggestedAnswer,
                    explanationVi
            );
        } catch (Exception e) {
            log.warn("Gemini evaluateAnswer failed ({}: {}). Gracefully falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.evaluateAnswer(sentenceVi, exampleJa, userAnswer, level);
        }
    }

    @Override
    public KaiwaResponseDto chatKaiwa(String userMessage, String level) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Gemini API key is not configured. Falling back to LocalMockAiProvider for Kaiwa.");
            return fallbackMockProvider.chatKaiwa(userMessage, level);
        }

        String prompt = buildKaiwaPrompt(userMessage, level);
        try {
            String jsonText = callGemini(prompt, apiKey);
            JsonNode root = objectMapper.readTree(jsonText);

            String aiReply = root.path("aiReply").asText("こんにちは！お元気ですか？");
            String correctionVi = root.path("correctionVi").asText("Câu trả lời của bạn chuẩn ngữ pháp.");

            return new KaiwaResponseDto(aiReply, correctionVi);
        } catch (Exception e) {
            log.warn("Gemini chatKaiwa failed ({}: {}). Gracefully falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.chatKaiwa(userMessage, level);
        }
    }

    private String callGemini(String prompt, String apiKey) throws JsonProcessingException {
        String model = resolveModel();
        String url = GEMINI_API_BASE + model + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "response_mime_type", "application/json"
                )
        );

        String rawResponse = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        JsonNode responseNode = objectMapper.readTree(rawResponse);
        JsonNode candidates = responseNode.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
            return textNode.asText("{}");
        }

        return "{}";
    }

    private String buildExercisePrompt(List<String> targetVocab, List<String> targetGrammar, String level) {
        return """
                You are a professional Japanese language learning assistant.
                Task: Generate a Vietnamese sentence for Japanese translation practice at JLPT %s level.
                Target Vocabulary: %s
                Target Grammar: %s
                Output MUST be strict JSON with this exact schema:
                {
                  "sentenceVi": "Vietnamese prompt sentence",
                  "exampleAnswerJa": "Expected natural Japanese translation",
                  "targetVocabulary": ["vocabulary1", "vocabulary2"],
                  "targetGrammar": ["grammarPattern"],
                  "difficulty": "%s"
                }
                """.formatted(level, String.join(", ", targetVocab), String.join(", ", targetGrammar), level);
    }

    private String buildEvaluationPrompt(String sentenceVi, String exampleJa, String userAnswer, String level) {
        return """
                You are a professional Japanese language tutor.
                Task: Evaluate the learner's Japanese answer compared to the intended Vietnamese sentence.
                Level: %s
                Vietnamese sentence: %s
                Example correct Japanese sentence: %s
                Learner's answer: %s

                Do NOT evaluate using literal string equality. Multiple natural expressions may be valid.
                Check semantic meaning, grammar correctness, naturalness, and politeness.
                Provide feedback and explanation in Vietnamese.
                Output MUST be strict JSON with this exact schema:
                {
                  "correct": true or false,
                  "score": number between 0 and 100,
                  "meaningScore": number between 0 and 100,
                  "grammarScore": number between 0 and 100,
                  "naturalnessScore": number between 0 and 100,
                  "suggestedAnswer": "Most natural Japanese sentence",
                  "explanationVi": "Clear explanation in Vietnamese analyzing grammar and points of improvement"
                }
                """.formatted(level, sentenceVi, exampleJa != null ? exampleJa : "", userAnswer);
    }

    private String buildKaiwaPrompt(String userMessage, String level) {
        return """
                You are a friendly Japanese conversational partner (Kaiwa bot) chatting with a JLPT %s student.
                The learner's Japanese message is: "%s"

                Respond naturally in Japanese appropriate to JLPT %s level.
                Also provide a supportive explanation or correction in Vietnamese if they made any grammar/word choice mistakes.
                Output MUST be strict JSON with this exact schema:
                {
                  "aiReply": "Natural Japanese response to continue the conversation",
                  "correctionVi": "Feedback or suggestions in Vietnamese for the learner"
                }
                """.formatted(level, userMessage, level);
    }

    private String resolveApiKey() {
        return settingRepository.findById("ai.gemini.api-key")
                .map(setting -> setting.getSettingValue() != null && !setting.getSettingValue().isBlank() 
                        ? setting.getSettingValue() : configuredApiKey)
                .orElse(configuredApiKey);
    }

    private String resolveModel() {
        return settingRepository.findById("ai.gemini.model")
                .map(setting -> setting.getSettingValue() != null && !setting.getSettingValue().isBlank()
                        ? setting.getSettingValue() : configuredModel)
                .orElse(configuredModel);
    }
}
