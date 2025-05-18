import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import AuthService from '../services/AuthService';
import TokenService from '../services/TokenService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshTimerRef = useRef(null);

    // Token yenileme zamanını hesapla - useCallback ile memoize edilmiş
    const scheduleTokenRefresh = useCallback((expiresIn) => {
        console.log('AuthContext: Token yenileme zamanlayıcısı ayarlanıyor...');
        
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            console.log('AuthContext: Önceki zamanlayıcı temizlendi');
        }

        // Token süresinin %80'i geçince yenileme yap
        // Milisaniye cinsinden olduğundan emin ol, eğer expiresIn değeri saniye cinsindense 1000 ile çarpabiliriz
        let refreshTime;
        if (typeof expiresIn === 'number') {
            // 10 dakikadan uzun süreler muhtemelen ms cinsindendir
            refreshTime = expiresIn > 600000 ? expiresIn * 0.8 : expiresIn * 1000 * 0.8;
        } else {
            // String geldiyse sayıya çevir ve 1000 ile çarp (saniye -> ms)
            refreshTime = parseInt(expiresIn) * 1000 * 0.8;
        }
        
        // Minimum 10 saniye sonra yenileme yap, çok kısa süreleri engelle
        refreshTime = Math.max(refreshTime, 10000);
        
        console.log(`AuthContext: Token ${Math.round(refreshTime/1000)} saniye (${Math.round(refreshTime/60000)} dakika) sonra yenilenecek`);
        
        refreshTimerRef.current = setTimeout(async () => {
            console.log('AuthContext: Token yenileme süresi geldi!');
            const tokens = TokenService.getTokens();
            
            if (tokens.refreshToken && isAuthenticated) {
                console.log('AuthContext: Token yenileme başlatılıyor...');
                await refreshToken();
            } else {
                console.log('AuthContext: Token yenileme için gerekli koşullar sağlanmıyor', { 
                    hasRefreshToken: !!tokens.refreshToken, 
                    isAuthenticated 
                });
            }
        }, refreshTime);
    }, [isAuthenticated]); // isAuthenticated dependency olarak eklendi

    // Refresh token işlemi - useCallback ile memoize edilmiş
    const refreshToken = useCallback(async () => {
        try {
            console.log('AuthContext: Token yenileniyor...');
            
            // CRITICAL: Doğrudan localStorage'dan token al, TokenService'den değil
            const refreshToken = localStorage.getItem('refreshToken');
            
            // Format kontrolü
            if (!refreshToken) {
                console.log('AuthContext: Refresh token bulunamadı, yenileme yapılamıyor');
                throw new Error('Refresh token bulunamadı');
            }

            console.log('AuthContext: Refresh token bulundu, yenileme başlatılıyor...');
            
            // AuthService refreshToken'ı çağır (taze token ile)
            const response = await AuthService.refreshToken(refreshToken);
            console.log('AuthContext: Token yenileme cevabı alındı', {
                hasAccessToken: !!response.accessToken,
                hasRefreshToken: !!response.refreshToken,
                expiresIn: response.expiresIn 
            });

            // Yeni token'ları kontrol et
            if (!response || !response.accessToken) {
                console.error('AuthContext: Yeni token alınamadı veya geçersiz');
                throw new Error('Geçerli access token alınamadı');
            }

            // Yeni token için yenileme zamanı planla 
            if (response.expiresIn) {
                scheduleTokenRefresh(response.expiresIn);
            } else {
                console.warn('AuthContext: Token yanıtında expiresIn değeri yok!');
            }

            // AuthContext state'i güncellendiğini bildir
            console.log('AuthContext: Token başarıyla yenilendi, durum güncelleniyor...');
            
            // localStorage'dan güncel kullanıcı adını al
            const username = localStorage.getItem('username');
            
            // Kullanıcı verisi güncellendi mi kontrol et
            if (username && (!user || user.username !== username)) {
                console.log('AuthContext: Kullanıcı adı değişmiş, state güncelleniyor', {
                    oldUsername: user?.username,
                    newUsername: username
                });
                setUser({ username });
            }
            
            // isAuthenticated state'ini yeniden true olarak ayarla
            setIsAuthenticated(true);
            
            // CRITICAL: Son bir kontrol - taze token doğru şekilde kaydedildi mi?
            const newAccessToken = localStorage.getItem('accessToken');
            if (!newAccessToken) {
                console.error('AuthContext: Yeni token kaydedilmemiş!');
                throw new Error('Token kaydedilemedi');
            }
            
            console.log('AuthContext: Yeni token kaydedildi', { 
                token: newAccessToken.substring(0, 15) + '...' 
            });
            
            return newAccessToken;
        } catch (error) {
            console.error('AuthContext: Token yenileme hatası:', error);
            
            // Hatanın detaylarını göster
            if (error.response) {
                console.error('Hata detayları:', error.response.data);
            }
            
            // Oturumu sonlandır
            console.log('AuthContext: Refresh token hatası nedeniyle oturum sonlandırılıyor...');
            handleLogout();
            
            // Zorla login sayfasına yönlendir
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
            
            return null;
        }
    }, [scheduleTokenRefresh]);

    // Oturum durumunu kontrol et
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // TokenService kullanarak token durumunu kontrol et
                const tokens = TokenService.getTokens();
                const username = localStorage.getItem('username');

                if (tokens.accessToken && username) {
                    console.log('AuthContext: Geçerli token ve kullanıcı bulundu');
                    
                    // Kullanıcı adı değişmiş mi kontrol et
                    if (user?.username !== username) {
                        console.log('AuthContext: Kullanıcı adı değişimi tespit edildi', {
                            oldUsername: user?.username,
                            newUsername: username
                        });
                    }
                    
                    // State'i güncelle
                    setIsAuthenticated(true);
                    setUser({ username });

                    // Token süresi kontrol
                    if (tokens.isExpired) {
                        console.log('AuthContext: Token süresi dolmuş, yenileme deneniyor...');
                        await refreshToken();
                    } else if (tokens.tokenExpiry) {
                        console.log('AuthContext: Token süresi dolmamış, zamanlayıcı ayarlanıyor...');
                        const now = new Date().getTime();
                        const expiryTime = parseInt(tokens.tokenExpiry);
                        const timeUntilExpiry = expiryTime - now;
                        
                        if (timeUntilExpiry > 0) {
                            scheduleTokenRefresh(timeUntilExpiry);
                        } else {
                            console.log('AuthContext: Token süresi zaten dolmuş, hemen yenileme deneniyor...');
                            await refreshToken();
                        }
                    }
                } else {
                    console.log('AuthContext: Geçerli token veya kullanıcı bulunamadı', { 
                        hasAccessToken: !!tokens.accessToken, 
                        hasUsername: !!username 
                    });
                }
            } catch (error) {
                console.error('AuthContext: Oturum kontrolü hatası:', error);
                // Sorun varsa temizlik yap
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();

        // Temizlik fonksiyonu
        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                console.log('AuthContext: Component temizliği - zamanlayıcı temizlendi');
            }
        };
    }, [refreshToken, scheduleTokenRefresh]);

    // Auth değişikliklerini dinle
    useEffect(() => {
        // Auth logout olayını dinle
        const handleAuthLogout = () => {
            console.log('AuthContext: auth:logout olayı yakalandı, oturum sonlandırılıyor...');
            handleLogout();
            
            // Kullanıcıyı login sayfasına yönlendir
            window.location.href = '/login';
        };

        window.addEventListener('auth:logout', handleAuthLogout);

        return () => {
            window.removeEventListener('auth:logout', handleAuthLogout);
            console.log('AuthContext: Event listener temizlendi');
        };
    }, []);

    const login = async (username, password) => {
        try {
            console.log('AuthContext: Login işlemi başlatılıyor...');
            const response = await AuthService.login(username, password);
            
            // Response içeriğini kontrol et
            if (!response || !response.accessToken) {
                throw new Error('Login cevabında token bulunamadı');
            }
            
            const { accessToken, refreshToken, expiresIn } = response;
            console.log('AuthContext: Login başarılı, token bilgileri alındı', { 
                hasAccessToken: !!accessToken, 
                hasRefreshToken: !!refreshToken, 
                expiresIn 
            });

            // TokenService ile token bilgilerini kaydet
            const saveResult = TokenService.saveTokens(accessToken, refreshToken, expiresIn, username);
            
            if (!saveResult) {
                console.error('AuthContext: Token bilgileri kaydedilemedi');
            }

            // Token yenileme zamanını ayarla
            if (expiresIn) {
                scheduleTokenRefresh(expiresIn);
            }

            // State'i güncelle
            setIsAuthenticated(true);
            setUser({ username });
            
            console.log('AuthContext: Login işlemi başarıyla tamamlandı');
            return true;
        } catch (error) {
            console.error('AuthContext: Login hatası:', error);
            return false;
        }
    };

    const handleLogout = () => {
        console.log('AuthContext: handleLogout çağrıldı, oturum bilgileri temizleniyor...');
        
        // Timer'ı temizle
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        // TokenService ile tüm token bilgilerini temizle
        TokenService.clearTokens();
        
        // Username bilgisini ayrıca temizleyelim
        localStorage.removeItem('username');
        
        // State'i güncelle
        setIsAuthenticated(false);
        setUser(null);
        
        console.log('AuthContext: Oturum bilgileri başarıyla temizlendi.');
    };

    const logout = async () => {
        try {
            console.log('AuthContext: Logout işlemi başlatılıyor...');
            
            // Eğer backend'e logout isteği gönderiliyorsa
            const tokens = TokenService.getTokens();
            if (tokens.accessToken) {
                await AuthService.logout();
                console.log('AuthContext: Backend logout isteği başarılı');
            } else {
                console.log('AuthContext: Token olmadığı için backend logout isteği yapılmadı');
            }
        } catch (error) {
            console.error('AuthContext: Logout hatası:', error);
        } finally {
            // Her durumda local oturumu kapat
            handleLogout();
            
            // Sayfayı login sayfasına yönlendir
            window.location.href = '/login';
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;