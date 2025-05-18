import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import '../styles/AdminProfile.css';

const AdminProfile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Şifre değiştirme state'leri
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!user || !user.username) {
                navigate('/login');
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/api/admins/by-username/${user.username}`);
                setAdminData(response.data);
            } catch (err) {
                console.error('Admin bilgileri yüklenirken hata oluştu:', err);
                setError('Admin bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchAdminData();
    }, [user, navigate]);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Hata mesajlarını temizle
        setPasswordError(null);
        setPasswordSuccess(null);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);
        
        // Basit doğrulama
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
            return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Yeni şifre ve onay şifresi eşleşmiyor.');
            return;
        }
        
        try {
            // Şifre değiştirme API çağrısı
            await api.post('/auth/change-password', {
                username: user.username,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            setPasswordSuccess('Şifreniz başarıyla değiştirildi.');
            
            // Form alanlarını temizle
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            console.error('Şifre değiştirirken hata oluştu:', err);
            setPasswordError(err.response?.data || 'Şifre değiştirme işlemi başarısız oldu. Lütfen tekrar deneyin.');
        }
    };

    if (loading) {
        return (
            <Layout pageTitle="Admin Profili">
                <div className="admin-profile-loading">
                    <div className="spinner"></div>
                    <p>Admin bilgileri yükleniyor...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout pageTitle="Admin Profili">
                <div className="admin-profile-error">
                    <AlertTriangle size={48} />
                    <h2>Hata Oluştu</h2>
                    <p>{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Admin Profili">
            <div className="admin-profile-container">
                <div className="admin-profile-header">
                    <div className="admin-avatar">
                        <User size={64} />
                    </div>
                    <div className="admin-info">
                        <h1>{adminData?.name} {adminData?.surname}</h1>
                        <p className="admin-username">@{user?.username}</p>
                    </div>
                </div>

                <div className="admin-profile-content">
                    <div className="admin-details-card">
                        <h2>Admin Bilgileri</h2>
                        <div className="admin-details">
                            <div className="detail-item">
                                <span className="detail-label">Ad:</span>
                                <span className="detail-value">{adminData?.name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Soyad:</span>
                                <span className="detail-value">{adminData?.surname}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Kullanıcı Adı:</span>
                                <span className="detail-value">{user?.username}</span>
                            </div>
                        </div>
                    </div>

                    <div className="admin-password-card">
                        <h2>Şifre Değiştir</h2>
                        {passwordError && (
                            <div className="password-error">
                                <AlertTriangle size={16} />
                                <span>{passwordError}</span>
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="password-success">
                                <span>{passwordSuccess}</span>
                            </div>
                        )}
                        <form onSubmit={handlePasswordSubmit} className="password-form">
                            <div className="form-group">
                                <label htmlFor="currentPassword">Mevcut Şifre</label>
                                <div className="password-input">
                                    <Lock size={16} />
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">Yeni Şifre</label>
                                <div className="password-input">
                                    <Lock size={16} />
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
                                <div className="password-input">
                                    <Lock size={16} />
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="change-password-button">
                                <Save size={16} />
                                Şifreyi Değiştir
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminProfile; 