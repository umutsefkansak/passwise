package com.umut.passwise.service.security;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Date;

@Service
public class TokenBlacklistService {

    // ConcurrentHashMap thread-safe bir yapı sunduğu için tercih edildi
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    private final JwtService jwtService;

    public TokenBlacklistService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
    }

    public boolean isBlacklisted(String token) {
        // Token blacklist'te mi kontrol et
        if (blacklistedTokens.contains(token)) {
            return true;
        }

        // Süresi dolan tokenleri blacklist'ten temizle (performans için)
        cleanupExpiredTokens();
        return false;
    }

    // Blacklist'i periyodik olarak temizle
    private void cleanupExpiredTokens() {
        Date now = new Date();
        blacklistedTokens.removeIf(token -> {
            try {
                Date expiration = jwtService.extractExpiration(token);
                return expiration.before(now);
            } catch (Exception e) {
                // Token parse edilemezse listeden çıkar
                return true;
            }
        });
    }
}