package com.nihongoai.backend.ai;

import com.nihongoai.backend.repository.SystemSettingRepository;
import org.springframework.stereotype.Component;

@Component
public class AiProviderFactory {

    private final LocalMockAiProvider localMockProvider;
    private final SystemSettingRepository settingRepository;

    public AiProviderFactory(LocalMockAiProvider localMockProvider, SystemSettingRepository settingRepository) {
        this.localMockProvider = localMockProvider;
        this.settingRepository = settingRepository;
    }

    public AiProvider getProvider() {
        return localMockProvider;
    }
}
