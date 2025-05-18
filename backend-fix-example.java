package com.umut.passwise.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ... mevcut konfigürasyon ...
            
            .authorizeHttpRequests(authorize -> authorize
                // ... mevcut endpoint izinleri ...
                
                // Şifre değiştirme endpoint'i için izin ekleyin
                .requestMatchers("/api/auth/admin/change-password").authenticated()
                
                // ... diğer endpoint izinleri ...
            );
            
        return http.build();
    }
}

// AuthController sınıfında değişiklik
package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.ChangePasswordRequestDto;
import com.umut.passwise.service.security.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    @Autowired
    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    // Diğer auth endpoint'leri burada...

    @PostMapping("/admin/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequestDto requestDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            System.out.println("Şifre değiştirme isteği: " + currentUsername + " için");
            System.out.println("İstek verisi: " + requestDto.getUsername());
            
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
            System.out.println("Şifre değiştirme hatası: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Şifre değiştirme işlemi sırasında bir hata oluştu: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 