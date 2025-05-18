import React, { createContext, useState, useContext, useEffect } from 'react';
import AlertService from '../services/AlertService';

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [unresolvedAlerts, setUnresolvedAlerts] = useState([]);
    const [allAlerts, setAllAlerts] = useState([]);
    const [viewedAlerts, setViewedAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [silentMode, setSilentMode] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(5000); // 5 saniye - daha sık güncellemek için
    
    // Görülmüş uyarıları localStorage'dan yükle
    useEffect(() => {
        const savedViewedAlerts = localStorage.getItem('viewedAlerts');
        if (savedViewedAlerts) {
            try {
                setViewedAlerts(JSON.parse(savedViewedAlerts));
            } catch (err) {
                console.error('Görülmüş uyarılar yüklenemedi:', err);
                localStorage.removeItem('viewedAlerts');
            }
        }
    }, []);

    // Alarmları yükle
    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Çözülmemiş alarmları getir
            const unresolvedData = await AlertService.getUnresolvedAlerts();
            
            // Görülmemiş uyarıları filtreleme
            const unviewedAlerts = unresolvedData.filter(alert => 
                !viewedAlerts.includes(alert.id)
            );
            
            setUnresolvedAlerts(unviewedAlerts);
            
            // Tüm alarmları getir
            const allAlertsData = await AlertService.getAllAlerts();
            setAllAlerts(allAlertsData);
            
            return unviewedAlerts.length;
        } catch (err) {
            console.error('Alarmlar yüklenemedi:', err);
            setError('Alarmlar yüklenirken bir hata oluştu.');
            return 0;
        } finally {
            setLoading(false);
        }
    };
    
    // Bir uyarıyı görüldü olarak işaretle
    const markAlertAsViewed = (alertId) => {
        if (!viewedAlerts.includes(alertId)) {
            const updatedViewedAlerts = [...viewedAlerts, alertId];
            setViewedAlerts(updatedViewedAlerts);
            localStorage.setItem('viewedAlerts', JSON.stringify(updatedViewedAlerts));
            
            // Anlık uyarı listesini güncelle
            setUnresolvedAlerts(prevAlerts => 
                prevAlerts.filter(alert => alert.id !== alertId)
            );
        }
    };
    
    // Tüm uyarıları görüldü olarak işaretle
    const markAllAlertsAsViewed = () => {
        const alertIds = unresolvedAlerts.map(alert => alert.id);
        const updatedViewedAlerts = [...new Set([...viewedAlerts, ...alertIds])];
        setViewedAlerts(updatedViewedAlerts);
        localStorage.setItem('viewedAlerts', JSON.stringify(updatedViewedAlerts));
        setUnresolvedAlerts([]);
    };

    // İlk yükleme ve polling için
    useEffect(() => {
        // İlk veri çekme
        fetchAlerts();

        // Polling interval ile veri yenileme
        const intervalId = setInterval(async () => {
            await fetchAlerts();
        }, pollingInterval);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [pollingInterval, viewedAlerts]);

    // Sessiz modu aç/kapat
    const toggleSilentMode = () => {
        setSilentMode(prev => !prev);
        // Tercihi localStorage'a kaydet
        localStorage.setItem('alertSilentMode', !silentMode);
    };

    // LocalStorage'dan sessiz mod tercihini yükle
    useEffect(() => {
        const savedSilentMode = localStorage.getItem('alertSilentMode');
        if (savedSilentMode !== null) {
            setSilentMode(savedSilentMode === 'true');
        }
    }, []);

    // Context değerleri
    const value = {
        unresolvedAlerts,
        allAlerts,
        loading,
        error,
        silentMode,
        toggleSilentMode,
        setPollingInterval,
        refreshAlerts: fetchAlerts,
        markAlertAsViewed,
        markAllAlertsAsViewed
    };

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContext; 