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
}

// ChangePasswordRequestDto sınıfı
package com.umut.passwise.dto.requests;

public class ChangePasswordRequestDto {
    private String username;
    private String currentPassword;
    private String newPassword;
    
    // Getter ve Setter'lar
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getCurrentPassword() {
        return currentPassword;
    }
    
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

// AuthenticationService sınıfına eklenecek metot
public boolean changePassword(String username, String currentPassword, String newPassword) {
    Admin admin = adminRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
            
    // Mevcut şifreyi kontrol et
    if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
        return false;
    }
    
    // Yeni şifreyi hashle ve kaydet
    admin.setPassword(passwordEncoder.encode(newPassword));
    adminRepository.save(admin);
    
    return true;
} 