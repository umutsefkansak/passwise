package com.umut.passwise.dto.requests;

public class TokenRefreshRequestDto {
    private String refreshToken;

    public String getRefreshToken() {
        return refreshToken;
    }

    public TokenRefreshRequestDto setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
        return this;
    }
}