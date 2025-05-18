package com.umut.passwise.service.security;

import com.umut.passwise.dto.requests.AdminRequestDto;
import com.umut.passwise.dto.requests.LoginRequestDto;
import com.umut.passwise.dto.requests.UpdateAdminProfileRequestDto;
import com.umut.passwise.dto.responses.AdminResponseDto;
import com.umut.passwise.dto.responses.LoginResponseDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.LoginActivityLog;
import com.umut.passwise.entities.RefreshToken;
import com.umut.passwise.repository.AdminRepository;
import com.umut.passwise.repository.LoginActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthenticationService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final LoginActivityLogRepository loginActivityLogRepository;

    public AuthenticationService(
            AdminRepository adminRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            TokenBlacklistService tokenBlacklistService,
            LoginActivityLogRepository loginActivityLogRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.loginActivityLogRepository = loginActivityLogRepository;
    }

    public Admin signup(AdminRequestDto input) {
        Admin user = new Admin()
                .setName(input.getName())
                .setSurname(input.getSurname())
                .setUsername(input.getUsername())
                .setPassword(passwordEncoder.encode(input.getPassword()));

        return adminRepository.save(user);
    }

    public Admin authenticate(AdminRequestDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getUsername(),
                        input.getPassword()
                )
        );

        return adminRepository.findByUsername(input.getUsername())
                .orElseThrow();
    }

    @Transactional
    public LoginResponseDto login(LoginRequestDto loginRequest, HttpServletRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        Admin admin = adminRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        String jwt = jwtService.generateToken(admin);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(admin);

        // Login log kaydı oluştur
        LoginActivityLog loginLog = new LoginActivityLog()
                .setAdmin(admin)
                .setAction("LOGIN")
                .setTimestamp(LocalDateTime.now())
                .setIpAddress(getClientIp(request))
                .setUserAgent(request.getHeader("User-Agent"));

        loginActivityLogRepository.save(loginLog);

        return new LoginResponseDto()
                .setAccessToken(jwt)
                .setRefreshToken(refreshToken.getToken())
                .setExpiresIn(jwtService.getExpirationTime());
    }

    @Transactional
    public LoginResponseDto refreshToken(String refreshToken) {
        return refreshTokenService.findByToken(refreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getAdmin)
                .map(admin -> {
                    String token = jwtService.generateToken(admin);

                    return new LoginResponseDto()
                            .setAccessToken(token)
                            .setRefreshToken(refreshToken)
                            .setExpiresIn(jwtService.getExpirationTime());
                })
                .orElseThrow(() -> new RuntimeException("Refresh token bulunamadı"));
    }

    @Transactional
    public void logout(String token, Admin admin, HttpServletRequest request) {
        // Token blacklist'e ekle
        tokenBlacklistService.blacklistToken(token);

        // RefreshToken'ları sil
        refreshTokenService.deleteByAdmin(admin);

        // Logout kaydı oluştur
        LoginActivityLog logoutLog = new LoginActivityLog()
                .setAdmin(admin)
                .setAction("LOGOUT")
                .setTimestamp(LocalDateTime.now())
                .setIpAddress(getClientIp(request))
                .setUserAgent(request.getHeader("User-Agent"));

        loginActivityLogRepository.save(logoutLog);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

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

    public boolean isUsernameAvailable(String username, Long currentUserId) {
        return adminRepository.findByUsername(username)
                .map(existingAdmin -> existingAdmin.getId().equals(currentUserId))
                .orElse(true);
    }

    public AdminResponseDto updateAdminProfile(UpdateAdminProfileRequestDto requestDto) {
        Admin admin = adminRepository.findById(requestDto.getId())
                .orElseThrow(() -> new RuntimeException("Admin bulunamadı"));
        
        // Kullanıcı adı değişip değişmediğini kontrol et
        boolean isUsernameChanged = !admin.getUsername().equals(requestDto.getUsername());
        
        // Eğer kullanıcı adı değişiyorsa, yeni kullanıcı adının kullanılabilir olup olmadığını kontrol et
        if (isUsernameChanged) {
            boolean isAvailable = isUsernameAvailable(requestDto.getUsername(), admin.getId());
            if (!isAvailable) {
                throw new RuntimeException("Bu kullanıcı adı zaten kullanımda. Lütfen başka bir kullanıcı adı seçin.");
            }
        }
        
        // Şifre ve diğer hassas bilgileri koruyarak sadece profil bilgilerini güncelle
        String currentPassword = admin.getPassword(); // Mevcut şifreyi koru
        admin.setName(requestDto.getName());
        admin.setSurname(requestDto.getSurname());
        admin.setUsername(requestDto.getUsername());
        admin.setPassword(currentPassword); // Şifreyi aynen bırak
        
        // Güncellenmiş admin bilgilerini kaydet
        Admin updatedAdmin = adminRepository.save(admin);
        
        // Response DTO oluştur
        AdminResponseDto responseDto = new AdminResponseDto();
        responseDto.setId(updatedAdmin.getId());
        responseDto.setName(updatedAdmin.getName());
        responseDto.setSurname(updatedAdmin.getSurname());
        
        return responseDto;
    }
}