package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.AdminRequestDto;
import com.umut.passwise.dto.requests.LoginRequestDto;
import com.umut.passwise.dto.requests.TokenRefreshRequestDto;
import com.umut.passwise.dto.responses.LoginResponseDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.service.security.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Admin> register(@RequestBody AdminRequestDto adminRequestDto) {
        Admin registeredAdmin = authenticationService.signup(adminRequestDto);
        return ResponseEntity.ok(registeredAdmin);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto,
            HttpServletRequest request
    ) {
        LoginResponseDto loginResponse = authenticationService.login(loginRequestDto, request);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refreshToken(@RequestBody TokenRefreshRequestDto request) {
        LoginResponseDto response = authenticationService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpServletRequest request,
            Authentication authentication
    ) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            Admin admin = (Admin) authentication.getPrincipal();

            authenticationService.logout(jwt, admin, request);
            return ResponseEntity.ok("Basariyla cikis yapildi");
        }

        return ResponseEntity.badRequest().body("Gecerli bir oturum bulunamadi");
    }
}