package com.nihongoai.backend.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nihongoai.backend.repository.SystemSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * OpenAI-compatible AI Provider supporting:
 * - FreeLLMAPI (https://github.com/tashfeenahmed/freellmapi) giving access to 7.4 billion free tokens/month across 34 providers & 635 models.
 * - Standard OpenAI, DeepSeek, OpenRouter, Groq, Ollama, and custom /v1 endpoints.
 */
@Component
public class OpenAiCompatibleAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleAiProvider.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final LocalMockAiProvider fallbackMockProvider;
    private final SystemSettingRepository settingRepository;

    @Value("${ai.freellmapi.base-url:http://localhost:3001/v1}")
    private String configuredBaseUrl;

    @Value("${ai.freellmapi.api-key:}")
    private String configuredApiKey;

    @Value("${ai.freellmapi.model:gemini-2.0-flash}")
    private String configuredModel;

    public OpenAiCompatibleAiProvider(
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
        return "freellmapi";
    }

    @Override
    public PracticeQuestionDto generateExercise(List<String> targetVocab, List<String> targetGrammar, String level) {
        String prompt = buildExercisePrompt(targetVocab, targetGrammar, level);
        try {
            String jsonText = callOpenAiCompatible(prompt);
            JsonNode root = objectMapper.readTree(cleanJson(jsonText));

            String sentenceVi = root.path("sentenceVi").asText("Tôi đã từng xem bộ phim này cùng với bạn bè.");
            String exampleAnswerJa = root.path("exampleAnswerJa").asText("友達とこの映画を見たことがあります。");
            String difficulty = root.path("difficulty").asText(level != null ? level : "N4");
            String hintVi = root.has("hintVi") && !root.get("hintVi").isNull() ? root.path("hintVi").asText() : null;

            List<String> vocabs = new ArrayList<>();
            if (root.has("targetVocabulary") && root.get("targetVocabulary").isArray()) {
                root.get("targetVocabulary").forEach(node -> vocabs.add(node.asText()));
            } else if (targetVocab != null) {
                vocabs.addAll(targetVocab);
            }

            List<String> grammars = new ArrayList<>();
            if (root.has("targetGrammar") && root.get("targetGrammar").isArray()) {
                root.get("targetGrammar").forEach(node -> grammars.add(node.asText()));
            } else if (targetGrammar != null) {
                grammars.addAll(targetGrammar);
            }

            return new PracticeQuestionDto(sentenceVi, exampleAnswerJa, vocabs, grammars, difficulty, hintVi);
        } catch (Exception e) {
            log.warn("FreeLLMAPI generateExercise failed ({}: {}). Falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.generateExercise(targetVocab, targetGrammar, level);
        }
    }

    @Override
    public EvaluationResultDto evaluateAnswer(String sentenceVi, String exampleJa, String userAnswer, String level) {
        String prompt = buildEvaluationPrompt(sentenceVi, exampleJa, userAnswer, level);
        try {
            String jsonText = callOpenAiCompatible(prompt);
            JsonNode root = objectMapper.readTree(cleanJson(jsonText));

            boolean correct = root.path("correct").asBoolean(true);
            int score = root.path("score").asInt(85);
            int meaningScore = root.path("meaningScore").asInt(90);
            int grammarScore = root.path("grammarScore").asInt(85);
            int naturalnessScore = root.path("naturalnessScore").asInt(80);
            String suggestedAnswer = root.path("suggestedAnswer").asText(exampleJa != null ? exampleJa : "");
            String explanationVi = root.path("explanationVi").asText("Câu trả lời của bạn tốt.");

            List<String> grammarErrors = new ArrayList<>();
            if (root.has("grammarErrors") && root.get("grammarErrors").isArray()) {
                root.get("grammarErrors").forEach(node -> grammarErrors.add(node.asText()));
            }

            List<String> vocabularyErrors = new ArrayList<>();
            if (root.has("vocabularyErrors") && root.get("vocabularyErrors").isArray()) {
                root.get("vocabularyErrors").forEach(node -> vocabularyErrors.add(node.asText()));
            }

            return new EvaluationResultDto(
                    correct,
                    score,
                    meaningScore,
                    grammarScore,
                    naturalnessScore,
                    grammarErrors,
                    vocabularyErrors,
                    suggestedAnswer,
                    explanationVi
            );
        } catch (Exception e) {
            log.warn("FreeLLMAPI evaluateAnswer failed ({}: {}). Falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.evaluateAnswer(sentenceVi, exampleJa, userAnswer, level);
        }
    }

    @Override
    public KaiwaResponseDto chatKaiwa(String userMessage, String level) {
        String prompt = buildKaiwaPrompt(userMessage, level);
        try {
            String jsonText = callOpenAiCompatible(prompt);
            JsonNode root = objectMapper.readTree(cleanJson(jsonText));

            String aiReply = root.path("aiReply").asText("こんにちは！お元気ですか？");
            String correctionVi = root.path("correctionVi").asText("Câu trả lời của bạn chuẩn ngữ pháp.");

            return new KaiwaResponseDto(aiReply, correctionVi);
        } catch (Exception e) {
            log.warn("FreeLLMAPI chatKaiwa failed ({}: {}). Falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.chatKaiwa(userMessage, level);
        }
    }

    private String callOpenAiCompatible(String prompt) throws JsonProcessingException {
        String endpointUrl = resolveChatEndpoint();
        String apiKey = resolveApiKey();
        String model = resolveModel();

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a professional Japanese tutor. You must ALWAYS output valid, strict JSON ONLY. No markdown formatting, no conversational filler, no code fences."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3
        );

        RestClient.RequestBodySpec requestSpec = restClient.post()
                .uri(endpointUrl)
                .contentType(MediaType.APPLICATION_JSON);

        if (apiKey != null && !apiKey.isBlank()) {
            requestSpec.header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
        }

        String rawResponse = requestSpec
                .body(requestBody)
                .retrieve()
                .body(String.class);

        JsonNode responseNode = objectMapper.readTree(rawResponse);
        JsonNode choices = responseNode.path("choices");
        if (choices.isArray() && !choices.isEmpty()) {
            JsonNode message = choices.get(0).path("message");
            if (message.has("content")) {
                return message.path("content").asText("{}");
            }
        }

        return "{}";
    }

    private String cleanJson(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
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
                  "targetVocabulary": ["vocabulary1 (reading)", "vocabulary2 (reading)"],
                  "targetGrammar": ["grammarPattern"],
                  "difficulty": "%s",
                  "hintVi": "Short grammar/structure hint in Vietnamese"
                }
                """.formatted(
                        level,
                        (targetVocab != null && !targetVocab.isEmpty()) ? String.join(", ", targetVocab) : "từ vựng phù hợp cấp " + level,
                        (targetGrammar != null && !targetGrammar.isEmpty()) ? String.join(", ", targetGrammar) : "ngữ pháp phù hợp cấp " + level,
                        level
                );
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
                  "grammarErrors": ["specific grammar issue in Vietnamese if any"],
                  "vocabularyErrors": ["specific vocabulary issue in Vietnamese if any"],
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

    private String resolveChatEndpoint() {
        String env = System.getenv("FREELLMAPI_BASE_URL");
        if (env == null || env.isBlank()) env = System.getProperty("FREELLMAPI_BASE_URL");
        if (env != null && !env.isBlank()) {
            String base = env.trim();
            if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
            if (base.endsWith("/chat/completions")) return base;
            if (base.endsWith("/v1")) return base + "/chat/completions";
            return base + "/v1/chat/completions";
        }

        String base = settingRepository.findById("ai.freellmapi.base-url")
                .map(setting -> setting.getSettingValue() != null && !setting.getSettingValue().isBlank()
                        ? setting.getSettingValue() : configuredBaseUrl)
                .orElse(configuredBaseUrl)
                .trim();

        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }

        if (base.endsWith("/chat/completions")) {
            return base;
        }
        if (base.endsWith("/v1")) {
            return base + "/chat/completions";
        }
        return base + "/v1/chat/completions";
    }

    private String resolveApiKey() {
        String env = System.getenv("FREELLMAPI_API_KEY");
        if (env != null && !env.isBlank()) return env;
        String prop = System.getProperty("FREELLMAPI_API_KEY");
        if (prop != null && !prop.isBlank()) return prop;

        return settingRepository.findById("ai.freellmapi.api-key")
                .map(setting -> setting.getSettingValue() != null && !setting.getSettingValue().isBlank() 
                        ? setting.getSettingValue() : configuredApiKey)
                .orElse(configuredApiKey);
    }

    private String resolveModel() {
        String env = System.getenv("FREELLMAPI_MODEL");
        if (env != null && !env.isBlank()) return env;
        String prop = System.getProperty("FREELLMAPI_MODEL");
        if (prop != null && !prop.isBlank()) return prop;

        return settingRepository.findById("ai.freellmapi.model")
                .map(setting -> setting.getSettingValue() != null && !setting.getSettingValue().isBlank() 
                        ? setting.getSettingValue() : configuredModel)
                .orElse(configuredModel);
    }
}

