package com.umut.passwise.service.security;

import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.RefreshToken;
import com.umut.passwise.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Value("${security.jwt.refresh-token.expiration-time:86400000}")
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken createRefreshToken(Admin admin) {
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setAdmin(admin);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token süresi dolmuş. Lütfen tekrar giriş yapın.");
        }

        return token;
    }

    @Transactional
    public int deleteByAdmin(Admin admin) {
        return refreshTokenRepository.deleteByAdmin(admin);
    }
}