import React, { useEffect, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { AuthLogProvider } from './context/AuthLogContext';
import PersonnelManagement from "./pages/PersonnelManagement";
import AccessLogHistory from "./pages/AccessLogHistory";
import CardManagement from "./pages/CardManagement";
import CardManagementPage from "./pages/CardManagementPage";
import PersonnelBlacklistManagement from "./pages/PersonnelBlacklistManagement";
import PersonnelBlacklistReasonManagement from "./pages/PersonnelBlacklistReasonManagement";
import CardBlacklistReasonManagement from "./pages/CardBlacklistReasonManagement";
import DoorManagement from "./pages/DoorManagement";
import PermissionGroupManagement from "./pages/PermissionGroupManagement";
import AccessDirectionManagement from "./pages/AccessDirectionManagement";
import DoorTypeManagement from "./pages/DoorTypeManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import TeamManagement from "./pages/TeamManagement";
import AdminProfile from "./pages/AdminProfile";
import AdminManagement from "./pages/AdminManagement";
import TokenService from './services/TokenService';
import PersonTypeManagement from "./pages/PersonTypeManagement";
import CardTypeManagement from "./pages/CardTypeManagement";


// Korumalı Route bileşeni
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, refreshToken } = useAuth();
    const [isCheckingToken, setIsCheckingToken] = useState(true);
    
    // Token durumunu kontrol eden fonksiyon - memoize edilmiş
    const checkTokenStatus = useCallback(async () => {
        try {
            console.log('ProtectedRoute: Token durumu kontrol ediliyor...');
            setIsCheckingToken(true);
            
            // TokenService ile token durumunu kontrol et - taze veri al
            const tokens = TokenService.getTokens();
            
            // 1. Token hiç yok - login sayfasına yönlendir
            if (!tokens.accessToken && !tokens.refreshToken) {
                console.log('ProtectedRoute: Token bulunamadı, oturum yok');
                return false;
            }
            
            // 1.1 Token formatı geçersizse - token'ı yenilemeyi dene
            if (tokens.accessToken && !tokens.isValidFormat) {
                console.log('ProtectedRoute: Token formatı geçersiz, yenileme denenecek');
                
                if (tokens.refreshToken) {
                    // Yenileme token'ı varsa refresh yap
                    try {
                        const newToken = await refreshToken();
                        if (newToken) {
                            console.log('ProtectedRoute: Format sorunu olan token yenilendi');
                            return true;
                        }
                    } catch (refreshError) {
                        console.error('ProtectedRoute: Token yenileme hatası', refreshError);
                        // Token yenileme başarısız - login'e yönlendir
                        return false;
                    }
                }
                
                console.log('ProtectedRoute: Geçersiz token formatı, refresh token yok');
                return false;
            }
            
            // 2. Token süresi dolmuş ama refresh token var - yenileme yap
            if (((!tokens.accessToken || tokens.isExpired) && tokens.refreshToken)) {
                console.log('ProtectedRoute: Token süresi dolmuş veya geçersiz, yenileme deneniyor...');
                
                try {
                    // refreshToken fonksiyonu AuthContext'ten gelir
                    const newToken = await refreshToken();
                    
                    // Başarısız olduysa false döndür
                    if (!newToken) {
                        console.log('ProtectedRoute: Token yenileme başarısız oldu');
                        return false;
                    }
                    
                    // Yeni token'ı kontrol et - format geçerli mi
                    const tokensAfterRefresh = TokenService.getTokens();
                    if (!tokensAfterRefresh.isValidFormat) {
                        console.log('ProtectedRoute: Yeni token formatı geçersiz!');
                        return false;
                    }
                    
                    console.log('ProtectedRoute: Token başarıyla yenilendi');
                    return true;
                } catch (refreshError) {
                    console.error('ProtectedRoute: Token yenileme işlemi başarısız oldu', refreshError);
                    return false;
                }
            }
            
            // 3. Token var ve geçerli - devam et
            if (tokens.accessToken && !tokens.isExpired) {
                // Format kontrolü de yap
                if (!tokens.isValidFormat) {
                    console.log('ProtectedRoute: Token formatı geçersiz ama süresi dolmamış');
                    // Bu durumda refresh token varsa yenilemeyi dene
                    if (tokens.refreshToken) {
                        try {
                            const newToken = await refreshToken();
                            if (newToken) {
                                console.log('ProtectedRoute: Geçersiz formattaki token yenilendi');
                                return true;
                            }
                        } catch (error) {
                            console.error('ProtectedRoute: Format hatası ile token yenileme başarısız', error);
                        }
                        return false;
                    }
                    
                    return false;
                }
                
                console.log('ProtectedRoute: Token geçerli, giriş yapılmış');
                return true;
            }
            
            // Diğer durumlar için false döndür
            console.log('ProtectedRoute: Token durumu geçersiz');
            return false;
        } catch (error) {
            console.error('ProtectedRoute: Token kontrolü sırasında hata oluştu', error);
            return false;
        } finally {
            setIsCheckingToken(false);
        }
    }, [refreshToken]);
    
    // Sayfa yüklendiğinde token kontrolü yap
    useEffect(() => {
        console.log('ProtectedRoute: Component mount oldu, token kontrolü yapılacak');
        checkTokenStatus();
    }, [checkTokenStatus]);

    // Yükleme durumunda bekletme ekranı göster
    if (loading || isCheckingToken) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    // Oturum açılmamışsa login sayfasına yönlendir
    if (!isAuthenticated) {
        console.log('ProtectedRoute: Oturum açılmamış, login sayfasına yönlendiriliyor');
        return <Navigate to="/login" />;
    }

    // Her şey yolundaysa içeriği göster
    console.log('ProtectedRoute: Oturum doğrulandı, sayfa gösteriliyor');
    return children;
};

function App() {
    return (
        <AuthProvider>
            <AlertProvider>
                <AuthLogProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/personnel"
                                element={
                                    <ProtectedRoute>
                                        <PersonnelManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/accessloghistory"
                                element={
                                    <ProtectedRoute>
                                        <AccessLogHistory />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/personnelblacklistmanagement"
                                element={
                                    <ProtectedRoute>
                                        <PersonnelBlacklistManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/cardmanagement"
                                element={
                                    <ProtectedRoute>
                                        <CardManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/card-management"
                                element={
                                    <ProtectedRoute>
                                        <CardManagementPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/personnel-blacklist-reasons"
                                element={
                                    <ProtectedRoute>
                                        <PersonnelBlacklistReasonManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/card-blacklist-reasons"
                                element={
                                    <ProtectedRoute>
                                        <CardBlacklistReasonManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/doors-management"
                                element={
                                    <ProtectedRoute>
                                        <DoorManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/permission-groups-management"
                                element={
                                    <ProtectedRoute>
                                        <PermissionGroupManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/door-directions-management"
                                element={
                                    <ProtectedRoute>
                                        <AccessDirectionManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/door-types-management"
                                element={
                                    <ProtectedRoute>
                                        <DoorTypeManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/departments-management"
                                element={
                                    <ProtectedRoute>
                                        <DepartmentManagement />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route
                                path="/teams-management"
                                element={
                                    <ProtectedRoute>
                                        <TeamManagement />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <AdminProfile />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route
                                path="/admin-management"
                                element={
                                    <ProtectedRoute>
                                        <AdminManagement />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route
                                path="/person-types-management"
                                element={
                                    <ProtectedRoute>
                                        <PersonTypeManagement />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route
                                path="/card-types-management"
                                element={
                                    <ProtectedRoute>
                                        <CardTypeManagement />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route path="/" element={<Navigate to="/login" />} />
                        </Routes>
                    </Router>
                </AuthLogProvider>
            </AlertProvider>
        </AuthProvider>
    );
}

export default App;