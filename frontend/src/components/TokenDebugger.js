import React, { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import TokenService from '../services/TokenService';
import { directApi } from '../services/api';

// Basit stil tanımları
const styles = {
    container: {
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '350px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        zIndex: 9999,
        maxHeight: '90vh',
        overflowY: 'auto'
    },
    title: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '5px'
    },
    button: {
        backgroundColor: '#4CAF50',
        border: 'none',
        color: 'white',
        padding: '5px 10px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'inline-block',
        fontSize: '12px',
        margin: '2px',
        cursor: 'pointer',
        borderRadius: '3px'
    },
    buttonRed: {
        backgroundColor: '#f44336'
    },
    buttonBlue: {
        backgroundColor: '#2196F3'
    },
    infoBox: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        padding: '5px',
        fontSize: '12px',
        marginTop: '5px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
    },
    small: {
        fontSize: '10px',
        color: '#666'
    }
};

const TokenDebugger = () => {
    const [visible, setVisible] = useState(true);
    const [tokenInfo, setTokenInfo] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [testResponse, setTestResponse] = useState(null);
    const [testLoading, setTestLoading] = useState(false);
    const [testError, setTestError] = useState(null);

    // Token bilgilerini güncelle
    const updateTokenInfo = () => {
        const info = TokenService.getTokens();
        setTokenInfo(info);
        
        // Kalan süreyi hesapla
        if (info.tokenExpiry) {
            const now = new Date().getTime();
            const expiry = parseInt(info.tokenExpiry);
            const remaining = expiry - now;
            
            if (remaining > 0) {
                setTimeLeft({
                    ms: remaining,
                    seconds: Math.round(remaining / 1000),
                    minutes: Math.round(remaining / 60000)
                });
            } else {
                setTimeLeft({ ms: 0, seconds: 0, minutes: 0 });
            }
        } else {
            setTimeLeft(null);
        }
    };

    // Sayfa yüklendiğinde ve periyodik olarak güncelle
    useEffect(() => {
        updateTokenInfo();
        
        // Her 3 saniyede bir güncelle
        const interval = setInterval(() => {
            updateTokenInfo();
        }, 3000);
        
        return () => clearInterval(interval);
    }, []);

    // Token yenileme testi
    const testTokenRefresh = async () => {
        try {
            setTestLoading(true);
            setTestError(null);
            
            console.log('=== TEST: TOKEN YENİLEME BAŞLIYOR ===');
            
            const tokens = TokenService.getTokens();
            if (!tokens.refreshToken) {
                throw new Error('Refresh token bulunamadı!');
            }
            
            const response = await AuthService.refreshToken(tokens.refreshToken);
            console.log('=== TEST: TOKEN YENİLEME BAŞARILI ===');
            
            setTestResponse({
                success: true,
                data: {
                    accessToken: response.accessToken ? response.accessToken.substring(0, 15) + '...' : null,
                    refreshToken: response.refreshToken ? response.refreshToken.substring(0, 10) + '...' : null,
                    expiresIn: response.expiresIn
                }
            });
            
            // Token bilgilerini güncelle
            updateTokenInfo();
        } catch (error) {
            console.log('=== TEST: TOKEN YENİLEME HATASI ===', error);
            setTestError(error.message);
            setTestResponse({
                success: false,
                error: error.message
            });
        } finally {
            setTestLoading(false);
        }
    };

    // Test API çağrısı
    const testApiCall = async () => {
        try {
            setTestLoading(true);
            setTestError(null);
            setTestResponse(null);
            
            console.log('=== TEST: API ÇAĞRISI BAŞLIYOR ===');
            
            // Basit bir API endpoint'i çağır
            const response = await directApi.get('/admin/current');
            console.log('=== TEST: API ÇAĞRISI BAŞARILI ===');
            
            setTestResponse({
                success: true,
                status: response.status,
                data: response.data
            });
        } catch (error) {
            console.log('=== TEST: API ÇAĞRISI HATASI ===', error);
            
            setTestError(error.message);
            setTestResponse({
                success: false,
                status: error.response?.status,
                error: error.message,
                data: error.response?.data
            });
            
            // 401 hatası ve refresh token varsa otomatik yenilemeyi test et
            if (error.response?.status === 401) {
                const tokens = TokenService.getTokens();
                if (tokens.refreshToken) {
                    console.log('=== TEST: 401 HATASI ALINDI, OTOMATİK TOKEN YENİLEME DENENECEK ===');
                    try {
                        await testTokenRefresh();
                        console.log('=== TEST: OTOMATİK YENİLEME BAŞARILI, İSTEK TEKRAR DENENIYOR ===');
                        
                        // Token yenilendikten sonra isteği tekrar dene
                        const retryResponse = await directApi.get('/admin/current');
                        setTestResponse({
                            success: true,
                            retried: true,
                            status: retryResponse.status,
                            data: retryResponse.data
                        });
                    } catch (refreshError) {
                        console.log('=== TEST: OTOMATİK YENİLEME BAŞARISIZ ===', refreshError);
                    }
                }
            }
        } finally {
            setTestLoading(false);
        }
    };

    // Tüm localStorage'ı sıfırla
    const clearAllTokens = () => {
        localStorage.clear();
        setTokenInfo(null);
        setTimeLeft(null);
        setTestResponse(null);
        setTestError(null);
        window.location.reload();
    };

    if (!visible) return (
        <button 
            style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }} 
            onClick={() => setVisible(true)}
        >
            Show Token Debugger
        </button>
    );

    return (
        <div style={styles.container}>
            <div style={styles.title}>
                Token Debugger
                <button 
                    style={{ float: 'right', padding: '2px 5px', backgroundColor: '#999' }} 
                    onClick={() => setVisible(false)}
                >
                    X
                </button>
            </div>
            
            <div>
                <button style={styles.button} onClick={updateTokenInfo}>Token Durumunu Güncelle</button>
                <button style={{...styles.button, ...styles.buttonBlue}} onClick={testTokenRefresh}>Token Yenileme Testi</button>
                <button style={{...styles.button, ...styles.buttonBlue}} onClick={testApiCall}>API Çağrısı Testi</button>
                <button style={{...styles.button, ...styles.buttonRed}} onClick={clearAllTokens}>Tüm Tokenları Sil</button>
            </div>
            
            {tokenInfo && (
                <div style={styles.infoBox}>
                    <strong>Access Token:</strong> {tokenInfo.accessToken ? `${tokenInfo.accessToken.substring(0, 15)}...` : 'Yok'}<br/>
                    <strong>Refresh Token:</strong> {tokenInfo.refreshToken ? `${tokenInfo.refreshToken.substring(0, 10)}...` : 'Yok'}<br/>
                    <strong>Token Süresi Dolmuş:</strong> {tokenInfo.isExpired ? 'Evet' : 'Hayır'}<br/>
                    
                    {timeLeft && (
                        <>
                            <strong>Kalan Süre:</strong> {timeLeft.seconds} saniye ({timeLeft.minutes} dakika)<br/>
                        </>
                    )}
                    
                    {tokenInfo.tokenExpiry && (
                        <div style={styles.small}>
                            Son Kullanma: {new Date(parseInt(tokenInfo.tokenExpiry)).toLocaleString()}
                        </div>
                    )}
                </div>
            )}
            
            {testLoading && <div style={{...styles.infoBox, backgroundColor: '#fffde7'}}>İşlem yapılıyor...</div>}
            
            {testError && (
                <div style={{...styles.infoBox, backgroundColor: '#ffebee'}}>
                    <strong>Hata:</strong> {testError}
                </div>
            )}
            
            {testResponse && (
                <div style={{...styles.infoBox, backgroundColor: testResponse.success ? '#e8f5e9' : '#ffebee'}}>
                    <strong>Test Sonucu:</strong><br/>
                    <pre>{JSON.stringify(testResponse, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default TokenDebugger; 