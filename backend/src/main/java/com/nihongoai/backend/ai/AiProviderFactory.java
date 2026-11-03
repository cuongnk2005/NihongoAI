package com.nihongoai.backend.ai;

import com.nihongoai.backend.repository.SystemSettingRepository;
import org.springframework.stereotype.Component;

@Component
public class AiProviderFactory {

    private final LocalMockAiProvider localMockProvider;
    private final GeminiAiProvider geminiAiProvider;
    private final OpenAiCompatibleAiProvider openAiCompatibleAiProvider;
    private final SystemSettingRepository settingRepository;

    public AiProviderFactory(
            LocalMockAiProvider localMockProvider,
            GeminiAiProvider geminiAiProvider,
            OpenAiCompatibleAiProvider openAiCompatibleAiProvider,
            SystemSettingRepository settingRepository
    ) {
        this.localMockProvider = localMockProvider;
        this.geminiAiProvider = geminiAiProvider;
        this.openAiCompatibleAiProvider = openAiCompatibleAiProvider;
        this.settingRepository = settingRepository;
    }

    public AiProvider getProvider() {
        String provider = System.getenv("AI_PROVIDER");
        if (provider == null || provider.isBlank()) {
            provider = System.getProperty("AI_PROVIDER");
        }
        if (provider == null || provider.isBlank()) {
            provider = settingRepository.findById("ai.provider")
                    .map(s -> s.getSettingValue() != null ? s.getSettingValue() : "gemini")
                    .orElse("gemini");
        }
        provider = provider.toLowerCase().trim();

        return switch (provider) {
            case "freellmapi", "freellm", "openai", "openai-compatible", "deepseek", "openrouter" -> openAiCompatibleAiProvider;
            case "mock" -> localMockProvider;
            default -> geminiAiProvider;
        };
    }
}
