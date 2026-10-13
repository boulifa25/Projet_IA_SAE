package com.stageia.backend.dto.groq;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record GroqRequest(
        String model,
        List<GroqMessage> messages,
        @JsonProperty("max_tokens") int maxTokens
) {
}
