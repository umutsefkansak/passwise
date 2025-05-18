import axios from 'axios';
import TokenService from './TokenService';

// API temel URL'i
//const API_URL = 'http://172.18.220.175:8080'; // Spring Boot backend URL'inizi buraya yazın
const API_URL = 'http://192.168.184.81:8080';
// Loglama fonksiyonu 
const log = (source, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${source}] ${message}`, data ? data : '');
};

// Axios instance oluştur
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // CORS ile credentials paylaşımı için önemli
});

// Direkt olarak backend'le iletişim için kullanılacak instance
// Bu instance interceptor kullanmaz, böylece sonsuz döngü oluşmaz
const directApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Vanilla axios ile direk istek yapmak için fonksiyon - interceptor olmadan
// Bu fonksiyon özellikle token yenilendikten sonra orijinal istekleri tekrarlamak için kullanılır
const makeDirectRequest = async (config) => {
    try {
        // Token'ları manuel olarak ekle
        const tokens = TokenService.getTokens();
        if (tokens.accessToken) {
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${tokens.accessToken}`
            };
        }

        // Doğrudan backend'e istek yap
        log('DIRECT', `Request ${config.method.toUpperCase()} ${config.url}`);
        const response = await axios(config);
        log('DIRECT', `Response ${response.status} ${config.method.toUpperCase()} ${config.url}`);
        return response;
    } catch (error) {
        log('DIRECT', `Error ${error.response?.status || ''} ${config.method.toUpperCase()} ${config.url}`, error.message);
        throw error;
    }
};

// Her istek için loglama
api.interceptors.request.use(request => {
    log('API REQUEST', `${request.method.toUpperCase()} ${request.url}`);
    return request;
});

api.interceptors.response.use(
    response => {
        log('API RESPONSE', `${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    error => {
        if (error.response) {
            log('API ERROR', `${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.data);
        } else {
            log('API ERROR', 'No response', error.message);
        }
        return Promise.reject(error);
    }
);

// DirectApi için de loglama
directApi.interceptors.request.use(request => {
    log('DIRECT API REQUEST', `${request.method.toUpperCase()} ${request.url}`);
    return request;
});

directApi.interceptors.response.use(
    response => {
        log('DIRECT API RESPONSE', `${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    error => {
        if (error.response) {
            log('DIRECT API ERROR', `${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.data);
        } else {
            log('DIRECT API ERROR', 'No response', error.message);
        }
        return Promise.reject(error);
    }
);

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
    (config) => {
        const tokens = TokenService.getTokens();
        if (tokens.accessToken) {
            log('AUTH HEADER', 'Token ekleniyor', { token: tokens.accessToken.substring(0, 15) + '...' });
            config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        } else {
            log('AUTH HEADER', 'Token bulunamadı');
        }
        return config;
    },
    (error) => {
        log('REQUEST ERROR', error.message);
        return Promise.reject(error);
    }
);

// Refresh token için kullanılacak
let isRefreshing = false;
let refreshSubscribers = [];

// Failed requests'i yeniden denemek için
const onRefreshed = (token) => {
    log('TOKEN REFRESH', `${refreshSubscribers.length} bekleyen istek yeniden deneniyor`);
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

// Refresh token beklerken gelen istekleri kuyruğa almak için
const addRefreshSubscriber = (callback) => {
    log('TOKEN REFRESH', 'İstek kuyruğa eklendi');
    refreshSubscribers.push(callback);
};

// Token yenileme fonksiyonu
const refreshAuthToken = async (refreshToken) => {
    log('TOKEN REFRESH', 'Token yenileme başlatılıyor', { refreshToken: refreshToken.substring(0, 10) + '...' });
    try {
        const response = await axios({
            method: 'post',
            url: `${API_URL}/auth/refresh`,
            data: { refreshToken },
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        });
        
        if (!response.data || !response.data.accessToken) {
            log('TOKEN REFRESH', 'Geçerli token alınamadı, yanıt:', response.data);
            throw new Error('Geçerli bir token alınamadı');
        }
        
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
        
        log('TOKEN REFRESH', 'Yanıt alındı', { 
            accessToken: accessToken ? accessToken.substring(0, 15) + '...' : null,
            newRefreshToken: newRefreshToken ? newRefreshToken.substring(0, 10) + '...' : null,
            expiresIn
        });
        
        // TokenService ile token bilgilerini güncelle
        const username = localStorage.getItem('username');
        const saveResult = TokenService.saveTokens(accessToken, newRefreshToken, expiresIn, username);
        log('TOKEN REFRESH', 'Token kaydetme sonucu', { success: saveResult });
        
        // Yeni token'ı döndür
        return accessToken;
    } catch (error) {
        log('TOKEN REFRESH', 'Hata oluştu', error.message);
        if (error.response) {
            log('TOKEN REFRESH', 'Hata detayları', error.response.data);
        }
        throw error;
    }
};

// Response interceptor - token süresi dolduğunda yenile
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (!originalRequest) {
            log('INTERCEPTOR', 'Orijinal istek bulunamadı', error.message);
            return Promise.reject(error);
        }

        // Token süresi doldu hatası (401) ve yeniden istek yapılmadıysa
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            log('INTERCEPTOR', '401 hatası yakalandı', { 
                url: originalRequest.url, 
                method: originalRequest.method 
            });
            
            if (isRefreshing) {
                // Eğer zaten token yenileme işlemi devam ediyorsa, isteği kuyruğa ekle
                log('INTERCEPTOR', 'Zaten token yenileme işlemi devam ediyor, istek kuyruğa ekleniyor');
                try {
                    const token = await new Promise((resolve, reject) => {
                        addRefreshSubscriber(token => {
                            resolve(token);
                        });
                    });
                    
                    log('INTERCEPTOR', 'Kuyruktaki istek için yeni token alındı', { 
                        token: token ? token.substring(0, 15) + '...' : null 
                    });
                    
                    // Tekrar istek yapılacak config'i hazırla
                    const newConfig = { ...originalRequest };
                    newConfig.headers['Authorization'] = `Bearer ${token}`;
                    
                    // Yeniden istek at - directApi ile yapmalıyız, interceptor döngüsünü önlemek için
                    log('INTERCEPTOR', 'Kuyruktaki istek tekrar gönderiliyor', {
                        url: newConfig.url,
                        method: newConfig.method
                    });
                    
                    // Manuel direct request kullan
                    return makeDirectRequest(newConfig);
                } catch (err) {
                    log('INTERCEPTOR', 'Kuyruktaki istek işlenirken hata oluştu', err.message);
                    return Promise.reject(err);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;
            log('INTERCEPTOR', 'Token yenileme işlemi başlatılıyor');

            try {
                // TokenService ile refresh token al
                const tokens = TokenService.getTokens();
                if (!tokens.refreshToken) {
                    log('INTERCEPTOR', 'Refresh token bulunamadı');
                    throw new Error('Refresh token bulunamadı');
                }

                // Token yenileme
                const accessToken = await refreshAuthToken(tokens.refreshToken);
                log('INTERCEPTOR', 'Token yenileme başarılı', { 
                    accessToken: accessToken ? accessToken.substring(0, 15) + '...' : null 
                });
                
                // Bekleyen istekleri bilgilendir
                onRefreshed(accessToken);

                // Orijinal config'i kopyala ve yeni token ile güncelle 
                const newConfig = { ...originalRequest };
                newConfig.headers['Authorization'] = `Bearer ${accessToken}`;
                
                isRefreshing = false;
                
                // Orijinal isteği tekrar gönder
                log('INTERCEPTOR', 'Orijinal istek yeni token ile tekrarlanıyor', {
                    url: newConfig.url,
                    method: newConfig.method
                });
                
                // ÖNEMLİ: Doğrudan axios kullanıyoruz, interceptor döngüsünü önlemek için
                return makeDirectRequest(newConfig);
            } catch (refreshError) {
                // Token yenileme başarısız, oturumu kapat
                log('INTERCEPTOR', 'Token yenilemesi başarısız oldu, oturum sonlandırılıyor', refreshError.message);
                
                // TokenService ile token bilgilerini temizle
                TokenService.clearTokens();
                localStorage.removeItem('username');
                
                isRefreshing = false;
                refreshSubscribers = [];
                
                // Kullanıcıyı logout olarak işaretle ve event yayınla
                try {
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                    log('INTERCEPTOR', 'auth:logout olayı tetiklendi');
                } catch (e) {
                    log('INTERCEPTOR', 'Event tetikleme hatası', e.message);
                }
                
                // Zorla login sayfasına yönlendir - bu kısım kritik, mutlaka çalışmalı
                setTimeout(() => {
                    log('INTERCEPTOR', 'Kullanıcı login sayfasına yönlendiriliyor');
                    window.location.href = '/login';
                }, 100);
                
                return Promise.reject(refreshError);
            }
        }

        // 401 dışındaki hatalar için
        return Promise.reject(error);
    }
);

export default api;
export { directApi, log, makeDirectRequest };