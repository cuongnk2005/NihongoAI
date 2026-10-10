package com.nihongoai.backend.kaiwa;

import com.nihongoai.backend.ai.AiProvider;
import com.nihongoai.backend.ai.AiProviderFactory;
import com.nihongoai.backend.ai.KaiwaResponseDto;
import org.springframework.stereotype.Service;

@Service
public class KaiwaService {

    private final AiProviderFactory aiProviderFactory;

    public KaiwaService(AiProviderFactory aiProviderFactory) {
        this.aiProviderFactory = aiProviderFactory;
    }

    public KaiwaResponseDto chat(String userMessage, String level) {
        AiProvider provider = aiProviderFactory.getProvider();
        return provider.chatKaiwa(userMessage, level);
    }
}
