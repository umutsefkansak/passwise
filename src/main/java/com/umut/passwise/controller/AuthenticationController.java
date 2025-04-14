package com.umut.passwise.controller;


import com.umut.passwise.dto.requests.AdminRequestDto;
import com.umut.passwise.dto.responses.AdminResponseDto;
import com.umut.passwise.dto.responses.LoginResponseDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.service.security.AuthenticationService;
import com.umut.passwise.service.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;

    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Admin> register(@RequestBody AdminRequestDto adminRequestDto) {
        Admin registeredAdmin = authenticationService.signup(adminRequestDto);

        return ResponseEntity.ok(registeredAdmin);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> authenticate(@RequestBody AdminRequestDto adminRequestDto) {
        Admin authenticatedAdmin = authenticationService.authenticate(adminRequestDto);

        String jwtToken = jwtService.generateToken(authenticatedAdmin);

        LoginResponseDto loginResponse = new LoginResponseDto().setToken(jwtToken).setExpiresIn(jwtService.getExpirationTime());

        return ResponseEntity.ok(loginResponse);
    }
}