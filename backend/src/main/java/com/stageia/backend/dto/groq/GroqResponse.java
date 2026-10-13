package com.stageia.backend.dto.groq;

import java.util.List;

public record GroqResponse(List<GroqChoice> choices) {

    public String firstText() {
        if (choices == null || choices.isEmpty() || choices.get(0).message() == null) {
            return "";
        }
        return choices.get(0).message().content();
    }
}
