package com.stageia.backend.dto.gemini;

import java.util.List;

public record GeminiResponse(List<GeminiCandidate> candidates) {

    public String firstText() {
        if (candidates == null || candidates.isEmpty()) {
            return "";
        }
        GeminiContent content = candidates.get(0).content();
        if (content == null || content.parts() == null || content.parts().isEmpty()) {
            return "";
        }
        return content.parts().get(0).text();
    }
}
