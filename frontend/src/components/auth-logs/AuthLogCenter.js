import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Clock, User, MapPin, ChevronLeft, ChevronRight, Check, ArrowRight, CheckCircle, DoorClosed, Key } from 'lucide-react';
import { useAuthLogs } from '../../context/AuthLogContext';
import './AuthLogCenter.css';

const AuthLogCenter = () => {
    const { 
        recentLogs, 
        allLogs, 
        groupedLogs,
        silentMode, 
        toggleSilentMode, 
        markLogAsViewed, 
        markAllLogsAsViewed 
    } = useAuthLogs();
    
    const [showNotifications, setShowNotifications] = useState(true);
    const [showPanel, setShowPanel] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLogIndex, setCurrentLogIndex] = useState(0);
    const logsPerPage = 15;
    
    // Bildirimleri kapat ve görüldü olarak işaretle
    const closeNotifications = () => {
        setShowNotifications(false);
        // Tüm aktif logları görüldü olarak işaretle
        markAllLogsAsViewed();
    };
    
    // Sonraki bildirimi göster
    const showNextLog = () => {
        // Mevcut logu görüldü olarak işaretle
        if (recentLogs.length > 0) {
            const logId = recentLogs[currentLogIndex].id || recentLogs[currentLogIndex].mainLog?.id;
            markLogAsViewed(logId);
        }
        
        // Sonraki loga geç veya ilk loga dön
        setCurrentLogIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            return nextIndex < recentLogs.length ? nextIndex : 0;
        });
    };
    
    // Mevcut bildirimi görüldü olarak işaretle ve kabul et
    const acceptCurrentLog = () => {
        if (recentLogs.length > 0) {
            const logId = recentLogs[currentLogIndex].id || recentLogs[currentLogIndex].mainLog?.id;
            markLogAsViewed(logId);
        }
        
        // İndeksi güncelleyerek varsa sonraki logu göster
        if (recentLogs.length > 1) {
            setCurrentLogIndex(prevIndex => {
                if (prevIndex >= recentLogs.length - 1) {
                    return 0;
                }
                return prevIndex;
            });
        } else {
            // Son log da kapatıldı
            setShowNotifications(false);
        }
    };
    
    // Paneli aç/kapat
    const togglePanel = () => {
        setShowPanel(prev => !prev);
    };
    
    // Bildirimleri aç ve ilk bildirimine geçiş
    useEffect(() => {
        if (recentLogs.length > 0) {
            setShowNotifications(true);
            setCurrentLogIndex(0);
        } else {
            // Hiç görülmeyen log kalmadıysa bildirimleri kapat
            setShowNotifications(false);
        }
    }, [recentLogs]);
    
    // Tarih formatla
    const formatLogDate = (dateString) => {
        if (!dateString) return ''; 
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR');
    };
    
    // Kapı listesini formatla
    const formatDoorList = (doors) => {
        if (!doors || doors.length === 0) return "Belirtilmemiş";
        
        if (doors.length === 1) {
            return doors[0].name;
        }
        
        // Tüm kapı isimlerini göster
        return doors.map(door => door.name).join(', ');
    };
    
    // Grup izinlerini formatla
    const formatPermissionGroups = (groups) => {
        if (!groups || groups.length === 0) return "";
        
        if (groups.length === 1) {
            return groups[0].name;
        }
        
        // Tüm grup isimlerini göster
        return groups.map(group => group.name).join(', ');
    };
    
    // Sayfalama hesaplamaları
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = groupedLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(groupedLogs.length / logsPerPage);
    
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
    
    // Log detaylarını oluştur
    const createLogMessage = (log) => {
        if (log.isGroup) {
            if (log.doors.length > 0) {
                const doorNames = log.doors.map(door => door.name).join(', ');
                return `${log.personnel?.name} ${log.personnel?.surname} personeline ${log.doorCount} kapı yetkisi verildi: ${doorNames}`;
            } else if (log.permissionGroups.length > 0) {
                const groupNames = log.permissionGroups.map(group => group.name).join(', ');
                return `${log.personnel?.name} ${log.personnel?.surname} personeline ${log.permissionGroups.length} yetki grubu atandı: ${groupNames}`;
            }
        }
        
        return log.description || `${log.personnel?.name} ${log.personnel?.surname} için yetki işlemi yapıldı`;
    };
    
    return (
        <>
            {/* Ana yetki merkezi butonu */}
            <div className="auth-log-center">
                <div 
                    className={`auth-log-icon ${recentLogs.length > 0 ? 'has-logs' : ''}`}
                    onClick={togglePanel}
                    title="Yetki İşlemleri Panelini Aç/Kapat"
                >
                    {silentMode ? <BellOff size={20} /> : <Key size={20} />}
                    {recentLogs.length > 0 && (
                        <span className="auth-log-badge">{recentLogs.length}</span>
                    )}
                </div>
            </div>
            
            {/* Yetki Paneli */}
            {showPanel && (
                <div className="auth-log-panel">
                    <div className="auth-log-panel-header">
                        <h3>Yetki İşlemleri</h3>
                        <div className="auth-log-panel-actions">
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
                    
                    <div className="auth-log-panel-content">
                        {groupedLogs.length === 0 ? (
                            <div className="no-logs">Hiç yetki işlemi kaydı bulunmamaktadır.</div>
                        ) : (
                            <>
                                <div className="auth-log-list">
                                    {currentLogs.map((log) => (
                                        <div 
                                            key={log.id || `group-${log.mainLog?.id}`} 
                                            className={`auth-log-item ${log.isGroup ? 'grouped' : ''}`}
                                        >
                                            <div className="auth-log-item-header">
                                                <strong>
                                                    {log.isGroup 
                                                        ? `Toplu Yetki - ${log.doorCount} Kapı` 
                                                        : log.actionType?.name || 'Yetki İşlemi'}
                                                </strong>
                                                <span className="auth-date">
                                                    {formatLogDate(log.authDate)}
                                                </span>
                                            </div>
                                            
                                            <div className="auth-log-item-message">
                                                {createLogMessage(log)}
                                            </div>
                                            
                                            <div className="auth-log-item-details">
                                                <div className="auth-log-item-detail">
                                                    <User size={14} />
                                                    <span>Personel: {log.personnel?.name} {log.personnel?.surname}</span>
                                                </div>
                                                <div className="auth-log-item-detail">
                                                    <User size={14} />
                                                    <span>Admin: {log.admin?.name} {log.admin?.surname}</span>
                                                </div>
                                                {log.isGroup ? (
                                                    <div className="auth-log-item-detail">
                                                        <DoorClosed size={14} />
                                                        <span>Kapılar: {formatDoorList(log.doors)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="auth-log-item-detail">
                                                        <DoorClosed size={14} />
                                                        <span>Kapı: {log.door?.name || 'Belirtilmemiş'}</span>
                                                    </div>
                                                )}
                                                {(log.permissionGroup || (log.isGroup && log.permissionGroups.length > 0)) && (
                                                    <div className="auth-log-item-detail">
                                                        <Key size={14} />
                                                        <span>
                                                            Yetki Grubu: {
                                                                log.isGroup 
                                                                    ? formatPermissionGroups(log.permissionGroups)
                                                                    : log.permissionGroup?.name || 'Belirtilmemiş'
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
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
            
            {/* Anlık bildirimler */}
            {!silentMode && showNotifications && recentLogs.length > 0 && (
                <div className="auth-log-notifications-container">
                    {recentLogs.length > 0 && (
                        <div 
                            key={recentLogs[currentLogIndex].id || `group-${recentLogs[currentLogIndex].mainLog?.id}`} 
                            className="auth-log-notification"
                        >
                            <div className="notification-header">
                                <div className="notification-title">
                                    <strong>
                                        {recentLogs[currentLogIndex].isGroup 
                                            ? `Toplu Yetki - ${recentLogs[currentLogIndex].doorCount} Kapı` 
                                            : recentLogs[currentLogIndex].actionType?.name || 'Yetki İşlemi'}
                                    </strong>
                                </div>
                                <div className="notification-actions">
                                    <button 
                                        className="accept-auth-log-button"
                                        onClick={acceptCurrentLog}
                                        title="Tamam"
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                    {recentLogs.length > 1 && (
                                        <button 
                                            className="next-auth-log-button"
                                            onClick={showNextLog}
                                            title="Sonraki Bildirim"
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
                                {createLogMessage(recentLogs[currentLogIndex])}
                            </div>
                            
                            <div className="notification-details">
                                <div className="notification-detail">
                                    <User size={14} />
                                    <span>Admin: {recentLogs[currentLogIndex].admin?.name} {recentLogs[currentLogIndex].admin?.surname}</span>
                                </div>
                                <div className="notification-detail">
                                    <Clock size={14} />
                                    <span>{formatLogDate(recentLogs[currentLogIndex].authDate)}</span>
                                </div>
                            </div>
                            
                            <div className="notification-counter">
                                {currentLogIndex + 1}/{recentLogs.length}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AuthLogCenter; 