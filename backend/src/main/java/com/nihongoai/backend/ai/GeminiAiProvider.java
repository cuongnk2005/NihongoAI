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
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class GeminiAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiProvider.class);
    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final LocalMockAiProvider fallbackMockProvider;
    private final SystemSettingRepository settingRepository;
    private final AtomicInteger keyIndexCounter = new AtomicInteger(0);

    @Value("${ai.gemini.api-key:}")
    private String configuredApiKey;

    @Value("${ai.gemini.api-keys:}")
    private String configuredApiKeys;

    @Value("${ai.gemini.model:gemini-3.5-flash-lite}")
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
        List<String> apiKeys = resolveApiKeys();
        if (apiKeys.isEmpty()) {
            log.info("No Gemini API keys configured. Falling back to LocalMockAiProvider for exercise generation.");
            return fallbackMockProvider.generateExercise(targetVocab, targetGrammar, level);
        }

        String prompt = buildExercisePrompt(targetVocab, targetGrammar, level);
        try {
            String jsonText = callGemini(prompt, 0.7);
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
            log.warn("Gemini generateExercise failed ({}: {}). Gracefully falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.generateExercise(targetVocab, targetGrammar, level);
        }
    }

    @Override
    public EvaluationResultDto evaluateAnswer(String sentenceVi, String exampleJa, String userAnswer, String level) {
        List<String> apiKeys = resolveApiKeys();
        if (apiKeys.isEmpty()) {
            log.info("No Gemini API keys configured. Falling back to LocalMockAiProvider for answer evaluation.");
            return fallbackMockProvider.evaluateAnswer(sentenceVi, exampleJa, userAnswer, level);
        }

        String prompt = buildEvaluationPrompt(sentenceVi, exampleJa, userAnswer, level);
        try {
            String jsonText = callGemini(prompt, 0.2);
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
            log.warn("Gemini evaluateAnswer failed ({}: {}). Gracefully falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.evaluateAnswer(sentenceVi, exampleJa, userAnswer, level);
        }
    }

    @Override
    public KaiwaResponseDto chatKaiwa(String userMessage, String level) {
        List<String> apiKeys = resolveApiKeys();
        if (apiKeys.isEmpty()) {
            log.info("No Gemini API keys configured. Falling back to LocalMockAiProvider for Kaiwa.");
            return fallbackMockProvider.chatKaiwa(userMessage, level);
        }

        String prompt = buildKaiwaPrompt(userMessage, level);
        try {
            String jsonText = callGemini(prompt, 0.6);
            JsonNode root = objectMapper.readTree(cleanJson(jsonText));

            String aiReply = root.path("aiReply").asText("こんにちは！お元気ですか？");
            String correctionVi = root.path("correctionVi").asText("Câu trả lời của bạn chuẩn ngữ pháp.");

            return new KaiwaResponseDto(aiReply, correctionVi);
        } catch (Exception e) {
            log.warn("Gemini chatKaiwa failed ({}: {}). Gracefully falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.chatKaiwa(userMessage, level);
        }
    }

    @Override
    public KanjiLookupDto lookupKanji(String word) {
        List<String> apiKeys = resolveApiKeys();
        if (apiKeys.isEmpty()) {
            log.info("No Gemini API keys configured. Falling back to LocalMockAiProvider for Kanji lookup.");
            return fallbackMockProvider.lookupKanji(word);
        }

        String prompt = buildKanjiLookupPrompt(word);
        try {
            String jsonText = callGemini(prompt, 0.2);
            JsonNode root = objectMapper.readTree(cleanJson(jsonText));

            String resWord = root.path("word").asText(word);
            String reading = root.path("reading").asText(word);
            String sinoVietnamese = root.path("sinoVietnamese").asText("---");
            String meaningVi = root.path("meaningVi").asText("Từ vựng tiếng Nhật: " + word);
            String jlptLevel = root.path("jlptLevel").asText("N4");

            List<KanjiLookupDto.KanjiDetailDto> kanjiList = new ArrayList<>();
            if (root.has("kanjiList") && root.get("kanjiList").isArray()) {
                for (JsonNode kNode : root.get("kanjiList")) {
                    kanjiList.add(new KanjiLookupDto.KanjiDetailDto(
                            kNode.path("char").asText(""),
                            kNode.path("sino").asText("---"),
                            kNode.path("meaning").asText("")
                    ));
                }
            }

            return new KanjiLookupDto(resWord, reading, sinoVietnamese, meaningVi, jlptLevel, kanjiList);
        } catch (Exception e) {
            log.warn("Gemini lookupKanji failed ({}: {}). Falling back to LocalMockAiProvider.",
                    e.getClass().getSimpleName(), e.getMessage());
            return fallbackMockProvider.lookupKanji(word);
        }
    }

    private String buildKanjiLookupPrompt(String word) {
        return """
                You are a professional Japanese linguist and Sino-Vietnamese (Hán Việt) lexicographer.
                Task: Analyze the Japanese word or Kanji: "%s"

                Provide:
                1. word: exact Japanese word or Kanji (e.g. 掃除)
                2. reading: Hiragana reading (e.g. そうじ)
                3. sinoVietnamese: Sino-Vietnamese reading in UPPERCASE (e.g. TẢO TRỪ)
                4. meaningVi: Concise, natural Vietnamese meaning
                5. jlptLevel: JLPT level (N5, N4, N3, N2, or N1)
                6. kanjiList: breakdown of each Kanji character with:
                   - char: single Kanji (e.g. 掃)
                   - sino: Sino-Vietnamese reading in UPPERCASE (e.g. TẢO)
                   - meaning: concise meaning in Vietnamese

                Output MUST be strict JSON with this exact schema:
                {
                  "word": "...",
                  "reading": "...",
                  "sinoVietnamese": "...",
                  "meaningVi": "...",
                  "jlptLevel": "...",
                  "kanjiList": [
                    { "char": "...", "sino": "...", "meaning": "..." }
                  ]
                }
                """.formatted(word);
    }

    /**
     * Executes the Gemini call with Round-Robin key rotation and automatic failover across the key pool.
     */
    private String callGemini(String prompt, double temperature) throws JsonProcessingException {
        List<String> keys = resolveApiKeys();
        if (keys.isEmpty()) {
            throw new IllegalStateException("No Gemini API keys available");
        }

        String model = resolveModel();
        int totalKeys = keys.size();
        int startIndex = Math.abs(keyIndexCounter.getAndIncrement() % totalKeys);

        Exception lastException = null;

        for (int attempt = 0; attempt < totalKeys; attempt++) {
            int currentIdx = (startIndex + attempt) % totalKeys;
            String apiKey = keys.get(currentIdx);
            String maskedKey = maskKey(apiKey);

            String url = GEMINI_API_BASE + model + ":generateContent?key=" + apiKey;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    ),
                    "generationConfig", Map.of(
                            "temperature", temperature,
                            "response_mime_type", "application/json"
                    )
            );

            try {
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
            } catch (Exception e) {
                lastException = e;
                log.warn("Gemini API key [{}] (pool index {}/{}) failed: {}. Attempting failover to next key in pool...",
                        maskedKey, currentIdx + 1, totalKeys, e.getMessage());
            }
        }

        throw new RuntimeException("All " + totalKeys + " Gemini API keys in pool failed or exhausted.", lastException);
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "***";
        return key.substring(0, 6) + "..." + key.substring(key.length() - 3);
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
        String vocabHint = (targetVocab != null && !targetVocab.isEmpty())
                ? "Optional vocabulary suggestions (feel free to choose other common " + level + " words if suitable): " + String.join(", ", targetVocab)
                : "Choose common, natural " + level + " vocabulary.";

        String grammarHint = (targetGrammar != null && !targetGrammar.isEmpty())
                ? "Optional grammar suggestions (or other core " + level + " grammar): " + String.join(", ", targetGrammar)
                : "Choose core " + level + " grammar patterns.";

        return """
                You are a professional Japanese language tutor.
                Task: Generate a UNIQUE, fresh, and engaging Vietnamese sentence for Japanese translation practice at JLPT %s level.
                Vary the scenario every single time (e.g. workplace, university, dining, public transit, weather, shopping, weekend plans, healthcare).
                Do NOT repeat the movie-watching scenario.
                %s
                %s
                Output MUST be strict JSON with this exact schema:
                {
                  "sentenceVi": "Vietnamese sentence to translate",
                  "exampleAnswerJa": "Natural, standard Japanese translation",
                  "targetVocabulary": ["vocabulary1 (hiragana)", "vocabulary2 (hiragana)"],
                  "targetGrammar": ["grammarPattern"],
                  "difficulty": "%s",
                  "hintVi": "Short helpful tip in Vietnamese on key grammar structure or particle"
                }
                """.formatted(level, vocabHint, grammarHint, level);
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

    public List<String> resolveApiKeys() {
        // 1. Check GEMINI_API_KEYS (comma or semicolon separated list)
        String envList = System.getenv("GEMINI_API_KEYS");
        if (envList != null && !envList.isBlank()) {
            return parseKeyList(envList);
        }

        String propList = System.getProperty("GEMINI_API_KEYS");
        if (propList != null && !propList.isBlank()) {
            return parseKeyList(propList);
        }

        // 2. Check setting repository for multiple keys
        Optional<String> repoList = settingRepository.findById("ai.gemini.api-keys")
                .map(setting -> setting.getSettingValue())
                .filter(val -> val != null && !val.isBlank());
        if (repoList.isPresent()) {
            return parseKeyList(repoList.get());
        }

        // 3. Check configuredApiKeys property from application.yml
        if (configuredApiKeys != null && !configuredApiKeys.isBlank()) {
            return parseKeyList(configuredApiKeys);
        }

        // 4. Fallback to single key GEMINI_API_KEY
        String single = resolveSingleApiKey();
        if (single != null && !single.isBlank()) {
            return List.of(single);
        }

        return List.of();
    }

    private String resolveSingleApiKey() {
        String env = System.getenv("GEMINI_API_KEY");
        if (env != null && !env.isBlank()) return env;
        String prop = System.getProperty("GEMINI_API_KEY");
        if (prop != null && !prop.isBlank()) return prop;
        return settingRepository.findById("ai.gemini.api-key")
                .map(setting -> setting.getSettingValue() != null && !setting.getSettingValue().isBlank()
                        ? setting.getSettingValue() : configuredApiKey)
                .orElse(configuredApiKey);
    }

    private List<String> parseKeyList(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        return Arrays.stream(raw.split("[,;\\r?\\n]+"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    private String resolveModel() {
        String env = System.getenv("GEMINI_MODEL");
        if (env != null && !env.isBlank()) return env;
        String prop = System.getProperty("GEMINI_MODEL");
        if (prop != null && !prop.isBlank()) return prop;
        return settingRepository.findById("ai.gemini.model")
                .map(setting -> setting.getSettingValue() != null && !setting.getSettingValue().isBlank()
                        ? setting.getSettingValue() : configuredModel)
                .orElse(configuredModel);
    }
}
