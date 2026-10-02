package com.stageia.backend.dto.gemini;

import java.util.List;

public record GeminiContent(String role, List<GeminiPart> parts) {
}
