/**
 * Token işlemlerini merkezi olarak yöneten servis
 * Bu servis token ile ilgili işlemleri merkezileştirmek için kullanılır
 */

import axios from 'axios';

// Loglama için
const logToken = (type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [TOKEN SERVICE] [${type}] ${message}`, data ? data : '');
};

const TokenService = {
    // Token bilgilerini kaydet
    saveTokens: (accessToken, refreshToken, expiresIn, username) => {
        if (!accessToken) {
            logToken('ERROR', 'accessToken tanımsız!');
            return false;
        }

        try {
            logToken('SAVE', 'Token bilgileri kaydediliyor', {
                accessTokenPresent: !!accessToken,
                refreshTokenPresent: !!refreshToken,
                expiresIn,
                username
            });

            // CRITICAL: Önce tüm eski token bilgilerini temizle
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiry');
            
            // Token bilgilerini kaydet - sync olarak yap
            localStorage.setItem('accessToken', accessToken);
            logToken('DETAIL', 'Access token kaydedildi', { token: accessToken.substring(0, 15) + '...' });
            
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
                logToken('DETAIL', 'Refresh token kaydedildi', { token: refreshToken.substring(0, 10) + '...' });
            }
            
            if (username) {
                localStorage.setItem('username', username);
                logToken('DETAIL', 'Username kaydedildi', { username });
            }

            // Son kullanma tarihini hesapla ve kaydet
            if (expiresIn) {
                // expiresIn değerini ms'ye dönüştür (eğer saniye cinsinden geldiyse)
                let expiresInMs;
                if (typeof expiresIn === 'number') {
                    // 10 dakikadan uzun süreler muhtemelen ms cinsindendir
                    expiresInMs = expiresIn > 600000 ? expiresIn : expiresIn * 1000;
                    logToken('DETAIL', 'expiresIn zaten number tipinde', { raw: expiresIn, converted: expiresInMs });
                } else {
                    // String geldiyse sayıya çevir ve 1000 ile çarp (saniye -> ms)
                    expiresInMs = parseInt(expiresIn) * 1000;
                    logToken('DETAIL', 'expiresIn string tipinden çevrildi', { raw: expiresIn, converted: expiresInMs });
                }
                
                // Şu anki zamanı al ve süreyi ekle
                const now = new Date().getTime();
                const expiryTime = now + expiresInMs;
                
                // Dağıtılmış sistem ve saat farklılıkları için 10 saniye güvenlik payı ekle
                const safeExpiryTime = expiryTime - 10000;
                
                localStorage.setItem('tokenExpiry', safeExpiryTime.toString());
                logToken('DETAIL', 'Token expiry kaydedildi', { 
                    now: new Date(now).toLocaleString(),
                    expiry: new Date(safeExpiryTime).toLocaleString(),
                    durationSeconds: Math.round(expiresInMs/1000),
                    durationMinutes: Math.round(expiresInMs/60000)
                });
            }
            
            // CRITICAL: Axios global headers'ı güncelle
            if (typeof axios !== 'undefined') {
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                logToken('DETAIL', 'Axios global headers güncellendi');
            }
            
            logToken('SUCCESS', 'Token bilgileri başarıyla kaydedildi');
            return true;
        } catch (error) {
            logToken('ERROR', 'Token kaydetme hatası', error);
            return false;
        }
    },
    
    // Kullanıcı adını güncelle
    updateUsername: (newUsername) => {
        try {
            if (!newUsername) {
                logToken('ERROR', 'Yeni kullanıcı adı tanımsız!');
                return false;
            }

            const oldUsername = localStorage.getItem('username');
            logToken('UPDATE', 'Kullanıcı adı güncelleniyor', { oldUsername, newUsername });
            
            // Yeni kullanıcı adını kaydet
            localStorage.setItem('username', newUsername);
            
            logToken('SUCCESS', 'Kullanıcı adı başarıyla güncellendi', { username: newUsername });
            return true;
        } catch (error) {
            logToken('ERROR', 'Kullanıcı adı güncelleme hatası', error);
            return false;
        }
    },
    
    // Kullanıcı adını güvenli şekilde değiştir (token ve oturum korunarak)
    safeUsernameChange: (newUsername) => {
        try {
            if (!newUsername) {
                logToken('ERROR', 'Yeni kullanıcı adı tanımsız!');
                return false;
            }

            // Geçerli token'ları ve kullanıcı adını al
            const tokens = TokenService.getTokens();
            const oldUsername = localStorage.getItem('username');
            
            logToken('SAFE_UPDATE', 'Kullanıcı adı güvenli şekilde güncelleniyor', { 
                oldUsername, 
                newUsername,
                hasAccessToken: !!tokens.accessToken,
                hasRefreshToken: !!tokens.refreshToken
            });
            
            if (!tokens.accessToken) {
                logToken('WARNING', 'Geçerli bir token olmadan kullanıcı adı değiştiriliyor');
            }
            
            // Yeni kullanıcı adını kaydet
            localStorage.setItem('username', newUsername);
            
            // Axios header'ı güncelle (token değişimleri için)
            if (tokens.accessToken && typeof axios !== 'undefined') {
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
                logToken('DETAIL', 'Axios authorization header yenilendi');
            }
            
            // Token yenileme işaretini ayarla
            localStorage.setItem('usernameChanged', 'true');
            
            logToken('SUCCESS', 'Kullanıcı adı güvenli şekilde güncellendi', { username: newUsername });
            return true;
        } catch (error) {
            logToken('ERROR', 'Güvenli kullanıcı adı güncelleme hatası', error);
            return false;
        }
    },
    
    // Token bilgilerini temizle
    clearTokens: () => {
        try {
            logToken('CLEAR', 'Token bilgileri temizleniyor');
            
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiry');
            
            // CRITICAL: Axios headers'dan da temizle
            if (typeof axios !== 'undefined') {
                delete axios.defaults.headers.common['Authorization'];
                logToken('DETAIL', 'Axios Authorization header temizlendi');
            }
            
            logToken('SUCCESS', 'Token bilgileri başarıyla temizlendi');
            return true;
        } catch (error) {
            logToken('ERROR', 'Token temizleme hatası', error);
            return false;
        }
    },
    
    // Uzun tokeni kısaltıp gösterme (loglama için)
    shortenToken: (token, length = 15) => {
        if (!token) return null;
        return token.length > length ? token.substring(0, length) + '...' : token;
    },
    
    // Token'ın süresi dolmuş mu kontrol et
    isTokenExpired: () => {
        try {
            const expiry = localStorage.getItem('tokenExpiry');
            if (!expiry) {
                logToken('CHECK', 'tokenExpiry değeri bulunamadı');
                return true;
            }
            
            const now = new Date().getTime();
            const expiryTime = parseInt(expiry);
            
            // Süre dolmuş mu kontrol et
            const isExpired = now > expiryTime;
            
            if (isExpired) {
                logToken('CHECK', 'Token süresi dolmuş', { 
                    now: new Date(now).toLocaleString(),
                    expiry: new Date(expiryTime).toLocaleString(),
                    differenceMs: now - expiryTime
                });
            } else {
                const remainingMs = expiryTime - now;
                logToken('CHECK', 'Token hala geçerli', { 
                    now: new Date(now).toLocaleString(),
                    expiry: new Date(expiryTime).toLocaleString(),
                    remainingSeconds: Math.round(remainingMs/1000),
                    remainingMinutes: Math.round(remainingMs/60000)
                });
            }
            
            return isExpired;
        } catch (error) {
            logToken('ERROR', 'Token süre kontrolü hatası', error);
            return true; // Hata durumunda true dönerek token yenileme mekanizmasını tetikler
        }
    },
    
    // Geçerli bir token var mı kontrol et
    hasValidToken: () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const isValid = accessToken && !TokenService.isTokenExpired();
            
            logToken('VALIDATE', 'Token geçerlilik kontrolü', { 
                accessTokenPresent: !!accessToken,
                isValid,
                accessToken: accessToken ? TokenService.shortenToken(accessToken) : null
            });
            
            return isValid;
        } catch (error) {
            logToken('ERROR', 'Token geçerlilik kontrolü hatası', error);
            return false;
        }
    },
    
    // Token bilgilerini getir ve durumunu kontrol et
    getTokens: () => {
        try {
            // Her zaman localStorage'dan taze veri al, hiçbir şekilde önbellek kullanma
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            
            // Token'ı doğrula - geçerli bir JWT formatında olmalı
            const isValidTokenFormat = (token) => {
                if (!token) return false;
                
                // Basit JWT formatı kontrolü: 3 parçalı, nokta ile ayrılmış string
                const parts = token.split('.');
                return parts.length === 3 && parts.every(part => part.length > 0);
            };
            
            // Token formatını kontrol et
            const isValidAccessToken = isValidTokenFormat(accessToken);
            if (accessToken && !isValidAccessToken) {
                logToken('WARNING', 'AccessToken JWT formatında değil, muhtemelen geçersiz', accessToken.substring(0, 15));
            }
            
            // Süresi dolmuş mu kontrol et
            const isExpired = TokenService.isTokenExpired();
            
            logToken('GET', 'Token bilgileri alınıyor', {
                accessToken: accessToken ? TokenService.shortenToken(accessToken) : null,
                refreshToken: refreshToken ? TokenService.shortenToken(refreshToken, 10) : null,
                tokenExpiry: tokenExpiry ? new Date(parseInt(tokenExpiry)).toLocaleString() : null,
                isExpired,
                isValidFormat: isValidAccessToken
            });
            
            return { 
                accessToken, 
                refreshToken, 
                tokenExpiry, 
                isExpired,
                isValidFormat: isValidAccessToken
            };
        } catch (error) {
            logToken('ERROR', 'Token bilgisi alma hatası', error);
            return {
                accessToken: null,
                refreshToken: null,
                tokenExpiry: null,
                isExpired: true,
                isValidFormat: false
            };
        }
    },
    
    // Tokeni inspect et - debug için
    inspectToken: () => {
        try {
            const allStorage = {};
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                let value = localStorage.getItem(key);
                
                // Token değerlerini maskeleyerek göster
                if (key === 'accessToken' || key === 'refreshToken') {
                    value = TokenService.shortenToken(value);
                }
                
                if (key === 'tokenExpiry') {
                    const date = new Date(parseInt(value));
                    value = `${value} (${date.toLocaleString()})`;
                }
                
                allStorage[key] = value;
            }
            
            logToken('INSPECT', 'Tüm localStorage içeriği', allStorage);
            
            const result = TokenService.getTokens();
            const isValid = TokenService.hasValidToken();
            
            logToken('INSPECT', 'Token durumu', { 
                accessTokenPresent: !!result.accessToken,
                refreshTokenPresent: !!result.refreshToken,
                isExpired: result.isExpired,
                isValid
            });
            
            return { localStorageContent: allStorage, tokenStatus: result, isValid };
        } catch (error) {
            logToken('ERROR', 'Token inceleme hatası', error);
            return null;
        }
    },
    
    // Token yenilemeden sonra yeni değerleri sakla ve oturumu güncelle
    updateTokens: (response) => {
        try {
            logToken('UPDATE', 'Token güncelleme isteği', { responseExists: !!response });
            
            if (!response || !response.accessToken) {
                logToken('ERROR', 'updateTokens için geçerli bir response objesi bulunamadı');
                return false;
            }
            
            const { accessToken, refreshToken, expiresIn } = response;
            const username = localStorage.getItem('username');
            
            logToken('UPDATE', 'Token güncelleniyor', { 
                accessTokenExists: !!accessToken, 
                refreshTokenExists: !!refreshToken, 
                expiresIn
            });
            
            return TokenService.saveTokens(accessToken, refreshToken, expiresIn, username);
        } catch (error) {
            logToken('ERROR', 'Token güncelleme hatası', error);
            return false;
        }
    }
};

export default TokenService; 