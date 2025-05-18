import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthLogService from '../services/AuthLogService';

const AuthLogContext = createContext();

export const useAuthLogs = () => useContext(AuthLogContext);

export const AuthLogProvider = ({ children }) => {
    const [recentLogs, setRecentLogs] = useState([]);
    const [allLogs, setAllLogs] = useState([]);
    const [groupedLogs, setGroupedLogs] = useState([]);
    const [viewedLogs, setViewedLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [silentMode, setSilentMode] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(5000); // 5 saniyeye düşürdük
    const [initialFetchDone, setInitialFetchDone] = useState(false); // Sayfa yenilemelerini takip için
    
    // Görülmüş logları localStorage'dan yükle
    useEffect(() => {
        const savedViewedLogs = localStorage.getItem('viewedAuthLogs');
        if (savedViewedLogs) {
            try {
                setViewedLogs(JSON.parse(savedViewedLogs));
            } catch (err) {
                console.error('Görülmüş yetki logları yüklenemedi:', err);
                localStorage.removeItem('viewedAuthLogs');
            }
        }
    }, []);

    // Logları yükle
    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Tüm logları getir
            const allLogsData = await AuthLogService.getAllAuthLogs();
            console.log('Alınan toplam log sayısı:', allLogsData.length);
            setAllLogs(allLogsData);
            
            // Logları gruplandır
            const groupedLogsData = AuthLogService.groupAuthLogsByBatch(allLogsData);
            console.log('Gruplandırılan log sayısı:', groupedLogsData.length);
            setGroupedLogs(groupedLogsData);
            
            // İlk yüklemede bildirimleri gösterme
            if (!initialFetchDone) {
                // İlk yükleme tamamlandı olarak işaretliyoruz
                setInitialFetchDone(true);
                
                // Tüm mevcut logların ID'lerini görüldü olarak işaretle (sadece ilk yüklemede)
                const existingLogIds = groupedLogsData.map(log => log.id || log.mainLog?.id);
                if (existingLogIds.length > 0) {
                    // Mevcut logları görüldü olarak işaretle
                    const updatedViewedLogs = [...new Set([...viewedLogs, ...existingLogIds])];
                    setViewedLogs(updatedViewedLogs);
                    localStorage.setItem('viewedAuthLogs', JSON.stringify(updatedViewedLogs));
                }
                
                setRecentLogs([]); // İlk yüklemede bildirim gösterme
                return 0;
            } 
            
            // Sonraki güncellemelerde görülmemiş yeni logları göster
            else {
                // Görülmemiş logları filtrele
                const unviewedLogs = groupedLogsData.filter(log => {
                    const logId = log.id || log.mainLog?.id;
                    return !viewedLogs.includes(logId);
                });
                
                console.log('Görülmemiş log sayısı:', unviewedLogs.length);
                setRecentLogs(unviewedLogs);
                
                return unviewedLogs.length;
            }
        } catch (err) {
            console.error('Yetki logları yüklenemedi:', err);
            setError('Yetki logları yüklenirken bir hata oluştu.');
            return 0;
        } finally {
            setLoading(false);
        }
    };
    
    // Bir logu görüldü olarak işaretle
    const markLogAsViewed = (logId) => {
        if (!viewedLogs.includes(logId)) {
            const updatedViewedLogs = [...viewedLogs, logId];
            setViewedLogs(updatedViewedLogs);
            localStorage.setItem('viewedAuthLogs', JSON.stringify(updatedViewedLogs));
            
            // Anlık log listesini güncelle
            setRecentLogs(prevLogs => 
                prevLogs.filter(log => (log.id || log.mainLog?.id) !== logId)
            );
        }
    };
    
    // Tüm logları görüldü olarak işaretle
    const markAllLogsAsViewed = () => {
        const logIds = recentLogs.map(log => log.id || log.mainLog?.id);
        const updatedViewedLogs = [...new Set([...viewedLogs, ...logIds])];
        setViewedLogs(updatedViewedLogs);
        localStorage.setItem('viewedAuthLogs', JSON.stringify(updatedViewedLogs));
        setRecentLogs([]);
    };

    // İlk yükleme ve polling için
    useEffect(() => {
        // İlk veri çekme
        fetchLogs();

        // Polling interval ile veri yenileme
        const intervalId = setInterval(async () => {
            await fetchLogs();
        }, pollingInterval);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [pollingInterval, viewedLogs]);

    // Sessiz modu aç/kapat
    const toggleSilentMode = () => {
        setSilentMode(prev => !prev);
        // Tercihi localStorage'a kaydet
        localStorage.setItem('authLogSilentMode', !silentMode);
    };

    // LocalStorage'dan sessiz mod tercihini yükle
    useEffect(() => {
        const savedSilentMode = localStorage.getItem('authLogSilentMode');
        if (savedSilentMode !== null) {
            setSilentMode(savedSilentMode === 'true');
        }
    }, []);

    // Context değerleri
    const value = {
        recentLogs,
        allLogs,
        groupedLogs,
        loading,
        error,
        silentMode,
        toggleSilentMode,
        setPollingInterval,
        refreshLogs: fetchLogs,
        markLogAsViewed,
        markAllLogsAsViewed
    };

    return (
        <AuthLogContext.Provider value={value}>
            {children}
        </AuthLogContext.Provider>
    );
};

export default AuthLogContext; 