package com.stageia.backend.dto.gemini;

import java.util.List;

public record GeminiRequest(
        GeminiSystemInstruction systemInstruction,
        List<GeminiContent> contents,
        GeminiGenerationConfig generationConfig
) {
}
