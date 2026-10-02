package com.stageia.backend.dto;

import lombok.Getter;

@Getter
public class AuthResponse {

    private final String token;
    private final String tokenType = "Bearer";
    private final long expiresIn;
    private final UserResponse user;

    public AuthResponse(String token, long expiresIn, UserResponse user) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.user = user;
    }
}
