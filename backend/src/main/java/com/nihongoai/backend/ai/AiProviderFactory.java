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
        String provider = settingRepository.findById("ai.provider")
                .map(s -> s.getSettingValue() != null ? s.getSettingValue().toLowerCase().trim() : "mock")
                .orElse("mock");

        return switch (provider) {
            case "freellmapi", "freellm", "openai", "openai-compatible", "deepseek", "openrouter" -> openAiCompatibleAiProvider;
            case "gemini" -> geminiAiProvider;
            default -> localMockProvider;
        };
    }
}
