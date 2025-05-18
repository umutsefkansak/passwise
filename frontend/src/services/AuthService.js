import api from './api';
import axios from 'axios';
import TokenService from './TokenService';
import { log as apiLog } from './api';

// API temel URL'i
const API_URL = 'http://172.18.220.175:8080'; 

// Loglama
const log = (type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [AUTH SERVICE] [${type}] ${message}`, data ? data : '');
};

// Direkt olarak backend'le iletişim için kullanılacak instance
// Bu instance interceptor kullanmaz, böylece sonsuz döngü oluşmaz
const directApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// DirectApi için loglama
directApi.interceptors.request.use(request => {
    log('REQUEST', `${request.method.toUpperCase()} ${request.url}`);
    return request;
});

directApi.interceptors.response.use(
    response => {
        log('RESPONSE', `${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    error => {
        if (error.response) {
            log('ERROR', `${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.data);
        } else {
            log('ERROR', 'No response', error.message);
        }
        return Promise.reject(error);
    }
);

const AuthService = {
    // Admin girişi
    login: async (username, password) => {
        try {
            log('LOGIN', 'Giriş isteği gönderiliyor', { username });
            
            const response = await api.post('/auth/login', {
                username,
                password
            });
            
            if (!response.data || !response.data.accessToken) {
                log('ERROR', 'Login yanıtında token bulunamadı', response.data);
                throw new Error('Login yanıtında token bulunamadı');
            }
            
            const { accessToken, refreshToken, expiresIn } = response.data;
            log('LOGIN', 'Giriş başarılı', {
                accessToken: accessToken ? accessToken.substring(0, 15) + '...' : null,
                refreshToken: refreshToken ? refreshToken.substring(0, 10) + '...' : null,
                expiresIn
            });
            
            return response.data;
        } catch (error) {
            log('ERROR', 'Giriş hatası', error.message);
            
            if (error.response) {
                log('ERROR', 'Hata detayları', error.response.data);
            }
            
            throw error;
        }
    },

    // Oturumu kapat
    logout: async () => {
        try {
            log('LOGOUT', 'Çıkış isteği gönderiliyor');
            
            const tokens = TokenService.getTokens();
            if (!tokens.accessToken) {
                log('ERROR', 'Token bulunamadı, çıkış yapılamıyor');
                throw new Error('Token bulunamadı');
            }

            const response = await api.post('/auth/logout');
            log('LOGOUT', 'Çıkış başarılı');
            
            // Token'ları temizle
            TokenService.clearTokens();
            
            return response;
        } catch (error) {
            log('ERROR', 'Çıkış hatası', error.message);
            
            if (error.response) {
                log('ERROR', 'Hata detayları', error.response.data);
            }
            
            throw error;
        }
    },

    // Token yenileme - interceptor döngüsüne girmemek için doğrudan axios kullanılıyor
    refreshToken: async (refreshToken) => {
        try {
            log('REFRESH', 'Token yenileme isteği başlatılıyor', { refreshToken: refreshToken ? refreshToken.substring(0, 10) + '...' : null });
            
            // LocalStorage durumunu incele
            TokenService.inspectToken();
            
            // 1. Refresh token kontrolü
            if (!refreshToken) {
                log('ERROR', 'Refresh token bulunamadı');
                throw new Error('Refresh token bulunamadı');
            }
            
            // 2. DirectApi ile istek gönder
            log('REFRESH', 'Backend isteği gönderiliyor', { endpoint: '/auth/refresh' });
            
            // CRITICAL: Bu işlemi kesinlikle interceptor'suz yapmalıyız
            // AXOIS.CREATE yerine doğrudan vanilla axios kullanıyoruz
            const headers = { 'Content-Type': 'application/json' };
            log('REFRESH', 'Request headers', headers);
            
            // CRITICAL: Doğrudan HTTP isteği gönder - interceptor olmadan
            const response = await axios({
                method: 'post',
                url: `${API_URL}/auth/refresh`,
                data: { refreshToken },
                headers: headers,
                withCredentials: true
            });
            
            // 3. Yanıt analizi
            log('REFRESH', 'Yanıt alındı', { status: response.status, statusText: response.statusText });
            
            if (!response || !response.data) {
                log('ERROR', 'Backend yanıtı boş');
                throw new Error('Backend yanıtı boş');
            }
            
            // 4. Token kontrolü
            const tokenData = response.data;
            log('REFRESH', 'Token yanıtı', {
                accessTokenReceived: !!tokenData.accessToken,
                refreshTokenReceived: !!tokenData.refreshToken,
                expiresInReceived: !!tokenData.expiresIn 
            });
            
            if (!tokenData.accessToken) {
                log('ERROR', 'Yeni access token alınamadı', tokenData);
                throw new Error('Yeni access token alınamadı');
            }
            
            // 5. Token kaydet - CRITICAL: Eski token değerlerini önce temizle
            log('REFRESH', 'Yeni tokenlar alındı, kaydediliyor...');
            
            // CRITICAL: Tüm token verilerini sıfırla
            TokenService.clearTokens();
            
            // Ardından yeni token'ları kaydet
            const username = localStorage.getItem('username');
            const saveResult = TokenService.saveTokens(
                tokenData.accessToken, 
                tokenData.refreshToken || refreshToken, // Yeni refresh token yoksa eskisini kullan
                tokenData.expiresIn,
                username
            );
            
            log('REFRESH', 'Token kaydetme sonucu', { success: saveResult });
            
            // CRITICAL: Axios headers'ı güncelle - bu olmadan requestler eski token'ı kullanabilir
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.accessToken}`;
            
            // 6. Yeni token durumunu kontrol et ve logla
            TokenService.inspectToken();
            
            // CRITICAL: Yeni tokenla şimdi test amaçlı bir backend isteği yap
            try {
                log('REFRESH', 'Yeni token ile test isteği yapılıyor...');
                const testResponse = await axios({
                    method: 'get',
                    url: `${API_URL}/admin/current`,
                    headers: {
                        'Authorization': `Bearer ${tokenData.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });
                
                log('REFRESH', 'Token test isteği başarılı!', {
                    status: testResponse.status,
                    data: testResponse.data ? 'Veri alındı' : 'Veri yok'
                });
            } catch (testError) {
                log('REFRESH', 'Token test isteği başarısız!', {
                    status: testError.response?.status,
                    message: testError.message
                });
                // Hata durumunda bile devam et, bu sadece bir test
            }
            
            // 7. Sonuç döndür - yeni token bilgisi
            return {
                ...tokenData,
                accessTokenFirstChars: tokenData.accessToken ? tokenData.accessToken.substring(0, 15) + '...' : null
            };
        } catch (error) {
            log('ERROR', 'Token yenileme hatası', error.message);
            
            // Hata detayını göster
            if (error.response) {
                log('ERROR', 'Backend hata detayları', error.response.data);
            }
            
            apiLog('AUTH SERVICE', 'Token yenileme başarısız oldu, otomatik logout olacak');
            
            // Tokenleri temizle
            TokenService.clearTokens();
            
            throw error;
        }
    },
    
    // Debug için token durumunu kontrol et
    checkTokenStatus: () => {
        return TokenService.inspectToken();
    }
};

export default AuthService;