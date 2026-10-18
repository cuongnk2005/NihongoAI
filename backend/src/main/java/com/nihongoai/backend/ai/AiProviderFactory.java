package com.nihongoai.backend.ai;

import com.nihongoai.backend.repository.SystemSettingRepository;
import org.springframework.stereotype.Component;

@Component
public class AiProviderFactory {

    private final LocalMockAiProvider localMockProvider;
    private final GeminiAiProvider geminiAiProvider;
    private final SystemSettingRepository settingRepository;

    public AiProviderFactory(
            LocalMockAiProvider localMockProvider,
            GeminiAiProvider geminiAiProvider,
            SystemSettingRepository settingRepository
    ) {
        this.localMockProvider = localMockProvider;
        this.geminiAiProvider = geminiAiProvider;
        this.settingRepository = settingRepository;
    }

    public AiProvider getProvider() {
        String provider = settingRepository.findById("ai.provider")
                .map(s -> s.getSettingValue() != null ? s.getSettingValue().toLowerCase() : "mock")
                .orElse("mock");

        if ("gemini".equals(provider)) {
            return geminiAiProvider;
        }
        return localMockProvider;
    }
}
