import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Clock, User, MapPin, ChevronLeft, ChevronRight, Check, ArrowRight, CheckCircle } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import './AlertCenter.css';

const AlertCenter = () => {
    const { 
        unresolvedAlerts, 
        allAlerts, 
        silentMode, 
        toggleSilentMode, 
        markAlertAsViewed, 
        markAllAlertsAsViewed 
    } = useAlerts();
    
    const [showNotifications, setShowNotifications] = useState(true);
    const [showPanel, setShowPanel] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
    const alertsPerPage = 5;
    
    // Bildirimleri kapat ve görüldü olarak işaretle
    const closeNotifications = () => {
        setShowNotifications(false);
        // Tüm aktif uyarıları görüldü olarak işaretle
        markAllAlertsAsViewed();
    };
    
    // Sonraki bildirimi göster
    const showNextAlert = () => {
        // Mevcut uyarıyı görüldü olarak işaretle
        if (unresolvedAlerts.length > 0) {
            markAlertAsViewed(unresolvedAlerts[currentAlertIndex].id);
        }
        
        // Sonraki uyarıya geç veya ilk uyarıya dön
        setCurrentAlertIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            return nextIndex < unresolvedAlerts.length ? nextIndex : 0;
        });
    };
    
    // Mevcut bildirimi görüldü olarak işaretle ve kabul et
    const acceptCurrentAlert = () => {
        if (unresolvedAlerts.length > 0) {
            markAlertAsViewed(unresolvedAlerts[currentAlertIndex].id);
        }
        
        // İndeksi güncelleyerek varsa sonraki uyarıyı göster
        if (unresolvedAlerts.length > 1) {
            setCurrentAlertIndex(prevIndex => {
                if (prevIndex >= unresolvedAlerts.length - 1) {
                    return 0;
                }
                return prevIndex;
            });
        } else {
            // Son uyarı da kapatıldı
            setShowNotifications(false);
        }
    };
    
    // Paneli aç/kapat
    const togglePanel = () => {
        setShowPanel(prev => !prev);
    };
    
    // Bildirimleri aç ve ilk bildirimine geçiş
    useEffect(() => {
        if (unresolvedAlerts.length > 0) {
            setShowNotifications(true);
            setCurrentAlertIndex(0);
        } else {
            // Hiç görülmeyen uyarı kalmadıysa bildirimleri kapat
            setShowNotifications(false);
        }
    }, [unresolvedAlerts]);
    
    // Alarmları formatla
    const formatAlertDate = (dateString) => {
        if (!dateString) return ''; 
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR');
    };
    
    // Sayfalama hesaplamaları
    const indexOfLastAlert = currentPage * alertsPerPage;
    const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
    const currentAlerts = allAlerts.slice(indexOfFirstAlert, indexOfLastAlert);
    const totalPages = Math.ceil(allAlerts.length / alertsPerPage);
    
    // Sayfa değiştirme fonksiyonları
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };
    
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };
    
    return (
        <>
            {/* Ana alarm merkezi butonu */}
            <div className="alert-center">
                <div 
                    className={`alert-icon ${unresolvedAlerts.length > 0 ? 'has-alerts' : ''}`}
                    onClick={togglePanel}
                    title="Uyarı Panelini Aç/Kapat"
                >
                    {silentMode ? <BellOff size={20} /> : <Bell size={20} />}
                    {unresolvedAlerts.length > 0 && (
                        <span className="alert-badge">{unresolvedAlerts.length}</span>
                    )}
                </div>
                
                {/* Sessiz mod butonu (panel içine taşındı) */}
            </div>
            
            {/* Uyarı Paneli */}
            {showPanel && (
                <div className="alert-panel">
                    <div className="alert-panel-header">
                        <h3>Uyarılar</h3>
                        <div className="alert-panel-actions">
                            <button 
                                className={`silent-mode-button ${silentMode ? 'active' : ''}`}
                                onClick={toggleSilentMode}
                                title={silentMode ? 'Bildirimleri Aç' : 'Bildirimleri Kapat'}
                            >
                                {silentMode ? <BellOff size={16} /> : <Bell size={16} />}
                            </button>
                            <button 
                                className="close-button"
                                onClick={togglePanel}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="alert-panel-content">
                        {allAlerts.length === 0 ? (
                            <div className="no-alerts">Hiç uyarı bulunmamaktadır.</div>
                        ) : (
                            <>
                                <div className="alert-list">
                                    {currentAlerts.map((alert) => (
                                        <div 
                                            key={alert.id} 
                                            className={`alert-item ${alert.resolved ? 'resolved' : ''}`}
                                            style={{
                                                borderLeft: `4px solid ${alert.alertType?.colorCode || '#dc3545'}`
                                            }}
                                        >
                                            <div className="alert-item-header">
                                                <strong>{alert.alertType?.name || 'Alarm'}</strong>
                                                {alert.resolved && (
                                                    <span className="resolved-badge">
                                                        <Check size={12} />
                                                        Çözüldü
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="alert-item-message">
                                                {alert.alertMessage}
                                            </div>
                                            
                                            <div className="alert-item-details">
                                                <div className="alert-item-detail">
                                                    <User size={14} />
                                                    <span>{alert.personnel?.name} {alert.personnel?.surname}</span>
                                                </div>
                                                <div className="alert-item-detail">
                                                    <MapPin size={14} />
                                                    <span>{alert.door?.name || 'Bilinmeyen kapı'}</span>
                                                </div>
                                                <div className="alert-item-detail">
                                                    <Clock size={14} />
                                                    <span>{formatAlertDate(alert.createdAt)}</span>
                                                </div>
                                            </div>
                                            
                                            {alert.resolved && alert.resolvedByAdmin && (
                                                <div className="resolved-info">
                                                    <div className="resolved-by">
                                                        <User size={14} />
                                                        <span>{alert.resolvedByAdmin.username} tarafından çözüldü</span>
                                                    </div>
                                                    {alert.resolvedAt && (
                                                        <div className="resolved-at">
                                                            <Clock size={14} />
                                                            <span>{formatAlertDate(alert.resolvedAt)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Sayfalama */}
                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button 
                                            onClick={goToPreviousPage} 
                                            disabled={currentPage === 1}
                                            className="pagination-button"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="page-info">
                                            {currentPage}/{totalPages}
                                        </span>
                                        <button 
                                            onClick={goToNextPage} 
                                            disabled={currentPage === totalPages}
                                            className="pagination-button"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {/* Anlık bildirimler - Sessiz modda değilse ve gösterilmesi gerekiyorsa */}
            {!silentMode && showNotifications && unresolvedAlerts.length > 0 && (
                <div className="alert-notifications-container">
                    {unresolvedAlerts.length > 0 && (
                        <div 
                            key={unresolvedAlerts[currentAlertIndex].id} 
                            className="alert-notification"
                            style={{
                                borderLeft: `4px solid ${unresolvedAlerts[currentAlertIndex].alertType?.colorCode || '#dc3545'}`
                            }}
                        >
                            <div className="notification-header">
                                <div className="notification-title">
                                    <strong>{unresolvedAlerts[currentAlertIndex].alertType?.name || 'Alarm'}</strong>
                                </div>
                                <div className="notification-actions">
                                    <button 
                                        className="accept-alert-button"
                                        onClick={acceptCurrentAlert}
                                        title="Tamam"
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                    {unresolvedAlerts.length > 1 && (
                                        <button 
                                            className="next-alert-button"
                                            onClick={showNextAlert}
                                            title="Sonraki Uyarı"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                    <button 
                                        className="close-button"
                                        onClick={closeNotifications}
                                        title="Tüm Bildirimleri Kapat"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="notification-message">
                                {unresolvedAlerts[currentAlertIndex].alertMessage}
                            </div>
                            
                            <div className="notification-details">
                                <div className="notification-detail">
                                    <User size={14} />
                                    <span>{unresolvedAlerts[currentAlertIndex].personnel?.name} {unresolvedAlerts[currentAlertIndex].personnel?.surname}</span>
                                </div>
                                <div className="notification-detail">
                                    <MapPin size={14} />
                                    <span>{unresolvedAlerts[currentAlertIndex].door?.name || 'Bilinmeyen kapı'}</span>
                                </div>
                                <div className="notification-detail">
                                    <Clock size={14} />
                                    <span>{formatAlertDate(unresolvedAlerts[currentAlertIndex].createdAt)}</span>
                                </div>
                            </div>
                            
                            <div className="notification-counter">
                                {currentAlertIndex + 1}/{unresolvedAlerts.length}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AlertCenter; 