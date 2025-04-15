package com.umut.passwise.dto.responses;

public class LoginResponseDto {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private String tokenType = "Bearer";

    public String getAccessToken() {
        return accessToken;
    }

    public LoginResponseDto setAccessToken(String accessToken) {
        this.accessToken = accessToken;
        return this;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public LoginResponseDto setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
        return this;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public LoginResponseDto setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
        return this;
    }

    public String getTokenType() {
        return tokenType;
    }

    public LoginResponseDto setTokenType(String tokenType) {
        this.tokenType = tokenType;
        return this;
    }

    /*// Eski versiyon için geriye dönük uyumluluk
    public String getToken() {
        return accessToken;
    }*/

    public LoginResponseDto setToken(String token) {
        this.accessToken = token;
        return this;
    }
}