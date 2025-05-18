package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.AdminRequestDto;
import com.umut.passwise.dto.requests.ChangePasswordRequestDto;
import com.umut.passwise.dto.requests.LoginRequestDto;
import com.umut.passwise.dto.requests.TokenRefreshRequestDto;
import com.umut.passwise.dto.requests.UpdateAdminProfileRequestDto;
import com.umut.passwise.dto.responses.AdminResponseDto;
import com.umut.passwise.dto.responses.LoginResponseDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.service.security.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequestDto requestDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();

            // Kullanıcı kendi şifresini değiştiriyor mu kontrol et
            if (!currentUsername.equals(requestDto.getUsername())) {
                return new ResponseEntity<>("Sadece kendi şifrenizi değiştirebilirsiniz.", HttpStatus.FORBIDDEN);
            }

            boolean success = authenticationService.changePassword(
                    requestDto.getUsername(),
                    requestDto.getCurrentPassword(),
                    requestDto.getNewPassword()
            );

            if (success) {
                return new ResponseEntity<>("Şifre başarıyla değiştirildi.", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Şifre değiştirilemedi. Mevcut şifre yanlış olabilir.", HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Şifre değiştirme işlemi sırasında bir hata oluştu: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/update-profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody UpdateAdminProfileRequestDto requestDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            // ID üzerinden admin'in mevcut kullanıcı adını bularak kontrol et
            Admin admin = (Admin) authentication.getPrincipal();
            
            // Kullanıcı kendi profilini güncelliyor mu kontrol et
            if (!admin.getId().equals(requestDto.getId())) {
                return new ResponseEntity<>("Sadece kendi profilinizi güncelleyebilirsiniz.", HttpStatus.FORBIDDEN);
            }
            
            // Profil güncelleme işlemini yap
            AdminResponseDto updatedAdmin = authenticationService.updateAdminProfile(requestDto);
            
            // Başarılı cevabı döndür
            return ResponseEntity.ok(updatedAdmin);
        } catch (Exception e) {
            String errorMessage = e.getMessage();
            
            // Duplicate key hatası için daha anlaşılır mesaj döndür
            if (errorMessage != null && (errorMessage.contains("duplicate key value") || 
                                        errorMessage.contains("ukmi8vkhus4xbdbqcac2jm4spvd") ||
                                        errorMessage.contains("already exists"))) {
                return new ResponseEntity<>("Bu kullanıcı adı zaten kullanımda. Lütfen başka bir kullanıcı adı seçin.", 
                        HttpStatus.BAD_REQUEST);
            }
            
            // Diğer hatalar için
            return new ResponseEntity<>("Profil güncelleme işlemi sırasında bir hata oluştu: " + errorMessage,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}