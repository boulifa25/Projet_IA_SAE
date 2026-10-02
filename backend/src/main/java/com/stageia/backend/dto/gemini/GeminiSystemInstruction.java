package com.stageia.backend.dto.gemini;

import java.util.List;

public record GeminiSystemInstruction(List<GeminiPart> parts) {

    public GeminiSystemInstruction(String text) {
        this(List.of(new GeminiPart(text)));
    }
}
