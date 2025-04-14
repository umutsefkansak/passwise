package com.umut.passwise.dto.responses;


public class LoginResponseDto {

    private String token;

    private long expiresIn;
    public LoginResponseDto setToken(String token) {
        this.token = token;
        return this;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public LoginResponseDto setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
        return this;
    }



    public String getToken() {
        return token;
    }

}