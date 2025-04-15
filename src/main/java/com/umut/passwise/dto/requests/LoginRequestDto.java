package com.umut.passwise.dto.requests;

public class LoginRequestDto {
    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public LoginRequestDto setUsername(String username) {
        this.username = username;
        return this;
    }

    public String getPassword() {
        return password;
    }

    public LoginRequestDto setPassword(String password) {
        this.password = password;
        return this;
    }
}